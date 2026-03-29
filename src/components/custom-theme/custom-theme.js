(() => {
  const THEME_CHANGE_EVENT = "site-theme-change";
  const DEFAULT_MAIN_HEX = "#3B82F6";
  const DEFAULT_LOGO_HEX = "#60A5FA";
  const DEFAULT_LOGO_OFFSET = 70;
  const DEFAULT_NOT_UPDATED_HEX = "#9CA3AF";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const fallbackNormalizeHex = (value) => {
    if (typeof value !== "string") return null;

    const raw = value.trim().replace(/^#/, "");
    if (!raw) return null;

    const expanded = /^[0-9a-fA-F]{3}$/.test(raw)
      ? raw.split("").map((char) => `${char}${char}`).join("")
      : raw;

    if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
    return `#${expanded.toUpperCase()}`;
  };

  const normalizeHex = (value) =>
    window.normalizeCustomSiteThemeHex?.(value) ?? fallbackNormalizeHex(value);

  const hexToRgbString = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return "59, 130, 246";

    return [
      Number.parseInt(normalized.slice(1, 3), 16),
      Number.parseInt(normalized.slice(3, 5), 16),
      Number.parseInt(normalized.slice(5, 7), 16),
    ].join(", ");
  };

  const readHexFromStyles = (styles, names, fallback) => {
    for (const name of names) {
      const value = normalizeHex(styles.getPropertyValue(name).trim());
      if (value) {
        return value;
      }
    }

    return fallback;
  };

  const rgbTokenToHex = (token) => {
    const match = typeof token === "string"
      ? token.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i)
      : null;

    if (!match) {
      return null;
    }

    const [, r, g, b] = match;
    return normalizeHex(
      `#${[r, g, b]
        .map((channel) => Number.parseInt(channel, 10).toString(16).padStart(2, "0"))
        .join("")}`
    );
  };

  const colorTokenToHex = (token) =>
    normalizeHex(token) || rgbTokenToHex(token);

  const readGradientStopHex = (value, index, fallback) => {
    const matches =
      typeof value === "string"
        ? value.match(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/g)
        : null;
    const token = matches?.[index];
    return colorTokenToHex(token) || fallback;
  };

  const readGradientStopPercent = (value, index, fallback) => {
    const matches =
      typeof value === "string"
        ? [...value.matchAll(/(\d+(?:\.\d+)?)%/g)]
        : [];
    const nextValue = Number.parseFloat(matches[index]?.[1] || "");
    return Number.isFinite(nextValue) ? nextValue : fallback;
  };

  const readStoredPercentValue = (value, fallback) => {
    const nextValue = Number.parseFloat(typeof value === "string" ? value.trim() : "");
    return Number.isFinite(nextValue) ? nextValue : fallback;
  };

  const readGradientEnabled = (styles, fillValue) => {
    const storedValue = styles.getPropertyValue("--brand-gradient-enabled").trim();
    if (storedValue === "0") return false;
    if (storedValue === "1") return true;
    return /linear-gradient/i.test(fillValue);
  };

  const readCurrentThemeColors = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const main = readHexFromStyles(styles, ["--theme-color", "--prim"], DEFAULT_MAIN_HEX);
    const headerOverlayFill = styles.getPropertyValue("--header-overlay-fill").trim();
    const storedOffset = styles.getPropertyValue("--brand-gradient-offset").trim();
    const gradientEnabled = readGradientEnabled(styles, headerOverlayFill);

    return {
      main,
      updated: readHexFromStyles(styles, ["--status-updated-color", "--theme-color", "--prim"], main),
      logo: readHexFromStyles(styles, ["--brand-gradient-color"], readGradientStopHex(headerOverlayFill, 0, DEFAULT_LOGO_HEX)),
      logoOffset: clamp(
        storedOffset
          ? readStoredPercentValue(storedOffset, DEFAULT_LOGO_OFFSET)
          : readGradientStopPercent(headerOverlayFill, 1, DEFAULT_LOGO_OFFSET),
        20,
        85
      ),
      gradientEnabled,
      notUpdated: readHexFromStyles(styles, ["--status-not-updated-color"], DEFAULT_NOT_UPDATED_HEX),
    };
  };

  const buildStatusThemeVars = ({ updated, notUpdated }) => ({
    "--status-updated-color": updated,
    "--status-updated-rgb": hexToRgbString(updated),
    "--status-not-updated-color": notUpdated,
    "--status-not-updated-rgb": hexToRgbString(notUpdated),
    "--footer-status-live-color": "rgba(var(--status-updated-rgb), 0.95)",
    "--footer-status-muted-color": "rgba(var(--status-not-updated-rgb), 0.9)",
  });

  const buildBrandOverlayVars = ({ logo, main, hover, logoOffset, gradientEnabled }) => {
    const normalizedOffset = clamp(Math.round(logoOffset), 20, 85);
    const solidFill = main;
    const featuredFill = gradientEnabled
      ? `linear-gradient(90deg, ${logo} 0%, ${main} ${normalizedOffset}%, #ffffff 100%)`
      : solidFill;
    const brandFill = gradientEnabled
      ? `linear-gradient(90deg, ${logo} 0%, ${main} ${normalizedOffset}%, ${hover} 100%)`
      : solidFill;

    return {
      "--brand-gradient-enabled": gradientEnabled ? "1" : "0",
      "--brand-gradient-color": logo,
      "--brand-gradient-offset": `${normalizedOffset}%`,
      "--featured-overlay-fill": featuredFill,
      "--banner-overlay-fill": brandFill,
      "--header-overlay-fill": brandFill,
    };
  };

  const mergeThemeCssText = (baseCssText, extraVars) => {
    const lines = Object.entries(extraVars).map(([name, value]) => `  ${name}: ${value};`);
    const trimmed = typeof baseCssText === "string" ? baseCssText.trim() : "";

    if (!trimmed || !/\}\s*$/.test(trimmed)) {
      return [
        ':root[data-theme="custom"] {',
        ...lines,
        "}",
      ].join("\n");
    }

    return trimmed.replace(/\}\s*$/, `\n${lines.join("\n")}\n}`);
  };

  const initCustomThemeEditor = (scope = document) => {
    const editor = scope.getElementById("customThemeEditor");
    const error = scope.getElementById("customThemeError");
    const applyButton = scope.getElementById("customThemeApply");
    const mainInput = scope.getElementById("customThemeMainInput");
    const updatedInput = scope.getElementById("customThemeUpdatedInput");
    const notUpdatedInput = scope.getElementById("customThemeNotUpdatedInput");
    const mainValue = scope.getElementById("customThemeMainValue");
    const updatedValue = scope.getElementById("customThemeUpdatedValue");
    const notUpdatedValue = scope.getElementById("customThemeNotUpdatedValue");

    if (
      !editor ||
      !error ||
      !applyButton ||
      !mainInput ||
      !updatedInput ||
      !notUpdatedInput ||
      !mainValue ||
      !updatedValue ||
      !notUpdatedValue
    ) {
      return;
    }

    if (editor.dataset.customThemeBound === "true") {
      return;
    }

    const setError = (message = "") => {
      error.textContent = message;
      error.hidden = !message;
    };

    const syncValueLabels = () => {
      mainValue.textContent = normalizeHex(mainInput.value) || DEFAULT_MAIN_HEX;
      updatedValue.textContent = normalizeHex(updatedInput.value) || DEFAULT_MAIN_HEX;
      notUpdatedValue.textContent = normalizeHex(notUpdatedInput.value) || DEFAULT_NOT_UPDATED_HEX;
    };

    const syncInputsFromTheme = () => {
      const colors = readCurrentThemeColors();
      mainInput.value = colors.main;
      updatedInput.value = colors.updated;
      notUpdatedInput.value = colors.notUpdated;
      syncValueLabels();
      setError("");
    };

    const applyColors = () => {
      const currentTheme = readCurrentThemeColors();
      const colors = {
        main: normalizeHex(mainInput.value) || DEFAULT_MAIN_HEX,
        updated: normalizeHex(updatedInput.value) || DEFAULT_MAIN_HEX,
        logo: currentTheme.logo,
        logoOffset: currentTheme.logoOffset,
        gradientEnabled: currentTheme.gradientEnabled,
        notUpdated: normalizeHex(notUpdatedInput.value) || DEFAULT_NOT_UPDATED_HEX,
      };

      const baseTheme = window.applyCustomSiteTheme?.(colors.main);
      if (!baseTheme) {
        setError("Could not apply the main theme color.");
        return;
      }

      const baseCssText = window.getCustomSiteThemeCssText?.() || "";
      const hover = readHexFromStyles(
        window.getComputedStyle(document.documentElement),
        ["--prim-hvr"],
        colors.main
      );
      const mergedCssText = mergeThemeCssText(baseCssText, {
        ...buildStatusThemeVars(colors),
        ...buildBrandOverlayVars({
          logo: colors.logo,
          main: colors.main,
          hover,
          logoOffset: colors.logoOffset,
          gradientEnabled: colors.gradientEnabled,
        }),
      });
      const appliedTheme = window.applyCustomSiteThemeCssText?.(mergedCssText);

      if (!appliedTheme) {
        setError("Could not save the theme colors.");
        return;
      }

      window.syncThemeSwitcherUI?.(document);
      setError("");
    };

    [mainInput, updatedInput, notUpdatedInput].forEach((input) => {
      input.addEventListener("input", () => {
        syncValueLabels();
        setError("");
      });
    });

    applyButton.addEventListener("click", (event) => {
      event.preventDefault();
      applyColors();
    });

    window.addEventListener(THEME_CHANGE_EVENT, syncInputsFromTheme);

    editor.dataset.customThemeBound = "true";
    syncInputsFromTheme();
  };

  window.initCustomThemeEditor = initCustomThemeEditor;
  window.initCustomThemePicker = initCustomThemeEditor;
})();
