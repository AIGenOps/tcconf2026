import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";
import { sanitizeString, isValidEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 150);
    const partnerOrg = sanitizeString(body.partnerOrg, 150);
    const partnerType = sanitizeString(body.partnerType, 100);
    const message = sanitizeString(body.message, 1000);
    const captchaToken = sanitizeString(body.captchaToken, 100);

    if (!name || !email || !partnerOrg || !partnerType || !message || !captchaToken) {
      return NextResponse.json({ error: "Missing required fields or invalid format." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!captchaToken.startsWith("tc_sec_token_")) {
      return NextResponse.json({ error: "Security Firewall verification failed." }, { status: 401 });
    }

    const success = await sendDiscordWebhook({
      formType: "Partner Application",
      title: "Incoming Transmission: Community/Academic Partner",
      color: 61695, // 0x00f0ff - Cyan
      fields: [
        { name: "Representative Name", value: name, inline: true },
        { name: "Email Address", value: email, inline: true },
        { name: "Partner Org/Club", value: partnerOrg, inline: true },
        { name: "Partnership Type", value: partnerType, inline: true },
        { name: "Objective Details", value: message },
      ],
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to dispatch notification to webhook." }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server validation error." }, { status: 500 });
  }
}
