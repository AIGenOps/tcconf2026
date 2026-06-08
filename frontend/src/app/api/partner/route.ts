import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const { name, email, partnerOrg, partnerType, message, captchaToken } = await request.json();

    if (!name || !email || !partnerOrg || !partnerType || !message || !captchaToken) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!email.includes("@") || email.length < 5) {
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
