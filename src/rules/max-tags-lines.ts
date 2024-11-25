import _ from 'lodash';

import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';
import {Examples, Feature, Rule as CucumberRule, Scenario} from '@cucumber/messages';

export const name = 'max-tags-lines';
export const availableConfigs = {
	feature: 1,
	rule: 2,
	scenario: 5,
	example: 5,
};

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (feature == null) {
		return [];
	}

	function checkTagsLines({
		keyword,
		tags,
		location,
	}: Feature | CucumberRule | Scenario | Examples, maxLines: number) {
		const tagsLines = tags.map(t => t.location.line);

		const tagsLinesCount = tagsLines.length > 0 ? Math.max(...tagsLines) - Math.min(...tagsLines) + 1 : 0;

		if (tagsLinesCount > maxLines) {
			errors.push({
				message: `Number of line tags for "${keyword}" exceeds the maximum: ${tagsLinesCount}/${maxLines}`,
				rule: name,
				line: location.line,
				column: location.column,
			});
		}
	}

	const mergedConfig = _.merge({}, availableConfigs, configuration);

	const errors = [] as RuleError[];

	function iterScenarioContainer(container: Feature | CucumberRule, containerMaxLines: number) {
		if (containerMaxLines > -1) {
			checkTagsLines(container, containerMaxLines);
		}

		for (const {
			rule,
			scenario
		} of (container as Feature).children) {
			if (scenario != null) {
				if (mergedConfig.scenario > -1) {
					checkTagsLines(scenario, mergedConfig.scenario);
				}

				if (mergedConfig.example > -1) {
					for (const example of scenario.examples) {
						checkTagsLines(example, mergedConfig.example);
					}
				}
			} else if (rule != null) {
				iterScenarioContainer(rule, mergedConfig.rule);
			}
		}
	}

	iterScenarioContainer(feature, mergedConfig.feature);

	return errors;
}

export const documentation: Documentation = {
	description: 'Allows the user to specify the max number of lines for tags in each level. Each level type can be configured separately.',
	fixable: false,
	configuration: [{
		name: 'feature',
		type: 'number',
		description: 'Defines de maximum line length for tags at Feature level.',
		default: availableConfigs.feature,
	}, {
		name: 'rule',
		type: 'number',
		description: 'Defines de maximum line length for tags at Rule level.',
		default: availableConfigs.rule,
	}, {
		name: 'scenario',
		type: 'number',
		description: 'Defines de maximum line length for tags at Scenario level.',
		default: availableConfigs.scenario,
	}, {
		name: 'example',
		type: 'number',
		description: 'Defines de maximum line length for tags at Example level.',
		default: availableConfigs.example,
	}],
	examples: [{
		title: 'Example',
		description: 'Features can have only 1 line, scenarios and examples can have 5 lines of tags as maximum.',
		config: {
			[name]: [
				'error',
				{
					'feature': 1,
					'scenario': 5,
					'example': 5,
				},
			],
		},
	}],
};
