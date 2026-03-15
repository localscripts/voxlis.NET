(() => {
  const DATA_ROOT = "/public/data/roblox";
  const API_BASE_URL = "https://api.voxlis.net/api";
  const STATUS_API_URL = `${API_BASE_URL}/endpoints`;
  const SUNC_API_URL = `${API_BASE_URL}/sunc`;
  const CARD_NAME_OVERRIDES = {
    arceusx: "Arceus X",
    sirhurt: "SirHurt",
    vegax: "Vega X",
  };
  const PLATFORM_ORDER = ["windows", "macos", "android", "ios"];
  const PLATFORM_LABELS = {
    windows: "Windows",
    macos: "macOS",
    android: "Android",
    ios: "iOS",
  };
  const PLATFORM_ICONS = {
    windows: "fab fa-windows",
    macos: "fab fa-apple",
    android: "fab fa-android",
    ios: "fab fa-apple",
  };
  const TYPE_LABELS = {
    internal: "Executor",
    external: "Cheat Menu",
  };
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const suncRequestCache = new Map();
  const WARNING_MODAL_EXIT_MS = 320;
  const DEFAULT_FILTERS = {
    search: "",
    sort: "recommended",
    platforms: [],
    price: "all",
    key: "all",
    type: "all",
    verified: false,
    premium: false,
    updated: false,
    multiInstance: false,
    decompiler: false,
    kernel: false,
    highSunc: false,
  };
  const catalogState = {
    mount: null,
    grid: null,
    cards: [],
    statusMap: {},
    filters: { ...DEFAULT_FILTERS },
  };
  const warningModalState = {
    closeTimerId: 0,
    pendingAction: null,
    previousBodyOverflow: "",
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

  const titleCase = (value = "") =>
    value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const getFolderName = (slug) => CARD_NAME_OVERRIDES[slug] ?? titleCase(slug);

  const fetchJson = async (path, { optional = false } = {}) => {
    const response = await fetch(path, { cache: "no-cache" });
    if (response.ok) {
      return response.json();
    }

    if (optional && response.status === 404) {
      return null;
    }

    throw new Error(`Failed to load JSON (${path}): ${response.status}`);
  };

  const flattenOffers = (pricing = {}) =>
    Object.entries(pricing.platforms ?? {}).flatMap(([platform, offers]) =>
      (offers ?? []).map((offer) => ({ ...offer, platform })),
    );

  const formatCurrency = (price, currency) => {
    if (!Number.isFinite(price)) return "Price unavailable";
    if (!currency) return `$${price.toFixed(2)}`;

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `$${price.toFixed(2)}`;
    }
  };

  const formatDuration = (days) => {
    if (days === -1) return "Lifetime";
    if (days === 1) return "1 Day";
    if (Number.isFinite(days) && days > 1) return `${days} Days`;
    return "";
  };

  const formatPriceSummary = (offers) => {
    if (!offers.length) return "Price unavailable";

    const validOffers = offers
      .filter((offer) => Number.isFinite(Number(offer.price)))
      .map((offer) => ({ ...offer, price: Number(offer.price) }))
      .sort((left, right) => left.price - right.price || left.days - right.days);

    if (!validOffers.length) return "Price unavailable";

    const freeOffer = validOffers.find((offer) => offer.price === 0);
    if (freeOffer) {
      const paidOffer = validOffers.find((offer) => offer.price > 0);
      if (!paidOffer) return "FREE";

      const duration = formatDuration(paidOffer.days);
      return `FREE or from ${formatCurrency(paidOffer.price, paidOffer.currency)}${duration ? ` | ${duration}` : ""}`;
    }

    const lowestOffer = validOffers[0];
    const duration = formatDuration(lowestOffer.days);
    const summary = `${formatCurrency(lowestOffer.price, lowestOffer.currency)}${duration ? ` | ${duration}` : ""}`;
    return validOffers.length === 1 ? summary : `From ${summary}`;
  };

  const getPrimarySuncSource = (info = {}) => {
    const suncEntries = info.sunc;
    if (!suncEntries || typeof suncEntries !== "object") {
      return null;
    }

    const preferredPlatforms = Array.isArray(info.platforms) ? info.platforms : [];
    const orderedPlatforms = [
      ...new Set([...preferredPlatforms, ...PLATFORM_ORDER, ...Object.keys(suncEntries)]),
    ];

    for (const platform of orderedPlatforms) {
      const source = suncEntries[platform];
      if (!source || typeof source !== "object") {
        continue;
      }

      if (source.scrapId && source.key) {
        return {
          platform,
          scrapId: source.scrapId,
          key: source.key,
        };
      }
    }

    return null;
  };

  const hasSuncTracking = (info) => Boolean(getPrimarySuncSource(info));

  const normalizeSuncSummary = (payload) => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    if (Number.isFinite(Number(payload.score))) {
      return {
        score: Math.round(Number(payload.score)),
      };
    }

    const passedCount = Array.isArray(payload.tests?.passed) ? payload.tests.passed.length : 0;
    const failedTests = payload.tests?.failed;
    const failedCount = Array.isArray(failedTests)
      ? failedTests.length
      : failedTests && typeof failedTests === "object"
        ? Object.keys(failedTests).length
        : 0;
    const totalCount = passedCount + failedCount;

    if (!totalCount) {
      return null;
    }

    return {
      score: Math.round((passedCount / totalCount) * 100),
    };
  };

  const loadSuncSummary = async (info) => {
    const source = getPrimarySuncSource(info);
    if (!source) {
      return null;
    }

    const cacheKey = `${source.scrapId}:${source.key}`;
    if (!suncRequestCache.has(cacheKey)) {
      const request = fetchJson(
        `${SUNC_API_URL}?scrap=${encodeURIComponent(source.scrapId)}&key=${encodeURIComponent(source.key)}`,
      )
        .then((payload) => normalizeSuncSummary(payload))
        .catch((error) => {
          console.warn("Failed to load sUNC summary.", error);
          return null;
        });

      suncRequestCache.set(cacheKey, request);
    }

    return suncRequestCache.get(cacheKey);
  };

  const normalizeLineText = (value = "") => String(value).replace(/\s+/g, " ").trim();
  const buildSearchText = (parts = []) =>
    normalizeLineText(
      parts
        .flatMap((part) => (Array.isArray(part) ? part : [part]))
        .filter(Boolean)
        .join(" "),
    ).toLowerCase();

  const getCombinedPointText = (points = {}) =>
    [points.pro_summary, points.neutral_summary, points.con_summary]
      .map((value) => normalizeLineText(value))
      .filter(Boolean)
      .join(" ");

  const inferKeyedState = (info = {}, points = {}, offers = []) => {
    if (typeof info.keyed === "boolean") {
      return info.keyed;
    }

    const pointText = getCombinedPointText(points);
    if (/\b(no key(?: system)?|keyless)\b/i.test(pointText)) {
      return false;
    }

    if (/\b(key ?system|keysystem|long keys?|requires? keys?)\b/i.test(pointText)) {
      return true;
    }

    const hasFreeOffer = offers.some((offer) => Number(offer.price) === 0);
    const hasPaidOffer = offers.some((offer) => Number(offer.price) > 0);
    return hasFreeOffer && hasPaidOffer;
  };

  const buildSummaryLines = (card) => {
    const lines = [];
    const explicitGood = normalizeLineText(card.points?.pro_summary);
    const explicitWarn = normalizeLineText(card.points?.con_summary || card.points?.neutral_summary);

    if (explicitGood) {
      lines.push({ className: "good", text: explicitGood });
    }

    if (explicitWarn) {
      lines.push({ className: "warn", text: explicitWarn });
    }

    return lines;
  };

  const getModalWarningConfig = (modals = {}) => {
    if (modals?.warningred?.enabled) {
      return {
        variant: "warningred",
        title: "Warning",
        description: modals.warningred.description || "",
      };
    }

    if (modals?.warning?.enabled) {
      return {
        variant: "warning",
        title: "Warning",
        description: modals.warning.description || "",
      };
    }

    return null;
  };

  const buildTitleIcons = (info, modals) => {
    const icons = [];
    const warningConfig = getModalWarningConfig(modals);

    if (Array.isArray(info.badges) && info.badges.includes("verified")) {
      icons.push('<i class="fas fa-circle-check ph-good-ico" aria-hidden="true"></i>');
    }

    if (Array.isArray(info.badges) && info.badges.includes("trending")) {
      icons.push('<i class="fas fa-arrow-trend-up" aria-hidden="true"></i>');
    }

    if (warningConfig?.variant === "warningred") {
      icons.push('<i class="fas fa-triangle-exclamation ph-warn-red-ico" aria-hidden="true"></i>');
    }

    if (warningConfig?.variant === "warning") {
      icons.push('<i class="fas fa-triangle-exclamation ph-warn-ico" aria-hidden="true"></i>');
    }

    return icons.length ? ` ${icons.join(" ")}` : "";
  };

  const buildMetaText = (info) => {
    const platformLabels = [...(info.platforms ?? [])]
      .map((platform) => PLATFORM_LABELS[platform] ?? titleCase(platform))
      .filter(Boolean);
    const typeLabel = TYPE_LABELS[info.type];
    const fragments = [];

    if (platformLabels.length) {
      fragments.push(platformLabels.join(" + "));
    }
    if (typeLabel) {
      fragments.push(typeLabel);
    }

    return fragments.join(" | ");
  };

  const buildRatingMarkup = (info, suncSummary) => {
    if (info.type === "external") {
      return "";
    }

    const tracked = hasSuncTracking(info);
    const scoreLabel =
      tracked && Number.isFinite(suncSummary?.score) ? `${suncSummary.score}%` : tracked ? "sUNC" : "None";
    return `
      <div class="ph-rating${tracked ? "" : " is-none"}">
        <span class="ph-rating-logo" aria-hidden="true">
          <span class="ph-rating-logo-main"></span>
          <span class="ph-rating-logo-s"></span>
        </span>
        <span class="ph-rating-val">${escapeHtml(scoreLabel)}</span>
      </div>
    `;
  };

  const buildActionMarkup = ({ slug, reviewUrl, websiteUrl, purchaseUrl, offers, warningConfig }) => {
    const websiteHref = websiteUrl || purchaseUrl || "#";
    const warningAttributes =
      warningConfig && websiteHref !== "#"
        ? ` data-card-warning-slug="${escapeHtml(slug)}"`
        : "";
    const hasFreeOffer = Array.isArray(offers) && offers.some((offer) => Number(offer.price) === 0);
    const hasPaidOffer = Array.isArray(offers) && offers.some((offer) => Number(offer.price) > 0);
    const sponsorMarkup = /key-empire\.com/i.test(purchaseUrl ?? "")
      ? `
        <a class="ph-sponsor-btn" href="${escapeHtml(purchaseUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Buy on Key-Empire"${warningConfig ? ` data-card-warning-slug="${escapeHtml(slug)}"` : ""}>
          <span class="ph-sponsor-stack" aria-hidden="true">
            <img class="ph-sponsor-base-image" src="/public/assets/logo/keyempire-text.png" alt="">
            <span class="ph-sponsor-overlay-image"></span>
          </span>
        </a>
      `
      : hasPaidOffer
        ? `
          <div class="ph-sponsor-btn ph-sponsor-note" role="note">
            This product is not on Key-Empire
          </div>
        `
        : hasFreeOffer
          ? `
            <div class="ph-sponsor-btn ph-sponsor-note" role="note">
              This product is free to use
            </div>
          `
          : "";

    return `
      <div class="ph-actions">
        <div class="ph-primary-actions">
          <a class="ph-action-btn" href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer"${warningAttributes}>
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Website
          </a>
          <a class="ph-action-btn is-more" href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer">
            MORE <i class="fas fa-circle-info" aria-hidden="true"></i>
          </a>
        </div>
        ${sponsorMarkup}
      </div>
    `;
  };

  const ensureWarningModal = () => {
    let modal = document.getElementById("cardWarningModal");
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = "card-warning-modal";
    modal.id = "cardWarningModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="card-warning-dialog" role="dialog" aria-modal="true" aria-labelledby="cardWarningTitle" aria-describedby="cardWarningDescription">
        <div class="card-warning-head">
          <div class="card-warning-icon" aria-hidden="true">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
          <div class="card-warning-copy">
            <p class="card-warning-title" id="cardWarningTitle">Warning</p>
            <p class="card-warning-description" id="cardWarningDescription"></p>
          </div>
        </div>
        <div class="card-warning-actions">
          <button class="card-warning-btn is-primary" type="button" data-card-warning-continue>
            <span class="card-warning-btn-label">Press to continue</span>
          </button>
          <button class="card-warning-btn is-secondary" type="button" data-card-warning-close>Close</button>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (
        event.target === modal ||
        event.target.closest("[data-card-warning-close]")
      ) {
        closeWarningModal();
      }
    });

    const continueButton = modal.querySelector("[data-card-warning-continue]");
    continueButton?.addEventListener("click", continueWarningModalAction);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeWarningModal();
      }
    });

    document.body.appendChild(modal);
    return modal;
  };

  const completeWarningModalClose = () => {
    const modal = document.getElementById("cardWarningModal");
    if (!modal) return;

    modal.hidden = true;
    modal.classList.remove("is-open", "is-closing", "is-warning", "is-warningred");
    warningModalState.pendingAction = null;
    document.body.style.overflow = warningModalState.previousBodyOverflow;
    warningModalState.previousBodyOverflow = "";
    warningModalState.closeTimerId = 0;
  };

  function closeWarningModal() {
    const modal = document.getElementById("cardWarningModal");
    if (!modal || modal.hidden || modal.classList.contains("is-closing")) {
      return;
    }

    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    window.clearTimeout(warningModalState.closeTimerId);
    warningModalState.closeTimerId = window.setTimeout(
      completeWarningModalClose,
      WARNING_MODAL_EXIT_MS,
    );
  }

  function continueWarningModalAction() {
    const action = warningModalState.pendingAction;
    closeWarningModal();

    if (!action?.href) {
      return;
    }

    if (action.target === "_blank") {
      window.open(action.href, "_blank", "noopener");
      return;
    }

    window.location.assign(action.href);
  }

  const openWarningModal = (warningConfig, action) => {
    if (!warningConfig?.description || !action?.href) {
      return;
    }

    const modal = ensureWarningModal();
    const titleNode = modal.querySelector("#cardWarningTitle");
    const descriptionNode = modal.querySelector("#cardWarningDescription");
    const continueButton = modal.querySelector("[data-card-warning-continue]");

    window.clearTimeout(warningModalState.closeTimerId);
    warningModalState.pendingAction = action;
    if (modal.hidden) {
      warningModalState.previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";

    titleNode.textContent = warningConfig.title || "Warning";
    descriptionNode.textContent = warningConfig.description;

    modal.hidden = false;
    modal.classList.remove("is-closing", "is-warning", "is-warningred");
    modal.classList.add("is-open", warningConfig.variant === "warningred" ? "is-warningred" : "is-warning");

    window.requestAnimationFrame(() => {
      continueButton?.focus();
    });
  };

  const handleWarningActionClick = (event) => {
    const trigger = event.target.closest("a[data-card-warning-slug]");
    if (!trigger) {
      return;
    }

    const slug = trigger.dataset.cardWarningSlug;
    const card = catalogState.cards.find((entry) => entry.slug === slug);
    const warningConfig = getModalWarningConfig(card?.modals);

    if (!warningConfig || !trigger.href) {
      return;
    }

    event.preventDefault();
    openWarningModal(warningConfig, {
      href: trigger.href,
      target: trigger.getAttribute("target") || "",
    });
  };

  const normalizeStatusPayload = (payload) => {
    if (!payload || typeof payload !== "object") {
      return {};
    }

    const hasPlatformBuckets = PLATFORM_ORDER.some(
      (platform) => payload[platform] && typeof payload[platform] === "object",
    );

    if (hasPlatformBuckets) {
      const normalized = {};

      PLATFORM_ORDER.forEach((platform) => {
        const platformEntries = payload[platform];
        if (!platformEntries || typeof platformEntries !== "object") {
          return;
        }

        Object.entries(platformEntries).forEach(([slug, value]) => {
          const updated =
            typeof value === "boolean"
              ? value
              : value && typeof value === "object" && typeof value.updated === "boolean"
                ? value.updated
                : null;

          if (typeof updated !== "boolean") {
            return;
          }

          normalized[slug] ??= {};
          normalized[slug][platform] = updated;
        });
      });

      return normalized;
    }

    return Object.fromEntries(
      Object.entries(payload)
        .filter(([slug, value]) => slug !== "TEST" && value && typeof value === "object")
        .map(([slug, value]) => [
          slug,
          Object.fromEntries(
            Object.entries(value).filter(
              ([platform, state]) =>
                PLATFORM_ORDER.includes(platform) && typeof state === "boolean",
            ),
          ),
        ])
        .filter(([, platforms]) => Object.keys(platforms).length > 0),
    );
  };

  const loadUptimeStatus = async () => {
    try {
      const payload = await fetchJson(STATUS_API_URL);
      return normalizeStatusPayload(payload);
    } catch (error) {
      console.warn("Failed to load exploit status feed.", error);
      return {};
    }
  };

  const hasBadge = (card, badge) => Array.isArray(card.info.badges) && card.info.badges.includes(badge);
  const hasTrendingBadge = (card) => hasBadge(card, "trending");
  const hasVerifiedBadge = (card) => hasBadge(card, "verified");

  const getCardStatusClass = (card, statusMap) => {
    const platformStates = card.info.platforms
      ?.map((platform) => statusMap[card.slug]?.[platform])
      .filter((value) => typeof value === "boolean");

    if (!platformStates?.length) {
      return "is-status-unknown";
    }

    if (platformStates.some(Boolean)) {
      return "is-updated";
    }

    return "is-not-updated";
  };

  const getStatusSortRank = (statusClass) => {
    if (statusClass === "is-updated") return 0;
    if (statusClass === "is-not-updated") return 1;
    return 2;
  };

  const compareRecommended = (left, right, statusMap) => {
    const leftStatus = getCardStatusClass(left, statusMap);
    const rightStatus = getCardStatusClass(right, statusMap);
    const statusRank = getStatusSortRank(leftStatus) - getStatusSortRank(rightStatus);

    if (statusRank !== 0) return statusRank;

    const trendingRank = Number(hasTrendingBadge(right)) - Number(hasTrendingBadge(left));
    if (trendingRank !== 0) return trendingRank;

    return (left.catalogIndex ?? 0) - (right.catalogIndex ?? 0);
  };

  const getSortablePrice = (card) => {
    if (card.hasFreeOffer) return 0;
    if (Number.isFinite(card.minPaidPrice)) return card.minPaidPrice;
    return Number.POSITIVE_INFINITY;
  };

  const normalizeFilters = (filters = {}) => ({
    search: normalizeLineText(filters.search || ""),
    sort: filters.sort || DEFAULT_FILTERS.sort,
    platforms: Array.isArray(filters.platforms)
      ? filters.platforms.filter((platform) => PLATFORM_ORDER.includes(platform))
      : [],
    price: filters.price || DEFAULT_FILTERS.price,
    key: filters.key || DEFAULT_FILTERS.key,
    type: filters.type || DEFAULT_FILTERS.type,
    verified: Boolean(filters.verified),
    premium: Boolean(filters.premium),
    updated: Boolean(filters.updated),
    multiInstance: Boolean(filters.multiInstance),
    decompiler: Boolean(filters.decompiler),
    kernel: Boolean(filters.kernel),
    highSunc: Boolean(filters.highSunc),
  });

  const matchesFilters = (card, statusMap, filters) => {
    const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length && !searchTerms.every((term) => card.searchText.includes(term))) {
      return false;
    }

    if (
      filters.platforms.length &&
      !filters.platforms.some((platform) => (card.info.platforms ?? []).includes(platform))
    ) {
      return false;
    }

    if (filters.price === "free" && !card.hasFreeOffer) {
      return false;
    }

    if (filters.price === "paid" && (!card.hasPaidOffer || card.hasFreeOffer)) {
      return false;
    }

    if (filters.key === "keyless" && card.isKeyed) {
      return false;
    }

    if (filters.key === "keysystem" && !card.isKeyed) {
      return false;
    }

    if (filters.type === "external" && card.cardType !== "external") {
      return false;
    }

    if (filters.type === "executor" && card.cardType !== "executor") {
      return false;
    }

    if (filters.verified && !hasVerifiedBadge(card)) {
      return false;
    }

    if (filters.premium && !card.hasPaidOffer) {
      return false;
    }

    if (filters.updated && getCardStatusClass(card, statusMap) !== "is-updated") {
      return false;
    }

    if (filters.multiInstance && !card.info.tags?.includes("multi-instance")) {
      return false;
    }

    if (filters.decompiler && !card.info.tags?.includes("decompiler")) {
      return false;
    }

    if (filters.kernel && !card.info.tags?.includes("kernel")) {
      return false;
    }

    if (filters.highSunc && !(Number.isFinite(card.suncSummary?.score) && card.suncSummary.score >= 90)) {
      return false;
    }

    return true;
  };

  const sortCards = (cards, statusMap, sort = DEFAULT_FILTERS.sort) =>
    [...cards].sort((left, right) => {
      if (sort === "most-popular") {
        const popularityRank =
          Number(hasTrendingBadge(right)) - Number(hasTrendingBadge(left)) ||
          Number(hasVerifiedBadge(right)) - Number(hasVerifiedBadge(left));
        if (popularityRank !== 0) return popularityRank;
        return compareRecommended(left, right, statusMap);
      }

      if (sort === "least-popular") {
        const popularityRank =
          Number(hasTrendingBadge(left)) - Number(hasTrendingBadge(right)) ||
          Number(hasVerifiedBadge(left)) - Number(hasVerifiedBadge(right));
        if (popularityRank !== 0) return popularityRank;
        return compareRecommended(left, right, statusMap);
      }

      if (sort === "price-asc") {
        const priceRank = getSortablePrice(left) - getSortablePrice(right);
        if (priceRank !== 0) return priceRank;
        return left.title.localeCompare(right.title);
      }

      if (sort === "price-desc") {
        const leftPrice = Number.isFinite(getSortablePrice(left)) ? getSortablePrice(left) : -1;
        const rightPrice = Number.isFinite(getSortablePrice(right)) ? getSortablePrice(right) : -1;
        const priceRank = rightPrice - leftPrice;
        if (priceRank !== 0) return priceRank;
        return left.title.localeCompare(right.title);
      }

      if (sort === "name-asc") {
        return left.title.localeCompare(right.title);
      }

      return compareRecommended(left, right, statusMap);
    });

  const renderCard = (card, statusMap) => {
    const reviewUrl = `${DATA_ROOT}/${encodeURIComponent(card.folderName)}/review.md`;
    const primaryPlatform = card.info.platforms?.[0];
    const platformIcon = PLATFORM_ICONS[primaryPlatform] ?? "fas fa-microchip";
    const summaryLines = buildSummaryLines(card);
    const warningConfig = getModalWarningConfig(card.modals);
    const lineMarkup = summaryLines.length
      ? `
        <div class="ph-lines">
          ${summaryLines
            .map(
              (line) =>
                `<p class="ph-line ${line.className}">${escapeHtml(line.text)}</p>`,
            )
            .join("")}
        </div>
      `
      : "";
    const statusClass = getCardStatusClass(card, statusMap);

    return `
      <article
        class="exploit-card-placeholder ${statusClass}"
        data-slug="${escapeHtml(card.slug)}"
        data-title="${escapeHtml(card.title)}"
        data-platforms="${escapeHtml((card.info.platforms ?? []).join(","))}"
        data-status="${escapeHtml(statusClass)}"
      >
        <div class="ph-head">
          <div class="ph-head-main">
            <h3 class="ph-title">${escapeHtml(card.title)}${buildTitleIcons(card.info, card.modals)}</h3>
          </div>
          ${buildRatingMarkup(card.info, card.suncSummary)}
        </div>
        ${lineMarkup}
        <p class="ph-title-meta">
          <i class="${escapeHtml(platformIcon)} ph-title-meta-ico" aria-hidden="true"></i>
          ${escapeHtml(buildMetaText(card.info))}
        </p>
        <p class="ph-price">${escapeHtml(formatPriceSummary(card.offers))}</p>
        ${buildActionMarkup({
          slug: card.slug,
          reviewUrl,
          websiteUrl: card.info.website,
          purchaseUrl: card.pricing.purchase_url,
          offers: card.offers,
          warningConfig,
        })}
      </article>
    `;
  };

  const updateSummary = (mount, filtered, total = filtered) => {
    const filteredCount = mount.querySelector(".fltrd-cnt");
    const totalCount = mount.querySelector(".ttl-cnt");
    const pageInfo = mount.querySelector(".page-info");

    if (filteredCount) filteredCount.textContent = String(filtered);
    if (totalCount) totalCount.textContent = String(total);
    if (pageInfo) {
      pageInfo.textContent = filtered ? `(1-${filtered})` : "(0-0)";
    }
  };

  const renderEmptyState = (grid, message = "The Roblox catalog data could not be loaded right now.") => {
    grid.classList.add("is-empty");
    grid.innerHTML = `
      <div class="cards-empty-state">${escapeHtml(message)}</div>
    `;
  };

  const renderCatalogView = () => {
    const { mount, grid, cards, statusMap, filters } = catalogState;
    if (!mount || !grid) return;

    const filteredCards = cards.filter((card) => matchesFilters(card, statusMap, filters));
    const sortedCards = sortCards(filteredCards, statusMap, filters.sort);

    updateSummary(mount, sortedCards.length, cards.length);

    if (!sortedCards.length) {
      renderEmptyState(grid, "No exploits match the current filters.");
      return;
    }

    grid.classList.remove("is-empty");
    grid.innerHTML = sortedCards.map((card) => renderCard(card, statusMap)).join("");
  };

  const loadCatalog = async () => {
    const prices = await fetchJson(`${DATA_ROOT}/prices.json`);
    const slugs = Object.keys(prices);

    const infoEntries = await Promise.all(
      slugs.map(async (slug, catalogIndex) => {
        const folderName = getFolderName(slug);

        try {
          const info = await fetchJson(`${DATA_ROOT}/${encodeURIComponent(folderName)}/info.json`);
          if (info.hidden) return null;

          return {
            slug,
            title: folderName,
            folderName,
            catalogIndex,
            pricing: prices[slug],
            info,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      }),
    );

    const visibleEntries = infoEntries.filter(Boolean);

    const cards = await Promise.all(
      visibleEntries.map(async (entry) => {
        try {
          const [points, modals, suncSummary] = await Promise.all([
            fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/points.json`),
            fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/modals.json`, {
              optional: true,
            }),
            entry.info.type === "external" ? Promise.resolve(null) : loadSuncSummary(entry.info),
          ]);

          const offers = flattenOffers(entry.pricing);
          const hasFreeOffer = offers.some((offer) => Number(offer.price) === 0);
          const hasPaidOffer = offers.some((offer) => Number(offer.price) > 0);
          const paidPrices = offers
            .map((offer) => Number(offer.price))
            .filter((price) => Number.isFinite(price) && price > 0);

          return {
            ...entry,
            points: points ?? {},
            modals,
            offers,
            hasFreeOffer,
            hasPaidOffer,
            minPaidPrice: paidPrices.length ? Math.min(...paidPrices) : Number.POSITIVE_INFINITY,
            isKeyed: inferKeyedState(entry.info, points ?? {}, offers),
            cardType: entry.info.type === "external" ? "external" : "executor",
            searchText: buildSearchText([
              entry.title,
              entry.slug,
              buildMetaText(entry.info),
              entry.info.tags,
              points?.pro_summary,
              points?.neutral_summary,
              points?.con_summary,
            ]),
            suncSummary,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      }),
    );

    return cards.filter(Boolean);
  };

  const initRobloxCardsCatalog = async (mount) => {
    if (!mount) return;

    const grid = mount.querySelector(".cards-grid");
    if (!grid) return;

    if (mount.dataset.warningModalBound !== "true") {
      mount.addEventListener("click", handleWarningActionClick);
      mount.dataset.warningModalBound = "true";
    }

    try {
      const [cards, statusMap] = await Promise.all([loadCatalog(), loadUptimeStatus()]);
      if (!cards.length) {
        updateSummary(mount, 0, 0);
        renderEmptyState(grid);
        return;
      }

      catalogState.mount = mount;
      catalogState.grid = grid;
      catalogState.cards = cards;
      catalogState.statusMap = statusMap;
      catalogState.filters = normalizeFilters({
        ...window.getRobloxCardsFilterState?.(),
        search: window.getRobloxCardsSearchQuery?.(),
      });
      renderCatalogView();
    } catch (error) {
      console.error(error);
      updateSummary(mount, 0, 0);
      renderEmptyState(grid);
    }
  };

  window.applyRobloxCardsCatalogFilters = (filters = {}) => {
    catalogState.filters = normalizeFilters({ ...catalogState.filters, ...filters });
    window.__robloxCardsSearchQuery = catalogState.filters.search;
    renderCatalogView();
  };
  window.setRobloxCardsSearchQuery = (search = "") => {
    catalogState.filters = normalizeFilters({ ...catalogState.filters, search });
    window.__robloxCardsSearchQuery = catalogState.filters.search;
    renderCatalogView();
  };
  window.getRobloxCardsSearchQuery = () =>
    normalizeLineText(catalogState.filters.search || window.__robloxCardsSearchQuery || "");
  window.initRobloxCardsCatalog = initRobloxCardsCatalog;
})();
