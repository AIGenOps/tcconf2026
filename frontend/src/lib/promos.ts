/**
 * THUNDERCIPHER 2026 // DYNAMIC PROMO CODE ENGINE
 * Reads promo codes from the JSON data file at runtime.
 * This module is SERVER-SIDE ONLY — do not import from client components.
 */

import fs from "fs";
import path from "path";
import { TICKET_TIERS } from "./tickets";

export interface PromoCode {
  code: string;
  discountType: "fixed" | "percentage" | "flat";
  discountValue: number;
  targetTier: string;
  enabled: boolean;
  expiryDate: string | null;
  maxUses: number | null;
  currentUses: number;
  singleUsePerEmail: boolean;
  minQuantity: number;
  usedEmails: string[];
  note: string;
  createdAt: string;
}

interface PromosData {
  promos: PromoCode[];
  settings: { password: string };
}

const PROMOS_FILE = path.join(process.cwd(), "src", "data", "promos.json");

/** Read all promos from the JSON file */
export function loadPromos(): PromoCode[] {
  try {
    if (!fs.existsSync(PROMOS_FILE)) return [];
    const data = fs.readFileSync(PROMOS_FILE, "utf8");
    const parsed: PromosData = JSON.parse(data);
    return parsed.promos || [];
  } catch (err) {
    console.error("Failed to load promos.json:", err);
    return [];
  }
}

/** Save promos back to the JSON file */
function savePromos(promos: PromoCode[]): void {
  try {
    let settings = { password: "tc2026admin" };
    if (fs.existsSync(PROMOS_FILE)) {
      try {
        const existing: PromosData = JSON.parse(fs.readFileSync(PROMOS_FILE, "utf8"));
        settings = existing.settings || settings;
      } catch { /* use default */ }
    }
    const data: PromosData = { promos, settings };
    fs.writeFileSync(PROMOS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save promos.json:", err);
  }
}

/** Validate a promo code against all rules and return discount info */
export function validatePromo(
  code: string,
  tierId: string,
  quantity: number,
  email?: string
): { valid: boolean; error?: string; promo?: PromoCode; finalPrice?: number } {
  const promos = loadPromos();
  const formattedCode = code.trim().toUpperCase();
  const promo = promos.find((p) => p.code === formattedCode);

  if (!promo) {
    return { valid: false, error: "Invalid promo code." };
  }

  if (!promo.enabled) {
    return { valid: false, error: "This promo code is currently disabled." };
  }

  // Check tier targeting
  if (promo.targetTier !== "*" && promo.targetTier !== tierId) {
    const tierName = TICKET_TIERS[promo.targetTier]?.name || promo.targetTier;
    return { valid: false, error: `This promo code is only valid for the ${tierName}.` };
  }

  // Check expiry
  if (promo.expiryDate) {
    const expiry = new Date(promo.expiryDate);
    if (new Date() > expiry) {
      return { valid: false, error: "This promo code has expired." };
    }
  }

  // Check max uses
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
    return { valid: false, error: "This promo code has reached its maximum usage limit." };
  }

  // Check single use per email
  if (promo.singleUsePerEmail && email) {
    if (promo.usedEmails.includes(email.toLowerCase())) {
      return { valid: false, error: "This promo code has already been used with this email." };
    }
  }

  // Check minimum quantity
  if (quantity < promo.minQuantity) {
    return { valid: false, error: `This promo code requires a minimum of ${promo.minQuantity} ticket(s).` };
  }

  // Calculate final price based on discount type
  const tier = TICKET_TIERS[tierId];
  if (!tier) {
    return { valid: false, error: "Invalid ticket tier." };
  }

  let finalPrice: number;
  switch (promo.discountType) {
    case "fixed":
      finalPrice = promo.discountValue;
      break;
    case "percentage":
      finalPrice = Math.round(tier.price * (1 - promo.discountValue / 100));
      break;
    case "flat":
      finalPrice = Math.max(0, tier.price - promo.discountValue);
      break;
    default:
      finalPrice = tier.price;
  }

  return { valid: true, promo, finalPrice };
}

/** Record a promo code usage (increment counter, add email) */
export function recordPromoUsage(code: string, email?: string): void {
  const promos = loadPromos();
  const formattedCode = code.trim().toUpperCase();
  const promo = promos.find((p) => p.code === formattedCode);

  if (promo) {
    promo.currentUses += 1;
    if (email && promo.singleUsePerEmail) {
      promo.usedEmails.push(email.toLowerCase());
    }
    savePromos(promos);
  }
}
