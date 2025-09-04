import _ from 'lodash';
import {GherkinData, RuleSubConfig, RuleError, Documentation} from '../types.js';
import {TableCell, TableRow} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

const TABLE_SEPARATOR = '|';
const TABLE_SPLITTER = /(?<!\\)\|/;

export const name = 'table-align';
export const availableConfigs = {
	examples: true,
	steps: true,
};

export function run({feature, file}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	function _checkRows(rows: readonly TableRow[]) {
		// row could be null on missing tables
		if (rows.length === 0 || rows.some(row => row == null)) {
			return;
		}

		const tableLines = rows.map(row => _splitTableRow(file.lines[row.location.line - 1]));

		const columnsCount = tableLines[0].length;
		const columns = _.range(columnsCount).map(i => tableLines.map(row => row[i]));

		const columnsMaxLength = columns.map(column => Math.max(...column.map(cell => cell.trim().length)));

		rows.forEach((row, rowIndex) => {
			const realLine = _.trim(file.lines[row.location.line - 1].trim(), TABLE_SEPARATOR);
			const realCells = realLine.split(TABLE_SPLITTER);

			row.cells.forEach((cell, cellIndex) => {
				const cellValue = tableLines[rowIndex][cellIndex].trim();
				const expectedCellValue = ` ${cellValue.padEnd(columnsMaxLength[cellIndex])} `;

				if (expectedCellValue !== realCells[cellIndex]) {
					errors.push(createError({
						location: cell.location,
						value: cellValue
					}));
				}
			});
		});
	}

	if (!feature) {
		return [];
	}
	const mergedConfig = _.merge({}, availableConfigs, configuration);

	const errors = [] as RuleError[];

	const {children} = featureSpread(feature);

	for (const {scenario, background} of children) {
		if (mergedConfig.steps) {
			const tableSteps = (scenario ?? background).steps.filter(step => step.dataTable != null);

			for (const step of tableSteps) {
				_checkRows(step.dataTable.rows);
			}
		}

		if (mergedConfig.examples && scenario?.examples != null) {
			for (const example of scenario.examples) {
				_checkRows([example.tableHeader, ...example.tableBody]);
			}
		}
	}

	return errors;
}

function createError(cell: TableCell): RuleError {
	return {
		message: `Cell with value "${cell.value}" is not aligned`,
		rule: name,
		line: cell.location.line,
		column: cell.location.column,
	};
}

function _splitTableRow(line: string): string[] {
	const tableRow = line.trim();

	const result = [];
	let current = '';
	let escapeCount = 0;

	for (const char of tableRow) {
		if (char === '\\') {
			escapeCount++;
			current += char;
		} else if (char === '|' && escapeCount % 2 === 0) {
			result.push(current);
			current = '';
			escapeCount = 0;
		} else {
			current += char;
			escapeCount = 0;
		}
	}
	result.push(current);
	return result
		.slice(1, -1); // Remove the first and last elements, which are always empty due to leading and trailing '|'
}

export const documentation: Documentation = {
	description: 'Allows to force table alignment on steps and/or examples. Is possible to specify if you want to apply this rule for tables on steps and/or examples',
	configuration: [{
		name: 'examples',
		type: 'boolean',
		description: 'If sets to true, tables on examples should be aligned.',
		default: availableConfigs.steps,
	}, {
		name: 'steps',
		type: 'boolean',
		description: 'If sets to true, tables on steps should be aligned.',
		default: availableConfigs.steps,
	}],
	examples: [{
		title: 'Example',
		description: 'Force tables on steps and examples to be properly aligned.',
		config: {
			[name]: ['error', {
				steps: true,
				examples: true,
			}],
		}
	}],
};
