import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const { name, email, company, role, sponsorTier, message, captchaToken } = await request.json();

    if (!name || !email || !company || !role || !sponsorTier || !message || !captchaToken) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!captchaToken.startsWith("tc_sec_token_")) {
      return NextResponse.json({ error: "Security Firewall verification failed." }, { status: 401 });
    }

    const success = await sendDiscordWebhook({
      formType: "Sponsor Application",
      title: "Incoming Transmission: Corporate Sponsor",
      color: 16768256, // 0xffa500 - Gold/Orange
      fields: [
        { name: "Contact Name", value: name, inline: true },
        { name: "Email Address", value: email, inline: true },
        { name: "Company/Org", value: company, inline: true },
        { name: "Job Role", value: role, inline: true },
        { name: "Requested Tier", value: sponsorTier, inline: true },
        { name: "Inquiry/Details", value: message },
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
