(() => {
  const onReady = window.VOXLIS_UTILS?.onDomReady ?? ((fn) => fn?.());
  const PROMPT_DELAY_MS = 10000;
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
  const loadInto =
    window.VOXLIS_UTILS?.loadHtmlPartial ??
    (async (mount, path) => {
      const resolvedPath = resolveSitePath(path);
      const response = await fetch(resolvedPath, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load partial (${resolvedPath}): ${response.status}`);
      }
      mount.innerHTML = await response.text();
      return mount;
    });
  const trackToastEvent = (key = "") => {
    window.VOXLIS_CLICK_TRACKER?.trackUiEvent?.({
      group: "toasts",
      key,
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

  onReady(async () => {
    try {
      const activeCatalog = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
      const pageTitle = activeCatalog.pageTitle ? `voxlis - ${activeCatalog.pageTitle}` : "voxlis - BETA";
      document.title = pageTitle;

      const promoMount = document.getElementById("promoMount");
      if (promoMount) {
        promoMount.innerHTML = window.getPromoMarkup?.() || "";
      }

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
      }

      const cardsMount = document.getElementById("cardsMount");
      if (cardsMount) {
        await loadInto(cardsMount, "src/components/objects/cards/cards.html");
        await window.initActiveCatalog?.(cardsMount);
        initCardChipOverflow(cardsMount);
        queueFiltersPrompt(cardsMount);
      }

      const themesMount = document.getElementById("themesMount");
      if (themesMount) {
        await loadInto(themesMount, "src/components/modals/themes/themes.html");
        const customThemeMount = document.getElementById("customThemeMount");
        if (customThemeMount) {
          await loadInto(customThemeMount, "src/components/modals/custom-theme/custom-theme.html");
        }
        window.initSiteThemes?.(document);
        window.initCustomThemePicker?.(document);
      }

      const footerMount = document.getElementById("footerMount");
      if (footerMount) {
        await loadInto(footerMount, "src/components/global/footer/footer.html");
        window.initSiteFooter?.(document);
      }
    } catch (error) {
      console.error(error);
    }
  });
})();
