import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import { classifyImage } from '../services/classifier';
import ResultCard from '../components/ResultCard';

export default function ScannerScreen({ initialAction, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Loading...');

  // Auto-launch gallery if user selected "Upload Photo" from Dashboard
  useEffect(() => {
    if (initialAction === 'gallery') {
      pickImage(false);
    }
  }, [initialAction]);

  const pickImage = async (useCamera = false) => {
    try {
      let pickerResult;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permissions in settings to scan bananas.'
          );
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.9,
          allowsEditing: true,
          aspect: [1, 1],
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Permission Required',
            'Please grant gallery access to select fruit photos.'
          );
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.9,
          allowsEditing: true,
          aspect: [1, 1],
        });
      }

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        setSelectedImage(uri);
        setLoading(true);
        setLoadingStep('Preprocessing image (224x224)...');

        setTimeout(() => {
          setLoadingStep('Running offline MobileNetV3 inference...');
        }, 350);

        const res = await classifyImage(uri);
        setResult(res);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Analysis Error', err.message || 'Failed to process image');
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedImage(null);
  };

  const showTips = () => {
    Alert.alert(
      'Photo Inspection Tips',
      '• Ensure natural, even lighting.\n• Focus on peel surface and stalk variation.\n• Center the banana occupying ~70% of the viewfinder.',
      [{ text: 'Got It' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {result ? (
        <ScrollView
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.resultHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={handleReset}>
              <Ionicons name="arrow-back" size={20} color={COLORS.darkSlate} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Diagnostic Result</Text>
          </View>

          {/* Result Card */}
          <ResultCard
            result={result}
            imageUri={selectedImage}
            onScanAgain={handleReset}
          />
        </ScrollView>
      ) : (
        <View style={styles.viewfinderContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.darkSlate} />
            </TouchableOpacity>

            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.darkSlate} />
              <Text style={styles.statusPillText}>Offline Engine Ready</Text>
            </View>
          </View>

          {/* Central Viewfinder Viewport with Brackets (Screen 3 Reference) */}
          <View style={styles.viewfinderFrame}>
            {/* Viewfinder Bracket Corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.coral} />
                <Text style={styles.loadingTitle}>Analyzing Ripening...</Text>
                <Text style={styles.loadingSub}>{loadingStep}</Text>
              </View>
            ) : selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.promptBox}>
                <View style={styles.iconCircle}>
                  <Ionicons name="leaf" size={32} color={COLORS.mint} />
                </View>
                <Text style={styles.promptTitle}>Frame Banana in Viewport</Text>
                <Text style={styles.promptDesc}>
                  Ensure clear peel visibility and natural lighting
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Control Bar (Screen 3 Reference) */}
          <View style={styles.bottomBar}>
            {/* Gallery Upload */}
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => pickImage(false)}
            >
              <View style={styles.sideIconCircle}>
                <Ionicons name="images-outline" size={20} color={COLORS.darkSlate} />
              </View>
              <Text style={styles.sideBtnText}>Gallery</Text>
            </TouchableOpacity>

            {/* Circular Coral SCAN Button (Matching Reference UI) */}
            <TouchableOpacity
              style={styles.scanBtn}
              activeOpacity={0.85}
              onPress={() => pickImage(true)}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.scanBtnText}>SCAN</Text>
            </TouchableOpacity>

            {/* Tips / Guidelines */}
            <TouchableOpacity style={styles.sideBtn} onPress={showTips}>
              <View style={styles.sideIconCircle}>
                <Ionicons name="bulb-outline" size={20} color={COLORS.darkSlate} />
              </View>
              <Text style={styles.sideBtnText}>Tips</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCE7EE',
  },
  resultScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 14,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGlacierBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusPillText: {
    fontSize: 12,
    color: COLORS.darkSlate,
    ...FONTS.bold,
  },
  viewfinderFrame: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    resizeMode: 'cover',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.darkSlate,
  },
  cornerTL: {
    top: 20,
    left: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 20,
    right: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  promptBox: {
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 17,
    color: COLORS.darkSlate,
    ...FONTS.bold,
  },
  promptDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginTop: 14,
  },
  loadingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  sideBtn: {
    alignItems: 'center',
  },
  sideIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sideBtnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },
  scanBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    ...FONTS.extraBold,
    marginTop: 2,
    letterSpacing: 0.6,
  },
});
