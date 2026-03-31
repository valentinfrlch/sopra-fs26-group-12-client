"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { HomeOutlined, ReadOutlined } from "@ant-design/icons";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div style={{
      width: 64,
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 24,
      gap: 24,
      borderRight: "1px solid #e8e8e8",
      flexShrink: 0,
      minHeight: "100vh",
    }}>
      <div
        onClick={() => router.push("/events/overview")}
        onKeyDown={(e) => e.key === "Enter" && router.push("/events/overview")}
        role="button"
        tabIndex={0}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 4 }}
      >
        <HomeOutlined style={{ fontSize: 22, color: isActive("/events") ? "#4a6741" : "#aaa" }} />
        <span style={{ fontSize: 10, color: isActive("/events") ? "#4a6741" : "#aaa" }}>Events</span>
      </div>

      <div
        onClick={() => router.push("/cookbook")}
        onKeyDown={(e) => e.key === "Enter" && router.push("/cookbook")}
        role="button"
        tabIndex={0}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 4 }}
      >
        <ReadOutlined style={{ fontSize: 22, color: isActive("/cookbook") ? "#4a6741" : "#aaa" }} />
        <span style={{ fontSize: 10, color: isActive("/cookbook") ? "#4a6741" : "#aaa" }}>Library</span>
      </div>
    </div>
  );
};

export default Sidebar;