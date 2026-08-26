export const ruleOverwrite = {
	alias: 'R',
	description: 'Overwrite the configuration of a rule. Format: <rule-name>=<rule-config> or <rule-name>=<rule-config>,{"<key>":"<value>"}. Example: table-align=error or table-align=warn,{"examples":true}',
	required: false,
	type: 'array'
};
