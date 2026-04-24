export interface Badge {
  code: string;
  displayName: string;
  emoji: string;
  description: string;
  requiredWins: number;
  unlocked: boolean;
  current: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  name: string;
  wins: number;
  currentBadgeCode: string;
  currentBadgeName: string;
  currentBadgeEmoji: string;
}
