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
      ];

  const buildPromoActionMarkup = ({ href, label, buttonClassName, iconClass }) => `
    <button
      class="promo-action-button ${escapeHtml(buttonClassName)}"
      type="button"
      data-promo-href="${escapeHtml(href)}"
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
    const trigger = event.target.closest("[data-promo-href]");
    if (!trigger) return;

    const href = String(trigger.getAttribute("data-promo-href") || "").trim();
    if (!href) return;

    event.preventDefault();
    window.open(href, "_blank", "noopener");
  });

  window.getPromoMarkup = () => PROMO_MARKUP;
})();
