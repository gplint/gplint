import _ from 'lodash';
import {Pickle, Scenario} from '@cucumber/messages';
import * as gherkinUtils from './utils/gherkin.js';
import {featureSpread, getPicklesForNode} from './utils/gherkin.js';
import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';

export const name = 'no-dupe-scenario-names';
export const availableConfigs = [
	'anywhere',
	'in-feature',
	'in-rule',
	'anywhere-compile',
	'in-feature-compile',
	'in-rule-compile',
];

type Locations = [
	{
		file: string
		line: number
		column: number
	}
];

let scenariosStore = {} as Record<string, {
	locations: Locations
}>;

export function run({
	feature,
	pickles,
	file,
}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];

	const scope = configuration && _.isString(configuration) ? configuration : 'anywhere';
	const compile = scope.endsWith('-compile');

	function loopScenarios(scenarios: (Scenario | Pickle)[]) {
		scenarios.forEach(scenario => {
			const scenarioName = scenario.name;
			const scenarioLocation = (compile ? gherkinUtils.getNodeForPickle(feature, scenario as Pickle) : scenario as Scenario).location;
			if (Object.prototype.hasOwnProperty.call(scenariosStore, scenarioName)) {
				const dupes = getFileLinePairsAsStr(scenariosStore[scenarioName].locations);

				scenariosStore[scenarioName].locations.push({
					file: file.relativePath,
					line: scenarioLocation.line,
					column: scenarioLocation.column,
				});

				errors.push({
					message: `Scenario name is already used in: ${dupes}`,
					rule: name,
					line: scenarioLocation.line,
					column: scenarioLocation.column,
				});
			} else {
				scenariosStore[scenarioName] = {
					locations: [
						{
							file: file.relativePath,
							line: scenarioLocation.line,
							column: scenarioLocation.column,
						},
					],
				};
			}
		});
	}

	if (scope.startsWith('in-rule')) {
		const {rules} = featureSpread(feature);

		for (const node of [feature, ...rules]) { // Append feature level to rules array, to check un-ruled scenarios
			scenariosStore = {};

			const scenarios = compile ?
				getPicklesForNode(node, pickles) :
				node.children.filter(child => child.scenario).map(child => child.scenario);
			loopScenarios(scenarios);
		}
	} else {
		if (scope.startsWith('in-feature')) {
			scenariosStore = {};
		}
		const {children} = featureSpread(feature);

		const scenarios = compile ? pickles : children.filter(child => child.scenario).map(child => child.scenario);
		loopScenarios(scenarios);
	}

	return errors;
}

function getFileLinePairsAsStr(objects: Locations) {
	const strings = [] as string[];
	objects.forEach(object => {
		strings.push(`${object.file}:${object.line}`);
	});
	return strings.join(', ');
}

export const documentation: Documentation = {
	description: `Disallows duplicate Scenario names. Can be configured to search for duplicates in each individual feature or amongst all feature files.

The default case is testing against all the features (same scenario name in different features will raise an error). If needed the scope can be configured, see the examples to know how it works

Additionally, you can also look for duplicated on Outline Scenarios with variables on the title, just adding \`-compile\` suffix to the rule configuration (If you use this option, you need to have a variable on the title of all your Outlines)
`,
	fixable: false,
	configuration: [{
		name: 'anywhere',
		description: 'Same as the default behaviour, find duplicates along all files.',
		link: true,
	}, {
		name: 'in-feature',
		description: 'Search for duplicates in each individual Feature (same Scenario name in different Features won\'t raise an error).',
		link: true,
	}, {
		name: 'in-rule',
		description: 'Search for duplicates in each individual Rule (same Scenario name in different Rules won\'t raise an error).',
		link: true,
	}, {
		name: 'anywhere-compile',
		description: 'Find duplicates along all files, including compiling Outlines.',
		link: true,
	}, {
		name: 'in-feature-compile',
		description: 'Same as `in-feature`, but including compiling Outlines.',
		link: true,
	}, {
		name: 'in-rule-compile',
		description: 'Same as `in-rule`, but including compiling Outlines.',
		link: true,
	}],
	examples: [{
		title: 'Default behaviour',
		description: 'Same scenario name in different features will raise an error',
		config: {
			[name]: 'error',
		},
	}, {
		title: 'anywhere',
		description: 'Same as the default behaviour, find duplicates along all files.',
		config: {
			[name]: ['error', 'anywhere'],
		},
	}, {
		title: 'anywhere-compile',
		description: 'Same as the default behaviour, find duplicates along all files, including compiling Outlines.',
		config: {
			[name]: ['error', 'anywhere'],
		},
	}, {
		title: 'in-feature',
		description: 'To enable searching for duplicates in each individual feature (same scenario name in different features won\'t raise an error) you need to configure the rule like this.',
		config: {
			[name]: ['error', 'in-feature'],
		},
	}, {
		title: 'in-feature-compile',
		description: 'Same as "in-feature", but including compiling Outlines.',
		config: {
			[name]: ['error', 'in-feature-compile'],
		},
	}, {
		title: 'in-rule',
		description: 'To enable searching for duplicates in each individual rule (same scenario name in different rules won\'t raise an error) you need to configure the rule like this',
		config: {
			[name]: ['error', 'in-rule'],
		},
	}, {
		title: 'in-rule-compile',
		description: 'Same as "in-rule", but including compiling Outlines.',
		config: {
			[name]: ['error', 'in-rule-compile'],
		},
	}],
};
