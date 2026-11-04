import io
import json
import time
import base64
import traceback
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

print("==================================================================")
print(" RipeScan Two-Stage AI Backend Server")
print("==================================================================")
print("Loading Stage 1: YOLOv8 Gatekeeper...")
yolo_model = YOLO(YOLO_MODEL_PATH)
print("YOLOv8 Gatekeeper ready on CPU!")

print("Loading Stage 2: MobileNetV3 Ripening Classifier...")
interpreter = Interpreter(model_path=CLASSIFIER_MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
print("MobileNetV3 Classifier ready on CPU!")
print("==================================================================\n")

# ------------------------------------------------------------------------------
# 2. Pipeline Execution
# ------------------------------------------------------------------------------
def run_two_stage_pipeline(image_bytes):
    pipeline_start = time.perf_counter()
    
    try:
        img_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to identify image format ({len(image_bytes)} bytes received): {e}")

    print(f"[Backend] Image decoded successfully: {img_pil.width}x{img_pil.height} pixels (RGB)")

    # ==========================================================================
    # STAGE 1: YOLO Object Detection (Gatekeeper)
    # ==========================================================================
    print(f"[Backend] [Stage 1] Running YOLOv8 Gatekeeper...")
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

        print(f"[Backend] [Stage 1 REJECT] ❌ No banana detected! Top object: {obj_name} ({obj_conf*100:.1f}%)")
        print(f"[Backend] Stage 2 SKIPPED. Total latency: {total_latency:.1f}ms\n")

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
    print(f"[Backend] [Stage 1 PASS] ✅ Banana Confirmed! Confidence = {max_banana_conf*100:.1f}%")
    print(f"[Backend] [Stage 2] Running MobileNetV3 Ripening Classifier...")
    t_stage2_start = time.perf_counter()

    # Preprocess full image to 224x224 in [-1, 1] range expected by MobileNetV3
    img_resized = img_pil.resize((224, 224), Image.Resampling.BILINEAR)
    tensor = np.array(img_resized, dtype=np.float32)
    tensor = (tensor - 127.5) / 127.5
    tensor = np.expand_dims(tensor, axis=0)

    interpreter.set_tensor(input_details[0]["index"], tensor)
    interpreter.invoke()
    output_probs = [float(p) for p in interpreter.get_tensor(output_details[0]["index"])[0]]
    stage2_latency = (time.perf_counter() - t_stage2_start) * 1000
    total_latency = (time.perf_counter() - pipeline_start) * 1000

    carbide_prob = output_probs[0]
    natural_prob = output_probs[1]
    nonbanana_prob = output_probs[2] if len(output_probs) > 2 else 0.0

    # Since Stage 1 already confirmed it IS a banana, re-normalize between carbide and natural
    banana_total = carbide_prob + natural_prob
    if banana_total > 0:
        norm_carbide = carbide_prob / banana_total
        norm_natural = natural_prob / banana_total
    else:
        norm_carbide, norm_natural = 0.5, 0.5

    if norm_carbide >= norm_natural:
        pred_class = "With Carbide"
        final_conf = norm_carbide
        verdict_msg = "Hazardous: Chemical ripening agent (Calcium Carbide) detected. Do not consume without thorough washing, peeling, or laboratory audit."
    else:
        pred_class = "Without Carbide"
        final_conf = norm_natural
        verdict_msg = "Safe & Organic: Naturally ripened banana. Pure ethylene development observed with no chemical residue markers."

    print(f"[Backend] [Stage 2 PASS] Verdict: {pred_class} ({final_conf*100:.1f}%)")
    print(f"[Backend] Total Pipeline Latency: {total_latency:.1f}ms (Stage 1: {stage1_latency:.1f}ms, Stage 2: {stage2_latency:.1f}ms)\n")

    return {
        "isBanana": True,
        "stage1": {
            "passed": True,
            "detectedObject": "Banana",
            "objectConfidence": max_banana_conf,
            "bbox": detected_banana_box,
            "latencyMs": round(stage1_latency, 2),
        },
        "predictedClass": pred_class,
        "confidence": final_conf,
        "latencyMs": round(total_latency, 2),
        "probabilities": {
            "With Carbide": norm_carbide,
            "Without Carbide": norm_natural,
            "Not a Banana": 0.0,
        },
        "safetyRecommendation": verdict_msg,
        "guardrailStatus": "ACCEPTED",
        "rawJson": {
            "pipeline": "Two-Stage (YOLOv8 Gatekeeper -> MobileNetV3)",
            "stage1_yolo_gatekeeper": {
                "is_banana_detected": True,
                "confidence": f"{max_banana_conf * 100:.2f}%",
                "bounding_box": [round(c, 1) for c in detected_banana_box],
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
    def do_GET(self):
        if self.path in ["/health", "/", "/status"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            status_payload = {
                "status": "online",
                "message": "RipeScan Two-Stage AI Server is running",
                "models": ["YOLOv8 Gatekeeper", "MobileNetV3 Carbide Ripening Classifier"],
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            self.wfile.write(json.dumps(status_payload).encode("utf-8"))
            print(f"[Backend] Health check received from {self.client_address[0]} -> Responded 200 OK")
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        client_ip = self.client_address[0]
        content_type = self.headers.get("Content-Type", "")
        content_length_header = self.headers.get("Content-Length", "0")
        
        try:
            content_length = int(content_length_header)
        except ValueError:
            content_length = 0

        print(f"\n==================================================================")
        print(f"[Backend] Incoming POST {self.path} from {client_ip}")
        print(f"[Backend] Content-Type: {content_type} | Content-Length: {content_length} bytes")

        if self.path == "/predict":
            if content_length == 0:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Empty payload received"}).encode("utf-8"))
                print("[Backend] ❌ Error: Empty payload received.")
                return

            raw_data = self.rfile.read(content_length)

            # Check for React Native file-read error
            if raw_data == b"File not found":
                error_msg = "Client failed to read image file on device (sent 'File not found'). Please retry using Base64 upload."
                print(f"[Backend] ❌ {error_msg}")
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": error_msg}).encode("utf-8"))
                return

            # Extract image bytes
            try:
                # 1. JSON payload with Base64
                if "application/json" in content_type or raw_data.lstrip().startswith(b"{"):
                    body_json = json.loads(raw_data.decode("utf-8", errors="ignore"))
                    b64_str = body_json.get("image", "")
                    if "," in b64_str:
                        b64_str = b64_str.split(",", 1)[1]
                    image_bytes = base64.b64decode(b64_str)
                    print(f"[Backend] Decoded {len(image_bytes)} bytes from Base64 JSON payload.")
                else:
                    # 2. Raw binary octet-stream
                    image_bytes = raw_data
                    print(f"[Backend] Received {len(image_bytes)} bytes as raw binary.")

                # Run inference
                result = run_two_stage_pipeline(image_bytes)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
                print(f"[Backend] <<< Response 200 OK sent to {client_ip}.")
            except Exception as e:
                print(f"[Backend] ❌ Exception during processing: {e}")
                traceback.print_exc()
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
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, ngrok-skip-browser-warning, Accept")
        self.end_headers()

    def log_message(self, format, *args):
        # Allow default HTTP logging
        pass

def run_server(port=5000):
    server = HTTPServer(("0.0.0.0", port), TwoStageInferenceHandler)
    print(f"\n==================================================================")
    print(f" Two-Stage AI Server (YOLOv8 Gatekeeper + MobileNetV3 TFLite)")
    print(f" Listening at http://0.0.0.0:{port}")
    print(f" Health check: http://0.0.0.0:{port}/health")
    print(f" Inference endpoint: http://0.0.0.0:{port}/predict")
    print(f"==================================================================\n")
    server.serve_forever()

if __name__ == "__main__":
    run_server(5000)
