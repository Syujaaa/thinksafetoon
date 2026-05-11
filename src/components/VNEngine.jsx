import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./Background";
import CharacterLayer from "./CharacterLayer";
import ChoiceBox from "./ChoiceBox";
import Controls from "./Controls";
import DialogBox from "./DialogBox";
import QuizBox from "./QuizBox";
import defaultStory from "../data/story";
import { useTypewriter } from "../hooks/useTypewriter";
import { useVNEngine } from "../hooks/useVNEngine";
import {
  resolveStoryTransition,
  findSceneInLibrary,
} from "../data/storyLibrary";

const VNEngine = ({
  storyData = defaultStory,
  onExit,
  onChangeStory,
  startSceneId,
}) => {
  const {
    currentScene,
    currentSceneId,
    history,
    settings,
    score,
    pushHistory,
    goNext,
    goToScene,
    selectChoice,
    saveGame,
    loadGame,
    updateSettings,
    recordQuizResult,
    playTypingSfx,
    persist,
  } = useVNEngine(storyData);
  const [showHistory, setShowHistory] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const lastProcessedStartSceneRef = useRef(null);
  const isStoryPlayingRef = useRef(false);

  // Fungsi untuk check apakah sedang fullscreen
  const isFullscreenActive = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  // Fungsi untuk request fullscreen
  const requestFullscreen = async () => {
    const element = document.documentElement;
    try {
      // Skip jika sudah fullscreen
      if (isFullscreenActive()) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        console.log("Fullscreen request blocked by user or browser");
      } else if (error.name === "TypeError") {
        console.log("Fullscreen request failed:", error.message);
      }
    }
  };

  // Fungsi untuk exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  // Ketika startSceneId berubah (misalnya saat transisi ke arc baru), navigate ke scene tersebut
  useEffect(() => {
    if (startSceneId && lastProcessedStartSceneRef.current !== startSceneId) {
      console.log("[VNEngine] Navigating to startSceneId:", startSceneId);
      lastProcessedStartSceneRef.current = startSceneId;
      // Gunakan setTimeout kecil untuk memastikan storyMap sudah update
      const timer = setTimeout(() => {
        goToScene(startSceneId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [startSceneId, goToScene]);

  const textSpeed = settings.skipMode ? 0 : 22;
  const { displayedText, isComplete, revealNow } = useTypewriter(
    currentScene?.text ?? "",
    settings.skipMode,
    textSpeed,
  );

  const hasChoices = Boolean(currentScene?.choices?.length);
  const hasQuiz = Boolean(currentScene?.quiz);

  useEffect(() => {
    if (currentScene) {
      pushHistory(currentScene);
    }
  }, [currentScene, pushHistory]);

  // Autosave disabled - use saveGame button to manually save
  // useEffect(() => {
  //   persist();
  // }, [persist, currentSceneId, settings, history]);

  useEffect(() => {
    if (!currentScene?.text || isComplete) return;
    playTypingSfx();
  }, [currentScene?.text, isComplete, playTypingSfx]);

  useEffect(() => {
    if (
      !settings.autoMode ||
      !isComplete ||
      hasChoices ||
      hasQuiz ||
      !currentScene?.next
    )
      return;

    const timer = window.setTimeout(() => {
      goNext();
    }, settings.autoDelayMs);
    return () => window.clearTimeout(timer);
  }, [
    currentScene?.next,
    goNext,
    hasChoices,
    hasQuiz,
    isComplete,
    settings.autoDelayMs,
    settings.autoMode,
  ]);

  useEffect(() => {
    if (
      !settings.skipMode ||
      hasChoices ||
      hasQuiz ||
      !isComplete ||
      !currentScene?.next
    )
      return;

    const timer = window.setTimeout(() => {
      goNext();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [
    currentScene?.next,
    goNext,
    hasChoices,
    hasQuiz,
    isComplete,
    settings.skipMode,
  ]);

  const reversedHistory = useMemo(() => [...history].reverse(), [history]);

  // Request fullscreen saat VNEngine mount
  useEffect(() => {
    isStoryPlayingRef.current = true;
    requestFullscreen();

    // Handle fullscreen exit - show warning
    const handleFullscreenChange = () => {
      if (isStoryPlayingRef.current && !isFullscreenActive()) {
        setShowFullscreenWarning(true);
      }
    };

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isStoryPlayingRef.current) {
        // Tab berubah ke hidden
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isStoryPlayingRef.current = false;
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSelectChoice = (choice) => {
    if (!choice?.next) return;

    // Cek apakah ini adalah transisi ke story arc lain
    if (choice.next.startsWith("@@NEXT_STORY:")) {
      const transition = resolveStoryTransition(choice.next);
      console.log("[VNEngine] Arc Transition detected:", transition);

      if (transition && onChangeStory) {
        const { scene, arcId } = findSceneInLibrary(transition.sceneId);
        console.log("[VNEngine] findSceneInLibrary result:", {
          scene: scene?.id,
          arcId,
        });

        if (scene && arcId) {
          console.log(
            "[VNEngine] Calling onChangeStory with arcId:",
            arcId,
            "sceneId:",
            transition.sceneId,
          );
          onChangeStory(arcId, transition.sceneId);
          return;
        } else {
          console.warn(
            "[VNEngine] Scene not found in library:",
            transition.sceneId,
          );
        }
      } else {
        console.warn(
          "[VNEngine] Transition parse failed or onChangeStory not available",
        );
      }
    }

    // Normal scene transition (within same story)
    console.log("[VNEngine] Normal scene transition to:", choice.next);
    selectChoice(choice);
  };

  const handleContinue = () => {
    if (!isComplete) {
      revealNow();
      return;
    }
    if (hasChoices || hasQuiz) return;
    if (!currentScene?.next) {
      // Story selesai - exit fullscreen dan trigger onExit
      isStoryPlayingRef.current = false;
      exitFullscreen();
      onExit?.();
      return;
    }
    goNext();
  };

  const handleQuizSubmit = (payload) => {
    if (!currentScene?.quiz) return;
    const { quiz } = currentScene;

    if (payload.type === "multiple_choice") {
      const isCorrect = payload.selectedOptionId === quiz.correctOptionId;
      recordQuizResult(currentScene.id, isCorrect);
      goToScene(isCorrect ? quiz.correctNext : quiz.incorrectNext);
      return;
    }

    if (payload.type === "number") {
      const expected = Number(quiz.correctValue);
      const tolerance = Number(quiz.tolerance ?? 0);
      const isCorrect = Math.abs(payload.value - expected) <= tolerance;
      recordQuizResult(currentScene.id, isCorrect);
      goToScene(isCorrect ? quiz.correctNext : quiz.incorrectNext);
    }
  };

  if (!currentScene) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Scene tidak ditemukan. Cek `src/data/story.js`.
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <Background background={currentScene.background} />
      <CharacterLayer characters={currentScene.characters} />

      {currentScene?.background?.includes("flood_map.png") && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center px-3 pt-3 md:hidden sm:px-4 sm:pt-4">
          <div className="w-full max-w-sm rounded-lg border border-white/20 bg-slate-900/75 p-2">
            <img
              src={currentScene.background}
              alt="Peta Banjir"
              className="h-auto w-full rounded object-contain"
            />
          </div>
        </div>
      )}

      {currentScene?.background?.includes("fire_map.png") && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center px-3 pt-3 md:hidden sm:px-4 sm:pt-4">
          <div className="w-full max-w-sm rounded-lg border border-white/20 bg-slate-900/75 p-2">
            <img
              src={currentScene.background}
              alt="Peta Kebakaran"
              className="h-auto w-full rounded object-contain"
            />
          </div>
        </div>
      )}

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-end px-3 pb-4 pt-3 sm:px-4 sm:pb-5 md:px-8 md:pb-8">
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
          <div className="rounded-lg border border-white/20 bg-slate-900/75 px-3 py-2.5 text-xs text-cyan-100 md:text-sm">
            Score: <span className="font-semibold text-white">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="rounded-lg border border-white/20 bg-slate-900/75 px-3 py-2.5 text-xs text-white transition hover:border-cyan-300/70 hover:bg-cyan-500/20 md:text-sm"
              >
                Kembali
              </button>
            )}
            <Controls
              settings={settings}
              onToggleAuto={() =>
                updateSettings({ autoMode: !settings.autoMode })
              }
              onToggleSkip={() =>
                updateSettings({ skipMode: !settings.skipMode })
              }
              onSave={saveGame}
              onLoad={loadGame}
              onOpenHistory={() => setShowHistory((prev) => !prev)}
            />
          </div>
        </div>

        <DialogBox
          speaker={currentScene.speaker}
          text={displayedText}
          isTypingDone={isComplete}
          onContinue={handleContinue}
          autoMode={settings.autoMode}
          skipMode={settings.skipMode}
        />

        <ChoiceBox
          choices={isComplete ? currentScene.choices : []}
          onSelect={handleSelectChoice}
        />
        {isComplete && hasQuiz && (
          <QuizBox quiz={currentScene.quiz} onSubmit={handleQuizSubmit} />
        )}
      </section>

      <AnimatePresence>
        {showHistory && (
          <motion.aside
            className="absolute inset-0 z-20 bg-black/60 p-4 backdrop-blur-sm md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              className="mx-auto h-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-slate-900/85"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="text-lg font-semibold text-cyan-200">
                  Dialog History
                </h2>
                <button
                  type="button"
                  className="rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-white"
                  onClick={() => setShowHistory(false)}
                >
                  Close
                </button>
              </div>
              <div className="h-[calc(100%-64px)] space-y-3 overflow-y-auto p-4 sm:space-y-4 sm:p-5">
                {reversedHistory.length ? (
                  reversedHistory.map((entry, index) => (
                    <article
                      key={`${entry.sceneId}-${index}`}
                      className="rounded-lg bg-white/5 p-3"
                    >
                      <h4 className="text-sm font-semibold text-cyan-200">
                        {entry.speaker}
                      </h4>
                      <p className="mt-1 text-sm text-slate-100">
                        {entry.text}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">
                    Belum ada riwayat dialog.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 shadow-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-black uppercase text-red-600">
                ⚠️ Fokus Diperlukan!
              </h2>
              <p className="mb-2 text-lg font-bold text-black">
                Fullscreen telah dinonaktifkan!
              </p>
              <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                Mode fullscreen diperlukan untuk pengalaman cerita visual novel
                yang optimal. Silakan kembali ke fullscreen untuk melanjutkan.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowFullscreenWarning(false);
                    requestFullscreen();
                  }}
                  className="rounded-lg border-2 border-black bg-green-500 px-6 py-3 font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-x-0 active:translate-y-0"
                >
                  ↩️ Kembali Fullscreen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFullscreenWarning(false);
                    isStoryPlayingRef.current = false;
                    exitFullscreen();
                    onExit?.();
                  }}
                  className="rounded-lg border-2 border-black bg-red-500 px-6 py-3 font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-x-0 active:translate-y-0"
                >
                  ✕ Keluar Cerita
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default VNEngine;
