import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: { tsgo: true },
    entry: ["src/index.ts"],
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
});
