const API_URL = "http://localhost:5000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api(path, options = {}) {
  const token = getToken();

  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  if (!cleanPath.startsWith("/api")) {
    cleanPath = `/api${cleanPath}`;
  }

  const fullUrl = `${API_URL}${cleanPath}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}