import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ background: "#3b82f6", width: 512, height: 512, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 80 }}>
        <span style={{ color: "white", fontSize: 320, fontWeight: 900, fontFamily: "sans-serif" }}>P</span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
