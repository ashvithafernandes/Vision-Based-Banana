import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_dashboard_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge-to-edge transparent system overlay for modern UI
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const CarbideDetectionApp());
}

class CarbideDetectionApp extends StatelessWidget {
  const CarbideDetectionApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RipeScan - Banana Carbide Detection',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const HomeDashboardScreen(),
    );
  }
}
