(() => {
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

  const hideFeaturedAds = () => {
    const mainLayout = document.querySelector(".main-lyt");
    if (!mainLayout || mainLayout.dataset.adsHideState === "running") return;

    const featuredSections = [...mainLayout.querySelectorAll(FEATURED_SECTION_SELECTOR)];
    if (!featuredSections.length) {
      mainLayout.classList.add(LAYOUT_HIDDEN_CLASS);
      return;
    }

    const centerColumn = mainLayout.querySelector(".layout-center");
    const centerWidth = centerColumn?.getBoundingClientRect().width || 0;
    if (centerWidth > 0) {
      mainLayout.style.setProperty(LAYOUT_CENTER_WIDTH_VAR, `${Math.round(centerWidth)}px`);
    }

    mainLayout.dataset.adsHideState = "running";
    featuredSections.forEach((section) => {
      section.classList.add(FEATURED_HIDING_CLASS);
      section.setAttribute("aria-hidden", "true");
    });

    window.setTimeout(() => {
      featuredSections.forEach((section) => section.remove());
      mainLayout.classList.add(LAYOUT_HIDDEN_CLASS);
      delete mainLayout.dataset.adsHideState;
    }, getHideDuration());
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(HIDE_TRIGGER_SELECTOR);
    if (!trigger) return;

    event.preventDefault();
    hideFeaturedAds();
  });
})();
