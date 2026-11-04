import React, { useState } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import CustomBottomNav from './src/components/CustomBottomNav';

// Suppress deprecated warnings and yellow popups from blocking mobile screen
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
LogBox.ignoreAllLogs(true);

export default function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [initialAction, setInitialAction] = useState(null); // 'camera' or 'gallery'

  const handleOpenScanner = (action = null) => {
    setInitialAction(action);
    setSelectedTab(1);
  };

  const handleCloseScanner = () => {
    setInitialAction(null);
    setSelectedTab(0);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" translucent backgroundColor="transparent" />

        {selectedTab === 1 ? (
          <ScannerScreen
            initialAction={initialAction}
            onBack={handleCloseScanner}
          />
        ) : (
          <>
            <HomeScreen
              onOpenScanner={() => handleOpenScanner('camera')}
              onOpenGallery={() => handleOpenScanner('gallery')}
            />
            <CustomBottomNav
              selectedIndex={selectedTab}
              onSelect={(index) => {
                if (index === 1) {
                  handleOpenScanner('camera');
                } else {
                  setSelectedTab(index);
                }
              }}
            />
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
