import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Sparkles } from "lucide-react";

interface HomeFormProps {
  onSubmit: (data: { name: string; dob: string; gender: string }) => void;
}

const HomeForm: React.FC<HomeFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("palmReaderUserData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.dob) setDob(data.dob);
        if (data.gender) setGender(data.gender);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      "palmReaderUserData",
      JSON.stringify({ name, dob, gender })
    );
  }, [name, dob, gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob) return;
    onSubmit({ name: name.trim(), dob, gender });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-4 inline-block animate-float"
        >
          🔮
        </motion.div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-glow mb-3 bg-gradient-to-r from-mystic-200 via-mystic-300 to-gold-400 bg-clip-text text-transparent">
          AI Palm Reader
        </h1>
        <p className="text-mystic-200/70 text-sm leading-relaxed max-w-xs mx-auto">
          Unlock the secrets written in your palm through ancient Indian Vedic astrology
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="text-center mb-2">
          <span className="text-xs uppercase tracking-[0.2em] text-mystic-300/60 font-medium">
            Step 1 of 4 — Enter Details
          </span>
          <div className="flex gap-1.5 justify-center mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === 1 ? "w-8 bg-mystic-400" : "w-4 bg-mystic-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs uppercase tracking-wider text-mystic-300/80 font-medium mb-2 flex items-center gap-2">
            <User size={14} />
            Full Name
          </label>
          <input
            id="input-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="w-full px-4 py-3 rounded-xl bg-mystic-800/60 border border-mystic-500/20 text-mystic-100 placeholder:text-mystic-400/40 focus:outline-none focus:border-mystic-400/50 focus:ring-2 focus:ring-mystic-400/20 transition-all text-sm"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="text-xs uppercase tracking-wider text-mystic-300/80 font-medium mb-2 flex items-center gap-2">
            <Calendar size={14} />
            Date of Birth
          </label>
          <input
            id="input-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-mystic-800/60 border border-mystic-500/20 text-mystic-100 focus:outline-none focus:border-mystic-400/50 focus:ring-2 focus:ring-mystic-400/20 transition-all text-sm [color-scheme:dark]"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs uppercase tracking-wider text-mystic-300/80 font-medium mb-2 flex items-center gap-2">
            <Sparkles size={14} />
            Gender <span className="text-mystic-500/60">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(gender === g ? "" : g)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  gender === g
                    ? "bg-mystic-500/30 border border-mystic-400/50 text-mystic-100 glow-purple"
                    : "bg-mystic-800/40 border border-mystic-600/20 text-mystic-300/60 hover:border-mystic-500/30 hover:text-mystic-200"
                }`}
              >
                {g === "Male" ? "♂️" : g === "Female" ? "♀️" : "⚧️"} {g}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          id="btn-submit-details"
          type="submit"
          disabled={!name.trim() || !dob}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl btn-mystic text-white font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          Continue to Palm Scan →
        </motion.button>
      </form>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <p className="text-mystic-400/60 text-xs">
          🔥 <span className="text-mystic-300/70 font-medium">12,543</span> people checked their palm today
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HomeForm;
