"use client";

import { useParams } from "next/navigation";

export default function KickedPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ color: "red", fontSize: 32, fontWeight: "bold" }}>
        You are kicked out
      </h1>

      <p style={{ marginTop: 10 }}>
        Event ID: {eventId}
      </p>
    </div>
  );
}