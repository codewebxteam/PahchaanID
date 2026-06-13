const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const BASE = `${API_URL}/api/v1`;

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken() {
  return _token;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data as T;
}

// ─── ID Type mapping (frontend key → backend enum) ───
const ID_TYPE_MAP: Record<string, string> = {
  aadhaar: 'AADHAAR',
  pan: 'PAN',
  licence: 'DRIVING_LICENSE',
  passport: 'PASSPORT',
  voter: 'VOTER_ID',
};

export function mapIdType(frontendKey: string): string {
  return ID_TYPE_MAP[frontendKey] || frontendKey.toUpperCase();
}

// ─── Owner endpoints ───

export function ownerRegister(name: string, phone: string, email?: string) {
  return request<{ message: string; ownerId: string; otp: string }>(
    '/owner/register',
    { method: 'POST', body: JSON.stringify({ name, phone, email }) },
  );
}

export function ownerLogin(phone: string) {
  return request<{ message: string; otp: string }>(
    '/owner/login',
    { method: 'POST', body: JSON.stringify({ phone }) },
  );
}

export function ownerVerifyOtp(phone: string, otp: string) {
  return request<{ message: string; token: string }>(
    '/owner/verify-otp',
    { method: 'POST', body: JSON.stringify({ phone, otp }) },
  );
}

export function ownerProfile() {
  return request<{ owner: any }>('/owner/profile');
}

export function addHotel(data: {
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  districtId?: string;
  latitude: number;
  longitude: number;
}) {
  return request<{ message: string; hotel: any }>('/owner/hotel', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function subscribeHotel(hotelId: string) {
  return request<{ message: string; subscription: any }>(
    `/owner/hotel/${hotelId}/subscribe`,
    { method: 'POST' },
  );
}

export function addManagerToHotel(hotelId: string, name: string, phone: string) {
  return request<{ message: string; manager: any }>(
    `/owner/hotel/${hotelId}/manager`,
    { method: 'POST', body: JSON.stringify({ name, phone }) },
  );
}

export function removeManagerFromHotel(hotelId: string, managerId: string) {
  return request<{ message: string }>(
    `/owner/hotel/${hotelId}/manager/${managerId}`,
    { method: 'DELETE' },
  );
}

export function getHotelVerifications(hotelId: string) {
  return request<{ verifications: any[] }>(
    `/owner/hotel/${hotelId}/verifications`,
  );
}

// ─── Manager endpoints ───

export function managerLogin(phone: string) {
  return request<{ message: string; otp: string }>(
    '/manager/login',
    { method: 'POST', body: JSON.stringify({ phone }) },
  );
}

export function managerVerifyOtp(phone: string, otp: string) {
  return request<{ message: string; token: string }>(
    '/manager/verify-otp',
    { method: 'POST', body: JSON.stringify({ phone, otp }) },
  );
}

export function managerProfile() {
  return request<{ manager: any }>('/manager/profile');
}

export function createVerification(data: {
  type: 'COUPLE' | 'FAMILY' | 'STUDENT' | 'PROFESSIONAL';
  adults?: number;
  children?: number;
  purpose?: string;
  persons: Array<{ name?: string; idType: string; idNumber: string }>;
}) {
  return request<{ message: string; verification: any }>(
    '/manager/verification',
    { method: 'POST', body: JSON.stringify(data) },
  );
}

export function getManagerVerifications() {
  return request<{ verifications: any[] }>('/manager/verifications');
}

// ─── District endpoints (public) ───

export function getDistricts(state: string) {
  return request<{ districts: any[] }>(
    `/districts?state=${encodeURIComponent(state)}`,
  );
}
