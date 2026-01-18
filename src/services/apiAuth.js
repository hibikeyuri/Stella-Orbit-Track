import { apiFetch } from "./http";

export async function signup({ fullName, email, password }) {
  const data = await apiFetch("/user/signup", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, mfa_enabled: false }),
  });

  return data;
}

export async function login({ email, password }) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  form.append("grant_type", "password");

  const data = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  }).then((res) => {
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  });

  localStorage.setItem("access_token", data.access_token);

  console.log(data);

  return data;
}

export async function getCurrentUser() {
  try {
    const data = await apiFetch("/user/me");
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function logout() {
  await apiFetch("/user/logout", {
    method: "POST",
  });
  localStorage.removeItem("access_token");
}

export async function updateCurrentUser({ fullName, password, avatar }) {
  const body = {};
  if (fullName) body.fullName = fullName;
  if (password) body.password = password;

  const updatedUser = await apiFetch("/user/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (avatar) {
    const formData = new FormData();
    formData.append("file", avatar);

    const image = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/upload/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      },
    ).then((res) => res.json());

    const finalUser = await apiFetch("/user/me", {
      method: "PATCH",
      body: JSON.stringify({ avatar: image.url }),
    });

    return finalUser;
  }

  return updatedUser;
}

export async function getOAuthLoginUrl(provider) {
  const data = await apiFetch(`/oauth/${provider}/login`);

  console.log("OAuth login response:", data);

  if (!data?.auth_url) {
    throw new Error("No auth_url returned from server");
  }

  return data.auth_url;
}

export function setAuthToken(token) {
  localStorage.setItem("access_token", token);
}
