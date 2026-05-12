"use client";

import React, { useEffect, useState, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";

type Participant = {
  id: number;
};

type Event = {
  id: number;
  title?: string;
  state?: string;
  participants?: Participant[];
  creator?: { id: number; name?: string };
};

const RegisteredEventsPage: React.FC = () => {
  const events = useEvents();

  //  load from localStorage AFTER mount
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(Number(stored));
    }
  }, []);

  const registeredEvents = useMemo(() => {
    if (userId === null) return [];

    return (events as Event[]).filter((e) => {
      const isCreator = Number(e.creator?.id) === userId;

      const isParticipant =
        Array.isArray(e.participants) &&
        e.participants.some((p) => Number(p.id) === userId);

      const isUpcoming = e.state === "UPCOMING";

      console.log("CHECK:", {
        eventId: e.id,
        isCreator,
        isParticipant,
        isUpcoming,
        userId,
        creatorId: e.creator?.id,
      });

      return isUpcoming && (isCreator || isParticipant);
    });
  }, [events, userId]);

  console.log("REGISTERED EVENTS:", registeredEvents);

  return (
    <PageLayout title="Registered Events">
      {userId === null ? (
        <p style={{ color: "#888" }}>Loading...</p>
      ) : registeredEvents.length === 0 ? (
        <p style={{ color: "#1a1a1a" }}>
          No upcoming registered events
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {registeredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default RegisteredEventsPage;