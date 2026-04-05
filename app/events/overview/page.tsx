
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { Card } from "antd";
import Sidebar from "@/components/appLayout";

// This is just temporary/placeholder (will be later replaced with actual data from events (API call))
const PLACEHOLDER_EVENTS = [
    { id: 1, title: "Pizza", emojis: "🍕🧄🍅", startDatetime: "2026-04-10T18:00:00Z", endDatetime: "2026-04-10T19:00:00Z" },
    { id: 2, title: "Sushi", emojis: "🍣🥢🐟", startDatetime: "2026-04-12T17:00:00Z", endDatetime: "2026-04-12T18:30:00Z" },
    { id: 3, title: "Taco", emojis: "🌮🫑🧀", startDatetime: "2026-04-15T19:00:00Z", endDatetime: "2026-04-15T20:00:00Z" },
    { id: 4, title: "Pasta", emojis: "🍝🧈🌿", startDatetime: "2026-04-18T18:30:00Z", endDatetime: "2026-04-18T19:30:00Z" },
    { id: 5, title: "Curry", emojis: "🍛🌶️🥥", startDatetime: "2026-04-20T18:00:00Z", endDatetime: "2026-04-20T19:15:00Z" },
    { id: 6, title: "Burger", emojis: "🍔🥬🧅", startDatetime: "2026-04-22T19:00:00Z", endDatetime: "2026-04-22T20:00:00Z" },
];


const EventsPage: React.FC = () => {
    const router = useRouter();
    const [username, setUsername] = useState("U");


    useEffect(() => {
        const stored = localStorage.getItem("username") ?? "U";
        setUsername(stored);
    }, []);

    const happeningSoon = PLACEHOLDER_EVENTS.slice(0, 3);
    const seasonalEvents = PLACEHOLDER_EVENTS.slice(3);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <div style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} /> */}
                        <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Events</span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 24, flex: 1}}>

                    <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 16}}>Happening soon</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32}}>
                        {happeningSoon.map((event) => (
                            <Card
                                key={event.id}
                                hoverable
                                onClick={() => router.push(`/events/${event.id}`)}
                                style={{ borderRadius: 16, background: "#fff", border: "none", cursor: "pointer"}}
                                styles={{ body: { padding: 0}}}
                            >
                                <div style={{
                                    height: 120,
                                    background: "#f0eef6",
                                    borderRadius: "16px 16px 0 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 40,
                                }}>
                                    {event.emojis}
                                </div>

                                <div style={{ padding: 16}}>
                                    <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a"}}>
                                        {event.title}
                                    </div>
                                    <div style={{ color: "#666", fontSize: 13, marginTop: 4}}>
                                        {new Date(event.startDatetime).toLocaleDateString()} · {new Date(event.startDatetime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 16}}>Seasonal Events</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16}}>
                        {seasonalEvents.map((event) => (
                            <Card
                                key={event.id}
                                hoverable
                                onClick={() => router.push(`/events/${event.id}`)}
                                style={{ borderRadius: 16, background: "#fff", border: "none", cursor: "pointer"}}
                                styles={{ body: { padding: 0}}}
                            >
                                <div style={{
                                    height: 120,
                                    background: "#f0eef6",
                                    borderRadius: "16px 16px 0 0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 40,
                                }}>
                                    {event.emojis}
                                </div>

                                <div style={{ padding: 16}}>
                                    <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a"}}>
                                        {event.title}
                                    </div>
                                    <div style={{ color: "#666", fontSize: 13, marginTop: 4}}>
                                        {new Date(event.startDatetime).toLocaleDateString()} · {new Date(event.startDatetime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>


            <Button
                type="button"
                variant="contained"
                startIcon={
                    <span className="material-symbols-rounded"
                        style={{ fontSize: 20, display: "flex", alignItems: "center", lineHeight: 1 }}>
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
