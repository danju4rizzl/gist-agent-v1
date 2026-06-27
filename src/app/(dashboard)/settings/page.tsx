"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Save,
  Key,
  Database,
  Bot,
  Link,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { SETTING_KEYS } from "@/lib/constants";

interface SettingItem {
  key: string;
  value: string;
  hasValue: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    [SETTING_KEYS.GEMINI_API_KEY]: "",
    [SETTING_KEYS.TAVILY_API_KEY]: "",
    [SETTING_KEYS.KIE_AI_API_KEY]: "",
    [SETTING_KEYS.NOTION_API_KEY]: "",
    [SETTING_KEYS.NOTION_DATABASE_ID]: "",
    [SETTING_KEYS.TELEGRAM_BOT_TOKEN]: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Telegram webhook specific state
  const [tgStatus, setTgStatus] = useState<{
    connected: boolean;
    url?: string;
    message?: string;
  }>({ connected: false });
  const [isRegistering, setIsRegistering] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data: SettingItem[] = await res.json();
        setSettings(data);
        
        // Update form values with empty string or masked placeholder
        const newValues = { ...formValues };
        data.forEach((item) => {
          newValues[item.key] = item.value;
        });
        setFormValues(newValues);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Telegram webhook info
  const checkTelegramStatus = async () => {
    try {
      const res = await fetch("/api/telegram/register");
      if (res.ok) {
        const data = await res.json();
        setTgStatus(data);
      }
    } catch (err) {
      console.error("Error checking telegram status:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    checkTelegramStatus();
  }, []);

  // Update form inputs
  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle visibility
  const toggleVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Submit settings updates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    const payload = Object.entries(formValues).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (!res.ok) {
        throw new Error("Failed to save credentials");
      }

      setSaveStatus({ type: "success", msg: "API credentials saved successfully!" });
      await fetchSettings();
      await checkTelegramStatus();
    } catch (err: any) {
      setSaveStatus({ type: "error", msg: err.message || "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  // Register telegram webhook
  const handleRegisterWebhook = async () => {
    setIsRegistering(true);
    setWebhookStatus(null);
    try {
      const currentUrl = window.location.origin;
      const res = await fetch("/api/telegram/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to register webhook");
      }

      const result = await res.json();
      setWebhookStatus(`Webhook registered successfully: ${result.registeredUrl}`);
      await checkTelegramStatus();
    } catch (err: any) {
      setWebhookStatus(`Error: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const isTgTokenConfigured = settings.find(
    (s) => s.key === SETTING_KEYS.TELEGRAM_BOT_TOKEN
  )?.hasValue;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-3xl font-bold tracking-tight text-gradient">
          Connection & Keys Manager
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Store your API keys locally in PostgreSQL. They are kept securely inside your local database.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="text-sm">Loading connections...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: AI Models */}
          <div className="glass-panel border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3 mb-5">
              <Key className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-200">AI Core Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gemini API key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[SETTING_KEYS.GEMINI_API_KEY] ? "text" : "password"}
                    value={formValues[SETTING_KEYS.GEMINI_API_KEY] || ""}
                    onChange={(e) => handleInputChange(SETTING_KEYS.GEMINI_API_KEY, e.target.value)}
                    placeholder={settings.find((s) => s.key === SETTING_KEYS.GEMINI_API_KEY)?.hasValue ? "••••••••••••" : "AIzaSy..."}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-emerald-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(SETTING_KEYS.GEMINI_API_KEY)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKeys[SETTING_KEYS.GEMINI_API_KEY] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tavily API key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Tavily Search API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[SETTING_KEYS.TAVILY_API_KEY] ? "text" : "password"}
                    value={formValues[SETTING_KEYS.TAVILY_API_KEY] || ""}
                    onChange={(e) => handleInputChange(SETTING_KEYS.TAVILY_API_KEY, e.target.value)}
                    placeholder={settings.find((s) => s.key === SETTING_KEYS.TAVILY_API_KEY)?.hasValue ? "••••••••••••" : "tvly-..."}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-emerald-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(SETTING_KEYS.TAVILY_API_KEY)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKeys[SETTING_KEYS.TAVILY_API_KEY] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Image Generation */}
          <div className="glass-panel border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3 mb-5">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-200">Creative Graphic Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kie.ai API key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Key.ai API Key (Nano Banana Pro)
                </label>
                <div className="relative">
                  <input
                    type={showKeys[SETTING_KEYS.KIE_AI_API_KEY] ? "text" : "password"}
                    value={formValues[SETTING_KEYS.KIE_AI_API_KEY] || ""}
                    onChange={(e) => handleInputChange(SETTING_KEYS.KIE_AI_API_KEY, e.target.value)}
                    placeholder={settings.find((s) => s.key === SETTING_KEYS.KIE_AI_API_KEY)?.hasValue ? "••••••••••••" : "Enter Key.ai API key..."}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-emerald-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(SETTING_KEYS.KIE_AI_API_KEY)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKeys[SETTING_KEYS.KIE_AI_API_KEY] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Notion */}
          <div className="glass-panel border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3 mb-5">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-200">Content Archiving (Notion)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Notion token */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Notion Integration Token
                </label>
                <div className="relative">
                  <input
                    type={showKeys[SETTING_KEYS.NOTION_API_KEY] ? "text" : "password"}
                    value={formValues[SETTING_KEYS.NOTION_API_KEY] || ""}
                    onChange={(e) => handleInputChange(SETTING_KEYS.NOTION_API_KEY, e.target.value)}
                    placeholder={settings.find((s) => s.key === SETTING_KEYS.NOTION_API_KEY)?.hasValue ? "••••••••••••" : "secret_..."}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-emerald-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(SETTING_KEYS.NOTION_API_KEY)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKeys[SETTING_KEYS.NOTION_API_KEY] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Database ID */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Notion Database ID
                </label>
                <input
                  type="text"
                  value={formValues[SETTING_KEYS.NOTION_DATABASE_ID] || ""}
                  onChange={(e) => handleInputChange(SETTING_KEYS.NOTION_DATABASE_ID, e.target.value)}
                  placeholder="32-character ID..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-emerald-500/60 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card: Telegram */}
          <div className="glass-panel border border-zinc-800/80 rounded-xl p-6 bg-zinc-900/10">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3 mb-5">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-200">Telegram Bot Trigger</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bot Token */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Telegram Bot Token
                </label>
                <div className="relative">
                  <input
                    type={showKeys[SETTING_KEYS.TELEGRAM_BOT_TOKEN] ? "text" : "password"}
                    value={formValues[SETTING_KEYS.TELEGRAM_BOT_TOKEN] || ""}
                    onChange={(e) => handleInputChange(SETTING_KEYS.TELEGRAM_BOT_TOKEN, e.target.value)}
                    placeholder={settings.find((s) => s.key === SETTING_KEYS.TELEGRAM_BOT_TOKEN)?.hasValue ? "••••••••••••" : "123456:ABC..."}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-emerald-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(SETTING_KEYS.TELEGRAM_BOT_TOKEN)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKeys[SETTING_KEYS.TELEGRAM_BOT_TOKEN] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bot status webhooks */}
              <div className="flex flex-col justify-end space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                  Status:
                  {tgStatus.connected ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
                      Connected (Webhooks active)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-500 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 block" />
                      Not Connected
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRegisterWebhook}
                  disabled={isRegistering || !isTgTokenConfigured}
                  className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-200 font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering Webhook...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Register Webhook Endpoint
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Webhook log message */}
            {webhookStatus && (
              <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs font-mono text-zinc-400 flex items-start gap-2">
                {webhookStatus.startsWith("Error") ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{webhookStatus}</span>
              </div>
            )}

            {tgStatus.url && (
              <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                Current Registered URL: {tgStatus.url}
              </div>
            )}
          </div>

          {/* Action block */}
          <div className="flex items-center justify-between border-t border-zinc-900 pt-5">
            {saveStatus && (
              <div
                className={`text-sm font-medium flex items-center gap-1.5 ${
                  saveStatus.type === "success" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {saveStatus.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {saveStatus.msg}
              </div>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-semibold text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-zinc-950" />
                  Save Credentials
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
