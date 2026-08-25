import {assert} from 'chai';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ruleTestBase from '../rule-test-base.js';
import * as linter from '../../../src/linter.js';
import {stringEOLNormalize} from '../../_test_utils.js';
import * as rule from '../../../src/rules/table-align.js';
const runTest = ruleTestBase.createRuleTest(rule,
	'Cell with value "<%= cellValue %>" is not aligned');
const runFixTest = ruleTestBase.createRuleFixTest(rule);

describe('Table Align Rule', function() {
	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('table-align/aligned.feature', {}, []);
	});

	it('tables without spaces', function() {
		return runTest('table-align/no-spaces.feature', {}, [
			// Background - First row
			{
				messageElements: {cellValue: 'gplint'},
				line: 5,
				column: 6,
			},
			// Background - Second row
			{
				messageElements: {cellValue: 'do magic'},
				line: 6,
				column: 6,
			},
			// Step - First row
			{
				messageElements: {cellValue: 'lorem'},
				line: 10,
				column: 6,
			},
			{
				messageElements: {cellValue: 'ipsum'},
				line: 10,
				column: 12,
			},
			{
				messageElements: {cellValue: 'dolor'},
				line: 10,
				column: 18,
			},
			// Step - Second row
			{
				messageElements: {cellValue: 'foo'},
				line: 11,
				column: 6,
			},
			{
				messageElements: {cellValue: 'bar'},
				line: 11,
				column: 10,
			},
			{
				messageElements: {cellValue: 'foo bar'},
				line: 11,
				column: 14,
			},

			// Example - First row
			{
				messageElements: {cellValue: 'foo'},
				line: 17,
				column: 4,
			},
			{
				messageElements: {cellValue: 'lorem'},
				line: 17,
				column: 8,
			},
			// Example - Second row
			{
				messageElements: {cellValue: 'bar'},
				line: 18,
				column: 4,
			},
			{
				messageElements: {cellValue: ''},
				line: 18,
				column: 8,
			}
		]);
	});

	it('tables with crazy spacing', function() {
		return runTest('table-align/crazy-spaces.feature', {}, [
			// Background - First row
			{
				messageElements: {cellValue: 'gplint'},
				line: 5,
				column: 7,
			},
			// Background - Second row
			{
				messageElements: {cellValue: 'do magic'},
				line: 6,
				column: 6,
			},
			// Step - First row
			{
				messageElements: {cellValue: 'lorem'},
				line: 10,
				column: 13,
			},
			{
				messageElements: {cellValue: 'ipsum'},
				line: 10,
				column: 26,
			},
			{
				messageElements: {cellValue: 'dolor'},
				line: 10,
				column: 52,
			},
			// Step - Second row
			{
				messageElements: {cellValue: 'foo'},
				line: 11,
				column: 7,
			},
			{
				messageElements: {cellValue: 'bar'},
				line: 11,
				column: 14,
			},
			{
				messageElements: {cellValue: 'foo bar'},
				line: 11,
				column: 24,
			},

			// Example - First row
			{
				messageElements: {cellValue: 'foo'},
				line: 17,
				column: 5,
			},
			{
				messageElements: {cellValue: 'lorem'},
				line: 17,
				column: 13,
			},
			// Example - Second row
			{
				messageElements: {cellValue: 'bar'},
				line: 18,
				column: 8,
			},
			{
				messageElements: {cellValue: ''},
				line: 18,
				column: 87,
			}
		]);
	});

	it('tables with escaped characters', function() {
		return runTest('table-align/escape.feature', {}, [
			// escaped pipes, 1st cell
			{
				messageElements: {cellValue: '\\|this'},
				line: 6,
				column: 9,
			},
			// escaped pipes, 2nd cell
			{
				messageElements: {cellValue: '\\| isn\'t \\|'},
				line: 6,
				column: 18,
			},
			// escaped pipes, 3rd cell
			{
				messageElements: {cellValue: 'aligned\\|'},
				line: 6,
				column: 32,
			},

			// backslashes, 1st cell
			{
				messageElements: {cellValue: '\\this'},
				line: 10,
				column: 9,
			},
			// backslashes, 2nd cell
			{
				messageElements: {cellValue: '\\ isn\'t \\'},
				line: 10,
				column: 17,
			},
			// backslashes, 3rd cell
			{
				messageElements: {cellValue: 'aligned\\'},
				line: 10,
				column: 30,
			},

			// escaped backslashes, 1st cell
			{
				messageElements: {cellValue: '\\\\this'},
				line: 14,
				column: 9,
			},
			// escaped backslashes, 2nd cell
			{
				messageElements: {cellValue: '\\\\ isn\'t \\\\'},
				line: 14,
				column: 18,
			},
			// escaped backslashes, 3rd cell
			{
				messageElements: {cellValue: 'aligned\\\\'},
				line: 14,
				column: 32,
			},
		]);
	});

	it('detects misalignment in tables nested under a Rule', function() {
		return runTest('table-align/rule.feature', {}, [
			// Step - First row
			{
				messageElements: {cellValue: 'lorem'},
				line: 6,
				column: 10,
			},
			{
				messageElements: {cellValue: 'ipsum'},
				line: 6,
				column: 16,
			},
			// Step - Second row
			{
				messageElements: {cellValue: 'foo'},
				line: 7,
				column: 10,
			},
			{
				messageElements: {cellValue: 'bar baz'},
				line: 7,
				column: 14,
			},
		]);
	});

	it('reports only the misaligned cell when the rest of the row is aligned', function() {
		return runTest('table-align/single-cell.feature', {}, [
			{
				messageElements: {cellValue: 'b'},
				line: 5,
				column: 14,
			},
		]);
	});

	describe('tables without spaces - config', function() {
		it('only steps', function() {
			return runTest('table-align/simple-config.feature', {examples: false}, [
				// Step - First row
				{
					messageElements: {cellValue: 'lorem'},
					line: 5,
					column: 6,
				},
				// Step - Second row
				{
					messageElements: {cellValue: '<loremipsum>'},
					line: 6,
					column: 6,
				},
			]);
		});
		it('only examples', function() {
			return runTest('table-align/simple-config.feature', {steps: false}, [
				// Example - First row
				{
					messageElements: {cellValue: 'loremipsum'},
					line: 8,
					column: 4,
				},
				// Example - Second row
				{
					messageElements: {cellValue: ''},
					line: 9,
					column: 4,
				},
			]);
		});
	});
});

