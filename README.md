# voxlis

Static frontend for the Voxlis site.

The project does not need a build step for local preview, but it does need to be served over HTTP because the site loads partial HTML files, JSON data, and Markdown reviews with `fetch()`.

## Run locally

### Python web server

From the project root:

```bash
python -m http.server 8000
```

If you use the Windows Python launcher instead:

```bash
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

To stop the server, press `Ctrl+C` in the terminal.

## Important note

Opening [index.html](./index.html) directly in the browser will not work correctly.

This repo relies on runtime requests for files such as:

- `src/components/*/*.html`
- `public/data/roblox/*/*.json`
- `public/data/roblox/*/review.md`

Because of that, use a local web server while developing.

## Project layout

- `index.html`: main page shell
- `global.css`: global theme variables and shared page styling
- `src/main.js`: bootstraps the page and loads component partials
- `src/components/`: UI components such as cards, filter modal, navbar, footer, and popups
- `public/data/roblox/`: exploit data, reviews, points, and modal content

## Editing exploit data

Each exploit lives in its own folder inside `public/data/roblox/`.

Common files:

- `info.json`: main metadata
- `review.md`: long-form review shown in the site
- `points.json`: short summary lines for the card
- `modals.json`: optional warning/modal data

Example:

```text
public/data/roblox/Potassium/
  info.json
  review.md
  points.json
  modals.json
```

## External assets

The page also loads a few libraries from CDNs, including:

- Font Awesome
- Marked
- highlight.js

So for a fully accurate local preview, keep an internet connection available.

## License

This repository is source-available, but not fully open-source.

See [LICENSE](./LICENSE) for the current usage terms.
