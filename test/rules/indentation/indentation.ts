import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/indentation.js';

const runTest = ruleTestBase.createRuleTest(rule, 'Wrong indentation for "<%= element %>", expected indentation level of <%= expected %>, but got <%= actual %>');
const runFixTest = ruleTestBase.createRuleFixTest(rule);

const WRONG_INDENTATION_ERRORS = [
	{
		messageElements: {
			element: 'Feature',
			expected: 0,
			actual: 1,
		},
		line: 2,
		column: 2,
	}, {
		messageElements: {
			element: 'feature tag',
			expected: 0,
			actual: 1,
		},
		line: 1,
		column: 2,
	}, {
		messageElements: {
			element: 'Background',
			expected: 2,
			actual: 4,
		},
		line: 4,
		column: 5,
	}, {
		messageElements: {
			element: 'Step',
			expected: 4,
			actual: 0,
		},
		line: 5,
		column: 1,
	}, {
		messageElements: {
			element: 'Scenario',
			expected: 2,
			actual: 1,
		},
		line: 9,
		column: 2,
	}, {
		messageElements: {
			element: 'scenario tag',
			expected: 2,
			actual: 1,
		},
		line: 7,
		column: 2,
	}, {
		messageElements: {
			element: 'scenario tag',
			expected: 2,
			actual: 1,
		},
		line: 8,
		column: 2,
	}, {
		messageElements: {
			element: 'Step',
			expected: 4,
			actual: 3,
		},
		line: 10,
		column: 4,
	}, {
		messageElements: {
			element: 'Scenario',
			expected: 2,
			actual: 3,
		},
		line: 14,
		column: 4,
	}, {
		messageElements: {
			element: 'scenario tag',
			expected: 2,
			actual: 3,
		},
		line: 12,
		column: 4,
	}, {
		messageElements: {
			element: 'scenario tag',
			expected: 2,
			actual: 4,
		},
		line: 13,
		column: 5,
	}, {
		messageElements: {
			element: 'Step',
			expected: 4,
			actual: 3,
		},
		line: 15,
		column: 4,
	}, {
		messageElements: {
			element: 'Examples',
			expected: 4,
			actual: 2,
		},
		line: 18,
		column: 3,
	}, {
		messageElements: {
			element: 'examples tag',
			expected: 4,
			actual: 2,
		},
		line: 16,
		column: 3,
	}, {
		messageElements: {
			element: 'examples tag',
			expected: 4,
			actual: 3,
		},
		line: 17,
		column: 4,
	}, {
		messageElements: {
			element: 'example',
			expected: 6,
			actual: 4,
		},
		line: 19,
		column: 5,
	}, {
		messageElements: {
			element: 'example',
			expected: 6,
			actual: 4,
		},
		line: 20,
		column: 5,
	},
	// Inside Rule
	{
		messageElements: {
			element: 'Rule',
			expected: 2,
			actual: 3,
		},
		line: 23,
		column: 4,
	}, {
		messageElements: {
			element: 'rule tag',
			expected: 2,
			actual: 6,
		},
		line: 22,
		column: 7,
	}, {
		messageElements: {
			element: 'Scenario',
			expected: 4,
			actual: 1,
		},
		line: 25,
		column: 2,
	}, {
		messageElements: {
			element: 'scenario tag',
			expected: 4,
			actual: 7,
		},
		line: 24,
		column: 8,
	}, {
		messageElements: {
			element: 'Step',
			expected: 6,
			actual: 2,
		},
		line: 26,
		column: 3,
	}];

