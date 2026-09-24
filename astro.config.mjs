// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Dominio final (subdominio en GitHub Pages con dominio personalizado).
  // Con dominio propio el sitio se sirve desde la raíz, por eso base = "/".
  site: "https://quinquen.matiaslaporta.com",
  base: "/",
  vite: {
    plugins: [tailwindcss()],
  },
});
