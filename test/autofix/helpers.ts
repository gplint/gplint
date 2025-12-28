import {expect} from 'chai';

import { replaceNodeText, replaceNodeTextByRange } from '../../src/rules/utils/fix/helpers.js';
import {FileData} from '../../src/types.js';

describe('AutoFix helpers', () => {
	describe('replaceNodeText', () => {
		it('replaces the entire line text with the fixed text', () => {
			const error = { location: { line: 2 } };
			const file: FileData = {
				lines: ['line1', 'line2'],
				textEdits: [],
				relativePath: 'dummy.feature',
				EOL: '\n',
			};
			const fixedText = 'fixed line2';

			replaceNodeText(error, file, fixedText);

			expect(file.textEdits).to.be.deep.equal([
				{
					startLine: 1,
					startCol: 0,
					endLine: 1,
					endCol: 5,
					text: 'fixed line2',
					expectedOriginal: 'line2',
				},
			]);
		});

		it('handles missing lines gracefully', () => {
			const error = { location: { line: 3 } };
			const file: FileData = {
				lines: ['line1', 'line2'],
				textEdits: [],
				relativePath: 'dummy.feature',
				EOL: '\n',
			};
			const fixedText = 'fixed line3';

			replaceNodeText(error, file, fixedText);

			expect(file.textEdits).to.be.deep.equal([
				{
					startLine: 2,
					startCol: 0,
					endLine: 2,
					endCol: 0,
					text: 'fixed line3',
					expectedOriginal: '',
				},
			]);
		});
	});

	describe('replaceNodeTextByRange', () => {
		it('replaces the specified range of text with the new text', () => {
			const error = { location: { line: 2 } };
			const file: FileData = {
				lines: ['line1', 'line2'],
				textEdits: [],
				relativePath: 'dummy.feature',
				EOL: '\n',
			};
			const newText = 'new';
			const startOffset = 1;
			const endOffset = 3;

			replaceNodeTextByRange(error, file, newText, startOffset, endOffset);

			expect(file.textEdits).to.be.deep.equal([
				{
					startLine: 1,
					startCol: 1,
					endLine: 1,
					endCol: 3,
					text: 'new',
					removeIfEmptyLine: true,
				},
			]);
		});

		it('handles empty lines gracefully', () => {
			const error = { location: { line: 3 } };
			const file: FileData = {
				lines: ['line1', 'line2'],
				textEdits: [],
				relativePath: 'dummy.feature',
				EOL: '\n',
			};
			const newText = 'new';
			const startOffset = 0;
			const endOffset = 0;

			replaceNodeTextByRange(error, file, newText, startOffset, endOffset);

			expect(file.textEdits).to.be.deep.equal([
				{
					startLine: 2,
					startCol: 0,
					endLine: 2,
					endCol: 0,
					text: 'new',
					removeIfEmptyLine: true,
				},
			]);
		});
	});
});
