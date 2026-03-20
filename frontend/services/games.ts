import axiosInstance from "./api";
import { PaginationMeta } from "./api";
import { Team } from "./teams";

export interface Game {
  id: number;
  home_team: Team;
  away_team: Team;
  home_team_goals: number | null;
  away_team_goals: number | null;
  played_at: string;
  status: "scheduled" | "finished";
}

export interface GamesResponse {
  data: Game[];
  meta: PaginationMeta;
}

export interface GamesFilters {
  team_name?: string;
  played_at_from?: string;
  played_at_to?: string;
  status?: "scheduled" | "finished";
  page?: number;
}

export async function getGames(filters: GamesFilters = {}): Promise<GamesResponse> {
  const params: Record<string, string | number> = {};
  if (filters.team_name) params.team_name = filters.team_name;
  if (filters.played_at_from) params.played_at_from = filters.played_at_from;
  if (filters.played_at_to) params.played_at_to = filters.played_at_to;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;

  const res = await axiosInstance.get<GamesResponse>("/api/games", { params });
  return res.data;
}

export async function getGame(id: number): Promise<Game> {
  const res = await axiosInstance.get<{ data: Game }>(`/api/games/${id}`);
  return res.data.data;
}

export interface UpdateScorePayload {
  home_team_goals: number;
  away_team_goals: number;
}

export async function updateGameScore(id: number, payload: UpdateScorePayload): Promise<Game> {
  const res = await axiosInstance.patch<{ data: Game }>(`/api/games/${id}`, payload);
  return res.data.data;
}
