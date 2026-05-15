"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar, { UserAvatar } from "@/components/appLayout";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import { Spin } from "antd";
import {
  Box, Button, Card, Chip, IconButton, Stack, Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

type ScheduleResponse = {
  prompts: {
    id: number;
    promptTime: string;
  }[];
  uploadWindowMinutes: number;
  kicked: boolean;
};

type PermissionResponse = {
  allowed: boolean;
  reason?: "NOT_PARTICIPANT" | "KICKED" | "FORBIDDEN";
};

type SubmissionDTO = {
  submissionId: number;
  userId: number;
  username: string;
  voteCount?: number;
};

type WinnerDTO = {
  submissionId: number;
  userId: number;
  username: string;
  voteCount: number;
};

type EventResponse = {
  participantCount: number;
  participants: Participant[];
};

type EventMetaResponse = {
  ingredients: string[];
  title: string;
  emojis: string;
  participantCount: number;
};

type Participant = {
  id: string;
  username: string;
};



export default function CookPage() {
  const params = useParams();
  const router = useRouter();

  const api = useApi();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const eventId = params?.eventId as string;
  const { value: token } = useLocalStorage<string>("token", "");

  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [permissionChecked, setPermissionChecked] = useState(false);

  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
  const [winners, setWinners] = useState<WinnerDTO[]>([]);

  const [now, setNow] = useState(Date.now());
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const prevUploadActive = useRef<boolean | null>(null);

  const [participantCount, setParticipantCount] = useState<number | null>(null);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventEmojis, setEventEmojis] = useState<string>("");

  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEventMeta = useCallback(async () => {
  if (!eventId || !token) return;

  const data = await api.get<EventMetaResponse>(
    `/events/${eventId}`,
    { Authorization: `Bearer ${token}` }
  );

  setIngredients(data.ingredients);
  setEventTitle(data.title ?? "");
  setEventEmojis(data.emojis ?? "");
}, [eventId, token, api]);

useEffect(() => {
  if (!permissionChecked) return;

  fetchEventMeta();
}, [fetchEventMeta, permissionChecked]);

  const eventEndMs = useMemo(() => {
  if (!schedule || schedule.prompts.length === 0) return null;

  const last = schedule.prompts[schedule.prompts.length - 1];

  return (
    new Date(last.promptTime).getTime() +
    schedule.uploadWindowMinutes * 60 * 1000 -300000
  );
}, [schedule]);

  const activePromptIndex = useMemo(() => {
    if (!schedule) return -1;

    const nowTs = Date.now();
    const windowMs = schedule.uploadWindowMinutes * 60 * 1000;

    return schedule.prompts.findIndex((p) => {
      const start = new Date(p.promptTime).getTime();
      const end = start + windowMs;
      return nowTs >= start && nowTs < end;
    });
  }, [schedule]);

  const uploadActive = activePromptIndex !== -1;

  const eventFinished = useMemo(() => {
    if (!schedule) return false;

    const last = schedule.prompts[schedule.prompts.length - 1];
    if (!last) return false;

    const end =
      new Date(last.promptTime).getTime() +
      schedule.uploadWindowMinutes * 60 * 1000;

    return Date.now() > end;
  }, [schedule]);

  const eventTimeLeftMs = useMemo(() => {
  if (!eventEndMs) return null;
  return Math.max(0, eventEndMs - now);
}, [eventEndMs, now]);

  const timeLeftMs = useMemo(() => {
    if (!schedule || activePromptIndex === -1) return null;

    const p = schedule.prompts[activePromptIndex];
    const start = new Date(p.promptTime).getTime();
    const end = start + schedule.uploadWindowMinutes * 60 * 1000;

    return Math.max(0, end - now);
  }, [schedule, activePromptIndex, now]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const checkPermission = useCallback(async () => {
    if (!eventId || !token) return;

    try {
      const perm = await api.get<PermissionResponse>(
        `/events/${eventId}/permission`,
        { Authorization: `Bearer ${token}` }
      );

      if (!perm.allowed) {
        if (perm.reason === "KICKED") {
          router.push(`/events/${eventId}/kicked`);
          return;
        }
        if (perm.reason === "NOT_PARTICIPANT") {
          router.push("/cookbook");
          return;
        }
        router.push("/403");
        return;
      }

      setPermissionChecked(true);
    } catch {
      router.push("/403");
    }
  }, [eventId, token, api, router]);

    const fetchEvent = useCallback(async () => {
  if (!eventId || !token) return;

  const data = await api.get<EventResponse>(
    `/events/${eventId}`,
    { Authorization: `Bearer ${token}` }
  );

  setParticipantCount(data.participantCount);
  setParticipants(data.participants ?? []);
}, [eventId, token, api]);

  useEffect(() => {
    if (!eventId || !token) return;
    checkPermission();
  }, [checkPermission, eventId, token]);

  useEffect(() => {
    const prev = prevUploadActive.current;

    if (prev === null) {
      prevUploadActive.current = uploadActive;
      return;
    }

    if (prev === true && uploadActive === false) {
      checkPermission();
    }

    prevUploadActive.current = uploadActive;
  }, [uploadActive, checkPermission]);

  const fetchSchedule = useCallback(async () => {
    if (!eventId || !token) return;

    try {
      const data = await api.get<ScheduleResponse>(
        `/events/${eventId}/schedule`,
        { Authorization: `Bearer ${token}` }
      );

      setSchedule(data);
    } finally {
      setLoading(false);
    }
  }, [eventId, token, api]);

  useEffect(() => {
    if (!eventId || !token || !permissionChecked) return;

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 5000);
    return () => clearInterval(interval);
  }, [fetchSchedule, eventId, token, permissionChecked]);


useEffect(() => {
  if (!eventId || !token || !permissionChecked) return;

  fetchEvent();
  const interval = setInterval(fetchEvent, 5000);

  return () => clearInterval(interval);
}, [fetchEvent, eventId, token, permissionChecked]);

  const fetchSubmissions = useCallback(async () => {
    if (!schedule || !token) return;

    const now = Date.now();
    const windowMs = schedule.uploadWindowMinutes * 60 * 1000;

    const finished = schedule.prompts.filter((p) => {
      const start = new Date(p.promptTime).getTime();
      const end = start + windowMs;
      return now >= end;
    });

    const last = finished[finished.length - 1];
    if (!last) {
      setSubmissions([]);
      return;
    }

    const data = await api.get<SubmissionDTO[]>(
      `/events/${eventId}/prompts/${last.id}/submissions`,
      { Authorization: `Bearer ${token}` }
    );

    setSubmissions(data);
  }, [schedule, token, eventId, api]);

  useEffect(() => {
    if (!schedule || !token) return;

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [fetchSubmissions, schedule, token]);

  const fetchWinner = useCallback(async () => {
    if (!eventFinished || !token) return;

    const data = await api.get<WinnerDTO[]>(
      `/events/${eventId}/winner`,
      { Authorization: `Bearer ${token}` }
    );

    setWinners(data);
  }, [eventFinished, token, eventId, api]);

  useEffect(() => {
    if (!eventFinished || !token) return;

    fetchWinner();
    const interval = setInterval(fetchWinner, 5000);
    return () => clearInterval(interval);
  }, [fetchWinner, eventFinished, token]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !schedule || !token) return;
    if (activePromptIndex === -1) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("promptId", String(schedule.prompts[activePromptIndex].id));

      await api.post(
        `/events/${eventId}/submissions?promptId=${schedule.prompts[activePromptIndex].id}`,
        formData,
        { Authorization: `Bearer ${token}` }
      );

      setSelectedFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, schedule, token, activePromptIndex, eventId, api]);

  const voteSubmission = useCallback(
    async (submissionId: number) => {
      if (!token) return;

      try {
        await api.post(
          `/events/submissions/${submissionId}/vote`,
          {},
          { Authorization: `Bearer ${token}` }
        );
      } catch (err) {
        console.error("Vote failed:", err);
      }

      await fetchSubmissions();
      await fetchWinner();
    },
    [token, fetchSubmissions, fetchWinner, api]
  );

  /* ================= LOADING DESIGN ================= */
  if (!schedule || loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", background: "#F9FBFC" }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spin />
        </Box>
      </Box>
    );
  }

  // Map: userId -> submission (for current/last prompt) so we can show photos in the gallery
  const submissionByUser = new Map<number, SubmissionDTO>();
  submissions.forEach((s) => submissionByUser.set(s.userId, s));

  const promptCountdown = timeLeftMs !== null ? formatTime(timeLeftMs) : "--:--";
  const eventCountdown = eventTimeLeftMs !== null ? formatTime(eventTimeLeftMs) : "--:--";

  /* ================= MAIN DESIGN ================= */
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#F9FBFC" }}>
      <Sidebar />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar: title + emojis on the left, pills + avatar on the right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            py: 2.5,
            background: "#F9FBFC",
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A" }}>
                {eventTitle || "Cook Event"}
              </Typography>
              {eventEmojis && (
                <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{eventEmojis}</Typography>
              )}
            </Stack>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
              Current Challenge
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Chip
              icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18, ml: "8px !important" }} />}
              label={`${participants.length || participantCount || 0}/${participantCount ?? "-"} active`}
              sx={{
                background: "#F3F4F6",
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 13,
                height: 34,
                borderRadius: 17,
                "& .MuiChip-icon": { color: "#6B7280" },
              }}
            />
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 18, ml: "8px !important" }} />}
              label={eventCountdown}
              sx={{
                background: "#F3F4F6",
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 13,
                height: 34,
                borderRadius: 17,
                "& .MuiChip-icon": { color: "#6B7280" },
              }}
            />
            <UserAvatar size={36} />
          </Stack>
        </Box>

        {/* Main content area */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            pb: { xs: 12, md: 4 },
            flex: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 260px" },
            gap: { xs: 2, md: 4 },
            alignItems: "start",
          }}
        >
          {/* ===== LEFT: hero + gallery + voting ===== */}
          <Box>
            {/* ====== HERO CARD ====== */}
            {eventFinished ? (
              // Event finished state
              <Card
                elevation={0}
                sx={{
                  background: "#F0EEF6",
                  borderRadius: 4,
                  p: 4,
                  textAlign: "center",
                  mb: 4,
                  maxWidth: 640,
                  mx: "auto",
                }}
              >
                <EmojiEventsOutlinedIcon sx={{ fontSize: 56, color: "#F97316", mb: 1 }} />
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
                  Event finished
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 2 }}>
                  {winners.length > 0
                    ? `Congrats to ${winners.map((w) => w.username).join(", ")}!`
                    : "Time's up — check the results below."}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/events/${eventId}`)}
                  sx={{
                    background: "#4a6741",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 22,
                    px: 3,
                    "&:hover": { background: "#3d5436" },
                  }}
                >
                  Back to Event
                </Button>
              </Card>
            ) : uploadActive ? (
              // Active prompt: SHOW YOUR PROGRESS
              <Card
                elevation={0}
                sx={{
                  background: "#FFE8D6",
                  border: "2px solid #F97316",
                  borderRadius: 4,
                  p: { xs: 3, md: 4 },
                  textAlign: "center",
                  mb: 4,
                  maxWidth: 640,
                  mx: "auto",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 18, md: 22 },
                    fontWeight: 800,
                    color: "#EA580C",
                    letterSpacing: 0.5,
                    mb: 1,
                  }}
                >
                  SHOW YOUR PROGRESS!
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 2 }}>
                  Take a photo of your current progress now.
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 42, md: 56 },
                    fontWeight: 800,
                    color: "#EA580C",
                    lineHeight: 1,
                    mb: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {promptCountdown}
                </Typography>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />

                {!selectedFile ? (
                  <Button
                    variant="contained"
                    startIcon={<PhotoCameraOutlinedIcon />}
                    onClick={() => fileRef.current?.click()}
                    sx={{
                      background: "#F97316",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 22,
                      px: 3,
                      py: 1,
                      boxShadow: "none",
                      "&:hover": { background: "#EA580C", boxShadow: "none" },
                    }}
                  >
                    Take photo
                  </Button>
                ) : (
                  <Stack spacing={1.5} alignItems="center">
                    {previewUrl && (
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="preview"
                        sx={{
                          maxWidth: 240,
                          maxHeight: 180,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploading}
                        sx={{
                          textTransform: "none",
                          borderColor: "#F97316",
                          color: "#F97316",
                          borderRadius: 22,
                          px: 2,
                        }}
                      >
                        Retake
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading}
                        sx={{
                          background: "#F97316",
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 22,
                          px: 3,
                          boxShadow: "none",
                          "&:hover": { background: "#EA580C", boxShadow: "none" },
                        }}
                      >
                        {uploading ? "Uploading..." : "Submit"}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {uploadSuccess && (
                  <Typography sx={{ mt: 2, color: "#16A34A", fontWeight: 600 }}>
                    ✓ Upload successful
                  </Typography>
                )}
              </Card>
            ) : (
              // No active prompt: KEEP COOKING
              <Card
                elevation={0}
                sx={{
                  background: "#F0EEF6",
                  borderRadius: 4,
                  p: { xs: 3, md: 4 },
                  textAlign: "center",
                  mb: 4,
                  maxWidth: 640,
                  mx: "auto",
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <HourglassEmptyIcon sx={{ fontSize: 28, color: "#6B7280" }} />
                </Box>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700, color: "#1A1A1A" }}>
                    Keep cooking!
                  </Typography>
                  <EmojiEventsOutlinedIcon sx={{ fontSize: 24, color: "#F59E0B" }} />
                </Stack>
                <Typography sx={{ fontSize: 14, color: "#6B7280", mt: 1 }}>
                  Wait for the next photo prompt. Focus fully on your dish.
                </Typography>
              </Card>
            )}

            {/* ====== LIVE GALLERY ====== */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>
                Live gallery of players
              </Typography>
              <Button
                size="small"
                sx={{ textTransform: "none", color: "#6B7280", fontWeight: 500 }}
                onClick={() => {/* TODO: gallery expansion */}}
              >
                Show all
              </Button>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              {participants.length === 0 ? (
                <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>
                  No participants yet.
                </Typography>
              ) : (
                participants.map((p) => {
                  const submission = submissionByUser.get(Number(p.id));
                  const isCurrentUser = String(p.id) === (typeof window !== "undefined" ? localStorage.getItem("userId") : "");
                  const isDisqualified = isCurrentUser && schedule.kicked;
                  const initial = (p.username || "?").charAt(0).toUpperCase();

                  return (
                    <Box
                      key={p.id}
                      sx={{
                        position: "relative",
                        borderRadius: 3,
                        overflow: "hidden",
                        background: "#F3F4F6",
                        opacity: isDisqualified ? 0.55 : 1,
                      }}
                    >
                      <Box
                        sx={{
                          aspectRatio: "1 / 1",
                          background: "#E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {submission ? (
                          <Box
                            component="img"
                            src={`${getApiDomain()}/events/submissions/${submission.submissionId}/image`}
                            alt={p.username}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ImageOutlinedIcon sx={{ fontSize: 36, color: "#9CA3AF" }} />
                        )}
                      </Box>

                      {/* Username pill at bottom */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          background: "#fff",
                          borderRadius: 999,
                          px: 0.75,
                          py: 0.25,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#DCEFD5",
                            color: "#485F23",
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {initial}
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>
                          {p.username}
                        </Typography>
                      </Stack>

                      {isDisqualified && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CancelOutlinedIcon sx={{ fontSize: 32, color: "#EF4444" }} />
                          <Box
                            sx={{
                              background: "#EF4444",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              px: 1,
                              py: 0.25,
                              borderRadius: 999,
                              letterSpacing: 0.5,
                            }}
                          >
                            DISQUALIFIED
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>

            {/* ====== POST-EVENT VOTING ====== */}
            {eventFinished && submissions.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", mb: 2 }}>
                  Vote for your favourite
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 2,
                  }}
                >
                  {submissions.map((s) => (
                    <Card
                      key={s.submissionId}
                      elevation={0}
                      sx={{ borderRadius: 3, overflow: "hidden", background: "#fff" }}
                    >
                      <Box
                        component="img"
                        src={`${getApiDomain()}/events/submissions/${s.submissionId}/image`}
                        alt={s.username}
                        sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                      <Box sx={{ p: 1.5 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>
                          {s.username}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                            ⭐ {s.voteCount ?? 0}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => voteSubmission(s.submissionId)}
                            sx={{ color: "#F97316" }}
                          >
                            <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* ===== Ingredients sidebar ===== */}
          {ingredients.length > 0 && (
            <Card
              elevation={0}
              sx={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                p: 2.5,
                position: { md: "sticky" },
                top: { md: 24 },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", mb: 1.5 }}>
                Ingredients
              </Typography>
              <Stack spacing={1}>
                {ingredients.map((ing) => (
                  <Box
                    key={ing}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    <Box
                      sx={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#4a6741", flexShrink: 0,
                      }}
                    />
                    {ing}
                  </Box>
                ))}
              </Stack>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}