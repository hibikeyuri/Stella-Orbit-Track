const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");

    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Error");
  }

  if (response.status === 204) return null;

  return response.json();
}

export { apiFetch };
