import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/novel.dart';

class BookmarkService extends ChangeNotifier {
  static const String _keyBookmarks = 'np_bookmarked_novels_v1';
  final Set<String> _bookmarkedIds = {};
  final List<Novel> _savedNovels = [];
  bool _isLoaded = false;

  bool get isLoaded => _isLoaded;
  List<Novel> get bookmarkedNovels => List.unmodifiable(_savedNovels);
  int get count => _savedNovels.length;

  BookmarkService() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_keyBookmarks) ?? [];
      _bookmarkedIds.addAll(list);

      // Seed with sample if first run
      if (_bookmarkedIds.isEmpty) {
        final sample = Novel.sample();
        _bookmarkedIds.add(sample.id);
        _savedNovels.add(sample);
      } else {
        // Reconstruct from sample & known novels
        final sample = Novel.sample();
        if (_bookmarkedIds.contains(sample.id)) {
          _savedNovels.add(sample);
        }
      }
      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading bookmarks: $e');
      _isLoaded = true;
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_keyBookmarks, _bookmarkedIds.toList());
    } catch (e) {
      debugPrint('Error saving bookmarks: $e');
    }
  }

  bool isBookmarked(String novelId) {
    return _bookmarkedIds.contains(novelId);
  }

  void toggleBookmark(Novel novel) {
    if (_bookmarkedIds.contains(novel.id)) {
      _bookmarkedIds.remove(novel.id);
      _savedNovels.removeWhere((n) => n.id == novel.id);
    } else {
      _bookmarkedIds.add(novel.id);
      if (!_savedNovels.any((n) => n.id == novel.id)) {
        _savedNovels.insert(0, novel);
      }
    }
    notifyListeners();
    _saveToStorage();
  }
}
