const base = require('./base');

module.exports = {
  ...base,
  // Note: parserOptions.project should be set by consuming apps
  // with tsconfigRootDir to properly resolve the tsconfig.json path
  extends: [
    ...base.extends,
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
};

