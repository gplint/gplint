import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/use-and.js';

const runTest = ruleTestBase.createRuleTest(rule, 'Repeated successive "<%= keyword %> " is not allowed. Replace with "And".');
const runFixTest = ruleTestBase.createRuleFixTest(rule);

describe('Use And Rule', function() {
	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('use-and/NoViolations.feature', {}, []);
	});

	it('raises errors when there are violations', function() {
		return runTest('use-and/Violations.feature', {}, [
			{
				messageElements: { keyword: 'Given'},
				line: 5,
				column: 3,
			},
			{
				messageElements: { keyword: 'When'},
				line: 8,
				column: 3,
			},
			{
				messageElements: { keyword: 'Then'},
				line: 11,
				column: 3,
			},
			{
				messageElements: { keyword: 'Given'},
				line: 16,
				column: 3,
			},
			{
				messageElements: { keyword: 'When'},
				line: 19,
				column: 3,
			},
			{
				messageElements: { keyword: 'Then'},
				line: 22,
				column: 3,
			},
			{
				messageElements: { keyword: 'Given'},
				line: 27,
				column: 3
			},
			{
				messageElements: { keyword: 'When'},
				line: 30,
				column: 3,
			},
			{
				messageElements: { keyword: 'Then'},
				line: 33,
				column: 3,
			}
		]);
	});

	describe('autofix', function() {
		it('should fix replacing repeated keywords with "And"', function() {
			return runFixTest('use-and/Violations.feature', {},
				// language=gherkin
				`Feature: Feature with no use-and violations

Background:
  Given step4
  And step5
  And step6
  When step7
  And step8
  And step9
  Then step10
  And step11
  And step12

Scenario: This is a Scenario
  Given step15
  And step16
  And step17
  When step18
  And step19
  And step20
  Then step21
  And step22
  And step23

Scenario Outline: This is a Scenario Outline
  Given step26
  And step27
  And step28
  When step29
  And step30
  And step31
  Then step32
  And step33
  And step34
Examples:
  | foo |
  | bar |
`);
		});
	});
});
