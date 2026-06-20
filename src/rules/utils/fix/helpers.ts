import {ErrorData, FileData} from '../../../types.js';

export function replaceNodeText(error: ErrorData, file: FileData, fixedText: string) {
	const fileLine = error.location.line - 1;

	const lineText = file.lines?.[fileLine] ?? '';

	file.textEdits.push({
		startLine: fileLine,
		startCol: 0,
		endLine: fileLine,
		endCol: lineText.length,
		text: fixedText,
		expectedOriginal: lineText,
	});
}

export function replaceNodeTextByRange(error: ErrorData, file: FileData, newText: string, startOffset: number, endOffset: number) {
	const fileLine = error.location.line - 1;

	file.textEdits.push({
		startLine: fileLine,
		startCol: startOffset,
		endLine: fileLine,
		endCol: endOffset,
		text: newText,
		removeIfEmptyLine: true
	});
}
