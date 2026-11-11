import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../services/wallet_service.dart';
import '../services/auth_service.dart';
import '../services/ad_service.dart';
import 'profile_screen.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  void _showFloatingMessage(BuildContext context, String message, {Color color = AppConstants.emeraldGreen, IconData icon = Icons.check_circle_rounded}) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _requireSignIn(BuildContext context, {String reason = 'Please sign in first to claim daily bonuses!'}) {
    _showFloatingMessage(
      context,
      reason,
      color: Colors.amber.shade900,
      icon: Icons.lock_outline_rounded,
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppConstants.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => const AuthModalWidget(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wallet = Provider.of<WalletService>(context);
    final auth = Provider.of<AuthService>(context);
    final adService = Provider.of<AdService>(context, listen: false);

    final bool isSignedIn = auth.isAuthenticated;

    return Scaffold(
      backgroundColor: AppConstants.background,
      appBar: AppBar(
        backgroundColor: AppConstants.background,
        elevation: 0,
        title: const Text('Rewards Center', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Coin Balance Showcase Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppConstants.surface, AppConstants.surfaceLight.withOpacity(0.6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppConstants.amberGold.withOpacity(0.35)),
              ),
              child: Column(
                children: [
                  const Text('YOUR COIN BALANCE', style: TextStyle(color: AppConstants.textSecondary, fontSize: 11, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('🪙 ', style: TextStyle(fontSize: 34)),
                      Text(
                        '${wallet.coins}',
                        style: const TextStyle(color: AppConstants.amberGold, fontSize: 38, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(width: 8),
                      const Text('Coins', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppConstants.emeraldGreen.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppConstants.emeraldGreen.withOpacity(0.4)),
                    ),
                    child: Text(
                      isSignedIn 
                        ? '⚡ Signed in as ${auth.email} • Cloud Sync Active'
                        : '🎁 Guest Reader: 50 Starting Coins • Sign Up to Claim Permanently',
                      style: TextStyle(
                        color: isSignedIn ? AppConstants.emeraldGreen : AppConstants.amberGold, 
                        fontSize: 11, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Tasks List Header
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Available Reward Tasks',
                style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 14),

            // Task 0: Sign-Up to Claim +50 Bonus & Save
            _buildTaskCard(
              icon: '🎁',
              title: isSignedIn ? 'Account Synced' : 'Sign Up to Claim (+50)',
              subtitle: isSignedIn 
                  ? 'Cloud sync active (${auth.email})' 
                  : 'Claim +50 Coins & save all progress',
              reward: isSignedIn ? 'Claimed ✅' : '+50 🪙',
              btnText: isSignedIn ? 'Synced' : 'Claim (+50)',
              btnColor: isSignedIn ? AppConstants.surfaceLight : Colors.white,
              textColor: isSignedIn ? Colors.white60 : Colors.black87,
              onTap: () {
                if (isSignedIn) {
                  _showFloatingMessage(context, 'Account is already connected and syncing to cloud!', color: AppConstants.primary, icon: Icons.cloud_done_rounded);
                } else {
                  _requireSignIn(context, reason: 'Sign up to claim +50 Bonus Coins & save balance to cloud!');
                }
              },
            ),

            const SizedBox(height: 12),

            // Task 1: Watch Short Video Ad (Guests CAN watch and earn!)
            _buildTaskCard(
              icon: '🎬',
              title: 'Watch Short Video Ad',
              subtitle: 'Google AdMob Test Video • Earn +10 Coins',
              reward: '+10 🪙',
              btnText: 'Watch (+10)',
              btnColor: AppConstants.amberGold,
              textColor: Colors.black,
              onTap: () {
                _showFloatingMessage(context, 'Loading Google Test Video Ad...', color: AppConstants.primary, icon: Icons.play_circle_outline_rounded);

                adService.showRewardedAd(
                  onUserEarnedReward: (amount) {
                    wallet.addCoins(amount);
                    _showFloatingMessage(
                      context, 
                      isSignedIn 
                        ? '🎉 Awesome! +$amount Coins earned from Video Ad!' 
                        : '🎉 +$amount Coins earned! Sign up anytime to save permanently!',
                    );
                  },
                  onAdUnavailable: () {
                    // Fallback so user always earns reward smoothly
                    wallet.onRewardedAdWatched();
                    _showFloatingMessage(
                      context, 
                      isSignedIn 
                        ? '🎉 +10 Coins added from Reward Ad!' 
                        : '🎉 +10 Coins added! Sign up anytime to save permanently!',
                    );
                  },
                );
              },
            ),

            const SizedBox(height: 12),

            // Task 2: Daily Check-in (+5 Coins) - Strictly Once Per Calendar Day
            _buildTaskCard(
              icon: '📅',
              title: 'Daily Streak Bonus',
              subtitle: wallet.isStreakClaimedToday()
                  ? 'Claimed today ✓ Come back tomorrow!'
                  : 'Check in every day to claim bonus rewards',
              reward: wallet.isStreakClaimedToday() ? 'Claimed ✓' : '+5 🪙',
              btnText: wallet.isStreakClaimedToday() ? 'Claimed' : 'Claim (+5)',
              btnColor: wallet.isStreakClaimedToday() ? AppConstants.surfaceLight : AppConstants.primary,
              textColor: wallet.isStreakClaimedToday() ? Colors.white38 : Colors.white,
              onTap: () {
                if (wallet.isStreakClaimedToday()) {
                  _showFloatingMessage(
                    context, 
                    'You already claimed today\'s Daily Streak bonus! Come back tomorrow.',
                    color: AppConstants.primary,
                    icon: Icons.event_available_rounded,
                  );
                  return;
                }
                if (!isSignedIn) {
                  _requireSignIn(context, reason: 'Sign in to claim daily streak bonuses & sync to cloud!');
                  return;
                }
                final claimed = wallet.claimDailyStreak();
                if (claimed) {
                  _showFloatingMessage(context, '🎉 Daily Check-in complete! +5 Coins claimed!');
                }
              },
            ),

            const SizedBox(height: 12),

            // Task 3: Read 15 mins (+5 Coins with Screen-time Validation)
            Builder(
              builder: (ctx) {
                final int readMins = (wallet.dailyReadingSeconds / 60).floor();
                final bool isClaimed = wallet.isReadingBonusClaimedToday();
                final bool canClaim = wallet.canClaimReadingBonus();

                String sub = '$readMins/15 mins read today (${15 - readMins > 0 ? 15 - readMins : 0}m left)';
                String bText = 'Read (${15 - readMins > 0 ? 15 - readMins : 0}m)';
                Color bColor = AppConstants.surfaceLight;
                Color tColor = Colors.white70;

                if (isClaimed) {
                  sub = '15/15 mins completed • Claimed today ✓';
                  bText = 'Claimed';
                  bColor = AppConstants.surfaceLight;
                  tColor = Colors.white38;
                } else if (canClaim) {
                  sub = '🎉 15/15 mins completed! Ready to claim';
                  bText = 'Claim (+5)';
                  bColor = AppConstants.emeraldGreen;
                  tColor = Colors.white;
                }

                return _buildTaskCard(
                  icon: '📖',
                  title: 'Read for 15 Minutes',
                  subtitle: sub,
                  reward: isClaimed ? 'Claimed ✓' : '+5 🪙',
                  btnText: bText,
                  btnColor: bColor,
                  textColor: tColor,
                  onTap: () {
                    if (isClaimed) {
                      _showFloatingMessage(
                        context, 
                        '15-minute reading bonus already claimed today! Read more tomorrow.',
                        color: AppConstants.primary,
                        icon: Icons.check_circle_outline,
                      );
                      return;
                    }
                    if (canClaim) {
                      final success = wallet.claimReadingBonus();
                      if (success) {
                        _showFloatingMessage(context, '🎉 Awesome! +5 Coins claimed for 15 minutes of reading!');
                      }
                      return;
                    }
                    _showFloatingMessage(
                      context, 
                      'Read any novel in the app for 15 mins to unlock! Current progress: $readMins/15 mins.',
                      color: AppConstants.primary,
                      icon: Icons.menu_book_rounded,
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // Fixed _buildTaskCard with Expanded to prevent any RenderFlex overflow
  Widget _buildTaskCard({
    required String icon,
    required String title,
    required String subtitle,
    required String reward,
    required String btnText,
    required Color btnColor,
    required Color textColor,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppConstants.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title, 
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle, 
                  style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: btnColor,
              foregroundColor: textColor,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: onTap,
            child: Text(btnText, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
