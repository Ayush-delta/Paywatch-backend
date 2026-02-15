import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ──── Attach auth token to every request (if stored) ────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  AUTH
export const signIn = (credentials) => api.post("/auth/sign-in", credentials);
export const signUp = (data) => api.post("/auth/sign-up", data);
export const signOut = () => api.post("/auth/sign-out");

//  USERS
export const fetchUsers = () => api.get("/users");
export const fetchUser = (id) => api.get(`/users/${id}`);

//  SUBSCRIPTIONS
export const fetchSubscriptions = () => api.get("/subscriptions");
export const fetchSubscription = (id) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data) => api.post("/subscriptions", data);
export const fetchUserSubscriptions = (userId) =>
  api.get(`/subscriptions/user/${userId}`);

//  WORKFLOWS
export const triggerReminder = () =>
  api.post("/workflows/subscription/reminder");

//  SECURITY
export const fetchLogs = () => api.get("/security/logs");
export const fetchStats = () => api.get("/security/stats");

export default api;
