import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdService extends ChangeNotifier {
  static final AdService instance = AdService._internal();
  AdService._internal();

  factory AdService() => instance;

  RewardedAd? _rewardedAd;
  bool _isAdLoading = false;
  bool _isAdReady = false;

  bool get isAdLoading => _isAdLoading;
  bool get isAdReady => _isAdReady;

  // Google AdMob Official Test Rewarded Ad Unit ID
  static const String rewardedAdUnitId = 'ca-app-pub-3940256099942544/5224354917';

  Future<void> initialize() async {
    try {
      await MobileAds.instance.initialize();
      loadRewardedAd();
    } catch (e) {
      debugPrint('AdMob init error: $e');
    }
  }

  void loadRewardedAd() {
    if (_isAdLoading || _isAdReady) return;
    _isAdLoading = true;

    RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (RewardedAd ad) {
          debugPrint('Google Rewarded Ad loaded successfully!');
          _rewardedAd = ad;
          _isAdReady = true;
          _isAdLoading = false;
          notifyListeners();

          _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (RewardedAd ad) {
              ad.dispose();
              _rewardedAd = null;
              _isAdReady = false;
              notifyListeners();
              loadRewardedAd(); // Pre-load next ad
            },
            onAdFailedToShowFullScreenContent: (RewardedAd ad, AdError error) {
              debugPrint('Rewarded ad failed to show: $error');
              ad.dispose();
              _rewardedAd = null;
              _isAdReady = false;
              notifyListeners();
              loadRewardedAd();
            },
          );
        },
        onAdFailedToLoad: (LoadAdError error) {
          debugPrint('Rewarded ad failed to load: $error');
          _rewardedAd = null;
          _isAdReady = false;
          _isAdLoading = false;
          notifyListeners();
        },
      ),
    );
  }

  void showRewardedAd({
    required Function(int amount) onUserEarnedReward,
    required VoidCallback onAdUnavailable,
  }) {
    if (_rewardedAd != null && _isAdReady) {
      _rewardedAd!.show(
        onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
          debugPrint('User earned reward from real Google Test Ad: ${reward.amount}');
          onUserEarnedReward(reward.amount.toInt() > 0 ? reward.amount.toInt() : 10);
        },
      );
      _rewardedAd = null;
      _isAdReady = false;
      notifyListeners();
    } else {
      // If ad is not loaded yet, try loading one
      loadRewardedAd();
      onAdUnavailable();
    }
  }
}
