(() => {
  const themeConfig = window.VOXLIS_CONFIG?.themes ?? {};
  const storageKeys = themeConfig.storageKeys ?? {};
  const themeIds = themeConfig.ids ?? {};
  const themeEvents = themeConfig.events ?? {};
  const themeDrawerConfig = themeConfig.drawer ?? {};
  const outlineBrightnessConfig = themeConfig.outlineBrightness ?? {};
  const surfaceBlurConfig = themeConfig.surfaceBlur ?? {};
  const surfaceTintConfig = themeConfig.surfaceTint ?? {};
  const themeTransferConfig = themeConfig.transfer ?? {};
  const backgroundMediaConfig = themeConfig.backgroundMedia ?? {};
  const backgroundTintConfig = themeConfig.backgroundTint ?? {};
  const kawaiiMobileTintConfig = themeConfig.kawaiiMobileTint ?? {};

  const THEME_STORAGE_KEY = storageKeys.theme ?? "voxlis-theme";
  const CUSTOM_THEME_STORAGE_KEY = storageKeys.customTheme ?? "voxlis-custom-theme-hex";
  const CUSTOM_THEME_CSS_STORAGE_KEY = storageKeys.customThemeCss ?? "voxlis-custom-theme-css";
  const OUTLINE_BRIGHTNESS_STORAGE_KEY = storageKeys.outlineBrightness ?? "voxlis-outline-brightness";
  const THEME_DRAWER_WIDTH_STORAGE_KEY = storageKeys.drawerWidth ?? "voxlis-theme-drawer-width";
  const BACKGROUND_MEDIA_STORAGE_KEY = storageKeys.backgroundMedia ?? "voxlis-background-media";
  const BACKGROUND_TINT_HEX_STORAGE_KEY = storageKeys.backgroundTintHex ?? "voxlis-background-tint-hex";
  const BACKGROUND_TINT_POWER_STORAGE_KEY = storageKeys.backgroundTintPower ?? "voxlis-background-tint-power";
  const SURFACE_BLUR_ENABLED_STORAGE_KEY = storageKeys.surfaceBlurEnabled ?? "voxlis-surface-blur-enabled";
  const SURFACE_BLUR_STRENGTH_STORAGE_KEY = storageKeys.surfaceBlurStrength ?? "voxlis-surface-blur-strength";
  const SURFACE_TINT_HEX_STORAGE_KEY = storageKeys.surfaceTintHex ?? "voxlis-surface-tint-hex";
  const SURFACE_TINT_POWER_STORAGE_KEY = storageKeys.surfaceTintPower ?? "voxlis-surface-tint-power";
  const CARD_OUTLINE_HEX_STORAGE_KEY = storageKeys.cardOutlineHex ?? "voxlis-card-outline-hex";
  const HIDE_FEATURED_ADS_STORAGE_KEY = storageKeys.hideFeaturedAds ?? "voxlis-hide-featured-ads";
  const HIDE_PROMO_STORAGE_KEY = storageKeys.hidePromo ?? "voxlis-hide-promo";
  const HIDE_TOAST_POPUPS_STORAGE_KEY = storageKeys.hideToastPopups ?? "voxlis-hide-toast-popups";
  const HIDE_NAVBAR_WARNING_STORAGE_KEY = storageKeys.hideNavbarWarning ?? "voxlis-hide-navbar-warning";
  const CUSTOM_THEME_ID = themeIds.custom ?? "custom";
  const DEFAULT_THEME_ID = themeIds.default ?? "blue";
  const THEME_CHANGE_EVENT = themeEvents.change ?? "site-theme-change";
  const THEME_DRAWER_EXIT_FALLBACK_MS = themeDrawerConfig.exitFallbackMs ?? 260;
  const THEME_DRAWER_DEFAULT_TAB = themeDrawerConfig.defaultTab ?? "presets";
  const THEME_DRAWER_DEFAULT_EDITOR_TAB = themeDrawerConfig.defaultEditorTab ?? "global";
  const THEME_DRAWER_DEFAULT_WIDTH = themeDrawerConfig.defaultWidth ?? 384;
  const THEME_DRAWER_MIN_WIDTH = themeDrawerConfig.minWidth ?? 320;
  const THEME_DRAWER_MAX_WIDTH = themeDrawerConfig.maxWidth ?? 720;
  const THEME_DRAWER_DESKTOP_MEDIA_QUERY = window.matchMedia(
    themeDrawerConfig.desktopMediaQuery ?? "(min-width: 769px)"
  );
  const OUTLINE_BRIGHTNESS_MIN = outlineBrightnessConfig.min ?? 0;
  const OUTLINE_BRIGHTNESS_MAX = outlineBrightnessConfig.max ?? 64;
  const OUTLINE_BRIGHTNESS_DEFAULT = outlineBrightnessConfig.default ?? 7;
  const SURFACE_BLUR_MIN = surfaceBlurConfig.min ?? 0;
  const SURFACE_BLUR_MAX = surfaceBlurConfig.max ?? 24;
  const SURFACE_BLUR_DEFAULT = surfaceBlurConfig.default ?? 12;
  const SURFACE_TINT_POWER_MIN = surfaceTintConfig.min ?? 0;
  const SURFACE_TINT_POWER_MAX = surfaceTintConfig.max ?? 100;
  const SURFACE_TINT_POWER_DEFAULT = surfaceTintConfig.default ?? 82;
  const SURFACE_TINT_HEX_DEFAULT = surfaceTintConfig.defaultHex ?? "#000000";
  const BACKGROUND_TINT_POWER_MIN = backgroundTintConfig.min ?? 0;
  const BACKGROUND_TINT_POWER_MAX = backgroundTintConfig.max ?? 100;
  const BACKGROUND_TINT_POWER_DEFAULT = backgroundTintConfig.default ?? 72;
  const BACKGROUND_TINT_HEX_DEFAULT = backgroundTintConfig.defaultHex ?? "#000000";
  const SURFACE_BLUR_TINT_SCALE = surfaceBlurConfig.tintScale ?? 18 / 82;
  const FOOTER_BLUR_TINT_SCALE = surfaceBlurConfig.footerTintScale ?? 16 / 82;
  const THEME_TRANSFER_TYPE = themeTransferConfig.type ?? "voxlis-theme";
  const THEME_TRANSFER_VERSION = themeTransferConfig.version ?? 1;
  const BACKGROUND_MEDIA_DEFAULT_STATUS =
    backgroundMediaConfig.defaultStatus ??
    "Paste an image or video link to use as the site background.";
  const KAWAII_MOBILE_TINT_CLASS = kawaiiMobileTintConfig.className ?? "theme-kawaii-mobile-tint";
  const KAWAII_MOBILE_TINT_MEDIA_QUERY = window.matchMedia(
    kawaiiMobileTintConfig.mediaQuery ?? "(max-width: 980px)"
  );
  const THEME_GROUPS = Array.isArray(themeConfig.groups) && themeConfig.groups.length
    ? themeConfig.groups
    : [
        { id: "full", label: "Full Themes" },
        { id: "accent", label: "Color Variants" },
      ];
  const THEME_OPTIONS = (
    Array.isArray(themeConfig.options) && themeConfig.options.length
      ? themeConfig.options
      : [
          { id: "kawaii", label: "Kawaii", swatch: "#FF9AD5", group: "full", surfaceBlurEnabled: true, surfaceBlurStrength: 10, hideFeaturedAds: true },
          { id: "blue", label: "Legacy", swatch: "#3B82F6", group: "accent", surfaceBlurEnabled: false, surfaceBlurStrength: SURFACE_BLUR_DEFAULT, hideFeaturedAds: false },
          { id: "legacy", label: "Supremacy", swatch: "#EF4444", group: "full", surfaceBlurEnabled: false, surfaceBlurStrength: SURFACE_BLUR_DEFAULT, hideFeaturedAds: false },
          { id: "weao", label: "weao", swatch: "#1A1A1A", group: "accent", surfaceBlurEnabled: false, surfaceBlurStrength: SURFACE_BLUR_DEFAULT, hideFeaturedAds: false },
          {
            id: "status",
            label: "Kawaii",
            swatch: "#FF9AD5",
            swatchImage:
              "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/2194790/60472c275e62f3f4ff4d5aa98bc501accd86099f.gif",
            group: "full",
            surfaceBlurEnabled: true,
            surfaceBlurStrength: 10,
            hideFeaturedAds: true,
          },
        ]
  ).map((option) => ({
    ...option,
    surfaceBlurEnabled: option.surfaceBlurEnabled === true,
    surfaceBlurStrength:
      Number.isFinite(option.surfaceBlurStrength) ? option.surfaceBlurStrength : SURFACE_BLUR_DEFAULT,
    hideFeaturedAds: option.hideFeaturedAds === true,
  }));
  const VALID_THEMES = new Set(THEME_OPTIONS.map(({ id }) => id));
  const THEME_OPTION_MAP = new Map(THEME_OPTIONS.map((option) => [option.id, option]));

  const getThemeRoot = () => document.documentElement;
  const getThemeTokenValue = (name, fallback = "") =>
    window.getComputedStyle(getThemeRoot()).getPropertyValue(name).trim() || fallback;

  const shouldUseKawaiiMobileTintMode = () => {
    const root = getThemeRoot();
    return root.dataset.theme === "kawaii" && KAWAII_MOBILE_TINT_MEDIA_QUERY.matches;
  };

  const syncKawaiiMobileTintModeClass = () => {
    const root = getThemeRoot();
    const nextState = shouldUseKawaiiMobileTintMode();
    root.classList.toggle(KAWAII_MOBILE_TINT_CLASS, nextState);
    return nextState;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const parseTransitionTimeMs = (value = "") => {
    const trimmed = `${value}`.trim();
    if (!trimmed) return 0;
    if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed) || 0;
    if (trimmed.endsWith("s")) return (Number.parseFloat(trimmed) || 0) * 1000;
    return Number.parseFloat(trimmed) || 0;
  };

  const getMaxTransitionTimeMs = (node) => {
    if (!node) return 0;

    const styles = window.getComputedStyle(node);
    const durations = styles.transitionDuration.split(",").map(parseTransitionTimeMs);
    const delays = styles.transitionDelay.split(",").map(parseTransitionTimeMs);
    const totalCount = Math.max(durations.length, delays.length, 1);

    let maxTime = 0;
    for (let index = 0; index < totalCount; index += 1) {
      const duration = durations[index] ?? durations[durations.length - 1] ?? 0;
      const delay = delays[index] ?? delays[delays.length - 1] ?? 0;
      maxTime = Math.max(maxTime, duration + delay);
    }

    return maxTime;
  };

  const normalizeTheme = (theme) => {
    if (theme === CUSTOM_THEME_ID) return CUSTOM_THEME_ID;
    if (theme === "red") return "legacy";
    return VALID_THEMES.has(theme) ? theme : DEFAULT_THEME_ID;
  };

  const normalizeOutlineBrightness = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    if (!Number.isFinite(parsed)) {
      return OUTLINE_BRIGHTNESS_DEFAULT;
    }

    return clamp(parsed, OUTLINE_BRIGHTNESS_MIN, OUTLINE_BRIGHTNESS_MAX);
  };

  const normalizeSurfaceBlurStrength = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    if (!Number.isFinite(parsed)) {
      return SURFACE_BLUR_DEFAULT;
    }

    return clamp(parsed, SURFACE_BLUR_MIN, SURFACE_BLUR_MAX);
  };

  const normalizeSurfaceTintPower = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    if (!Number.isFinite(parsed)) {
      return SURFACE_TINT_POWER_DEFAULT;
    }

    return clamp(parsed, SURFACE_TINT_POWER_MIN, SURFACE_TINT_POWER_MAX);
  };

  const normalizeBackgroundTintPower = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    if (!Number.isFinite(parsed)) {
      return BACKGROUND_TINT_POWER_DEFAULT;
    }

    return clamp(parsed, BACKGROUND_TINT_POWER_MIN, BACKGROUND_TINT_POWER_MAX);
  };

  const getThemeDrawerViewportMaxWidth = () =>
    Math.max(
      THEME_DRAWER_MIN_WIDTH,
      Math.min(THEME_DRAWER_MAX_WIDTH, Math.max(THEME_DRAWER_MIN_WIDTH, window.innerWidth - 72))
    );

  const normalizeThemeDrawerWidth = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    const maxWidth = getThemeDrawerViewportMaxWidth();
    const fallback = clamp(THEME_DRAWER_DEFAULT_WIDTH, THEME_DRAWER_MIN_WIDTH, maxWidth);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return clamp(parsed, THEME_DRAWER_MIN_WIDTH, maxWidth);
  };

  const normalizeBooleanPreference = (value) =>
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1;

  const normalizeBackgroundMediaUrl = (value) => {
    if (typeof value !== "string") return "";

    const trimmed = value.trim();
    const unwrapped = trimmed
      .replace(/^url\((['"]?)(.*?)\1\)$/i, "$2")
      .replace(/^(['"])(.*)\1$/, "$2")
      .trim();

    if (!unwrapped || /^none$/i.test(unwrapped) || /^javascript:/i.test(unwrapped)) {
      return "";
    }

    try {
      return new URL(unwrapped, window.location.href).href;
    } catch {
      return "";
    }
  };

  const normalizeThemeFontImportUrl = (value) => {
    if (typeof value !== "string") return "";

    const trimmed = value.trim();
    const unwrapped = trimmed
      .replace(/^url\((['"]?)(.*?)\1\)$/i, "$2")
      .replace(/^(['"])(.*)\1$/, "$2")
      .trim();

    if (!unwrapped || /^none$/i.test(unwrapped) || /^javascript:/i.test(unwrapped)) {
      return "";
    }

    try {
      return new URL(unwrapped, window.location.href).href;
    } catch {
      return "";
    }
  };

  const normalizeHex = (value) => {
    if (typeof value !== "string") return null;

    const raw = value.trim().replace(/^#/, "");
    if (!raw) return null;

    const expanded = /^[0-9a-fA-F]{3}$/.test(raw)
      ? raw.split("").map((char) => `${char}${char}`).join("")
      : raw;

    if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
    return `#${expanded.toUpperCase()}`;
  };

  const hexToRgb = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;

    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
    };
  };

  const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b]
      .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;

  const outlineBrightnessToHex = (value) => {
    const channel = normalizeOutlineBrightness(value).toString(16).padStart(2, "0");
    return `#${channel}${channel}${channel}`.toUpperCase();
  };

  const hexToOutlineBrightness = (value) => {
    const normalized = normalizeHex(value);
    if (!normalized) {
      return OUTLINE_BRIGHTNESS_DEFAULT;
    }

    return normalizeOutlineBrightness(Number.parseInt(normalized.slice(1, 3), 16));
  };

  const mixHex = (baseHex, targetHex, weight) => {
    const base = hexToRgb(baseHex);
    const target = hexToRgb(targetHex);
    if (!base || !target) return normalizeHex(baseHex) || "#3B82F6";

    const ratio = clamp(weight, 0, 1);
    return rgbToHex({
      r: base.r + (target.r - base.r) * ratio,
      g: base.g + (target.g - base.g) * ratio,
      b: base.b + (target.b - base.b) * ratio,
    });
  };

  const rgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(59, 130, 246, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const getBackgroundMediaType = (url) => {
    const normalized = normalizeBackgroundMediaUrl(url);
    if (!normalized) return null;

    if (/^data:video\//i.test(normalized)) return "video";
    if (/^data:image\//i.test(normalized)) return "image";

    try {
      const pathname = new URL(normalized).pathname.toLowerCase();
      if (/\.(mp4|webm|ogg|ogv|m4v|mov)$/i.test(pathname)) {
        return "video";
      }
    } catch {
      return "image";
    }

    return "image";
  };

  const ensureBackgroundMediaLayer = () => {
    let root = document.getElementById("siteBackgroundMedia");
    let image = document.getElementById("siteBackgroundMediaImage");
    let video = document.getElementById("siteBackgroundMediaVideo");
    let shade = document.getElementById("siteBackgroundMediaShade");
    let overlay = document.getElementById("siteBackgroundMediaOverlay");

    if (root && image && video && shade && overlay) {
      return { root, image, video, shade, overlay };
    }

    if (!root) {
      root = document.createElement("div");
      root.id = "siteBackgroundMedia";
      root.className = "site-background-media";
      root.setAttribute("aria-hidden", "true");
      root.hidden = true;
      document.body.prepend(root);
    }

    if (!image) {
      image = document.createElement("img");
      image.id = "siteBackgroundMediaImage";
      image.className = "site-background-media-image";
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      image.hidden = true;
      root.append(image);
    }

    if (!video) {
      video = document.createElement("video");
      video.id = "siteBackgroundMediaVideo";
      video.className = "site-background-media-video";
      video.hidden = true;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      root.append(video);
    }

    if (!shade) {
      shade = document.createElement("div");
      shade.id = "siteBackgroundMediaShade";
      shade.className = "site-background-media-shade";
      shade.setAttribute("aria-hidden", "true");
      root.append(shade);
    }

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "siteBackgroundMediaOverlay";
      overlay.className = "site-background-media-overlay";
      overlay.setAttribute("aria-hidden", "true");
      root.append(overlay);
    }

    return { root, image, video, shade, overlay };
  };

  const syncThemeFontImport = () => {
    const href = normalizeThemeFontImportUrl(
      window.getComputedStyle(getThemeRoot()).getPropertyValue("--theme-font-import-url")
    );
    const existing = document.getElementById("siteThemeFontStylesheet");

    if (!href) {
      existing?.remove();
      return "";
    }

    const link = existing || document.createElement("link");
    link.id = "siteThemeFontStylesheet";
    link.rel = "stylesheet";

    if (!existing) {
      document.head.appendChild(link);
    }

    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href);
    }

    return href;
  };

  const buildCustomThemeVars = (hex) => {
    const normalized = normalizeHex(hex);
    const rgb = hexToRgb(normalized);
    if (!normalized || !rgb) return {};

    const soft = mixHex(normalized, "#FFFFFF", 0.28);
    const bright = mixHex(normalized, "#FFFFFF", 0.46);
    const hover = mixHex(normalized, "#000000", 0.22);
    const deep = mixHex(normalized, "#000000", 0.35);

    return {
      "--crd-hvr": rgba(normalized, 0.2),
      "--prim": normalized,
      "--prim-hvr": hover,
      "--prim-grd": `linear-gradient(to right, ${normalized}, ${hover})`,
      "--prim-glw": rgba(normalized, 0.5),
      "--sec-hvr": rgba(normalized, 0.1),
      "--sec-hvr-bdr": rgba(normalized, 0.5),
      "--theme-color": normalized,
      "--social-hover": normalized,
      "--card-hover": normalized,
      "--ad-color": normalized,
      "--ad2-color": normalized,
      "--ad3-color": `linear-gradient(90deg, ${soft}, ${hover})`,
      "--inp-color": normalized,
      "--inp2-color": rgba(normalized, 0.5),
      "--lbl-color": normalized,
      "--checkbx-color": rgba(normalized, 0.1),
      "--checkbx2-color": rgba(normalized, 0.3),
      "--prim-rgb": `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      "--warning-bg": `linear-gradient(135deg, ${soft}, ${deep})`,
      "--bdg-b-color": rgba(normalized, 0.1),
      "--bdg-color": rgba(normalized, 0.3),
      "--featured-overlay-fill": `linear-gradient(90deg, ${bright} 0%, ${normalized} 46%, #ffffff 100%)`,
      "--banner-overlay-fill": `linear-gradient(90deg, ${bright} 0%, ${normalized} 70%, ${hover} 100%)`,
      "--header-overlay-fill": `linear-gradient(90deg, ${bright} 0%, ${normalized} 70%, ${hover} 100%)`,
    };
  };

  const buildCustomThemeCssText = (hex, selector = ':root[data-theme="custom"]') => {
    const normalized = normalizeHex(hex) || "#3B82F6";
    const themeVars = buildCustomThemeVars(normalized);
    const lines = Object.entries(themeVars).map(([name, value]) => `  ${name}: ${value};`);
    return [selector + " {", ...lines, "}"].join("\n");
  };

  const THEME_EDITOR_VAR_NAMES = [
    "--font-family-base",
    "--font-family-ui",
    "--font-family-system",
    "--font-family-mono",
    "--card-font-family",
    "--theme-font-import-url",
    "--theme-background-media-url",
    "--bg",
    "--fg",
    "--crd-bg",
    "--site-border-color",
    "--site-outline-color",
    "--crd-bdr",
    "--crd-hvr",
    "--prim",
    "--prim-hvr",
    "--prim-grd",
    "--prim-glw",
    "--sec",
    "--sec-bdr",
    "--sec-hvr",
    "--sec-hvr-bdr",
    "--txt-mut",
    "--theme-color",
    "--footer-bg",
    "--footer-border",
    "--footer-text",
    "--footer-muted",
    "--footer-follow-global-surface",
    "--footer-surface-tint-color",
    "--footer-surface-tint-power",
    "--footer-surface-outline-color",
    "--footer-surface-blur-enabled",
    "--footer-surface-blur-strength",
    "--footer-backdrop-blur",
    "--footer-glow-color",
    "--footer-max-width",
    "--footer-horizontal-padding",
    "--footer-padding-block",
    "--footer-section-gap",
    "--footer-section-divider-spacing",
    "--footer-overlay-gradient",
    "--footer-logo-height",
    "--footer-logo-height-mobile",
    "--footer-link-gap",
    "--footer-theme-control-height",
    "--footer-theme-control-height-mobile",
    "--footer-theme-menu-shadow",
    "--footer-theme-option-hover-background",
    "--footer-theme-option-selected-background",
    "--footer-theme-swatch-size",
    "--footer-theme-swatch-border",
    "--footer-theme-swatch-default",
    "--footer-theme-highlight-shadow",
    "--footer-heart-size",
    "--footer-heart-fill",
    "--footer-credit-color",
    "--footer-meta-text-size",
    "--footer-status-gap",
    "--footer-status-dot-size",
    "--footer-status-live-color",
    "--footer-status-muted-color",
    "--status-updated-color",
    "--status-updated-rgb",
    "--status-not-updated-color",
    "--status-not-updated-rgb",
    "--exploit-card-chrome",
    "--card-surface-background",
    "--card-surface-backdrop-blur",
    "--card-action-button-tint-color",
    "--card-action-button-tint-power",
    "--card-action-button-background",
    "--card-action-button-background-hover",
    "--card-action-button-text",
    "--card-sponsor-button-tint-color",
    "--card-sponsor-button-tint-power",
    "--card-sponsor-button-background",
    "--card-sponsor-button-background-hover",
    "--card-sponsor-button-text",
    "--kawaii-mobile-surface-tint",
    "--kawaii-mobile-footer-tint",
    "--kawaii-mobile-navbar-tint",
    "--card-surface-tint",
    "--social-hover",
    "--card-hover",
    "--ad-color",
    "--ad2-color",
    "--ad3-color",
    "--inp-color",
    "--inp2-color",
    "--lbl-color",
    "--lbl2-color",
    "--checkbx-color",
    "--checkbx2-color",
    "--prim-rgb",
    "--bg-gradient",
    "--warning-bg",
    "--navbar-warning-background",
    "--navbar-warning-shadow",
    "--bdg-b-color",
    "--bdg-color",
    "--link-muted",
    "--srch-dflt",
    "--srch-dflt-dyn",
    "--smooth-ease",
    "--smooth-duration",
    "--rad",
    "--hdr-h",
    "--navbar-height",
    "--navbar-background",
    "--navbar-mobile-panel-background",
    "--navbar-position",
    "--navbar-top",
    "--navbar-scrolled-border",
    "--navbar-scroll-flash-gradient",
    "--navbar-search-max-width",
    "--navbar-search-background",
    "--navbar-search-background-focus",
    "--navbar-search-clear-color",
    "--navbar-button-background",
    "--navbar-button-accent-background",
    "--navbar-button-accent-border",
    "--navbar-button-hover-shadow",
    "--mob-panel-pad",
    "--navbar-mobile-panel-padding",
    "--mob-quick-gap",
    "--navbar-mobile-quick-gap",
    "--mob-quick-icon-size",
    "--navbar-mobile-quick-icon-size",
    "--mob-quick-icon-font",
    "--navbar-mobile-quick-icon-font-size",
    "--mob-quick-solid-size",
    "--navbar-mobile-quick-accent-size",
    "--mob-quick-solid-radius",
    "--navbar-mobile-quick-accent-radius",
    "--navbar-mobile-toggle-background",
    "--navbar-mobile-toggle-background-hover",
    "--navbar-mobile-menu-shadow",
    "--navbar-mobile-link-background",
    "--navbar-mobile-link-accent-background",
    "--filter-overlay-background",
    "--filter-panel-background",
    "--filter-panel-border",
    "--filter-panel-max-width",
    "--filter-panel-padding",
    "--filter-section-spacing",
    "--filter-section-title-color",
    "--filter-section-dot-fill",
    "--filter-close-color",
    "--filter-close-color-hover",
    "--filter-option-background",
    "--filter-option-border",
    "--filter-option-background-active",
    "--filter-option-border-active",
    "--filter-option-text-active",
    "--filter-checkbox-background",
    "--filter-checkbox-border",
    "--filter-checkbox-background-hover",
    "--filter-checkbox-border-hover",
    "--filter-dropdown-option-hover-background",
    "--filter-dropdown-option-selected-background",
    "--filter-reset-background",
    "--filter-reset-border",
    "--filter-reset-border-hover",
    "--filter-reset-color",
    "--filter-apply-background",
    "--surface-control-bg",
    "--surface-control-bg-hover",
    "--surface-overlay-bg",
    "--info-modal-follow-global-surface",
    "--info-modal-surface-tint-color",
    "--info-modal-surface-tint-power",
    "--info-modal-surface-outline-color",
    "--info-modal-surface-blur-enabled",
    "--info-modal-surface-blur-strength",
    "--info-modal-background",
    "--info-modal-backdrop-blur",
    "--info-modal-header-accent-color",
    "--info-modal-header-background",
    "--featured-follow-global-surface",
    "--featured-surface-tint-color",
    "--featured-surface-tint-power",
    "--featured-surface-outline-color",
    "--featured-surface-blur-enabled",
    "--featured-surface-blur-strength",
    "--featured-surface-background",
    "--featured-surface-backdrop-blur",
    "--prim-glow-shadow",
    "--featured-section-spacing",
    "--featured-hide-duration",
    "--featured-card-max-width",
    "--featured-card-border",
    "--featured-card-radius",
    "--featured-card-header-padding",
    "--featured-card-header-border",
    "--featured-card-body-padding",
    "--featured-card-accent-height",
    "--featured-card-accent-fill",
    "--featured-title-font-size",
    "--featured-title-color",
    "--featured-title-letter-spacing",
    "--featured-action-color",
    "--featured-action-hover-color",
    "--featured-image-background",
    "--featured-image-radius",
    "--featured-overlay-fill",
    "--featured-overlay-opacity",
    "--featured-overlay-mask",
    "--banner-overlay-fill",
    "--banner-overlay-opacity",
    "--banner-overlay-mask",
    "--header-overlay-fill",
    "--header-overlay-opacity",
    "--header-overlay-mask",
    "--brand-gradient-enabled",
    "--brand-gradient-color",
    "--brand-gradient-offset",
    "--sponsor-overlay-mask",
    "--footer-heart-mask",
    "--shd",
    "--shd-hvr",
    "--hero-width",
    "--promo-hero-max-width",
    "--promo-text-max-width",
    "--promo-card-background",
    "--promo-card-padding",
    "--promo-grid-fill",
    "--promo-glow-size",
    "--promo-glow-offset",
    "--promo-glow-fill",
    "--promo-glow-blur",
    "--promo-accent-width",
    "--promo-accent-height",
    "--promo-accent-fill",
    "--promo-accent-gap",
    "--promo-accent-offset-top",
    "--promo-title-accent",
    "--promo-description",
    "--promo-button-gap",
    "--promo-button-fill",
    "--promo-button-text",
    "--promo-button-padding",
    "--promo-button-shadow",
    "--promo-button-hover-shadow",
    "--promo-button-icon-fill",
    "--promo-button-icon-color",
    "--promo-button-icon-radius",
    "--promo-button-shine",
    "--promo-muted-button-text",
    "--promo-muted-button-icon",
    "--promo-banner-max-width",
  ];

  const OVERLAY_MASK_VAR_NAMES = new Set([
    "--featured-overlay-mask",
    "--banner-overlay-mask",
    "--header-overlay-mask",
    "--sponsor-overlay-mask",
    "--footer-heart-mask",
  ]);

  const normalizeOverlayMaskValue = (name, value) => {
    if (!OVERLAY_MASK_VAR_NAMES.has(name) || typeof value !== "string") return value;
    const urlMatch = value.match(/url\([^)]+\)/i);
    const rawValue = (urlMatch?.[0] || value).trim();
    const assetPathMatch = rawValue.match(/^url\((['"]?)([^'")]+)\1\)$/i);
    if (!assetPathMatch) return rawValue;

    const [, quote, rawPath] = assetPathMatch;
    const normalizedPath = rawPath.trim();
    if (
      /^([a-z]+:|\/|#)/i.test(normalizedPath) ||
      normalizedPath.startsWith("//")
    ) {
      return rawValue;
    }

    const rootPath = `/${normalizedPath.replace(/^(\.\.\/|\.\/)+/, "")}`;
    const nextQuote = quote || '"';
    return `url(${nextQuote}${rootPath}${nextQuote})`;
  };

  const parseCustomThemeCssText = (cssText) => {
    if (typeof cssText !== "string") return null;

    const matches = [...cssText.matchAll(/(--[A-Za-z0-9-_]+)\s*:\s*([^;]+);/g)];
    if (!matches.length) return null;

    const vars = {};
    matches.forEach(([, name, value]) => {
      const trimmedName = name.trim();
      vars[trimmedName] = normalizeOverlayMaskValue(trimmedName, value.trim());
    });

    return Object.keys(vars).length ? vars : null;
  };

  const buildCustomThemeCssTextFromVars = (
    vars,
    selector = ':root[data-theme="custom"]'
  ) => {
    const lines = Object.entries(vars || {}).map(
      ([name, value]) => `  ${name}: ${normalizeOverlayMaskValue(name, value)};`
    );
    return [selector + " {", ...lines, "}"].join("\n");
  };

  const collectThemeEditorVars = () => {
    const styles = window.getComputedStyle(getThemeRoot());
    const vars = {};

    THEME_EDITOR_VAR_NAMES.forEach((name) => {
      const value = styles.getPropertyValue(name).trim();
      if (value) {
        vars[name] = value;
      }
    });

    return vars;
  };

  const buildThemeTransferPayload = () => ({
    type: THEME_TRANSFER_TYPE,
    version: THEME_TRANSFER_VERSION,
    sourceTheme: getStoredTheme(),
    cssText: buildCustomThemeCssTextFromVars(collectThemeEditorVars()),
    backgroundMediaUrl: getStoredBackgroundMediaUrl(),
    backgroundTintColor: getStoredBackgroundTintHex(),
    backgroundTintPower: getStoredBackgroundTintPower(),
    surfaceBlurEnabled: getStoredSurfaceBlurEnabled(),
    surfaceBlurStrength: getStoredSurfaceBlurStrength(),
    surfaceTintColor: getStoredSurfaceTintHex(),
    surfaceTintPower: getStoredSurfaceTintPower(),
    cardOutlineColor: getStoredCardOutlineHex(),
    outlineBrightness: getStoredOutlineBrightness(),
    hideFeaturedAds: getStoredHideFeaturedAds(),
    hidePromo: getStoredHidePromo(),
    hideToastPopups: getStoredHideToastPopups(),
    hideNavbarWarning: getStoredHideNavbarWarning(),
  });

  const buildThemeTransferText = () =>
    JSON.stringify(buildThemeTransferPayload(), null, 2);

  const CUSTOM_THEME_VAR_NAMES = Object.keys(buildCustomThemeVars("#3B82F6"));
  let appliedCustomThemeVarNames = new Set(CUSTOM_THEME_VAR_NAMES);

  const clearCustomThemeVars = () => {
    const root = getThemeRoot();
    const storedCustomVars = parseCustomThemeCssText(
      window.localStorage.getItem(CUSTOM_THEME_CSS_STORAGE_KEY) || ""
    );
    const namesToClear = new Set([
      ...CUSTOM_THEME_VAR_NAMES,
      ...appliedCustomThemeVarNames,
      ...Object.keys(storedCustomVars || {}),
    ]);
    namesToClear.forEach((name) => root.style.removeProperty(name));
    appliedCustomThemeVarNames = new Set(CUSTOM_THEME_VAR_NAMES);
  };

  const applyThemeVars = (vars) => {
    const root = getThemeRoot();
    Object.entries(vars).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    appliedCustomThemeVarNames = new Set(Object.keys(vars));
  };

  const emitThemeChange = (theme, customHex = null) => {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme, customHex } }));
  };

  const getStoredTheme = () =>
    normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID);

  const getStoredCustomHex = () =>
    normalizeHex(window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || "");

  const getStoredCustomCssText = () =>
    window.localStorage.getItem(CUSTOM_THEME_CSS_STORAGE_KEY) || "";

  const clearStoredCustomTheme = () => {
    window.localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    window.localStorage.removeItem(CUSTOM_THEME_CSS_STORAGE_KEY);
  };

  const getStoredOutlineBrightness = () => {
    const stored = window.localStorage.getItem(OUTLINE_BRIGHTNESS_STORAGE_KEY);
    if (stored !== null) {
      return normalizeOutlineBrightness(stored);
    }

    const currentValue = window
      .getComputedStyle(getThemeRoot())
      .getPropertyValue("--site-border-color")
      .trim();
    return hexToOutlineBrightness(currentValue);
  };

  const getStoredBackgroundMediaUrl = () =>
    normalizeBackgroundMediaUrl(window.localStorage.getItem(BACKGROUND_MEDIA_STORAGE_KEY) || "");

  const getStoredBackgroundTintHex = () =>
    normalizeHex(window.localStorage.getItem(BACKGROUND_TINT_HEX_STORAGE_KEY) || "") || BACKGROUND_TINT_HEX_DEFAULT;

  const getStoredBackgroundTintPower = () =>
    normalizeBackgroundTintPower(window.localStorage.getItem(BACKGROUND_TINT_POWER_STORAGE_KEY));

  const getThemeBackgroundMediaUrl = () =>
    normalizeBackgroundMediaUrl(
      window.getComputedStyle(getThemeRoot()).getPropertyValue("--theme-background-media-url")
    );

  const getEffectiveBackgroundMediaUrl = (storedOverride = getStoredBackgroundMediaUrl()) =>
    storedOverride || getThemeBackgroundMediaUrl();

  const getStoredSurfaceBlurEnabled = () =>
    normalizeBooleanPreference(window.localStorage.getItem(SURFACE_BLUR_ENABLED_STORAGE_KEY));

  const getStoredSurfaceBlurStrength = () =>
    normalizeSurfaceBlurStrength(window.localStorage.getItem(SURFACE_BLUR_STRENGTH_STORAGE_KEY));

  const getStoredSurfaceTintHex = () =>
    normalizeHex(window.localStorage.getItem(SURFACE_TINT_HEX_STORAGE_KEY) || "") || SURFACE_TINT_HEX_DEFAULT;

  const getStoredSurfaceTintPower = () =>
    normalizeSurfaceTintPower(window.localStorage.getItem(SURFACE_TINT_POWER_STORAGE_KEY));

  const getResolvedCardOutlineHex = () =>
    normalizeHex(window.getComputedStyle(getThemeRoot()).getPropertyValue("--exploit-card-chrome")) ||
    normalizeHex(window.getComputedStyle(getThemeRoot()).getPropertyValue("--site-border-color")) ||
    "#070707";

  const getStoredCardOutlineHex = () =>
    normalizeHex(window.localStorage.getItem(CARD_OUTLINE_HEX_STORAGE_KEY) || "");

  const getStoredThemeDrawerWidth = () =>
    normalizeThemeDrawerWidth(window.localStorage.getItem(THEME_DRAWER_WIDTH_STORAGE_KEY));

  const getStoredHideFeaturedAds = () =>
    normalizeBooleanPreference(window.localStorage.getItem(HIDE_FEATURED_ADS_STORAGE_KEY));

  const getStoredHidePromo = () =>
    normalizeBooleanPreference(window.localStorage.getItem(HIDE_PROMO_STORAGE_KEY));

  const getStoredHideToastPopups = () =>
    normalizeBooleanPreference(window.localStorage.getItem(HIDE_TOAST_POPUPS_STORAGE_KEY));

  const getStoredHideNavbarWarning = () =>
    normalizeBooleanPreference(window.localStorage.getItem(HIDE_NAVBAR_WARNING_STORAGE_KEY));

  const applyThemeTransferText = (source = "") => {
    const trimmed = String(source).trim();
    if (!trimmed) {
      return {
        ok: false,
        message: "Paste theme data first.",
      };
    }

    let parsed = null;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object") {
      const cssText =
        typeof parsed.cssText === "string" && parsed.cssText.trim()
          ? parsed.cssText.trim()
          : parsed.vars && typeof parsed.vars === "object"
            ? buildCustomThemeCssTextFromVars(parsed.vars)
            : "";
      const rawThemeId =
        typeof parsed.theme === "string" && parsed.theme.trim()
          ? parsed.theme.trim()
          : typeof parsed.sourceTheme === "string" && parsed.sourceTheme.trim()
            ? parsed.sourceTheme.trim()
            : "";
      const importedThemeId = rawThemeId ? normalizeTheme(rawThemeId) : "";

      const appliedTheme = cssText
        ? applyCustomThemeCssText(cssText)
        : importedThemeId && importedThemeId !== CUSTOM_THEME_ID
          ? applyTheme(importedThemeId)
          : null;

      if (!appliedTheme) {
        return {
          ok: false,
          message: "Theme data is missing a valid CSS or preset payload.",
        };
      }

      if ("outlineBrightness" in parsed) {
        applyOutlineBrightness(parsed.outlineBrightness);
      }

      if ("backgroundMediaUrl" in parsed) {
        applyBackgroundMedia(parsed.backgroundMediaUrl);
      }

      if ("backgroundTintColor" in parsed || "backgroundTintPower" in parsed) {
        applyBackgroundTintSettings(parsed.backgroundTintColor, parsed.backgroundTintPower);
      }

      if ("surfaceBlurEnabled" in parsed || "surfaceBlurStrength" in parsed) {
        applySurfaceBlur(
          normalizeBooleanPreference(parsed.surfaceBlurEnabled),
          normalizeSurfaceBlurStrength(parsed.surfaceBlurStrength)
        );
      }

      if ("surfaceTintColor" in parsed || "surfaceTintPower" in parsed) {
        applySurfaceTintSettings(parsed.surfaceTintColor, parsed.surfaceTintPower);
      }

      if ("cardOutlineColor" in parsed) {
        applyCardOutlineColor(parsed.cardOutlineColor);
      }

      if ("hideFeaturedAds" in parsed) {
        applyFeaturedAdsVisibility(parsed.hideFeaturedAds);
      }

      if ("hidePromo" in parsed) {
        applyPromoVisibility(parsed.hidePromo);
      }

      if ("hideToastPopups" in parsed) {
        applyToastPopupVisibility(parsed.hideToastPopups);
      }

      if ("hideNavbarWarning" in parsed) {
        applyNavbarWarningVisibility(parsed.hideNavbarWarning);
      }

      syncEffectiveBackgroundMedia();

      return {
        ok: true,
        message: "Theme imported successfully.",
      };
    }

    const appliedTheme = applyCustomThemeCssText(trimmed);
    if (!appliedTheme) {
      return {
        ok: false,
        message: "Theme data is invalid. Paste exported JSON or CSS theme text.",
      };
    }

    return {
      ok: true,
      message: "Theme CSS imported successfully.",
    };
  };

  const applyOutlineBrightness = (value, { persist = true } = {}) => {
    const brightness = normalizeOutlineBrightness(value);
    const outlineHex = outlineBrightnessToHex(brightness);
    const root = getThemeRoot();

    root.style.setProperty("--site-border-color", outlineHex);
    root.style.setProperty("--site-outline-color", outlineHex);

    if (persist) {
      window.localStorage.setItem(OUTLINE_BRIGHTNESS_STORAGE_KEY, String(brightness));
    }

    return {
      brightness,
      hex: outlineHex,
    };
  };

  const applyBackgroundMedia = (value, { persist = true } = {}) => {
    const normalized = normalizeBackgroundMediaUrl(value);
    const { root, image, video } = ensureBackgroundMediaLayer();
    const isInitialReveal = root.dataset.backgroundInitialized !== "true";
    const setBackgroundMediaType = (type) => {
      root.dataset.mediaType = type || "";
      document.body.classList.toggle("has-video-background", type === "video");
      document.body.classList.toggle("has-image-background", type === "image");
    };

    const setBackgroundVisibility = (visible, { skipTransition = false } = {}) => {
      root.classList.toggle("is-no-transition", skipTransition);
      root.hidden = !visible;
      root.classList.toggle("is-visible", visible);
      document.body.classList.toggle("has-custom-background", visible);

      if (!visible || !skipTransition) {
        if (visible) {
          root.dataset.backgroundInitialized = "true";
        }
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          root.classList.remove("is-no-transition");
          root.dataset.backgroundInitialized = "true";
        });
      });
    };

    if (!normalized) {
      setBackgroundMediaType("");
      image.onload = null;
      image.onerror = null;
      video.onloadeddata = null;
      video.onerror = null;
      setBackgroundVisibility(false);
      image.hidden = true;
      image.removeAttribute("src");
      video.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.load();

      if (persist) {
        window.localStorage.removeItem(BACKGROUND_MEDIA_STORAGE_KEY);
      }
      return "";
    }

    const mediaType = getBackgroundMediaType(normalized);
    image.onload = null;
    image.onerror = null;
    video.onloadeddata = null;
    video.onerror = null;

    if (isInitialReveal) {
      setBackgroundVisibility(false, { skipTransition: true });
    } else {
      setBackgroundVisibility(true);
    }

    if (mediaType === "video") {
      setBackgroundMediaType("video");
      image.hidden = true;
      image.removeAttribute("src");
      video.hidden = false;
      if (isInitialReveal) {
        video.onloadeddata = () => {
          setBackgroundVisibility(true, { skipTransition: true });
          video.onloadeddata = null;
        };
        video.onerror = () => {
          setBackgroundVisibility(false);
          video.onerror = null;
        };
      }
      if (video.src !== normalized) {
        video.src = normalized;
      }
      video.load();
      if (isInitialReveal && video.readyState >= 2) {
        setBackgroundVisibility(true, { skipTransition: true });
        video.onloadeddata = null;
      }
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    } else {
      setBackgroundMediaType("image");
      video.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.load();
      image.hidden = false;
      if (isInitialReveal) {
        image.onload = () => {
          setBackgroundVisibility(true, { skipTransition: true });
          image.onload = null;
        };
        image.onerror = () => {
          setBackgroundVisibility(false);
          image.onerror = null;
        };
      }
      image.src = normalized;
      if (isInitialReveal && image.complete && image.naturalWidth > 0) {
        setBackgroundVisibility(true, { skipTransition: true });
        image.onload = null;
      }
    }

    if (persist) {
      window.localStorage.setItem(BACKGROUND_MEDIA_STORAGE_KEY, normalized);
    }
    return normalized;
  };

  const syncEffectiveBackgroundMedia = ({ storedOverride } = {}) => {
    const effectiveValue = getEffectiveBackgroundMediaUrl(storedOverride);
    applyBackgroundMedia(effectiveValue, { persist: false });
    return effectiveValue;
  };

  const backgroundTintPowerToOpacity = (power) => {
    const normalizedPower = normalizeBackgroundTintPower(power);
    return Number(((normalizedPower / 100) * 0.45).toFixed(3));
  };

  const buildBackgroundMediaOverlay = (hex) =>
    normalizeHex(hex) || BACKGROUND_TINT_HEX_DEFAULT;

  const applyBackgroundTintSettings = (hex, power, { persist = true } = {}) => {
    const normalizedHex = normalizeHex(hex) || BACKGROUND_TINT_HEX_DEFAULT;
    const normalizedPower = normalizeBackgroundTintPower(power);
    const root = getThemeRoot();

    root.style.setProperty("--background-media-overlay-color", normalizedHex);
    root.style.setProperty("--background-media-overlay-strength", String(normalizedPower));
    root.style.setProperty(
      "--background-media-overlay-opacity",
      String(backgroundTintPowerToOpacity(normalizedPower))
    );
    root.style.setProperty(
      "--background-media-overlay",
      buildBackgroundMediaOverlay(normalizedHex)
    );

    if (persist) {
      window.localStorage.setItem(BACKGROUND_TINT_HEX_STORAGE_KEY, normalizedHex);
      window.localStorage.setItem(BACKGROUND_TINT_POWER_STORAGE_KEY, String(normalizedPower));
    }

    return {
      hex: normalizedHex,
      power: normalizedPower,
    };
  };

  const applySurfaceBlur = (
    enabled,
    strength = getStoredSurfaceBlurStrength(),
    {
      persist = true,
      tintHex = getStoredSurfaceTintHex(),
      tintPower = getStoredSurfaceTintPower(),
    } = {}
  ) => {
    const nextEnabled = Boolean(enabled);
    const nextStrength = normalizeSurfaceBlurStrength(strength);
    const normalizedTintHex = normalizeHex(tintHex) || SURFACE_TINT_HEX_DEFAULT;
    const normalizedTintPower = normalizeSurfaceTintPower(tintPower);
    const solidTintAlpha = normalizedTintPower / 100;
    const blurTintAlpha = solidTintAlpha * SURFACE_BLUR_TINT_SCALE;
    const blurFooterAlpha = solidTintAlpha * FOOTER_BLUR_TINT_SCALE;
    const solidFooterAlpha = Math.max(0, solidTintAlpha - 0.02);
    const root = getThemeRoot();
    const useKawaiiMobileTintMode = nextEnabled && syncKawaiiMobileTintModeClass();
    const blurValue = useKawaiiMobileTintMode ? "0px" : nextEnabled ? `${nextStrength}px` : "0px";
    const surfaceTint = useKawaiiMobileTintMode
      ? getThemeTokenValue("--kawaii-mobile-surface-tint", "rgba(28, 12, 34, 0.78)")
      : nextEnabled
        ? rgba(normalizedTintHex, blurTintAlpha)
        : rgba(normalizedTintHex, solidTintAlpha);
    const footerTint = useKawaiiMobileTintMode
      ? getThemeTokenValue("--kawaii-mobile-footer-tint", "rgba(24, 10, 28, 0.84)")
      : nextEnabled
        ? rgba(normalizedTintHex, blurFooterAlpha)
        : rgba(normalizedTintHex, solidFooterAlpha);
    const navbarTint = useKawaiiMobileTintMode
      ? getThemeTokenValue("--kawaii-mobile-navbar-tint", "#14081C")
      : nextEnabled
        ? surfaceTint
        : "#000000";
    root.style.setProperty("--card-surface-background", surfaceTint);
    root.style.setProperty("--card-surface-tint", surfaceTint);
    root.style.setProperty("--promo-card-background", surfaceTint);
    root.style.setProperty("--footer-bg", footerTint);
    root.style.setProperty("--navbar-background", navbarTint);
    root.style.setProperty("--navbar-mobile-panel-background", navbarTint);
    root.style.setProperty("--card-surface-backdrop-blur", blurValue);

    if (persist) {
      window.localStorage.setItem(SURFACE_BLUR_ENABLED_STORAGE_KEY, nextEnabled ? "1" : "0");
      window.localStorage.setItem(SURFACE_BLUR_STRENGTH_STORAGE_KEY, String(nextStrength));
    }

    return {
      enabled: nextEnabled,
      strength: nextStrength,
    };
  };

  const applySurfaceTintSettings = (hex, power, { persist = true } = {}) => {
    const normalizedHex = normalizeHex(hex) || SURFACE_TINT_HEX_DEFAULT;
    const normalizedPower = normalizeSurfaceTintPower(power);

    if (persist) {
      window.localStorage.setItem(SURFACE_TINT_HEX_STORAGE_KEY, normalizedHex);
      window.localStorage.setItem(SURFACE_TINT_POWER_STORAGE_KEY, String(normalizedPower));
    }

    applySurfaceBlur(
      getStoredSurfaceBlurEnabled(),
      getStoredSurfaceBlurStrength(),
      {
        persist: false,
        tintHex: normalizedHex,
        tintPower: normalizedPower,
      }
    );

    return {
      hex: normalizedHex,
      power: normalizedPower,
    };
  };

  const clearCardOutlineColor = () => {
    window.localStorage.removeItem(CARD_OUTLINE_HEX_STORAGE_KEY);
    getThemeRoot().style.removeProperty("--exploit-card-chrome");
  };

  const applyCardOutlineColor = (hex, { persist = true } = {}) => {
    const normalizedHex = normalizeHex(hex);
    if (!normalizedHex) {
      clearCardOutlineColor();
      return getResolvedCardOutlineHex();
    }

    getThemeRoot().style.setProperty("--exploit-card-chrome", normalizedHex);

    if (persist) {
      window.localStorage.setItem(CARD_OUTLINE_HEX_STORAGE_KEY, normalizedHex);
    }

    return normalizedHex;
  };

  const syncResponsiveThemeSurfaceMode = () => {
    syncKawaiiMobileTintModeClass();
    applySurfaceBlur(getStoredSurfaceBlurEnabled(), getStoredSurfaceBlurStrength(), { persist: false });
  };

  const applyFeaturedAdsVisibility = (hidden, { persist = true } = {}) => {
    const nextHidden = Boolean(hidden);
    window.setFeaturedAdsHidden?.(nextHidden);

    if (persist) {
      window.localStorage.setItem(HIDE_FEATURED_ADS_STORAGE_KEY, nextHidden ? "1" : "0");
    }

    return nextHidden;
  };

  const applyPromoVisibility = (hidden, { persist = true } = {}) => {
    const nextHidden = Boolean(hidden);
    window.setPromoHidden?.(nextHidden);

    if (persist) {
      window.localStorage.setItem(HIDE_PROMO_STORAGE_KEY, nextHidden ? "1" : "0");
    }

    return nextHidden;
  };

  const applyToastPopupVisibility = (hidden, { persist = true } = {}) => {
    const nextHidden = Boolean(hidden);

    if (typeof window.setSiteToastsBlocked === "function") {
      window.setSiteToastsBlocked(nextHidden, { persist });
    } else if (persist) {
      window.localStorage.setItem(HIDE_TOAST_POPUPS_STORAGE_KEY, nextHidden ? "1" : "0");
    }

    return nextHidden;
  };

  const applyNavbarWarningVisibility = (hidden, { persist = true } = {}) => {
    const nextHidden = Boolean(hidden);

    if (typeof window.setNavbarWarningHidden === "function") {
      window.setNavbarWarningHidden(nextHidden, { persist });
    } else if (persist) {
      window.localStorage.setItem(HIDE_NAVBAR_WARNING_STORAGE_KEY, nextHidden ? "1" : "0");
    }

    return nextHidden;
  };

  const getCustomThemeHexFromVars = (vars) =>
    normalizeHex(vars?.["--theme-color"]) ||
    normalizeHex(vars?.["--prim"]) ||
    getStoredCustomHex() ||
    "#3B82F6";

  const applyPresetTheme = (
    theme,
    {
      persistTheme = true,
      persistPresetPreferences = true,
    } = {}
  ) => {
    const nextTheme = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME_ID;
    const preset = THEME_OPTION_MAP.get(nextTheme);
    const root = getThemeRoot();
    clearCustomThemeVars();
    root.dataset.theme = nextTheme;
    syncThemeFontImport();
    applyOutlineBrightness(getStoredOutlineBrightness(), { persist: false });
    applySurfaceBlur(
      Boolean(preset?.surfaceBlurEnabled),
      preset?.surfaceBlurStrength ?? SURFACE_BLUR_DEFAULT,
      { persist: persistPresetPreferences }
    );
    applyFeaturedAdsVisibility(Boolean(preset?.hideFeaturedAds), { persist: persistPresetPreferences });
    syncEffectiveBackgroundMedia();
    if (persistTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
    emitThemeChange(nextTheme, null);
    return nextTheme;
  };

  const applyCustomThemeCssText = (cssText) => {
    const vars = parseCustomThemeCssText(cssText);
    if (!vars) return null;

    const root = getThemeRoot();
    const normalizedCssText = buildCustomThemeCssTextFromVars(vars);
    const customHex = getCustomThemeHexFromVars(vars);

    clearCustomThemeVars();
    root.dataset.theme = CUSTOM_THEME_ID;
    applyThemeVars(vars);
    syncThemeFontImport();
    applyOutlineBrightness(getStoredOutlineBrightness(), { persist: false });
    syncEffectiveBackgroundMedia();
    window.localStorage.setItem(THEME_STORAGE_KEY, CUSTOM_THEME_ID);
    window.localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, customHex);
    window.localStorage.setItem(CUSTOM_THEME_CSS_STORAGE_KEY, normalizedCssText);
    emitThemeChange(CUSTOM_THEME_ID, customHex);
    return CUSTOM_THEME_ID;
  };

  const applyCustomTheme = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return applyPresetTheme(DEFAULT_THEME_ID);

    return applyCustomThemeCssText(buildCustomThemeCssText(normalized));
  };

  const applyTheme = (theme, options = {}) => {
    const nextTheme = normalizeTheme(theme);
    if (nextTheme === CUSTOM_THEME_ID) {
      const storedCssText = getStoredCustomCssText();
      if (storedCssText) {
        return applyCustomThemeCssText(storedCssText) || applyPresetTheme(DEFAULT_THEME_ID);
      }
      const storedHex = getStoredCustomHex();
      return storedHex ? applyCustomTheme(storedHex) : applyPresetTheme(DEFAULT_THEME_ID);
    }
    return applyPresetTheme(nextTheme, options);
  };

  const restoreThemeDefaults = (scope = document) => {
    clearStoredCustomTheme();
    const restoredTheme = applyPresetTheme(DEFAULT_THEME_ID);
    applyOutlineBrightness(OUTLINE_BRIGHTNESS_DEFAULT);
    applyBackgroundMedia("");
    applyBackgroundTintSettings(BACKGROUND_TINT_HEX_DEFAULT, BACKGROUND_TINT_POWER_DEFAULT);
    applySurfaceTintSettings(SURFACE_TINT_HEX_DEFAULT, SURFACE_TINT_POWER_DEFAULT);
    clearCardOutlineColor();
    applySurfaceBlur(false, SURFACE_BLUR_DEFAULT);
    applyFeaturedAdsVisibility(false);
    applyPromoVisibility(false);
    applyToastPopupVisibility(false);
    applyNavbarWarningVisibility(false);
    syncThemeSwitcherUI(scope);
    syncOutlineBrightnessUI(scope);
    syncBackgroundMediaUI(scope);
    syncBackgroundTintUI(scope);
    syncSurfaceBlurUI(scope);
    syncSurfaceTintUI(scope);
    syncCardOutlineUI(scope);
    syncVisibilityPreferencesUI(scope);
    return restoredTheme;
  };

  const escapeHtml = (value = "") =>
    `${value}`
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const buildThemeOptionMarkup = ({
    id,
    label,
    credit,
    previewGradient,
    swatch,
    swatchImage,
    swatchImageScale,
    previewFontFamily,
  }) => {
    const normalizedSwatch = normalizeHex(swatch) || "";
    const swatchRgb = normalizedSwatch ? hexToRgb(normalizedSwatch) : null;
    const wrapperStyle = [
      normalizedSwatch ? ` --theme-option-accent-color: ${normalizedSwatch};` : "",
      swatchRgb ? ` --theme-option-accent-rgb: ${swatchRgb.r}, ${swatchRgb.g}, ${swatchRgb.b};` : "",
      previewFontFamily ? ` --theme-option-preview-font: ${previewFontFamily};` : "",
      previewGradient ? ` --theme-option-preview-gradient: ${previewGradient};` : "",
    ].join("");
    const swatchStyle = `${swatch ? `background-color: ${swatch};` : ""}${
      swatchImageScale ? ` --theme-swatch-media-scale: ${swatchImageScale};` : ""
    }`;

    return `
      <div
        class="footer-theme-option${swatchImage ? " has-media-swatch" : ""}${previewFontFamily ? " has-preview-font" : ""}${previewGradient ? " has-preview-gradient" : ""}"
        data-theme="${escapeHtml(id)}"
        style="${escapeHtml(wrapperStyle)}"
      >
        <div
          class="footer-theme-swatch${swatchImage ? " has-media" : ""}"
          aria-hidden="true"
          style="${escapeHtml(swatchStyle)}"
        >
          ${swatchImage ? `<img class="footer-theme-swatch-media" src="${escapeHtml(swatchImage)}" alt="">` : ""}
        </div>
        <span class="footer-theme-option-label">
          <span class="footer-theme-option-title">${escapeHtml(label)}</span>
          ${credit ? `<span class="footer-theme-option-credit">${escapeHtml(credit)}</span>` : ""}
        </span>
      </div>
    `;
  };

  const buildThemeGroupMarkup = ({ id, label }) => {
    const options = THEME_OPTIONS.filter((option) => option.group === id);
    if (!options.length) return "";

    return `
      <section class="footer-theme-option-group" aria-label="${label}">
        <h3 class="footer-theme-option-group-title">${label}</h3>
        <div class="footer-theme-option-group-items">
          ${options.map(buildThemeOptionMarkup).join("")}
        </div>
      </section>
    `;
  };

  const renderThemeOptions = (scope = document) => {
    const optionsRoot = scope.getElementById("siteThemeOptions");
    if (!optionsRoot || optionsRoot.dataset.rendered === "true") return;

    optionsRoot.innerHTML = THEME_GROUPS.map(buildThemeGroupMarkup).join("");
    optionsRoot.dataset.rendered = "true";
  };

  const syncSelectedOption = (scope = document, activeTheme = getStoredTheme(), customHex = getStoredCustomHex()) => {
    const optionsRoot = scope.getElementById("siteThemeOptions");
    const options = optionsRoot ? [...optionsRoot.querySelectorAll(".footer-theme-option")] : [];
    if (!optionsRoot) return;

    if (activeTheme === CUSTOM_THEME_ID && customHex) {
      options.forEach((option) => {
        option.classList.remove("is-selected");
        option.setAttribute("aria-selected", "false");
      });
      return;
    }

    const activeOption = THEME_OPTION_MAP.get(activeTheme) || THEME_OPTIONS[0];

    options.forEach((option) => {
      const isSelected = option.dataset.theme === activeOption.id;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", String(isSelected));
    });

  };

  const syncThemeSwitcherUI = (scope = document) => {
    renderThemeOptions(scope);
    syncSelectedOption(scope, getStoredTheme(), getStoredCustomHex());
  };

  const setActiveThemeDrawerTab = (scope = document, nextTab = THEME_DRAWER_DEFAULT_TAB) => {
    const tabButtons = [...scope.querySelectorAll("[data-theme-tab]")];
    const tabPanels = [...scope.querySelectorAll("[data-theme-panel]")];
    if (!tabButtons.length || !tabPanels.length) {
      return;
    }

    const resolvedTab = tabButtons.some((button) => button.dataset.themeTab === nextTab)
      ? nextTab
      : THEME_DRAWER_DEFAULT_TAB;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.themeTab === resolvedTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.themePanel === resolvedTab;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  const setActiveThemeEditorTab = (scope = document, nextTab = THEME_DRAWER_DEFAULT_EDITOR_TAB) => {
    const tabButtons = [...scope.querySelectorAll("[data-editor-tab]")];
    const tabPanels = [...scope.querySelectorAll("[data-editor-panel]")];
    if (!tabButtons.length || !tabPanels.length) {
      return;
    }

    const resolvedTab = tabButtons.some((button) => button.dataset.editorTab === nextTab)
      ? nextTab
      : THEME_DRAWER_DEFAULT_EDITOR_TAB;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.editorTab === resolvedTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.editorPanel === resolvedTab;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  const syncOutlineBrightnessUI = (scope = document) => {
    const slider = scope.getElementById("siteOutlineSlider");
    if (!slider) return;

    const { brightness } = applyOutlineBrightness(getStoredOutlineBrightness(), {
      persist: false,
    });
    slider.value = String(brightness);
  };

  const setBackgroundMediaStatus = (scope, message, state = "default") => {
    const status = scope.getElementById("siteBackgroundStatus");
    if (!status) return;

    status.textContent = message;
    status.classList.toggle("is-error", state === "error");
    status.classList.toggle("is-success", state === "success");
  };

  const syncBackgroundMediaUI = (scope = document, options = {}) => {
    const input = scope.getElementById("siteBackgroundUrl");
    if (!input) return;

    const storedValue = options.value ?? getStoredBackgroundMediaUrl();
    const themeValue = options.themeValue ?? getThemeBackgroundMediaUrl();
    const effectiveValue = options.effectiveValue ?? getEffectiveBackgroundMediaUrl(storedValue);
    input.value = storedValue;

    if (options.statusMessage) {
      setBackgroundMediaStatus(scope, options.statusMessage, options.statusState || "default");
      return;
    }

    if (!effectiveValue) {
      setBackgroundMediaStatus(scope, BACKGROUND_MEDIA_DEFAULT_STATUS);
      return;
    }

    const type = getBackgroundMediaType(effectiveValue);
    const label = type === "video" ? "Video" : "Image";
    const isThemeBackgroundActive = !storedValue && Boolean(themeValue);
    setBackgroundMediaStatus(
      scope,
      isThemeBackgroundActive
        ? `Theme ${label.toLowerCase()} background is active.`
        : `${label} background is active.`,
      "success"
    );
  };

  const syncBackgroundTintUI = (scope = document) => {
    const tintColorInput = scope.getElementById("siteBackgroundTintColorInput");
    const tintColorValue = scope.getElementById("siteBackgroundTintColorValue");
    const tintPowerSlider = scope.getElementById("siteBackgroundTintPowerSlider");
    const tintPowerValue = scope.getElementById("siteBackgroundTintPowerValue");
    if (!tintColorInput || !tintColorValue || !tintPowerSlider || !tintPowerValue) return;

    const tintHex = getStoredBackgroundTintHex();
    const tintPower = getStoredBackgroundTintPower();
    tintColorInput.value = tintHex;
    tintColorValue.textContent = tintHex;
    tintPowerSlider.value = String(tintPower);
    tintPowerValue.textContent = `${tintPower}%`;
  };

  const syncSurfaceBlurUI = (scope = document) => {
    const blurToggle = scope.getElementById("siteSurfaceBlurEnabled");
    const blurSlider = scope.getElementById("siteSurfaceBlurSlider");
    const blurValue = scope.getElementById("siteSurfaceBlurValue");
    if (!blurToggle || !blurSlider || !blurValue) return;

    const enabled = getStoredSurfaceBlurEnabled();
    const strength = getStoredSurfaceBlurStrength();
    applySurfaceBlur(enabled, strength, { persist: false });

    blurToggle.checked = enabled;
    blurSlider.value = String(strength);
    blurSlider.disabled = !enabled;
    blurValue.textContent = `${strength}px`;
  };

  const syncSurfaceTintUI = (scope = document) => {
    const tintColorInput = scope.getElementById("siteSurfaceTintColorInput");
    const tintColorValue = scope.getElementById("siteSurfaceTintColorValue");
    const tintPowerSlider = scope.getElementById("siteSurfaceTintPowerSlider");
    const tintPowerValue = scope.getElementById("siteSurfaceTintPowerValue");
    if (!tintColorInput || !tintColorValue || !tintPowerSlider || !tintPowerValue) return;

    const tintHex = getStoredSurfaceTintHex();
    const tintPower = getStoredSurfaceTintPower();
    tintColorInput.value = tintHex;
    tintColorValue.textContent = tintHex;
    tintPowerSlider.value = String(tintPower);
    tintPowerValue.textContent = `${tintPower}%`;
  };

  const syncCardOutlineUI = (scope = document) => {
    const outlineColorInput = scope.getElementById("siteCardOutlineColorInput");
    const outlineColorValue = scope.getElementById("siteCardOutlineColorValue");
    if (!outlineColorInput || !outlineColorValue) return;

    const outlineHex = getStoredCardOutlineHex() || getResolvedCardOutlineHex();
    outlineColorInput.value = outlineHex;
    outlineColorValue.textContent = outlineHex;
  };

  const syncVisibilityPreferencesUI = (scope = document) => {
    const hideFeaturedAdsInput = scope.getElementById("siteHideFeaturedAds");
    const hidePromoInput = scope.getElementById("siteHidePromo");
    const hideToastPopupsInput = scope.getElementById("siteHideToastPopups");
    const hideNavbarWarningInput = scope.getElementById("siteHideNavbarWarning");

    if (hideFeaturedAdsInput) {
      hideFeaturedAdsInput.checked = getStoredHideFeaturedAds();
    }

    if (hidePromoInput) {
      hidePromoInput.checked = getStoredHidePromo();
    }

    if (hideToastPopupsInput) {
      hideToastPopupsInput.checked = getStoredHideToastPopups();
    }

    if (hideNavbarWarningInput) {
      hideNavbarWarningInput.checked = getStoredHideNavbarWarning();
    }
  };

  const initOutlineBrightnessControl = (scope = document) => {
    const slider = scope.getElementById("siteOutlineSlider");
    if (!slider) return;

    if (slider.dataset.outlineBound === "true") {
      syncOutlineBrightnessUI(scope);
      return;
    }

    const syncFromValue = (nextValue, { persist = true } = {}) => {
      const { brightness } = applyOutlineBrightness(nextValue, { persist });
      slider.value = String(brightness);
    };

    syncFromValue(getStoredOutlineBrightness(), { persist: false });

    slider.addEventListener("input", () => {
      syncFromValue(slider.value);
    });

    window.addEventListener(THEME_CHANGE_EVENT, () => {
      syncFromValue(getStoredOutlineBrightness(), { persist: false });
    });

    slider.dataset.outlineBound = "true";
  };

  const initSiteThemes = (scope = document) => {
    initOutlineBrightnessControl(scope);
    renderThemeOptions(scope);

    const footerRoot = scope.querySelector(".site-themes");
    const drawer = scope.getElementById("siteThemeDrawer");
    const closeButton = scope.getElementById("closeThemeDrawer");
    const drawerResizeHandle = scope.getElementById("siteThemeDrawerResizer");
    const restoreDefaultsButton = scope.getElementById("siteThemeRestoreDefaults");
    const backgroundMediaInput = scope.getElementById("siteBackgroundUrl");
    const backgroundMediaApplyButton = scope.getElementById("siteBackgroundApply");
    const backgroundMediaClearButton = scope.getElementById("siteBackgroundClear");
    const backgroundTintColorInput = scope.getElementById("siteBackgroundTintColorInput");
    const backgroundTintColorValue = scope.getElementById("siteBackgroundTintColorValue");
    const backgroundTintPowerSlider = scope.getElementById("siteBackgroundTintPowerSlider");
    const backgroundTintPowerValue = scope.getElementById("siteBackgroundTintPowerValue");
    const themeTransferTextarea = scope.getElementById("siteThemeTransferData");
    const themeTransferExportButton = scope.getElementById("siteThemeExportButton");
    const themeTransferImportButton = scope.getElementById("siteThemeImportButton");
    const themeTransferStatus = scope.getElementById("siteThemeTransferStatus");
    const surfaceBlurEnabledInput = scope.getElementById("siteSurfaceBlurEnabled");
    const surfaceBlurSlider = scope.getElementById("siteSurfaceBlurSlider");
    const surfaceBlurValue = scope.getElementById("siteSurfaceBlurValue");
    const surfaceTintColorInput = scope.getElementById("siteSurfaceTintColorInput");
    const surfaceTintColorValue = scope.getElementById("siteSurfaceTintColorValue");
    const surfaceTintPowerSlider = scope.getElementById("siteSurfaceTintPowerSlider");
    const surfaceTintPowerValue = scope.getElementById("siteSurfaceTintPowerValue");
    const cardOutlineColorInput = scope.getElementById("siteCardOutlineColorInput");
    const cardOutlineColorValue = scope.getElementById("siteCardOutlineColorValue");
    const hideFeaturedAdsInput = scope.getElementById("siteHideFeaturedAds");
    const hidePromoInput = scope.getElementById("siteHidePromo");
    const hideToastPopupsInput = scope.getElementById("siteHideToastPopups");
    const hideNavbarWarningInput = scope.getElementById("siteHideNavbarWarning");
    const optionsRoot = scope.getElementById("siteThemeOptions");
    const tabButtons = [...scope.querySelectorAll("[data-theme-tab]")];
    const editorTabButtons = [...scope.querySelectorAll("[data-editor-tab]")];
    if (!drawer || !closeButton || !optionsRoot || !tabButtons.length) return;

    if (drawer.dataset.themeBound === "true") {
      const existingDrawerPanel = drawer.querySelector(".footer-theme-drawer-panel");
      if (existingDrawerPanel) {
        const shouldEnableResize = THEME_DRAWER_DESKTOP_MEDIA_QUERY.matches;
        drawer.classList.toggle("is-resizable-desktop", shouldEnableResize);
        if (shouldEnableResize) {
          existingDrawerPanel.style.width = `${getStoredThemeDrawerWidth()}px`;
        } else {
          existingDrawerPanel.style.removeProperty("width");
        }
      }
      syncThemeSwitcherUI(scope);
      syncBackgroundMediaUI(scope);
      syncBackgroundTintUI(scope);
      syncSurfaceBlurUI(scope);
      syncSurfaceTintUI(scope);
      syncCardOutlineUI(scope);
      syncVisibilityPreferencesUI(scope);
      setActiveThemeEditorTab(scope, THEME_DRAWER_DEFAULT_EDITOR_TAB);
      return;
    }

    const activeTheme = applyTheme(getStoredTheme(), {
      persistTheme: false,
      persistPresetPreferences: false,
    });
    syncEffectiveBackgroundMedia();
    applyBackgroundTintSettings(getStoredBackgroundTintHex(), getStoredBackgroundTintPower(), { persist: false });
    applySurfaceBlur(getStoredSurfaceBlurEnabled(), getStoredSurfaceBlurStrength(), { persist: false });
    applyFeaturedAdsVisibility(getStoredHideFeaturedAds(), { persist: false });
    applyPromoVisibility(getStoredHidePromo(), { persist: false });
    applyToastPopupVisibility(getStoredHideToastPopups(), { persist: false });
    applyNavbarWarningVisibility(getStoredHideNavbarWarning(), { persist: false });
    syncSelectedOption(scope, activeTheme, getStoredCustomHex());
    syncBackgroundMediaUI(scope);
    syncBackgroundTintUI(scope);
    syncSurfaceBlurUI(scope);
    syncSurfaceTintUI(scope);
    syncCardOutlineUI(scope);
    syncVisibilityPreferencesUI(scope);
    setActiveThemeDrawerTab(scope, THEME_DRAWER_DEFAULT_TAB);
    setActiveThemeEditorTab(scope, THEME_DRAWER_DEFAULT_EDITOR_TAB);

    let previousBodyOverflow = "";
    let closeDrawerTimerId = 0;
    let lastThemeDrawerTrigger = null;

    const setThemeTransferStatus = (message, state = "default") => {
      if (!themeTransferStatus) return;

      themeTransferStatus.textContent = message;
      themeTransferStatus.classList.toggle("is-error", state === "error");
      themeTransferStatus.classList.toggle("is-success", state === "success");
    };

    const drawerPanel = drawer.querySelector(".footer-theme-drawer-panel");
    let isResizingThemeDrawer = false;
    let previousBodyUserSelect = "";

    const applyThemeDrawerWidth = (value, { persist = true } = {}) => {
      if (!drawerPanel) return THEME_DRAWER_DEFAULT_WIDTH;

      const normalizedWidth = normalizeThemeDrawerWidth(value);
      const isDesktop = THEME_DRAWER_DESKTOP_MEDIA_QUERY.matches;

      drawer.classList.toggle("is-resizable-desktop", isDesktop);

      if (isDesktop) {
        drawerPanel.style.width = `${normalizedWidth}px`;
        if (persist) {
          window.localStorage.setItem(THEME_DRAWER_WIDTH_STORAGE_KEY, String(normalizedWidth));
        }
      } else {
        drawerPanel.style.removeProperty("width");
      }

      return normalizedWidth;
    };

    const syncThemeDrawerWidth = ({ persist = false } = {}) =>
      applyThemeDrawerWidth(getStoredThemeDrawerWidth(), { persist });

    const stopThemeDrawerResize = ({ persist = true } = {}) => {
      if (!isResizingThemeDrawer) return;

      isResizingThemeDrawer = false;
      drawer.classList.remove("is-resizing");
      document.body.style.userSelect = previousBodyUserSelect;
      previousBodyUserSelect = "";
      window.removeEventListener("pointermove", handleThemeDrawerResizeMove);
      window.removeEventListener("pointerup", handleThemeDrawerResizeEnd);
      window.removeEventListener("pointercancel", handleThemeDrawerResizeCancel);

      if (persist && drawerPanel && THEME_DRAWER_DESKTOP_MEDIA_QUERY.matches) {
        applyThemeDrawerWidth(drawerPanel.getBoundingClientRect().width, { persist: true });
      }
    };

    const handleThemeDrawerResizeMove = (event) => {
      if (!isResizingThemeDrawer || !drawerPanel) return;

      const nextWidth = normalizeThemeDrawerWidth(event.clientX - drawerPanel.getBoundingClientRect().left);
      applyThemeDrawerWidth(nextWidth, { persist: false });
    };

    const handleThemeDrawerResizeEnd = () => {
      stopThemeDrawerResize({ persist: true });
    };

    const handleThemeDrawerResizeCancel = () => {
      stopThemeDrawerResize({ persist: false });
      syncThemeDrawerWidth({ persist: false });
    };

    syncThemeDrawerWidth({ persist: false });

    const finishClosingThemeDrawer = ({ restoreFocus = false } = {}) => {
      drawer.classList.remove("is-closing");
      footerRoot?.classList.remove("theme-drawer-active");
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = "";
      closeDrawerTimerId = 0;

      if (restoreFocus && lastThemeDrawerTrigger?.focus) {
        lastThemeDrawerTrigger.focus();
      }
    };

    const closeThemeDrawer = ({ restoreFocus = false } = {}) => {
      if (!drawer.classList.contains("is-open") && !drawer.classList.contains("is-closing")) {
        return;
      }

      trackThemeEvent("drawer-close");
      stopThemeDrawerResize({ persist: true });
      window.clearTimeout(closeDrawerTimerId);
      closeDrawerTimerId = 0;
      drawer.classList.remove("is-open");
      drawer.classList.add("is-closing");
      drawer.setAttribute("aria-hidden", "true");

      const exitDuration = Math.max(
        getMaxTransitionTimeMs(drawer),
        getMaxTransitionTimeMs(drawerPanel),
        THEME_DRAWER_EXIT_FALLBACK_MS,
      );

      closeDrawerTimerId = window.setTimeout(() => {
        finishClosingThemeDrawer({ restoreFocus });
      }, exitDuration);
    };

    const openThemeDrawer = ({ trigger = null, tab = THEME_DRAWER_DEFAULT_TAB } = {}) => {
      const wasOpen = drawer.classList.contains("is-open");
      window.clearTimeout(closeDrawerTimerId);
      closeDrawerTimerId = 0;

      if (trigger) {
        lastThemeDrawerTrigger = trigger;
      }

      if (!drawer.classList.contains("is-open")) {
        previousBodyOverflow = document.body.style.overflow;
      }

      drawer.classList.remove("is-closing");
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      footerRoot?.classList.add("theme-drawer-active");
      document.body.style.overflow = "hidden";
      setActiveThemeDrawerTab(scope, tab);

      if (!wasOpen) {
        trackThemeEvent("drawer-open");
        document.dispatchEvent(new CustomEvent("voxlis:themes-opened"));
      }
    };

    const trackThemeEvent = (key = "") => {
      window.VOXLIS_CLICK_TRACKER?.trackUiEvent?.({
        group: "themes",
        key,
      });
    };

    tabButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const nextTab = button.dataset.themeTab || THEME_DRAWER_DEFAULT_TAB;
        trackThemeEvent(`tab-${nextTab}`);
        setActiveThemeDrawerTab(scope, nextTab);
      });
    });

    editorTabButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const nextTab = button.dataset.editorTab || THEME_DRAWER_DEFAULT_EDITOR_TAB;
        trackThemeEvent(`editor-${nextTab}`);
        setActiveThemeEditorTab(scope, nextTab);
      });
    });

    drawerResizeHandle?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !THEME_DRAWER_DESKTOP_MEDIA_QUERY.matches) {
        return;
      }

      event.preventDefault();
      isResizingThemeDrawer = true;
      previousBodyUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      drawer.classList.add("is-resizing");
      window.addEventListener("pointermove", handleThemeDrawerResizeMove);
      window.addEventListener("pointerup", handleThemeDrawerResizeEnd);
      window.addEventListener("pointercancel", handleThemeDrawerResizeCancel);
    });

    hideFeaturedAdsInput?.addEventListener("change", () => {
      trackThemeEvent("hide-featured-ads");
      applyFeaturedAdsVisibility(hideFeaturedAdsInput.checked);
    });

    hidePromoInput?.addEventListener("change", () => {
      trackThemeEvent("hide-promo");
      applyPromoVisibility(hidePromoInput.checked);
    });

    hideToastPopupsInput?.addEventListener("change", () => {
      applyToastPopupVisibility(hideToastPopupsInput.checked);
    });

    hideNavbarWarningInput?.addEventListener("change", () => {
      applyNavbarWarningVisibility(hideNavbarWarningInput.checked);
    });

    const syncSurfaceBlurFromInputs = ({ persist = true } = {}) => {
      const enabled = Boolean(surfaceBlurEnabledInput?.checked);
      const strength = surfaceBlurSlider?.value ?? SURFACE_BLUR_DEFAULT;
      const nextState = applySurfaceBlur(enabled, strength, { persist });

      if (surfaceBlurSlider) {
        surfaceBlurSlider.disabled = !nextState.enabled;
        surfaceBlurSlider.value = String(nextState.strength);
      }

      if (surfaceBlurValue) {
        surfaceBlurValue.textContent = `${nextState.strength}px`;
      }
    };

    const syncSurfaceTintFromInputs = ({ persist = true } = {}) => {
      const nextState = applySurfaceTintSettings(
        surfaceTintColorInput?.value || SURFACE_TINT_HEX_DEFAULT,
        surfaceTintPowerSlider?.value ?? SURFACE_TINT_POWER_DEFAULT,
        { persist }
      );

      if (surfaceTintColorInput) {
        surfaceTintColorInput.value = nextState.hex;
      }

      if (surfaceTintColorValue) {
        surfaceTintColorValue.textContent = nextState.hex;
      }

      if (surfaceTintPowerSlider) {
        surfaceTintPowerSlider.value = String(nextState.power);
      }

      if (surfaceTintPowerValue) {
        surfaceTintPowerValue.textContent = `${nextState.power}%`;
      }
    };

    const syncBackgroundTintFromInputs = ({ persist = true } = {}) => {
      const nextState = applyBackgroundTintSettings(
        backgroundTintColorInput?.value || BACKGROUND_TINT_HEX_DEFAULT,
        backgroundTintPowerSlider?.value ?? BACKGROUND_TINT_POWER_DEFAULT,
        { persist }
      );

      if (backgroundTintColorInput) {
        backgroundTintColorInput.value = nextState.hex;
      }

      if (backgroundTintColorValue) {
        backgroundTintColorValue.textContent = nextState.hex;
      }

      if (backgroundTintPowerSlider) {
        backgroundTintPowerSlider.value = String(nextState.power);
      }

      if (backgroundTintPowerValue) {
        backgroundTintPowerValue.textContent = `${nextState.power}%`;
      }
    };

    const syncCardOutlineFromInput = ({ persist = true } = {}) => {
      const nextHex = applyCardOutlineColor(
        cardOutlineColorInput?.value || getResolvedCardOutlineHex(),
        { persist }
      );

      if (cardOutlineColorInput) {
        cardOutlineColorInput.value = nextHex;
      }

      if (cardOutlineColorValue) {
        cardOutlineColorValue.textContent = nextHex;
      }
    };

    surfaceBlurEnabledInput?.addEventListener("change", () => {
      syncSurfaceBlurFromInputs();
    });

    surfaceBlurSlider?.addEventListener("input", () => {
      syncSurfaceBlurFromInputs();
    });

    surfaceTintColorInput?.addEventListener("input", () => {
      syncSurfaceTintFromInputs();
    });

    surfaceTintPowerSlider?.addEventListener("input", () => {
      syncSurfaceTintFromInputs();
    });

    backgroundTintColorInput?.addEventListener("input", () => {
      syncBackgroundTintFromInputs();
    });

    backgroundTintPowerSlider?.addEventListener("input", () => {
      syncBackgroundTintFromInputs();
    });

    cardOutlineColorInput?.addEventListener("input", () => {
      syncCardOutlineFromInput();
    });

    restoreDefaultsButton?.addEventListener("click", (event) => {
      event.preventDefault();
      trackThemeEvent("restore-defaults");
      restoreThemeDefaults(scope);
      setActiveThemeDrawerTab(scope, THEME_DRAWER_DEFAULT_TAB);
    });

    const applyBackgroundFromInput = () => {
      const rawValue = backgroundMediaInput?.value || "";
      const normalized = normalizeBackgroundMediaUrl(rawValue);

      if (rawValue.trim() && !normalized) {
        setBackgroundMediaStatus(scope, "Enter a valid image or video link.", "error");
        return;
      }

      const appliedValue = applyBackgroundMedia(normalized);
      syncBackgroundMediaUI(scope, { value: appliedValue, effectiveValue: appliedValue });
      trackThemeEvent("background-apply");
      return true;
    };

    backgroundMediaApplyButton?.addEventListener("click", (event) => {
      event.preventDefault();
      applyBackgroundFromInput();
    });

    backgroundMediaClearButton?.addEventListener("click", (event) => {
      event.preventDefault();
      applyBackgroundMedia("");
      const effectiveValue = syncEffectiveBackgroundMedia();
      syncBackgroundMediaUI(scope, { value: "", effectiveValue });
      trackThemeEvent("background-clear");
    });

    backgroundMediaInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      applyBackgroundFromInput();
    });

    backgroundMediaInput?.addEventListener("input", () => {
      setBackgroundMediaStatus(scope, BACKGROUND_MEDIA_DEFAULT_STATUS);
    });

    themeTransferExportButton?.addEventListener("click", async (event) => {
      event.preventDefault();
      trackThemeEvent("export");

      const nextValue = buildThemeTransferText();
      if (themeTransferTextarea) {
        themeTransferTextarea.value = nextValue;
        themeTransferTextarea.focus();
        themeTransferTextarea.select();
      }

      try {
        await navigator.clipboard.writeText(nextValue);
        setThemeTransferStatus("Theme exported and copied to the clipboard.", "success");
      } catch {
        setThemeTransferStatus("Theme exported. Copy it from the box above.", "success");
      }
    });

    themeTransferImportButton?.addEventListener("click", (event) => {
      event.preventDefault();
      trackThemeEvent("import");

      const result = applyThemeTransferText(themeTransferTextarea?.value || "");
      syncThemeSwitcherUI(scope);
      syncOutlineBrightnessUI(scope);
      syncBackgroundMediaUI(scope);
      syncBackgroundTintUI(scope);
      syncSurfaceBlurUI(scope);
      syncSurfaceTintUI(scope);
      syncCardOutlineUI(scope);
      syncVisibilityPreferencesUI(scope);

      setThemeTransferStatus(result.message, result.ok ? "success" : "error");
    });

    themeTransferTextarea?.addEventListener("input", () => {
      setThemeTransferStatus("Paste exported theme data here, then import it.");
    });

    optionsRoot.querySelectorAll(".footer-theme-option").forEach((option) => {
      option.setAttribute("role", "button");
      option.setAttribute("tabindex", "0");
      option.setAttribute("aria-selected", "false");
      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        trackThemeEvent("preset-select");
        const nextTheme = applyTheme(option.dataset.theme || "blue");
        syncSelectedOption(scope, nextTheme, getStoredCustomHex());
      });

      option.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        trackThemeEvent("preset-select");
        const nextTheme = applyTheme(option.dataset.theme || "blue");
        syncSelectedOption(scope, nextTheme, getStoredCustomHex());
      });
    });

    window.addEventListener(THEME_CHANGE_EVENT, () => {
      syncSelectedOption(scope, getStoredTheme(), getStoredCustomHex());
      syncBackgroundMediaUI(scope);
      syncBackgroundTintUI(scope);
      syncSurfaceBlurUI(scope);
      syncSurfaceTintUI(scope);
      syncCardOutlineUI(scope);
      syncVisibilityPreferencesUI(scope);
    });

    window.addEventListener("resize", () => {
      syncThemeDrawerWidth({ persist: false });
    });

    drawer.addEventListener("click", (event) => {
      if (event.target.closest("[data-theme-drawer-close]")) {
        closeThemeDrawer({ restoreFocus: true });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        closeThemeDrawer({ restoreFocus: true });
      }
    });

    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      closeThemeDrawer({ restoreFocus: true });
    });

    drawer.dataset.themeBound = "true";

    window.openSiteThemes = (options = {}) => {
      openThemeDrawer(options);
    };
    window.closeSiteThemes = (options = {}) => {
      closeThemeDrawer(options);
    };
    window.setSiteThemesTab = (tab) => {
      setActiveThemeDrawerTab(scope, tab);
    };
  };

  applyTheme(getStoredTheme(), {
    persistTheme: false,
    persistPresetPreferences: false,
  });
  const storedCardOutlineHex = getStoredCardOutlineHex();
  if (storedCardOutlineHex) {
    applyCardOutlineColor(storedCardOutlineHex, { persist: false });
  }
  syncKawaiiMobileTintModeClass();
  applyOutlineBrightness(getStoredOutlineBrightness(), { persist: false });
  syncEffectiveBackgroundMedia();
  applyBackgroundTintSettings(getStoredBackgroundTintHex(), getStoredBackgroundTintPower(), { persist: false });
  applySurfaceBlur(getStoredSurfaceBlurEnabled(), getStoredSurfaceBlurStrength(), { persist: false });

  window.addEventListener(THEME_CHANGE_EVENT, syncResponsiveThemeSurfaceMode);
  if (typeof KAWAII_MOBILE_TINT_MEDIA_QUERY.addEventListener === "function") {
    KAWAII_MOBILE_TINT_MEDIA_QUERY.addEventListener("change", syncResponsiveThemeSurfaceMode);
  } else if (typeof KAWAII_MOBILE_TINT_MEDIA_QUERY.addListener === "function") {
    KAWAII_MOBILE_TINT_MEDIA_QUERY.addListener(syncResponsiveThemeSurfaceMode);
  }

  window.initSiteThemes = initSiteThemes;
  window.initThemeSwitcher = initSiteThemes;
  window.syncThemeSwitcherUI = syncThemeSwitcherUI;
  window.syncOutlineBrightnessUI = syncOutlineBrightnessUI;
  window.syncSiteThemeVisibilityUI = syncVisibilityPreferencesUI;
  window.applySiteTheme = applyTheme;
  window.restoreSiteThemeDefaults = (scope = document) => restoreThemeDefaults(scope);
  window.applyFeaturedAdsVisibilityPreference = applyFeaturedAdsVisibility;
  window.applyPromoVisibilityPreference = applyPromoVisibility;
  window.applySiteBackgroundMedia = applyBackgroundMedia;
  window.applySiteBackgroundTintSettings = applyBackgroundTintSettings;
  window.applySiteSurfaceBlur = applySurfaceBlur;
  window.applySiteSurfaceTintSettings = applySurfaceTintSettings;
  window.applyCustomSiteTheme = applyCustomTheme;
  window.applyCustomSiteThemeCssText = applyCustomThemeCssText;
  window.buildCustomSiteThemeCssText = (hex) => buildCustomThemeCssText(hex);
  window.getStoredCustomSiteThemeHex = getStoredCustomHex;
  window.getStoredSiteBackgroundMediaUrl = getStoredBackgroundMediaUrl;
  window.getCustomSiteThemeCssText = () =>
    buildCustomThemeCssTextFromVars(collectThemeEditorVars());
  window.getActiveSiteTheme = getStoredTheme;
  window.normalizeCustomSiteThemeHex = normalizeHex;
})();
