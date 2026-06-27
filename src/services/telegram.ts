import { TELEGRAM_API_BASE } from "@/lib/constants";

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
}

export async function registerWebhook(
  token: string,
  webhookUrl: string
): Promise<boolean> {
  const url = `${TELEGRAM_API_BASE}/bot${token}/setWebhook`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to set Telegram webhook. HTTP status: ${response.status}. Error: ${errorText}`
    );
    return false;
  }

  const result = await response.json();
  return result.ok === true;
}

export async function getWebhookInfo(
  token: string
): Promise<TelegramWebhookInfo | null> {
  const url = `${TELEGRAM_API_BASE}/bot${token}/getWebhookInfo`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (result.ok && result.result) {
    return result.result as TelegramWebhookInfo;
  }
  return null;
}

export async function sendMessage(
  token: string,
  chatId: number,
  text: string
): Promise<boolean> {
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Failed to send Telegram message: ${errText}`);
    return false;
  }

  const result = await response.json();
  return result.ok === true;
}
