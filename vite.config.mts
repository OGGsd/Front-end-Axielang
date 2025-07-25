import react from "@vitejs/plugin-react-swc";
import * as dotenv from "dotenv";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import {
  API_ROUTES,
  BASENAME,
  PORT,
  PROXY_TARGET,
} from "./src/customization/config-constants";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const envBackendResult = dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
  });

  const envBackend = envBackendResult.parsed || {};

  const apiRoutes = API_ROUTES || ["^/api/v1/", "^/api/v2/", "/health"];

  const target =
    env.VITE_BACKEND_URL || env.VITE_PROXY_TARGET || PROXY_TARGET || "https://agentplatform-6rol5.ondigitalocean.app";

  const port = Number(env.VITE_PORT) || PORT || 3000;

  const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
    proxyObj[route] = {
      target: target,
      changeOrigin: true,
      secure: false,
      ws: true,
    };
    return proxyObj;
  }, {});

  // Add documentation proxy for development
  const docsTarget = env.VITE_DOCS_URL || "http://localhost:3001";
  proxyTargets["/docs"] = {
    target: docsTarget,
    changeOrigin: true,
    secure: false,
    ws: true,
    rewrite: (path) => path.replace(/^\/docs/, '/docs'),
  };

  return {
    base: BASENAME || "",
    build: {
      outDir: "build",
    },
    define: {
      "process.env.BACKEND_URL": JSON.stringify(
        env.VITE_BACKEND_URL || (envBackend.BACKEND_URL ?? "https://agentplatform-6rol5.ondigitalocean.app"),
      ),
      "process.env.ACCESS_TOKEN_EXPIRE_SECONDS": JSON.stringify(
        envBackend.ACCESS_TOKEN_EXPIRE_SECONDS ?? 60,
      ),
      "process.env.CI": JSON.stringify(envBackend.CI ?? false),
      "process.env.AXIE_STUDIO_AUTO_LOGIN": JSON.stringify(
        envBackend.AXIE_STUDIO_AUTO_LOGIN ?? false,
      ),
      "process.env.AXIE_STUDIO_FEATURE_MCP_COMPOSER": JSON.stringify(
        envBackend.AXIE_STUDIO_FEATURE_MCP_COMPOSER ?? "false",
      ),
      // NO CACHE - Cache busting version
      "process.env.VITE_CACHE_BUST": JSON.stringify(
        env.VITE_CACHE_BUST ?? "2024-12-19-v4-production",
      ),
    },
    plugins: [react(), svgr(), tsconfigPaths()],
    server: {
      port: port,
      proxy: {
        ...proxyTargets,
      },
    },
  };
});
