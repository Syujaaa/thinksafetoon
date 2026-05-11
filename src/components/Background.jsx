import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Background = ({ background }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={background || "empty-bg"}
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: background ? `url(${background})` : "none" }}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/55" />
    </div>
  );
};

export default memo(Background);
