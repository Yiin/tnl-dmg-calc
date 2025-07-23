import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === "production" ? "/tnl-dmg-calc/" : "/";

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
