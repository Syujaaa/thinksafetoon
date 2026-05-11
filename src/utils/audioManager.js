import { Howl } from "howler";

const createHowl = (src, options = {}) => {
  if (!src) return null;

  return new Howl({
    src: [src],
    html5: true,
    preload: true,
    ...options,
  });
};

export const createAudioManager = () => {
  let bgm = null;
  let lastBgmSrc = null;
  let ambience = null;
  let lastAmbienceSrc = null;
  const sfxCache = new Map();

  const stopBgm = () => {
    if (bgm) {
      bgm.stop();
      bgm.unload();
      bgm = null;
      lastBgmSrc = null;
    }
  };

  const playBgm = (src, volume = 0.5) => {
    if (!src) {
      stopBgm();
      return;
    }

    if (lastBgmSrc === src && bgm) {
      bgm.volume(volume);
      if (!bgm.playing()) bgm.play();
      return;
    }

    stopBgm();
    bgm = createHowl(src, { loop: true, volume });
    lastBgmSrc = src;
    bgm?.play();
  };

  const playSfx = (src, volume = 0.5) => {
    if (!src) return;

    let sound = sfxCache.get(src);
    if (!sound) {
      sound = createHowl(src, { volume });
      sfxCache.set(src, sound);
    }
    sound?.volume(volume);
    sound?.play();
  };

  const stopAmbience = () => {
    if (ambience) {
      ambience.stop();
      ambience.unload();
      ambience = null;
      lastAmbienceSrc = null;
    }
  };

  const playAmbience = (src, volume = 0.35) => {
    if (!src) {
      stopAmbience();
      return;
    }

    if (lastAmbienceSrc === src && ambience) {
      ambience.volume(volume);
      if (!ambience.playing()) ambience.play();
      return;
    }

    stopAmbience();
    ambience = createHowl(src, { loop: true, volume });
    lastAmbienceSrc = src;
    ambience?.play();
  };

  const unload = () => {
    stopBgm();
    stopAmbience();
    sfxCache.forEach((sound) => sound?.unload());
    sfxCache.clear();
  };

  return {
    playBgm,
    playAmbience,
    playSfx,
    stopBgm,
    stopAmbience,
    unload,
  };
};
