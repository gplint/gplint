import fs from 'node:fs';

import {expect} from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import * as linter from '../../src/linter.js';
import { ErrorData, Rule, RuleSubConfig } from '../../src/types.js';
import {fixRuleErrors} from '../../src/rules/utils/fix/index.js';
import {stringEOLNormalize} from '../_test_utils.js';

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

		expect(rule.buildRuleErrors ? errors.map(e => rule.buildRuleErrors(e as ErrorData)) : errors).to.have.deep.members(expectedErrors);
	};
}

export function createRuleFixTest(rule: Rule) {
	return async function runTest(featureFile: string, ruleConfig: RuleSubConfig<unknown>, expected: string | RegExp): Promise<void> {
		const gherkinData = await linter.readAndParseFile(`test/rules/${featureFile}`);
		const { feature, pickles, file } = gherkinData;
		const errors = rule.run({ feature, pickles, file }, ruleConfig);

		await fixRuleErrors(gherkinData, rule, ruleConfig, errors as ErrorData[]);

		const callArgs = (fs.writeFileSync as sinon.SinonStubbedMember<typeof fs.writeFileSync>).getCall(0).args;
		expect(callArgs[0]).to.equal(file.relativePath);

		if (expected instanceof RegExp) {
			expect(callArgs[1]).to.match(expected);
		} else {
			expect(callArgs[1]).to.equal(stringEOLNormalize(expected));
		}
	};
}
