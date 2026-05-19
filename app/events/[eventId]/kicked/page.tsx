"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@mui/material";

export default function KickedPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();

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

      <p style={{ marginTop: 20, maxWidth: 400, textAlign: "center", color: "black" }}>
        You didn't upload a photo of your meal, so you've been kicked.
      </p>

      <Button
        onClick={() => router.push("/events/overview")}
        variant="contained"
        sx={{
          mt: 2,
          backgroundColor: "#4b6624",
          color: "white",
          borderRadius: "12px",
          textTransform: "none",
          padding: "10px 20px",
          "&:hover": {
          backgroundColor: "#3e521d",
          },
        }}
>
  Go to Homepage
</Button>
    </div>
  );
}