"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, Wand2, Layers, Coins, Eye, 
  CheckCircle, Plus, Settings, Lock, Unlock, Key, RefreshCw,
  Edit3, Trash2, X, Save, Check, Globe, Bot, Download, RotateCcw,
  Cloud, Users, Heart, Star, Smartphone, Compass, Shield, Flame, 
  Zap, Play, ChevronRight, Sliders, Palette, Type, ArrowRight, History
} from "lucide-react";

interface ChapterItem {
  id: number;
  novelId: string;
  title: string;
  content: string;
  words: number;
  isPremium: boolean;
  coins: number;
  status: "Draft" | "Published";
  arcPhase?: string;
  beatSummary?: string;
  plannedCliffhanger?: string;
  cliffhangerHook?: string;
}

interface NovelItem {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  coverImageUrl: string;
  authorName: string;
  status: "Ongoing" | "Completed";
  isPublished: boolean;
  views?: number;
  likes?: number;
}

interface AppUser {
  id: string;
  email: string;
  username: string;
  role: string;
  coinsBalance: number;
  provider: string;
  createdAt: string;
  lastSignInAt: string;
}

interface StoryBible {
  title: string;
  genre: string;
  worldSetting: string;
  magicOrTechSystem: string;
  protagonist: {
    name: string;
    archetype: string;
    personality: string;
    uniqueAbility: string;
    initialPowerStage: string;
  };
  deuteragonist: string;
  mainConflict: string;
  initialInventory: string[];
  toneAndStyle: string;
  twentyChapterArc: {
    chapterNumber: number;
    title: string;
    arcPhase: string;
    beatSummary: string;
    keyConflict: string;
    plannedCliffhanger: string;
  }[];
}

interface StoryContinuityMemory {
  currentPowerStage: string;
  inventoryAndSkills: string[];
  characterStatuses: string[];
  rollingSummary: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"chapters" | "mode_a" | "mode_b" | "reader_preview" | "novels" | "users" | "settings">("chapters");
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // 1. NOVELS & CHAPTERS STATE
  const [novels, setNovels] = useState<NovelItem[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>("");
  const [chapters, setChapters] = useState<ChapterItem[]>([]);

  // 2. USERS STATE
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // 3. SETTINGS & KEYS
  const [apiKey, setApiKey] = useState("");

  // 4. MODE A: STORY BIBLE ARCHITECT STATE
  const [novelTitle, setNovelTitle] = useState("Shadow Lord's Awakening");
  const [selectedGenre, setSelectedGenre] = useState("Fantasy");
  const [premise, setPremise] = useState("A fallen sovereign of the Astral Realm reincarnates in modern Kathmandu with celestial memories intact, uncovering the city's ancient ley-line vaults.");
  const [isGeneratingBible, setIsGeneratingBible] = useState(false);
  const [generatedBible, setGeneratedBible] = useState<StoryBible | null>(null);
  const [apiSource, setApiSource] = useState("");

  // 5. MODE B: SERIAL CHAPTER WRITER STATE
  const [targetChapterSlot, setTargetChapterSlot] = useState<number>(1);
  const [pacingStyle, setPacingStyle] = useState<string>("Balanced Serial");
  const [sensoryFocus, setSensoryFocus] = useState<string>("High Visceral Combat");
  const [cliffhangerStyle, setCliffhangerStyle] = useState<string>("Ancient Seal Cracking");
  const [isWritingModeB, setIsWritingModeB] = useState<boolean>(false);
  const [latestWrittenChapter, setLatestWrittenChapter] = useState<any | null>(null);

  // 6. ROLLING STORY CONTINUITY LEDGER
  const [continuityLedger, setContinuityLedger] = useState<StoryContinuityMemory>({
    currentPowerStage: "Tier 1: Sealed Meridians (Mortal Vessel)",
    inventoryAndSkills: ["Obsidian Sovereign Token", "Astral Breathing Scripture (Nine Cycles)", "Guild Cipher Keycard"],
    characterStatuses: ["Aryan Thorne (Awakening First Meridian)", "Maya Shrestha (Secret Observer)"],
    rollingSummary: "Aryan reincarnated into modern Kathmandu, infiltrated the subterranean Pashupati vault, and breached the first meridian lock."
  });

  // 7. INTEGRATED READER PREVIEW STATE
  const [readerTheme, setReaderTheme] = useState<"obsidian" | "sepia" | "midnight">("obsidian");
  const [readerFontSize, setReaderFontSize] = useState<number>(16);
  const [readerActiveChapterId, setReaderActiveChapterId] = useState<number>(1);
  const [readerSimulatedCoins, setReaderSimulatedCoins] = useState<number>(120);
  const [unlockedPreviewChapters, setUnlockedPreviewChapters] = useState<Set<number>>(new Set([1, 2, 3]));

  // Modals States
  const [editingChapter, setEditingChapter] = useState<ChapterItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddNovelModalOpen, setIsAddNovelModalOpen] = useState(false);

  // New Novel Form State
  const [newNovelTitle, setNewNovelTitle] = useState("");
  const [newNovelGenre, setNewNovelGenre] = useState("Fantasy");
  const [newNovelSynopsis, setNewNovelSynopsis] = useState("");
  const [newNovelCover, setNewNovelCover] = useState("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80");

