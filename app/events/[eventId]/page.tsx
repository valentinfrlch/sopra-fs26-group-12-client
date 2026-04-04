"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import Sidebar, { UserAvatar } from "@/components/appLayout";
import { Button, Spin, Avatar, message, Tooltip } from "antd";

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
  avatarUrl?: string;
}

interface CookingEvent {
  id: string;
  title: string;
  description: string;
  bannerEmojis?: string[];
  ingredients: string[];
  startTime: string;
  endTime: string;
  durationMinutes: number;
  participants: Participant[];
  status: "UPCOMING" | "ACTIVE" | "ENDED";
}

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------
const USE_MOCK = true;

const MOCK_EVENT: CookingEvent = {
  id: "mock-event-1",
  title: "Spring Cooking Event",
  description: "Get ready for spring with this challenging cooking event!",
  bannerEmojis: ["🍋", "🥒", "🍝"],
  ingredients: ["Spaghetti", "Cucumbers", "Lemon"],
  startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  endTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
  durationMinutes: 60,
  participants: [
    { id: "user-1", username: "alice aber" },
    { id: "user-2", username: "bob trump" },
    { id: "user-3", username: "charlie clinton" },
    { id: "user-4", username: "diana stone" },
  ],
  status: "UPCOMING",
};


// HELPERS — outside component to reduce cognitive complexity

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



async function fetchEventData(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  userId: string,
  setEvent: (e: CookingEvent) => void,
  setIsRegistered: (v: boolean) => void,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    setEvent(MOCK_EVENT);
    setIsRegistered(MOCK_EVENT.participants.some((p) => p.id === userId));
    return;
  }
  const data = await apiService.get<CookingEvent>(
    `/events/${eventId}`,
    { Authorization: `Bearer ${token}` }
  );
  setEvent(data);
  setIsRegistered(data.participants.some((p) => p.id === userId));
}

async function registerParticipant(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  setRegistering: (v: boolean) => void,
  setIsRegistered: (v: boolean) => void,
  setEvent: (e: CookingEvent) => void,
): Promise<void> {
  setRegistering(true);
  try {
    await apiService.post(`/events/${eventId}/participants`, {});
    setIsRegistered(true);
    const updated = await apiService.get<CookingEvent>(
      `/events/${eventId}`,
      { Authorization: `Bearer ${token}` }
    );
    setEvent(updated);
    message.success(` Registered! ${updated.participants.length} participants so far.`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        message.info("Already registered.");
        setIsRegistered(true);
      } else {
        message.error(`Registration failed: ${error.message}`);
      }
    }
  } finally {
    setRegistering(false);
  }
}

async function cancelParticipation(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  setIsRegistered: (v: boolean) => void,
  setEvent: (e: CookingEvent) => void,
): Promise<void> {
  await apiService.delete<void>(`/events/${eventId}/participants`);
  setIsRegistered(false);
  const updated = await apiService.get<CookingEvent>(
    `/events/${eventId}`,
    { Authorization: `Bearer ${token}` }
  );
  setEvent(updated);
  message.success("Registration cancelled.");
}

function renderBanner(bannerEmojis?: string[]): React.ReactNode[] {
  const emojis = bannerEmojis ?? ["🍋", "🥒", "🍝"];
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

async function registerForEvent(
  apiService: ReturnType<typeof useApi>,
  eventId: string,
  token: string,
  router: ReturnType<typeof useRouter>,
  setRegistering: (v: boolean) => void,
  setIsRegistered: (v: boolean) => void,
  setEvent: (e: CookingEvent) => void,
): Promise<void> {
  if (USE_MOCK) {
    setIsRegistered(true);
    message.success("🎉 Registered! (mock mode)");
    return;
  }
  if (!token) {
    message.warning("Please log in first.");
    router.push("/login");
    return;
  }
  setRegistering(true);
  try {
    await apiService.post(`/events/${eventId}/participants`, {});
    setIsRegistered(true);
    const updated = await apiService.get<CookingEvent>(
      `/events/${eventId}`,
      { Authorization: `Bearer ${token}` }
    );
    setEvent(updated);
    message.success(`Registered! ${updated.participants.length} participants so far.`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        message.info("Already registered.");
        setIsRegistered(true);
      } else {
        message.error(`Registration failed: ${error.message}`);
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
  if (USE_MOCK) {
    setIsRegistered(false);
    message.success("Registration cancelled.");
    return;
  }
  try {
    await apiService.delete<void>(`/events/${eventId}/participants`);
    setIsRegistered(false);
    const updated = await apiService.get<CookingEvent>(
      `/events/${eventId}`,
      { Authorization: `Bearer ${token}` }
    );
    setEvent(updated);
    message.success("Registration cancelled.");
  } catch (error) {
    if (error instanceof Error) message.error(`Could not cancel: ${error.message}`);
  }
}


const ParticipantList = ({ participants }: { participants: Participant[] }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
    <Avatar.Group max={{ count: 3 }} size={32}>
      {participants.map((p) => (
        <Tooltip key={p.id} title={p.username}>
          <Avatar src={p.avatarUrl} style={{ backgroundColor: "#4a7c59" }}>
            {getInitials(p.username)}
          </Avatar>
        </Tooltip>
      ))}
    </Avatar.Group>
    {participants.length === 0 && (
      <span style={{ color: "#999", fontSize: 13 }}>No participants yet</span>
    )}
  </div>
);


const RegistrationConfirmation = ({ count, onCancel }: { count: number; onCancel: () => void }) => (
  <div style={{ backgroundColor: "#f0faf3", border: "1px solid #b2dfdb", borderRadius: 8, padding: "10px 16px", fontSize: 14, color: "#2e7d32", marginBottom: 20, display: "flex", alignItems: "center" }}>
    <Icon name="check_circle" />
    <span style={{ marginLeft: 8 }}>You&apos;re registered! Total participants: {count}</span>
    <Button type="link" danger size="small" onClick={onCancel} style={{ marginLeft: 12 }}>
      Cancel registration
    </Button>
  </div>
);

const LoadingScreen = () => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Spin size="large" />
      <p style={{ color: "#666" }}>Loading event details…</p>
    </div>
  </div>
);

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <p>Event not found.</p>
      <Button onClick={onBack}>← Go Back</Button>
    </div>
  </div>
);


const StatusBadge = ({ status }: { status: CookingEvent["status"] }) => (
  <div style={{ display: "inline-block", backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: "#2d4a38" }}>
    {status === "ACTIVE" ? "🟢 Live now" : "⚫ Ended"}
  </div>
);

const ParticipateButton = ({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) => (
  <Tooltip title={disabled ? "Register first and wait for event to start" : ""}>
    <Button
      type="primary"
      icon={<Icon name="play_circle" />}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#ccc" : "#4a7c59",
        borderColor: disabled ? "#ccc" : "#4a7c59",
        color: disabled ? "#888" : "#fff",
        fontWeight: 600,
        height: 44,
        paddingInline: 20,
        borderRadius: 22,
        fontSize: 14,
      }}
    >
      Participate
    </Button>
  </Tooltip>
);

