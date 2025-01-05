import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/no-trailing-spaces.js';

const runTest = ruleTestBase.createRuleTest(rule, 'Trailing spaces are not allowed');
const runFixTest = ruleTestBase.createRuleFixTest(rule);

describe('No Trailing Spaces Rule', function() {
	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('no-trailing-spaces/NoViolations.feature', {}, []);
	});

	it('raises an error for trailing spaces', function() {
		return runTest('no-trailing-spaces/TrailingSpaces.feature', {}, [
			{
				messageElements: {},
				line: 1,
				column: 34
			},
			{
				messageElements: {},
				line: 3,
				column: 50
			},
			{
				messageElements: {},
				line: 4,
				column: 47
			}
		]);
	});

	it('raises an error for trailing tabs', function() {
		return runTest('no-trailing-spaces/TrailingTabs.feature', {}, [
			{
				messageElements: {},
				line: 4,
				column: 49
			}
		]);
	});
});

describe('No Trailing Spaces Rule - fix line', function() {
	it('should remove trailing spaces', function() {
		return runFixTest('no-trailing-spaces/TrailingSpaces.feature', {},
			// language=gherkin
			`Feature: Test for trailing spaces

Scenario: This is Scenario for no-trailing-spaces
  Then I should see a no-trailing-spaces error
`);
	});

	it('should remove trailing tabs', function() {
		return runFixTest('no-trailing-spaces/TrailingTabs.feature', {},
			// language=gherkin
			`Feature: Test for trailing tabs

Scenario: This is Scenario for no-trailing-spaces - using tabs
  Then I should see a no-trailing-spaces error
`);
	});
});
