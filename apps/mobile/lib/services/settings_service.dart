import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsService extends ChangeNotifier {
  static const String _keyTheme = 'np_settings_theme';
  static const String _keyFont = 'np_settings_font';
  static const String _keyFontSize = 'np_settings_font_size';

  String _theme = 'dark'; // 'dark', 'sepia', 'light'
  String _fontFamily = 'sans-serif'; // 'sans-serif', 'serif', 'monospace'
  double _fontSize = 18.0;

  String get theme => _theme;
  String get fontFamily => _fontFamily;
  double get fontSize => _fontSize;

  SettingsService() {
    _load();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _theme = prefs.getString(_keyTheme) ?? 'dark';
      _fontFamily = prefs.getString(_keyFont) ?? 'sans-serif';
      _fontSize = prefs.getDouble(_keyFontSize) ?? 18.0;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading settings: $e');
    }
  }

  Future<void> setTheme(String theme) async {
    _theme = theme;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTheme, theme);
  }

  Future<void> setFontFamily(String font) async {
    _fontFamily = font;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyFont, font);
  }

  Future<void> setFontSize(double size) async {
    _fontSize = size;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keyFontSize, size);
  }
}
