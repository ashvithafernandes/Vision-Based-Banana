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
      badgeTitle = result.detectedObject != 'Banana' 
          ? 'Non-Banana (${result.detectedObject})' 
          : 'Non-Banana Subject';
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

          const SizedBox(height: 14),

          // Two-Stage Pipeline Telemetry Strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppTheme.background.withOpacity(0.7),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Row(
              children: [
                // Stage 1 Status
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        result.isBanana ? Icons.check_circle_rounded : Icons.cancel_rounded,
                        size: 15,
                        color: result.isBanana ? AppTheme.mintGreen : AppTheme.coralAccent,
                      ),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          result.isBanana
                              ? 'Stage 1: Banana Confirmed'
                              : 'Stage 1: Rejected (${result.detectedObject})',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: result.isBanana ? AppTheme.textPrimary : AppTheme.coralAccent,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  height: 16,
                  width: 1,
                  color: AppTheme.borderLight,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                ),
                // Stage 2 Status
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        result.isBanana ? Icons.verified_rounded : Icons.fast_forward_rounded,
                        size: 15,
                        color: result.isBanana ? AppTheme.mintGreen : AppTheme.textMuted,
                      ),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          result.isBanana ? 'Stage 2: Carbide Analyzed' : 'Stage 2: Skipped',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: result.isBanana ? AppTheme.textPrimary : AppTheme.textMuted,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

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
                      result.isBanana
                          ? 'YOLO11n (${result.stage1LatencyMs.toStringAsFixed(0)}ms) + MobileNetV3 (${result.stage2LatencyMs?.toStringAsFixed(0) ?? 0}ms)'
                          : 'YOLO11n Gatekeeper (${result.stage1LatencyMs.toStringAsFixed(0)}ms)',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10.5,
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

          // Probability Breakdown Bars (Only relevant if Stage 2 ran or non-banana probabilities)
          if (result.isBanana) ...[
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
          ],

          // Collapsible JSON Telemetry
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
