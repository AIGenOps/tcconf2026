import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const { name, email, github, skills, message, captchaToken } = await request.json();

    if (!name || !email || !github || !skills || !message || !captchaToken) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!github.startsWith("http")) {
      return NextResponse.json({ error: "Invalid GitHub profile link." }, { status: 400 });
    }

    if (!captchaToken.startsWith("tc_sec_token_")) {
      return NextResponse.json({ error: "Security Firewall verification failed." }, { status: 401 });
    }

    const success = await sendDiscordWebhook({
      formType: "Volunteer Registration",
      title: "Incoming Transmission: Event Volunteer",
      color: 8388863, // 0x8000ff - Purple
      fields: [
        { name: "Candidate Name", value: name, inline: true },
        { name: "Email Address", value: email, inline: true },
        { name: "GitHub Link", value: github, inline: true },
        { name: "Stated Skills", value: skills, inline: true },
        { name: "Cover Details", value: message },
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
