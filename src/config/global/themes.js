(() => {
  const deepFreeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
      return value;
    }

    Object.getOwnPropertyNames(value).forEach((key) => {
      deepFreeze(value[key]);
    });

    return Object.freeze(value);
  };

  const existingConfig =
    window.VOXLIS_CONFIG && typeof window.VOXLIS_CONFIG === "object"
      ? { ...window.VOXLIS_CONFIG }
      : {};

  existingConfig.themes = {
    storageKeys: {
      theme: "voxlis-theme",
      drawerWidth: "voxlis-theme-drawer-width",
      hideFeaturedAds: "voxlis-hide-featured-ads",
      hidePromo: "voxlis-hide-promo",
      hideToastPopups: "voxlis-hide-toast-popups",
      hideNavbarWarning: "voxlis-hide-navbar-warning",
    },
    ids: {
      default: "blue",
    },
    events: {
      change: "site-theme-change",
    },
    drawer: {
      exitFallbackMs: 260,
      defaultTab: "presets",
      defaultWidth: 384,
      minWidth: 320,
      maxWidth: 720,
      desktopMediaQuery: "(min-width: 769px)",
    },
    outlineBrightness: {
      min: 0,
      max: 64,
      default: 7,
    },
    surfaceBlur: {
      min: 0,
      max: 24,
      default: 12,
      tintScale: 18 / 82,
      footerTintScale: 16 / 82,
    },
    surfaceTint: {
      min: 0,
      max: 100,
      default: 82,
      defaultHex: "#000000",
    },
    backgroundMedia: {
      defaultStatus: "Paste an image or video link to use as the site background.",
    },
    backgroundTint: {
      min: 0,
      max: 100,
      default: 38,
      defaultHex: "#000000",
    },
    kawaiiMobileTint: {
      className: "theme-kawaii-mobile-tint",
      mediaQuery: "(max-width: 980px)",
    },
    groups: [
      { id: "full", label: "Full Themes" },
      { id: "accent", label: "Color Variants" },
    ],
    options: [
      {
        id: "kawaii",
        label: "Kawaii",
        credit: "@voxlis",
        previewFontFamily: "\"DynaPuff\", \"Baloo 2\", \"Open Sans\", sans-serif",
        previewGradient:
          "linear-gradient(90deg, rgba(255, 224, 242, 0.2) 0%, rgba(255, 154, 213, 0.18) 58%, rgba(196, 181, 253, 0.16) 100%)",
        swatch: "#FF9AD5",
        swatchImage:
          "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/1213300/357ca832cca068f4febe5b5ea19cb23d16918896.gif",
        group: "full",
        surfaceBlurEnabled: true,
        surfaceBlurStrength: 10,
        hideFeaturedAds: true,
      },
      {
        id: "blue",
        label: "Legacy",
        previewGradient:
          "linear-gradient(90deg, rgba(96, 165, 250, 0.18) 0%, rgba(59, 130, 246, 0.12) 56%, rgba(37, 99, 235, 0.1) 100%)",
        swatch: "#3B82F6",
        group: "accent",
        surfaceBlurEnabled: false,
        surfaceBlurStrength: 12,
        hideFeaturedAds: false,
      },
      {
        id: "legacy",
        label: "Supremacy",
        credit: "@voxlis",
        previewGradient:
          "linear-gradient(90deg, rgba(248, 113, 113, 0.18) 0%, rgba(239, 68, 68, 0.14) 56%, rgba(220, 38, 38, 0.12) 100%)",
        swatch: "#EF4444",
        swatchImage:
          "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/2139460/ceac3f2dd323201409ff386df51811edefe515bb.gif",
        group: "full",
        surfaceBlurEnabled: false,
        surfaceBlurStrength: 12,
        hideFeaturedAds: false,
      },
      {
        id: "weao",
        label: "weao",
        previewGradient:
          "linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(90, 90, 90, 0.08) 52%, rgba(26, 26, 26, 0.12) 100%)",
        swatch: "#1A1A1A",
        group: "accent",
        surfaceBlurEnabled: false,
        surfaceBlurStrength: 12,
        hideFeaturedAds: false,
      },
      {
        id: "nebula",
        label: "Kawaii",
        credit: "@zynox",
        previewFontFamily: "\"DynaPuff\", \"Open Sans\", sans-serif",
        previewGradient:
          "linear-gradient(90deg, rgba(200, 200, 200, 0.12) 0%, rgba(130, 130, 130, 0.1) 52%, rgba(48, 48, 48, 0.2) 100%)",
        swatch: "#ffffff",
        swatchImage:
          "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/2194790/60472c275e62f3f4ff4d5aa98bc501accd86099f.gif",
        swatchImageScale: 1.08,
        group: "full",
        surfaceBlurEnabled: true,
        surfaceBlurStrength: 10,
        hideFeaturedAds: true,
      },
    ],
  };

  window.VOXLIS_CONFIG = deepFreeze(existingConfig);
})();
