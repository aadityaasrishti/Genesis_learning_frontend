import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      https: {
        cert: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_CERT_PATH)),
        key: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_KEY_PATH)),
      },
      host: env.VITE_APP_HOST === 'true',
      port: parseInt(env.VITE_APP_PORT) || 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "https://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: env.VITE_API_BASE_URL || "https://localhost:5000",
          changeOrigin: true,
          secure: false,
        }
      },
      headers: {
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Origin, Content-Type, Accept, Range, Authorization",
        "Content-Security-Policy": [
          "default-src 'self'",
          "connect-src 'self' https: wss:",
          "frame-src 'self' https: blob: data:",
          "worker-src 'self' blob:",
          "frame-ancestors 'self' *",
          "img-src 'self' blob: data: https:",
          "media-src 'self' blob: data: https:",
          "object-src 'self' blob: data:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self' data:"
        ].join("; "),
      },
    },
  };
});
