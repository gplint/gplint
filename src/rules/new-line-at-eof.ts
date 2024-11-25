import _ from 'lodash';
import * as logger from './../logger.js';
import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';

export const name = 'new-line-at-eof';
export const availableConfigs = [
	'yes',
	'no',
];

export function run({file}: GherkinData, configuration: RuleSubConfig<string>): RuleError[] {
	const errors = [] as RuleError[];
	if (_.indexOf(availableConfigs, configuration) === -1) {
		logger.boldError(`${name} requires an extra configuration value.\nAvailable configurations: ${availableConfigs.join(', ')}\nFor syntax please look at the documentation.`);
		process.exit(1);
	}

	const hasNewLineAtEOF = _.last(file.lines) === '';
	let errormsg = '';
	if (hasNewLineAtEOF && configuration === 'no') {
		errormsg = 'New line at EOF (end of file) is not allowed';
	} else if (!hasNewLineAtEOF && configuration === 'yes') {
		errormsg = 'New line at EOF (end of file) is required';
	}

	if (errormsg !== '') {
		errors.push({
			message: errormsg,
			rule: name,
			line: file.lines.length,
			column: 0,
		});
	}

	return errors;
}

export const documentation: Documentation = {
	description: 'Disallows/enforces new line at EOF.',
	fixable: false,
	configuration: [{
		name: 'yes',
		description: 'Force new line at EOF.',
		link: 'enforces-new-line-at-eof',
	}, {
		name: 'no',
		description: 'Force no new line at EOF.',
		link: 'disallows-new-line-at-eof',
	}],
	examples: [{
		title: 'Enforces new line at EOF',
		description: 'Set config to "yes"',
		config: {
			[name]: ['error', 'yes'],
		},
	}, {
		title: 'Disallows new line at EOF',
		description: 'Set config to "no"',
		config: {
			[name]: ['error', 'no'],
		},
	}],
};
