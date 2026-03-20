import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RegisterPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockRegister = vi.fn();
vi.mock("@/services/auth", () => ({
  register: (...args: unknown[]) => mockRegister(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("axios", () => ({
  isAxiosError: (e: unknown) =>
    typeof e === "object" && e !== null && (e as { isAxios?: boolean }).isAxios === true,
}));

beforeEach(() => vi.clearAllMocks());

const fillValidForm = (container: HTMLElement) => {
  fireEvent.change(container.querySelector("#form-rhf-input-name")!, {
    target: { value: "João Silva" },
  });
  fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
    target: { value: "joao@example.com" },
  });
  fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
    target: { value: "senha12345" },
  });
  fireEvent.change(
    container.querySelector("#form-rhf-input-password-confirmation")!,
    { target: { value: "senha12345" } },
  );
};

describe("RegisterPage", () => {
  it("renders name, email, password, confirmation fields and submit button", () => {
    const { container } = render(<RegisterPage />);
    expect(container.querySelector("#form-rhf-input-name")).toBeTruthy();
    expect(container.querySelector("#form-rhf-input-email")).toBeTruthy();
    expect(container.querySelector("#form-rhf-input-password")).toBeTruthy();
    expect(
      container.querySelector("#form-rhf-input-password-confirmation"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /registrar/i })).toBeTruthy();
  });

  it("shows validation error when name is too short", async () => {
    const { container } = render(<RegisterPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-name")!, {
      target: { value: "A" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "senha12345" },
    });
    fireEvent.change(
      container.querySelector("#form-rhf-input-password-confirmation")!,
      { target: { value: "senha12345" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));
    await screen.findByText("O nome deve ter pelo menos 2 caracteres");
  });

  it("shows validation error when passwords do not match", async () => {
    const { container } = render(<RegisterPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-name")!, {
      target: { value: "João Silva" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "joao@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "senha12345" },
    });
    fireEvent.change(
      container.querySelector("#form-rhf-input-password-confirmation")!,
      { target: { value: "outraSenha" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));
    await screen.findByText("As senhas não coincidem");
  });

  it("calls register and navigates to login on valid submit", async () => {
    mockRegister.mockResolvedValue(undefined);
    const { container } = render(<RegisterPage />);
    fillValidForm(container);
    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));
    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        name: "João Silva",
        email: "joao@example.com",
        password: "senha12345",
        password_confirmation: "senha12345",
      }),
    );
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows API error message via toast on axios error", async () => {
    const { toast } = await import("sonner");
    const axiosErr = {
      isAxios: true,
      response: { data: { message: "E-mail já cadastrado" } },
    };
    mockRegister.mockRejectedValue(axiosErr);
    const { container } = render(<RegisterPage />);
    fillValidForm(container);
    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("E-mail já cadastrado"),
    );
  });

  it("shows default error message when error is not from axios", async () => {
    const { toast } = await import("sonner");
    mockRegister.mockRejectedValue(new Error("network failure"));
    const { container } = render(<RegisterPage />);
    fillValidForm(container);
    fireEvent.click(screen.getByRole("button", { name: /registrar/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Falha no registro"),
    );
  });
});
