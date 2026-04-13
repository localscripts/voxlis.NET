(() => {
  // ==========================================================================
  //  FULL THEME DEFINITIONS
  //  Edit this list to add your own themes to the Themes drawer.
  //
  //  Each theme appears as a card with a thumbnail image, title, and author
  //  line exactly like the screenshot in src/themes/README.md.
  //
  //  Required fields:
  //    id         - unique string, used as data-theme="id" on <html>
  //    label      - display name shown in the card
  //    swatch     - hex accent colour (#rrggbb)
  //    swatchRgb  - "r, g, b" triplet matching the swatch (no # or spaces)
  //
  //  Optional fields:
  //    author     - shown as "@author" under the label
  //    thumbnail  - path to a square preview image (recommended: 128×128+)
  //    cssFile    - path to a CSS file to inject when this theme is active
  //                 (see src/themes/example.css and README.md for guidance)
  // ==========================================================================
  const FULL_THEMES = [
    {
      id: "supremacy",
      label: "Supremacy",
      author: "voxlis",
      thumbnail: "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/2139460/ceac3f2dd323201409ff386df51811edefe515bb.gif",
      swatch: "#dc2626",
      swatchRgb: "220, 38, 38",
      cssFile: "/src/themes/supremacy.css",
    },
    {
      id: "mercy",
      label: "Vanilla Mercy",
      author: "voxlis",
      thumbnail: "https://i.pinimg.com/736x/7a/ae/ea/7aaeeaee3da7bb7e40e2c529be174e0b.jpg",
      swatch: "#d97706",
      swatchRgb: "217, 119, 6",
      cssFile: "/src/themes/mercy.css",
    },
    // Add more themes here — see README.md § 4 for the full guide:
    // {
    //   id: "kawaii",
    //   label: "Kawaii",
    //   author: "voxlis",
    //   thumbnail: "/src/themes/thumbnails/kawaii.jpg",
    //   swatch: "#f472b6",
    //   swatchRgb: "244, 114, 182",
    //   cssFile: "/src/themes/kawaii.css",
    // },
  ];

  // ==========================================================================
  //  REGISTRATION — do not edit below this line
  //  Merges FULL_THEMES into window.VOXLIS_CONFIG and wires up CSS injection.
  // ==========================================================================

  if (!FULL_THEMES.length) return;

  // -- Helpers ----------------------------------------------------------------
  const deepFreeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.getOwnPropertyNames(value).forEach((key) => deepFreeze(value[key]));
    return Object.freeze(value);
  };

  const hexToRgbCss = (hex) => {
    if (typeof hex !== "string") return null;
    const m = hex.trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return null;
    return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
  };

  const mixHex = (hex, toHex, ratio) => {
    const parse = (h) => {
      const m = (h || "").trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
    };
    const a = parse(hex);
    const b = parse(toHex);
    if (!a || !b) return hex;
    const ch = (i) => Math.round(a[i] + (b[i] - a[i]) * ratio).toString(16).padStart(2, "0");
    return `#${ch(0)}${ch(1)}${ch(2)}`;
  };

  // -- Merge themes into config -----------------------------------------------
  const existing = window.VOXLIS_CONFIG && typeof window.VOXLIS_CONFIG === "object"
    ? window.VOXLIS_CONFIG
    : {};
  const existingThemes = existing.themes ?? {};

  const fullOptions = FULL_THEMES.map((t) => ({
    id: t.id,
    label: t.label,
    credit: t.author ? `@${t.author}` : undefined,
    swatch: t.swatch ?? "#ffffff",
    swatchImage: t.thumbnail ?? undefined,
    group: "full",
    // Store these on the option for use in the accent-apply hook below.
    // The themes drawer ignores unknown fields so this is safe.
    _cssFile: t.cssFile ?? null,
    _swatchRgb: t.swatchRgb ?? hexToRgbCss(t.swatch) ?? "255, 255, 255",
  }));

  window.VOXLIS_CONFIG = deepFreeze({
    ...existing,
    themes: {
      ...existingThemes,
      groups: [
        ...(Array.isArray(existingThemes.groups) ? existingThemes.groups : []),
        { id: "full", label: "Full Themes" },
      ],
      options: [
        ...(Array.isArray(existingThemes.options) ? existingThemes.options : []),
        ...fullOptions,
      ],
    },
  });

  // -- CSS file injection -----------------------------------------------------
  const FULL_THEME_IDS = new Set(FULL_THEMES.map((t) => t.id));
  const FULL_THEME_MAP = new Map(FULL_THEMES.map((t) => [t.id, t]));
  const LINK_ID = "voxlis-full-theme-stylesheet";
  const VIDEO_BG_ID = "voxlis-full-theme-video-bg";

  const injectCss = (href) => {
    const existing = document.getElementById(LINK_ID);
    if (existing) {
      if (existing.getAttribute("href") === href) return;
      existing.remove();
    }
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };

  const removeCss = () => {
    document.getElementById(LINK_ID)?.remove();
  };

  const injectVideoBg = (src) => {
    removeVideoBg();
    const video = document.createElement("video");
    video.id = VIDEO_BG_ID;
    video.src = src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("aria-hidden", "true");
    document.body.prepend(video);
    document.body.classList.add("has-video-background");
  };

  const removeVideoBg = () => {
    document.getElementById(VIDEO_BG_ID)?.remove();
    document.body.classList.remove("has-video-background");
  };

  // -- Accent colour application for full themes ------------------------------
  //
  //  When the built-in themes.js applies a preset it resets inline accent vars
  //  back to the preset defaults.  We re-apply them immediately after on the
  //  next microtask so the full theme's accent colour wins for anything driven
  //  by --theme-main-color etc.
  //
  //  Properties that themes.js resets via inline style (applyPresetSurfaceStyle)
  //  can still be overridden from a CSS file using  !important  — see README.

  const applyFullThemeAccent = (theme) => {
    if (!theme) return;
    const hex = theme.swatch ?? "#ffffff";
    const rgb = theme.swatchRgb ?? hexToRgbCss(hex) ?? "255, 255, 255";
    const hover = mixHex(hex, "#000000", 0.16);
    const gradStart = mixHex(hex, "#ffffff", 0.18);
    const gradEnd = mixHex(hex, "#000000", 0.12);
    const root = document.documentElement;
    root.style.setProperty("--theme-main-color", hex);
    root.style.setProperty("--theme-hover-color", hover);
    root.style.setProperty("--theme-gradient-start-color", gradStart);
    root.style.setProperty("--theme-gradient-end-color", gradEnd);
    root.style.setProperty("--theme-rgb", rgb);
  };

  const THEME_CHANGE_EVENT =
    window.VOXLIS_CONFIG?.themes?.events?.change ?? "site-theme-change";

  window.addEventListener(THEME_CHANGE_EVENT, (event) => {
    const themeId = event?.detail?.theme ?? "";

    if (!FULL_THEME_IDS.has(themeId)) {
      removeCss();
      removeVideoBg();
      return;
    }

    const theme = FULL_THEME_MAP.get(themeId);

    // Defer by one microtask so our accent overrides run after the
    // applyPresetSurfaceStyle call inside themes.js clears them.
    Promise.resolve().then(() => {
      applyFullThemeAccent(theme);
    });

    // Read video background URL from the theme's CSS custom property
    // --voxlis-video-bg so the URL lives in the CSS file, not here.
    // Must wait for the stylesheet to finish loading before reading computed
    // styles — requestAnimationFrame alone is not enough on a cold load.
    removeVideoBg();
    if (theme?.cssFile) {
      injectCss(theme.cssFile);
      const tryInjectVideo = () => {
        const rawUrl = getComputedStyle(document.documentElement)
          .getPropertyValue("--voxlis-video-bg")
          .trim()
          .replace(/^["']|["']$/g, "");
        if (rawUrl) injectVideoBg(rawUrl);
      };
      const link = document.getElementById(LINK_ID);
      // link.sheet is non-null once the browser has parsed the stylesheet.
      // If it's already loaded (e.g. same href cached), run on next frame.
      if (link?.sheet) {
        requestAnimationFrame(tryInjectVideo);
      } else if (link) {
        link.addEventListener("load", tryInjectVideo, { once: true });
      }
    } else {
      removeCss();
    }
  });
})();
