"use client";

import { useEffect, useState } from "react";
import Sidebar, { UserAvatar } from "@/components/appLayout";

interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

export default function ParticipatedEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [username, setUsername] = useState("U");

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);

    // TEMP: mock data until backend works
    setEvents([
      {
        id: 1,
        title: "Pizza Night",
        startTime: "2025-03-01T18:00:00",
        endTime: "2025-03-01T20:00:00"
      },
      {
        id: 2,
        title: "Burger Fest",
        startTime: "2025-03-10T18:00:00",
        endTime: "2025-03-10T20:00:00"
      }
    ]);
  }, []);

  const pastEvents = events.filter(
    (e) => new Date(e.endTime) < new Date()
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
            Participated Events
          </span>
          <UserAvatar username={username} size={40} />
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>

          {pastEvents.length === 0 ? (
            <p style={{ color: "#555" }}>No past events</p>
          ) : (
            <ul style={{ paddingLeft: 20, color: "#1a1a1a"}}>
              {pastEvents.map((event) => (
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
                        Ended on: {new Date(event.endTime).toLocaleString()}
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