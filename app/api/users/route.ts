// app/api/users/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

function getSession() {
  const raw = cookies().get("rp_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { userId: number; username: string; role: string };
  } catch {
    return null;
  }
}

function ensureAdmin() {
  const session = getSession();
  if (!session) {
    return { ok: false, status: 401, error: "Not authenticated." };
  }
  if (session.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required." };
  }
  return { ok: true, session };
}

export async function GET() {
  const check = ensureAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { ok: false, error: check.error },
      { status: check.status }
    );
  }

  const { data, error } = await supabase
    .from("rp_users")
    .select("id, username, role, permissions, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Failed to load users." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, users: data });
}

export async function POST(req: Request) {
  const check = ensureAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { ok: false, error: check.error },
      { status: check.status }
    );
  }

  const body = await req.json();
  const {
    username,
    password,
    role = "staff",
    permissions = {},
  } = body as {
    username?: string;
    password?: string;
    role?: string;
    permissions?: Record<string, boolean>;
  };

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Username and password are required." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("rp_users").insert({
    username,
    password,
    role,
    permissions,
    is_active: true,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error.code === "23505"
            ? "Username already exists."
            : "Failed to create user.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
