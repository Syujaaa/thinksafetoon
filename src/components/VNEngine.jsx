import { useEffect, useMemo, useState } from "react";
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

const VNEngine = ({ storyData = defaultStory, onExit }) => {
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
  const handleContinue = () => {
    if (!isComplete) {
      revealNow();
      return;
    }
    if (hasChoices || hasQuiz) return;
    if (!currentScene?.next) {
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
          onSelect={selectChoice}
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
    </main>
  );
};

export default VNEngine;
