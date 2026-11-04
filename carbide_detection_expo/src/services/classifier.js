import { SERVER_URL } from './config';

export const CLASS_NAMES = ['With Carbide', 'Without Carbide', 'Not a Banana'];

/**
 * Health check: Ping the AI server /health endpoint to verify connectivity
 */
export async function checkServerHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const healthUrl = SERVER_URL.replace(/\/predict\/?$/, '/health');

    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        url: SERVER_URL,
        message: data.message || 'Connected',
      };
    } else {
      return {
        connected: false,
        url: SERVER_URL,
        error: `Server responded with HTTP ${response.status}`,
      };
    }
  } catch (err) {
    return {
      connected: false,
      url: SERVER_URL,
      error: err.message || 'Connection timed out',
    };
  }
}

/**
 * Classifier service:
 * Calls the Two-Stage AI server (YOLOv8 Gatekeeper + MobileNetV3 TFLite) via ngrok.
 */
export async function classifyImage(imageUri, base64Data = null) {
  let requestBody;
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
  };

  // 1. Prepare payload: prefer Base64 to bypass mobile filesystem fetch quirks
  if (base64Data) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify({ image: base64Data });
  } else {
    try {
      const response = await fetch(imageUri);
      requestBody = await response.blob();
      headers['Content-Type'] = 'application/octet-stream';
    } catch (fetchErr) {
      throw new Error(`Failed to read selected image: ${fetchErr.message}`);
    }
  }

  // 2. Send to AI server for two-stage inference
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const serverResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: headers,
      body: requestBody,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseText = await serverResponse.text();
    let serverJson;
    try {
      serverJson = JSON.parse(responseText);
    } catch (e) {
      serverJson = { error: responseText };
    }

    if (serverResponse.ok) {
      console.log('[Two-Stage AI] Inference success:', serverJson.predictedClass);
      return serverJson;
    } else {
      const errorDetail = serverJson.error || `HTTP ${serverResponse.status}`;
      throw new Error(`AI Server Error: ${errorDetail}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        `AI server timed out (35s) at ${SERVER_URL}.\nThe first request may take a moment while models warm up. Please try again.`
      );
    }
    throw new Error(
      `Cannot connect to AI server at ${SERVER_URL}.\n\nDetails: ${err.message}\n\nPlease ensure:\n1. run_app.bat is running on your PC\n2. ngrok tunnel is active`
    );
  }
}
