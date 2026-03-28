(() => {
  const onDomReady = (callback) => {
    if (typeof callback !== "function") return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  const loadHtmlPartial = async (mount, path) => {
    if (!mount) {
      throw new Error(`Cannot load partial without a mount node (${path})`);
    }

    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load partial (${path}): ${response.status}`);
    }

    mount.innerHTML = await response.text();
    return mount;
  };

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

  existingConfig.robloxCards = {
    dataRoot: "/public/data/roblox",
    statusApiUrl: "https://api.voxlis.net/api/endpoints",
    suncApiUrl: "https://api.voxlis.net/api/sunc",
    warningModalEnabled: false,
    cardNameOverrides: {
      arceusx: "Arceus X",
      sirhurt: "SirHurt",
      vegax: "Vega X",
      "yub-x": "YuB-x",
    },
    platformOrder: ["windows", "macos", "android", "ios"],
    platformLabels: {
      windows: "Windows",
      macos: "macOS",
      android: "Android",
      ios: "iOS",
    },
    platformIcons: {
      windows: "fab fa-windows",
      macos: "fab fa-apple",
      android: "fab fa-android",
      ios: "fab fa-apple",
    },
    tagMetadata: {
      decompiler: {
        icon: "fas fa-code",
        assetIcon: "tag-decompiler.svg",
        label: "Decompiler",
        message: "This product includes decompiler functionality.",
      },
      kernel: {
        icon: "fas fa-microchip",
        assetIcon: "tag-kernel.svg",
        iconToneClass: "ph-kernel-ico",
        label: "Kernel",
        message: "This product runs on kernel-level (Expect BSOD)",
      },
      usermode: {
        icon: "fas fa-user",
        assetIcon: "tag-usermode.svg",
        iconToneClass: "ph-usermode-ico",
        label: "Usermode",
        message: "This product runs through usermode components instead of only kernel-level drivers.",
      },
      "multi-instance": {
        icon: "fas fa-layer-group",
        assetIcon: "tag-multi-instance.svg",
        label: "Multi-instance",
        message: "This product supports running multiple instances at once.",
      },
      freemium: {
        icon: "fas fa-key",
        assetIcon: "tag-freemium.svg",
        label: "Freemium",
        message: "This product is free to use, but it relies on a key system.",
      },
      insecure: {
        icon: "fas fa-triangle-exclamation",
        assetIcon: "tag-insecure.svg",
        iconToneClass: "ph-insecure-ico",
        label: "Insecure",
        message: "This product is only shown in insecure mode because it is not recommended or not yet verified.",
      },
    },
    filterableTags: ["multi-instance", "decompiler", "kernel", "usermode"],
    showOnlyFilterOptions: [
      {
        id: "filterVerified",
        field: "verified",
        label: "Verified",
        iconClass: "fas fa-circle-check",
        iconToneClass: "ph-good-ico",
        toneClass: "is-verified",
      },
      {
        id: "filterTrending",
        field: "trending",
        label: "Trending",
        iconClass: "fas fa-arrow-trend-up",
        toneClass: "is-trending",
      },
      {
        id: "filterWarning",
        field: "warning",
        label: "Warning",
        iconClass: "fas fa-triangle-exclamation",
        iconToneClass: "ph-warn-ico",
        toneClass: "is-warning",
      },
    ],
    typeLabels: {
      internal: "Executor",
      external: "Cheat Menu",
    },
    defaultFilters: {
      search: "",
      sort: "random",
      platforms: [],
      price: "all",
      key: "all",
      type: "all",
      tags: [],
      verified: false,
      trending: false,
      warning: false,
      updatedState: "all",
      showInsecure: false,
    },
  };

  existingConfig.promo = {
    titlePrefix: "Join our ",
    titleAccent: "Discord",
    titleSuffix: " Community!",
    description: "Giveaways, automatic notification for software updates, and more!",
    actions: [
      {
        href: "https://discord.gg/Ynxbp2YPus",
        label: "Discord",
        buttonClassName: "promo-action-button-discord",
        iconClass: "fab fa-discord",
      },
      {
        href: "https://www.youtube.com/channel/UCRDj_epbbwvpLTCFDmeL7Zg",
        label: "YouTube",
        buttonClassName: "promo-action-button-youtube",
        iconClass: "fab fa-youtube",
      },
      {
        href: "https://www.trustpilot.com/review/voxlis.net",
        label: "Trustpilot",
        buttonClassName: "promo-action-button-trustpilot",
        iconClass: "fas fa-star",
      },
    ],
  };

  existingConfig.featured = {
    ariaLabel: "Featured sponsored card",
    title: "Featured",
    hideButtonLabel: "Hide ads",
    href: "https://www.youtube.com/channel/UCRDj_epbbwvpLTCFDmeL7Zg",
    backgroundImageSrc: "/public/assets/featured/background.png",
    backgroundImageAlt: "Advertisement background",
    logoImageSrc: "/public/assets/featured/net-voxlis.png",
    logoImageAlt: "",
  };

  window.VOXLIS_UTILS = Object.freeze({
    onDomReady,
    loadHtmlPartial,
  });
  window.VOXLIS_CONFIG = deepFreeze(existingConfig);
})();
