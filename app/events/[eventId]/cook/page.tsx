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
  const [submissionIds, setSubmissionIds] = useState<number[]>([]);

  // =========================
  // LATEST FINISHED PROMPT
  // =========================
  const latestFinishedPromptIndex = useMemo(() => {
    if (!schedule) return -1;

    const now = Date.now();
    const windowMs = schedule.uploadWindowMinutes * 60 * 1000;

    let latestIndex = -1;

    schedule.prompts.forEach((p, index) => {
      const end = new Date(p.promptTime).getTime() + windowMs;
      if (now > end) {
        latestIndex = index;
      }
    });

    return latestIndex;
  }, [schedule]);

  // =========================
  // FETCH SUBMISSIONS (POLLING)
  // =========================
  useEffect(() => {
    if (
      latestFinishedPromptIndex === -1 ||
      !schedule ||
      !token
    ) return;

    const fetchSubmissions = async () => {
      const promptId = schedule.prompts[latestFinishedPromptIndex].id;

      try {
        const ids = await api.get<number[]>(
          `/events/${eventId}/prompts/${promptId}/submissions`,
          { Authorization: `Bearer ${token}` }
        );

        setSubmissionIds(ids);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      }
    };

    fetchSubmissions(); // initial
    const interval = setInterval(fetchSubmissions, 5000);

    return () => clearInterval(interval);
  }, [latestFinishedPromptIndex, schedule, token, eventId, api]);

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
        switch (perm.reason) {
          case "NOT_PARTICIPANT":
            router.push("/not-participant");
            return;
          case "KICKED":
            router.push(`/events/${eventId}/kicked`);
            return;
          default:
            router.push("/403");
            return;
        }
      }

      setPermissionChecked(true);
    } catch (err) {
      console.error("Permission check failed:", err);
      router.push("/403");
    }
  }, [eventId, token, api, router]);

  useEffect(() => {
    if (!eventId || !token) return;
    checkPermission();
  }, [checkPermission, eventId, token]);

  // =========================
  // KICK LOGIC
  // =========================
  const handleKickOut = useCallback(() => {
    alert("You missed an upload. You are out.");
    router.push(`/events/${eventId}/kicked`);
  }, [router, eventId]);

  // =========================
  // FETCH SCHEDULE (POLLING)
  // =========================
  const fetchSchedule = useCallback(async () => {
    if (!eventId || !token) return;

    try {
      const data = await api.get<ScheduleResponse>(
        `/events/${eventId}/schedule`,
        { Authorization: `Bearer ${token}` }
      );

      if (data.kicked) {
        handleKickOut();
        return;
      }

      setSchedule(data);
    } catch (err) {
      console.error("Schedule fetch failed:", err);
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [eventId, token, api, handleKickOut]);

  useEffect(() => {
    if (!eventId || !token || !permissionChecked) return;

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 5000);
    return () => clearInterval(interval);
  }, [eventId, token, permissionChecked, fetchSchedule]);

  // =========================
  // ACTIVE PROMPT
  // =========================
  const activePromptIndex = useMemo(() => {
    if (!schedule) return -1;

    const now = Date.now();
    const windowMs = schedule.uploadWindowMinutes * 60 * 1000;

    return schedule.prompts.findIndex((p) => {
      const start = new Date(p.promptTime).getTime();
      const end = start + windowMs;
      return now >= start && now < end;
    });
  }, [schedule]);

  const uploadActive = activePromptIndex !== -1;

  // =========================
  // FILE HANDLING
  // =========================
  const openFilePicker = () => fileRef.current?.click();

  const onFileSelected = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // =========================
  // UPLOAD
  // =========================
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !schedule || !token) return;

    if (activePromptIndex === -1) {
      alert("Upload window closed");
      return;
    }

    setUploading(true);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert("Upload successful");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }, [selectedFile, schedule, token, activePromptIndex, eventId]);

  // =========================
  // GUARDS
  // =========================
  if (!eventId) return <div>Invalid route</div>;

  if (!permissionChecked || loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ margin: "auto" }}>
          <Spin />
        </div>
      </div>
    );
  }

  if (!schedule) return <div>No schedule</div>;

  // =========================
  // UI
  // =========================
  return (
    <div style={{ display: "flex", minHeight: "100vh", color: "#000000" }}>
      <Sidebar />

      <main style={{ margin: "auto", textAlign: "center", width: 420 }}>
        <h2>Cook Event {eventId}</h2>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => onFileSelected(e.target.files?.[0])}
        />

        <button onClick={openFilePicker} disabled={!uploadActive}>
          Select Image
        </button>

        {previewUrl && (
          <div style={{ marginTop: 20 }}>
            <img
              src={previewUrl}
              alt="preview"
              style={{ width: "100%", borderRadius: 8 }}
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !uploadActive}
          style={{
            marginTop: 15,
            padding: 10,
            width: "100%",
            background: uploadActive ? "#4a7c59" : "#ccc",
            color: "#000000",
            borderRadius: 8,
          }}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>

        <p style={{ marginTop: 10 }}>
          {uploadActive ? "🟢 Upload open" : "⚫ Upload closed"}
        </p>

        {/* SUBMISSIONS GRID */}
        {submissionIds.length > 0 && (
          <div
            style={{
              marginTop: 30,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {submissionIds.map((id) => (
              <img
                key={id}
                src={`${process.env.NEXT_PUBLIC_API_URL}/events/submissions/${id}/image`}
                style={{
                  width: "100%",
                  borderRadius: 8,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}