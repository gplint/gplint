import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/no-duplicate-tags.js';
const runTest = ruleTestBase.createRuleTest(rule, 'Duplicate tags are not allowed: <%= tags %>');
const runFixTest = ruleTestBase.createRuleFixTest(rule);

describe('No Duplicate Tags Rule', function() {
	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('no-duplicate-tags/NoViolations.feature', {}, []);
	});

	it('detects errors for features, scenarios, and scenario outlines', function() {
		return runTest('no-duplicate-tags/Violations.feature', {}, [
			{
				messageElements: { tags: '@featuretag' },
				line: 1,
				column: 13,
			},
			{
				messageElements: { tags: '@scenariotag' },
				line: 7,
				column: 16,
			},
			{
				messageElements: { tags: '@scenariotag' },
				line: 7,
				column: 41,
			},
			{
				messageElements: { tags: '@scenariooutlinetag' },
				line: 11,
				column: 23,
			},
			{
				messageElements: { tags: '@scenariooutlinetag' },
				line: 13,
				column: 3,
			},
			{
				messageElements: { tags: '@examplestag' },
				line: 17,
				column: 18,
			},
			{
				messageElements: { tags: '@examplestag' },
				line: 19,
				column: 5,
			},
			{
				messageElements: { tags: '@ruletag' },
				line: 24,
				column: 12,
			},
			{
				messageElements: { tags: '@scenariotag' },
				line: 27,
				column: 16,
			},
			{
				messageElements: { tags: '@scenariotag' },
				line: 27,
				column: 41,
			},
		]);
	});

	it('detects errors for features, scenarios, and scenario outlines and auto-fix', function() {
		return runFixTest('no-duplicate-tags/Violations.feature', {},
			// language=gherkin
			`@featuretag @anothertag
Feature: Feature with multiple duplicate tags

  Background:
    Given I have a Background

  @scenariotag @anothertag
  Scenario: This is a Scenario with three duplicate tags
    Then this is a then step

  @scenariooutlinetag
  @anothertag
  Scenario Outline: This is a Scenario Outline with two duplicate tags
    Then this is a then step <foo>

    @examplestag
    @anothertag
    Examples:
      | foo |
      | bar |

  @ruletag
  Rule: This is a rule

  @scenariotag @anothertag
  Scenario: This is a Scenario without related tags
    Then this is a then step
`);
	});
});