describe('Table Align Rule - fix line', function() {
	it('leaves already-aligned tables untouched', function() {
		return runFixTest('table-align/aligned.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with tables aligned

  Background: This is a background
    Given step with table in background:
      | gplint   |
      | do magic |

  Scenario: This is a Scenario
    Given step with table:
      | lorem | ipsum | dolor   |
      | foo   | bar   | foo bar |
    When step without table

  Scenario Outline: This is a Scenario Outline
    Given test step <foo>
    Examples:
      | foo | lorem |
      | bar |       |
`));
	});

	it('aligns tables without spaces', function() {
		return runFixTest('table-align/no-spaces.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with tables without spaces

Background: This is a background
  Given step with table in background:
    | gplint   |
    | do magic |

Scenario: This is a Scenario
  Given step with table:
    | lorem | ipsum | dolor   |
    | foo   | bar   | foo bar |
  When step without table

Scenario Outline: This is a Scenario Outline
  Given test step <foo>
Examples:
  | foo | lorem |
  | bar |       |
`));
	});

	it('aligns tables with crazy spacing', function() {
		return runFixTest('table-align/crazy-spaces.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with tables with crazy spacing

Background: This is a background
  Given step with table in background:
    | gplint   |
    | do magic |

Scenario: This is a Scenario
  Given step with table:
    | lorem | ipsum | dolor   |
    | foo   | bar   | foo bar |
  When step without table

Scenario Outline: This is a Scenario Outline
  Given test step <foo>
Examples:
  | foo | lorem |
  | bar |       |
`));
	});

	it('aligns tables with escaped characters (escape-aware column widths)', function() {
		return runFixTest('table-align/escape.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with tables with pipe symbols

  Scenario: This is a Scenario
    Given step with escaped pipes:
      | \\|this | \\| is \\|    | aligned\\|   |
      | \\|this | \\| isn't \\| | aligned\\|   |
      | this   | \\|is\\|      | aligned too |
    And step with backslashes:
      | \\this | \\ is \\    | aligned\\    |
      | \\this | \\ isn't \\ | aligned\\    |
      | this  | \\is\\      | aligned too |
    And step with escaped backslashes:
      | \\\\this | \\\\ is \\\\    | aligned\\\\   |
      | \\\\this | \\\\ isn't \\\\ | aligned\\\\   |
      | this   | \\\\is\\\\      | aligned too |
`));
	});

	describe('respects config', function() {
		it('only rewrites steps when examples are disabled', function() {
			return runFixTest('table-align/simple-config.feature', {examples: false}, stringEOLNormalize(
				// language=gherkin
				`Feature: Feature with tables without spaces - Simple to use for config tests

Scenario Outline: This is a Scenario Outline
  Given step with table:
    | lorem        |
    | <loremipsum> |
Examples:
  |loremipsum|
  ||
`));
		});

		it('only rewrites examples when steps are disabled', function() {
			return runFixTest('table-align/simple-config.feature', {steps: false}, stringEOLNormalize(
				// language=gherkin
				`Feature: Feature with tables without spaces - Simple to use for config tests

Scenario Outline: This is a Scenario Outline
  Given step with table:
    |lorem|
    |<loremipsum>|
Examples:
  | loremipsum |
  |            |
`));
		});
	});

	it('aligns columns but preserves each row\'s original indentation', function() {
		// Indentation is the indentation rule's job; table-align only aligns
		// columns. The two rows keep their (different, odd) leading indents.
		return runFixTest('table-align/weird-indent.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with oddly-indented tables

  Scenario: This is a Scenario
    Given step with an over-indented table:
            | a   | bb |
      | ccc | d  |
`));
	});

	it('aligns tables nested under a Rule', function() {
		return runFixTest('table-align/rule.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with a Rule block

  Rule: This is a Rule
    Scenario: This is a Scenario
      Given step with table:
        | lorem | ipsum   |
        | foo   | bar baz |
`));
	});

	it('canonicalizes the whole row from a single misaligned cell, leaving aligned rows untouched', function() {
		return runFixTest('table-align/single-cell.feature', {}, stringEOLNormalize(
			// language=gherkin
			`Feature: Feature with a single misaligned cell

  Scenario: This is a Scenario
    Given step with table:
      | aa | b  |
      | a  | bb |
`));
	});

	// The escape fixture is where run()'s two splitters (escape-aware width
	// computation vs. the lookbehind used for comparison) can disagree, so it's
	// the sharpest idempotency test: re-detecting on fixed output must find nothing.
	it('produces output that re-detection finds no violations in (idempotent)', async function() {
		const config = {examples: true, steps: true};
		const {feature, pickles, file} = await linter.readAndParseFile('test/rules/table-align/escape.feature');
		rule.run({feature, pickles, file}, config).forEach(error => rule.fix(error, file));

		const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gplint-table-align-')), 'fixed.feature');
		fs.writeFileSync(tmpFile, file.lines.join(file.EOL));
		const reparsed = await linter.readAndParseFile(tmpFile);

		assert.lengthOf(rule.run(reparsed, config), 0);
	});
});
