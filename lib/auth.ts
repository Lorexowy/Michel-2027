"use client";

const CORRECT_PASSWORD = "Rabe19122025";
const SESSION_KEY = "michel_2027_session";

export interface SessionData {
  authenticated: boolean;
  timestamp: number;
}

/**
 * Checks if the provided password is correct
 */
export function validatePassword(password: string): boolean {
  return password === CORRECT_PASSWORD;
}

/**
 * Creates a session and stores it in localStorage
 */
export function createSession(): void {
  if (typeof window === "undefined") return;
  
  const session: SessionData = {
    authenticated: true,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Checks if there is a valid session in localStorage
 */
export function hasValidSession(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session: SessionData = JSON.parse(sessionStr);
    
    // Check if session is authenticated and not expired (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - session.timestamp > thirtyDaysInMs;
    
    return session.authenticated && !isExpired;
  } catch {
    return false;
  }
}

/**
 * Clears the session from localStorage
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Gets the session timestamp
 */
export function getSessionTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session: SessionData = JSON.parse(sessionStr);
    return session.timestamp;
  } catch {
    return null;
  }
}

