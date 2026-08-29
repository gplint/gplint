import _isEmpty from 'lodash.isempty';
import {Documentation, GherkinData, RuleError} from '../types.js';

export const name = 'no-empty-file';

export function run({feature}: GherkinData): RuleError[] {
	const errors = [] as RuleError[];
	if (_isEmpty(feature)) {
		errors.push({
			message: 'Empty feature files are disallowed',
			rule   : name,
			line   : 1,
			column: 0
		});
	}
	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows empty feature files.',
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
