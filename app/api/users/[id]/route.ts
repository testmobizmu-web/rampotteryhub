// app/api/users/[id]/route.ts
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const check = ensureAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { ok: false, error: check.error },
      { status: check.status }
    );
  }

  const id = Number(params.id);
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Invalid user id." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const update: any = {};

  if (typeof body.role === "string") update.role = body.role;
  if (typeof body.is_active === "boolean") update.is_active = body.is_active;
  if (body.permissions && typeof body.permissions === "object") {
    update.permissions = body.permissions;
  }
  if (body.password && typeof body.password === "string" && body.password.trim()) {
    update.password = body.password;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json(
      { ok: false, error: "Nothing to update." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("rp_users")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Failed to update user." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
