import _ from 'lodash';
import * as Gherkin from '@cucumber/gherkin';
import { Examples, Feature, Pickle, Rule, Scenario, TableRow } from '@cucumber/messages';
import {GherkinKeyworded, GherkinNode, GherkinTaggable} from '../../types.js';

// We use the node's keyword to determine the node's type
// because it's the only way to distinguish a scenario with a scenario outline
export function getNodeType(node: GherkinKeyworded, language: string): string {
	const key = getLanguageInsensitiveKeyword(node as GherkinTaggable, language);

	switch (key?.toLowerCase()) {
		case 'feature':
			return 'Feature';
		case 'rule':
			return 'Rule';
		case 'background':
			return 'Background';
		case 'scenario':
			return 'Scenario';
		case 'scenariooutline':
			return 'Scenario Outline';
		case 'examples':
			return 'Examples';
		case 'given':
		case 'when':
		case 'then':
		case 'and':
		case 'but':
			return 'Step';
		default:
			throw new Error(`Unknown Gherkin node name. "${node.keyword}", was resolved as ${key}`);
	}
}

export function getLanguageInsensitiveKeyword(node: GherkinKeyworded, language = ''): string {
	const languageMapping = Gherkin.dialects[language];

	return _.findKey(languageMapping, values => values instanceof Array && values.includes(node.keyword));
}

export function getNodeForPickle(feature: Feature, pickle: Pickle, forceExamplesLevel = false): GherkinNode | Examples | TableRow | undefined {
	let node: GherkinNode | Examples | TableRow | undefined = feature;

	for (const astNodeId of pickle.astNodeIds) {
		if (Object.hasOwn(node, 'children')) {
			const scenarios = feature.children
				.filter(child => child.rule)
				.flatMap(child => child.rule.children)
				.filter(child => child.scenario)
				.concat(feature.children
					.filter(child => child.scenario))
				.map(child => child.scenario);
			node = scenarios.find(t => t?.id === astNodeId);
		} else if (Object.hasOwn(node, 'examples')) {
			node = forceExamplesLevel
				? (node as unknown as Scenario).examples.find(e => e.tableBody.find(t => t.id === astNodeId))
				: (node as unknown as Scenario).examples.flatMap(e => e.tableBody).find(t => t.id === astNodeId);
		}
	}

	return node;
}

export function getPicklesForNode(node: Feature | Rule, pickles: Pickle[]): Pickle[] {
	const scenarioIds = node.children.filter(n => n.scenario).map(s => s.scenario.id);

	return pickles.filter(pickle => pickle.astNodeIds.find(id => scenarioIds.includes(id)));
}

/**
 * Returns object with two properties, rules, containing all the Rules, and children, containing all the scenarios and
 * background (even those inside a Rule)
 * @param node
 */
export function featureSpread(node: Feature) {
	const children = [];
	const rules = [];
	for (const child of node.children) {
		if (child.rule) {
			rules.push(child.rule);
			children.push(...child.rule.children);
		} else {
			children.push(child);
		}
	}
	return {
		children,
		rules,
	};
}
