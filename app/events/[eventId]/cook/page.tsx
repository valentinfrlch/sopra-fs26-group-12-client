"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/appLayout";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Spin } from "antd";

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

  // ✅ NEW: upload success UI state
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // EVENT FINISHED
  // =========================
  const eventFinished = useMemo(() => {
    if (!schedule) return false;

    const lastPrompt = schedule.prompts[schedule.prompts.length - 1];
    if (!lastPrompt) return false;

    const end =
      new Date(lastPrompt.promptTime).getTime() +
      schedule.uploadWindowMinutes * 60 * 1000;

    return Date.now() > end;
  }, [schedule]);

  // =========================
  // ACTIVE PROMPT
  // =========================
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

  // =========================
  // COUNTDOWN
  // =========================
  const timeLeftMs = useMemo(() => {
    if (!schedule || activePromptIndex === -1) return null;

    const prompt = schedule.prompts[activePromptIndex];
    const start = new Date(prompt.promptTime).getTime();
    const end = start + schedule.uploadWindowMinutes * 60 * 1000;

    return Math.max(0, end - now);
  }, [schedule, activePromptIndex, now]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // =========================
  // FILE PREVIEW
  // =========================
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // =========================
  // PERMISSION CHECK
  // =========================
  const checkPermission = useCallback(async () => {
    if (!eventId || !token) return;

    try {
      const perm = await api.get<PermissionResponse>(
        `/events/${eventId}/permission`,
        { Authorization: `Bearer ${token}` }
      );

      if (!perm.allowed) {
        router.push("/403");
        return;
      }

      setPermissionChecked(true);
    } catch {
      router.push("/403");
    }
  }, [eventId, token, api, router]);

  useEffect(() => {
    if (!eventId || !token) return;
    checkPermission();
  }, [checkPermission, eventId, token]);

  // =========================
  // FETCH SCHEDULE
  // =========================
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

  // =========================
  // FETCH SUBMISSIONS
  // =========================
  const fetchSubmissions = useCallback(async () => {
    if (!schedule || !token) return;

    const now = Date.now();
    const windowMs = schedule.uploadWindowMinutes * 60 * 1000;

    const pastPrompts = schedule.prompts.filter((p) => {
      const start = new Date(p.promptTime).getTime();
      const end = start + windowMs;
      return now >= end;
    });

    const lastFinishedPrompt = pastPrompts[pastPrompts.length - 1];

    if (!lastFinishedPrompt) {
      setSubmissions([]);
      return;
    }

    try {
      const data = await api.get<SubmissionDTO[]>(
        `/events/${eventId}/prompts/${lastFinishedPrompt.id}/submissions`,
        { Authorization: `Bearer ${token}` }
      );

      setSubmissions(data);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  }, [schedule, token, eventId, api]);

  useEffect(() => {
    if (!schedule || !token) return;

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [fetchSubmissions, schedule, token]);

  // =========================
  // WINNER
  // =========================
  const fetchWinner = useCallback(async () => {
    if (!eventFinished || !token) return;

    try {
      const data = await api.get<WinnerDTO[]>(
        `/events/${eventId}/winner`,
        { Authorization: `Bearer ${token}` }
      );

      setWinners(data);
    } catch (err) {
      console.error("Failed to fetch winner", err);
    }
  }, [eventFinished, token, eventId, api]);

  useEffect(() => {
    if (!eventFinished || !token) return;

    fetchWinner();
    const interval = setInterval(fetchWinner, 5000);
    return () => clearInterval(interval);
  }, [fetchWinner, eventFinished, token]);

  // =========================
  // UPLOAD
  // =========================
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !schedule || !token) return;
    if (activePromptIndex === -1) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "promptId",
        String(schedule.prompts[activePromptIndex].id)
      );

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/submissions`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());

      setSelectedFile(null);

      // ✅ show success message
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 3000);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, schedule, token, activePromptIndex, eventId]);

  // =========================
  // VOTE
  // =========================
  const voteSubmission = useCallback(
    async (submissionId: number) => {
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${submissionId}/vote`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(await res.text());

        await fetchSubmissions();
        await fetchWinner();
      } catch (err) {
        console.error(err);
      }
    },
    [token, fetchSubmissions, fetchWinner]
  );

  if (!schedule || loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ margin: "auto" }}>
          <Spin />
        </div>
      </div>
    );
  }

  const hasRealWinner = winners.some((w) => w.voteCount > 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", color: "#000000" }}>
      <Sidebar />

      <main style={{ margin: "0 auto", paddingTop: 40, textAlign: "center", width: 420 }}>
        <h2>Cook Event {eventId}</h2>

        {uploadSuccess && (
          <p style={{ color: "green", marginBottom: 10 }}>
            ✅ Upload successful!
          </p>
        )}

        {/* rest stays unchanged */}
        {uploadActive && !eventFinished && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <button onClick={() => fileRef.current?.click()}>
              Select Image
            </button>

            {previewUrl && (
              <img src={previewUrl} style={{ width: "100%", borderRadius: 8 }} />
            )}

            <button
              style={{
                marginTop: 15,
                padding: 10,
                width: "100%",
                background: "#007423",
                color: "#fff",
                borderRadius: 8,
              }}
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>

            <p>🟢 Upload open</p>

            {timeLeftMs !== null && <p>⏳ {formatTime(timeLeftMs)}</p>}
          </>
        )}

        {!uploadActive && (
          <>
            <p>⚫ Upload closed</p>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {submissions.map((s) => (
                <div
                  key={s.submissionId}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${s.submissionId}/image`}
                    style={{ width: "100%", borderRadius: 8 }}
                  />

                  <div>👤 {s.username}</div>

                  {eventFinished && <div>⭐ {s.voteCount ?? 0}</div>}

                  {eventFinished && (
                    <button onClick={() => voteSubmission(s.submissionId)}>
                      Vote
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {eventFinished && (
          <>
            <h3 style={{ marginTop: 30 }}>Voting Phase</h3>

            {hasRealWinner && (
              <div>
                <h2>🏆 Winners</h2>
                {winners.map((w) => (
                  <div key={w.submissionId}>
                    {w.username} — ⭐ {w.voteCount}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}