import {Documentation, GherkinData, RuleError} from '../types.js';
import {Location} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-unused-variables';

type VariablesLocation = Record<string, Location>

export function run({feature}: GherkinData): RuleError[] {
	if(!feature) {
		return [];
	}

	const errors = [] as RuleError[];
	const stepVariableRegex = /<((?! )[^>]+(?<! ))>/gu;

	featureSpread(feature).children.forEach(child => {
		if (!child.scenario) {
			// Variables are a feature of Scenarios (as of Gherkin 9?) and Scenario Outlines only
			return;
		}

		const {examples} = child.scenario;

		if (!examples.length) {
			// If there is no examples table, the rule doesn't apply
			return;
		}

		// Maps of variableName -> lineNo
		const examplesVariables = {} as VariablesLocation;
		const scenarioVariables = {} as VariablesLocation;
		let match;

		// Collect all the entries of the examples table
		examples.forEach(example => {
			if (example.tableHeader?.cells) {
				example.tableHeader.cells.forEach(cell => {
					if (cell.value) {
						examplesVariables[cell.value] = cell.location;
					}
				});
			}
		});

		// Collect the variables used in the scenario outline

		// Scenario names can include variables
		while ((match = stepVariableRegex.exec(child.scenario.name)) != null) {
			scenarioVariables[match[1]] = {
				line: child.scenario.location.line,
				column: child.scenario.keyword.length + 2 + (child.scenario.location.column ?? 0) + match.index // If multiple spaces (or any) are separating the keyword, the column is wrong
			};
		}

		child.scenario.steps.forEach(step => {

			// Steps can take arguments and their argument can include variables.
			// The arguments can be of type:
			// - DocString
			// - DataTable
			// For more details, see https://docs.cucumber.io/gherkin/reference/#step-arguments

			// Collect variables from step arguments
			if (step.dataTable) {
				step.dataTable.rows.forEach(row => {
					row.cells.forEach(cell => {
						if (cell.value) {
							while ((match = stepVariableRegex.exec(cell.value)) != null) {
								scenarioVariables[match[1]] = {
									line: cell.location.line,
									column: (cell.location.column ?? 0) + match.index
								};
							}
						}
					});
				});
			} else if (step.docString) {
				while ((match = stepVariableRegex.exec(step.docString.content)) != null) {
					scenarioVariables[match[1]] = {
						line: step.docString.location.line,
						column: 0 // With multiple lines needs a complex way to find the column
					};
				}
			}

			// Collect variables from the steps themselves
			while ((match = stepVariableRegex.exec(step.text)) != null) {
				scenarioVariables[match[1]] = {
					line: step.location.line, // Matches the docstring line, not the matching line
					column: step.keyword.length + (step.location.column ?? 0) + match.index // If multiple spaces (or any) are separating the keyword, the column is wrong
				};
			}
		});

		for (const exampleVariable in examplesVariables) {
			if (!Object.hasOwn(scenarioVariables, exampleVariable)) {
				errors.push({
					message: `Examples table variable "${exampleVariable}" is not used in any step`,
					rule   : name,
					line   : examplesVariables[exampleVariable].line,
					column : examplesVariables[exampleVariable].column,
				});
			}
		}

		for (const scenarioVariable in scenarioVariables) {
			if (!Object.hasOwn(examplesVariables, scenarioVariable)) {
				errors.push({
					message: `Step variable "${scenarioVariable}" does not exist in the examples table`,
					rule: name,
					line: scenarioVariables[scenarioVariable].line,
					column: scenarioVariables[scenarioVariable].column,
				});
			}
		}
	});

	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows unused variables in scenario outlines.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
