import _ from 'lodash';

import {Documentation, GherkinData, GherkinTaggable, RuleError} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-duplicate-tags';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];

	verifyTags(feature, errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		verifyTags(rule, errors);
	});

	children.forEach(child => {
		if (child.scenario) {
			verifyTags(child.scenario, errors);
			child.scenario.examples.forEach(example => {
				verifyTags(example, errors);
			});
		}
	});
	return errors;
}

function verifyTags(node: GherkinTaggable, errors: RuleError[]) {
	const failedTagNames = [] as string[];
	const uniqueTagNames = [] as string[];
	node.tags.forEach(tag => {
		if (!_.includes(failedTagNames, tag.name)) {
			if (_.includes(uniqueTagNames, tag.name)) {
				errors.push({
					message: `Duplicate tags are not allowed: ${tag.name}`,
					rule   : name,
					line   : tag.location.line,
					column : tag.location.column,
				});
				failedTagNames.push(tag.name);
			} else  {
				uniqueTagNames.push(tag.name);
			}
		}
	});
}

export const documentation: Documentation = {
	description: 'Disallows duplicate tags on the same Feature or Scenario.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
