"use client";
import { usePathname } from "next/navigation";

const NO_PADDING_ROUTES = ["/login", "/unauthorized", "/register"];

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = NO_PADDING_ROUTES.includes(pathname);
  return (
    <main className={`flex-1 overflow-auto min-h-screen${noPadding ? "" : " p-6"}`}>
      {children}
    </main>
  );
}
