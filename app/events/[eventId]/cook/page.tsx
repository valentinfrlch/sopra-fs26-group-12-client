"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/appLayout";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Spin } from "antd";
import { useRouter } from "next/navigation";

type ScheduleResponse = {
  prompts: {
    id: number;
    promptTime: string;
  }[];
  uploadWindowMinutes: number;
  kicked: boolean;
};

export default function CookPage() {
  const params = useParams();
  const api = useApi();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const eventId = params?.eventId as string;
  const { value: token } = useLocalStorage<string>("token", "");

  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleKickOut = useCallback(() => {
    alert("You missed an upload. You are out.");
    router.push(`/events/${eventId}/kicked`);
  }, [router, eventId]);

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
    if (!eventId || !token) return;

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 5000);
    return () => clearInterval(interval);
  }, [eventId, token, fetchSchedule]);

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

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const onFileSelected = (file?: File) => {
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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
        console.error("UPLOAD ERROR:", res.status, text);
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

  if (!eventId) return <div>Invalid route</div>;

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ margin: "auto" }}>
          <Spin />
        </div>
      </div>
    );
  }

  if (!schedule) return <div>No schedule (check backend / auth)</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", color: "#000000" }}>
      <Sidebar />

      <main style={{ margin: "auto", textAlign: "center", width: 420 }}>
        <h2>Cook Event {eventId}</h2>
        <p style={{ marginBottom: 20, color: "#666" }}>
          You will receive multiple prompts. For each prompt, upload exactly one image.
          If you upload again, your previous submission for that prompt is replaced.
        </p>

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
            <p style={{ fontSize: 12, color: "#666" }}>
              {selectedFile?.name}
            </p>
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

        <p style={{ 
          marginTop: 10 ,
          color: "#000000"
          }}
          >{uploadActive ? "🟢 Upload open" : "⚫ Upload closed"}
        </p>
      </main>
    </div>
  );
}