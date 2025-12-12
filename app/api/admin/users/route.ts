// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const SELECT_FIELDS =
  "id, username, role, permissions, is_active";

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("rp_users")
      .select(SELECT_FIELDS)
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase /admin/users GET error:", error);
      return NextResponse.json(
        { ok: false, users: [], error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, users: data ?? [] });
  } catch (err) {
    console.error("Unexpected /admin/users GET error:", err);
    return NextResponse.json(
      { ok: false, users: [], error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      role = "staff",
      permissions = {},
      is_active = true,
    } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rp_users")
      .insert({
        username,
        password,
        role,
        permissions,
        is_active,
      })
      .select(SELECT_FIELDS)
      .single();

    if (error) {
      console.error("Supabase /admin/users POST error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("Unexpected /admin/users POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body || {};

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "User id is required." },
        { status: 400 }
      );
    }

    // Never update with an empty object
    if (Object.keys(fields).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rp_users")
      .update(fields)
      .eq("id", id)
      .select(SELECT_FIELDS)
      .single();

    if (error) {
      console.error("Supabase /admin/users PATCH error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("Unexpected /admin/users PATCH error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
