import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/no-background-only-scenario.js';
const runTest = ruleTestBase.createRuleTest(rule,
	'Backgrounds are not allowed when there is just one scenario.');

describe('no-background-only-scenario', function() {
	it('doesn\'t raise errors when there are no background', function() {
		return runTest('no-background-only-scenario/NoBackground.feature', {}, []);
	});

	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('no-background-only-scenario/NoViolations.feature', {}, []);
	});

	it('doesn\'t raise errors when there are no violations with no scenarios out of rule', function() {
		return runTest('no-background-only-scenario/NoViolationsRuleScenariosOnly.feature', {}, []);
	});

	it('detects errors when there are violations with Scenario', function() {
		return runTest('no-background-only-scenario/ViolationsScenario.feature', {}, [
			{
				line: 14,
				column: 5,
				messageElements: {},
			},
		]);
	});

	it('detects errors when there are violations with Scenario Outline', function() {
		return runTest('no-background-only-scenario/ViolationsOutline.feature', {}, [
			{
				line: 17,
				column: 5,
				messageElements: {},
			},
		]);
	});
});
