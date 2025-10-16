import {Documentation, GherkinData, RuleError} from '../types.js';
import {Background, Feature, FeatureChild, Rule, RuleChild} from '@cucumber/messages';

export const name = 'no-background-only-scenario';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];

	function checkScenariosContainer(container: Feature | Rule) {
		const hasBackground = container.children.some(child => child.background);
		const scenarioCount = (container.children as (FeatureChild | RuleChild)[]).reduce(countScenarios, 0);

		if (hasBackground && scenarioCount < 2) {
			const background = container.children.find(child => child.background)?.background;
			if (background) {
				errors.push(createError(background));
			}
		}

		container.children
			.filter(child => child.rule)
			.forEach(child => checkScenariosContainer((child as FeatureChild).rule));
	}

	checkScenariosContainer(feature);

	return errors;
}

function countScenarios(count: number, child: FeatureChild | RuleChild): number {
	let inc = 0;

	if (child.scenario != null) {
		inc = 1;
	} else if ((child as FeatureChild).rule != null) {
		inc = (child as FeatureChild).rule.children.reduce(countScenarios, 0);
	}

	return count + inc;
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
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
