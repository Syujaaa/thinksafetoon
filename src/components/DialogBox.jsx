import { memo } from "react";
import { motion } from "framer-motion";

const DialogBox = ({
  speaker,
  text,
  isTypingDone,
  onContinue,
  autoMode,
  skipMode,
}) => {
  return (
    <motion.div
      className="w-full rounded-2xl border border-white/20 bg-black/45 p-4 shadow-[0_0_24px_rgba(56,189,248,0.18)] backdrop-blur-xl sm:p-5 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onContinue}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="rounded-full border border-cyan-300/60 bg-cyan-400/10 px-4 py-1 text-sm font-semibold tracking-wide text-cyan-200">
          {speaker || "Narrator"}
        </h3>
        <div className="flex items-center gap-2 text-xs text-cyan-100/80">
          {autoMode && <span className="rounded-full bg-cyan-500/20 px-2 py-1">AUTO</span>}
          {skipMode && <span className="rounded-full bg-violet-500/20 px-2 py-1">SKIP</span>}
        </div>
      </div>

      <p className="min-h-24 text-sm leading-relaxed text-white sm:text-base md:text-lg">{text}</p>

      <div className="mt-4 text-right text-xs text-slate-300">
        {isTypingDone ? "Klik untuk lanjut" : "Sedang mengetik..."}
      </div>
    </motion.div>
  );
};

export default memo(DialogBox);
