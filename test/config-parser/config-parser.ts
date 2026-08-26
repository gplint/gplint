import {expect} from 'chai';
import mockFs from 'mock-fs';
import * as sinon from 'sinon';
import * as configParser from '../../src/config-parser.js';
import { SinonSpy } from 'sinon';
import {CliArgs} from '../../src/cli/commands/main.js';

describe('Configuration parser', function() {
	beforeEach(function() {
		if (this.sinon == null) {
			this.sinon = sinon.createSandbox();
		} else {
			this.sinon.restore();
		}
	});

	let consoleErrorStub: sinon.SinonStubbedMember<typeof console.error>;
	let processExitStub: sinon.SinonStubbedMember<typeof process.exit>;
	beforeEach(function() {
		consoleErrorStub = this.sinon.stub(console, 'error');
		processExitStub = this.sinon.stub(process, 'exit');
	});

	afterEach(function() {
		consoleErrorStub.restore();
		processExitStub.restore();
		mockFs.restore();
	});

	describe('early exits with a non 0 exit code when', function() {
		it('the specified config file doesn\'t exit', async function() {
			const configFilePath = './non/existing/path';
			await configParser.getConfiguration({config: configFilePath} as CliArgs);

			const consoleErrorArgs = consoleErrorStub.args.map((args) => args[0] as string);
			expect(consoleErrorArgs[0]).to.include(`Could not find config file "${configFilePath}" in the working directory`);
			expect(processExitStub.args[0][0]).to.equal(1);
		});

		it('no config file has been specified and default config file doesn\'t exist', async function() {
			mockFs({});
			await configParser.getConfiguration();

			const consoleErrorArgs = consoleErrorStub.args.map((args) => args[0] as string);

			expect(consoleErrorArgs[0]).to.include('Could not find config file ".gplintrc" in the working directory');
			expect(processExitStub.args[0][0]).to.equal(1);
		});

		it('a bad configuration file is used', async function() {
			const configFilePath = 'test/config-parser/bad_config.gplintrc';
			await configParser.getConfiguration({config: configFilePath} as CliArgs);

			const consoleErrorArgs = consoleErrorStub.args.map((args) => args[0] as string);

			expect(consoleErrorArgs[0]).to.include('Error(s) in configuration file:');
			expect(processExitStub.args[0][0]).to.equal(1);
		});

		it('configuration file with invalid syntax is used', async function() {
			const configFilePath = 'test/config-parser/syntax-invalid.gplintrc';
			await configParser.getConfiguration({config: configFilePath} as CliArgs);

			const consoleErrorArgs = consoleErrorStub.args.map((args) => args[0] as string);

			expect(consoleErrorArgs[0]).to.include('Unable to parse file, be sure its in JSON format.');
			expect(processExitStub.args[0][0]).to.equal(1);
		});

		it('a good configuration file is used but ruleOverwrite sets a rule that doesn\'t exist', async function() {
			const configFilePath = 'test/config-parser/good_config.gplintrc';
			const cliRuleOverwrite = [
				'invalid-rule=error',
			];

			await configParser.getConfiguration({config: configFilePath, ruleOverwrite: cliRuleOverwrite} as CliArgs);

			const consoleErrorArgs = consoleErrorStub.args.map((args) => args[0] as string);

			expect(consoleErrorArgs[1]).to.include('Rule "invalid-rule" does not exist');
			expect(processExitStub.args[0][0]).to.equal(1);
		});
	});

	describe('doesn\'t exit with exit code 1 when', function() {
		it('a good configuration file is used', async function() {
			const configFilePath = 'test/config-parser/good_config.gplintrc';
			const parsedConfig = await configParser.getConfiguration({config: configFilePath} as CliArgs);
			sinon.assert.neverCalledWith(process.exit as SinonSpy<[number], never>, 1);
			expect(parsedConfig).to.deep.eq({'no-files-without-scenarios': 'off'});
		});

		it('a good configuration file is used that includes comments', async function() {
			const configFilePath = 'test/config-parser/good_config_with_comments.gplintrc';
			const parsedConfig = await configParser.getConfiguration({config: configFilePath} as CliArgs);
			sinon.assert.neverCalledWith(process.exit as SinonSpy<[number], never>, 1);
			expect(parsedConfig).to.deep.eq({'no-files-without-scenarios': 'off'});
		});

		it('the default configuration file is found', async function() {
			mockFs({
				'.gplintrc': '{}',
			});

			await configParser.getConfiguration();
			sinon.assert.neverCalledWith(process.exit as SinonSpy<[number], never>, 1);
		});

		describe('use ruleOverwrite from command line', function() {
			it('when ruleOverwrite with level is specified in the command line', async function() {
				const configFilePath = 'test/config-parser/good_config.gplintrc';
				const cliRuleOverwrite = [
					'no-files-without-scenarios=error',
				];

				const parsedConfig = await configParser.getConfiguration({config: configFilePath, ruleOverwrite: cliRuleOverwrite} as CliArgs);

				sinon.assert.neverCalledWith(process.exit as SinonSpy<[number], never>, 1);

				expect(parsedConfig).to.deep.eq({'no-files-without-scenarios': 'error'});
			});

			it('when ruleOverwrite with level and options is specified in the command line', async function() {
				const configFilePath = 'test/config-parser/good_config_complex.gplintrc';
				const cliRuleOverwrite = [
					'no-files-without-scenarios=error',
					'table-align=error,{"examples": true, "steps": false}',
					'allow-all-caps=error,{"ExampleHeader": false, "ExampleBody": null, "Background": true}',
					'no-superfluous-tags=error',
				];

				const parsedConfig = await configParser.getConfiguration({config: configFilePath, ruleOverwrite: cliRuleOverwrite} as CliArgs);

				sinon.assert.neverCalledWith(process.exit as SinonSpy<[number], never>, 1);

				expect(parsedConfig).to.deep.eq({
					'no-files-without-scenarios': 'error', // Overwritten from 'off' to 'error'
					'table-align': ['error', {examples: true, steps: false}], // Overwritten from 'off' to 'error' with options
					'allow-all-caps': [ // Overwritten from 'off' to 'error' with options
						'error',
						{
							Global: false,
							Background: true,
							Description: true,
							ExampleHeader: false,
							ExampleBody: null,
						}
					],
					'file-name': [ // Not overwritten
						'error',
						{
							style: 'PascalCase'
						}
					],
					'no-superfluous-tags': 'error', // Added, not present in the config file
				});
			});
		});
	});
});
