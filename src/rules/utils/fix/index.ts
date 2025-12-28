import fs from 'node:fs';

import {ErrorData, FileData, GherkinData, Rule, RuleSubConfig} from '../../../types.js';
import {readAndParseFile} from '../../../linter.js';
import * as logger from '../../../logger.js';

export interface Edit {
	// 0-based coordinates
	startLine: number;
	startCol: number;
	endLine: number;
	endCol: number;
	text: string;
	expectedOriginal?: string; // optional: if provided, the edit will be rejected if the original fragment doesn't match
	removeIfEmptyLine?: boolean; // whether to remove the line if it becomes empty after applying edits
}

export interface ApplyResult {
	lines: string[];
	applied: Edit[]; // applied edits
	ignored: { edit: Edit; reason: string }[]; // ignored edits and why
}

/**
 * Fix rule errors by applying their fixes to the gherkin data's file.
 */
export async function fixRuleErrors(gherkinData: GherkinData, rule: Rule, ruleConfig: RuleSubConfig<unknown>, error: ErrorData[]) {
	error.forEach(e => {
		rule.fix?.(e, gherkinData.file, ruleConfig);
	});
	if (gherkinData.file.textEdits?.length > 0) {
		const { lines: newLines, applied, ignored } = applySafeEdits(gherkinData.file);
		if (applied.length > 0) {
			gherkinData.file.lines = newLines;
			fs.writeFileSync(gherkinData.file.relativePath, newLines.join(gherkinData.file.EOL));
		}

		if (ignored.length > 0) {
			logger.warn(`Warning: Some edits were ignored when fixing ${gherkinData.file.relativePath}:`);
			ignored.forEach(ig => {
				logger.warn(`- Edit from (${ig.edit.startLine + 1},${ig.edit.startCol + 1}) to (${ig.edit.endLine + 1},${ig.edit.endCol + 1}) was ignored: ${ig.reason}`);
			});
		}
	}

	const regeneratedGherkinData = await readAndParseFile(gherkinData.file.relativePath);

	gherkinData.feature = regeneratedGherkinData.feature;
	gherkinData.pickles = regeneratedGherkinData.pickles;
	gherkinData.file = regeneratedGherkinData.file;
}

/**
 * Apply text edits safely over an array of lines:
 * - converts line/column coordinates to absolute offsets based on the provided lines
 * - validates expectedOriginal when present
 * - detects overlaps between edits (based on original offsets)
 * - applies edits ordered by startOffset descending (right-to-left)
 * - optionally removes only those empty lines that rules have marked as deletable
 */
export function applySafeEdits(file: FileData): ApplyResult {
	const origLines = file.lines;
	const edits = file.textEdits ?? [];

	const newline = '\n';
	const original = origLines.join(newline);

	// precompute start offset of each line as numbers
	const lineStarts: number[] = new Array<number>(origLines.length);
	let offs = 0;
	for (let i = 0; i < origLines.length; i++) {
		lineStarts[i] = offs;
		offs += origLines[i].length + 1; // +1 for '\n' when joining
	}

	function coordToOffset(line: number, col: number): number {
		if (line < 0 || line >= lineStarts.length) return -1;
		return lineStarts[line] + col;
	}

	// normalize edits to offsets and filter invalid ones
	const normalized: (Edit & { startOffset: number; endOffset: number })[] = [];
	const ignored: { edit: Edit; reason: string }[] = [];

	for (const e of edits) {
		const s = coordToOffset(e.startLine, e.startCol);
		const t = coordToOffset(e.endLine, e.endCol);
		if (s < 0 || t < 0 || s > t || t > original.length) {
			ignored.push({ edit: e, reason: 'invalid coordinates' });
			continue;
		}
		normalized.push({ ...e, startOffset: s, endOffset: t });
	}

	// sort by startOffset descending for safe right-to-left application
	normalized.sort((a, b) => b.startOffset - a.startOffset);

	const applied: (Edit & { startOffset?: number; endOffset?: number })[] = [];
	const appliedIntervals: [number, number][] = [];
	let result = original;

	for (const n of normalized) {
		// check overlap with already applied intervals (using original offsets)
		const overlaps = appliedIntervals.some(([s, t]) => !(n.endOffset <= s || n.startOffset >= t));
		if (overlaps) {
			ignored.push({ edit: n, reason: 'overlaps with already applied edit' });
			continue;
		}

		// validate expectedOriginal if provided
		if (n.expectedOriginal != null) {
			const actual = original.slice(n.startOffset, n.endOffset);
			if (actual !== n.expectedOriginal) {
				ignored.push({ edit: n, reason: `expectedOriginal mismatch.\n\tExpected: "${n.expectedOriginal}"\n\tCurrent: "${actual}"` });
				continue;
			}
		}

		// apply on current result; right-to-left guarantees original offsets are valid
		result = result.substring(0, n.startOffset) + n.text + result.substring(n.endOffset);

		applied.push(n);
		appliedIntervals.push([n.startOffset, n.endOffset]);
	}

	const outLines = result.split(newline);

	// Post-process: remove empty lines that were created as a direct consequence
	// of applied edits, but only those that rules have marked as deletable.
	const linesCopy = outLines.slice();
	const toRemove = new Set<number>();

	for (const a of applied) {
		// skip edits that don't request line removal
		if (!a.removeIfEmptyLine) continue;

		// mark any empty lines in the original line range [startLine, endLine]
		const sLine = a.startLine;
		const eLine = a.endLine;
		for (let ln = sLine; ln <= eLine && ln < linesCopy.length; ln++) {
			// if the resulting line is empty or only whitespace, mark for removal
			if ((linesCopy[ln] ?? '').trim() === '') {
				toRemove.add(ln);
			}
		}
	}

	// Build final lines excluding marked indexes.
	const finalLines: string[] = [];
	for (let i = 0; i < linesCopy.length; i++) {
		if (!toRemove.has(i)) {
			finalLines.push(linesCopy[i]);
		}
	}

	return { lines: finalLines, applied, ignored };
}
