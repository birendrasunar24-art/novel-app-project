class Chapter {
  final String id;
  final String novelId;
  final int chapterNumber;
  final String title;
  final String content;
  final int wordCount;
  final bool isPremium;
  final int coinPrice;
  bool isUnlocked;

  bool get isLocked => isPremium && !isUnlocked;

  Chapter({
    required this.id,
    required this.novelId,
    required this.chapterNumber,
    required this.title,
    required this.content,
    required this.wordCount,
    required this.isPremium,
    this.coinPrice = 20,
    this.isUnlocked = false,
  });

  factory Chapter.fromJson(Map<String, dynamic> json) {
    final bool isPrem = json['is_premium'] == true || (json['coin_price'] != null && json['coin_price'] > 0);
    return Chapter(
      id: json['id']?.toString() ?? '',
      novelId: json['novel_id']?.toString() ?? '',
      chapterNumber: json['chapter_number'] ?? 1,
      title: json['title'] ?? 'Chapter',
      content: json['content'] ?? 'No content available for this chapter.',
      wordCount: json['word_count'] ?? 1500,
      isPremium: isPrem,
      coinPrice: json['coin_price'] ?? (isPrem ? 20 : 0),
      isUnlocked: !isPrem,
    );
  }

  static List<Chapter> sampleChapters() {
    return [
      Chapter(
        id: 'ch-1',
        novelId: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
        chapterNumber: 1,
        title: 'The Broken Mirror',
        wordCount: 1850,
        isPremium: false,
        coinPrice: 0,
        isUnlocked: true,
        content: '''The cold monsoon rain poured relentless over the spires of the city. Aryan pulled his drenched coat tighter around his shoulders, his breath misting in the freezing dusk air.

He looked down at the broken fragment of obsidian mirror clenched in his bloodied palm. It hummed—faintly at first, then resonating with the cadence of an ancient heartbeat he had not felt in five hundred years.

"The seals are crumbling, Sovereign," a phantom whisper echoed inside his skull. "Your return was written in the blood of stars."

Aryan closed his eyes. In his previous life, he had commanded the legion of the Umbral Abyss before betrayal shattered his throne. Now, in this frail mortal shell in a noisy modern metropolis, the journey had to begin from scratch.''',
      ),
      Chapter(
        id: 'ch-2',
        novelId: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
        chapterNumber: 2,
        title: 'The First Breath',
        wordCount: 2100,
        isPremium: false,
        coinPrice: 0,
        isUnlocked: true,
        content: '''Sitting cross-legged on the concrete floor of his rundown apartment in Thamel, Aryan began the ancient breathing cycle of the Umbral Sutra.

With each breath, ambient cosmic ether filtered into his chest. It burned like liquid mercury. His modern mortal veins were clogged with mundane impurities, but sheer iron will forced the pathways open.

A crisp chime broke his trance. A dark purple wisp circled his fingertips, forming a delicate shadowy raven that vanished into his skin. The First Meridian Gate was unlocked.''',
      ),
      Chapter(
        id: 'ch-3',
        novelId: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
        chapterNumber: 3,
        title: 'City of Shadows',
        wordCount: 1980,
        isPremium: false,
        coinPrice: 0,
        isUnlocked: true,
        content: '''The alleys of Asan at night were a labyrinth of shadows and secrets. Aryan walked briskly, his newly heightened senses picking up the subtle magical signatures of city dwellers hiding among the ordinary crowd.

In the shadows behind an ancient stone shrine, two figures in silver-embroidered coats were watching him.

"He does not belong to any registered guild," one whispered into a communication rune.

Aryan didn't stop. A faint smile curled on his lips. "Let them watch. The prey always watches before it becomes dinner."''',
      ),
      Chapter(
        id: 'ch-4',
        novelId: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
        chapterNumber: 4,
        title: 'The Golden Seal',
        wordCount: 2450,
        isPremium: true,
        coinPrice: 20,
        isUnlocked: false,
        content: '''Inside the subterranean auction house beneath the old city, air was thick with the scent of incense and danger.

On the velvet pedestal sat an iron chest engraved with a glowing golden seal. Aryan's celestial core flared violently. It was the Ring of Ouroboros—an artifact from his past empire!

"Bidding begins at ten thousand astral crystals," the auctioneer declared.

Before the wealthy guild masters could raise their plaques, the ambient lights shattered into a thousand sparks. Darkness swallowed the hall. And within that darkness, Aryan was no longer a destitute mortal—he was the sovereign.''',
      ),
      Chapter(
        id: 'ch-5',
        novelId: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
        chapterNumber: 5,
        title: 'Whispers in the Abyss',
        wordCount: 2200,
        isPremium: true,
        coinPrice: 20,
        isUnlocked: false,
        content: '''The darkness thickened into razor-sharp tendrils. Screams echoed across the auction chamber as the celestial barrier hummed under pressure.

Aryan stood at the center of the storm, his shadow stretching across the grand ceiling like monstrous dragon wings.

"Did you truly think," his voice resonated with dual timbre, "that mere locks of iron could contain what once commanded the stars?"''',
      ),
    ];
  }
}
