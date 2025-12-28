const os = require('os');

module.exports = {
	require: [
		'./test/hooks.ts'
	],
	diff: true,
	extension: ['ts', 'js'],
	package: './package.json',
	ui: 'bdd',
	import: 'tsx',
	recursive: true,
	'watch-files': [
		'src/**/*.js',
		'src/**/*.ts',
		'test/**/*.js',
		'test/**/*.ts',
	],
	timeout: os.type() === 'Windows_NT' ? 10_000 : 5_000,
	reporter: 'mocha-junit-reporter',
	reporterOptions: ['mochaFile=./reports/junit.xml']
};
