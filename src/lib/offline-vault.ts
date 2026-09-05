/**
 * Ibom Power Hub - Offline Zero-Data Storage Vault
 * 
 * Provides resilient, encrypted-ready local storage for critical assets:
 * 1. STS Electricity Vending Tokens & Receipts (usable when power is out and cellular is down)
 * 2. Ibom Air Boarding Passes & Offline QR Data (usable at Victor Attah International Airport gates)
 * 3. Emergency SOS contacts & offline municipal guides
 */

export interface CachedPowerToken {
  id: string;
  meterNumber: string;
  disco: string;
  token: string;
  units: number;
  amount: number;
  customerName?: string;
  address?: string;
  createdAt: string;
  savedAt: number;
}

export interface CachedFlightTicket {
  id: string;
  bookingRef: string;
  flightNumber: string;
  passengerName: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seat: string;
  gate: string;
  class: string;
  qrPayload: string;
  savedAt: number;
}

const STORAGE_KEYS = {
  POWER_TOKENS: 'ibom_vault_power_tokens_v1',
  FLIGHT_TICKETS: 'ibom_vault_flight_tickets_v1',
  EMERGENCY_DATA: 'ibom_vault_emergency_data_v1',
};

// Safe helper for browser localStorage
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[Vault] Error reading ${key}:`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[Vault] Error saving ${key}:`, e);
    return false;
  }
}

/* ==================== POWER TOKENS VAULT ==================== */

export function saveOfflinePowerToken(tokenData: Omit<CachedPowerToken, 'savedAt'>): void {
  const existing = getLocalItem<CachedPowerToken[]>(STORAGE_KEYS.POWER_TOKENS, []);
  // Prevent duplicate tokens
  const filtered = existing.filter(t => t.token !== tokenData.token && t.id !== tokenData.id);
  const updated: CachedPowerToken[] = [
    { ...tokenData, savedAt: Date.now() },
    ...filtered
  ].slice(0, 50); // Keep last 50 receipts locally
  setLocalItem(STORAGE_KEYS.POWER_TOKENS, updated);
}

export function getOfflinePowerTokens(): CachedPowerToken[] {
  return getLocalItem<CachedPowerToken[]>(STORAGE_KEYS.POWER_TOKENS, []);
}

export function clearOfflinePowerTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.POWER_TOKENS);
  }
}

/* ==================== FLIGHT TICKETS VAULT ==================== */

export function saveOfflineFlightTicket(ticket: Omit<CachedFlightTicket, 'savedAt'>): void {
  const existing = getLocalItem<CachedFlightTicket[]>(STORAGE_KEYS.FLIGHT_TICKETS, []);
  const filtered = existing.filter(t => t.bookingRef !== ticket.bookingRef && t.id !== ticket.id);
  const updated: CachedFlightTicket[] = [
    { ...ticket, savedAt: Date.now() },
    ...filtered
  ].slice(0, 20); // Keep last 20 boarding passes
  setLocalItem(STORAGE_KEYS.FLIGHT_TICKETS, updated);
}

export function getOfflineFlightTickets(): CachedFlightTicket[] {
  return getLocalItem<CachedFlightTicket[]>(STORAGE_KEYS.FLIGHT_TICKETS, []);
}

export function clearOfflineFlightTickets(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.FLIGHT_TICKETS);
  }
}
