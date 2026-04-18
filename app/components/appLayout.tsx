"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HomeOutlined, ReadOutlined, MenuOutlined } from "@ant-design/icons";
import { Avatar as AntAvatar } from "antd";



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
        onKeyDown={(e) => e.key === "Enter" && router.push("/events")}
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



interface UserAvatarProps {
  username?: string;
  size?: number;
}

// const getInitials = (name: string): string => {
//   return name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);
// };

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const UserAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const [username, setUsername] = useState("U");

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);

  return (
    <AntAvatar
      size={size}
      style={{
        background: "#f0f0f0",
        color: "#1a1a1a",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {getInitials(username)}
    </AntAvatar>
  );
};


export const Header: React.FC<{ title: string; rightContent?: React.ReactNode }> = ({ title, rightContent }) => {
  return (
    <div
      style={{
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid #e8e8e8",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", color: "#1a1a1a"}}>
      {/* <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} /> */}
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      </div>

      {/* Right */}
      {rightContent }
    </div>
  );
};

export default Sidebar;


