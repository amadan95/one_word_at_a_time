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
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-card backdrop-blur ${
        isFullscreen ? 'min-h-screen' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,77,77,0.14),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
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
            className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
            onClick={onTogglePlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/70 hover:bg-white/20"
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
