import {
	Examples,
	Feature,
	Location,
	ParseError,
	Pickle,
	Rule as CucumberRule,
	Scenario,
	TableRow,
	Step,
	Background,
} from '@cucumber/messages';

export type Rules = Record<string, Rule>;

export interface Documentation {
	description: string
	fixable: boolean
	configuration?: DocumentationConfiguration[]
	examples: DocumentationExample[]
}

export interface DocumentationConfiguration {
	name: string
	type?: string
	description: string
	default?: string | number | boolean | object
	link?: string | true
}

export interface DocumentationExample {
	title: string
	description: string
	config: unknown
}

export interface Rule {
	name: string
	availableConfigs?: Record<string, unknown> | string[]
	run: (gherkinData: GherkinData, config: RuleSubConfig<unknown>, autoFix: boolean) => RuleError[],
	documentation?: Documentation,
}

export type RulesConfig = Record<string, RuleConfig>;

export type RuleConfig = undefined | string | number | RuleConfigArray;
export type RuleConfigArray = [string | number, ...RuleSubConfig<any>[]] // eslint-disable-line @typescript-eslint/no-explicit-any

export type RuleSubConfig<T> = T;

export type ErrorLevels = 0 | 1 | 2;

export interface RuleError extends Location {
	message: string
	rule: string
}

export interface RuleErrorLevel extends RuleError {
	level: ErrorLevels
}

export type GherkinError = Partial<ParseError>

export interface Errors {
	errors: GherkinError[]
	errorMsgs: RuleError[]
}

export interface ErrorsByFile {
	filePath: string
	errors: RuleErrorLevel[]
}

export interface GherkinData {
	feature?: Feature
	pickles?: Pickle[]
	file?: FileData
}

export interface FileData {
	relativePath: string
	lines: string[]
}

export type GherkinTaggable = Feature | CucumberRule | Scenario | Examples;
export type GherkinKeyworded = GherkinTaggable | Background | Step;
export type GherkinNode = GherkinKeyworded | TableRow;
