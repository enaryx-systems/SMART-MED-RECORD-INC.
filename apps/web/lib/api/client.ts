import { demoCases } from "@/lib/data/cases";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function getCases() {
  try {
    const response = await fetch(`${API_URL}/cases`, { cache: "no-store" });
    if (!response.ok) throw new Error("Cases request failed");
    return await response.json();
  } catch {
    return demoCases;
  }
}

export async function login(payload: { email: string; password: string; role: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      accessToken: "demo-token",
      user: {
        name: payload.email.split("@")[0],
        email: payload.email,
        role: payload.role,
        firm: "Hamilton & Pierce LLP",
      },
    };
  }

  return response.json();
}
