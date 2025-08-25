const rule = 'custom-ts';

export const name = rule;

export function run() {
	return [
		{
			message: 'Custom error on custom-ts rule',
			rule,
			line   : 123,
			column : 21
		}
	];
}
