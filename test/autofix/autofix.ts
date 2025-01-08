import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import * as sinon from 'sinon';

import * as linter from '../../src/linter.js';
import {stringEOLNormalize} from '../_test_utils.js';

describe('Autofix', function() {
	beforeEach(function() {
		if (this.sinon == null) {
			this.sinon = sinon.createSandbox();
		} else {
			this.sinon.restore();
		}
	});

	let fsWriteFileSyncStub: sinon.SinonStubbedMember<typeof console.error>;
	beforeEach(function() {
		fsWriteFileSyncStub = this.sinon.stub(fs, 'writeFileSync');
	});

	// Use custom rule to control autofix better (and this count as a test for the custom rule with autofix logic)
	it('autofix when fix is enabled - with custom rule', async function() {
		const cwd = path.dirname(fileURLToPath(import.meta.url));
		const additionalRulesDirs = [
			path.join(cwd, 'custom_rules'), // absolute path
		];
		const featureFile = path.join(cwd, 'Violations.feature');
		const cliArgs = {
			config: path.join(cwd, '.gplintrc'),
			format: '',
			maxWarnings: 0,
			handler: () => { /* empty function */ },
			fix: true,
		};
		const results = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);

		expect(results.every(result => result.errors.length === 0)).to.be.true;

		const writeFixedFileCall = fsWriteFileSyncStub.withArgs(featureFile, sinon.match.string);

		expect(writeFixedFileCall.args[0][1]).to.equal(stringEOLNormalize(
			// language=gherkin
			`Feature: auto-fixable feature

  Scenario: Autofixable VIOLATIONS
    Given I have a file with autofixable violations
`));
	});

	it('throw error when fix is enabled - with custom rule', async function() {
		const cwd = path.dirname(fileURLToPath(import.meta.url));
		const additionalRulesDirs = [
			path.join(cwd, 'custom_rules'), // absolute path
		];
		const featureFile = path.join(cwd, 'Violations.feature');
		const cliArgs = {
			config: path.join(cwd, '.gplintrc'),
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

		expect(fsWriteFileSyncStub.neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
	});

	it('do not call fix when there are no violations', async function() {
		const cwd = path.dirname(fileURLToPath(import.meta.url));
		const additionalRulesDirs = [
			path.join(cwd, 'custom_rules'), // absolute path
		];
		const featureFile = path.join(cwd, 'NoViolations.feature');
		const cliArgs = {
			config: path.join(cwd, '.gplintrc'),
			format: '',
			maxWarnings: 0,
			handler: () => { /* empty function */ },
			fix: false,
		};
		const results = await linter.lintInit([featureFile], cliArgs, additionalRulesDirs);
		expect(results.every(result => result.errors.length === 0)).to.be.true;

		expect(fsWriteFileSyncStub.neverCalledWithMatch(featureFile, sinon.match.string)).to.be.true;
	});
});
