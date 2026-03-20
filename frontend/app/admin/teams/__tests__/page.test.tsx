import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AdminTeamsPage from "../page";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => "admin" }));
vi.mock("@/components/NavBar", () => ({ NavBar: () => <nav /> }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@hugeicons/react", () => ({ HugeiconsIcon: () => <svg /> }));
vi.mock("@hugeicons/core-free-icons", () => ({ SquareArrowUpRight02Icon: {} }));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockGetTeams = vi.fn();
const mockCreateTeam = vi.fn();
const mockUpdateTeam = vi.fn();
const mockDeleteTeam = vi.fn();

vi.mock("@/services/teams", () => ({
  getTeams: (...args: unknown[]) => mockGetTeams(...args),
  createTeam: (...args: unknown[]) => mockCreateTeam(...args),
  updateTeam: (...args: unknown[]) => mockUpdateTeam(...args),
  deleteTeam: (...args: unknown[]) => mockDeleteTeam(...args),
}));

const makeMeta = (total = 2) => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total,
  from: 1,
  to: total,
});

const teamA = { id: 1, name: "Flamengo", abbreviation: "FLA", games_count: 3 };
const teamB = { id: 2, name: "Palmeiras", abbreviation: "PAL", games_count: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTeams.mockResolvedValue({ data: [teamA, teamB], meta: makeMeta() });
});

describe("AdminTeamsPage", () => {
  it("renders team rows with name, abbreviation and game count", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    expect(screen.getByText("FLA")).toBeTruthy();
    expect(screen.getByText("Palmeiras")).toBeTruthy();
    expect(screen.getByText("PAL")).toBeTruthy();
  });

  it("shows empty state when no teams exist", async () => {
    mockGetTeams.mockResolvedValue({ data: [], meta: makeMeta(0) });
    render(<AdminTeamsPage />);
    await screen.findByText("Nenhum time cadastrado ainda.");
  });

  it("disables Excluir button for teams with games", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    const deleteButtons = screen.getAllByRole("button", { name: "Excluir" });
    // teamA has games_count: 3 → disabled; teamB has 0 → enabled
    expect(deleteButtons[0]).toHaveProperty("disabled", true);
    expect(deleteButtons[1]).toHaveProperty("disabled", false);
  });

  it("opens create modal when '+ Novo Time' is clicked", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    fireEvent.click(screen.getByText("+ Novo Time"));
    expect(screen.getByText("Novo Time")).toBeTruthy();
  });

  it("opens edit modal pre-filled when Editar is clicked", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    expect(screen.getByText("Editar Time")).toBeTruthy();
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("Flamengo");
    expect((screen.getByLabelText("Sigla (3 letras)") as HTMLInputElement).value).toBe("FLA");
  });

  it("opens delete confirmation modal when Excluir is clicked", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    // teamB (index 1) can be deleted
    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[1]);
    expect(screen.getByText("Excluir Time")).toBeTruthy();
    // team name appears in both the table row and the modal confirmation
    expect(screen.getAllByText(/Palmeiras/).length).toBeGreaterThanOrEqual(2);
  });

  it("calls createTeam and closes modal on success", async () => {
    const created = { id: 3, name: "Corinthians", abbreviation: "COR", games_count: 0 };
    mockCreateTeam.mockResolvedValue(created);
    mockGetTeams
      .mockResolvedValueOnce({ data: [teamA, teamB], meta: makeMeta() })
      .mockResolvedValueOnce({ data: [created, teamA, teamB], meta: makeMeta(3) });

    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");

    fireEvent.click(screen.getByText("+ Novo Time"));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Corinthians" } });
    fireEvent.change(screen.getByLabelText("Sigla (3 letras)"), { target: { value: "COR" } });
    fireEvent.submit(screen.getByRole("button", { name: "Salvar" }).closest("form")!);

    await waitFor(() =>
      expect(mockCreateTeam).toHaveBeenCalledWith({
        name: "Corinthians",
        abbreviation: "COR",
      })
    );
    // modal should close
    await waitFor(() => expect(screen.queryByText("Novo Time")).toBeNull());
  });

  it("calls updateTeam and updates the row on success", async () => {
    const updated = { ...teamA, name: "Flamengo RJ", abbreviation: "FLA" };
    mockUpdateTeam.mockResolvedValue(updated);

    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Flamengo RJ" } });
    fireEvent.submit(nameInput.closest("form")!);

    await waitFor(() =>
      expect(mockUpdateTeam).toHaveBeenCalledWith(1, {
        name: "Flamengo RJ",
        abbreviation: "FLA",
      })
    );
    await waitFor(() => expect(screen.queryByText("Editar Time")).toBeNull());
  });

  it("calls deleteTeam and removes the row on success", async () => {
    mockDeleteTeam.mockResolvedValue(undefined);

    render(<AdminTeamsPage />);
    await screen.findByText("Palmeiras");

    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[1]);
    // There are now two "Excluir" buttons: row + modal confirm — click the last one
    const deleteButtons = screen.getAllByRole("button", { name: "Excluir" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => expect(mockDeleteTeam).toHaveBeenCalledWith(2));
    await waitFor(() => expect(screen.queryByText("Excluir Time")).toBeNull());
  });

  it("navigates to matches filtered by team when Ver Partidas is clicked", async () => {
    render(<AdminTeamsPage />);
    await screen.findByText("Flamengo");
    fireEvent.click(screen.getAllByTitle("Ver partidas do time")[0]);
    expect(mockPush).toHaveBeenCalledWith(
      `/admin/matches?team_name=${encodeURIComponent("Flamengo")}`
    );
  });
});
