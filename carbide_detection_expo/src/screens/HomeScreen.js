import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function HomeScreen({ onOpenScanner, onOpenGallery }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Row (Reference UI Header) */}
        <View style={styles.headerRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={22} color={COLORS.mint} />
            <View style={styles.logoDot} />
          </View>

          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>Hello, Farmer</Text>
            <Text style={styles.greetingEmoji}>🌾</Text>
          </View>

          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={COLORS.darkSlate} />
          </View>
        </View>

        {/* 2. Dashboard Title with Action Icon */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3. Two Pill Stat Cards (Screen 1 Reference) */}
        <View style={styles.statsRow}>
          {/* Card 1: Offline Model */}
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View style={[styles.statIconBadge, { backgroundColor: COLORS.coralLight }]}>
                <Ionicons name="flame" size={17} color={COLORS.coral} />
              </View>
              <Text style={styles.statTag}>Offline</Text>
            </View>
            <Text style={styles.statTitle}>MobileNetV3</Text>
            <Text style={styles.statSubtitle}>Edge AI Active</Text>
            <View style={styles.statMetricRow}>
              <Text style={styles.statMetric}>3.28 MB</Text>
              <Text style={styles.statMetricUnit}> quant</Text>
            </View>
          </View>

          {/* Card 2: 3-Class Guardrail */}
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View style={[styles.statIconBadge, { backgroundColor: COLORS.mintLight }]}>
                <Ionicons name="shield-checkmark" size={17} color={COLORS.mint} />
              </View>
              <Text style={styles.statTag}>3-Class</Text>
            </View>
            <Text style={styles.statTitle}>OOD Guard</Text>
            <Text style={styles.statSubtitle}>Rejects Non-Banana</Text>
            <View style={styles.statMetricRow}>
              <Text style={styles.statMetric}>99.8%</Text>
              <Text style={styles.statMetricUnit}> acc</Text>
            </View>
          </View>
        </View>

        {/* 4. Hero Diagnostic Card (Heart rate visual analog from Reference) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <View style={styles.heroIconBadge}>
                <Ionicons name="shield" size={16} color={COLORS.glacierBlueText} />
              </View>
              <Text style={styles.heroTitle}>Ripening Security</Text>
            </View>
            <View style={styles.realtimePill}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.realtimeText}>Realtime</Text>
            </View>
          </View>

          {/* Visual Showcase Graphic */}
          <View style={styles.graphicBox}>
            <View style={styles.graphicTextGroup}>
              <Text style={styles.graphicTitle}>Chemical Ripening Alert</Text>
              <Text style={styles.graphicSub}>Detects Calcium Carbide (CaC₂)</Text>
              <View style={styles.zeroServerPill}>
                <Text style={styles.zeroServerText}>Zero Server Required</Text>
              </View>
            </View>
            <View style={styles.fruitCircle}>
              <Text style={{ fontSize: 28 }}>🍌</Text>
            </View>
          </View>

          {/* Hero Bottom Bar */}
          <View style={styles.heroBottomRow}>
            <View>
              <View style={styles.guardBadge}>
                <Ionicons name="arrow-up-outline" size={12} color={COLORS.coral} />
                <Text style={styles.guardText}>3-Class Safety Guard</Text>
              </View>
              <Text style={styles.heroSubtitle}>Carbide vs. Natural vs. Other</Text>
            </View>

            <TouchableOpacity style={styles.heroArrowBtn} onPress={onOpenScanner}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Quick Audit Actions */}
        <Text style={styles.sectionHeader}>Instant Fruit Auditing</Text>
        <View style={styles.actionsRow}>
          {/* Live Camera Button */}
          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.85}
            onPress={onOpenScanner}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.coralLight }]}>
              <Ionicons name="camera" size={22} color={COLORS.coral} />
            </View>
            <Text style={styles.actionTitle}>Live Camera</Text>
            <Text style={styles.actionDesc}>Instant Viewfinder</Text>
          </TouchableOpacity>

          {/* Upload Photo from Gallery Button */}
          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.85}
            onPress={onOpenGallery || onOpenScanner}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#ECEEF2' }]}>
              <Ionicons name="images" size={22} color={COLORS.darkSlate} />
            </View>
            <Text style={styles.actionTitle}>Upload Photo</Text>
            <Text style={styles.actionDesc}>Pick from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Farmer Educational Clues */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="bulb" size={18} color={COLORS.amber} />
            <Text style={styles.guideTitle}>Farmer Visual Clues</Text>
          </View>
          <View style={styles.clueItem}>
            <Text style={styles.clueBullet}>• </Text>
            <Text style={styles.clueText}>
              <Text style={styles.clueBold}>Natural Ripening: </Text>
              Uniform golden peel with brown sugar spots and a yellow/drying stalk.
            </Text>
          </View>
          <View style={styles.clueItem}>
            <Text style={styles.clueBullet}>• </Text>
            <Text style={styles.clueText}>
              <Text style={styles.clueBold}>Carbide Ripening: </Text>
              Unnatural bright lemon peel with dark green stalk and white chemical traces.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  logoDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  greetingEmoji: {
    fontSize: 16,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.softGlacierBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 26,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
    letterSpacing: -0.4,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkSlate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    ...FONTS.semiBold,
  },
  statTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  statSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: 2,
  },
  statMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  statMetric: {
    fontSize: 18,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
  },
  statMetricUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    ...FONTS.semiBold,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(188, 225, 240, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  realtimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  realtimeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },
  graphicBox: {
    backgroundColor: '#E8F3F7',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphicTextGroup: {
    flex: 1,
  },
  graphicTitle: {
    fontSize: 14,
    color: COLORS.darkSlate,
    ...FONTS.extraBold,
  },
  graphicSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  zeroServerPill: {
    backgroundColor: COLORS.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  zeroServerText: {
    fontSize: 10,
    color: COLORS.mint,
    ...FONTS.bold,
  },
  fruitCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  guardText: {
    fontSize: 11,
    color: COLORS.coral,
    ...FONTS.bold,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginTop: 2,
  },
  heroArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkSlate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 17,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  clueItem: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  clueBullet: {
    color: COLORS.coral,
    fontWeight: 'bold',
  },
  clueText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
  clueBold: {
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
});
