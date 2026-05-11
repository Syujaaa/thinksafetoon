import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";

const QuizBox = ({ quiz, onSubmit }) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [numberAnswer, setNumberAnswer] = useState("");

  const safeOptions = useMemo(
    () => (Array.isArray(quiz?.options) ? quiz.options : []),
    [quiz?.options],
  );
  const isMultipleChoice = quiz?.type === "multiple_choice";
  const isNumber = quiz?.type === "number";
  const isNumberAnswerEmpty = numberAnswer.trim() === "";
  const isSubmitDisabled =
    (isMultipleChoice && !selectedOptionId) || (isNumber && isNumberAnswerEmpty);

  if (!quiz) return null;

  const handleSubmit = () => {
    if (quiz.type === "multiple_choice") {
      if (!selectedOptionId) return;
      onSubmit({ type: "multiple_choice", selectedOptionId });
      return;
    }

    if (quiz.type === "number") {
      if (isNumberAnswerEmpty) return;
      const parsed = Number(numberAnswer);
      if (Number.isNaN(parsed)) return;
      onSubmit({ type: "number", value: parsed });
    }
  };

  return (
    <motion.div
      className="mt-3 rounded-2xl border border-cyan-200/30 bg-slate-900/75 p-4 backdrop-blur-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <h4 className="text-sm font-semibold text-cyan-200 sm:text-base">{quiz.prompt}</h4>

      {quiz.type === "multiple_choice" && (
        <div className="mt-3 grid gap-2">
          {safeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                selectedOptionId === option.id
                  ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
                  : "border-white/15 bg-slate-800/80 text-white hover:border-cyan-300/60"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {quiz.type === "number" && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="number"
            inputMode="decimal"
            value={numberAnswer}
            onChange={(event) => setNumberAnswer(event.target.value)}
            placeholder={quiz.placeholder ?? "Masukkan jawaban angka"}
            required
            className="w-full rounded-lg border border-white/20 bg-slate-800/80 px-3 py-3 text-sm text-white outline-none ring-cyan-300/40 placeholder:text-slate-400 focus:ring-2"
          />
          <span className="text-xs text-slate-300 sm:text-sm">{quiz.unit ?? ""}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="mt-3 w-full rounded-lg border border-cyan-300/40 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
      >
        Cek Jawaban
      </button>
    </motion.div>
  );
};

export default memo(QuizBox);
