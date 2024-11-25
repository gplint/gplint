import {Documentation, GherkinData, RuleError} from '../types.js';

export const name = 'no-dupe-feature-names';
const features = {} as Record<string, {files: string[]}>;

export function run({feature, file}: GherkinData): RuleError[] {
	if (!feature) {
		return [];
	}
	const errors = [] as RuleError[];
	if (feature.name in features) {
		const dupes = features[feature.name].files.join(', ');
		features[feature.name].files.push(file.relativePath);
		errors.push({
			message: `Feature name is already used in: ${dupes}`,
			rule   : name,
			line   : feature.location.line,
			column : feature.location.column,
		});
	} else {
		features[feature.name] = {files: [file.relativePath]};
	}

	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows duplicate Feature names.',
	fixable: false,
	examples: [{
		title: 'Example',
		description: 'Enable rule',
		config: {
			[name]: 'error',
		}
	}],
};
