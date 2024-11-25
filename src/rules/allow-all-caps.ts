import * as allowAllCase from './abstracts/_allow-all-case.js';
import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';

export const name = 'allow-all-caps';

export const {availableConfigs} = allowAllCase;

export function run(gherkinData: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	return allowAllCase.run(
		gherkinData,
		configuration,
		{
			rule: name,
			caseMethod: String.prototype.toUpperCase, // eslint-disable-line @typescript-eslint/unbound-method
			errorMsg: 'with all caps are not allowed',
		},
	);
}

export const documentation: Documentation = {
	description: 'Allows the user to specify if some nodes allows texts completely in uppercase.',
	fixable: false,
	configuration: allowAllCase.configurationDocumentation,
	examples: [{
		title: 'Example',
		description: 'Allows "Description", "ExampleHeader" and "ExampleBody" to be completely in uppercase, disallow the rest using "Global".',
		config: {
			[name]: ['error', {
				Global: false,
				Description: true,
				ExampleHeader: true,
				ExampleBody: true,
			}],
		}
	}],
};
