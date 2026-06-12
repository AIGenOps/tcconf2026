export interface TicketTier {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  desc: string;
  features: string[];
  badge?: string;
  color: string;
}

export const TICKET_TIERS: Record<string, TicketTier> = {
  student: {
    id: "student",
    name: "Student Pass",
    price: 999,
    originalPrice: 1500,
    desc: "Requires a valid student ID card at check-in. Valid for currently enrolled student delegates.",
    features: [
      "Access to both days of presentations",
      "Entry to Hacking Villages",
      "Participation in CTF event",
      "Digital Certificate of Attendance",
      "Snacks and beverages included",
    ],
    badge: "STUDENT",
    color: "border-slate-500/30 text-slate-400",
  },
  individual: {
    id: "individual",
    name: "Individual Pass",
    price: 1499,
    originalPrice: 2000,
    desc: "Standard entrance pass for security professionals, researchers, developers & individuals.",
    features: [
      "Access to both days of presentations",
      "Entry to Hacking Villages",
      "Participation in CTF event",
      "Digital Certificate of Attendance",
      "Snacks and beverages included",
      "Entrance to premium workshops",
      "Dedicated corporate networking lunch",
      "Physical badge and welcome kit",
    ],
    badge: "RECOMMENDED",
    color: "border-thunder-blue/40 text-thunder-blue shadow-glow-blue",
  },
  woman_in_cyber: {
    id: "woman_in_cyber",
    name: "Woman in Cyber Pass",
    price: 1399,
    originalPrice: 1800,
    desc: "Special discounted pass promoting diversity and inclusion in the cybersecurity ecosystem.",
    features: [
      "Access to both days of presentations",
      "Entry to Hacking Villages",
      "Participation in CTF event",
      "Digital Certificate of Attendance",
      "Snacks and beverages included",
      "Invitation to Women in Cyber networking session",
      "Mentorship pairing options",
      "Physical badge and special diversity swag kit",
    ],
    badge: "DIVERSITY",
    color: "border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
  },
  corporate: {
    id: "corporate",
    name: "Corporate Pass",
    price: 2499,
    originalPrice: 3000,
    desc: "Exclusive entrance pass for corporate teams, CXOs, sponsors, and organisation representatives.",
    features: [
      "Access to both days of presentations",
      "Entry to Hacking Villages",
      "Participation in CTF event",
      "Digital Certificate of Attendance",
      "Snacks and beverages included",
      "Reserved front-row seating in keynotes",
      "Exclusive invite to the CXO Networking Dinner",
      "1-on-1 speaker meetups request access",
      "Corporate logo featured on event rollup banner",
    ],
    badge: "BUSINESS",
    color: "border-thunder-cyan/40 text-thunder-cyan shadow-glow-cyan",
  },
};

export const CONVENIENCE_FEE_PERCENT = 0.02; // 2% gateway convenience charge

export const VALID_PROMO_CODES: Record<string, { discountPrice: number; targetTierId: string }> = {};

export function calculateTotal(tierId: string, quantity: number, promoCode?: string) {
  const tier = TICKET_TIERS[tierId];
  if (!tier) return null;

  let unitPrice = tier.price;
  let isPromoApplied = false;

  if (promoCode) {
    const formattedCode = promoCode.trim().toUpperCase();
    const promo = VALID_PROMO_CODES[formattedCode];
    if (promo && promo.targetTierId === tierId) {
      unitPrice = promo.discountPrice;
      isPromoApplied = true;
    }
  }

  const subtotal = unitPrice * quantity;
  const fees = Math.round(subtotal * CONVENIENCE_FEE_PERCENT);
  const total = subtotal + fees;
  
  return {
    subtotal,
    fees,
    total,
    unitPrice,
    isPromoApplied,
  };
}
