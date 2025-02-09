Feature: Feature with max-keywords violations

  Scenario: Exceed the allowed steps repeating keywords
    Given this Given is allowed
    Given this Given exceeds the limit
    When this When is allowed
    When this When is also allowed
    When this When exceeds the limit
    Then this Then is allowed
    Then this Then is also allowed
    Then this Then is also allowed
    Then this Then exceeds the limit

  Scenario: Exceed the allowed steps without repeating keywords
    Given this Given is allowed
    And this Given exceeds the limit
    When this When is allowed
    And this When is also allowed
    But this When exceeds the limit
    Then this Then is allowed
    But this Then is also allowed
    * this Then is also allowed
    And this Then exceeds the limit

  Scenario: Exceed the allowed steps separated
    Given this Given is allowed
    When this When is allowed
    And this When is allowed
    Then this Then is allowed
    Given this Given exceeds the limit
    When this When exceeds the limit
    And this When also exceeds the limit

  Scenario: Exceed the allowed steps starting with no keyword
    But this steps is ignored
    And this steps is also ignored
    * this steps is also ignored
    Given this Given is allowed
    And this Given is not allowed

  Scenario: Have only one step for each keyword
    Given this is a Given step
    When this is a Given step
    Then this is a Given step

  Scenario: With loooooong used conjunction
    Given this Given is allowed
    When this When is allowed
    And this is alloweed
    But this is not alloweed
    And this is not alloweed
    * this is not alloweed
    And this is not alloweed
    And this is not alloweed
    And this is not alloweed
    * this is not alloweed
    And this is not alloweed
    And this is not alloweed
    And this is not alloweed
    Then this Then is alloweed
