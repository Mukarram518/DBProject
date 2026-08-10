let rawApiUrl = (import.meta.env["VITE_API_URL"] || "").trim();

// Guard against setting VITE_API_URL to a mysql:// database URL by mistake
if (rawApiUrl.startsWith("mysql://") || rawApiUrl.startsWith("mysqls://")) {
  console.warn("VITE_API_URL was set to a MySQL database string instead of an HTTP API server URL. Falling back to http://localhost:5000/api");
  rawApiUrl = "";
}

function getNormalizedApiBase(url: string): string {
  if (!url) return "http://localhost:5000/api";
  
  // Clean trailing slashes
  let cleanUrl = url.replace(/\/+$/, "");

  // Add https:// if no protocol is specified (unless localhost)
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Ensure /api suffix is present
  if (!cleanUrl.endsWith("/api")) {
    cleanUrl = `${cleanUrl}/api`;
  }

  return cleanUrl;
}

const API_BASE = getNormalizedApiBase(rawApiUrl);

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

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch (err) {
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      throw new Error(
        `API returned HTML instead of JSON. Ensure VITE_API_URL is set in Vercel settings to your Railway backend URL (e.g., https://your-backend.up.railway.app/api). Current API_BASE: "${API_BASE}"`
      );
    }
    throw new Error(`Failed to parse API response: ${text.slice(0, 100)}`);
  }

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `API error (${response.status})`);
  }

  return json.data !== undefined ? json.data : json;
}
