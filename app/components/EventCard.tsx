// import React from "react";

// interface EventCardProps {
//   event: any;
// }

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleString();
// };

// const getDuration = (start: string, end: string) => {
//   const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
//   return `${diff} min`;
// };

// const EventCard: React.FC<EventCardProps> = ({ event }) => {
//   return (
//     <div
//       style={{
//         background: "#fff",
//         borderRadius: 12,
//         padding: 16,
//         boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//       }}
//     >
//       {/* Emojis */}
//       <div style={{ fontSize: 24, marginBottom: 12 }}>
//         {event.emojis}
//       </div>

//       {/* Title style={{ color: "#1a1a1a" }}*/}
//       <div style={{ fontWeight: 600, color: "#1a1a1a"}}>{event.title}</div>

//       {/* Date */}
//       <div style={{ color: "#1a1a1a" }}>{formatDate(event.startDatetime)}</div>

//       {/* Duration */}
//       <div style={{ color: "#1a1a1a" }}>{getDuration(event.startDatetime, event.endDatetime)}</div>

//       {/* Participants */}
//       <div style={{ color: "#1a1a1a" }}>{event.participants?.length || 0} Registered</div>
//     </div>
//   );
// };

// export default EventCard;

"use client";

import React from "react";
import { Card } from "antd";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  title?: string;
  name?: string;
  emojis: string;
  startDatetime?: string;
  endDatetime?: string;
  startDate?: string;
  endDate?: string;
  participants?: any[];
  participantCount?: number;
}

interface Props {
  event: Event;
}

const EventCard: React.FC<Props> = ({ event }) => {
  const router = useRouter();

  const title = event.title || event.name || "Untitled Event";
  const start = event.startDatetime || event.startDate;
  const end = event.endDatetime || event.endDate;

  const participantCount =
    event.participantCount ?? event.participants?.length ?? 0;

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
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 16,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            >
              calendar_today
            </span>
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
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 16,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            >
              timer
            </span>
            {Math.round(
              (new Date(end).getTime() - new Date(start).getTime()) / 60000
            )}{" "}
            min
          </div>
        )}

        {/* Participants */}
        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 16,
              verticalAlign: "middle",
              marginRight: 6,
            }}
          >
            group
          </span>
          {participantCount} joined
        </div>
      </div>
    </Card>
  );
};

export default EventCard;