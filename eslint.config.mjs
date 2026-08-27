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
    // Minified output of the darknyx-showcase build, vendored into public/ to
    // serve /demo. It is not authored here, and linting it reports hundreds of
    // false positives that would drown real findings.
    "public/demo/**",
  ]),
  {
    rules: {
      // These rules flag valid patterns (early-return setState, one-time ref init).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
    },
  },
]);

export default eslintConfig;
