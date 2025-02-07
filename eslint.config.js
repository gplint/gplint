import eslint from '@eslint/js';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginPromise from 'eslint-plugin-promise'
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	pluginPromise.configs['flat/recommended'],
	{
		files: ['**/*.js'],
		...tseslint.configs.disableTypeChecked,
	},
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		ignores: [
			'node_modules/**',
			'dist/**',
			'bin',
		],
		linterOptions: {
			noInlineConfig: false,
			reportUnusedDisableDirectives: 'error',
		},
	},
	{
		rules: {
			'indent': ['error', 'tab', {
				'SwitchCase': 1,
			}],
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'brace-style': ['error', '1tbs'],
			'space-before-blocks': ['error', 'always'],
			"no-console": "error",
			"block-scoped-var": "warn",
			"default-case": "error",
			"eqeqeq": ["error", "always", {"null": "ignore"}],
			"no-alert": "error",
			"no-else-return": "warn",
			"no-empty-function": "error",
			"no-eval": "warn",
			"no-extra-label": "warn",
			"array-bracket-spacing": ["warn","never"],
			"block-spacing": ["warn", "always"],
			"camelcase": "error",
			"comma-spacing": "warn",
			"eol-last": ["error", "always"],
			"func-style": ["warn", "declaration", {"allowArrowFunctions":  true}],
			"no-multiple-empty-lines": ["error", {"max": 1}],
			"comma-dangle": ["error", "only-multiline"],
			"strict": ["error", "never"],
			"space-before-function-paren": ["error", {
			  "anonymous": "never",
			  "named": "never",
			  "asyncArrow": "always"
			}],
			"new-parens": "error",
			"no-case-declarations": "warn",
			"prefer-const": "error",
			"prefer-destructuring": ["warn", {
				"VariableDeclarator": {"object": true, "array": false},
				"AssignmentExpression": {"object": false, "array": false},
			}],
			"prefer-rest-params": "error",
			"prefer-template": "warn",
			"new-cap": "warn",
			"callback-return": "error",
			"max-len": [
			  "warn",
			  {
			    "code": 160,
			    "ignoreComments": true,
			    "ignoreStrings": true,
			    "ignoreTemplateLiterals": true,
			    "ignoreRegExpLiterals": true
			  }
			],

			'@typescript-eslint/restrict-template-expressions': ['error', {
				allowNumber: true,
				allowArray: true,
			}],
			'@typescript-eslint/prefer-nullish-coalescing': 'off', // requires strictNullChecks
			'@typescript-eslint/no-unnecessary-condition': 'off', // requires strictNullChecks
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off', // requires strictNullChecks

			"promise/prefer-await-to-then": "error",
			"promise/prefer-await-to-callbacks": "error",
		},
	},
	{
		plugins: { 'chai-friendly': pluginChaiFriendly },
		rules: {
			'no-unused-expressions': 'off', // disable original rule
			'@typescript-eslint/no-unused-expressions': 'off', // disable original rule
			'chai-friendly/no-unused-expressions': 'error',
		},
	},
);
