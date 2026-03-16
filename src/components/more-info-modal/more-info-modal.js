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

  const loadReviewSource = (reviewUrl) => {
    let request = reviewSourceCache.get(reviewUrl);
    if (request) {
      return request;
    }

    request = fetch(reviewUrl, { cache: "no-cache" })
      .then((response) => {
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

  const openMoreInfoModal = ({ title = "Exploit", description = "", reviewUrl } = {}) => {
    if (!reviewUrl) {
      return false;
    }

    const modal = ensureMoreInfoModal();
    const titleNode = modal.querySelector("#moreInfoModalTitle");
    const nameNode = modal.querySelector("#moreInfoModalExploitName");
    const descriptionNode = modal.querySelector("#moreInfoModalExploitDesc");
    const markdownNode = modal.querySelector("#moreInfoModalMarkdown");
    const contentNode = modal.querySelector("#moreInfoModalContent");
    const exploitName = String(title).trim() || "Exploit";
    const modalTitle = exploitName.endsWith(" Information")
      ? exploitName
      : `${exploitName} Information`;
    const modalDescription =
      String(description).trim() || "Additional product information.";
    const requestToken = modalState.requestToken + 1;

    window.clearTimeout(modalState.closeTimerId);
    if (modal.hidden) {
      modalState.previousBodyOverflow = document.body.style.overflow;
    }

    modalState.requestToken = requestToken;
    titleNode.textContent = modalTitle;
    nameNode.textContent = exploitName.replace(/\s+Information$/, "");
    descriptionNode.textContent = modalDescription;
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

    loadReviewSource(reviewUrl)
      .then((markdown) => {
        if (requestToken !== modalState.requestToken) {
          return;
        }

        markdownNode.innerHTML = renderReviewMarkdown(markdown);
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

  window.openMoreInfoModal = openMoreInfoModal;
  window.closeMoreInfoModal = closeMoreInfoModal;
})();
