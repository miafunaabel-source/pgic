"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SetupHandler() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const setup = params.get("setup");
    if (!setup) return;
    try {
      const data = JSON.parse(decodeURIComponent(atob(setup)));
      localStorage.setItem("pgic_company", JSON.stringify(data));
    } catch {}
    // Remove the param from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("setup");
    router.replace(url.pathname + url.search);
  }, [params, router]);

  return null;
}
