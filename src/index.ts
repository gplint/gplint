/* istanbul ignore file */
import { OptionValues, program } from 'commander';

import * as linter from './linter.js';
import * as featureFinder from './feature-finder.js';
import * as configParser from './config-parser.js';
import * as logger from './logger.js';
import {ErrorsByFile} from './types.js';

function list(val: string): string[] {
  return val.split(',');
}

function collect(val: string, memo: string[]): string[] {
  memo.push(val);
  return memo;
}

program
  .usage('[options] <feature-files>')
  .option('-f, --format [format]', 'output format. Possible values: json, stylish, xunit. Defaults to stylish')
  .option('-i, --ignore <...>', `comma seperated list of files/glob patterns that the linter should ignore, overrides ${featureFinder.defaultIgnoreFileName} file`, list)
  .option('-c, --config [config]', `configuration file, defaults to ${configParser.defaultConfigFileName}`)
  .option('-r, --rulesdir <...>', 'additional rule directories', collect, [])
  .option('--max-warnings <...>', 'additional rule directories', '-1')
  .parse(process.argv);

const options = program.opts();
const additionalRulesDirs = options.rulesdir;
const files = featureFinder.getFeatureFiles(program.args, options.ignore);

linter.lintInit(files, options.config, additionalRulesDirs)
  .then(async (results) => {
    await printResults(results, options.format);
    process.exit(getExitCode(results, options));
  })
  .catch(e => {
    console.error('Error running gplint', e);
  });

function getExitCode(results: ErrorsByFile[], {maxWarnings}: OptionValues): number {
  let exitCode = 0;

  const {warnCount, errorCount} = countErrors(results);

  if (errorCount > 0) {
    exitCode = 1;
  } else if (maxWarnings > -1 && warnCount > maxWarnings) {
    exitCode = 1;
    console.log(`gplint found too many warnings (maximum: ${maxWarnings}).`);
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
  if (format === 'json') {
    formatter = await import('./formatters/json.js');
  } else if (format === 'xunit') {
    formatter = await import('./formatters/xunit.js');
  } else if (!format || format === 'stylish') {
    formatter = await import('./formatters/stylish.js');
  } else {
    logger.boldError('Unsupported format. The supported formats are json, xunit and stylish.');
    process.exit(1);
  }
  console.log(formatter.print(results));
}

export * from './types.js';
