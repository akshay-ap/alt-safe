import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind to all interfaces so the dev server is reachable from outside the dev container.
  server: { host: true, port: 5173, strictPort: true },
});
