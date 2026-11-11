import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/chapter.dart';
import '../core/constants.dart';

class WalletService extends ChangeNotifier {
  static const String _keyCoins = 'np_wallet_coins_v1';
  static const String _keyUnlockedChapters = 'np_unlocked_chapters_v1';
  static const String _keyAdProgress = 'np_ad_progress_v1';
  static const String _keyGoogleSignedIn = 'np_user_google_signed_in';
  static const String _keyUserName = 'np_user_name';
  static const String _keyUserEmail = 'np_user_email';
  static const String _keyReadChaptersCount = 'np_read_chapters_count';

  // Daily Streak & Reading Timer Keys
  static const String _keyLastStreakDate = 'np_last_streak_claim_date';
  static const String _keyDailyReadingSecs = 'np_daily_reading_seconds';
  static const String _keyLastReadingDate = 'np_last_reading_date';
  static const String _keyLastReadingBonusDate = 'np_last_reading_bonus_date';

  static const int guestStartingCoins = 50;
  static const int readingTargetSeconds = 900; // 15 minutes

  int _coins = guestStartingCoins;
  final Set<String> _unlockedChapterIds = {};
  final Map<String, int> _adProgressPerChapter = {};
  
  bool _isGoogleSignedIn = false;
  String _userName = 'Guest Reader';
  String _userEmail = 'guest@novelplatform.app';
  int _chaptersReadCount = 0;
  bool _isLoaded = false;

  // Streak & Reading States
  String _lastStreakClaimDate = '';
  int _dailyReadingSeconds = 0;
  String _lastReadingDate = '';
  String _lastReadingBonusClaimDate = '';

  int get coins => _coins;
  bool get isLoaded => _isLoaded;
  bool get isGoogleSignedIn => _isGoogleSignedIn;
  String get userName => _userName;
  String get userEmail => _userEmail;
  int get chaptersReadCount => _chaptersReadCount;
  int get dailyReadingSeconds => _dailyReadingSeconds;

