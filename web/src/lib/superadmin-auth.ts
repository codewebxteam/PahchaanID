const TOKEN_KEY = "sa_token";
const NAME_KEY = "sa_name";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, name?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (name) localStorage.setItem(NAME_KEY, name);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getAdminName(): string {
  if (typeof window === "undefined") return "Super Admin";
  return localStorage.getItem(NAME_KEY) ?? "Super Admin";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
