import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import HomeForm from "./components/HomeForm";
import CameraCapture from "./components/CameraCapture";
import PalmCanvas from "./components/PalmCanvas";
import AdUnlock from "./components/AdUnlock";
import ResultSection from "./components/ResultSection";
import { AdBanner, StickyBottomAd, PopupAd } from "./components/AdPlacements";
import { generateReading, type UserData, type PalmReading } from "./utils/astrology";

type Step = "form" | "camera" | "processing" | "adUnlock" | "result";

function App() {
  const [step, setStep] = useState<Step>("form");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [showPopupAd, setShowPopupAd] = useState(false);

  const handleFormSubmit = (data: { name: string; dob: string; gender: string }) => {
    setUserData(data);
    setStep("camera");
    // Show popup ad on transition
    setShowPopupAd(true);
  };

  const handleCapture = (imageDataUrl: string) => {
    setPalmImage(imageDataUrl);
    setStep("processing");
  };

  const handleProcessingComplete = useCallback(() => {
    if (userData) {
      const result = generateReading(userData);
      setReading(result);
    }
    setStep("adUnlock");
  }, [userData]);

  const handleUnlocked = () => {
    setStep("result");
  };

  const handleRetry = () => {
    setPalmImage(null);
    setReading(null);
    setStep("camera");
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated stars background */}
      <div className="stars" />

      {/* Top banner ad */}
      <div className="sticky top-0 z-30 p-2 bg-mystic-900/80 backdrop-blur-md">
        <AdBanner position="top" />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-4 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <HomeForm key="form" onSubmit={handleFormSubmit} />
          )}

          {step === "camera" && (
            <CameraCapture
              key="camera"
              onCapture={handleCapture}
              onBack={handleBackToForm}
            />
          )}

          {step === "processing" && palmImage && (
            <PalmCanvas
              key="processing"
              imageUrl={palmImage}
              onComplete={handleProcessingComplete}
            />
          )}

          {step === "adUnlock" && (
            <AdUnlock key="adUnlock" onUnlocked={handleUnlocked} />
          )}

          {step === "result" && reading && userData && palmImage && (
            <ResultSection
              key="result"
              reading={reading}
              userData={userData}
              palmImage={palmImage}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Sticky bottom ad */}
      <StickyBottomAd />

      {/* Popup ad */}
      <PopupAd
        isOpen={showPopupAd}
        onClose={() => setShowPopupAd(false)}
        onAdComplete={() => {}}
      />
    </div>
  );
}

export default App;
