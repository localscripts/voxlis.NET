(() => {
  const SITE_BOTTOM_FADE_OFFSET_VAR = "--site-bottom-fade-offset";
  const FOOTER_LEGAL_MODALS = {
    policy: {
      title: "Policy",
      path: "/policy/",
      reviewUrl: "/public/data/misc/policy.md",
    },
    privacy: {
      title: "Privacy",
      path: "/privacy/",
      reviewUrl: "/public/data/misc/privacy.md",
    },
  };

  let siteBottomFadeFrameId = 0;

  const syncSiteBottomFadeOffset = (scope = document) => {
    const body = scope.body || document.body;
    if (!body) {
      return;
    }

    const footer = scope.querySelector(".site-footer");
    if (!footer) {
      body.style.setProperty(SITE_BOTTOM_FADE_OFFSET_VAR, "0px");
      return;
    }

    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const footerOverlap = Math.max(0, viewportHeight - footerRect.top);
    body.style.setProperty(SITE_BOTTOM_FADE_OFFSET_VAR, `${Math.round(footerOverlap)}px`);
  };

  const queueSiteBottomFadeOffsetSync = (scope = document) => {
    if (siteBottomFadeFrameId) {
      return;
    }

    siteBottomFadeFrameId = window.requestAnimationFrame(() => {
      siteBottomFadeFrameId = 0;
      syncSiteBottomFadeOffset(scope);
    });
  };

  const initSiteBottomFadeOffset = (scope = document) => {
    const body = scope.body || document.body;
    if (!body) {
      return;
    }

    if (body.dataset.siteBottomFadeBound !== "true") {
      const sync = () => queueSiteBottomFadeOffsetSync(scope);
      window.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync, { passive: true });
      window.addEventListener("load", sync, { once: true });
      body.dataset.siteBottomFadeBound = "true";
    }

    queueSiteBottomFadeOffsetSync(scope);
  };

  const normalizePath = (path = "/") => {
    const trimmed = `${path}`.replace(/\/+$/, "");
    return trimmed || "/";
  };
  const getFooterModalKeyFromPath = (path = window.location.pathname) =>
    Object.entries(FOOTER_LEGAL_MODALS).find(([, config]) =>
      normalizePath(path) === normalizePath(config.path)
    )?.[0] || "";

  const buildFooterLegalModalOptions = (key, { pushHistory = true } = {}) => {
    const entry = FOOTER_LEGAL_MODALS[key];
    if (!entry) {
      return null;
    }

    return {
      title: entry.title,
      reviewUrl: entry.reviewUrl,
      preserveTitle: true,
      hideWebsiteButton: true,
      modalPath: entry.path,
      pushHistory,
    };
  };

  const syncFooterLegalLinkState = (scope = document, activeKey = "") => {
    scope.querySelectorAll("[data-footer-modal-open]").forEach((link) => {
      const key = String(link.dataset.footerModalOpen || "").trim();
      link.setAttribute("aria-expanded", key === activeKey ? "true" : "false");
    });
  };

  const openFooterLegalModal = (key, { pushHistory = true } = {}) => {
    const options = buildFooterLegalModalOptions(key, { pushHistory });
    if (!options) {
      return false;
    }

    syncFooterLegalLinkState(document, key);
    if (typeof window.openMoreInfoModal === "function") {
      return window.openMoreInfoModal(options) ?? false;
    }

    window.location.assign(options.modalPath);
    return true;
  };

  const syncFooterLegalModalToPath = (scope = document) => {
    const key = getFooterModalKeyFromPath();
    syncFooterLegalLinkState(scope, key);
    if (!key) {
      return false;
    }

    return openFooterLegalModal(key, { pushHistory: false });
  };

  const initFooterLegalModals = (scope = document) => {
    const openLinks = [...scope.querySelectorAll("[data-footer-modal-open]")];
    if (!openLinks.length || scope.body?.dataset.footerLegalBound === "true") {
      return;
    }

    openLinks.forEach((link) => {
      const key = String(link.dataset.footerModalOpen || "").trim();
      const entry = FOOTER_LEGAL_MODALS[key];
      if (!entry) {
        return;
      }

      link.setAttribute("aria-haspopup", "dialog");
      link.setAttribute("aria-controls", "moreInfoModal");
      link.setAttribute("aria-expanded", "false");

      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        event.preventDefault();
        openFooterLegalModal(key, { pushHistory: true });
      });
    });

    window.addEventListener("popstate", () => {
      syncFooterLegalModalToPath(scope);
    });

    scope.body.dataset.footerLegalBound = "true";
    syncFooterLegalModalToPath(scope);
  };

  const initSiteFooter = (scope = document) => {
    const currentYear = `${new Date().getFullYear()}`;
    scope.querySelectorAll("[data-site-year]").forEach((node) => {
      node.textContent = currentYear;
    });
    initFooterLegalModals(scope);
    initSiteBottomFadeOffset(scope);
  };

  window.initSiteFooter = initSiteFooter;
})();
