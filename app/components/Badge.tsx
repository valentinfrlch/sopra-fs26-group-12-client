"use client";

import React from "react";
import { Box, Tooltip } from "@mui/material";
import { Badge as BadgeType } from "@/types/badge";

/**
 * Small pill showing an emoji + tier name. Used next to usernames and
 * inside the badge showcase. `locked` greys it out (used for tiers the
 * user has not yet unlocked).
 */
export const BadgeChip: React.FC<{
  emoji: string;
  name: string;
  description?: string;
  locked?: boolean;
  current?: boolean;
  size?: "small" | "medium";
}> = ({ emoji, name, description, locked = false, current = false, size = "medium" }) => {
  const fontSize = size === "small" ? 12 : 14;
  const padX = size === "small" ? 1 : 1.25;

  const chip = (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: padX,
        py: 0.25,
        borderRadius: "999px",
        backgroundColor: locked ? "#f1f1f1" : current ? "#dcefd5" : "#f5f7f1",
        color: locked ? "#9aa0a6" : "#485F23",
        border: current ? "1px solid #485F23" : "1px solid transparent",
        fontSize,
        fontWeight: current ? 700 : 500,
        whiteSpace: "nowrap",
        opacity: locked ? 0.6 : 1,
      }}
    >
      <span>{emoji}</span>
      <span>{name}</span>
    </Box>
  );

  if (description) {
    return <Tooltip title={description} arrow>{chip}</Tooltip>;
  }
  return chip;
};

/**
 * Renders all tier badges for a user. Locked ones are greyed and show the
 * required win count, the most dominant unlocked one is highlighted.
 */
export const BadgeShowcase: React.FC<{ badges: BadgeType[]; showDescriptions?: boolean }> = ({
  badges,
  showDescriptions = true,
}) => {
  if (!badges || badges.length === 0) {
    return <Box sx={{ color: "#888", fontSize: 14 }}>No badges yet — go win some events!</Box>;
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {badges.map((b) => (
        <BadgeChip
          key={b.code}
          emoji={b.emoji}
          name={b.displayName}
          description={
            showDescriptions
              ? b.unlocked
                ? b.description
                : `${b.description} (Win ${b.requiredWins} event${b.requiredWins === 1 ? "" : "s"} to unlock)`
              : undefined
          }
          locked={!b.unlocked}
          current={b.current}
        />
      ))}
    </Box>
  );
};
