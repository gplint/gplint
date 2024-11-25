# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-09-29
### 🚀 New Feature
* feature: auto fix problems by @lucas-it in https://github.com/gplint/gplint/pull/672
  * chore: Mark fixable rules on README.md by @Nyaran in https://github.com/gplint/gplint/pull/673

## [2.0.0] - 2024-07-07
### 💥 Breaking Change
* This package is now pure ESM. It should not affect if using gplint as a cli tool, if you have problems with integration, please, first [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
* Drop Node 14 and 16 support.
* Level "on" was deprecated on v1, and now was removed. Replace it with "error" or "warn" on your .gplintrc file.
* On rule `required-tags` the `tags` was deprecated, now was removed. Replace it with `scenario` the use in the same way.

### 🚀 New Feature
* Support to load custom rules with mjs and cjs extensions (and TypeScript equivalents).
* Support latest Node 20 (not limited to 20.4 anymore) and 22.
* Rules improvements:
	* Support [Rule node](https://cucumber.io/docs/gherkin/reference/#rule) for all rules
	* Rule `no-dupe-scenario-names` has two new configurations, `in-rule` and `in-rule-compile`.
	* Improve `no-restricted-patterns`:
		* Support Example, ExampleHeader and ExampleBody.
		* Support DocString and DataTable from Steps with it own configuration key (check README.md).

### 🐛 Bug Fix
*  Fix no-partially-commented-tag-lines rule, detecting comments separated from tag (configurable).

### 🏠 Internal
* Update eslint config to use flat config.
* Update eslint to v9.
* Add restrictive Code Style with eslint.
* Replace [istanbuljs/nyc](https://github.com/istanbuljs/nyc) with [c8](https://github.com/bcoe/c8).
* Increased code coverage.
* Replaced "commander" with "yargs".
* Improve linting and strictNullChecks

## [1.5.1] - 2023-07-17
### Fixed
* Fix load default config file if argument is not specified. by @Nyaran in https://github.com/gplint/gplint/pull/440

## [1.5.0] - 2023-07-15
### Added
* Support custom rules in TypeScript by @Nyaran in https://github.com/gplint/gplint/pull/434

### Changed
* Improve rule no-restricted-patterns allowing to restrict words on steps by @AlexisArteaga13 in https://github.com/gplint/gplint/pull/433
* Improve rule keywords-in-logical-order allowing to detect missing keywords by @AlexisArteaga13 in https://github.com/gplint/gplint/pull/438

## [1.4.1] - 2023-03-14
### Fixed
* Fix table-align rule when scaped pipes are present (by @devilj) #363.
* Fix test workflow to use properly different node versions. #367

## [1.4.0] - 2023-03-04
### Changed
* Escape pipes in table cells (by @devilj) #357.
* Run tests on node 18 and 19.
* Migrate project to TypeScript.

## [1.3.0] - 2022-03-07
### Added
* Added rules `allow-all-caps` & `allow-all-lowercase` #123.
* Support warn/error levels for rules. (on is assumed as error). #66
* New cli parameter, `--max-warnings` to configure exit code based on number of warnings. #66
* Added rule `related-tags`.

### Changed
* Migrated code and tests to pure babel.
* Tests now use sources instead of compiled files.
* Replace mocha-sinon package with direct use.
* Moved dist to build (just bc personal preference).
* Apply language tag to code blocks on README.
* Babel/nyc tweaks.

### Fixed
* Fix `undefined` use on `availableConfig`.

## [1.2.1] - 2021-11-03
### Added
* (internal) Created method `getNodeForPickle` to map nodes and pickles.

### Fixed
* Fix and improve `required-tags` using global.

## [1.2.0] - 2021-11-01
### Added
* Added rule `max-tags-lines`.
* Run tests on node 17.
* Added rule `table-align`.

### Changed
* Improve packaging discarding `.npmignore` and using `files` property on `package.json`.
* Improve `indentation` to support `examples tag`.
* Improve `required-tags` rule.
  * Add options to set required tags for each level.
  * Add option to define global tags, to be defined on any level.
  * Add options to extend rule and example tags to Scenario when that levels are not present for that Scenario.
  * Deprecated the `tags` option, should be replaced by `scenario`.
  * Improved tag checks allowing to force an expression is a RegExp (should be wrapped between slashes), and matching tag completely on string match.
  * Allow subset array to include optional required tags.
* Improve formatters:
  * xunit: Wrap with testsuites object and add count attribute
  * stylish: Add error count to final output

### Removed
* Run tests on node 15.

## [1.1.0] - 2021-10-01
### Changed
* Improve `no-unused-variables` to handle spaces on usage.
* Improve `file-name` on `camelCase` to allow acronyms.

## [1.0.0] - 2021-09-27
### Changed
* Rename project to [gplint](https://github.com/gplint/gplint).
* Improve console output when using stylish, adding column number and error level.
* Improve rule `no-dupe-scenario-names` allowing to validate scenario names after replace the example variables.
* Update Gherkin to the latest version.

## [PRE]
All the previous work from https://github.com/vsiakka/gherkin-lint
