import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qowinnmfdkaampgpovqb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch chapters for a novel
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    let query = supabase.from("chapters").select("*").order("chapter_number", { ascending: true });
    if (novelId) {
      query = query.eq("novel_id", novelId);
    }

    const { data: chapters, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, chapters: chapters || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Insert or update chapter(s) in Supabase (Supports single or batch array)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Batch mode: When chapters array is provided (e.g. 20-chapter outline)
    if (Array.isArray(body.chapters)) {
      const formattedChapters = body.chapters.map((ch: any) => ({
        novel_id: ch.novelId,
        chapter_number: ch.chapterNumber,
        title: ch.title,
        content: ch.content || "",
        word_count: ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).length : 1200),
        is_premium: Boolean(ch.isPremium),
        coin_price: ch.coinPrice ?? (ch.isPremium ? 20 : 0),
        status: (ch.status || "draft").toLowerCase(),
        published_at: (ch.status || "").toLowerCase() === "published" ? new Date().toISOString() : null,
      }));

      const { data: inserted, error: batchErr } = await supabase
        .from("chapters")
        .upsert(formattedChapters, { onConflict: "novel_id,chapter_number" })
        .select();

      if (batchErr) throw batchErr;
      return NextResponse.json({ success: true, chapters: inserted, count: inserted?.length });
    }

    // 2. Single chapter mode
    const { novelId, chapterNumber, title, content, wordCount, isPremium, coinPrice, status } = body;

    const { data: chapter, error } = await supabase
      .from("chapters")
      .upsert({
        novel_id: novelId,
        chapter_number: chapterNumber,
        title,
        content: content || "",
        word_count: wordCount || (content ? content.trim().split(/\s+/).length : 1200),
        is_premium: Boolean(isPremium),
        coin_price: coinPrice ?? (isPremium ? 20 : 0),
        status: (status || "draft").toLowerCase(),
        published_at: (status || "").toLowerCase() === "published" ? new Date().toISOString() : null,
      }, { onConflict: "novel_id,chapter_number" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, chapter });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete chapter from Supabase
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");
    const chapterNumber = searchParams.get("chapterNumber");

    if (!novelId || !chapterNumber) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("novel_id", novelId)
      .eq("chapter_number", parseInt(chapterNumber));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
