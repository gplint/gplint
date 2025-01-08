import {assert} from 'chai';
import _ from 'lodash';
import * as linter from '../../src/linter.js';
import { ErrorData, Rule, RuleSubConfig } from '../../src/types.js';

interface RuleErrorTemplate {
	messageElements?: Record<string, string | number | (string | number)[]>
	line: number
	column: number
}

type RunTestFunction = (featureFile: string, configuration: RuleSubConfig<unknown>, expected: RuleErrorTemplate[]) => Promise<void> ;

export function createRuleTest(rule: Rule, messageTemplate: string): RunTestFunction {
	return async function runTest(featureFile: string, configuration: RuleSubConfig<unknown>, expected: RuleErrorTemplate[]): Promise<void> {
		const expectedErrors = _.map(expected, function(error: RuleErrorTemplate) {
			return {
				rule: rule.name,
				message: _.template(messageTemplate)(error.messageElements),
				line: error.line,
				column: error.column,
			};
		});

		const { feature, pickles, file } = await linter.readAndParseFile(`test/rules/${featureFile}`);

		const errors = rule.run({ feature, pickles, file }, configuration);

		assert.sameDeepMembers(rule.buildRuleErrors ? errors.map(e => rule.buildRuleErrors(e as ErrorData)) : errors, expectedErrors);
	};
}

export function createRuleFixTest(rule: Rule) {
	return async function runTest(featureFile: string, configuration: RuleSubConfig<unknown>, expected: string): Promise<void> {
		const { feature, pickles, file } = await linter.readAndParseFile(`test/rules/${featureFile}`);

		const errors = rule.run({ feature, pickles, file }, configuration);

		errors.forEach(error => {
			if (rule.fix) {
				rule.fix(error as ErrorData, file, configuration);
			}
		});
		assert.equal(file.lines.join(file.EOL), expected);
	};
}
