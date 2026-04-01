(() => {
  const onDomReady = (callback) => {
    if (typeof callback !== "function") return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  const resolveSitePath = (path = "") => {
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
  };
  const assetAvailabilityCache = new Map();

  const checkAssetExists = async (path = "") => {
    const resolvedPath = resolveSitePath(path);
    if (!resolvedPath) {
      return false;
    }

    if (assetAvailabilityCache.has(resolvedPath)) {
      return assetAvailabilityCache.get(resolvedPath);
    }

    const request = fetch(resolvedPath, { cache: "force-cache" })
      .then((response) => response.ok)
      .catch(() => false);

    assetAvailabilityCache.set(resolvedPath, request);
    return request;
  };

  const loadHtmlPartial = async (mount, path) => {
    if (!mount) {
      throw new Error(`Cannot load partial without a mount node (${path})`);
    }

    const resolvedPath = resolveSitePath(path);
    const response = await fetch(resolvedPath, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load partial (${resolvedPath}): ${response.status}`);
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
  const configSources =
    window.VOXLIS_CONFIG_SOURCES && typeof window.VOXLIS_CONFIG_SOURCES === "object"
      ? window.VOXLIS_CONFIG_SOURCES
      : {};
  const globalSource =
    configSources.global && typeof configSources.global === "object" ? configSources.global : {};
  const catalogSources =
    configSources.catalogs && typeof configSources.catalogs === "object" ? configSources.catalogs : {};

  const titleCase = (value = "") =>
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const buildSortOptions = (sortOptions = []) =>
    Array.isArray(sortOptions) ? sortOptions : [];

  const buildPlatformOptions = (platformOrder = [], platformLabels = {}, platformIcons = {}) =>
    platformOrder.map((platform) => ({
      id: `filterPlatform${platform}`,
      platform,
      label: platformLabels[platform] || platform,
      iconClass: platformIcons[platform] || "fas fa-desktop",
    }));

  const buildTagOptions = (filterableTags = []) =>
    filterableTags.map((tag) => ({
      id: `filterTag${tag.replace(/[^a-z0-9]+/gi, "-")}`,
      tag,
    }));

  const normalizeInfoText = (value = "", fallback = "") => {
    const normalizedValue = String(value || "").trim();
    return normalizedValue || fallback;
  };

  const normalizeBadgeDefinitions = (definitions = {}) =>
    Object.fromEntries(
      Object.entries(definitions).map(([key, definition]) => {
        const badgeDefinition = definition && typeof definition === "object" ? definition : {};
        const label = badgeDefinition.label || titleCase(key);
        const info = normalizeInfoText(
          badgeDefinition.info || badgeDefinition.message,
          `${label} is enabled for this product.`,
        );

        return [
          key,
          {
            ...badgeDefinition,
            key,
            id:
              badgeDefinition.id ||
              `filter${String(badgeDefinition.field || key)
                .replace(/[-_]+/g, " ")
                .replace(/\b\w/g, (character) => character.toUpperCase())
                .replace(/[^a-z0-9]+/gi, "")}`,
            field: badgeDefinition.field || key,
            label,
            iconClass: badgeDefinition.iconClass || badgeDefinition.icon || "",
            info,
            message: info,
            toastIcon: badgeDefinition.toastIcon || "fa-circle-info",
          },
        ];
      }),
    );

  const normalizeTagMetadata = (definitions = {}) =>
    Object.fromEntries(
      Object.entries(definitions).map(([key, definition]) => {
        const tagDefinition = definition && typeof definition === "object" ? definition : {};
        const label = tagDefinition.label || titleCase(key);
        const info = normalizeInfoText(
          tagDefinition.info || tagDefinition.message,
          `${label} is supported by this product.`,
        );

        return [
          key,
          {
            ...tagDefinition,
            label,
            iconClass: tagDefinition.iconClass || tagDefinition.icon || "",
            info,
            message: info,
          },
        ];
      }),
    );

  const buildShowOnlyFilterOptions = (filterKeys = [], badgeDefinitions = {}) =>
    filterKeys
      .map((filterKey) => {
        const badgeDefinition = badgeDefinitions[filterKey];
        if (!badgeDefinition) {
          return null;
        }

        return {
          id: badgeDefinition.id,
          field: badgeDefinition.field,
          label: badgeDefinition.label,
          assetIcon: badgeDefinition.assetIcon || "",
          iconClass: badgeDefinition.iconClass || "",
          iconToneClass: badgeDefinition.iconToneClass || "",
          toneClass: badgeDefinition.toneClass || "",
          info: badgeDefinition.info || "",
          message: badgeDefinition.message || "",
          toastIcon: badgeDefinition.toastIcon || "fa-circle-info",
        };
      })
      .filter(Boolean);

  const buildCatalogConfig = (catalogKey, sourceConfig = {}, { badges, statusLabels, sortOptions }) => {
    const catalogConfig = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : {};
    const platformOrder = Array.isArray(catalogConfig.platformOrder) ? catalogConfig.platformOrder : [];
    const platformLabels =
      catalogConfig.platformLabels && typeof catalogConfig.platformLabels === "object"
        ? catalogConfig.platformLabels
        : {};
    const platformIcons =
      catalogConfig.platformIcons && typeof catalogConfig.platformIcons === "object"
        ? catalogConfig.platformIcons
        : {};
    const tagMetadata = normalizeTagMetadata(catalogConfig.tags || catalogConfig.tagMetadata || {});
    const filterableTags =
      Array.isArray(catalogConfig.filterableTags) && catalogConfig.filterableTags.length
        ? catalogConfig.filterableTags
        : Object.keys(tagMetadata);
    const labels = catalogConfig.labels && typeof catalogConfig.labels === "object" ? catalogConfig.labels : {};
    const showOnlyFilterKeys =
      Array.isArray(catalogConfig.showOnlyFilters) && catalogConfig.showOnlyFilters.length
        ? catalogConfig.showOnlyFilters
        : ["verified", "trending", "warning"];

    return {
      ...catalogConfig,
      key: catalogConfig.key || catalogKey,
      routeBasePath: catalogConfig.routeBasePath || `/${catalogKey}.html`,
      homePath: catalogConfig.homePath || catalogConfig.routeBasePath || `/${catalogKey}.html`,
      pageTitle: catalogConfig.pageTitle || titleCase(catalogKey),
      cardNameOverrides:
        catalogConfig.cardNameOverrides && typeof catalogConfig.cardNameOverrides === "object"
          ? catalogConfig.cardNameOverrides
          : {},
      platformOrder,
      platformLabels,
      platformIcons,
      platformOptions: buildPlatformOptions(platformOrder, platformLabels, platformIcons),
      tagMetadata,
      filterableTags,
      tagOptions: buildTagOptions(filterableTags),
      showOnlyFilters: showOnlyFilterKeys,
      showOnlyFilterOptions: buildShowOnlyFilterOptions(showOnlyFilterKeys, badges),
      sortOptions: buildSortOptions(catalogConfig.sortOptions || sortOptions),
      typeLabels: catalogConfig.typeLabels && typeof catalogConfig.typeLabels === "object" ? catalogConfig.typeLabels : {},
      defaultFilters: {
        search: "",
        sort: "random",
        platforms: [],
        tags: [],
        showInsecure: false,
        ...(catalogConfig.defaultFilters && typeof catalogConfig.defaultFilters === "object"
          ? catalogConfig.defaultFilters
          : {}),
      },
      labels: {
        ...labels,
        statusLabels:
          labels.statusLabels && typeof labels.statusLabels === "object" ? labels.statusLabels : statusLabels,
      },
      segmentFilters: Array.isArray(catalogConfig.segmentFilters) ? catalogConfig.segmentFilters : [],
      prompts: catalogConfig.prompts && typeof catalogConfig.prompts === "object" ? catalogConfig.prompts : {},
      insecureToggle:
        catalogConfig.insecureToggle && typeof catalogConfig.insecureToggle === "object"
          ? catalogConfig.insecureToggle
          : { enabled: false },
    };
  };

  const normalizedBadges = normalizeBadgeDefinitions(
    globalSource.badges && typeof globalSource.badges === "object" ? globalSource.badges : {},
  );
  const sharedStatusLabels =
    globalSource.statusLabels && typeof globalSource.statusLabels === "object"
      ? globalSource.statusLabels
      : {};
  const sharedSortOptions = buildSortOptions(globalSource.sortOptions || []);
  const catalogPages = Object.fromEntries(
    Object.entries(catalogSources).map(([catalogKey, sourceConfig]) => [
      catalogKey,
      buildCatalogConfig(catalogKey, sourceConfig, {
        badges: normalizedBadges,
        statusLabels: sharedStatusLabels,
        sortOptions: sharedSortOptions,
      }),
    ]),
  );

  const resolveCatalogPageKey = (pages, fallbackKey = "roblox") => {
    const explicitKey = String(document.body?.dataset.catalogPage || "").trim().toLowerCase();
    if (explicitKey && pages[explicitKey]) {
      return explicitKey;
    }

    const [firstSegment = ""] = window.location.pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean);
    const normalizedSegment = firstSegment.replace(/\.html?$/i, "");

    return pages[firstSegment] ? firstSegment : pages[normalizedSegment] ? normalizedSegment : fallbackKey;
  };

  const availablePageKeys = Object.keys(catalogPages);
  const fallbackCatalogPageKey = availablePageKeys.includes("roblox")
    ? "roblox"
    : availablePageKeys[0] || "roblox";
  const activeCatalogPageKey = resolveCatalogPageKey(catalogPages, fallbackCatalogPageKey);
  const activeCatalogPage = catalogPages[activeCatalogPageKey] || catalogPages[fallbackCatalogPageKey] || {};

  existingConfig.badges = normalizedBadges;
  existingConfig.activeCatalogPageKey = activeCatalogPageKey;
  existingConfig.activeCatalogPage = activeCatalogPage;
  existingConfig.promo =
    globalSource.promo && typeof globalSource.promo === "object" ? globalSource.promo : existingConfig.promo || {};
  existingConfig.featured =
    globalSource.featured && typeof globalSource.featured === "object"
      ? globalSource.featured
      : existingConfig.featured || {};

  const frozenConfig = deepFreeze(existingConfig);
  const frozenPage = deepFreeze({
    key: activeCatalogPageKey,
    catalog: activeCatalogPage,
  });

  window.VOXLIS_UTILS = Object.freeze({
    onDomReady,
    loadHtmlPartial,
    resolveSitePath,
    checkAssetExists,
    getActiveCatalogPageKey: () => frozenPage.key,
    getActiveCatalogPage: () => frozenPage.catalog,
  });
  window.VOXLIS_PAGE = frozenPage;
  window.VOXLIS_CONFIG = frozenConfig;
})();
