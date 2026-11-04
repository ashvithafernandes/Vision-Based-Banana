# 🍌 RipeScan - Offline Banana Ripening & Carbide Detection Flutter App

A modern, standalone offline Flutter mobile application for farmers and consumers to detect artificially ripened bananas treated with Calcium Carbide ($CaC_2$) versus naturally ripened bananas.

---

## 📱 Design & User Experience (Modeled After Reference UI)
- **Palette**: Soft ice-blue backdrop (`#EDF2F6`), crisp white neo-morphic cards, vivid coral accents (`#FF5A36`), and fresh organic mint green.
- **Top Header**: Personalized farmer greeting with custom status avatars.
- **Card Metrics**: Clean pill cards displaying Edge AI model footprint (`3.28 MB`), confidence, and 3-class OOD shield.
- **Camera Viewfinder**: Viewfinder viewport with focus corner brackets `[ ]` and a large circular **SCAN** trigger.
- **Loading HUD**: Real-time animated indicator showing preprocessing (224x224) and offline MobileNetV3 inference.
- **Farmer Guidance Card**: Clear visual indicators (Green = Naturally Ripened, Red/Amber = Carbide Warning, Blue = Invalid/Non-Banana).
- **Raw JSON Inspector**: Styled dark collapsible telemetry card displaying probabilities, latency, and device telemetry with a 1-tap **Copy JSON** button.
- **Curved Bottom Bar**: Floating dark slate navigation bar matching the design reference.

---

## 🚀 Model Details
- **Architecture**: MobileNetV3-Large Transfer Learning (Quantized TFLite).
- **Size**: **3.28 MB** (bundled locally in `assets/models/`).
- **Classes**:
  1. `With Carbide` (Hazardous chemical ripening)
  2. `Without Carbide` (Safe organic ripening)
  3. `Not a Banana` (Rejection guardrail)
- **Engine**: 100% on-device CPU execution via `tflite_flutter` (no server, no internet required).

---

## 🛠️ How to Run the App

1. Ensure you have the Flutter SDK installed on your development machine:
   ```bash
   flutter doctor
   ```

2. Open the project folder:
   ```bash
   cd d:\Datasets\carbide_detection_app
   ```

3. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

4. Run on a connected Android/iOS device or emulator:
   ```bash
   flutter run
   ```
