import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function JsonInspector({ rawJson }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(rawJson, null, 2);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onTap={() => setIsExpanded(!isExpanded)}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="code-slash-outline" size={18} color={COLORS.coral} />
        </View>

        <View style={styles.titleColumn}>
          <Text style={styles.title}>Raw Model Telemetry (JSON)</Text>
          <Text style={styles.subtitle}>Offline MobileNetV3 TFLite Output</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isExpanded ? 'Hide' : 'Inspect'}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Collapsible Monospace JSON Content */}
      {isExpanded && (
        <View style={styles.jsonBody}>
          <View style={styles.toolbar}>
            <Text style={styles.jsonTag}>// telemetry_stream.json</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={14}
                color={copied ? COLORS.mint : COLORS.textMuted}
              />
              <Text style={[styles.copyText, copied && { color: COLORS.mint }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text selectable style={styles.jsonText}>
            {jsonString}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkSlate,
    borderRadius: 24,
    marginVertical: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 90, 54, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    ...FONTS.bold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    ...FONTS.medium,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkSlateLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  badgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    ...FONTS.semiBold,
  },
  jsonBody: {
    backgroundColor: '#13161C',
    borderTopWidth: 1,
    borderTopColor: COLORS.darkSlateLight,
    padding: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jsonTag: {
    color: '#718096',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    ...FONTS.semiBold,
  },
  jsonText: {
    color: '#68D391',
    fontFamily: 'monospace',
    fontSize: 11.5,
    lineHeight: 18,
  },
});
