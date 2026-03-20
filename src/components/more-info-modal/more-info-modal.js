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
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  const reviewSourceCache = new Map();
  const modalState = {
    closeTimerId: 0,
    previousBodyOverflow: "",
    requestToken: 0,
  };

  let markedConfigured = false;

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

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
        closeMoreInfoModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeMoreInfoModal();
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
    modal.classList.remove("is-open", "is-closing");
    document.body.style.overflow = modalState.previousBodyOverflow;
    modalState.previousBodyOverflow = "";
    modalState.closeTimerId = 0;
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

  const openMoreInfoModal = ({
    title = "Exploit",
    description = "",
    reviewUrl,
    websiteUrl = "",
    websiteWarningConfig = null,
  } = {}) => {
    if (!reviewUrl) {
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
    const modalTitle = exploitName.endsWith(" Information")
      ? exploitName
      : `${exploitName} Information`;
    const modalDescription = String(description).trim();
    const modalWebsiteUrl = String(websiteUrl).trim();
    const requestToken = modalState.requestToken + 1;

    window.clearTimeout(modalState.closeTimerId);
    if (modal.hidden) {
      modalState.previousBodyOverflow = document.body.style.overflow;
    }

    modalState.requestToken = requestToken;
    titleNode.textContent = modalTitle;
    nameNode.textContent = "";
    nameNode.hidden = true;
    descriptionNode.textContent = modalDescription;
    descriptionNode.hidden = !modalDescription;
    if (infoNode) {
      infoNode.hidden = !modalDescription;
    }
    if (websiteButton) {
      websiteButton.hidden = !modalWebsiteUrl;
      websiteButton.setAttribute("href", modalWebsiteUrl || "#");
      delete websiteButton.dataset.warningType;
      delete websiteButton.dataset.warningTitle;
      delete websiteButton.dataset.warningDescription;

      if (websiteWarningConfig?.type) {
        websiteButton.dataset.warningType = websiteWarningConfig.type;
        websiteButton.dataset.warningTitle = websiteWarningConfig.title || "Important warning";
        websiteButton.dataset.warningDescription = websiteWarningConfig.description || "";
      }
    }
    markdownNode.innerHTML = LOADING_MARKUP;
    contentNode.scrollTop = 0;

    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.classList.remove("is-closing", "is-open");
    window.requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    loadReviewDocument(reviewUrl)
      .then((reviewDocument) => {
        if (requestToken !== modalState.requestToken) {
          return;
        }

        markdownNode.innerHTML = renderReviewMarkdown(reviewDocument.body);
        highlightCodeBlocks(markdownNode);
        contentNode.scrollTop = 0;
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

  window.parseReviewDocument = parseReviewDocument;
  window.loadReviewDocument = loadReviewDocument;
  window.openMoreInfoModal = openMoreInfoModal;
  window.closeMoreInfoModal = closeMoreInfoModal;
})();


