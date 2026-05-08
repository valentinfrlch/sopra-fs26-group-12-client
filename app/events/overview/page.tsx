
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TimerIcon from "@mui/icons-material/Timer";
import GroupIcon from "@mui/icons-material/Group";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { Card } from "antd";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import useWindowSize from "@/hooks/useWndowSize";
import { CircularProgress } from "@mui/material";


interface CookingEvent {
    id: string;
    title: string;
    emojis: string;
    startDatetime: string;
    endDatetime: string;
    participants: { id: string; username: string }[];
    state: "UPCOMING" | "ONGOING" | "FINISHED";
}

const REFRESH_MS = 15_000;

const EventsPage: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const { isMobile } = useWindowSize();
    const { value: rawToken } = useLocalStorage<string>("token", "");
    const token = rawToken?.replace(/^"|"$/g, "");

    const [events, setEvents] = useState<CookingEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"upcoming" | "running">("upcoming");

    useEffect(() => {
        if (!token) { setLoading(false); return; }

        let cancelled = false;
        let isFirst = true;

        const fetchEvents = () => {
            if (isFirst) setLoading(true);
            apiService
                .get<CookingEvent[]>("/events", { Authorization: `Bearer ${token}` })
                .then((data) => { if (!cancelled) setEvents(data); })
                .catch(console.error)
                .finally(() => {
                    if (isFirst && !cancelled) setLoading(false);
                    isFirst = false;
                });
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [token]);

    if (loading) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress size={40} sx={{ color: "#4a6741" }} />
                </div>
            </div>
        );
    }

    const upcomingEvents = events.filter(e => e.state === "UPCOMING");
    const liveEvents = events.filter(e => e.state === "ONGOING");

    const renderEventGrid = (list: CookingEvent[], emptyMessage: string) => (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16, marginBottom: 32 }}>
                {list.map((event) => (
                    <Card
                        key={event.id}
                        hoverable
                        onClick={() => router.push(`/events/${event.id}`)}
                        style={{ borderRadius: 16, background: "#fff", border: "none", cursor: "pointer" }}
                        styles={{ body: { padding: 0 } }}
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

                        <div style={{ padding: 16 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>
                                {event.title}
                            </div>

                            <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                                <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
                                {new Date(event.startDatetime).toLocaleDateString()} · {new Date(event.startDatetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>

                            <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                                <TimerIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
                                {Math.round((new Date(event.endDatetime).getTime() - new Date(event.startDatetime).getTime()) / 60000)} min
                            </div>

                            <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                                <GroupIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
                                {event.participants?.length ?? 0} joined
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {list.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", gap: 12 }}>
                    <EventBusyIcon sx={{ fontSize: 48, color: "#ccc" }} />
                    <p style={{ color: "#999", fontSize: 15 }}>{emptyMessage}</p>
                </div>
            )}
        </>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                <Header
                    title="Events"
                    rightContent={<UserAvatar />}
                />

                {/* Content */}
                <div style={{ padding: 24, flex: 1 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, value) => setActiveTab(value as "upcoming" | "running")}
                        textColor="inherit"
                        TabIndicatorProps={{ style: { backgroundColor: "#4a6741", height: 3 } }}
                        sx={{
                            borderBottom: "1px solid #e0e0e0",
                            marginBottom: 2,
                            "& .MuiTab-root": {
                                color: "#666",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                minHeight: 44,
                            },
                            "& .MuiTab-root.Mui-selected": {
                                color: "#1a1a1a",
                            },
                        }}
                    >
                        <Tab value="upcoming" label="Upcoming" />
                        <Tab value="running" label="Running" />
                    </Tabs>

                    {activeTab === "upcoming" && renderEventGrid(upcomingEvents, "No upcoming events. Create the first one!")}
                    {activeTab === "running" && renderEventGrid(liveEvents, "No events are running right now.")}
                </div>
            </div>


            <Button
                type="button"
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                onClick={() => router.push("/events/create")}
                style={{
                    position: "fixed",
                    bottom: isMobile ? 80 : 32,
                    right: isMobile ? 16 : 32,
                    borderRadius: 24,
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 20,
                    fontWeight: 600,
                    background: "#4a6741",
                    border: "none",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    zIndex: 1400,
                }}>
                Event
            </Button>
        </div>
    );
};

export default EventsPage;