describe('Indentation rule', function() {
	it('doesn\'t raise errors when the default configuration is used and there are no indentation violations (spaces)', function() {
		return runTest('indentation/CorrectIndentationSpaces.feature', {}, []);
	});

	it('doesn\'t raise errors when the default configuration is used are and there no indentation violations (tabs)', function() {
		return runTest('indentation/CorrectIndentationTabs.feature', {}, []);
	});

	it('detects errors for features, backgrounds, scenarios, scenario outlines and steps (spaces)', function() {
		return runTest('indentation/WrongIndentationSpaces.feature', {}, WRONG_INDENTATION_ERRORS);
	});

	it('detects errors for features, backgrounds, scenarios, scenario outlines and steps (spaces), without Rule Fallback', function() {
		return runTest('indentation/WrongIndentationSpacesWithoutRuleFallback.feature', {
			'RuleFallback': false,
		}, [
			{
				messageElements: {element: 'Background', expected: 2, actual: 3},
				line: 6,
				column: 4,
			}, {
				messageElements: {element: 'Step', expected: 4, actual: 0},
				line: 7,
				column: 1,
			}, {
				messageElements: {element: 'scenario tag', expected: 2, actual: 7},
				line: 8,
				column: 8,
			}, {
				messageElements: {element: 'Scenario', expected: 2, actual: 1},
				line: 9,
				column: 2,
			}, {
				messageElements: {element: 'Step', expected: 4, actual: 2},
				line: 10,
				column: 3,
			}]);
	});

	it('detects errors for features, backgrounds, scenarios, scenario outlines and steps (tabs)', function() {
		return runTest('indentation/WrongIndentationTabs.feature', {}, WRONG_INDENTATION_ERRORS);
	});

	it('detects errors for features, backgrounds, scenarios, scenario outlines and steps in other languages', function() {
		return runTest('indentation/WrongIndentationDifferentLanguage.feature', {}, [{
			messageElements: {element: 'Feature', expected: 0, actual: 4},
			line: 3,
			column: 5,
		}, {
			messageElements: {element: 'feature tag', expected: 0, actual: 4},
			line: 2,
			column: 5,
		}, {
			messageElements: {element: 'Background', expected: 2, actual: 4},
			line: 5,
			column: 5,
		}, {
			messageElements: {element: 'Step', expected: 4, actual: 0},
			line: 6,
			column: 1,
		}, {
			messageElements: {element: 'Scenario', expected: 2, actual: 4},
			line: 10,
			column: 5,
		}, {
			messageElements: {element: 'scenario tag', expected: 2, actual: 4},
			line: 8,
			column: 5,
		}, {
			messageElements: {element: 'scenario tag', expected: 2, actual: 1},
			line: 9,
			column: 2,
		}, {
			messageElements: {element: 'Step', expected: 4, actual: 12},
			line: 11,
			column: 13,
		}, {
			messageElements: {element: 'Scenario', expected: 2, actual: 12},
			line: 15,
			column: 13,
		}, {
			messageElements: {element: 'scenario tag', expected: 2, actual: 4},
			line: 13,
			column: 5,
		}, {
			messageElements: {element: 'scenario tag', expected: 2, actual: 1},
			line: 14,
			column: 2,
		}, {
			messageElements: {element: 'Step', expected: 4, actual: 11},
			line: 16,
			column: 12,
		}, {
			messageElements: {element: 'Examples', expected: 4, actual: 7},
			line: 19,
			column: 8,
		}, {
			messageElements: {element: 'examples tag', expected: 4, actual: 10},
			line: 17,
			column: 11,
		}, {
			messageElements: {element: 'examples tag', expected: 4, actual: 8},
			line: 18,
			column: 9,
		}, {
			messageElements: {element: 'example', expected: 6, actual: 15},
			line: 20,
			column: 16,
		}, {
			messageElements: {element: 'example', expected: 6, actual: 15},
			line: 21,
			column: 16,
		}]);
	});

	it('defaults the tag indentation settings when they are not set', function() {
		return runTest('indentation/CorrectIndentationWithFeatureAndScenarioAndExamplesOverrides.feature', {
			'Feature': 1,
			'Scenario': 3,
			'Examples': 5,
			'example': 7,
			'Rule': 4,
		}, []);
	});

	it('observe tag indentation settings when they are overridden', function() {
		return runTest('indentation/CorrectIndentationWithScenarioAndExamplesTagOverrides.feature', {
			'feature tag': 1,
			'scenario tag': 3,
			'examples tag': 5,
			'rule tag': 4,
		}, []);
	});

	it('observe tag indentation settings when they are overridden and without RuleFallback', function() {
		return runTest('indentation/CorrectIndentationWithScenarioAndExamplesTagOverridesWithoutRuleFallback.feature', {
			'feature tag': 1,
			'scenario tag': 3,
			'examples tag': 5,
			'rule tag': 4,
			'RuleFallback': false,

		}, []);
	});

	it('observe specific step indentation settings', function() {
		return runTest('indentation/CorrectIndentationWithSpecificStepOverrides.feature', {
			'given': 5,
			'when': 6,
			'then': 7,
			'and': 8,
			'but': 9,
		}, []);
	});

	describe('autofix', function() {
		it('should fix wrong spaces indentation', function() {
			return runFixTest('indentation/WrongIndentationSpaces.feature', {},
				// language=gherkin
				`@featureTag1 @featureTag2
Feature: Test for indentation - spaces

  Background:
    Given I have a Feature file with indentation all over the place

  @scenarioTag1 @scenarioTag2
  @scenarioTag3
  Scenario: This is a Scenario for indentation - spaces
    Then I should see an indentation error

  @scenarioTag1 @scenarioTag2
  @scenarioTag3
  Scenario Outline: This is a Scenario Outline for indentation - spaces
    Then I should see an indentation error <foo>
    @exampleTag1 @exampleTag2
    @exampleTag3
    Examples:
      | foo |
      | bar |

  @ruletag
  Rule: This is a rule
    @scenarioTag4
    Scenario: This is a Scenario a rule for indentation - spaces
      Then I should see an indentation error
`);
		});

		it('should fix wrong tabs indentation', function() {
			return runFixTest('indentation/WrongIndentationTabs.feature',
				{
					Feature: 0,
					Background: 1,
					Rule: 1,
					Scenario: 1,
					Step: 2,
					Examples: 2,
					example: 3,
					given: 2,
					when: 2,
					then: 2,
					and: 2,
					but: 2,
					preferType: 'tab'
				},
				// language=gherkin
				`@featureTag1 @featureTag2
Feature: Test for indentation - tabs

	Background:
		Given I have a Feature file with indentation all over the place

	@scenarioTag1 @scenarioTag2
	@scenarioTag3
	Scenario: This is a Scenario for indentation - tabs
		Then I should see an indentation error

	@scenarioTag1 @scenarioTag2
	@scenarioTag3
	Scenario Outline: This is a Scenario Outline for indentation - tabs
		Then I should see an indentation error <foo>
		@exampleTag1 @exampleTag2
		@exampleTag3
		Examples:
			| foo |
			| bar |

	@ruletag
	Rule: This is a rule
		@scenarioTag4
		Scenario: This is a Scenario a rule for indentation - spaces
			Then I should see an indentation error
`);
		});

		it('should fix to force using space as indentation character', function() {
			return runFixTest('indentation/WrongIndentationSpacesTabs.feature',
				{
					type: 'space',
				},
				// language=gherkin
				`@featureTagWithTab
Feature: Test for indentation - mixed

  @scenarioTagWithSpace
  @scenarioTagWithTab
  Scenario: This is a Scenario for indentation - no indentation
    Given this step is indented with tabs
    And this step is indented with spaces

  Scenario: This is a Scenario for indentation - tabs
    Given this step is indented with tabs
    And this step is not indented
`);
		});

		it('should fix to force using tab as indentation character', function() {
			return runFixTest('indentation/WrongIndentationSpacesTabs.feature',
				{
					Feature: 0,
					Background: 1,
					Rule: 1,
					Scenario: 1,
					Step: 2,
					Examples: 2,
					example: 3,
					given: 2,
					when: 2,
					then: 2,
					and: 2,
					but: 2,
					type: 'tab'
				},
				// language=gherkin
				`@featureTagWithTab
Feature: Test for indentation - mixed

	@scenarioTagWithSpace
	@scenarioTagWithTab
	Scenario: This is a Scenario for indentation - no indentation
		Given this step is indented with tabs
		And this step is indented with spaces

	Scenario: This is a Scenario for indentation - tabs
		Given this step is indented with tabs
		And this step is not indented
`);
		});
	});
});
