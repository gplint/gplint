import { Documentation, ErrorData, FileData, GherkinData, RuleError } from '../types.js';

export const name = 'no-trailing-spaces';

type NoTrailingSpacesErrorData = ErrorData

export function run({file}: GherkinData): NoTrailingSpacesErrorData[] {
	const errors = [] as NoTrailingSpacesErrorData[];
	let lineNo = 1;
	file.lines.forEach(line => {
		if (/[\t ]+$/.test(line)) {
			errors.push({
				location: {line: lineNo, column: line.length},
			});
		}

		lineNo++;
	});

	return errors;
}

export function buildRuleErrors(error: NoTrailingSpacesErrorData): RuleError {
	return {
		message: 'Trailing spaces are not allowed',
		rule   : name,
		line   : error.location.line,
		column : error.location.column,
	};
}

export function fix(error: NoTrailingSpacesErrorData, file: FileData): void {
	const lineIndex = error.location.line - 1;
	const line = file.lines[lineIndex];
	const match = /[\t ]+$/.exec(line);

	// Determine the range of trailing spaces and the expected length
	const trailing = match[0];

	file.textEdits.push({
		startLine: lineIndex,
		startCol: line.length - trailing.length,
		endLine: lineIndex,
		endCol: line.length,
		text: '',
		expectedOriginal: trailing,
		removeIfEmptyLine: false,
	});
}

export const documentation: Documentation = {
	description: 'Disallows trailing spaces.',
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
