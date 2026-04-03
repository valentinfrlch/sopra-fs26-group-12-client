"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import Sidebar, {UserAvatar} from "@/components/appLayout";
import { Button, Spin, Avatar, message, Tooltip } from "antd";
// import {
//   ClockCircleOutlined,
//   TeamOutlined,
//   CalendarOutlined,
//   CheckCircleFilled,
//   UserAddOutlined,
//   PlayCircleOutlined,
//   DownOutlined,
// } from "@ant-design/icons";


const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span
    className="material-symbols-rounded"
    style={{
      fontSize: size,
      color: "#4a7c59",
      display: "flex",
      alignItems: "center",
    }}
  >
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


const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------
function formatEventTime(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayName = start.toLocaleDateString("en-US", { weekday: "short" });
  const day = start.getDate();
  const month = start.toLocaleDateString("en-US", { month: "long" });
  const startHHMM = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const endHHMM = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dayName} ${day} ${month}, ${startHHMM} - ${endHHMM}`;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
const EventDetailPage: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();
  const apiService = useApi();

  const { value: token } = useLocalStorage<string>("token", "");

  // Read userId directly from localStorage to avoid JSON.parse crash
  // (UUID strings are not valid JSON so useLocalStorage breaks on them)
  const [userId, setUserId] = useState<string>("");
  useEffect(() => {
    const id = localStorage.getItem("userId") ?? "";
    setUserId(id);
  }, []);

  const [event, setEvent] = useState<CookingEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [registering, setRegistering] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const isStarted: boolean = event ? new Date() >= new Date(event.startTime) : false;

  const isEnded = event ? new Date() >= new Date(event.endTime) : false;

  // ---------------------------------------------------------------------------
  // FETCH
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        if (error instanceof Error) messageApi.error(`Could not load event: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, apiService, userId, token]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------




  const handleRegister = useCallback(async () => {
    if (!token) { message.warning("Please log in first."); router.push("/login"); return; }
    try {
      setRegistering(true);
      await apiService.post(`/events/${eventId}/participants`, {});
      setIsRegistered(true);
      const updated = await apiService.get<CookingEvent>(`/events/${eventId}`, { Authorization: `Bearer ${token}` });
      setEvent(updated);
      message.success(`🎉 Registered! ${updated.participants.length} participants so far.`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("409")) { message.info("Already registered."); setIsRegistered(true); }
        else message.error(`Registration failed: ${error.message}`);
      }
    } finally { setRegistering(false); }
  }, [eventId, token, apiService, router]);

  const handleCancel = useCallback(async () => {
    try {
      await apiService.delete<void>(`/events/${eventId}/participants`);
      setIsRegistered(false);
      const updated = await apiService.get<CookingEvent>(`/events/${eventId}`, { Authorization: `Bearer ${token}` });
      setEvent(updated);
      message.success("Registration cancelled.");
    } catch (error) {
      if (error instanceof Error) message.error(`Could not cancel: ${error.message}`);
    }
  }, [eventId, apiService, token]);


    // const handleParticipate = useCallback(() => {
  //   router.push(`/events/${eventId}/cook`);
  // }, [eventId, router]);

  const handleParticipate = useCallback(async () => {
    if (USE_MOCK) {
      messageApi.success("Joined event! (mock mode)");
      router.push(`/events/${eventId}/cook`);
      return;
    }

    if (!token) {
      messageApi.warning("Please log in first.");
      router.push("/login");
      return;
    }

    try {
      await apiService.post(`/events/${eventId}/participants`, {});
      messageApi.success("Successfully joined the event!");
      router.push(`/events/${eventId}/cook`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          messageApi.info("Already joined.");
        } else {
          messageApi.error(`Join failed: ${error.message}`);
        }
      }
    }
  }, [eventId, token, apiService, router]);

  // ---------------------------------------------------------------------------
  // LOADING / NOT FOUND
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Spin size="large" />
          <p style={{ color: "#666" }}>Loading event details…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <p>Event not found.</p>
          <Button onClick={() => router.back()}>← Go Back</Button>
        </div>
      </div>
    );
  }

  const registerDisabled = isStarted || isRegistered || isEnded;
  const participateDisabled = isStarted || !isRegistered;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}>
        <Sidebar />

        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* ── PAGE HEADING ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 32px",
                height: 72
              }}
            >
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  margin: 0,
                  color: "#1a1a1a",
                  marginLeft: -14,
                }}
              >
                Event Details (Before Event)
              </h1>
        
              <UserAvatar size={40} />
              
            </div>
          {/* ── BANNER ── */}
          <div style={{ position: "relative", height: 280, backgroundColor: "#f0f5f1", overflow: "hidden" }}>
            {(() => {
              const emojis = event.bannerEmojis ?? ["🍋", "🥒", "🍝"];
              const COLS = 29;
              const ROWS = 3;
              const items = [];
              for (let col = 0; col < COLS; col++) {
                for (let row = 0; row < ROWS; row++) {
                  const isOffsetCol = col % 2 === 1;
                  const topBase = (row / ROWS) * 100;
                  const top = isOffsetCol ? topBase + (100 / ROWS / 2) : topBase;
                  const left = (col / COLS) * 100;
                  const emojiIndex = (col + row) % emojis.length;
                  items.push(
                    <span key={`${col}-${row}`} style={{ position: "absolute", fontSize: 36, top: `${top}%`, left: `${left}%`, userSelect: "none", opacity: 0.9 }}>
                      {emojis[emojiIndex]}
                    </span>
                  );
                }
              }
              return items;
            })()}
            
          </div>

          {/* ── CONTENT ── */}
          <div style={{ padding: "24px 48px 40px" }}>

            {/* Title */}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", color: "#1a1a1a" }}>{event.title}</h1>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px" }}>{event.description}</p>

            {/* ── TWO COLUMNS ── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "flex-start" }}>

              {/* LEFT: Ingredients — fixed width */}
              <div style={{ width: 280, flexShrink: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>Ingredients</h3>
                <ul style={{ listStyleType: "disc", paddingLeft: 20, margin: 0 }}>
                  {event.ingredients.map((ingredient) => (
                    <li key={ingredient} style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              {/* RIGHT: Time, Duration, Participants — takes remaining space, pushed right */}
              <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 18}}>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon name = "event" />
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
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Avatar.Group max={{ count: 3 }} size={32}>
                        {event.participants.map((p) => (
                          <Tooltip key={p.id} title={p.username}>
                            <Avatar src={p.avatarUrl} style={{ backgroundColor: "#4a7c59" }}>
                              {getInitials(p.username)}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                      {event.participants.length === 0 && (
                        <span style={{ color: "#999", fontSize: 13 }}>No participants yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {isStarted && (
                  <div style={{ display: "inline-block", backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: "#2d4a38" }}>
                    {event.status === "ACTIVE" ? "🟢 Live now" : "⚫ Ended"}
                  </div>
                )}

              </div>
            </div>

            {/* Registration confirmation */}
            {isRegistered && !isStarted && (
              <div style={{ backgroundColor: "#f0faf3", border: "1px solid #b2dfdb", borderRadius: 8, padding: "10px 16px", fontSize: 14, color: "#2e7d32", marginBottom: 20, display: "flex", alignItems: "center" }}>
                <span
                  className="material-symbols-rounded"
                  style={{
                    fontSize: 18,
                    color: "#4a7c59",
                    marginRight: 8,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  check_circle
                </span>
                You&apos;re registered! Total participants: {event.participants.length}
                <Button type="link" danger size="small" onClick={handleCancel} style={{ marginLeft: 12 }}>
                  Cancel registration
                </Button>
              </div>
            )}

            {/* ── BUTTONS ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40, paddingRight: 100 }}>

              <div style={{ display: "flex" }}>
                <Tooltip title={isEnded ? "Event has ended" : isStarted ? "Registration closed" : isRegistered ? "Already registered" : ""}>
                  <Button
                    type="primary"
                    icon={
                      <span className="material-symbols-rounded" style={{ fontSize: 18, display: "flex", alignItems: "center" }}>
                        person_add
                      </span>
                    }
                    onClick={handleRegister}
                    loading={registering}
                    disabled={registerDisabled}
                    style={{
                      backgroundColor: registerDisabled ? "#ccc" : "#4a7c59",
                      borderColor: registerDisabled ? "#ccc" : "#4a7c59",
                      color: registerDisabled ? "#888" : "#fff",
                      fontWeight: 600, 
                      display: "flex",
                      alignItems: "center",   // 🔥 ensures vertical centering
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
                    icon={
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                        expand_more
                      </span>
                    }
                    onClick={isRegistered ? handleCancel : undefined}
                    disabled={isStarted}
                    style={{
                      backgroundColor: isStarted ? "#ccc" : "#4a7c59",
                      borderColor: isStarted ? "#ccc" : "#4a7c59",
                      color: isStarted ? "#888" : "#fff",
                      height: 44, borderRadius: "0 22px 22px 0", marginLeft: 1,
                    }}
                  />
                </Tooltip>
              </div>

              <Tooltip title={isStarted ? "Event started" : !isRegistered ? "Register first" : ""}>
                <Button
                  type="primary"
                  icon={<Icon name="play_circle" />}
                  onClick={handleParticipate}
                  disabled={participateDisabled}
                  style={{
                    backgroundColor: participateDisabled ? "#ccc" : "#4a7c59",
                    borderColor: participateDisabled ? "#ccc" : "#4a7c59",
                    color: participateDisabled ? "#888" : "#fff",
                    fontWeight: 600, height: 44, paddingInline: 20,
                    borderRadius: 22, fontSize: 14,
                  }}
                >
                  Join
                </Button>
              </Tooltip>

            </div>
          </div>
        </main>
      </div>
    </>
    );
};

export default EventDetailPage;