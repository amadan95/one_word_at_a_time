interface StatsBarProps {
  totalWords: number
  currentIndex: number
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="glass-panel-soft liquid-sheen gesture-float flex flex-col px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-slate-300">{label}</span>
    <span className="text-2xl font-semibold text-white">{value}</span>
  </div>
)

const StatsBar = ({ totalWords, currentIndex }: StatsBarProps) => {
  const progress =
    totalWords === 0 ? 0 : Math.min(100, Math.round(((currentIndex + 1) / totalWords) * 100))

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Words" value={totalWords.toLocaleString()} />
      <StatCard label="Progress" value={`${progress}%`} />
      <StatCard label="Current" value={totalWords ? `${currentIndex + 1}` : '—'} />
      <StatCard
        label="Remaining"
        value={totalWords ? `${Math.max(totalWords - currentIndex - 1, 0)}` : '—'}
      />
    </div>
  )
}

export default StatsBar
