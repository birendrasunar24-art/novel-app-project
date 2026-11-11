class Novel {
  final String id;
  final String title;
  final String slug;
  final String synopsis;
  final String coverImageUrl;
  final String authorName;
  final String genre;
  final int totalViews;
  final double rating;
  final int totalChapters;

  Novel({
    required this.id,
    required this.title,
    required this.slug,
    required this.synopsis,
    required this.coverImageUrl,
    required this.authorName,
    required this.genre,
    required this.totalViews,
    required this.rating,
    required this.totalChapters,
  });

  factory Novel.fromJson(Map<String, dynamic> json) {
    return Novel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Untitled Novel',
      slug: json['slug'] ?? 'untitled',
      synopsis: json['synopsis'] ?? 'No synopsis available.',
      coverImageUrl: (json['cover_image_url'] != null && json['cover_image_url'].toString().isNotEmpty)
          ? json['cover_image_url'].toString()
          : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      authorName: json['author_name'] ?? 'AI Storyteller',
      genre: json['genre'] ?? 
          ((json['novel_genres'] is List && (json['novel_genres'] as List).isNotEmpty)
              ? json['novel_genres'][0]['genres']?['name']
              : null) ?? 'Fantasy',
      totalViews: json['total_views'] ?? 1420,
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.9,
      totalChapters: json['total_chapters'] ?? 45,
    );
  }

  factory Novel.sample() {
    return Novel(
      id: 'abcc9b8f-fcb6-43f0-a401-38d1c3770713',
      title: "Shadow Lord's Awakening",
      slug: 'shadow-lords-awakening',
      synopsis: 'A fallen cultivator of the Astral Realm reincarnates in modern Kathmandu. With celestial memories intact but mortal meridians sealed, Aryan must awaken his legendary shadow domain.',
      coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      authorName: 'AI Storyteller',
      genre: 'Fantasy',
      totalViews: 1420,
      rating: 4.9,
      totalChapters: 45,
    );
  }
}
