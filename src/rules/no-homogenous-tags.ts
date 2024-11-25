import _ from 'lodash';
import {Documentation, GherkinData, RuleError} from '../types.js';
import { Examples, Feature, Rule, Scenario } from '@cucumber/messages';

export const name = 'no-homogenous-tags';

export function run({feature}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];

	checkHomogenousContainer(feature, errors, ['Feature', 'Scenarios and Rules']);

	return errors;
}

function getTagNames(node: Feature | Rule | Scenario | Examples): readonly string[] {
	return _.map(node.tags, tag => tag.name);
}

/**
 * Tags that exist in every scenario and scenario outline
 * should be applied on a feature/rule level
 * @param container
 * @param errors
 * @param errorMessage
 */
function checkHomogenousContainer(container: Feature | Rule, errors: RuleError[], [containerName, childrenName]: [string, string]) {
	const childrenTags: (readonly string[])[] = [];

	if (container.children.length < 2) {
		// Feature/Rule with only one child, skipping
		return;
	}

	container.children.forEach(child => {
		if (child.scenario) {
			const {scenario} = child;

			childrenTags.push(getTagNames(scenario));

			const exampleTags: (readonly string[])[] = [];
			scenario.examples.forEach(example => {
				exampleTags.push(getTagNames(example));
			});

			const homogenousExampleTags = _.intersection(...exampleTags);
			if (homogenousExampleTags.length) {
				errors.push({
					message: `All Examples of a Scenario Outline have the same tag(s), they should be defined on the Scenario Outline instead: ${homogenousExampleTags.join(', ')}`,
					rule: name,
					line: scenario.location.line,
					column: scenario.location.column,
				});
			}
		} else if (child.rule) {
			const {rule} = child;
			childrenTags.push(getTagNames(rule));
			checkHomogenousContainer(rule, errors, ['Rule', 'Scenarios']);
		}
	});

	const homogenousTags = _.intersection(...childrenTags);
	if (homogenousTags.length) {
		errors.push({
			message: `All ${childrenName} on this ${containerName} have the same tag(s), they should be defined on the ${containerName} instead: ${homogenousTags.join(', ')}`,
			rule   : name,
			line   : container.location.line,
			column : container.location.column,
		});
	}
}

export const documentation: Documentation = {
	description: 'Disallows tags present on every Scenario/Rule in a Feature or Rule, rather than on the Feature/Rule itself. Skips if contains a single scenario.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
