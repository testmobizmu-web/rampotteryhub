// scripts/migrate_passwords_to_bcrypt.mjs
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // ✅ load Next env file

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";


const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(url, service, {
  auth: { persistSession: false },
});

function isBcryptHash(v) {
  return /^\$2[aby]\$\d{2}\$/.test(String(v || ""));
}

const ROUNDS = 10;

async function main() {
  const { data: users, error } = await supabase
    .from("rp_users")
    .select("id, username, password_hash");

  if (error) throw error;

  let changed = 0;

  for (const u of users || []) {
    const current = String(u.password_hash || "");

    if (!current) continue;
    if (isBcryptHash(current)) continue;

    const salt = await bcrypt.genSalt(ROUNDS);
    const hashed = await bcrypt.hash(current, salt);

    const { error: upErr } = await supabase
      .from("rp_users")
      .update({ password_hash: hashed })
      .eq("id", u.id);

    if (upErr) throw upErr;

    console.log(`✅ upgraded: ${u.username}`);
    changed++;
  }

  console.log(`\nDONE. Upgraded ${changed} users.`);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
