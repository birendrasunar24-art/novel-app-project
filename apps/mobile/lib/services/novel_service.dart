import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/novel.dart';
import '../models/chapter.dart';

class NovelService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  List<Novel> _novels = [];
  bool _isLoading = false;
  String _selectedCategory = 'All';
  String? _errorMessage;

  List<Novel> get novels => _novels;
  bool get isLoading => _isLoading;
  String get selectedCategory => _selectedCategory;
  String? get errorMessage => _errorMessage;

  List<Novel> get filteredNovels {
    if (_selectedCategory == 'All') {
      return _novels;
    }
    return _novels.where((n) {
      return n.genre.trim().toLowerCase() == _selectedCategory.trim().toLowerCase();
    }).toList();
  }

  NovelService() {
    fetchNovels();
  }

  void setSelectedCategory(String category) {
    if (_selectedCategory != category) {
      _selectedCategory = category;
      notifyListeners();
    }
  }

  // Fetch novels directly from Supabase
  Future<void> fetchNovels() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _supabase
          .from('novels')
          .select('*')
          .order('created_at', ascending: false);

      final List<dynamic> data = response as List<dynamic>;
      if (data.isNotEmpty) {
        _novels = data.map((json) => Novel.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        // Real empty state when admin removes all novels
        _novels = [];
      }
    } catch (e) {
      debugPrint('Error fetching live novels from Supabase: $e');
      _errorMessage = e.toString();
      _novels = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch chapters for a given novel from Supabase
  Future<List<Chapter>> fetchChapters(String novelId) async {
    try {
      final response = await _supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', novelId)
          .order('chapter_number', ascending: true);

      final List<dynamic> data = response as List<dynamic>;
      if (data.isNotEmpty) {
        return data.map((json) => Chapter.fromJson(json as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching chapters from Supabase: $e');
    }
    // Return empty list if table has no rows
    return [];
  }
}
