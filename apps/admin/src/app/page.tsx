"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, Wand2, Layers, Coins, Eye, 
  CheckCircle, Plus, Settings, Lock, Unlock, Key, RefreshCw,
  Edit3, Trash2, X, Save, Check, Globe, Bot, Download, RotateCcw,
  Cloud, Users, Heart, Star
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"chapters" | "novels" | "users" | "generator" | "settings">("chapters");
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // 1. NOVELS & CHAPTERS STATE
  const [novels, setNovels] = useState<NovelItem[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>("");
  const [chapters, setChapters] = useState<ChapterItem[]>([]);

  // 2. USERS STATE
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Settings State
  const [apiKey, setApiKey] = useState("");

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

  // Modals States
  const [editingChapter, setEditingChapter] = useState<ChapterItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddNovelModalOpen, setIsAddNovelModalOpen] = useState(false);

  // New Novel Form State
  const [newNovelTitle, setNewNovelTitle] = useState("");
  const [newNovelGenre, setNewNovelGenre] = useState("Fantasy");
  const [newNovelSynopsis, setNewNovelSynopsis] = useState("");
  const [newNovelCover, setNewNovelCover] = useState("https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80");

  // AI Generator Form States
  const [selectedGenre, setSelectedGenre] = useState("Fantasy");
  const [novelTitle, setNovelTitle] = useState("The Alchemist Sovereign");
  const [premise, setPremise] = useState("A potion prodigy in a high-tech cultivation world discovers a forgotten recipe that can alter fate itself.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWritingChapterWithAI, setIsWritingChapterWithAI] = useState(false);
  const [generatedBible, setGeneratedBible] = useState<any>(null);
  const [apiSource, setApiSource] = useState<string>("");

  // ==========================================
  // 1. ONE-CLICK PUBLISH / DRAFT TOGGLE (SAVES TO SUPABASE)
  // ==========================================
  const handleTogglePublishStatus = async (id: number) => {
    const target = currentChapters.find(c => c.id === id);
    if (!target) return;
    const nextStatus = target.status === "Published" ? "Draft" : "Published";

    // Optimistic UI update
    setChapters(prev => prev.map(ch => (ch.id === id && ch.novelId === selectedNovelId) ? { ...ch, status: nextStatus } : ch));

    // Save directly to Supabase
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
          status: nextStatus,
        }),
      });
    } catch (e) {
      console.error("Failed to update status in Supabase", e);
    }
  };

  // ==========================================
  // 2. TOGGLE PREMIUM (SAVES TO SUPABASE)
  // ==========================================
  const handleTogglePremium = async (id: number) => {
    const target = currentChapters.find(c => c.id === id);
    if (!target) return;
    const nextPremium = !target.isPremium;
    const nextCoins = nextPremium ? 20 : 0;

    // Optimistic UI update
    setChapters(prev => prev.map(ch => (ch.id === id && ch.novelId === selectedNovelId) ? { ...ch, isPremium: nextPremium, coins: nextCoins } : ch));

    // Save directly to Supabase
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
          status: target.status,
        }),
      });
    } catch (e) {
      console.error("Failed to update premium in Supabase", e);
    }
  };

  // ==========================================
  // 3. DELETE CHAPTER (DELETES FROM SUPABASE)
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
      } catch (e) {}
    }
  };

  // ==========================================
  // 4. OPEN EDIT MODAL
  // ==========================================
  const handleOpenEdit = (chapter: ChapterItem) => {
    setEditingChapter({ ...chapter });
    setIsEditModalOpen(true);
  };

  // ==========================================
  // 5. SAVE EDITED CHAPTER (SAVES TO SUPABASE)
  // ==========================================
  const handleSaveChapter = async () => {
    if (!editingChapter) return;
    const wordCount = editingChapter.content.trim().split(/\s+/).filter(Boolean).length;
    const updated = { ...editingChapter, words: wordCount };

    setChapters(prev => prev.map(ch => 
      (ch.id === editingChapter.id && ch.novelId === selectedNovelId) ? updated : ch
    ));
    setIsEditModalOpen(false);
    setEditingChapter(null);

    // Save directly to Supabase Cloud
    try {
      await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: selectedNovelId,
          chapterNumber: updated.id,
          title: updated.title,
          content: updated.content,
          wordCount: updated.words,
          isPremium: updated.isPremium,
          coinPrice: updated.coins,
          status: updated.status,
        }),
      });
      alert(`बधाई छ! Chapter ${updated.id} Supabase Cloud मा सुरक्षित भयो!`);
    } catch (e) {
      alert("Supabase सेभ गर्न समस्या आयो");
    }
  };

  // ==========================================
  // 6. GENERATE NEXT CHAPTER WITH AI (SAVES TO SUPABASE)
  // ==========================================
  const handleGenerateNextChapterWithAI = async () => {
    const nextChapterNumber = currentChapters.length > 0 
      ? Math.max(...currentChapters.map(c => c.id)) + 1 
      : 1;

    const lastChapter = currentChapters.find(c => c.id === nextChapterNumber - 1);
    const previousSummary = lastChapter ? `Last chapter title: ${lastChapter.title}. Snippet: ${lastChapter.content.substring(0, 150)}...` : "";

    setIsWritingChapterWithAI(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_chapter",
          title: activeNovel.title,
          genre: activeNovel.genre,
          premise: activeNovel.synopsis,
          chapterNumber: nextChapterNumber,
          previousSummary: previousSummary,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const generatedData = json.data;
        const newChapter: ChapterItem = {
          id: nextChapterNumber,
          novelId: selectedNovelId,
          title: generatedData.chapterTitle || `Chapter ${nextChapterNumber}: The Astral Surge`,
          content: generatedData.content || "AI ले लेखेको कथा...",
          words: generatedData.wordCount || 1150,
          isPremium: nextChapterNumber > 3,
          coins: nextChapterNumber > 3 ? 20 : 0,
          status: "Published",
        };

        setChapters(prev => [...prev, newChapter]);

        // Save immediately to Supabase Cloud
        await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelId: selectedNovelId,
            chapterNumber: newChapter.id,
            title: newChapter.title,
            content: newChapter.content,
            wordCount: newChapter.words,
            isPremium: newChapter.isPremium,
            coinPrice: newChapter.coins,
            status: newChapter.status,
          }),
        });

        handleOpenEdit(newChapter);
      } else {
        alert("Chapter generation failed: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsWritingChapterWithAI(false);
    }
  };

  // 7. ADD MANUAL CHAPTER
  const handleAddNewChapter = () => {
    const nextId = currentChapters.length > 0 ? Math.max(...currentChapters.map(c => c.id)) + 1 : 1;
    const newCh: ChapterItem = {
      id: nextId,
      novelId: selectedNovelId,
      title: `Chapter ${nextId}: The Unfolding Mystery`,
      content: "यहाँ नयाँ च्याप्टरको पाठ लेख्नुहोस् वा AI बाट उत्पन्न गर्नुहोस्...",
      words: 850,
      isPremium: nextId > 3,
      coins: nextId > 3 ? 20 : 0,
      status: "Published",
    };
    setChapters(prev => [...prev, newCh]);
    handleOpenEdit(newCh);
  };

  // 8. ADD NEW NOVEL (SAVES TO SUPABASE)
  const handleCreateNewNovel = async () => {
    if (!newNovelTitle.trim()) {
      alert("कृपया उपन्यासको शीर्षक लेख्नुहोस्!");
      return;
    }

    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNovelTitle.trim(),
          genre: newNovelGenre,
          synopsis: newNovelSynopsis.trim() || "एक नयाँ रोमान्चक AI उपन्यास।",
          coverImageUrl: newNovelCover,
          authorName: "AI Author",
          status: "ongoing",
          isPublished: true,
        }),
      });

      const json = await res.json();
      if (json.success && json.novel) {
        const cloudNovel: NovelItem = {
          id: json.novel.id,
          title: json.novel.title,
          genre: newNovelGenre,
          synopsis: json.novel.synopsis,
          coverImageUrl: json.novel.cover_image_url,
          authorName: json.novel.author_name,
          status: "Ongoing",
          isPublished: true,
        };

        setNovels(prev => [cloudNovel, ...prev]);
        setSelectedNovelId(cloudNovel.id);

        // Save Chapter 1 to Supabase
        await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelId: cloudNovel.id,
            chapterNumber: 1,
            title: "Chapter 1: The Beginning",
            content: `The journey of "${cloudNovel.title}" begins here. An ancient destiny begins to stir as cosmic ether flows across the world...`,
            wordCount: 1100,
            isPremium: false,
            coinPrice: 0,
            status: "published",
          }),
        });

        setIsAddNovelModalOpen(false);
        setNewNovelTitle("");
        setNewNovelSynopsis("");
        setActiveTab("chapters");
        alert(`बधाई छ! उपन्यास "${cloudNovel.title}" Supabase Cloud मा सुरक्षित भयो!`);
      }
    } catch (e) {
      alert("Novel सिर्जना गर्न समस्या आयो");
    }
  };

  // 8.5 DELETE NOVEL FROM SUPABASE
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

  // 9. AI STORY BIBLE GENERATOR
  const handleGenerateStoryBible = async () => {
    setIsGenerating(true);
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
      if (json.success) {
        setGeneratedBible(json.data);
        setApiSource(json.source);
      } else {
        alert("Error: " + json.error);
      }
    } catch (err: any) {
      alert("Request failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Generated Bible as a New Novel (SAVES TO SUPABASE)
  const handleSaveBibleAsNovel = async () => {
    if (!generatedBible) return;
    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedBible.title || novelTitle,
          genre: generatedBible.genre || selectedGenre,
          synopsis: generatedBible.mainConflict || premise,
          coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
          authorName: "Gemini AI Studio",
          status: "ongoing",
          isPublished: true,
        }),
      });

      const json = await res.json();
      if (json.success && json.novel) {
        const cloudNovel: NovelItem = {
          id: json.novel.id,
          title: json.novel.title,
          genre: generatedBible.genre || selectedGenre,
          synopsis: json.novel.synopsis,
          coverImageUrl: json.novel.cover_image_url,
          authorName: json.novel.author_name,
          status: "Ongoing",
          isPublished: true,
        };

        setNovels(prev => [cloudNovel, ...prev]);
        setSelectedNovelId(cloudNovel.id);

        // Save Chapter 1 to Supabase
        await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelId: cloudNovel.id,
            chapterNumber: 1,
            title: "Chapter 1: Genesis of Shadows",
            content: `The sky burned with celestial resonance. ${generatedBible.protagonist} stood atop the monolith, knowing that the ancient seal had finally cracked.`,
            wordCount: 1450,
            isPremium: false,
            coinPrice: 0,
            status: "published",
          }),
        });

        setActiveTab("chapters");
        alert(`बधाई छ! AI Story Bible बाट नयाँ उपन्यास "${cloudNovel.title}" सिधै Supabase Cloud मा सुरक्षित भयो!`);
      }
    } catch (e) {
      alert("Error saving to Supabase");
    }
  };

  // 10. EXPORT NOVEL TO TEXT FILE
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
      <header className="border-b border-slate-800 bg-[#0d1322] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-600/20">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              NovelPlatform <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30">AI Admin Studio</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Supabase Live Connected
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE NOVEL SELECTOR & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 shadow-inner">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Active Novel:</span>
            <select 
              value={selectedNovelId}
              onChange={(e) => setSelectedNovelId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {novels.map(n => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          {/* Download Android APK Button */}
          <a 
            href="/NovelPlatform.apk"
            download="NovelPlatform.apk"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all border border-emerald-400/30"
            title="Download Android APK for Mobile (46.9 MB)"
          >
            <span>📱</span>
            <span>Download Android App (.apk)</span>
          </a>

          {/* Export Book Button */}
          <button 
            onClick={handleExportNovel}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow"
            title="Download full novel as .txt"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export (.txt)
          </button>

          <button 
            onClick={() => setIsAddNovelModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> + New Novel
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-[#0b101c] p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("chapters")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "chapters" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-3"><Layers className="w-4 h-4" /> Chapters & Paywall</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-purple-300 font-bold">{currentChapters.length}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("novels")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "novels" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> Novel Library</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{novels.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "users" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Registered Users</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-bold">{users.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("generator")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "generator" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Sparkles className="w-4 h-4" /> AI Novel Generator
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "settings" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Settings className="w-4 h-4" /> Cloud & API Status
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
          
          {/* ======================================================== */}
          {/* TAB 1: CHAPTERS & PAYWALL WITH DIRECT SUPABASE SYNC */}
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
                    ☁️ तपाईंले यहाँ लेखेका वा सम्पादन गरेका सबै च्याप्टरहरू **सिधै Supabase Cloud मा सेभ हुन्छन्**।
                  </p>
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleGenerateNextChapterWithAI}
                    disabled={isWritingChapterWithAI}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isWritingChapterWithAI ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Bot className="w-4 h-4 text-amber-300" />
                    )}
                    {isWritingChapterWithAI ? "AI Writing & Saving to Supabase..." : "⚡ Write Next Chapter with AI"}
                  </button>

                  <button 
                    onClick={handleAddNewChapter}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Manual
                  </button>
                </div>
              </div>

              {/* Progress alert when AI is writing */}
              {isWritingChapterWithAI && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Gemini AI is writing the chapter & uploading to Supabase...</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      अघिल्लो च्याप्टरको कथा र पात्रहरूको निरन्तरता जोडेर च्याप्टर तयार गरी क्लाउड डाटाबेसमा थपिँदैछ।
                    </p>
                  </div>
                </div>
              )}

              {/* Chapters Table */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101c] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">Chapter Title</th>
                      <th className="p-4">Word Count</th>
                      <th className="p-4">Access Type (Click to Toggle)</th>
                      <th className="p-4">Status (Click to Publish)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentChapters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          {isLoadingFromCloud ? "Loading from Supabase Cloud..." : "यो उपन्यासमा कुनै च्याप्टर छैन। माथिको 'Write Next Chapter with AI' थिच्नुहोस्!"}
                        </td>
                      </tr>
                    ) : (
                      currentChapters.map((ch) => (
                        <tr key={ch.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-400">{ch.id}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{ch.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{ch.content}</div>
                          </td>
                          <td className="p-4 text-slate-300 font-mono">{ch.words.toLocaleString()} words</td>
                          
                          {/* 1-CLICK TOGGLE FREE / 20 COINS */}
                          <td className="p-4">
                            <button 
                              onClick={() => handleTogglePremium(ch.id)}
                              title="Click to toggle Free / 20 Coins Locked"
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                                ch.isPremium 
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25" 
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                              }`}
                            >
                              {ch.isPremium ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              {ch.isPremium ? "Locked (20 Coins)" : "Free Hook"}
                            </button>
                          </td>

                          {/* 1-CLICK PUBLISH / DRAFT TOGGLE */}
                          <td className="p-4">
                            <button 
                              onClick={() => handleTogglePublishStatus(ch.id)}
                              title="Click to toggle Draft / Published"
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                                ch.status === "Published"
                                  ? "bg-purple-600/25 text-purple-300 border border-purple-500/40 hover:bg-purple-600/40"
                                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white"
                              }`}
                            >
                              {ch.status === "Published" ? <Globe className="w-3 h-3 text-emerald-400" /> : <Edit3 className="w-3 h-3 text-amber-400" />}
                              <span>{ch.status}</span>
                            </button>
                          </td>

                          {/* ACTIONS: EDIT & REMOVE */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenEdit(ch)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 hover:border-purple-500 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-purple-400" /> Edit
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteChapter(ch.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-800/40 hover:border-rose-500 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: NOVEL LIBRARY */}
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
          {/* TAB: REGISTERED USERS MANAGEMENT */}
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
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                            कुनै पनि प्रयोगकर्ता फेला परेन।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: AI NOVEL GENERATOR */}
          {/* ======================================================== */}
          {activeTab === "generator" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" /> AI Story Studio & Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  उपन्यासको नयाँ विचार दिनुहोस्। Gemini AI ले Story Bible र आउटलाइन बनाउनेछ, जसलाई सिधै नयाँ उपन्यासको रूपमा Supabase मा सेभ गर्न सकिन्छ।
                </p>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Novel Title (शीर्षक)</label>
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
                      <option>Sci-Fi</option>
                      <option>Cultivation (Eastern Martial)</option>
                      <option>Romance</option>
                      <option>Mystery & Thriller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Story Premise / Core Hook</label>
                  <textarea 
                    rows={3}
                    value={premise}
                    onChange={(e) => setPremise(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-slate-400">
                    Engine: <span className="text-purple-400 font-semibold">Gemini 2.5 Flash</span>
                  </div>
                  <button 
                    onClick={handleGenerateStoryBible}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Generate Story Bible & Outlines"}
                  </button>
                </div>

                {generatedBible && !isGenerating && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Story Bible Successfully Generated!
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                        {apiSource === "live_gemini_ai" ? "⚡ Live Gemini AI" : "✨ Demo Engine"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      <div><strong className="text-slate-400">World & Magic:</strong> <p className="text-slate-200 mt-0.5">{generatedBible.worldSetting}</p></div>
                      <div><strong className="text-slate-400">Protagonist:</strong> <p className="text-amber-300 mt-0.5">{generatedBible.protagonist}</p></div>
                    </div>

                    <div className="pt-3 flex gap-3">
                      <button 
                        onClick={handleSaveBibleAsNovel}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Save as New Novel in Supabase Cloud →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SETTINGS & CLOUD SYNC */}
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

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW NOVEL */}
      {/* ======================================================== */}
      {isAddNovelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Create / Add New Novel
              </h3>
              <button onClick={() => setIsAddNovelModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Novel Title (उपन्यासको नाम)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Return of the Heavenly Sword"
                  value={newNovelTitle}
                  onChange={(e) => setNewNovelTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500" 
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Genre (विधा)</label>
                <select 
                  value={newNovelGenre}
                  onChange={(e) => setNewNovelGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500" 
                >
                  <option>Fantasy</option>
                  <option>Sci-Fi</option>
                  <option>Cultivation (Eastern Martial)</option>
                  <option>Romance</option>
                  <option>Mystery & Thriller</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Synopsis (सारांश)</label>
                <textarea 
                  rows={3}
                  placeholder="उपन्यासको छोटो विवरण..."
                  value={newNovelSynopsis}
                  onChange={(e) => setNewNovelSynopsis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500" 
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cover Image URL</label>
                <input 
                  type="text" 
                  value={newNovelCover}
                  onChange={(e) => setNewNovelCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setIsAddNovelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNewNovel}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
              >
                Create Novel in Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT CHAPTER */}
      {/* ======================================================== */}
      {isEditModalOpen && editingChapter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Edit Chapter {editingChapter.id}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter Title</label>
                <input 
                  type="text" 
                  value={editingChapter.title}
                  onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Access Type</label>
                  <select 
                    value={editingChapter.isPremium ? "premium" : "free"}
                    onChange={(e) => {
                      const isPrem = e.target.value === "premium";
                      setEditingChapter({
                        ...editingChapter,
                        isPremium: isPrem,
                        coins: isPrem ? 20 : 0
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500" 
                  >
                    <option value="free">Free Hook (0 Coins)</option>
                    <option value="premium">Locked (20 Coins / 2 Ads)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Status</label>
                  <select 
                    value={editingChapter.status}
                    onChange={(e) => setEditingChapter({ ...editingChapter, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-bold text-purple-400"
                  >
                    <option value="Published">Published (पाठकले पढ्न पाउने)</option>
                    <option value="Draft">Draft (अप्रकासित)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Chapter Content (कथाको मुख्य पाठ)</label>
                  <span className="text-[11px] text-slate-400">
                    {editingChapter.content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea 
                  rows={9}
                  value={editingChapter.content}
                  onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 font-serif leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0d1322]">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleSaveChapter} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                <Save className="w-4 h-4" /> Save to Supabase Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
