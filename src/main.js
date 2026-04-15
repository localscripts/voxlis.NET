(() => {
  const { onDomReady: onReady, loadHtmlPartial: loadInto } = window.VOXLIS_UTILS;
  const PROMPT_DELAY_MS = 10000;
  const trackToastEvent = (key = "") => {
    window.VOXLIS_CLICK_TRACKER?.trackUiEvent?.({
      group: "toasts",
      key,
    });
  };
  const parseTimestamp = (value) => {
    if (value instanceof Date && Number.isFinite(value.getTime())) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      const nextDate = new Date(value);
      return Number.isFinite(nextDate.getTime()) ? nextDate : null;
    }

    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) {
      return null;
    }

    const nextDate = new Date(normalizedValue);
    return Number.isFinite(nextDate.getTime()) ? nextDate : null;
  };
  const formatTimestamp = (value) => {
    const date = parseTimestamp(value);
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };
  const formatRelativeElapsedTime = (value) => {
    const date = parseTimestamp(value);
    if (!date) {
      return "";
    }

    const diffMs = Date.now() - date.getTime();
    const tense = diffMs >= 0 ? -1 : 1;
    const absDiffMs = Math.abs(diffMs);
    const units = [
      ["year", 1000 * 60 * 60 * 24 * 365],
      ["month", 1000 * 60 * 60 * 24 * 30],
      ["week", 1000 * 60 * 60 * 24 * 7],
      ["day", 1000 * 60 * 60 * 24],
      ["hour", 1000 * 60 * 60],
      ["minute", 1000 * 60],
      ["second", 1000],
    ];

    for (const [unit, unitMs] of units) {
      if (absDiffMs >= unitMs || unit === "second") {
        const valueForUnit = Math.max(1, Math.floor(absDiffMs / unitMs)) * tense;
        return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(valueForUnit, unit);
      }
    }

    return "just now";
  };
  const getUpdateToastConfig = (activeCatalog = {}) =>
    activeCatalog.updateToast && typeof activeCatalog.updateToast === "object"
      ? activeCatalog.updateToast
      : {};
  const getRepositoryConfig = () => {
    const repository = window.VOXLIS_CONFIG?.repository;
    return repository && typeof repository === "object" ? repository : {};
  };

  const fetchRepositoryUpdatedAt = async () => {
    const repository = getRepositoryConfig();
    const commitEndpoint = String(repository.commitEndpoint || "").trim();
    if (!commitEndpoint) {
      return null;
    }

    try {
      const response = await fetch(commitEndpoint);
      if (!response.ok) {
        throw new Error(`Commit endpoint responded with ${response.status}`);
      }

      const payload = await response.json();
      return parseTimestamp(payload?.timestamp || "");
    } catch (error) {
      console.warn("Failed to load latest commit timestamp.", error);
      return null;
    }
  };
  const resolveUpdateToastTimestamp = async (activeCatalog = {}) => {
    const updateToast = getUpdateToastConfig(activeCatalog);
    const explicitTimestamp =
      updateToast.timestamp ??
      activeCatalog.lastUpdated ??
      activeCatalog.lastModified ??
      "";
    const explicitDate = parseTimestamp(explicitTimestamp);
    if (explicitDate) {
      return explicitDate;
    }

    return fetchRepositoryUpdatedAt();
  };
  const queuePageUpdateToast = async (activeCatalog = {}) => {
    const updateToast = getUpdateToastConfig(activeCatalog);
    if (updateToast.enabled === false) {
      return;
    }

    const updatedAt = await resolveUpdateToastTimestamp(activeCatalog);
    if (!updatedAt) {
      return;
    }

    const formattedTimestamp = formatTimestamp(updatedAt);
    const relativeTimestamp = formatRelativeElapsedTime(updatedAt);
    if (!formattedTimestamp && !relativeTimestamp) {
      return;
    }

    const pageLabel = String(activeCatalog.pageTitle || document.title || "This page").trim();

    window.showSiteToast?.({
      key: `page-update:${window.location.pathname}`,
      title: String(updateToast.title || "Latest Update"),
      message: String(
        updateToast.message ||
          `voxlis.NET was last updated ${relativeTimestamp || formattedTimestamp}!`,
      ),
      duration: Number(updateToast.duration) > 0 ? Number(updateToast.duration) : 5200,
      icon: String(updateToast.icon || "fa-clock-rotate-left"),
    });
  };

  const initCardChipOverflow = (root = document) => {
    const chipWraps = [...root.querySelectorAll(".ph-chips-wrap")];
    if (!chipWraps.length) return;

    const syncRowState = (wrap) => {
      const row = wrap.querySelector(".ph-chips");
      if (!row) return;

      const hasOverflow = row.scrollWidth - row.clientWidth > 4;
      const isScrolledEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;

      wrap.classList.toggle("has-overflow", hasOverflow);
      wrap.classList.toggle("is-scrolled-end", !hasOverflow || isScrolledEnd);
    };

    chipWraps.forEach((wrap) => {
      const row = wrap.querySelector(".ph-chips");
      if (!row) return;

      syncRowState(wrap);

      if (row.dataset.overflowBound === "true") return;

      row.addEventListener("scroll", () => {
        syncRowState(wrap);
      });

      row.dataset.overflowBound = "true";
    });

    const syncAll = () => {
      chipWraps.forEach(syncRowState);
    };

    if (root.dataset.cardChipOverflowResizeBound !== "true") {
      window.addEventListener("resize", syncAll);
      root.dataset.cardChipOverflowResizeBound = "true";
    }

    requestAnimationFrame(syncAll);
  };

  const queueThemesPrompt = (root = document) => {
    if (
      root.dataset.themesPromptState === "scheduled" ||
      root.dataset.themesPromptState === "shown" ||
      root.dataset.themesPromptState === "dismissed"
    ) {
      return;
    }

    root.dataset.themesPromptState = "scheduled";

    const openThemes = () => {
      window.openSiteThemes?.({ tab: "presets" });
    };

    const handleThemesOpened = () => {
      root.dataset.themesPromptState = "dismissed";
      window.dismissSiteToastByKey?.("themes-prompt", "action");
      document.removeEventListener("voxlis:themes-opened", handleThemesOpened);
    };

    document.addEventListener("voxlis:themes-opened", handleThemesOpened);

    window.setTimeout(() => {
      if (root.dataset.themesPromptState !== "scheduled") {
        document.removeEventListener("voxlis:themes-opened", handleThemesOpened);
        return;
      }

      root.dataset.themesPromptState = "shown";
      trackToastEvent("themes-prompt-show");
      window.showSiteToast?.({
        key: "themes-prompt",
        title: "Try themes?",
        message: "Want to tweak the site colors a bit too?",
        duration: 0,
        icon: "fa-palette",
        actionLabel: "Open themes",
        actionIcon: "fa-palette",
        onAction: () => {
          trackToastEvent("themes-prompt-open");
          openThemes();
        },
        onDismiss: (_toast, source) => {
          if (source !== "action") {
            trackToastEvent("themes-prompt-close");
          }
          document.removeEventListener("voxlis:themes-opened", handleThemesOpened);
          root.dataset.themesPromptState = "dismissed";
        },
        dismissLabel: "Close",
        clickToAction: true,
        showClose: false,
      });
    }, PROMPT_DELAY_MS);
  };

  const queueFiltersPrompt = (root = document) => {
    if (root.dataset.filtersPromptState === "scheduled" || root.dataset.filtersPromptState === "shown") return;
    const filterPrompt =
      window.VOXLIS_PAGE?.catalog?.prompts?.filters ??
      {
        title: "Try filters?",
        message: "Want to narrow the list a bit faster?",
      };

    root.dataset.filtersPromptState = "scheduled";

    const openFilters = () => {
      document.dispatchEvent(new CustomEvent("voxlis:open-filter"));
    };

    const handleFilterOpened = () => {
      root.dataset.filtersPromptState = "dismissed";
      window.dismissSiteToastByKey?.("filters-prompt", "action");
      document.removeEventListener("voxlis:filter-opened", handleFilterOpened);
    };

    document.addEventListener("voxlis:filter-opened", handleFilterOpened);

    window.setTimeout(() => {
      if (root.dataset.filtersPromptState !== "scheduled") return;

      root.dataset.filtersPromptState = "shown";
      trackToastEvent("filters-prompt-show");
      window.showSiteToast?.({
        key: "filters-prompt",
        title: filterPrompt.title || "Try filters?",
        message: filterPrompt.message || "Want to narrow the list a bit faster?",
        duration: 0,
        icon: "fa-sliders",
        actionLabel: "Open filters",
        actionIcon: "fa-sliders-h",
        onAction: () => {
          trackToastEvent("filters-prompt-open");
          openFilters();
        },
        onDismiss: (_toast, source) => {
          document.removeEventListener("voxlis:filter-opened", handleFilterOpened);
          if (source === "action") {
            return;
          }

          trackToastEvent("filters-prompt-close");
          root.dataset.filtersPromptState = "dismissed";
          queueThemesPrompt(root);
        },
        dismissLabel: "Close",
        clickToAction: true,
        showClose: false,
      });
    }, PROMPT_DELAY_MS);
  };

  const logStep = (msg, type = "info") => {
    window.dispatchEvent(new CustomEvent("voxlis:loading-step", { detail: { msg, type } }));
  };

  onReady(async () => {
    try {
      logStep("initializing page config...");
      const activeCatalog = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
      const pageTitle = activeCatalog.pageTitle ? `voxlis - ${activeCatalog.pageTitle}` : "voxlis - BETA";
      document.title = pageTitle;
      logStep(`page: ${pageTitle}`, "ok");

      logStep("mounting promo...");
      const promoMount = document.getElementById("promoMount");
      if (promoMount) {
        promoMount.innerHTML = window.getPromoMarkup?.() || "";
        logStep("promo mounted", "ok");
      }

      logStep("mounting featured cards...");
      const featuredMounts = [
        document.getElementById("featuredMountLeft"),
        document.getElementById("featuredMountLeftSecondary"),
        document.getElementById("featuredMount"),
        document.getElementById("featuredMountSecondary")
      ].filter(Boolean);

      if (featuredMounts.length) {
        const html = window.getFeaturedCardMarkup?.() || "";
        featuredMounts.forEach((mount, index) => {
          mount.innerHTML = html;
          mount.hidden = !html;
        });
        window.syncFeaturedCardThemeClass?.();
        logStep(`featured slots ready (${featuredMounts.length})`, "ok");
      }

      logStep("fetching catalog data...");
      const cardsMount = document.getElementById("cardsMount");
      if (cardsMount) {
        await loadInto(cardsMount, "src/components/objects/cards/cards.html");
        logStep("cards.html loaded", "ok");
        logStep("initializing catalog...");
        await window.initActiveCatalog?.(cardsMount);
        logStep("catalog ready", "ok");
        initCardChipOverflow(cardsMount);
        queueFiltersPrompt(cardsMount);
        void queuePageUpdateToast(activeCatalog);
      }

      logStep("loading themes...");
      const themesMount = document.getElementById("themesMount");
      if (themesMount) {
        await loadInto(themesMount, "src/components/modals/themes/themes.html");
        logStep("themes.html loaded", "ok");
        window.initSiteThemes?.(document);
        logStep("themes initialized", "ok");
      }

      logStep("loading footer...");
      const footerMount = document.getElementById("footerMount");
      if (footerMount) {
        await loadInto(footerMount, "src/components/global/footer/footer.html");
        window.initSiteFooter?.(document);
        logStep("footer ready", "ok");
      }

      logStep("all systems go", "ok");
    } catch (error) {
      logStep(`error: ${error.message}`, "err");
      console.error(error);
    } finally {
      document.dispatchEvent(new CustomEvent("voxlis:app-ready"));
      window.dispatchEvent(new CustomEvent("voxlis:app-ready"));
    }
  });
})();
