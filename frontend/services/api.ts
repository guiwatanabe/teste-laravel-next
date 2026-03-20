import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "./token-storage";

interface ErrorResponse {
  status: string;
  message: string;
}

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

const SKIP_AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/refresh-token",
];

const isAuthRequest = (config: InternalAxiosRequestConfig): boolean => {
  return SKIP_AUTH_PATHS.some((path) => config.url?.startsWith(path));
};

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest)
    ) {
      originalRequest._retry = true;
      try {
        const response = await axiosInstance.post("/api/auth/refresh-token");
        const { access_token } = response.data;
        setAccessToken(access_token);
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        removeAccessToken();
        try {
          await axiosInstance.post("/api/auth/logout");
        } catch {
          /* ignore */
        }
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 400 &&
      error.response.data &&
      typeof error.response.data === "object"
    ) {
      const data = error.response.data as ErrorResponse;
      if (data.status === "error" && typeof data.message === "string") {
        return Promise.reject(new Error(data.message));
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
