import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qowinnmfdkaampgpovqb.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  try {
    // 1. Fetch Auth Users from Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Fetch Profiles for Coins Balance and Role
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("*");

    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(p => profileMap.set(p.id, p));
    }

    // 3. Merge User details
    const users = (authData?.users || []).map(u => {
      const prof = profileMap.get(u.id);
      const email = u.email || "No Email";
      const metadataName = u.user_metadata?.full_name || u.user_metadata?.name;
      const username = prof?.username || metadataName || email.split("@")[0];
      const provider = u.app_metadata?.provider || (u.identities?.[0]?.provider) || "email";

      return {
        id: u.id,
        email,
        username,
        role: prof?.role || "reader",
        coinsBalance: prof?.coins_balance ?? 20,
        provider,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || u.created_at,
      };
    });

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
