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
      hideBottomFade: "voxlis-hide-bottom-fade",
      customThemeColor: "voxlis-custom-accent-color",
    },
    ids: {
      default: "blue",
      custom: "custom",
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
    customAccent: {
      defaultHex: "#22c55e",
    },
    groups: [
      { id: "accent", label: "Color Variants" },
    ],
    options: [
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
        id: "custom",
        label: "Custom",
        swatch: "#22C55E",
        group: "accent",
        surfaceBlurEnabled: false,
        surfaceBlurStrength: 12,
        hideFeaturedAds: false,
        supportsCustomColor: true,
      },
    ],
  };

  window.VOXLIS_CONFIG = deepFreeze(existingConfig);
})();
