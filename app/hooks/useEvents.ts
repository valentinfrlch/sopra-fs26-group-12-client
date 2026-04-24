"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

type Event = {
  id: number;
  state?: string;
  participants?: { id: number }[];
};

const REFRESH_MS = 15_000;

export const useEvents = () => {
  const api = useApi();
  const [events, setEvents] = useState<Event[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored.replace(/^"|"$/g, ""));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const response = await api.get("/events", {
          Authorization: `Bearer ${token}`,
        });
        if (!cancelled) {
          setEvents(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
        if (!cancelled) setEvents([]);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [api, token]);

  return events;
};