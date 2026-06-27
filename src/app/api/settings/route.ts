import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, upsertSetting } from "@/db/queries";

export async function GET() {
  const allSettings = await getAllSettings();
  
  // Mask sensitive values so they don't leak to client UI completely
  const maskedSettings = allSettings.map((setting) => {
    const isSensitive =
      setting.key.includes("key") ||
      setting.key.includes("token") ||
      setting.key.includes("secret");
    
    return {
      key: setting.key,
      value:
        isSensitive && setting.value.length > 8
          ? `${setting.value.substring(0, 4)}...${setting.value.substring(setting.value.length - 4)}`
          : setting.value,
      hasValue: setting.value.length > 0,
    };
  });

  return NextResponse.json(maskedSettings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings: newSettings } = body;

    if (!Array.isArray(newSettings)) {
      return NextResponse.json(
        { error: "Invalid settings format" },
        { status: 400 }
      );
    }

    for (const setting of newSettings) {
      if (typeof setting.key === "string" && typeof setting.value === "string") {
        const trimmedValue = setting.value.trim();
        // If the value is masked (e.g. contains '...'), don't overwrite with masked string
        if (trimmedValue.includes("...")) {
          continue;
        }
        await upsertSetting(setting.key, trimmedValue);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
