import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Palette sampled directly from reference UI aesthetic
  static const Color background = Color(0xFFEDF2F6);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color darkSlate = Color(0xFF1E222A);
  static const Color darkSlateLight = Color(0xFF2A2F3A);

  // Accent Colors
  static const Color coralAccent = Color(0xFFFF5A36);
  static const Color softGlacierBlue = Color(0xFFBCE1F0);
  static const Color glacierBlueText = Color(0xFF2A6882);
  static const Color mintGreen = Color(0xFF27AE60);
  static const Color mintGreenLight = Color(0xFFE8F8F0);
  static const Color warningRed = Color(0xFFE74C3C);
  static const Color warningRedLight = Color(0xFFFDECEB);
  static const Color amberWarning = Color(0xFFF39C12);
  static const Color amberWarningLight = Color(0xFFFEF5E7);

  // Neutral Tones
  static const Color textPrimary = Color(0xFF191D24);
  static const Color textSecondary = Color(0xFF7A8699);
  static const Color textMuted = Color(0xFFA0AEC0);
  static const Color borderLight = Color(0xFFE2E8F0);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: coralAccent,
        background: background,
        surface: surfaceCard,
        primary: coralAccent,
        secondary: darkSlate,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: textPrimary,
          letterSpacing: -0.5,
        ),
        headlineMedium: GoogleFonts.plusJakartaSans(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: textPrimary,
          letterSpacing: -0.3,
        ),
        titleLarge: GoogleFonts.plusJakartaSans(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
        titleMedium: GoogleFonts.plusJakartaSans(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.plusJakartaSans(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: textSecondary,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
        ),
        shadowColor: Colors.black.withOpacity(0.04),
      ),
    );
  }
}
