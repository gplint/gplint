import _ from 'lodash';
import {Feature, Pickle, Rule as CucumberRule} from '@cucumber/messages';
import * as gherkinUtils from './utils/gherkin.js';
import {
	Documentation,
	GherkinData,
	GherkinKeyworded,
	GherkinNode,
	GherkinTaggable,
	RuleError,
	RuleSubConfig,
} from '../types.js';

export const name = 'required-tags';
export const availableConfigs = {
	ignoreUntagged: true,
	global: [] as string[],
	feature: [] as string[],
	rule: [] as string[],
	scenario: [] as string[],
	example: [] as string[],
	extendRule: false,
	extendExample: false,
};

function checkTagNotPresent(requiredTag: string | string[], {tags}: GherkinTaggable | Pickle) {
	return _.castArray(requiredTag).every(rt =>
		!tags.some(tag => {
			const regexpMatch = /^@?\/(?<exp>.*)\/$/.exec(rt);

			return regexpMatch ? RegExp(regexpMatch.groups.exp).test(tag.name) : rt === tag.name;
		}));
}

export function run({
	feature,
	pickles,
}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	const mergedConfig = _.merge({}, availableConfigs, configuration);

	const errors = [] as RuleError[];

	if (mergedConfig.global.length > 0) {
		pickles
			.filter(pickle => !(mergedConfig.ignoreUntagged && pickle.tags.length === 0))
			.forEach(pickle => {
				mergedConfig.global
					.filter(requiredTag => checkTagNotPresent(requiredTag, pickle))
					.forEach(missTag => errors.push(createError(gherkinUtils.getNodeForPickle(feature, pickle, true), missTag, pickle.language)));
			});
	}

	function checkRequiredTags(item: GherkinTaggable, requiredTags: string[], extraRequiredTags: string[] = []) {
		if (mergedConfig.ignoreUntagged && item.tags.length === 0) {
			return;
		}

		const allRequiredTags = requiredTags.concat(extraRequiredTags);

		allRequiredTags
			.filter(requiredTag => checkTagNotPresent(requiredTag, item))
			.forEach(missTag => errors.push(createError(item, missTag, feature.language)));
	}

	checkRequiredTags(feature, mergedConfig.feature);

	function iterScenarioContainer(item: Feature | CucumberRule, insideRule = false) {
		for (const {
			rule,
			scenario
		} of (item as Feature).children) {
			if (!insideRule && rule != null) {
				checkRequiredTags(rule, mergedConfig.rule);

				iterScenarioContainer(rule, true);
			} else if (scenario != null) {
				const scenarioExtendedTags = [];

				if (mergedConfig.extendRule && !insideRule) {
					scenarioExtendedTags.push(...mergedConfig.rule);
				}

				if (mergedConfig.extendExample && scenario.examples.length === 0) {
					scenarioExtendedTags.push(...mergedConfig.example);
				}

				checkRequiredTags(scenario, mergedConfig.scenario, scenarioExtendedTags);

				if (scenario.examples.length !== 0) {
					for (const example of scenario.examples) {
						checkRequiredTags(example, mergedConfig.example);
					}
				}
			}
		}
	}

	iterScenarioContainer(feature);

	return errors;
}

function createError(item: GherkinNode, requiredTags: string | string[], lang: string) {
	const type = gherkinUtils.getNodeType(item as GherkinKeyworded, lang);

	return {
		message: `The tag(s) [${requiredTags}] should be present for ${type}.`,
		rule: name,
		line: item.location.line,
		column: item.location.column,
	};
}

export const documentation: Documentation = {
	description: `Require tags/patterns of tags. The properties for levels (global, feature, rule, scenario and example),
are arrays, that allows strings, regular expressions and subarrays.
If a subarray is used, only one of the tags inside the subarray is needed to accomplish the rule.`,
	fixable: false,
	configuration: [{
		name: 'ignoreUntagged',
		type: 'boolean',
		description: 'Whether to ignore scenarios that have no tag.',
		default: availableConfigs.ignoreUntagged.toString(),
	}, {
		name: 'global',
		type: '(string | regexp | (string | regexp)[])[]',
		description: 'The array of tag patterns that must match.',
		default: availableConfigs.global.toString(),
	}, {
		name: 'feature',
		type: '(string | regexp | (string | regexp)[])[]',
		description: 'The array of tag patterns that must match.',
		default: availableConfigs.feature.toString(),
	}, {
		name: 'rule',
		type: '(string | regexp | (string | regexp)[])[]',
		description: 'The array of tag patterns that must match',
		default: availableConfigs.rule.toString(),
	}, {
		name: 'scenario',
		type: '(string | regexp | (string | regexp)[])[]',
		description: 'The array of tag patterns that must match.',
		default: availableConfigs.scenario.toString(),
	}, {
		name: 'example',
		type: '(string | regexp | (string | regexp)[])[]',
		description: 'The array of tag patterns that must match.',
		default: availableConfigs.example.toString(),
	}, {
		name: 'extendRule',
		type: 'boolean',
		description: 'When Scenario is not contained inside Rule, extends required `rule` tags to `scenario`.',
		default: availableConfigs.extendRule.toString(),
	}, {
		name: 'extendExample',
		type: 'boolean',
		description: 'When Scenario is not a Scenario Outline, extends required `example` tags to `scenario`.',
		default: availableConfigs.extendExample.toString(),
	}],
	examples: [{
		title: 'Define required tags for feature level with a Regular Expression',
		description: 'Enforce all features to have the tag `@Feat(<ID>)`, where `<ID>` is a 5 digits number. E.g. `@Feat(00123)`, `@Feat(32109)`',
		config: {
			[name]: ['error', {
				feature: '/@Feat\\([0-9]{5}\\)/'
			}],
		},
	}, {
		title: 'Define a list of required tags with one present',
		description: 'Enforce all scenarios to have the tag `@ready`, or `@manual` or `@wip`. A combination of them are allowed too.',
		config: {
			[name]: ['error', {
				'scenario': [['@ready', '@manual', '@wip']],
			}],
		},
	}, {
		title: 'Mix required tag, and sublist of required tags',
		description: 'Enforce all scenarios to have the tag `@ready`, or `@manual` or `@wip`. A combination of them are allowed too.',
		config: {
			[name]: ['error', {
				'scenario': ['/@ID\\.[0-9]{1,5}/', [['@ready', '@manual', '@wip']]],
			}],
		},
	}],
};
