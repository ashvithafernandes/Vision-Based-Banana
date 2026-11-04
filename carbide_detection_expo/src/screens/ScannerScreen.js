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
import { classifyImage, checkServerHealth } from '../services/classifier';
import { SERVER_URL } from '../services/config';
import ResultCard from '../components/ResultCard';

export default function ScannerScreen({ initialAction, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Loading...');

  // Backend live health state
  const [serverStatus, setServerStatus] = useState({
    checking: true,
    connected: false,
    url: SERVER_URL,
    message: '',
  });

  const verifyConnection = async () => {
    setServerStatus((prev) => ({ ...prev, checking: true }));
    const status = await checkServerHealth();
    setServerStatus({
      checking: false,
      connected: status.connected,
      url: status.url,
      message: status.connected ? 'Connected' : (status.error || 'Offline'),
    });
  };

  useEffect(() => {
    verifyConnection();
  }, []);

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
          quality: 0.85,
          allowsEditing: true,
          aspect: [1, 1],
          base64: true, // Enables direct in-memory binary transmission
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
          quality: 0.85,
          allowsEditing: true,
          aspect: [1, 1],
          base64: true, // Enables direct in-memory binary transmission
        });
      }

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        setSelectedImage(asset.uri);
        setLoading(true);
        setLoadingStep('Stage 1: YOLO Gatekeeper verifying banana...');

        setTimeout(() => {
          setLoadingStep('Stage 2: Analyzing ripening & carbide markers...');
        }, 500);

        // Pass Base64 directly to bypass mobile file URI issues
        const res = await classifyImage(asset.uri, asset.base64);
        setResult(res);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert(
        'Analysis Error',
        err.message || 'Failed to process image. Please check the backend connection.'
      );
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
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
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
          {/* Top Bar with Live Backend Connection Status */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.darkSlate} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusPill,
                serverStatus.connected ? styles.statusPillConnected : styles.statusPillDisconnected,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  serverStatus.connected ? '✅ AI Backend Connected' : '❌ AI Backend Offline',
                  `Active Endpoint:\n${SERVER_URL}\n\nStatus: ${
                    serverStatus.connected
                      ? 'Connected to local model_server.py via ngrok tunnel.'
                      : `${serverStatus.message}\n\nPlease check that run_app.bat is running on your PC.`
                  }`,
                  [
                    { text: 'Retest Connection', onPress: verifyConnection },
                    { text: 'OK' },
                  ]
                );
              }}
            >
              {serverStatus.checking ? (
                <ActivityIndicator size="small" color={COLORS.coral} style={{ marginRight: 6 }} />
              ) : (
                <Ionicons
                  name={serverStatus.connected ? 'cloud-done' : 'cloud-offline'}
                  size={15}
                  color={serverStatus.connected ? '#10B981' : '#EF4444'}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.statusPillText,
                  serverStatus.connected
                    ? { color: '#065F46' }
                    : serverStatus.checking
                    ? { color: COLORS.darkSlate }
                    : { color: '#991B1B' },
                ]}
                numberOfLines={1}
              >
                {serverStatus.checking
                  ? 'Connecting...'
                  : serverStatus.connected
                  ? 'AI Server Online'
                  : 'Backend Offline (Tap to test)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Central Viewfinder Viewport with Brackets */}
          <View style={styles.viewfinderFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.coral} />
                <Text style={styles.loadingTitle}>Analyzing Banana...</Text>
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
                {/* Live URL Subtitle */}
                <Text style={styles.urlSubtitle} numberOfLines={1}>
                  Target: {SERVER_URL}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Controls Bar */}
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

            {/* Circular Coral SCAN Button */}
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusPillConnected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillDisconnected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillText: {
    fontSize: 12,
    color: COLORS.darkSlate,
    ...FONTS.bold,
  },
  viewfinderFrame: {
    flex: 1,
    marginVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.coral,
  },
  cornerTL: {
    top: 20,
    left: 20,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 20,
    right: 20,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    resizeMode: 'cover',
  },
  promptBox: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 17,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  promptDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    ...FONTS.medium,
  },
  urlSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
    ...FONTS.medium,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    marginTop: 18,
    fontSize: 16,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  loadingSub: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sideBtn: {
    alignItems: 'center',
    width: 68,
  },
  sideIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sideBtnText: {
    fontSize: 12,
    color: COLORS.darkSlate,
    ...FONTS.semiBold,
  },
  scanBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
    ...FONTS.extraBold,
  },
});
