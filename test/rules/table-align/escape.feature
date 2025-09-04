Feature: Feature with tables with pipe symbols

  Scenario: This is a Scenario
    Given step with escaped pipes:
      | \|this | \| is \|    | aligned\|   |
      | \|this  |\| isn't \||  aligned\||
      | this   | \|is\|      | aligned too |
    And step with backslashes:
      | \this | \ is \    | aligned\    |
      | \this  |\ isn't \ |  aligned\ |
      | this  | \is\      | aligned too |
    And step with escaped backslashes:
      | \\this | \\ is \\    | aligned\\   |
      | \\this  |\\ isn't \\|  aligned\\|
      | this   | \\is\\      | aligned too |
