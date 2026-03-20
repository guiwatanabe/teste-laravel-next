import { isAxiosError } from "axios";
import axiosInstance from "./api";
import { removeAccessToken } from "./token-storage";

export type Role = "admin" | "user";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export const getUser = async (): Promise<UserProfile> => {
  const res = await axiosInstance.get("/api/auth/user");
  return res.data?.data?.user as UserProfile;
};

export interface UpdateProfileParams {
  name?: string;
  email?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export type ProfileFieldErrors = Partial<
  Record<"name" | "email" | "current_password" | "password" | "password_confirmation", string[]>
>;

export class ProfileValidationError extends Error {
  fieldErrors: ProfileFieldErrors;
  constructor(message: string, fieldErrors: ProfileFieldErrors) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export const updateProfile = async (
  params: UpdateProfileParams,
): Promise<UserProfile> => {
  try {
    const res = await axiosInstance.post("/api/auth/profile", params);
    return res.data?.data?.user as UserProfile;
  } catch (error) {
    if (isAxiosError(error)) {
      const data = error.response?.data;
      const message = data?.message ?? "Falha ao atualizar perfil";
      if (error.response?.status === 422 && data?.errors) {
        throw new ProfileValidationError(message, data.errors as ProfileFieldErrors);
      }
      throw new Error(message);
    }
    throw new Error("Falha ao atualizar perfil");
  }
};

export const logout = async () => {
  try {
    await axiosInstance.post("/api/auth/logout");
  } catch {
  } finally {
    removeAccessToken();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  try {
    const response = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    const message = isAxiosError(error)
      ? (error.response?.data?.message ?? "Falha no login")
      : "Falha no login";
    throw new Error(message);
  }
};

export type RegisterParams = {
  name: string;
  email: string;
  password: string;
};

export const register = async (params: RegisterParams): Promise<void> => {
  const { name, email, password } = params;
  try {
    await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password
    });
  } catch (error) {
    const message = isAxiosError(error)
      ? (error.response?.data?.message ?? "Falha no registro")
      : "Falha no registro";
    throw new Error(message);
  }
};
