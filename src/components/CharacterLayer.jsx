import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const positionClass = {
  left: "md:left-[6%]",
  center: "md:left-1/2 md:-translate-x-1/2",
  right: "md:right-[6%]",
};

const initialByAnimation = {
  slide: { opacity: 0, x: 40 },
  fade: { opacity: 0, x: 0 },
};

const getMobilePositionClass = (position, totalCharacters) => {
  if (totalCharacters >= 3) {
    if (position === "left") return "left-[1%]";
    if (position === "right") return "right-[1%]";
    return "left-1/2 -translate-x-1/2";
  }

  if (totalCharacters === 2) {
    if (position === "left") return "left-[2%]";
    if (position === "right") return "right-[2%]";
    return "left-1/2 -translate-x-1/2";
  }

  return positionClass[position] ?? positionClass.center;
};

const CharacterLayer = ({ characters = [] }) => {
  const totalCharacters = characters.length;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {characters.map((char) => {
          const mobilePosClass = getMobilePositionClass(char.position, totalCharacters);
          const desktopPosClass = positionClass[char.position] ?? positionClass.center;
          const mobileSizeClass =
            totalCharacters >= 3
              ? "h-[36vh] w-[30vw] max-w-[140px]"
              : totalCharacters === 2
                ? "h-[40vh] w-[35vw] max-w-[175px]"
                : "h-[44vh] w-[42vw] max-w-[215px]";
          const initial = initialByAnimation[char.animation] ?? initialByAnimation.fade;

          return (
            <motion.img
              key={`${char.name}-${char.position}-${char.image}`}
              src={char.image}
              alt={char.name}
              loading="lazy"
              decoding="async"
              className={`absolute bottom-56 object-contain ${mobilePosClass} ${mobileSizeClass} sm:bottom-44 sm:h-[54vh] sm:w-auto sm:max-h-[580px] sm:max-w-none md:bottom-20 md:h-[74vh] md:max-h-[760px] ${desktopPosClass}`}
              initial={initial}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default memo(CharacterLayer);
