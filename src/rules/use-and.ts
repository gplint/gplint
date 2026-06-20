import * as gherkinUtils from './utils/gherkin.js';
import {Documentation, ErrorData, FileData, GherkinData, RuleError} from '../types.js';
import {featureSpread} from './utils/gherkin.js';
import {replaceNodeTextByRange} from './utils/fix/helpers.js';

export const name = 'use-and';

interface UseAndErrorData extends ErrorData {
	keyword: string,
}

export function run({feature}: GherkinData): UseAndErrorData[] {
	if (!feature) {
		return [];
	}

	const errors = [] as UseAndErrorData[];

	featureSpread(feature).children.forEach(child => {
		const node = child.background ?? child.scenario;
		let previousKeyword = undefined as string;

		node.steps.forEach(step => {
			const keyword = gherkinUtils.getLanguageInsensitiveKeyword(step, feature.language);

			if (keyword === 'and') {
				return;
			}
			if (keyword === previousKeyword) {
				errors.push({
					location: step.location,
					keyword: step.keyword,
				});
			}

			previousKeyword = keyword;
		});

	});
	return errors;
}

export function fix(error: UseAndErrorData, file: FileData): void {
	const startCol = error.location.column - 1;

	replaceNodeTextByRange(error, file, 'And ', startCol, startCol + error.keyword.length);
}

export function buildRuleErrors(error: UseAndErrorData): RuleError {
	return {
		message: `Repeated successive "${error.keyword}" is not allowed. Replace with "And".`,
		rule: name,
		line: error.location.line,
		column: error.location.column,
	};
}

export const documentation: Documentation = {
	description: 'Disallows repeated successive step keywords, requiring the use of `And` instead.',
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
