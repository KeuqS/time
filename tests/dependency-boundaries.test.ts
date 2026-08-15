import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { cruise, type IConfiguration, type ICruiseResult } from "dependency-cruiser";
import { describe, expect, test } from "vite-plus/test";

import dependencyCruiserConfig from "../dependency-cruiser.config.ts";

const productionRoots = ["apps", "benchmarks", "packages", "registry", "tools"];
const invalidFixtureRoot = "tests/fixtures/dependency-boundaries";

const expectedWorkspaceDependencies = {
  "@moltenship/calendar": ["@moltenship/calendar-core", "@moltenship/calendar-react"],
  "@moltenship/calendar-core": ["@moltenship/calendar-temporal"],
  "@moltenship/calendar-dnd": ["@moltenship/calendar-core", "@moltenship/calendar-react"],
  "@moltenship/calendar-react": ["@moltenship/calendar-core"],
  "@moltenship/calendar-recurrence": ["@moltenship/calendar-core", "@moltenship/calendar-temporal"],
  "@moltenship/calendar-temporal": [],
  "@moltenship/calendar-testing": [
    "@moltenship/calendar",
    "@moltenship/calendar-dnd",
    "@moltenship/calendar-temporal",
  ],
  benchmark: ["@moltenship/calendar-core", "@moltenship/calendar-react", "fixtures"],
  fixtures: ["@moltenship/calendar-core"],
  registry: [],
  showcase: ["@moltenship/calendar"],
  "ssr-fixture": ["@moltenship/calendar"],
} as const;

const workspaceManifestPaths = [
  "apps/showcase/package.json",
  "apps/ssr-fixture/package.json",
  "benchmarks/package.json",
  "packages/calendar/package.json",
  "packages/calendar-core/package.json",
  "packages/calendar-dnd/package.json",
  "packages/calendar-react/package.json",
  "packages/calendar-recurrence/package.json",
  "packages/calendar-temporal/package.json",
  "packages/calendar-testing/package.json",
  "tools/fixtures/package.json",
  "tools/registry/package.json",
] as const;

async function cruiseWithArchitectureRules(roots: string[]) {
  const { forbidden, options } = dependencyCruiserConfig satisfies IConfiguration;
  const result = await cruise(roots, {
    ...options,
    ruleSet: { forbidden },
    validate: true,
  });

  expect(typeof result.output).not.toBe("string");
  return result.output as ICruiseResult;
}

describe("workspace boundaries", () => {
  test("production source obeys the dependency rules", async () => {
    const result = await cruiseWithArchitectureRules(productionRoots);

    expect(result.summary.violations).toEqual([]);
  });

  test("a deliberately invalid deep import fails the boundary rule", async () => {
    const result = await cruiseWithArchitectureRules([invalidFixtureRoot]);
    const violatedRules = result.summary.violations.map(({ rule }) => rule.name);

    expect(violatedRules).toContain("no-calendar-temporal-deep-imports");
    expect(violatedRules).toContain("no-package-source-specifiers");
  });

  test("workspace manifests encode only the approved import direction", async () => {
    const actualDependencies = Object.fromEntries(
      await Promise.all(
        workspaceManifestPaths.map(async (manifestPath) => {
          const manifest = JSON.parse(
            await readFile(join(process.cwd(), manifestPath), "utf8"),
          ) as {
            dependencies?: Record<string, string>;
            name: string;
          };
          const workspaceDependencies = Object.entries(manifest.dependencies ?? {})
            .filter(([, version]) => version.startsWith("workspace:"))
            .map(([name]) => name)
            .sort();

          return [manifest.name, workspaceDependencies] as const;
        }),
      ),
    );

    expect(actualDependencies).toEqual(expectedWorkspaceDependencies);
  });

  test.each(["calendar-core", "calendar-temporal"])(
    "%s compiles without DOM or ambient package types",
    async (packageName) => {
      const tsconfig = JSON.parse(
        await readFile(join(process.cwd(), "packages", packageName, "tsconfig.json"), "utf8"),
      ) as { compilerOptions: { lib: string[]; types: string[] } };

      expect(tsconfig.compilerOptions.lib).toEqual(["ES2023"]);
      expect(tsconfig.compilerOptions.types).toEqual([]);
    },
  );
});
