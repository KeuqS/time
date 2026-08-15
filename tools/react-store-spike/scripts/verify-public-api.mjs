import { readFile } from "node:fs/promises";

const declarations = await readFile("dist/index.d.mts", "utf8");
const typedConsumer = await readFile("tests/typed-custom-view.test.tsx", "utf8");
const declarationLeaks = ["jotai", "any", "unknown"].filter((token) =>
  declarations.match(new RegExp(`\\b${token}\\b`, "iu")),
);

if (declarationLeaks.length > 0) {
  throw new Error(`Public declarations leaked forbidden tokens: ${declarationLeaks.join(", ")}`);
}

if (/\bas\s+(?:const|unknown|any|[A-Z])/u.test(typedConsumer)) {
  throw new Error("The public custom-view consumer fixture uses a TypeScript cast.");
}

if (/\bjotai\b/iu.test(typedConsumer)) {
  throw new Error("The public custom-view consumer fixture imports or names Jotai.");
}

process.stdout.write("Public API proof passed: no Jotai declaration leak and no consumer casts.\n");
