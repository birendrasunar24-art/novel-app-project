import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qowinnmfdkaampgpovqb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch all novels from Supabase
export async function GET() {
  try {
    const { data: novels, error } = await supabase
      .from("novels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, novels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or upsert novel into Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre, synopsis, coverImageUrl, authorName = "AI Storyteller", status = "ongoing", isPublished = true } = body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `novel-${Date.now()}`;

    const { data: novel, error } = await supabase
      .from("novels")
      .upsert({
        title,
        slug,
        synopsis,
        cover_image_url: coverImageUrl,
        author_name: authorName,
        status,
        is_published: isPublished,
      }, { onConflict: "slug" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, novel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete novel and its chapters from Supabase
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing novel ID" }, { status: 400 });
    }

    // 1. Delete associated chapters
    await supabase.from("chapters").delete().eq("novel_id", id);

    // 2. Delete the novel
    const { error } = await supabase.from("novels").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: `Novel ${id} deleted successfully.` });
  } catch (error: any) {
    console.error("Error deleting novel:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
