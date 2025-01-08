import path from 'path';
import { pathToFileURL, fileURLToPath } from 'node:url';

import {Feature, Pickle} from '@cucumber/messages';
import * as glob from 'glob';
import _ from 'lodash';

import {
	ErrorData,
	ErrorLevels,
	FileData,
	Rule,
	RuleConfig,
	RuleConfigArray,
	RuleErrorLevel,
	Rules,
	RulesConfig,
	RuleSubConfig,
} from './types.js';
import { RuleErrors } from './errors.js';
import os from 'node:os';
import fs from 'node:fs';

const LEVELS = [
	'off',
	'warn',
	'error',
];

export async function getAllRules(additionalRulesDirs?: string[]): Promise<Rules> {
	if ((additionalRulesDirs?.length ?? 0) > 0) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (process[Symbol.for('ts-node.register.instance')] == null) { // Check if ts-node was registered previously
			await loadRegister();
		}
	}

	const rules = {} as Rules;
	const cwd = path.dirname(fileURLToPath(import.meta.url));
	const rulesDirs = [
		path.join(cwd, 'rules')
	].concat(additionalRulesDirs ?? []);

	for (let rulesDir of rulesDirs) {
		rulesDir = path.resolve(rulesDir);
		const rulesWildcard = path.join(rulesDir, '*.?(c|m)@(j|t)s'); // .js, .cjs, .mjs (and TS equivalents)
		for (const file of glob.sync(rulesWildcard, {
			windowsPathsNoEscape: true,
			ignore: '**/*.d.?(c|m)ts'
		})) {
			const rule = await import(pathToFileURL(file).toString()) as Rule;
			rules[rule.name] = rule;
		}
	}
	return rules;
}

export async function getRule(rule: string, additionalRulesDirs?: string[]): Promise<Rule | undefined> {
	return (await getAllRules(additionalRulesDirs))[rule];
}

export async function doesRuleExist(rule: string, additionalRulesDirs?: string[]): Promise<boolean> {
	return (await getRule(rule, additionalRulesDirs)) !== undefined;
}

export function getRuleLevel(ruleConfig: RuleConfig, rule: string): ErrorLevels {
	const level = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;

	if (level == null) {
		return 0;
	}

	let levelNum = _.isNumber(level) ? level : _.toNumber(level);

	if (isNaN(levelNum)) {
		levelNum = LEVELS.indexOf(level as string);
	}

	if (levelNum < 0 || levelNum > 2) {
		throw new Error(`Unknown level ${level} for ${rule}.`);
	}

	return levelNum as ErrorLevels;
}

export async function runAllEnabledRules(
	feature?: Feature,
	pickles?: Pickle[],
	file?: FileData,
	configuration: RulesConfig = {},
	additionalRulesDirs?: string[],
	autoFix = false,
): Promise<RuleErrors> {
	let errors = [] as RuleErrorLevel[];
	const rules = await getAllRules(additionalRulesDirs);
	Object.keys(rules).forEach(ruleName => {
		const rule = rules[ruleName];
		const ruleLevel = getRuleLevel(configuration[rule.name], rule.name);

		if (ruleLevel > 0) {
			const ruleConfig = (Array.isArray(configuration[rule.name])
				? (configuration[rule.name] as RuleConfigArray)[1]
				: {} as RuleSubConfig<unknown>) as RuleConfig;
			const error = rule.run({feature, pickles, file}, ruleConfig);

			if (error.length > 0) {
				if (autoFix && rule.fix) {
					error.forEach(e => {
						rule.fix(e as ErrorData, file, ruleConfig);
					});
					fs.writeFileSync(file.relativePath, file.lines.join(os.EOL));
					// TODO regenerate pickles

				} else {
					errors = errors.concat(error.map(e => ({
						level: ruleLevel,
						...(rule.buildRuleErrors ? rule.buildRuleErrors(e as ErrorData) : e)
					} as RuleErrorLevel)));
				}
			}
		}
	});
	return new RuleErrors(errors);
}

async function loadRegister(): Promise<void> {
	try {
		const {register} = await import('ts-node');
		register({
			compilerOptions: {
				allowJs: true
			}
		});
		/* c8 ignore next 3 */
	} catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
		/* empty */
	}
}
