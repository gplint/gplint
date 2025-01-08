import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import mockFs from 'mock-fs';
import * as sinon from 'sinon';

import * as linter from '../../src/linter.js';
import {stringEOLNormalize} from '../_test_utils.js';

describe('Autofix', function() {
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

		if (this.sinon == null) {
			this.sinon = sinon.createSandbox();
		} else {
			this.sinon.restore();
		}
	});

	let fsWriteFileSyncSpy: sinon.SinonSpiedMember<typeof console.error>;
	beforeEach(function() {
		fsWriteFileSyncSpy = this.sinon.spy(fs, 'writeFileSync');
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

		const writeFixedFileCall = fsWriteFileSyncSpy.withArgs(featureFile, sinon.match.string);

		expect(writeFixedFileCall.args[0][1]).to.equal(stringEOLNormalize(
			// language=gherkin
			`Feature: auto-fixable feature

  Scenario: Autofixable VIOLATIONS
    Given I have a file with autofixable violations
`));
		// Call again to confirm autofix was applied, also reset spy history
		fsWriteFileSyncSpy.resetHistory();
		const results2 = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);
		expect(results2.every(result => result.errors.length === 0)).to.be.true;

		expect(fsWriteFileSyncSpy.neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
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

		expect(fsWriteFileSyncSpy.neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
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

		expect(fsWriteFileSyncSpy.neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
	});
});
