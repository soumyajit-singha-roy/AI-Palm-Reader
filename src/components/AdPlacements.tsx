import React from "react";

interface AdBannerProps {
  position: "top" | "bottom" | "inline";
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className = "" }) => {
  const sizeClass =
    position === "top"
      ? "h-16 sm:h-20"
      : position === "bottom"
      ? "h-14 sm:h-16"
      : "h-24 sm:h-28";

  return (
    <div
      className={`ad-placeholder w-full ${sizeClass} rounded-lg flex items-center justify-center text-mystic-300/40 text-xs select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-widest">Advertisement</span>
        <span className="text-mystic-400/30 text-[9px]">
          {position === "top" ? "728 × 90" : position === "bottom" ? "320 × 50" : "300 × 250"}
        </span>
      </div>
    </div>
  );
};

export const StickyBottomAd: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-mystic-900/90 backdrop-blur-md border-t border-mystic-500/20">
      <AdBanner position="bottom" />
    </div>
  );
};

interface PopupAdProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

export const PopupAd: React.FC<PopupAdProps> = ({ isOpen, onClose, onAdComplete }) => {
  const [countdown, setCountdown] = React.useState(5);
  const [canClose, setCanClose] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-6 max-w-sm w-full text-center relative">
        {/* Close button */}
        {canClose ? (
          <button
            onClick={() => {
              onAdComplete();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-mystic-500/30 flex items-center justify-center text-mystic-100 hover:bg-mystic-500/50 transition-colors text-sm font-bold"
          >
            ✕
          </button>
        ) : (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-mystic-500/20 flex items-center justify-center text-mystic-300 text-sm">
            {countdown}
          </div>
        )}

        <div className="ad-placeholder w-full h-48 rounded-xl flex items-center justify-center mb-4 mt-4">
          <div className="flex flex-col items-center gap-2 text-mystic-300/50">
            <span className="text-4xl">📺</span>
            <span className="text-xs uppercase tracking-widest">Video Ad Playing...</span>
            <div className="w-32 h-1.5 bg-mystic-700 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-mystic-400 to-gold-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-mystic-200 text-sm">
          {canClose ? "Ad complete! Close to continue ✨" : `Please wait ${countdown}s...`}
        </p>
      </div>
    </div>
  );
};
