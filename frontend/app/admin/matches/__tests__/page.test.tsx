import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import MatchesPage from "../page";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => "admin" }));
vi.mock("@/components/NavBar", () => ({ NavBar: () => <nav /> }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => ({ get: mockGet }),
}));

const mockGetGames = vi.fn();
vi.mock("@/services/games", () => ({
  getGames: (...args: unknown[]) => mockGetGames(...args),
}));

const makeMeta = (total = 1) => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total,
  from: 1,
  to: total,
});

const baseGame = {
  id: 1,
  home_team: { id: 1, name: "Flamengo", abbreviation: "FLA" },
  away_team: { id: 2, name: "Palmeiras", abbreviation: "PAL" },
  home_team_goals: null,
  away_team_goals: null,
  played_at: "2024-08-10T18:00:00.000Z",
  status: "scheduled" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReturnValue(null);
});

describe("MatchesPage", () => {
  it("renders game rows with team names", async () => {
    mockGetGames.mockResolvedValue({ data: [baseGame], meta: makeMeta() });
    render(<MatchesPage />);
    await screen.findByText("Flamengo");
    expect(screen.getByText("Palmeiras")).toBeTruthy();
  });

  it("shows dash for scheduled game and numeric score for finished game", async () => {
    mockGetGames.mockResolvedValue({
      data: [
        baseGame,
        {
          ...baseGame,
          id: 2,
          home_team: { id: 3, name: "Corinthians", abbreviation: "COR" },
          away_team: { id: 4, name: "Grêmio", abbreviation: "GRE" },
          status: "finished" as const,
          home_team_goals: 2,
          away_team_goals: 1,
        },
      ],
      meta: makeMeta(2),
    });
    render(<MatchesPage />);
    await screen.findByText("Flamengo");
    expect(screen.getByText("-")).toBeTruthy();
    expect(screen.getByText("2 - 1")).toBeTruthy();
  });

  it("shows status badge labels", async () => {
    mockGetGames.mockResolvedValue({
      data: [
        baseGame,
        { ...baseGame, id: 2, status: "finished" as const },
      ],
      meta: makeMeta(2),
    });
    render(<MatchesPage />);
    await screen.findByText("Agendada");
    expect(screen.getByText("Finalizada")).toBeTruthy();
  });

  it("shows empty state when there are no games", async () => {
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<MatchesPage />);
    await screen.findByText("Nenhuma partida encontrada.");
  });

  it("pre-fills team input from URL search param", async () => {
    mockGet.mockImplementation((key: string) =>
      key === "team_name" ? "Flamengo" : null
    );
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<MatchesPage />);
    const input = (await screen.findByPlaceholderText(
      "Nome do time"
    )) as HTMLInputElement;
    expect(input.value).toBe("Flamengo");
  });

  it("clears the team input when Limpar is clicked", async () => {
    mockGet.mockImplementation((key: string) =>
      key === "team_name" ? "Flamengo" : null
    );
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<MatchesPage />);
    const input = (await screen.findByPlaceholderText(
      "Nome do time"
    )) as HTMLInputElement;
    fireEvent.click(screen.getByText("Limpar"));
    expect(input.value).toBe("");
  });

  it("navigates to detail page when a row is clicked", async () => {
    mockGetGames.mockResolvedValue({
      data: [{ ...baseGame, id: 7 }],
      meta: makeMeta(),
    });
    render(<MatchesPage />);
    // findAllByText because "Flamengo" may appear in multiple child nodes
    const cells = await screen.findAllByText("Flamengo");
    fireEvent.click(cells[0].closest("tr")!);
    expect(mockPush).toHaveBeenCalledWith("/admin/matches/7");
  });

  it("passes status filter to getGames when Filtrar is clicked", async () => {
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<MatchesPage />);
    await screen.findByText("Nenhuma partida encontrada.");

    // Open the Select and choose "Finalizada"
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByText("Finalizada"));

    mockGetGames.mockClear();
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    fireEvent.click(screen.getByText("Filtrar"));

    await screen.findByText("Nenhuma partida encontrada.");
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ status: "finished" })
    );
  });

  it("omits status from getGames call when Todos is selected", async () => {
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<MatchesPage />);
    await screen.findByText("Nenhuma partida encontrada.");

    // Choose a status then clear it via Limpar
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByText("Agendada"));

    mockGetGames.mockClear();
    mockGetGames.mockResolvedValue({ data: [], meta: makeMeta(0) });
    fireEvent.click(screen.getByText("Limpar"));

    await screen.findByText("Nenhuma partida encontrada.");
    const lastCall = mockGetGames.mock.calls[mockGetGames.mock.calls.length - 1][0];
    expect(lastCall.status).toBeUndefined();
  });
});
