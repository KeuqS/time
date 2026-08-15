import { deterministicEnvironment } from "../../src/fixture.ts";
import { runHydrationScenario } from "../../src/hydration-harness.ts";

const report = await runHydrationScenario({
  serverEnvironment: deterministicEnvironment,
  clientEnvironment: {
    ...deterministicEnvironment,
    locale: "fr-FR",
  },
  interact: false,
});

const reason = report.recoverableErrors.at(0);
if (!reason) throw new Error("Known-bad hydration fixture unexpectedly matched");
throw new Error(`KNOWN_BAD_HYDRATION: ${reason}`);
