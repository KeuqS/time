import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: { tsgo: true },
    entry: ["core/index.ts", "react/index.ts"],
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
});
