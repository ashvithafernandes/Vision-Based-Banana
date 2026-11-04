import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/recognition_result.dart';
import '../../theme/app_theme.dart';
import 'json_inspector_widget.dart';

class ResultCard extends StatelessWidget {
  final RecognitionResult result;
  final File? imageFile;
  final VoidCallback onScanAgain;

  const ResultCard({
    Key? key,
    required this.result,
    this.imageFile,
    required this.onScanAgain,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isCarbide = result.isCarbideDetected;
    final isNatural = result.isNaturallyRipened;
    final isNonBanana = result.isNonBanana;

    Color badgeColor;
    Color badgeTextColor;
    String badgeTitle;
    IconData badgeIcon;

    if (isCarbide) {
      badgeColor = AppTheme.warningRedLight;
      badgeTextColor = AppTheme.warningRed;
      badgeTitle = 'Carbide Detected';
      badgeIcon = Icons.warning_amber_rounded;
    } else if (isNatural) {
      badgeColor = AppTheme.mintGreenLight;
      badgeTextColor = AppTheme.mintGreen;
      badgeTitle = 'Naturally Ripened';
      badgeIcon = Icons.eco_rounded;
    } else {
      badgeColor = AppTheme.softGlacierBlue.withOpacity(0.4);
      badgeTextColor = AppTheme.glacierBlueText;
      badgeTitle = 'Non-Banana Object';
      badgeIcon = Icons.info_outline_rounded;
    }

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Badges Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(badgeIcon, color: badgeTextColor, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      badgeTitle,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: badgeTextColor,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.background,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.bolt_rounded, size: 14, color: AppTheme.coralAccent),
                    const SizedBox(width: 4),
                    Text(
                      '${result.latencyMs.toStringAsFixed(1)} ms',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Analyzed Image Thumbnail & Class Name
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (imageFile != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.file(
                    imageFile!,
                    width: 85,
                    height: 85,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 16),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result.predictedClass,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Confidence: ${(result.confidence * 100).toStringAsFixed(1)}%',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: badgeTextColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '100% Offline MobileNetV3',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(color: AppTheme.borderLight, height: 1),
          const SizedBox(height: 14),

          // Actionable Recommendation for Farmer
          Text(
            'Agricultural Recommendation',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.background.withOpacity(0.6),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              result.safetyRecommendation,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: AppTheme.textPrimary,
                height: 1.4,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Probability Breakdown Bars
          Text(
            'Class Probability Distribution',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 10),
          ...result.classProbabilities.entries.map((entry) {
            final pct = entry.value;
            final isWinner = entry.key == result.predictedClass;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        entry.key,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11.5,
                          fontWeight: isWinner ? FontWeight.w700 : FontWeight.w500,
                          color: isWinner ? AppTheme.textPrimary : AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        '${(pct * 100).toStringAsFixed(1)}%',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: isWinner ? AppTheme.coralAccent : AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: pct.clamp(0.0, 1.0),
                      minHeight: 6,
                      backgroundColor: AppTheme.borderLight,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isWinner ? AppTheme.coralAccent : AppTheme.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),

          // Collapsible JSON Telemetry (Specifically requested by user!)
          JsonInspectorWidget(result: result),

          const SizedBox(height: 10),

          // Scan Again Button
          ElevatedButton(
            onPressed: onScanAgain,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.darkSlate,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.refresh_rounded, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Scan Another Sample',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
