const byId = (id) => document.getElementById(id);
const query = (selector) => document.querySelector(selector);
const on = (node, eventName, handler, options) => node && node.addEventListener(eventName, handler, options);
const NAVBAR_WARNING_STORAGE_KEY = "voxlis-hide-navbar-warning";
const API_OUTAGE_MESSAGE =
  window.VOXLIS_API_HEALTH?.outageMessage ||
  "We are experiencing a DDOS attack, some information may not be aviable";
const isVisible = (node) => {
  if (!node) return false;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const readStoredNavbarWarningHidden = () => {
  try {
    const stored = window.sessionStorage.getItem(NAVBAR_WARNING_STORAGE_KEY);
    return stored === "1" || stored === "true";
  } catch {
    return false;
  }
};

const getApiOutageState = () =>
  window.VOXLIS_API_HEALTH?.getState?.() ?? {
    isDown: false,
    message: API_OUTAGE_MESSAGE,
  };
const isApiOutageActive = () => Boolean(getApiOutageState().isDown);

const setNavbarWarningHidden = (nextHidden, { persist = true } = {}) => {
  const warningBar = byId("topWarningBar");
  const forceVisible = isApiOutageActive();
  const hidden = forceVisible ? false : Boolean(nextHidden);

  if (warningBar) {
    warningBar.hidden = hidden;
    warningBar.classList.toggle("hidden", hidden);
  }

  if (persist && !forceVisible) {
    try {
      window.sessionStorage.setItem(NAVBAR_WARNING_STORAGE_KEY, hidden ? "1" : "0");
    } catch {
      // Ignore storage failures and still honor the current UI state.
    }
  }

  return hidden;
};

const syncNavbarApiOutageWarning = (state = getApiOutageState()) => {
  const warningBar = byId("topWarningBar");
  const warningText = query(".navbar-warning-text");
  if (!warningBar) {
    return;
  }

  if (warningText && !warningText.dataset.defaultText) {
    warningText.dataset.defaultText = warningText.textContent || "";
  }

  if (state?.isDown) {
    if (warningText) {
      warningText.textContent = state.message || API_OUTAGE_MESSAGE;
    }

    warningBar.dataset.apiOutage = "true";
    warningBar.hidden = false;
    warningBar.classList.remove("hidden");
    return;
  }

  delete warningBar.dataset.apiOutage;
  if (warningText) {
    warningText.textContent = warningText.dataset.defaultText || "";
  }
  setNavbarWarningHidden(readStoredNavbarWarningHidden(), { persist: false });
};

const getActiveCatalogPageKey = () => window.VOXLIS_PAGE?.key || "roblox";
const getCatalogSearchStore = () => {
  if (!window.__voxlisCatalogSearchQueries || typeof window.__voxlisCatalogSearchQueries !== "object") {
    window.__voxlisCatalogSearchQueries = {};
  }
  return window.__voxlisCatalogSearchQueries;
};
const getStoredCatalogSearchQuery = (pageKey = getActiveCatalogPageKey()) =>
  typeof getCatalogSearchStore()[pageKey] === "string" ? getCatalogSearchStore()[pageKey] : "";
const setStoredCatalogSearchQuery = (value = "", pageKey = getActiveCatalogPageKey()) => {
  getCatalogSearchStore()[pageKey] = String(value);
  return getCatalogSearchStore()[pageKey];
};

const initNavbar = () => {
  const activeCatalog = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
  const pageKey = getActiveCatalogPageKey();
  const elements = {
    header: byId("hdr"),
    layout: query(".navbar-layout"),
    logoLink: query(".navbar-logo-link"),
    desktopHomeLink: byId("navbarDesktopHomeLink"),
    mobileHomeLink: byId("navbarMobileHomeLink"),
    searchContainer: query(".navbar-search"),
    desktopLinks: query(".navbar-links"),
    mobileQuickNav: query(".mobile-quick-nav"),
    mobileMenuPanel: byId("mobMenu"),
    mobileMenuToggle: byId("mobMenuTgl"),
    mobileSearchToggle: byId("mobSearchTgl"),
    mobileSearchPanel: byId("mobSearchPanel"),
    mobileQuickSearchButton: byId("mobQuickSearchBtn"),
    themeNavTrigger: byId("themeNavTrigger"),
    mobileQuickThemeButton: byId("mobQuickThemeBtn"),
    mobileThemeButton: byId("mobThemeBtn"),
    desktopSearchInput: byId("srchInp"),
    mobilePanelSearchInput: byId("mobPanelSrchInp"),
    mobileMenuSearchInput: byId("mobSrchInp"),
  };

  if (
    !elements.header ||
    !elements.layout ||
    !elements.logoLink ||
    !elements.searchContainer ||
    !elements.desktopLinks ||
    !elements.mobileMenuPanel ||
    !elements.mobileMenuToggle
  ) {
    return;
  }

  const isMenuOpen = () => !elements.mobileMenuPanel.classList.contains("hidden");
  const isSearchPanelOpen = () => Boolean(elements.mobileSearchPanel && !elements.mobileSearchPanel.classList.contains("hidden"));
  const setHidden = (node, shouldHide) => node && node.classList.toggle("hidden", shouldHide);
  const setExpanded = (node, value) => node && node.setAttribute("aria-expanded", String(Boolean(value)));
  const searchBindings = [];
  let themesDrawerLoadPromise = null;
  window.getActiveCatalogSearchQuery = () => getStoredCatalogSearchQuery(pageKey);
  window.getRobloxCardsSearchQuery = () => getStoredCatalogSearchQuery("roblox");
  if (!getStoredCatalogSearchQuery(pageKey)) {
    setStoredCatalogSearchQuery(window.getActiveCatalogSearchQuery?.() || "", pageKey);
  }

  const homePath = activeCatalog.homePath || "/";
  [elements.logoLink, elements.desktopHomeLink, elements.mobileHomeLink].forEach((link) => {
    if (link) {
      link.setAttribute("href", homePath);
    }
  });

  [elements.desktopSearchInput, elements.mobilePanelSearchInput, elements.mobileMenuSearchInput]
    .filter(Boolean)
    .forEach((input) => {
      input.placeholder = activeCatalog.searchPlaceholder || "Search cards...";
    });

  const syncHeaderScrolled = () => {
    elements.header.classList.toggle("is-scrolled", window.scrollY > 0);
  };

  const syncMobileMenuTop = () => {
    const top = Math.max(0, elements.header.getBoundingClientRect().bottom);
    elements.mobileMenuPanel.style.setProperty("--navbar-mobile-menu-top", `${top}px`);
  };

  const syncDuplicateSearchVisibility = () => {
    elements.mobileMenuPanel.classList.toggle("hide-duplicate-search", isVisible(elements.searchContainer));
  };

  const syncSearchQuery = (nextValue = "", sourceInput = null) => {
    setStoredCatalogSearchQuery(nextValue, pageKey);

    searchBindings.forEach((binding) => {
      if (!binding?.input || binding.input === sourceInput) return;
      if (binding.input.value !== nextValue) {
        binding.input.value = nextValue;
      }
      binding.syncState();
    });

    if (typeof window.setActiveCatalogSearchQuery === "function") {
      window.setActiveCatalogSearchQuery(nextValue);
      return;
    }

    window.setRobloxCardsSearchQuery?.(nextValue);
  };
  const syncSearchInputsFromExternalState = (nextValue = "") => {
    setStoredCatalogSearchQuery(nextValue, pageKey);

    searchBindings.forEach((binding) => {
      if (!binding?.input) return;
      if (binding.input.value !== nextValue) {
        binding.input.value = nextValue;
      }
      binding.syncState();
    });
  };

  const bindSearchField = (container, input, clearButton) => {
    if (!container || !input) return null;

    const syncState = () => {
      const hasValue = input.value.length > 0;
      container.classList.toggle("has-value", hasValue);
      clearButton?.classList.toggle("hidden", !hasValue);
    };

    const handleQueryChange = () => {
      syncState();
      syncSearchQuery(input.value, input);
    };

    on(input, "input", handleQueryChange);
    on(input, "change", handleQueryChange);
    on(clearButton, "click", () => {
      input.value = "";
      syncState();
      syncSearchQuery("", input);
      input.focus();
    });

    syncState();
    return { input, syncState };
  };

  const closeMenu = () => {
    setHidden(elements.mobileMenuPanel, true);
    document.body.style.overflow = "";
    setExpanded(elements.mobileMenuToggle, false);
  };

  const closeMobileSearchPanel = () => {
    setHidden(elements.mobileSearchPanel, true);
    setExpanded(elements.mobileSearchToggle, false);
  };

  const openMenu = (focusSearch = false) => {
    if (isSearchPanelOpen()) closeMobileSearchPanel();
    syncHeaderScrolled();
    syncMobileMenuTop();
    syncDuplicateSearchVisibility();
    setHidden(elements.mobileMenuPanel, false);
    document.body.style.overflow = "hidden";
    setExpanded(elements.mobileMenuToggle, true);

    if (!focusSearch) return;

    window.setTimeout(() => {
      if (!elements.mobileMenuPanel.classList.contains("hide-duplicate-search") && elements.mobileMenuSearchInput) {
        elements.mobileMenuSearchInput.focus();
        return;
      }
      if (elements.desktopSearchInput && isVisible(elements.desktopSearchInput)) {
        elements.desktopSearchInput.focus();
      }
    }, 60);
  };

  const openMobileSearchPanel = () => {
    if (!elements.mobileSearchPanel) return;
    if (isMenuOpen()) closeMenu();
    setHidden(elements.mobileSearchPanel, false);
    setExpanded(elements.mobileSearchToggle, true);
    if (elements.mobilePanelSearchInput) {
      window.setTimeout(() => elements.mobilePanelSearchInput.focus(), 50);
    }
  };

  const ensureThemesDrawerReady = async () => {
    if (typeof window.openSiteThemes === "function") {
      return true;
    }

    if (themesDrawerLoadPromise) {
      return themesDrawerLoadPromise;
    }

    themesDrawerLoadPromise = (async () => {
      const loadHtmlPartial = window.VOXLIS_UTILS?.loadHtmlPartial;
      const themesMount = byId("themesMount");

      if (themesMount && !themesMount.querySelector(".site-themes") && loadHtmlPartial) {
        await loadHtmlPartial(themesMount, "src/components/modals/themes/themes.html");
      }

      window.initSiteThemes?.(document);

      return typeof window.openSiteThemes === "function";
    })().finally(() => {
      themesDrawerLoadPromise = null;
    });

    return themesDrawerLoadPromise;
  };

  const openThemesDrawer = async (trigger = null) => {
    if (isMenuOpen()) closeMenu();
    if (isSearchPanelOpen()) closeMobileSearchPanel();

    const isReady = await ensureThemesDrawerReady();
    if (!isReady) {
      return;
    }

    if (window.openSiteThemes) {
      window.openSiteThemes({ trigger });
    }
  };

  const syncLayout = () => {
    syncDuplicateSearchVisibility();
    if (isMenuOpen()) syncMobileMenuTop();
  };

  searchBindings.push(
    bindSearchField(elements.searchContainer, elements.desktopSearchInput, byId("clrSrch")),
    bindSearchField(query(".mobile-search-panel-field"), elements.mobilePanelSearchInput, byId("mobPanelClrSrch")),
    bindSearchField(query(".mobile-menu-search"), elements.mobileMenuSearchInput, byId("mobClrSrch")),
  );
  const navbarWarningOverride = activeCatalog.navbarWarning;
  if (navbarWarningOverride && typeof navbarWarningOverride === "object" && navbarWarningOverride.text) {
    const warningBar = byId("topWarningBar");
    const warningText = query(".navbar-warning-text");
    const warningLink = query(".navbar-warning-link");
    if (warningText) {
      warningText.textContent = navbarWarningOverride.text;
      if (!warningText.dataset.defaultText) {
        warningText.dataset.defaultText = navbarWarningOverride.text;
      }
    }
    if (warningLink && navbarWarningOverride.href) {
      warningLink.setAttribute("href", navbarWarningOverride.href);
    }
  }

  setNavbarWarningHidden(readStoredNavbarWarningHidden(), { persist: false });
  syncNavbarApiOutageWarning(getApiOutageState());
  syncSearchQuery(window.getActiveCatalogSearchQuery(), null);

  on(byId("warningCloseBtn"), "click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setNavbarWarningHidden(true);
  });

  on(elements.mobileMenuToggle, "click", () => (isMenuOpen() ? closeMenu() : openMenu()));
  on(elements.mobileSearchToggle, "click", () => (isSearchPanelOpen() ? closeMobileSearchPanel() : openMobileSearchPanel()));
  on(elements.mobileQuickSearchButton, "click", () => {
    if (window.innerWidth > 700 && elements.desktopSearchInput && isVisible(elements.searchContainer)) {
      elements.desktopSearchInput.focus();
      return;
    }
    isSearchPanelOpen() ? closeMobileSearchPanel() : openMobileSearchPanel();
  });
  document.addEventListener("voxlis:sync-search-query", (event) => {
    if ((event.detail?.pageKey || pageKey) !== pageKey) {
      return;
    }

    syncSearchInputsFromExternalState(String(event.detail?.value || ""));
  });
  on(window, "voxlis:api-health-change", (event) => {
    syncNavbarApiOutageWarning(event.detail);
  });

  [elements.themeNavTrigger, elements.mobileQuickThemeButton, elements.mobileThemeButton].forEach((trigger) => {
    on(trigger, "click", (event) => {
      event.preventDefault();
      void openThemesDrawer(event.currentTarget || trigger);
    });
  });

  on(elements.mobileMenuPanel, "click", (event) => event.target === elements.mobileMenuPanel && closeMenu());
  on(document, "keydown", (event) => {
    if (event.key !== "Escape") return;
    if (isMenuOpen()) closeMenu();
    if (isSearchPanelOpen()) closeMobileSearchPanel();
  });

  syncHeaderScrolled();
  syncLayout();

  on(window, "scroll", syncHeaderScrolled, { passive: true });
  on(window, "resize", () => {
    syncLayout();
    if (window.innerWidth > 700 && isSearchPanelOpen()) closeMobileSearchPanel();
    if (window.innerWidth > 980 && isMenuOpen()) closeMenu();
  });

  const navModeMediaQuery = window.matchMedia("(max-width: 980px)");
  on(navModeMediaQuery, "change", () => {
    syncLayout();
    if (window.innerWidth > 700 && isSearchPanelOpen()) closeMobileSearchPanel();
    if (window.innerWidth > 980 && isMenuOpen()) closeMenu();
  });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(syncLayout);
    [elements.layout, elements.logoLink, elements.desktopLinks, elements.mobileQuickNav].forEach((node) => {
      if (node) observer.observe(node);
    });
  }

  document.fonts?.ready?.then(syncLayout);
};

(() => {
  const mount = byId("navbarMount");
  if (!mount) return;
  const { onDomReady, resolveSitePath, loadHtmlPartial } = window.VOXLIS_UTILS;

  const loadNavbar = async () => {
    try {
      await loadHtmlPartial(mount, "src/components/global/navbar/navbar.html");
      initNavbar();
    } catch (error) {
      console.error(error);
    }
  };

  onDomReady(loadNavbar);
})();

window.setNavbarWarningHidden = setNavbarWarningHidden;
