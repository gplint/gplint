import _merge from 'lodash.merge';
import _range from 'lodash.range';
import _trim from 'lodash.trim';
import {GherkinData, RuleSubConfig, RuleError, ErrorData, FileData, Documentation} from '../types.js';
import {TableRow} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

const TABLE_SEPARATOR = '|';
const TABLE_SPLITTER = /(?<!\\)\|/;

export const name = 'table-align';
export const availableConfigs = {
	examples: true,
	steps: true,
};

interface TableAlignErrorData extends ErrorData {
	value: string,
	expectedLine: string,
}

export function run({feature, file}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): TableAlignErrorData[] {
	function _checkRows(rows: readonly TableRow[]) {
		// row could be null on missing tables
		if (rows.length === 0 || rows.some(row => row == null)) {
			return;
		}

		const tableLines = rows.map(row => _splitTableRow(file.lines[row.location.line - 1]));

		const columnsCount = tableLines[0].length;
		const columns = _range(columnsCount).map(i => tableLines.map(row => row[i]));

		const columnsMaxLength = columns.map(column => Math.max(...column.map(cell => cell.trim().length)));

		rows.forEach((row, rowIndex) => {
			const line = file.lines[row.location.line - 1];
			const realLine = _trim(line.trim(), TABLE_SEPARATOR);
			const realCells = realLine.split(TABLE_SPLITTER);

			// Build the fully aligned version of this row now and attach it to each
			// cell error, since `fix` only gets the error and can't see the table.
			// Keep the row's original indentation — lining up indentation is the
			// indentation rule's job. Use the cell text straight from the source
			// line, not row.cells[].value: the parser strips the backslash from an
			// escaped pipe (`\|` becomes `|`), which would throw off the column
			// widths and mean fixing a table with escaped pipes never settles.
			const indent = line.substring(0, line.length - line.trimStart().length);
			const expectedLine = indent + TABLE_SEPARATOR + tableLines[rowIndex]
				.map((cell, cellIndex) => ` ${cell.trim().padEnd(columnsMaxLength[cellIndex])} `)
				.join(TABLE_SEPARATOR) + TABLE_SEPARATOR;

			row.cells.forEach((cell, cellIndex) => {
				const cellValue = tableLines[rowIndex][cellIndex].trim();
				const expectedCellValue = ` ${cellValue.padEnd(columnsMaxLength[cellIndex])} `;

				if (expectedCellValue !== realCells[cellIndex]) {
					errors.push({
						location: cell.location,
						value: cellValue,
						expectedLine,
					});
				}
			});
		});
	}

	if (!feature) {
		return [];
	}
	const mergedConfig = _merge({}, availableConfigs, configuration);

	const errors = [] as TableAlignErrorData[];

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

export function buildRuleErrors(error: TableAlignErrorData): RuleError {
	return {
		message: `Cell with value "${error.value}" is not aligned`,
		rule: name,
		line: error.location.line,
		column: error.location.column,
	};
}

export function fix(error: TableAlignErrorData, file: FileData): void {
	// Same-row cell errors all carry the identical expectedLine, so rewriting
	// the line once per error is idempotent.
	file.lines[error.location.line - 1] = error.expectedLine;
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
