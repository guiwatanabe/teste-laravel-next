import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StandingsPage from "../page";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => "user" }));
vi.mock("@/components/NavBar", () => ({ NavBar: () => <nav /> }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockGetStandings = vi.fn();
vi.mock("@/services/scoreboard", () => ({
  getStandings: () => mockGetStandings(),
}));

const entry = (overrides = {}) => ({
  team_id: 1,
  team_name: "Flamengo",
  points: 9,
  games: 3,
  wins: 3,
  draws: 0,
  losses: 0,
  goals_for: 7,
  goals_against: 2,
  goal_difference: 5,
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("StandingsPage", () => {
  it("renders team name and stats in the table", async () => {
    mockGetStandings.mockResolvedValue([entry()]);
    render(<StandingsPage />);
    await screen.findByText("Flamengo");
    expect(screen.getByText("9")).toBeTruthy();   // points (unique)
    expect(screen.getByText("7")).toBeTruthy();   // goals_for (unique)
    expect(screen.getByText("2")).toBeTruthy();   // goals_against (unique)
    expect(screen.getByText("+5")).toBeTruthy();  // positive goal difference
  });

  it("renders negative goal difference without prefix", async () => {
    mockGetStandings.mockResolvedValue([entry({ goal_difference: -3 })]);
    render(<StandingsPage />);
    await screen.findByText("Flamengo");
    expect(screen.getByText("-3")).toBeTruthy();
  });

  it("renders zero goal difference without prefix", async () => {
    // All other columns non-zero so "0" is unambiguous within the row
    mockGetStandings.mockResolvedValue([
      entry({ points: 7, games: 4, wins: 2, draws: 1, losses: 1, goals_for: 5, goals_against: 5, goal_difference: 0 }),
    ]);
    render(<StandingsPage />);
    await screen.findByText("Flamengo");
    const dataRow = screen.getAllByRole("row")[1];
    expect(within(dataRow).getByText("0")).toBeTruthy();
  });

  it("shows empty state when no standings are returned", async () => {
    mockGetStandings.mockResolvedValue([]);
    render(<StandingsPage />);
    await screen.findByText("Nenhuma partida finalizada ainda.");
  });

  it("renders rows in the order returned (position numbers)", async () => {
    mockGetStandings.mockResolvedValue([
      entry({ team_id: 1, team_name: "Flamengo", points: 9 }),
      entry({ team_id: 2, team_name: "Palmeiras", points: 6 }),
    ]);
    render(<StandingsPage />);
    await screen.findByText("Flamengo");
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1] = 1st team, rows[2] = 2nd team
    expect(rows[1].textContent).toContain("Flamengo");
    expect(rows[2].textContent).toContain("Palmeiras");
    // position cells
    const cells = screen.getAllByRole("cell");
    expect(cells[0].textContent).toBe("1");
    expect(cells[10].textContent).toBe("2");
  });

  it("shows toast on fetch failure", async () => {
    const { toast } = await import("sonner");
    mockGetStandings.mockRejectedValue(new Error("network error"));
    render(<StandingsPage />);
    // wait for empty state (loading → done)
    await screen.findByText("Nenhuma partida finalizada ainda.");
    expect(toast.error).toHaveBeenCalledWith("Falha ao carregar a classificação");
  });
});
