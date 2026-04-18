

"use client";

import React from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";

const ParticipatedEventsPage: React.FC = () => {
  const events = useEvents();
  const userId = Number(localStorage.getItem("userId"));

  // Filter: finished + user is participant
  const participatedEvents = events.filter(
    (e: any) =>
      e.state === "FINISHED" &&
      e.participants?.some((p: any) => p.id === userId)
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title="Participated Events" rightContent={<UserAvatar />} />

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            
          }}
        >
          {participatedEvents.length === 0 ? (
            <p style={{ color: "#1a1a1a" }}>No past participated events</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {participatedEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipatedEventsPage;