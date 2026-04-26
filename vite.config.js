import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiHost = env.HOST || "127.0.0.1";
  const apiPort = Number(env.PORT) || 4000;

  return {
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: {
        "/api": `http://${apiHost}:${apiPort}`,
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
