import { SERVER_URL } from './config';

export const CLASS_NAMES = ['With Carbide', 'Without Carbide', 'Not a Banana'];

/**
 * Classifier service:
 * Calls the local Two-Stage AI server (YOLOv8 Gatekeeper + MobileNetV3 TFLite).
 */
export async function classifyImage(imageUri) {
  // 1. Convert image URI to binary blob
  let blob;
  try {
    const response = await fetch(imageUri);
    blob = await response.blob();
  } catch (fetchErr) {
    throw new Error(`Failed to read selected image: ${fetchErr.message}`);
  }

  // 2. Send to AI server for two-stage inference
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const serverResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'ngrok-skip-browser-warning': 'true',
      },
      body: blob,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (serverResponse.ok) {
      const serverResult = await serverResponse.json();
      console.log('[Two-Stage AI] Inference success:', serverResult.predictedClass);
      return serverResult;
    } else {
      throw new Error(`Server returned status ${serverResponse.status}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        'AI server timed out (30s). The first inference may take longer as YOLO warms up. Please try again.'
      );
    }
    throw new Error(
      `Cannot connect to AI server at ${SERVER_URL}.\n\nPlease ensure:\n1. model_server.py is running on your PC\n2. Your phone and PC are on the same Wi-Fi\n3. Windows Firewall allows port 5000`
    );
  }
}
