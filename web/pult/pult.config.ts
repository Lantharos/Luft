import { defineConfig } from "@lantharos/pult"

export default defineConfig({
  project: "luft",
  include: ["src/**/*.ts"],
  environments: ["prod"],
  sync: "prod",
})
