// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.username || !body.password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const { username, password } = body as {
      username: string;
      password: string;
    };

    // Look up user in rp_users
    const { data, error } = await supabase
      .from("rp_users")
      .select("id, username, password, role, permissions, is_active")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Login DB error:", error);
      return NextResponse.json(
        { ok: false, error: "Database error during login." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (!data.is_active) {
      return NextResponse.json(
        { ok: false, error: "User is disabled." },
        { status: 403 }
      );
    }

    // Simple password check (plain text for now)
    if (data.password !== password) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const session = {
      userId: data.id,
      username: data.username,
      role: data.role,
      permissions: data.permissions || {},
    };

    // ✅ Next.js 16: set cookie on the RESPONSE (not cookies().set)
    const res = NextResponse.json({ ok: true, session });
    res.cookies.set("rp_session", JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Login unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // ✅ Next.js 16: read cookie from req.cookies
  try {
    const raw = req.cookies.get("rp_session")?.value;
    if (!raw) return NextResponse.json({ ok: false }, { status: 401 });

    const session = JSON.parse(raw);
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

