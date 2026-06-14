import { NextResponse } from "next/server";
import { sanitizeString } from "@/lib/sanitize";
import { validatePromo } from "@/lib/promos";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = sanitizeString(body.code, 50);
    const tierId = sanitizeString(body.tierId, 50);
    const quantity = typeof body.quantity === "number" ? body.quantity : 1;
    const email = sanitizeString(body.email, 150);

    if (!code || !tierId) {
      return NextResponse.json({ valid: false, error: "Promo code and ticket tier are required." }, { status: 400 });
    }

    const result = validatePromo(code, tierId, quantity, email || undefined);

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        finalPrice: result.finalPrice,
        discountType: result.promo?.discountType,
        discountValue: result.promo?.discountValue,
      });
    } else {
      return NextResponse.json({ valid: false, error: result.error });
    }
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Validation server error." }, { status: 500 });
  }
}
