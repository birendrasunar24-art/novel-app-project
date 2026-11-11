import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../models/novel.dart';
import '../services/bookmark_service.dart';
import 'novel_detail_screen.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bookmarkService = Provider.of<BookmarkService>(context);
    final bookmarkedNovels = bookmarkService.bookmarkedNovels;

    return Scaffold(
      backgroundColor: AppConstants.background,
      appBar: AppBar(
        backgroundColor: AppConstants.background,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.bookmark_added_rounded, color: AppConstants.primary, size: 22),
            SizedBox(width: 8),
            Text(
              'My Library',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppConstants.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                const Icon(Icons.menu_book_rounded, size: 14, color: AppConstants.amberGold),
                const SizedBox(width: 4),
                Text(
                  '${bookmarkedNovels.length} Saved',
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
      body: bookmarkedNovels.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppConstants.surface,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white12),
                      ),
                      child: const Icon(Icons.bookmark_outline_rounded, size: 40, color: AppConstants.textSecondary),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Your Library is Empty',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Bookmark your favorite webnovels from the Home screen to read them anytime.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppConstants.textSecondary, fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bookmarkedNovels.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (ctx, index) {
                final novel = bookmarkedNovels[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      ctx,
                      MaterialPageRoute(builder: (_) => NovelDetailScreen(novel: novel)),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppConstants.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Cover Thumbnail
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            novel.coverImageUrl,
                            width: 68,
                            height: 96,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 68,
                              height: 96,
                              color: AppConstants.surfaceLight,
                              child: const Icon(Icons.book, color: Colors.white24),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        // Details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppConstants.primary.withOpacity(0.18),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      novel.genre.toUpperCase(),
                                      style: const TextStyle(color: AppConstants.primary, fontSize: 9, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const Spacer(),
                                  IconButton(
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                    icon: const Icon(Icons.bookmark_rounded, color: AppConstants.amberGold, size: 20),
                                    onPressed: () {
                                      bookmarkService.toggleBookmark(novel);
                                      ScaffoldMessenger.of(ctx).showSnackBar(
                                        SnackBar(
                                          content: Text('Removed "${novel.title}" from Library'),
                                          duration: const Duration(seconds: 2),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                novel.title,
                                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'By ${novel.authorName} • ${novel.totalChapters} Chapters',
                                style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: AppConstants.amberGold, size: 14),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${novel.rating}',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppConstants.primary,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'Continue Reading',
                                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
