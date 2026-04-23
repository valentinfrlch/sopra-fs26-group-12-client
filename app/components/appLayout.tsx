"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar as AntAvatar } from "antd";
import { Drawer, Box, ListItemButton, ListItemIcon, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { RestaurantMenuRounded, HomeRounded, HomeOutlined, LibraryBooksRounded, LibraryBooksOutlined } from "@mui/icons-material";
import useWindowSize from "@/hooks/useWndowSize";




const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { isMobile } = useWindowSize();

  const isActive = (path: string) => pathname.startsWith(path);

  const navItems = [
    {
      key: "events",
      path: "/events/overview",
      inactiveIcon: <HomeOutlined style={{ fontSize: 22 }} />,
      activeIcon: <HomeRounded style={{ fontSize: 22 }} />,
      label: "Events"
    },
    { key: "cookbook", path: "/cookbook", inactiveIcon: <LibraryBooksOutlined style={{ fontSize: 22 }} />, activeIcon: <LibraryBooksRounded style={{ fontSize: 22 }} />, label: "Library" },
  ];

  const activeIndex = Math.max(
    navItems.findIndex((item) => isActive(item.path)),
    0,
  );

  if (isMobile) {
    return (
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={(_, newValue: number) => router.push(navItems[newValue].path)}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          height: 65,
          borderTop: "1px solid #e8e8e8",
          bgcolor: "#fff",
          pb: "max(env(safe-area-inset-bottom), 0px)",
        }}
      >
        {navItems.map((item, index) => {
          const active = index === activeIndex;

          return (
            <BottomNavigationAction
              key={item.key}
              label={item.label}
              icon={active ? item.activeIcon : item.inactiveIcon}
              sx={{
                color: "#6b7280",
                "&.Mui-selected": {
                  color: "#485F23",
                },
              }}
            />
          );
        })}
      </BottomNavigation>
    );
  }

  return (
    <Drawer
      variant="permanent"
      PaperProps={{ sx: { width: 64, background: "#fff", borderRight: "1px solid #e8e8e8", boxSizing: "border-box" } }}
      sx={{ width: 64, flexShrink: 0 }}
    >
      <Box
        sx={{
          width: "100%",
          height: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RestaurantMenuRounded style={{ marginTop: "20px" }} />
        <Box component="span" sx={{ marginTop: "5px", fontSize: 10, fontWeight: 700, color: "#485F23", lineHeight: 1 }}>
          cookREAL
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 2, gap: 1.5 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <ListItemButton
              key={item.key}
              onClick={() => router.push(item.path)}
              onKeyDown={(e) => e.key === "Enter" && router.push(item.path)}
              role="button"
              tabIndex={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                minHeight: 56,
                maxHeight: 56,
                px: 0.5,
                py: 0.75,
                gap: 0.5,
                cursor: "pointer",
                color: active ? "#485F23" : "#6b7280",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <Box
                sx={{
                  width: 45,
                  height: 33,
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? "#dcefd5" : "transparent",
                }}
              >
                <ListItemIcon sx={{ minWidth: "auto", color: "inherit", lineHeight: 1 }}>
                  {active ? item.activeIcon : item.inactiveIcon}
                </ListItemIcon>
              </Box>
              <Box component="span" sx={{ fontSize: 10, fontWeight: active ? 600 : 500, color: "inherit", lineHeight: 1 }}>
                {item.label}
              </Box>
            </ListItemButton>
          );
        })}
      </Box>
    </Drawer>
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
  const [userId, setUserId] = useState("1");

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
    const storedUserId = localStorage.getItem("userId") ?? "1";
    setUserId(storedUserId);
  }, []);

  const router = useRouter();

  return (
    <AntAvatar
      size={size}
      style={{
        background: "rgba(220, 239, 213, 0.8)",
        color: "rgba(72, 95, 35, 1)",
        fontWeight: 600,
        cursor: "pointer",
      }}
      onClick={() => router.push(`/users/${userId}`)}
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
      <div style={{ display: "flex", alignItems: "center", color: "#1a1a1a" }}>
        {/* <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} /> */}
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      </div>

      {/* Right */}
      {rightContent}
    </div>
  );
};



export default Sidebar;


