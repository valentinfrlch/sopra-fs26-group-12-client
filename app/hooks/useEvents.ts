"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";


export const useEvents = () => {
  const api = useApi();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const rawToken = localStorage.getItem("token");

        // remove accidental extra quotes
        const cleanToken = rawToken?.replace(/^"|"$/g, "");

        const response = await api.get("/events", {
        Authorization: `Bearer ${cleanToken}`,
        });

        console.log("EVENTS RESPONSE:", response);

        setEvents(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]);
      }
    };

    fetchEvents();
  }, [api]);

  return events;
};