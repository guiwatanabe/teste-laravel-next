import axiosInstance from "./api";
import { PaginationMeta } from "./api";

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  games_count?: number;
}

export interface TeamsResponse {
  data: Team[];
  meta: PaginationMeta;
}

export interface TeamPayload {
  name: string;
  abbreviation: string;
}

export async function getTeams(page = 1): Promise<TeamsResponse> {
  const res = await axiosInstance.get<TeamsResponse>("/api/teams", {
    params: { page },
  });
  return res.data;
}

export async function createTeam(payload: TeamPayload): Promise<Team> {
  const res = await axiosInstance.post<Team>("/api/teams", payload);
  return res.data;
}

export async function updateTeam(id: number, payload: Partial<TeamPayload>): Promise<Team> {
  const res = await axiosInstance.patch<{data: Team}>(`/api/teams/${id}`, payload);
  return res.data.data;
}

export async function deleteTeam(id: number): Promise<void> {
  await axiosInstance.delete(`/api/teams/${id}`);
}
