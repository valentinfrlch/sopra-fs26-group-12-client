

"use client";

import React, { useEffect, useState }  from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";

const RegisteredEventsPage: React.FC = () => {
  const events = useEvents();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(Number(stored));
    }
  }, []);

  // Filter: upcoming + user is participant
  const registeredEvents = events.filter(
    (e: any) =>
      userId !== null &&
      e.state === "UPCOMING" &&
      e.participants?.some((p: any) => p.id === userId)
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title="Registered Events" rightContent={<UserAvatar />} />

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
          }}
        >
          {registeredEvents.length === 0 ? (
            <p style={{ color: "#1a1a1a" }}>No upcoming registered events</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {registeredEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredEventsPage;