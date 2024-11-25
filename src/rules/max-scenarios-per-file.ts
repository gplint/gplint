import _ from 'lodash';
import {GherkinData, RuleSubConfig, RuleError, Documentation} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'max-scenarios-per-file';

export const availableConfigs = {
	'maxScenarios': 10,
	'countOutlineExamples': true
};

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];
	const mergedConfiguration = _.merge({}, availableConfigs, configuration);
	const {maxScenarios} = mergedConfiguration;

	const {children} = featureSpread(feature);

	let count = children.length;

	children.forEach(child => {
		if (child.background) {
			count = count - 1;
		} else if (child.scenario.examples.length && mergedConfiguration.countOutlineExamples) {
			count = child.scenario.examples
				.reduce((accumulator, example) => accumulator + example.tableBody.length, count - 1);
		}
	});

	if (count > maxScenarios) {
		errors.push({
			message: `Number of scenarios exceeds maximum: ${count}/${maxScenarios}`,
			rule: name,
			line: 0,
			column: 0
		});
	}

	return errors;
}

export const documentation: Documentation = {
	description: 'Allows the user to specify the max number of scenarios per feature file.',
	fixable: false,
	configuration: [{
		name: 'maxScenarios',
		type: 'number',
		description: 'The maximum scenarios per file after which the rule fails',
		default: availableConfigs.maxScenarios.toString(),
	}, {
		name: 'countOutlineExamples',
		type: 'boolean',
		description: 'whether to count every example row for a Scenario Outline, as opposed to just 1 for the whole block',
		default: availableConfigs.countOutlineExamples.toString(),
	}],
	examples: [{
		title: 'Example',
		description: `- \`maxScenarios\` (number) the maximum scenarios per file after which the rule fails - defaults to \`10\`
- \`countOutlineExamples\` (boolean) whether to count every example row for a Scenario Outline, as opposed to just 1 for the whole block - defaults to \`true\``,
		config: {
			[name]: ['error', {'maxScenarios': 10, 'countOutlineExamples': true}]
		}
	}],
};
