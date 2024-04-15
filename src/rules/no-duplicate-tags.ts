import _ from 'lodash';

import {GherkinData, GherkinTaggable, RuleError} from '../types.js';

export const name = 'no-duplicate-tags';

export function run({feature}: GherkinData): RuleError[] {
  if (!feature) {
    return [];
  }
  const errors = [] as RuleError[];

  verifyTags(feature, errors);
  feature.children.forEach(child => {
    if (child.scenario) {
      verifyTags(child.scenario, errors);
      child.scenario.examples.forEach(example => {
        verifyTags(example, errors);
      });
    }
  });
  return errors;
}

function verifyTags(node: GherkinTaggable, errors: RuleError[]) {
  const failedTagNames = [] as string[];
  const uniqueTagNames = [] as string[];
  node.tags.forEach(tag => {
    if (!_.includes(failedTagNames, tag.name)) {
      if (_.includes(uniqueTagNames, tag.name)) {
        errors.push({message: 'Duplicate tags are not allowed: ' + tag.name,
          rule   : name,
          line   : tag.location.line,
          column : tag.location.column,
        });
        failedTagNames.push(tag.name);
      } else  {
        uniqueTagNames.push(tag.name);
      }
    }
  });
}
