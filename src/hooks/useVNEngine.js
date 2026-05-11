import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAudioManager } from "../utils/audioManager";
import { loadVNState, saveVNState } from "../utils/storage";

const DEFAULT_SETTINGS = {
  autoMode: false,
  skipMode: false,
  autoDelayMs: 1250,
  masterVolume: 0.6,
  ambienceVolume: 0.35,
  sfxVolume: 0.5,
};

const UI_SFX = {
  click: "/sfx/click.mp3",
  typing: "/sfx/typing.mp3",
  transition: "/sfx/transition.mp3",
};

export const useVNEngine = (story) => {
  const storyMap = useMemo(
    () => new Map(story.map((scene) => [scene.id, scene])),
    [story],
  );

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentSceneId, setCurrentSceneId] = useState(story[0]?.id ?? null);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [quizResultsBySceneId, setQuizResultsBySceneId] = useState({});
  const audioRef = useRef(createAudioManager());

  const currentScene = storyMap.get(currentSceneId) ?? null;

  useEffect(() => {
    setCurrentSceneId(story[0]?.id ?? null);
    setHistory([]);
    // Jangan reset score saat transisi arc - pertahankan score dari arc sebelumnya
    // setScore(0);
    setQuizResultsBySceneId({});
  }, [story]);

  useEffect(() => {
    const saved = loadVNState();
    if (!saved) return;

    if (saved.currentSceneId && storyMap.has(saved.currentSceneId)) {
      setCurrentSceneId(saved.currentSceneId);
    }
    if (Array.isArray(saved.history)) {
      setHistory(saved.history);
    }
    if (typeof saved.score === "number") {
      setScore(saved.score);
    }
    if (
      saved.quizResultsBySceneId &&
      typeof saved.quizResultsBySceneId === "object"
    ) {
      setQuizResultsBySceneId(saved.quizResultsBySceneId);
    }
    if (saved.settings) {
      setSettings((prev) => ({ ...prev, ...saved.settings }));
    }
  }, [storyMap]);

  useEffect(
    () => () => {
      audioRef.current.unload();
    },
    [],
  );

  useEffect(() => {
    if (!currentScene) return;
    audioRef.current.playBgm(currentScene.music, settings.masterVolume);
    audioRef.current.playAmbience(
      currentScene.ambience,
      settings.ambienceVolume,
    );
    audioRef.current.playSfx(UI_SFX.transition, settings.sfxVolume);
  }, [
    currentScene,
    settings.ambienceVolume,
    settings.masterVolume,
    settings.sfxVolume,
  ]);

  const persist = useCallback(
    (overrides = {}) => {
      saveVNState({
        currentSceneId,
        history,
        score,
        quizResultsBySceneId,
        settings,
        ...overrides,
      });
    },
    [currentSceneId, history, quizResultsBySceneId, score, settings],
  );

  const pushHistory = useCallback((scene) => {
    if (!scene?.text) return;

    setHistory((prev) => {
      const last = prev[prev.length - 1];
      const nextRow = {
        sceneId: scene.id,
        speaker: scene.speaker ?? "Narrator",
        text: scene.text,
      };
      if (last?.sceneId === nextRow.sceneId) return prev;
      return [...prev.slice(-79), nextRow];
    });
  }, []);

  const goToScene = useCallback(
    (sceneId) => {
      console.log(
        "[useVNEngine] goToScene called with:",
        sceneId,
        "storyMap size:",
        storyMap.size,
      );
      if (!sceneId) {
        console.warn("[useVNEngine] sceneId is empty");
        return;
      }
      if (!storyMap.has(sceneId)) {
        console.warn("[useVNEngine] Scene not found in storyMap:", sceneId);
        console.warn(
          "[useVNEngine] Available scenes:",
          Array.from(storyMap.keys()).slice(0, 5),
        );
        return;
      }
      audioRef.current.playSfx(UI_SFX.click, settings.sfxVolume);
      setCurrentSceneId(sceneId);
    },
    [settings.sfxVolume, storyMap],
  );

  const goNext = useCallback(() => {
    if (!currentScene || currentScene.choices?.length) return;
    if (!currentScene.next) return;
    goToScene(currentScene.next);
  }, [currentScene, goToScene]);

  const selectChoice = useCallback(
    (choice) => {
      if (!choice?.next) return;
      goToScene(choice.next);
    },
    [goToScene],
  );

  const saveGame = useCallback(() => {
    persist();
    audioRef.current.playSfx(UI_SFX.click, settings.sfxVolume);
  }, [persist, settings.sfxVolume]);

  const loadGame = useCallback(() => {
    const saved = loadVNState();
    if (!saved) return false;

    if (saved.currentSceneId && storyMap.has(saved.currentSceneId)) {
      setCurrentSceneId(saved.currentSceneId);
    }
    if (Array.isArray(saved.history)) {
      setHistory(saved.history);
    }
    if (typeof saved.score === "number") {
      setScore(saved.score);
    }
    if (
      saved.quizResultsBySceneId &&
      typeof saved.quizResultsBySceneId === "object"
    ) {
      setQuizResultsBySceneId(saved.quizResultsBySceneId);
    }
    if (saved.settings) {
      setSettings((prev) => ({ ...prev, ...saved.settings }));
    }
    audioRef.current.playSfx(UI_SFX.click, settings.sfxVolume);
    return true;
  }, [settings.sfxVolume, storyMap]);

  const updateSettings = useCallback((partialSettings) => {
    setSettings((prev) => ({ ...prev, ...partialSettings }));
  }, []);

  const recordQuizResult = useCallback((sceneId, isCorrect) => {
    if (!sceneId) return;

    setQuizResultsBySceneId((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, sceneId)) return prev;
      return { ...prev, [sceneId]: Boolean(isCorrect) };
    });

    if (isCorrect) {
      setScore((prev) => prev + 10);
    }
  }, []);

  return {
    currentScene,
    currentSceneId,
    history,
    settings,
    score,
    quizResultsBySceneId,
    pushHistory,
    goToScene,
    goNext,
    selectChoice,
    saveGame,
    loadGame,
    updateSettings,
    recordQuizResult,
    playTypingSfx: () =>
      audioRef.current.playSfx(UI_SFX.typing, settings.sfxVolume * 0.3),
    persist,
  };
};
