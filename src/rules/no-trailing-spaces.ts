import { Documentation, ErrorData, FileData, GherkinData, RuleError, RuleSubConfig } from '../types.js';

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

export function fix(file: FileData, config: RuleSubConfig<unknown>, error: NoTrailingSpacesErrorData): void {
	file.lines[error.location.line - 1] = file.lines[error.location.line - 1].trimEnd();
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
