(() => {
  const mount = document.getElementById("filterMount");
  if (!mount) return;

  const { onDomReady, resolveSitePath, loadHtmlPartial, checkAssetExists } = window.VOXLIS_UTILS;

  const PAGE_KEY = window.VOXLIS_PAGE?.key || "roblox";
  const PAGE_CONFIG = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
  const DEFAULT_FILTERS = PAGE_CONFIG.defaultFilters ?? {
    search: "",
    sort: "random",
    platforms: [],
    tags: [],
    showInsecure: false,
  };
  const TAG_METADATA = PAGE_CONFIG.tagMetadata ?? {};
  const SORT_OPTIONS = Array.isArray(PAGE_CONFIG.sortOptions) ? PAGE_CONFIG.sortOptions : [];
  const PLATFORM_OPTIONS = Array.isArray(PAGE_CONFIG.platformOptions) ? PAGE_CONFIG.platformOptions : [];
  const TAG_OPTIONS = Array.isArray(PAGE_CONFIG.tagOptions) ? PAGE_CONFIG.tagOptions : [];
  const SHOW_ONLY_OPTIONS = Array.isArray(PAGE_CONFIG.showOnlyFilterOptions)
    ? PAGE_CONFIG.showOnlyFilterOptions
    : [];
  const SEGMENT_FILTERS = Array.isArray(PAGE_CONFIG.segmentFilters) ? PAGE_CONFIG.segmentFilters : [];
  const INSECURE_CONFIG =
    PAGE_CONFIG.insecureToggle && typeof PAGE_CONFIG.insecureToggle === "object"
      ? PAGE_CONFIG.insecureToggle
      : { enabled: false };
  const INVITE_ONLY_CONFIG =
    PAGE_CONFIG.inviteOnlyToggle && typeof PAGE_CONFIG.inviteOnlyToggle === "object"
      ? PAGE_CONFIG.inviteOnlyToggle
      : { enabled: false };
  const FILTER_TRIGGER_SELECTOR =
    "#filterButton, #mobileMenuFilterButton, #mobileTopFilterButton, #mobileQuickFilterButton";
  const DOM_IDS = {
    drawer: "filterDrawer",
    drawerBody: "filterDrawerBody",
    drawerTitle: "filterDrawerTitle",
    sortDropdown: "filterSortDropdown",
    sortOptions: "filterSortDropdownOptions",
    sortSelected: "filterSortDropdownSelected",
    closeDrawer: "closeFilterDrawer",
    applyFilters: "applyFilters",
    resetFilters: "resetFilters",
    insecureButton: "revealInsecureHold",
    insecureLabel: "revealInsecureLabel",
    inviteOnlyButton: "revealInviteOnlyHold",
    inviteOnlyLabel: "revealInviteOnlyLabel",
  };
  const INSECURE_REVEAL_STORAGE_KEY = `voxlis.filter.${PAGE_KEY}.showInsecure`;
  const INVITE_ONLY_REVEAL_STORAGE_KEY = `voxlis.filter.${PAGE_KEY}.showInviteOnly`;
  const assetIconAvailability = new Map();

  const byId = (id) => document.getElementById(id);
  const query = (selector, root = document) => root.querySelector(selector);
  const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = window.VOXLIS_UTILS.escapeHtml;
  const titleCase = (value = "") =>
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
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
  const collectFilterAssetIcons = () => [
    ...TAG_OPTIONS.map((option) => TAG_METADATA[String(option?.tag || "").trim()]?.assetIcon || "").filter(Boolean),
    ...SHOW_ONLY_OPTIONS.map((option) => option?.assetIcon || "").filter(Boolean),
  ];

  const getDrawer = () => byId(DOM_IDS.drawer);
  const getDrawerBody = () => byId(DOM_IDS.drawerBody);
  const getSortDropdown = () => byId(DOM_IDS.sortDropdown);
  const getInsecureHoldButton = () => byId(DOM_IDS.insecureButton);
  const getInsecureHoldLabel = () => byId(DOM_IDS.insecureLabel);
  const getInviteOnlyHoldButton = () => byId(DOM_IDS.inviteOnlyButton);
  const getInviteOnlyHoldLabel = () => byId(DOM_IDS.inviteOnlyLabel);

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

  const readStoredInviteOnlyReveal = () => {
    try {
      const storedValue = window.localStorage.getItem(INVITE_ONLY_REVEAL_STORAGE_KEY);
      if (storedValue == null) {
        return Boolean(DEFAULT_FILTERS.showInviteOnly);
      }

      return storedValue === "1" || storedValue === "true";
    } catch {
      return Boolean(DEFAULT_FILTERS.showInviteOnly);
    }
  };

  const persistInviteOnlyReveal = (value) => {
    try {
      if (value) {
        window.localStorage.setItem(INVITE_ONLY_REVEAL_STORAGE_KEY, "1");
        return;
      }

      window.localStorage.removeItem(INVITE_ONLY_REVEAL_STORAGE_KEY);
    } catch {}
  };

  const getCatalogSearchQuery = () =>
    typeof window.getActiveCatalogSearchQuery === "function"
      ? window.getActiveCatalogSearchQuery()
      : typeof window.getRobloxCardsSearchQuery === "function"
        ? window.getRobloxCardsSearchQuery()
        : DEFAULT_FILTERS.search || "";

  let insecureUnlocked = readStoredInsecureReveal();
  let inviteOnlyUnlocked = readStoredInviteOnlyReveal();

  const buildCheckboxIconMarkup = ({ assetIcon = "", iconClass = "", iconToneClass = "", toneClass = "" }) => {
    if (assetIcon) {
      const assetIconPath = getAssetIconPath(assetIcon);
      if (!assetIconPath || !hasAvailableAssetIcon(assetIcon)) {
        return "";
      }

      return `<span class="filter-checkbox-icon${toneClass ? ` ${escapeHtml(toneClass)}` : ""}"><span class="filter-asset-icon" style="--filter-asset-icon: url('${escapeHtml(assetIconPath)}')" aria-hidden="true"></span></span>`;
    }

    if (iconClass) {
      return `<span class="filter-checkbox-icon${toneClass ? ` ${escapeHtml(toneClass)}` : ""}"><i class="${escapeHtml(iconClass)}${iconToneClass ? ` ${escapeHtml(iconToneClass)}` : ""}" aria-hidden="true"></i></span>`;
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

  const buildFilterSection = (title, bodyMarkup, extraClassName = "") => `
    <section class="filter-section${extraClassName ? ` ${escapeHtml(extraClassName)}` : ""}">
      <h3 class="filter-section-title">${escapeHtml(title)}</h3>
      ${bodyMarkup}
    </section>
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

  const buildShowOnlyFilterMarkup = ({
    id,
    field,
    label,
    assetIcon = "",
    iconClass = "",
    iconToneClass = "",
    toneClass = "",
  }) =>
    buildCheckboxMarkup({
      id,
      label,
      dataAttributes: `data-boolean-field="${escapeHtml(field)}"`,
      assetIcon,
      iconClass,
      iconToneClass,
      toneClass,
    });

  const buildSegmentFilterSection = ({
    field,
    label,
    options = [],
    defaultValue = "",
  }) => {
    if (!field || !label || !Array.isArray(options) || !options.length) {
      return "";
    }

    return buildFilterSection(
      label,
      `
        <div class="filter-segmented-control">
          ${options
            .map((option) => {
              const value = String(option.value ?? "");
              const isDefault = value === String(defaultValue ?? "");
              return `
                <button
                  class="filter-segment-button${isDefault ? " is-active" : ""}"
                  data-filter-field="${escapeHtml(field)}"
                  data-filter-value="${escapeHtml(value)}"
                  ${isDefault ? 'data-default="true"' : ""}
                  type="button"
                >${escapeHtml(option.label || value)}</button>
              `;
            })
            .join("")}
        </div>
      `,
    );
  };

  const buildSortSection = () => {
    if (!SORT_OPTIONS.length) {
      return "";
    }

    const defaultSortValue = DEFAULT_FILTERS.sort || SORT_OPTIONS[0]?.value || "random";
    const defaultSortLabel =
      SORT_OPTIONS.find((option) => option.value === defaultSortValue)?.label ||
      SORT_OPTIONS[0]?.label ||
      "Random";

    return buildFilterSection(
      "Sort by",
      `
        <div class="custom-dropdown filter-dropdown" id="${DOM_IDS.sortDropdown}">
          <div class="custom-dropdown-selected" id="${DOM_IDS.sortSelected}">
            <span>${escapeHtml(defaultSortLabel)}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="custom-dropdown-options" id="${DOM_IDS.sortOptions}">
            ${SORT_OPTIONS.map((option) => {
              const isDefault = option.value === defaultSortValue;
              return `<div class="custom-dropdown-option${isDefault ? " selected" : ""}" data-value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</div>`;
            }).join("")}
          </div>
        </div>
      `,
    );
  };

  const buildPlatformSection = () =>
    PLATFORM_OPTIONS.length
      ? buildFilterSection(
          "Platform",
          `<div class="filter-platform-grid">${PLATFORM_OPTIONS.map((option) => buildPlatformOptionMarkup(option)).join("")}</div>`,
        )
      : "";

  const buildTagSection = () =>
    TAG_OPTIONS.length
      ? buildFilterSection(
          "Tags",
          `<div class="filter-checkbox-list filter-tag-list">${TAG_OPTIONS.map((option) => buildTagFilterMarkup(option)).join("")}</div>`,
        )
      : "";

  const buildShowOnlySection = () =>
    SHOW_ONLY_OPTIONS.length
      ? buildFilterSection(
          "Show only",
          `<div class="filter-checkbox-list">${SHOW_ONLY_OPTIONS.map((option) => buildShowOnlyFilterMarkup(option)).join("")}</div>`,
        )
      : "";

  const buildInsecureSection = () => {
    if (!INSECURE_CONFIG.enabled) {
      return "";
    }

    return `
      <section class="filter-section filter-insecure-section">
        <button
          id="${DOM_IDS.insecureButton}"
          class="filter-insecure-button"
          type="button"
          aria-pressed="false"
        >
          <span class="filter-insecure-button-copy">
            <span class="filter-insecure-header">
              <span class="filter-insecure-button-topline">
                <span class="filter-insecure-icon" aria-hidden="true">
                  <i class="fas fa-triangle-exclamation"></i>
                </span>
                <span id="${DOM_IDS.insecureLabel}" class="filter-insecure-button-title">${escapeHtml(
                  INSECURE_CONFIG.buttonLabelOff || "Show warning results",
                )}</span>
              </span>
            </span>
            <span class="filter-insecure-button-subtitle">${escapeHtml(
              INSECURE_CONFIG.subtitle ||
                "Include risky entries in the catalog results. These stay hidden by default for safety.",
            )}</span>
            <img
              class="filter-insecure-image"
              src="/public/assets/misc/evilsteamhappy.png"
              alt=""
              loading="lazy"
            />
          </span>
          <span class="filter-insecure-toggle" aria-hidden="true"></span>
        </button>
      </section>
    `;
  };

  const buildInviteOnlySection = () => {
    if (!INVITE_ONLY_CONFIG.enabled) {
      return "";
    }

    return `
      <section class="filter-section filter-insecure-section">
        <button
          id="${DOM_IDS.inviteOnlyButton}"
          class="filter-insecure-button is-invite-only"
          type="button"
          aria-pressed="false"
        >
          <span class="filter-insecure-button-copy">
            <span class="filter-insecure-header">
              <span class="filter-insecure-button-topline">
                <span class="filter-insecure-icon" aria-hidden="true">
                  <i class="fas fa-lock"></i>
                </span>
                <span id="${DOM_IDS.inviteOnlyLabel}" class="filter-insecure-button-title">${escapeHtml(
                  INVITE_ONLY_CONFIG.buttonLabelOff || "Show invite-only results",
                )}</span>
              </span>
            </span>
            <span class="filter-insecure-button-subtitle">${escapeHtml(
              INVITE_ONLY_CONFIG.subtitle ||
                "Include invite-only executors in the catalog results. These stay hidden by default.",
            )}</span>
            <img
              class="filter-insecure-image"
              src="/public/assets/misc/lock.png"
              alt=""
              loading="lazy"
            />
          </span>
          <span class="filter-insecure-toggle" aria-hidden="true"></span>
        </button>
      </section>
    `;
  };

  const renderDrawerBody = () => {
    const body = getDrawerBody();
    if (!body) return;

    body.innerHTML = [
      buildSortSection(),
      buildPlatformSection(),
      ...SEGMENT_FILTERS.map((definition) => buildSegmentFilterSection(definition)),
      buildTagSection(),
      buildShowOnlySection(),
      buildInsecureSection(),
      buildInviteOnlySection(),
    ]
      .filter(Boolean)
      .join("");
  };

  const setSelectedSortOption = (option) => {
    const selectedLabel = byId(DOM_IDS.sortSelected)?.querySelector("span");
    const optionsRoot = byId(DOM_IDS.sortOptions);
    if (!selectedLabel || !option || !optionsRoot) return;

    selectedLabel.textContent = option.textContent?.trim() || "Random";
    queryAll(".custom-dropdown-option", optionsRoot).forEach((node) => node.classList.remove("selected"));
    option.classList.add("selected");
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
        ? INSECURE_CONFIG.buttonLabelOn || "Showing warning results"
        : INSECURE_CONFIG.buttonLabelOff || "Show warning results";
    }
  };

  const syncInviteOnlyButtonState = () => {
    const button = getInviteOnlyHoldButton();
    if (!button) return;

    button.classList.toggle("is-unlocked", inviteOnlyUnlocked);
    button.setAttribute("aria-pressed", String(inviteOnlyUnlocked));
    button.setAttribute("aria-expanded", String(inviteOnlyUnlocked));

    const label = getInviteOnlyHoldLabel();
    if (label) {
      label.textContent = inviteOnlyUnlocked
        ? INVITE_ONLY_CONFIG.buttonLabelOn || "Showing invite-only results"
        : INVITE_ONLY_CONFIG.buttonLabelOff || "Show invite-only results";
    }
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

  const closeDrawer = () => {
    getSortDropdown()?.classList.remove("is-open");
    setDrawerOpen(false);
  };

  const openDrawer = ({ trackOpen = false } = {}) => {
    if (!getDrawer()) return;
    closeMobileNavbarPanels();
    syncInsecureButtonState();
    setDrawerOpen(true);
    if (trackOpen) {
      window.VOXLIS_CLICK_TRACKER?.trackUiEvent?.({
        group: "filters",
        key: "drawer-open",
      });
    }
    document.dispatchEvent(new CustomEvent("voxlis:filter-opened"));
  };

  const setSingleActive = (clickedButton) => {
    const control = clickedButton.closest(".filter-segmented-control");
    if (!control) return;
    queryAll(".filter-segment-button", control).forEach((button) => button.classList.remove("is-active"));
    clickedButton.classList.add("is-active");
  };

  const getSegmentDefaultValue = (field = "") =>
    SEGMENT_FILTERS.find((definition) => definition.field === field)?.defaultValue ??
    DEFAULT_FILTERS[field] ??
    "all";

  const getCurrentFilters = () => {
    const drawer = getDrawer();
    const filters = {
      ...DEFAULT_FILTERS,
      search: getCatalogSearchQuery(),
      platforms: [],
      tags: [],
    };

    if (!drawer) {
      return {
        ...filters,
        showInsecure: INSECURE_CONFIG.enabled ? insecureUnlocked : Boolean(DEFAULT_FILTERS.showInsecure),
        showInviteOnly: INVITE_ONLY_CONFIG.enabled ? inviteOnlyUnlocked : Boolean(DEFAULT_FILTERS.showInviteOnly),
      };
    }

    if (SORT_OPTIONS.length) {
      filters.sort =
        query(`#${DOM_IDS.sortOptions} .custom-dropdown-option.selected`, drawer)?.dataset.value ||
        DEFAULT_FILTERS.sort ||
        SORT_OPTIONS[0]?.value ||
        "random";
    }

    if (PLATFORM_OPTIONS.length) {
      filters.platforms = queryAll("input[data-platform]:checked", drawer)
        .map((input) => input.dataset.platform)
        .filter(Boolean);
    }

    SEGMENT_FILTERS.forEach((definition) => {
      filters[definition.field] =
        query(`.filter-segment-button.is-active[data-filter-field="${definition.field}"]`, drawer)?.dataset
          .filterValue || getSegmentDefaultValue(definition.field);
    });

    if (TAG_OPTIONS.length) {
      filters.tags = queryAll("input[data-tag]:checked", drawer)
        .map((input) => input.dataset.tag)
        .filter(Boolean);
    }

    SHOW_ONLY_OPTIONS.forEach((option) => {
      filters[option.field] = Boolean(query(`input[data-boolean-field="${option.field}"]`, drawer)?.checked);
    });

    if (INSECURE_CONFIG.enabled) {
      filters.showInsecure = insecureUnlocked;
    }

    if (INVITE_ONLY_CONFIG.enabled) {
      filters.showInviteOnly = inviteOnlyUnlocked;
    }

    return filters;
  };
  const getDrawerSyncFilters = () => {
    const appliedFilters =
      window.getAppliedActiveCatalogFilters && typeof window.getAppliedActiveCatalogFilters === "function"
        ? window.getAppliedActiveCatalogFilters()
        : null;
    const baseFilters =
      appliedFilters && typeof appliedFilters === "object" ? { ...appliedFilters } : getCurrentFilters();

    if (INSECURE_CONFIG.enabled) {
      baseFilters.showInsecure = insecureUnlocked;
    }

    if (INVITE_ONLY_CONFIG.enabled) {
      baseFilters.showInviteOnly = inviteOnlyUnlocked;
    }

    return baseFilters;
  };

  const syncDrawerControlsFromFilters = (filters = {}) => {
    const drawer = getDrawer();
    if (!drawer) return;

    const nextFilters = { ...DEFAULT_FILTERS, ...filters };

    queryAll("input[data-platform]", drawer).forEach((input) => {
      input.checked = Array.isArray(nextFilters.platforms) && nextFilters.platforms.includes(input.dataset.platform);
    });

    queryAll("input[data-tag]", drawer).forEach((input) => {
      input.checked = Array.isArray(nextFilters.tags) && nextFilters.tags.includes(input.dataset.tag);
    });

    queryAll("input[data-boolean-field]", drawer).forEach((input) => {
      const field = input.dataset.booleanField;
      input.checked = Boolean(nextFilters[field]);
    });

    SEGMENT_FILTERS.forEach((definition) => {
      const activeValue = String(nextFilters[definition.field] ?? getSegmentDefaultValue(definition.field));
      queryAll(`.filter-segment-button[data-filter-field="${definition.field}"]`, drawer).forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filterValue === activeValue);
      });
    });

    if (SORT_OPTIONS.length) {
      const optionsRoot = byId(DOM_IDS.sortOptions);
      const desiredValue = String(nextFilters.sort || "");
      const sortOption =
        queryAll(".custom-dropdown-option", optionsRoot).find(
          (option) => option.dataset.value === desiredValue,
        ) ||
        query(".custom-dropdown-option.selected", optionsRoot) ||
        query(".custom-dropdown-option", optionsRoot);
      if (sortOption) {
        setSelectedSortOption(sortOption);
      }
    }

    if (INSECURE_CONFIG.enabled) {
      insecureUnlocked = Boolean(nextFilters.showInsecure);
      persistInsecureReveal(insecureUnlocked);
      syncInsecureButtonState();
    }

    if (INVITE_ONLY_CONFIG.enabled) {
      inviteOnlyUnlocked = Boolean(nextFilters.showInviteOnly);
      persistInviteOnlyReveal(inviteOnlyUnlocked);
      syncInviteOnlyButtonState();
    }
  };

  const resetDrawerControls = () => {
    syncDrawerControlsFromFilters(DEFAULT_FILTERS);
    if (INSECURE_CONFIG.enabled) {
      insecureUnlocked = false;
      persistInsecureReveal(false);
      syncInsecureButtonState();
    }

    if (INVITE_ONLY_CONFIG.enabled) {
      inviteOnlyUnlocked = false;
      persistInviteOnlyReveal(false);
      syncInviteOnlyButtonState();
    }
  };

  const applyFilters = () => {
    window.applyActiveCatalogFilters?.(getCurrentFilters());
  };

  const toggleInsecureReveal = (nextValue = !insecureUnlocked) => {
    insecureUnlocked = Boolean(nextValue);
    persistInsecureReveal(insecureUnlocked);
    syncInsecureButtonState();
    applyFilters();
  };

  const toggleInviteOnlyReveal = (nextValue = !inviteOnlyUnlocked) => {
    inviteOnlyUnlocked = Boolean(nextValue);
    persistInviteOnlyReveal(inviteOnlyUnlocked);
    syncInviteOnlyButtonState();
    applyFilters();
  };

  const setupDrawerEvents = () => {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const drawer = getDrawer();

      const trigger = target.closest(FILTER_TRIGGER_SELECTOR);
      if (trigger) {
        event.preventDefault();
        syncDrawerControlsFromFilters(getDrawerSyncFilters());
        openDrawer();
        return;
      }

      if (!drawer) return;

      if (target.closest(".filter-drawer-overlay") || target.closest(`#${DOM_IDS.closeDrawer}`)) {
        closeDrawer();
        return;
      }

      if (target.closest(`#${DOM_IDS.applyFilters}`)) {
        closeDrawer();
        return;
      }

      if (target.closest(`#${DOM_IDS.resetFilters}`)) {
        resetDrawerControls();
        applyFilters();
        return;
      }

      const filterButton = target.closest(".filter-segment-button[data-filter-field]");
      if (filterButton) {
        setSingleActive(filterButton);
        applyFilters();
        return;
      }

      if (target.closest(`#${DOM_IDS.insecureButton}`)) {
        toggleInsecureReveal();
        return;
      }

      if (target.closest(`#${DOM_IDS.inviteOnlyButton}`)) {
        toggleInviteOnlyReveal();
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
        applyFilters();
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

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (
        target.closest("#filterDrawer") &&
        (target.matches("input[data-platform]") ||
          target.matches("input[data-tag]") ||
          target.matches("input[data-boolean-field]"))
      ) {
        applyFilters();
      }
    });

    document.addEventListener("voxlis:open-filter", () => {
      syncDrawerControlsFromFilters(getDrawerSyncFilters());
      openDrawer({ trackOpen: true });
    });
  };

  const loadFilter = async () => {
    try {
      await loadHtmlPartial(mount, "src/components/modals/filter/filter.html");
      await primeAssetIconAvailability(collectFilterAssetIcons());
      byId(DOM_IDS.drawerTitle).textContent = "Filters";
      renderDrawerBody();
      syncDrawerControlsFromFilters(getDrawerSyncFilters());
    } catch (error) {
      console.error(error);
    }
  };

  window.getActiveCatalogFilterState = getCurrentFilters;
  window.getRobloxCardsFilterState = getCurrentFilters;

  setupDrawerEvents();
  onDomReady(loadFilter);
})();
