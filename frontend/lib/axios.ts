// filepath: frontend/lib/axios.ts
// description: Pre-configured Axios instance pointing at the backend API.

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<never> => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Axios] Response error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
