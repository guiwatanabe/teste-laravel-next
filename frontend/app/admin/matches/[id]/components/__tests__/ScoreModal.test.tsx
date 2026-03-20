import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ScoreModal } from "../ScoreModal";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockUpdateGameScore = vi.fn();
vi.mock("@/services/games", () => ({
  updateGameScore: (...args: unknown[]) => mockUpdateGameScore(...args),
}));

const game = {
  id: 5,
  home_team: { id: 1, name: "Flamengo", abbreviation: "FLA" },
  away_team: { id: 2, name: "Corinthians", abbreviation: "COR" },
  home_team_goals: null,
  away_team_goals: null,
  played_at: "2024-08-10T18:00:00.000Z",
  status: "scheduled" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ScoreModal", () => {
  it("renders both team names", () => {
    render(<ScoreModal game={game} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText(/Flamengo\s+vs\s+Corinthians/)).toBeTruthy();
  });

  it("calls updateGameScore with default 0-0 values on submit", async () => {
    const updated = { ...game, home_team_goals: 0, away_team_goals: 0, status: "finished" as const };
    mockUpdateGameScore.mockResolvedValue(updated);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<ScoreModal game={game} onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(mockUpdateGameScore).toHaveBeenCalledWith(5, {
        home_team_goals: 0,
        away_team_goals: 0,
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(updated);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call API when a goal value is invalid", async () => {
    render(<ScoreModal game={game} onClose={vi.fn()} onSuccess={vi.fn()} />);
    const homeInput = screen.getByLabelText(/FLA/i) as HTMLInputElement;
    // Clear the input — valueAsNumber becomes NaN, which fails z.number()
    fireEvent.change(homeInput, { target: { value: "" } });
    fireEvent.submit(homeInput.closest("form")!);
    // Give RHF time to run validation; API must not be called
    await new Promise((r) => setTimeout(r, 50));
    expect(mockUpdateGameScore).not.toHaveBeenCalled();
  });

  it("calls onClose without submitting when Cancelar is clicked", () => {
    const onClose = vi.fn();
    render(<ScoreModal game={game} onClose={onClose} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalled();
    expect(mockUpdateGameScore).not.toHaveBeenCalled();
  });
});
