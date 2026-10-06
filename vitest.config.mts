import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * "server-only" (Vercel paket) namjerno baca grešku van Next.js build-a
 * — Next ga posebno zamjenjuje u svom webpacku, vitest to ne radi.
 * Alias na prazan modul: testovima ne treba ta zaštita (nije browser
 * bundle), samo treba da import ne pukne.
 */
export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "test/empty-module.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
