import * as rules from './rules.js';
import { Rule, RuleConfig, RulesConfig, RuleSubConfig } from './types.js';

export async function verifyConfigurationFile(config: RulesConfig, additionalRulesDirs?: string[]): Promise<string[]> {
	const errors = [];
	for (const rule in config) {
		if (!(await rules.doesRuleExist(rule, additionalRulesDirs))) {
			errors.push(`Rule "${rule}" does not exist`);
		} else {
			await verifyRuleConfiguration(rule, config[rule], additionalRulesDirs, errors);
		}
	}
	return errors;
}

async function verifyRuleConfiguration(rule: string, ruleConfig: RuleConfig, additionalRulesDirs: string[], errors: string[]): Promise<void> {
	const enablingSettings = ['off', '0', 'warn', '1', 'error', 'on', '2'];
	const genericErrorMsg = `Invalid rule configuration for "${rule}" -`;

	if (Array.isArray(ruleConfig)) {
		if (!enablingSettings.includes(ruleConfig[0] as string)) {
			errors.push(`${genericErrorMsg} The first part of the config should be ${enablingSettings.join('/')}.`);
		}

		if (ruleConfig.length !== 2) {
			errors.push(`${genericErrorMsg} The config should only have 2 parts.`);
		}

		const ruleObj = await rules.getRule(rule, additionalRulesDirs);
		let isValidSubConfig;

		if (typeof (ruleConfig[1]) === 'string') {
			isValidSubConfig = (_: unknown, subConfig: string): boolean => (ruleObj?.availableConfigs as string[]).includes(subConfig);
			await testSubconfig(genericErrorMsg, rule, ruleConfig[1], isValidSubConfig, additionalRulesDirs, errors);
		} else {
			isValidSubConfig = (_: unknown, subConfig: RuleSubConfig<string>): boolean => ruleObj?.availableConfigs != null
				&& Object.hasOwn(ruleObj.availableConfigs, subConfig);
			for (const subConfig in ruleConfig[1]) {
				await testSubconfig(genericErrorMsg, rule, subConfig, isValidSubConfig, additionalRulesDirs, errors);
			}
		}
	} else if (ruleConfig != null && !enablingSettings.includes(ruleConfig.toString())) {
		errors.push(`${genericErrorMsg} The config should be ${enablingSettings.join('/')}.`);
	}
}

async function testSubconfig(genericErrorMsg: string, rule: string, subConfig: RuleSubConfig<unknown>, isValidSubConfig: (availableConfigs: Rule['availableConfigs'], subConfig: RuleSubConfig<unknown>) => boolean, additionalRulesDirs: string[], errors: string[]): Promise<void> {
	const ruleObj = await rules.getRule(rule, additionalRulesDirs);
	if (!isValidSubConfig(ruleObj?.availableConfigs, subConfig)) {
		errors.push(`${genericErrorMsg} The rule does not have the specified configuration option "${subConfig as string}"`);
	}
}
