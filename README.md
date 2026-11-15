# AIESEC in Lebanon website

The public site of AIESEC in Lebanon: a cinematic, scroll-driven site about hope, about going on exchange from Lebanon, and about coming to Lebanon.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Where things are

| Path | What it holds |
|---|---|
| `src/pages/` | One file per page: Home, Lebanon, Exchange, Events, Platforms |
| `src/scenes/` | The WebGL scenes: the dawn flight on the home page, the globe, the ring of event posters |
| `src/gl/` | The dawn shader and the small WebGL runner it uses (no three.js on first load) |
| `src/components/` | Shared pieces: navigation, footer, reveals, media with fallbacks |
| `src/content/` | All copy and data. **Edit text, events and platforms here.** |
| `src/assets/gen/` | Photographs. See the README in that folder for file names and prompts |

## Content that still needs you

- `src/content/events.js` and `src/content/platforms.js` contain entries marked `sample: true`. They are placeholders. Replace them with real events and platforms before going live. A yellow note appears on those pages in development to remind you.
- `src/assets/gen/` is empty until photographs are added. Every image has a code-made stand-in, so the site works without them.

## Notes for whoever maintains this

- The home page hero is one fragment shader (`src/gl/dawn.frag.js`). The scroll position drives a camera through it. Append `?s=0.4` to the URL to freeze it at 40% of the flight while you work on it.
- three.js is only loaded when the globe or the events ring is about to come into view.
- People who ask their system for reduced motion get still frames and ordinary scrolling.
- The site is a single-page app with client-side routes. The host must serve `index.html` for unknown paths.
