(() => {
  const THEME_CHANGE_EVENT = "site-theme-change";
  const DEFAULT_MAIN_HEX = "#3B82F6";
  const DEFAULT_HOVER_HEX = "#2563EB";
  const DEFAULT_LOGO_HEX = "#60A5FA";
  const DEFAULT_LOGO_OFFSET = 70;
  const DEFAULT_BACKGROUND_HEX = "#000000";
  const DEFAULT_TEXT_HEX = "#FFFFFF";
  const DEFAULT_NOT_UPDATED_HEX = "#9CA3AF";
  const DEFAULT_SITE_BORDER_HEX = "#070707";
  const DEFAULT_NAVBAR_BACKGROUND_HEX = "#000000";
  const DEFAULT_NAVBAR_SEARCH_HEX = "#000000";
  const DEFAULT_NAVBAR_BUTTON_HEX = "#FFFFFF";
  const DEFAULT_FOOTER_BACKGROUND_HEX = "#000000";
  const DEFAULT_FOOTER_TEXT_HEX = "#D1D5DB";
  const DEFAULT_FOOTER_MUTED_HEX = "#9CA3AF";
  const DEFAULT_FOOTER_TINT_POWER = 82;
  const DEFAULT_FOOTER_BLUR_STRENGTH = 12;
  const DEFAULT_FOOTER_GLOW_HEX = DEFAULT_MAIN_HEX;
  const FOOTER_BLUR_TINT_SCALE = 16 / 82;
  const DEFAULT_CARD_ACTION_BUTTON_BACKGROUND_HEX = "#000000";
  const DEFAULT_CARD_ACTION_BUTTON_TINT_POWER = 34;
  const DEFAULT_CARD_ACTION_BUTTON_TEXT_HEX = "#CBD5E1";
  const DEFAULT_CARD_SPONSOR_BUTTON_BACKGROUND_HEX = "#000000";
  const DEFAULT_CARD_SPONSOR_BUTTON_TINT_POWER = 34;
  const DEFAULT_CARD_SPONSOR_BUTTON_TEXT_HEX = "#F8FAFC";
  const CARD_BUTTON_HOVER_POWER_BOOST = 8;
  const DEFAULT_FEATURED_BACKGROUND_HEX = "#000000";
  const DEFAULT_FEATURED_TINT_POWER = 82;
  const DEFAULT_FEATURED_BLUR_STRENGTH = 12;
  const DEFAULT_FEATURED_ACCENT_HEX = DEFAULT_MAIN_HEX;
  const DEFAULT_FEATURED_TITLE_HEX = "#FFFFFF";
  const DEFAULT_FEATURED_ACTION_HEX = "#FFFFFF";
  const DEFAULT_FEATURED_IMAGE_BACKGROUND_HEX = "#000000";
  const FEATURED_BLUR_TINT_SCALE = 18 / 82;
  const DEFAULT_THEME_BACKGROUND_MEDIA_URL = "";
  const DEFAULT_FEATURED_OVERLAY_MASK_URL = "/public/assets/overlay/promo-3.png";
  const DEFAULT_BANNER_OVERLAY_MASK_URL = "/public/assets/overlay/voxlis-2.png";
  const DEFAULT_HEADER_OVERLAY_MASK_URL = "/public/assets/overlay/voxlis-2.png";
  const DEFAULT_SPONSOR_OVERLAY_MASK_URL = "/public/assets/icons/images/keyempire-logo.png";
  const DEFAULT_INFO_MODAL_BACKGROUND_HEX = "#000000";
  const DEFAULT_INFO_MODAL_TINT_POWER = 88;
  const DEFAULT_INFO_MODAL_BLUR_STRENGTH = 12;
  const DEFAULT_INFO_MODAL_HEADER_HEX = DEFAULT_MAIN_HEX;
  const INFO_MODAL_BLUR_TINT_SCALE = 18 / 82;
  const DEFAULT_NAVBAR_POSITION = "sticky";
  const DEFAULT_FONT_IMPORT_URL = "";
  const DEFAULT_BASE_FONT_FAMILY = '"Open Sans", sans-serif';
  const DEFAULT_CARD_FONT_FAMILY = DEFAULT_BASE_FONT_FAMILY;
  const DEFAULT_UI_FONT_FAMILY = DEFAULT_BASE_FONT_FAMILY;
  const DEFAULT_SYSTEM_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  const DEFAULT_MONO_FONT_FAMILY = '"Fira Code", "Consolas", monospace';

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

  const readAlphaFromToken = (token, fallback = 1) => {
    const trimmed = typeof token === "string" ? token.trim() : "";
    if (!trimmed || /^var\(/i.test(trimmed)) {
      return fallback;
    }

    const rgbaMatch = trimmed.match(
      /rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([0-9]*\.?[0-9]+)\s*\)/i
    );
    if (rgbaMatch) {
      return clamp(Number.parseFloat(rgbaMatch[1]) || fallback, 0, 1);
    }

    if (/^rgb\(/i.test(trimmed) || /^#/i.test(trimmed)) {
      return 1;
    }

    return fallback;
  };

  const buildColorWithAlpha = (hex, alpha = 1) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return "";

    const nextAlpha = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
    if (nextAlpha >= 0.999) {
      return normalized;
    }

    return `rgba(${hexToRgbString(normalized)}, ${Number(nextAlpha.toFixed(3))})`;
  };

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

  const normalizeBooleanToken = (value, fallback = false) => {
    if (typeof value !== "string") return fallback;

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return fallback;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
    return fallback;
  };

  const readPixelValue = (value, fallback = 0) => {
    const nextValue = Number.parseFloat(typeof value === "string" ? value.trim() : "");
    return Number.isFinite(nextValue) ? nextValue : fallback;
  };

  const readTokenValue = (styles, name, fallback = "") => {
    const value = String(styles.getPropertyValue(name) || "").trim();
    if (!value || /^var\(/i.test(value)) {
      return fallback;
    }
    return value;
  };

  const normalizeFontImportUrl = (value) => {
    if (typeof value !== "string") return "";

    const trimmed = value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
    if (!trimmed || /^none$/i.test(trimmed)) {
      return "";
    }

    return trimmed;
  };

  const normalizeThemeAssetUrl = (value) => {
    if (typeof value !== "string") return "";

    const trimmed = value.trim();
    const unwrapped = trimmed
      .replace(/^url\((['"]?)(.*?)\1\)$/i, "$2")
      .replace(/^(['"])(.*)\1$/, "$2")
      .trim();

    if (!unwrapped || /^none$/i.test(unwrapped) || /^javascript:/i.test(unwrapped)) {
      return "";
    }

    return unwrapped;
  };

  const escapeCssString = (value) =>
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, "");

  const buildCssUrlToken = (value, fallback = "none") => {
    const normalized = normalizeThemeAssetUrl(value);
    return normalized ? `url("${escapeCssString(normalized)}")` : fallback;
  };

  const buildCssStringToken = (value, fallback = "none") => {
    const normalized = normalizeThemeAssetUrl(value);
    return normalized ? `"${escapeCssString(normalized)}"` : fallback;
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
      hover: readHexFromStyles(styles, ["--prim-hvr"], DEFAULT_HOVER_HEX),
      background: readHexFromStyles(styles, ["--bg"], DEFAULT_BACKGROUND_HEX),
      text: readHexFromStyles(styles, ["--fg"], DEFAULT_TEXT_HEX),
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

  const readCurrentThemeFonts = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const base = readTokenValue(styles, "--font-family-base", DEFAULT_BASE_FONT_FAMILY);

    return {
      fontImportUrl: normalizeFontImportUrl(readTokenValue(styles, "--theme-font-import-url", DEFAULT_FONT_IMPORT_URL)),
      base,
      ui: readTokenValue(styles, "--font-family-ui", base || DEFAULT_UI_FONT_FAMILY),
      system: readTokenValue(styles, "--font-family-system", DEFAULT_SYSTEM_FONT_FAMILY),
      mono: readTokenValue(styles, "--font-family-mono", DEFAULT_MONO_FONT_FAMILY),
      card: readTokenValue(styles, "--card-font-family", base || DEFAULT_CARD_FONT_FAMILY),
    };
  };

  const readCurrentThemeImages = () => {
    const styles = window.getComputedStyle(document.documentElement);

    return {
      backgroundMedia: normalizeThemeAssetUrl(
        readTokenValue(styles, "--theme-background-media-url", DEFAULT_THEME_BACKGROUND_MEDIA_URL)
      ),
      featuredOverlayMask: normalizeThemeAssetUrl(
        readTokenValue(styles, "--featured-overlay-mask", DEFAULT_FEATURED_OVERLAY_MASK_URL)
      ),
      bannerOverlayMask: normalizeThemeAssetUrl(
        readTokenValue(styles, "--banner-overlay-mask", DEFAULT_BANNER_OVERLAY_MASK_URL)
      ),
      headerOverlayMask: normalizeThemeAssetUrl(
        readTokenValue(styles, "--header-overlay-mask", DEFAULT_HEADER_OVERLAY_MASK_URL)
      ),
      sponsorOverlayMask: normalizeThemeAssetUrl(
        readTokenValue(styles, "--sponsor-overlay-mask", DEFAULT_SPONSOR_OVERLAY_MASK_URL)
      ),
    };
  };

  const readCurrentThemeLayout = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const navbarPosition = readTokenValue(styles, "--navbar-position", DEFAULT_NAVBAR_POSITION).toLowerCase();

    return {
      stickyNavbar: navbarPosition !== "static",
    };
  };

  const readCurrentThemeNavbar = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const backgroundToken = readTokenValue(styles, "--navbar-background", DEFAULT_NAVBAR_BACKGROUND_HEX);
    const mobilePanelToken = readTokenValue(styles, "--navbar-mobile-panel-background", backgroundToken);
    const searchToken = readTokenValue(styles, "--navbar-search-background", "rgba(0, 0, 0, 0.3)");
    const buttonToken = readTokenValue(styles, "--navbar-button-background", "rgba(255, 255, 255, 0.05)");

    return {
      background: colorTokenToHex(backgroundToken) || DEFAULT_NAVBAR_BACKGROUND_HEX,
      backgroundAlpha: readAlphaFromToken(backgroundToken, 1),
      mobilePanelAlpha: readAlphaFromToken(mobilePanelToken, readAlphaFromToken(backgroundToken, 1)),
      search: colorTokenToHex(searchToken) || DEFAULT_NAVBAR_SEARCH_HEX,
      searchAlpha: readAlphaFromToken(searchToken, 0.3),
      button: colorTokenToHex(buttonToken) || DEFAULT_NAVBAR_BUTTON_HEX,
      buttonAlpha: readAlphaFromToken(buttonToken, 0.05),
      border: readHexFromStyles(styles, ["--navbar-scrolled-border", "--site-border-color"], DEFAULT_SITE_BORDER_HEX),
    };
  };

  const readCurrentThemeFooter = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const backgroundToken = readTokenValue(styles, "--footer-bg", "rgba(0, 0, 0, 0.8)");
    const textToken = readTokenValue(styles, "--footer-text", "rgba(209, 213, 219, 1)");
    const mutedToken = readTokenValue(styles, "--footer-muted", "rgba(156, 163, 175, 1)");
    const tintColor = readHexFromStyles(
      styles,
      ["--footer-surface-tint-color"],
      colorTokenToHex(backgroundToken) || DEFAULT_FOOTER_BACKGROUND_HEX
    );
    const tintPower = clamp(
      readStoredPercentValue(
        readTokenValue(styles, "--footer-surface-tint-power", String(DEFAULT_FOOTER_TINT_POWER)),
        DEFAULT_FOOTER_TINT_POWER
      ),
      0,
      100
    );
    const blurEnabled = normalizeBooleanToken(
      readTokenValue(styles, "--footer-surface-blur-enabled", ""),
      readPixelValue(readTokenValue(styles, "--footer-backdrop-blur", "0px"), 0) > 0
    );
    const blurStrength = clamp(
      readPixelValue(
        readTokenValue(styles, "--footer-surface-blur-strength", String(DEFAULT_FOOTER_BLUR_STRENGTH)),
        DEFAULT_FOOTER_BLUR_STRENGTH
      ),
      0,
      24
    );
    const followGlobalSurface = normalizeBooleanToken(
      readTokenValue(styles, "--footer-follow-global-surface", "0"),
      false
    );

    return {
      background: colorTokenToHex(backgroundToken) || DEFAULT_FOOTER_BACKGROUND_HEX,
      backgroundAlpha: readAlphaFromToken(backgroundToken, 0.8),
      border: readHexFromStyles(
        styles,
        ["--footer-surface-outline-color", "--footer-border", "--site-border-color"],
        DEFAULT_SITE_BORDER_HEX
      ),
      text: colorTokenToHex(textToken) || DEFAULT_FOOTER_TEXT_HEX,
      textAlpha: readAlphaFromToken(textToken, 1),
      muted: colorTokenToHex(mutedToken) || DEFAULT_FOOTER_MUTED_HEX,
      mutedAlpha: readAlphaFromToken(mutedToken, 1),
      tintColor,
      tintPower,
      blurEnabled,
      blurStrength,
      followGlobalSurface,
      glow: readHexFromStyles(styles, ["--footer-glow-color", "--theme-color", "--prim"], DEFAULT_FOOTER_GLOW_HEX),
    };
  };

  const readCurrentThemeCardButtons = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const actionBackgroundToken = readTokenValue(styles, "--card-action-button-background", "rgba(0, 0, 0, 0.34)");
    const actionTextToken = readTokenValue(styles, "--card-action-button-text", "rgba(203, 213, 225, 0.8)");
    const sponsorBackgroundToken = readTokenValue(styles, "--card-sponsor-button-background", "rgba(0, 0, 0, 0.34)");
    const sponsorTextToken = readTokenValue(styles, "--card-sponsor-button-text", "rgba(248, 250, 252, 0.96)");

    return {
      actionTintColor: readHexFromStyles(
        styles,
        ["--card-action-button-tint-color"],
        colorTokenToHex(actionBackgroundToken) || DEFAULT_CARD_ACTION_BUTTON_BACKGROUND_HEX
      ),
      actionTintPower: clamp(
        readStoredPercentValue(
          readTokenValue(styles, "--card-action-button-tint-power", String(DEFAULT_CARD_ACTION_BUTTON_TINT_POWER)),
          DEFAULT_CARD_ACTION_BUTTON_TINT_POWER
        ),
        0,
        100
      ),
      actionText: colorTokenToHex(actionTextToken) || DEFAULT_CARD_ACTION_BUTTON_TEXT_HEX,
      actionTextAlpha: readAlphaFromToken(actionTextToken, 0.8),
      sponsorTintColor: readHexFromStyles(
        styles,
        ["--card-sponsor-button-tint-color"],
        colorTokenToHex(sponsorBackgroundToken) || DEFAULT_CARD_SPONSOR_BUTTON_BACKGROUND_HEX
      ),
      sponsorTintPower: clamp(
        readStoredPercentValue(
          readTokenValue(styles, "--card-sponsor-button-tint-power", String(DEFAULT_CARD_SPONSOR_BUTTON_TINT_POWER)),
          DEFAULT_CARD_SPONSOR_BUTTON_TINT_POWER
        ),
        0,
        100
      ),
      sponsorText: colorTokenToHex(sponsorTextToken) || DEFAULT_CARD_SPONSOR_BUTTON_TEXT_HEX,
      sponsorTextAlpha: readAlphaFromToken(sponsorTextToken, 0.96),
    };
  };

  const readCurrentThemeFeatured = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const backgroundToken = readTokenValue(styles, "--featured-surface-background", "rgba(0, 0, 0, 0.82)");
    const accentToken = readTokenValue(styles, "--featured-card-accent-fill", "");
    const titleToken = readTokenValue(styles, "--featured-title-color", "#ffffff");
    const actionToken = readTokenValue(styles, "--featured-action-color", "rgba(255, 255, 255, 0.7)");
    const imageBackgroundToken = readTokenValue(styles, "--featured-image-background", "rgba(0, 0, 0, 0.2)");
    const tintColor = readHexFromStyles(
      styles,
      ["--featured-surface-tint-color"],
      colorTokenToHex(backgroundToken) || DEFAULT_FEATURED_BACKGROUND_HEX
    );
    const tintPower = clamp(
      readStoredPercentValue(
        readTokenValue(styles, "--featured-surface-tint-power", String(DEFAULT_FEATURED_TINT_POWER)),
        DEFAULT_FEATURED_TINT_POWER
      ),
      0,
      100
    );
    const blurEnabled = normalizeBooleanToken(
      readTokenValue(styles, "--featured-surface-blur-enabled", ""),
      readPixelValue(readTokenValue(styles, "--featured-surface-backdrop-blur", "0px"), 0) > 0
    );
    const blurStrength = clamp(
      readPixelValue(
        readTokenValue(styles, "--featured-surface-blur-strength", String(DEFAULT_FEATURED_BLUR_STRENGTH)),
        DEFAULT_FEATURED_BLUR_STRENGTH
      ),
      0,
      24
    );
    const followGlobalSurface = normalizeBooleanToken(
      readTokenValue(styles, "--featured-follow-global-surface", "1"),
      true
    );

    return {
      tintColor,
      tintPower,
      blurEnabled,
      blurStrength,
      followGlobalSurface,
      border: readHexFromStyles(
        styles,
        ["--featured-card-border", "--featured-surface-outline-color", "--site-border-color"],
        DEFAULT_SITE_BORDER_HEX
      ),
      headerBorder: readHexFromStyles(
        styles,
        ["--featured-card-header-border", "--featured-card-border", "--site-border-color"],
        DEFAULT_SITE_BORDER_HEX
      ),
      accent: readHexFromStyles(
        styles,
        ["--theme-color", "--prim"],
        readGradientStopHex(accentToken, 0, DEFAULT_FEATURED_ACCENT_HEX)
      ),
      title: colorTokenToHex(titleToken) || DEFAULT_FEATURED_TITLE_HEX,
      titleAlpha: readAlphaFromToken(titleToken, 1),
      action: colorTokenToHex(actionToken) || DEFAULT_FEATURED_ACTION_HEX,
      actionAlpha: readAlphaFromToken(actionToken, 0.7),
      imageBackground: colorTokenToHex(imageBackgroundToken) || DEFAULT_FEATURED_IMAGE_BACKGROUND_HEX,
      imageBackgroundAlpha: readAlphaFromToken(imageBackgroundToken, 0.2),
    };
  };

  const readCurrentThemeInfoModal = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const backgroundToken = readTokenValue(styles, "--info-modal-background", "rgba(0, 0, 0, 0.88)");
    const headerBackgroundToken = readTokenValue(styles, "--info-modal-header-background", "");
    const fallbackHeaderAccent = readHexFromStyles(styles, ["--theme-color", "--prim"], DEFAULT_INFO_MODAL_HEADER_HEX);
    const tintColor = readHexFromStyles(
      styles,
      ["--info-modal-surface-tint-color"],
      colorTokenToHex(backgroundToken) || DEFAULT_INFO_MODAL_BACKGROUND_HEX
    );
    const tintPower = clamp(
      readStoredPercentValue(
        readTokenValue(styles, "--info-modal-surface-tint-power", String(DEFAULT_INFO_MODAL_TINT_POWER)),
        DEFAULT_INFO_MODAL_TINT_POWER
      ),
      0,
      100
    );
    const blurEnabled = normalizeBooleanToken(
      readTokenValue(styles, "--info-modal-surface-blur-enabled", ""),
      readPixelValue(readTokenValue(styles, "--info-modal-backdrop-blur", "0px"), 0) > 0
    );
    const blurStrength = clamp(
      readPixelValue(
        readTokenValue(styles, "--info-modal-surface-blur-strength", String(DEFAULT_INFO_MODAL_BLUR_STRENGTH)),
        DEFAULT_INFO_MODAL_BLUR_STRENGTH
      ),
      0,
      24
    );
    const followGlobalSurface = normalizeBooleanToken(
      readTokenValue(styles, "--info-modal-follow-global-surface", "0"),
      false
    );

    return {
      border: readHexFromStyles(
        styles,
        ["--info-modal-surface-outline-color", "--site-outline-color", "--site-border-color"],
        DEFAULT_SITE_BORDER_HEX
      ),
      tintColor,
      tintPower,
      blurEnabled,
      blurStrength,
      followGlobalSurface,
      header: readHexFromStyles(
        styles,
        ["--info-modal-header-accent-color"],
        readGradientStopHex(headerBackgroundToken, 0, fallbackHeaderAccent)
      ),
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

  const buildFooterGlowVars = (glow) => {
    const normalizedGlow = normalizeHex(glow) || DEFAULT_FOOTER_GLOW_HEX;
    const glowRgb = hexToRgbString(normalizedGlow);

    return {
      "--footer-glow-color": normalizedGlow,
      "--footer-overlay-gradient": `linear-gradient(
    to top,
    rgba(${glowRgb}, 0.12) 0%,
    rgba(${glowRgb}, 0.065) 16%,
    rgba(${glowRgb}, 0.03) 32%,
    rgba(${glowRgb}, 0.012) 48%,
    rgba(${glowRgb}, 0) 66%
  )`,
      "--footer-theme-highlight-shadow": `0 0 0 1px rgba(${glowRgb}, 0.44), 0 0 1.25rem rgba(${glowRgb}, 0.28), 0 0 2.5rem rgba(${glowRgb}, 0.18)`,
    };
  };

  const buildInfoModalHeaderVars = (accent) => {
    const normalizedAccent = normalizeHex(accent) || DEFAULT_INFO_MODAL_HEADER_HEX;
    const accentRgb = hexToRgbString(normalizedAccent);

    return {
      "--info-modal-header-accent-color": normalizedAccent,
      "--info-modal-header-background": `linear-gradient(to right, rgba(${accentRgb}, 0.12), transparent)`,
    };
  };

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
    const applyImagesButton = scope.getElementById("customThemeApplyImages");
    const mainInput = scope.getElementById("customThemeMainInput");
    const hoverInput = scope.getElementById("customThemeHoverInput");
    const logoInput = scope.getElementById("customThemeLogoInput");
    const backgroundInput = scope.getElementById("customThemeBackgroundInput");
    const textInput = scope.getElementById("customThemeTextInput");
    const cardFontInput = scope.getElementById("customThemeCardFontInput");
    const navbarBackgroundInput = scope.getElementById("customThemeNavbarBackgroundInput");
    const navbarSearchInput = scope.getElementById("customThemeNavbarSearchInput");
    const navbarButtonInput = scope.getElementById("customThemeNavbarButtonInput");
    const navbarBorderInput = scope.getElementById("customThemeNavbarBorderInput");
    const stickyNavbarInput = scope.getElementById("customThemeStickyNavbarInput");
    const footerFollowGlobalInput = scope.getElementById("customThemeFooterFollowGlobalInput");
    const footerBlurEnabledInput = scope.getElementById("customThemeFooterBlurEnabledInput");
    const footerBlurStrengthSlider = scope.getElementById("customThemeFooterBlurStrengthSlider");
    const footerBlurStrengthValue = scope.getElementById("customThemeFooterBlurStrengthValue");
    const footerTintPowerSlider = scope.getElementById("customThemeFooterTintPowerSlider");
    const footerTintPowerValue = scope.getElementById("customThemeFooterTintPowerValue");
    const footerBackgroundInput = scope.getElementById("customThemeFooterBackgroundInput");
    const footerBorderInput = scope.getElementById("customThemeFooterBorderInput");
    const footerGlowInput = scope.getElementById("customThemeFooterGlowInput");
    const footerTextInput = scope.getElementById("customThemeFooterTextInput");
    const footerMutedInput = scope.getElementById("customThemeFooterMutedInput");
    const cardActionTintPowerSlider = scope.getElementById("customThemeCardActionTintPowerSlider");
    const cardActionTintPowerValue = scope.getElementById("customThemeCardActionTintPowerValue");
    const cardActionBackgroundInput = scope.getElementById("customThemeCardActionBackgroundInput");
    const cardActionTextInput = scope.getElementById("customThemeCardActionTextInput");
    const cardSponsorTintPowerSlider = scope.getElementById("customThemeCardSponsorTintPowerSlider");
    const cardSponsorTintPowerValue = scope.getElementById("customThemeCardSponsorTintPowerValue");
    const cardSponsorBackgroundInput = scope.getElementById("customThemeCardSponsorBackgroundInput");
    const cardSponsorTextInput = scope.getElementById("customThemeCardSponsorTextInput");
    const featuredFollowGlobalInput = scope.getElementById("customThemeFeaturedFollowGlobalInput");
    const featuredBlurEnabledInput = scope.getElementById("customThemeFeaturedBlurEnabledInput");
    const featuredBlurStrengthSlider = scope.getElementById("customThemeFeaturedBlurStrengthSlider");
    const featuredBlurStrengthValue = scope.getElementById("customThemeFeaturedBlurStrengthValue");
    const featuredTintPowerSlider = scope.getElementById("customThemeFeaturedTintPowerSlider");
    const featuredTintPowerValue = scope.getElementById("customThemeFeaturedTintPowerValue");
    const featuredBackgroundInput = scope.getElementById("customThemeFeaturedBackgroundInput");
    const featuredBorderInput = scope.getElementById("customThemeFeaturedBorderInput");
    const featuredHeaderBorderInput = scope.getElementById("customThemeFeaturedHeaderBorderInput");
    const featuredAccentInput = scope.getElementById("customThemeFeaturedAccentInput");
    const featuredTitleInput = scope.getElementById("customThemeFeaturedTitleInput");
    const featuredActionInput = scope.getElementById("customThemeFeaturedActionInput");
    const featuredImageBackgroundInput = scope.getElementById("customThemeFeaturedImageBackgroundInput");
    const infoModalFollowGlobalInput = scope.getElementById("customThemeInfoModalFollowGlobalInput");
    const infoModalBlurEnabledInput = scope.getElementById("customThemeInfoModalBlurEnabledInput");
    const infoModalBlurStrengthSlider = scope.getElementById("customThemeInfoModalBlurStrengthSlider");
    const infoModalBlurStrengthValue = scope.getElementById("customThemeInfoModalBlurStrengthValue");
    const infoModalTintPowerSlider = scope.getElementById("customThemeInfoModalTintPowerSlider");
    const infoModalTintPowerValue = scope.getElementById("customThemeInfoModalTintPowerValue");
    const infoModalBackgroundInput = scope.getElementById("customThemeInfoModalBackgroundInput");
    const infoModalBorderInput = scope.getElementById("customThemeInfoModalBorderInput");
    const infoModalHeaderInput = scope.getElementById("customThemeInfoModalHeaderInput");
    const fontImportInput = scope.getElementById("customThemeFontImportInput");
    const fontBaseInput = scope.getElementById("customThemeFontBaseInput");
    const fontUiInput = scope.getElementById("customThemeFontUiInput");
    const fontSystemInput = scope.getElementById("customThemeFontSystemInput");
    const fontMonoInput = scope.getElementById("customThemeFontMonoInput");
    const imageBackgroundMediaInput = scope.getElementById("customThemeImageBackgroundMediaInput");
    const featuredOverlayMaskInput = scope.getElementById("customThemeFeaturedOverlayMaskInput");
    const bannerOverlayMaskInput = scope.getElementById("customThemeBannerOverlayMaskInput");
    const headerOverlayMaskInput = scope.getElementById("customThemeHeaderOverlayMaskInput");
    const sponsorOverlayMaskInput = scope.getElementById("customThemeSponsorOverlayMaskInput");
    const updatedInput = scope.getElementById("customThemeUpdatedInput");
    const notUpdatedInput = scope.getElementById("customThemeNotUpdatedInput");
    const mainValue = scope.getElementById("customThemeMainValue");
    const hoverValue = scope.getElementById("customThemeHoverValue");
    const logoValue = scope.getElementById("customThemeLogoValue");
    const backgroundValue = scope.getElementById("customThemeBackgroundValue");
    const textValue = scope.getElementById("customThemeTextValue");
    const navbarBackgroundValue = scope.getElementById("customThemeNavbarBackgroundValue");
    const navbarSearchValue = scope.getElementById("customThemeNavbarSearchValue");
    const navbarButtonValue = scope.getElementById("customThemeNavbarButtonValue");
    const navbarBorderValue = scope.getElementById("customThemeNavbarBorderValue");
    const footerBackgroundValue = scope.getElementById("customThemeFooterBackgroundValue");
    const footerBorderValue = scope.getElementById("customThemeFooterBorderValue");
    const footerGlowValue = scope.getElementById("customThemeFooterGlowValue");
    const footerTextValue = scope.getElementById("customThemeFooterTextValue");
    const footerMutedValue = scope.getElementById("customThemeFooterMutedValue");
    const cardActionBackgroundValue = scope.getElementById("customThemeCardActionBackgroundValue");
    const cardActionTextValue = scope.getElementById("customThemeCardActionTextValue");
    const cardSponsorBackgroundValue = scope.getElementById("customThemeCardSponsorBackgroundValue");
    const cardSponsorTextValue = scope.getElementById("customThemeCardSponsorTextValue");
    const featuredBackgroundValue = scope.getElementById("customThemeFeaturedBackgroundValue");
    const featuredBorderValue = scope.getElementById("customThemeFeaturedBorderValue");
    const featuredHeaderBorderValue = scope.getElementById("customThemeFeaturedHeaderBorderValue");
    const featuredAccentValue = scope.getElementById("customThemeFeaturedAccentValue");
    const featuredTitleValue = scope.getElementById("customThemeFeaturedTitleValue");
    const featuredActionValue = scope.getElementById("customThemeFeaturedActionValue");
    const featuredImageBackgroundValue = scope.getElementById("customThemeFeaturedImageBackgroundValue");
    const infoModalBackgroundValue = scope.getElementById("customThemeInfoModalBackgroundValue");
    const infoModalBorderValue = scope.getElementById("customThemeInfoModalBorderValue");
    const infoModalHeaderValue = scope.getElementById("customThemeInfoModalHeaderValue");
    const updatedValue = scope.getElementById("customThemeUpdatedValue");
    const notUpdatedValue = scope.getElementById("customThemeNotUpdatedValue");
    const hasInfoModalControls =
      Boolean(infoModalFollowGlobalInput) &&
      Boolean(infoModalBlurEnabledInput) &&
      Boolean(infoModalBlurStrengthSlider) &&
      Boolean(infoModalBlurStrengthValue) &&
      Boolean(infoModalTintPowerSlider) &&
      Boolean(infoModalTintPowerValue) &&
      Boolean(infoModalBackgroundInput) &&
      Boolean(infoModalBorderInput) &&
      Boolean(infoModalHeaderInput) &&
      Boolean(infoModalBackgroundValue) &&
      Boolean(infoModalBorderValue) &&
      Boolean(infoModalHeaderValue);

    if (
      !editor ||
      !error ||
      !applyButton ||
      !applyImagesButton ||
      !mainInput ||
      !hoverInput ||
      !logoInput ||
      !backgroundInput ||
      !textInput ||
      !cardFontInput ||
      !navbarBackgroundInput ||
      !navbarSearchInput ||
      !navbarButtonInput ||
      !navbarBorderInput ||
      !stickyNavbarInput ||
      !footerFollowGlobalInput ||
      !footerBlurEnabledInput ||
      !footerBlurStrengthSlider ||
      !footerBlurStrengthValue ||
      !footerTintPowerSlider ||
      !footerTintPowerValue ||
      !footerBackgroundInput ||
      !footerBorderInput ||
      !footerGlowInput ||
      !footerTextInput ||
      !footerMutedInput ||
      !cardActionTintPowerSlider ||
      !cardActionTintPowerValue ||
      !cardActionBackgroundInput ||
      !cardActionTextInput ||
      !cardSponsorTintPowerSlider ||
      !cardSponsorTintPowerValue ||
      !cardSponsorBackgroundInput ||
      !cardSponsorTextInput ||
      !featuredFollowGlobalInput ||
      !featuredBlurEnabledInput ||
      !featuredBlurStrengthSlider ||
      !featuredBlurStrengthValue ||
      !featuredTintPowerSlider ||
      !featuredTintPowerValue ||
      !featuredBackgroundInput ||
      !featuredBorderInput ||
      !featuredHeaderBorderInput ||
      !featuredAccentInput ||
      !featuredTitleInput ||
      !featuredActionInput ||
      !featuredImageBackgroundInput ||
      !fontImportInput ||
      !fontBaseInput ||
      !fontUiInput ||
      !fontSystemInput ||
      !fontMonoInput ||
      !imageBackgroundMediaInput ||
      !featuredOverlayMaskInput ||
      !bannerOverlayMaskInput ||
      !headerOverlayMaskInput ||
      !sponsorOverlayMaskInput ||
      !updatedInput ||
      !notUpdatedInput ||
      !mainValue ||
      !hoverValue ||
      !logoValue ||
      !backgroundValue ||
      !textValue ||
      !navbarBackgroundValue ||
      !navbarSearchValue ||
      !navbarButtonValue ||
      !navbarBorderValue ||
      !footerBackgroundValue ||
      !footerBorderValue ||
      !footerGlowValue ||
      !footerTextValue ||
      !footerMutedValue ||
      !cardActionBackgroundValue ||
      !cardActionTextValue ||
      !cardSponsorBackgroundValue ||
      !cardSponsorTextValue ||
      !featuredBackgroundValue ||
      !featuredBorderValue ||
      !featuredHeaderBorderValue ||
      !featuredAccentValue ||
      !featuredTitleValue ||
      !featuredActionValue ||
      !featuredImageBackgroundValue ||
      !updatedValue ||
      !notUpdatedValue
    ) {
      return;
    }

    if (editor.dataset.customThemeBound === "true") {
      return;
    }

    let suspendThemeEventSync = false;
    let queuedLivePreviewFrame = 0;

    const setError = (message = "") => {
      error.textContent = message;
      error.hidden = !message;
    };

    const syncValueLabels = () => {
      mainValue.textContent = normalizeHex(mainInput.value) || DEFAULT_MAIN_HEX;
      hoverValue.textContent = normalizeHex(hoverInput.value) || DEFAULT_HOVER_HEX;
      logoValue.textContent = normalizeHex(logoInput.value) || DEFAULT_LOGO_HEX;
      backgroundValue.textContent = normalizeHex(backgroundInput.value) || DEFAULT_BACKGROUND_HEX;
      textValue.textContent = normalizeHex(textInput.value) || DEFAULT_TEXT_HEX;
      navbarBackgroundValue.textContent = normalizeHex(navbarBackgroundInput.value) || DEFAULT_NAVBAR_BACKGROUND_HEX;
      navbarSearchValue.textContent = normalizeHex(navbarSearchInput.value) || DEFAULT_NAVBAR_SEARCH_HEX;
      navbarButtonValue.textContent = normalizeHex(navbarButtonInput.value) || DEFAULT_NAVBAR_BUTTON_HEX;
      navbarBorderValue.textContent = normalizeHex(navbarBorderInput.value) || DEFAULT_SITE_BORDER_HEX;
      footerBackgroundValue.textContent = normalizeHex(footerBackgroundInput.value) || DEFAULT_FOOTER_BACKGROUND_HEX;
      footerBorderValue.textContent = normalizeHex(footerBorderInput.value) || DEFAULT_SITE_BORDER_HEX;
      footerGlowValue.textContent = normalizeHex(footerGlowInput.value) || DEFAULT_FOOTER_GLOW_HEX;
      footerTextValue.textContent = normalizeHex(footerTextInput.value) || DEFAULT_FOOTER_TEXT_HEX;
      footerMutedValue.textContent = normalizeHex(footerMutedInput.value) || DEFAULT_FOOTER_MUTED_HEX;
      footerTintPowerValue.textContent = `${clamp(Number.parseInt(footerTintPowerSlider.value, 10) || DEFAULT_FOOTER_TINT_POWER, 0, 100)}%`;
      footerBlurStrengthValue.textContent = `${clamp(Number.parseInt(footerBlurStrengthSlider.value, 10) || DEFAULT_FOOTER_BLUR_STRENGTH, 0, 24)}px`;
      cardActionBackgroundValue.textContent = normalizeHex(cardActionBackgroundInput.value) || DEFAULT_CARD_ACTION_BUTTON_BACKGROUND_HEX;
      cardActionTextValue.textContent = normalizeHex(cardActionTextInput.value) || DEFAULT_CARD_ACTION_BUTTON_TEXT_HEX;
      cardSponsorBackgroundValue.textContent = normalizeHex(cardSponsorBackgroundInput.value) || DEFAULT_CARD_SPONSOR_BUTTON_BACKGROUND_HEX;
      cardSponsorTextValue.textContent = normalizeHex(cardSponsorTextInput.value) || DEFAULT_CARD_SPONSOR_BUTTON_TEXT_HEX;
      cardActionTintPowerValue.textContent = `${clamp(Number.parseInt(cardActionTintPowerSlider.value, 10) || DEFAULT_CARD_ACTION_BUTTON_TINT_POWER, 0, 100)}%`;
      cardSponsorTintPowerValue.textContent = `${clamp(Number.parseInt(cardSponsorTintPowerSlider.value, 10) || DEFAULT_CARD_SPONSOR_BUTTON_TINT_POWER, 0, 100)}%`;
      featuredBackgroundValue.textContent = normalizeHex(featuredBackgroundInput.value) || DEFAULT_FEATURED_BACKGROUND_HEX;
      featuredBorderValue.textContent = normalizeHex(featuredBorderInput.value) || DEFAULT_SITE_BORDER_HEX;
      featuredHeaderBorderValue.textContent = normalizeHex(featuredHeaderBorderInput.value) || DEFAULT_SITE_BORDER_HEX;
      featuredAccentValue.textContent = normalizeHex(featuredAccentInput.value) || DEFAULT_FEATURED_ACCENT_HEX;
      featuredTitleValue.textContent = normalizeHex(featuredTitleInput.value) || DEFAULT_FEATURED_TITLE_HEX;
      featuredActionValue.textContent = normalizeHex(featuredActionInput.value) || DEFAULT_FEATURED_ACTION_HEX;
      featuredImageBackgroundValue.textContent = normalizeHex(featuredImageBackgroundInput.value) || DEFAULT_FEATURED_IMAGE_BACKGROUND_HEX;
      featuredTintPowerValue.textContent = `${clamp(Number.parseInt(featuredTintPowerSlider.value, 10) || DEFAULT_FEATURED_TINT_POWER, 0, 100)}%`;
      featuredBlurStrengthValue.textContent = `${clamp(Number.parseInt(featuredBlurStrengthSlider.value, 10) || DEFAULT_FEATURED_BLUR_STRENGTH, 0, 24)}px`;
      if (hasInfoModalControls) {
        infoModalBackgroundValue.textContent = normalizeHex(infoModalBackgroundInput.value) || DEFAULT_INFO_MODAL_BACKGROUND_HEX;
        infoModalBorderValue.textContent = normalizeHex(infoModalBorderInput.value) || DEFAULT_SITE_BORDER_HEX;
        infoModalHeaderValue.textContent = normalizeHex(infoModalHeaderInput.value) || DEFAULT_INFO_MODAL_HEADER_HEX;
        infoModalTintPowerValue.textContent = `${clamp(Number.parseInt(infoModalTintPowerSlider.value, 10) || DEFAULT_INFO_MODAL_TINT_POWER, 0, 100)}%`;
        infoModalBlurStrengthValue.textContent = `${clamp(Number.parseInt(infoModalBlurStrengthSlider.value, 10) || DEFAULT_INFO_MODAL_BLUR_STRENGTH, 0, 24)}px`;
      }
      updatedValue.textContent = normalizeHex(updatedInput.value) || DEFAULT_MAIN_HEX;
      notUpdatedValue.textContent = normalizeHex(notUpdatedInput.value) || DEFAULT_NOT_UPDATED_HEX;
    };

    const syncFooterSurfaceUiState = () => {
      const isFollowingGlobal = footerFollowGlobalInput.checked;
      const blurEnabled = footerBlurEnabledInput.checked && !isFollowingGlobal;

      footerBlurEnabledInput.disabled = isFollowingGlobal;
      footerBlurStrengthSlider.disabled = !blurEnabled;
      footerTintPowerSlider.disabled = isFollowingGlobal;
      footerBackgroundInput.disabled = isFollowingGlobal;
      footerBorderInput.disabled = isFollowingGlobal;
    };

    const syncFeaturedSurfaceUiState = () => {
      const isFollowingGlobal = featuredFollowGlobalInput.checked;
      const blurEnabled = featuredBlurEnabledInput.checked && !isFollowingGlobal;

      featuredBlurEnabledInput.disabled = isFollowingGlobal;
      featuredBlurStrengthSlider.disabled = !blurEnabled;
      featuredTintPowerSlider.disabled = isFollowingGlobal;
      featuredBackgroundInput.disabled = isFollowingGlobal;
      featuredBorderInput.disabled = isFollowingGlobal;
    };

    const syncInfoModalSurfaceUiState = () => {
      if (!hasInfoModalControls) return;
      const isFollowingGlobal = infoModalFollowGlobalInput.checked;
      const blurEnabled = infoModalBlurEnabledInput.checked && !isFollowingGlobal;

      infoModalBlurEnabledInput.disabled = isFollowingGlobal;
      infoModalBlurStrengthSlider.disabled = !blurEnabled;
      infoModalTintPowerSlider.disabled = isFollowingGlobal;
      infoModalBackgroundInput.disabled = isFollowingGlobal;
      infoModalBorderInput.disabled = isFollowingGlobal;
    };

    const syncInputsFromTheme = () => {
      const colors = readCurrentThemeColors();
      const fonts = readCurrentThemeFonts();
      const images = readCurrentThemeImages();
      const layout = readCurrentThemeLayout();
      const navbar = readCurrentThemeNavbar();
      const footer = readCurrentThemeFooter();
      const cardButtons = readCurrentThemeCardButtons();
      const featured = readCurrentThemeFeatured();
      const infoModal = readCurrentThemeInfoModal();
      mainInput.value = colors.main;
      hoverInput.value = colors.hover;
      logoInput.value = colors.logo;
      backgroundInput.value = colors.background;
      textInput.value = colors.text;
      navbarBackgroundInput.value = navbar.background;
      navbarSearchInput.value = navbar.search;
      navbarButtonInput.value = navbar.button;
      navbarBorderInput.value = navbar.border;
      stickyNavbarInput.checked = layout.stickyNavbar;
      footerFollowGlobalInput.checked = footer.followGlobalSurface;
      footerBlurEnabledInput.checked = footer.blurEnabled;
      footerBlurStrengthSlider.value = String(footer.blurStrength);
      footerTintPowerSlider.value = String(footer.tintPower);
      footerBackgroundInput.value = footer.tintColor;
      footerBorderInput.value = footer.border;
      footerGlowInput.value = footer.glow;
      footerTextInput.value = footer.text;
      footerMutedInput.value = footer.muted;
      cardActionTintPowerSlider.value = String(cardButtons.actionTintPower);
      cardActionBackgroundInput.value = cardButtons.actionTintColor;
      cardActionTextInput.value = cardButtons.actionText;
      cardSponsorTintPowerSlider.value = String(cardButtons.sponsorTintPower);
      cardSponsorBackgroundInput.value = cardButtons.sponsorTintColor;
      cardSponsorTextInput.value = cardButtons.sponsorText;
      featuredFollowGlobalInput.checked = featured.followGlobalSurface;
      featuredBlurEnabledInput.checked = featured.blurEnabled;
      featuredBlurStrengthSlider.value = String(featured.blurStrength);
      featuredTintPowerSlider.value = String(featured.tintPower);
      featuredBackgroundInput.value = featured.tintColor;
      featuredBorderInput.value = featured.border;
      featuredHeaderBorderInput.value = featured.headerBorder;
      featuredAccentInput.value = featured.accent;
      featuredTitleInput.value = featured.title;
      featuredActionInput.value = featured.action;
      featuredImageBackgroundInput.value = featured.imageBackground;
      if (hasInfoModalControls) {
        infoModalFollowGlobalInput.checked = infoModal.followGlobalSurface;
        infoModalBlurEnabledInput.checked = infoModal.blurEnabled;
        infoModalBlurStrengthSlider.value = String(infoModal.blurStrength);
        infoModalTintPowerSlider.value = String(infoModal.tintPower);
        infoModalBackgroundInput.value = infoModal.tintColor;
        infoModalBorderInput.value = infoModal.border;
        infoModalHeaderInput.value = infoModal.header;
      }
      fontImportInput.value = fonts.fontImportUrl;
      fontBaseInput.value = fonts.base;
      fontUiInput.value = fonts.ui;
      fontSystemInput.value = fonts.system;
      fontMonoInput.value = fonts.mono;
      cardFontInput.value = fonts.card;
      imageBackgroundMediaInput.value = images.backgroundMedia;
      featuredOverlayMaskInput.value = images.featuredOverlayMask;
      bannerOverlayMaskInput.value = images.bannerOverlayMask;
      headerOverlayMaskInput.value = images.headerOverlayMask;
      sponsorOverlayMaskInput.value = images.sponsorOverlayMask;
      updatedInput.value = colors.updated;
      notUpdatedInput.value = colors.notUpdated;
      syncValueLabels();
      syncFooterSurfaceUiState();
      syncFeaturedSurfaceUiState();
      syncInfoModalSurfaceUiState();
      setError("");
    };

    const applyColors = ({
      includeFontInputs = true,
      includeLayoutInput = true,
      includeCardFontInput = true,
      includeImageInputs = false,
    } = {}) => {
      const currentTheme = readCurrentThemeColors();
      const currentFonts = readCurrentThemeFonts();
      const currentImages = readCurrentThemeImages();
      const currentLayout = readCurrentThemeLayout();
      const currentNavbar = readCurrentThemeNavbar();
      const currentFooter = readCurrentThemeFooter();
      const currentCardButtons = readCurrentThemeCardButtons();
      const currentFeatured = readCurrentThemeFeatured();
      const currentInfoModal = readCurrentThemeInfoModal();
      const colors = {
        main: normalizeHex(mainInput.value) || DEFAULT_MAIN_HEX,
        hover: normalizeHex(hoverInput.value) || DEFAULT_HOVER_HEX,
        logo: normalizeHex(logoInput.value) || DEFAULT_LOGO_HEX,
        background: normalizeHex(backgroundInput.value) || DEFAULT_BACKGROUND_HEX,
        text: normalizeHex(textInput.value) || DEFAULT_TEXT_HEX,
        updated: normalizeHex(updatedInput.value) || DEFAULT_MAIN_HEX,
        logoOffset: currentTheme.logoOffset,
        gradientEnabled: currentTheme.gradientEnabled,
        notUpdated: normalizeHex(notUpdatedInput.value) || DEFAULT_NOT_UPDATED_HEX,
      };
      const navbar = {
        background: normalizeHex(navbarBackgroundInput.value) || DEFAULT_NAVBAR_BACKGROUND_HEX,
        search: normalizeHex(navbarSearchInput.value) || DEFAULT_NAVBAR_SEARCH_HEX,
        button: normalizeHex(navbarButtonInput.value) || DEFAULT_NAVBAR_BUTTON_HEX,
        border: normalizeHex(navbarBorderInput.value) || DEFAULT_SITE_BORDER_HEX,
      };
      const footer = {
        background: normalizeHex(footerBackgroundInput.value) || DEFAULT_FOOTER_BACKGROUND_HEX,
        border: normalizeHex(footerBorderInput.value) || DEFAULT_SITE_BORDER_HEX,
        glow: normalizeHex(footerGlowInput.value) || DEFAULT_FOOTER_GLOW_HEX,
        text: normalizeHex(footerTextInput.value) || DEFAULT_FOOTER_TEXT_HEX,
        muted: normalizeHex(footerMutedInput.value) || DEFAULT_FOOTER_MUTED_HEX,
        tintColor: normalizeHex(footerBackgroundInput.value) || DEFAULT_FOOTER_BACKGROUND_HEX,
        tintPower: clamp(Number.parseInt(footerTintPowerSlider.value, 10) || DEFAULT_FOOTER_TINT_POWER, 0, 100),
        blurEnabled: footerBlurEnabledInput.checked,
        blurStrength: clamp(Number.parseInt(footerBlurStrengthSlider.value, 10) || DEFAULT_FOOTER_BLUR_STRENGTH, 0, 24),
        followGlobalSurface: footerFollowGlobalInput.checked,
      };
      const cardButtons = {
        actionTintColor: normalizeHex(cardActionBackgroundInput.value) || DEFAULT_CARD_ACTION_BUTTON_BACKGROUND_HEX,
        actionTintPower: clamp(Number.parseInt(cardActionTintPowerSlider.value, 10) || DEFAULT_CARD_ACTION_BUTTON_TINT_POWER, 0, 100),
        actionText: normalizeHex(cardActionTextInput.value) || DEFAULT_CARD_ACTION_BUTTON_TEXT_HEX,
        sponsorTintColor: normalizeHex(cardSponsorBackgroundInput.value) || DEFAULT_CARD_SPONSOR_BUTTON_BACKGROUND_HEX,
        sponsorTintPower: clamp(Number.parseInt(cardSponsorTintPowerSlider.value, 10) || DEFAULT_CARD_SPONSOR_BUTTON_TINT_POWER, 0, 100),
        sponsorText: normalizeHex(cardSponsorTextInput.value) || DEFAULT_CARD_SPONSOR_BUTTON_TEXT_HEX,
      };
      const featured = {
        tintColor: normalizeHex(featuredBackgroundInput.value) || DEFAULT_FEATURED_BACKGROUND_HEX,
        tintPower: clamp(Number.parseInt(featuredTintPowerSlider.value, 10) || DEFAULT_FEATURED_TINT_POWER, 0, 100),
        blurEnabled: featuredBlurEnabledInput.checked,
        blurStrength: clamp(Number.parseInt(featuredBlurStrengthSlider.value, 10) || DEFAULT_FEATURED_BLUR_STRENGTH, 0, 24),
        followGlobalSurface: featuredFollowGlobalInput.checked,
        border: normalizeHex(featuredBorderInput.value) || DEFAULT_SITE_BORDER_HEX,
        headerBorder: normalizeHex(featuredHeaderBorderInput.value) || DEFAULT_SITE_BORDER_HEX,
        accent: normalizeHex(featuredAccentInput.value) || DEFAULT_FEATURED_ACCENT_HEX,
        title: normalizeHex(featuredTitleInput.value) || DEFAULT_FEATURED_TITLE_HEX,
        action: normalizeHex(featuredActionInput.value) || DEFAULT_FEATURED_ACTION_HEX,
        imageBackground: normalizeHex(featuredImageBackgroundInput.value) || DEFAULT_FEATURED_IMAGE_BACKGROUND_HEX,
      };
      const infoModal = hasInfoModalControls
        ? {
            border: normalizeHex(infoModalBorderInput.value) || DEFAULT_SITE_BORDER_HEX,
            header: normalizeHex(infoModalHeaderInput.value) || DEFAULT_INFO_MODAL_HEADER_HEX,
            tintColor: normalizeHex(infoModalBackgroundInput.value) || DEFAULT_INFO_MODAL_BACKGROUND_HEX,
            tintPower: clamp(Number.parseInt(infoModalTintPowerSlider.value, 10) || DEFAULT_INFO_MODAL_TINT_POWER, 0, 100),
            blurEnabled: infoModalBlurEnabledInput.checked,
            blurStrength: clamp(Number.parseInt(infoModalBlurStrengthSlider.value, 10) || DEFAULT_INFO_MODAL_BLUR_STRENGTH, 0, 24),
            followGlobalSurface: infoModalFollowGlobalInput.checked,
          }
        : currentInfoModal;

      const baseCssText = window.buildCustomSiteThemeCssText?.(colors.main);
      if (!baseCssText) {
        setError("Could not apply the main theme color.");
        return;
      }
      const fontBase = includeFontInputs
        ? fontBaseInput.value.trim() || DEFAULT_BASE_FONT_FAMILY
        : currentFonts.base || DEFAULT_BASE_FONT_FAMILY;
      const fontUi = includeFontInputs
        ? fontUiInput.value.trim() || fontBase || DEFAULT_UI_FONT_FAMILY
        : currentFonts.ui || fontBase || DEFAULT_UI_FONT_FAMILY;
      const fontSystem = includeFontInputs
        ? fontSystemInput.value.trim() || DEFAULT_SYSTEM_FONT_FAMILY
        : currentFonts.system || DEFAULT_SYSTEM_FONT_FAMILY;
      const fontMono = includeFontInputs
        ? fontMonoInput.value.trim() || DEFAULT_MONO_FONT_FAMILY
        : currentFonts.mono || DEFAULT_MONO_FONT_FAMILY;
      const fontImportUrl = includeFontInputs
        ? normalizeFontImportUrl(fontImportInput.value)
        : currentFonts.fontImportUrl;
      const images = includeImageInputs
        ? {
            backgroundMedia: normalizeThemeAssetUrl(imageBackgroundMediaInput.value),
            featuredOverlayMask: normalizeThemeAssetUrl(featuredOverlayMaskInput.value),
            bannerOverlayMask: normalizeThemeAssetUrl(bannerOverlayMaskInput.value),
            headerOverlayMask: normalizeThemeAssetUrl(headerOverlayMaskInput.value),
            sponsorOverlayMask: normalizeThemeAssetUrl(sponsorOverlayMaskInput.value),
          }
        : currentImages;
      const cardFont = includeCardFontInput
        ? cardFontInput.value.trim() || fontBase || DEFAULT_CARD_FONT_FAMILY
        : currentFonts.card || currentFonts.base || DEFAULT_CARD_FONT_FAMILY;
      const stickyNavbar = includeLayoutInput
        ? stickyNavbarInput.checked
        : currentLayout.stickyNavbar;
      const footerSolidAlpha = Math.max(0, footer.tintPower / 100 - 0.02);
      const footerBlurAlpha = (footer.tintPower / 100) * FOOTER_BLUR_TINT_SCALE;
      const footerBackgroundValue = footer.followGlobalSurface
        ? "var(--card-surface-background)"
        : buildColorWithAlpha(
            footer.tintColor,
            footer.blurEnabled ? footerBlurAlpha : footerSolidAlpha
          );
      const footerBorderValue = footer.followGlobalSurface
        ? "var(--exploit-card-chrome)"
        : footer.border;
      const footerBlurValue = footer.followGlobalSurface
        ? "var(--card-surface-backdrop-blur)"
        : footer.blurEnabled
          ? `${footer.blurStrength}px`
          : "0px";
      const cardActionBackgroundValue = buildColorWithAlpha(
        cardButtons.actionTintColor,
        cardButtons.actionTintPower / 100
      );
      const cardActionHoverBackgroundValue = buildColorWithAlpha(
        cardButtons.actionTintColor,
        Math.min(1, (cardButtons.actionTintPower + CARD_BUTTON_HOVER_POWER_BOOST) / 100)
      );
      const cardSponsorBackgroundValue = buildColorWithAlpha(
        cardButtons.sponsorTintColor,
        cardButtons.sponsorTintPower / 100
      );
      const cardSponsorHoverBackgroundValue = buildColorWithAlpha(
        cardButtons.sponsorTintColor,
        Math.min(1, (cardButtons.sponsorTintPower + CARD_BUTTON_HOVER_POWER_BOOST) / 100)
      );
      const featuredSolidAlpha = Math.max(0, featured.tintPower / 100 - 0.02);
      const featuredBlurAlpha = (featured.tintPower / 100) * FEATURED_BLUR_TINT_SCALE;
      const featuredBackgroundValue = featured.followGlobalSurface
        ? "var(--card-surface-background)"
        : buildColorWithAlpha(
            featured.tintColor,
            featured.blurEnabled ? featuredBlurAlpha : featuredSolidAlpha
          );
      const featuredBorderValue = featured.followGlobalSurface
        ? "var(--exploit-card-chrome)"
        : featured.border;
      const featuredHeaderBorderValue = featured.followGlobalSurface
        ? "var(--exploit-card-chrome)"
        : featured.headerBorder;
      const featuredBlurValue = featured.followGlobalSurface
        ? "var(--card-surface-backdrop-blur)"
        : featured.blurEnabled
          ? `${featured.blurStrength}px`
          : "0px";
      const infoModalSolidAlpha = infoModal.tintPower / 100;
      const infoModalBlurAlpha = (infoModal.tintPower / 100) * INFO_MODAL_BLUR_TINT_SCALE;
      const infoModalBackgroundValue = infoModal.followGlobalSurface
        ? "var(--card-surface-background)"
        : buildColorWithAlpha(
            infoModal.tintColor,
            infoModal.blurEnabled ? infoModalBlurAlpha : infoModalSolidAlpha
          );
      const infoModalBorderValue = infoModal.followGlobalSurface
        ? "var(--exploit-card-chrome)"
        : infoModal.border;
      const infoModalBlurValue = infoModal.followGlobalSurface
        ? "var(--card-surface-backdrop-blur)"
        : infoModal.blurEnabled
          ? `${infoModal.blurStrength}px`
          : "0px";
      const mergedCssText = mergeThemeCssText(baseCssText, {
        "--prim-hvr": colors.hover,
        "--prim-grd": `linear-gradient(to right, ${colors.main}, ${colors.hover})`,
        "--bg": colors.background,
        "--fg": colors.text,
        "--navbar-position": stickyNavbar ? "sticky" : "static",
        "--navbar-background": buildColorWithAlpha(navbar.background, currentNavbar.backgroundAlpha),
        "--navbar-mobile-panel-background": buildColorWithAlpha(navbar.background, currentNavbar.mobilePanelAlpha),
        "--navbar-search-background": buildColorWithAlpha(navbar.search, currentNavbar.searchAlpha),
        "--navbar-search-background-focus": buildColorWithAlpha(
          navbar.search,
          Math.max(currentNavbar.searchAlpha, 0.5)
        ),
        "--navbar-button-background": buildColorWithAlpha(navbar.button, currentNavbar.buttonAlpha),
        "--navbar-scrolled-border": navbar.border,
        "--footer-follow-global-surface": footer.followGlobalSurface ? "1" : "0",
        "--footer-surface-tint-color": footer.tintColor,
        "--footer-surface-tint-power": String(footer.tintPower),
        "--footer-surface-outline-color": footer.border,
        "--footer-surface-blur-enabled": footer.blurEnabled ? "1" : "0",
        "--footer-surface-blur-strength": String(footer.blurStrength),
        "--footer-bg": footerBackgroundValue,
        "--footer-border": footerBorderValue,
        "--footer-backdrop-blur": footerBlurValue,
        "--footer-text": buildColorWithAlpha(footer.text, currentFooter.textAlpha),
        "--footer-muted": buildColorWithAlpha(footer.muted, currentFooter.mutedAlpha),
        "--card-action-button-tint-color": cardButtons.actionTintColor,
        "--card-action-button-tint-power": String(cardButtons.actionTintPower),
        "--card-action-button-background": cardActionBackgroundValue,
        "--card-action-button-background-hover": cardActionHoverBackgroundValue,
        "--card-action-button-text": buildColorWithAlpha(cardButtons.actionText, currentCardButtons.actionTextAlpha),
        "--card-sponsor-button-tint-color": cardButtons.sponsorTintColor,
        "--card-sponsor-button-tint-power": String(cardButtons.sponsorTintPower),
        "--card-sponsor-button-background": cardSponsorBackgroundValue,
        "--card-sponsor-button-background-hover": cardSponsorHoverBackgroundValue,
        "--card-sponsor-button-text": buildColorWithAlpha(cardButtons.sponsorText, currentCardButtons.sponsorTextAlpha),
        "--featured-follow-global-surface": featured.followGlobalSurface ? "1" : "0",
        "--featured-surface-tint-color": featured.tintColor,
        "--featured-surface-tint-power": String(featured.tintPower),
        "--featured-surface-outline-color": featuredBorderValue,
        "--featured-surface-blur-enabled": featured.blurEnabled ? "1" : "0",
        "--featured-surface-blur-strength": String(featured.blurStrength),
        "--featured-surface-background": featuredBackgroundValue,
        "--featured-surface-backdrop-blur": featuredBlurValue,
        "--featured-card-border": featuredBorderValue,
        "--featured-card-header-border": featuredHeaderBorderValue,
        "--featured-card-accent-fill": featured.accent,
        "--featured-title-color": buildColorWithAlpha(featured.title, currentFeatured.titleAlpha),
        "--featured-action-color": buildColorWithAlpha(featured.action, currentFeatured.actionAlpha),
        "--featured-action-hover-color": featured.action,
        "--featured-image-background": buildColorWithAlpha(
          featured.imageBackground,
          currentFeatured.imageBackgroundAlpha
        ),
        "--info-modal-follow-global-surface": infoModal.followGlobalSurface ? "1" : "0",
        "--info-modal-surface-tint-color": infoModal.tintColor,
        "--info-modal-surface-tint-power": String(infoModal.tintPower),
        "--info-modal-surface-outline-color": infoModal.border,
        "--info-modal-surface-blur-enabled": infoModal.blurEnabled ? "1" : "0",
        "--info-modal-surface-blur-strength": String(infoModal.blurStrength),
        "--info-modal-background": infoModalBackgroundValue,
        "--info-modal-backdrop-blur": infoModalBlurValue,
        "--theme-font-import-url": fontImportUrl || "none",
        "--theme-background-media-url": buildCssStringToken(images.backgroundMedia, "none"),
        "--featured-overlay-mask": buildCssUrlToken(images.featuredOverlayMask, "none"),
        "--banner-overlay-mask": buildCssUrlToken(images.bannerOverlayMask, "none"),
        "--header-overlay-mask": buildCssUrlToken(images.headerOverlayMask, "none"),
        "--sponsor-overlay-mask": buildCssUrlToken(images.sponsorOverlayMask, "none"),
        "--font-family-base": fontBase,
        "--font-family-ui": fontUi,
        "--font-family-system": fontSystem,
        "--font-family-mono": fontMono,
        "--card-font-family": cardFont,
        ...buildFooterGlowVars(footer.glow),
        ...buildInfoModalHeaderVars(infoModal.header),
        ...buildStatusThemeVars(colors),
        ...buildBrandOverlayVars({
          logo: colors.logo,
          main: colors.main,
          hover: colors.hover,
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

    const withSuspendedThemeEventSync = (callback) => {
      suspendThemeEventSync = true;
      try {
        callback();
      } finally {
        suspendThemeEventSync = false;
      }
    };

    const queueLivePreview = (options = {}) => {
      if (queuedLivePreviewFrame) {
        window.cancelAnimationFrame(queuedLivePreviewFrame);
      }

      queuedLivePreviewFrame = window.requestAnimationFrame(() => {
        queuedLivePreviewFrame = 0;
        withSuspendedThemeEventSync(() => {
          applyColors(options);
        });
      });
    };

    [
      mainInput,
      hoverInput,
      logoInput,
      backgroundInput,
      textInput,
      navbarBackgroundInput,
      navbarSearchInput,
      navbarButtonInput,
      navbarBorderInput,
      footerBackgroundInput,
      footerBorderInput,
      footerGlowInput,
      footerTextInput,
      footerMutedInput,
      cardActionBackgroundInput,
      cardActionTextInput,
      cardSponsorBackgroundInput,
      cardSponsorTextInput,
      featuredBackgroundInput,
      featuredBorderInput,
      featuredHeaderBorderInput,
      featuredAccentInput,
      featuredTitleInput,
      featuredActionInput,
      featuredImageBackgroundInput,
      updatedInput,
      notUpdatedInput,
    ].forEach((input) => {
      input.addEventListener("input", () => {
        syncValueLabels();
        setError("");
        queueLivePreview({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: true,
          includeImageInputs: false,
        });
      });
    });

    if (hasInfoModalControls) {
      [
        infoModalBackgroundInput,
        infoModalBorderInput,
        infoModalHeaderInput,
      ].forEach((input) => {
        input.addEventListener("input", () => {
          syncValueLabels();
          setError("");
          queueLivePreview({
            includeFontInputs: false,
            includeLayoutInput: false,
            includeCardFontInput: true,
            includeImageInputs: false,
          });
        });
      });
    }

    cardFontInput.addEventListener("input", () => {
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    stickyNavbarInput.addEventListener("change", () => {
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: true,
        includeImageInputs: false,
      });
    });

    footerBlurEnabledInput.addEventListener("change", () => {
      syncFooterSurfaceUiState();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    footerBlurStrengthSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    footerTintPowerSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    footerFollowGlobalInput.addEventListener("change", () => {
      syncFooterSurfaceUiState();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    cardActionTintPowerSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    cardSponsorTintPowerSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    featuredBlurEnabledInput.addEventListener("change", () => {
      syncFeaturedSurfaceUiState();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    featuredBlurStrengthSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    featuredTintPowerSlider.addEventListener("input", () => {
      syncValueLabels();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    featuredFollowGlobalInput.addEventListener("change", () => {
      syncFeaturedSurfaceUiState();
      setError("");
      queueLivePreview({
        includeFontInputs: false,
        includeLayoutInput: false,
        includeCardFontInput: true,
        includeImageInputs: false,
      });
    });

    if (hasInfoModalControls) {
      infoModalBlurEnabledInput.addEventListener("change", () => {
        syncInfoModalSurfaceUiState();
        setError("");
        queueLivePreview({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: true,
          includeImageInputs: false,
        });
      });

      infoModalBlurStrengthSlider.addEventListener("input", () => {
        syncValueLabels();
        setError("");
        queueLivePreview({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: true,
          includeImageInputs: false,
        });
      });

      infoModalTintPowerSlider.addEventListener("input", () => {
        syncValueLabels();
        setError("");
        queueLivePreview({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: true,
          includeImageInputs: false,
        });
      });

      infoModalFollowGlobalInput.addEventListener("change", () => {
        syncInfoModalSurfaceUiState();
        setError("");
        queueLivePreview({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: true,
          includeImageInputs: false,
        });
      });
    }

    [
      fontImportInput,
      fontBaseInput,
      fontUiInput,
      fontSystemInput,
      fontMonoInput,
      imageBackgroundMediaInput,
      featuredOverlayMaskInput,
      bannerOverlayMaskInput,
      headerOverlayMaskInput,
      sponsorOverlayMaskInput,
    ].forEach((input) => {
      input.addEventListener("input", () => {
        setError("");
      });
    });

    applyButton.addEventListener("click", (event) => {
      event.preventDefault();
      withSuspendedThemeEventSync(() => {
        applyColors({ includeImageInputs: false });
      });
    });

    applyImagesButton.addEventListener("click", (event) => {
      event.preventDefault();
      withSuspendedThemeEventSync(() => {
        applyColors({
          includeFontInputs: false,
          includeLayoutInput: false,
          includeCardFontInput: false,
          includeImageInputs: true,
        });
      });
    });

    window.addEventListener(THEME_CHANGE_EVENT, () => {
      if (suspendThemeEventSync) {
        return;
      }

      syncInputsFromTheme();
    });

    editor.dataset.customThemeBound = "true";
    syncInputsFromTheme();
  };

  window.initCustomThemeEditor = initCustomThemeEditor;
  window.initCustomThemePicker = initCustomThemeEditor;
})();
