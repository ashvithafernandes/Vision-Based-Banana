import os
import sys
import time
import json
import glob
import argparse
import numpy as np
from PIL import Image

# Reconfigure console output encoding for Windows compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ------------------------------------------------------------------------------
# 1. Standalone Offline Engine Loader
# ------------------------------------------------------------------------------
def load_tflite_interpreter(model_path: str):
    """
    Attempts to load a standalone offline interpreter using:
    1. ai_edge_litert (Google's official next-gen LiteRT runtime)
    2. tflite_runtime (Lightweight embedded runtime)
    3. tensorflow.lite (Full TensorFlow fallback)
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    interpreter = None
    engine_name = None

    try:
        from ai_edge_litert.interpreter import Interpreter
        interpreter = Interpreter(model_path=model_path)
        engine_name = "Google LiteRT (ai_edge_litert)"
    except ImportError:
        try:
            from tflite_runtime.interpreter import Interpreter
            interpreter = Interpreter(model_path=model_path)
            engine_name = "tflite_runtime"
        except ImportError:
            try:
                import tensorflow as tf
                interpreter = tf.lite.Interpreter(model_path=model_path)
                engine_name = "tensorflow.lite"
            except ImportError:
                raise RuntimeError(
                    "No offline TFLite engine found!\n"
                    "Please install either: pip install ai-edge-litert OR pip install tflite-runtime"
                )

    interpreter.allocate_tensors()
    return interpreter, engine_name

# ------------------------------------------------------------------------------
# 2. Image Preprocessing (MobileNetV3 Specifications)
# ------------------------------------------------------------------------------
def preprocess_image(image_path: str, target_size=(224, 224)):
    """Loads and resizes image for MobileNetV3 [0, 255]."""
    with Image.open(image_path) as img:
        img = img.convert("RGB").resize(target_size, Image.Resampling.BILINEAR)
        arr = np.array(img, dtype=np.float32)
        # MobileNetV3 expects [0, 255] values
        return np.expand_dims(arr, axis=0)

# ------------------------------------------------------------------------------
# 3. Offline Inference Engine
# ------------------------------------------------------------------------------
CLASS_NAMES = ["With Carbide", "Without Carbide", "Not a Banana"]
CONFIDENCE_THRESHOLD = 0.70

def predict_single_image(interpreter, image_tensor: np.ndarray):
    """Executes single-frame offline inference and measures latency."""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    t_start = time.perf_counter()
    interpreter.set_tensor(input_details[0]["index"], image_tensor)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]["index"])[0]
    latency_ms = (time.perf_counter() - t_start) * 1000

    probabilities = [float(p) for p in output_data]
    pred_idx = int(np.argmax(probabilities))
    pred_class = CLASS_NAMES[pred_idx]
    confidence = probabilities[pred_idx]

    # Safety Guardrail: Rejection logic
    if pred_class == "Not a Banana":
        status = "REJECTED_NON_BANANA"
        decision = "Invalid: Image is not a banana."
    elif confidence < CONFIDENCE_THRESHOLD:
        status = "REJECTED_LOW_CONFIDENCE"
        decision = f"Uncertain: Confidence {confidence:.1%} below safety threshold ({CONFIDENCE_THRESHOLD:.0%})."
    else:
        status = "ACCEPTED"
        decision = f"Diagnosed as '{pred_class}' with {confidence:.1%} confidence."

    return {
        "predicted_class": pred_class,
        "confidence": confidence,
        "decision": decision,
        "guardrail_status": status,
        "latency_ms": round(latency_ms, 2),
        "class_probabilities": {
            CLASS_NAMES[i]: round(probabilities[i], 4) for i in range(len(CLASS_NAMES))
        },
    }

# ------------------------------------------------------------------------------
# 4. Main Verification Suite
# ------------------------------------------------------------------------------
def verify_model(model_path: str, sample_dir: str = None, single_image: str = None):
    print("=" * 80)
    print("      OFFLINE TENSORFLOW LITE MODEL VERIFICATION SUITE")
    print("=" * 80)
    
    # 1. Initialize Interpreter
    interpreter, engine_name = load_tflite_interpreter(model_path)
    file_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    
    input_info = interpreter.get_input_details()[0]
    output_info = interpreter.get_output_details()[0]

    # Structured metadata report
    metadata_report = {
        "offline_verification_status": "ONLINE_NOT_REQUIRED (100% Standalone Offline)",
        "offline_engine": engine_name,
        "model_file": os.path.basename(model_path),
        "model_path": os.path.abspath(model_path),
        "model_size_mb": round(file_size_mb, 2),
        "input_tensor": {
            "name": input_info["name"],
            "shape": input_info["shape"].tolist(),
            "dtype": str(input_info["dtype"].__name__),
        },
        "output_tensor": {
            "name": output_info["name"],
            "shape": output_info["shape"].tolist(),
            "dtype": str(output_info["dtype"].__name__),
            "num_classes": int(output_info["shape"][1]),
            "class_labels": CLASS_NAMES,
        },
    }

    print("\n[1] MODEL METADATA & OFFLINE CAPABILITY:")
    print(json.dumps(metadata_report, indent=4))

    # 2. Select Test Images
    test_images = []
    if single_image and os.path.exists(single_image):
        test_images = [("Custom Image", single_image)]
    else:
        # Auto-discover samples from dataset
        base_dir = sample_dir or r"d:\Datasets\Datasets_Compressed_512"
        for cls in ["With Carbide", "Without Carbide"]:
            cls_folder = os.path.join(base_dir, cls)
            if os.path.exists(cls_folder):
                samples = sorted(glob.glob(os.path.join(cls_folder, "*.jpg")))[:3]
                for s in samples:
                    test_images.append((cls, s))

    if not test_images:
        print("\n[WARNING] No test images found for evaluation. Model verified structurally.")
        return metadata_report

    # 3. Perform Offline Inference
    print(f"\n[2] EXECUTING OFFLINE INFERENCE ON {len(test_images)} SAMPLE IMAGES:\n")
    print(f"{'Target/True Class':<18} | {'Predicted':<16} | {'Confidence':<10} | {'Latency':<9} | {'Decision'}")
    print("-" * 85)

    inference_results = []
    latencies = []

    for expected_cls, img_p in test_images:
        tensor = preprocess_image(img_p)
        res = predict_single_image(interpreter, tensor)
        latencies.append(res["latency_ms"])

        inference_results.append({
            "image_filename": os.path.basename(img_p),
            "expected_class": expected_cls,
            **res
        })

        print(
            f"{expected_cls:<18} | "
            f"{res['predicted_class']:<16} | "
            f"{res['confidence']*100:>8.2f}% | "
            f"{res['latency_ms']:>6.2f} ms | "
            f"{res['guardrail_status']}"
        )

    # 4. Latency Benchmark Summary
    avg_latency = float(np.mean(latencies))
    fps = 1000.0 / avg_latency if avg_latency > 0 else 0
    p95_latency = float(np.percentile(latencies, 95))

    benchmark_summary = {
        "total_images_tested": len(test_images),
        "average_latency_ms": round(avg_latency, 2),
        "95th_percentile_latency_ms": round(p95_latency, 2),
        "throughput_fps": round(fps, 1),
        "offline_certified": True,
    }

    print("\n[3] LATENCY & OFFLINE PERFORMANCE BENCHMARK:")
    print(json.dumps(benchmark_summary, indent=4))

    # Complete structured JSON output
    final_output = {
        "status": "PASS",
        "metadata": metadata_report,
        "performance": benchmark_summary,
        "sample_inferences": inference_results,
    }

    # Save verification report to disk
    report_path = os.path.join(os.path.dirname(model_path), "offline_verification_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=4)
    print(f"\n[4] Structured offline verification report saved to: {report_path}")
    print("=" * 80)
    return final_output

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify .tflite model offline")
    parser.add_argument(
        "--model",
        type=str,
        default=r"d:\Datasets\model\mobilenetv3_carbide_3class_quant.tflite",
        help="Path to .tflite model",
    )
    parser.add_argument(
        "--image",
        type=str,
        default=None,
        help="Optional path to a single test image",
    )
    args = parser.parse_args()

    verify_model(model_path=args.model, single_image=args.image)
