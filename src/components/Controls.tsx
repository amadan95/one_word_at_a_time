interface ControlsProps {
  wpm: number
  isPlaying: boolean
  onChangeWpm: (value: number) => void
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onFullscreenToggle: () => void
  isFullscreen: boolean
}

const Controls = ({
  wpm,
  isPlaying,
  onChangeWpm,
  onStart,
  onPause,
  onReset,
  onFullscreenToggle,
  isFullscreen,
}: ControlsProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Auto pace</p>
          <h3 className="text-lg font-semibold text-white">Words per minute</h3>
        </div>
        <button
          onClick={onFullscreenToggle}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={isPlaying ? onPause : onStart}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ff6b6b]"
        >
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onReset}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
        >
          Restart
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>120</span>
          <span>900</span>
        </div>
        <input
          type="range"
          min={120}
          max={900}
          step={10}
          value={wpm}
          onChange={(e) => onChangeWpm(Number(e.target.value))}
          className="w-full accent-accent"
          aria-label="Words per minute"
        />
        <div className="text-sm font-semibold text-white">{wpm} WPM</div>
      </div>

      <p className="mt-4 text-sm text-slate-300">
        Tip: Space start/pause · R reset · ← → step through words · F fullscreen
      </p>
    </div>
  )
}

export default Controls
