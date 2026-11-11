import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../models/chapter.dart';
import '../models/novel.dart';
import '../services/settings_service.dart';

enum ReaderTheme { dark, sepia, light }

class ReaderScreen extends StatefulWidget {
  final Chapter chapter;
  final Novel? novel;
  const ReaderScreen({super.key, required this.chapter, this.novel});

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  double fontSize = 18.0;
  ReaderTheme currentTheme = ReaderTheme.dark;
  bool showSettings = false;

  @override
  void initState() {
    super.initState();
    final settings = Provider.of<SettingsService>(context, listen: false);
    fontSize = settings.fontSize;
    if (settings.theme == 'sepia') {
      currentTheme = ReaderTheme.sepia;
    } else if (settings.theme == 'light') {
      currentTheme = ReaderTheme.light;
    } else {
      currentTheme = ReaderTheme.dark;
    }
  }

  Color get backgroundColor {
    switch (currentTheme) {
      case ReaderTheme.dark:
        return AppConstants.background;
      case ReaderTheme.sepia:
        return const Color(0xFFFBF0D9);
      case ReaderTheme.light:
        return Colors.white;
    }
  }

  Color get textColor {
    switch (currentTheme) {
      case ReaderTheme.dark:
        return const Color(0xFFE2E8F0);
      case ReaderTheme.sepia:
        return const Color(0xFF433422);
      case ReaderTheme.light:
        return const Color(0xFF0F172A);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: textColor, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          children: [
            Text(
              'Chapter ${widget.chapter.chapterNumber}',
              style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            Text(
              widget.chapter.title,
              style: TextStyle(color: textColor.withOpacity(0.7), fontSize: 10),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.format_size, color: textColor),
            onPressed: () {
              setState(() {
                showSettings = !showSettings;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Collapsible Appearance Drawer (Font size & Theme)
          if (showSettings)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              color: currentTheme == ReaderTheme.dark ? AppConstants.surface : Colors.grey.withOpacity(0.15),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Font Size: ${fontSize.toInt()}px', style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          IconButton(
                            icon: Icon(Icons.remove_circle_outline, color: textColor, size: 20),
                            onPressed: () {
                              if (fontSize > 12) setState(() => fontSize -= 2);
                            },
                          ),
                          IconButton(
                            icon: Icon(Icons.add_circle_outline, color: textColor, size: 20),
                            onPressed: () {
                              if (fontSize < 24) setState(() => fontSize += 2);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Theme:', style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          _buildThemeCircle(ReaderTheme.dark, const Color(0xFF090D16), Colors.white),
                          const SizedBox(width: 8),
                          _buildThemeCircle(ReaderTheme.sepia, const Color(0xFFFBF0D9), const Color(0xFF433422)),
                          const SizedBox(width: 8),
                          _buildThemeCircle(ReaderTheme.light, Colors.white, Colors.black),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

          // Chapter Reading Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.chapter.content,
                    style: TextStyle(
                      fontFamily: 'serif',
                      color: textColor,
                      fontSize: fontSize,
                      height: 1.8,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Google AdMob Native Banner placeholder at chapter end
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: currentTheme == ReaderTheme.dark ? AppConstants.surface : Colors.grey.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'SPONSORED ADVERTISEMENT',
                          style: TextStyle(fontSize: 9, letterSpacing: 1.2, color: textColor.withOpacity(0.5), fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '📢 Google AdMob Native Banner Ad (320x50)',
                            style: TextStyle(color: textColor.withOpacity(0.7), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      '— End of Chapter ${widget.chapter.chapterNumber} —',
                      style: TextStyle(color: textColor.withOpacity(0.5), fontSize: 12, fontStyle: FontStyle.italic),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThemeCircle(ReaderTheme theme, Color bg, Color border) {
    final isSelected = currentTheme == theme;
    return GestureDetector(
      onTap: () => setState(() => currentTheme = theme),
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppConstants.primary : border.withOpacity(0.4),
            width: isSelected ? 2.5 : 1,
          ),
        ),
      ),
    );
  }
}
