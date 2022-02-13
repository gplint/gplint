import {assert} from 'chai';
import * as linter from '../../src/linter';


function linterTest(feature, expected) {
  return linter.lint([feature], {})
    .then((actual) => {
      assert.lengthOf(actual, 1);
      assert.deepEqual(actual[0].errors, expected);
    });
}

describe('Linter', function() {
  it('detects up-to-one-background-per-file violations', function() {
    let feature = 'test/linter/MultipleBackgrounds.feature';
    let expected = [{
      'line': '9',
      'column': 0,
      'message': 'Multiple "Background" definitions in the same file are disallowed',
      'rule': 'up-to-one-background-per-file',
      level: 2,
    }];
    return linterTest(feature, expected);
  });

  it('detects no-tags-on-backgrounds violations', function() {
    let feature = 'test/linter/TagOnBackground.feature';
    let expected = [{
      'line': '4',
      'column': 0,
      'message': 'Tags on Backgrounds are disallowed',
      'rule': 'no-tags-on-backgrounds',
      level: 2,
    }];

    return linterTest(feature, expected);
  });

  it('detects one-feature-per-file violations', function() {
    let feature = 'test/linter/MultipleFeatures.feature';
    let expected = [{
      'line': '7',
      'column': 0,
      'message': 'Multiple "Feature" definitions in the same file are disallowed',
      'rule': 'one-feature-per-file',
      level: 2,
    }];
    return linterTest(feature, expected);
  });

  it('detects no-multiline-steps violations', function() {
    let feature = 'test/linter/MultilineStep.feature';
    let expected = [{
      'line': '9',
      'column': 0,
      'message': 'Steps should begin with "Given", "When", "Then", "And" or "But". Multiline steps are disallowed',
      'rule': 'no-multiline-steps',
      level: 2,
    }];
    return linterTest(feature, expected);
  });

  it('detects no-multiline-steps violations in backgrounds', function() {
    let feature = 'test/linter/MultilineBackgroundStep.feature';
    let expected = [{
      'line': '5',
      'column': 0,
      'message': 'Steps should begin with "Given", "When", "Then", "And" or "But". Multiline steps are disallowed',
      'rule': 'no-multiline-steps',
      level: 2,
    }];
    return linterTest(feature, expected);
  });

  it('detects no-multiline-steps violations in scenario outlines', function() {
    let feature = 'test/linter/MultilineScenarioOutlineStep.feature';
    let expected = [{
      'line': '9',
      'column': 0,
      'message': 'Steps should begin with "Given", "When", "Then", "And" or "But". Multiline steps are disallowed',
      'rule': 'no-multiline-steps',
      level: 2,
    }];
    return linterTest(feature, expected);
  });

  // Not working on latest gherkin as all errors has the same start text
  it.skip('detects additional violations that happen after the \'no-tags-on-backgrounds\' rule', function() {
    let feature = 'test/linter/MultipleViolations.feature';
    let expected = [
      {
        message: 'Steps should begin with "Given", "When", "Then", "And" or "But". Multiline steps are disallowed',
        rule: 'no-multiline-steps',
        line: '13',
        column: 0,
        level: 2,
      },
      {
        message: 'Tags on Backgrounds are disallowed',
        rule: 'no-tags-on-backgrounds',
        line: '4',
        column: 0,
        level: 2,
      }
    ];

    return linter.lint([feature])
      .then((actual) => {
        assert.deepEqual(actual[0].errors, expected);
      });
  });

  it('correctly parses files that have the correct Gherkin format', function() {
    let feature = 'test/linter/NoViolations.feature';
    let expected = [];
    return linterTest(feature, expected);
  });
});
