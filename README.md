# One Word At a Time

Spritz-style reading trainer built with React, TypeScript, Vite, and Tailwind. Paste text or upload a PDF/EPUB, then read one word at a time with an Optimal Recognition Point (ORP) highlight, auto pacing, fullscreen focus mode, and a localStorage-backed library.

## Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## How to use

- Paste text or drop/upload a PDF/EPUB to extract text (pdf.js for PDF, JSZip parsing for EPUB). Extraction progress shows page/section counts; scanned/image PDFs and empty EPUBs show a friendly warning.
- Set a document title and click **Save to Library** to store it (title, source type, word count, last position).
- Use the WPM slider (120–900) to control autoplay speed; start/pause/restart controls are available on the page and in fullscreen.
- Fullscreen targets only the focus view (button or `F`). ESC or the Exit button will leave fullscreen.

### Keyboard shortcuts

- Space: start/pause
- R: reset to the beginning
- ← / →: step through words manually
- F: toggle fullscreen

## Notes

- Auto pace interval is `60000 / WPM` ms.
- Library data is stored in `localStorage` under `one-word-library` (legacy key `focus-reader-library` is still read).
- ORP index heuristic: `round(len * 0.35)` clamped between 1 and `len - 2` for words ≥3 characters (short words handled sensibly).
