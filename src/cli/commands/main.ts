import * as featureFinder from '../../feature-finder.js';
import * as linter from '../../linter.js';
import { ErrorsByFile } from '../../types.js';
import * as logger from '../../logger.js';
import { ArgumentsCamelCase, CommandModule } from 'yargs';

export const command = '*';
export const describe = 'gplint main command';
export const builder = {};

export interface CliArgs extends CommandModule {
	config: string
	fix: boolean
	format: string
	ignore?: string[]
	maxWarnings: number
	ruleOverwrite?: string[]
	rulesdir?: string[]
	_?: string[]
}

export async function handler(argv: ArgumentsCamelCase<CliArgs>): Promise<void> {
	const additionalRulesDirs = argv.rulesdir;

	const files = featureFinder.getFeatureFiles(argv._, argv.ignore);

	try {
		const results = await linter.lintInit(files, argv, additionalRulesDirs);
		await printResults(results, argv.format);
		process.exit(getExitCode(results, argv));
	} catch (e) {
		console.error('Error running gplint', e); // eslint-disable-line no-console
	}
}

function getExitCode(results: ErrorsByFile[], {maxWarnings}: CliArgs): number {
	let exitCode = 0;

	const {warnCount, errorCount} = countErrors(results);

	if (errorCount > 0) {
		exitCode = 1;
	} else if (maxWarnings > -1 && warnCount > maxWarnings) {
		exitCode = 1;
		console.log(`gplint found too many warnings (maximum: ${maxWarnings}).`); // eslint-disable-line no-console
	}

	return exitCode;
}

function countErrors(results: ErrorsByFile[]): { warnCount: number, errorCount: number } {
	let warnCount = 0;
	let errorCount = 0;

	results.flatMap(result => result.errors).forEach(e => {
		if (e.level === 1) {
			warnCount++;
		} else if (e.level === 2) {
			errorCount++;
		}
	});

	return {warnCount, errorCount};
}

async function printResults(results: ErrorsByFile[], format: string): Promise<void> {
	let formatter;
	switch (format) {
		case 'json':
			formatter = await import('../../formatters/json.js');
			break;
		case 'xunit':
			formatter = await import('../../formatters/xunit.js');
			break;
		case 'stylish':
			formatter = await import('../../formatters/stylish.js');
			break;
		default:
			logger.boldError('Unsupported format. The supported formats are json, xunit and stylish.');
			process.exit(1);
	}
	console.log(formatter.print(results)); // eslint-disable-line no-console
}
