import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qowinnmfdkaampgpovqb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding live Supabase database...");

  // 1. Insert Novel
  const { data: novel, error: novelError } = await supabase
    .from("novels")
    .upsert({
      title: "Shadow Lord's Awakening",
      slug: "shadow-lords-awakening",
      synopsis: "A fallen sovereign of the Astral Realm reincarnates in modern Kathmandu. With his ancient memories intact but his celestial meridians sealed, Aryan must climb through the hidden underworld of mystic guilds and awaken his legendary shadow domain.",
      cover_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      author_name: "AI Storyteller",
      status: "ongoing",
      is_published: true,
      total_views: 1420,
      total_likes: 389,
    }, { onConflict: "slug" })
    .select()
    .single();

  if (novelError) {
    console.error("Error creating novel:", novelError);
    return;
  }
  console.log("Novel created:", novel.id);

  // 2. Insert Chapters
  const chapters = [
    {
      novel_id: novel.id,
      chapter_number: 1,
      title: "The Broken Mirror",
      content: "The cold monsoon rain poured relentless over the spires of the city. Aryan pulled his drenched coat tighter around his shoulders, his breath misting in the freezing dusk air. He looked down at the broken fragment of obsidian mirror clenched in his bloodied palm. It hummed—faintly at first, then resonating with the cadence of an ancient heartbeat he had not felt in five hundred years.",
      word_count: 1850,
      is_premium: false,
      coin_price: 0,
      status: "published",
      published_at: new Date().toISOString(),
    },
    {
      novel_id: novel.id,
      chapter_number: 2,
      title: "The First Breath",
      content: "Sitting cross-legged on the concrete floor of his rundown apartment in Thamel, Aryan began the ancient breathing cycle of the Umbral Sutra. With each breath, ambient cosmic ether filtered into his chest. It burned like liquid mercury. His modern mortal veins were clogged with mundane impurities, but sheer iron will forced the pathways open.",
      word_count: 2100,
      is_premium: false,
      coin_price: 0,
      status: "published",
      published_at: new Date().toISOString(),
    },
    {
      novel_id: novel.id,
      chapter_number: 3,
      title: "City of Shadows",
      content: "The alleys of Asan at night were a labyrinth of shadows and secrets. Aryan walked briskly, his newly heightened senses picking up the subtle magical signatures of city dwellers hiding among the ordinary crowd. In the shadows behind an ancient stone shrine, two figures in silver-embroidered coats were watching him.",
      word_count: 1980,
      is_premium: false,
      coin_price: 0,
      status: "published",
      published_at: new Date().toISOString(),
    },
    {
      novel_id: novel.id,
      chapter_number: 4,
      title: "The Golden Seal",
      content: "Inside the subterranean auction house beneath the old city, air was thick with the scent of incense and danger. On the velvet pedestal sat an iron chest engraved with a glowing golden seal. Aryan's celestial core flared violently. It was the Ring of Ouroboros—an artifact from his past empire!",
      word_count: 2450,
      is_premium: true,
      coin_price: 20,
      status: "published",
      published_at: new Date().toISOString(),
    },
  ];

  for (const ch of chapters) {
    const { error: chErr } = await supabase
      .from("chapters")
      .upsert(ch, { onConflict: "novel_id,chapter_number" });
    if (chErr) console.error("Error creating chapter", ch.chapter_number, chErr);
    else console.log(`Chapter ${ch.chapter_number} seeded successfully!`);
  }

  console.log("Seeding complete!");
}

seed();
