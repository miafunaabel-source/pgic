import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ background: "#3b82f6", width: 192, height: 192, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 32 }}>
        <span style={{ color: "white", fontSize: 120, fontWeight: 900, fontFamily: "sans-serif" }}>P</span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
