import fs from 'node:fs';
import _merge from 'lodash.merge';
import stripJsonComments from 'strip-json-comments';
import * as verifyConfig from './config-verifier.js';
import * as logger from './logger.js';
import {RuleConfigArray, RulesConfig} from './types.js';
import {CliArgs} from './cli/commands/main.js';

export const defaultConfigFileName = '.gplintrc';

export async function getConfiguration(args?: CliArgs, additionalRulesDirs?: string[]): Promise<RulesConfig> {
	const configPath = args?.config || defaultConfigFileName;

	try {
		const config = JSON.parse(stripJsonComments(await fs.promises.readFile(configPath, {encoding: 'utf8'}))) as RulesConfig;
		const finalConfig = (args?.ruleOverwrite || []).reduce((acc, curr) => {
			const [ruleName, ruleCfg] = curr.split('=');
			let level, options;
			if (ruleCfg.includes(',')) {
				const separator = ruleCfg.indexOf(',');
				level = ruleCfg.substring(0, separator);
				options = ruleCfg.substring(separator + 1);
			} else {
				level = ruleCfg;
			}

			if (!acc[ruleName]) {
				acc[ruleName] = null;
			}

			if (!Array.isArray(acc[ruleName])) {
				acc[ruleName] = [level] as RuleConfigArray;
			}

			if (options) {
				acc[ruleName][1] = _merge(acc[ruleName][1], JSON.parse(options));
			}

			if (acc[ruleName].length === 1) {
				acc[ruleName] = level;
			}

			return acc;
		}, config);

		const errors = await verifyConfig.verifyConfigurationFile(finalConfig, additionalRulesDirs);

		if (errors.length > 0) {
			logger.boldError('Error(s) in configuration file:');
			errors.forEach(error => {
				logger.error(`- ${error}`);
			});
			process.exit(1);
		}

		return finalConfig;
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
			logger.boldError(`Could not find config file "${configPath}" in the working directory.
To use a custom name/path provide the config file using the "-c" arg.`);
		} else {
			logger.boldError(`Unable to parse file, be sure its in JSON format. ${(e as Error).message}`);
		}
		return process.exit(1);
	}
}
