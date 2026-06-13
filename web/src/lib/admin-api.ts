const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const ADMIN = `${BASE}/api/v1/admin`;

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(phone: string) {
  return request<{ message: string; otp?: string }>(
    `${ADMIN}/login`,
    { method: "POST", body: JSON.stringify({ phone }) }
  );
}

export async function adminVerifyOtp(phone: string, otp: string) {
  return request<{ message: string; token: string }>(
    `${ADMIN}/verify-otp`,
    { method: "POST", body: JSON.stringify({ phone, otp }) }
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  districts: { id: string; name: string; state: string }[];
  totalHotels: number;
  totalVerifications: number;
  hotels: any[]; // we'll use HotelSummary below
}

export async function adminDashboard(token: string) {
  return request<AdminDashboardStats>(`${ADMIN}/dashboard`, {}, token);
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export interface HotelSummary {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "PENDING_PLAN" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  owner: { id: string; name: string; phone: string; email: string | null };
  managers: { id: string; name: string; phone: string }[];
  district: { id: string; name: string; state: string } | null;
  subscriptions: SubscriptionRecord[];
  _count: { verifications: number };
}

export interface SubscriptionRecord {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: string;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paidAt: string | null;
  createdAt: string;
}

export async function adminGetHotels(token: string) {
  return request<{ hotels: HotelSummary[] }>(
    `${ADMIN}/hotels`,
    {},
    token
  );
}

export async function adminGetHotelDetail(token: string, hotelId: string) {
  return request<{ hotel: HotelSummary }>(
    `${ADMIN}/hotels/${hotelId}`,
    {},
    token
  );
}

// ─── Verifications ───────────────────────────────────────────────────────────

export interface VerificationRecord {
  id: string;
  type: "COUPLE" | "FAMILY" | "STUDENT" | "PROFESSIONAL";
  adults: number;
  children: number;
  purpose: string | null;
  createdAt: string;
  manager: { id: string; name: string; phone: string };
  hotel: {
    id: string;
    name: string;
    district: { id: string; name: string; state: string } | null;
  };
  persons: {
    id: string;
    name: string;
    idType: string;
    idNumber: string;
    verified: boolean;
  }[];
}

export async function adminGetVerifications(token: string) {
  return request<{ verifications: VerificationRecord[] }>(
    `${ADMIN}/verifications`,
    {},
    token
  );
}
