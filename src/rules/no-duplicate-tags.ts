import {Location} from '@cucumber/messages';
import {Documentation, ErrorData, FileData, GherkinData, GherkinTaggable, RuleError} from '../types.js';
import {featureSpread} from './utils/gherkin.js';

export const name = 'no-duplicate-tags';

interface NoDuplicateTagsErrorData extends ErrorData {
	tagName: string,
}

export function run({feature}: GherkinData): NoDuplicateTagsErrorData[] {
	if (!feature) {
		return [];
	}
	const errors = [] as NoDuplicateTagsErrorData[];

	verifyTags(feature, errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		verifyTags(rule, errors);
	});

	children.forEach(child => {
		if (child.scenario) {
			verifyTags(child.scenario, errors);
			child.scenario.examples.forEach(example => {
				verifyTags(example, errors);
			});
		}
	});
	return errors;
}

/**
 * When removing a duplicate tag, also remove a single adjacent separator
 * (space or tab) if present to avoid leaving extra spacing between tags.
 */
export function fix(error: NoDuplicateTagsErrorData, file: FileData): void {
	const fileLine = error.location.line - 1;
	const startCol = error.location.column - 2; // Move back to include the '@' and the space before it
	const endCol = startCol + error.tagName.length;

	file.textEdits.push({
		startLine: fileLine,
		startCol,
		endLine: fileLine,
		endCol,
		text: '',
		expectedOriginal: error.tagName,
		removeIfEmptyLine: true,
	});
}

function verifyTags(node: GherkinTaggable, errors: NoDuplicateTagsErrorData[]) {
	node.tags.reduce<Record<string, Location>>((acc, cur) => {
		if (acc[cur.name] == null) {
			acc[cur.name] = cur.location;
		} else {
			errors.push({
				location: cur.location,
				tagName : cur.name,
			});
		}

		return acc;
	}, {});
}

export function buildRuleErrors(error: NoDuplicateTagsErrorData): RuleError {
	return {
		message: `Duplicate tags are not allowed: ${error.tagName}`,
		rule   : name,
		line   : error.location.line,
		column : error.location.column,
	};
}

export const documentation: Documentation = {
	description: 'Disallows duplicate tags on the same Feature or Scenario.',
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