function getRegisterTooltip(isEnded: boolean, isStarted: boolean, isRegistered: boolean): string {
  if (isEnded) return "Event has ended";
  if (isStarted) return "Registration closed";
  if (isRegistered) return "Already registered";
  return "";
}

const RegisterButton = ({
  disabled,
  loading,
  isStarted,
  isRegistered,
  isEnded,
  onRegister,
  onCancel,
}: {
  disabled: boolean;
  loading: boolean;
  isStarted: boolean;
  isRegistered: boolean;
  isEnded: boolean;
  onRegister: () => void;
  onCancel: () => void;
}) => (
  <div style={{ display: "flex" }}>
    <Tooltip title={getRegisterTooltip(isEnded, isStarted, isRegistered)}>
      <Button
        type="primary"
        icon={<span className="material-symbols-rounded" style={{ fontSize: 18, display: "flex", alignItems: "center" }}>person_add</span>}
        onClick={onRegister}
        loading={loading}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? "#ccc" : "#4a7c59",
          borderColor: disabled ? "#ccc" : "#4a7c59",
          color: disabled ? "#888" : "#fff",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 44,
          padding: "0 20px",
          borderRadius: "22px 0 0 22px",
          fontSize: 14,
        }}
      >
        Register
      </Button>
    </Tooltip>
    <Tooltip title={isRegistered ? "Cancel registration" : ""}>
      <Button
        icon={<span className="material-symbols-rounded" style={{ fontSize: 18 }}>expand_more</span>}
        onClick={isRegistered ? onCancel : undefined}
        disabled={isStarted}
        style={{
          backgroundColor: isStarted ? "#ccc" : "#4a7c59",
          borderColor: isStarted ? "#ccc" : "#4a7c59",
          color: isStarted ? "#888" : "#fff",
          height: 44,
          borderRadius: "0 22px 22px 0",
          marginLeft: 1,
        }}
      />
    </Tooltip>
  </div>
);

// COMPONENT 

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
      .catch((err) => message.error(`Could not load event: ${err.message}`))
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

  const isStarted = new Date() >= new Date(event.startTime);
  const isEnded = new Date() >= new Date(event.endTime);
  const registerDisabled = isStarted || isRegistered || isEnded;
  const participateDisabled = !isStarted || !isRegistered;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* PAGE HEADING */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", height: 72 }}>
          <h1 style={{ fontSize: 36, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
            Event Details
          </h1>
          <UserAvatar size={40} />
        </div>

        {/* BANNER */}
        <div style={{ position: "relative", height: 280, backgroundColor: "#f0f5f1", overflow: "hidden" }}>
          {renderBanner(event.bannerEmojis)}
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px 48px 40px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", color: "#1a1a1a" }}>{event.title}</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px" }}>{event.description}</p>

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
                  <div style={{ fontSize: 13, color: "#444" }}>{formatEventTime(event.startTime, event.endTime)}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon name="schedule" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Duration</div>
                  <div style={{ fontSize: 13, color: "#444" }}>{event.durationMinutes}min</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon name="groups" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Participants</div>
                  <ParticipantList participants={event.participants} />
                </div>
              </div>

              {isStarted && <StatusBadge status={event.status} />}
            </div>
          </div>

          {/* Registration confirmation */}
          {isRegistered && !isStarted && (
            <RegistrationConfirmation count={event.participants.length} onCancel={handleCancel} />
          )}

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40, paddingRight: 100 }}>
            <RegisterButton
              disabled={registerDisabled}
              loading={registering}
              isStarted={isStarted}
              isRegistered={isRegistered}
              isEnded={isEnded}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
            <ParticipateButton disabled={participateDisabled} onClick={handleParticipate} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;