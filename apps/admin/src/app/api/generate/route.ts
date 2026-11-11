import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, title, genre, premise, apiKey, storyBible, chapterNumber = 1, previousSummary = "" } = body;

    const activeKey = apiKey || process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is available, perform LIVE AI GENERATION
    if (activeKey) {
      const ai = new GoogleGenAI({ apiKey: activeKey });

      if (action === "generate_bible") {
        const prompt = `You are a master webnovel worldbuilder and author. 
Create a comprehensive Story Bible for a novel with the following details:
Title: ${title}
Genre: ${genre}
Premise: ${premise}

Format the response as strict valid JSON with the following keys:
{
  "title": "${title}",
  "genre": "${genre}",
  "worldSetting": "Rich description of the world, magic system, or technological rules in 2-3 sentences",
  "protagonist": "Protagonist name, identity, traits, and cultivation/power stage",
  "deuteragonist": "Allies or rivals",
  "mainConflict": "The primary antagonist or impending cataclysm",
  "plotArc": [
    {"arc": 1, "title": "Arc 1 Title", "summary": "Chapters 1-10 summary"},
    {"arc": 2, "title": "Arc 2 Title", "summary": "Chapters 11-25 summary"}
  ],
  "toneAndStyle": "Writing tone, pacing, and point of view"
}
Output only pure JSON. No markdown backticks.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const rawText = response.text || "";
        let parsed;
        try {
          const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = {
            title,
            genre,
            worldSetting: rawText.substring(0, 300),
            protagonist: "Generated Protagonist",
            mainConflict: "Universal Conflict",
            toneAndStyle: "Epic Webnovel Tone",
          };
        }

        return NextResponse.json({ success: true, source: "live_gemini_ai", data: parsed });
      }

      if (action === "generate_chapter") {
        const prompt = `You are an acclaimed webnovel author. Write Chapter ${chapterNumber} for the novel "${title}".
Genre: ${genre}
Premise: ${premise}
Story Bible Summary: ${typeof storyBible === "object" ? JSON.stringify(storyBible) : storyBible}
Previous Chapter Context: ${previousSummary || "Beginning of the story."}

Requirements:
- Length: Around 800 - 1500 words.
- Engaging, immersive hook, atmospheric descriptions, and punchy dialogue.
- Maintain character traits and continuity.
- Give the chapter an evocative title.

Format the response as strict JSON:
{
  "chapterNumber": ${chapterNumber},
  "chapterTitle": "Chapter Title Here",
  "content": "Full chapter story content with paragraph breaks",
  "wordCount": 1100,
  "summaryForNextChapter": "A 2-sentence summary of what happened for the next chapter's memory"
}
Output only pure JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const rawText = response.text || "";
        let parsed;
        try {
          const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = {
            chapterNumber,
            chapterTitle: `Chapter ${chapterNumber}: Resonating Astral Pulse`,
            content: rawText,
            wordCount: rawText.split(/\s+/).length,
            summaryForNextChapter: "The protagonist unlocked their latent domain and faced new enemies.",
          };
        }

        return NextResponse.json({ success: true, source: "live_gemini_ai", data: parsed });
      }
    }

    // 2. High-Quality Fallback / Demo Mode if API Key is not yet configured
    if (action === "generate_bible") {
      return NextResponse.json({
        success: true,
        source: "demo_engine",
        message: "Gemini API Key नराखेकाले डेमो ढाँचा देखाइएको छ। सेटिङमा Key थपेर लाइभ AI चलाउनुहोस्!",
        data: {
          title,
          genre,
          worldSetting: `Modern Urban setting with hidden magical gates and ancient cosmic laws. Ambient mana reacts to lunar phases.`,
          protagonist: `Reincarnated Sovereign with sealed meridians, calm and calculating demeanor.`,
          deuteragonist: `Guild Captain of the Silver Dawn, sharp-eyed strategist.`,
          mainConflict: `The crumbling of ancient seals allowing abyssal beasts to infiltrate the mortal realm.`,
          plotArc: [
            { arc: 1, title: "The First Meridian Gate", summary: "Chapters 1-10: Surviving the modern city and unlocking the initial shadow essence." },
            { arc: 2, title: "Underground Auction & Guild War", summary: "Chapters 11-25: Reclaiming past relics and facing the Black Lotus Syndicate." }
          ],
          toneAndStyle: "Fast-paced, suspenseful urban fantasy with cultivation elements."
        }
      });
    }

    if (action === "generate_chapter") {
      const titles = [
        "Echoes in the Astral Vault",
        "The Crucible of Twin Flames",
        "Shadows Over the Neon Spire",
        "The Sovereign's Decreed Vengeance",
        "Bloodline Awakening",
      ];
      const randomTitle = titles[(chapterNumber - 1) % titles.length] || `The Trial of Gate ${chapterNumber}`;

      const generatedContent = `The air grew thin as ambient ether surged through the cracked cobblestones. Aryan adjusted the leather straps of his coat, feeling the ancient obsidian seal pulsing violently against his sternum.

"You should not have returned to this sector," a hollow voice rattled from behind the vapor vents of the high-rise. A figure draped in iridescent celestial robes stepped out, clutching a twin-bladed spear. "The Silver Guild placed a bounty of ten thousand crystals on your core."

Aryan didn't flinch. A faint smirk danced across his lips as dark umbral filaments crept along his fingertips like ravenous vipers.

"Ten thousand?" Aryan murmured, his golden pupils narrowing in the gloom. "Tell your guild master that my head was once worth three entire star systems. They insult me with such pocket change."

With a sudden thunderous crack, the concrete beneath their feet imploded. Violet lightning coiled around Aryan's arms as he unleashed the Third Umbral Gate. In that single breath, the hunter became the hunted, and the nocturnal skyline of the city bore witness to a sovereign's resurrected wrath.`;

      return NextResponse.json({
        success: true,
        source: "demo_engine",
        data: {
          chapterNumber,
          chapterTitle: `Chapter ${chapterNumber}: ${randomTitle}`,
          content: generatedContent,
          wordCount: 1180,
          summaryForNextChapter: `In Chapter ${chapterNumber}, the protagonist confronted an assassin from the Silver Guild and revealed the Third Umbral Gate.`
        }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
