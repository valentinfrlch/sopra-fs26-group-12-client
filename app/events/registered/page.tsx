"use client";

import { useEffect, useState } from "react";
import Sidebar, { UserAvatar } from "@/components/appLayout";

interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

export default function RegisteredEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [username, setUsername] = useState("U");

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);

    // TEMP: mock data
    setEvents([
      {
        id: 3,
        title: "Sushi Workshop",
        startTime: "2026-05-01T18:00:00",
        endTime: "2026-05-01T20:00:00"
      },
      {
        id: 4,
        title: "Pasta Night",
        startTime: "2026-06-01T18:00:00",
        endTime: "2026-06-01T20:00:00"
      }
    ]);
  }, []);

  const upcomingEvents = events.filter(
    (e) => new Date(e.startTime) > new Date()
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid #2a2d3a"
        }}>
          <span style={{ fontWeight: 600, fontSize: 20, color: "#1a1a1a" }}>
            Registered Events
          </span>
          <UserAvatar username={username} size={40} />
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>

          {upcomingEvents.length === 0 ? (
            <p style={{ color: "#555" }}>No upcoming events</p>
          ) : (
            <ul style={{ paddingLeft: 20, color: "#1a1a1a" }}>
              {upcomingEvents.map((event) => (
                <li
                    key={event.id}
                    style={{
                        marginBottom: 12,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#333"
                    }}
                    >
                    <div>{event.title}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        Starts on: {new Date(event.startTime).toLocaleString()}
                    </div>
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>
    </div>
  );
}