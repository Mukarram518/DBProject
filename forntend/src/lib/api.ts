let rawApiUrl = import.meta.env["VITE_API_URL"] || "";

// Guard against setting VITE_API_URL to a mysql:// database URL by mistake
if (rawApiUrl.startsWith("mysql://") || rawApiUrl.startsWith("mysqls://")) {
  console.warn("VITE_API_URL was set to a MySQL database string instead of an HTTP API server URL. Falling back to http://localhost:5000/api");
  rawApiUrl = "";
}

const API_BASE = rawApiUrl.replace(/\/+$/, "") || "http://localhost:5000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(json.message || "An API error occurred");
  }

  return json.data !== undefined ? json.data : json;
}
