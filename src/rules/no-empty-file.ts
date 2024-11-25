import _ from 'lodash';
import {Documentation, GherkinData, RuleError} from '../types.js';

export const name = 'no-empty-file';

export function run({feature}: GherkinData): RuleError[] {
	const errors = [] as RuleError[];
	if (_.isEmpty(feature)) {
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
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
