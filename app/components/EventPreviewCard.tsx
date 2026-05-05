"use client";

import React from "react";
import { Card } from "antd";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  title: string;
  emojis?: string;
  endDatetime: string;
  startDatetime: string;
}

interface EventPreviewCardProps {
  title: string;
  events: Event[];
  emptyMessage: string;
  onHeaderClick: () => void;
  dateType: "start" | "end";
}

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({
  title,
  events,
  emptyMessage,
  onHeaderClick,
  dateType,
}) => {
  const router = useRouter();

  return (
    <Card style={{ background: "#fff", border: "none", borderRadius: 12 }}>
      
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onHeaderClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") onHeaderClick();
        }}
        style={{
          color: "#504e4e",
          fontSize: 13,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        {title} ›
      </div>

      {/* Content */}
      <div
        style={{
          height: 140,
          background: "#f0f0f0",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
        }}
      >
        {events.length === 0 ? (
          <div style={{ margin: "auto", color: "#888" }}>
            {emptyMessage}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 8px",
              justifyContent: "center",
              width: "100%",  
            }}
          >
            {events.map((event) => (
            <div
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/events/${event.id}`)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    router.push(`/events/${event.id}`);
                    }
                }}
                style={{
                    minWidth: 220,
                    height: 130,
                    borderRadius: 12,
                    background: "#fff",
                    border: "1px solid #e8e8e8",
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                }}
                >
                {/* Emojis */}
                <div style={{ fontSize: 20 }}>
                    {event.emojis || "🍳🔥"}
                </div>

                {/* Divider */}
                <div
                    style={{
                    width: "90%",
                    height: 1,
                    background: "#000",
                    opacity: 0.6,
                    margin: "4px 0",
                    }}
                />

                {/* Title + Date */}
                <div style={{ width: "100%" }}>
                    <div
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#020202",
                    }}
                    >
                    Title: {event.title}
                    </div>

                    <div
                    style={{
                        fontSize: 11,
                        color: "#080808",
                        marginTop: 8,
                    }}
                    >
                    {dateType === "start" ? "Start Date: " : "End Date: "}
                    {new Date(
                    dateType === "start" ? event.startDatetime : event.endDatetime
                    ).toLocaleDateString()}
                    </div>
                </div>
                </div>
             ))
        }
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventPreviewCard;