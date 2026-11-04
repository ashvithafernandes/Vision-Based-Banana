# pip install numpy opencv-python ai-edge-litert
# (if ai-edge-litert won't install on your OS, use: pip install tensorflow)
import sys, argparse
import numpy as np
import cv2

try:
    from ai_edge_litert.interpreter import Interpreter
except Exception:
    from tensorflow.lite.python.interpreter import Interpreter

COCO = ["person","bicycle","car","motorcycle","airplane","bus","train","truck","boat","traffic light",
"fire hydrant","stop sign","parking meter","bench","bird","cat","dog","horse","sheep","cow","elephant","bear",
"zebra","giraffe","backpack","umbrella","handbag","tie","suitcase","frisbee","skis","snowboard","sports ball",
"kite","baseball bat","baseball glove","skateboard","surfboard","tennis racket","bottle","wine glass","cup",
"fork","knife","spoon","bowl","banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza",
"donut","cake","chair","couch","potted plant","bed","dining table","toilet","tv","laptop","mouse","remote",
"keyboard","cell phone","microwave","oven","toaster","sink","refrigerator","book","clock","vase","scissors",
"teddy bear","hair drier","toothbrush"]
assert len(COCO) == 80 and COCO[46] == "banana"

ap = argparse.ArgumentParser()
ap.add_argument("--model", default="yolo11n.tflite")
ap.add_argument("--image", required=True)
ap.add_argument("--conf", type=float, default=0.35)
ap.add_argument("--iou", type=float, default=0.45)
a = ap.parse_args()

# 1. Load model
it = Interpreter(model_path=a.model)
it.allocate_tensors()
inp, out = it.get_input_details()[0], it.get_output_details()[0]
ishape = [int(x) for x in inp["shape"]]
print("INPUT :", ishape, np.dtype(inp["dtype"]).name, "quant:", inp["quantization"])
print("OUTPUT:", [int(x) for x in out["shape"]], np.dtype(out["dtype"]).name, "quant:", out["quantization"])

# 2. Read image, preprocess (RGB, resize, /255), match NHWC or NCHW
img_bgr = cv2.imread(a.image)
if img_bgr is None:
    sys.exit(f"Cannot read image: {a.image}")
H0, W0 = img_bgr.shape[:2]
nchw = ishape[1] == 3
S = ishape[2] if nchw else ishape[1]
x = cv2.resize(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB), (S, S)).astype(np.float32) / 255.0
x = np.transpose(x, (2, 0, 1)) if nchw else x
x = x[None]
if np.dtype(inp["dtype"]) != np.float32:           # quantized input
    sc, zp = inp["quantization"]
    x = np.clip(np.round(x / sc + zp), np.iinfo(inp["dtype"]).min, np.iinfo(inp["dtype"]).max)
x = x.astype(inp["dtype"])

# 3. Run
it.set_tensor(inp["index"], x)
it.invoke()
raw = it.get_tensor(out["index"])
if np.dtype(out["dtype"]) != np.float32:           # dequantize output
    sc, zp = out["quantization"]
    raw = (raw.astype(np.float32) - zp) * sc

# 4. Decode: expected [1, 84, N] or [1, N, 84]
pred = raw[0]
if pred.shape[0] < pred.shape[1]:
    pred = pred.T                                   # -> [N, 84]
boxes, scores = pred[:, :4], pred[:, 4:]
cls = scores.argmax(1)
conf = scores.max(1)
keep = conf >= a.conf
boxes, cls, conf = boxes[keep], cls[keep], conf[keep]

scale = S if boxes.size and boxes.max() <= 1.5 else 1   # normalized vs pixel boxes
print("Box coordinates look:", "normalized 0-1" if scale == S else "pixels")
boxes = boxes * scale
xyxy = np.stack([boxes[:, 0] - boxes[:, 2] / 2, boxes[:, 1] - boxes[:, 3] / 2, boxes[:, 2], boxes[:, 3]], 1)
xyxy[:, [0, 2]] *= W0 / S
xyxy[:, [1, 3]] *= H0 / S

# 5. NMS
dets = []
if len(conf):
    idx = cv2.dnn.NMSBoxes(xyxy.tolist(), conf.tolist(), a.conf, a.iou)
    for i in np.array(idx).flatten():
        x1, y1, w, h = xyxy[i]
        dets.append((int(cls[i]), COCO[int(cls[i])], float(conf[i]), int(x1), int(y1), int(w), int(h)))

# 6. Report + save annotated image
print(f"\nDetections (conf >= {a.conf}):")
for c, n, s, x1, y1, w, h in sorted(dets, key=lambda d: -d[2]):
    tag = "  <-- BANANA" if c == 46 else ""
    print(f"  {n} (id {c})  {s:.2f}{tag}")
    cv2.rectangle(img_bgr, (x1, y1), (x1 + w, y1 + h), (0, 255, 0) if c == 46 else (255, 0, 0), 2)
    cv2.putText(img_bgr, f"{n} {s:.2f}", (x1, max(15, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
if not dets:
    print("  nothing detected")
cv2.imwrite("result.jpg", img_bgr)
print("\nSaved result.jpg")
print("BANANA DETECTED - VALID INPUT" if any(d[0] == 46 for d in dets) else "NO BANANA DETECTED - INVALID INPUT")