  // FETCH LIVE DATA DIRECTLY FROM SUPABASE CLOUD ON LOAD
  useEffect(() => {
    async function loadFromCloud() {
      setIsLoadingFromCloud(true);
      try {
        const resNovels = await fetch("/api/novels");
        const jsonNovels = await resNovels.json();
        
        if (jsonNovels.success && jsonNovels.novels && jsonNovels.novels.length > 0) {
          const cloudNovels: NovelItem[] = jsonNovels.novels.map((n: any) => ({
            id: n.id,
            title: n.title,
            genre: "Fantasy",
            synopsis: n.synopsis,
            coverImageUrl: n.cover_image_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
            authorName: n.author_name || "AI Storyteller",
            status: n.status === "completed" ? "Completed" : "Ongoing",
            isPublished: n.is_published,
            views: n.total_views ?? (n.views ?? 0),
            likes: n.total_likes ?? (n.likes ?? 0),
          }));
          setNovels(cloudNovels);
          const firstNovelId = cloudNovels[0].id;
          setSelectedNovelId(firstNovelId);

          // Fetch chapters for this novel
          const resChapters = await fetch(`/api/chapters?novelId=${firstNovelId}`);
          const jsonChapters = await resChapters.json();
          if (jsonChapters.success && jsonChapters.chapters) {
            const cloudChapters: ChapterItem[] = jsonChapters.chapters.map((ch: any) => ({
              id: ch.chapter_number,
              novelId: ch.novel_id,
              title: ch.title,
              content: ch.content,
              words: ch.word_count || 1200,
              isPremium: ch.is_premium,
              coins: ch.coin_price || (ch.is_premium ? 20 : 0),
              status: ch.status === "published" ? "Published" : "Draft",
            }));
            setChapters(cloudChapters);
          }
          setIsCloudSynced(true);
        } else {
          // Fallback if empty
          setNovels([
            {
              id: "abcc9b8f-fcb6-43f0-a401-38d1c3770713",
              title: "Shadow Lord's Awakening",
              genre: "Fantasy",
              synopsis: "A fallen sovereign of the Astral Realm reincarnates in modern Kathmandu with celestial memories intact.",
              coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
              authorName: "AI Storyteller",
              status: "Ongoing",
              isPublished: true,
              views: 1420,
              likes: 389,
            }
          ]);
          setSelectedNovelId("abcc9b8f-fcb6-43f0-a401-38d1c3770713");
        }
      } catch (e) {
        console.error("Cloud fetch error:", e);
      } finally {
        setIsLoadingFromCloud(false);
      }
    }

    // Fetch registered users from Supabase
    fetchUsers();

    loadFromCloud();

    const savedKey = localStorage.getItem("np_gemini_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && json.users) {
        setUsers(json.users);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch chapters when switching active novel
  useEffect(() => {
    if (!selectedNovelId) return;
    async function fetchNovelChapters() {
      try {
        const res = await fetch(`/api/chapters?novelId=${selectedNovelId}`);
        const json = await res.json();
        if (json.success && json.chapters) {
          const cloudChapters: ChapterItem[] = json.chapters.map((ch: any) => ({
            id: ch.chapter_number,
            novelId: ch.novel_id,
            title: ch.title,
            content: ch.content,
            words: ch.word_count || 1200,
            isPremium: ch.is_premium,
            coins: ch.coin_price || (ch.is_premium ? 20 : 0),
            status: ch.status === "published" ? "Published" : "Draft",
          }));
          setChapters(cloudChapters);
        }
      } catch (e) {}
    }
    fetchNovelChapters();
  }, [selectedNovelId]);

  const activeNovel = novels.find(n => n.id === selectedNovelId) || novels[0] || {
    id: "default",
    title: "Shadow Lord's Awakening",
    genre: "Fantasy",
    synopsis: "Story synopsis...",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    authorName: "AI Storyteller",
    status: "Ongoing",
    isPublished: true,
  };

  const currentChapters = chapters.filter(c => c.novelId === selectedNovelId);

  // ==========================================
  // TOGGLE STATUS (SAVES TO SUPABASE)
  // ==========================================
  const handleToggleStatus = async (id: number) => {
    const target = currentChapters.find(c => c.id === id);
    if (!target) return;
    const nextStatus = target.status === "Published" ? "Draft" : "Published";

    setChapters(prev => prev.map(ch => (ch.id === id && ch.novelId === selectedNovelId) ? { ...ch, status: nextStatus } : ch));

    try {
      await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: selectedNovelId,
          chapterNumber: id,
          title: target.title,
          content: target.content,
          wordCount: target.words,
          isPremium: target.isPremium,
          coinPrice: target.coins,
          status: nextStatus.toLowerCase(),
        }),
      });
    } catch (e) {
      console.error("Failed to update status in Supabase", e);
    }
  };

  // ==========================================
  // TOGGLE PREMIUM (SAVES TO SUPABASE)
  // ==========================================
  const handleTogglePremium = async (id: number) => {
    const target = currentChapters.find(c => c.id === id);
    if (!target) return;
    const nextPremium = !target.isPremium;
    const nextCoins = nextPremium ? 20 : 0;

    setChapters(prev => prev.map(ch => (ch.id === id && ch.novelId === selectedNovelId) ? { ...ch, isPremium: nextPremium, coins: nextCoins } : ch));

    try {
      await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: selectedNovelId,
          chapterNumber: id,
          title: target.title,
          content: target.content,
          wordCount: target.words,
          isPremium: nextPremium,
          coinPrice: nextCoins,
          status: target.status.toLowerCase(),
        }),
      });
    } catch (e) {
      console.error("Failed to update premium in Supabase", e);
    }
  };

  // ==========================================
  // DELETE CHAPTER (DELETES FROM SUPABASE)
  // ==========================================
  const handleDeleteChapter = async (id: number) => {
    const ch = currentChapters.find(c => c.id === id);
    if (!ch) return;
    const confirmDelete = window.confirm(`के तपाईं निश्चित हुनुहुन्छ? Chapter ${id} ("${ch.title}") हटाउन चाहनुहुन्छ?`);
    if (confirmDelete) {
      setChapters(prev => prev.filter(c => !(c.id === id && c.novelId === selectedNovelId)));
      try {
        await fetch(`/api/chapters?novelId=${selectedNovelId}&chapterNumber=${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to delete chapter from Supabase", e);
      }
    }
  };

  // ==========================================
  // DELETE NOVEL FROM SUPABASE
  // ==========================================
  const handleDeleteNovel = async (novelId: string, title: string) => {
    const confirmDelete = window.confirm(`के तपाईं निश्चित हुनुहुन्छ? उपन्यास "${title}" र यसका सबै च्याप्टरहरू Supabase Cloud बाट स्थायी रूपमा हटाउन चाहनुहुन्छ?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/novels?id=${novelId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setNovels(prev => {
          const updated = prev.filter(n => n.id !== novelId);
          if (selectedNovelId === novelId && updated.length > 0) {
            setSelectedNovelId(updated[0].id);
          }
          return updated;
        });
        alert(`उपन्यास "${title}" सफलतापूर्वक मेटाइयो!`);
      } else {
        alert(`हटाउन सकिएन: ${json.error}`);
      }
    } catch (e: any) {
      alert(`त्रुटि आयो: ${e.message}`);
    }
  };

  // =========================================================================
  // MODE A: GENERATE 20-CHAPTER STORY BIBLE
  // =========================================================================
  const handleGenerateStoryBible = async () => {
    setIsGeneratingBible(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_bible",
          title: novelTitle,
          genre: selectedGenre,
          premise: premise,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedBible(json.data);
        setApiSource(json.source);
      } else {
        alert("Error: " + json.error);
      }
    } catch (err: any) {
      alert("Request failed: " + err.message);
    } finally {
      setIsGeneratingBible(false);
    }
  };

  // =========================================================================
  // MODE A: INITIALIZE NOVEL & AUTO-POPULATE 20 CHAPTER SLOTS
  // =========================================================================
  const handleInitializeNovelWith20Arc = async () => {
    if (!generatedBible) return;
    try {
      // 1. Create Novel in Supabase
      const resNovel = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedBible.title || novelTitle,
          genre: generatedBible.genre || selectedGenre,
          synopsis: generatedBible.worldSetting || premise,
          coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
          authorName: "Gemini AI Studio",
          status: "ongoing",
          isPublished: true,
        }),
      });

      const jsonNovel = await resNovel.json();
      if (jsonNovel.success && jsonNovel.novel) {
        const cloudNovel: NovelItem = {
          id: jsonNovel.novel.id,
          title: jsonNovel.novel.title,
          genre: generatedBible.genre || selectedGenre,
          synopsis: jsonNovel.novel.synopsis,
          coverImageUrl: jsonNovel.novel.cover_image_url,
          authorName: jsonNovel.novel.author_name,
          status: "Ongoing",
          isPublished: true,
          views: 0,
          likes: 0,
        };

        setNovels(prev => [cloudNovel, ...prev]);
        setSelectedNovelId(cloudNovel.id);

        // 2. Populate 20 Structured Chapters in Supabase
        const arcItems = generatedBible.twentyChapterArc || [];
        const populatedChapters: ChapterItem[] = [];

        for (let i = 0; i < arcItems.length; i++) {
          const arc = arcItems[i];
          const isCh1 = arc.chapterNumber === 1;
          const isPremium = arc.chapterNumber >= 4;

          const chItem: ChapterItem = {
            id: arc.chapterNumber,
            novelId: cloudNovel.id,
            title: arc.title,
            content: isCh1 
              ? `The night air in the subterranean corridors tasted of rusted iron and dormant ether. ${generatedBible.protagonist?.name || "Aryan"} awakened with his divine soul intact, ready to conquer the modern guilds.`
              : `[Outline Slot for Chapter ${arc.chapterNumber}]\n\nPlot Beat: ${arc.beatSummary}\nKey Conflict: ${arc.keyConflict}\nPlanned Cliffhanger: ${arc.plannedCliffhanger}`,
            words: isCh1 ? 1420 : 1200,
            isPremium: isPremium,
            coins: isPremium ? 20 : 0,
            status: isCh1 ? "Published" : "Draft",
            arcPhase: arc.arcPhase,
            beatSummary: arc.beatSummary,
            plannedCliffhanger: arc.plannedCliffhanger,
          };

          populatedChapters.push(chItem);

          // Save to Supabase
          await fetch("/api/chapters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              novelId: cloudNovel.id,
              chapterNumber: chItem.id,
              title: chItem.title,
              content: chItem.content,
              wordCount: chItem.words,
              isPremium: chItem.isPremium,
              coinPrice: chItem.coins,
              status: chItem.status.toLowerCase(),
            }),
          });
        }

        setChapters(populatedChapters);

        // Initialize continuity ledger
        setContinuityLedger({
          currentPowerStage: generatedBible.protagonist?.initialPowerStage || "Tier 1: Sealed Meridians",
          inventoryAndSkills: generatedBible.initialInventory || ["Obsidian Token", "Astral Breathing Scripture"],
          characterStatuses: [`${generatedBible.protagonist?.name || "Protagonist"} (Active)`],
          rollingSummary: `Story initialized in ${generatedBible.genre} world: ${generatedBible.worldSetting}`
        });

        setActiveTab("chapters");
        alert(`🎉 बधाई छ! उपन्यास "${cloudNovel.title}" र सबै २० वटा च्याप्टरहरू (20-Chapter Queue) Supabase Cloud मा सुरक्षित भए!`);
      }
    } catch (e: any) {
      alert("Error initializing novel queue: " + e.message);
    }
  };

  // =========================================================================
  // MODE B: SERIAL CHAPTER WRITER (1,200 - 2,000 WORDS WITH CONTINUITY)
  // =========================================================================
  const handleWriteModeBChapter = async (targetChSlot?: number) => {
    const chNum = targetChSlot || targetChapterSlot;
    const targetChapter = currentChapters.find(c => c.id === chNum);

    setIsWritingModeB(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_chapter",
          title: activeNovel.title,
          genre: activeNovel.genre,
          premise: activeNovel.synopsis,
          chapterNumber: chNum,
          outlineBeat: targetChapter?.beatSummary || `Chapter ${chNum} progression`,
          plannedCliffhanger: targetChapter?.plannedCliffhanger || cliffhangerStyle,
          pacingStyle,
          sensoryFocus,
          cliffhangerStyle,
          continuityMemory: continuityLedger,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.chapter) {
        const gen = json.chapter;
        setLatestWrittenChapter(gen);

        // Update local chapter state
        setChapters(prev => prev.map(ch => {
          if (ch.id === chNum && ch.novelId === selectedNovelId) {
            return {
              ...ch,
              title: gen.chapterTitle,
              content: gen.content,
              words: gen.wordCount,
              status: "Published",
              cliffhangerHook: gen.cliffhangerHook,
            };
          }
          return ch;
        }));

        // Update in Supabase
        await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelId: selectedNovelId,
            chapterNumber: chNum,
            title: gen.chapterTitle,
            content: gen.content,
            wordCount: gen.wordCount,
            isPremium: chNum >= 4,
            coinPrice: chNum >= 4 ? 20 : 0,
            status: "published",
          }),
        });

        // Update live continuity ledger
        if (gen.updatedContinuity) {
          setContinuityLedger(prev => ({
            currentPowerStage: gen.updatedContinuity.currentPowerStage || prev.currentPowerStage,
            inventoryAndSkills: gen.updatedContinuity.inventoryAndSkills || prev.inventoryAndSkills,
            characterStatuses: gen.updatedContinuity.characterStatuses || prev.characterStatuses,
            rollingSummary: gen.updatedContinuity.rollingSummary 
              ? `${prev.rollingSummary} [Ch ${chNum}]: ${gen.updatedContinuity.rollingSummary}`
              : prev.rollingSummary,
          }));
        }

        // Set reader chapter to preview
        setReaderActiveChapterId(chNum);
        alert(`⚡ Chapter ${chNum} (${gen.wordCount} words) successfully written & synced with Supabase!`);
      } else {
        alert("Generation failed: " + json.error);
      }
    } catch (e: any) {
      alert("Error calling Mode B writer: " + e.message);
    } finally {
      setIsWritingModeB(false);
    }
  };

  // Export novel
  const handleExportNovel = () => {
    let fullText = `=== ${activeNovel.title.toUpperCase()} ===\n`;
    fullText += `Genre: ${activeNovel.genre}\n`;
    fullText += `Author: ${activeNovel.authorName}\n`;
    fullText += `Synopsis: ${activeNovel.synopsis}\n`;
    fullText += `=========================================\n\n`;

    currentChapters.forEach(ch => {
      fullText += `\n--- CHAPTER ${ch.id}: ${ch.title.toUpperCase()} ---\n`;
      fullText += `Access: ${ch.isPremium ? "Locked (20 Coins)" : "Free Hook"} | Status: ${ch.status} | Words: ${ch.words}\n\n`;
      fullText += `${ch.content}\n\n`;
    });

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeNovel.title.replace(/\s+/g, "_")}_full_novel.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0d1322] px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-600/30">
            N
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              NovelPlatform <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30">Elite Narrative Architect Studio</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Supabase Cloud Connected • Gemini 2.5 Flash
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Quick Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Active Novel:</span>
            <select 
              value={selectedNovelId}
              onChange={(e) => setSelectedNovelId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {novels.map(n => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          <a 
            href="/NovelPlatform.apk"
            download="NovelPlatform.apk"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow border border-emerald-400/30"
          >
            <span>📱</span>
            <span>Download Mobile APK</span>
          </a>

          <button 
            onClick={handleExportNovel}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export (.txt)
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Sidebar Rail */}
        <aside className="w-64 border-r border-slate-800 bg-[#0b101c] p-4 space-y-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab("chapters")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "chapters" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-2.5"><Layers className="w-4 h-4" /> Chapters & 20-Arc Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-purple-300 font-bold">{currentChapters.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("mode_a")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "mode_a" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Compass className="w-4 h-4 text-amber-400" /> Mode A: Story Bible Architect
          </button>

          <button 
            onClick={() => setActiveTab("mode_b")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "mode_b" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Zap className="w-4 h-4 text-amber-300" /> Mode B: Serial Chapter Writer
          </button>

          <button 
            onClick={() => setActiveTab("reader_preview")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "reader_preview" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" /> Reader Preview Simulator
          </button>

          <div className="pt-2 pb-1 border-t border-slate-800/80 my-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">Management</span>
          </div>

          <button 
            onClick={() => setActiveTab("novels")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "novels" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-2.5"><BookOpen className="w-4 h-4" /> Novel Library</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{novels.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "users" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-2.5"><Users className="w-4 h-4" /> Registered Users</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-bold">{users.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "settings" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Settings className="w-4 h-4" /> Cloud & API Status
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
          
          {/* ======================================================== */}
          {/* TAB 1: CHAPTERS & 20-CHAPTER PROGRESSION QUEUE */}
          {/* ======================================================== */}
          {activeTab === "chapters" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                      {activeNovel.genre.toUpperCase()}
                    </span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {activeNovel.title}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ☁️ 20-Chapter Serial Queue • सबै च्याप्टरहरू सिधै **Supabase Cloud** मा सेभ हुन्छन्।
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab("mode_b")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> Mode B Writer
                  </button>

                  <button 
                    onClick={() => setActiveTab("reader_preview")}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Reader Preview
                  </button>
                </div>
              </div>

              {/* Chapters Table */}
              <div className="border border-slate-800 rounded-2xl bg-[#0b101c] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">#</th>
                      <th className="px-5 py-3.5">Chapter Title & Arc Beat</th>
                      <th className="px-4 py-3.5">Words</th>
                      <th className="px-4 py-3.5">Paywall Access</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentChapters.map(ch => (
                      <tr key={ch.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-4 font-mono font-bold text-slate-400">{ch.id}</td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-white text-sm">{ch.title}</p>
                            {ch.beatSummary && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                <span className="text-purple-400 font-semibold">{ch.arcPhase || "Arc Beat"}:</span> {ch.beatSummary}
                              </p>
                            )}
                            {ch.plannedCliffhanger && (
                              <p className="text-[10px] text-amber-400/90 mt-0.5 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-400 shrink-0" /> Cliffhanger: {ch.plannedCliffhanger}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-400">{ch.words} w</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleTogglePremium(ch.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                              ch.isPremium 
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25" 
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                            }`}
                          >
                            {ch.isPremium ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {ch.isPremium ? `Locked (${ch.coins} 🪙)` : "Free Hook"}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleStatus(ch.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              ch.status === "Published" 
                                ? "bg-purple-600/20 text-purple-300 border-purple-500/30" 
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {ch.status}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setTargetChapterSlot(ch.id);
                                setActiveTab("mode_b");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow flex items-center gap-1"
                              title="Write or rewrite this chapter with Mode B"
                            >
                              <Bot className="w-3 h-3 text-amber-300" /> Write with AI
                            </button>
                            <button 
                              onClick={() => {
                                setReaderActiveChapterId(ch.id);
                                setActiveTab("reader_preview");
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              title="Preview in Reader"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteChapter(ch.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MODE A — STORY BIBLE ARCHITECT */}
          {/* ======================================================== */}
          {activeTab === "mode_a" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" /> Mode A: Story Bible Architect (20-Chapter Roadmap)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  उपन्यासको विश्व-निर्माण (World Building), शक्ति प्रणाली, पात्रहरू, र **२० वटा च्याप्टरको पूर्ण कथा रूपरेखा** एकै क्लिकमा तयार पार्नुहोस्।
                </p>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Novel Title (उपन्यासको नाम)</label>
                    <input 
                      type="text" 
                      value={novelTitle}
                      onChange={(e) => setNovelTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Genre (विधा)</label>
                    <select 
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option>Fantasy</option>
                      <option>Cultivation / Xianxia</option>
                      <option>Sci-Fi / Cyberpunk</option>
                      <option>LitRPG / System Apocalypse</option>
                      <option>Urban Supernatural</option>
                      <option>Romance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Core Premise & World Hook</label>
                  <textarea 
                    rows={3}
                    value={premise}
                    onChange={(e) => setPremise(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-slate-400">
                    Engine: <span className="text-purple-400 font-semibold">Gemini 2.5 Flash</span> • System Architecture v2.0
                  </div>
                  <button 
                    onClick={handleGenerateStoryBible}
                    disabled={isGeneratingBible}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingBible ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    {isGeneratingBible ? "Architecting Universe & 20-Chapter Arc..." : "⚡ Generate Story Bible & 20-Chapter Arc"}
                  </button>
                </div>

                {generatedBible && !isGeneratingBible && (
                  <div className="mt-6 space-y-4 pt-4 border-t border-slate-800">
                    {/* Header info */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> Story Bible & 20-Chapter Arc Ready!
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">{generatedBible.title} • {generatedBible.genre}</p>
                      </div>
                      <button 
                        onClick={handleInitializeNovelWith20Arc}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Initialize Novel & Auto-Populate 20 Chapter Slots →
                      </button>
                    </div>

                    {/* Cards: World, Magic, Protagonist */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">World & Laws</span>
                        <p className="text-xs text-slate-300 mt-1">{generatedBible.worldSetting}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Power / Magic System</span>
                        <p className="text-xs text-slate-300 mt-1">{generatedBible.magicOrTechSystem}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Protagonist Profile</span>
                        <p className="text-xs font-bold text-white mt-1">{generatedBible.protagonist?.name}</p>
                        <p className="text-[11px] text-slate-400">{generatedBible.protagonist?.uniqueAbility}</p>
                      </div>
                    </div>

                    {/* 20-Chapter Progression Timeline */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-purple-400" /> 20-Chapter Progression Roadmap
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                        {(generatedBible.twentyChapterArc || []).map(arc => (
                          <div key={arc.chapterNumber} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-amber-300">Ch {arc.chapterNumber}: {arc.title}</span>
                              <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">{arc.arcPhase}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-1">{arc.beatSummary}</p>
                            <p className="text-rose-400/90 text-[10px] mt-1">💥 Cliffhanger: {arc.plannedCliffhanger}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: MODE B — SERIAL CHAPTER WRITER & CONTINUITY */}
          {/* ======================================================== */}
          {activeTab === "mode_b" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-300" /> Mode B: Serial Chapter Writer & Continuity Ledger
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  १,२०० देखि २,००० शब्दका अध्यायहरू लेख्नुहोस्। **Rolling Continuity Memory** ले अघिल्ला घटना, शक्ति स्तर, र वस्तुहरू याद राख्दछ।
                </p>
              </div>

              {/* Writer Control Deck */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Generation Controls */}
                <div className="lg:col-span-2 space-y-4 bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Chapter Slot</label>
                      <select 
                        value={targetChapterSlot}
                        onChange={(e) => setTargetChapterSlot(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
                          const existing = currentChapters.find(c => c.id === num);
                          return (
                            <option key={num} value={num}>
                              Chapter {num} {existing ? `• ${existing.title}` : "(Empty Slot)"}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pacing Velocity</label>
                      <select 
                        value={pacingStyle}
                        onChange={(e) => setPacingStyle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option>Fast Action & Combat Pacing</option>
                        <option>Balanced Serial (Action + Intrigue)</option>
                        <option>Deep Atmospheric & World-Building</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sensory & Show-Don't-Tell Focus</label>
                      <select 
                        value={sensoryFocus}
                        onChange={(e) => setSensoryFocus(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option>High Visceral Combat & Physicality</option>
                        <option>Mystic Atmosphere & Ley-Line Senses</option>
                        <option>Tense Dialogue & Psychological Intrigue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cliffhanger Style Target</label>
                      <select 
                        value={cliffhangerStyle}
                        onChange={(e) => setCliffhangerStyle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-none focus:border-purple-500"
                      >
                        <option>Ancient Seal Cracking</option>
                        <option>Unexpected Revelation</option>
                        <option>Enemy Drawing a Blade</option>
                        <option>System Anomaly / Ominous Prompt</option>
                        <option>Mysterious Knock on Void Barrier</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono">Length: 1,200 – 2,000 words per chapter</span>
                    <button 
                      onClick={() => handleWriteModeBChapter()}
                      disabled={isWritingModeB}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isWritingModeB ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Bot className="w-4 h-4 text-amber-300" />}
                      {isWritingModeB ? "Writing Chapter & Updating Memory..." : `⚡ Write Chapter ${targetChapterSlot} (1.2k-2k Words)`}
                    </button>
                  </div>
                </div>

                {/* Right Col: Rolling Continuity Memory Ledger */}
                <div className="bg-[#0b101c] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                      <History className="w-4 h-4 text-amber-400" /> Rolling Story Memory
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active Ledger</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cultivation / Power Stage</label>
                    <p className="text-xs font-bold text-amber-300 mt-0.5">{continuityLedger.currentPowerStage}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Active Relics & Skills</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {continuityLedger.inventoryAndSkills.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Rolling Narrative Memory</label>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 max-h-36 overflow-y-auto">
                      {continuityLedger.rollingSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Output Preview */}
              {latestWrittenChapter && (
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-purple-500/40 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                        CHAPTER {latestWrittenChapter.chapterNumber} GENERATED
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{latestWrittenChapter.chapterTitle}</h3>
                      <p className="text-xs text-slate-400">{latestWrittenChapter.wordCount} words • Saved to Supabase Cloud</p>
                    </div>

                    <button 
                      onClick={() => {
                        setReaderActiveChapterId(latestWrittenChapter.chapterNumber);
                        setActiveTab("reader_preview");
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Open in Reader Preview →
                    </button>
                  </div>

                  {/* Cliffhanger highlight card */}
                  {latestWrittenChapter.cliffhangerHook && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <strong>Ending Cliffhanger:</strong> <em>"{latestWrittenChapter.cliffhangerHook}"</em>
                      </div>
                    </div>
                  )}

                  {/* Prose excerpts */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                    {latestWrittenChapter.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: INTEGRATED DIGITAL READER PREVIEW */}
          {/* ======================================================== */}
          {activeTab === "reader_preview" && (() => {
            const currentPreviewChapter = currentChapters.find(c => c.id === readerActiveChapterId) || currentChapters[0] || {
              id: 1,
              title: "Chapter 1: The Sovereign Awakens",
              content: "The night air in the subterranean corridors tasted of rusted iron and dormant ether...\n\nAryan stood before the ancient seal, feeling the pulse of ley lines beneath Kathmandu.",
              words: 1420,
              isPremium: false,
              coins: 0,
              status: "Published",
            };

            const isLockedForReader = currentPreviewChapter.isPremium && !unlockedPreviewChapters.has(currentPreviewChapter.id);

            const themeStyles = {
              obsidian: "bg-[#090d16] text-slate-100 border-slate-800",
              sepia: "bg-[#f5ede0] text-[#332a21] border-[#d8c8b4]",
              midnight: "bg-[#04060c] text-slate-200 border-slate-900",
            }[readerTheme];

            return (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400" /> Integrated Digital Reader Simulator
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Webnovel & Wuxiaworld मोडलमा आधारित पाठक इन्टरफेस। यहाँ फन्ट, थिम, र **२० Coins Paywall Unlock** परीक्षण गर्नुहोस्।
                    </p>
                  </div>

                  {/* Reader Global Controls Bar */}
                  <div className="flex items-center gap-3 bg-[#0f172a] p-2 rounded-2xl border border-slate-800">
                    {/* Theme Picker */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl">
                      <button 
                        onClick={() => setReaderTheme("obsidian")} 
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${readerTheme === "obsidian" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                      >
                        Obsidian
                      </button>
                      <button 
                        onClick={() => setReaderTheme("sepia")} 
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${readerTheme === "sepia" ? "bg-amber-600 text-white" : "text-slate-400"}`}
                      >
                        Sepia
                      </button>
                      <button 
                        onClick={() => setReaderTheme("midnight")} 
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${readerTheme === "midnight" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                      >
                        Midnight
                      </button>
                    </div>

                    {/* Font Adjuster */}
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                      <button 
                        onClick={() => setReaderFontSize(s => Math.max(14, s - 2))} 
                        className="px-2 py-1 bg-slate-800 rounded-lg font-bold"
                      >
                        A-
                      </button>
                      <span className="w-6 text-center font-mono">{readerFontSize}</span>
                      <button 
                        onClick={() => setReaderFontSize(s => Math.min(24, s + 2))} 
                        className="px-2 py-1 bg-slate-800 rounded-lg font-bold"
                      >
                        A+
                      </button>
                    </div>

                    {/* Coins Badge */}
                    <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <span>🪙 {readerSimulatedCoins} Coins</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Phone Mockup Frame */}
                <div className="flex justify-center py-4">
                  <div className="w-[380px] h-[720px] rounded-[44px] bg-[#020408] p-3 border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden">
                    {/* Phone Dynamic Island / Camera Notch */}
                    <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                    </div>

                    {/* Phone Screen Canvas */}
                    <div className={`flex-1 rounded-[32px] overflow-hidden flex flex-col border ${themeStyles}`}>
                      {/* Reader Top Bar */}
                      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 opacity-90 border-inherit">
                        <select 
                          value={readerActiveChapterId}
                          onChange={(e) => setReaderActiveChapterId(Number(e.target.value))}
                          className="bg-transparent text-xs font-bold focus:outline-none max-w-[200px] truncate"
                        >
                          {currentChapters.map(ch => (
                            <option key={ch.id} value={ch.id} className="bg-slate-900 text-white">
                              Ch {ch.id}: {ch.title}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] font-mono opacity-70">{currentPreviewChapter.words}w</span>
                      </div>

                      {/* Reader Scrollable Prose Content */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        <h3 className="font-bold text-center tracking-tight text-sm pb-2 border-b border-inherit opacity-80">
                          {currentPreviewChapter.title}
                        </h3>

                        {isLockedForReader ? (
                          /* PAYWALL SIMULATION SCREEN */
                          <div className="py-12 px-4 text-center space-y-4">
                            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                              <Lock className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">Premium Chapter Locked</h4>
                              <p className="text-[11px] opacity-70 mt-1">
                                यो च्याप्टर पढ्नको लागि २० Coins चाहिन्छ।
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                if (readerSimulatedCoins >= 20) {
                                  setReaderSimulatedCoins(c => c - 20);
                                  setUnlockedPreviewChapters(prev => new Set(prev).add(currentPreviewChapter.id));
                                } else {
                                  alert("सिमुलेटरमा क्वाइन सकियो! (+100 थप्दैछौं)");
                                  setReaderSimulatedCoins(100);
                                }
                              }}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition-all"
                            >
                              <span>🪙</span>
                              <span>Unlock Chapter (20 Coins)</span>
                            </button>
                          </div>
                        ) : (
                          /* FULL CHAPTER PROSE */
                          <div 
                            style={{ fontSize: `${readerFontSize}px` }} 
                            className="font-serif leading-relaxed whitespace-pre-line opacity-90"
                          >
                            {currentPreviewChapter.content}

                            {/* Ending cliffhanger badge */}
                            <div className="mt-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-sans not-italic">
                              <span className="font-bold flex items-center gap-1.5 mb-1">
                                <Flame className="w-3.5 h-3.5 text-amber-400" /> Serial Cliffhanger Ending
                              </span>
                              <em>{currentPreviewChapter.plannedCliffhanger || "End of chapter hook."}</em>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reader Bottom Navigation Bar */}
                      <div className="px-4 py-2.5 border-t border-inherit flex items-center justify-between text-xs font-bold shrink-0 opacity-90">
                        <button 
                          disabled={readerActiveChapterId <= 1}
                          onClick={() => setReaderActiveChapterId(id => id - 1)}
                          className="disabled:opacity-30"
                        >
                          ← Prev
                        </button>
                        <span className="text-[10px] font-mono">Ch {readerActiveChapterId} of {currentChapters.length}</span>
                        <button 
                          disabled={readerActiveChapterId >= currentChapters.length}
                          onClick={() => setReaderActiveChapterId(id => id + 1)}
                          className="disabled:opacity-30 text-purple-400 font-bold"
                        >
                          Next →
                        </button>
                      </div>
                    </div>

                    {/* Phone Home Bar */}
                    <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2 shrink-0"></div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* TAB 5: NOVEL LIBRARY */}
          {/* ======================================================== */}
          {activeTab === "novels" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" /> Novel Library ({novels.length} Novels in Cloud)
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    तपाईंका सबै उपन्यासहरू Supabase Cloud मा सुरक्षित छन्।
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddNovelModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Plus className="w-4 h-4" /> Create / Add New Novel
                </button>
              </div>

              {/* Novels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {novels.map(novel => {
                  const novelChapters = chapters.filter(c => c.novelId === novel.id);
                  const isSelected = novel.id === selectedNovelId;
                  const isPopular = (novel.views || 0) >= 1000;

                  return (
                    <div 
                      key={novel.id} 
                      className={`p-5 bg-[#0f172a] border rounded-2xl flex gap-4 items-start shadow-xl transition-all ${
                        isSelected ? "border-purple-500 ring-1 ring-purple-500/50" : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img 
                        src={novel.coverImageUrl} 
                        className="w-24 h-36 object-cover rounded-xl border border-slate-700 shrink-0 shadow-md" 
                      />
                      <div className="flex-1 flex flex-col justify-between min-h-[9rem]">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                                {novel.genre}
                              </span>
                              {isPopular && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  🔥 #1 Trending
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1.5 leading-tight">{novel.title}</h3>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{novel.synopsis}</p>
                          
                          {/* Live Popularity Metrics */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
                              <Eye className="w-3 h-3 text-indigo-400" /> {novel.views ?? 0} Views
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/20">
                              <Heart className="w-3 h-3 text-rose-400 fill-rose-500/30" /> {novel.likes ?? 0} Likes
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/20">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9
                            </span>
                            <span className="text-[10px] text-slate-500">
                              • {novelChapters.length} Ch
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3">
                          <button 
                            onClick={() => {
                              setSelectedNovelId(novel.id);
                              setActiveTab("chapters");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex-1 text-center transition-all"
                          >
                            Manage Chapters ({novelChapters.length})
                          </button>
                          <button 
                            onClick={() => handleDeleteNovel(novel.id, novel.title)}
                            title="Delete Novel"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1 text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: REGISTERED USERS */}
          {/* ======================================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" /> Registered Users ({users.length})
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    मोबाइल एपमा Google वा Email बाट साइन-अप गरेका सम्पूर्ण प्रयोगकर्ताहरू र उनीहरूको क्वाइन विवरण।
                  </p>
                </div>
                <button 
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isLoadingUsers ? "animate-spin" : ""}`} /> 
                  {isLoadingUsers ? "Syncing..." : "Refresh Users"}
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Registered Users</p>
                  <p className="text-3xl font-black text-white mt-2">{users.length}</p>
                  <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Live Synced with Supabase Auth
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total User Coins in Circulation</p>
                  <p className="text-3xl font-black text-amber-400 mt-2">
                    🪙 {users.reduce((acc, u) => acc + (u.coinsBalance || 0), 0)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    औसत: {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.coinsBalance || 0), 0) / users.length) : 0} coins प्रति प्रयोगकर्ता
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Auth Providers</p>
                  <p className="text-3xl font-black text-purple-400 mt-2">Google & Email</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Supabase Cloud OAuth & JWT
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-slate-800 rounded-2xl bg-[#0b101c] overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#0f172a]/60 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">User Directory</h3>
                  <span className="text-xs text-slate-400">{users.length} Active Accounts</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">User Profile</th>
                        <th className="px-5 py-3.5">Sign-in Provider</th>
                        <th className="px-5 py-3.5">Coins Balance</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Registered Date</th>
                        <th className="px-5 py-3.5">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
                                {u.username?.[0] || u.email?.[0] || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{u.username}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.provider === "google" 
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}>
                              {u.provider.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-amber-400 text-sm">
                            🪙 {u.coinsBalance ?? 20}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-[11px]">
                            {new Date(u.lastSignInAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: SETTINGS & CLOUD SYNC */}
          {/* ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-400" /> Cloud & Database Status
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  तपाईंको Supabase Cloud Database पूर्ण रूपमा सक्रिय र जोडिएको छ।
                </p>
              </div>

              <div className="p-6 bg-[#0f172a] border border-slate-800 rounded-2xl space-y-4 max-w-xl shadow-xl">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Supabase Cloud Connected</h4>
                    <p className="text-[11px] text-emerald-300 mt-0.5">
                      URL: https://qowinnmfdkaampgpovqb.supabase.co
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem("np_gemini_key", e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Google AI Studio (aistudio.google.com) बाट निःशुल्क लिन सक्नुहुन्छ।
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
