(() => {
  const THEME_CHANGE_EVENT = "site-theme-change";
  const FEATURED_TRANSPARENT_CARD_CLASS = "featured-card--transparent";
  const TRANSPARENT_CARD_THEMES = new Set(["kawaii"]);
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character);
  const featuredConfig = window.VOXLIS_CONFIG?.featured ?? {};
  const shouldUseTransparentFeaturedCard = () =>
    TRANSPARENT_CARD_THEMES.has(document.documentElement.dataset.theme || "");

  const getFeaturedCardClassName = () =>
    ["featured-card", shouldUseTransparentFeaturedCard() ? FEATURED_TRANSPARENT_CARD_CLASS : ""]
      .filter(Boolean)
      .join(" ");

  const buildFeaturedCardMarkup = () => {
    const cardConfig = featuredConfig;

    return `
    <section class="featured-section" aria-label="${escapeHtml(cardConfig.ariaLabel || "Featured sponsored card")}">
      <div class="${getFeaturedCardClassName()}">
        <div class="featured-card-header">
          <h3 class="featured-card-title">${escapeHtml(cardConfig.title || "Featured")}</h3>
          <button type="button" class="featured-hide-button">${escapeHtml(cardConfig.hideButtonLabel || "Hide ads")}</button>
        </div>

        <div class="featured-card-body">
          <a
            href="${escapeHtml(cardConfig.href || "https://www.youtube.com/channel/UCRDj_epbbwvpLTCFDmeL7Zg")}"
            target="_blank"
            rel="noopener noreferrer"
            class="featured-media-link"
          >
            <img src="${escapeHtml(cardConfig.backgroundImageSrc || "/public/assets/overlay/promo-1.png")}" alt="${escapeHtml(cardConfig.backgroundImageAlt || "Advertisement background")}" class="featured-background-image">
            <img src="${escapeHtml(cardConfig.logoImageSrc || "/public/assets/overlay/promo-2.png")}" alt="${escapeHtml(cardConfig.logoImageAlt || "")}" class="featured-logo-image" aria-hidden="true">
            <span class="featured-logo-overlay" aria-hidden="true"></span>
          </a>
        </div>
      </div>
    </section>
  `;
  };
  const HIDE_TRIGGER_SELECTOR = ".featured-hide-button";
  const LAYOUT_HIDDEN_CLASS = "ads-hidden";
  const LAYOUT_CENTER_WIDTH_VAR = "--ads-hidden-center-width";
  const FEATURED_SECTION_SELECTOR = ".featured-section";
  const FEATURED_HIDING_CLASS = "is-hiding";

  const getHideDuration = () => {
    const rawValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--featured-hide-duration")
      .trim();

    if (!rawValue) return 220;
    if (rawValue.endsWith("ms")) return Number.parseFloat(rawValue) || 220;
    if (rawValue.endsWith("s")) return (Number.parseFloat(rawValue) || 0.22) * 1000;
    return Number.parseFloat(rawValue) || 220;
  };

  const setFeaturedAdsHidden = (hidden, { animated = false } = {}) => {
    const mainLayout = document.querySelector(".main-lyt");
    if (!mainLayout || mainLayout.dataset.adsHideState === "running") return;

    const featuredSections = [...mainLayout.querySelectorAll(FEATURED_SECTION_SELECTOR)];
    const nextHidden = Boolean(hidden);

    const centerColumn = mainLayout.querySelector(".layout-center");
    const centerWidth = centerColumn?.getBoundingClientRect().width || 0;
    if (centerWidth > 0) {
      mainLayout.style.setProperty(LAYOUT_CENTER_WIDTH_VAR, `${Math.round(centerWidth)}px`);
    }

    if (!nextHidden) {
      mainLayout.classList.remove(LAYOUT_HIDDEN_CLASS);
      featuredSections.forEach((section) => {
        section.hidden = false;
        section.classList.remove(FEATURED_HIDING_CLASS);
        section.removeAttribute("aria-hidden");
      });
      delete mainLayout.dataset.adsHideState;
      return;
    }

    if (!featuredSections.length) {
      mainLayout.classList.add(LAYOUT_HIDDEN_CLASS);
      return;
    }

    if (!animated) {
      featuredSections.forEach((section) => {
        section.hidden = true;
        section.classList.remove(FEATURED_HIDING_CLASS);
        section.setAttribute("aria-hidden", "true");
      });
      mainLayout.classList.add(LAYOUT_HIDDEN_CLASS);
      return;
    }

    mainLayout.dataset.adsHideState = "running";
    featuredSections.forEach((section) => {
      section.hidden = false;
      section.classList.add(FEATURED_HIDING_CLASS);
      section.setAttribute("aria-hidden", "true");
    });

    window.setTimeout(() => {
      featuredSections.forEach((section) => {
        section.hidden = true;
        section.classList.remove(FEATURED_HIDING_CLASS);
      });
      mainLayout.classList.add(LAYOUT_HIDDEN_CLASS);
      delete mainLayout.dataset.adsHideState;
    }, getHideDuration());
  };

  const hideFeaturedAds = (options = {}) => {
    const nextOptions = options && typeof options === "object" ? options : {};
    setFeaturedAdsHidden(true, nextOptions);
  };

  const showFeaturedAds = (options = {}) => {
    const nextOptions = options && typeof options === "object" ? options : {};
    setFeaturedAdsHidden(false, nextOptions);
  };

  const toggleFeaturedAdsHidden = (options = {}) => {
    const mainLayout = document.querySelector(".main-lyt");
    const isCurrentlyHidden = mainLayout?.classList.contains(LAYOUT_HIDDEN_CLASS);
    setFeaturedAdsHidden(!isCurrentlyHidden, options && typeof options === "object" ? options : {});
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(HIDE_TRIGGER_SELECTOR);
    if (!trigger) return;

    event.preventDefault();
    setFeaturedAdsHidden(true, { animated: true });
  });

  const syncFeaturedCardThemeClass = () => {
    const shouldUseTransparentClass = shouldUseTransparentFeaturedCard();
    document.querySelectorAll(".featured-card").forEach((card) => {
      card.classList.toggle(FEATURED_TRANSPARENT_CARD_CLASS, shouldUseTransparentClass);
    });
  };

  window.addEventListener(THEME_CHANGE_EVENT, syncFeaturedCardThemeClass);

  window.setFeaturedAdsHidden = setFeaturedAdsHidden;
  window.hideFeaturedAds = hideFeaturedAds;
  window.showFeaturedAds = showFeaturedAds;
  window.toggleFeaturedAdsHidden = toggleFeaturedAdsHidden;
  window.getFeaturedCardMarkup = () => buildFeaturedCardMarkup();
  window.syncFeaturedCardThemeClass = syncFeaturedCardThemeClass;
})();
