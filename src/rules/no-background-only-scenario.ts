import {Documentation, GherkinData, RuleError} from '../types.js';
import { Background, Feature, Rule } from '@cucumber/messages';

export const name = 'no-background-only-scenario';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];

	function checkScenariosContainer(container : Feature | Rule) {
		container.children.forEach(child => {
			if (child.background) {
				if (container.children.filter(c => c.scenario).length < 2) {
					errors.push(createError(child.background));
				}
			} else if (child.rule) {
				checkScenariosContainer(child.rule);
			}
		});
	}

	checkScenariosContainer(feature);

	return errors;
}

function createError(background: Background) {
	return {
		message: 'Backgrounds are not allowed when there is just one scenario.',
		rule   : name,
		line   : background.location.line,
		column : background.location.column,
	};
}

export const documentation: Documentation = {
	description: 'Disallows background when there is just one scenario.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
