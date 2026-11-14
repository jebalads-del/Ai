import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      // شيم لتعويض الدالة المفقودة منعاً لفشل البناء
      "./router-shim": path.resolve(__dirname, "./src/__create/router-shim.js"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
