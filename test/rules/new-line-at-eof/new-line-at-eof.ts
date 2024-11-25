import {expect} from 'chai';
import * as sinon from 'sinon';

import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/new-line-at-eof.js';
import {FileData, RuleSubConfig} from '../../../src/types.js';

const runTestRequireNewLine = ruleTestBase.createRuleTest(rule, 'New line at EOF (end of file) is required');
const runTestDisallowNewLine = ruleTestBase.createRuleTest(rule, 'New line at EOF (end of file) is not allowed');

describe('New Line at EOF Rule', function() {
	beforeEach(function() {
		if (this.sinon == null) {
			this.sinon = sinon.createSandbox();
		} else {
			this.sinon.restore();
		}
	});

	describe('configuration', function() {
		let consoleErrorStub: sinon.SinonStubbedMember<typeof console.error>;
		let processExitStub: sinon.SinonStubbedMember<typeof process.exit>;
		beforeEach(function() {
			consoleErrorStub = this.sinon.stub(console, 'error');
			processExitStub = this.sinon.stub(process, 'exit');
		});

		afterEach(function() {
			consoleErrorStub.restore();
			processExitStub.restore();
		});

		it('raises an error if invalid configuration is used', function() {
			const fileStub = {relativePath: './foo.feature', lines: []} as FileData;
			const invalidConfiguration = 'k' as RuleSubConfig<string>;

			rule.run({feature: undefined, file: fileStub}, invalidConfiguration);
			const consoleErrorArgs = consoleErrorStub.args.map((args: string[]) => args[0]);

			const errorMsg = 'new-line-at-eof requires an extra configuration value.\nAvailable configurations: yes, no\nFor syntax please look at the documentation.';
			expect(consoleErrorArgs[0]).to.include(errorMsg);
			expect(processExitStub.args[0][0]).to.equal(1);
		});
	});

	it('doesn\'t raise errors when the rule is configured to "yes" and there is a new line at EOF', function() {
		return runTestRequireNewLine('new-line-at-eof/NewLineAtEOF.feature', 'yes', []);
	});

	it('doesn\'t raise errors when the rule is configured to "no" and there is no new line at EOF', function() {
		return runTestDisallowNewLine('new-line-at-eof/NoNewLineAtEOF.feature', 'no', []);
	});

	it('raises an error when the rule is configured to "yes" and there is no new line at EOF', function() {
		return runTestRequireNewLine('new-line-at-eof/NoNewLineAtEOF.feature', 'yes', [{
			messageElements: {},
			line: 5,
			column: 0
		}]);
	});

	it('doesn\'t raise errors when the rule is configured to "no" and there is a new line at EOF', function() {
		return runTestDisallowNewLine('new-line-at-eof/NewLineAtEOF.feature', 'no', [{
			messageElements: {},
			line: 6,
			column: 0
		}]);
	});
});
