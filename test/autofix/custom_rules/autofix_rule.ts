import { ErrorData, FileData, GherkinData, RuleError } from '../../../src/types.js';
import { Feature } from '@cucumber/messages';
import {replaceNodeText} from '../../../src/rules/utils/fix/helpers.js';

export const name = 'autofix-rule';

interface AutofixRuleErrorData extends ErrorData {
	node: Feature
}

// This custom rule finds uppercase in Feature title, and covert it to lowercase if fix is enabled
export function run({ feature }: GherkinData): AutofixRuleErrorData[] {
	if (!feature) {
		return [];
	}

	const errors = [] as AutofixRuleErrorData[];

	// Find uppercase
	if (feature.name !== feature.name.toLowerCase()) {
		errors.push({
			location: feature.location,
			node: feature,
		});
	}

	return errors;
}

export function buildRuleErrors(error: AutofixRuleErrorData): RuleError {
	return {
		message: 'Feature title must be lowercase',
		rule: name,
		line: error.location.line,
		column: error.location.column,
	};
}

export function fix(error: AutofixRuleErrorData, file: FileData): void {
	replaceNodeText(error, file, `${error.node.keyword}: ${error.node.name.toLowerCase()}`);
}

