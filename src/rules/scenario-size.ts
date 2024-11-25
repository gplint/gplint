import _ from 'lodash';
import * as gherkinUtils from './utils/gherkin.js';
import {featureSpread} from './utils/gherkin.js';

import {Documentation, GherkinData, RuleError, RuleSubConfig} from '../types.js';

export const name = 'scenario-size';
export const availableConfigs = {
	'steps-length': {
		'Background': 15,
		'Scenario': 15,
	},
};

export function run({feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	if (_.isEmpty(configuration)) {
		configuration = availableConfigs;
	}

	const errors = [] as RuleError[];

	featureSpread(feature).children.forEach((child) => {
		const node = child.background ?? child.scenario;
		const nodeType = gherkinUtils.getNodeType(node, feature.language);
		const configKey = child.background ? 'Background' : 'Scenario';
		const maxSize = configuration['steps-length'][configKey];
		const {steps} = node;

		if (maxSize && steps.length > maxSize) {
			errors.push({
				message: `Element ${nodeType} too long: actual ${steps.length}, expected ${maxSize}`,
				rule: 'scenario-size',
				line: node.location.line,
				column: node.location.column,
			});
		}
	});

	return errors;
}

export const documentation: Documentation = {
	description: 'Lets you specify a maximum step length for scenarios and backgrounds. The `Scenario` configuration applies to both scenarios and scenario outlines.',
	fixable: false,
	configuration: [{
		name: 'steps-length',
		type: 'object',
		description: 'Object that can contains the properties `Scenario` and `Background`.',
		default: availableConfigs['steps-length'],
	}, {
		name: 'steps-length.Background',
		type: 'number',
		description: 'Specify de maximum step length for Background\'s step.',
		default: availableConfigs['steps-length'].Background,
	}, {
		name: 'steps-length.Scenario',
		type: 'number',
		description: 'Specify de maximum step length for Scenario\'s step.',
		default: availableConfigs['steps-length'].Scenario,
	}],
	examples: [{
		title: 'Example',
		description: 'Set maximum step length for Background\'s step to 15, and 20 for Scenario\'s steps',
		config: {
			[name]: ['error', {
				'steps-length': {
					'Background': 15,
					'Scenario': 20,
				},
			}],
		},
	}],
};
