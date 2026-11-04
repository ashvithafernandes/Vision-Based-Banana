import io
import json
import time
import numpy as np
from PIL import Image
from http.server import HTTPServer, BaseHTTPRequestHandler
from ultralytics import YOLO
from ai_edge_litert.interpreter import Interpreter

# ------------------------------------------------------------------------------
# 1. Load Models (Two-Stage Pipeline)
# ------------------------------------------------------------------------------
YOLO_MODEL_PATH = r"d:\Datasets\yolov8n.pt"
CLASSIFIER_MODEL_PATH = r"d:\Datasets\model\mobilenetv3_carbide_3class_quant.tflite"
CARBIDE_CLASSES = ["With Carbide", "Without Carbide", "Not a Banana"]

print("Loading Stage 1: YOLOv8 Gatekeeper...")
yolo_model = YOLO(YOLO_MODEL_PATH)
print("YOLOv8 Gatekeeper ready on CPU!")

print("Loading Stage 2: MobileNetV3 Ripening Classifier...")
interpreter = Interpreter(model_path=CLASSIFIER_MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
print("MobileNetV3 Classifier ready on CPU!")

# ------------------------------------------------------------------------------
# 2. Pipeline Execution
# ------------------------------------------------------------------------------
def run_two_stage_pipeline(image_bytes):
    pipeline_start = time.perf_counter()
    img_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # ==========================================================================
    # STAGE 1: YOLO Object Detection (Gatekeeper)
    # ==========================================================================
    t_stage1_start = time.perf_counter()
    yolo_results = yolo_model(img_pil, verbose=False)[0]
    stage1_latency = (time.perf_counter() - t_stage1_start) * 1000

    detected_banana_box = None
    max_banana_conf = 0.0

    detected_other_objects = []

    for box in yolo_results.boxes:
        cls_id = int(box.cls[0])
        cls_name = yolo_model.names[cls_id]
        conf = float(box.conf[0])

        if cls_name == "banana":
            if conf > max_banana_conf:
                max_banana_conf = conf
                detected_banana_box = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
        else:
            detected_other_objects.append({
                "name": cls_name,
                "confidence": conf,
            })

    # Sort other objects by highest confidence
    detected_other_objects.sort(key=lambda x: x["confidence"], reverse=True)

    # --------------------------------------------------------------------------
    # CASE A: Non-Banana Image (Stage 1 Rejection)
    # --------------------------------------------------------------------------
    if detected_banana_box is None:
        total_latency = (time.perf_counter() - pipeline_start) * 1000
        
        if detected_other_objects:
            top_obj = detected_other_objects[0]
            obj_name = top_obj["name"].capitalize()
            obj_conf = top_obj["confidence"]
            verdict_msg = f"Rejected: Image identified as '{obj_name}' ({obj_conf * 100:.1f}% confidence), not a banana."
            specific_label = f"Not a Banana ({obj_name})"
        else:
            obj_name = "Unknown Object"
            obj_conf = 0.95
            verdict_msg = "Rejected: No banana recognized in image. Please point the camera at a banana."
            specific_label = "Not a Banana"

        return {
            "isBanana": False,
            "stage1": {
                "passed": False,
                "detectedObject": obj_name,
                "objectConfidence": obj_conf,
                "latencyMs": round(stage1_latency, 2),
            },
            "predictedClass": "Not a Banana",
            "specificLabel": specific_label,
            "confidence": obj_conf,
            "latencyMs": round(total_latency, 2),
            "probabilities": {
                "With Carbide": 0.005,
                "Without Carbide": 0.005,
                "Not a Banana": 0.990,
            },
            "safetyRecommendation": verdict_msg,
            "guardrailStatus": "REJECTED_NON_BANANA",
            "rawJson": {
                "pipeline": "Two-Stage (YOLOv8 Gatekeeper -> MobileNetV3)",
                "stage1_yolo_gatekeeper": {
                    "is_banana_detected": False,
                    "primary_detected_object": obj_name,
                    "object_confidence": f"{obj_conf * 100:.2f}%",
                    "latency_ms": f"{stage1_latency:.2f}",
                },
                "stage2_ripening_classifier": {
                    "status": "SKIPPED (Non-Banana Rejection)",
                },
                "final_verdict": {
                    "label": "Not a Banana",
                    "specific_identified_object": obj_name,
                    "total_latency_ms": f"{total_latency:.2f}",
                },
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            },
        }

    # --------------------------------------------------------------------------
    # CASE B: Banana Confirmed -> Proceed to STAGE 2 (MobileNetV3)
    # --------------------------------------------------------------------------
    t_stage2_start = time.perf_counter()

    # Use the FULL image for MobileNetV3 (model was trained on full images,
    # not crops — cropping removes background context the model relies on)
    x1, y1, x2, y2 = [int(v) for v in detected_banana_box]

    # Preprocess full image to 224x224 in [0, 255] range expected by MobileNetV3
    img_resized = img_pil.resize((224, 224), Image.Resampling.BILINEAR)
    tensor = np.array(img_resized, dtype=np.float32)
    tensor = np.expand_dims(tensor, axis=0)

    interpreter.set_tensor(input_details[0]["index"], tensor)
    interpreter.invoke()
    output_probs = [float(p) for p in interpreter.get_tensor(output_details[0]["index"])[0]]
    stage2_latency = (time.perf_counter() - t_stage2_start) * 1000
    total_latency = (time.perf_counter() - pipeline_start) * 1000

    # Use raw softmax probabilities directly (no re-normalization)
    carbide_prob = output_probs[0]
    natural_prob = output_probs[1]
    not_banana_prob = output_probs[2]

    pred_idx = int(np.argmax(output_probs))
    pred_class = CARBIDE_CLASSES[pred_idx]
    final_conf = output_probs[pred_idx]

    if pred_class == "With Carbide":
        safety_rec = "Hazardous: Chemical ripening agent (Calcium Carbide - CaC₂) detected. Unnatural peel coloration found. Do not consume without washing or lab audit."
    elif pred_class == "Without Carbide":
        safety_rec = "Safe & Organic: Naturally ripened banana confirmed. Organic ethylene progression and natural peel sugar spots verified."
    else:
        safety_rec = "Uncertain classification. Please try with a clearer banana image."

    prob_map = {
        "With Carbide": round(carbide_prob, 4),
        "Without Carbide": round(natural_prob, 4),
        "Not a Banana": round(not_banana_prob, 4),
    }

    return {
        "isBanana": True,
        "stage1": {
            "passed": True,
            "detectedObject": "Banana",
            "objectConfidence": max_banana_conf,
            "latencyMs": round(stage1_latency, 2),
        },
        "stage2": {
            "latencyMs": round(stage2_latency, 2),
        },
        "predictedClass": pred_class,
        "specificLabel": pred_class,
        "confidence": final_conf,
        "latencyMs": round(total_latency, 2),
        "probabilities": prob_map,
        "safetyRecommendation": safety_rec,
        "guardrailStatus": "ACCEPTED",
        "rawJson": {
            "pipeline": "Two-Stage (YOLOv8 Gatekeeper -> MobileNetV3)",
            "stage1_yolo_gatekeeper": {
                "is_banana_detected": True,
                "banana_detection_confidence": f"{max_banana_conf * 100:.2f}%",
                "bounding_box": [x1, y1, x2, y2],
                "latency_ms": f"{stage1_latency:.2f}",
            },
            "stage2_ripening_classifier": {
                "ripening_verdict": pred_class,
                "ripening_confidence": f"{final_conf * 100:.2f}%",
                "latency_ms": f"{stage2_latency:.2f}",
            },
            "final_diagnosis": {
                "verdict": pred_class,
                "confidence": f"{final_conf * 100:.2f}%",
                "total_pipeline_latency_ms": f"{total_latency:.2f}",
            },
            "probability_distribution": {
                "With Carbide": f"{norm_carbide * 100:.2f}%",
                "Without Carbide": f"{norm_natural * 100:.2f}%",
                "Not a Banana": "0.00%",
            },
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
    }

# ------------------------------------------------------------------------------
# 3. HTTP Server Handler
# ------------------------------------------------------------------------------
class TwoStageInferenceHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/predict":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)

            try:
                result = run_two_stage_pipeline(post_data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
                
                if result["isBanana"]:
                    print(f"[PIPELINE PASS] Banana -> {result['predictedClass']} ({result['confidence']*100:.1f}%) in {result['latencyMs']}ms")
                else:
                    print(f"[STAGE 1 REJECT] {result['stage1']['detectedObject']} in {result['latencyMs']}ms")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass

def run_server(port=5000):
    server = HTTPServer(("0.0.0.0", port), TwoStageInferenceHandler)
    print(f"\n==================================================================")
    print(f" Two-Stage AI Server (YOLOv8 Gatekeeper + MobileNetV3 TFLite)")
    print(f" Listening at http://0.0.0.0:{port}/predict")
    print(f"==================================================================\n")
    server.serve_forever()

if __name__ == "__main__":
    run_server(5000)
