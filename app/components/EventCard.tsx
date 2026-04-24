

"use client";

import React from "react";
import { Card } from "antd";
import { useRouter } from "next/navigation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TimerIcon from "@mui/icons-material/Timer";
import GroupIcon from "@mui/icons-material/Group";

type Participant = {
    id: number;
  };

interface Event {
  id: number;
  title?: string;
  name?: string;
  emojis?: string;
  startDatetime?: string;
  endDatetime?: string;
  startDate?: string;
  endDate?: string;
  
  participants?: Participant[];
  // participants?: any[];
  participantCount?: number;
  state?: string;
  creator?: {
    id: number;
    name?: string;
  };
}

type Props ={
  event: Event;
}

const EventCard: React.FC<Props> = ({ event }) => {
  const router = useRouter();

  const title = event.title || event.name || "Untitled Event";
  const start = event.startDatetime || event.startDate;
  const end = event.endDatetime || event.endDate;

  const participantCount =
    (event.participants?.length ?? 0);
  return (
    <Card
      hoverable
      onClick={() => router.push(`/events/${event.id}`)}
      style={{
        borderRadius: 16,
        background: "#fff",
        border: "none",
        cursor: "pointer",
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Emoji Banner */}
      <div
        style={{
          height: 120,
          background: "#f0eef6",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
        }}
      >
        {event.emojis}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Title */}
        <div style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>
          {title}
        </div>

        {/* Date */}
        {start && (
          <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
            {new Date(start).toLocaleDateString()} ·{" "}
            {new Date(start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {/* Duration */}
        {start && end && (
          <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
            <TimerIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
            {Math.round(
              (new Date(end).getTime() - new Date(start).getTime()) / 60000
            )}{" "}
            min
          </div>
        )}

        {/* Participants */}
        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
          <GroupIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: "6px" }} />
          {participantCount} joined
        </div>
      </div>
    </Card>
  );
};

export default EventCard;