import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";
import { sanitizeString, isValidEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 150);
    const message = sanitizeString(body.message, 1000);
    const captchaToken = sanitizeString(body.captchaToken, 100);

    // 1. Input Validation
    if (!name || !email || !message || !captchaToken) {
      return NextResponse.json({ error: "Missing required fields or invalid format." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // 2. CAPTCHA Check
    if (!captchaToken.startsWith("tc_sec_token_")) {
      return NextResponse.json({ error: "Security Firewall verification failed." }, { status: 401 });
    }

    // 3. Forward to Discord
    const success = await sendDiscordWebhook({
      formType: "General Inquiry",
      title: "Incoming Transmission: General Info Request",
      color: 21247, // 0x0052ff - ThunderBlue
      fields: [
        { name: "Sender Name", value: name, inline: true },
        { name: "Sender Email", value: email, inline: true },
        { name: "Message details", value: message },
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
