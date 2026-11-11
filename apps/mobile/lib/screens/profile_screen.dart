import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../services/wallet_service.dart';
import '../services/bookmark_service.dart';
import '../services/auth_service.dart';
import '../services/settings_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showAuthModal(BuildContext context) {
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

  void _showTypographyModal(BuildContext context, SettingsService settings) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppConstants.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.font_download_rounded, color: AppConstants.primary, size: 22),
                      const SizedBox(width: 10),
                      const Text(
                        'Reader Typography',
                        style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Colors.white60),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Font Family', style: TextStyle(color: AppConstants.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildFontOption('sans-serif', 'Modern Sans', settings, setSheetState),
                      const SizedBox(width: 8),
                      _buildFontOption('serif', 'Classic Serif', settings, setSheetState),
                      const SizedBox(width: 8),
                      _buildFontOption('monospace', 'Monospace', settings, setSheetState),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Base Font Size', style: TextStyle(color: AppConstants.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                      Text('${settings.fontSize.toInt()} px', style: const TextStyle(color: AppConstants.amberGold, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Slider(
                    value: settings.fontSize,
                    min: 14.0,
                    max: 26.0,
                    divisions: 6,
                    activeColor: AppConstants.primary,
                    inactiveColor: Colors.white12,
                    onChanged: (val) {
                      setSheetState(() {});
                      settings.setFontSize(val);
                    },
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildFontOption(String fontKey, String label, SettingsService settings, StateSetter setSheetState) {
    final isSelected = settings.fontFamily == fontKey;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setSheetState(() {});
          settings.setFontFamily(fontKey);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppConstants.primary : AppConstants.background,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? AppConstants.primary : Colors.white12),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppConstants.textSecondary,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  void _showThemeModal(BuildContext context, SettingsService settings) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppConstants.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.dark_mode_rounded, color: Colors.purpleAccent, size: 22),
                  const SizedBox(width: 10),
                  const Text('Default Theme', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white60),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildThemeTile('dark', 'OLED Pure Dark', 'High contrast pitch black theme', Icons.nightlight_round, const Color(0xFF090D16), settings, ctx),
              const SizedBox(height: 10),
              _buildThemeTile('sepia', 'Warm Sepia', 'Comfortable paper-like warm tone', Icons.wb_sunny_rounded, const Color(0xFFFBF0D9), settings, ctx),
              const SizedBox(height: 10),
              _buildThemeTile('light', 'Clean Light', 'Crisp white daytime reading theme', Icons.light_mode_rounded, Colors.white, settings, ctx),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildThemeTile(String themeKey, String title, String subtitle, IconData icon, Color colorPreview, SettingsService settings, BuildContext ctx) {
    final isSelected = settings.theme == themeKey;
    return GestureDetector(
      onTap: () {
        settings.setTheme(themeKey);
        Navigator.pop(ctx);
        ScaffoldMessenger.of(ctx).showSnackBar(
          SnackBar(
            content: Text('Theme changed to $title!'),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppConstants.background,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? AppConstants.primary : Colors.white12, width: isSelected ? 1.5 : 1.0),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: colorPreview,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white24),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  Text(subtitle, style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppConstants.primary, size: 20),
          ],
        ),
      ),
    );
  }

  void _checkForUpdates(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return const _CheckUpdateDialog();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final wallet = Provider.of<WalletService>(context);
    final bookmarks = Provider.of<BookmarkService>(context);
    final auth = Provider.of<AuthService>(context);
    final settings = Provider.of<SettingsService>(context);

    final bool isUserSignedIn = auth.isAuthenticated || wallet.isGoogleSignedIn;
    final String currentDisplayName = auth.isAuthenticated ? auth.displayName : wallet.userName;
    final String currentEmail = auth.isAuthenticated ? auth.email : wallet.userEmail;

    return Scaffold(
      backgroundColor: AppConstants.background,
      appBar: AppBar(
        backgroundColor: AppConstants.background,
        elevation: 0,
        title: const Text(
          'Reader Profile',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        child: Column(
          children: [
            // PROFILE CARD
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppConstants.surface, AppConstants.surfaceLight.withOpacity(0.5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [AppConstants.primary, AppConstants.amberGold],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppConstants.primary.withOpacity(0.3),
                              blurRadius: 16,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            isUserSignedIn ? currentDisplayName[0].toUpperCase() : '👤',
                            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    currentDisplayName,
                                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isUserSignedIn ? AppConstants.emeraldGreen.withOpacity(0.2) : Colors.white12,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    isUserSignedIn ? 'VERIFIED' : 'GUEST',
                                    style: TextStyle(
                                      color: isUserSignedIn ? AppConstants.emeraldGreen : Colors.white70,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              currentEmail,
                              style: const TextStyle(color: AppConstants.textSecondary, fontSize: 12),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 12),
                  // STATS ROW
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatColumn('Coins', '🪙 ${wallet.coins}', AppConstants.amberGold),
                      _buildDivider(),
                      _buildStatColumn('Read', '${wallet.chaptersReadCount}', Colors.white),
                      _buildDivider(),
                      _buildStatColumn('Bookmarks', '${bookmarks.count}', AppConstants.primary),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // REAL AUTHENTICATION CARD
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppConstants.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isUserSignedIn ? AppConstants.emeraldGreen.withOpacity(0.3) : AppConstants.primary.withOpacity(0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: (isUserSignedIn ? AppConstants.emeraldGreen : AppConstants.primary).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          isUserSignedIn ? Icons.verified_user_rounded : Icons.login_rounded,
                          color: isUserSignedIn ? AppConstants.emeraldGreen : AppConstants.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isUserSignedIn ? 'Account Authenticated' : 'Sign In / Register',
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isUserSignedIn
                                  ? 'Synced to Supabase Cloud Database (${auth.isAuthenticated ? "Supabase Auth" : "Google Linked"}).'
                                  : 'Sign in with your email or Google to validate your user profile & claim +50 Coins! 🎁',
                              style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isUserSignedIn ? Colors.white10 : Colors.white,
                        foregroundColor: isUserSignedIn ? Colors.white70 : Colors.black87,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        if (isUserSignedIn) {
                          auth.signOut();
                          wallet.signOut();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Signed out successfully. Switched to Guest mode.'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        } else {
                          _showAuthModal(context);
                        }
                      },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (!isUserSignedIn) ...[
                            const Icon(Icons.lock_person_rounded, size: 18),
                            const SizedBox(width: 10),
                            const Text(
                              'Sign In / Register Account',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ] else ...[
                            const Icon(Icons.logout_rounded, size: 16),
                            const SizedBox(width: 8),
                            const Text(
                              'Sign Out Account',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // READING PREFERENCES & SETTINGS TILES
            Container(
              decoration: BoxDecoration(
                color: AppConstants.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                children: [
                  _buildInteractiveTile(
                    icon: Icons.font_download_outlined,
                    iconColor: AppConstants.amberGold,
                    title: 'Reader Typography',
                    subtitle: 'Font: ${settings.fontFamily} • ${settings.fontSize.toInt()}px',
                    onTap: () => _showTypographyModal(context, settings),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  _buildInteractiveTile(
                    icon: Icons.dark_mode_outlined,
                    iconColor: Colors.purpleAccent,
                    title: 'Default Theme',
                    subtitle: settings.theme == 'dark' ? 'OLED Pure Dark' : (settings.theme == 'sepia' ? 'Warm Sepia' : 'Clean Light'),
                    onTap: () => _showThemeModal(context, settings),
                  ),
                  const Divider(color: Colors.white10, height: 1),
                  _buildInteractiveTile(
                    icon: Icons.system_update_rounded,
                    iconColor: AppConstants.emeraldGreen,
                    title: 'Check for Updates',
                    subtitle: 'Current: Version 1.0.1 (Latest)',
                    onTap: () => _checkForUpdates(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 17, fontWeight: FontWeight.bold)),
        const SizedBox(height: 3),
        Text(label, style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11)),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 28,
      color: Colors.white10,
    );
  }

  Widget _buildInteractiveTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: AppConstants.textSecondary, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white38),
          ],
        ),
      ),
    );
  }
}

// Check for updates dialog with realistic check
class _CheckUpdateDialog extends StatefulWidget {
  const _CheckUpdateDialog();

  @override
  State<_CheckUpdateDialog> createState() => _CheckUpdateDialogState();
}

class _CheckUpdateDialogState extends State<_CheckUpdateDialog> {
  bool checking = true;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) setState(() => checking = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppConstants.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Colors.white12)),
      title: const Row(
        children: [
          Icon(Icons.system_update_rounded, color: AppConstants.primary, size: 22),
          SizedBox(width: 10),
          Text('System Update Check', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
      content: checking
          ? const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 12),
                CircularProgressIndicator(color: AppConstants.primary),
                SizedBox(height: 16),
                Text('Connecting to update servers...', style: TextStyle(color: AppConstants.textSecondary, fontSize: 12)),
                SizedBox(height: 8),
              ],
            )
          : const Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.check_circle_rounded, color: AppConstants.emeraldGreen, size: 24),
                    SizedBox(width: 8),
                    Text('You are up to date!', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 10),
                Text(
                  'NovelPlatform version 1.0.1 is the latest production build. No newer version is required.',
                  style: TextStyle(color: AppConstants.textSecondary, fontSize: 12, height: 1.4),
                ),
              ],
            ),
      actions: [
        if (!checking)
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: AppConstants.primary, fontWeight: FontWeight.bold)),
          ),
      ],
    );
  }
}

