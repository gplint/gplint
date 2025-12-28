@featuretag @featuretag @anothertag
@featuretag
Feature: Feature with multiple duplicate tags

  Background:
    Given I have a Background

  @scenariotag @scenariotag @anothertag @scenariotag
  Scenario: This is a Scenario with three duplicate tags
    Then this is a then step

  @scenariooutlinetag @scenariooutlinetag
  @anothertag
  @scenariooutlinetag
  Scenario Outline: This is a Scenario Outline with two duplicate tags
    Then this is a then step <foo>

    @examplestag @examplestag
    @anothertag
    @examplestag
    Examples:
      | foo |
      | bar |

  @ruletag @ruletag
  Rule: This is a rule

  @scenariotag @scenariotag @anothertag @scenariotag
  Scenario: This is a Scenario without related tags
    Then this is a then step
