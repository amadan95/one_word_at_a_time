import type { RefObject } from 'react'

interface FocusViewProps {
  wordParts: { prefix: string; focusChar: string; suffix: string } | null
  currentWord: string | null
  isPlaying: boolean
  isFullscreen: boolean
  containerRef: RefObject<HTMLDivElement | null>
  onTogglePlay: () => void
  onExitFullscreen: () => void
}

const FocusView = ({
  wordParts,
  currentWord,
  isPlaying,
  isFullscreen,
  containerRef,
  onTogglePlay,
  onExitFullscreen,
}: FocusViewProps) => {
  return (
    <div
      ref={containerRef}
      className={`glass-panel relative overflow-hidden ${
        isFullscreen ? 'min-h-screen focus-fullscreen' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,77,77,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_40%)]" />
      <div
        className={`relative flex flex-col ${
          isFullscreen ? 'min-h-screen' : 'min-h-[320px] md:min-h-[360px]'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-4 text-xs uppercase tracking-[0.3em] text-slate-300">
          <span>Focus View</span>
          <span className="text-[11px] text-slate-400">One word at a time</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 text-center">
          {wordParts ? (
            <div
              className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight font-display text-white"
              aria-live="polite"
              aria-atomic="true"
              aria-label={currentWord ?? 'No document loaded'}
            >
              <span>{wordParts.prefix}</span>
              <span className="text-accent">{wordParts.focusChar}</span>
              <span>{wordParts.suffix}</span>
            </div>
          ) : (
            <p className="text-lg text-slate-300">No document loaded</p>
          )}
        </div>
      </div>

      {isFullscreen && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
          <button
            className="glass-button glass-button-primary gesture-press px-6"
            onClick={onTogglePlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className="glass-button gesture-press hover:border-white/70 hover:bg-white/20"
            onClick={onExitFullscreen}
          >
            Exit Fullscreen
          </button>
        </div>
      )}
    </div>
  )
}

export default FocusView
