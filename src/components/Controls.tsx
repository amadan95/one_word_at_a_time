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
    <div className="glass-panel liquid-sheen p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Auto pace</p>
          <h3 className="text-lg font-semibold text-white">Words per minute</h3>
        </div>
        <button
          onClick={onFullscreenToggle}
          className="glass-button gesture-press hover:border-white/60 hover:bg-white/20"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={isPlaying ? onPause : onStart}
          className="glass-button gesture-press bg-accent px-5 text-white shadow-lg hover:bg-[#ff6b6b]"
        >
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onReset}
          className="glass-button gesture-press hover:border-white/60 hover:bg-white/20"
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
