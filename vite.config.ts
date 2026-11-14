import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@auth/create/react": path.resolve(__dirname, "./src/__create/@auth/create/react.js"),
      "./router-shim": path.resolve(__dirname, "./src/__create/router-shim.js"),
      "virtual:load-fonts.jsx": path.resolve(__dirname, "./src/__create/load-fonts.js"),
    },
  },
});
