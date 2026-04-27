import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Share2, Copy, RotateCcw, CheckCircle, MessageCircle } from "lucide-react";
import type { PalmReading, UserData } from "../utils/astrology";
import { AdBanner } from "./AdPlacements";

interface ResultSectionProps {
  reading: PalmReading;
  userData: UserData;
  palmImage: string;
  onRetry: () => void;
}

const testimonials = [
  { name: "Priya S.", text: "This was shockingly accurate! My career prediction came true within weeks! 🙏", stars: 5 },
  { name: "Rahul K.", text: "I was skeptical but the marriage prediction gave me goosebumps. Incredible!", stars: 5 },
  { name: "Anita M.", text: "The health advice was so spot on. I started following it immediately.", stars: 4 },
  { name: "Vikram J.", text: "Shared with my whole family. Everyone was amazed by the accuracy! 🔮", stars: 5 },
];

const ResultSection: React.FC<ResultSectionProps> = ({
  reading,
  userData,
  palmImage,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedPrediction, setExpandedPrediction] = useState<number | null>(null);
  const [shareCount, setShareCount] = useState(() => {
    return parseInt(localStorage.getItem('palm_share_count') || '0');
  });

  const incrementShare = () => {
    const newCount = Math.min(shareCount + 1, 5);
    setShareCount(newCount);
    localStorage.setItem('palm_share_count', newCount.toString());
  };

  const shareText = `🔮 I just got my AI Palm Reading based on Indian Vedic Astrology! My Rashi is ${reading.rashi} and my ruling planet is ${reading.rulingPlanet}. Try it free: ${window.location.href}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      incrementShare();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleWhatsAppShare = () => {
    incrementShare();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto space-y-5 pb-24"
    >
      <div className="mb-2"><AdBanner position="top" /></div>
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-6xl mb-3 inline-block"
        >
          ✨
        </motion.div>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent text-glow-gold">
          Your Vedic Palm Reading
        </h2>
        <p className="text-mystic-300/60 text-sm mt-2">
          Personalized for <span className="text-mystic-200 font-medium">{userData.name}</span>
        </p>
      </motion.div>

      {/* Palm Image Thumbnail */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-4">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-mystic-500/20">
            <img src={palmImage} alt="Your palm" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-mystic-400/60 block">Rashi</span>
                <span className="text-mystic-100 font-medium">{reading.rashi}</span>
              </div>
              <div>
                <span className="text-mystic-400/60 block">Nakshatra</span>
                <span className="text-mystic-100 font-medium">{reading.nakshatra}</span>
              </div>
              <div>
                <span className="text-mystic-400/60 block">Planet</span>
                <span className="text-mystic-100 font-medium">{reading.rulingPlanet}</span>
              </div>
              <div>
                <span className="text-mystic-400/60 block">Lucky</span>
                <span className="text-mystic-100 font-medium">
                  {reading.luckyNumber} • {reading.luckyColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* In-content Ad */}
      <motion.div variants={itemVariants}>
        <AdBanner position="inline" />
      </motion.div>

      {/* Predictions */}
      {reading.predictions.map((prediction, index) => (
        <motion.div
          key={prediction.category}
          variants={itemVariants}
          className="glass rounded-2xl overflow-hidden"
        >
          <button
            onClick={() =>
              setExpandedPrediction(expandedPrediction === index ? null : index)
            }
            className="w-full p-5 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{prediction.emoji}</span>
                  <span className="text-xs uppercase tracking-wider text-mystic-400/60 font-medium">
                    {prediction.category}
                  </span>
                </div>
                <h3 className="font-cinzel text-lg font-semibold text-mystic-100 mb-2">
                  {prediction.title}
                </h3>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= prediction.rating
                          ? "text-gold-400 fill-gold-400"
                          : "text-mystic-600"
                      }
                    />
                  ))}
                </div>
              </div>
              <motion.span
                animate={{ rotate: expandedPrediction === index ? 180 : 0 }}
                className="text-mystic-400/50 text-sm mt-1 shrink-0"
              >
                ▾
              </motion.span>
            </div>

            {/* Preview or full text */}
            <motion.div
              initial={false}
              animate={{
                height: expandedPrediction === index ? "auto" : "3.2em",
                opacity: 1,
              }}
              className="overflow-hidden mt-3"
            >
              <p className="text-mystic-200/70 text-sm leading-relaxed">
                {prediction.description}
              </p>
            </motion.div>
          </button>
        </motion.div>
      ))}

      <AdBanner position="inline" />

      {/* Overall Fortune */}
      <motion.div
        variants={itemVariants}
        className="glass-strong rounded-2xl p-6 border-gold-500/20"
      >
        <div className="text-center mb-3">
          <span className="text-xs uppercase tracking-[0.2em] text-gold-400/80 font-cinzel font-semibold">
            ✧ Overall Fortune ✧
          </span>
        </div>
        <p className="text-mystic-100/90 text-sm leading-relaxed text-center italic">
          "{reading.overallFortune}"
        </p>
      </motion.div>

      {/* Secret Reward Section */}
      <motion.div
        variants={itemVariants}
        className="glass-strong rounded-2xl p-6 border-mystic-500/30 relative overflow-hidden"
      >
        {shareCount < 5 ? (
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-cinzel font-bold text-mystic-100 mb-2">Unlock Premium Destiny</h3>
            <p className="text-mystic-300/80 text-sm mb-4">
              Share your reading with 5 friends to reveal your hidden wealth timeline and soulmate secret!
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-mystic-900/50 h-3 rounded-full mb-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                initial={{ width: 0 }}
                animate={{ width: `${(shareCount / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-gold-400 text-xs font-bold">{shareCount} / 5 Shares Completed</p>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppShare}
              className="mt-4 w-full py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600/30 transition-colors"
            >
              <MessageCircle size={16} /> Share on WhatsApp to Unlock
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-cinzel font-semibold mb-3 block">
              🌟 Premium Destiny Unlocked
            </span>
            <p className="text-mystic-100/90 text-sm leading-relaxed mb-3">
              Your hidden fate line indicates a major unexpected turning point within the next 2 years. 
              Financially, an opportunity linked to foreign lands or digital assets will bring sudden gains.
            </p>
            <div className="p-3 bg-mystic-900/50 rounded-xl border border-gold-500/20">
              <span className="block text-xs text-mystic-400/80 mb-1">Soulmate Hint:</span>
              <span className="text-gold-300 text-sm font-medium">Initial: A, S, or R • Met near water or music</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Special Message */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-5 border-mystic-400/20"
      >
        <p className="text-xs uppercase tracking-wider text-mystic-300/60 mb-2 font-medium">
          🙏 Vedic Remedy
        </p>
        <p className="text-mystic-200/80 text-sm leading-relaxed">
          {reading.specialMessage}
        </p>
      </motion.div>

      {/* Testimonials */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-center text-xs uppercase tracking-[0.15em] text-mystic-400/60 font-medium">
          What Others Say
        </h3>
        <div className="space-y-2.5">
          {testimonials.map((t, i) => (
            <div key={i} className="glass rounded-xl p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mystic-500 to-mystic-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-mystic-100 text-xs font-medium">{t.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={8} className="text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                </div>
                <p className="text-mystic-300/70 text-xs leading-relaxed">"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Counter */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-mystic-400/50 text-xs">
          🔥{" "}
          <span className="text-mystic-300/70 font-medium">
            {(12543 + Math.floor(Date.now() / 100000) % 500).toLocaleString()}
          </span>{" "}
          people checked their palm today
        </p>
      </motion.div>

      <AdBanner position="inline" />

      {/* Share & Actions */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600/30 transition-colors"
          >
            <MessageCircle size={16} /> Share on WhatsApp
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="py-3 px-5 rounded-xl bg-mystic-700/30 border border-mystic-500/20 text-mystic-200 flex items-center justify-center gap-2 hover:bg-mystic-700/50 transition-colors text-sm"
          >
            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              incrementShare();
              if (navigator.share) {
                navigator.share({ title: "AI Palm Reader", text: shareText, url: window.location.href });
              }
            }}
            className="py-3 px-5 rounded-xl bg-mystic-700/30 border border-mystic-500/20 text-mystic-200 flex items-center justify-center gap-2 hover:bg-mystic-700/50 transition-colors text-sm"
          >
            <Share2 size={16} />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="w-full py-3.5 rounded-xl bg-mystic-700/20 border border-mystic-500/15 text-mystic-300/70 font-medium text-sm flex items-center justify-center gap-2 hover:text-mystic-200 hover:bg-mystic-700/40 transition-colors"
        >
          <RotateCcw size={14} /> Try Again with Different Palm
        </motion.button>
      </motion.div>

      <div className="mt-8"><AdBanner position="bottom" /></div>
    </motion.div>
  );
};

export default ResultSection;
