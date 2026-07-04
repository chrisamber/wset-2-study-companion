import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated build output from nested git worktrees under .claude/ — never
    // source. The default ignores above are anchored to the project root, so
    // they miss these. Match these dirs at any depth.
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
