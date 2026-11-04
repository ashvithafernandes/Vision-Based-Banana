import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import 'scanner_screen.dart';
import 'widgets/custom_bottom_nav.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({Key? key}) : super(key: key);

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _selectedNavIndex = 0;
  bool _isScannerActive = false;

  @override
  Widget build(BuildContext context) {
    if (_isScannerActive || _selectedNavIndex == 1) {
      return ScannerScreen(
        onBack: () => setState(() {
          _isScannerActive = false;
          _selectedNavIndex = 0;
        }),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            // Main Scrollable Dashboard Content
            SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Top Header Row (Sampling Reference Image Top Header)
                  _buildTopHeader(),

                  const SizedBox(height: 22),

                  // 2. Dashboard Title with Action Icon
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Dashboard',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.darkSlate,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.calendar_today_rounded,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // 3. Two Pill Stat Cards (Sampling Reference Screen 1)
                  Row(
                    children: [
                      // Left Card: Model Engine Status
                      Expanded(
                        child: _buildPillStatCard(
                          icon: Icons.offline_bolt_rounded,
                          iconColor: AppTheme.coralAccent,
                          iconBg: const Color(0xFFFFECE8),
                          topLabel: 'Offline',
                          title: 'MobileNetV3',
                          subtitle: 'Edge AI Active',
                          highlight: '3.28 MB',
                          highlightSuffix: 'quant',
                        ),
                      ),
                      const SizedBox(width: 14),
                      // Right Card: Detection Reliability
                      Expanded(
                        child: _buildPillStatCard(
                          icon: Icons.verified_user_rounded,
                          iconColor: AppTheme.mintGreen,
                          iconBg: AppTheme.mintGreenLight,
                          topLabel: '3 Classes',
                          title: 'OOD Shield',
                          subtitle: 'Rejects Non-Banana',
                          highlight: '99.8%',
                          highlightSuffix: 'acc',
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // 4. Hero Diagnostic Showcase Card (Sampling Reference Screen 1 Heart Rate Card)
                  _buildHeroDiagnosticCard(),

                  const SizedBox(height: 20),

                  // 5. Quick Action Grid (Take Photo / Upload Photo)
                  Text(
                    'Instant Fruit Auditing',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionTile(
                          icon: Icons.camera_alt_rounded,
                          title: 'Live Camera',
                          desc: 'Instant Viewfinder',
                          color: AppTheme.coralAccent,
                          onTap: () => setState(() => _isScannerActive = true),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: _buildActionTile(
                          icon: Icons.add_photo_alternate_rounded,
                          title: 'Upload Photo',
                          desc: 'Pick From Gallery',
                          color: AppTheme.darkSlate,
                          onTap: () => setState(() => _isScannerActive = true),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // 6. Educational Guide for Farmers
                  _buildFarmerGuideCard(),
                ],
              ),
            ),

            // Floating Custom Bottom Nav Bar (Sampling Reference Image)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: CustomBottomNav(
                selectedIndex: _selectedNavIndex,
                onItemSelected: (idx) {
                  setState(() {
                    _selectedNavIndex = idx;
                    if (idx == 1) _isScannerActive = true;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Header Section
  // ---------------------------------------------------------------------------
  Widget _buildTopHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Custom Logo Icon
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
              ),
            ],
          ),
          child: Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(Icons.eco_rounded, color: AppTheme.mintGreen, size: 24),
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: AppTheme.coralAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Greeting
        Row(
          children: [
            Text(
              'Hello, Farmer',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(width: 6),
            const Text('🌾', style: TextStyle(fontSize: 16)),
          ],
        ),

        // Farmer Avatar
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppTheme.softGlacierBlue,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: const Center(
            child: Icon(Icons.person_rounded, color: AppTheme.darkSlate, size: 22),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Top Stat Cards
  // ---------------------------------------------------------------------------
  Widget _buildPillStatCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String topLabel,
    required String title,
    required String subtitle,
    required String highlight,
    required String highlightSuffix,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              Text(
                topLabel,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                highlight,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(width: 3),
              Text(
                highlightSuffix,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Hero Diagnostic Card (Heart rate visual analog)
  // ---------------------------------------------------------------------------
  Widget _buildHeroDiagnosticCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFFFFF), Color(0xFFF6FAFC)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.softGlacierBlue.withOpacity(0.4),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shield_rounded, size: 18, color: AppTheme.glacierBlueText),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Ripening Security',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.background,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 12, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      'Realtime',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Visual Ripening Indicator Graphic
          Container(
            height: 110,
            decoration: BoxDecoration(
              color: const Color(0xFFE8F3F7),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned(
                  left: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chemical Ripening Alert',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.darkSlate,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Detects Calcium Carbide (CaC₂)',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.mintGreenLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Zero Server Required',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.mintGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  right: 18,
                  child: Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text('🍌', style: TextStyle(fontSize: 28)),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Bottom Action Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.call_made_rounded, size: 14, color: AppTheme.coralAccent),
                      const SizedBox(width: 4),
                      Text(
                        '3-Class Safety Guard',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.coralAccent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Carbide vs. Natural vs. Other',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: () => setState(() => _isScannerActive = true),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: const BoxDecoration(
                    color: AppTheme.darkSlate,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.arrow_forward_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Action Tiles
  // ---------------------------------------------------------------------------
  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String desc,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            desc,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Educational Farmer Guide Card
  // ---------------------------------------------------------------------------
  Widget _buildFarmerGuideCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.tips_and_updates_rounded, color: AppTheme.amberWarning, size: 20),
              const SizedBox(width: 8),
              Text(
                'Farmer Visual Clues',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildClueRow('Natural Ripening:', 'Uniform golden peel with brown sugar spots and a yellow/drying stalk.'),
          _buildClueRow('Carbide Ripening:', 'Bright lemon-yellow body but an unnatural dark green stalk and powdery peel.'),
        ],
      ),
    );
  }

  Widget _buildClueRow(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: AppTheme.coralAccent, fontWeight: FontWeight.bold)),
          Expanded(
            child: RichText(
              text: TextSpan(
                text: '$title ',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
                children: [
                  TextSpan(
                    text: desc,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
