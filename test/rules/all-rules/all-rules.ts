import * as rules from '../../../src/rules.js';
import * as linter from '../../../src/linter.js';
import { Rules, RulesConfig } from '../../../src/types.js';
import assert from 'assert';
import { Suite } from 'mocha';

// Test cases for incomplete feature files that have broken over time across multiple rules
describe('Malformed features do not break the linter', function() {
	let allRules: Rules;

	it('Should start tests for each dynamic service', function() {
		// we need to tell mocha to register first test in this suite
		// otherwise it will not wait execute before hook
		assert.equal(true, true);
	});

	before(async function() {
		allRules = await rules.getAllRules();
		const suite = this.test.parent;
		Object.keys(allRules)
			.flatMap((rule) =>
				[
					it(`${rule} does not throw exceptions when processing an empty feature`, function() {
						return testRule('EmptyFeature.feature', rule);
					}),

					it(`${rule} does not throw exceptions when processing a feature with no children`, function() {
						return testRule('ChildlessFeature.feature', rule);
					}),

					it(`${rule} does not throw exceptions when processing a feature with no steps`, function() {
						return testRule('SteplessFeature.feature', rule);
					}),

					it(`${rule} does not throw exceptions when processing a scenario outline with an empty examples table`, function() {
						return testRule('EmptyExamples.feature', rule);
					}),
				])
			.forEach(suite.addTest.bind(suite) as typeof Suite.prototype.addTest);
	});
});

async function testRule(featureFile: string, rule: string) {
	const configuration = {} as RulesConfig;
	if (rule === 'new-line-at-eof') {
		configuration[rule] = ['error', 'yes'];
	} else if (rule === 'required-tags') {
		configuration[rule] = ['error', { 'tags': [] }];
	} else {
		configuration[rule] = 'error';
	}
	const gherkinData = await linter.readAndParseFile(`test/rules/all-rules/${featureFile}`);

	return rules.runAllEnabledRules(gherkinData, configuration);
}
