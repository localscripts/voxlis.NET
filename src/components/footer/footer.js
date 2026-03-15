(() => {
  const THEME_STORAGE_KEY = "voxlis-theme";
  const CUSTOM_THEME_STORAGE_KEY = "voxlis-custom-theme-hex";
  const CUSTOM_THEME_CSS_STORAGE_KEY = "voxlis-custom-theme-css";
  const CUSTOM_THEME_ID = "custom";
  const THEME_CHANGE_EVENT = "site-theme-change";
  const THEME_OPTIONS = [
    { id: "blue", label: "Legacy", swatch: "#3B82F6" },
    { id: "red", label: "Red Theme", swatch: "#EF4444" },
    { id: "purple", label: "Purple Theme", swatch: "#8B5CF6" },
    { id: "green", label: "Green Theme", swatch: "#10B981" },
    { id: "orange", label: "Orange Theme", swatch: "#F59E0B" },
    { id: "cyan", label: "Cyan Theme", swatch: "#06B6D4" },
    { id: "teal", label: "Teal Theme", swatch: "#14B8A6" },
    { id: "indigo", label: "Indigo Theme", swatch: "#6366F1" },
    { id: "pink", label: "Pink Theme", swatch: "#EC4899" },
    { id: "rose", label: "Rose Theme", swatch: "#F43F5E" },
    { id: "amber", label: "Amber Theme", swatch: "#F59E0B" },
    { id: "lime", label: "Lime Theme", swatch: "#84CC16" },
    { id: "emerald", label: "Emerald Theme", swatch: "#10B981" },
    { id: "sky", label: "Sky Theme", swatch: "#0EA5E9" },
    { id: "violet", label: "Violet Theme", swatch: "#7C3AED" },
    { id: "slate", label: "Slate Theme", swatch: "#64748B" },
    { id: "gold", label: "Gold Theme", swatch: "#EAB308" },
    { id: "crimson", label: "Crimson Theme", swatch: "#DC2626" },
    { id: "aqua", label: "Aqua Theme", swatch: "#22D3EE" },
    { id: "magenta", label: "Magenta Theme", swatch: "#D946EF" },
  ];
  const VALID_THEMES = new Set(THEME_OPTIONS.map(({ id }) => id));
  const THEME_OPTION_MAP = new Map(THEME_OPTIONS.map((option) => [option.id, option]));

  const getThemeRoot = () => document.documentElement;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const normalizeTheme = (theme) => {
    if (theme === CUSTOM_THEME_ID) return CUSTOM_THEME_ID;
    return VALID_THEMES.has(theme) ? theme : "blue";
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
    "--bg",
    "--fg",
    "--crd-bg",
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
    "--blur-overlay",
    "--blur-panel",
    "--blur-strong",
    "--blur-flash-start",
    "--blur-flash-end",
    "--rad",
    "--hdr-h",
    "--navbar-height",
    "--navbar-background",
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
    "--navbar-mobile-panel-background",
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
    "--prim-glow-shadow",
    "--featured-section-spacing",
    "--featured-hide-duration",
    "--featured-card-max-width",
    "--featured-card-background",
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
    "--sponsor-overlay-mask",
    "--footer-heart-mask",
    "--shd",
    "--shd-hvr",
    "--hero-width",
    "--promo-hero-max-width",
    "--promo-text-max-width",
    "--promo-card-padding",
    "--promo-card-blur",
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
    normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || "blue");

  const getStoredCustomHex = () =>
    normalizeHex(window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || "");

  const getStoredCustomCssText = () =>
    window.localStorage.getItem(CUSTOM_THEME_CSS_STORAGE_KEY) || "";

  const getCustomThemeHexFromVars = (vars) =>
    normalizeHex(vars?.["--theme-color"]) ||
    normalizeHex(vars?.["--prim"]) ||
    getStoredCustomHex() ||
    "#3B82F6";

  const applyPresetTheme = (theme) => {
    const nextTheme = VALID_THEMES.has(theme) ? theme : "blue";
    const root = getThemeRoot();
    clearCustomThemeVars();
    root.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
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
    window.localStorage.setItem(THEME_STORAGE_KEY, CUSTOM_THEME_ID);
    window.localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, customHex);
    window.localStorage.setItem(CUSTOM_THEME_CSS_STORAGE_KEY, normalizedCssText);
    emitThemeChange(CUSTOM_THEME_ID, customHex);
    return CUSTOM_THEME_ID;
  };

  const applyCustomTheme = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return applyPresetTheme("blue");

    return applyCustomThemeCssText(buildCustomThemeCssText(normalized));
  };

  const applyTheme = (theme) => {
    const nextTheme = normalizeTheme(theme);
    if (nextTheme === CUSTOM_THEME_ID) {
      const storedCssText = getStoredCustomCssText();
      if (storedCssText) {
        return applyCustomThemeCssText(storedCssText) || applyPresetTheme("blue");
      }
      const storedHex = getStoredCustomHex();
      return storedHex ? applyCustomTheme(storedHex) : applyPresetTheme("blue");
    }
    return applyPresetTheme(nextTheme);
  };

  const buildThemeOptionMarkup = ({ id, label, swatch }) => `
    <div class="footer-theme-option" data-theme="${id}">
      <div class="footer-theme-swatch" aria-hidden="true" style="background-color: ${swatch};"></div>
      <span>${label}</span>
    </div>
  `;

  const renderThemeOptions = (scope = document) => {
    const optionsRoot = scope.getElementById("siteThemeOptions");
    if (!optionsRoot || optionsRoot.dataset.rendered === "true") return;

    optionsRoot.innerHTML = THEME_OPTIONS.map(buildThemeOptionMarkup).join("");
    optionsRoot.dataset.rendered = "true";
  };

  const syncSelectedOption = (dropdown, activeTheme, customHex = getStoredCustomHex()) => {
    const selected = dropdown.querySelector("#siteThemeSelected");
    const options = [...dropdown.querySelectorAll(".footer-theme-option")];
    if (!selected || !options.length) return;

    const selectedIndicator = selected.querySelector(".footer-theme-swatch");
    const selectedLabel = selected.querySelector("span");

    if (activeTheme === CUSTOM_THEME_ID && customHex && selectedIndicator && selectedLabel) {
      options.forEach((option) => option.classList.remove("is-selected"));
      selectedIndicator.style.backgroundColor = customHex;
      selectedLabel.textContent = "Custom";
      return;
    }

    const activeOption = THEME_OPTION_MAP.get(activeTheme) || THEME_OPTIONS[0];

    options.forEach((option) => {
      option.classList.toggle("is-selected", option.dataset.theme === activeOption.id);
    });

    if (selectedIndicator) {
      selectedIndicator.style.backgroundColor = activeOption.swatch;
    }

    if (selectedLabel) {
      selectedLabel.textContent = activeOption.label;
    }
  };

  const syncThemeSwitcherUI = (scope = document) => {
    renderThemeOptions(scope);
    const dropdown = scope.getElementById("siteThemeDropdown");
    if (!dropdown) return;
    syncSelectedOption(dropdown, getStoredTheme(), getStoredCustomHex());
  };

  const closeDropdown = (dropdown) => {
    dropdown.classList.remove("is-active");
    dropdown.querySelector("#siteThemeSelected")?.setAttribute("aria-expanded", "false");
  };

  const openDropdown = (dropdown) => {
    dropdown.classList.add("is-active");
    dropdown.querySelector("#siteThemeSelected")?.setAttribute("aria-expanded", "true");
  };

  const toggleDropdown = (dropdown) => {
    if (dropdown.classList.contains("is-active")) {
      closeDropdown(dropdown);
      return;
    }
    openDropdown(dropdown);
  };

  const initThemeSwitcher = (scope = document) => {
    renderThemeOptions(scope);

    const dropdown = scope.getElementById("siteThemeDropdown");
    const selected = scope.getElementById("siteThemeSelected");
    const optionsRoot = scope.getElementById("siteThemeOptions");
    if (!dropdown || !selected || !optionsRoot) return;

    if (dropdown.dataset.themeBound === "true") {
      syncThemeSwitcherUI(scope);
      return;
    }

    const activeTheme = applyTheme(getStoredTheme());
    syncSelectedOption(dropdown, activeTheme, getStoredCustomHex());

    selected.setAttribute("role", "button");
    selected.setAttribute("tabindex", "0");
    selected.setAttribute("aria-haspopup", "listbox");
    selected.setAttribute("aria-expanded", "false");

    selected.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown(dropdown);
    });

    selected.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown(dropdown);
      }

      if (event.key === "Escape") {
        closeDropdown(dropdown);
      }
    });

    optionsRoot.querySelectorAll(".footer-theme-option").forEach((option) => {
      option.setAttribute("role", "option");
      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const nextTheme = applyTheme(option.dataset.theme || "blue");
        syncSelectedOption(dropdown, nextTheme, getStoredCustomHex());
        closeDropdown(dropdown);
      });
    });

    window.addEventListener(THEME_CHANGE_EVENT, () => {
      syncSelectedOption(dropdown, getStoredTheme(), getStoredCustomHex());
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        closeDropdown(dropdown);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDropdown(dropdown);
      }
    });

    dropdown.dataset.themeBound = "true";
  };

  applyTheme(getStoredTheme());

  window.initThemeSwitcher = initThemeSwitcher;
  window.syncThemeSwitcherUI = syncThemeSwitcherUI;
  window.applySiteTheme = applyTheme;
  window.applyCustomSiteTheme = applyCustomTheme;
  window.applyCustomSiteThemeCssText = applyCustomThemeCssText;
  window.getStoredCustomSiteThemeHex = getStoredCustomHex;
  window.getCustomSiteThemeCssText = () =>
    buildCustomThemeCssTextFromVars(collectThemeEditorVars());
  window.getActiveSiteTheme = getStoredTheme;
  window.normalizeCustomSiteThemeHex = normalizeHex;
})();
