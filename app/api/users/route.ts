// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getSession(req: NextRequest) {
  const raw = req.cookies.get("rp_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      userId: number;
      username: string;
      role: string;
      permissions?: Record<string, boolean>;
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = getSession(req);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("rp_users")
    .select("id, username, role, permissions, is_active")
    .order("username");

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, users: data || [] });
}

