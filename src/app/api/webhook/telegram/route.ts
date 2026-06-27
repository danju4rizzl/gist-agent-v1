import { NextRequest, NextResponse } from "next/server";
import { createRun, getSetting } from "@/db/queries";
import { SETTING_KEYS } from "@/lib/constants";
import { sendMessage } from "@/services/telegram";
import { tasks } from "@trigger.dev/sdk/v3";
import type { TelegramUpdate } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const token = await getSetting(SETTING_KEYS.TELEGRAM_BOT_TOKEN);
    if (!token) {
      console.error("Telegram Webhook received, but bot token is not configured.");
      return NextResponse.json({ error: "Token not configured" }, { status: 400 });
    }

    const body = (await request.json()) as TelegramUpdate;
    console.log("Telegram update received:", JSON.stringify(body));

    if (!body.message || !body.message.text || !body.message.chat) {
      // Return 200 so Telegram doesn't retry invalid payloads endlessly
      return NextResponse.json({ ok: true, msg: "No text message to process" });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    // Ignore commands like /start
    if (text.startsWith("/")) {
      if (text === "/start") {
        await sendMessage(
          token,
          chatId,
          "👋 *Welcome to Gist Agent Bot!*\n\nSend me any keyword or topic (e.g., 'EV charging stations'), and I will automatically trigger the content creation pipeline to research, write a LinkedIn post, and generate a Nano Banana Pro infographic."
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 1. Create a run database entry
    const run = await createRun(text, "telegram", String(chatId));

    // 2. Trigger orchestrator task
    const handle = await tasks.trigger("gist-agent-orchestrator", {
      keyword: text,
      runId: run.id,
      source: "telegram",
      telegramChatId: String(chatId),
    });

    // 3. Acknowledge message
    const ackMessage = `🚀 *Gist Agent pipeline started!*
    
*Topic:* ${text}
*Run ID:* \`${run.id}\`
*Trigger ID:* \`${handle.id}\`

I am researching the topic now. I will send you the finished LinkedIn post draft and infographic as soon as they are ready.`;

    await sendMessage(token, chatId, ackMessage);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
