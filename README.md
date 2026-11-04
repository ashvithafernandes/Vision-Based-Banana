# Vision-Based-Banana

Vision-based detection and classification of artificially ripened (calcium carbide treated) bananas versus naturally ripened bananas.

## Overview
This repository contains the complete pipeline for dataset preprocessing, model training, and mobile applications (Flutter & React Native/Expo) for banana carbide detection using deep learning (MobileNetV3).

## Project Structure
- `carbide_detection_app/`: Flutter mobile application supporting real-time camera scanning, gallery upload, and offline TFLite inference.
- `carbide_detection_expo/`: React Native / Expo mobile application alternative.
- `model/`: MobileNetV3 quantized and FP32 TFLite models for edge inference.
- `Carbide_Detection_MobileNetV3.ipynb`: Training and fine-tuning notebook.
- `compress_dataset.py` / `unzip_datasets.py`: Preprocessing and data preparation scripts.
- `model_server.py`: FastAPI / Python inference server for remote classification.
- `verify_offline_model.py`: Validation script to test model inference accuracy.
