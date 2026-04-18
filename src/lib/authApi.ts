import { API_ROOT } from "./api";
import { authHeaders, setStoredToken } from "./authToken";

export type MeResponse = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
};

async function readDetail(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: unknown };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      return j.detail
        .map((d: { msg?: string }) => d?.msg)
        .filter(Boolean)
        .join("; ");
    }
  } catch {
    /* ignore */
  }
  return `HTTP ${res.status}`;
}

export async function loginWithPassword(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_ROOT}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readDetail(res));
  const j = (await res.json()) as { access_token: string };
  setStoredToken(j.access_token);
  return j.access_token;
}

export async function registerAccount(email: string, password: string, fullName?: string, role?: string): Promise<string> {
  const res = await fetch(`${API_ROOT}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName || null, role: role || "analyst" }),
  });
  if (!res.ok) throw new Error(await readDetail(res));
  const j = (await res.json()) as { access_token: string };
  setStoredToken(j.access_token);
  return j.access_token;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(`${API_ROOT}/auth/me`, {
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error(await readDetail(res));
  return (await res.json()) as MeResponse;
}
