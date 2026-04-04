(() => {
  const configSources =
    window.VOXLIS_CONFIG_SOURCES && typeof window.VOXLIS_CONFIG_SOURCES === "object"
      ? window.VOXLIS_CONFIG_SOURCES
      : {};

  configSources.global = {
    statusLabels: {
      updated: "Updated",
      notUpdated: "Non updated",
    },
    sortOptions: [
      { value: "random", label: "Random" }
    ],
    badges: {
      verified: {
        id: "filterVerified",
        field: "verified",
        label: "Verified",
        icon: "fas fa-circle-check",
        iconToneClass: "ph-good-ico",
        toneClass: "is-verified",
        toastIcon: "fa-circle-check",
        info: "This product has a documented and verified more info page.",
      },
      trending: {
        id: "filterTrending",
        field: "trending",
        label: "Trending",
        icon: "fas fa-arrow-trend-up",
        toneClass: "is-trending",
        toastIcon: "fa-arrow-trend-up",
        info: "This product is currently marked as trending on the catalog.",
      },
      warning: {
        id: "filterWarning",
        field: "warning",
        label: "Warning",
        icon: "fas fa-triangle-exclamation",
        iconToneClass: "ph-warn-ico",
        toneClass: "is-warning",
        toastIcon: "fa-triangle-exclamation",
        info:
          "voxlis.NET recommends reading more about this product before continuing with any purchases, so you know what you are getting.",
      },
      warningred: {
        field: "warningred",
        label: "High-Risk Warning",
        icon: "fas fa-triangle-exclamation",
        iconToneClass: "ph-warn-red-ico",
        toastIcon: "fa-triangle-exclamation",
        info: "This product has a high-risk warning on voxlis.NET.",
      },
    },
    promo: {
      titlePrefix: "Join our ",
      titleAccent: "Discord",
      titleSuffix: " Community!",
      description: "Giveaways, automatic notification for software updates, and more!",
      actions: [
        {
          href: "https://discord.gg/Ynxbp2YPus",
          label: "Discord",
          trackingKey: "discord",
          buttonClassName: "promo-action-button-discord",
          iconClass: "fab fa-discord",
        },
        {
          href: "https://www.youtube.com/channel/UCRDj_epbbwvpLTCFDmeL7Zg",
          label: "YouTube",
          trackingKey: "youtube",
          buttonClassName: "promo-action-button-youtube",
          iconClass: "fab fa-youtube",
        },
        {
          href: "https://www.trustpilot.com/review/voxlis.net",
          label: "Trustpilot",
          trackingKey: "trustpilot",
          buttonClassName: "promo-action-button-trustpilot",
          iconClass: "fas fa-star",
        },
      ],
    },
    featured: {
      ariaLabel: "Featured sponsored card",
      title: "Featured",
      hideButtonLabel: "Hide ads",
      href: "https://www.youtube.com/channel/UCRDj_epbbwvpLTCFDmeL7Zg",
      backgroundImageSrc: "/public/assets/overlay/promo-1.png",
      backgroundImageAlt: "Advertisement background",
      logoImageSrc: "/public/assets/overlay/promo-2.png",
      logoImageAlt: "",
    },
  };

  window.VOXLIS_CONFIG_SOURCES = configSources;
})();
