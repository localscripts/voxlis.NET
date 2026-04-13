(() => {
  const themeConfig = window.VOXLIS_CONFIG?.themes ?? {};
  const storageKeys = themeConfig.storageKeys ?? {};
  const themeIds = themeConfig.ids ?? {};
  const themeEvents = themeConfig.events ?? {};
  const themeDrawerConfig = themeConfig.drawer ?? {};
  const customAccentConfig = themeConfig.customAccent ?? {};

  const THEME_STORAGE_KEY = storageKeys.theme ?? "voxlis-theme";
  const THEME_DRAWER_WIDTH_STORAGE_KEY = storageKeys.drawerWidth ?? "voxlis-theme-drawer-width";
  const HIDE_FEATURED_ADS_STORAGE_KEY = storageKeys.hideFeaturedAds ?? "voxlis-hide-featured-ads";
  const HIDE_PROMO_STORAGE_KEY = storageKeys.hidePromo ?? "voxlis-hide-promo";
  const HIDE_TOAST_POPUPS_STORAGE_KEY = storageKeys.hideToastPopups ?? "voxlis-hide-toast-popups";
  const HIDE_NAVBAR_WARNING_STORAGE_KEY = storageKeys.hideNavbarWarning ?? "voxlis-hide-navbar-warning";
  const HIDE_BOTTOM_FADE_STORAGE_KEY = storageKeys.hideBottomFade ?? "voxlis-hide-bottom-fade";
  const CUSTOM_THEME_COLOR_STORAGE_KEY = storageKeys.customThemeColor ?? "voxlis-custom-accent-color";
  const DEFAULT_THEME_ID = themeIds.default ?? "blue";
  const CUSTOM_THEME_ID = themeIds.custom ?? customAccentConfig.themeId ?? "custom";
  const THEME_CHANGE_EVENT = themeEvents.change ?? "site-theme-change";
  const THEME_DRAWER_EXIT_FALLBACK_MS = themeDrawerConfig.exitFallbackMs ?? 260;
  const THEME_DRAWER_DEFAULT_WIDTH = themeDrawerConfig.defaultWidth ?? 384;
  const THEME_DRAWER_MIN_WIDTH = themeDrawerConfig.minWidth ?? 320;
  const THEME_DRAWER_MAX_WIDTH = themeDrawerConfig.maxWidth ?? 720;
  const THEME_DRAWER_DESKTOP_MEDIA_QUERY = window.matchMedia(
    themeDrawerConfig.desktopMediaQuery ?? "(min-width: 769px)",
  );
  const CUSTOM_THEME_COLOR_DEFAULT = customAccentConfig.defaultHex ?? "#22c55e";
  const CUSTOM_THEME_STYLE_PROPERTIES = [
    "--theme-main-color",
    "--theme-hover-color",
    "--theme-gradient-start-color",
    "--theme-gradient-end-color",
    "--theme-rgb",
  ];
  const THEME_GROUPS =
    Array.isArray(themeConfig.groups) && themeConfig.groups.length
      ? themeConfig.groups
      : [{ id: "accent", label: "Color Variants" }];
  const THEME_OPTIONS = (
    Array.isArray(themeConfig.options) && themeConfig.options.length
      ? themeConfig.options
      : [
          { id: "blue", label: "Legacy", swatch: "#3B82F6", group: "accent" },
          { id: CUSTOM_THEME_ID, label: "Custom", swatch: CUSTOM_THEME_COLOR_DEFAULT, group: "accent", supportsCustomColor: true },
      ]
  );
  const VALID_THEMES = new Set(THEME_OPTIONS.map(({ id }) => id));
  const THEME_OPTION_MAP = new Map(THEME_OPTIONS.map((option) => [option.id, option]));
  const LEGACY_EDITOR_STORAGE_KEYS = [
    ["voxlis", "custom", "theme", "hex"].join("-"),
    ["voxlis", "custom", "theme", "css"].join("-"),
  ];
  const REMOVED_EDITOR_STORAGE_KEYS = [
    ...LEGACY_EDITOR_STORAGE_KEYS,
    "voxlis-outline-brightness",
    "voxlis-background-media",
    "voxlis-background-tint-hex",
    "voxlis-background-tint-power",
    "voxlis-surface-blur-enabled",
    "voxlis-surface-blur-strength",
    "voxlis-surface-tint-hex",
    "voxlis-surface-tint-power",
    "voxlis-card-outline-hex",
  ].filter(Boolean);
  const REMOVED_EDITOR_STYLE_PROPERTIES = [
    "--theme-font-import-url",
    "--theme-background-media-url",
    "--background-media-overlay-color",
    "--background-media-overlay-strength",
    "--background-media-overlay-opacity",
    "--background-media-overlay",
    "--exploit-card-chrome",
    "--site-border-color",
    "--site-outline-color",
  ];

  const getThemeRoot = () => document.documentElement;
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
  const getThemeDrawerViewportMaxWidth = () =>
    Math.max(
      THEME_DRAWER_MIN_WIDTH,
      Math.min(THEME_DRAWER_MAX_WIDTH, Math.max(THEME_DRAWER_MIN_WIDTH, window.innerWidth - 72)),
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
  const normalizeTheme = (theme) => (VALID_THEMES.has(theme) ? theme : DEFAULT_THEME_ID);
  const normalizeBooleanPreference = (value) =>
    value === true || value === "true" || value === "1" || value === 1;
  const normalizeHexColor = (value, fallback = CUSTOM_THEME_COLOR_DEFAULT) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      return normalized.toLowerCase();
    }

    const normalizedFallback = typeof fallback === "string" ? fallback.trim() : "";
    return /^#[0-9a-f]{6}$/i.test(normalizedFallback)
      ? normalizedFallback.toLowerCase()
      : CUSTOM_THEME_COLOR_DEFAULT;
  };
  const hexToRgb = (hex) => {
    const normalized = typeof hex === "string" ? hex.trim() : "";
    if (!/^#[0-9a-f]{6}$/i.test(normalized)) {
      return null;
    }

    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
    };
  };
  const rgbToCss = (rgb) => {
    if (!rgb) {
      const fallbackRgb = hexToRgb(CUSTOM_THEME_COLOR_DEFAULT);
      return fallbackRgb ? `${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}` : "34, 197, 94";
    }

    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  };
  const mixHex = (fromHex, toHex, ratio = 0) => {
    const fromRgb = hexToRgb(normalizeHexColor(fromHex, CUSTOM_THEME_COLOR_DEFAULT));
    const toRgb = hexToRgb(normalizeHexColor(toHex, "#000000"));
    if (!fromRgb || !toRgb) {
      return normalizeHexColor(fromHex, CUSTOM_THEME_COLOR_DEFAULT);
    }

    const normalizedRatio = clamp(Number.isFinite(ratio) ? ratio : 0, 0, 1);
    const mixChannel = (from, to) => Math.round(from + (to - from) * normalizedRatio);
    const toHexPair = (value) => value.toString(16).padStart(2, "0");

    return `#${toHexPair(mixChannel(fromRgb.r, toRgb.r))}${toHexPair(mixChannel(fromRgb.g, toRgb.g))}${toHexPair(mixChannel(fromRgb.b, toRgb.b))}`;
  };
  const rgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };
  const buildCustomThemePreviewGradient = (accentHex = CUSTOM_THEME_COLOR_DEFAULT) => {
    const normalizedAccent = normalizeHexColor(accentHex, CUSTOM_THEME_COLOR_DEFAULT);
    const gradientStart = mixHex(normalizedAccent, "#ffffff", 0.18);
    const gradientEnd = mixHex(normalizedAccent, "#000000", 0.22);
    return `linear-gradient(90deg, ${rgba(gradientStart, 0.18)} 0%, ${rgba(normalizedAccent, 0.13)} 56%, ${rgba(gradientEnd, 0.12)} 100%)`;
  };
  const clearCustomThemeStyleOverrides = () => {
    const root = getThemeRoot();
    CUSTOM_THEME_STYLE_PROPERTIES.forEach((property) => {
      root.style.removeProperty(property);
    });
  };
  const applyCustomThemeStyleOverrides = (accentHex = CUSTOM_THEME_COLOR_DEFAULT, { persist = true } = {}) => {
    const normalizedAccent = normalizeHexColor(accentHex, CUSTOM_THEME_COLOR_DEFAULT);
    const hoverColor = mixHex(normalizedAccent, "#000000", 0.16);
    const gradientStart = mixHex(normalizedAccent, "#ffffff", 0.18);
    const gradientEnd = mixHex(normalizedAccent, "#000000", 0.12);
    const accentRgb = hexToRgb(normalizedAccent);
    const root = getThemeRoot();

    root.style.setProperty("--theme-main-color", normalizedAccent);
    root.style.setProperty("--theme-hover-color", hoverColor);
    root.style.setProperty("--theme-gradient-start-color", gradientStart);
    root.style.setProperty("--theme-gradient-end-color", gradientEnd);
    root.style.setProperty("--theme-rgb", rgbToCss(accentRgb));

    if (persist) {
      window.localStorage.setItem(CUSTOM_THEME_COLOR_STORAGE_KEY, normalizedAccent);
    }

    return normalizedAccent;
  };
  const clearRemovedEditorArtifacts = () => {
    const root = getThemeRoot();
    REMOVED_EDITOR_STYLE_PROPERTIES.forEach((name) => {
      root.style.removeProperty(name);
    });

    document.getElementById("siteThemeFontStylesheet")?.remove();
    document.getElementById("siteBackgroundMedia")?.remove();
    document.body.classList.remove("has-custom-background", "has-video-background", "has-image-background");
  };
  const clearRemovedEditorStorage = () => {
    const rawStoredTheme = String(window.localStorage.getItem(THEME_STORAGE_KEY) || "").trim();
    REMOVED_EDITOR_STORAGE_KEYS.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    if (rawStoredTheme && !VALID_THEMES.has(rawStoredTheme)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME_ID);
    }
  };
  const getStoredTheme = () =>
    normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID);
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
  const getStoredHideBottomFade = () =>
    normalizeBooleanPreference(window.localStorage.getItem(HIDE_BOTTOM_FADE_STORAGE_KEY));
  const getStoredCustomThemeColor = () =>
    normalizeHexColor(window.localStorage.getItem(CUSTOM_THEME_COLOR_STORAGE_KEY), CUSTOM_THEME_COLOR_DEFAULT);
  const emitThemeChange = (theme) => {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }));
  };
  const applyPresetSurfaceStyle = () => {
    const root = getThemeRoot();

    root.style.setProperty("--card-surface-background", "#000000");
    root.style.setProperty("--card-surface-tint", "#000000");
    root.style.setProperty("--promo-card-background", "#000000");
    root.style.setProperty("--footer-bg", "#000000");
    root.style.setProperty("--navbar-background", "#000000");
    root.style.setProperty("--navbar-mobile-panel-background", "#000000");
    root.style.setProperty("--card-surface-backdrop-blur", "0px");
    root.style.setProperty("--footer-backdrop-blur", "0px");
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
  const applyBottomFadeVisibility = (hidden, { persist = true } = {}) => {
    const nextHidden = Boolean(hidden);
    document.body?.classList.toggle("site-bottom-fade-hidden", nextHidden);

    if (persist) {
      window.localStorage.setItem(HIDE_BOTTOM_FADE_STORAGE_KEY, nextHidden ? "1" : "0");
    }

    return nextHidden;
  };
  const applyPresetTheme = (
    theme,
    {
      persistTheme = true,
      persistPresetPreferences = true,
      customColor = getStoredCustomThemeColor(),
      persistCustomColor = true,
    } = {},
  ) => {
    const nextTheme = normalizeTheme(theme);
    const root = getThemeRoot();

    clearRemovedEditorArtifacts();
    clearCustomThemeStyleOverrides();
    if (root.dataset.theme !== nextTheme) {
      root.dataset.theme = nextTheme;
    }
    applyPresetSurfaceStyle();
    if (nextTheme === CUSTOM_THEME_ID) {
      applyCustomThemeStyleOverrides(customColor, { persist: persistCustomColor });
    }

    if (persistPresetPreferences) {
      applyFeaturedAdsVisibility(false);
    } else {
      applyFeaturedAdsVisibility(getStoredHideFeaturedAds(), { persist: false });
    }

    if (persistTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    emitThemeChange(nextTheme);
    return nextTheme;
  };
  const applyTheme = (theme, options = {}) => applyPresetTheme(theme, options);
  const restoreThemeDefaults = (scope = document) => {
    clearRemovedEditorStorage();
    clearRemovedEditorArtifacts();
    clearCustomThemeStyleOverrides();
    window.localStorage.removeItem(CUSTOM_THEME_COLOR_STORAGE_KEY);

    const restoredTheme = applyPresetTheme(DEFAULT_THEME_ID);
    applyFeaturedAdsVisibility(false);
    applyPromoVisibility(false);
    applyToastPopupVisibility(false);
    applyNavbarWarningVisibility(false);
    applyBottomFadeVisibility(false);
    syncThemeSwitcherUI(scope);
    syncVisibilityPreferencesUI(scope);
    return restoredTheme;
  };
  const escapeHtml = window.VOXLIS_UTILS.escapeHtml;
  const syncCustomThemeOptionUI = (scope = document, accentHex = getStoredCustomThemeColor()) => {
    const customOption = scope.querySelector(`.footer-theme-option[data-theme="${CUSTOM_THEME_ID}"]`);
    if (!customOption) {
      return;
    }

    const normalizedAccent = normalizeHexColor(accentHex, CUSTOM_THEME_COLOR_DEFAULT);
    const accentRgb = hexToRgb(normalizedAccent);
    const swatchNode = customOption.querySelector(".footer-theme-swatch");
    const pickerNode = customOption.querySelector("[data-theme-custom-picker]");

    customOption.style.setProperty("--theme-option-accent-color", normalizedAccent);
    customOption.style.setProperty("--theme-option-accent-rgb", rgbToCss(accentRgb));
    customOption.style.setProperty("--theme-option-preview-gradient", buildCustomThemePreviewGradient(normalizedAccent));

    if (swatchNode && !swatchNode.classList.contains("has-media")) {
      swatchNode.style.backgroundColor = normalizedAccent;
    }

    if (pickerNode) {
      pickerNode.value = normalizedAccent;
    }
  };
  const buildThemeOptionMarkup = ({
    id,
    label,
    credit,
    previewGradient,
    swatch,
    swatchImage,
    swatchImageScale,
    previewFontFamily,
    supportsCustomColor = false,
  }) => {
    const resolvedSwatch = supportsCustomColor ? getStoredCustomThemeColor() : swatch;
    const resolvedPreviewGradient = supportsCustomColor
      ? buildCustomThemePreviewGradient(resolvedSwatch)
      : previewGradient;
    const resolvedRgb = hexToRgb(resolvedSwatch);
    const wrapperStyle = [
      resolvedSwatch ? ` --theme-option-accent-color: ${resolvedSwatch};` : "",
      resolvedRgb ? ` --theme-option-accent-rgb: ${rgbToCss(resolvedRgb)};` : "",
      previewFontFamily ? ` --theme-option-preview-font: ${previewFontFamily};` : "",
      resolvedPreviewGradient ? ` --theme-option-preview-gradient: ${resolvedPreviewGradient};` : "",
    ].join("");
    const swatchStyle = `${resolvedSwatch ? `background-color: ${resolvedSwatch};` : ""}${
      swatchImageScale ? ` --theme-swatch-media-scale: ${swatchImageScale};` : ""
    }`;

    return `
      <div
        class="footer-theme-option${swatchImage ? " has-media-swatch" : ""}${previewFontFamily ? " has-preview-font" : ""}${resolvedPreviewGradient ? " has-preview-gradient" : ""}${supportsCustomColor ? " is-custom-color" : ""}"
        data-theme="${escapeHtml(id)}"
        style="${escapeHtml(wrapperStyle)}"
      >
        <div
          class="footer-theme-swatch${swatchImage ? " has-media" : ""}"
          aria-hidden="true"
          style="${escapeHtml(swatchStyle)}"
        >
          ${
            swatchImage
              ? `<img class="footer-theme-swatch-media" src="${escapeHtml(swatchImage)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
              : ""
          }
        </div>
        <span class="footer-theme-option-label">
          <span class="footer-theme-option-title">${escapeHtml(label)}</span>
          ${credit ? `<span class="footer-theme-option-credit">${escapeHtml(credit)}</span>` : ""}
        </span>
        ${
          supportsCustomColor
            ? `<input
                class="footer-theme-custom-picker is-hidden"
                data-theme-custom-picker
                type="color"
                value="${escapeHtml(resolvedSwatch || CUSTOM_THEME_COLOR_DEFAULT)}"
                aria-hidden="true"
                tabindex="-1"
              >`
            : ""
        }
      </div>
    `;
  };
  const buildThemeGroupMarkup = ({ id, label }) => {
    const options = THEME_OPTIONS.filter((option) => option.group === id);
    if (!options.length) {
      return "";
    }

    return `
      <section class="footer-theme-option-group" aria-label="${escapeHtml(label)}">
        <h3 class="footer-theme-option-group-title">${escapeHtml(label)}</h3>
        <div class="footer-theme-option-group-items">
          ${options.map(buildThemeOptionMarkup).join("")}
        </div>
      </section>
    `;
  };
  const renderThemeOptions = (scope = document) => {
    const optionsRoot = scope.getElementById("siteThemeOptions");
    if (!optionsRoot || optionsRoot.dataset.rendered === "true") {
      return;
    }

    optionsRoot.innerHTML = THEME_GROUPS.map(buildThemeGroupMarkup).join("");
    optionsRoot.dataset.rendered = "true";
  };
  const syncSelectedOption = (scope = document, activeTheme = getStoredTheme()) => {
    const optionsRoot = scope.getElementById("siteThemeOptions");
    const options = optionsRoot ? [...optionsRoot.querySelectorAll(".footer-theme-option")] : [];
    if (!optionsRoot) {
      return;
    }

    syncCustomThemeOptionUI(scope);
    const activeOption = THEME_OPTION_MAP.get(activeTheme) || THEME_OPTION_MAP.get(DEFAULT_THEME_ID) || THEME_OPTIONS[0];
    options.forEach((option) => {
      const isSelected = option.dataset.theme === activeOption.id;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", String(isSelected));
    });
  };
  const syncThemeSwitcherUI = (scope = document) => {
    renderThemeOptions(scope);
    syncSelectedOption(scope, getStoredTheme());
  };
  const syncVisibilityPreferencesUI = (scope = document) => {
    const hideFeaturedAdsInput = scope.getElementById("siteHideFeaturedAds");
    const hidePromoInput = scope.getElementById("siteHidePromo");
    const hideToastPopupsInput = scope.getElementById("siteHideToastPopups");
    const hideNavbarWarningInput = scope.getElementById("siteHideNavbarWarning");
    const hideBottomFadeInput = scope.getElementById("siteHideBottomFade");

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

    if (hideBottomFadeInput) {
      hideBottomFadeInput.checked = getStoredHideBottomFade();
    }
  };
  const initSiteThemes = (scope = document) => {
    renderThemeOptions(scope);

    const footerRoot = scope.querySelector(".site-themes");
    const drawer = scope.getElementById("siteThemeDrawer");
    const closeButton = scope.getElementById("closeThemeDrawer");
    const drawerResizeHandle = scope.getElementById("siteThemeDrawerResizer");
    const restoreDefaultsButton = scope.getElementById("siteThemeRestoreDefaults");
    const hideFeaturedAdsInput = scope.getElementById("siteHideFeaturedAds");
    const hidePromoInput = scope.getElementById("siteHidePromo");
    const hideToastPopupsInput = scope.getElementById("siteHideToastPopups");
    const hideNavbarWarningInput = scope.getElementById("siteHideNavbarWarning");
    const hideBottomFadeInput = scope.getElementById("siteHideBottomFade");
    const optionsRoot = scope.getElementById("siteThemeOptions");
    if (!drawer || !closeButton || !optionsRoot) {
      return;
    }

    const drawerPanel = drawer.querySelector(".footer-theme-drawer-panel");
    const syncThemeDrawerWidth = () => {
      if (!drawerPanel) {
        return;
      }

      const shouldEnableResize = THEME_DRAWER_DESKTOP_MEDIA_QUERY.matches;
      drawer.classList.toggle("is-resizable-desktop", shouldEnableResize);
      if (shouldEnableResize) {
        drawerPanel.style.width = `${getStoredThemeDrawerWidth()}px`;
      } else {
        drawerPanel.style.removeProperty("width");
      }
    };

    if (drawer.dataset.themeBound === "true") {
      syncThemeSwitcherUI(scope);
      syncVisibilityPreferencesUI(scope);
      syncThemeDrawerWidth();
      return;
    }

    const activeTheme = applyTheme(getStoredTheme(), {
      persistTheme: false,
      persistPresetPreferences: false,
      persistCustomColor: false,
    });
    applyPromoVisibility(getStoredHidePromo(), { persist: false });
    applyToastPopupVisibility(getStoredHideToastPopups(), { persist: false });
    applyNavbarWarningVisibility(getStoredHideNavbarWarning(), { persist: false });
    applyBottomFadeVisibility(getStoredHideBottomFade(), { persist: false });
    syncSelectedOption(scope, activeTheme);
    syncVisibilityPreferencesUI(scope);
    syncThemeDrawerWidth();

    let previousBodyOverflow = "";
    let closeDrawerTimerId = 0;
    let lastThemeDrawerTrigger = null;
    let isResizingThemeDrawer = false;
    let previousBodyUserSelect = "";

    const trackThemeEvent = (key = "") => {
      window.VOXLIS_CLICK_TRACKER?.trackUiEvent?.({
        group: "themes",
        key,
      });
    };
    const applyThemeDrawerWidth = (value, { persist = true } = {}) => {
      if (!drawerPanel) {
        return THEME_DRAWER_DEFAULT_WIDTH;
      }

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
    const stopThemeDrawerResize = ({ persist = true } = {}) => {
      if (!isResizingThemeDrawer) {
        return;
      }

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
      if (!isResizingThemeDrawer || !drawerPanel) {
        return;
      }

      const nextWidth = normalizeThemeDrawerWidth(event.clientX - drawerPanel.getBoundingClientRect().left);
      applyThemeDrawerWidth(nextWidth, { persist: false });
    };
    const handleThemeDrawerResizeEnd = () => {
      stopThemeDrawerResize({ persist: true });
    };
    const handleThemeDrawerResizeCancel = () => {
      stopThemeDrawerResize({ persist: false });
      syncThemeDrawerWidth();
    };
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
    const openThemeDrawer = ({ trigger = null } = {}) => {
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

      if (!wasOpen) {
        trackThemeEvent("drawer-open");
        document.dispatchEvent(new CustomEvent("voxlis:themes-opened"));
      }
    };

    optionsRoot.querySelectorAll(".footer-theme-option").forEach((option) => {
      const customColorPicker = option.querySelector("[data-theme-custom-picker]");
      const themeId = option.dataset.theme || DEFAULT_THEME_ID;
      const openCustomColorPicker = () => {
        if (!customColorPicker) {
          return false;
        }

        if (typeof customColorPicker.showPicker === "function") {
          try {
            customColorPicker.showPicker();
            return true;
          } catch (error) {
            // Fall through to the click-based fallback below.
          }
        }

        try {
          customColorPicker.click();
          return true;
        } catch (error) {
          return false;
        }
      };
      option.setAttribute("role", "button");
      option.setAttribute("tabindex", "0");
      option.setAttribute("aria-selected", "false");

      option.addEventListener("click", (event) => {
        if (event.target.closest("[data-theme-custom-picker]")) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        trackThemeEvent("preset-select");
        applyTheme(themeId);
        if (themeId === CUSTOM_THEME_ID) {
          openCustomColorPicker();
        }
      });

      option.addEventListener("keydown", (event) => {
        if (event.target.closest("[data-theme-custom-picker]")) {
          return;
        }
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        trackThemeEvent("preset-select");
        applyTheme(themeId);
        if (themeId === CUSTOM_THEME_ID) {
          openCustomColorPicker();
        }
      });

      if (customColorPicker) {
        const applyCustomPickerTheme = ({ track = false } = {}) => {
          const nextAccent = normalizeHexColor(customColorPicker.value, CUSTOM_THEME_COLOR_DEFAULT);
          customColorPicker.value = nextAccent;
          if (track) {
            trackThemeEvent("custom-accent-change");
          }
          applyTheme(CUSTOM_THEME_ID, {
            customColor: nextAccent,
          });
        };

        customColorPicker.addEventListener("click", (event) => {
          event.stopPropagation();
        });
        customColorPicker.addEventListener("input", (event) => {
          event.stopPropagation();
          applyCustomPickerTheme();
        });
        customColorPicker.addEventListener("change", (event) => {
          event.stopPropagation();
          applyCustomPickerTheme({ track: true });
        });
      }
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

    hideBottomFadeInput?.addEventListener("change", () => {
      trackThemeEvent("hide-bottom-fade");
      applyBottomFadeVisibility(hideBottomFadeInput.checked);
    });

    restoreDefaultsButton?.addEventListener("click", (event) => {
      event.preventDefault();
      trackThemeEvent("restore-defaults");
      restoreThemeDefaults(scope);
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

    window.addEventListener(THEME_CHANGE_EVENT, (event) => {
      syncSelectedOption(scope, normalizeTheme(event.detail?.theme || getStoredTheme()));
      syncVisibilityPreferencesUI(scope);
    });

    window.addEventListener("resize", () => {
      syncThemeDrawerWidth();
    });

    drawer.dataset.themeBound = "true";
    window.openSiteThemes = (options = {}) => {
      openThemeDrawer(options);
    };
    window.closeSiteThemes = (options = {}) => {
      closeThemeDrawer(options);
    };
    window.setSiteThemesTab = () => false;
  };

  clearRemovedEditorStorage();
  clearRemovedEditorArtifacts();
  applyTheme(getStoredTheme(), {
    persistTheme: false,
    persistPresetPreferences: false,
    persistCustomColor: false,
  });
  applyPromoVisibility(getStoredHidePromo(), { persist: false });
  applyToastPopupVisibility(getStoredHideToastPopups(), { persist: false });
  applyNavbarWarningVisibility(getStoredHideNavbarWarning(), { persist: false });
  applyBottomFadeVisibility(getStoredHideBottomFade(), { persist: false });

  window.initSiteThemes = initSiteThemes;
  window.initThemeSwitcher = initSiteThemes;
  window.syncThemeSwitcherUI = syncThemeSwitcherUI;
  window.syncSiteThemeVisibilityUI = syncVisibilityPreferencesUI;
  window.applySiteTheme = applyTheme;
  window.restoreSiteThemeDefaults = (scope = document) => restoreThemeDefaults(scope);
  window.applyFeaturedAdsVisibilityPreference = applyFeaturedAdsVisibility;
  window.applyPromoVisibilityPreference = applyPromoVisibility;
  window.applyBottomFadeVisibilityPreference = applyBottomFadeVisibility;
  window.getActiveSiteTheme = getStoredTheme;
})();
