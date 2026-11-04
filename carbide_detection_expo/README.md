# 🍌 RipeScan - Banana Ripening & Carbide Detection (Expo SDK 57)

A React Native mobile application built on **Expo SDK 57**, designed to run directly inside the **Expo Go** mobile app on your Android or iOS device.

---

## 🎨 UI Design (Modeled Directly on Your Reference Image)

- **Palette**: Soft icy blue background (`#EDF2F6`), crisp white neo-morphic cards, vivid coral accents (`#FF5A36`), and fresh organic mint green.
- **Top Header**: Personalized farmer greeting (`Hello, Farmer 🌾`), logo circle, and avatar.
- **Stat Cards (Screen 1)**: Two pill cards showing Edge AI status, model footprint (`3.28 MB`), and 3-class OOD protection.
- **Hero Diagnostic Card**: Curved gradient card with fruit badge, real-time alert, and instant scan arrow trigger.
- **Viewfinder Screen (Screen 3)**: Full-screen camera viewport with focus corner brackets `[  ]`.
- **Large Circular SCAN Button**: Vibrant coral-orange trigger matching the reference UI.
- **Loading State**: Animated HUD indicator (*"Preprocessing 224x224 pixels..."* $\rightarrow$ *"Running offline MobileNetV3 inference..."*).
- **Farmer Diagnosis Card**: Color-coded diagnosis (Mint Green for Organic Safe, Coral/Red for Carbide Warning, Blue for Non-Banana) + class probability distribution meters.
- **Raw JSON Inspector**: Styled dark collapsible telemetry card with a 1-tap **Copy JSON** button.
- **Floating Dark Slate Navigation Bar**: Curved pill bar (`#1E222A`) with circular illuminated active indicators.

---

## 🚀 How to Run in Expo Go on Your Mobile

1. Open your terminal in the project folder:
   ```bash
   cd d:\Datasets\carbide_detection_expo
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open the **Expo Go** app on your phone:
   - **Android**: Tap **Scan QR code** and point your camera at the QR code in the terminal.
   - **iOS**: Open the native Camera app, point at the QR code, and tap the notification to open in Expo Go.

4. The app will bundle and open instantly on your phone!
