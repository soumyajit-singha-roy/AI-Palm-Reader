import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { AdBanner } from "./AdPlacements";

// Use global handPoseDetection from CDN script
declare const window: any;

interface PalmCanvasProps {
  imageUrl: string;
  onComplete: () => void;
}

const MESSAGES = [
  { text: "Initializing AI palm scanner...", icon: "🔍" },
  { text: "Detecting hand structure...", icon: "✋" },
  { text: "Mapping life line...", icon: "💜" },
  { text: "Analyzing heart line...", icon: "❤️" },
  { text: "Processing head line...", icon: "🧠" },
  { text: "Tracing fate line...", icon: "⭐" },
  { text: "Calculating sun line...", icon: "☀️" },
  { text: "Cross-referencing Vedic charts...", icon: "📜" },
  { text: "Consulting planetary positions...", icon: "🪐" },
  { text: "Generating your reading...", icon: "✨" },
];

interface PalmLine {
  name: string;
  color: string;
  points: string;
  delay: number;
}

const PalmCanvas: React.FC<PalmCanvasProps> = ({ imageUrl, onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLines, setShowLines] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [dynamicLines, setDynamicLines] = useState<PalmLine[]>([]);
  const [isError, setIsError] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    // Message rotation
    const msgInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (prev >= MESSAGES.length - 1) {
          clearInterval(msgInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    // Complete after all animations (6.5 seconds)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // AI Hand Detection Logic
  useEffect(() => {
    let active = true;

    const detectHand = async () => {
      if (!imgRef.current) return;
      try {
        // Wait for image to fully load
        if (!imgRef.current.complete) {
          await new Promise((resolve) => {
            if (imgRef.current) {
              imgRef.current.onload = resolve;
            }
          });
        }

        const model = window.handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "lite",
        } as any;
        
        const detector = await window.handPoseDetection.createDetector(model, detectorConfig);
        
        if (!active) return;

        const hands = await detector.estimateHands(imgRef.current, {
          flipHorizontal: false
        });

        if (hands.length > 0 && active) {
          const keypoints = hands[0].keypoints;
          
          // Helper to get x, y
          const getPt = (index: number) => {
            const pt = keypoints[index];
            return { x: pt.x, y: pt.y };
          };

          // Keypoints reference:
          // 0: wrist
          // 2: thumb base
          // 5: index base
          // 9: middle base
          // 13: ring base
          // 17: pinky base

          const wrist = getPt(0);
          const thumbBase = getPt(2);
          const indexBase = getPt(5);
          const middleBase = getPt(9);
          const ringBase = getPt(13);
          const pinkyBase = getPt(17);

          // Calculate some intermediate points for smooth curves
          // Life Line: from between index/thumb, curving around thumb base to wrist
          const startLife = { x: (thumbBase.x + indexBase.x) / 2, y: (thumbBase.y + indexBase.y) / 2 };
          const midLife = { x: thumbBase.x + (wrist.x - thumbBase.x)*0.3, y: thumbBase.y + (wrist.y - thumbBase.y)*0.5 };
          
          // Heart Line: from under pinky, across to under index
          const startHeart = { x: pinkyBase.x, y: pinkyBase.y + (wrist.y - pinkyBase.y)*0.2 };
          const endHeart = { x: indexBase.x, y: indexBase.y + (wrist.y - indexBase.y)*0.2 };
          const midHeart = { x: middleBase.x, y: middleBase.y + (wrist.y - middleBase.y)*0.25 };

          // Head Line: starts with Life Line, goes across middle palm
          const startHead = startLife;
          const endHead = { x: pinkyBase.x + (wrist.x - pinkyBase.x)*0.2, y: pinkyBase.y + (wrist.y - pinkyBase.y)*0.5 };
          
          // Fate Line: from wrist up to middle finger
          const startFate = { x: wrist.x, y: wrist.y - 20 };
          const endFate = { x: middleBase.x, y: middleBase.y + (wrist.y - middleBase.y)*0.4 };

          // Sun Line: mid palm to ring finger
          const startSun = { x: ringBase.x, y: ringBase.y + (wrist.y - ringBase.y)*0.6 };
          const endSun = { x: ringBase.x, y: ringBase.y + (wrist.y - ringBase.y)*0.2 };

          const generatedLines: PalmLine[] = [
            {
              name: "Life Line",
              color: "#a855f7",
              points: `M ${startLife.x},${startLife.y} Q ${midLife.x},${midLife.y} ${wrist.x},${wrist.y}`,
              delay: 0,
            },
            {
              name: "Heart Line",
              color: "#f43f5e",
              points: `M ${startHeart.x},${startHeart.y} Q ${midHeart.x},${midHeart.y} ${endHeart.x},${endHeart.y}`,
              delay: 0.8,
            },
            {
              name: "Head Line",
              color: "#3b82f6",
              points: `M ${startHead.x},${startHead.y} Q ${(startHead.x + endHead.x)/2},${startHead.y + 10} ${endHead.x},${endHead.y}`,
              delay: 1.6,
            },
            {
              name: "Fate Line",
              color: "#fbbf24",
              points: `M ${startFate.x},${startFate.y} Q ${(startFate.x + endFate.x)/2},${(startFate.y + endFate.y)/2} ${endFate.x},${endFate.y}`,
              delay: 2.4,
            },
            {
              name: "Sun Line",
              color: "#f97316",
              points: `M ${startSun.x},${startSun.y} L ${endSun.x},${endSun.y}`,
              delay: 3.0,
            },
          ];

          setDynamicLines(generatedLines);
          setShowLines(true);

          // Activate lines sequentially
          generatedLines.forEach((line, index) => {
            setTimeout(() => {
              if (active) setActiveLine(index);
            }, 1000 + line.delay * 1000);
          });
          
        } else {
          // Fallback if hand not found in image
          setIsError(true);
        }
      } catch (err) {
        console.error("Hand detection failed", err);
        setIsError(true);
      }
    };

    detectHand();

    return () => {
      active = false;
    };
  }, [imageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-4"><AdBanner position="top" /></div>
      
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="text-5xl mb-3 inline-block"
        >
          🔮
        </motion.div>
        <h2 className="font-cinzel text-2xl font-bold text-mystic-100 mb-2">
          Analyzing Your Palm
        </h2>
        <div className="flex gap-1.5 justify-center mt-3">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= 3 ? "w-8 bg-mystic-400" : "w-4 bg-mystic-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Palm Image with Lines */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="relative rounded-xl overflow-hidden bg-mystic-900 mb-5">
          {/* Use intrinsic image aspect ratio to match SVG coordinates */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Your palm"
            className="w-full h-auto object-contain block"
          />

          {/* SVG Overlay for palm lines */}
          {showLines && imgRef.current && (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${imgRef.current.naturalWidth} ${imgRef.current.naturalHeight}`}
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ top: 0, left: 0 }}
            >
              {dynamicLines.map((line, index) => (
                <g key={line.name}>
                  {/* Glow effect */}
                  {index <= activeLine && (
                    <>
                      <path
                        d={line.points}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={imgRef.current!.naturalWidth * 0.015}
                        strokeLinecap="round"
                        opacity="0.4"
                        filter="url(#glow)"
                        className="palm-line"
                        style={{ animationDelay: `${line.delay}s` }}
                      />
                      <path
                        d={line.points}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={imgRef.current!.naturalWidth * 0.006}
                        strokeLinecap="round"
                        className="palm-line"
                        style={{ animationDelay: `${line.delay}s` }}
                      />
                    </>
                  )}
                </g>
              ))}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          )}

          {isError && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <p className="text-white text-sm px-4 text-center">
                  Could not clearly detect a hand. Using general astrology reading...
                </p>
             </div>
          )}

          {/* Scan animation overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-mystic-500/10 via-transparent to-mystic-500/10 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3], backgroundPositionY: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Line Legend */}
        <div className="flex flex-wrap gap-2 mb-5 justify-center">
          {dynamicLines.map((line, index) => (
            <motion.div
              key={line.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: index <= activeLine ? 1 : 0.3,
                scale: index <= activeLine ? 1 : 0.9,
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mystic-800/50 border border-mystic-600/20 text-[10px]"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-mystic-200/80">{line.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-mystic-300/60 text-xs">Processing</span>
            <span className="text-mystic-300/80 text-xs font-mono">
              {Math.min(progress, 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-mystic-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mystic-500 via-mystic-400 to-gold-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Status Message */}
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2"
        >
          <span className="text-mystic-200/70 text-sm">
            {MESSAGES[currentMessage]?.icon} {MESSAGES[currentMessage]?.text}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PalmCanvas;
