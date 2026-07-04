import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PGIC — Hub Digital Concessionnaire",
    short_name: "PGIC",
    description: "Plateforme de Gestion Intégrée pour Concessionnaires Automobiles",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0f172a",
    theme_color: "#3b82f6",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
