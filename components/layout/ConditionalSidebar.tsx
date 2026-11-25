"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { isFullScreenRoute } from "./fullScreenRoutes";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  if (isFullScreenRoute(pathname)) return null;
  return <Sidebar />;
}
