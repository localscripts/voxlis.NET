(() => {
  const onReady = window.VOXLIS_UTILS?.onDomReady ?? ((fn) => fn?.());
  const loadInto =
    window.VOXLIS_UTILS?.loadHtmlPartial ??
    (async (mount, path) => {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load partial (${path}): ${response.status}`);
      }
      mount.innerHTML = await response.text();
      return mount;
    });

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

  const queueFiltersPrompt = (root = document) => {
    if (root.dataset.filtersPromptState === "scheduled" || root.dataset.filtersPromptState === "shown") return;

    root.dataset.filtersPromptState = "scheduled";

    const openFilters = () => {
      document.dispatchEvent(new CustomEvent("voxlis:open-filter"));
    };

    const handleFilterOpened = () => {
      root.dataset.filtersPromptState = "dismissed";
      window.dismissSiteToastByKey?.("filters-prompt", "close-button");
      document.removeEventListener("voxlis:filter-opened", handleFilterOpened);
    };

    document.addEventListener("voxlis:filter-opened", handleFilterOpened);

    window.setTimeout(() => {
      if (root.dataset.filtersPromptState !== "scheduled") return;

      root.dataset.filtersPromptState = "shown";
      window.showSiteToast?.({
        key: "filters-prompt",
        title: "Try filters?",
        message: "Want to narrow the list a bit faster?",
        duration: 0,
        icon: "fa-sliders",
        actionLabel: "Open filters",
        actionIcon: "fa-sliders-h",
        onAction: openFilters,
        dismissLabel: "Close",
        clickToAction: true,
        showClose: false,
      });
    }, 10000);
  };

  onReady(async () => {
    try {
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
        featuredMounts.forEach((mount) => {
          mount.innerHTML = html;
        });
      }

      const cardsMount = document.getElementById("cardsMount");
      if (cardsMount) {
        await loadInto(cardsMount, "src/components/cards/cards.html");
        await window.initRobloxCardsCatalog?.(cardsMount);
        initCardChipOverflow(cardsMount);
        queueFiltersPrompt(cardsMount);
      }

      const footerMount = document.getElementById("footerMount");
      if (footerMount) {
        await loadInto(footerMount, "src/components/footer/footer.html");
        window.initSiteFooter?.(document);
        const customThemeMount = document.getElementById("customThemeMount");
        if (customThemeMount) {
          await loadInto(customThemeMount, "src/components/custom-theme/custom-theme.html");
        }
        window.initThemeSwitcher?.(document);
        window.initCustomThemePicker?.(document);
      }
    } catch (error) {
      console.error(error);
    }
  });
})();
