const byId = (id) => document.getElementById(id);
const query = (selector) => document.querySelector(selector);
const on = (node, eventName, handler, options) => node && node.addEventListener(eventName, handler, options);
const isVisible = (node) => {
  if (!node) return false;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const initNavbar = () => {
  const THEME_GLOW_DURATION_MS = 20000;
  const THEME_GLOW_EXIT_MS = 420;
  const elements = {
    header: byId("hdr"),
    layout: query(".navbar-layout"),
    logoLink: query(".navbar-logo-link"),
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
  let themeGlowTimeout = 0;
  let themeGlowExitTimeout = 0;
  const searchBindings = [];
  window.__robloxCardsSearchQuery =
    typeof window.__robloxCardsSearchQuery === "string" ? window.__robloxCardsSearchQuery : "";
  window.getRobloxCardsSearchQuery = () => window.__robloxCardsSearchQuery || "";

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
    window.__robloxCardsSearchQuery = nextValue;

    searchBindings.forEach((binding) => {
      if (!binding?.input || binding.input === sourceInput) return;
      if (binding.input.value !== nextValue) {
        binding.input.value = nextValue;
      }
      binding.syncState();
    });

    window.setRobloxCardsSearchQuery?.(nextValue);
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

  const clearThemeGlow = ({ animate = false } = {}) => {
    const themeControl = byId("siteThemeSelected");

    window.clearTimeout(themeGlowTimeout);
    themeGlowTimeout = 0;
    window.clearTimeout(themeGlowExitTimeout);
    themeGlowExitTimeout = 0;

    if (!themeControl) return;

    if (animate && themeControl.classList.contains("is-nav-glow")) {
      themeControl.classList.remove("is-nav-glow-out");
      void themeControl.offsetWidth;
      themeControl.classList.add("is-nav-glow-out");
      themeGlowExitTimeout = window.setTimeout(() => {
        themeControl.classList.remove("is-nav-glow", "is-nav-glow-out");
        themeGlowExitTimeout = 0;
      }, THEME_GLOW_EXIT_MS);
      return;
    }

    themeControl.classList.remove("is-nav-glow", "is-nav-glow-out");
  };

  const glowThemeControl = () => {
    const themeControl = byId("siteThemeSelected");
    if (!themeControl) return false;

    clearThemeGlow();
    void themeControl.offsetWidth;
    themeControl.classList.add("is-nav-glow");
    themeGlowTimeout = window.setTimeout(() => {
      clearThemeGlow({ animate: true });
    }, THEME_GLOW_DURATION_MS);
    return true;
  };

  const scrollToThemes = () => {
    if (isMenuOpen()) closeMenu();
    if (isSearchPanelOpen()) closeMobileSearchPanel();

    const scrollTarget = document.querySelector(".site-footer") || byId("footerMount");
    scrollTarget?.scrollIntoView({ behavior: "smooth", block: "start" });

    let attempts = 0;
    const maxAttempts = 18;

    const syncGlow = () => {
      attempts += 1;
      if (glowThemeControl() || attempts >= maxAttempts) return;
      window.setTimeout(syncGlow, 150);
    };

    window.setTimeout(syncGlow, 120);
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
  syncSearchQuery(window.getRobloxCardsSearchQuery(), null);

  on(elements.mobileMenuToggle, "click", () => (isMenuOpen() ? closeMenu() : openMenu()));
  on(elements.mobileSearchToggle, "click", () => (isSearchPanelOpen() ? closeMobileSearchPanel() : openMobileSearchPanel()));
  on(elements.mobileQuickSearchButton, "click", () => {
    if (window.innerWidth > 700 && elements.desktopSearchInput && isVisible(elements.searchContainer)) {
      elements.desktopSearchInput.focus();
      return;
    }
    isSearchPanelOpen() ? closeMobileSearchPanel() : openMobileSearchPanel();
  });

  [elements.themeNavTrigger, elements.mobileQuickThemeButton, elements.mobileThemeButton].forEach((trigger) => {
    on(trigger, "click", (event) => {
      event.preventDefault();
      scrollToThemes();
    });
  });

  on(
    document,
    "click",
    (event) => {
      if (!event.target.closest(".footer-theme-controls")) return;
      window.requestAnimationFrame(() => {
        clearThemeGlow({ animate: true });
      });
    },
    true,
  );

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

  const loadNavbar = async () => {
    try {
      const response = await fetch("src/components/navbar/navbar.html", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Failed to load navbar partial: ${response.status}`);
      mount.innerHTML = await response.text();
      initNavbar();
    } catch (error) {
      console.error(error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadNavbar, { once: true });
    return;
  }

  loadNavbar();
})();
