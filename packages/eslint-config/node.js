const base = require('./base');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: './tsconfig.json',
  },
  extends: [
    ...base.extends,
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
};

