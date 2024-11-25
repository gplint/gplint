import {Documentation, GherkinData, RuleError} from '../types.js';

export const name = 'no-multiple-empty-lines';

export function run({file}: GherkinData): RuleError[] {
	const errors = [] as RuleError[];
	for (let i = 0; i < file.lines.length - 1; i++) {
		if (file.lines[i].trim() === '' && file.lines[i + 1].trim() === '') {
			errors.push({message: 'Multiple empty lines are not allowed',
				rule   : name,
				line   : i + 2,
				column : 0,
			});
		}
	}
	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows multiple empty lines.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
