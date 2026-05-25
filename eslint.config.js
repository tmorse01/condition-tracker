import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.d.ts",
      "**/tsconfig.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["apps/api/src/**/*.ts", "packages/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-console": "off",
    },
  },
];
