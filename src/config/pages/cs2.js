(() => {
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(String(window.location.hostname || "").toLowerCase());
  const configSources =
    window.VOXLIS_CONFIG_SOURCES && typeof window.VOXLIS_CONFIG_SOURCES === "object"
      ? window.VOXLIS_CONFIG_SOURCES
      : {};

  if (!configSources.catalogs || typeof configSources.catalogs !== "object") {
    configSources.catalogs = {};
  }

  configSources.catalogs.cs2 = {
    key: "cs2",
    routeBasePath: "/cs2.html",
    homePath: "/",
    pageTitle: "CS2",
    theme: {
      force: "blue",
    },
    searchPlaceholder: "Search CS2 cards...",
    dataRoot: "/public/data/cs2",
    statusApiUrl: "",
    suncApiUrl: "",
    warningModalEnabled: true,
    navbarWarning: {
      text: "Buy Prime NFA Accounts for $0.45! Click to view",
      href: "https://key-empire.com/product/counter-strike-2-prime-nfa",
    },
    cardNameOverrides: {
      predatorsystems: "PredatorSystems",
    },
    platformOrder: ["windows"],
    platformLabels: {
      windows: "Windows",
    },
    platformIcons: {
      windows: "fab fa-windows",
    },
    tags: {
      internal: {
        icon: "fas fa-microchip",
        label: "Internal",
        info: "This product uses internal game integration.",
      },
      external: {
        icon: "fas fa-computer-mouse",
        label: "External",
        info: "This product uses an external overlay or tooling flow.",
      },
      kernel: {
        icon: "fas fa-microchip",
        assetIcon: "icons/vectors/tag-kernel.svg",
        iconToneClass: "ph-kernel-ico",
        label: "Kernel",
        info: "This product includes kernel-level components.",
      },
      dma: {
        icon: "fas fa-bolt",
        label: "DMA",
        info: "This product relies on DMA hardware or workflows.",
      },
      insecure: {
        icon: "fas fa-triangle-exclamation",
        assetIcon: "icons/vectors/tag-insecure.svg",
        iconToneClass: "ph-insecure-ico",
        label: "Insecure",
        info: "This product is only shown in insecure mode because it is not recommended or not yet verified.",
      },
    },
    filterableTags: ["internal", "external", "kernel", "dma"],
    showOnlyFilters: ["verified", "trending", "warning"],
    segmentFilters: [
      {
        field: "price",
        label: "Price",
        defaultValue: "all",
        options: [
          { value: "all", label: "All" },
          { value: "free", label: "Free" },
          { value: "paid", label: "Paid" },
        ],
      },
      {
        field: "type",
        label: "Type",
        defaultValue: "all",
        options: [
          { value: "all", label: "All" },
          { value: "external", label: "External" },
          { value: "internal", label: "Internal" },
        ],
      },
    ],
    typeLabels: {
      internal: "Internal",
      external: "External",
    },
    defaultFilters: {
      search: "",
      sort: "random",
      platforms: [],
      price: "all",
      type: "all",
      tags: [],
      verified: false,
      trending: false,
      warning: false,
      showInsecure: false,
    },
    labels: {
      itemPlural: "exploits",
      itemSingular: "exploit",
      sectionAriaLabel: "CS2 exploits",
      summaryAriaLabel: "CS2 catalog summary",
      loadingMessage: "Loading CS2 catalog...",
      emptyLoadMessage: "The CS2 catalog is ready, but no exploits have been added yet.",
      emptyFilteredMessage: "No CS2 exploits match the current filters.",
      statsShowingPrefix: "Showing",
      trackingUnavailable: "No tracking available",
      statusLabels: {
        updated: "Showing",
        notUpdated: "Non updated",
      },
    },
    prompts: {
      filters: {
        title: "Try filters?",
        message: "Want to narrow the CS2 list a bit faster?",
      },
    },
    clickTracking: {
      enabled: true,
      endpointUrl: isLocalPreview
        ? "http://localhost:8000/public_html/data.php"
        : "https://connect.voxlis.net/data",
      trackedActions: ["review", "more", "buy-keyempire", "tag", "website", "close"],
      trackedUiEvents: {
        navbar: [
          "logo-home",
          "desktop-home",
          "desktop-github",
          "desktop-themes",
          "desktop-filter",
          "mobile-quick-search",
          "mobile-quick-github",
          "mobile-quick-themes",
          "mobile-quick-filter",
          "mobile-top-search",
          "mobile-top-filter",
          "mobile-top-menu",
          "mobile-menu-home",
          "mobile-menu-github",
          "mobile-menu-themes",
          "mobile-menu-filter",
        ],
        themes: [
          "drawer-open",
          "drawer-close",
          "preset-select",
          "restore-defaults",
          "hide-featured-ads",
          "hide-promo",
        ],
        filters: ["drawer-open"],
        featured: ["hide-ads", "request"],
        promo: ["discord", "youtube", "trustpilot", "close"],
        footer: ["contact", "policy", "privacy"],
        toasts: [
          "filters-prompt-show",
          "filters-prompt-open",
          "filters-prompt-close",
          "themes-prompt-show",
          "themes-prompt-open",
          "themes-prompt-close",
        ],
      },
      actionLabels: {
        review: "Review",
        more: "More",
        "buy-keyempire": "Buy",
        tag: "Tag",
        website: "Website",
        close: "Close",
      },
    },
    insecureToggle: {
      enabled: true,
      buttonLabelOff: "Enable insecure mode",
      buttonLabelOn: "Insecure mode enabled",
      subtitle: "Insecure mode includes risky or experimental CS2 tools in the catalog results. These stay hidden by default for safety.",
      hintOff: "Insecure mode stays off by default for safety.",
      hintOn: "Insecure mode stays enabled until you turn this off or reset filters.",
    },
  };

  window.VOXLIS_CONFIG_SOURCES = configSources;
})();
