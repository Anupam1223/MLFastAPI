# ML FastAPI

Visualized React slide deck for serving ML models with FastAPI — same architecture as ML Architecture.

## Quick start

```bash
npm install
npm run dev
```

## Mental model

```
App.jsx (topic shell)
  └── sections/TopicNameN.jsx   ← auto-discovered, ordered by N
        └── Slideshow (shared)
              └── Slide components (your visuals / animations)
```

- **Top bar** — switch topics (Prev / Next / dropdown)
- **Bottom bar** — switch slides inside the current topic (arrow keys also work)

## Add a new topic

1. Create `sections/YourTopicNameN.jsx` — PascalCase, trailing number `N` sets the order
2. Export `meta`, define slide components, and default-export a `<Slideshow />`

```jsx
import Slideshow from '../components/Slideshow';

export const meta = { title: 'Pydantic Models', subtitle: 'Request & response schemas' };

const IntroSlide = () => <div className="p-10">...</div>;

export default function PydanticModels() {
  return (
    <Slideshow
      slides={[{ component: IntroSlide, title: 'Intro' }]}
      theme="dark"
    />
  );
}
```

No changes to `App.jsx` needed — Vite's `import.meta.glob` picks up new files.

### Slideshow props

| Prop | Type | Notes |
|---|---|---|
| `slides` | array | Bare components, or `{ component, title }` for dot tooltips |
| `theme` | `'light'` \| `'dark'` | Styles the deck chrome only; slides own their background |

**Important:** a section must *not* render its own page shell (`min-h-screen`, header, Prev/Next, progress bar). `App.jsx` and `Slideshow` provide those — duplicating them creates nested decks and double scrollbars.

## Stack

- Vite + React 18
- Tailwind CSS + `tailwindcss-animate`
- framer-motion (slide transitions)
- recharts (plots)
- lucide-react (icons)

## Folder layout

```
├── App.jsx                 # Course shell + topic discovery
├── main.jsx
├── index.html / index.css
├── components/
│   ├── Slideshow.jsx                          # Shared slide chrome
│   └── FastAPIFundamentalsPart1Visualizers.jsx
└── sections/
    └── IntroductionToFastAPIAndAPIFundamentals2.jsx
```
# MLFastAPI
