import _ from 'lodash';
import {Tag} from '@cucumber/messages';
import * as gherkinUtils from './utils/gherkin.js';
import {GherkinData, RuleSubConfig, RuleError, GherkinTaggable, Documentation} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-restricted-tags';
export const availableConfigs = {
	tags: [] as string[],
	patterns: [] as string[],
};

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	const forbiddenTags = configuration.tags;
	const mergedConfiguration = _.merge(availableConfigs, configuration);
	const forbiddenPatterns = getForbiddenPatterns(mergedConfiguration);
	const {language} = feature;
	const errors = [] as RuleError[];

	checkTags(feature, language, forbiddenTags, forbiddenPatterns, errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		checkTags(rule, language, forbiddenTags, forbiddenPatterns, errors);
	});

	children.forEach(child => {
		// backgrounds don't have tags
		if (child.scenario) {
			checkTags(child.scenario, language, forbiddenTags, forbiddenPatterns, errors);

			child.scenario.examples.forEach(example => {
				checkTags(example, language, forbiddenTags, forbiddenPatterns, errors);
			});
		}
	});

	return errors;
}

function getForbiddenPatterns(configuration: RuleSubConfig<typeof availableConfigs>) {
	return configuration.patterns.map((pattern) => new RegExp(pattern));
}

function checkTags(node: GherkinTaggable, language: string, forbiddenTags: string[], forbiddenPatterns: RegExp[], errors: RuleError[]) {
	const nodeType = gherkinUtils.getNodeType(node, language);
	node.tags.forEach(tag => {
		if (isForbidden(tag, forbiddenTags, forbiddenPatterns)) {
			errors.push({
				message: `Forbidden tag ${tag.name} on ${nodeType}`,
				rule   : name,
				line   : tag.location.line,
				column : tag.location.column,
			});
		}
	});
}

function isForbidden(tag: Tag, forbiddenTags: string[], forbiddenPatterns: RegExp[]) {
	return _.includes(forbiddenTags, tag.name)
		|| forbiddenPatterns.some((pattern) => pattern.test(tag.name));
}

export const documentation: Documentation = {
	description: 'Disallow use of particular tags. It\'s possible to set exact text match or patterns using a regular expression. See the examples to know how it works.',
	fixable: false,
	configuration: [{
		name: 'tags',
		type: 'string[]',
		description: 'Forbid tags by literal match.',
		link: 'forbid-tags-by-exact-text'
	}, {
		name: 'patterns',
		type: 'RegExp[]',
		description: 'Forbid tags by regular expression match.',
		link: 'combine-exact-text-and-patterns',
	}],
	examples: [{
		title: 'Forbid tags by exact text.',
		description: 'Forbid the tags `@watch`, `@wip`.',
		config: {
			[name]: ['error', {'tags': ['@watch', '@wip']}],
		}
	}, {
		title: 'Forbid tags by a pattern (RegEx).',
		description: 'Forbid tags starting with `@todo`, using a regular expression.',
		config: {
			[name]: ['error', {'patterns': ['^@todo.*']}],
		}
	}, {
		title: 'Combine exact text and patterns.',
		description: 'Forbid the tags `@watch`, `@wip` and tags starting with `@todo`.',
		config: {
			[name]: ['error', {'tags': ['@watch', '@wip'], 'patterns': ['^@todo.*']}],
		}
	}],
};
