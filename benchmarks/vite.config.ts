import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: { tsgo: true },
    entry: ["core/index.ts", "react/index.ts"],
    tsconfig: "tsconfig.build.json",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
});
