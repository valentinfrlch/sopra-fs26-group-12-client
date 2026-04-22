"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

type Event = {
  id: number;
  state?: string;
  participants?: { id: number }[];
};


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

    const fetchEvents = async () => {
      try {
        console.log("TOKEN USED FOR EVENTS:", token);

        const response = await api.get("/events", {
          
            Authorization: `Bearer ${token}`,
          
        });

        console.log("EVENTS RESPONSE:", response);

        setEvents(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]);
      }
    };

    fetchEvents();
  }, [api, token]);

  return events;
};