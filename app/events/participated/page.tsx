

"use client";

import React from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";



type Participant = {
  id: number;
};

type Event = {
  id: number;
  title?: string;
  state?: string;
  participants?: { id: number }[];
};

const ParticipatedEventsPage: React.FC = () => {
  const events = useEvents();
  const [userId, setUserId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
  }, []);

  // Filter: finished + user is participant
  
  const participatedEvents = React.useMemo(() => {
    if (userId === null) return [];
    return (events as Event[]).filter(
      (e) =>
        e.state === "FINISHED" &&
        e.participants?.some((p) => Number(p.id) === userId)
    );
  }, [events, userId]);

  console.log("All events:", events);
  console.log("userId:", userId, typeof userId);
  console.log(
    "Participant IDs in first event:",
    (events as Event[])[0]?.participants?.map((p) => ({ id: p.id, type: typeof p.id }))
  );
  console.log("Filtered result:", participatedEvents);

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
              {participatedEvents.map((event) => (
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