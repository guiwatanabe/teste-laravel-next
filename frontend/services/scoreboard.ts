import axiosInstance from "./api";

export interface StandingEntry {
  team_id: number;
  team_name: string;
  points: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

export async function getStandings(): Promise<StandingEntry[]> {
  const res = await axiosInstance.get<{ data: StandingEntry[] }>("/api/scoreboard");
  return res.data.data;
}
