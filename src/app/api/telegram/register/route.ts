import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/db/queries";
import { SETTING_KEYS } from "@/lib/constants";
import { registerWebhook, getWebhookInfo } from "@/services/telegram";

export async function GET() {
  const token = await getSetting(SETTING_KEYS.TELEGRAM_BOT_TOKEN);
  if (!token) {
    return NextResponse.json({ connected: false, message: "Token not set" });
  }

  const webhookInfo = await getWebhookInfo(token);
  if (!webhookInfo) {
    return NextResponse.json({ connected: false, message: "Failed to get webhook info" });
  }

  return NextResponse.json({
    connected: webhookInfo.url.length > 0,
    url: webhookInfo.url,
    pendingUpdateCount: webhookInfo.pending_update_count,
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = await getSetting(SETTING_KEYS.TELEGRAM_BOT_TOKEN);
    if (!token) {
      return NextResponse.json(
        { error: "Telegram Bot Token is not configured." },
        { status: 400 }
      );
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: "Public App URL is required to register webhook." },
        { status: 400 }
      );
    }

    const webhookEndpoint = `${url}/api/webhook/telegram`;
    const success = await registerWebhook(token, webhookEndpoint);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to register webhook with Telegram API." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, registeredUrl: webhookEndpoint });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
