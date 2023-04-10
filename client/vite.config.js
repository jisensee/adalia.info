import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

export default defineConfig({
  plugins: [reactRefresh()],
  clearScreen: false,
  server: {
    proxy: {
      "/graphql": {
        target: "https://localhost",
        changeOrigin: true,
        secure: false,
      },
      "/exports": {
        target: "https://localhost",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
