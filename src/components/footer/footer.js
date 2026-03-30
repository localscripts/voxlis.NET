(() => {
  const MODAL_EXIT_MS = 300;
  const LOADING_MARKUP = `
    <p class="info-modal-loading">
      Loading information...
    </p>
  `;
  const ERROR_MARKUP = `
    <p class="info-modal-empty">
      This content could not be loaded right now.
    </p>
  `;
  const FOOTER_LEGAL_MODALS = {
    policy: {
      path: "/policy/",
      modalId: "footerPolicyModal",
      bodyId: "footerPolicyBody",
      contentUrl: "/public/data/misc/policy.md",
    },
    privacy: {
      path: "/privacy/",
      modalId: "footerPrivacyModal",
      bodyId: "footerPrivacyBody",
      contentUrl: "/public/data/misc/privacy.md",
    },
  };
  const footerLegalContentCache = new Map();

  const normalizePath = (path = "/") => {
    const trimmed = `${path}`.replace(/\/+$/, "");
    return trimmed || "/";
  };
  const getFooterModalKeyFromPath = (path = window.location.pathname) =>
    Object.entries(FOOTER_LEGAL_MODALS).find(([, config]) =>
      normalizePath(path) === normalizePath(config.path)
    )?.[0] || "";

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

  const renderFooterLegalMarkdown = (markdown = "") => {
    const source = String(markdown).trim();
    if (!source) {
      return ERROR_MARKUP;
    }

    if (window.marked?.parse) {
      try {
        return window.marked.parse(source);
      } catch (error) {
        console.warn("Failed to parse footer legal markdown.", error);
      }
    }

    return source
      .split(/\n{2,}/)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
      .join("");
  };

  const loadFooterLegalContent = async ({ contentUrl, bodyNode }) => {
    if (!bodyNode || !contentUrl) {
      return;
    }

    if (bodyNode.dataset.loaded === "true") {
      return;
    }

    bodyNode.innerHTML = LOADING_MARKUP;

    try {
      let request = footerLegalContentCache.get(contentUrl);
      if (!request) {
        request = fetch(contentUrl, { cache: "no-cache" }).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load footer legal content (${contentUrl}): ${response.status}`);
          }
          return response.text();
        });
        footerLegalContentCache.set(contentUrl, request);
      }

      const source = await request;
      bodyNode.innerHTML = renderFooterLegalMarkdown(source);
      bodyNode.dataset.loaded = "true";
    } catch (error) {
      console.error(error);
      footerLegalContentCache.delete(contentUrl);
      bodyNode.innerHTML = ERROR_MARKUP;
      delete bodyNode.dataset.loaded;
    }
  };

  const initFooterLegalModals = (scope = document) => {
    const modalEntries = Object.entries(FOOTER_LEGAL_MODALS)
      .map(([key, config]) => ({
        key,
        path: config.path,
        modal: scope.getElementById(config.modalId),
        bodyNode: scope.getElementById(config.bodyId),
        contentUrl: config.contentUrl,
      }))
      .filter(({ modal }) => modal);

    const openLinks = [...scope.querySelectorAll("[data-footer-modal-open]")];

    if (!modalEntries.length || !openLinks.length || scope.body?.dataset.footerLegalBound === "true") {
      return;
    }

    const modalByKey = new Map(modalEntries.map((entry) => [entry.key, entry]));
    const linkByKey = new Map(
      openLinks
        .map((link) => [String(link.dataset.footerModalOpen || "").trim(), link])
        .filter(([key]) => key),
    );

    let previousBodyOverflow = "";
    let closeTimerId = 0;
    let activeModalKey = "";

    const finishClose = ({ restoreFocus = false } = {}) => {
      const activeEntry = modalByKey.get(activeModalKey);
      if (!activeEntry?.modal) {
        closeTimerId = 0;
        return;
      }

      activeEntry.modal.hidden = true;
      activeEntry.modal.classList.remove("is-open", "is-closing");
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = "";

      linkByKey.forEach((link, key) => {
        link.setAttribute("aria-expanded", key === activeModalKey ? "false" : link.getAttribute("aria-expanded") || "false");
      });

      if (restoreFocus) {
        linkByKey.get(activeModalKey)?.focus();
      }

      activeModalKey = "";
      closeTimerId = 0;
    };

    const closeModal = ({ restoreFocus = false } = {}) => {
      const activeEntry = modalByKey.get(activeModalKey);
      if (!activeEntry?.modal || activeEntry.modal.hidden || activeEntry.modal.classList.contains("is-closing")) {
        return;
      }

      activeEntry.modal.classList.remove("is-open");
      activeEntry.modal.classList.add("is-closing");
      window.clearTimeout(closeTimerId);
      closeTimerId = window.setTimeout(() => {
        finishClose({ restoreFocus });
      }, MODAL_EXIT_MS);
    };

    const openModal = (key, { pushHistory = true } = {}) => {
      const entry = modalByKey.get(key);
      if (!entry?.modal) {
        return;
      }

      if (activeModalKey && activeModalKey !== key) {
        finishClose();
      }

      const { modal, path, bodyNode, contentUrl } = entry;

      window.clearTimeout(closeTimerId);
      closeTimerId = 0;

      if (modal.hidden) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.hidden = false;
      }

      activeModalKey = key;
      modal.classList.remove("is-open", "is-closing");
      linkByKey.forEach((link, linkKey) => {
        link.setAttribute("aria-expanded", linkKey === key ? "true" : "false");
      });

      window.requestAnimationFrame(() => {
        if (!modal.hidden) {
          modal.classList.add("is-open");
        }
      });

      void loadFooterLegalContent({ contentUrl, bodyNode });

      if (pushHistory && normalizePath(window.location.pathname) !== normalizePath(path)) {
        const nextState =
          window.history.state && typeof window.history.state === "object"
            ? { ...window.history.state, footerModal: key }
            : { footerModal: key };
        window.history.pushState(nextState, "", path);
      }
    };

    const requestClose = () => {
      const pathModalKey = getFooterModalKeyFromPath();
      if (pathModalKey) {
        if (window.history.state?.footerModal === pathModalKey) {
          window.history.back();
          return;
        }

        const nextState =
          window.history.state && typeof window.history.state === "object"
            ? { ...window.history.state }
            : null;

        if (nextState) {
          delete nextState.footerModal;
        }

        window.history.replaceState(
          nextState && Object.keys(nextState).length ? nextState : null,
          "",
          "/",
        );
      }

      closeModal({ restoreFocus: true });
    };

    const syncModalToPath = () => {
      const key = getFooterModalKeyFromPath();
      if (key) {
        openModal(key, { pushHistory: false });
        return;
      }

      if (activeModalKey) {
        closeModal();
      }
    };

    openLinks.forEach((link) => {
      const key = String(link.dataset.footerModalOpen || "").trim();
      const entry = modalByKey.get(key);
      if (!entry) {
        return;
      }

      link.setAttribute("aria-haspopup", "dialog");
      link.setAttribute("aria-controls", entry.modal.id);
      link.setAttribute("aria-expanded", "false");

      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        event.preventDefault();
        openModal(key, { pushHistory: false });
      });
    });

    modalEntries.forEach(({ modal }) => {
      modal.querySelectorAll("[data-footer-modal-close]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          requestClose();
        });
      });

      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          requestClose();
        }
      });
    });

    window.addEventListener("popstate", syncModalToPath);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeModalKey) {
        requestClose();
      }
    });

    scope.body.dataset.footerLegalBound = "true";
    syncModalToPath();
  };

  const initSiteFooter = (scope = document) => {
    const currentYear = `${new Date().getFullYear()}`;
    scope.querySelectorAll("[data-site-year]").forEach((node) => {
      node.textContent = currentYear;
    });
    initFooterLegalModals(scope);
  };

  window.initSiteFooter = initSiteFooter;
})();
