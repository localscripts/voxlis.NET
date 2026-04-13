# voxlis.NET

Static frontend for [voxlis.net](https://voxlis.net) — a directory for Roblox and CS2 injectors.

No build step. No npm. No bundler. Just HTML, CSS, and JS served over HTTP.

---

## Running locally

The site uses `fetch()` at runtime to load component HTML, JSON data, and Markdown files. Opening `index.html` directly in the browser will **not** work — it must be served over HTTP.

### Option 1 — VS Code Live Server (recommended)

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code
2. Open the project folder in VS Code (`File → Open Folder`)
3. Right-click `index.html` in the Explorer panel and choose **Open with Live Server**
4. The browser opens at `http://127.0.0.1:5500`

> To switch pages, navigate to `http://127.0.0.1:5500/roblox.html` or `http://127.0.0.1:5500/cs2.html`

### Option 2 — Python (no extensions needed)

If you have Python installed, run this from the project root in any terminal:

```bash
python -m http.server 8000
```

On Windows with the Python launcher:

```bash
py -m http.server 8000
```

Then open `http://localhost:8000` in your browser. Press `Ctrl+C` to stop.

---

## Project structure

```
index.html              Landing / home page
roblox.html             Roblox injector directory
cs2.html                CS2 injector directory
global.css              Global theme tokens and shared styles
src/
  main.js               Bootstraps the page and loads component HTML partials
  components/           UI components (cards, navbar, footer, modals, etc.)
  themes/               Custom theme CSS files (Supremacy, Mercy, etc.)
  config/               Site-wide config constants (theme options, IDs, etc.)
public/
  assets/               Icons, images, overlay graphics
  data/
    roblox/             Per-exploit data (info, review, points, modals)
    cs2/                CS2-specific data
    misc/               Privacy policy, terms, etc.
```

---

## Exploit data

Each exploit has its own folder under `public/data/roblox/`. The site reads these at runtime.

| File | Purpose |
|---|---|
| `info.json` | Name, status, links, tags, pricing tier |
| `points.json` | Short bullet-point summary shown on the card |
| `review.md` | Long-form review rendered in the info modal |
| `modals.json` | Optional extra modal content (warnings, notes) |

Example:

```
public/data/roblox/Potassium/
  info.json
  points.json
  review.md
  modals.json
```

---

## Theming

Theme CSS files live in `src/themes/`. Each file is a self-contained set of CSS custom property overrides scoped to `:root[data-theme="<id>"]`.

- `src/themes/supremacy.css` — dark blood-red theme with video background and glass blur
- `src/themes/mercy.css` — light white/gold theme
- `src/config/global/themes.js` — registers available theme options shown in the theme picker

To create a new theme, copy `src/themes/example.css` and register it in `themes.js`.

Full theming documentation is in [src/themes/README.md](./src/themes/README.md).

---

## External dependencies

Loaded from CDN at runtime — an internet connection is needed for a fully accurate preview:

- [Font Awesome](https://fontawesome.com/) — icons
- [Marked](https://marked.js.org/) — Markdown rendering
- [highlight.js](https://highlightjs.org/) — code syntax highlighting

---

## License

Source-available, not open-source. See [LICENSE](./LICENSE) for usage terms.
