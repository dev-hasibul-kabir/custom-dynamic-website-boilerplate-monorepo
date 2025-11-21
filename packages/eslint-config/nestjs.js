import baseConfig from "./eslint.config.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Note: parserOptions.project should be set by consuming apps
      // with tsconfigRootDir to properly resolve the tsconfig.json path
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
];
