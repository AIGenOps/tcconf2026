/**
 * THUNDERCIPHER 2026 // INPUT SECURITY ENGINE
 * Core validation and sanitization utilities to prevent XSS, Injection, and buffer attacks.
 */

// Sanitizes a string, enforcing max length limits and stripping HTML/XSS vectors
export function sanitizeString(val: any, maxLength: number = 1000): string {
  if (typeof val !== "string") return "";
  
  let clean = val.trim();
  
  // 1. Enforce strict character limits
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  
  // 2. Strip control characters
  clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  
  // 3. Strip HTML tags and script/inline event handlers to prevent XSS
  clean = clean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  clean = clean.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, ""); // Remove HTML tags
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/on\w+\s*=/gi, ""); // Block event handlers like onload, onerror, onclick
  
  return clean;
}

// Strictly validates email format using standard web syntax
export function isValidEmail(email: any): boolean {
  if (typeof email !== "string") return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 150) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  return emailRegex.test(clean);
}

// Validates phone numbers (10 to 16 characters, digits and standard spacing characters)
export function isValidPhone(phone: any): boolean {
  if (typeof phone !== "string") return false;
  const clean = phone.trim();
  if (clean.length < 10 || clean.length > 16) return false;
  
  const phoneRegex = /^\+?[0-9\s\-()]{10,16}$/;
  return phoneRegex.test(clean);
}

// Sanitizes and validates GitHub or external profile URLs
export function sanitizeUrl(url: any, maxLength: number = 200): string {
  if (typeof url !== "string") return "";
  const clean = sanitizeString(url, maxLength);
  
  if (!/^https?:\/\//i.test(clean)) {
    return "";
  }
  return clean;
}
