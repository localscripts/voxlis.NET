(() => {
  const {
    dataRoot: DATA_ROOT = "/public/data/roblox",
    statusApiUrl: STATUS_API_URL = "https://api.voxlis.net/api/endpoints",
    suncApiUrl: SUNC_API_URL = "https://api.voxlis.net/api/sunc",
    warningModalEnabled: WARNING_MODAL_ENABLED = false,
    cardNameOverrides: CARD_NAME_OVERRIDES = {},
    platformOrder: PLATFORM_ORDER = ["windows", "macos", "android", "ios"],
    platformLabels: PLATFORM_LABELS = {},
    platformIcons: PLATFORM_ICONS = {},
    tagMetadata: TAG_METADATA = {},
    filterableTags: FILTERABLE_TAGS = [],
    typeLabels: TYPE_LABELS = {},
    defaultFilters: DEFAULT_FILTERS = {
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
  } = window.VOXLIS_CONFIG?.robloxCards ?? {};
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const suncRequestCache = new Map();
  const catalogState = {
    mount: null,
    grid: null,
    cards: [],
    statusMap: {},
    filters: { ...DEFAULT_FILTERS },
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

  const titleCase = (value = "") =>
    value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const normalizePath = (path = "/") => {
    const trimmed = `${path}`.replace(/\/+$/, "");
    return trimmed || "/";
  };

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

  const normalizeMetadataValue = (value = "") => {
    const trimmedValue = String(value).trim();
    if (!trimmedValue) {
      return "";
    }

    const quotedValueMatch = trimmedValue.match(/^(['"])([\s\S]*)\1$/);
    return (quotedValueMatch ? quotedValueMatch[2] : trimmedValue).trim();
  };

  const parseReviewDocument = (source = "") => {
    if (typeof window.parseReviewDocument === "function") {
      return window.parseReviewDocument(source);
    }

    const normalizedSource = String(source).replace(/^\uFEFF/, "");
    const parseMetadataBlock = (metadataSource = "") => {
      const youtubeMatch = String(metadataSource).match(/^\s*youtube\s*:\s*(.+)\s*$/im);
      return {
        youtube: youtubeMatch ? normalizeMetadataValue(youtubeMatch[1]) : "",
      };
    };

    const frontmatterMatch = normalizedSource.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?/);
    if (frontmatterMatch) {
      return {
        metadata: parseMetadataBlock(frontmatterMatch[1]),
        body: normalizedSource.slice(frontmatterMatch[0].length).replace(/^\s+/, ""),
      };
    }

    const inlineYoutubeMatch = normalizedSource.match(/^\s*youtube\s*:\s*(.+?)\s*(?:\r?\n){1,2}/i);
    if (inlineYoutubeMatch) {
      return {
        metadata: {
          youtube: normalizeMetadataValue(inlineYoutubeMatch[1]),
        },
        body: normalizedSource.slice(inlineYoutubeMatch[0].length).replace(/^\s+/, ""),
      };
    }

    return {
      metadata: {
        youtube: "",
      },
      body: normalizedSource,
    };
  };

  const loadReviewDocument = async (path, { optional = false } = {}) => {
    const response = await fetch(path, { cache: "no-cache" });
    if (optional && response.status === 404) {
      return {
        metadata: {
          youtube: "",
        },
        body: "",
        exists: false,
      };
    }

    if (!response.ok) {
      throw new Error(`Failed to load review (${path}): ${response.status}`);
    }

    const source = await response.text();
    return {
      ...parseReviewDocument(source),
      exists: true,
    };
  };

  const buildFreeLifetimeOffers = (platforms = []) => {
    const normalizedPlatforms = Array.isArray(platforms)
      ? [...new Set(platforms.filter((platform) => typeof platform === "string" && platform))]
      : [];
    const fallbackPlatforms = normalizedPlatforms.length ? normalizedPlatforms : ["windows"];

    return fallbackPlatforms.map((platform) => ({
      platform,
      days: -1,
      price: 0,
    }));
  };

  const flattenOffers = (pricing = {}, fallbackOffers = []) => {
    const directOffers = Array.isArray(pricing.offers)
      ? pricing.offers
      : Object.entries(pricing.platforms ?? {}).flatMap(([platform, offers]) =>
          (offers ?? []).map((offer) => ({ ...offer, platform })),
        );

    const sourceOffers = directOffers.length ? directOffers : fallbackOffers;
    return sourceOffers
      .filter((offer) => offer && typeof offer === "object")
      .map((offer) => ({ ...offer, platform: offer.platform || "" }));
  };

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

  const formatOfferSummary = (offer = {}) => {
    const priceLabel = formatCurrency(offer.price, offer.currency);
    const durationLabel = formatDuration(offer.days);
    return durationLabel ? `${priceLabel} ${durationLabel}` : priceLabel;
  };

  const formatFromOfferSummary = (offer = {}) => {
    const priceLabel = formatCurrency(offer.price, offer.currency);
    if (offer.days === 1) {
      return `From ${priceLabel} for 1 day`;
    }

    if (Number.isFinite(offer.days) && offer.days > 1) {
      return `From ${priceLabel} for ${offer.days} days`;
    }

    const durationLabel = formatDuration(offer.days);
    return durationLabel ? `From ${priceLabel} ${durationLabel}` : `From ${priceLabel}`;
  };

  const formatPriceSummary = (offers = []) => {
    if (!Array.isArray(offers) || !offers.length) {
      return "";
    }

    const validOffers = offers
      .filter((offer) => Number.isFinite(Number(offer.price)))
      .map((offer) => ({ ...offer, price: Number(offer.price) }))
      .sort((left, right) => left.price - right.price || left.days - right.days);

    if (!validOffers.length) {
      return "";
    }

    const freeOffer = validOffers.find((offer) => offer.price === 0);
    if (freeOffer) {
      const paidOffer = validOffers.find((offer) => offer.price > 0);
      if (!paidOffer) {
        return "FREE";
      }

      return formatFromOfferSummary(paidOffer).replace(/^From /, "FREE or from ");
    }

    const lowestOffer = validOffers[0];
    if (validOffers.length > 1) {
      return formatFromOfferSummary(lowestOffer);
    }

    return formatOfferSummary(lowestOffer);
  };

  const formatSponsorPriceSummary = (offers = []) => {
    if (!Array.isArray(offers) || !offers.length) {
      return "";
    }

    const validOffers = offers
      .filter((offer) => Number.isFinite(Number(offer.price)))
      .map((offer) => ({ ...offer, price: Number(offer.price) }))
      .sort((left, right) => left.price - right.price || left.days - right.days);

    if (!validOffers.length) {
      return "";
    }

    const freeOffer = validOffers.find((offer) => offer.price === 0);
    const paidOffer = validOffers.find((offer) => offer.price > 0);

    if (freeOffer && !paidOffer) {
      return "FREE";
    }

    if (paidOffer) {
      return `From ${formatCurrency(paidOffer.price, paidOffer.currency)}`;
    }

    return "";
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
  const buildSearchTokens = (parts = []) =>
    [
      ...new Set(
        parts
          .flatMap((part) => (Array.isArray(part) ? part : [part]))
          .filter(Boolean)
          .flatMap((part) => {
            const normalized = normalizeLineText(String(part)).toLowerCase();
            if (!normalized) {
              return [];
            }

            const compact = normalized.replace(/[^a-z0-9]+/g, "");
            return [
              normalized,
              compact,
              ...normalized.split(/[^a-z0-9]+/),
            ].filter((token) => token && token.length >= 2);
          }),
      ),
    ];

  const getSearchTypoDistance = (term = "") => {
    if (term.length < 3) return 0;
    if (term.length >= 6) return 2;
    return 1;
  };

  const boundedLevenshteinDistance = (left = "", right = "", maxDistance = 1) => {
    if (left === right) return 0;

    const leftLength = left.length;
    const rightLength = right.length;
    if (!leftLength) return rightLength;
    if (!rightLength) return leftLength;
    if (Math.abs(leftLength - rightLength) > maxDistance) {
      return maxDistance + 1;
    }

    let previousRow = Array.from({ length: rightLength + 1 }, (_, index) => index);

    for (let leftIndex = 1; leftIndex <= leftLength; leftIndex += 1) {
      const currentRow = [leftIndex];
      let rowMinimum = currentRow[0];

      for (let rightIndex = 1; rightIndex <= rightLength; rightIndex += 1) {
        const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
        const value = Math.min(
          previousRow[rightIndex] + 1,
          currentRow[rightIndex - 1] + 1,
          previousRow[rightIndex - 1] + substitutionCost,
        );
        currentRow.push(value);
        rowMinimum = Math.min(rowMinimum, value);
      }

      if (rowMinimum > maxDistance) {
        return maxDistance + 1;
      }

      previousRow = currentRow;
    }

    return previousRow[rightLength];
  };

  const isLooseSubsequenceMatch = (needle = "", haystack = "") => {
    if (!needle || !haystack || needle.length > haystack.length) {
      return false;
    }

    let needleIndex = 0;

    for (let haystackIndex = 0; haystackIndex < haystack.length; haystackIndex += 1) {
      if (haystack[haystackIndex] === needle[needleIndex]) {
        needleIndex += 1;
        if (needleIndex === needle.length) {
          return haystack.length - needle.length <= 1;
        }
      }
    }

    return false;
  };

  const matchesSearchToken = (term = "", token = "") => {
    const normalizedTerm = term.replace(/[^a-z0-9]+/g, "");
    const normalizedToken = token.replace(/[^a-z0-9]+/g, "");
    if (!normalizedTerm || !normalizedToken) {
      return false;
    }

    if (normalizedToken.includes(normalizedTerm)) {
      return true;
    }

    const maxDistance = getSearchTypoDistance(normalizedTerm);
    if (maxDistance <= 0) {
      return false;
    }

    if (
      normalizedToken[0] === normalizedTerm[0] &&
      boundedLevenshteinDistance(normalizedTerm, normalizedToken, maxDistance) <= maxDistance
    ) {
      return true;
    }

    return isLooseSubsequenceMatch(normalizedTerm, normalizedToken);
  };

  const matchesSearchTerm = (card, term = "") => {
    const normalizedTerm = normalizeLineText(term).toLowerCase();
    if (!normalizedTerm) {
      return true;
    }

    if (card.searchText.includes(normalizedTerm)) {
      return true;
    }

    return (card.searchTokens ?? []).some((token) => matchesSearchToken(normalizedTerm, token));
  };

  const getCombinedPointText = (points = {}) =>
    [points.pro_summary, points.neutral_summary, points.con_summary]
      .map((value) => normalizeLineText(value))
      .filter(Boolean)
      .join(" ");

  const hasInfoTag = (info = {}, tag = "") =>
    Array.isArray(info.tags) && info.tags.includes(tag);

  const isInsecureCard = (card) => hasInfoTag(card?.info, "insecure");
  const getCatalogStats = () => ({
    insecureCount: catalogState.cards.filter((card) => isInsecureCard(card)).length,
  });
  const publishCatalogStats = () => {
    const stats = getCatalogStats();
    document.dispatchEvent(
      new CustomEvent("voxlis:catalog-stats", {
        detail: stats,
      }),
    );
    return stats;
  };

  const inferKeyedState = (info = {}, points = {}, offers = []) => {
    if (typeof info.keyed === "boolean") {
      return info.keyed;
    }

    if (hasInfoTag(info, "freemium")) {
      return true;
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
    const explicitNeutral = normalizeLineText(card.points?.neutral_summary);
    const explicitCon = normalizeLineText(card.points?.con_summary);

    if (explicitGood) {
      lines.push({ className: "good", text: explicitGood });
    }

    if (explicitCon) {
      lines.push({ className: "bad", text: explicitCon });
    } else if (explicitNeutral) {
      lines.push({ className: "warn", text: explicitNeutral });
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

  const getAvailableTitleIconEntries = (modals = {}) => [
    {
      key: "verified",
      iconClass: "fas fa-circle-check",
      iconToneClass: "ph-good-ico",
      title: "Verified",
      message: "This product has a documented and verified more info page.",
      toastIcon: "fa-circle-check",
    },
    {
      key: "trending",
      iconClass: "fas fa-arrow-trend-up",
      title: "Trending",
      message: "This product is currently marked as trending on the catalog.",
      toastIcon: "fa-arrow-trend-up",
    },
    {
      key: "warning",
      iconClass: "fas fa-triangle-exclamation",
      iconToneClass: "ph-warn-ico",
      title: "Warning",
      message:
        modals?.warning?.description ||
        "voxlis.NET recommends reading more about this product before continuing.",
      toastIcon: "fa-triangle-exclamation",
    },
    {
      key: "warningred",
      iconClass: "fas fa-triangle-exclamation",
      iconToneClass: "ph-warn-red-ico",
      title: "High-Risk Warning",
      message:
        modals?.warningred?.description ||
        "This product has a high-risk warning on voxlis.NET.",
      toastIcon: "fa-triangle-exclamation",
    },
  ];

  const getTitleIconEntries = (info = {}, modals = {}) => {
    const availableEntries = getAvailableTitleIconEntries(modals);
    const warningConfig = getModalWarningConfig(modals);
    const activeKeys = new Set();

    if (Array.isArray(info.badges) && info.badges.includes("verified")) {
      activeKeys.add("verified");
    }

    if (Array.isArray(info.badges) && info.badges.includes("trending")) {
      activeKeys.add("trending");
    }

    if (warningConfig?.variant === "warning") {
      activeKeys.add("warning");
    }

    if (warningConfig?.variant === "warningred") {
      activeKeys.add("warningred");
    }

    return availableEntries.filter((entry) => activeKeys.has(entry.key));
  };

  const renderInfoIconMarkup = ({ iconClass, iconMarkup = "", iconToneClass = "", assetIcon = "" }) =>
    iconMarkup ||
    (assetIcon
      ? `<span class="ph-asset-icon${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" style="--ph-asset-icon: url('/public/assets/${escapeHtml(assetIcon)}')" aria-hidden="true"></span>`
      : `<i class="${escapeHtml(iconClass)}${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" aria-hidden="true"></i>`);

  const buildInfoIconButton = ({
    key = "",
    iconClass,
    iconMarkup = "",
    iconToneClass = "",
    assetIcon = "",
    buttonClass = "ph-title-icon-btn",
    title,
    message,
    toastIcon = "fa-circle-info",
  }) =>
    `
      <button
        class="${escapeHtml(buttonClass)}"
        type="button"
        aria-label="${escapeHtml(title)}"
        title="Click to view"
        data-card-icon-title="${escapeHtml(title)}"
        data-card-icon-message="${escapeHtml(message)}"
        data-card-icon-toast-icon="${escapeHtml(toastIcon)}"
        ${key ? `data-card-icon-key="${escapeHtml(key)}"` : ""}
      >
        ${renderInfoIconMarkup({ iconClass, iconMarkup, iconToneClass, assetIcon })}
      </button>
    `;

  const buildTitleIcons = (info, modals) => {
    const icons = getTitleIconEntries(info, modals).map((entry) => buildInfoIconButton(entry));
    return icons.length ? ` ${icons.join(" ")}` : "";
  };

  const getTagEntry = (tag) => {
    const normalizedTag = normalizeLineText(tag);
    if (!normalizedTag) {
      return null;
    }

    const tagMeta = TAG_METADATA[normalizedTag] ?? {
      icon: "fas fa-circle-info",
      label: titleCase(normalizedTag),
      message: `${titleCase(normalizedTag)} is supported by this product.`,
    };

    return {
      key: `tag:${normalizedTag}`,
      iconClass: tagMeta.icon,
      iconMarkup: tagMeta.iconMarkup,
      iconToneClass: tagMeta.iconToneClass || "",
      assetIcon: tagMeta.assetIcon || "",
      title: tagMeta.label,
      message: tagMeta.message || `${tagMeta.label} is supported by this product.`,
      toastIcon: "fa-circle-info",
    };
  };

  const getAvailableTagEntries = () =>
    Object.keys(TAG_METADATA)
      .map((tag) => getTagEntry(tag))
      .filter(Boolean);

  const getActiveTagEntries = (info = {}) =>
    (Array.isArray(info.tags) ? info.tags : [])
      .map((tag) => getTagEntry(tag))
      .filter(Boolean);

  const buildTitleIconModalContent = (card) => {
    const activeEntries = [
      ...getTitleIconEntries(card?.info, card?.modals),
      ...getActiveTagEntries(card?.info),
    ];
    if (!activeEntries.length) {
      return "";
    }

    const renderEntries = (entries) => `
      <ul class="info-modal-notice-list" aria-label="Notification meanings">
        ${entries
          .map(
            (entry) => `
              <li class="info-modal-notice-item" data-info-modal-key="${escapeHtml(entry.key || "")}">
                <span class="info-modal-notice-icon" aria-hidden="true">
                  ${renderInfoIconMarkup(entry)}
                </span>
                <div class="info-modal-notice-copy">
                  <p class="info-modal-notice-title">${escapeHtml(entry.title)}</p>
                  <p class="info-modal-notice-text">${escapeHtml(entry.message)}</p>
                </div>
              </li>
            `,
          )
          .join("")}
      </ul>
    `;

    const activeHeading = card?.title ? `${card.title} Tags` : "Current Tags";

    return `
      <section class="info-modal-notice-group is-current-tags" aria-label="${escapeHtml(activeHeading)}">
        <p class="info-modal-notice-heading">${escapeHtml(activeHeading)}</p>
        ${renderEntries(activeEntries)}
      </section>
    `;
  };

  const buildPlatformText = (info) => {
    const platforms = Array.isArray(info.platforms)
      ? [...new Set(info.platforms.filter(Boolean))]
      : [];
    const hasAndroid = platforms.includes("android");
    const hasIos = platforms.includes("ios");
    const collapseMobile = hasAndroid && hasIos;
    const labels = [];
    let mobileAdded = false;

    platforms.forEach((platform) => {
      if (collapseMobile && (platform === "ios" || platform === "android")) {
        if (!mobileAdded) {
          labels.push("Mobile");
          mobileAdded = true;
        }
        return;
      }

      labels.push(PLATFORM_LABELS[platform] ?? titleCase(platform));
    });

    return labels.filter(Boolean).join(" + ");
  };

  const buildTypeText = (info) => TYPE_LABELS[info.type] ?? "";

  const buildMetaText = (info) => {
    const platformLabel = buildPlatformText(info);
    const typeLabel = buildTypeText(info);
    const fragments = [];

    if (platformLabel) {
      fragments.push(platformLabel);
    }
    if (typeLabel) {
      fragments.push(typeLabel);
    }

    return fragments.join(" | ");
  };

  const buildTagChipMarkup = (tags = []) => {
    const normalizedTags = Array.isArray(tags)
      ? tags.map((tag) => normalizeLineText(tag)).filter(Boolean)
      : [];

    if (!normalizedTags.length) {
      return "";
    }

    return `
      <span class="ph-title-tags" aria-label="Feature tags">
        ${normalizedTags
          .map((tag) => {
            const tagEntry = getTagEntry(tag) ?? {
              key: `tag:${tag}`,
              iconClass: "fas fa-tag",
              iconMarkup: "",
              iconToneClass: "",
              assetIcon: "",
              title: titleCase(tag),
              message: `${titleCase(tag)} is supported by this product.`,
            };
            const extraButtonClasses = [
              tag === "kernel" ? "is-kernel-tag" : "",
              tag === "usermode" ? "is-usermode-tag" : "",
              tag === "insecure" ? "is-insecure-tag" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return buildInfoIconButton({
              key: tagEntry.key,
              buttonClass: `ph-meta-tag-btn${extraButtonClasses ? ` ${extraButtonClasses}` : ""}`,
              iconClass: tagEntry.iconClass,
              iconMarkup: tagEntry.iconMarkup,
              iconToneClass: tagEntry.iconToneClass || "",
              assetIcon: tagEntry.assetIcon || "",
              title: tagEntry.title,
              message: tagEntry.message || `${tagEntry.title} is supported by this product.`,
              toastIcon: "fa-circle-info",
            });
          })
          .join("")}
      </span>
    `;
  };

  const buildCardMetaMarkup = (card, statusMap) => {
    const platformText = buildPlatformText(card.info);
    const typeText = buildTypeText(card.info);
    const tagMarkup = buildTagChipMarkup(card.info.tags);
    const priceSummary = formatPriceSummary(card.offers);
    const textLabel =
      platformText && !tagMarkup && typeText
        ? `${platformText} | ${typeText}`
        : platformText || typeText;

    return `
      <p class="ph-title-meta">
        <span class="ph-title-meta-main">
          ${buildPlatformIconMarkup(card, statusMap)}
          ${textLabel ? `<span class="ph-title-meta-text">${escapeHtml(textLabel)}</span>` : ""}
          ${textLabel && tagMarkup ? '<span class="ph-title-meta-sep" aria-hidden="true">|</span>' : ""}
          ${tagMarkup}
        </span>
        ${priceSummary ? `<span class="ph-title-price">${escapeHtml(priceSummary)}</span>` : ""}
      </p>
    `;
  };

  const getPlatformStateClass = (card, statusMap, platform) => {
    const platformState = statusMap[card.slug]?.[platform];
    if (platformState === true) {
      return "is-updated";
    }

    if (platformState === false) {
      return "is-not-updated";
    }

    return "is-status-unknown";
  };

  const buildPlatformIconMarkup = (card, statusMap) => {
    const platforms = Array.isArray(card.info.platforms) ? card.info.platforms.filter(Boolean) : [];
    if (!platforms.length) {
      return `
        <span class="ph-platform-icons" aria-hidden="true">
          <i class="fas fa-microchip ph-title-meta-ico is-status-unknown"></i>
        </span>
      `;
    }

    return `
      <span class="ph-platform-icons" aria-hidden="true">
        ${platforms
          .map((platform) => {
            const iconClass = PLATFORM_ICONS[platform] ?? "fas fa-microchip";
            const statusClass = getPlatformStateClass(card, statusMap, platform);
            const label = PLATFORM_LABELS[platform] ?? titleCase(platform);
            return `<i class="${escapeHtml(iconClass)} ph-title-meta-ico ${statusClass}" title="${escapeHtml(label)}"></i>`;
          })
          .join("")}
      </span>
    `;
  };

  const buildReviewDescription = () => "";

  const getCardReviewUrl = (card) =>
    card?.reviewUrl || `${DATA_ROOT}/${encodeURIComponent(card?.folderName || card?.title || "Exploit")}/review.md`;

  const getCardMoreInfoPath = (cardOrSlug) => {
    const slug =
      typeof cardOrSlug === "string"
        ? cardOrSlug
        : String(cardOrSlug?.slug || "").trim();

    return slug ? `/${encodeURIComponent(slug)}/` : "";
  };

  const buildCardMoreInfoOptions = (card) => {
    if (!card) {
      return null;
    }

    const summaryLines = buildSummaryLines(card);
    const warningConfig = getModalWarningConfig(card.modals);

    return {
      title: card.title || "More info",
      description: buildReviewDescription(card, summaryLines),
      reviewUrl: getCardReviewUrl(card),
      websiteUrl:
        card.info?.website ||
        card.pricing?.purchaseUrl ||
        card.pricing?.purchase_url ||
        "",
      websiteWarningConfig: warningConfig,
      modalPath: getCardMoreInfoPath(card),
    };
  };

  const buildRatingMarkup = (card) => {
    const info = card?.info ?? {};
    if (info.type === "external") {
      return `
        <div class="ph-rating ph-rating-external" aria-label="External">
          <span class="ph-rating-external-main">External</span>
          <span class="ph-rating-external-sub">Menu</span>
        </div>
      `;
    }

    const suncSource = getPrimarySuncSource(info);
    const tracked = Boolean(suncSource);
    const scoreLabel =
      tracked && Number.isFinite(card?.suncSummary?.score)
        ? `${card.suncSummary.score}%`
        : tracked
          ? "sUNC"
          : "None";
    const ratingMarkup = `
      <span class="ph-rating-logo" aria-hidden="true">
        <span class="ph-rating-logo-main"></span>
        <span class="ph-rating-logo-s"></span>
      </span>
      <span class="ph-rating-val">${escapeHtml(scoreLabel)}</span>
    `;

    if (!tracked) {
      return `
        <div class="ph-rating is-none">
          ${ratingMarkup}
        </div>
      `;
    }

    return `
      <button
        class="ph-rating ph-rating-btn"
        type="button"
        data-card-sunc-open
        aria-label="Open ${escapeHtml(card?.title || "this card")} sUNC widget"
        title="Open sUNC widget"
      >
        ${ratingMarkup}
      </button>
    `;
  };

  const buildActionMarkup = ({
    slug,
    title,
    reviewUrl,
    reviewDescription,
    youtubeUrl,
    hasYoutubeIndicator,
    websiteUrl,
    purchaseUrl,
    offers,
    warningConfig,
  }) => {
    const reviewHref = String(youtubeUrl || "").trim();
    const reviewButtonAttributes = reviewHref
      ? ` href="${escapeHtml(reviewHref)}" target="_blank" rel="noopener noreferrer"`
      : ` aria-disabled="true" tabindex="-1"`;
    const websiteHref = websiteUrl || purchaseUrl || "#";
    const websiteDataAttributes =
      websiteHref !== "#"
        ? ` data-card-website-url="${escapeHtml(websiteHref)}"`
        : "";
    const websiteWarningDataAttributes =
      WARNING_MODAL_ENABLED && warningConfig && websiteHref !== "#"
        ? ` data-card-website-warning-type="${escapeHtml(warningConfig.type)}" data-card-website-warning-title="${escapeHtml(warningConfig.title || "")}" data-card-website-warning-description="${escapeHtml(warningConfig.description || "")}"`
        : "";
    const hasFreeOffer = Array.isArray(offers) && offers.some((offer) => Number(offer.price) === 0);
    const hasPaidOffer = Array.isArray(offers) && offers.some((offer) => Number(offer.price) > 0);
    const sponsorPriceSummary = formatSponsorPriceSummary(offers);
    const sponsorMarkup = /key-empire\.com/i.test(purchaseUrl ?? "")
      ? `
        <a class="ph-sponsor-btn is-keyempire" href="${escapeHtml(purchaseUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Buy on Key-Empire"${WARNING_MODAL_ENABLED && warningConfig ? ` data-card-warning-slug="${escapeHtml(slug)}"` : ""}>
          <span class="ph-sponsor-inline">
            <span class="ph-sponsor-copy">Buy on</span>
            <span class="ph-sponsor-stack" aria-hidden="true">
              <img class="ph-sponsor-base-image" src="/public/assets/logo/keyempire-text.png" alt="">
              <span class="ph-sponsor-overlay-image"></span>
            </span>
            ${sponsorPriceSummary ? `<span class="ph-sponsor-price">${escapeHtml(sponsorPriceSummary)}</span>` : ""}
          </span>
        </a>
      `
      : hasFreeOffer
        ? `
          <div class="ph-sponsor-btn ph-sponsor-note" role="note">
            <span class="ph-sponsor-note-content">
              <i class="fas fa-key" aria-hidden="true"></i>
              <span>This product is free to use</span>
            </span>
          </div>
        `
        : hasPaidOffer
          ? `
            <div class="ph-sponsor-btn ph-sponsor-note" role="note">
              This product is not on Key-Empire
            </div>
          `
          : "";

    return `
      <div class="ph-actions">
        <div class="ph-primary-actions">
          <a class="ph-action-btn is-review${hasYoutubeIndicator ? " has-youtube-indicator" : " is-disabled"}"${reviewButtonAttributes}>
            <i class="fab fa-youtube" aria-hidden="true"></i> <span class="ph-action-label">Review</span>
          </a>
          <a class="ph-action-btn is-more${hasYoutubeIndicator ? " has-youtube-indicator" : ""}" href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer" data-card-review-url="${escapeHtml(reviewUrl)}" data-card-review-title="${escapeHtml(title)}" data-card-review-description="${escapeHtml(reviewDescription || "")}"${websiteDataAttributes}${websiteWarningDataAttributes}>
            <span class="ph-action-icon is-info" aria-hidden="true"></span> More
          </a>
        </div>
        ${sponsorMarkup}
      </div>
    `;
  };

  const handleMoreInfoActionClick = (event) => {
    const trigger = event.target.closest("a[data-card-review-url]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    const article = trigger.closest("article[data-slug]");
    const slug = article?.dataset.slug || "";
    const card = catalogState.cards.find((entry) => entry.slug === slug);
    const modalOptions =
      buildCardMoreInfoOptions(card) || {
        title: trigger.dataset.cardReviewTitle || "More info",
        description: trigger.dataset.cardReviewDescription || "",
        reviewUrl: trigger.dataset.cardReviewUrl || trigger.getAttribute("href") || "",
        websiteUrl: trigger.dataset.cardWebsiteUrl || "",
        websiteWarningConfig: trigger.dataset.cardWebsiteWarningType
          ? {
              type: trigger.dataset.cardWebsiteWarningType,
              title: trigger.dataset.cardWebsiteWarningTitle || "Important warning",
              description: trigger.dataset.cardWebsiteWarningDescription || "",
            }
          : null,
        modalPath: getCardMoreInfoPath(slug),
      };
    const opened = window.openMoreInfoModal?.(modalOptions) ?? false;

    if (opened || !trigger.href) {
      return;
    }

    window.open(trigger.href, trigger.getAttribute("target") || "_blank", "noopener");
  };

  const handleSuncActionClick = (event) => {
    const trigger = event.target.closest("button[data-card-sunc-open]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const article = trigger.closest("article[data-slug]");
    const slug = article?.dataset.slug || "";
    const card = catalogState.cards.find((entry) => entry.slug === slug);
    const source = getPrimarySuncSource(card?.info);
    if (!source) {
      return;
    }

    const opened =
      window.openSuncModal?.({
        title: card?.title ? `${card.title} sUNC` : "sUNC Widget",
        scrapId: source.scrapId,
        key: source.key,
      }) ?? false;

    if (!opened) {
      const fallbackUrl = `https://sunc.rubis.app/?scrap=${encodeURIComponent(source.scrapId)}&key=${encodeURIComponent(source.key)}`;
      window.open(fallbackUrl, "_blank", "noopener");
    }
  };

  const handleTitleIconClick = (event) => {
    const trigger = event.target.closest("button[data-card-icon-message]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const article = trigger.closest("article[data-slug]");
    const slug = article?.dataset.slug || "";
    const card = catalogState.cards.find((entry) => entry.slug === slug);
    const contentHtml = buildTitleIconModalContent(card);
    const highlightContentKey = trigger.dataset.cardIconKey || "";
    const opened =
      contentHtml &&
      (window.openMoreInfoModal?.({
        title: card?.title ? `${card.title} Tags` : "Card Tags",
        description: "",
        contentHtml,
        highlightContentKey,
        preserveTitle: true,
        hideWebsiteButton: true,
      }) ??
        false);

    if (opened) {
      return;
    }

    const title = trigger.dataset.cardIconTitle || "Notice";
    const message = trigger.dataset.cardIconMessage || "";
    window.showSiteToast?.({
      key: `card-icon-info:${title}:${message}`,
      title,
      message,
      duration: 3000,
      icon: trigger.dataset.cardIconToastIcon || "fa-circle-info",
    });
  };

  const handleWarningActionClick = (event) => {
    if (!WARNING_MODAL_ENABLED) {
      return;
    }

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
    const action = {
      href: trigger.href,
      target: trigger.getAttribute("target") || "",
    };
    const opened = window.openCardWarningModal?.(warningConfig, action) ?? false;

    if (opened) {
      return;
    }

    if (action.target === "_blank") {
      window.open(action.href, "_blank", "noopener");
      return;
    }

    window.location.assign(action.href);
  };

  const handleCardActionClick = (event) => {
    handleTitleIconClick(event);
    if (event.defaultPrevented) {
      return;
    }

    handleSuncActionClick(event);
    if (event.defaultPrevented) {
      return;
    }

    handleMoreInfoActionClick(event);
    if (event.defaultPrevented) {
      return;
    }

    handleWarningActionClick(event);
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
  const hasWarningBadge = (card) => Boolean(getModalWarningConfig(card?.modals));

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

  const compareRandom = (left, right) => {
    const randomRank = (left.randomSortKey ?? 0) - (right.randomSortKey ?? 0);
    if (randomRank !== 0) return randomRank;

    return (left.catalogIndex ?? 0) - (right.catalogIndex ?? 0);
  };

  const getSortablePrice = (card) => {
    if (card.hasFreeOffer) return 0;
    if (Number.isFinite(card.minPaidPrice)) return card.minPaidPrice;
    return Number.POSITIVE_INFINITY;
  };

  const normalizeFilters = (filters = {}) => ({
    search: normalizeLineText(filters.search || ""),
    sort: filters.sort === "recommended" ? "random" : filters.sort || DEFAULT_FILTERS.sort,
    platforms: Array.isArray(filters.platforms)
      ? filters.platforms.filter((platform) => PLATFORM_ORDER.includes(platform))
      : [],
    price: filters.price || DEFAULT_FILTERS.price,
    key: filters.key || DEFAULT_FILTERS.key,
    type: filters.type || DEFAULT_FILTERS.type,
    tags: [
      ...new Set(
        [
          ...(Array.isArray(filters.tags) ? filters.tags : []),
          filters.multiInstance ? "multi-instance" : "",
          filters.decompiler ? "decompiler" : "",
          filters.kernel ? "kernel" : "",
        ].filter((tag) => FILTERABLE_TAGS.includes(tag)),
      ),
    ],
    verified: Boolean(filters.verified),
    trending: Boolean(filters.trending),
    warning: Boolean(filters.warning),
    updatedState: ["all", "yes", "no"].includes(filters.updatedState) ? filters.updatedState : DEFAULT_FILTERS.updatedState,
    showInsecure: Boolean(filters.showInsecure),
  });

  const matchesFilters = (card, statusMap, filters) => {
    if (!filters.showInsecure && isInsecureCard(card)) {
      return false;
    }

    const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length && !searchTerms.every((term) => matchesSearchTerm(card, term))) {
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

    if (filters.trending && !hasTrendingBadge(card)) {
      return false;
    }

    if (filters.warning && !hasWarningBadge(card)) {
      return false;
    }

    const cardStatusClass = getCardStatusClass(card, statusMap);
    if (filters.updatedState === "yes" && cardStatusClass !== "is-updated") {
      return false;
    }

    if (filters.updatedState === "no" && cardStatusClass === "is-updated") {
      return false;
    }

    if (filters.tags.length && !filters.tags.every((tag) => hasInfoTag(card.info, tag))) {
      return false;
    }

    if (filters.highSunc && !(Number.isFinite(card.suncSummary?.score) && card.suncSummary.score >= 90)) {
      return false;
    }

    return true;
  };

  const sortCards = (cards, statusMap, sort = DEFAULT_FILTERS.sort) =>
    [...cards].sort((left, right) => {
      const trendingRank = Number(hasTrendingBadge(right)) - Number(hasTrendingBadge(left));
      if (trendingRank !== 0) return trendingRank;

      if (sort === "most-popular") {
        const popularityRank =
          Number(hasVerifiedBadge(right)) - Number(hasVerifiedBadge(left));
        if (popularityRank !== 0) return popularityRank;
        return compareRandom(left, right);
      }

      if (sort === "least-popular") {
        const popularityRank =
          Number(hasVerifiedBadge(left)) - Number(hasVerifiedBadge(right));
        if (popularityRank !== 0) return popularityRank;
        return compareRandom(left, right);
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

      return compareRandom(left, right);
    });

  const renderCard = (card, statusMap) => {
    const reviewUrl = getCardReviewUrl(card);
    const summaryLines = buildSummaryLines(card);
    const reviewDescription = buildReviewDescription(card, summaryLines);
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
        class="exploit-card-placeholder ${statusClass}${hasTrendingBadge(card) ? " is-trending" : ""}"
        data-slug="${escapeHtml(card.slug)}"
        data-title="${escapeHtml(card.title)}"
        data-platforms="${escapeHtml((card.info.platforms ?? []).join(","))}"
        data-status="${escapeHtml(statusClass)}"
      >
        <div class="ph-head">
          <div class="ph-head-main">
            <h3 class="ph-title">${escapeHtml(card.title)}${buildTitleIcons(card.info, card.modals)}</h3>
          </div>
          ${buildRatingMarkup(card)}
        </div>
        ${lineMarkup}
        ${buildCardMetaMarkup(card, statusMap)}
        ${buildActionMarkup({
          slug: card.slug,
          title: card.title,
          reviewUrl,
          reviewDescription,
          youtubeUrl: card.youtubeUrl,
          hasYoutubeIndicator: Boolean(card.youtubeUrl),
          websiteUrl: card.info.website,
          purchaseUrl: card.pricing.purchaseUrl || card.pricing.purchase_url,
          offers: card.offers,
          warningConfig,
        })}
      </article>
    `;
  };

  const SUMMARY_FIT_MOBILE_QUERY = "(max-width: 640px)";
  const SUMMARY_FIT_MIN_SIZE_PX = 11;
  const SUMMARY_FIT_MAX_SIZE_PX = 18;

  const fitSummaryText = (mount) => {
    const summaryMain = mount?.querySelector(".sts-main");
    const summaryText = mount?.querySelector(".sts-txt");
    if (!summaryMain || !summaryText) {
      return;
    }

    if (!window.matchMedia(SUMMARY_FIT_MOBILE_QUERY).matches) {
      summaryText.style.removeProperty("font-size");
      return;
    }

    const availableWidth = summaryMain.clientWidth;
    if (!availableWidth) {
      return;
    }

    let nextSize = SUMMARY_FIT_MAX_SIZE_PX;
    summaryText.style.fontSize = `${nextSize}px`;

    while (nextSize > SUMMARY_FIT_MIN_SIZE_PX && summaryText.scrollWidth > availableWidth) {
      nextSize -= 0.5;
      summaryText.style.fontSize = `${nextSize}px`;
    }
  };

  const scheduleSummaryTextFit = (mount) => {
    window.requestAnimationFrame(() => {
      fitSummaryText(mount);
    });
  };

  const bindSummaryTextFit = (mount) => {
    if (!mount) {
      return;
    }

    if (mount.dataset.summaryTextFitBound === "true") {
      scheduleSummaryTextFit(mount);
      return;
    }

    const summaryMain = mount.querySelector(".sts-main");
    if (!summaryMain) {
      return;
    }

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        scheduleSummaryTextFit(mount);
      });
      observer.observe(summaryMain);
      mount._summaryTextFitObserver = observer;
    } else {
      window.addEventListener("resize", () => {
        scheduleSummaryTextFit(mount);
      });
    }

    mount.dataset.summaryTextFitBound = "true";
    scheduleSummaryTextFit(mount);
  };

  const updateSummary = (
    mount,
    filtered,
    total = filtered,
    updatedCount = 0,
    notUpdatedCount = 0,
  ) => {
    const filteredCount = mount.querySelector(".fltrd-cnt");
    const totalCount = mount.querySelector(".ttl-cnt");
    const pageInfo = mount.querySelector(".page-info");
    const updatedStatusCount = mount.querySelector(".updt-cnt");
    const notUpdatedStatusCount = mount.querySelector(".down-cnt");
    const showingCount = mount.querySelector(".show-cnt");

    if (filteredCount) filteredCount.textContent = String(filtered);
    if (totalCount) totalCount.textContent = String(total);
    if (pageInfo) {
      pageInfo.textContent = filtered ? `(1-${filtered})` : "(0-0)";
    }
    if (updatedStatusCount) updatedStatusCount.textContent = String(updatedCount);
    if (notUpdatedStatusCount) notUpdatedStatusCount.textContent = String(notUpdatedCount);
    if (showingCount) showingCount.textContent = `Showing ${filtered}/${total}`;

    scheduleSummaryTextFit(mount);
  };

  const renderEmptyState = (grid, message = "The Roblox catalog data could not be loaded right now.") => {
    grid.classList.add("is-empty");
    grid.innerHTML = `
      <div class="cards-empty-state">${escapeHtml(message)}</div>
    `;
  };

  const renderLoadingState = (grid, message = "Fetching API status...") => {
    grid.classList.add("is-empty");
    grid.innerHTML = `
      <div class="cards-loading-state" role="status" aria-live="polite">
        <img class="cards-loading-gif" src="/public/assets/loading.gif" alt="" />
        <p class="cards-loading-copy">${escapeHtml(message)}</p>
      </div>
    `;
  };

  const renderCatalogView = () => {
    const { mount, grid, cards, statusMap, filters } = catalogState;
    if (!mount || !grid) return;

    const discoverableCards = cards.filter((card) => filters.showInsecure || !isInsecureCard(card));
    const filteredCards = discoverableCards.filter((card) => matchesFilters(card, statusMap, filters));
    const sortedCards = sortCards(filteredCards, statusMap, filters.sort);
    const updatedCount = sortedCards.reduce(
      (count, card) => count + (getCardStatusClass(card, statusMap) === "is-updated" ? 1 : 0),
      0,
    );
    const notUpdatedCount = sortedCards.reduce(
      (count, card) => count + (getCardStatusClass(card, statusMap) === "is-not-updated" ? 1 : 0),
      0,
    );

    updateSummary(mount, sortedCards.length, discoverableCards.length, updatedCount, notUpdatedCount);

    if (!sortedCards.length) {
      renderEmptyState(grid, "No exploits match the current filters.");
      return;
    }

    grid.classList.remove("is-empty");
    grid.innerHTML = sortedCards.map((card) => renderCard(card, statusMap)).join("");
  };

  const loadCatalog = async () => {
    const prices = await fetchJson(`${DATA_ROOT}/prices.json`);
    const freeProductSlugs = [
      ...(Array.isArray(prices.freeProducts) ? prices.freeProducts : []),
      ...(Array.isArray(prices.$freeProducts) ? prices.$freeProducts : []),
    ].filter((slug) => typeof slug === "string" && slug);
    const freeProducts = new Set(freeProductSlugs.map((slug) => slug.toLowerCase()));
    const priceSlugs = Object.keys(prices).filter((slug) => slug !== "freeProducts" && !slug.startsWith("$"));
    const slugs = [...new Set([...priceSlugs, ...freeProductSlugs])];

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
            pricing: prices[slug] ?? {},
            isListedFree: freeProducts.has(slug.toLowerCase()),
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
          const reviewUrl = `${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/review.md`;
          const [points, modals, reviewDocument, suncSummary] = await Promise.all([
            fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/points.json`),
            fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/modals.json`, {
              optional: true,
            }),
            loadReviewDocument(reviewUrl, { optional: true }),
            entry.info.type === "external" ? Promise.resolve(null) : loadSuncSummary(entry.info),
          ]);

          const fallbackOffers = entry.isListedFree ? buildFreeLifetimeOffers(entry.info.platforms) : [];
          const offers = flattenOffers(entry.pricing, fallbackOffers);
          const hasFreeOffer = offers.some((offer) => Number(offer.price) === 0);
          const hasPaidOffer = offers.some((offer) => Number(offer.price) > 0);
          const youtubeUrl = String(entry.info.youtube || reviewDocument?.metadata?.youtube || "").trim();
          const paidPrices = offers
            .map((offer) => Number(offer.price))
            .filter((price) => Number.isFinite(price) && price > 0);

          return {
            ...entry,
            points: points ?? {},
            modals,
            offers,
            reviewUrl,
            youtubeUrl,
            randomSortKey: Math.random(),
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
            searchTokens: buildSearchTokens([
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

    if (mount.dataset.cardActionBound !== "true") {
      mount.addEventListener("click", handleCardActionClick);
      mount.dataset.cardActionBound = "true";
    }

    bindSummaryTextFit(mount);
    updateSummary(mount, 0, 0);
    renderLoadingState(grid);
    window.getRobloxCardsCatalogStats = getCatalogStats;

    try {
      const [cards, statusMap] = await Promise.all([loadCatalog(), loadUptimeStatus()]);
      if (!cards.length) {
        catalogState.cards = [];
        publishCatalogStats();
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
      publishCatalogStats();
      window.registerMoreInfoModalPathResolver?.((path) => {
        const normalizedTargetPath = normalizePath(path).toLowerCase();
        const targetCard = catalogState.cards.find(
          (entry) => normalizePath(getCardMoreInfoPath(entry)).toLowerCase() === normalizedTargetPath,
        );

        return targetCard ? buildCardMoreInfoOptions(targetCard) : null;
      });
      renderCatalogView();
    } catch (error) {
      console.error(error);
      catalogState.cards = [];
      publishCatalogStats();
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
  window.getRobloxCardsCatalogStats = getCatalogStats;
  window.initRobloxCardsCatalog = initRobloxCardsCatalog;
})();





