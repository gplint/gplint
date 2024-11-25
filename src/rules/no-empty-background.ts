import {Documentation, GherkinData, RuleError} from '../types.js';
import {Background} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-empty-background';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];

	const {children} = featureSpread(feature);

	children.forEach(child => {
		if (child.background) {
			if (child.background.steps.length === 0) {
				errors.push(createError(child.background));
			}
		}
	});
	return errors;
}

function createError(background: Background) {
	return {
		message: 'Empty backgrounds are not allowed.',
		rule   : name,
		line   : background.location.line,
		column : background.location.column,

	};
}

export const documentation: Documentation = {
	description: 'Disallows features with backgrounds without steps.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
