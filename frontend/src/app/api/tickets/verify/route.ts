import { NextResponse } from "next/server";
import crypto from "crypto";
import { TICKET_TIERS, calculateTotal } from "@/lib/tickets";
import { sanitizeString, isValidEmail, isValidPhone } from "@/lib/sanitize";
import { saveRegistration, RegistrationRecord } from "@/lib/registrations-db";
import { sendDiscordWebhook } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 150);
    const phone = sanitizeString(body.phone, 20);
    const organization = sanitizeString(body.organization, 150);
    const ticketType = sanitizeString(body.ticketType, 50);
    const quantity = body.quantity;
    const orderId = sanitizeString(body.orderId, 100);
    const paymentId = sanitizeString(body.paymentId, 100);
    const signature = sanitizeString(body.signature, 200);
    const promoCode = sanitizeString(body.promoCode, 50);

    // 1. Validation
    if (
      !name ||
      !email ||
      !phone ||
      !organization ||
      !ticketType ||
      !quantity ||
      !orderId ||
      !paymentId
    ) {
      return NextResponse.json({ error: "Required verification parameters are missing or formatted incorrectly." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    const tier = TICKET_TIERS[ticketType];
    if (!tier) {
      return NextResponse.json({ error: "Invalid ticket type." }, { status: 400 });
    }

    const priceDetails = calculateTotal(ticketType, quantity, promoCode);
    if (!priceDetails) {
      return NextResponse.json({ error: "Calculation failure." }, { status: 500 });
    }

    const { subtotal, fees, total } = priceDetails;

    // 2. Perform Payment Gateway Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payment verification system is offline (credentials missing)." }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Signature token is missing." }, { status: 400 });
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      generatedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, signatureBuffer)
    ) {
      console.error("Cryptographic signature match failed (timing-safe check).");
      return NextResponse.json({ error: "Cryptographic signature validation check failed." }, { status: 400 });
    }

    // 3. Generate Unique Registration ID
    // Format: TC-2026-[TIER_CODE]-[RANDOM_5_ALPHANUMERIC]
    const tierCodeMap: Record<string, string> = {
      student: "SD",
      individual: "ID",
      woman_in_cyber: "WC",
      corporate: "CO",
    };
    const tierCode = tierCodeMap[ticketType] || "TX";
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase().substring(0, 5);
    const registrationId = `TC-2026-${tierCode}-${randomHex}`;

    // 4. Create Registration Record
    const record: RegistrationRecord = {
      registrationId,
      name,
      email,
      phone,
      organization,
      ticketType,
      ticketName: tier.name,
      quantity,
      subtotal,
      fees,
      totalAmount: total,
      paymentId,
      orderId,
      paymentStatus: "captured",
      isMock: false,
      createdAt: new Date().toISOString(),
    };

    // 5. Store Registration in Local JSON Database
    const dbSaved = await saveRegistration(record);
    if (!dbSaved) {
      console.error("Failed to store ticket purchase record.");
    }

    // 6. Send Discord Notification
    const formType = "Live Ticket Purchase";
    const title = `Security Core Node: Ticket Confirmed [${registrationId}]`;
    
    // Determine color based on ticket type: Corporate (Cyan), Individual (Blue), Student (Slate/Gray), Woman in Cyber (Purple)
    const colorMap: Record<string, number> = {
      student: 10066329, // Slate/Gray
      individual: 21247, // Blue
      woman_in_cyber: 11272447, // Purple
      corporate: 61695, // Cyan
    };
    const color = colorMap[ticketType] || 21247;

    await sendDiscordWebhook({
      formType,
      title,
      color,
      fields: [
        { name: "Registration ID", value: `\`${registrationId}\``, inline: true },
        { name: "Attendee Name", value: name, inline: true },
        { name: "Email Address", value: email, inline: true },
        { name: "Phone Number", value: phone, inline: true },
        { name: "Organization/College", value: organization, inline: true },
        { name: "Pass Type", value: tier.name, inline: true },
        { name: "Quantity", value: `${quantity} pass(es)`, inline: true },
        { name: "Total Paid", value: `₹${total.toLocaleString("en-IN")}`, inline: true },
        { name: "Payment ID", value: `\`${paymentId}\``, inline: true },
        { name: "Order ID", value: `\`${orderId}\``, inline: true },
        { name: "Environment", value: "PRODUCTION_LIVE", inline: true },
      ],
    });

    return NextResponse.json({
      success: true,
      registrationId,
      record,
    });
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return NextResponse.json({ error: "Verification server-side validation error." }, { status: 500 });
  }
}
