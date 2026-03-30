(() => {
  const mount = document.getElementById("filterMount");
  if (!mount) return;
  const onDomReady = window.VOXLIS_UTILS?.onDomReady ?? ((callback) => callback?.());
  const loadHtmlPartial =
    window.VOXLIS_UTILS?.loadHtmlPartial ??
    (async (target, path) => {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load partial (${path}): ${response.status}`);
      }

      target.innerHTML = await response.text();
      return target;
    });

  const FILTER_TRIGGER_SELECTOR =
    "#filterButton, #mobileMenuFilterButton, #mobileTopFilterButton, #mobileQuickFilterButton";
  const DEFAULT_FILTERS = window.VOXLIS_CONFIG?.robloxCards?.defaultFilters ?? {
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
  };
  const TAG_METADATA = window.VOXLIS_CONFIG?.robloxCards?.tagMetadata ?? {};
  const DOM_IDS = {
    platformList: "filterPlatformList",
    tagList: "filterTagList",
    showOnlyList: "filterShowOnlyList",
    sortDropdown: "filterSortDropdown",
    sortOptions: "filterSortDropdownOptions",
    sortSelected: "filterSortDropdownSelected",
    closeDrawer: "closeFilterDrawer",
    applyFilters: "applyFilters",
    resetFilters: "resetFilters",
    insecureButton: "revealInsecureHold",
    insecureLabel: "revealInsecureLabel",
    insecureHint: "revealInsecureHint",
    insecureCount: "revealInsecureCount",
  };
  const SORT_OPTIONS = [
    { value: "random", label: "Random" },
    { value: "most-popular", label: "Most Popular" },
    { value: "least-popular", label: "Least Popular" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
  ];
  const PLATFORM_OPTIONS = [
    { id: "filterWindows", platform: "windows", label: "Windows", iconClass: "fab fa-windows" },
    { id: "filterMacos", platform: "macos", label: "macOS", iconClass: "fab fa-apple" },
    { id: "filterAndroid", platform: "android", label: "Android", iconClass: "fab fa-android" },
    { id: "filterIos", platform: "ios", label: "iOS", iconClass: "fas fa-mobile-screen-button" },
  ];
  const TAG_OPTIONS = [
    { id: "filterTagMultiInstance", tag: "multi-instance" },
    { id: "filterTagDecompiler", tag: "decompiler" },
    { id: "filterTagKernel", tag: "kernel", toneClass: "is-kernel" },
    { id: "filterTagUsermode", tag: "usermode", toneClass: "is-usermode" },
  ];
  const SHOW_ONLY_FILTER_FALLBACK = [
    { id: "filterVerified", field: "verified", label: "Verified", iconClass: "fas fa-circle-check", iconToneClass: "ph-good-ico", toneClass: "is-verified" },
    { id: "filterTrending", field: "trending", label: "Trending", iconClass: "fas fa-arrow-trend-up", toneClass: "is-trending" },
    { id: "filterWarning", field: "warning", label: "Warning", iconClass: "fas fa-triangle-exclamation", iconToneClass: "ph-warn-ico", toneClass: "is-warning" },
  ];
  const DEFAULT_SORT_VALUE = DEFAULT_FILTERS.sort || "random";
  const INSECURE_REVEAL_STORAGE_KEY = "voxlis.filter.showInsecure";

  const byId = (id) => document.getElementById(id);
  const query = (selector, root = document) => root.querySelector(selector);
  const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character);
  const titleCase = (value = "") =>
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const readStoredInsecureReveal = () => {
    try {
      const storedValue = window.localStorage.getItem(INSECURE_REVEAL_STORAGE_KEY);
      if (storedValue == null) {
        return Boolean(DEFAULT_FILTERS.showInsecure);
      }

      return storedValue === "1" || storedValue === "true";
    } catch {
      return Boolean(DEFAULT_FILTERS.showInsecure);
    }
  };

  const persistInsecureReveal = (value) => {
    try {
      if (value) {
        window.localStorage.setItem(INSECURE_REVEAL_STORAGE_KEY, "1");
        return;
      }

      window.localStorage.removeItem(INSECURE_REVEAL_STORAGE_KEY);
    } catch {}
  };

  let insecureUnlocked = readStoredInsecureReveal();
  let insecureOptionCount = 0;

  const getDrawer = () => byId("filterDrawer");
  const getSortDropdown = () => byId(DOM_IDS.sortDropdown);
  const getInsecureHoldButton = () => byId(DOM_IDS.insecureButton);
  const getInsecureHoldLabel = () => byId(DOM_IDS.insecureLabel);
  const getInsecureHoldHint = () => byId(DOM_IDS.insecureHint);
  const getInsecureCountBadge = () => byId(DOM_IDS.insecureCount);
  const formatInsecureCount = (count = 0) =>
    `${count} warning entr${count === 1 ? "y" : "ies"}`;

  const getShowOnlyFilterOptions = () => {
    const configuredOptions = window.VOXLIS_CONFIG?.robloxCards?.showOnlyFilterOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions.map((option) => ({ ...option }));
    }
    return SHOW_ONLY_FILTER_FALLBACK;
  };

  const getSortOptionLabel = (value = DEFAULT_SORT_VALUE) =>
    SORT_OPTIONS.find((option) => option.value === value)?.label || "Random";

  const buildCheckboxIconMarkup = ({ assetIcon = "", iconClass = "", iconToneClass = "", toneClass = "" }) => {
    if (iconClass) {
      return `<span class="filter-checkbox-icon${toneClass ? ` ${escapeHtml(toneClass)}` : ""}"><i class="${escapeHtml(iconClass)}${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" aria-hidden="true"></i></span>`;
    }

    if (assetIcon) {
      return `<span class="filter-checkbox-icon${toneClass ? ` ${escapeHtml(toneClass)}` : ""}"><span class="filter-asset-icon" style="--filter-asset-icon: url('/public/assets/${escapeHtml(assetIcon)}')" aria-hidden="true"></span></span>`;
    }

    return "";
  };

  const buildCheckboxMarkup = ({
    id,
    label,
    dataAttributes = "",
    assetIcon = "",
    iconClass = "",
    iconToneClass = "",
    toneClass = "",
  }) => `
    <label class="filter-checkbox">
      <input type="checkbox" id="${escapeHtml(id)}"${dataAttributes ? ` ${dataAttributes}` : ""}>
      <span class="filter-checkbox-mark"></span>
      <span class="filter-checkbox-label">
        ${buildCheckboxIconMarkup({ assetIcon, iconClass, iconToneClass, toneClass })}
        <span class="filter-checkbox-copy">${escapeHtml(label)}</span>
      </span>
    </label>
  `;

  const buildPlatformOptionMarkup = ({ id, platform, label, iconClass }) => `
    <div class="filter-platform-option">
      <input type="checkbox" id="${escapeHtml(id)}" data-platform="${escapeHtml(platform)}">
      <label for="${escapeHtml(id)}">
        <span class="filter-platform-label">
          <i class="${escapeHtml(iconClass)}" aria-hidden="true"></i>
          <span>${escapeHtml(label)}</span>
        </span>
      </label>
    </div>
  `;

  const buildTagFilterMarkup = ({ id, tag, toneClass = "" }) => {
    const tagMeta = TAG_METADATA[tag] ?? {};
    return buildCheckboxMarkup({
      id,
      label: tagMeta.label || titleCase(tag),
      dataAttributes: `data-tag="${escapeHtml(tag)}"`,
      assetIcon: tagMeta.assetIcon || "",
      iconClass: tagMeta.assetIcon ? "" : tagMeta.icon || "",
      iconToneClass: tagMeta.assetIcon ? "" : tagMeta.iconToneClass || "",
      toneClass,
    });
  };

  const buildShowOnlyFilterMarkup = ({ id, label, assetIcon = "", iconClass = "", iconToneClass = "", toneClass = "" }) =>
    buildCheckboxMarkup({ id, label, assetIcon, iconClass, iconToneClass, toneClass });

  const setSelectedSortOption = (option) => {
    const selectedLabel = byId(DOM_IDS.sortSelected)?.querySelector("span");
    const optionsRoot = byId(DOM_IDS.sortOptions);
    if (!selectedLabel || !option || !optionsRoot) return;

    selectedLabel.textContent = option.textContent?.trim() || getSortOptionLabel();
    queryAll(".custom-dropdown-option", optionsRoot).forEach((node) => node.classList.remove("selected"));
    option.classList.add("selected");
  };

  const renderSortOptions = () => {
    const optionsRoot = byId(DOM_IDS.sortOptions);
    if (!optionsRoot) return;

    optionsRoot.innerHTML = SORT_OPTIONS
      .map(
        (option) =>
          `<div class="custom-dropdown-option${option.value === DEFAULT_SORT_VALUE ? " selected" : ""}" data-value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</div>`,
      )
      .join("");

    const defaultOption =
      query(`[data-value="${DEFAULT_SORT_VALUE}"]`, optionsRoot) || query(".custom-dropdown-option", optionsRoot);
    if (defaultOption) setSelectedSortOption(defaultOption);
  };

  const renderPlatformOptions = () => {
    const list = byId(DOM_IDS.platformList);
    if (!list) return;
    list.innerHTML = PLATFORM_OPTIONS.map((option) => buildPlatformOptionMarkup(option)).join("");
  };

  const renderTagOptions = () => {
    const list = byId(DOM_IDS.tagList);
    if (!list) return;
    list.innerHTML = TAG_OPTIONS.map((option) => buildTagFilterMarkup(option)).join("");
  };

  const renderShowOnlyFilterOptions = () => {
    const list = byId(DOM_IDS.showOnlyList);
    if (!list) return;
    list.innerHTML = getShowOnlyFilterOptions().map((option) => buildShowOnlyFilterMarkup(option)).join("");
  };

  const syncInsecureButtonState = () => {
    const button = getInsecureHoldButton();
    if (!button) return;

    button.classList.toggle("is-unlocked", insecureUnlocked);
    button.setAttribute("aria-pressed", String(insecureUnlocked));
    button.setAttribute("aria-expanded", String(insecureUnlocked));

    const label = getInsecureHoldLabel();
    if (label) {
      label.textContent = insecureUnlocked
        ? "Showing warning results"
        : "Show warning results";
    }

    const hint = getInsecureHoldHint();
    if (hint) {
      hint.textContent = insecureUnlocked
        ? `${insecureOptionCount > 0 ? `${formatInsecureCount(insecureOptionCount)} are` : "These entries are"} included in the catalog until you turn this off or reset filters.`
        : `High-risk or not-yet-verified entries stay hidden by default${insecureOptionCount > 0 ? `. There are ${formatInsecureCount(insecureOptionCount)} available.` : "."}`;
    }

    const countBadge = getInsecureCountBadge();
    if (countBadge) {
      countBadge.hidden = insecureOptionCount <= 0;
      countBadge.textContent = formatInsecureCount(insecureOptionCount);
    }
  };

  const setInsecureOptionCount = (count = 0) => {
    const nextCount = Number.isFinite(Number(count)) ? Math.max(0, Math.round(Number(count))) : 0;
    insecureOptionCount = nextCount;
    syncInsecureButtonState();
  };

  const applyFilters = () => {
    window.applyRobloxCardsCatalogFilters?.(getCurrentFilters());
  };

  const toggleInsecureReveal = (nextValue = !insecureUnlocked) => {
    insecureUnlocked = Boolean(nextValue);
    persistInsecureReveal(insecureUnlocked);
    syncInsecureButtonState();
    applyFilters();
  };

  const resetInsecureReveal = () => {
    insecureUnlocked = false;
    persistInsecureReveal(false);
    syncInsecureButtonState();
  };

  const setDrawerOpen = (isOpen) => {
    const drawer = getDrawer();
    if (!drawer) return;
    drawer.classList.toggle("is-open", isOpen);
    drawer.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  const closeMobileNavbarPanels = () => {
    const mobileMenu = byId("mobMenu");
    const mobileMenuToggle = byId("mobMenuTgl");
    const mobileSearchPanel = byId("mobSearchPanel");
    const mobileSearchToggle = byId("mobSearchTgl");

    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
      mobileMenuToggle?.setAttribute("aria-expanded", "false");
    }

    if (mobileSearchPanel && !mobileSearchPanel.classList.contains("hidden")) {
      mobileSearchPanel.classList.add("hidden");
      mobileSearchToggle?.setAttribute("aria-expanded", "false");
    }
  };

  const openDrawer = () => {
    if (!getDrawer()) return;
    closeMobileNavbarPanels();
    syncInsecureButtonState();
    setDrawerOpen(true);
    document.dispatchEvent(new CustomEvent("voxlis:filter-opened"));
  };

  const closeDrawer = () => {
    getSortDropdown()?.classList.remove("is-open");
    setDrawerOpen(false);
  };

  const setSingleActive = (clickedButton) => {
    const control = clickedButton.closest(".filter-segmented-control");
    if (!control) return;
    queryAll(".filter-segment-button", control).forEach((button) => button.classList.remove("is-active"));
    clickedButton.classList.add("is-active");
  };

  const resetDrawerControls = () => {
    const drawer = getDrawer();
    if (!drawer) return;

    queryAll('input[type="checkbox"]', drawer).forEach((checkbox) => {
      checkbox.checked = false;
    });

    queryAll(".filter-segment-button", drawer).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.default === "true");
    });

    const sortOptions = byId(DOM_IDS.sortOptions);
    const defaultSortOption = sortOptions ? query(`[data-value="${DEFAULT_SORT_VALUE}"]`, sortOptions) : null;
    if (defaultSortOption) setSelectedSortOption(defaultSortOption);

    resetInsecureReveal();
  };

  const getActiveSegmentValue = (attributeName, fallback = "all") => {
    const drawer = getDrawer();
    if (!drawer) return fallback;

    return (
      query(`.filter-segment-button.is-active[${attributeName}]`, drawer)?.getAttribute(attributeName) ||
      fallback
    );
  };

  const getCurrentFilters = () => {
    const drawer = getDrawer();
    if (!drawer) {
      return {
        search: window.getRobloxCardsSearchQuery?.() || DEFAULT_FILTERS.search || "",
        sort: DEFAULT_SORT_VALUE,
        platforms: Array.isArray(DEFAULT_FILTERS.platforms) ? [...DEFAULT_FILTERS.platforms] : [],
        price: DEFAULT_FILTERS.price || "all",
        key: DEFAULT_FILTERS.key || "all",
        type: DEFAULT_FILTERS.type || "all",
        tags: Array.isArray(DEFAULT_FILTERS.tags) ? [...DEFAULT_FILTERS.tags] : [],
        verified: Boolean(DEFAULT_FILTERS.verified),
        trending: Boolean(DEFAULT_FILTERS.trending),
        warning: Boolean(DEFAULT_FILTERS.warning),
        updatedState: DEFAULT_FILTERS.updatedState || "all",
        showInsecure: insecureUnlocked,
      };
    }

    return {
      search: window.getRobloxCardsSearchQuery?.() || DEFAULT_FILTERS.search || "",
      sort: query(`#${DOM_IDS.sortOptions} .custom-dropdown-option.selected`, drawer)?.dataset.value || DEFAULT_SORT_VALUE,
      platforms: queryAll('input[data-platform]:checked', drawer).map((input) => input.dataset.platform).filter(Boolean),
      price: getActiveSegmentValue("data-price", DEFAULT_FILTERS.price || "all"),
      key: getActiveSegmentValue("data-key", DEFAULT_FILTERS.key || "all"),
      type: getActiveSegmentValue("data-type", DEFAULT_FILTERS.type || "all"),
      tags: queryAll('input[data-tag]:checked', drawer).map((input) => input.dataset.tag).filter(Boolean),
      verified: Boolean(byId("filterVerified")?.checked),
      trending: Boolean(byId("filterTrending")?.checked),
      warning: Boolean(byId("filterWarning")?.checked),
      updatedState: getActiveSegmentValue("data-updated", DEFAULT_FILTERS.updatedState || "all"),
      showInsecure: insecureUnlocked,
    };
  };

  const setupDrawerEvents = () => {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const drawer = getDrawer();

      const trigger = target.closest(FILTER_TRIGGER_SELECTOR);
      if (trigger) {
        event.preventDefault();
        openDrawer();
        return;
      }

      if (!drawer) return;

      if (target.closest(".filter-drawer-overlay") || target.closest(`#${DOM_IDS.closeDrawer}`)) {
        closeDrawer();
        return;
      }

      if (target.closest(`#${DOM_IDS.applyFilters}`)) {
        applyFilters();
        closeDrawer();
        return;
      }

      if (target.closest(`#${DOM_IDS.resetFilters}`)) {
        resetDrawerControls();
        applyFilters();
        return;
      }

      const filterButton = target.closest(".filter-segment-button");
      if (filterButton) {
        setSingleActive(filterButton);
        return;
      }

      if (target.closest(`#${DOM_IDS.insecureButton}`)) {
        toggleInsecureReveal();
        return;
      }

      const dropdown = getSortDropdown();
      if (!dropdown) return;

      if (target.closest(`#${DOM_IDS.sortSelected}`)) {
        dropdown.classList.toggle("is-open");
        return;
      }

      const option = target.closest(`#${DOM_IDS.sortOptions} .custom-dropdown-option`);
      if (option) {
        setSelectedSortOption(option);
        dropdown.classList.remove("is-open");
        return;
      }

      if (!target.closest(`#${DOM_IDS.sortDropdown}`)) {
        dropdown.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!getDrawer()?.classList.contains("is-open")) return;
      closeDrawer();
    });

    document.addEventListener("voxlis:open-filter", openDrawer);
  };

  const loadFilter = async () => {
    try {
      await loadHtmlPartial(mount, "src/components/filter/filter.html");
      renderSortOptions();
      renderPlatformOptions();
      renderTagOptions();
      renderShowOnlyFilterOptions();
      syncInsecureButtonState();
      setInsecureOptionCount(window.getRobloxCardsCatalogStats?.().insecureCount || 0);
    } catch (error) {
      console.error(error);
    }
  };

  window.getRobloxCardsFilterState = getCurrentFilters;

  setupDrawerEvents();
  document.addEventListener("voxlis:catalog-stats", (event) => {
    setInsecureOptionCount(event.detail?.insecureCount || 0);
  });

  onDomReady(loadFilter);
})();
