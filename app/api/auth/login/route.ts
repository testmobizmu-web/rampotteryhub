// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, verifyPassword, isBcryptHash } from "@/lib/passwords";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!service) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const username = String(body?.username || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = supaAdmin();

    const { data: user, error } = await supabaseAdmin
      .from("rp_users")
      .select("id, username, password_hash, role, permissions, is_active")
      .eq("username", username)
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase login error:", error);
      return NextResponse.json(
        { ok: false, error: "Database error during login." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (user.is_active === false) {
      return NextResponse.json(
        { ok: false, error: "This user has been deactivated." },
        { status: 403 }
      );
    }

    const stored = String(user.password_hash || "");
    let ok = false;

    if (isBcryptHash(stored)) {
      ok = await verifyPassword(password, stored);
    } else {
      // Legacy plaintext stored in password_hash (your current state)
      ok = stored === password;

      // ✅ Auto-upgrade to bcrypt after successful login
      if (ok) {
        const newHash = await hashPassword(password);
        const { error: upErr } = await supabaseAdmin
          .from("rp_users")
          .update({ password_hash: newHash })
          .eq("id", user.id);
        if (upErr) console.error("Password hash upgrade failed:", upErr);
      }
    }

    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const session = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions ?? {},
    };

    const res = NextResponse.json({ ok: true, session });

    res.cookies.set("rp_session", JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (err: any) {
    console.error("Unexpected login error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
