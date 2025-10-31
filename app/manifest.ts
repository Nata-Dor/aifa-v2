// app/manifest.ts
import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app-config";

export const dynamic = "force-static"; 

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appConfig.name.trim(),
    short_name: appConfig.short_name.trim(),
    description: appConfig.description,
    start_url: appConfig.pwa.startUrl,
    display: appConfig.pwa.display,
    background_color: appConfig.pwa.backgroundColor,
    theme_color: appConfig.pwa.themeColor,
    

    icons: [
      // Icon 32x32
      appConfig.icons?.icon32 && {
        src: appConfig.icons.icon32, 
        type: "image/png",
        purpose: "any"
      },
      
      // Icon 48x48
      appConfig.icons?.icon48 && {
        src: appConfig.icons.icon48, 
        sizes: "48x48",
        type: "image/png",
        purpose: "any"
      },
      
      // Android Chrome 192x192 (required for PWA)
      appConfig.icons?.icon192 && {
        src: appConfig.icons.icon192, 
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      
      // Android Chrome 512x512 (required for PWA)
      appConfig.icons?.icon512 && {
        src: appConfig.icons.icon512, 
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      
      // Apple Touch Icon (180x180)
      appConfig.icons?.appleTouch && {
        src: appConfig.icons.appleTouch, 
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
    ].filter(Boolean) as NonNullable<MetadataRoute.Manifest["icons"]>,
  };
}
