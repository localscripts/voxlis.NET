(() => {
  const themeConfig = window.VOXLIS_CONFIG?.themes ?? {};
  const storageKeys = themeConfig.storageKeys ?? {};
  const themeIds = themeConfig.ids ?? {};
  const themeEvents = themeConfig.events ?? {};
  const themeDrawerConfig = themeConfig.drawer ?? {};
  const surfaceBlurConfig = themeConfig.surfaceBlur ?? {};
  const surfaceTintConfig = themeConfig.surfaceTint ?? {};
  const kawaiiMobileTintConfig = themeConfig.kawaiiMobileTint ?? {};

  const THEME_STORAGE_KEY = storageKeys.theme ?? "voxlis-theme";
  const THEME_DRAWER_WIDTH_STORAGE_KEY = storageKeys.drawerWidth ?? "voxlis-theme-drawer-width";
  const HIDE_FEATURED_ADS_STORAGE_KEY = storageKeys.hideFeaturedAds ?? "voxlis-hide-featured-ads";
  const HIDE_PROMO_STORAGE_KEY = storageKeys.hidePromo ?? "voxlis-hide-promo";
  const HIDE_TOAST_POPUPS_STORAGE_KEY = storageKeys.hideToastPopups ?? "voxlis-hide-toast-popups";
  const HIDE_NAVBAR_WARNING_STORAGE_KEY = storageKeys.hideNavbarWarning ?? "voxlis-hide-navbar-warning";
  const DEFAULT_THEME_ID = themeIds.default ?? "blue";
  const THEME_CHANGE_EVENT = themeEvents.change ?? "site-theme-change";
  const THEME_DRAWER_EXIT_FALLBACK_MS = themeDrawerConfig.exitFallbackMs ?? 260;
  const THEME_DRAWER_DEFAULT_WIDTH = themeDrawerConfig.defaultWidth ?? 384;
  const THEME_DRAWER_MIN_WIDTH = themeDrawerConfig.minWidth ?? 320;
  const THEME_DRAWER_MAX_WIDTH = themeDrawerConfig.maxWidth ?? 720;
  const THEME_DRAWER_DESKTOP_MEDIA_QUERY = window.matchMedia(
    themeDrawerConfig.desktopMediaQuery ?? "(min-width: 769px)",
  );
  const SURFACE_BLUR_DEFAULT = surfaceBlurConfig.default ?? 12;
  const SURFACE_BLUR_TINT_SCALE = surfaceBlurConfig.tintScale ?? 18 / 82;
  const FOOTER_BLUR_TINT_SCALE = surfaceBlurConfig.footerTintScale ?? 16 / 82;
  const SURFACE_TINT_POWER_DEFAULT = surfaceTintConfig.default ?? 82;
  const SURFACE_TINT_HEX_DEFAULT = surfaceTintConfig.defaultHex ?? "#000000";
  const KAWAII_MOBILE_TINT_CLASS = kawaiiMobileTintConfig.className ?? "theme-kawaii-mobile-tint";
  const KAWAII_MOBILE_TINT_MEDIA_QUERY = window.matchMedia(
    kawaiiMobileTintConfig.mediaQuery ?? "(max-width: 980px)",
  );
  const THEME_GROUPS =
    Array.isArray(themeConfig.groups) && themeConfig.groups.length
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
  const LEGACY_EDITOR_STORAGE_KEYS = [
    ["voxlis", "custom", "theme", "hex"].join("-"),
    ["voxlis", "custom", "theme", "css"].join("-"),
  ];
  const REMOVED_EDITOR_STORAGE_KEYS = [
    ...LEGACY_EDITOR_STORAGE_KEYS,
    storageKeys.outlineBrightness ?? "voxlis-outline-brightness",
    storageKeys.backgroundMedia ?? "voxlis-background-media",
    storageKeys.backgroundTintHex ?? "voxlis-background-tint-hex",
    storageKeys.backgroundTintPower ?? "voxlis-background-tint-power",
    storageKeys.surfaceBlurEnabled ?? "voxlis-surface-blur-enabled",
    storageKeys.surfaceBlurStrength ?? "voxlis-surface-blur-strength",
    storageKeys.surfaceTintHex ?? "voxlis-surface-tint-hex",
    storageKeys.surfaceTintPower ?? "voxlis-surface-tint-power",
    storageKeys.cardOutlineHex ?? "voxlis-card-outline-hex",
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
  const normalizeSurfaceBlurStrength = (value) => {
    const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
    if (!Number.isFinite(parsed)) {
      return SURFACE_BLUR_DEFAULT;
    }

    return clamp(parsed, 0, surfaceBlurConfig.max ?? 24);
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
  const rgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };
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
  const emitThemeChange = (theme) => {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }));
  };
  const applyPresetSurfaceStyle = (theme) => {
    const preset = THEME_OPTION_MAP.get(normalizeTheme(theme)) || THEME_OPTION_MAP.get(DEFAULT_THEME_ID);
    const nextEnabled = Boolean(preset?.surfaceBlurEnabled);
    const nextStrength = normalizeSurfaceBlurStrength(preset?.surfaceBlurStrength);
    const solidTintAlpha = SURFACE_TINT_POWER_DEFAULT / 100;
    const blurTintAlpha = solidTintAlpha * SURFACE_BLUR_TINT_SCALE;
    const blurFooterAlpha = solidTintAlpha * FOOTER_BLUR_TINT_SCALE;
    const solidFooterAlpha = Math.max(0, solidTintAlpha - 0.02);
    const root = getThemeRoot();
    const computedStyles = window.getComputedStyle(root);
    const useKawaiiMobileTintMode = nextEnabled && syncKawaiiMobileTintModeClass();
    const blurValue = useKawaiiMobileTintMode ? "0px" : nextEnabled ? `${nextStrength}px` : "0px";
    const surfaceTint = useKawaiiMobileTintMode
      ? computedStyles.getPropertyValue("--kawaii-mobile-surface-tint").trim() || "rgba(28, 12, 34, 0.78)"
      : nextEnabled
        ? rgba(SURFACE_TINT_HEX_DEFAULT, blurTintAlpha)
        : rgba(SURFACE_TINT_HEX_DEFAULT, solidTintAlpha);
    const footerTint = useKawaiiMobileTintMode
      ? computedStyles.getPropertyValue("--kawaii-mobile-footer-tint").trim() || "rgba(24, 10, 28, 0.84)"
      : nextEnabled
        ? rgba(SURFACE_TINT_HEX_DEFAULT, blurFooterAlpha)
        : rgba(SURFACE_TINT_HEX_DEFAULT, solidFooterAlpha);
    const navbarTint = useKawaiiMobileTintMode
      ? computedStyles.getPropertyValue("--kawaii-mobile-navbar-tint").trim() || "#14081C"
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
  const applyPresetTheme = (
    theme,
    {
      persistTheme = true,
      persistPresetPreferences = true,
    } = {},
  ) => {
    const nextTheme = normalizeTheme(theme);
    const preset = THEME_OPTION_MAP.get(nextTheme) || THEME_OPTION_MAP.get(DEFAULT_THEME_ID) || THEME_OPTIONS[0];
    const root = getThemeRoot();

    clearRemovedEditorArtifacts();
    root.dataset.theme = nextTheme;
    applyPresetSurfaceStyle(nextTheme);

    if (persistPresetPreferences) {
      applyFeaturedAdsVisibility(Boolean(preset?.hideFeaturedAds));
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

    const restoredTheme = applyPresetTheme(DEFAULT_THEME_ID);
    applyFeaturedAdsVisibility(false);
    applyPromoVisibility(false);
    applyToastPopupVisibility(false);
    applyNavbarWarningVisibility(false);
    syncThemeSwitcherUI(scope);
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
    const wrapperStyle = [
      swatch ? ` --theme-option-accent-color: ${swatch};` : "",
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
  const syncResponsiveThemeSurfaceMode = () => {
    syncKawaiiMobileTintModeClass();
    applyPresetSurfaceStyle(getStoredTheme());
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
    });
    applyPromoVisibility(getStoredHidePromo(), { persist: false });
    applyToastPopupVisibility(getStoredHideToastPopups(), { persist: false });
    applyNavbarWarningVisibility(getStoredHideNavbarWarning(), { persist: false });
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
      option.setAttribute("role", "button");
      option.setAttribute("tabindex", "0");
      option.setAttribute("aria-selected", "false");

      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        trackThemeEvent("preset-select");
        const nextTheme = applyTheme(option.dataset.theme || DEFAULT_THEME_ID);
        syncSelectedOption(scope, nextTheme);
      });

      option.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        trackThemeEvent("preset-select");
        const nextTheme = applyTheme(option.dataset.theme || DEFAULT_THEME_ID);
        syncSelectedOption(scope, nextTheme);
      });
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

    window.addEventListener(THEME_CHANGE_EVENT, () => {
      syncSelectedOption(scope, getStoredTheme());
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
  });
  applyPromoVisibility(getStoredHidePromo(), { persist: false });
  applyToastPopupVisibility(getStoredHideToastPopups(), { persist: false });
  applyNavbarWarningVisibility(getStoredHideNavbarWarning(), { persist: false });
  syncKawaiiMobileTintModeClass();

  window.addEventListener(THEME_CHANGE_EVENT, syncResponsiveThemeSurfaceMode);
  if (typeof KAWAII_MOBILE_TINT_MEDIA_QUERY.addEventListener === "function") {
    KAWAII_MOBILE_TINT_MEDIA_QUERY.addEventListener("change", syncResponsiveThemeSurfaceMode);
  } else if (typeof KAWAII_MOBILE_TINT_MEDIA_QUERY.addListener === "function") {
    KAWAII_MOBILE_TINT_MEDIA_QUERY.addListener(syncResponsiveThemeSurfaceMode);
  }

  window.initSiteThemes = initSiteThemes;
  window.initThemeSwitcher = initSiteThemes;
  window.syncThemeSwitcherUI = syncThemeSwitcherUI;
  window.syncSiteThemeVisibilityUI = syncVisibilityPreferencesUI;
  window.applySiteTheme = applyTheme;
  window.restoreSiteThemeDefaults = (scope = document) => restoreThemeDefaults(scope);
  window.applyFeaturedAdsVisibilityPreference = applyFeaturedAdsVisibility;
  window.applyPromoVisibilityPreference = applyPromoVisibility;
  window.getActiveSiteTheme = getStoredTheme;
})();
