import { deterministicEnvironment } from "./fixture.ts";
import { runHydrationScenario } from "./hydration-harness.ts";

const report = await runHydrationScenario({
  serverEnvironment: deterministicEnvironment,
  clientEnvironment: deterministicEnvironment,
  interact: true,
});

if (report.recoverableErrors.length > 0) {
  throw new Error(
    `SSR hydration emitted recoverable errors: ${report.recoverableErrors.join(" | ")}`,
  );
}
if (!report.hydratedWithoutMutation) {
  throw new Error("SSR hydration mutated deterministic server markup");
}
if (report.interactionCount !== 1) {
  throw new Error(`SSR interaction did not commit exactly once: ${report.interactionCount}`);
}
if (!report.unmounted) {
  throw new Error("SSR fixture did not unmount cleanly");
}

console.log(`SSR_SMOKE ${JSON.stringify(report)}`);
