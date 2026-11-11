-- ==============================================================================
-- NovelPlatform: Complete PostgreSQL Production Schema with RLS & Coin Economy
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked 1-to-1 with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'admin', 'super_admin')),
    coins_balance INTEGER NOT NULL DEFAULT 20 CHECK (coins_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Genres Table (Fantasy, Sci-Fi, Cultivation, Romance, etc.)
CREATE TABLE IF NOT EXISTS public.genres (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Novels Table
CREATE TABLE IF NOT EXISTS public.novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    synopsis TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'AI Storyteller',
    status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
    is_published BOOLEAN NOT NULL DEFAULT false,
    total_views BIGINT NOT NULL DEFAULT 0,
    total_likes BIGINT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Novel-to-Genre Many-to-Many Bridge Table
CREATE TABLE IF NOT EXISTS public.novel_genres (
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    genre_id BIGINT NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (novel_id, genre_id)
);

-- 6. AI Story Bibles Table (World Rules, Characters, Arcs, Style)
CREATE TABLE IF NOT EXISTS public.story_bibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID UNIQUE NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    world_setting JSONB NOT NULL DEFAULT '{}'::jsonb,
    characters JSONB NOT NULL DEFAULT '[]'::jsonb,
    plot_outline JSONB NOT NULL DEFAULT '[]'::jsonb,
    writing_style JSONB NOT NULL DEFAULT '{"tone": "gripping", "perspective": "third_person_limited"}'::jsonb,
    continuity_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    coin_price INTEGER NOT NULL DEFAULT 20 CHECK (coin_price >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_novel_chapter_number UNIQUE (novel_id, chapter_number)
);

-- 8. User Unlocked Chapters Table
CREATE TABLE IF NOT EXISTS public.user_unlocked_chapters (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    coins_paid INTEGER NOT NULL DEFAULT 20,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_unlocked_chapter UNIQUE (user_id, chapter_id)
);

-- 9. Reading History Table
CREATE TABLE IF NOT EXISTS public.reading_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    last_read_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    scroll_offset_percent FLOAT NOT NULL DEFAULT 0.0 CHECK (scroll_offset_percent >= 0.0 AND scroll_offset_percent <= 100.0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_novel_history UNIQUE (user_id, novel_id)
);

-- 10. Library Bookmarks Table
CREATE TABLE IF NOT EXISTS public.library_bookmarks (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, novel_id)
);

-- 11. Coin Transactions Audit Ledger
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ad_reward', 'chapter_unlock', 'daily_bonus', 'admin_adjustment', 'purchase')),
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. AI Generation Jobs Queue
CREATE TABLE IF NOT EXISTS public.ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('generate_bible', 'generate_outline', 'generate_chapter')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    prompt_input JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_output JSONB,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_novels_is_published ON public.novels (is_published);
CREATE INDEX IF NOT EXISTS idx_novels_slug ON public.novels (slug);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_number ON public.chapters (novel_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_unlocked_chapters_user ON public.user_unlocked_chapters (user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.reading_history (user_id);

-- ==============================================================================
-- AUTOMATIC NEW USER INITIALIZATION (Trigger on Supabase auth.users)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, role, coins_balance)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'reader_' || SUBSTRING(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'reader',
        20 -- Welcome bonus 20 coins (enough for 1 free premium unlock!)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SECURE ATOMIC STORED PROCEDURES (COIN WALLET & UNLOCK ENGINE)
-- ==============================================================================

-- 1. Unlock Chapter Transaction (Deducts 20 Coins & Unlocks)
CREATE OR REPLACE FUNCTION public.unlock_chapter(p_chapter_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_coin_price INTEGER;
    v_current_balance INTEGER;
    v_is_already_unlocked BOOLEAN;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch chapter price
    SELECT coin_price INTO v_coin_price FROM public.chapters WHERE id = p_chapter_id;
    IF v_coin_price IS NULL THEN
        RAISE EXCEPTION 'Chapter not found';
    END IF;

    -- Check if already unlocked
    SELECT EXISTS (
        SELECT 1 FROM public.user_unlocked_chapters WHERE user_id = v_user_id AND chapter_id = p_chapter_id
    ) INTO v_is_already_unlocked;

    IF v_is_already_unlocked THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already unlocked');
    END IF;

    -- Check user balance
    SELECT coins_balance INTO v_current_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
    IF v_current_balance < v_coin_price THEN
        RAISE EXCEPTION 'Insufficient coins. Required: %, Available: %', v_coin_price, v_current_balance;
    END IF;

    -- Deduct coins
    UPDATE public.profiles
    SET coins_balance = coins_balance - v_coin_price, updated_at = now()
    WHERE id = v_user_id;

    -- Insert unlock record
    INSERT INTO public.user_unlocked_chapters (user_id, chapter_id, coins_paid)
    VALUES (v_user_id, p_chapter_id, v_coin_price);

    -- Log transaction
    INSERT INTO public.coin_transactions (user_id, amount, transaction_type, reference_id)
    VALUES (v_user_id, -v_coin_price, 'chapter_unlock', p_chapter_id::text);

    RETURN jsonb_build_object(
        'success', true,
        'remaining_coins', v_current_balance - v_coin_price,
        'chapter_id', p_chapter_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Reward Ad Coins (+10 Coins per Ad)
CREATE OR REPLACE FUNCTION public.reward_ad_coins(p_ad_unit_id TEXT DEFAULT 'rewarded_ad')
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_reward_amount CONSTANT INTEGER := 10;
    v_new_balance INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Add coins
    UPDATE public.profiles
    SET coins_balance = coins_balance + v_reward_amount, updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    -- Log transaction
    INSERT INTO public.coin_transactions (user_id, amount, transaction_type, reference_id)
    VALUES (v_user_id, v_reward_amount, 'ad_reward', p_ad_unit_id);

    RETURN jsonb_build_object(
        'success', true,
        'added_coins', v_reward_amount,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novel_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_bibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin/super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles: Anyone can view usernames, only user can update own non-sensitive fields
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own username/avatar" ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents role escalation
    AND coins_balance = (SELECT coins_balance FROM public.profiles WHERE id = auth.uid()) -- Prevents direct coin cheating
);

-- Genres: Public can read, Admins can manage
CREATE POLICY "Genres are viewable by everyone" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Admins can manage genres" ON public.genres FOR ALL USING (public.is_admin());

-- Novels: Public can view published novels, Admins can view and manage all
CREATE POLICY "Published novels are viewable by everyone" ON public.novels FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can insert novels" ON public.novels FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update novels" ON public.novels FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete novels" ON public.novels FOR DELETE USING (public.is_admin());

-- Novel Genres: Public can view, Admins can manage
CREATE POLICY "Novel genres are viewable by everyone" ON public.novel_genres FOR SELECT USING (true);
CREATE POLICY "Admins can manage novel genres" ON public.novel_genres FOR ALL USING (public.is_admin());

-- Story Bibles: ONLY Admins can view and manage
CREATE POLICY "Admins can manage story bibles" ON public.story_bibles FOR ALL USING (public.is_admin());

-- Chapters: Public can read published non-premium or unlocked premium chapters
CREATE POLICY "Users can view published chapters" ON public.chapters FOR SELECT USING (
    (status = 'published' AND is_premium = false)
    OR (public.is_admin())
    OR (status = 'published' AND is_premium = true AND EXISTS (
        SELECT 1 FROM public.user_unlocked_chapters WHERE user_id = auth.uid() AND chapter_id = id
    ))
);
CREATE POLICY "Admins can manage chapters" ON public.chapters FOR ALL USING (public.is_admin());

-- Unlocked Chapters: User can only see their own unlocked chapters
CREATE POLICY "Users can view their unlocked chapters" ON public.user_unlocked_chapters FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Reading History: User can read and update their own reading progress
CREATE POLICY "Users can view own reading history" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading history" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading history" ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks: User can read, add, and remove their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.library_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own bookmarks" ON public.library_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.library_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Coin Transactions: User can view their own ledger history
CREATE POLICY "Users can view own coin transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- AI Generation Jobs: Only Admins can view and trigger jobs
CREATE POLICY "Admins can view and manage AI jobs" ON public.ai_generation_jobs FOR ALL USING (public.is_admin());
