(() => {
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character);
  const promoConfig = window.VOXLIS_CONFIG?.promo ?? {};
  const PROMO_LINKS = Array.isArray(promoConfig.actions) && promoConfig.actions.length
    ? promoConfig.actions
    : [
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
      ];
  const PROMO_SECTION_SELECTOR = ".promo-hero-section";
  const PROMO_CLOSE_SELECTOR = "[data-promo-close]";
  const PROMO_HIDING_CLASS = "is-hiding";
  const PROMO_HIDE_DURATION_MS = 220;

  const setPromoHidden = (hidden, { animated = false } = {}) => {
    const sections = [...document.querySelectorAll(PROMO_SECTION_SELECTOR)];
    const nextHidden = Boolean(hidden);

    if (!sections.length) return;

    if (!nextHidden) {
      sections.forEach((section) => {
        section.hidden = false;
        section.classList.remove(PROMO_HIDING_CLASS);
        section.removeAttribute("aria-hidden");
      });
      return;
    }

    if (!animated) {
      sections.forEach((section) => {
        section.hidden = true;
        section.classList.remove(PROMO_HIDING_CLASS);
        section.setAttribute("aria-hidden", "true");
      });
      return;
    }

    sections.forEach((section) => {
      if (section.classList.contains(PROMO_HIDING_CLASS)) return;

      section.hidden = false;
      section.classList.add(PROMO_HIDING_CLASS);
      section.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        section.hidden = true;
        section.classList.remove(PROMO_HIDING_CLASS);
      }, PROMO_HIDE_DURATION_MS);
    });
  };

  const normalizeTrackingKey = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const buildPromoActionMarkup = ({ href, label, trackingKey = "", buttonClassName, iconClass }) => `
    <button
      class="promo-action-button ${escapeHtml(buttonClassName)}"
      type="button"
      data-promo-href="${escapeHtml(href)}"
      data-click-track-ui-group="promo"
      data-click-track-ui-key="${escapeHtml(normalizeTrackingKey(trackingKey || label))}"
    >
      <span class="promo-action-icon">
        <i class="${escapeHtml(iconClass)}"></i>
      </span>
      <span class="promo-action-label">${escapeHtml(label)}</span>
      <i class="fas fa-chevron-right promo-action-arrow"></i>
    </button>
  `;

  const PROMO_MARKUP = `
    <div class="promo-hero-section">
      <div class="promo-hero-card">
        <div class="promo-hero-gradient"></div>
        <div class="promo-hero-glow"></div>
        <button
          class="promo-close-button"
          type="button"
          data-promo-close
          data-click-track-ui-group="promo"
          data-click-track-ui-key="close"
          aria-label="Close Discord community promo"
        >
          <i class="fas fa-xmark" aria-hidden="true"></i>
        </button>

        <div class="promo-hero-content">
          <div class="promo-hero-accent-bar"></div>

          <div class="promo-hero-text">
            <h1 class="promo-hero-title">
              ${escapeHtml(promoConfig.titlePrefix || "Join our ")}<span class="promo-hero-title-accent">${escapeHtml(promoConfig.titleAccent || "Discord")}</span>${escapeHtml(promoConfig.titleSuffix || " Community!")}
            </h1>

            <p class="promo-hero-description">
              ${escapeHtml(promoConfig.description || "Giveaways, automatic notification for software updates, and more!")}
            </p>

            <div class="promo-action-row">
              ${PROMO_LINKS.map((link) => buildPromoActionMarkup(link)).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.addEventListener("click", (event) => {
    const closeTrigger = event.target.closest(PROMO_CLOSE_SELECTOR);
    if (closeTrigger) {
      event.preventDefault();
      setPromoHidden(true, { animated: true });
      return;
    }

    const trigger = event.target.closest("[data-promo-href]");
    if (!trigger) return;

    const href = String(trigger.getAttribute("data-promo-href") || "").trim();
    if (!href) return;

    event.preventDefault();
    window.open(href, "_blank", "noopener");
  });

  window.setPromoHidden = setPromoHidden;
  window.getPromoMarkup = () => PROMO_MARKUP;
})();
