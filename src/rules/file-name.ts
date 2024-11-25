import path from 'path';
import _ from 'lodash';

import {GherkinData, RuleSubConfig, RuleError, Documentation} from '../types.js';

export const name = 'file-name';
export const availableConfigs = {
	'style': 'PascalCase',
	'allowAcronyms': false
};

const checkers = {
	'PascalCase': filename => _.startCase(filename).replace(/ /g, ''),
	'Title Case': filename => _.startCase(filename),
	'camelCase': (filename, allowAcronyms) => {
		if (allowAcronyms) {
			const words = _.words(filename);
			const firstWord = words.shift();
			return (/^[A-Z]+$/.test(firstWord) ? firstWord : _.lowerFirst(firstWord))
				+ words.map(word => _.upperFirst(word)).join('');
		}
		return _.camelCase(filename);
	},
	'kebab-case': filename => _.kebabCase(filename),
	'snake_case': filename => _.snakeCase(filename)
} as Record<string, (filename: string, allowAcronyms?: boolean) => string>;

export function run({file}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	const {style, allowAcronyms} = _.merge(availableConfigs, configuration);
	const filename = path.basename(file.relativePath, '.feature');
	if (!Object.hasOwn(checkers, style)) {
		throw new Error(`Style "${style}" not supported for file-name rule`);
	}
	const expected = checkers[style](filename, allowAcronyms);
	if (filename === expected) {
		return [];
	}
	return [{
		message: `File names should be written in ${style} e.g. "${expected}.feature"`,
		rule: name,
		line: 0,
		column: 0
	}];
}

export const documentation: Documentation = {
	description: `Restrict feature file names to a common style.

The list of supported styles is:

* \`PascalCase\`: first letter of each word capitalized (no spaces) e.g. "MyFancyFeature.feature"
* \`Title Case\`: first letter of each word capitalized (with spaces) e.g. "My Fancy Feature.feature"
* \`camelCase\`: first letter of each word capitalized, except first e.g. "myFancyFeature.feature"
* \`kebab-case\`: all lowercase, hyphen-delimited e.g. "my-fancy-feature.feature"
* \`snake_case\`: all lowercase, underscore-delimited e.g. "my_fancy_feature.feature"`,
	fixable: false,
	configuration: [{
		name: 'style',
		type: 'string',
		description: 'The name of the desired style (see the list above).',
		default: availableConfigs.style,
		link: 'use-style-pascalcase'
	}, {
		name: 'allowAcronyms',
		type: 'boolean',
		description: 'Allow to use acronyms in capitalized form when using `camelCase` style.',
		default: availableConfigs.allowAcronyms.toString(),
		link: 'acronyms-on-camelcase'
	}],
	examples: [{
		title: 'Use Style PascalCase',
		description: 'File names must follow PascalCase pattern.',
		config: {
			[name]: ['error', {'style': 'PascalCase'}]
		}
	}, {
		title: 'Acronyms on camelCase',
		description: 'If you are using acronyms with the style `camelCase` and you want to preserve them capitalized, you can set the `allowAcronyms` property to true:',
		config: {
			[name]: ['error', {'style': 'camelCase', 'allowAcronyms': true}]
		}
	}],
};
