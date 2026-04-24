"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, ConfigProvider, Table } from "antd";
import type { TableProps } from "antd";
import Sidebar, { UserAvatar, Header } from "@/components/appLayout";
import { useApi } from "@/hooks/useApi";
import { LeaderboardEntry } from "@/types/badge";
import { BadgeChip } from "@/components/Badge";
import { Box } from "@mui/material";

const REFRESH_MS = 30_000;

const LeaderboardPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored.replace(/"/g, ""));
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiService.get<LeaderboardEntry[]>("/leaderboard", {
        Authorization: `Bearer ${token}`,
      });
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  }, [apiService, token]);

  useEffect(() => {
    fetchLeaderboard();
    if (!token) return;
    const intervalId = setInterval(fetchLeaderboard, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [fetchLeaderboard, token]);

  const columns: TableProps<LeaderboardEntry>["columns"] = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      render: (rank: number) => {
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
        return (
          <span style={{ fontWeight: 600 }}>
            {medal ? `${medal} ${rank}` : rank}
          </span>
        );
      },
    },
    {
      title: "User",
      key: "user",
      render: (_value, row) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{row.name || row.username}</span>
          <span style={{ color: "#888", fontSize: 12 }}>@{row.username}</span>
        </Box>
      ),
    },
    {
      title: "Badge",
      key: "badge",
      render: (_value, row) => (
        <BadgeChip
          emoji={row.currentBadgeEmoji}
          name={row.currentBadgeName}
          current
          size="small"
        />
      ),
    },
    {
      title: "Wins",
      dataIndex: "wins",
      key: "wins",
      width: 80,
      align: "right",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title="Leaderboard" rightContent={<UserAvatar />} />
        <div style={{ padding: 24 }}>
          {/* ConfigProvider overrides global dark-theme tokens
              from app/layout.tsx such that table reads as light/white */}
          <ConfigProvider
            theme={{
              token: {
                colorText: "#1a1a1a",
                colorBgContainer: "#ffffff",
              },
            }}
          >
            <Card
              title="Top cooks"
              loading={!entries}
              style={{ borderRadius: 20, border: "1px solid #e8e8e8", background: "#fff" }}
              styles={{ header: { color: "#1a1a1a" }, body: { background: "#fff" } }}
            >
              {entries && (
                <Table<LeaderboardEntry>
                  columns={columns}
                  dataSource={entries}
                  rowKey="userId"
                  pagination={false}
                  onRow={(row) => ({
                    onClick: () => router.push(`/users/${row.userId}`),
                    style: { cursor: "pointer" },
                  })}
                />
              )}
            </Card>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
