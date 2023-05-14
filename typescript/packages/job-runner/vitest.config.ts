import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "HGraph API",
    setupFiles: [],
    useAtomics: true,
    env: {
      SQL_URI:
        "postgres://postgres:postgres@localhost:5432/hgraph-test?sslmode=disable",
    },
  },
});
