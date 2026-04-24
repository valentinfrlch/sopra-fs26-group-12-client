"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar, { Header } from "@/components/appLayout";
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

  /* ================= LOADING DESIGN ================= */
  if (!schedule || loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
        <Sidebar />
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Spin />
        </div>
      </div>
    );
  }

  /* ================= MAIN DESIGN ================= */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <Header title="Cook Event" rightContent={null} />

        <div style={{ padding: 24, flex: 1 }}>
          <div style={{
            maxWidth: 480,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
          }}>
            {eventFinished && (
              <button
                onClick={() => router.push("/cookbook")}
                style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                background: "#4a6741",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                }}>
                Return to Home
                </button>
            )}

            {uploadSuccess && (
              <p style={{ color: "#4a6741", fontWeight: 500 }}>
                Upload successful
              </p>
            )}

            {uploadActive && !eventFinished && (
              <>
                <p style={{ color: "#4a6741", fontWeight: 600 }}>
                  🟢 Upload open: submit your photo and continue cooking!
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />

                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    marginTop: 12,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid #4a6741",
                    background: "transparent",
                    color: "#4a6741",
                    fontWeight: 500,
                    cursor: "pointer"
                    }}>
                  Select Image
                  </button>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      marginTop: 12
                    }}
                  />
                )}

                <button
                  disabled={!selectedFile || uploading}
                  onClick={handleUpload}
                  style={{
                    marginTop: 12,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: !selectedFile || uploading ? "#c7d1c3" : "#4a6741",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: !selectedFile || uploading ? "not-allowed" : "pointer"
                    }}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>

                {timeLeftMs !== null && (
                  <p style={{ color: "#666", marginTop: 8 }}>
                    {formatTime(timeLeftMs)}
                  </p>
                )}
              </>
            )}

            {!uploadActive && (
              <>
                <p style={{ color: "#666" }}>
                  ⚫ Upload closed: Keep cooking!
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginTop: 12 }}>
                  {submissions.map((s) => (
                    <div
                      key={s.submissionId}
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "#fafafa"
                      }}
                    >
                      <div
                        style={{
                        width: "100%",
                        height: 140,
                        overflow: "hidden",
                        background: "#f0eef6"
                        }}>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${s.submissionId}/image`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                          }}/>
                      </div>

                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 14, color: "#1a1a1a" }}>
                          👤 {s.username}
                        </div>

                        {eventFinished && (
                          <>
                            <div style={{ fontSize: 13, color: "#666" }}>
                              ⭐ {s.voteCount ?? 0}
                            </div>

                            <button onClick={() => voteSubmission(s.submissionId)}>
                              Vote
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {eventFinished && winners.length > 0 && (
              <div style={{ marginTop: 24, color: "#9e8600" }}>
                <h3 style={{ marginBottom: 12 }}>🏆 Winners</h3>

                {winners.map((w) => (
                  <div
                    key={w.submissionId}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#f0eef6",
                      marginBottom: 8
                    }}
                  >
                    {w.username} — ⭐ {w.voteCount}
                  </div>
                ))}
              </div>

              
            )}
            

          </div>
        </div>
      </div>
    </div>
  );
}