import _ from 'lodash';
import * as gherkinUtils from './utils/gherkin.js';
import { Documentation, GherkinData, ErrorData, RuleError, RuleSubConfig, FileData } from '../types.js';
import {FeatureChild, Location, RuleChild, Step, Tag} from '@cucumber/messages';

export const name = 'indentation';
const defaultConfig = {
	// Levels
	Feature: 0,
	Background: 2,
	Rule: 2,
	Scenario: 2,
	Step: 4,
	Examples: 4,
	example: 6,
	given: 4,
	when: 4,
	then: 4,
	and: 4,
	but: 4,
	// Config
	RuleFallback: true, // If `true`, the indentation for nodes inside Rule is the sum of "Rule" and the node itself, else it uses the node directly
	type: 'both', // 'both' | 'space' | 'tab'
	preferType: 'space', // 'space' | 'tab'
};

export const availableConfigs = _.merge({}, defaultConfig, {
	// The values here are unused by the config parsing logic.
	'feature tag': -1,
	'rule tag': -1,
	'scenario tag': -1,
	'examples tag': -1,
});

type Configuration = RuleSubConfig<typeof availableConfigs>;
type ConfigurationKey = keyof Configuration;

interface IndentationErrorData extends ErrorData {
	type: string,
	expectedIndentation: number,
}

function mergeConfiguration(configuration: Configuration): Configuration {
	const mergedConfiguration = _.merge({}, defaultConfig, configuration);

	Object.entries({
		'feature tag': mergedConfiguration.Feature,
		'rule tag': mergedConfiguration.Rule,
		'scenario tag': mergedConfiguration.Scenario,
		'examples tag': mergedConfiguration.Examples,
	}).forEach(([key, value]: [keyof typeof defaultConfig, number]) => {
		if (!Object.prototype.hasOwnProperty.call(mergedConfiguration, key)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			mergedConfiguration[key] = value;
		}
	});

	return mergedConfiguration;
}

export function run({ feature, file }: GherkinData, configuration: Configuration): IndentationErrorData[] {
	if (!feature) {
		return [];
	}

	const errors = [] as IndentationErrorData[];
	const mergedConfiguration = mergeConfiguration(configuration);

	function validate(location: Location, type: ConfigurationKey, modifier = 0) {
		const expectedIndentation = mergedConfiguration[type] as number + modifier;

		const lineContent = file.lines[location.line - 1];
		const indentChar = mergedConfiguration.type === 'both' && [' ', '\t'].includes(lineContent[0])
			? lineContent[0]
			: mergedConfiguration.type === 'tab' ? '\t' : ' ';

		if (lineContent.substring(0, lineContent.length - lineContent.trimStart().length) !== indentChar.repeat(expectedIndentation)) {
			errors.push({
				location,
				type,
				expectedIndentation,
			});
		}
	}

	function validateStep(step: Step, modifier = 0) {
		let stepType = gherkinUtils.getLanguageInsensitiveKeyword(step, feature?.language);
		stepType = stepType != null && stepType in configuration ? stepType : 'Step';
		validate(step.location, stepType as ConfigurationKey, modifier);
	}

	function validateTags(tags: readonly Tag[], type: ConfigurationKey, modifier = 0) {
		_(tags).groupBy('location.line').forEach(tagLocationGroup => {
			const firstTag = _(tagLocationGroup).sortBy('location.column').head();
			if (firstTag) {
				validate(firstTag.location, type, modifier);
			}
		});
	}

	function validateChildren(child: FeatureChild | RuleChild, modifier = 0) {
		if (child.background) {
			validate(child.background.location, 'Background', modifier);
			child.background.steps.forEach(step => {
				validateStep(step, modifier);
			});
		} else if (child.scenario) {
			validate(child.scenario.location, 'Scenario', modifier);
			validateTags(child.scenario.tags, 'scenario tag', modifier);
			child.scenario.steps.forEach(step => {
				validateStep(step, modifier);
			});

			child.scenario.examples.forEach(example => {
				validate(example.location, 'Examples', modifier);
				validateTags(example.tags, 'examples tag', modifier);

				if (example.tableHeader) {
					validate(example.tableHeader.location, 'example', modifier);
					example.tableBody.forEach(row => {
						validate(row.location, 'example', modifier);
					});
				}
			});
		}
	}

	validate(feature.location, 'Feature');
	validateTags(feature.tags, 'feature tag');

	feature.children.forEach(child => {
		if (child.rule) {
			validate(child.rule.location, 'Rule');
			validateTags(child.rule.tags, 'rule tag');

			child.rule.children.forEach(ruleChild => {
				validateChildren(ruleChild, mergedConfiguration.RuleFallback ? mergedConfiguration.Rule : 0);
			});
		} else {
			validateChildren(child);
		}
	});

	return errors;
}

export function buildRuleErrors(error: IndentationErrorData): RuleError {
	return {
		message: `Wrong indentation for "${error.type}", expected indentation level of ${error.expectedIndentation}, but got ${error.location.column - 1}`,
		rule: name,
		line: error.location.line,
		column: error.location.column,
	};
}

export function fix(error: IndentationErrorData, file: FileData, configuration: Configuration): void {
	const mergedConfiguration = mergeConfiguration(configuration);

	const lineContent = file.lines[error.location.line - 1];
	const lineTrimmed = lineContent.trimStart();

	const indentChar = mergedConfiguration.type === 'both' && [' ', '\t'].includes(lineContent[0])
		? lineContent[0]
		: (mergedConfiguration.type === 'both' ? mergedConfiguration.preferType : mergedConfiguration.type) === 'tab' ? '\t' : ' ';

	file.lines[error.location.line - 1] = lineTrimmed.padStart(lineTrimmed.length + error.expectedIndentation, indentChar);
}

export const documentation: Documentation = {
	description: `Allows the user to specify indentation rules.
This rule can be configured in a more granular level and uses following rules by default:

* Expected indentation for Feature, Background, Scenario, Examples heading: 0 spaces
* Expected indentation for Steps and each example: 2 spaces`,
	configuration: [{
		name: 'Feature',
		type: 'number',
		description: 'Defines the indentation size for the node `Feature`.',
		default: availableConfigs.Feature,
	}, {
		name: 'Background',
		type: 'number',
		description: 'Defines the indentation size for the node `Background`.',
		default: availableConfigs.Background,
	}, {
		name: 'Rule',
		type: 'number',
		description: 'Defines the indentation size for the node `Rule`.',
		default: availableConfigs.Rule,
	}, {
		name: 'Scenario',
		type: 'number',
		description: 'Defines the indentation size for the node `Scenario`.',
		default: availableConfigs.Scenario,
	}, {
		name: 'Step',
		type: 'number',
		description: 'Defines the indentation size for the node `Step`.',
		default: availableConfigs.Step,
	}, {
		name: 'Examples',
		type: 'number',
		description: 'Defines the indentation size for the node `Examples`.',
		default: availableConfigs.Examples,
	}, {
		name: 'example',
		type: 'number',
		description: 'Defines the indentation size for the node `example`.',
		default: availableConfigs.example,
	}, {
		name: 'given',
		type: 'number',
		description: 'Defines the indentation size for the node `given`.',
		default: availableConfigs.given,
	}, {
		name: 'when',
		type: 'number',
		description: 'Defines the indentation size for the node `when`.',
		default: availableConfigs.when,
	}, {
		name: 'then',
		type: 'number',
		description: 'Defines the indentation size for the node `then`.',
		default: availableConfigs.then,
	}, {
		name: 'and',
		type: 'number',
		description: 'Defines the indentation size for the node `and`.',
		default: availableConfigs.and,
	}, {
		name: 'but',
		type: 'number',
		description: 'Defines the indentation size for the node `but`.',
		default: availableConfigs.but,
	}, {
		name: 'RuleFallback',
		type: 'number',
		description: 'If enabled, the indentation for nodes inside Rule is the sum of "Rule" and the node itself, else it uses the node directly.',
		default: availableConfigs.RuleFallback,
	}, {
		name: 'type',
		type: 'string',
		description: 'Defines the type of indentation to use. If `both`, it will allow spaces and tabs. If `space`, it will use spaces. If `tab`, it will use tabs.',
		default: availableConfigs.type,
	}, {
		name: 'preferType',
		type: 'string',
		description: 'Defines the preferred type of indentation to use. If `space`, it will use spaces. If `tab`, it will use tabs. (Only applies to auto-fixing)',
		default: availableConfigs.preferType,
	}],
	examples: [{
		title: 'Example',
		description: 'Override some indentations',
		config: {
			[name]: ['error', {
				'Feature': 0,
				'Background': 2,
				'Scenario': 2,
				'Step': 4,
				'Examples': 2,
				'example': 3,
				'given': 3,
				'when': 3,
				'then': 3,
				'and': 3,
				'but': 3,
				'feature tag': 0,
				'scenario tag': 2,
				'examples tag': 2,
			}],
		},
	}],
};
