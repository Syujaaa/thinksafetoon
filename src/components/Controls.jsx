import { memo } from "react";

const Controls = ({
  settings,
  onToggleAuto,
  onToggleSkip,
  onSave,
  onLoad,
  onOpenHistory,
}) => {
  const baseClass =
    "rounded-lg border border-white/20 bg-slate-900/75 px-3 py-2.5 text-xs text-white transition hover:border-cyan-300/70 hover:bg-cyan-500/20 md:text-sm";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" className={baseClass} onClick={onToggleAuto}>
        Auto: {settings.autoMode ? "On" : "Off"}
      </button>
      <button type="button" className={baseClass} onClick={onToggleSkip}>
        Skip: {settings.skipMode ? "On" : "Off"}
      </button>
      {/* <button type="button" className={baseClass} onClick={onSave}>
        Save
      </button>
      <button type="button" className={baseClass} onClick={onLoad}>
        Load
      </button> */}
      <button type="button" className={baseClass} onClick={onOpenHistory}>
        History
      </button>
    </div>
  );
};

export default memo(Controls);
