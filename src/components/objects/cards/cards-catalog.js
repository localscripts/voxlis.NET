(() => {
  const PAGE_KEY = window.VOXLIS_PAGE?.key || "roblox";
  const ACTIVE_CATALOG = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
  const {
    dataRoot: DATA_ROOT = "/public/data/roblox",
    statusApiUrl: STATUS_API_URL = "https://api.voxlis.net/api/endpoints",
    suncApiUrl: SUNC_API_URL = "https://api.voxlis.net/api/sunc",
    pricingFallbackUrl: PRICING_FALLBACK_URL = "",
    warningModalEnabled: WARNING_MODAL_ENABLED = false,
    cardNameOverrides: CARD_NAME_OVERRIDES = {},
    cardFolderOverrides: CARD_FOLDER_OVERRIDES = {},
    platformOrder: PLATFORM_ORDER = ["windows", "macos", "android", "ios"],
    platformLabels: PLATFORM_LABELS = {},
    platformIcons: PLATFORM_ICONS = {},
    tagMetadata: TAG_METADATA = {},
    filterableTags: FILTERABLE_TAGS = [],
    typeLabels: TYPE_LABELS = {},
    routeBasePath: ROUTE_BASE_PATH = `/${PAGE_KEY}`,
    labels: PAGE_LABELS = {},
    sortOptions: SORT_OPTIONS = [],
    segmentFilters: SEGMENT_FILTER_DEFINITIONS = [],
    showOnlyFilterOptions: SHOW_ONLY_FILTER_DEFINITIONS = [],
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
  } = ACTIVE_CATALOG;
  const FORCE_ISSUES =
    ACTIVE_CATALOG.forceissues && typeof ACTIVE_CATALOG.forceissues === "object"
      ? ACTIVE_CATALOG.forceissues
      : ACTIVE_CATALOG.forceIssues && typeof ACTIVE_CATALOG.forceIssues === "object"
        ? ACTIVE_CATALOG.forceIssues
        : {};
  const CLICK_TRACKING_CONFIG =
    ACTIVE_CATALOG.clickTracking && typeof ACTIVE_CATALOG.clickTracking === "object"
      ? ACTIVE_CATALOG.clickTracking
      : {};
  const POPULARITY_ENDPOINT_URL = String(CLICK_TRACKING_CONFIG.endpointUrl || "").trim();
  const BADGE_METADATA = window.VOXLIS_CONFIG?.badges ?? {};
  const ITEM_LABEL_SINGULAR = PAGE_LABELS.itemSingular || "entry";
  const ITEM_LABEL_PLURAL = PAGE_LABELS.itemPlural || "entries";
  const SECTION_ARIA_LABEL = PAGE_LABELS.sectionAriaLabel || "Catalog cards";
  const SUMMARY_ARIA_LABEL = PAGE_LABELS.summaryAriaLabel || "Catalog count summary";
  const EMPTY_LOAD_MESSAGE = PAGE_LABELS.emptyLoadMessage || "The catalog data could not be loaded right now.";
  const EMPTY_FILTERED_MESSAGE = PAGE_LABELS.emptyFilteredMessage || "No entries match the current filters.";
  const LOADING_MESSAGE = PAGE_LABELS.loadingMessage || "Loading catalog...";
  const LOADING_RETRY_LABEL = PAGE_LABELS.loadingRetryLabel || "Retry";
  const STATS_SHOWING_PREFIX = PAGE_LABELS.statsShowingPrefix || "Showing";
  const STATUS_LABELS = PAGE_LABELS.statusLabels || {};
  const SORT_OPTIONS_BY_VALUE = new Map(
    SORT_OPTIONS.filter((option) => option?.value).map((option) => [String(option.value), option]),
  );
  const SEGMENT_FILTERS_BY_FIELD = new Map(
    SEGMENT_FILTER_DEFINITIONS.filter((definition) => definition?.field).map((definition) => [
      String(definition.field),
      definition,
    ]),
  );
  const SHOW_ONLY_FILTERS_BY_FIELD = new Map(
    SHOW_ONLY_FILTER_DEFINITIONS.filter((definition) => definition?.field).map((definition) => [
      String(definition.field),
      definition,
    ]),
  );
  const LEGACY_TAG_FILTERS = {
    multiInstance: "multi-instance",
    decompiler: "decompiler",
    kernel: "kernel",
  };
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const KEY_EMPIRE_HOSTNAME_PATTERN = /(^|\.)key-empire\.com$/i;
  const KEY_EMPIRE_PRODUCT_SLUG_ALIASES = {
    "matrix-hub": "matrix",
  };
  const KEY_EMPIRE_PRODUCT_PLATFORM_OVERRIDES = {
    macsploit: "macos",
  };
  const getSharedSuncRequestCache = () => {
    if (!(window.__voxlisSuncBatchRequestCache instanceof Map)) {
      window.__voxlisSuncBatchRequestCache = new Map();
    }

    return window.__voxlisSuncBatchRequestCache;
  };
  const suncRequestCache = getSharedSuncRequestCache();
  const catalogState = {
    mount: null,
    grid: null,
    cards: [],
    statusMap: {},
    popularityRanks: new Map(),
    filters: { ...DEFAULT_FILTERS },
    catalogRequestToken: 0,
    popularityRequestToken: 0,
    statusRequestToken: 0,
  };
  const dispatchSearchQuerySync = (value = "") => {
    document.dispatchEvent(
      new CustomEvent("voxlis:sync-search-query", {
        detail: {
          value: String(value),
          pageKey: PAGE_KEY,
        },
      }),
    );
  };
  const getCatalogSearchStore = () => {
    if (!window.__voxlisCatalogSearchQueries || typeof window.__voxlisCatalogSearchQueries !== "object") {
      window.__voxlisCatalogSearchQueries = {};
    }

    return window.__voxlisCatalogSearchQueries;
  };
  const getStoredCatalogSearchQuery = () =>
    typeof getCatalogSearchStore()[PAGE_KEY] === "string" ? getCatalogSearchStore()[PAGE_KEY] : "";
  const setStoredCatalogSearchQuery = (value = "") => {
    getCatalogSearchStore()[PAGE_KEY] = String(value);
    return getCatalogSearchStore()[PAGE_KEY];
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

  const titleCase = (value = "") =>
    value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  const normalizeSlugKey = (value = "") => String(value || "").trim().toLowerCase();

  const normalizePath = (path = "/") => {
    const trimmed = `${path}`.replace(/\/+$/, "");
    return trimmed || "/";
  };

  const getDefaultSegmentFilterValue = (field = "") =>
    SEGMENT_FILTERS_BY_FIELD.get(String(field))?.defaultValue ?? DEFAULT_FILTERS[field] ?? "all";
  const getAllowedSegmentFilterValues = (field = "") => {
    const options = SEGMENT_FILTERS_BY_FIELD.get(String(field))?.options;
    return Array.isArray(options)
      ? options.map((option) => String(option?.value ?? "")).filter(Boolean)
      : [];
  };

  const getCardDisplayName = (slug) => CARD_NAME_OVERRIDES[slug] ?? titleCase(slug);
  const getFolderNameCandidates = (slug) => {
    const folderOverride = CARD_FOLDER_OVERRIDES[slug];
    const overrideCandidates = Array.isArray(folderOverride)
      ? folderOverride
      : folderOverride
        ? [folderOverride]
        : [];

    return [
      ...new Set(
        [...overrideCandidates, getCardDisplayName(slug), titleCase(slug)]
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    ];
  };
  const resolveCardFolder = async (slug) => {
    const folderCandidates = getFolderNameCandidates(slug);

    for (const folderName of folderCandidates) {
      const info = await fetchJson(`${DATA_ROOT}/${encodeURIComponent(folderName)}/info.json`, {
        optional: true,
      });

      if (info) {
        return {
          folderName,
          info,
        };
      }
    }

    throw new Error(
      `Failed to load info.json for slug "${slug}" using candidates: ${folderCandidates.join(", ")}`,
    );
  };
  const resolveSitePath =
    window.VOXLIS_UTILS?.resolveSitePath ??
    ((path = "") => {
      const normalizedPath = String(path || "").trim();
      if (!normalizedPath) {
        return "";
      }

      if (
        normalizedPath.startsWith("/") ||
        normalizedPath.startsWith("#") ||
        /^(?:[a-z]+:)?\/\//i.test(normalizedPath) ||
        /^(?:data|blob):/i.test(normalizedPath)
      ) {
        return normalizedPath;
      }

      return `/${normalizedPath.replace(/^\/+/, "")}`;
    });
  const checkAssetExists =
    window.VOXLIS_UTILS?.checkAssetExists ??
    (async (path = "") => {
      const resolvedPath = resolveSitePath(path);
      if (!resolvedPath) {
        return false;
      }

      try {
        const response = await fetch(resolvedPath, { cache: "force-cache" });
        return response.ok;
      } catch {
        return false;
      }
    });
  const assetIconAvailability = new Map();

  const getAssetIconPath = (assetIcon = "") => {
    const normalizedAssetIcon = String(assetIcon || "").trim().replace(/^\/+/, "");
    return normalizedAssetIcon ? resolveSitePath(`/public/assets/${normalizedAssetIcon}`) : "";
  };
  const hasAvailableAssetIcon = (assetIcon = "") =>
    assetIconAvailability.get(String(assetIcon || "").trim()) === true;
  const primeAssetIconAvailability = async (assetIcons = []) => {
    const uniqueAssetIcons = [...new Set(assetIcons.map((assetIcon) => String(assetIcon || "").trim()).filter(Boolean))];
    if (!uniqueAssetIcons.length) {
      return;
    }

    const availabilityEntries = await Promise.all(
      uniqueAssetIcons.map(async (assetIcon) => [
        assetIcon,
        await checkAssetExists(getAssetIconPath(assetIcon)),
      ]),
    );

    availabilityEntries.forEach(([assetIcon, exists]) => {
      assetIconAvailability.set(assetIcon, exists);
    });
  };
  const collectCatalogAssetIcons = () => [
    ...Object.values(BADGE_METADATA)
      .map((badgeMeta) => badgeMeta?.assetIcon || "")
      .filter(Boolean),
    ...Object.values(TAG_METADATA)
      .map((tagMeta) => tagMeta?.assetIcon || "")
      .filter(Boolean),
    ...SHOW_ONLY_FILTER_DEFINITIONS.map((definition) => definition?.assetIcon || "").filter(Boolean),
  ];
  const normalizeOptionalFileManifest = (manifest = null) => ({
    loaded: Boolean(manifest && typeof manifest === "object"),
    modals: new Set(Array.isArray(manifest?.modals) ? manifest.modals.map((value) => String(value || "").trim()).filter(Boolean) : []),
  });
  const shouldFetchOptionalCardFile = (manifest, key, folderName) => {
    if (!folderName) {
      return false;
    }

    if (!manifest?.loaded) {
      return true;
    }

    const allowedEntries = manifest[key];
    return allowedEntries instanceof Set ? allowedEntries.has(folderName) : false;
  };

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
  const normalizeKeyEmpireSlug = (value = "") =>
    KEY_EMPIRE_PRODUCT_SLUG_ALIASES[normalizeSlugKey(value)] ?? normalizeSlugKey(value);
  const buildKeyEmpireProductUrl = (slug = "") => {
    const normalizedSlug = normalizeSlugKey(slug);
    return normalizedSlug ? `https://key-empire.com/product/${encodeURIComponent(normalizedSlug)}` : "";
  };
  const isKeyEmpirePurchaseUrl = (value = "") => {
    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) {
      return false;
    }

    try {
      const parsedUrl = new URL(normalizedValue, window.location.origin);
      return KEY_EMPIRE_HOSTNAME_PATTERN.test(parsedUrl.hostname);
    } catch {
      return false;
    }
  };
  const getPricingPlatforms = (pricing = null) => {
    if (!pricing || typeof pricing !== "object") {
      return [];
    }

    const directPlatforms = Array.isArray(pricing.offers)
      ? pricing.offers.map((offer) => String(offer?.platform || "").trim().toLowerCase())
      : [];
    const groupedPlatforms =
      pricing.platforms && typeof pricing.platforms === "object"
        ? Object.keys(pricing.platforms).map((platform) => String(platform || "").trim().toLowerCase())
        : [];

    return [...new Set([...directPlatforms, ...groupedPlatforms].filter(Boolean))];
  };
  const normalizeKeyEmpireDuration = (value) => {
    if (typeof value === "string" && value.toLowerCase() === "lifetime") {
      return -1;
    }

    const duration = Number(value);
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  };
  const normalizeKeyEmpireProductMap = (payload = {}) => {
    const sourceProducts =
      payload?.products && typeof payload.products === "object" ? payload.products : {};

    return Object.fromEntries(
      Object.entries(sourceProducts)
        .map(([sourceSlug, product]) => [
          normalizeKeyEmpireSlug(sourceSlug),
          {
            sourceSlug: normalizeSlugKey(sourceSlug),
            durations: Array.isArray(product?.durations) ? product.durations : [],
          },
        ])
        .filter(([slug]) => Boolean(slug)),
    );
  };
  const buildKeyEmpirePricingEntry = (product = {}, currentPricing = null) => {
    const platforms = getPricingPlatforms(currentPricing);
    if (platforms.length > 1) {
      return null;
    }

    const normalizedProductSlug = normalizeKeyEmpireSlug(product?.sourceSlug);
    const platform =
      platforms[0] || KEY_EMPIRE_PRODUCT_PLATFORM_OVERRIDES[normalizedProductSlug] || "windows";
    const offers = (Array.isArray(product?.durations) ? product.durations : [])
      .map((durationEntry) => {
        const days = normalizeKeyEmpireDuration(durationEntry?.duration);
        const price = Number(durationEntry?.price);

        if (days === null || !Number.isFinite(price)) {
          return null;
        }

        return {
          platform,
          days,
          price,
        };
      })
      .filter(Boolean);

    if (!offers.length) {
      return null;
    }

    return {
      purchaseUrl: buildKeyEmpireProductUrl(product?.sourceSlug),
      offers,
    };
  };
  // Keep the local manifest as the full catalog source, and only replace Key-Empire offer data when the live feed is available.
  const mergeKeyEmpirePricing = (localPrices = {}, remoteProducts = {}) => {
    const sourcePrices =
      localPrices && typeof localPrices === "object" ? localPrices : {};
    const mergedPrices = { ...sourcePrices };

    Object.entries(sourcePrices).forEach(([slug, localEntry]) => {
      if (slug === "freeProducts" || slug.startsWith("$")) {
        return;
      }

      if (!localEntry || typeof localEntry !== "object") {
        return;
      }

      const localPurchaseUrl = String(localEntry.purchaseUrl || localEntry.purchase_url || "").trim();
      if (localPurchaseUrl && !isKeyEmpirePurchaseUrl(localPurchaseUrl)) {
        return;
      }

      const remoteProduct = remoteProducts[normalizeSlugKey(slug)];
      if (!remoteProduct) {
        return;
      }

      const remoteEntry = buildKeyEmpirePricingEntry(remoteProduct, localEntry);
      if (!remoteEntry) {
        return;
      }

      mergedPrices[slug] = {
        ...localEntry,
        ...remoteEntry,
        purchaseUrl: localPurchaseUrl || remoteEntry.purchaseUrl,
      };
    });

    return mergedPrices;
  };
  const buildPricingCatalogFromKeyEmpire = (remoteProducts = {}) =>
    Object.fromEntries(
      Object.entries(remoteProducts)
        .map(([slug, product]) => [slug, buildKeyEmpirePricingEntry(product)])
        .filter(([, entry]) => Boolean(entry)),
    );
  const loadPricingCatalog = async () => {
    const remotePricingRequest = PRICING_FALLBACK_URL
      ? fetchJson(PRICING_FALLBACK_URL).then((payload) => normalizeKeyEmpireProductMap(payload))
      : Promise.resolve({});
    const [localPricingResult, remotePricingResult] = await Promise.allSettled([
      fetchJson(`${DATA_ROOT}/prices.json`),
      remotePricingRequest,
    ]);

    const localPrices =
      localPricingResult.status === "fulfilled" &&
      localPricingResult.value &&
      typeof localPricingResult.value === "object"
        ? localPricingResult.value
        : null;
    const remoteProducts =
      remotePricingResult.status === "fulfilled" &&
      remotePricingResult.value &&
      typeof remotePricingResult.value === "object"
        ? remotePricingResult.value
        : {};

    if (remotePricingResult.status === "rejected" && PRICING_FALLBACK_URL) {
      console.warn("Failed to load Key-Empire pricing feed.", remotePricingResult.reason);
    }

    if (localPrices) {
      return mergeKeyEmpirePricing(localPrices, remoteProducts);
    }

    if (localPricingResult.status === "rejected") {
      console.warn("Failed to load local pricing manifest.", localPricingResult.reason);
    }

    const remoteOnlyPrices = buildPricingCatalogFromKeyEmpire(remoteProducts);
    if (Object.keys(remoteOnlyPrices).length) {
      return remoteOnlyPrices;
    }

    if (localPricingResult.status === "rejected") {
      throw localPricingResult.reason;
    }

    if (remotePricingResult.status === "rejected") {
      throw remotePricingResult.reason;
    }

    throw new Error("Failed to load pricing feeds.");
  };

  const buildPopularityRequestUrl = () => {
    if (!POPULARITY_ENDPOINT_URL) {
      return "";
    }

    const requestUrl = new URL(POPULARITY_ENDPOINT_URL, window.location.origin);
    requestUrl.searchParams.set("page", PAGE_KEY);
    return requestUrl.toString();
  };

  const buildPopularitySlugsFromCounts = (counts = {}) =>
    Object.entries(counts && typeof counts === "object" ? counts : {})
      .map(([slug, actionCounts]) => {
        const total = Object.values(actionCounts && typeof actionCounts === "object" ? actionCounts : {}).reduce(
          (sum, count) => sum + (Number.isFinite(Number(count)) ? Math.max(0, Math.floor(Number(count))) : 0),
          0,
        );

        return {
          slug: normalizeSlugKey(slug),
          total,
        };
      })
      .filter((entry) => entry.slug && entry.total > 0)
      .sort((left, right) => right.total - left.total || left.slug.localeCompare(right.slug))
      .map((entry) => entry.slug);

  const extractPopularityLeaderboard = (payload) => {
    if (Array.isArray(payload)) {
      return [...new Set(payload.map((slug) => normalizeSlugKey(slug)).filter(Boolean))];
    }

    if (!payload || typeof payload !== "object") {
      return [];
    }

    const countsPayload =
      payload.counts && typeof payload.counts === "object"
        ? payload.counts
        : payload;

    const cardActionCounts =
      countsPayload.card_actions && typeof countsPayload.card_actions === "object"
        ? countsPayload.card_actions
        : {};

    return buildPopularitySlugsFromCounts(cardActionCounts);
  };

  const buildPopularityRankMap = (slugs = []) =>
    new Map(
      slugs.map((slug, index) => [normalizeSlugKey(slug), index]).filter(([slug]) => Boolean(slug)),
    );

  const getCardPopularityRank = (card) => {
    const slug = normalizeSlugKey(card?.slug);
    return catalogState.popularityRanks.get(slug) ?? Number.POSITIVE_INFINITY;
  };

  const comparePopularityRanks = (left, right, { reverse = false } = {}) => {
    const leftRank = getCardPopularityRank(left);
    const rightRank = getCardPopularityRank(right);
    const leftIsRanked = Number.isFinite(leftRank);
    const rightIsRanked = Number.isFinite(rightRank);

    if (leftIsRanked && rightIsRanked) {
      return reverse ? rightRank - leftRank : leftRank - rightRank;
    }

    if (leftIsRanked) {
      return reverse ? 1 : -1;
    }

    if (rightIsRanked) {
      return reverse ? -1 : 1;
    }

    return 0;
  };

  const hydratePopularityLeaderboard = async ({ forceRefresh = false } = {}) => {
    const requestUrl = buildPopularityRequestUrl();
    const requestToken = ++catalogState.popularityRequestToken;

    if (!requestUrl) {
      catalogState.popularityRanks = new Map();
      return;
    }

    try {
      const response = await fetch(requestUrl, {
        cache: forceRefresh ? "reload" : "no-cache",
      });
      if (!response.ok) {
        throw new Error(`Failed to load popularity leaderboard (${response.status})`);
      }

      const payload = await response.json();
      if (requestToken !== catalogState.popularityRequestToken) {
        return;
      }

      catalogState.popularityRanks = buildPopularityRankMap(extractPopularityLeaderboard(payload));
      renderCatalogView();
    } catch (error) {
      if (requestToken !== catalogState.popularityRequestToken) {
        return;
      }

      catalogState.popularityRanks = new Map();
      console.warn("Failed to load popularity leaderboard.", error);
      renderCatalogView();
    }
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
  const normalizeSuncSource = (source = {}) => {
    const scrapId = String(source?.scrapId || source?.scrap || "").trim();
    const key = String(source?.key || source?.accessKey || "").trim();
    return scrapId && key ? { scrapId, key } : null;
  };
  const buildSuncPairsParam = (sources = []) =>
    [
      ...new Set(
        sources
          .map((source) => normalizeSuncSource(source))
          .filter(Boolean)
          .map(({ scrapId, key }) => `${scrapId}:${key}`),
      ),
    ]
      .sort()
      .join(",");
  const buildSuncPayloadKey = ({ scrapId = "", key = "" } = {}) => {
    const search = new URLSearchParams();
    if (scrapId) search.set("scrap", scrapId);
    if (key) search.set("key", key);
    return search.toString();
  };
  const buildSuncApiUrl = ({ forceRefresh = false, sources = [] } = {}) => {
    const params = new URLSearchParams();
    const pairs = buildSuncPairsParam(sources);
    if (pairs) {
      params.set("pairs", pairs);
    }
    if (forceRefresh) {
      params.set("refresh", "1");
    }

    const query = params.toString();
    if (!query) {
      return SUNC_API_URL;
    }

    const separator = SUNC_API_URL.includes("?") ? "&" : "?";
    return `${SUNC_API_URL}${separator}${query}`;
  };
  const loadSuncPayloadMap = ({ forceRefresh = false, sources = [] } = {}) => {
    if (!SUNC_API_URL) {
      return Promise.resolve({});
    }

    const requestUrl = buildSuncApiUrl({ forceRefresh, sources });
    const stableUrl = buildSuncApiUrl({ sources });

    if (forceRefresh) {
      suncRequestCache.delete(stableUrl);
    }

    if (!suncRequestCache.has(requestUrl)) {
      const request = fetchJson(requestUrl)
        .then((payload) => (payload && typeof payload === "object" ? payload : {}))
        .catch((error) => {
          console.warn("Failed to load sUNC batch payload.", error);
          return {};
        });

      suncRequestCache.set(requestUrl, request);
      if (forceRefresh) {
        suncRequestCache.set(stableUrl, request);
      }
    }

    return suncRequestCache.get(requestUrl);
  };

  const normalizeSuncSummary = (payload) => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const passedCount = Array.isArray(payload.tests?.passed) ? payload.tests.passed.length : 0;
    const failedTests = payload.tests?.failed;
    const failedCount = Array.isArray(failedTests)
      ? failedTests.length
      : failedTests && typeof failedTests === "object"
        ? Object.keys(failedTests).length
        : 0;
    const totalCount = passedCount + failedCount;

    const explicitScore = Number(payload.score);
    const normalizedScore = totalCount
      ? Math.floor((passedCount / totalCount) * 100)
      : Number.isFinite(explicitScore)
        ? Math.floor(explicitScore >= 0 && explicitScore <= 1 ? explicitScore * 100 : explicitScore)
        : null;

    if (!Number.isFinite(normalizedScore)) {
      return null;
    }

    return {
      score: Math.max(0, Math.min(100, normalizedScore)),
    };
  };

  const loadSuncSummary = async (info, payloadMapPromise = null) => {
    if (!SUNC_API_URL) {
      return null;
    }

    const source = getPrimarySuncSource(info);
    if (!source) {
      return null;
    }

    const payloadMap = payloadMapPromise
      ? await payloadMapPromise
      : await loadSuncPayloadMap({ sources: [source] });
    const payload = payloadMap?.[buildSuncPayloadKey(source)] ?? null;
    return normalizeSuncSummary(payload);
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

  const buildBadgeEntry = (key = "", overrides = {}) => {
    const badgeMeta = BADGE_METADATA[key] ?? {};
    const title = badgeMeta.label || overrides.title || titleCase(key);
    const message =
      overrides.message ||
      badgeMeta.info ||
      badgeMeta.message ||
      `${title} is enabled for this product.`;

    return {
      key,
      iconClass: badgeMeta.iconClass || badgeMeta.icon || overrides.iconClass || "fas fa-circle-info",
      iconMarkup: badgeMeta.iconMarkup || overrides.iconMarkup || "",
      iconToneClass: badgeMeta.iconToneClass || overrides.iconToneClass || "",
      assetIcon: badgeMeta.assetIcon || overrides.assetIcon || "",
      title,
      message,
      toastIcon: badgeMeta.toastIcon || overrides.toastIcon || "fa-circle-info",
    };
  };

  const getAvailableTitleIconEntries = (modals = {}) => [
    buildBadgeEntry("verified", {
      title: "Verified",
      iconClass: "fas fa-circle-check",
      iconToneClass: "ph-good-ico",
      toastIcon: "fa-circle-check",
    }),
    buildBadgeEntry("trending", {
      title: "Trending",
      iconClass: "fas fa-arrow-trend-up",
      toastIcon: "fa-arrow-trend-up",
    }),
    buildBadgeEntry("warning", {
      title: "Warning",
      message: modals?.warning?.description,
      iconClass: "fas fa-triangle-exclamation",
      iconToneClass: "ph-warn-ico",
      toastIcon: "fa-triangle-exclamation",
    }),
    buildBadgeEntry("warningred", {
      title: "High-Risk Warning",
      message: modals?.warningred?.description,
      iconClass: "fas fa-triangle-exclamation",
      iconToneClass: "ph-warn-red-ico",
      toastIcon: "fa-triangle-exclamation",
    }),
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

  const renderInfoIconMarkup = ({ iconClass, iconMarkup = "", iconToneClass = "", assetIcon = "" }) => {
    if (iconMarkup) {
      return iconMarkup;
    }

    if (assetIcon) {
      const assetIconPath = getAssetIconPath(assetIcon);
      if (!assetIconPath || !hasAvailableAssetIcon(assetIcon)) {
        return "";
      }

      return `<span class="ph-asset-icon${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" style="--ph-asset-icon: url('${escapeHtml(assetIconPath)}')" aria-hidden="true"></span>`;
    }

    if (!iconClass) {
      return "";
    }

    return `<i class="${escapeHtml(iconClass)}${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" aria-hidden="true"></i>`;
  };

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
    trackAction = "",
    trackSlug = "",
  }) => {
    const renderedIconMarkup = renderInfoIconMarkup({ iconClass, iconMarkup, iconToneClass, assetIcon });
    if (!renderedIconMarkup) {
      return "";
    }

    return `
      <button
        class="${escapeHtml(buttonClass)}"
        type="button"
        aria-label="${escapeHtml(title)}"
        title="Click to view"
        data-card-icon-title="${escapeHtml(title)}"
        data-card-icon-message="${escapeHtml(message)}"
        data-card-icon-toast-icon="${escapeHtml(toastIcon)}"
        ${key ? `data-card-icon-key="${escapeHtml(key)}"` : ""}
        ${trackAction ? `data-click-track-action="${escapeHtml(trackAction)}"` : ""}
        ${trackSlug ? `data-click-track-slug="${escapeHtml(trackSlug)}"` : ""}
      >
        ${renderedIconMarkup}
      </button>
    `;
  };

  const buildTitleIcons = (info, modals) => {
    const icons = getTitleIconEntries(info, modals)
      .map((entry) => buildInfoIconButton(entry))
      .filter(Boolean);
    return icons.length ? ` ${icons.join(" ")}` : "";
  };

  const getTagEntry = (tag) => {
    const normalizedTag = normalizeLineText(tag);
    if (!normalizedTag) {
      return null;
    }

    const tagMeta = TAG_METADATA[normalizedTag];
    if (!tagMeta || typeof tagMeta !== "object") {
      return null;
    }

    return {
      key: `tag:${normalizedTag}`,
      iconClass: tagMeta.icon,
      iconMarkup: tagMeta.iconMarkup,
      iconToneClass: tagMeta.iconToneClass || "",
      assetIcon: tagMeta.assetIcon || "",
      title: tagMeta.label,
      message: tagMeta.info || tagMeta.message || `${tagMeta.label} is supported by this product.`,
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
          .map((entry) => {
            const renderedIconMarkup = renderInfoIconMarkup(entry);

            return `
              <li class="info-modal-notice-item" data-info-modal-key="${escapeHtml(entry.key || "")}">
                ${renderedIconMarkup ? `<span class="info-modal-notice-icon" aria-hidden="true">${renderedIconMarkup}</span>` : ""}
                <div class="info-modal-notice-copy">
                  <p class="info-modal-notice-title">${escapeHtml(entry.title)}</p>
                  <p class="info-modal-notice-text">${escapeHtml(entry.message)}</p>
                </div>
              </li>
            `;
          })
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

  const buildTagChipMarkup = (tags = [], slug = "") => {
    const normalizedTags = Array.isArray(tags)
      ? tags.map((tag) => normalizeLineText(tag)).filter(Boolean)
      : [];

    if (!normalizedTags.length) {
      return "";
    }

    const tagButtons = normalizedTags
      .map((tag) => {
        const tagEntry = getTagEntry(tag);
        if (!tagEntry) {
          return "";
        }
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
          trackAction: "tag",
          trackSlug: slug,
        });
      })
      .filter(Boolean);

    if (!tagButtons.length) {
      return "";
    }

    return `
      <span class="ph-title-tags" aria-label="Feature tags">
        ${tagButtons.join("")}
      </span>
    `;
  };

  const buildCardMetaMarkup = (card, statusMap) => {
    const platformText = buildPlatformText(card.info);
    const typeText = buildTypeText(card.info);
    const tagMarkup = buildTagChipMarkup(card.info.tags, card.slug);
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

  const getPlatformStatusEntry = (card, statusMap, platform) => {
    const platformState = statusMap[card.slug]?.[platform];
    if (typeof platformState === "boolean") {
      return {
        updated: platformState,
        issues: false,
      };
    }

    if (!platformState || typeof platformState !== "object") {
      return null;
    }

    return {
      updated: typeof platformState.updated === "boolean" ? platformState.updated : null,
      issues: platformState.issues === true,
    };
  };

  const isForcedIssueState = (platform, platformState) =>
    Boolean(FORCE_ISSUES?.[platform]) && platformState?.updated === false;

  const isWarningIssueState = (platform, platformState) =>
    isForcedIssueState(platform, platformState) ||
    (platformState?.updated === true && platformState?.issues === true);

  const getPlatformStateClass = (card, statusMap, platform) => {
    const platformState = getPlatformStatusEntry(card, statusMap, platform);
    if (isWarningIssueState(platform, platformState)) {
      return "is-issue";
    }

    if (platformState?.updated === true) {
      return "is-updated";
    }

    if (platformState?.updated === false) {
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

    const hasAndroid = platforms.includes("android");
    const hasIos = platforms.includes("ios");
    const unifiedMobileIssue =
      hasAndroid &&
      hasIos &&
      ["android", "ios"].some((platform) =>
        isWarningIssueState(platform, getPlatformStatusEntry(card, statusMap, platform)),
      );

    return `
      <span class="ph-platform-icons" aria-hidden="true">
        ${platforms
          .map((platform) => {
            const iconClass = PLATFORM_ICONS[platform] ?? "fas fa-microchip";
            const statusClass =
              unifiedMobileIssue && (platform === "android" || platform === "ios")
                ? "is-issue"
                : getPlatformStateClass(card, statusMap, platform);
            const label = PLATFORM_LABELS[platform] ?? titleCase(platform);
            return `<i class="${escapeHtml(iconClass)} ph-title-meta-ico ${statusClass}" title="${escapeHtml(label)}"></i>`;
          })
          .join("")}
      </span>
    `;
  };

  const buildReviewDescription = () => "";

  const getCardReviewUrl = (card) =>
    card?.reviewUrl || `${DATA_ROOT}/${encodeURIComponent(card?.folderName || card?.title || ITEM_LABEL_SINGULAR)}/review.md`;

  const getCardMoreInfoPath = (cardOrSlug) => {
    const slug =
      typeof cardOrSlug === "string"
        ? cardOrSlug
        : String(cardOrSlug?.slug || "").trim();

    if (!slug) {
      return "";
    }

    const normalizedBasePath = normalizePath(ROUTE_BASE_PATH);
    if (/\.html?$/i.test(normalizedBasePath)) {
      return `${normalizedBasePath}?card=${encodeURIComponent(slug)}`;
    }

    return `${normalizedBasePath}/${encodeURIComponent(slug)}/`;
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
      trackingSlug: card.slug || "",
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
        data-click-track-action="sunc"
        data-click-track-slug="${escapeHtml(card?.slug || "")}"
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
        <a class="ph-sponsor-btn is-keyempire" href="${escapeHtml(purchaseUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Buy on Key-Empire" data-click-track-action="buy-keyempire" data-click-track-slug="${escapeHtml(slug)}"${WARNING_MODAL_ENABLED && warningConfig ? ` data-card-warning-slug="${escapeHtml(slug)}"` : ""}>
          <span class="ph-sponsor-inline">
            <span class="ph-sponsor-copy">Buy on</span>
            <span class="ph-sponsor-stack" aria-hidden="true">
              <img class="ph-sponsor-base-image is-keyempire-logo" src="/public/assets/icons/images/keyempire-logo.png" alt="">
              <img class="ph-sponsor-base-image" src="/public/assets/icons/images/keyempire-text.png" alt="">
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
          <a class="ph-action-btn is-review${hasYoutubeIndicator ? " has-youtube-indicator" : " is-disabled"}" data-click-track-action="review" data-click-track-slug="${escapeHtml(slug)}"${reviewButtonAttributes}>
            <i class="fab fa-youtube" aria-hidden="true"></i> <span class="ph-action-label">Review</span>
          </a>
          <a class="ph-action-btn is-more${hasYoutubeIndicator ? " has-youtube-indicator" : ""}" href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer" data-click-track-action="more" data-click-track-slug="${escapeHtml(slug)}" data-card-review-url="${escapeHtml(reviewUrl)}" data-card-review-title="${escapeHtml(title)}" data-card-review-description="${escapeHtml(reviewDescription || "")}"${websiteDataAttributes}${websiteWarningDataAttributes}>
            <span class="ph-action-icon is-info" aria-hidden="true"></span> More
          </a>
        </div>
        ${sponsorMarkup}
      </div>
    `;
  };

  const handleTrackedActionClick = (event) => {
    const trigger = event.target.closest("[data-click-track-action]");
    if (!trigger) {
      return;
    }

    if (trigger.getAttribute("aria-disabled") === "true" || trigger.classList.contains("is-disabled")) {
      return;
    }

    const article = trigger.closest("article[data-slug]");
    const slug = trigger.dataset.clickTrackSlug || article?.dataset.slug || "";
    const action = trigger.dataset.clickTrackAction || "";
    if (!slug || !action) {
      return;
    }

    window.VOXLIS_CLICK_TRACKER?.trackAction?.({
      pageKey: PAGE_KEY,
      slug,
      action,
    });
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
        trackingSlug: slug,
        modalPath: getCardMoreInfoPath(slug),
      };
    const opened =
      window.openMoreInfoModal?.({
        ...modalOptions,
        pushHistory: false,
      }) ?? false;

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
        trackingSlug: slug,
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
    const loadingStateAction = event.target.closest("button[data-loading-action]");
    if (loadingStateAction) {
      event.preventDefault();

      if (loadingStateAction.dataset.loadingAction === "retry-fetching-api" && catalogState.mount) {
        void initActiveCatalog(catalogState.mount, { forceRefresh: true });
      }

      return;
    }

    const emptyStateAction = event.target.closest("button[data-empty-action]");
    if (emptyStateAction) {
      event.preventDefault();

      if (emptyStateAction.dataset.emptyAction === "reset-filters") {
        catalogState.filters = normalizeFilters({
          ...DEFAULT_FILTERS,
          search: "",
        });
        setStoredCatalogSearchQuery("");
        dispatchSearchQuerySync("");
        renderCatalogView();
        return;
      }

      if (emptyStateAction.dataset.emptyAction === "open-filters") {
        document.dispatchEvent(new CustomEvent("voxlis:open-filter"));
        return;
      }
    }

    handleTrackedActionClick(event);

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

    const normalizePlatformStatus = (platform, value) => {
      let updated = null;
      let issues = false;

      if (typeof value === "boolean") {
        updated = value;
      } else if (value && typeof value === "object") {
        if (typeof value.updated === "boolean") {
          updated = value.updated;
        }

        issues = value.issues === true;
        if (
          (platform === "ios" || platform === "android") &&
          String(value.UpgradeAction || "")
            .trim()
            .toLowerCase() === "required"
        ) {
          issues = true;
        }
      }

      if (typeof updated !== "boolean" && !issues) {
        return null;
      }

      return { updated, issues };
    };

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
          const platformStatus = normalizePlatformStatus(platform, value);
          if (!platformStatus) {
            return;
          }

          normalized[slug] ??= {};
          normalized[slug][platform] = platformStatus;
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
            Object.entries(value)
              .map(([platform, state]) => [platform, normalizePlatformStatus(platform, state)])
              .filter(
                ([platform, state]) =>
                  PLATFORM_ORDER.includes(platform) && state && typeof state === "object",
              ),
          ),
        ])
        .filter(([, platforms]) => Object.keys(platforms).length > 0),
    );
  };

  const buildStatusApiUrl = ({ forceRefresh = false } = {}) => {
    if (!forceRefresh) {
      return STATUS_API_URL;
    }

    const separator = STATUS_API_URL.includes("?") ? "&" : "?";
    return `${STATUS_API_URL}${separator}refresh=1`;
  };
  const loadUptimeStatus = async ({ forceRefresh = false } = {}) => {
    if (!STATUS_API_URL) {
      return {};
    }

    try {
      const response = await fetch(buildStatusApiUrl({ forceRefresh }), { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Status API request failed (${response.status})`);
      }

      return normalizeStatusPayload(await response.json());
    } catch (error) {
      console.warn("Failed to load catalog status feed.", error);
      return {};
    }
  };
  const hydrateCatalogStatus = async ({ forceRefresh = false } = {}) => {
    const requestToken = ++catalogState.statusRequestToken;
    const statusMap = await loadUptimeStatus({ forceRefresh });
    if (requestToken !== catalogState.statusRequestToken || !catalogState.mount) {
      return;
    }

    catalogState.statusMap = statusMap;
    renderCatalogView();
  };

  const hasBadge = (card, badge) => Array.isArray(card.info.badges) && card.info.badges.includes(badge);
  const hasTrendingBadge = (card) => hasBadge(card, "trending");
  const hasVerifiedBadge = (card) => hasBadge(card, "verified");
  const hasWarningBadge = (card) => Boolean(getModalWarningConfig(card?.modals));

  const getCardStatusClass = (card, statusMap) => {
    const platformStates = card.info.platforms
      ?.map((platform) => ({
        platform,
        state: getPlatformStatusEntry(card, statusMap, platform),
      }))
      .filter(
        ({ state }) => state && (typeof state.updated === "boolean" || state.issues === true),
      );

    if (!platformStates?.length) {
      return "is-status-unknown";
    }

    if (platformStates.some(({ platform, state }) => isWarningIssueState(platform, state))) {
      return "is-issue";
    }

    if (platformStates.some(({ state }) => state.updated === true)) {
      return "is-updated";
    }

    if (platformStates.some(({ state }) => state.updated === false)) {
      return "is-not-updated";
    }

    return "is-status-unknown";
  };

  const getCardPriorityRank = (card, statusMap) => {
    if (isInsecureCard(card)) {
      return 4;
    }

    switch (getCardStatusClass(card, statusMap)) {
      case "is-updated":
        return 0;
      case "is-issue":
        return 1;
      case "is-not-updated":
        return 2;
      case "is-status-unknown":
      default:
        return 3;
    }
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

  const DEFAULT_SEGMENT_FILTER_MATCHERS = {
    price: (card, _statusMap, value) => {
      if (value === "all") {
        return true;
      }

      if (value === "free") {
        return card.hasFreeOffer;
      }

      if (value === "paid") {
        return card.hasPaidOffer && !card.hasFreeOffer;
      }

      return true;
    },
    key: (card, _statusMap, value) => {
      if (value === "all") {
        return true;
      }

      if (value === "keyless") {
        return !card.isKeyed;
      }

      if (value === "keysystem") {
        return card.isKeyed;
      }

      return true;
    },
    type: (card, _statusMap, value) => value === "all" || card.cardType === value,
    updatedState: (card, statusMap, value) => {
      if (value === "all") {
        return true;
      }

      const cardStatusClass = getCardStatusClass(card, statusMap);
      if (value === "yes") {
        return cardStatusClass === "is-updated";
      }

      if (value === "no") {
        return cardStatusClass !== "is-updated";
      }

      return true;
    },
  };
  const DEFAULT_BOOLEAN_FILTER_MATCHERS = {
    verified: (card) => hasVerifiedBadge(card),
    trending: (card) => hasTrendingBadge(card),
    warning: (card) => hasWarningBadge(card),
  };
  const getSegmentFilterMatcher = (field = "") =>
    SEGMENT_FILTERS_BY_FIELD.get(String(field))?.matcher ?? DEFAULT_SEGMENT_FILTER_MATCHERS[field];
  const getShowOnlyFilterMatcher = (field = "") =>
    SHOW_ONLY_FILTERS_BY_FIELD.get(String(field))?.matcher ?? DEFAULT_BOOLEAN_FILTER_MATCHERS[field];
  const createFilterMatcherContext = (statusMap, filters) => ({
    pageKey: PAGE_KEY,
    page: ACTIVE_CATALOG,
    filters,
    defaultFilters: DEFAULT_FILTERS,
    platformOrder: PLATFORM_ORDER,
    hasBadge,
    hasTrendingBadge,
    hasVerifiedBadge,
    hasWarningBadge,
    hasInfoTag,
    getCardStatusClass: (card) => getCardStatusClass(card, statusMap),
    getSortablePrice,
    normalizeLineText,
  });
  const runSegmentFilterMatcher = (field, card, statusMap, value, filters) => {
    const matcher = getSegmentFilterMatcher(field);
    if (typeof matcher !== "function") {
      return true;
    }

    return matcher(card, statusMap, value, filters, createFilterMatcherContext(statusMap, filters)) !== false;
  };
  const runShowOnlyFilterMatcher = (field, card, statusMap, enabled, filters) => {
    if (!enabled) {
      return true;
    }

    const matcher = getShowOnlyFilterMatcher(field);
    if (typeof matcher !== "function") {
      return true;
    }

    return Boolean(matcher(card, statusMap, enabled, filters, createFilterMatcherContext(statusMap, filters)));
  };

  const normalizeFilters = (filters = {}) => {
    const normalizedSortValue = String(
      filters.sort === "recommended"
        ? "random"
        : filters.sort || DEFAULT_FILTERS.sort || SORT_OPTIONS[0]?.value || "random",
    );
    const nextFilters = {
      ...DEFAULT_FILTERS,
      ...filters,
      search: normalizeLineText(filters.search || ""),
      sort: SORT_OPTIONS_BY_VALUE.has(normalizedSortValue)
        ? normalizedSortValue
        : DEFAULT_FILTERS.sort || SORT_OPTIONS[0]?.value || "random",
      platforms: Array.isArray(filters.platforms)
        ? [...new Set(filters.platforms.filter((platform) => PLATFORM_ORDER.includes(platform)))]
        : [],
      tags: [
        ...new Set(
          [
            ...(Array.isArray(filters.tags) ? filters.tags : []),
            ...Object.entries(LEGACY_TAG_FILTERS)
              .filter(([legacyField]) => filters[legacyField])
              .map(([, tag]) => tag),
          ].filter((tag) => FILTERABLE_TAGS.includes(tag)),
        ),
      ],
      showInsecure: Boolean(filters.showInsecure),
    };

    SEGMENT_FILTER_DEFINITIONS.forEach((definition) => {
      const field = String(definition?.field || "");
      if (!field) {
        return;
      }

      const allowedValues = getAllowedSegmentFilterValues(field);
      const nextValue = String(filters[field] ?? DEFAULT_FILTERS[field] ?? getDefaultSegmentFilterValue(field));
      nextFilters[field] = allowedValues.includes(nextValue) ? nextValue : getDefaultSegmentFilterValue(field);
    });

    SHOW_ONLY_FILTER_DEFINITIONS.forEach((definition) => {
      const field = String(definition?.field || "");
      if (!field) {
        return;
      }

      nextFilters[field] = Boolean(filters[field]);
    });

    return nextFilters;
  };

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

    if (filters.tags.length && !filters.tags.every((tag) => hasInfoTag(card.info, tag))) {
      return false;
    }

    for (const definition of SEGMENT_FILTER_DEFINITIONS) {
      const field = String(definition?.field || "");
      if (!field) {
        continue;
      }

      if (!runSegmentFilterMatcher(field, card, statusMap, filters[field], filters)) {
        return false;
      }
    }

    for (const definition of SHOW_ONLY_FILTER_DEFINITIONS) {
      const field = String(definition?.field || "");
      if (!field) {
        continue;
      }

      if (!runShowOnlyFilterMatcher(field, card, statusMap, Boolean(filters[field]), filters)) {
        return false;
      }
    }

    return true;
  };

  const sortCards = (cards, statusMap, sort = DEFAULT_FILTERS.sort) =>
    [...cards].sort((left, right) => {
      const trendingRank = Number(hasTrendingBadge(right)) - Number(hasTrendingBadge(left));
      if (trendingRank !== 0) return trendingRank;

      if (sort === "most-popular") {
        const popularityRank = comparePopularityRanks(left, right);
        if (popularityRank !== 0) {
          return popularityRank;
        }
      }

      if (sort === "least-popular") {
        const popularityRank = comparePopularityRanks(left, right, { reverse: true });
        if (popularityRank !== 0) {
          return popularityRank;
        }
      }

      const priorityRank = getCardPriorityRank(left, statusMap) - getCardPriorityRank(right, statusMap);
      if (priorityRank !== 0) return priorityRank;

      const activeSortOption = SORT_OPTIONS_BY_VALUE.get(String(sort));
      if (typeof activeSortOption?.compare === "function") {
        const customRank = Number(
          activeSortOption.compare(left, right, {
            statusMap,
            pageKey: PAGE_KEY,
            page: ACTIVE_CATALOG,
            compareRandom,
            getSortablePrice,
            hasBadge,
            hasTrendingBadge,
            hasVerifiedBadge,
            hasWarningBadge,
            getCardPriorityRank: (card) => getCardPriorityRank(card, statusMap),
            getCardStatusClass: (card) => getCardStatusClass(card, statusMap),
          }),
        );
        if (Number.isFinite(customRank) && customRank !== 0) {
          return customRank;
        }
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
        class="exploit-card-placeholder ${statusClass}${hasTrendingBadge(card) ? " is-trending" : ""}${isInsecureCard(card) ? " is-insecure" : ""}"
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

  const configureCatalogMount = (mount) => {
    if (!mount) {
      return;
    }

    const section = mount.querySelector("[data-catalog-cards-section]");
    const summaryRow = mount.querySelector("[data-catalog-summary-row]");
    const itemLabel = mount.querySelector(".catalog-item-label");
    const showingPrefix = mount.querySelector(".catalog-showing-prefix");
    const updatedLabel = mount.querySelector(".catalog-status-updated-label");
    const notUpdatedLabel = mount.querySelector(".catalog-status-not-updated-label");

    if (section) {
      section.setAttribute("aria-label", SECTION_ARIA_LABEL);
    }

    if (summaryRow) {
      summaryRow.setAttribute("aria-label", SUMMARY_ARIA_LABEL);
    }

    if (itemLabel) {
      itemLabel.textContent = ITEM_LABEL_PLURAL;
    }

    if (showingPrefix) {
      showingPrefix.textContent = STATS_SHOWING_PREFIX;
    }

    if (updatedLabel) {
      updatedLabel.textContent = STATUS_LABELS.updated || "Updated";
    }

    if (notUpdatedLabel) {
      notUpdatedLabel.textContent = STATUS_LABELS.notUpdated || "Non updated";
    }
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
    if (showingCount) showingCount.textContent = `${STATS_SHOWING_PREFIX} ${filtered}/${total}`;

    scheduleSummaryTextFit(mount);
  };

  const renderEmptyState = (
    grid,
    { message = EMPTY_LOAD_MESSAGE, showFilterActions = false, showIllustration = false } = {},
  ) => {
    grid.classList.add("is-empty");
    grid.innerHTML = `
      <div class="cards-empty-state">
        ${
          showIllustration
            ? `
              <img
                class="cards-empty-gif"
                src="/public/assets/misc/hmmm.gif"
                alt="No matching results"
                loading="lazy"
              />
            `
            : ""
        }
        <p class="cards-empty-copy">${escapeHtml(message)}</p>
        ${
          showFilterActions
            ? `
              <div class="cards-empty-actions">
                <button class="cards-empty-action is-reset" type="button" data-empty-action="reset-filters">
                  <i class="fas fa-rotate-left" aria-hidden="true"></i>
                  <span>Reset filters</span>
                </button>
                <button class="cards-empty-action" type="button" data-empty-action="open-filters">
                  <i class="fas fa-sliders" aria-hidden="true"></i>
                  <span>Open filters</span>
                </button>
              </div>
            `
            : ""
        }
      </div>
    `;
  };

  const renderLoadingState = (grid, message = LOADING_MESSAGE) => {
    grid.classList.add("is-empty");
    grid.innerHTML = `
      <div class="cards-loading-state" role="status" aria-live="polite">
        <img class="cards-loading-gif" src="/public/assets/misc/loading.gif" alt="" />
        <p class="cards-loading-copy">${escapeHtml(message)}</p>
        <div class="cards-loading-actions">
          <button class="cards-empty-action cards-loading-action" type="button" data-loading-action="retry-fetching-api">
            <i class="fas fa-rotate-right" aria-hidden="true"></i>
            <span>${escapeHtml(LOADING_RETRY_LABEL)}</span>
          </button>
        </div>
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
      (count, card) =>
        count +
        (["is-not-updated", "is-issue"].includes(getCardStatusClass(card, statusMap)) ? 1 : 0),
      0,
    );

    updateSummary(mount, sortedCards.length, discoverableCards.length, updatedCount, notUpdatedCount);

    if (!sortedCards.length) {
      renderEmptyState(grid, {
        message: EMPTY_FILTERED_MESSAGE,
        showFilterActions: true,
        showIllustration: true,
      });
      return;
    }

    grid.classList.remove("is-empty");
    grid.innerHTML = sortedCards.map((card) => renderCard(card, statusMap)).join("");
    window.VOXLIS_CLICK_TRACKER?.syncTrackingSummaries?.(grid);
  };

  const loadCatalog = async ({ forceRefresh = false } = {}) => {
    const [prices, optionalFileManifestSource] = await Promise.all([
      loadPricingCatalog(),
      fetchJson(`${DATA_ROOT}/optional-files.json`, { optional: true }),
    ]);
    const optionalFileManifest = normalizeOptionalFileManifest(optionalFileManifestSource);
    const freeProductSlugs = [
      ...(Array.isArray(prices.freeProducts) ? prices.freeProducts : []),
      ...(Array.isArray(prices.$freeProducts) ? prices.$freeProducts : []),
    ].filter((slug) => typeof slug === "string" && slug);
    const freeProducts = new Set(freeProductSlugs.map((slug) => slug.toLowerCase()));
    const priceSlugs = Object.keys(prices).filter((slug) => slug !== "freeProducts" && !slug.startsWith("$"));
    const slugs = [...new Set([...priceSlugs, ...freeProductSlugs])];

    const infoEntries = await Promise.all(
      slugs.map(async (slug, catalogIndex) => {
        try {
          const { folderName, info } = await resolveCardFolder(slug);
          if (info.hidden) return null;

          return {
            slug,
            title: getCardDisplayName(slug),
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
    const suncSources = visibleEntries
      .map((entry) => getPrimarySuncSource(entry.info))
      .filter(Boolean);
    const suncPayloadMapPromise = suncSources.length
      ? loadSuncPayloadMap({ forceRefresh, sources: suncSources })
      : Promise.resolve({});

    const cards = await Promise.all(
      visibleEntries.map(async (entry) => {
        try {
          const reviewUrl = `${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/review.md`;
          const [points, modals, reviewDocument, suncSummary] = await Promise.all([
            fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/points.json`, {
              optional: true,
            }),
            shouldFetchOptionalCardFile(optionalFileManifest, "modals", entry.folderName)
              ? fetchJson(`${DATA_ROOT}/${encodeURIComponent(entry.folderName)}/modals.json`, {
                  optional: true,
                })
              : Promise.resolve(null),
            loadReviewDocument(reviewUrl, { optional: true }),
            entry.info.type === "external"
              ? Promise.resolve(null)
              : loadSuncSummary(entry.info, suncPayloadMapPromise),
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
            cardType: normalizeLineText(entry.info.type || "").toLowerCase() || "internal",
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

  const initActiveCatalog = async (mount, { forceRefresh = false } = {}) => {
    if (!mount) return;

    const grid = mount.querySelector(".cards-grid");
    if (!grid) return;

    if (mount.dataset.cardActionBound !== "true") {
      mount.addEventListener("click", handleCardActionClick);
      mount.dataset.cardActionBound = "true";
    }

    const requestToken = ++catalogState.catalogRequestToken;
    catalogState.mount = mount;
    catalogState.grid = grid;
    catalogState.cards = [];
    catalogState.statusMap = {};
    catalogState.popularityRanks = new Map();
    catalogState.popularityRequestToken += 1;
    catalogState.statusRequestToken += 1;
    configureCatalogMount(mount);
    bindSummaryTextFit(mount);
    updateSummary(mount, 0, 0);
    renderLoadingState(grid);
    window.getActiveCatalogStats = getCatalogStats;

    try {
      const assetIconAvailabilityPromise = primeAssetIconAvailability(collectCatalogAssetIcons());
      const cards = await loadCatalog({ forceRefresh });
      await assetIconAvailabilityPromise;
      if (
        requestToken !== catalogState.catalogRequestToken ||
        catalogState.mount !== mount ||
        catalogState.grid !== grid
      ) {
        return;
      }

      if (!cards.length) {
        catalogState.cards = [];
        publishCatalogStats();
        updateSummary(mount, 0, 0);
        renderEmptyState(grid, { message: EMPTY_LOAD_MESSAGE });
        return;
      }

      catalogState.cards = cards;
      catalogState.statusMap = {};
      catalogState.filters = normalizeFilters({
        ...window.getActiveCatalogFilterState?.(),
        search: window.getActiveCatalogSearchQuery?.(),
      });
      publishCatalogStats();
      void hydratePopularityLeaderboard({ forceRefresh });
      window.registerMoreInfoModalPathResolver?.((path) => {
        const normalizedTargetPath = normalizePath(path).toLowerCase();
        const targetCard = catalogState.cards.find(
          (entry) => normalizePath(getCardMoreInfoPath(entry)).toLowerCase() === normalizedTargetPath,
        );

        return targetCard ? buildCardMoreInfoOptions(targetCard) : null;
      });
      renderCatalogView();
      void hydrateCatalogStatus({ forceRefresh });
    } catch (error) {
      if (
        requestToken !== catalogState.catalogRequestToken ||
        catalogState.mount !== mount ||
        catalogState.grid !== grid
      ) {
        return;
      }

      console.error(error);
      catalogState.cards = [];
      publishCatalogStats();
      updateSummary(mount, 0, 0);
      renderEmptyState(grid, { message: EMPTY_LOAD_MESSAGE });
    }
  };

  window.getAppliedActiveCatalogFilters = () => ({ ...catalogState.filters });
  window.applyActiveCatalogFilters = (filters = {}) => {
    catalogState.filters = normalizeFilters({ ...catalogState.filters, ...filters });
    setStoredCatalogSearchQuery(catalogState.filters.search);
    dispatchSearchQuerySync(catalogState.filters.search);
    renderCatalogView();
  };
  window.setActiveCatalogSearchQuery = (search = "") => {
    catalogState.filters = normalizeFilters({ ...catalogState.filters, search });
    setStoredCatalogSearchQuery(catalogState.filters.search);
    dispatchSearchQuerySync(catalogState.filters.search);
    renderCatalogView();
  };
  window.getActiveCatalogSearchQuery = () =>
    normalizeLineText(catalogState.filters.search || getStoredCatalogSearchQuery() || "");
  window.getActiveCatalogStats = getCatalogStats;
  window.initActiveCatalog = initActiveCatalog;
  window.applyRobloxCardsCatalogFilters = window.applyActiveCatalogFilters;
  window.setRobloxCardsSearchQuery = window.setActiveCatalogSearchQuery;
  window.getRobloxCardsSearchQuery = window.getActiveCatalogSearchQuery;
  window.getRobloxCardsCatalogStats = getCatalogStats;
  window.initRobloxCardsCatalog = initActiveCatalog;
})();





