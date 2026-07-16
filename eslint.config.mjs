import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const webConfig = compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
  ...config,
  files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
}));

const apiConfig = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ["apps/api/**/*.ts", "scripts/**/*.mjs"],
}));

export default [
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/node_modules/**",
      "apps/web/next-env.d.ts",
      ".qa/**",
    ],
  },
  ...webConfig,
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    settings: {
      next: { rootDir: "apps/web" },
    },
  },
  ...apiConfig,
  {
    files: ["apps/**/*.{js,jsx,ts,tsx}", "scripts/**/*.mjs"],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
