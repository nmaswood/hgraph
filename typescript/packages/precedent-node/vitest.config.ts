import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "Hgraph",
    setupFiles: [],
    useAtomics: true,
    env: {
      SQL_URI:
        "postgres://postgres:postgres@localhost:5432/hgraph-test?sslmode=disable",
      NEO4J_URI: "neo4j://localhost:7687",
      NEO4J_USERNAME: "neo4j",
      NEO4J_PASSWORD: "password",
      NEO4J_DATABASE: "neo4j",
    },
  },
});
