import os from 'os';
import _ from 'lodash';
import * as logger from './../logger.js';
import {Documentation, ErrorData, FileData, GherkinData, RuleError, RuleSubConfig} from '../types.js';

export const name = 'new-line-at-eof';
export const availableConfigs = [
	'yes',
	'no',
];

type NewLineAtEofErrorData = ErrorData

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

export function fix(error: NewLineAtEofErrorData, file: FileData, configuration: RuleSubConfig<string>): void {
	if (configuration === 'yes') {
		const newLineIndex = Math.max(0, file.lines.length - 1);
		const lastLine = file.lines[newLineIndex] ?? '';
		const col = lastLine.length;

		file.textEdits.push({
			startLine: newLineIndex,
			startCol: col,
			endLine: newLineIndex,
			endCol: col,
			text: os.EOL,
			removeIfEmptyLine: false,
		});
	} else if (configuration === 'no') {
		let i = file.lines.length - 1;
		while (i >= 0 && file.lines[i] === '') i--;
		const firstToRemove = i + 1;
		if (firstToRemove <= file.lines.length - 1) {
			const endIndex = file.lines.length - 1;
			const endCol = file.lines[endIndex].length;

			file.textEdits.push({
				startLine: firstToRemove,
				startCol: 0,
				endLine: endIndex,
				endCol,
				text: '',
				removeIfEmptyLine: true,
			});
		}
	}
}

export const documentation: Documentation = {
	description: 'Disallows/enforces new line at EOF.',
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
