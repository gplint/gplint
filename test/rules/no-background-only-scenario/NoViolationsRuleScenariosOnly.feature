Feature: Example feature with Background and Rules

  Background:
    Given some common setup step
    And another setup condition

  Rule: First group of related scenarios

    Scenario: First scenario in this rule
      When I perform some action
      Then I should see expected result

    Scenario: Second scenario in this rule
      When I perform different action
      Then I should see different result

  Rule: Second group of related scenarios

    Scenario: First scenario in second rule
      When I do something else
      Then I get another outcome

    Scenario: Second scenario in second rule
      When I try final action
      Then I see final result
