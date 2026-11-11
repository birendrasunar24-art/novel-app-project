import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../models/novel.dart';
import '../services/wallet_service.dart';
import '../services/novel_service.dart';
import 'novel_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _showNotificationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppConstants.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Colors.white12)),
        title: const Row(
          children: [
            Icon(Icons.notifications_active_rounded, color: AppConstants.primary, size: 22),
            SizedBox(width: 8),
            Text('Notifications', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildNotificationItem(
              '🔥 Realtime Supabase Connected',
              'All novels and chapters are synced live from the Admin Dashboard.',
              'Just now',
            ),
            const SizedBox(height: 12),
            _buildNotificationItem(
              '🪙 Daily Bonus Ready',
              'Check in today at the Rewards center to claim your daily streak coins.',
              '1 hour ago',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: AppConstants.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  static Widget _buildNotificationItem(String title, String body, String time) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppConstants.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text(time, style: const TextStyle(color: AppConstants.textSecondary, fontSize: 9)),
            ],
          ),
          const SizedBox(height: 4),
          Text(body, style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.3)),
        ],
      ),
    );
  }

  void _showCoinRewardSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppConstants.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        final wallet = Provider.of<WalletService>(ctx);
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Earn Free Coins 🪙',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              const Text(
                '1 Ad = 10 Coins • 2 Ads = 1 Locked Chapter',
                style: TextStyle(fontSize: 12, color: AppConstants.textSecondary),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppConstants.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text('🎬', style: TextStyle(fontSize: 24)),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Watch 30s Video Ad', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                            Text('+10 Coins Instant Reward', style: TextStyle(color: AppConstants.amberGold, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.amberGold,
                        foregroundColor: Colors.black,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        wallet.onRewardedAdWatched();
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Row(
                              children: [
                                Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                                SizedBox(width: 10),
                                Expanded(child: Text('🎉 Awesome! +10 Coins added from Reward Ad!')),
                              ],
                            ),
                            backgroundColor: AppConstants.emeraldGreen,
                            behavior: SnackBarBehavior.floating,
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      child: const Text('Watch (+10)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final wallet = Provider.of<WalletService>(context);
    final novelService = Provider.of<NovelService>(context);

    final trendingNovel = novelService.novels.isNotEmpty ? novelService.novels.first : null;
    final filteredNovels = novelService.filteredNovels;

    return Scaffold(
      backgroundColor: AppConstants.background,
      appBar: AppBar(
        backgroundColor: AppConstants.background,
        elevation: 0,
        title: Row(
          children: [
            // BRAND LOGO
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF6366F1), Color(0xFFEC4899)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF8B5CF6).withOpacity(0.4),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: const Center(
                child: Icon(Icons.auto_stories_rounded, color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('NovelPlatform', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('AI Webnovels', style: TextStyle(fontSize: 9, color: AppConstants.textSecondary)),
              ],
            ),
          ],
        ),
        actions: [
          // NOTIFICATION BELL
          IconButton(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 22),
                Positioned(
                  top: -1,
                  right: -1,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppConstants.amberGold,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () => _showNotificationDialog(context),
          ),

          // COIN PILL
          Padding(
            padding: const EdgeInsets.only(right: 14.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppConstants.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                children: [
                  const Text('🪙 ', style: TextStyle(fontSize: 12)),
                  Text(
                    '${wallet.coins}',
                    style: const TextStyle(color: AppConstants.amberGold, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  const SizedBox(width: 6),
                  InkWell(
                    onTap: () => _showCoinRewardSheet(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppConstants.amberGold, Colors.amber]),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Text('+10', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.black)),
                          SizedBox(width: 2),
                          Text('🎁', style: TextStyle(fontSize: 8)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppConstants.primary,
        backgroundColor: AppConstants.surface,
        onRefresh: () async {
          await novelService.fetchNovels();
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.sync_rounded, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Library synced live with Supabase Cloud!'),
                ],
              ),
              backgroundColor: AppConstants.emeraldGreen,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 2),
            ),
          );
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Trending Hero Banner (Rendered only if novels exist)
              if (trendingNovel != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => NovelDetailScreen(novel: trendingNovel)),
                      );
                    },
                    child: Container(
                      height: 190,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        image: DecorationImage(
                          image: NetworkImage(trendingNovel.coverImageUrl),
                          fit: BoxFit.cover,
                        ),
                        boxShadow: [
                          BoxShadow(color: AppConstants.primary.withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: Stack(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Colors.transparent, AppConstants.background.withOpacity(0.9)],
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 16,
                            left: 16,
                            right: 16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppConstants.primary,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text('🔥 #1 TRENDING', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  trendingNovel.title,
                                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${trendingNovel.genre} • ${trendingNovel.totalChapters} Chapters • ⭐ ${trendingNovel.rating}',
                                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppConstants.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: const Column(
                      children: [
                        Icon(Icons.auto_stories_outlined, color: Colors.white38, size: 44),
                        SizedBox(height: 10),
                        Text('No Novels Published Yet', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text(
                          'Content removed from Admin Studio.\nCreate a new novel in Admin to see it appear here live!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppConstants.textSecondary, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 20),

              // 2. Categories Horizontal Bar (Active & Selectable)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: [
                    const Text('Categories', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    const Spacer(),
                    if (novelService.isLoading)
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.primary),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    _buildCategoryPill(context, 'All', novelService),
                    _buildCategoryPill(context, 'Fantasy', novelService),
                    _buildCategoryPill(context, 'Sci-Fi', novelService),
                    _buildCategoryPill(context, 'Cultivation', novelService),
                    _buildCategoryPill(context, 'Romance', novelService),
                    _buildCategoryPill(context, 'Mystery', novelService),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 3. Live Novels Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: [
                    Text(
                      novelService.selectedCategory == 'All' ? 'Popular AI Novels' : '${novelService.selectedCategory} Novels',
                      style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppConstants.surfaceLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${filteredNovels.length}',
                        style: const TextStyle(color: AppConstants.primary, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              if (filteredNovels.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      children: [
                        const Icon(Icons.menu_book_rounded, color: AppConstants.textSecondary, size: 36),
                        const SizedBox(height: 8),
                        Text(
                          'No novels in "${novelService.selectedCategory}" yet.',
                          style: const TextStyle(color: AppConstants.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                    itemCount: filteredNovels.length,
                    itemBuilder: (ctx, idx) {
                      final n = filteredNovels[idx];
                      return _buildNovelCard(context, n);
                    },
                  ),
                ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryPill(BuildContext context, String title, NovelService novelService) {
    final isSelected = novelService.selectedCategory == title;
    return GestureDetector(
      onTap: () {
        novelService.setSelectedCategory(title);
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppConstants.primary : AppConstants.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppConstants.primary : Colors.white10),
          boxShadow: isSelected
              ? [
                  BoxShadow(color: AppConstants.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2)),
                ]
              : null,
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : AppConstants.textSecondary,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildNovelCard(BuildContext context, Novel novel) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => NovelDetailScreen(novel: novel)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppConstants.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  novel.coverImageUrl,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: AppConstants.surfaceLight,
                    child: const Center(child: Icon(Icons.book, color: Colors.white24)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              novel.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
            const SizedBox(height: 2),
            Text(
              '${novel.genre} • ${novel.totalChapters} Ch',
              style: const TextStyle(color: AppConstants.textSecondary, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }
}
