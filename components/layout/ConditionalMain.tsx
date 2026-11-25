"use client";
import { usePathname } from "next/navigation";
import DemoBanner from "./DemoBanner";
import { isFullScreenRoute } from "./fullScreenRoutes";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = isFullScreenRoute(pathname);
  return (
    <main className={`flex-1 overflow-auto min-h-screen${noPadding ? "" : " p-6"}`}>
      {!noPadding && <DemoBanner />}
      {children}
    </main>
  );
}
