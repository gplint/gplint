import * as ruleTestBase from '../rule-test-base.js';
import * as rule from '../../../src/rules/max-keywords.js';
const runTest = ruleTestBase.createRuleTest(rule,
	'There are too many steps for "<%= keyword %>". Found <%= count %>, maximum allowed <%= expected %>.');
const runTestContiguous = ruleTestBase.createRuleTest(rule,
	'There are too many contiguous steps for "<%= keyword %>". Found <%= count %>, maximum allowed <%= expected %>.');

describe('max-keywords', function() {
	it('doesn\'t raise errors when there are no violations', function() {
		return runTest('max-keywords/NoViolations.feature', {}, []);
	});

	it('raise errors when there are violations excluding the explicit unlimited', function() {
		return runTest('max-keywords/Violations.feature', {
			given: 1,
			when: -1,
			then: 3,
		}, [
			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 4,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 9,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 15,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 20,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 37,
				column: 5,
			},
		]);
	});

	it('raises errors when there are violations with contiguous enabled', function() {
		return runTestContiguous('max-keywords/Violations.feature', {
			given: 1,
			when: 2,
			then: 3,
			onlyContiguous: true,
		}, [
			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 4,
				column: 5,
			}, {
				messageElements: { keyword: 'when', count: 3, expected: 2 },
				line: 6,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 9,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 15,
				column: 5,
			}, {
				messageElements: { keyword: 'when', count: 3, expected: 2 },
				line: 17,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 20,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 37,
				column: 5,
			},

			{
				messageElements: { keyword: 'when', count: 12, expected: 2 },
				line: 47,
				column: 5,
			},
		]);
	});

	it('raises errors when there are violations with contiguous disabled', function() {
		return runTest('max-keywords/Violations.feature', {
			given: 1,
			when: 2,
			then: 3,
			onlyContiguous: false,
		}, [
			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 4,
				column: 5,
			}, {
				messageElements: { keyword: 'when', count: 3, expected: 2 },
				line: 6,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 9,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 15,
				column: 5,
			}, {
				messageElements: { keyword: 'when', count: 3, expected: 2 },
				line: 17,
				column: 5,
			}, {
				messageElements: { keyword: 'then', count: 4, expected: 3 },
				line: 20,
				column: 5,
			},

			{
				messageElements: { keyword: 'when', count: 4, expected: 2 },
				line: 27,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 1 },
				line: 37,
				column: 5,
			},

			{
				messageElements: { keyword: 'when', count: 12, expected: 2 },
				line: 47,
				column: 5,
			},
		]);
	});

	it('raises errors when there are violations with forbidden keywords', function() {
		return runTest('max-keywords/Violations.feature', {
			given: 0,
		}, [
			{
				messageElements: { keyword: 'given', count: 2, expected: 0 },
				line: 4,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 0 },
				line: 15,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 1, expected: 0 },
				line: 26,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 2, expected: 0 },
				line: 37,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 1, expected: 0 },
				line: 41,
				column: 5,
			},

			{
				messageElements: { keyword: 'given', count: 1, expected: 0 },
				line: 46,
				column: 5,
			},
		]);
	});
});
