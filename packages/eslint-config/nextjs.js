const base = require('./base');

module.exports = {
  ...base,
  env: {
    ...base.env,
    browser: true,
  },
  extends: [
    ...base.extends,
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [...base.plugins, 'react', 'react-hooks'],
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

