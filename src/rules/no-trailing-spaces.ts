import {Documentation, GherkinData, RuleError} from '../types.js';
import { getLineContent, modifyLine } from './utils/line.js';

export const name = 'no-trailing-spaces';

export function fixLine(existingLine: string): string {
	return existingLine.replaceAll(/\s+$/g, '');
}

export function run({file}: GherkinData, _: unknown, autoFix: boolean): RuleError[] {
	const errors = [] as RuleError[];
	let lineNo = 1;
	file.lines.forEach(line => {
		if (/[\t ]+$/.test(line)) {
			if (autoFix) {
				modifyLine(file, lineNo, fixLine(getLineContent(file, lineNo)));
			} else {
				errors.push({message: 'Trailing spaces are not allowed',
					rule   : name,
					line   : lineNo,
					column : 0,
				});
			}
		}

		lineNo++;
	});

	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows trailing spaces.',
	fixable: true,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
