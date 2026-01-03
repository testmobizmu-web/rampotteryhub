// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromHeader } from "@/lib/payments";
import { isAdmin, normalizeRole, ROLE_PRESETS } from "@/lib/permissions";
import { hashPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { id } = await ctx.params;
    const uid = Number(id);
    if (!Number.isFinite(uid) || uid <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("rp_users")
      .select("id, username, full_name, phone, role, permissions, is_active, created_at, updated_at")
      .eq("id", uid)
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(me))
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { id } = await ctx.params;
    const uid = Number(id);
    if (!Number.isFinite(uid) || uid <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    const myId = Number(me?.id);
    const editingSelf = Number.isFinite(myId) && myId === uid;

    const patch: any = {};

    if (body.full_name !== undefined) patch.full_name = String(body.full_name || "").trim() || null;
    if (body.phone !== undefined) patch.phone = String(body.phone || "").trim() || null;

    if (body.is_active !== undefined) {
      if (editingSelf && body.is_active === false) {
        return NextResponse.json(
          { ok: false, error: "You cannot deactivate your own account." },
          { status: 400 }
        );
      }
      patch.is_active = Boolean(body.is_active);
    }

    // ✅ password reset (bcrypt)
    if (body.password !== undefined) {
      const pw = String(body.password || "");
      if (!pw) {
        return NextResponse.json({ ok: false, error: "Password cannot be empty" }, { status: 400 });
      }
      patch.password_hash = await hashPassword(pw);
    }

    if (body.role !== undefined) {
      if (editingSelf) {
        return NextResponse.json(
          { ok: false, error: "You cannot change your own role/permissions." },
          { status: 400 }
        );
      }

      const role = normalizeRole(body.role);
      patch.role = role;

      const applyPreset = body.applyPreset === true;
      if (applyPreset) patch.permissions = ROLE_PRESETS[role];
    }

    if (body.permissions !== undefined) {
      if (editingSelf) {
        return NextResponse.json(
          { ok: false, error: "You cannot change your own role/permissions." },
          { status: 400 }
        );
      }
      patch.permissions = body.permissions || {};
    }

    patch.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin.from("rp_users").update(patch).eq("id", uid);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
