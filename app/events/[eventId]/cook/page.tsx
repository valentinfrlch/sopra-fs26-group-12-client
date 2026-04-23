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
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const prevUploadActive = useRef<boolean | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  /**
   * INITIAL permission check (safe startup)
   */
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

  useEffect(() => {
    if (!eventId || !token) return;
    checkPermission();
  }, [checkPermission, eventId, token]);

  /**
   * IMPORTANT:
   * permission check ONLY when upload window closes
   */
  useEffect(() => {
    const prev = prevUploadActive.current;

    if (prev === null) {
      prevUploadActive.current = uploadActive;
      return;
    }

    // OPEN → CLOSED transition
    if (prev === true && uploadActive === false) {
      checkPermission();
    }

    prevUploadActive.current = uploadActive;
  }, [uploadActive, checkPermission]);

  /**
   * FETCH SCHEDULE
   */
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

  /**
   * FETCH SUBMISSIONS
   * (visible in upload CLOSED window)
   */
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

  /**
   * FETCH WINNER
   */
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

  /**
   * UPLOAD
   */
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
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, schedule, token, activePromptIndex, eventId]);

  /**
   * VOTING
   */
  const voteSubmission = useCallback(
    async (submissionId: number) => {
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${submissionId}/vote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchSubmissions();
      await fetchWinner();
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", color: "#000" }}>
      <Sidebar />

      <main style={{ margin: "0 auto", paddingTop: 40, width: 420 }}>
        <h2>Cook Event</h2>

        {uploadSuccess && <p style={{ color: "green" }}>Upload successful</p>}

        {/* ================= UPLOAD PHASE ================= */}
        {uploadActive && !eventFinished && (
          <>
            <p style={{ color: "green", fontWeight: 600 }}>
              🟢Upload open: submit your photo and continue cooking!
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <button onClick={() => fileRef.current?.click()}>
              Select Image
            </button>

            {previewUrl && (
              <img src={previewUrl} style={{ width: "100%" }} />
            )}

            <button
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {timeLeftMs !== null && <p>{formatTime(timeLeftMs)}</p>}
          </>
        )}

        {/* ================= CLOSED PHASE ================= */}
        {!uploadActive && (
          <>
            <p>⚫Upload closed: Keep cooking!</p>

            {/* SHOW SUBMISSIONS WITH NAMES */}
            <div style={{ display: "grid", gap: 10 }}>
              {submissions.map((s) => (
                <div key={s.submissionId}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${s.submissionId}/image`}
                    style={{ width: "100%" }}
                  />
                  <div>👤 {s.username}</div>

                  {eventFinished && (
                    <>
                      <div>⭐ {s.voteCount ?? 0}</div>
                      <button onClick={() => voteSubmission(s.submissionId)}>
                        Vote
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= WINNERS ================= */}
        {eventFinished && winners.length > 0 && (
          <>
            <h3>🏆 Winners</h3>
            {winners.map((w) => (
              <div key={w.submissionId}>
                {w.username} — ⭐ {w.voteCount}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}