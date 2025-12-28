import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import mockFs from 'mock-fs';
import * as sinon from 'sinon';

import * as linter from '../../src/linter.js';
import { applySafeEdits } from '../../src/rules/utils/fix/index.js';
import { FileData } from '../../src/types.js';

import {stringEOLNormalize} from '../_test_utils.js';

describe('Autofix', function() {
	describe('functions logic', function() {
		describe('applySafeEdits', () => {
			it('applies valid edits in the correct order', () => {
				const file: FileData = {
					lines: ['line1', 'line2', 'line3'],
					textEdits: [
						{ startLine: 0, startCol: 0, endLine: 0, endCol: 5, text: 'LineOne' },
						{ startLine: 1, startCol: 0, endLine: 1, endCol: 5, text: 'LineTwo' },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['LineOne', 'LineTwo', 'line3']);
				expect(result.applied.length).to.be.equal(2);
				expect(result.ignored.length).to.be.equal(0);
			});

			it('ignores edits with invalid coordinates', () => {
				const file: FileData = {
					lines: ['line1', 'line2', 'line3'],
					textEdits: [
						{ startLine: -1, startCol: 0, endLine: 0, endCol: 5, text: 'Invalid' },
						{ startLine: 1, startCol: 0, endLine: 1, endCol: 5, text: 'Valid' },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['line1', 'Valid', 'line3']);
				expect(result.applied.length).to.be.equal(1);
				expect(result.ignored.length).to.be.equal(1);
				expect(result.ignored[0].reason).to.be.equal('invalid coordinates');
			});

			it('ignores overlapping edits', () => {
				const file: FileData = {
					lines: ['line1', 'line2', 'line3'],
					textEdits: [
						{ startLine: 0, startCol: 0, endLine: 0, endCol: 5, text: 'Edit1' },
						{ startLine: 0, startCol: 3, endLine: 0, endCol: 5, text: 'Edit2' },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['linEdit2', 'line2', 'line3']);
				expect(result.applied.length).to.be.equal(1);
				expect(result.ignored.length).to.be.equal(1);
				expect(result.ignored[0].reason).to.be.equal('overlaps with already applied edit');
			});

			it('validates expectedOriginal and ignores mismatched edits', () => {
				const file: FileData = {
					lines: ['line1', 'line2', 'line3'],
					textEdits: [
						{ startLine: 0, startCol: 0, endLine: 0, endCol: 5, text: 'Edit1', expectedOriginal: 'line1' },
						{ startLine: 1, startCol: 0, endLine: 1, endCol: 5, text: 'Edit2', expectedOriginal: 'wrong' },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['Edit1', 'line2', 'line3']);
				expect(result.applied.length).to.be.equal(1);
				expect(result.ignored.length).to.be.equal(1);
				expect(result.ignored[0].reason).to.match(/^expectedOriginal mismatch/);
			});

			it('removes empty lines marked as deletable', () => {
				const file: FileData = {
					lines: ['line1', '', 'line3'],
					textEdits: [
						{ startLine: 1, startCol: 0, endLine: 1, endCol: 0, text: '', removeIfEmptyLine: true },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['line1', 'line3']);
				expect(result.applied.length).to.be.equal(1);
				expect(result.ignored.length).to.be.equal(0);
			});

			it('does not remove empty lines not marked as deletable', () => {
				const file: FileData = {
					lines: ['line1', '', 'line3'],
					textEdits: [
						{ startLine: 1, startCol: 0, endLine: 1, endCol: 0, text: '', removeIfEmptyLine: false },
					],
					relativePath: 'test.feature',
					EOL: '\n',
				};

				const result = applySafeEdits(file);

				expect(result.lines).to.be.deep.equal(['line1', '', 'line3']);
				expect(result.applied.length).to.be.equal(1);
				expect(result.ignored.length).to.be.equal(0);
			});
		});
	});

	describe('custom rule with fix', function() {
		beforeEach(function() {
			const cwd = path.dirname(fileURLToPath(import.meta.url));

			mockFs({
				[path.join(cwd, 'custom_rules')]: mockFs.load(path.join(path.dirname(fileURLToPath(import.meta.url)), 'custom_rules'), { lazy: false}),
				'.gplintrc': JSON.stringify({
					'autofix-rule': 'error',
				}),
				'Violations.feature': stringEOLNormalize(// language=gherkin
					`Feature: AuTo-FiXaBlE FEATURE

  Scenario: Autofixable VIOLATIONS
    Given I have a file with autofixable violations
`),
				'NoViolations.feature': stringEOLNormalize(// language=gherkin
					`Feature: auto-fixable feature

  Scenario: Autofixable wihout VIOLATIONS
    Given I have a file without autofixable violations
`),

			}, {
				createCwd: true
			});
		});

		// Use custom rule to control autofix better (and this count as a test for the custom rule with autofix logic)
		it('autofix when fix is enabled - with custom rule', async function() {
			const cwd = path.dirname(fileURLToPath(import.meta.url));
			const additionalRulesDirs = [
				path.join(cwd, 'custom_rules'), // absolute path
			];
			const featureFile = path.resolve('Violations.feature');
			const cliArgs = {
				config: path.resolve('./.gplintrc'),
				format: '',
				maxWarnings: 0,
				handler: () => { /* empty function */ },
				fix: true,
			};
			const results = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);

			expect(results.every(result => result.errors.length === 0)).to.be.true;

			expect((fs.writeFileSync as sinon.SinonSpiedMember<typeof fs.writeFileSync>).calledWith(featureFile, stringEOLNormalize(
				// language=gherkin
				`Feature: auto-fixable feature

  Scenario: Autofixable VIOLATIONS
    Given I have a file with autofixable violations
`))).to.be.true;
			// Call again to confirm autofix was applied, also reset spy history
			(fs.writeFileSync as sinon.SinonSpiedMember<typeof fs.writeFileSync>).resetHistory();
			const results2 = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);
			expect(results2.every(r2 => r2.errors.length === 0)).to.be.true;

			expect((fs.writeFileSync as sinon.SinonSpiedMember<typeof fs.writeFileSync>).neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
		});

		it('throw error when fix is enabled - with custom rule', async function() {
			const cwd = path.dirname(fileURLToPath(import.meta.url));
			const additionalRulesDirs = [
				path.join(cwd, 'custom_rules'), // absolute path
			];
			const featureFile = path.resolve('Violations.feature');
			const cliArgs = {
				config: path.resolve('./.gplintrc'),
				format: '',
				maxWarnings: 0,
				handler: () => { /* empty function */ },
				fix: false,
			};
			const results = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);
			expect(results).to.deep.equal([
				{
					errors: [
						{ // This one is to make sure we don't accidentally regress and always load the default rules
							line: 1,
							column: 1,
							level: 2,
							message: 'Feature title must be lowercase',
							rule: 'autofix-rule'
						}
					],
					filePath: featureFile
				}
			]);

			expect((fs.writeFileSync as sinon.SinonSpiedMember<typeof fs.writeFileSync>).neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
		});

		it('do not call fix when there are no violations', async function() {
			const cwd = path.dirname(fileURLToPath(import.meta.url));
			const additionalRulesDirs = [
				path.join(cwd, 'custom_rules'), // absolute path
			];
			const featureFile = path.resolve('NoViolations.feature');
			const cliArgs = {
				config: path.resolve('./.gplintrc'),
				format: '',
				maxWarnings: 0,
				handler: () => { /* empty function */ },
				fix: false,
			};
			const results = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);
			expect(results.every(result => result.errors.length === 0)).to.be.true;

			expect((fs.writeFileSync as sinon.SinonSpiedMember<typeof fs.writeFileSync>).neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
		});
	});
});
