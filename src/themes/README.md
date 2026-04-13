# Voxlis Theming Guide

Everything on this site is driven by CSS custom properties (variables) defined in `global.css`.
You can override any of them to fully re-skin the site — colors, backgrounds, fonts, spacing,
card surfaces, navbar, footer, and more — without touching any source files.

---

## Table of Contents

1. [How the token system works](#1-how-the-token-system-works)
2. [Quick start — a simple color swap](#2-quick-start--a-simple-color-swap)
3. [Adding your CSS to the site](#3-adding-your-css-to-the-site)
4. [Adding a full theme (with thumbnail)](#4-adding-a-full-theme-with-thumbnail)
5. [Registering a plain accent preset](#5-registering-a-plain-accent-preset)
6. [Token reference](#6-token-reference)
   - [Accent / brand colors](#accent--brand-colors)
   - [Background & surfaces](#background--surfaces)
   - [Typography & fonts](#typography--fonts)
   - [Navbar](#navbar)
   - [Footer](#footer)
   - [Cards](#cards)
   - [Filter drawer](#filter-drawer)
   - [Featured card](#featured-card)
   - [Promo section](#promo-section)
   - [Info modal](#info-modal)
   - [Background media (wallpaper)](#background-media-wallpaper)
   - [Motion & spacing](#motion--spacing)
7. [Visibility preference classes](#7-visibility-preference-classes)
8. [Light theme tips](#8-light-theme-tips)
9. [Full example theme](#9-full-example-theme)

---

## 1. How the token system works

Every colour, font, size, and surface in the UI is expressed as a CSS variable on `:root`.
When the browser renders a component it inherits these values, so overriding a token affects
every place that token is used at once.

The very few "live" tokens that themes.js sets at runtime (the core accent group) are:

| Token | What it controls |
|---|---|
| `--theme-main-color` | Primary accent colour |
| `--theme-hover-color` | Hover/darker accent colour |
| `--theme-gradient-start-color` | Gradient left stop |
| `--theme-gradient-end-color` | Gradient right stop |
| `--theme-rgb` | RGB triplet of the main colour (used for `rgba()`) |

Everything else is pure CSS — just override it and done.

---

## 2. Quick start — a simple color swap

Create any `.css` file (e.g. `src/themes/my-theme.css`) and override tokens on `:root`:

```css
:root {
  /* Swap the accent to purple */
  --theme-main-color: #a855f7;
  --theme-hover-color: #9333ea;
  --theme-gradient-start-color: #c084fc;
  --theme-gradient-end-color: #7c3aed;
  --theme-rgb: 168, 85, 247;
}
```

That's it. Every button, badge, border glow, scrollbar, and link that derives from the accent
colour will update automatically.

---

## 3. Adding your CSS to the site

Pick one of the methods below. They can also be combined.

### Method A — Link stylesheet (recommended)

Add a `<link>` inside the `<head>` of any page HTML file, **after** `global.css`:

```html
<!-- global.css is already here -->
<link rel="stylesheet" href="src/themes/my-theme.css" />
```

Because it loads after `global.css` your overrides win without needing `!important`.

### Method B — Inline `<style>` block

For small tweaks, drop a `<style>` block directly into the page `<head>`:

```html
<style>
  :root {
    --theme-main-color: #f59e0b;
    --theme-rgb: 245, 158, 11;
    --bg: #0a0a0a;
  }
</style>
```

### Method C — Scoped to a named preset

If you register a preset (see section 4) you can scope your overrides so they only activate
when that preset is chosen, leaving the default theme untouched:

```css
:root[data-theme="my-preset"] {
  --theme-main-color: #f59e0b;
  --theme-rgb: 245, 158, 11;
}
```

---

## 4. Adding a full theme (with thumbnail)

**This is the main workflow for creating a rich, named theme** — like the "Kawaii" /
"Supremacy" cards in the screenshot.

### Step 1 — Create a CSS file

Copy [example.css](./example.css), rename it (e.g. `kawaii.css`), and edit the variables.
Your CSS file should scope overrides to your theme ID so they only activate when selected:

```css
/* kawaii.css */
:root[data-theme="kawaii"] {
  --theme-main-color: #f472b6;
  --theme-hover-color: #ec4899;
  --theme-gradient-start-color: #f9a8d4;
  --theme-gradient-end-color: #db2777;
  --theme-rgb: 244, 114, 182;
  --bg: #0f0a10;
  /* ... any other token overrides */
}
```

> **Tip:** To override the surface variables that the built-in system resets via inline
> styles (`--card-surface-background`, `--navbar-background`, `--footer-bg`, etc.),
> add `!important` to those rules — author `!important` beats inline styles.
>
> ```css
> :root[data-theme="kawaii"] {
>   --navbar-background: rgba(20, 5, 18, 0.92) !important;
>   --card-surface-background: rgba(25, 8, 22, 0.55) !important;
> }
> ```

### Step 2 — Add a thumbnail image

Place a square image (128 × 128 px minimum, JPG or PNG) in `src/themes/thumbnails/`.

### Step 3 — Register the theme in `src/themes/themes.js`

Open [themes.js](./themes.js) and add an entry to the `FULL_THEMES` array at the top of the
file. That is the **only file you need to edit**:

```js
const FULL_THEMES = [
  {
    id: "kawaii",                                    // unique ID
    label: "Kawaii",                                 // card title
    author: "voxlis",                               // shown as "@voxlis"
    thumbnail: "/src/themes/thumbnails/kawaii.jpg", // preview image
    swatch: "#f472b6",                              // accent hex
    swatchRgb: "244, 114, 182",                     // same colour as r, g, b
    cssFile: "/src/themes/kawaii.css",              // your CSS file
  },
];
```

That's it. The theme card will appear in the **Full Themes** section of the Themes drawer.
When a visitor selects it:
- `data-theme="kawaii"` is set on `<html>` → your scoped CSS activates
- The accent inline vars (`--theme-main-color` etc.) are updated to match `swatch`
- Your `cssFile` is injected as a `<link>` stylesheet
- The choice is saved in `localStorage` under `voxlis-theme`

---

## 5. Registering a plain accent preset

For simpler colour-only presets (no thumbnail, no external CSS file) you can add directly
to `src/config/global/themes.js`:

```js
options: [
  // existing options...
  {
    id: "amber",
    label: "Amber",
    swatch: "#f59e0b",
    group: "accent",
    previewGradient: "linear-gradient(90deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.12) 100%)",
  },
],
```

---

## 6. Token reference

Below is every token exposed in `global.css`, grouped by area.
Copy the ones you want to change into your theme file and set new values.

---

### Accent / brand colors

```css
:root {
  --theme-main-color: #3b82f6;
  --theme-hover-color: #2563eb;
  --theme-gradient-start-color: #60a5fa;
  --theme-gradient-end-color: #2563eb;
  --theme-rgb: 59, 130, 246;           /* RGB of --theme-main-color, no #/spaces */

  /* Alpha tints used everywhere for subtle backgrounds */
  --theme-card-hover-alpha: 0.2;
  --theme-glow-alpha: 0.5;
  --theme-soft-tint-alpha: 0.1;
  --theme-medium-tint-alpha: 0.3;
  --theme-strong-tint-alpha: 0.5;
  --theme-border-tint-alpha: 0.5;

  /* Brand logo gradient */
  --brand-gradient-enabled: 1;         /* 0 = disable, 1 = enable */
  --brand-gradient-color: #60a5fa;
  --brand-gradient-offset: 70%;
}
```

---

### Background & surfaces

```css
:root {
  --bg: #000000;                        /* Page background colour */
  --fg: #ffffff;                        /* Default text colour */

  /* Card surfaces (all cards inherit these) */
  --crd-bg: rgba(0, 0, 0, 0.4);
  --card-surface-background: #000000;
  --card-surface-backdrop-blur: 0px;    /* e.g. "12px" for glass effect */
  --card-surface-tint: var(--card-surface-background);

  /* Site-wide border & outline */
  --site-border-color: #070707;
  --site-outline-color: var(--site-border-color);

  /* Background gradient overlay on top of --bg  */
  --bg-gradient: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.6));

  /* Bottom page fade */
  --site-bottom-fade-height: clamp(4.75rem, 10vw, 8rem);
  --site-bottom-fade-fill: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.14) 22%,
    rgba(0,0,0,0.42) 52%,
    rgba(0,0,0,0.8) 82%,
    #000000 100%
  );
}
```

---

### Typography & fonts

```css
:root {
  --font-family-base: "Open Sans", sans-serif;   /* Body text */
  --font-family-ui: var(--font-family-base);     /* UI elements */
  --font-family-system: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --font-family-mono: "Fira Code", "Consolas", monospace;
  --card-font-family: var(--font-family-base);

  /* To use a Google Font, set the import URL first: */
  --theme-font-import-url: none;
  /* e.g. --theme-font-import-url: url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"); */
}
```

---

### Navbar

```css
:root {
  --navbar-height: 4rem;
  --navbar-background: #000000;
  --navbar-mobile-panel-background: var(--navbar-background);
  --navbar-position: sticky;           /* "sticky" or "fixed" */
  --navbar-top: 0px;
  --navbar-scrolled-border: var(--site-border-color);
  --navbar-search-max-width: 500px;
  --navbar-search-background: rgba(0, 0, 0, 0.3);
  --navbar-search-background-focus: rgba(0, 0, 0, 0.5);
  --navbar-search-clear-color: var(--txt-mut);
  --navbar-button-background: rgba(255, 255, 255, 0.05);
  --navbar-warning-background: var(--warning-bg);
  --navbar-warning-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);

  /* Mobile nav */
  --navbar-mobile-menu-shadow: 0 14px 28px rgba(0, 0, 0, 0.45);
  --navbar-mobile-link-background: rgba(255, 255, 255, 0.03);
  --navbar-mobile-toggle-background: rgba(255, 255, 255, 0.04);
  --navbar-mobile-toggle-background-hover: rgba(255, 255, 255, 0.1);
}
```

---

### Footer

```css
:root {
  --footer-bg: #000000;
  --footer-border: var(--site-border-color);
  --footer-text: rgba(209, 213, 219, 1);
  --footer-muted: rgba(156, 163, 175, 1);
  --footer-max-width: 1200px;
  --footer-horizontal-padding: 2rem;
  --footer-padding-block: 2.5rem;
  --footer-section-gap: 2rem;
  --footer-glow-color: var(--theme-main-color);
  --footer-credit-color: var(--prim);
  --footer-logo-height: 40px;
  --footer-logo-height-mobile: 32px;

  /* Follow global card surface settings (1 = yes, 0 = no) */
  --footer-follow-global-surface: 0;
  --footer-surface-tint-color: #000000;
  --footer-surface-tint-power: 82;
  --footer-surface-outline-color: var(--site-border-color);
  --footer-surface-blur-enabled: 0;
  --footer-surface-blur-strength: 12;

  /* Theme swatch dots in footer picker */
  --footer-theme-swatch-size: 1rem;
  --footer-theme-swatch-border: rgba(255, 255, 255, 0.3);
  --footer-theme-swatch-default: var(--theme-color);
  --footer-theme-option-hover-background: rgba(255, 255, 255, 0.1);
  --footer-theme-option-selected-background: rgba(255, 255, 255, 0.05);
  --footer-theme-menu-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3);

  /* Heart icon in footer credit */
  --footer-heart-size: 1.24rem;
}
```

---

### Cards

```css
:root {
  --crd-bdr: var(--site-border-color);      /* Card border */
  --crd-hvr: rgba(var(--theme-rgb), 0.2);   /* Card hover overlay */
  --exploit-card-chrome: var(--site-border-color);

  /* Action buttons on cards */
  --card-action-button-background: rgba(0, 0, 0, 0.34);
  --card-action-button-background-hover: rgba(0, 0, 0, 0.42);
  --card-action-button-text: rgba(203, 213, 225, 0.8);

  /* Sponsor/CTA buttons on cards */
  --card-sponsor-button-background: rgba(0, 0, 0, 0.34);
  --card-sponsor-button-background-hover: rgba(0, 0, 0, 0.42);
  --card-sponsor-button-text: rgba(248, 250, 252, 0.96);

  /* Badge colours */
  --bdg-color: rgba(var(--theme-rgb), 0.3);
  --bdg-b-color: rgba(var(--theme-rgb), 0.1);

  /* Status dot colours */
  --status-updated-color: var(--theme-main-color);
  --status-not-updated-color: #9ca3af;
}
```

---

### Filter drawer

```css
:root {
  --filter-panel-background: rgba(0, 0, 0, 0.95);
  --filter-panel-border: var(--sec-bdr);
  --filter-panel-max-width: 400px;
  --filter-panel-padding: 1.5rem;
  --filter-section-title-color: rgba(209, 213, 219, 1);
  --filter-option-background: rgba(0, 0, 0, 0.3);
  --filter-option-background-active: var(--sec-hvr);
  --filter-option-text-active: var(--prim);
  --filter-reset-background: transparent;
  --filter-apply-background: var(--prim-grd);
  --filter-close-color: rgba(203, 213, 225, 0.82);
  --filter-checkbox-background: var(--filter-panel-background);
  --filter-checkbox-border: rgba(255, 255, 255, 0.2);
  --filter-dropdown-option-selected-background: rgba(var(--prim-rgb), 0.2);
}
```

---

### Featured card

The background and logo images displayed in the featured card are configured in
`src/config/pages/global.js` under `featured`:

```js
featured: {
  backgroundImageSrc: "/public/assets/overlay/promo-1.png",  // main photo
  backgroundImageAlt: "Advertisement background",
  logoImageSrc:       "/public/assets/overlay/promo-2.png",  // overlay logo
  logoImageAlt:       "",
}
```

Swap either value with any URL (absolute or root-relative) to use a custom image.
The defaults are kept as-is unless you change them.

To apply a per-theme CSS filter on those images (e.g. invert for a light theme):

```css
:root[data-theme="my-theme"] .featured-background-image,
:root[data-theme="my-theme"] .featured-logo-image {
  filter: invert(1) hue-rotate(180deg);
}
```

```css
:root {
  --featured-card-max-width: 400px;
  --featured-card-radius: 0.75rem;
  --featured-card-accent-fill: var(--prim-grd);   /* Top accent bar */
  --featured-title-color: #ffffff;
  --featured-action-color: rgba(255, 255, 255, 0.7);
  --featured-action-hover-color: var(--fg);
  --featured-image-background: rgba(0, 0, 0, 0.2);
  --featured-overlay-fill: linear-gradient(90deg, var(--theme-gradient-start-color) 0%, var(--theme-main-color) 46%, #ffffff 100%);
  --featured-overlay-opacity: 0.98;

  /* Follow global card surface settings (1 = yes, 0 = no) */
  --featured-follow-global-surface: 1;
  --featured-surface-tint-color: #000000;
  --featured-surface-tint-power: 82;
  --featured-surface-blur-enabled: 0;
  --featured-surface-blur-strength: 12;
}
```

---

### Promo section

```css
:root {
  --hero-width: 48rem;
  --promo-card-background: var(--card-surface-background);
  --promo-card-padding: clamp(1.4rem, 3.2vw, 2rem);
  --promo-accent-fill: linear-gradient(to bottom, var(--prim), var(--prim-hvr));
  --promo-title-accent: var(--prim);
  --promo-description: var(--txt-mut);
  --promo-button-fill: var(--prim-grd);
  --promo-button-text: #ffffff;
  --promo-button-shadow: 0 4px 6px -1px rgba(var(--prim-rgb), 0.1), 0 2px 4px -1px rgba(var(--prim-rgb), 0.05);
  --promo-muted-button-text: rgba(209, 213, 219, 0.9);
  --promo-banner-max-width: 600px;
}
```

---

### Info modal

```css
:root {
  --info-modal-background: rgba(0, 0, 0, 0.88);
  --info-modal-backdrop-blur: 0px;        /* e.g. "16px" for glass */
  --info-modal-header-accent-color: var(--theme-main-color);
  --info-modal-header-background: linear-gradient(to right, rgba(var(--prim-rgb), 0.1), transparent);

  /* Follow global card surface settings (1 = yes, 0 = no) */
  --info-modal-follow-global-surface: 0;
  --info-modal-surface-tint-color: #000000;
  --info-modal-surface-tint-power: 88;
  --info-modal-surface-blur-enabled: 0;
  --info-modal-surface-blur-strength: 12;
}
```

---

### Background media (wallpaper)

```css
:root {
  /* Set to a URL string to enable a wallpaper/video behind the site */
  --theme-background-media-url: none;
  /* e.g. --theme-background-media-url: url("/public/assets/misc/my-bg.jpg"); */

  --background-media-overlay-color: #000000;
  --background-media-overlay-strength: 38;   /* 0–100, controls overlay opacity */
}
```

---

### Motion & spacing

```css
:root {
  --smooth-ease: cubic-bezier(0.65, 0, 0.35, 1);
  --smooth-duration: 0.45s;
  --rad: 0.5rem;         /* Global border-radius base */
  --shd: 0 10px 25px rgba(0, 0, 0, 0.2);
  --shd-hvr: 0 15px 30px rgba(0, 0, 0, 0.3);
}
```

---

## 7. Visibility preference classes

The user-facing toggles in the Themes drawer add classes to `document.body` (or set
`hidden` on specific elements). You can hook into these from your theme CSS.

| Toggle | What changes in the DOM |
|---|---|
| Always hide featured ads | `.main-lyt` gets class `ads-hidden` |
| Hide navbar warning | `#topWarningBar` gets class `hidden` + `hidden` attribute |
| Hide bottom fade | `<body>` gets class `site-bottom-fade-hidden` |
| Always hide promo | Promo `<section>` gets `hidden` attribute (no CSS class) |
| Block toast pop ups | Internal JS flag only — no DOM class |

```css
/* Featured ads hidden */
.main-lyt.ads-hidden { }

/* Navbar warning hidden */
#topWarningBar.hidden { }

/* Bottom fade hidden */
body.site-bottom-fade-hidden { }
```

---

## 8. Light theme tips

Building a light/white theme requires extra work because the site is designed dark-first.
Many component stylesheets hardcode white colours for text, and the JS theming system resets
several surface tokens via inline styles. Here is what to keep in mind.

### Override inline-style surface vars with `!important`

`applyPresetSurfaceStyle()` in `themes.js` resets these tokens on `<html>` as inline styles
*after* your CSS loads, so author `!important` is required to win:

```css
:root[data-theme="light"] {
  --card-surface-background:          rgba(245, 236, 210, 0.65) !important;
  --card-surface-tint:                rgba(240, 225, 190, 0.55) !important;
  --promo-card-background:            rgb(250, 248, 243)        !important;
  --footer-bg:                        rgb(250, 246, 238)        !important;
  --navbar-background:                rgba(250, 248, 243, 0.92) !important;
  --navbar-mobile-panel-background:   rgb(250, 248, 243)        !important;
}
```

### Override hardcoded white text per selector

Components use literal `rgba(248, 250, 252, …)` values that tokens cannot reach. You must
target the relevant selectors directly:

```css
/* Example — card titles are hardcoded white */
:root[data-theme="light"] .ph-title-name {
  color: #1c1917 !important;
}

/* sUNC modal search input */
:root[data-theme="light"] .sunc-widget-search input {
  color: #1c1917 !important;
}
```

### sUNC modal surface tokens

The sUNC modal exposes its own local tokens you can override for a full re-skin:

```css
:root[data-theme="light"] .sunc-modal {
  --sunc-surface:       rgb(253, 250, 244);           /* panel background */
  --sunc-surface-strong: rgba(217, 119, 6, 0.04);    /* footer tint */
  --sunc-surface-card:  rgba(245, 236, 210, 0.55);   /* result card bg */
  --sunc-border:        rgba(180, 155, 100, 0.28);
  --sunc-muted:         #1c1917;                      /* label text */
}
```

### Status badge colours

| Token | Default | Purpose |
|---|---|---|
| `--status-updated-color` | accent | Updated badge / swatch |
| `--status-not-updated-color` | `#9ca3af` | Non-updated badge / swatch |

Cards with status class `.is-issue` use an orange accent by default. Override only for
`.is-issue` if you want a distinct colour (e.g. red on a light theme):

```css
:root[data-theme="light"] .exploit-card-placeholder.is-issue .ph-rating {
  --sunc-accent-rgb: 220, 38, 38;
}
:root[data-theme="light"] .exploit-card-placeholder.is-issue .ph-rating-logo-main {
  background: rgba(220, 38, 38, 0.9) !important;
}
:root[data-theme="light"] .exploit-card-placeholder.is-issue .ph-title-meta-ico {
  color: rgba(220, 38, 38, 0.9) !important;
}
```

### Invert the featured banner image

If the default dark background photo clashes with your light theme, flip it with CSS filters:

```css
/* Invert the photo only — leave the logo overlay untouched */
:root[data-theme="light"] .featured-background-image {
  filter: invert(1) hue-rotate(180deg) !important;
}
```

`hue-rotate(180deg)` corrects the colour shift so orange/gold tones do not become blue after
the invert.

### Logo images (white PNGs)

The navbar and footer logos are white PNGs. Use `brightness()` to tint them:

```css
/* ~#DADAD2 — light gray */
:root[data-theme="light"] .navbar-logo-base-image,
:root[data-theme="light"] .footer-brand-image {
  filter: brightness(0.855) !important;
}
```

---

## 9. Full example theme

See [example.css](./example.css) for a complete, ready-to-use "Emerald" theme you can copy,
rename, and modify. It demonstrates:

- Accent colour swap with a correct `--theme-rgb` triplet
- Dark green background + card surface tint
- Glass / frosted card surfaces using `backdrop-filter`
- Custom Google Font via `--theme-font-import-url`
- Wallpaper / background media
- Navbar & footer surface tweaks
- Rounded-corner boost
