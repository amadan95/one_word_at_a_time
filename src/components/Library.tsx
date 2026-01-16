import type { LibraryDoc } from '../types'

interface LibraryProps {
  library: LibraryDoc[]
  onLoad: (doc: LibraryDoc) => void
  onClear: () => void
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const Library = ({ library, onLoad, onClear }: LibraryProps) => {
  return (
    <div className="glass-panel liquid-sheen p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Library</p>
          <h3 className="text-lg font-semibold text-white">Saved documents</h3>
        </div>
        <button
          onClick={onClear}
          className="glass-button gesture-press hover:border-white/60 hover:bg-white/20"
        >
          Clear
        </button>
      </div>

      {library.length === 0 ? (
        <p className="text-sm text-slate-300">No saved documents yet.</p>
      ) : (
        <ul className="space-y-3">
          {library.map((doc) => (
            <li key={doc.id}>
              <button
                className="glass-panel-soft gesture-float flex w-full flex-col gap-1 px-4 py-3 text-left text-white"
                onClick={() => onLoad(doc)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{doc.title}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-300">
                    {doc.sourceType.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  {doc.wordCount.toLocaleString()} words · {formatDate(doc.createdAt)}
                  {typeof doc.lastPosition === 'number' && doc.wordCount > 0 && (
                    <span className="text-slate-400">
                      {' '}
                      · Resumes at {Math.min(doc.lastPosition + 1, doc.wordCount)} /{' '}
                      {doc.wordCount}
                    </span>
                  )}
                </div>
                {doc.fileName && (
                  <div className="text-xs text-slate-400">File: {doc.fileName}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Library
