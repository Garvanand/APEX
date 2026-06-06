import 'package:flutter/material.dart';

class ApexTheme {
  static const Color black = Color(0xFF000000);
  static const Color darkGray = Color(0xFF0A0A0A);
  static const Color borderGray = Color(0xFF1A1A1A);
  static const Color textMuted = Color(0xFF444444);
  static const Color textSubtle = Color(0xFF888888);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color iqooYellow = Color(0xFFFFD400);
  static const Color success = Color(0xFF00D26A);

  static ThemeData get theme => ThemeData(
        brightness: Brightness.dark,
        primaryColor: iqooYellow,
        scaffoldBackgroundColor: black,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: iqooYellow,
          secondary: iqooYellow,
          surface: darkGray,
          background: black,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w900, letterSpacing: -2.0),
          displayMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w800, letterSpacing: -1.0),
          bodyLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w500),
          bodyMedium: TextStyle(color: textSubtle, fontWeight: FontWeight.w400),
          labelSmall: TextStyle(color: textMuted, fontWeight: FontWeight.w800, letterSpacing: 2.0),
        ),
        useMaterial3: true,
      );
}