  String _todayString() {
    final now = DateTime.now();
    return "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  }

  WalletService() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isGoogleSignedIn = prefs.getBool(_keyGoogleSignedIn) ?? false;
      
      if (_isGoogleSignedIn) {
        _coins = prefs.getInt(_keyCoins) ?? 100;
        _userName = prefs.getString(_keyUserName) ?? 'Reader';
        _userEmail = prefs.getString(_keyUserEmail) ?? 'user@novelplatform.app';
      } else {
        // Default Guest Condition: 50 Coins!
        _coins = prefs.getInt(_keyCoins) ?? guestStartingCoins;
        _userName = 'Guest Reader';
        _userEmail = 'guest@novelplatform.app';
      }
      
      final savedUnlocked = prefs.getStringList(_keyUnlockedChapters) ?? [];
      _unlockedChapterIds.addAll(savedUnlocked);

      final rawAdProgress = prefs.getString(_keyAdProgress);
      if (rawAdProgress != null) {
        final Map<String, dynamic> decoded = jsonDecode(rawAdProgress);
        decoded.forEach((key, value) {
          if (value is int) {
            _adProgressPerChapter[key] = value;
          }
        });
      }

      _chaptersReadCount = prefs.getInt(_keyReadChaptersCount) ?? 0;

      // Load Streak & Reading states
      _lastStreakClaimDate = prefs.getString(_keyLastStreakDate) ?? '';
      _lastReadingBonusClaimDate = prefs.getString(_keyLastReadingBonusDate) ?? '';
      _lastReadingDate = prefs.getString(_keyLastReadingDate) ?? '';

      final String today = _todayString();
      if (_lastReadingDate == today) {
        _dailyReadingSeconds = prefs.getInt(_keyDailyReadingSecs) ?? 0;
      } else {
        // New calendar day: reset daily reading timer
        _dailyReadingSeconds = 0;
        _lastReadingDate = today;
      }
      
      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading wallet storage: $e');
      _isLoaded = true;
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_keyCoins, _coins);
      await prefs.setStringList(_keyUnlockedChapters, _unlockedChapterIds.toList());
      await prefs.setString(_keyAdProgress, jsonEncode(_adProgressPerChapter));
      await prefs.setBool(_keyGoogleSignedIn, _isGoogleSignedIn);
      await prefs.setString(_keyUserName, _userName);
      await prefs.setString(_keyUserEmail, _userEmail);
      await prefs.setInt(_keyReadChaptersCount, _chaptersReadCount);
      await prefs.setString(_keyLastStreakDate, _lastStreakClaimDate);
      await prefs.setString(_keyLastReadingBonusDate, _lastReadingBonusClaimDate);
      await prefs.setString(_keyLastReadingDate, _lastReadingDate);
      await prefs.setInt(_keyDailyReadingSecs, _dailyReadingSeconds);
    } catch (e) {
      debugPrint('Error saving wallet storage: $e');
    }
  }

  // Daily Streak Validation (Strictly 1 Claim per Calendar Day)
  bool canClaimDailyStreak() {
    final String today = _todayString();
    return _lastStreakClaimDate != today;
  }

  bool isStreakClaimedToday() {
    final String today = _todayString();
    return _lastStreakClaimDate == today;
  }

  bool claimDailyStreak() {
    if (!canClaimDailyStreak()) return false;
    _lastStreakClaimDate = _todayString();
    addCoins(5);
    _saveToStorage();
    return true;
  }

  // Reading Timer Tracking & 15m Bonus
  void addReadingTime(int seconds) {
    final String today = _todayString();
    if (_lastReadingDate != today) {
      _dailyReadingSeconds = 0;
      _lastReadingDate = today;
    }
    _dailyReadingSeconds += seconds;
    notifyListeners();
    _saveToStorage();
  }

  bool canClaimReadingBonus() {
    final String today = _todayString();
    return _dailyReadingSeconds >= readingTargetSeconds && _lastReadingBonusClaimDate != today;
  }

  bool isReadingBonusClaimedToday() {
    final String today = _todayString();
    return _lastReadingBonusClaimDate == today;
  }

  bool claimReadingBonus() {
    if (!canClaimReadingBonus()) return false;
    _lastReadingBonusClaimDate = _todayString();
    addCoins(5);
    _saveToStorage();
    return true;
  }

  bool isChapterUnlocked(String chapterId, {bool defaultFree = false}) {
    if (defaultFree) return true;
    return _unlockedChapterIds.contains(chapterId);
  }

  int getAdProgressForChapter(String chapterId) {
    return _adProgressPerChapter[chapterId] ?? 0;
  }

  void addCoins(int amount) {
    _coins += amount;
    notifyListeners();
    _saveToStorage();
  }

  // Rewarded Video Ad watched -> +10 Coins
  void onRewardedAdWatched() {
    addCoins(AppConstants.rewardedAdCoinBonus);
  }

  // Unlock with 20 Coins
  bool unlockChapterWithCoins(Chapter chapter) {
    if (_coins >= chapter.coinPrice || isChapterUnlocked(chapter.id, defaultFree: !chapter.isLocked)) {
      if (!isChapterUnlocked(chapter.id)) {
        _coins -= chapter.coinPrice;
        _unlockedChapterIds.add(chapter.id);
      }
      chapter.isUnlocked = true;
      notifyListeners();
      _saveToStorage();
      return true;
    }
    return false;
  }

  // Watch 2 Ads directly to unlock chapter
  bool watchAdForChapter(Chapter chapter) {
    int current = _adProgressPerChapter[chapter.id] ?? 0;
    current += 1;
    _adProgressPerChapter[chapter.id] = current;

    if (current >= 2) {
      chapter.isUnlocked = true;
      _unlockedChapterIds.add(chapter.id);
      _adProgressPerChapter[chapter.id] = 2;
      notifyListeners();
      _saveToStorage();
      return true; // Successfully unlocked
    }

    notifyListeners();
    _saveToStorage();
    return false; // Still need 1 more ad
  }

  void incrementChaptersRead() {
    _chaptersReadCount += 1;
    notifyListeners();
    _saveToStorage();
  }

  // Google Sign-in
  Future<void> signInWithGoogle({String? customName, String? customEmail}) async {
    _isGoogleSignedIn = true;
    _userName = customName ?? 'Birendra Sunar';
    _userEmail = customEmail ?? 'birendrasunar24@gmail.com';
    // Bonus 50 Coins for linking Google Account!
    _coins += 50;
    notifyListeners();
    await _saveToStorage();
  }

  Future<void> signOut() async {
    _isGoogleSignedIn = false;
    _userName = 'Guest Reader';
    _userEmail = 'guest@novelplatform.app';
    _coins = guestStartingCoins; // Reset to default guest condition: 50 coins!
    _unlockedChapterIds.clear();
    _adProgressPerChapter.clear();
    notifyListeners();
    await _saveToStorage();
  }
}
