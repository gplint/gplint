import * as gherkinUtils from './utils/gherkin.js';
import {featureSpread} from './utils/gherkin.js';
import _ from 'lodash';
import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';
import {Scenario, Step} from '@cucumber/messages';

export const name = 'keywords-in-logical-order';
export const availableConfigs = {
	'detectMissingKeywords': false,
};

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}
	const mergedConfiguration = _.merge({}, availableConfigs, configuration);
	const {detectMissingKeywords} = mergedConfiguration;
	const errors = [] as RuleError[];

	const {children} = featureSpread(feature);

	children.forEach(child => {
		const node = child.background ?? child.scenario;
		const keywordList = ['given', 'when', 'then'];

		let maxKeywordPosition = 0;
		const existsKeyword: Record<string, boolean> = {
			given: false,
			when: false,
			then: false,
		};
		node.steps.forEach((step) => {
			const keyword = gherkinUtils.getLanguageInsensitiveKeyword(
				step,
				feature.language,
			);
			const keywordPosition = keywordList.indexOf(keyword);

			if (keywordPosition === -1) {
				//   not found
				return;
			}

			if (keywordPosition < maxKeywordPosition) {
				const maxKeyword = keywordList[maxKeywordPosition];
				errors.push(createError(maxKeyword, step, undefined));
			}
			existsKeyword[keywordList[keywordPosition]] = true;
			maxKeywordPosition =
				Math.max(maxKeywordPosition, keywordPosition) || keywordPosition;
		});
		if (detectMissingKeywords && child.scenario && !Object.values(existsKeyword).every((value) => value)) {
			const keys: string[] = [];
			Object.entries(existsKeyword).forEach(([key, value]) => {
				if (!value) {
					keys.push(key);
				}
			});
			errors.push(createError(keys.join(', '), undefined, child.scenario));
		}
	});

	return errors;
}

type ExclusiveParams = [Step, undefined] | [undefined, Scenario]

function createError(keyword: string, ...[step, scenario]: ExclusiveParams) {
	let message, node;
	if (scenario != null) {
		message = `The scenario "${scenario.name}" does not have the following keywords: ${keyword}`;
		node = scenario;
	} else {
		message = `Step "${step.keyword}${step.text}" should not appear after step using keyword ${keyword}`;
		node = step;
	}

	return {
		message,
		rule: name,
		line: node.location.line,
		column: node.location.column,
	};
}

export const documentation: Documentation = {
	description: 'Allows the user to maintain the wording order by using the scenario keywords, following the `Given`, `When`, `Then` sequence.',
	fixable: false,
	configuration: [{
		name: 'detectMissingKeywords',
		type: 'boolean',
		description: 'Whether to ignore the lack of some keyword that violates the structure.',
		default: availableConfigs.detectMissingKeywords.toString(),
	}],
	examples: [{
		title: 'Don\'t detect missing keywords',
		description: 'Enable rule, without reporting missing keywords (Default behaviour).',
		config: {
			[name]: ['error', {
				'detectMissingKeywords': false,
			}],
		},
	}, {
		title: 'Detect missing keywords',
		description: 'Enable rule, reporting missing keywords.',
		config: {
			[name]: ['error', {
				'detectMissingKeywords': true,
			}],
		},
	}],
};
