import { fileURLToPath } from 'node:url';
import * as path from 'path';
import {expect} from 'chai';
import * as linter from '../../src/linter.js';

describe('rulesdir CLI option', function() {
	it('loads additional rules from specified directories', async function() {
		this.timeout(20_000); // TODO Check why needs a lot of time sometimes
		const cwd = path.dirname(fileURLToPath(import.meta.url));
		const additionalRulesDirs = [
			path.join(cwd, 'rules'), // absolute path
			path.join('test', 'rulesdir', 'other_rules') // relative path from root
		];
		const featureFile = path.join(cwd, 'simple.feature');
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
						column: 5,
						level: 2,
						message: 'Wrong indentation for "Feature", expected indentation level of 0, but got 4',
						rule: 'indentation'
					},
					{
						line: 109,
						column: 27,
						level: 2,
						message: 'Another custom-list error',
						rule: 'another-custom-list'
					},
					{
						line: 123,
						column: 21,
						level: 2,
						message: 'Custom error',
						rule: 'custom'
					},
					{
						line: 456,
						column: 23,
						level: 2,
						message: 'Another custom error',
						rule: 'another-custom'
					}
				],
				filePath: featureFile
			}
		]);
	});

	it('loads additional rules from specified directories written in TS', async function() {
		this.timeout(20_000); // TODO Check why needs a lot of time sometimes
		const cwd = path.dirname(fileURLToPath(import.meta.url));
		const additionalRulesDirs = [
			path.join('test', 'rulesdir', 'ts-rules') // relative path from root
		];
		const featureFile = path.join(cwd, 'simple.feature');
		const cliArgs = {
			config: path.join(cwd, '.gplintrc-ts'),
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
						column: 5,
						level: 2,
						message: 'Wrong indentation for "Feature", expected indentation level of 0, but got 4',
						rule: 'indentation'
					},
					{
						line: 123,
						column: 21,
						level: 2,
						message: 'Custom error on custom-ts rule',
						rule: 'custom-ts'
					},
				],
				filePath: featureFile
			}
		]);
	});
});
