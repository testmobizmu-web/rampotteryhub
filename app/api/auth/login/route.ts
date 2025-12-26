import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = null;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Fetch user
    const { data: user, error } = await supabase
      .from("rp_users")
      .select("id, username, password, role, permissions, is_active")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase login error:", error);
      return NextResponse.json(
        { ok: false, error: "Database error during login." },
        { status: 500 }
      );
    }

    if (!user || user.password !== password) {
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

    // STANDARDIZED session object
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
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (err) {
    console.error("Unexpected error in /api/auth/login:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
