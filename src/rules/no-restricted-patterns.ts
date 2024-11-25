import {
	Background,
	DocString,
	Examples,
	Feature,
	Rule,
	Scenario,
	Step,
	StepKeywordType,
	TableCell,
} from '@cucumber/messages';

import * as gherkinUtils from './utils/gherkin.js';
import {featureSpread} from './utils/gherkin.js';
import {Documentation, GherkinData, GherkinKeyworded, RuleError, RuleSubConfig} from '../types.js';

interface IConfiguration<T> {
	Global?: T[]
	Feature?: T[]
	Rule?: T[]
	Background?: T[]
	Scenario?: T[]
	ScenarioOutline?: T[]
	Examples?: T[]
	ExampleHeader?: T[]
	ExampleBody?: T[]
	Step?: T[]
	Given?: T[]
	When?: T[]
	Then?: T[]
	DataTable?: T[]
	DocString?: T[]
}

const keywords = ['Given', 'When', 'Then'];
let previousKeyword: string;
type Configuration = RuleSubConfig<IConfiguration<string>>;
type ConfigurationPatterns = RuleSubConfig<IConfiguration<RegExp>>;
type ConfigurationPatternsLowerCase = Record<Lowercase<keyof ConfigurationPatterns>, ConfigurationPatterns[keyof ConfigurationPatterns]>;

export const name = 'no-restricted-patterns';
export const availableConfigs = {
	'Global': [] as string[],
	'Feature': [] as string[],
	'Rule': [] as string[],
	'Background': [] as string[],
	'Scenario': [] as string[],
	'ScenarioOutline': [] as string[],
	'Examples': [] as string[],
	'ExampleHeader': [] as string[],
	'ExampleBody': [] as string[],
	'Step': [] as string[],
	'Given': [] as string[],
	'When': [] as string[],
	'Then': [] as string[],
	'DataTable': [] as string[],
	'DocString': [] as string[],
};

export function run({feature}: GherkinData, configuration: Configuration): RuleError[] {
	previousKeyword = '';
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];
	const restrictedPatterns = getRestrictedPatterns(configuration);
	const {language} = feature;
	// Check the feature itself
	checkNameAndDescription(feature, restrictedPatterns, language, errors);

	const {
		children,
		rules,
	} = featureSpread(feature);

	rules.forEach(rule => {
		checkNameAndDescription(rule, restrictedPatterns, language, errors);
	});

	// Check the feature children
	children.forEach(child => {
		const node = child.background ?? child.scenario;
		checkNameAndDescription(node, restrictedPatterns, language, errors);

		// And all the steps of each child
		node.steps.forEach((step, index) => {
			checkStepNode(step, node.steps[index], restrictedPatterns, language, errors);
			checkStepNode(step, node, restrictedPatterns, language, errors);

			if (step.docString != null) {
				restrictedPatterns.docstring.forEach(dsPattern => {
					check(step.docString, 'DocString', 'content', dsPattern, language, errors);
				});
			}

			if (step.dataTable != null) {
				restrictedPatterns.datatable.forEach(dtPattern => {
					step.dataTable.rows.forEach(row => {
						row.cells.forEach(cell => {
							check(cell, 'DataTable cell', 'value', dtPattern, language, errors);
						});
					});
				});
			}
		});

		if (child.scenario?.examples) {
			child.scenario.examples.forEach(example => {
				checkNameAndDescription(example, restrictedPatterns, language, errors);
				checkExampleNode(example, restrictedPatterns, language, errors);
			});
		}
	});
	return errors.filter((obj, index, self) =>
		index === self.findIndex((el) => el.message === obj.message),
	);
}

function getRestrictedPatterns(configuration: Configuration): ConfigurationPatternsLowerCase {
	// Patterns applied to everything; feature, scenarios, etc.
	const globalPatterns = (configuration.Global ?? []).map(pattern => new RegExp(pattern, 'i'));
	//pattern to apply on all steps
	const stepPatterns = (configuration.Step ?? []).map(pattern => new RegExp(pattern, 'i'));
	const restrictedPatterns = {} as ConfigurationPatternsLowerCase;

	Object.keys(availableConfigs).forEach((key: keyof Configuration) => {
		const resolvedKey = key.toLowerCase().replace(/ /g, '') as Lowercase<keyof Configuration>;
		const resolvedConfig = (configuration[key] ?? []);
		restrictedPatterns[resolvedKey] = resolvedConfig.map(pattern => new RegExp(pattern, 'i'));
		if (keywords.map(item => item.toLowerCase()).includes(resolvedKey.toLowerCase())) {
			restrictedPatterns[resolvedKey] = restrictedPatterns[resolvedKey].concat(stepPatterns);
		}
		restrictedPatterns[resolvedKey] = restrictedPatterns[resolvedKey].concat(globalPatterns);
	});
	return restrictedPatterns;
}

function getRestrictedPatternsForNode(node: GherkinKeyworded, restrictedPatterns: ConfigurationPatternsLowerCase, language: string): RegExp[] {
	const key = gherkinUtils.getLanguageInsensitiveKeyword(node, language).toLowerCase() as keyof ConfigurationPatternsLowerCase;
	if (keywords.map(item => item.toLowerCase()).includes(key.toLowerCase())) {
		previousKeyword = key;
	}
	if ((node as Step).keywordType === StepKeywordType.CONJUNCTION && keywords.map(item => item.toLowerCase()).includes(previousKeyword.toLowerCase())) {
		return restrictedPatterns[previousKeyword as keyof ConfigurationPatternsLowerCase];
	}
	return restrictedPatterns[key];
}