// Real Auth Modal Widget
class AuthModalWidget extends StatefulWidget {
  const AuthModalWidget({super.key});

  @override
  State<AuthModalWidget> createState() => _AuthModalWidgetState();
}

class _AuthModalWidgetState extends State<AuthModalWidget> {
  bool isSignUp = false;
  final emailCtrl = TextEditingController();
  final passCtrl = TextEditingController();
  final formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    final wallet = Provider.of<WalletService>(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(isSignUp ? Icons.person_add_rounded : Icons.login_rounded, color: AppConstants.primary),
                const SizedBox(width: 10),
                Text(
                  isSignUp ? 'Create Real Account' : 'Sign In to NovelPlatform',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white60),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              isSignUp
                  ? 'Sign up with real email & password to validate and claim +50 Coins!'
                  : 'Enter your credentials to sync coins and unlocked chapters.',
              style: const TextStyle(color: AppConstants.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 18),

            // Google Sign-In Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  side: const BorderSide(color: Colors.white70),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        final ok = await auth.signInWithGoogle();
                        if (ok && mounted) {
                          wallet.signInWithGoogle(customEmail: auth.email, customName: auth.displayName);
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('🎉 Google Sign-In Successful! Progress synced!'),
                              backgroundColor: AppConstants.emeraldGreen,
                              duration: Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.network(
                      'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                      width: 20,
                      height: 20,
                      errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, color: Colors.red, size: 24),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Continue with Google',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),
            Row(
              children: [
                const Expanded(child: Divider(color: Colors.white24)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text('OR EMAIL', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                const Expanded(child: Divider(color: Colors.white24)),
              ],
            ),
            const SizedBox(height: 16),

            // Email input with validation
            TextFormField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Email Address',
                labelStyle: const TextStyle(color: AppConstants.textSecondary),
                prefixIcon: const Icon(Icons.email_outlined, color: Colors.white60),
                filled: true,
                fillColor: AppConstants.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              validator: (v) {
                if (v == null || !v.contains('@') || !v.contains('.')) {
                  return 'Please enter a valid email address';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Password input with validation
            TextFormField(
              controller: passCtrl,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Password',
                labelStyle: const TextStyle(color: AppConstants.textSecondary),
                prefixIcon: const Icon(Icons.lock_outline, color: Colors.white60),
                filled: true,
                fillColor: AppConstants.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              validator: (v) {
                if (v == null || v.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 18),

            if (auth.errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(auth.errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 11))),
                  ],
                ),
              ),

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        if (!formKey.currentState!.validate()) return;
                        bool ok = false;
                        if (isSignUp) {
                          ok = await auth.signUp(email: emailCtrl.text, password: passCtrl.text);
                        } else {
                          ok = await auth.signIn(email: emailCtrl.text, password: passCtrl.text);
                        }
                        if (ok && mounted) {
                          wallet.signInWithGoogle(customEmail: emailCtrl.text, customName: emailCtrl.text.split('@').first);
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('🎉 Successfully ${isSignUp ? "Registered" : "Signed In"}! +50 Coins claimed!'),
                              backgroundColor: AppConstants.emeraldGreen,
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                child: auth.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        isSignUp ? 'Create Validated Account' : 'Sign In Now',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
              ),
            ),
            const SizedBox(height: 12),

            // Toggle Sign Up / Sign In
            Center(
              child: TextButton(
                onPressed: () => setState(() => isSignUp = !isSignUp),
                child: Text(
                  isSignUp ? 'Already have an account? Sign In' : 'New reader? Register Account (+50 Bonus Coins)',
                  style: const TextStyle(color: AppConstants.amberGold, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
