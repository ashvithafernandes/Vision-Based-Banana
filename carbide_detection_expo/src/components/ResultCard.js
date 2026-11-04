import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import JsonInspector from './JsonInspector';

export default function ResultCard({ result, imageUri, onScanAgain }) {
  const isNonBanana = !result.isBanana || result.predictedClass === 'Not a Banana';
  const isCarbide = !isNonBanana && result.predictedClass === 'With Carbide';
  const isNatural = !isNonBanana && result.predictedClass === 'Without Carbide';
  const detectedObject = result.stage1?.detectedObject || 'Non-Banana Object';

  let badgeColor = COLORS.softGlacierBlue;
  let badgeTextColor = COLORS.glacierBlueText;
  let badgeTitle = 'Non-Banana Object';
  let badgeIcon = 'information-circle-outline';

  if (isNonBanana) {
    badgeColor = '#FEECEB';
    badgeTextColor = '#D9381E';
    badgeTitle = `Rejected: ${detectedObject}`;
    badgeIcon = 'close-circle-outline';
  } else if (isCarbide) {
    badgeColor = COLORS.warningRedLight;
    badgeTextColor = COLORS.warningRed;
    badgeTitle = 'Carbide Detected';
    badgeIcon = 'warning-outline';
  } else if (isNatural) {
    badgeColor = COLORS.mintLight;
    badgeTextColor = COLORS.mint;
    badgeTitle = 'Naturally Ripened';
    badgeIcon = 'checkmark-circle-outline';
  }

  return (
    <View style={styles.card}>
      {/* Top Status Header */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Ionicons name={badgeIcon} size={16} color={badgeTextColor} />
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badgeTitle}</Text>
        </View>

        <View style={styles.latencyBadge}>
          <Ionicons name="flash-outline" size={13} color={COLORS.coral} />
          <Text style={styles.latencyText}>{result.latencyMs.toFixed(1)} ms</Text>
        </View>
      </View>

      {/* Main Image Thumbnail & Class Name */}
      <View style={styles.detailsRow}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.textColumn}>
          <Text style={styles.className}>
            {result.specificLabel || result.predictedClass}
          </Text>
          <Text style={[styles.confidence, { color: badgeTextColor }]}>
            {(result.confidence * 100).toFixed(1)}% Confidence
          </Text>
          <Text style={styles.engineTag}>
            {result.stage1 ? '2-Stage AI: YOLOv8 + MobileNetV3' : '100% Offline MobileNetV3'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Actionable Agricultural Guidance */}
      <Text style={styles.sectionTitle}>Agricultural Recommendation</Text>
      <View style={styles.recommendationBox}>
        <Text style={styles.recommendationText}>{result.safetyRecommendation}</Text>
      </View>

      {/* Probability Distribution Progress Bars */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Class Probability Distribution
      </Text>
      <View style={styles.barsContainer}>
        {Object.entries(result.probabilities).map(([className, prob]) => {
          const isWinner = className === result.predictedClass;
          return (
            <View key={className} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <Text
                  style={[
                    styles.barClass,
                    isWinner && { color: COLORS.textPrimary, ...FONTS.bold },
                  ]}
                >
                  {className}
                </Text>
                <Text
                  style={[
                    styles.barPercentage,
                    isWinner && { color: COLORS.coral, ...FONTS.bold },
                  ]}
                >
                  {(prob * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(prob * 100, 100)}%`,
                      backgroundColor: isWinner ? COLORS.coral : COLORS.textMuted,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Collapsible JSON Telemetry (Specifically requested by user!) */}
      <JsonInspector rawJson={result.rawJson} />

      {/* Scan Again Button */}
      <TouchableOpacity
        style={styles.scanAgainButton}
        activeOpacity={0.85}
        onPress={onScanAgain}
      >
        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
        <Text style={styles.scanAgainText}>Scan Another Sample</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12.5,
    ...FONTS.bold,
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  latencyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    ...FONTS.bold,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
  },
  confidence: {
    fontSize: 14,
    ...FONTS.bold,
    marginTop: 4,
  },
  engineTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    ...FONTS.medium,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    ...FONTS.bold,
    marginBottom: 8,
  },
  recommendationBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
  },
  recommendationText: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    lineHeight: 18,
    ...FONTS.medium,
  },
  barsContainer: {
    gap: 8,
    marginBottom: 6,
  },
  barItem: {
    marginVertical: 3,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barClass: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  barPercentage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },
  track: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  scanAgainButton: {
    backgroundColor: COLORS.darkSlate,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...FONTS.bold,
  },
});
