-- ==============================================================================
-- NovelPlatform: Seed Data (Initial Genres & Sample AI Novel)
-- ==============================================================================

-- 1. Insert Initial Genres
INSERT INTO public.genres (name, slug, description)
VALUES 
    ('Fantasy', 'fantasy', 'Magic, mythical beasts, ancient realms and celestial powers.'),
    ('Sci-Fi', 'sci-fi', 'Futuristic cyberpunk, advanced AI, space odysseys, and technology.'),
    ('Cultivation', 'cultivation', 'Eastern martial arts, immortality progression, and daoist secrets.'),
    ('Romance', 'romance', 'Emotional bonds, heartwarming relationships, and dramatic love stories.'),
    ('Mystery & Thriller', 'mystery-thriller', 'Suspenseful investigations, dark secrets, and gripping twists.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Sample AI Novel
DO $$
DECLARE
    v_novel_id UUID := gen_random_uuid();
    v_fantasy_id BIGINT;
    v_cultivation_id BIGINT;
BEGIN
    SELECT id INTO v_fantasy_id FROM public.genres WHERE slug = 'fantasy';
    SELECT id INTO v_cultivation_id FROM public.genres WHERE slug = 'cultivation';

    -- Insert Novel
    INSERT INTO public.novels (id, title, slug, synopsis, cover_image_url, author_name, status, is_published, total_views, total_likes)
    VALUES (
        v_novel_id,
        'Shadow Lord''s Awakening',
        'shadow-lords-awakening',
        'A fallen sovereign of the Astral Realm reincarnates in modern Kathmandu. With his ancient memories intact but his celestial meridians sealed, Aryan must climb through the hidden underworld of mystic guilds and awaken his legendary shadow domain.',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        'AI Storyteller',
        'ongoing',
        true,
        1420,
        389
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Link Genres
    IF v_fantasy_id IS NOT NULL THEN
        INSERT INTO public.novel_genres (novel_id, genre_id) VALUES (v_novel_id, v_fantasy_id) ON CONFLICT DO NOTHING;
    END IF;
    IF v_cultivation_id IS NOT NULL THEN
        INSERT INTO public.novel_genres (novel_id, genre_id) VALUES (v_novel_id, v_cultivation_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Insert Story Bible
    INSERT INTO public.story_bibles (novel_id, world_setting, characters, plot_outline, writing_style)
    VALUES (
        v_novel_id,
        '{"era": "Modern Urban Fantasy", "location": "Kathmandu & Astral Mirror Realm", "magic_system": "Shadow Cultivation with 9 Meridian Gates"}'::jsonb,
        '[{"name": "Aryan Thapa", "role": "Protagonist", "identity": "Reincarnated Shadow Sovereign", "traits": "Calculative, calm, fiercely protective"}, {"name": "Tara Sen", "role": "Deuteragonist", "identity": "Guild Master of Silver Dawn", "traits": "Sharp, insightful"}]'::jsonb,
        '[{"arc": 1, "title": "Awakening & The First Gate", "chapters": "1-10"}, {"arc": 2, "title": "The Underground Tournament", "chapters": "11-25"}]'::jsonb,
        '{"tone": "Gripping, mysterious, paced action", "perspective": "Third Person Limited"}'::jsonb
    )
    ON CONFLICT (novel_id) DO NOTHING;

    -- Insert Chapters
    -- Chapter 1 (FREE)
    INSERT INTO public.chapters (novel_id, chapter_number, title, content, word_count, is_premium, coin_price, status, published_at)
    VALUES (
        v_novel_id,
        1,
        'The Broken Mirror',
        'The cold monsoon rain poured relentless over the spires of the city. Aryan pulled his drenched coat tighter around his shoulders, his breath misting in the freezing dusk air.

He looked down at the broken fragment of obsidian mirror clenched in his bloodied palm. It hummed—faintly at first, then resonating with the cadence of an ancient heartbeat he had not felt in five hundred years.

"The seals are crumbling, Sovereign," a phantom whisper echoed inside his skull. "Your return was written in the blood of stars."

Aryan closed his eyes. In his previous life, he had commanded the legion of the Umbral Abyss before betrayal shattered his throne. Now, in this frail mortal shell in a noisy modern metropolis, the journey had to begin from scratch.',
        1850,
        false,
        0,
        'published',
        now()
    )
    ON CONFLICT (novel_id, chapter_number) DO NOTHING;

    -- Chapter 2 (FREE)
    INSERT INTO public.chapters (novel_id, chapter_number, title, content, word_count, is_premium, coin_price, status, published_at)
    VALUES (
        v_novel_id,
        2,
        'The First Breath',
        'Sitting cross-legged on the concrete floor of his rundown apartment in Thamel, Aryan began the ancient breathing cycle of the Umbral Sutra.

With each breath, ambient cosmic ether filtered into his chest. It burned like liquid mercury. His modern mortal veins were clogged with mundane impurities, but sheer iron will forced the pathways open.

A crisp chime broke his trance. A dark purple wisp circled his fingertips, forming a delicate shadowy raven that vanished into his skin. The First Meridian Gate was unlocked.',
        2100,
        false,
        0,
        'published',
        now()
    )
    ON CONFLICT (novel_id, chapter_number) DO NOTHING;

    -- Chapter 3 (FREE)
    INSERT INTO public.chapters (novel_id, chapter_number, title, content, word_count, is_premium, coin_price, status, published_at)
    VALUES (
        v_novel_id,
        3,
        'City of Shadows',
        'The alleys of Asan at night were a labyrinth of shadows and secrets. Aryan walked briskly, his newly heightened senses picking up the subtle magical signatures of city dwellers hiding among the ordinary crowd.

In the shadows behind an ancient stone shrine, two figures in silver-embroidered coats were watching him.

"He does not belong to any registered guild," one whispered into a communication rune.

Aryan didn''t stop. A faint smile curled on his lips. "Let them watch. The prey always watches before it becomes dinner."',
        1980,
        false,
        0,
        'published',
        now()
    )
    ON CONFLICT (novel_id, chapter_number) DO NOTHING;

    -- Chapter 4 (PREMIUM - 20 COINS / 2 ADS)
    INSERT INTO public.chapters (novel_id, chapter_number, title, content, word_count, is_premium, coin_price, status, published_at)
    VALUES (
        v_novel_id,
        4,
        'The Golden Seal',
        'Inside the subterranean auction house beneath the old city, air was thick with the scent of incense and danger.

On the velvet pedestal sat an iron chest engraved with a glowing golden seal. Aryan''s celestial core flared violently. It was the Ring of Ouroboros—an artifact from his past empire!

"Bidding begins at ten thousand astral crystals," the auctioneer declared.

Before the wealthy guild masters could raise their plaques, the ambient lights shattered into a thousand sparks. Darkness swallowed the hall. And within that darkness, Aryan was no longer a destitute mortal—he was the sovereign.',
        2450,
        true,
        20,
        'published',
        now()
    )
    ON CONFLICT (novel_id, chapter_number) DO NOTHING;

END $$;
