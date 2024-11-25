import _ from 'lodash';
import {Documentation, GherkinData, GherkinTaggable, RuleError, RuleSubConfig} from '../types.js';
import {Tag} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

export const name = 'related-tags';

export const availableConfigs = {
	tags: {}
};

type IRelatedTags<T> = Record<string, T>
type RelatedTagsRaw = IRelatedTags<string[]>
type RelatedTagsExpression = (string|RegExp)[];
type RelatedTags = IRelatedTags<RelatedTagsExpression>

const REGEXP_EXPRESSION = /^\/(?<pattern>.+)\/(?<flags>.*)/;

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];

	const tags = parseTags(configuration.tags);

	checkTags(feature, tags, errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		checkTags(rule, tags, errors);
	});

	for (const child of children) {
		if (child.scenario) {
			checkTags(child.scenario, tags, errors);

			for (const example of child.scenario.examples) {
				checkTags(example, tags, errors);
			}
		}
	}

	return errors;
}

function parseTags(tags = {} as RelatedTagsRaw): RelatedTags {
	const parsedTags = {} as RelatedTags;

	for (const [tag, relatedTags] of Object.entries(tags)) {
		parsedTags[tag] = relatedTags.map(rt => {
			const match = REGEXP_EXPRESSION.exec(rt);
			return match == null ? rt : new RegExp(match.groups.pattern, match.groups.flags);
		});
	}

	return parsedTags;
}

function checkTags(node: GherkinTaggable, tags: RelatedTags, errors: RuleError[]) {
	const plainNodeTags = node.tags.map(t => t.name);

	node.tags
		.filter(tag => Object.prototype.hasOwnProperty.call(tags, tag.name)
			? !tags[tag.name].some(relatedTag => checkRelatedTag(relatedTag, plainNodeTags))
			: false)
		.forEach(tag => {
			errors.push(createError(tag, tags[tag.name]));
		});
}

function checkRelatedTag(relatedTag: string | RegExp, nodeTags: string[]) {
	return _.isRegExp(relatedTag)
		? nodeTags.some(t => relatedTag.test(t))
		: nodeTags.includes(relatedTag);
}

function createError(tag: Tag, relatedTags: RelatedTagsExpression) {
	return {
		message: `Missing related tag. ${tag.name} requires ${relatedTags}`,
		rule   : name,
		line   : tag.location.line,
		column : tag.location.column,
	};
}

export const documentation: Documentation = {
	description: 'Define a list of tags with a list of related tags that should be present too. The related tags can be a string or a regular expression (represented as a string between slashes `/`.',
	fixable: false,
	configuration: [{
		name: 'tags',
		type: 'Record<string, (string|RegExp)[]>',
		description: 'An object with a tag as a key, and an array of string/regular expression as a value.',
		default: availableConfigs.tags,
	}],
	examples: [{
		title: 'Define a tag that requires another tag.',
		description: `When the tag \`@disabled\` is present, is also required to define the tag \`@TICKET.PROJ-\`, followed by a number
(This example is useful to keep tracking issues using a ticketing system).`,
		config: {
			[name]: ['error', {
				tags: {
					'@disabled': ['/^@TICKET\\.PROJ-[0-9]+$/'],
				}
			}],
		}
	}, {
		title: 'Define a tag that requires another tag from a list.',
		description: `When the tag \`@foo\` is present, is also required to define at least one of the following tags:
\`@bar\`, \`@baz\` o \`@qux\`.
A regular expression is used to define \`@bar\` and \`@baz\`, and a plain text to define \`@qux\`.
		`,
		config: {
			[name]: ['error', {
				tags: {
					'@foo': [['/^@ba[rz]$/', '@qux']],
				}
			}],
		}
	}],
};

