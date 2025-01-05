	@featureTagWithTab
	Feature: Test for indentation - mixed

        @scenarioTagWithSpace
					@scenarioTagWithTab
Scenario: This is a Scenario for indentation - no indentation
					Given this step is indented with tabs
    And this step is indented with spaces

			Scenario: This is a Scenario for indentation - tabs
    Given this step is indented with tabs
And this step is not indented
