import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, RotateCcw, Check, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onBack: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      setCameraError(true);
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stream is now attached via callback ref on the video element

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Real-time Hand Detection Overlay
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectCountRef = useRef(0);
  const [autoCapturing, setAutoCapturing] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let detector: any;
    let active = true;

    const initDetector = async () => {
      try {
        const model = window.handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "lite",
        } as any;
        detector = await window.handPoseDetection.createDetector(model, detectorConfig);
        if (active) detectFrame();
      } catch (err) {
        console.error("Failed to load detector", err);
      }
    };

    const drawLine = (ctx: CanvasRenderingContext2D, pt1: any, pt2: any, scaleX: number, scaleY: number) => {
      ctx.beginPath();
      ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
      ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
      ctx.stroke();
    };

    const detectFrame = async () => {
      if (!active) return;
      if (videoRef.current && overlayCanvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        
        // Sync canvas size with video display size
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;
        }
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          try {
            const hands = await detector.estimateHands(video, { flipHorizontal: false });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (hands.length > 0) {
              const keypoints = hands[0].keypoints;
              
              // Map video natural coordinates to canvas display coordinates
              const scaleX = canvas.width / video.videoWidth;
              const scaleY = canvas.height / video.videoHeight;

              // Connections mapping
              const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [5, 9], [9, 10], [10, 11], [11, 12], // Middle
                [9, 13], [13, 14], [14, 15], [15, 16], // Ring
                [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm
              ];

              // Draw lines (Green)
              ctx.strokeStyle = "#4ade80";
              ctx.lineWidth = 3;
              connections.forEach(([i, j]) => {
                if (keypoints[i] && keypoints[j]) {
                  drawLine(ctx, keypoints[i], keypoints[j], scaleX, scaleY);
                }
              });

              // Draw dots (Red)
              ctx.fillStyle = "#ef4444";
              keypoints.forEach((pt: any) => {
                ctx.beginPath();
                ctx.arc(pt.x * scaleX, pt.y * scaleY, 4, 0, 2 * Math.PI);
                ctx.fill();
              });

              // Auto-capture logic - lowered to 5 frames for instant response
              detectCountRef.current += 1;
              
              // Draw scanning progress text
              ctx.fillStyle = "#fbbf24";
              ctx.font = "bold 16px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(`Aligning Palm... ${Math.min(100, Math.floor((detectCountRef.current / 5) * 100))}%`, canvas.width / 2, canvas.height - 30);

              if (detectCountRef.current >= 5 && active && !autoCapturing) {
                // Auto capture instantly
                setAutoCapturing(true);
                // Call capturePhoto. We need to create a global or ref access to it, 
                // but since capturePhoto is in scope, we can't directly call it if it has stale closures.
                // We will click the hidden capture button to trigger it!
                const captureBtn = document.getElementById('btn-capture');
                if (captureBtn) captureBtn.click();
              }
            } else {
              detectCountRef.current = 0;
            }
          } catch (e) {
             // Ignore transient errors
          }
        }
      }
      if (active) {
        animationFrameId = requestAnimationFrame(detectFrame);
      }
    };

    if (cameraActive && !capturedImage) {
      detectCountRef.current = 0;
      initDetector();
    }

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, capturedImage, autoCapturing]);

  // Auto-restart camera when facingMode changes
  useEffect(() => {
    if (cameraActive || (!capturedImage && !cameraError)) {
      // Don't auto-start, user needs to click
    }
  }, [facingMode, cameraActive, capturedImage, cameraError]);

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-5xl mb-3 inline-block"
        >
          ✋
        </motion.div>
        <h2 className="font-cinzel text-2xl font-bold text-mystic-100 mb-2">
          Scan Your Palm
        </h2>
        <p className="text-mystic-300/60 text-sm">
          Place your palm facing the camera in good lighting
        </p>
        <div className="flex gap-1.5 justify-center mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= 2 ? "w-8 bg-mystic-400" : "w-4 bg-mystic-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Camera / Preview Area */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="relative rounded-xl overflow-hidden bg-mystic-900 aspect-[4/3] mb-4">
          <AnimatePresence mode="wait">
            {capturedImage ? (
              <motion.img
                key="captured"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={capturedImage}
                alt="Captured palm"
                className="w-full h-full object-cover"
              />
            ) : cameraActive ? (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && stream) {
                      el.srcObject = stream;
                      // Only call play if it's paused to avoid Uncaught (in promise) DOMException
                      if (el.paused) {
                        el.play().catch(() => {});
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none z-10" />
                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-mystic-400/30 rounded-2xl">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-mystic-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-mystic-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-mystic-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-mystic-400 rounded-br-lg" />
                  </div>
                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-mystic-400 to-transparent"
                    animate={{ top: ["10%", "85%", "10%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Hand guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg viewBox="0 0 100 100" className="w-1/2 h-1/2" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4">
                      <path d="M40,90 L40,60 C40,55 35,50 30,50 C25,50 25,45 30,40 L45,35 C45,25 45,15 50,15 C55,15 55,25 55,35 L60,35 C60,25 60,15 65,15 C70,15 70,25 70,35 L75,35 C75,25 75,20 80,20 C85,20 85,30 80,40 L75,50 C70,60 65,70 65,90 Z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-mystic-400/50 gap-3"
              >
                <Camera size={48} strokeWidth={1} />
                <p className="text-sm text-center px-4">
                  {cameraError
                    ? "Camera not available. Please upload an image instead."
                    : "Click below to start camera or upload an image"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="space-y-3">
          {capturedImage ? (
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={retake}
                className="flex-1 py-3 rounded-xl bg-mystic-700/40 border border-mystic-500/20 text-mystic-200 font-medium text-sm flex items-center justify-center gap-2 hover:bg-mystic-700/60 transition-colors"
              >
                <RotateCcw size={16} /> Retake
              </motion.button>
              <motion.button
                id="btn-confirm-palm"
                whileTap={{ scale: 0.95 }}
                onClick={confirmCapture}
                className="flex-1 py-3 rounded-xl btn-mystic text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Check size={16} /> Use This Photo
              </motion.button>
            </div>
          ) : cameraActive ? (
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={stopCamera}
                className="py-3 px-4 rounded-xl bg-mystic-700/40 border border-mystic-500/20 text-mystic-200 flex items-center justify-center hover:bg-mystic-700/60 transition-colors"
              >
                <X size={18} />
              </motion.button>
              <button id="btn-capture" onClick={capturePhoto} className="hidden" />
              <div className="flex-1 py-3 rounded-xl bg-mystic-800/80 border border-mystic-500/20 text-mystic-300 font-medium text-xs sm:text-sm flex items-center justify-center text-center px-2">
                Hold steady. AI will auto-analyze...
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleCamera}
                className="py-3 px-4 rounded-xl bg-mystic-700/40 border border-mystic-500/20 text-mystic-200 flex items-center justify-center hover:bg-mystic-700/60 transition-colors"
              >
                <RotateCcw size={18} />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {!cameraError && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className="w-full py-3.5 rounded-xl btn-mystic text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={16} /> Open Camera
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 rounded-xl bg-mystic-700/30 border border-mystic-500/20 text-mystic-200 font-medium text-sm flex items-center justify-center gap-2 hover:bg-mystic-700/50 transition-colors"
              >
                <Upload size={16} /> Upload Image
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Back */}
        <button
          onClick={onBack}
          className="w-full mt-4 py-2 text-mystic-400/60 text-xs hover:text-mystic-300 transition-colors"
        >
          ← Back to details
        </button>
      </div>
    </motion.div>
  );
};

export default CameraCapture;
