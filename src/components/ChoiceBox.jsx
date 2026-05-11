import { memo } from "react";
import { motion } from "framer-motion";

const ChoiceBox = ({ choices, onSelect }) => {
  const safeChoices = Array.isArray(choices) ? choices : [];
  if (!safeChoices.length) return null;

  return (
    <div className="mt-4 grid gap-3">
      {safeChoices.map((choice, index) => (
        <motion.button
          key={`${choice.text}-${index}`}
          type="button"
          className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3.5 text-left text-sm text-white transition hover:border-cyan-300/70 hover:bg-cyan-600/20 md:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          onClick={() => onSelect(choice)}
        >
          {choice.text}
        </motion.button>
      ))}
    </div>
  );
};

export default memo(ChoiceBox);
