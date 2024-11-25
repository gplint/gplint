import _ from 'lodash';
import {Documentation, GherkinData, GherkinTaggable, RuleError} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'one-space-between-tags';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];

	testTags(feature, errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		testTags(rule, errors);
	});

	children.forEach(child => {
		if (child.scenario) {
			testTags(child.scenario, errors);

			child.scenario.examples.forEach(example => {
				testTags(example, errors);
			});
		}
	});

	return errors;
}

function testTags(node: GherkinTaggable, errors: RuleError[]) {
	_(node.tags)
		.groupBy('location.line')
		.sortBy('location.column')
		.forEach(tags => {
			_.range(tags.length - 1)
				.map(i => {
					if ((tags[i].location.column ?? 0) + tags[i].name.length < (tags[i + 1].location.column ?? 0) - 1) {
						errors.push({
							line: tags[i].location.line,
							column: tags[i].location.column,
							rule: name,
							message: `There is more than one space between the tags ${tags[i].name} and ${tags[i + 1].name}`,
						});
					}
				});
		});
}

export const documentation: Documentation = {
	description: 'Tags on the same line must be separated by a single space.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
