/**
 * Camera QR scanner hook.
 *
 * Behavior:
 *   - Requests camera permission before opening the stream. Never
 *     crashes on permission denial — surfaces a friendly error to the
 *     caller and exposes a `retry` action.
 *   - Prefers the rear (environment) camera when available. When the
 *     device exposes multiple video inputs, the hook enumerates them
 *     and the caller can call `switchCamera` to cycle to the next one.
 *   - Releases the camera immediately on:
 *       * a successful scan (handled by the hook itself), or
 *       * `stop()` being called (the dialog teardown calls this on
 *         close, so leaving the QR reader always frees the camera).
 *   - Exposes a `cameras` list, a `currentCameraId`, and a `switchCamera`
 *     action so the UI can offer a manual camera switcher when more
 *     than one camera is available.
 */

import { useEffect, useRef, useState } from 'react';
import { decodeQr } from '../services/protocol/qr';

export interface QrCamera {
  deviceId: string;
  label: string;
}

export interface QrScannerState {
  /** Decoded text, or null if no code has been found yet. */
  result: string | null;
  /** True while the camera is live. */
  active: boolean;
  /** Error message, or null. */
  error: string | null;
  /**
   * True if the browser denied camera access (or the user dismissed
   * the prompt). The UI should show a Retry button.
   */
  permissionDenied: boolean;
  /**
   * True if multiple cameras are available and the user can switch
   * between them via `switchCamera`.
   */
  hasMultipleCameras: boolean;
  /** Manually stop the camera. */
  stop: () => void;
  /**
   * Start (or restart) the camera. Re-requests permission on every
   * call so it doubles as a Retry action.
   */
  start: () => Promise<void>;
  /** Switch to the next available camera (only when hasMultipleCameras). */
  switchCamera: () => Promise<void>;
}

export function useQrScanner(videoRef: React.RefObject<HTMLVideoElement | null>): QrScannerState {
  const [result, setResult] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameras, setCameras] = useState<QrCamera[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);

  const releaseStream = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      try {
        for (const track of streamRef.current.getTracks()) track.stop();
      } catch {
        /* ignore: tracks may already be ended */
      }
      streamRef.current = null;
    }
  };

  const stop = () => {
    stoppedRef.current = true;
    releaseStream();
    setActive(false);
  };

  const isPermissionDeniedError = (e: unknown): boolean => {
    if (!e || typeof e !== 'object') return false;
    const name = (e as { name?: string }).name;
    if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
      return true;
    }
    // Some browsers (older Safari) bubble a DOMException with the
    // message "Permission denied".
    const message = (e as { message?: string }).message ?? '';
    return /permission\s*denied/i.test(message);
  };

  const enumerateCameras = async (): Promise<QrCamera[]> => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return [];
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Camera' }));
    } catch {
      return [];
    }
  };

  const openStream = async (deviceId: string | null) => {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: 'environment' } },
    };
    return navigator.mediaDevices.getUserMedia(constraints);
  };

  const attachAndDecode = (stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) {
      throw new Error('No video element to attach the stream to.');
    }
    video.srcObject = stream;
    return video.play().then(() => {
      setActive(true);
      const tick = () => {
        if (stoppedRef.current) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          const w = v.videoWidth;
          const h = v.videoHeight;
          if (w > 0 && h > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              try {
                ctx.drawImage(v, 0, 0, w, h);
                const img = ctx.getImageData(0, 0, w, h);
                const text = decodeQr(img.data, w, h);
                if (text) {
                  setResult(text);
                  // Release the camera immediately on a successful scan.
                  stop();
                  return;
                }
              } catch {
                /* ignore frame errors and try the next one */
              }
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });
  };

  const start = async () => {
    setError(null);
    setResult(null);
    setPermissionDenied(false);
    stoppedRef.current = false;
    releaseStream();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available in this browser.');
      setActive(false);
      return;
    }

    try {
      // Preferred: pick a specific rear camera when possible.
      const detected = await enumerateCameras();
      setCameras(detected);

      let stream: MediaStream;
      let usedDeviceId: string | null = null;
      if (detected.length > 0) {
        // Prefer a device whose label mentions "back" / "rear" /
        // "environment"; fall back to the first one.
        const rear = detected.find((c) => /back|rear|environment/i.test(c.label));
        usedDeviceId = rear?.deviceId ?? detected[0].deviceId;
        try {
          stream = await openStream(usedDeviceId);
        } catch {
          // Some devices reject exact deviceId constraints; fall back
          // to facingMode.
          stream = await openStream(null);
          usedDeviceId = null;
        }
      } else {
        stream = await openStream(null);
      }

      streamRef.current = stream;
      setCurrentCameraId(usedDeviceId);

      // After permission is granted, labels are populated — re-list.
      const post = await enumerateCameras();
      if (post.length > 0) setCameras(post);

      await attachAndDecode(stream);
    } catch (e) {
      if (isPermissionDeniedError(e)) {
        setPermissionDenied(true);
        setError(
          'Camera access was blocked. Please allow camera permission for this app, then tap Retry.',
        );
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
      setActive(false);
      releaseStream();
    }
  };

  const currentDeviceIndex = (): number => {
    if (!currentCameraId) return 0;
    const i = cameras.findIndex((c) => c.deviceId === currentCameraId);
    return i < 0 ? 0 : i;
  };

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const idx = currentDeviceIndex();
    const next = cameras[(idx + 1) % cameras.length];
    stoppedRef.current = false;
    releaseStream();
    setActive(false);
    setError(null);
    try {
      const stream = await openStream(next.deviceId);
      streamRef.current = stream;
      setCurrentCameraId(next.deviceId);
      await attachAndDecode(stream);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setActive(false);
      releaseStream();
    }
  };

  useEffect(() => {
    return () => {
      // Always release the camera when the hook unmounts.
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    result,
    active,
    error,
    permissionDenied,
    hasMultipleCameras: cameras.length > 1,
    stop,
    start,
    switchCamera,
  };
}
