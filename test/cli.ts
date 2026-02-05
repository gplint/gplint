import childProcess from 'node:child_process';
import path from 'node:path';
import {expect} from 'chai';

describe('cli', () => {
	  it('run successfully', () => {
		  const response = childProcess.spawnSync('node', [
			  '../bin/gplint.js',
			  '.',
			  '--format', 'json'
		  ], {
			  cwd: './test-data-wip',
		  });

		  expect(JSON.parse(response.stdout.toString())).to.be.deep.equal([
			  {
				  filePath: path.resolve('test-data-wip/EmptyFeature.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Missing Feature name',
						  rule: 'no-unnamed-features',
						  line: 0,
						  column: 0
					  },
					  {
						  level: 2,
						  message: 'Empty feature files are disallowed',
						  rule: 'no-empty-file',
						  line: 1,
						  column: 0
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/scenario-size.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Missing Feature name',
						  rule: 'no-unnamed-features',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Element Background too long: actual 16, expected 15',
						  rule: 'scenario-size',
						  line: 2,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Backgrounds are not allowed when there is just one scenario.',
						  rule: 'no-background-only-scenario',
						  line: 2,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 2,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 7,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 10,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 11,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 12,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 13,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 14,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 15,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 16,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 17,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 18,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 19,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 20,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 21,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 22,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 23,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 24,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 25,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 26,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 27,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 28,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 29,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 30,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 31,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 32,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 33,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 34,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/UseAnd.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Backgrounds are not allowed when there is just one scenario.',
						  rule: 'no-background-only-scenario',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "Given third statement that does not use and" should use And instead of Given ',
						  rule: 'use-and',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 8,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 10,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "When second step without and" should use And instead of When ',
						  rule: 'use-and',
						  line: 11,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 11,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 12,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 13,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "Then second assertion without and" should use And instead of Then ',
						  rule: 'use-and',
						  line: 14,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 14,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/UnnamedScenario.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Missing Scenario name',
						  rule: 'no-unnamed-scenarios',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/UnnamedFeature.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Missing Feature name',
						  rule: 'no-unnamed-features',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Feature name is already used in: scenario-size.feature',
						  rule: 'no-dupe-feature-names',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/TrailingTab.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 1,
						  message: 'Trailing spaces are not allowed',
						  rule: 'no-trailing-spaces',
						  line: 4,
						  column: 49
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/TrailingSpaces.feature'),
				  errors: [
					  {
						  level: 1,
						  message: 'Trailing spaces are not allowed',
						  rule: 'no-trailing-spaces',
						  line: 1,
						  column: 34
					  },
					  {
						  level: 1,
						  message: 'Trailing spaces are not allowed',
						  rule: 'no-trailing-spaces',
						  line: 3,
						  column: 50
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 1,
						  message: 'Trailing spaces are not allowed',
						  rule: 'no-trailing-spaces',
						  line: 4,
						  column: 47
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/TagOnBackground.feature'),
				  errors: [
					  {
						  message: 'Tags on Backgrounds are disallowed',
						  rule: 'no-tags-on-backgrounds',
						  line: 4,
						  column: 0,
						  level: 2
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/PartiallyCommentedTagLine.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'All Scenarios and Rules on this Feature have the same tag(s), they should be defined on the Feature instead: @tag',
						  rule: 'no-homogenous-tags',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Backgrounds are not allowed when there is just one scenario.',
						  rule: 'no-background-only-scenario',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 6,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/OnlyScenarioOutlines.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Feature name is too long. Length of 64 is longer than the maximum allowed: 50',
						  rule: 'name-length',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Examples", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 10,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Multiple empty lines are not allowed',
						  rule: 'no-multiple-empty-lines',
						  line: 12,
						  column: 0
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/NoSuperfluousTags.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'All Scenarios and Rules on this Feature have the same tag(s), they should be defined on the Feature instead: @superfluousTag',
						  rule: 'no-homogenous-tags',
						  line: 2,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Backgrounds are not allowed when there is just one scenario.',
						  rule: 'no-background-only-scenario',
						  line: 4,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 4,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 1,
						  message: 'Tag duplication between Scenario and its corresponding Feature: @superfluousTag',
						  rule: 'no-superfluous-tags',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 8,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/NoScenarios.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Feature file does not have any Scenarios',
						  rule: 'no-files-without-scenarios',
						  line: 1,
						  column: 0
					  },
					  {
						  level: 2,
						  message: 'Backgrounds are not allowed when there is just one scenario.',
						  rule: 'no-background-only-scenario',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/NoRestrictedTags.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Forbidden tag @watch on Feature',
						  rule: 'no-restricted-tags',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Forbidden tag @wip on Scenario',
						  rule: 'no-restricted-tags',
						  line: 4,
						  column: 12
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 4,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 5,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 8,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 9,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 10,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/NoNewLineAtEOF.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 1,
						  message: 'New line at EOF (end of file) is required',
						  rule: 'new-line-at-eof',
						  line: 5,
						  column: 0
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/NoHomogenousTags.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'All Scenarios and Rules on this Feature have the same tag(s), they should be defined on the Feature instead: @homogenousTag',
						  rule: 'no-homogenous-tags',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Background", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 6,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 10,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'All Examples of a Scenario Outline have the same tag(s), they should be defined on the Scenario Outline instead: @homogenousExampleTag',
						  rule: 'no-homogenous-tags',
						  line: 11,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 11,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 12,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "examples tag", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 14,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Examples", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 15,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 16,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 17,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "examples tag", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 19,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Examples", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 20,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 21,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "example", expected indentation level of 6, but got 2',
						  rule: 'indentation',
						  line: 22,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/MultipleFeatures.feature'),
				  errors: [
					  {
						  message: 'Multiple "Feature" definitions in the same file are disallowed',
						  rule: 'one-feature-per-file',
						  line: 7,
						  column: 0,
						  level: 2
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/MultipleEmptyLines.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Multiple empty lines are not allowed',
						  rule: 'no-multiple-empty-lines',
						  line: 3,
						  column: 0
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 4,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/MultipleBackgrounds.feature'),
				  errors: [
					  {
						  message: 'Multiple "Background" definitions in the same file are disallowed',
						  rule: 'up-to-one-background-per-file',
						  line: 9,
						  column: 0,
						  level: 2
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/KeywordsInLogicalOrder.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "When a succeeding when step, which is bad" should not appear after step using keyword then',
						  rule: 'keywords-in-logical-order',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "Given a succeeding given step, also bad" should not appear after step using keyword then',
						  rule: 'keywords-in-logical-order',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 8,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Step "Given a succeeding given step, also bad" should not appear after step using keyword when',
						  rule: 'keywords-in-logical-order',
						  line: 10,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 10,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/DuplicateTags.feature'),
				  errors: [
					  {
						  level: 1,
						  message: 'Duplicate tags are not allowed: @featuretag',
						  rule: 'no-duplicate-tags',
						  line: 1,
						  column: 13
					  },
					  {
						  level: 1,
						  message: 'Duplicate tags are not allowed: @scenariotag',
						  rule: 'no-duplicate-tags',
						  line: 4,
						  column: 14
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "scenario tag", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 4,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 5,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 6,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/DuplicateScenarioName.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Scenario name is already used in: DuplicateScenarioName.feature:3',
						  rule: 'no-dupe-scenario-names',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/DuplicateFeatureName-Pt2.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  }
				  ]
			  },
			  {
				  filePath: path.resolve('test-data-wip/DuplicateFeatureName-Pt1.feature'),
				  errors: [
					  {
						  level: 2,
						  message: 'Feature name is already used in: DuplicateFeatureName-Pt2.feature',
						  rule: 'no-dupe-feature-names',
						  line: 1,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 3,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 4,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 5,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Scenario", expected indentation level of 2, but got 0',
						  rule: 'indentation',
						  line: 7,
						  column: 1
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 8,
						  column: 3
					  },
					  {
						  level: 2,
						  message: 'Wrong indentation for "Step", expected indentation level of 4, but got 2',
						  rule: 'indentation',
						  line: 9,
						  column: 3
					  }
				  ]
			  }
		  ]);

		  expect(response.stderr).to.be.empty;
	  });
});
