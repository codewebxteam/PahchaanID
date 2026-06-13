const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const SUPERADMIN = `${BASE}/api/v1/superadmin`;

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
      localStorage.removeItem("sa_token");
      window.location.href = "/superadmin/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function saLogin(phone: string) {
  return request<{ message: string; otp?: string }>(
    `${SUPERADMIN}/login`,
    { method: "POST", body: JSON.stringify({ phone }) }
  );
}

export async function saVerifyOtp(phone: string, otp: string) {
  return request<{ message: string; token: string }>(
    `${SUPERADMIN}/verify-otp`,
    { method: "POST", body: JSON.stringify({ phone, otp }) }
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalHotels: number;
  totalOwners: number;
  totalManagers: number;
  totalAdmins: number;
  totalVerifications: number;
  totalDistricts: number;
  activeSubscriptions: number;
}

export async function saDashboard(token: string) {
  return request<DashboardStats>(`${SUPERADMIN}/dashboard`, {}, token);
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

export async function saGetHotels(token: string) {
  return request<{ hotels: HotelSummary[] }>(
    `${SUPERADMIN}/hotels`,
    {},
    token
  );
}

export async function saGetHotelDetail(token: string, hotelId: string) {
  return request<{ hotel: HotelSummary }>(
    `${SUPERADMIN}/hotels/${hotelId}`,
    {},
    token
  );
}

// ─── Owners ──────────────────────────────────────────────────────────────────

export interface OwnerRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  phoneVerified: boolean;
  createdAt: string;
  hotels: {
    id: string;
    name: string;
    status: string;
    district: { id: string; name: string; state: string } | null;
    subscriptions: SubscriptionRecord[];
    _count: { verifications: number; managers: number };
  }[];
}

export async function saGetOwners(token: string) {
  return request<{ owners: OwnerRecord[] }>(
    `${SUPERADMIN}/owners`,
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
    owner: { id: string; name: string; phone: string };
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

export async function saGetVerifications(token: string) {
  return request<{ verifications: VerificationRecord[] }>(
    `${SUPERADMIN}/verifications`,
    {},
    token
  );
}

// ─── Admin Management ────────────────────────────────────────────────────────

export interface AdminRecord {
  id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  createdAt: string;
  districts: {
    id: string;
    district: { id: string; name: string; state: string };
  }[];
}

export async function saGetAdmins(token: string) {
  return request<{ admins: AdminRecord[] }>(
    `${SUPERADMIN}/admins`,
    {},
    token
  );
}

export async function saCreateAdmin(
  token: string,
  data: { name: string; phone: string }
) {
  return request<{ message: string; admin: AdminRecord }>(
    `${SUPERADMIN}/admin`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function saAssignDistricts(
  token: string,
  adminId: string,
  districtIds: string[]
) {
  return request<{ message: string; admin: AdminRecord }>(
    `${SUPERADMIN}/admin/${adminId}/districts`,
    { method: "POST", body: JSON.stringify({ districtIds }) },
    token
  );
}

export async function saRemoveDistrict(
  token: string,
  adminId: string,
  districtId: string
) {
  return request<{ message: string }>(
    `${SUPERADMIN}/admin/${adminId}/districts/${districtId}`,
    { method: "DELETE" },
    token
  );
}

// ─── Districts ───────────────────────────────────────────────────────────────

export interface DistrictRecord {
  id: string;
  name: string;
  state: string;
  createdAt: string;
}

export async function saGetDistricts() {
  return request<{ districts: DistrictRecord[] }>(
    `${BASE}/api/v1/districts`
  );
}

export async function saCreateDistrict(
  token: string,
  data: { name: string; state: string }
) {
  return request<{ message: string; district: DistrictRecord }>(
    `${SUPERADMIN}/districts`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function saUpdateDistrict(
  token: string,
  districtId: string,
  data: { name?: string; state?: string }
) {
  return request<{ message: string; district: DistrictRecord }>(
    `${SUPERADMIN}/districts/${districtId}`,
    { method: "PATCH", body: JSON.stringify(data) },
    token
  );
}

export async function saDeleteDistrict(token: string, districtId: string) {
  return request<{ message: string }>(
    `${SUPERADMIN}/districts/${districtId}`,
    { method: "DELETE" },
    token
  );
}
