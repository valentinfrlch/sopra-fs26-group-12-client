"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import Sidebar, { UserAvatar } from "@/components/appLayout";
import { Spin } from "antd";
import { Button, ButtonGroup, Avatar, AvatarGroup, Chip, Tooltip } from "@mui/material";

// ---------------------------------------------------------------------------
// ICON COMPONENT
// ---------------------------------------------------------------------------
const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="material-symbols-rounded" style={{ fontSize: size, color: "#4a7c59", display: "flex", alignItems: "center" }}>
    {name}
  </span>
);

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
interface Participant {
  id: string;
  username: string;
}

interface CookingEvent {
  id: string;
  title: string;
  emojis: string;
  ingredients: string[];
  startDatetime: string;
  endDatetime: string;
  participants: Participant[];
  state: "UPCOMING" | "ONGOING" | "FINISHED";
}


// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const getInitials = (name: string): string =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

function formatEventTime(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayName = start.toLocaleDateString("en-US", { weekday: "short" });
  const day = start.getDate();
  const month = start.toLocaleDateString("en-US", { month: "long" });
  const s = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const e = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dayName} ${day} ${month}, ${s} - ${e}`;
}

// ---------------------------------------------------------------------------
// DATA FETCHING
// ---------------------------------------------------------------------------
async function fetchEventData(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  userId: string,
  setEvent: (e: CookingEvent) => void,
  setIsRegistered: (v: boolean) => void,
): Promise<void> {
  const data = await apiService.get<CookingEvent>(
    `/events/${eventId}`,
    { Authorization: `Bearer ${token}` }
  );
  setEvent(data);
  setIsRegistered(data.participants.some((p) => String(p.id) === userId));
}

// ---------------------------------------------------------------------------
// BANNER
// ---------------------------------------------------------------------------
function renderBanner(emojiString?: string): React.ReactNode[] {
  const emojis = emojiString ? (emojiString.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu) || ["🍳", "🥘", "🍽️"]): ["🍳", "🥘", "🍽️"];
  const COLS = 29;
  const ROWS = 3;
  const items: React.ReactNode[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const top = col % 2 === 1
        ? (row / ROWS) * 100 + (100 / ROWS / 2)
        : (row / ROWS) * 100;
      items.push(
        <span
          key={`${col}-${row}`}
          style={{ position: "absolute", fontSize: 36, top: `${top}%`, left: `${(col / COLS) * 100}%`, userSelect: "none", opacity: 0.9 }}
        >
          {emojis[(col + row) % emojis.length]}
        </span>
      );
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// REGISTER / CANCEL
// ---------------------------------------------------------------------------
async function registerForEvent(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  router: ReturnType<typeof useRouter>,
  setRegistering: (v: boolean) => void,
  setIsRegistered: (v: boolean) => void,
  setEvent: (e: CookingEvent) => void,
): Promise<void> {
  if (!token) {
    router.push("/login");
    return;
  }
  setRegistering(true);
  try {
    await apiService.post(`/events/${eventId}/participants`, {}, {Authorization: `Bearer ${token}` });
    setIsRegistered(true);
    const updated = await apiService.get<CookingEvent>(
      `/events/${eventId}`,
      { Authorization: `Bearer ${token}` }
    );
    setEvent(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        setIsRegistered(true);
      }
    }
  } finally {
    setRegistering(false);
  }
}

async function cancelRegistration(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  setIsRegistered: (v: boolean) => void,
  setEvent: (e: CookingEvent) => void,
): Promise<void> {
  try {
    await apiService.delete<void>(`/events/${eventId}/participants`);
    setIsRegistered(false);
    const updated = await apiService.get<CookingEvent>(
      `/events/${eventId}`,
      { Authorization: `Bearer ${token}` }
    );
    setEvent(updated);
  } catch (error) {
    // Error handling
  }
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------
const ParticipantList = ({ participants }: { participants: Participant[] }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
    {participants.length > 0 ? (
      <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 32, height: 32, fontSize: 13, backgroundColor: "#4a7c59"} }}>
        {participants.map((p) => (
          <Tooltip key={p.id} title={p.username} arrow>
            <Avatar sx={{ bgcolor: "#4a7c59" }}>
              {getInitials(p.username)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    ) : (
      <span style={{ color: "#999", fontSize: 13 }}>No participants yet</span>
    )}
  </div>
);

const CenteredScreen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      {children}
    </div>
  </div>
);

const LoadingScreen = () => (
  <CenteredScreen>
    <Spin size="large" />
    <p style={{ color: "#666" }}>Loading event details…</p>
  </CenteredScreen>
);

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <CenteredScreen>
    <p>Event not found.</p>
    <Button onClick={onBack}>← Go Back</Button>
  </CenteredScreen>
);


const StatusBadge = ({ state }: { state: CookingEvent["state"] }) => {
  const config = state === "ONGOING"
    ? { label: "Live now", color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6aa7", icon: "radio_button_checked"}
    : state === "FINISHED"
    ? { label: "Ended", color: "#555", bg: "#f5f5f5", border: "#ccc", icon: "check_circle" }
    : { label: "Upcoming", color: "#1565c0", bg: "#e3f2fd", border: "#90caf9", icon: "schedule" };

  return (
    <Chip
      icon={<span className="material-symbols-rounded" style={{ fontSize: 16, color: config.color }}>{config.icon}</span>}
      label={config.label}
      variant="outlined"
      sx={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
        fontWeight: 600,
        fontSize: 13,
        height: 32,
        alignSelf: "flex-start",
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const EventDetailPage: React.FC = () => {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");

  const [userId, setUserId] = useState<string>("");
  const [event, setEvent] = useState<CookingEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [registering, setRegistering] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  useEffect(() => {
    setUserId(localStorage.getItem("userId") ?? "");
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetchEventData(apiService, eventId, token, userId, setEvent, setIsRegistered)
      .finally(() => setLoading(false));
  }, [eventId, apiService, userId, token]);

  const handleRegister = useCallback(async () => {
    await registerForEvent(apiService, eventId, token, router, setRegistering, setIsRegistered, setEvent as (e: CookingEvent) => void);
  }, [eventId, token, apiService, router]);

  const handleCancel = useCallback(async () => {
    await cancelRegistration(apiService, eventId, token, setIsRegistered, setEvent as (e: CookingEvent) => void);
  }, [eventId, apiService, token]);

  const handleParticipate = useCallback(() => {
    router.push(`/events/${eventId}/cook`);
  }, [eventId, router]);

  if (loading) return <LoadingScreen />;
  if (!event) return <NotFoundScreen onBack={() => router.back()} />;

  // obtained states
  const isUpcoming = event.state === "UPCOMING";
  const isOngoing = event.state === "ONGOING";
  const isFinished = event.state === "FINISHED";
  const durationMinutes = Math.round((new Date(event.endDatetime).getTime() - new Date(event.startDatetime).getTime()) / 60000);
  
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* PAGE HEADING */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", height: 72 }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
            {event.title}
          </h1>
          <UserAvatar size={40} />
        </div>

        {/* BANNER */}
        <div style={{ position: "relative", height: 280, backgroundColor: "#f0f5f1", overflow: "hidden" }}>
          {renderBanner(event.emojis)}
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px 48px 40px" }}>

          {/* TWO COLUMNS */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "flex-start" }}>

            {/* LEFT: Ingredients */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>Ingredients</h3>
              <ul style={{ listStyleType: "disc", paddingLeft: 20, margin: 0 }}>
                {event.ingredients.map((ingredient) => (
                  <li key={ingredient} style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Time, Duration, Participants */}
            <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon name="event" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Time</div>
                  <div style={{ fontSize: 13, color: "#444" }}>{formatEventTime(event.startDatetime, event.endDatetime)}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon name="schedule" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Duration</div>
                  <div style={{ fontSize: 13, color: "#444" }}>{durationMinutes}min</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon name="groups" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Participants</div>
                  <ParticipantList participants={event.participants} />
                </div>
              </div>

              <StatusBadge state={event.state} />
            </div>
          </div>
          

          {/* STATE: UPCOMING */}
          {isUpcoming && (
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40, paddingRight: 100 }}>
              {/* Split Button: Register + Cancel */}
              <ButtonGroup variant="contained" disableElevation style={{ borderRadius: 22, overflow: "hidden" }}>
                <Button
                  startIcon={<span className="material-symbols-rounded" style={{ fontSize: 18 }}>person_add</span>}
                  onClick={handleRegister}
                  disabled={isRegistered || registering}
                  style={{
                    backgroundColor: isRegistered ? "#888" : "#4a7c59",
                    textTransform: "none",
                    fontWeight: 600,
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: "22px 0 0 22px",
                  }}
                >
                  {isRegistered ? "Registered" : "Register"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={!isRegistered}
                  style={{
                    backgroundColor: isRegistered ? "#4a7c59" : "#ccc",
                    minWidth: 40,
                    height: 44,
                    borderRadius: "0 22px 22px 0",
                    borderLeft: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                    {isRegistered ? "close" : "expand_more"}
                  </span>
                </Button>
              </ButtonGroup>

              {/* Participate (disabled when UPCOMING) */}
              <Button
                variant="contained"
                startIcon={<span className="material-symbols-rounded" style={{ fontSize: 18 }}>play_circle</span>}
                disabled={true}
                style={{
                  backgroundColor: "#ccc",
                  textTransform: "none",
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 22,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                Participate
              </Button>
            </div>
          )}

          {/* STATE: ONGOING */}
          {isOngoing && (
            <>
              {isRegistered ? (
                <div style={{ marginTop: 24 }}>
                  <div style={{ backgroundColor: "#f0faf3", border: "1px solid #b2dfdb", borderRadius: 8, padding: "16px 20px", marginBottom: 20}}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                      <Icon name="restaurant" size={20} />
                      <span style={{ fontWeight: 600, fontSize: 15, color: "#2e7d32"}}>The event is live!</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#444", margin: 0}}>
                      Click &quot;Participate&quot; to enter the cooking interface.
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 100}}>
                    <Button
                      variant="contained"
                      startIcon={<span className="material-symbols-rounded" style={{ fontSize: 18 }}>play_circle</span>}
                      onClick={handleParticipate}
                      style={{
                        backgroundColor: "#4a7c59",
                        textTransform: "none",
                        fontWeight: 600,
                        height: 44,
                        borderRadius: 22,
                        paddingLeft: 20,
                        paddingRight: 20,
                      }}
                    >
                      Participate
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "16px 20px", marginTop: 24}}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8}}>
                    <Icon name="lock" size={20} />
                    <span style={{ fontWeight: 600, fontSize: 15, color: "#f57f17"}}>Registration closed</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#666", margin: "8px 0 0"}}>
                    This event has already started. Only registered participants can access the cooking interface.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STATE: FINISHED */}
          {isFinished && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40, paddingRight: 100}}>
              <Button
                variant="contained"
                startIcon={<span className="material-symbols-rounded" style={{ fontSize: 18 }}>emoji_events</span>}
                onClick={() => router.push(`/events/${eventId}/cook`)}
                style={{
                  backgroundColor: "#4a7c59",
                  textTransform: "none",
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 22,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                View Results
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;