function checkNameAndDescription(node: GherkinKeyworded, restrictedPatterns: ConfigurationPatternsLowerCase, language: string, errors: RuleError[]) {
	getRestrictedPatternsForNode(node, restrictedPatterns, language)
		.forEach(pattern => {
			checkGuessType(node, 'name', pattern, language, errors);
			checkGuessType(node, 'description', pattern, language, errors);
		});
}

function checkStepNode(
	node: Step,
	parentNode: Background | Scenario | Step,
	restrictedPatterns: ConfigurationPatternsLowerCase,
	language: string,
	errors: RuleError[],
) {
	// Use the node keyword of the parent to determine which rule configuration to use
	getRestrictedPatternsForNode(parentNode, restrictedPatterns, language)
		.forEach(pattern => {
			checkGuessType(node, 'text', pattern, language, errors);
		});
}

function checkExampleNode(node: Examples, restrictedPatterns: ConfigurationPatternsLowerCase, language: string, errors: RuleError[]) {
	restrictedPatterns.exampleheader.forEach(pattern => {
		node.tableHeader.cells.forEach(cell => {
			check(cell, 'ExampleHeader', 'value', pattern, language, errors);
		});
	});

	restrictedPatterns.examplebody.forEach(pattern => {
		node.tableBody.forEach(column => {
			column.cells.forEach(cell => {
				check(cell, 'ExampleBody', 'value', pattern, language, errors);
			});
		});
	});
}

function checkGuessType(node: GherkinKeyworded, property: string, pattern: RegExp, language: string, errors: RuleError[]) {
	const type = gherkinUtils.getNodeType(node, language);

	check(node, type, property, pattern, language, errors);
}

function check(node: GherkinKeyworded | TableCell | DocString, type: string, property: string, pattern: RegExp, language: string, errors: RuleError[]) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore IDK how to handle types for this...
	let strings = [node[property]] as string[];

	if (property === 'description') {
		// Descriptions can be multiline, in which case the description will contain escaped
		// newline characters "\n". If a multiline description matches one of the restricted patterns
		// when the error message gets printed in the console, it will break the message into multiple lines.
		// So let's split the description on newline chars and test each line separately.

		// To make sure we don't accidentally pick up a doubly escaped new line "\\n" which would appear
		// if a user wrote the string "\n" in a description, let's replace all escaped new lines
		// with a sentinel, split lines and then restore the doubly escaped new line
		const escapedNewLineSentinel = '<!gplint new line sentinel!>';
		const escapedNewLine = '\\n';
		strings = (node as Feature | Rule | Scenario | Examples).description
			.replace(escapedNewLine, escapedNewLineSentinel)
			.split('\n')
			.map((str: string) => str.replace(escapedNewLineSentinel, escapedNewLine));
	}
	for (const element of strings) {
		// We use trim() on the examined string because names and descriptions can contain
		// white space before and after, unlike steps
		if (element.trim().match(pattern)) {
			errors.push({
				message: `${type} ${property}: "${element.trim()}" matches restricted pattern "${pattern}"`,
				rule: name,
				line: node.location.line,
				column: node.location.column,
			});
		}
	}
}

export const documentation: Documentation = {
	description: 'A list of patterns to disallow globally, or specifically in features, rules, backgrounds, scenarios, or scenario outlines, Steps. All patterns are treated as case-insensitive',
	fixable: false,
	configuration: [{
		name: 'Global',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at any level',
		default: availableConfigs.Global,
	}, {
		name: 'Feature',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Feature level',
		default: availableConfigs.Feature,
	}, {
		name: 'Rule',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Rule level',
		default: availableConfigs.Rule,
	}, {
		name: 'Background',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Background level',
		default: availableConfigs.Background,
	}, {
		name: 'Scenario',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Scenario level',
		default: availableConfigs.Scenario,
	}, {
		name: 'ScenarioOutline',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at ScenarioOutline level',
		default: availableConfigs.ScenarioOutline,
	}, {
		name: 'Examples',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Examples level',
		default: availableConfigs.Examples,
	}, {
		name: 'ExampleHeader',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at ExampleHeader level',
		default: availableConfigs.ExampleHeader,
	}, {
		name: 'ExampleBody',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at ExampleBody level',
		default: availableConfigs.ExampleBody,
	}, {
		name: 'Step',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Step level',
		default: availableConfigs.Step,
	}, {
		name: 'Given',
		type: '(string|RegExp)[]',
		description: 'Text patterns not allowed at Given level',
		default: availableConfigs.Given,
	}],
	examples: [{
		title: 'Example',
		description: 'Configure multiple patterns, mixing plain strings with RegExps',
		config: {
			[name]: ['error', {
				'Global': [
					'^globally restricted pattern',
				],
				'Feature': [
					'poor description',
					'validate',
					'verify',
				],
				'Background': [
					'show last response',
					'a debugging step',
				],
				'Scenario': [
					'show last response',
					'a debugging step',
				],
				'Examples': [
					'poor examples name',
					'really bad examples description',
				],
				'ExampleHeader': [
					'^.*disallowed.*$',
				],
				'ExampleBody': [
					'^.*invalid.*$',
				],
				'Step': [
					'bad step',
				],
				'Given': [
					'bad step given',
					'a debugging step given',
				],
				'When': [
					'bad step when',
					'a debugging step when',
				],
				'Then': [
					'bad step then',
					'a debugging step then',
				],
				'DocString': [
					'^.*disallowed.*$',
				],
				'DataTable': [
					'^.*invalid.*$',
					'wrong value',
				],
			}],
		},
	}],
};
