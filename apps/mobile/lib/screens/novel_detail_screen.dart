import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../models/novel.dart';
import '../models/chapter.dart';
import '../services/wallet_service.dart';
import '../services/bookmark_service.dart';
import '../services/novel_service.dart';
import 'reader_screen.dart';

class NovelDetailScreen extends StatefulWidget {
  final Novel novel;
  const NovelDetailScreen({super.key, required this.novel});

  @override
  State<NovelDetailScreen> createState() => _NovelDetailScreenState();
}

class _NovelDetailScreenState extends State<NovelDetailScreen> {
  List<Chapter> chapters = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLiveChapters();
  }

  Future<void> _loadLiveChapters() async {
    setState(() => isLoading = true);
    final novelService = Provider.of<NovelService>(context, listen: false);
    final liveChapters = await novelService.fetchChapters(widget.novel.id);
    if (mounted) {
      setState(() {
        chapters = liveChapters;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final wallet = Provider.of<WalletService>(context);
    final bookmarkService = Provider.of<BookmarkService>(context);
    final isBookmarked = bookmarkService.isBookmarked(widget.novel.id);

    return Scaffold(
      backgroundColor: AppConstants.background,
      appBar: AppBar(
        backgroundColor: AppConstants.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Novel Details', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          // BOOKMARK BUTTON
          IconButton(
            icon: Icon(
              isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
              color: isBookmarked ? AppConstants.amberGold : Colors.white70,
            ),
            tooltip: isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
            onPressed: () {
              bookmarkService.toggleBookmark(widget.novel);
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isBookmarked ? 'Removed from Library' : 'Added to Library 📚',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),

          // COIN PILL
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppConstants.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  children: [
                    const Text('🪙 ', style: TextStyle(fontSize: 11)),
                    Text('${wallet.coins}', style: const TextStyle(color: AppConstants.amberGold, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppConstants.primary,
        backgroundColor: AppConstants.surface,
        onRefresh: _loadLiveChapters,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Novel Hero Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppConstants.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(widget.novel.coverImageUrl, width: 90, height: 128, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppConstants.primary.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppConstants.primary.withOpacity(0.4)),
                                ),
                                child: Text(widget.novel.genre.toUpperCase(), style: const TextStyle(color: AppConstants.primary, fontSize: 9, fontWeight: FontWeight.bold)),
                              ),
                              const Spacer(),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: AppConstants.amberGold, size: 14),
                                  const SizedBox(width: 2),
                                  Text('${widget.novel.rating}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(widget.novel.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Text('By ${widget.novel.authorName} • ${chapters.length} Chapters', style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11)),
                          const SizedBox(height: 8),
                          Text(widget.novel.synopsis, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.3)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Chapters List Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Chapter List (${chapters.length})', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  const Text('Pull down to refresh ⚡', style: TextStyle(color: AppConstants.textSecondary, fontSize: 11)),
                ],
              ),
              const SizedBox(height: 12),

              if (isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(color: AppConstants.primary),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: chapters.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, index) {
                    final ch = chapters[index];
                    return _buildChapterCard(context, ch, wallet);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChapterCard(BuildContext context, Chapter ch, WalletService wallet) {
    // Check persistent storage or default free
    final isPersistentlyUnlocked = wallet.isChapterUnlocked(ch.id, defaultFree: !ch.isLocked);
    if (isPersistentlyUnlocked) {
      ch.isUnlocked = true;
    }
    final isUnlocked = ch.isUnlocked;
    final adProgress = wallet.getAdProgressForChapter(ch.id);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppConstants.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUnlocked ? Colors.white10 : AppConstants.amberGold.withOpacity(0.35),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    isUnlocked ? '📖' : '🔒',
                    style: TextStyle(fontSize: 15, color: isUnlocked ? AppConstants.emeraldGreen : AppConstants.amberGold),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ch. ${ch.chapterNumber}: ${ch.title}',
                        style: TextStyle(
                          color: isUnlocked ? Colors.white : AppConstants.amberGold,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      Text('${ch.wordCount} words • ${isUnlocked ? 'Available' : '20 Coins or 2 Ads'}', style: const TextStyle(color: AppConstants.textSecondary, fontSize: 10)),
                    ],
                  ),
                ],
              ),

              // Access Badge or Read Action
              if (isUnlocked)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ch.isPremium ? AppConstants.emeraldGreen : AppConstants.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    minimumSize: Size.zero,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    wallet.incrementChaptersRead();
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ReaderScreen(chapter: ch, novel: widget.novel),
                      ),
                    );
                  },
                  child: Text(ch.isPremium ? 'Read (Unlocked)' : 'Read Free', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                ),
            ],
          ),

          // Paywall & Dual Unlock Action Buttons (If Locked)
          if (!isUnlocked) ...[
            const SizedBox(height: 10),
            const Divider(color: Colors.white10),
            const SizedBox(height: 8),
            Row(
              children: [
                // Option A: Unlock with 20 Coins
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.amberGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      if (wallet.coins >= ch.coinPrice) {
                        final ok = wallet.unlockChapterWithCoins(ch);
                        if (ok) {
                          setState(() {});
                          ScaffoldMessenger.of(context).hideCurrentSnackBar();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Row(
                                children: [
                                  Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                                  SizedBox(width: 8),
                                  Expanded(child: Text('🎉 Chapter unlocked successfully for 20 Coins!')),
                                ],
                              ),
                              backgroundColor: AppConstants.emeraldGreen,
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      } else {
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Insufficient Coins! You need ${ch.coinPrice} Coins. Watch ads below to earn more!'),
                            backgroundColor: Colors.redAccent,
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    },
                    child: Text('🪙 Unlock (${ch.coinPrice} Coins)', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 8),

                // Option B: Watch 2 Ads directly
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppConstants.primary, width: 1.2),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      final unlocked = wallet.watchAdForChapter(ch);
                      setState(() {});
                      ScaffoldMessenger.of(context).hideCurrentSnackBar();
                      if (unlocked) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Row(
                              children: [
                                Icon(Icons.lock_open_rounded, color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Expanded(child: Text('🎉 Congratulations! 2 Ads watched. Chapter is permanently unlocked!')),
                              ],
                            ),
                            backgroundColor: AppConstants.emeraldGreen,
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Row(
                              children: [
                                Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Expanded(child: Text('1/2 Ad Watched! Watch 1 more ad to unlock.')),
                              ],
                            ),
                            backgroundColor: AppConstants.primary,
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    },
                    child: Text(
                      '🎬 Watch Ad ($adProgress/2)',
                      style: const TextStyle(fontSize: 11, color: AppConstants.primary, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
