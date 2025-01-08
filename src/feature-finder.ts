import _ from 'lodash';
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';
import * as logger from './logger.js';

export const defaultIgnoreFileName = '.gplintignore';
const defaultIgnoredFiles = 'node_modules/**'; // Ignore node_modules by default

export function getFeatureFiles(args: string[], ignoreArg?: string[]): string[] {
	let files = [] as string[];
	const patterns = args.length ? args : ['.'];

	patterns.forEach(pattern => {
		// First we need to fix up the pattern so that it only matches .feature files,
		// and it's in the format that glob expects it to be
		let fixedPattern;
		if (pattern === '.') {
			fixedPattern = '**/*.feature';
		} else if (/.*\/\*\*/.exec(pattern)) {
			fixedPattern = `${pattern}/**.feature`;
		} else if (/.*\.feature/.exec(pattern)) {
			fixedPattern = pattern;
		} else {
			try {
				if (fs.statSync(pattern).isDirectory()) {
					fixedPattern = path.join(pattern, '**/*.feature');
				}
			} catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
				// Don't show the fs callstack, we will print a custom error message bellow instead
			}
		}

		if (!fixedPattern) {
			logger.boldError(`Invalid format of the feature file path/pattern: "${pattern}".\n
				To run the linter please specify an existing feature file, directory or glob.`);
			process.exit(1);
			return; // This line will only be hit by tests that stub process.exit
		}

		const globOptions = {
			ignore: getIgnorePatterns(ignoreArg),
			nodir: true,
		};

		files = files.concat(glob.sync(fixedPattern, globOptions));
	});
	return _.uniq(files);
}

export function getIgnorePatterns(ignoreArg?: string[]): string[] {
	if (ignoreArg) {
		return ignoreArg;
	} else if (fs.existsSync(defaultIgnoreFileName)) {
		// return an array where each element of the array is a line of the ignore file
		return fs.readFileSync(defaultIgnoreFileName)
			.toString()
			.split(/[\n|\r]/)
			.filter(i => i !== ''); // remove empty strings
	}
	return _.castArray(defaultIgnoredFiles);
}
