import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function normalizeMuPhoneToE164(v: any) {
  const digits = String(v ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // allow "230XXXXXXXX" (11 digits) or "XXXXXXXX" (8 digits)
  if (digits.length === 8) return `+230${digits}`;
  if (digits.startsWith("230") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("+230") && digits.length === 12) return digits;
  return ""; // reject anything else (230 only)
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const to = normalizeMuPhoneToE164(body.to);
    const text = String(body.text ?? "").trim();

    if (!to) return NextResponse.json({ ok: false, error: "Invalid WhatsApp number (Mauritius +230 only)." }, { status: 400 });
    if (!text) return NextResponse.json({ ok: false, error: "Message text is required." }, { status: 400 });

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_API_VERSION || "v20.0";

    if (!token || !phoneNumberId) {
      return NextResponse.json({ ok: false, error: "Missing WhatsApp env vars." }, { status: 500 });
    }

    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace("+", ""), // Meta expects digits only
        type: "text",
        text: { body: text },
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: data?.error?.message || "WhatsApp send failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
