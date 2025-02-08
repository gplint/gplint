import * as gherkinUtils from './utils/gherkin.js';
import {featureSpread} from './utils/gherkin.js';
import _ from 'lodash';
import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';
import {Location, StepKeywordType} from '@cucumber/messages';

export const name = 'max-keywords';
export const availableConfigs = {
	given: -1,
	when: -1,
	then: -1,
	onlyContiguous: false,
};

type KeywordList = 'given' | 'when' | 'then';

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}
	const mergedConfiguration = _.merge({}, availableConfigs, configuration);
	const errors = [] as RuleError[];

	const {children} = featureSpread(feature);

	children.forEach(child => {
		const node = child.background ?? child.scenario;

		const keywordStepsCount: [KeywordList, Location, number][] = [];
		let lastKeyword: string;
		node.steps.forEach((step) => {
			const keyword = gherkinUtils.getLanguageInsensitiveKeyword(
				step,
				feature.language,
			) as KeywordList;
			if ([StepKeywordType.CONJUNCTION, StepKeywordType.UNKNOWN].includes(step.keywordType) ) {
				if (lastKeyword == null) {
					return;
				}

				(mergedConfiguration.onlyContiguous
					? keywordStepsCount[keywordStepsCount.length - 1]
					: keywordStepsCount.find(d => d[0] === lastKeyword))[2]++;
			} else if (lastKeyword === keyword) {
				(mergedConfiguration.onlyContiguous
					? keywordStepsCount[keywordStepsCount.length - 1]
					: keywordStepsCount.find(d => d[0] === lastKeyword))[2]++;
			} else {
				lastKeyword = keyword;
				if (mergedConfiguration.onlyContiguous) {
					keywordStepsCount.push([keyword, step.location, 1]);
				} else {
					const prevKeywordData = keywordStepsCount.find(d => d[0] === keyword);

					if (prevKeywordData) {
						prevKeywordData[2]++;
					} else {
						keywordStepsCount.push([keyword, step.location, 1]);
					}
				}
			}
		});

		for (const [keyword, location, count] of keywordStepsCount) {
			const maxAllowed = mergedConfiguration[keyword];
			if (maxAllowed !== -1 && count > maxAllowed) {
				errors.push(createError(keyword, location, count, maxAllowed, mergedConfiguration.onlyContiguous));
			}
		}

	});

	return errors;
}

function createError(keyword: string, location: Location, count: number, expected: number, contiguous: boolean): RuleError {
	return {
		message: `There are too many${contiguous ? ' contiguous ': ' '}steps for "${keyword}". Found ${count}, maximum allowed ${expected}.`,
		rule: name,
		line: location.line,
		column: location.column,
	};
}

export const documentation: Documentation = {
	description: 'Allow to limit the amount of steps of the specified keywords. The keywords `And`, `But`, or `*` counts as the previous keyword.',
	configuration: [{
		name: 'given',
		type: 'number',
		description: 'Max allowed steps for Given. 0 means is not allowed and a negative value (or undefined) means unlimited.',
		default: availableConfigs.given.toString(),
	}, {
		name: 'when',
		type: 'number',
		description: 'Max allowed steps for When. 0 means is not allowed and a negative value (or undefined) means unlimited.',
		default: availableConfigs.when.toString(),
	}, {
		name: 'then',
		type: 'number',
		description: 'Max allowed steps for Then. 0 means is not allowed and a negative value (or undefined) means unlimited.',
		default: availableConfigs.then.toString(),
	}, {
		name: 'onlyContiguous',
		type: 'boolean',
		description: 'If true, only counts contiguous steps, resetting the limit if another keyword is used.',
		default: availableConfigs.onlyContiguous.toString(),
	}],
	examples: [{
		title: 'Limit `When` to 1 occurrence',
		description: '`When` is limited to one occurrence. `Given` and `Then` are not defined, which means there are no limit for them.',
		config: {
			[name]: ['error', {
				'when': 1,
			}],
		},
	}, {
		title: 'Limit `When` to 3 occurrence, and Given to 1',
		description: '`Given` is limited to one occurrence, and `When` is limited to three occurrences. `Then` is not defined, which means there is no limit for it.',
		config: {
			[name]: ['error', {
				'given': 1,
				'when': 3,
			}],
		},
	}, {
		title: 'Forbid the use of `Given` step',
		description: 'Do not allow to use the step `Given`.',
		config: {
			[name]: ['error', {
				'given': 0,
			}],
		},
	}, {
		title: 'Limit `When` to 1 when are pu together.',
		description: 'Limit `When` to 1, but only if there are not other keywords between.',
		config: {
			[name]: ['error', {
				'when': 1,
				'onlyContiguous': true,
			}],
		},
	}],
};
