import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockRefresh = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: () => ({ refresh: mockRefresh }),
}));

const mockLogin = vi.fn();
vi.mock("@/services/auth", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

const mockSetAccessToken = vi.fn();
vi.mock("@/services/token-storage", () => ({
  setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("axios", () => ({
  isAxiosError: (e: unknown) =>
    typeof e === "object" && e !== null && (e as { isAxios?: boolean }).isAxios === true,
}));

beforeEach(() => vi.clearAllMocks());

describe("LoginPage", () => {
  it("renders email field, password field, and submit button", () => {
    const { container } = render(<LoginPage />);
    expect(container.querySelector("#form-rhf-input-email")).toBeTruthy();
    expect(container.querySelector("#form-rhf-input-password")).toBeTruthy();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { container } = render(<LoginPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "not-an-email" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await screen.findByText("E-mail inválido");
  });

  it("shows validation error for password shorter than 8 characters", async () => {
    const { container } = render(<LoginPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await screen.findByText("A senha deve ter pelo menos 8 caracteres");
  });

  it("calls login, setAccessToken, refresh and navigates on valid submit", async () => {
    mockLogin.mockResolvedValue("token-abc");
    mockRefresh.mockResolvedValue(undefined);
    const { container } = render(<LoginPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123"),
    );
    expect(mockSetAccessToken).toHaveBeenCalledWith("token-abc");
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows API error message via toast on axios error", async () => {
    const { toast } = await import("sonner");
    const axiosErr = {
      isAxios: true,
      response: { data: { message: "Credenciais inválidas" } },
    };
    mockLogin.mockRejectedValue(axiosErr);
    const { container } = render(<LoginPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Credenciais inválidas"),
    );
  });

  it("shows default error message when error is not from axios", async () => {
    const { toast } = await import("sonner");
    mockLogin.mockRejectedValue(new Error("network failure"));
    const { container } = render(<LoginPage />);
    fireEvent.change(container.querySelector("#form-rhf-input-email")!, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(container.querySelector("#form-rhf-input-password")!, {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Falha no login"),
    );
  });
});
