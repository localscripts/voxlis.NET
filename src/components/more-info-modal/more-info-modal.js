(() => {
  if (window.openMoreInfoModal) {
    return;
  }

  const MODAL_EXIT_MS = 300;
  const EMPTY_MARKUP = `
    <p class="info-modal-empty">
      No additional information is available for this card yet.
    </p>
  `;
  const LOADING_MARKUP = `
    <p class="info-modal-loading">
      Loading information...
    </p>
  `;
  const ERROR_MARKUP = `
    <p class="info-modal-empty">
      The review content could not be loaded right now.
    </p>
  `;
  const NULL_REVIEW_MARKUP = `
    <div class="info-modal-null-review">
      <p class="info-modal-null-review-message">
        Hmm, the owner of this software needs to contact us in order to be verified, it's safe but not verified yet.
      </p>
      <img
        class="info-modal-null-review-image"
        src="/public/assets/hmmm.gif"
        alt="Verification pending"
        loading="lazy"
      >
    </div>
  `;
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const MARKDOWN_CALLOUT_PATTERN =
    /^\s*\[!(TIP|NOTE|WARN|WARNING)(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})?(?:\s+(BORDER))?\]/i;
  const MARKDOWN_CALLOUT_PREFIX_PATTERN =
    /^\s*\[!(TIP|NOTE|WARN|WARNING)(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})?(?:\s+(BORDER))?\](?:\s|<br\s*\/?>)*/i;
  const MARKDOWN_CALLOUTS = {
    tip: {
      label: "Tip",
      iconClass: "fa-lightbulb",
      color: "#22C55E",
    },
    note: {
      label: "Note",
      iconClass: "fa-circle-info",
      color: "#3B82F6",
    },
    warning: {
      label: "Warning",
      iconClass: "fa-triangle-exclamation",
      color: "#F59E0B",
    },
  };

  const reviewSourceCache = new Map();
  const modalState = {
    closeTimerId: 0,
    previousBodyOverflow: "",
    requestToken: 0,
    activePath: "",
  };

  let markedConfigured = false;
  let modalPathResolver = null;

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

  const normalizeHexColor = (value = "") => {
    const normalizedValue = String(value).trim();
    if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalizedValue)) {
      return "";
    }

    if (normalizedValue.length === 4) {
      const [hash, r, g, b] = normalizedValue;
      return `${hash}${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    return normalizedValue.toUpperCase();
  };

  const hexToRgbString = (value = "") => {
    const normalizedColor = normalizeHexColor(value);
    if (!normalizedColor) {
      return "";
    }

    const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
    const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
    const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);
    return `${red}, ${green}, ${blue}`;
  };

  const getMarkdownCallout = (value = "") => {
    const match = String(value).trim().match(MARKDOWN_CALLOUT_PATTERN);
    if (!match) {
      return null;
    }

    const rawType = String(match[1] || "").toLowerCase();
    const calloutType = rawType === "warn" ? "warning" : rawType;
    const config = MARKDOWN_CALLOUTS[calloutType];
    if (!config) {
      return null;
    }

    return {
      type: calloutType,
      label: config.label,
      iconClass: config.iconClass,
      color: normalizeHexColor(match[2]) || config.color,
      colorRgb: hexToRgbString(match[2]) || hexToRgbString(config.color),
      hasBorder: Boolean(match[3]),
    };
  };

  const normalizePath = (path = "/") => {
    const trimmed = `${path}`.replace(/\/+$/, "");
    return trimmed || "/";
  };

  const normalizeMetadataValue = (value = "") => {
    const trimmedValue = String(value).trim();
    if (!trimmedValue) {
      return "";
    }

    const quotedValueMatch = trimmedValue.match(/^(['"])([\s\S]*)\1$/);
    return (quotedValueMatch ? quotedValueMatch[2] : trimmedValue).trim();
  };

  const parseReviewDocument = (source = "") => {
    const normalizedSource = String(source).replace(/^\uFEFF/, "");
    const parseMetadataBlock = (metadataSource = "") => {
      const youtubeMatch = String(metadataSource).match(/^\s*youtube\s*:\s*(.+)\s*$/im);
      return {
        youtube: youtubeMatch ? normalizeMetadataValue(youtubeMatch[1]) : "",
      };
    };

    const frontmatterMatch = normalizedSource.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?/);
    if (frontmatterMatch) {
      return {
        metadata: parseMetadataBlock(frontmatterMatch[1]),
        body: normalizedSource.slice(frontmatterMatch[0].length).replace(/^\s+/, ""),
      };
    }

    const inlineYoutubeMatch = normalizedSource.match(/^\s*youtube\s*:\s*(.+?)\s*(?:\r?\n){1,2}/i);
    if (inlineYoutubeMatch) {
      return {
        metadata: {
          youtube: normalizeMetadataValue(inlineYoutubeMatch[1]),
        },
        body: normalizedSource.slice(inlineYoutubeMatch[0].length).replace(/^\s+/, ""),
      };
    }

    return {
      metadata: {
        youtube: "",
      },
      body: normalizedSource,
    };
  };

  const getMarked = () => {
    const marked = window.marked;
    if (!marked || typeof marked.parse !== "function") {
      return null;
    }

    if (!markedConfigured && typeof marked.setOptions === "function") {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      markedConfigured = true;
    }

    return marked;
  };

  const renderFallbackContent = (source = "") => {
    const blocks = String(source)
      .trim()
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);

    if (!blocks.length) {
      return EMPTY_MARKUP;
    }

    return blocks
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
      .join("");
  };

  const renderReviewMarkdown = (markdown = "") => {
    const source = String(markdown).trim();
    if (!source) {
      return EMPTY_MARKUP;
    }

    if (source.toLowerCase() === "null") {
      return NULL_REVIEW_MARKUP;
    }

    const marked = getMarked();
    if (!marked) {
      return renderFallbackContent(source);
    }

    try {
      return marked.parse(source);
    } catch (error) {
      console.warn("Failed to parse review markdown with marked.", error);
      return renderFallbackContent(source);
    }
  };

  const highlightCodeBlocks = (root) => {
    if (!root || !window.hljs || typeof window.hljs.highlightElement !== "function") {
      return;
    }

    root.querySelectorAll("pre code").forEach((block) => {
      window.hljs.highlightElement(block);
    });
  };

  const prepareMarkdownLinks = (root) => {
    if (!root) {
      return;
    }

    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) {
        return;
      }

      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  };

  const enhanceMarkdownCallouts = (root) => {
    if (!root) {
      return;
    }

    root.querySelectorAll("blockquote").forEach((blockquote) => {
      const firstParagraph = blockquote.querySelector(":scope > p");
      const callout = getMarkdownCallout(firstParagraph?.textContent?.trim() || "");
      if (!firstParagraph || !callout) {
        return;
      }

      blockquote.classList.add("info-modal-callout", `is-${callout.type}`);
      blockquote.classList.toggle("has-border", callout.hasBorder);
      blockquote.style.setProperty("--info-modal-callout-accent", callout.color);
      blockquote.style.setProperty("--info-modal-callout-accent-rgb", callout.colorRgb);
      firstParagraph.innerHTML = firstParagraph.innerHTML.replace(MARKDOWN_CALLOUT_PREFIX_PATTERN, "");
      if (!firstParagraph.textContent.trim() && !firstParagraph.children.length) {
        firstParagraph.remove();
      }

      if (blockquote.querySelector(":scope > .info-modal-callout-title")) {
        return;
      }

      const titleNode = document.createElement("p");
      titleNode.className = "info-modal-callout-title";
      titleNode.innerHTML =
        `<i class="fas ${escapeHtml(callout.iconClass)}" aria-hidden="true"></i>${escapeHtml(callout.label)}`;
      blockquote.insertBefore(titleNode, blockquote.firstChild);
    });
  };

  const enhanceMarkdownContent = (root) => {
    if (!root) {
      return;
    }

    enhanceMarkdownCallouts(root);
  };

  const finalizeMarkdownContent = (markdownNode, contentNode, highlightContentKey = "") => {
    if (!markdownNode) {
      return;
    }

    enhanceMarkdownContent(markdownNode);
    prepareMarkdownLinks(markdownNode);
    highlightCodeBlocks(markdownNode);
    contentNode.scrollTop = 0;
    highlightContentEntry(markdownNode, contentNode, highlightContentKey);
  };

  const highlightContentEntry = (root, scrollRoot, contentKey = "") => {
    if (!root) {
      return;
    }

    root.querySelectorAll(".info-modal-notice-item.is-highlighted").forEach((node) => {
      node.classList.remove("is-highlighted");
    });

    const normalizedKey = String(contentKey).trim();
    if (!normalizedKey) {
      return;
    }

    const target = [...root.querySelectorAll(".info-modal-notice-item")].find(
      (node) => node.dataset.infoModalKey === normalizedKey,
    );
    if (!target) {
      return;
    }

    target.classList.add("is-highlighted");
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      scrollRoot?.scrollBy?.(0, -8);
    });
  };

  const loadReviewSource = (reviewUrl, { optional = false } = {}) => {
    let request = reviewSourceCache.get(reviewUrl);
    if (request) {
      return request;
    }

    request = fetch(reviewUrl, { cache: "no-cache" })
      .then((response) => {
        if (optional && response.status === 404) {
          return "";
        }

        if (!response.ok) {
          throw new Error(`Failed to load review (${reviewUrl}): ${response.status}`);
        }

        return response.text();
      })
      .catch((error) => {
        reviewSourceCache.delete(reviewUrl);
        throw error;
      });

    reviewSourceCache.set(reviewUrl, request);
    return request;
  };

  const loadReviewDocument = (reviewUrl, options = {}) =>
    loadReviewSource(reviewUrl, options).then((source) => parseReviewDocument(source));

  const runAction = ({ href = "", target = "" } = {}) => {
    if (!href) {
      return;
    }

    if (target === "_blank") {
      window.open(href, "_blank", "noopener");
      return;
    }

    window.location.assign(href);
  };

  const ensureMoreInfoModal = () => {
    let modal = document.getElementById("moreInfoModal");
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = "info-modal-container";
    modal.id = "moreInfoModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="info-modal-overlay" data-more-info-close></div>
      <div
        class="info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moreInfoModalTitle"
        aria-describedby="moreInfoModalMarkdown"
      >
        <div class="info-modal-header">
          <h2 class="info-modal-title" id="moreInfoModalTitle">Exploit Information</h2>
        </div>
        <div class="info-modal-content" id="moreInfoModalContent">
          <div class="info-modal-exploit-info">
            <div class="info-modal-exploit-name" id="moreInfoModalExploitName"></div>
            <div class="info-modal-exploit-desc" id="moreInfoModalExploitDesc"></div>
          </div>
          <div class="info-modal-markdown" id="moreInfoModalMarkdown">
            ${LOADING_MARKUP}
          </div>
        </div>
        <div class="info-modal-footer">
          <a
            class="info-modal-website-btn"
            id="moreInfoModalWebsiteBtn"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            hidden
          >
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Website
          </a>
          <button class="info-modal-close-btn" type="button" data-more-info-close>
            <i class="fas fa-times" aria-hidden="true"></i> Close
          </button>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-more-info-close]")) {
        requestCloseMoreInfoModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        requestCloseMoreInfoModal();
      }
    });

    const websiteButton = modal.querySelector("#moreInfoModalWebsiteBtn");
    websiteButton?.addEventListener("click", (event) => {
      const href = websiteButton.getAttribute("href") || "";
      if (!href || href === "#") {
        event.preventDefault();
        return;
      }

      const warningType = websiteButton.dataset.warningType || "";
      if (!warningType || typeof window.openCardWarningModal !== "function") {
        return;
      }

      event.preventDefault();
      const action = {
        href,
        target: websiteButton.getAttribute("target") || "",
      };
      const opened =
        window.openCardWarningModal(
          {
            type: warningType,
            title: websiteButton.dataset.warningTitle || "Important warning",
            description: websiteButton.dataset.warningDescription || "",
          },
          action,
        ) ?? false;

      if (!opened) {
        runAction(action);
      }
    });

    document.body.appendChild(modal);
    return modal;
  };

  const finishMoreInfoModalClose = () => {
    const modal = document.getElementById("moreInfoModal");
    if (!modal) {
      return;
    }

    modal.hidden = true;
    modal.classList.remove("is-open", "is-closing", "is-tag-guide");
    document.body.style.overflow = modalState.previousBodyOverflow;
    modalState.previousBodyOverflow = "";
    modalState.closeTimerId = 0;
    modalState.activePath = "";
  };

  function closeMoreInfoModal() {
    const modal = document.getElementById("moreInfoModal");
    if (!modal || modal.hidden || modal.classList.contains("is-closing")) {
      return;
    }

    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    modalState.requestToken += 1;
    window.clearTimeout(modalState.closeTimerId);
    modalState.closeTimerId = window.setTimeout(
      finishMoreInfoModalClose,
      MODAL_EXIT_MS,
    );
  }

  const requestCloseMoreInfoModal = () => {
    const activePath = normalizePath(modalState.activePath);
    const currentPath = normalizePath(window.location.pathname);

    if (activePath !== "/" && currentPath === activePath) {
      if (window.history.state?.moreInfoModal === activePath) {
        window.history.back();
        return;
      }

      const nextState =
        window.history.state && typeof window.history.state === "object"
          ? { ...window.history.state }
          : null;

      if (nextState) {
        delete nextState.moreInfoModal;
      }

      window.history.replaceState(
        nextState && Object.keys(nextState).length ? nextState : null,
        "",
        "/",
      );
    }

    closeMoreInfoModal();
  };

  const openMoreInfoModal = ({
    title = "Exploit",
    description = "",
    reviewUrl,
    websiteUrl = "",
    websiteWarningConfig = null,
    contentHtml = "",
    highlightContentKey = "",
    preserveTitle = false,
    hideWebsiteButton = false,
    modalPath = "",
    pushHistory = true,
  } = {}) => {
    const modalContentHtml = String(contentHtml).trim();
    const isTagGuide = hideWebsiteButton && Boolean(modalContentHtml);
    if (!reviewUrl && !modalContentHtml) {
      return false;
    }

    const modal = ensureMoreInfoModal();
    const titleNode = modal.querySelector("#moreInfoModalTitle");
    const infoNode = modal.querySelector(".info-modal-exploit-info");
    const nameNode = modal.querySelector("#moreInfoModalExploitName");
    const descriptionNode = modal.querySelector("#moreInfoModalExploitDesc");
    const markdownNode = modal.querySelector("#moreInfoModalMarkdown");
    const contentNode = modal.querySelector("#moreInfoModalContent");
    const websiteButton = modal.querySelector("#moreInfoModalWebsiteBtn");
    const exploitName = String(title).trim() || "Exploit";
    const modalTitle = preserveTitle || exploitName.endsWith(" Information")
      ? exploitName
      : `${exploitName} Information`;
    const modalDescription = String(description).trim();
    const modalWebsiteUrl = String(websiteUrl).trim();
    const normalizedModalPath = modalPath ? normalizePath(modalPath) : "";
    const requestToken = modalState.requestToken + 1;

    window.clearTimeout(modalState.closeTimerId);
    if (modal.hidden) {
      modalState.previousBodyOverflow = document.body.style.overflow;
    }

    modalState.requestToken = requestToken;
    modalState.activePath = normalizedModalPath;
    titleNode.textContent = modalTitle;
    nameNode.textContent = "";
    nameNode.hidden = true;
    descriptionNode.textContent = modalDescription;
    descriptionNode.hidden = !modalDescription;
    if (infoNode) {
      infoNode.hidden = !modalDescription;
    }
    if (websiteButton) {
      const shouldHideWebsiteButton = hideWebsiteButton || !modalWebsiteUrl;
      websiteButton.hidden = shouldHideWebsiteButton;
      websiteButton.setAttribute("href", shouldHideWebsiteButton ? "#" : modalWebsiteUrl);
      delete websiteButton.dataset.warningType;
      delete websiteButton.dataset.warningTitle;
      delete websiteButton.dataset.warningDescription;

      if (!shouldHideWebsiteButton && websiteWarningConfig?.type) {
        websiteButton.dataset.warningType = websiteWarningConfig.type;
        websiteButton.dataset.warningTitle = websiteWarningConfig.title || "Important warning";
        websiteButton.dataset.warningDescription = websiteWarningConfig.description || "";
      }
    }
    markdownNode.innerHTML = LOADING_MARKUP;
    contentNode.scrollTop = 0;

    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.classList.remove("is-closing", "is-open", "is-tag-guide");
    if (isTagGuide) {
      modal.classList.add("is-tag-guide");
    }
    window.requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    if (pushHistory && normalizedModalPath && normalizePath(window.location.pathname) !== normalizedModalPath) {
      const nextState =
        window.history.state && typeof window.history.state === "object"
          ? { ...window.history.state, moreInfoModal: normalizedModalPath }
          : { moreInfoModal: normalizedModalPath };
      window.history.pushState(nextState, "", normalizedModalPath);
    }

    if (modalContentHtml) {
      markdownNode.innerHTML = modalContentHtml;
      finalizeMarkdownContent(markdownNode, contentNode, highlightContentKey);
      return true;
    }

    loadReviewDocument(reviewUrl)
      .then((reviewDocument) => {
        if (requestToken !== modalState.requestToken) {
          return;
        }

        markdownNode.innerHTML = renderReviewMarkdown(reviewDocument.body);
        finalizeMarkdownContent(markdownNode, contentNode, highlightContentKey);
      })
      .catch((error) => {
        if (requestToken !== modalState.requestToken) {
          return;
        }

        console.warn("Failed to load review content.", error);
        markdownNode.innerHTML = ERROR_MARKUP;
        contentNode.scrollTop = 0;
      });

    return true;
  };

  const syncMoreInfoModalToPath = () => {
    const resolvedPath = normalizePath(window.location.pathname);
    const nextOptions = modalPathResolver?.(resolvedPath);

    if (nextOptions) {
      openMoreInfoModal({
        ...nextOptions,
        modalPath: nextOptions.modalPath || resolvedPath,
        pushHistory: false,
      });
      return true;
    }

    const modal = document.getElementById("moreInfoModal");
    if (!modal?.hidden && modalState.activePath) {
      closeMoreInfoModal();
    }

    return false;
  };

  const registerMoreInfoModalPathResolver = (resolver) => {
    modalPathResolver = typeof resolver === "function" ? resolver : null;
    syncMoreInfoModalToPath();
  };

  window.addEventListener("popstate", syncMoreInfoModalToPath);

  window.parseReviewDocument = parseReviewDocument;
  window.loadReviewDocument = loadReviewDocument;
  window.openMoreInfoModal = openMoreInfoModal;
  window.closeMoreInfoModal = closeMoreInfoModal;
  window.requestCloseMoreInfoModal = requestCloseMoreInfoModal;
  window.registerMoreInfoModalPathResolver = registerMoreInfoModalPathResolver;
  window.syncMoreInfoModalToPath = syncMoreInfoModalToPath;
})();


