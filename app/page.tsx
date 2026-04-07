"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div
      className={styles.page}
      style={{
        backgroundColor: "#4b6624",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <main
        style={{
          width: "100%",
          height: "100%",
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <h1
            style={{
              fontSize: "7vw",
              margin: 0,
              paddingLeft: "3vw",
              paddingTop: "0.5vh",
              lineHeight: 1.1,
              fontWeight: "bold",
            }}
          >
            M2
          </h1>

          <div style={{ width: "100%", height: "1px", background: "#fff" }} />

          <h1
            style={{
              fontSize: "7vw",
              margin: 0,
              paddingLeft: "3vw",
              lineHeight: 1.1,
              fontWeight: "bold",
            }}
          >
            cookREAL
          </h1>

          <div style={{ width: "100%", height: "1px", background: "#fff" }} />

          <NorthEastIcon // arrow
            style={{
              position: "absolute",
              top: "-7.5vh",
              right: "-10vw",
              fontSize: "40vw",
              color: "#fff",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            paddingLeft: "3vw",
            paddingTop: "2vh",
            fontSize: "1.4vw",
            lineHeight: "2.8vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <p style={{ margin: 0 }}>Finn Döbele,</p>
          <p style={{ margin: 0 }}>Valentin Fröhlich,</p>
          <p style={{ margin: 0 }}>Ehad Evgin,</p>
          <p style={{ margin: 0 }}>Jean-Pierre Schlumpf,</p>
          <p style={{ margin: 0 }}>Sushant Gupta</p>
        </div>

        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // group 12 left and button to the right
              alignItems: "center",
              gap: "1vw",
              paddingRight: "3vw",
              paddingLeft: "3vw",
              paddingBottom: "1vh",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.4vw" }}>Group 12</p>

            <div style={{ display: "flex", gap: "1vw" }}>
              <Button
                variant="contained"
                onClick={() => router.push("/login")}
                sx={{
                  backgroundColor: "#fff",
                  fontSize: "0.9vw",
                  padding: "0.8vw 1.5vw",
                  color: "#4b6624",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#a7a7a7",
                    color: "#4b6624",
                    boxShadow: "none",
                  },
                }}
              >
                LOGIN
              </Button>

              <Button
                variant="outlined"
                onClick={() => router.push("/signup")}
                sx={{
                  borderColor: "#fff",
                  color: "#fff",
                  fontSize: "0.9vw",
                  padding: "0.8vw 1.5vw",
                  "&:hover": {
                    color: "#a7a7a7",
                    borderColor: "#a7a7a7",
                  },
                }}
              >
                SIGN UP
              </Button>
            </div>
            
          </div>

          <div style={{ width: "100%", height: "1px", background: "#fff" }} />
        </div>
      </main>
    </div>
  );
}