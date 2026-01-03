// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromHeader } from "@/lib/payments";
import { isAdmin, normalizeRole, ROLE_PRESETS } from "@/lib/permissions";
import { hashPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

function safeBool(v: any, fallback: boolean) {
  if (v === true) return true;
  if (v === false) return false;
  return fallback;
}

export async function GET(req: NextRequest) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("rp_users")
      .select("id, username, full_name, phone, role, permissions, is_active, created_at, updated_at")
      .order("id", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, users: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));

    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = normalizeRole(body.role);
    const is_active = safeBool(body.is_active, true);

    const full_name =
      body.full_name !== undefined ? String(body.full_name || "").trim() : null;
    const phone = body.phone !== undefined ? String(body.phone || "").trim() : null;

    const applyPreset = body.applyPreset !== false;
    const permissions = applyPreset ? ROLE_PRESETS[role] : body.permissions || {};

    if (!username)
      return NextResponse.json({ ok: false, error: "Username required" }, { status: 400 });
    if (!password)
      return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });

    // Unique username check
    const { data: existing, error: exErr } = await supabaseAdmin
      .from("rp_users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (exErr) throw exErr;
    if (existing?.id)
      return NextResponse.json({ ok: false, error: "Username already exists" }, { status: 409 });

    const now = new Date().toISOString();
    const password_hash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("rp_users")
      .insert({
        username,
        password_hash,
        role,
        permissions,
        is_active,
        full_name,
        phone,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
    }

    const myId = Number(me?.id);
    const editingSelf = Number.isFinite(myId) && myId === id;

    const patch: any = {};
    patch.updated_at = new Date().toISOString();

    if (body.username !== undefined) {
      const username = String(body.username || "").trim().toLowerCase();
      if (!username)
        return NextResponse.json({ ok: false, error: "Username required" }, { status: 400 });

      // Unique check (ignore same id)
      const { data: ex, error: exErr } = await supabaseAdmin
        .from("rp_users")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (exErr) throw exErr;
      if (ex?.id && Number(ex.id) !== id) {
        return NextResponse.json({ ok: false, error: "Username already exists" }, { status: 409 });
      }

      patch.username = username;
    }

    // password reset (only if provided)
    if (body.password !== undefined) {
      const pw = String(body.password || "");
      if (!pw)
        return NextResponse.json(
          { ok: false, error: "Password cannot be empty" },
          { status: 400 }
        );
      patch.password_hash = await hashPassword(pw);
    }

    if (body.full_name !== undefined) patch.full_name = String(body.full_name || "").trim() || null;
    if (body.phone !== undefined) patch.phone = String(body.phone || "").trim() || null;
    if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);

    if (body.role !== undefined && !editingSelf) {
      const role = normalizeRole(body.role);
      patch.role = role;
      if (body.applyPreset === true) patch.permissions = ROLE_PRESETS[role];
    }

    if (body.permissions !== undefined && !editingSelf) {
      patch.permissions = body.permissions || {};
    }

    const { error } = await supabaseAdmin.from("rp_users").update(patch).eq("id", id);
    if (error) throw error;

    const { data: list, error: listErr } = await supabaseAdmin
      .from("rp_users")
      .select("id, username, full_name, phone, role, permissions, is_active, created_at, updated_at")
      .order("id", { ascending: false });

    if (listErr) throw listErr;

    return NextResponse.json({ ok: true, users: list || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
    }

    const myId = Number(me?.id);
    if (Number.isFinite(myId) && myId === id && body.is_active === false) {
      return NextResponse.json(
        { ok: false, error: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }

    const patch: any = {};
    if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);
    patch.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin.from("rp_users").update(patch).eq("id", id);
    if (error) throw error;

    const { data: list, error: listErr } = await supabaseAdmin
      .from("rp_users")
      .select("id, username, full_name, phone, role, permissions, is_active, created_at, updated_at")
      .order("id", { ascending: false });

    if (listErr) throw listErr;

    return NextResponse.json({ ok: true, users: list || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
