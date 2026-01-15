const Header = () => {
  return (
    <header className="space-y-4 text-white">
      <a
        className="inline-flex items-center gap-2 text-sm font-medium text-[#cdd5ff] transition hover:text-white"
        href="https://x.com/iruletheworldmo"
        target="_blank"
        rel="noreferrer"
      >
        Enjoying this? Subscribe on X @iruletheworldmo to see more fun projects
        <span aria-hidden>↗</span>
      </a>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
        Reading Comprehension Trainer
      </p>
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight font-display">
          One Word At a Time
        </h1>
        <p className="max-w-2xl text-lg text-slate-200">
          Paste anything, lock your gaze on the red letter, and let the words flow at your pace.
        </p>
      </div>
    </header>
  )
}

export default Header
