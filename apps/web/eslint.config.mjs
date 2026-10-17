import { nextJsConfig } from "../../packages/eslint-config/next.js";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,tsx}"] },
  ...nextJsConfig,
  {
    files: ["**/*.tsx"],
    languageOptions: {
      parserOptions: {
        babelOptions: {
          presets: ["@babel/preset-typescript"],
          parserOpts: { plugins: ["jsx"] },
        },
      },
    },
  },
  { files: ["**/*.{ts,tsx}"], rules: { "no-undef": "off", "no-unused-vars": "off" } },
];
