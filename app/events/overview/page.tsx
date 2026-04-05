
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import Sidebar from "@/components/appLayout";


const EventsPage: React.FC = () => {
    const router = useRouter();

    return (

        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>

            <Sidebar />

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>



                <div style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} /> */}
                        <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Events</span>
                    </div>
                </div>

            </div>

            <Button
                type="button"
                variant="contained"
                startIcon={
                    <span className="material-symbols-rounded"
                        style={{
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            lineHeight: 1,
                        }}
                    >
                        add
                    </span>}
                onClick={() => router.push("/events/create")}
                style={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    borderRadius: 24,
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 20,
                    fontWeight: 600,
                    background: "#4a6741",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                }}>
                Event
            </Button>
        </div>
    );
};

export default EventsPage;
