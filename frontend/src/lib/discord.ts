const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface SendDiscordWebhookParams {
  formType: string;
  title: string;
  color: number; // Decimal color code (e.g. 21247 for 0x0052ff)
  fields: DiscordEmbedField[];
}

export async function sendDiscordWebhook({ formType, title, color, fields }: SendDiscordWebhookParams): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("[WARN] DISCORD_WEBHOOK_URL is not configured. Webhook dispatch skipped.");
    return false;
  }

  const payload = {
    username: "ThunderCipher Security Bot",
    avatar_url: "https://github.com/aigo-admin/tcconf2026/raw/main/Logo/C.png", // fallback or public avatar
    allowed_mentions: {
      parse: [], // Disallow all pings (@everyone, @here, role pings, user pings)
    },
    embeds: [
      {
        title,
        color,
        description: `A new **${formType}** transmission has been parsed and logged successfully.`,
        fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: "ThunderCipher 2026 Security Core // API v1.0.0",
        },
      },
    ],
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to post payload to Discord Webhook:", error);
    return false;
  }
}
