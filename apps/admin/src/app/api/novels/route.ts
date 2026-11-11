import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qowinnmfdkaampgpovqb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch all novels with relational genres from Supabase
export async function GET() {
  try {
    const { data: novels, error } = await supabase
      .from("novels")
      .select("*, novel_genres(genres(id, name, slug))")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Flatten genre so client gets clean novel.genre directly
    const formattedNovels = (novels || []).map((n: any) => {
      const gName = n.novel_genres?.[0]?.genres?.name || "Fantasy";
      return {
        ...n,
        genre: gName,
      };
    });

    return NextResponse.json({ success: true, novels: formattedNovels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or upsert novel and link genre into Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre = "Fantasy", synopsis, coverImageUrl, authorName = "AI Storyteller", status = "ongoing", isPublished = true } = body;

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

    // Link Genre in novel_genres bridge table
    if (genre && novel?.id) {
      // Find matching genre in genres table
      const { data: matchedGenre } = await supabase
        .from("genres")
        .select("id")
        .ilike("name", `%${genre.trim()}%`)
        .limit(1)
        .maybeSingle();

      const genreId = matchedGenre?.id || 1; // Default to Fantasy (id: 1) if not found
      await supabase
        .from("novel_genres")
        .upsert({
          novel_id: novel.id,
          genre_id: genreId,
        }, { onConflict: "novel_id,genre_id" });
    }

    return NextResponse.json({ success: true, novel: { ...novel, genre } });
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

    // 2. Delete genre linkages
    await supabase.from("novel_genres").delete().eq("novel_id", id);

    // 3. Delete the novel
    const { error } = await supabase.from("novels").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: `Novel ${id} deleted successfully.` });
  } catch (error: any) {
    console.error("Error deleting novel:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
