import fs from 'fs';
import _ from 'lodash';
import {Feature, ParseError, Pickle, Envelope} from '@cucumber/messages';
import {GherkinStreams} from '@cucumber/gherkin-streams';

import * as logger from './logger.js';
import * as rules from './rules.js';
import {
	Errors,
	ErrorsByFile,
	GherkinData,
	GherkinError,
	RuleError,
	RuleErrorLevel,
	RulesConfig,
} from './types.js';
import * as configParser from './config-parser.js';
import { RuleErrors } from './errors.js';
import { CliArgs } from './cli/commands/main.js';

export async function readAndParseFile(filePath: string): Promise<GherkinData> {
	let feature: Feature;
	const pickles = [] as Pickle[];
	const parsingErrors = [] as ParseError[];
	let fileContent = [] as string[];
	let fileEOL = '\n';

	return new Promise((resolve, reject) => {
		const options = {
			includeGherkinDocument: true,
			includePickles: true,
			includeSource: true,
		};

		const stream = GherkinStreams.fromPaths([filePath], options);

		stream.on('data', (envelope: Envelope) => {
			if (envelope.parseError) {
				parsingErrors.push(envelope.parseError);
			} else {
				if (envelope.gherkinDocument?.feature) {
					feature = envelope.gherkinDocument.feature;
				}
				if (envelope.pickle) {
					pickles.push(envelope.pickle);
				}
				if (envelope.source) {
					fileEOL = envelope.source.data.includes('\r\n') ? '\r\n' : '\n';
					fileContent = envelope.source.data.split(fileEOL);
				}
			}
		});

		stream.on('error', data => {
			logger.error(`Gherkin emitted an error while parsing ${filePath}: ${data.message}`);
			reject(new RuleErrors(processFatalErrors([{message: data.message}])));
		});

		stream.on('end', () => {
			if (parsingErrors.length) {
				// Process all errors/attachments at once, because a tag on a background will
				// generate multiple error events, and it would be confusing to print a message for each
				// one of them, when they are all caused by a single cause
				reject(new RuleErrors(processFatalErrors(parsingErrors)));
			} else {
				const file = {
					relativePath: filePath,
					lines: fileContent,
					EOL: fileEOL,
				};
				resolve({feature, pickles, file});
			}
		});
	});
}

export async function lintInit(files: string[], args?: CliArgs, additionalRulesDirs?: string[]): Promise<ErrorsByFile[]> {
	const configuration = await configParser.getConfiguration(args.config, additionalRulesDirs);
	return lint(files, configuration, additionalRulesDirs, args.fix);
}

export async function lint(files: string[], configuration?: RulesConfig, additionalRulesDirs?: string[], autoFix?: boolean): Promise<ErrorsByFile[]> {
	const results = [] as ErrorsByFile[];

	await Promise.all(files.map(async (f) => {
		let perFileErrors: RuleErrors;

		try {
			const {feature, pickles, file} = await readAndParseFile(f);
			perFileErrors = await rules.runAllEnabledRules(feature, pickles, file, configuration, additionalRulesDirs, autoFix);
		} catch (parsingErrors) {
			if (parsingErrors instanceof RuleErrors) {
				perFileErrors = parsingErrors;
			} else {
				throw parsingErrors;
			}
		} finally {
			const fileErrors = {
				filePath: fs.realpathSync(f),
				errors: _.sortBy(perFileErrors?.getErrors(), 'line')
			} as ErrorsByFile;

			results.push(fileErrors);
		}
	}));

	return results;
}

function processFatalErrors(errors: GherkinError[]): RuleError[] {
	let errorMsgs = [] as RuleError[];
	if (errors.length > 1) {
		const result = getFormattedTaggedBackgroundError(errors);
		errors = result.errors;
		errorMsgs = result.errorMsgs;
	}
	errors.forEach((error: ParseError) => {
		errorMsgs.push(getFormattedFatalError(error));
	});
	return errorMsgs;
}

function getFormattedTaggedBackgroundError(errors: GherkinError[]): Errors {
	const errorMsgs = [] as RuleErrorLevel[];
	let index = 0;
	if (errors[0].message?.includes('got \'Background') &&
		errors[1].message?.includes('expected: #TagLine, #RuleLine, #Comment, #Empty')) {
		errorMsgs.push({
			message: 'Tags on Backgrounds are disallowed',
			rule: 'no-tags-on-backgrounds',
			line: parseInt((/\((\d+):.*/.exec(errors[0].message))?.[1] ?? '0'),
			column: 0,
			level: 2, // Force error
		});

		index = 2;
		for (let i = 2; i < errors.length; i++) {
			if (errors[i].message?.includes('expected: #TagLine, #RuleLine, #Comment, #Empty')) {
				index = i + 1;
			} else {
				/* c8 ignore next 3 */
				// IDK if this could happen, but let's keep this to be safe
				break;
			}
		}
	}
	return {errors: errors.slice(index), errorMsgs};
}

function getFormattedFatalError(error: RuleError|ParseError): RuleErrorLevel {
	const errorLine = parseInt((/\((\d+):.*/.exec(error.message))?.[1] ?? '0');
	let errorMsg;
	let rule;
	if (error.message.includes('got \'Background')) {
		errorMsg = 'Multiple "Background" definitions in the same file are disallowed';
		rule = 'up-to-one-background-per-file';
	} else if (error.message.includes('got \'Feature')) {
		errorMsg = 'Multiple "Feature" definitions in the same file are disallowed';
		rule = 'one-feature-per-file';
	} else if (
		error.message.includes('expected: #EOF, #TableRow, #DocStringSeparator, #StepLine, #TagLine, #ScenarioLine, #RuleLine, #Comment, #Empty, got') ||
		error.message.includes('expected: #EOF, #TableRow, #DocStringSeparator, #StepLine, #TagLine, #ExamplesLine, #ScenarioLine, #RuleLine, #Comment, #Empty, got')
	) {
		errorMsg = 'Steps should begin with "Given", "When", "Then", "And" or "But". Multiline steps are disallowed';
		rule = 'no-multiline-steps';
	} else {
		/* c8 ignore next 4 */
		// IDK if this could happen, but let's keep this to be safe
		errorMsg = error.message;
		rule = 'unexpected-error';
	}
	return {
		message: errorMsg,
		rule,
		line: errorLine,
		column: 0,
		level: 2, // Force error
	};
}
