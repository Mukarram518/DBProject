const API_BASE = import.meta.env["VITE_API_URL"] || "http://localhost:5000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(json.message || "An API error occurred");
  }

  return json.data !== undefined ? json.data : json;
}
