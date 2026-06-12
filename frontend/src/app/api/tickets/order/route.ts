import { NextResponse } from "next/server";
import { TICKET_TIERS, calculateTotal } from "@/lib/tickets";
import { sanitizeString, isValidEmail, isValidPhone } from "@/lib/sanitize";
import Razorpay from "razorpay";

// Initialize Razorpay conditionally based on environment variables
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 150);
    const phone = sanitizeString(body.phone, 20);
    const organization = sanitizeString(body.organization, 150);
    const ticketType = sanitizeString(body.ticketType, 50);
    const quantity = body.quantity;
    const captchaToken = sanitizeString(body.captchaToken, 2048); // Turnstile tokens are long
    const promoCode = sanitizeString(body.promoCode, 50);

    // 1. Inputs validation
    if (!name || !email || !phone || !organization || !ticketType || !quantity || !captchaToken) {
      return NextResponse.json({ error: "All registration fields are required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: "Quantity must be between 1 and 10." }, { status: 400 });
    }

    // 2. Anti-spam CAPTCHA verification (Cloudflare Turnstile)
    const turnstileSecret = "0x4AAAAAADjiMQaK5AwuLG4_DLusdkWmCek";
    try {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(captchaToken)}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        console.error("Cloudflare Turnstile verification failed:", verifyData["error-codes"]);
        return NextResponse.json({ error: "Security captcha verification failed. Please try again." }, { status: 401 });
      }
    } catch (err) {
      console.error("Error validating Turnstile captcha:", err);
      return NextResponse.json({ error: "Verification system is temporarily offline." }, { status: 500 });
    }

    // 3. Verify ticket tier and calculate totals
    const tier = TICKET_TIERS[ticketType];
    if (!tier) {
      return NextResponse.json({ error: "Invalid ticket type specified." }, { status: 400 });
    }

    const priceDetails = calculateTotal(ticketType, quantity, promoCode);
    if (!priceDetails) {
      return NextResponse.json({ error: "Error calculating price totals." }, { status: 500 });
    }

    const { total } = priceDetails;

    // 4. Create Order (Real Razorpay)
    if (!razorpay) {
      console.error("Razorpay API credentials are not configured.");
      return NextResponse.json({ error: "Payment gateway integration is currently offline." }, { status: 503 });
    }

    try {
      const order = await razorpay.orders.create({
        amount: total * 100, // Razorpay takes amount in paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `rcpt_tc26_${Math.random().toString(36).substring(2, 9)}`,
        notes: {
          name,
          email,
          phone,
          organization,
          ticketType,
          quantity: quantity.toString(),
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Send public key to client
      });
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      return NextResponse.json({ error: "Failed to initialize payment gateway order." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating tickets order:", error);
    return NextResponse.json({ error: "Internal server processing error." }, { status: 500 });
  }
}
