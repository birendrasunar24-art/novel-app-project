import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  User? get currentUser => _supabase.auth.currentUser;
  bool get isAuthenticated => _supabase.auth.currentUser != null;

  String get displayName {
    final user = _supabase.auth.currentUser;
    if (user == null) return 'Guest Reader';
    if (user.userMetadata?['full_name'] != null) {
      return user.userMetadata!['full_name'].toString();
    }
    if (user.userMetadata?['name'] != null) {
      return user.userMetadata!['name'].toString();
    }
    if (user.email != null) {
      return user.email!.split('@').first;
    }
    return 'Reader #${user.id.substring(0, 4)}';
  }

  String get email => _supabase.auth.currentUser?.email ?? 'guest@novelplatform.app';

  AuthService() {
    _supabase.auth.onAuthStateChange.listen((data) {
      if (data.session?.user != null) {
        _syncUserProfile(data.session!.user);
      }
      notifyListeners();
    });
  }

  // Ensure user is registered in Supabase `profiles` table
  Future<void> _syncUserProfile(User user) async {
    try {
      final existing = await _supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      if (existing == null) {
        await _supabase.from('profiles').insert({
          'id': user.id,
          'username': displayName,
          'coins_balance': 20,
          'role': 'reader',
        });
        debugPrint('New user profile registered in Supabase: ${user.email}');
      }
    } catch (e) {
      debugPrint('Sync user profile error: $e');
    }
  }

  // Real Email & Password Sign Up with Supabase
  Future<bool> signUp({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _supabase.auth.signUp(
        email: email.trim(),
        password: password,
      );
      if (res.user != null) {
        await _syncUserProfile(res.user!);
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _errorMessage = 'Sign up was not completed.';
      _isLoading = false;
      notifyListeners();
      return false;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Real Email & Password Sign In with Supabase
  Future<bool> signIn({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _supabase.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      if (res.user != null) {
        await _syncUserProfile(res.user!);
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _errorMessage = 'Sign in was not completed.';
      _isLoading = false;
      notifyListeners();
      return false;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Sign In with Google OAuth (Supabase Native)
  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.novelplatform://login-callback',
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
      _isLoading = false;
      notifyListeners();
      return result;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Google sign-in error: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Real Sign Out with Supabase
  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      debugPrint('Error signing out: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
