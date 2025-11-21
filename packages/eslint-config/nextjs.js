import nextConfig from "eslint-config-next";
import baseConfig from "./eslint.config.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...nextConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
