// @ts-nocheck
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["dot"],
    environment: "node",
    exclude: [
      ...configDefaults.exclude,
      "tests/visual/**",
    ],
    include: [
      "tests/**/*.test.*",
      "apps/**/src/**/*.test.*",
      "packages/**/src/**/*.test.*",
    ],
    coverage: {
      provider: "v8",
      all: false,                           // only files touched by tests
      reportsDirectory: "coverage",
      reporter: ["text", "lcov", "html", "json"],
      include: [
        "apps/api/src/**",
        "packages/core/src/**"
      ],
      exclude: [
        // UI and non-phase code
        "apps/web/**",
        "apps/**/.next/**",
        "apps/**/dist/**",
        "apps/**/build/**",
        "packages/**/dist/**",
        "node_modules/**",
        "scripts/**",
        "coverage/**",
        "vitest.config.*",
        // nested repo if present
        "optra-erp/**",
        // types/mocks
        "**/*.d.ts",
        "**/__mocks__/**"
      ],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 75,
        statements: 80,
      },
    },
  },
});
