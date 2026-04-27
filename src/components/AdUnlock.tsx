import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, Loader2 } from "lucide-react";

interface AdUnlockProps {
  onUnlocked: () => void;
}

const AdUnlock: React.FC<AdUnlockProps> = ({ onUnlocked }) => {
  const [stage, setStage] = useState<"locked" | "watching" | "unlocked">("locked");
  const [countdown, setCountdown] = useState(4);

  const watchAd = () => {
    setStage("watching");
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStage("unlocked");
          // Vibrate if supported
          if ("vibrate" in navigator) {
            navigator.vibrate([100, 50, 100, 50, 200]);
          }
          // Play unlock sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
          } catch {
            // Audio not supported
          }
          setTimeout(onUnlocked, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="flex gap-1.5 justify-center mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="w-8 h-1.5 rounded-full bg-mystic-400"
            />
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8 text-center">
        {stage === "locked" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Blurred preview */}
            <div className="relative rounded-xl overflow-hidden bg-mystic-800/50 p-6">
              <div className="blur-lock space-y-3">
                <div className="h-4 bg-mystic-500/20 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-mystic-500/15 rounded w-full" />
                <div className="h-3 bg-mystic-500/15 rounded w-5/6" />
                <div className="h-3 bg-mystic-500/15 rounded w-4/5" />
                <div className="h-12 bg-mystic-500/10 rounded mt-4" />
                <div className="h-3 bg-mystic-500/15 rounded w-full" />
                <div className="h-3 bg-mystic-500/15 rounded w-3/4" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-mystic-900/80 backdrop-blur-sm rounded-2xl p-6 border border-mystic-400/30 glow-purple"
                >
                  <Lock size={32} className="text-gold-400 mx-auto mb-2" />
                  <p className="text-mystic-100 font-cinzel font-bold text-lg">
                    Your Future is Ready
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-mystic-200/80 text-sm">
                🔒 Your personalized Vedic palm reading has been generated.
                <br />
                Watch a short ad to unlock your destiny.
              </p>

              <motion.button
                id="btn-watch-ad"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={watchAd}
                className="w-full py-4 rounded-xl btn-gold text-lg flex items-center justify-center gap-3 animate-pulse-glow"
              >
                <Play size={20} fill="currentColor" />
                Watch Ad to Unlock
              </motion.button>

              <p className="text-mystic-500/50 text-[10px]">
                Free • Takes only 4 seconds
              </p>
            </div>
          </motion.div>
        )}

        {stage === "watching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-4"
          >
            <div className="ad-placeholder w-full h-40 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-mystic-300/50">
                <span className="text-4xl">📺</span>
                <span className="text-xs uppercase tracking-widest">
                  Ad Playing...
                </span>
              </div>
            </div>

            <div>
              <div className="w-full h-2 bg-mystic-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </div>
              <p className="text-mystic-300/60 text-sm flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Please wait {countdown}s...
              </p>
            </div>
          </motion.div>
        )}

        {stage === "unlocked" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="space-y-4 py-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h3 className="font-cinzel text-2xl font-bold text-gold-400 text-glow-gold">
              Unlocked!
            </h3>
            <p className="text-mystic-200/70 text-sm">
              Your reading is being revealed...
            </p>
            <Loader2 size={20} className="animate-spin text-mystic-400 mx-auto" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdUnlock;
