import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    deps: { onlyBundle: false },
    dts: { tsgo: true },
    entry: ["src/index.ts"],
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
  run: {
    tasks: {
      test: {
        command: "vp test",
        dependsOn: [{ task: "build", from: "dependencies" }],
      },
      smoke: {
        command: "node src/smoke.ts",
        dependsOn: [{ task: "build", from: "dependencies" }],
      },
      "fixture:bad-hydration": {
        command: "node tests/fixtures/known-bad-hydration.ts",
        cache: false,
        dependsOn: [{ task: "build", from: "dependencies" }],
      },
      "fixture:bad-browser-global": {
        command: "node tests/fixtures/known-bad-browser-global.ts",
        cache: false,
      },
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
