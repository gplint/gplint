import {Documentation, GherkinData, RuleError} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-files-without-scenarios';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];

	const {children} = featureSpread(feature);

	if (!children.some(child => child.scenario != null)) {
		errors.push({
			message: 'Feature file does not have any Scenarios',
			rule   : name,
			line   : 1,
			column: 0
		});
	}
	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows files with no scenarios.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
