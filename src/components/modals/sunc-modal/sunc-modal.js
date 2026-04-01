(() => {
  if (window.openSuncModal) {
    return;
  }

  const MODAL_EXIT_MS = 300;
  const RING_RADIUS = 78;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const SUNC_API_URL =
    String(
      window.VOXLIS_PAGE?.catalog?.suncApiUrl ??
        window.VOXLIS_CONFIG?.activeCatalogPage?.suncApiUrl ??
        "https://api.voxlis.net/api/sunc",
    ).trim();
  const OFFICIAL_RESULT_URL = "https://sunc.rubis.app/";
  const suncModalState = {
    closeTimerId: 0,
    previousBodyOverflow: "",
    requestSequence: 0,
    pendingPayload: null,
    responseCache: new Map(),
    currentResult: null,
    searchQuery: "",
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character);

  const buildOfficialResultUrl = ({ scrapId = "", key = "" } = {}) => {
    const search = new URLSearchParams();
    if (scrapId) search.set("scrap", scrapId);
    if (key) search.set("key", key);
    const query = search.toString();
    return query ? `${OFFICIAL_RESULT_URL}?${query}` : OFFICIAL_RESULT_URL;
  };

  const formatSeconds = (value) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return "Unknown";
    return `${nextValue.toFixed(nextValue >= 10 ? 1 : 2)}s`;
  };

  const extractFailureMessage = (value) => {
    if (typeof value === "string") {
      return value.trim();
    }

    if (!value || typeof value !== "object") {
      return "";
    }

    const knownMessage =
      value.message ||
      value.error ||
      value.reason ||
      value.details ||
      value.description ||
      "";

    if (typeof knownMessage === "string" && knownMessage.trim()) {
      return knownMessage.trim();
    }

    const serialized = JSON.stringify(value);
    return serialized === "{}" ? "" : serialized;
  };

  const normalizeTestEntries = (value, { includeMessage = false } = {}) => {
    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (typeof entry === "string") {
            return { name: entry.trim(), message: "" };
          }

          if (entry && typeof entry === "object") {
            return {
              name: String(entry.name || entry.test || entry.label || "").trim(),
              message: includeMessage ? extractFailureMessage(entry) : "",
            };
          }

          return null;
        })
        .filter((entry) => entry?.name);
    }

    if (value && typeof value === "object") {
      return Object.entries(value)
        .map(([name, details]) => ({
          name: String(name || "").trim(),
          message: includeMessage ? extractFailureMessage(details) : "",
        }))
        .filter((entry) => entry.name);
    }

    return [];
  };

  const calculateSuncScorePercent = ({ passedCount = 0, totalCount = 0, rawScore = null } = {}) => {
    const numericPassedCount = Number(passedCount);
    const numericTotalCount = Number(totalCount);
    if (
      Number.isFinite(numericPassedCount) &&
      Number.isFinite(numericTotalCount) &&
      numericTotalCount > 0
    ) {
      return Math.max(0, Math.min(100, Math.floor((numericPassedCount / numericTotalCount) * 100)));
    }

    const numericRawScore = Number(rawScore);
    if (!Number.isFinite(numericRawScore)) {
      return null;
    }

    const normalizedScore = numericRawScore >= 0 && numericRawScore <= 1 ? numericRawScore * 100 : numericRawScore;
    return Math.max(0, Math.min(100, Math.floor(normalizedScore)));
  };

  const normalizeSuncResult = (payload = {}, requestPayload = {}) => {
    const passedEntries = normalizeTestEntries(payload.tests?.passed);
    const failedEntries = normalizeTestEntries(payload.tests?.failed, { includeMessage: true });
    const passedCount = passedEntries.length;
    const failedCount = failedEntries.length;
    const totalCount = passedCount + failedCount;
    const score = calculateSuncScorePercent({
      passedCount,
      totalCount,
      rawScore: payload.score,
    });

    return {
      title: requestPayload.title || "sUNC Widget",
      officialUrl: buildOfficialResultUrl(requestPayload),
      score,
      passedEntries,
      failedEntries,
      passedCount,
      failedCount,
      totalCount,
      executor: payload.executor || "Unknown",
      version: payload.version || "Unknown",
      timeTaken: formatSeconds(payload.timeTaken),
    };
  };

  const getScoreTone = ({ score, failedCount }) => {
    if (!Number.isFinite(score)) return "is-unknown";
    if (failedCount === 0) return "is-good";
    if (score >= 80) return "is-warn";
    return "is-bad";
  };

  const getResultEntries = (result) => [
    ...result.failedEntries.map((entry) => ({ ...entry, status: "failed" })),
    ...result.passedEntries.map((entry) => ({ ...entry, status: "passed" })),
  ];

  const fetchSuncResult = ({ scrapId = "", key = "" } = {}) => {
    const cacheKey = `${scrapId}:${key}`;
    if (!suncModalState.responseCache.has(cacheKey)) {
      const request = fetch(
        `${SUNC_API_URL}?scrap=${encodeURIComponent(scrapId)}&key=${encodeURIComponent(key)}`,
        { cache: "no-cache" },
      ).then(async (response) => {
        if (!response.ok) {
          throw new Error(`sUNC API request failed (${response.status})`);
        }

        return response.json();
      });

      suncModalState.responseCache.set(cacheKey, request);
    }

    return suncModalState.responseCache.get(cacheKey);
  };

  const ensureSuncModal = () => {
    let modal = document.getElementById("suncModal");
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = "sunc-modal-container";
    modal.id = "suncModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="sunc-modal-overlay" data-sunc-modal-close></div>
      <div class="sunc-modal" role="dialog" aria-modal="true" aria-labelledby="suncModalHeading">
        <div class="sunc-widget-shell">
          <div class="sunc-widget-topbar">
            <div class="sunc-widget-brand">
              <span class="sunc-widget-brand-mark" aria-hidden="true">
                <span class="sunc-widget-brand-mark-s"></span>
                <img
                  class="sunc-widget-brand-mark-word"
                  src="/public/assets/icons/vectors/sunc_badge_white.svg"
                  alt=""
                >
              </span>
              <div class="sunc-widget-brand-copy">
                <h2 class="sunc-widget-brand-title" id="suncModalHeading">Test Result</h2>
                <p class="sunc-widget-brand-subtitle" id="suncModalSubtitle">sUNC Widget</p>
              </div>
            </div>
            <button class="sunc-widget-close-btn" type="button" data-sunc-modal-close aria-label="Close sUNC results">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <p class="sunc-widget-notice">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            <span>A failed function may still "work", but failed one of sUNC's rigorous checks.</span>
          </p>
          <div class="sunc-widget-body" id="suncModalBody"></div>
          <footer class="sunc-widget-footer">
            <span>Powered by</span>
            <a href="https://numelon.com/" target="_blank" rel="noopener noreferrer">
              Numelon <i class="fas fa-up-right-from-square" aria-hidden="true"></i>
            </a>
          </footer>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-sunc-modal-close]")) {
        closeSuncModal();
        return;
      }

      const retryButton = event.target.closest("[data-sunc-modal-retry]");
      if (retryButton && suncModalState.pendingPayload) {
        openSuncModal(suncModalState.pendingPayload, { forceRefresh: true });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeSuncModal();
      }
    });

    document.body.appendChild(modal);
    return modal;
  };

  const renderResultRows = (modal, result) => {
    const listNode = modal.querySelector("#suncModalResults");
    if (!listNode) return;

    const query = suncModalState.searchQuery.trim().toLowerCase();
    const entries = getResultEntries(result).filter((entry) => {
      if (!query) return true;
      return `${entry.name} ${entry.message}`.toLowerCase().includes(query);
    });

    if (!entries.length) {
      listNode.innerHTML = `
        <div class="sunc-widget-empty-search">
          No functions matched your search.
        </div>
      `;
      return;
    }

    listNode.innerHTML = entries
      .map(
        (entry) => `
          <article class="sunc-widget-result-card is-${escapeHtml(entry.status)}">
            <div class="sunc-widget-result-icon" aria-hidden="true">
              <i class="fas ${entry.status === "passed" ? "fa-check" : "fa-xmark"}"></i>
            </div>
            <div class="sunc-widget-result-copy">
              <strong>${escapeHtml(entry.name)}</strong>
              ${entry.message ? `<p>${escapeHtml(entry.message)}</p>` : ""}
            </div>
          </article>
        `,
      )
      .join("");
  };

  const bindSearchField = (modal, result) => {
    const input = modal.querySelector("#suncModalSearch");
    if (!input) return;

    input.addEventListener("input", () => {
      suncModalState.searchQuery = input.value || "";
      renderResultRows(modal, result);
    });
  };

  const renderLoadingState = (modal, payload) => {
    const subtitleNode = modal.querySelector("#suncModalSubtitle");
    const bodyNode = modal.querySelector("#suncModalBody");
    if (!bodyNode) return;

    suncModalState.currentResult = null;
    suncModalState.searchQuery = "";
    if (subtitleNode) {
      subtitleNode.textContent = String(payload.title || "sUNC Widget").trim() || "sUNC Widget";
    }

    bodyNode.innerHTML = `
      <div class="sunc-widget-state-card">
        <div class="sunc-widget-state-icon is-loading" aria-hidden="true"></div>
        <h3>Loading result...</h3>
        <p>Pulling the current sUNC test data for this product.</p>
      </div>
    `;
  };

  const renderErrorState = (modal, payload, error) => {
    const subtitleNode = modal.querySelector("#suncModalSubtitle");
    const bodyNode = modal.querySelector("#suncModalBody");
    if (!bodyNode) return;

    suncModalState.currentResult = null;
    suncModalState.searchQuery = "";
    if (subtitleNode) {
      subtitleNode.textContent = String(payload.title || "sUNC Widget").trim() || "sUNC Widget";
    }

    bodyNode.innerHTML = `
      <div class="sunc-widget-state-card is-error">
        <div class="sunc-widget-state-icon is-error" aria-hidden="true">
          <i class="fas fa-triangle-exclamation"></i>
        </div>
        <h3>Something went wrong</h3>
        <p>${escapeHtml(error?.message || "We couldn't load your test result right now.")}</p>
        <div class="sunc-widget-state-actions">
          <button class="sunc-widget-inline-button" type="button" data-sunc-modal-retry>Retry</button>
          <a class="sunc-widget-inline-link" href="${escapeHtml(buildOfficialResultUrl(payload))}" target="_blank" rel="noopener noreferrer">
            Open official result
          </a>
        </div>
      </div>
    `;
  };

  const renderResultState = (modal, result) => {
    const subtitleNode = modal.querySelector("#suncModalSubtitle");
    const bodyNode = modal.querySelector("#suncModalBody");
    if (!bodyNode) return;

    suncModalState.currentResult = result;
    suncModalState.searchQuery = "";
    if (subtitleNode) {
      subtitleNode.textContent = result.title;
    }

    const scoreTone = getScoreTone(result);
    const score = Number.isFinite(result.score) ? result.score : 0;
    const dashOffset = RING_CIRCUMFERENCE - (score / 100) * RING_CIRCUMFERENCE;
    const failedCopy =
      result.failedCount === 1
        ? "1 failed function"
        : `${result.failedCount} failed functions`;

    bodyNode.innerHTML = `
      <div class="sunc-widget-main">
        <section class="sunc-widget-results-column">
          <label class="sunc-widget-search">
            <i class="fas fa-search" aria-hidden="true"></i>
            <input
              type="text"
              id="suncModalSearch"
              placeholder="Search functions..."
              autocorrect="off"
              autocomplete="off"
              spellcheck="false"
            >
          </label>
          <div class="sunc-widget-results" id="suncModalResults"></div>
        </section>
        <aside class="sunc-widget-summary-column">
          <div class="sunc-widget-summary-card">
            <div class="sunc-widget-ring-wrap">
              <svg class="sunc-widget-ring" viewBox="0 0 192 192" aria-hidden="true">
                <circle cx="96" cy="96" r="${RING_RADIUS}" class="sunc-widget-ring-track"></circle>
                <circle
                  cx="96"
                  cy="96"
                  r="${RING_RADIUS}"
                  class="sunc-widget-ring-progress ${scoreTone}"
                  style="stroke-dasharray: ${RING_CIRCUMFERENCE}; stroke-dashoffset: ${dashOffset};"
                ></circle>
              </svg>
              <div class="sunc-widget-ring-copy">
                <p class="sunc-widget-ring-percentage">${escapeHtml(Number.isFinite(result.score) ? `${result.score}%` : "N/A")}</p>
                <div class="sunc-widget-ring-stats">
                  <span class="sunc-widget-ring-passed">${escapeHtml(String(result.passedCount))}</span>
                  <span class="sunc-widget-ring-total">/ ${escapeHtml(String(result.totalCount || 0))}</span>
                </div>
              </div>
            </div>
            <p class="sunc-widget-failed-copy ${scoreTone}">${escapeHtml(failedCopy)}</p>
            <div class="sunc-widget-summary-metrics">
              <p><span><i class="fas fa-hourglass-half" aria-hidden="true"></i> Time Taken (seconds)</span><strong>${escapeHtml(result.timeTaken)}</strong></p>
              <p><span><i class="fas fa-cog" aria-hidden="true"></i> sUNC Version</span><strong>${escapeHtml(result.version)}</strong></p>
              <p><span><i class="fas fa-desktop" aria-hidden="true"></i> Executor</span><strong>${escapeHtml(result.executor)}</strong></p>
            </div>
            <div class="sunc-widget-summary-actions">
              <a href="${escapeHtml(result.officialUrl)}" target="_blank" rel="noopener noreferrer" class="sunc-widget-summary-link">
                <i class="fas fa-up-right-from-square" aria-hidden="true"></i>
                <span>View sUNC Link</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    `;

    renderResultRows(modal, result);
    bindSearchField(modal, result);
  };

  const finishSuncModalClose = () => {
    const modal = document.getElementById("suncModal");
    if (!modal) {
      return;
    }

    modal.hidden = true;
    modal.classList.remove("is-open", "is-closing");
    document.body.style.overflow = suncModalState.previousBodyOverflow;
    suncModalState.previousBodyOverflow = "";
    suncModalState.closeTimerId = 0;
  };

  function closeSuncModal() {
    const modal = document.getElementById("suncModal");
    if (!modal || modal.hidden || modal.classList.contains("is-closing")) {
      return;
    }

    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    window.clearTimeout(suncModalState.closeTimerId);
    suncModalState.closeTimerId = window.setTimeout(finishSuncModalClose, MODAL_EXIT_MS);
  }

  const openSuncModal = (payload = {}, { forceRefresh = false } = {}) => {
    const nextPayload = {
      title: String(payload.title || "sUNC Widget").trim() || "sUNC Widget",
      scrapId: String(payload.scrapId || "").trim(),
      key: String(payload.key || "").trim(),
    };

    if (!nextPayload.scrapId || !nextPayload.key) {
      return false;
    }

    if (!SUNC_API_URL) {
      return false;
    }

    const modal = ensureSuncModal();
    if (!modal) {
      return false;
    }

    window.clearTimeout(suncModalState.closeTimerId);
    suncModalState.pendingPayload = nextPayload;
    const requestSequence = ++suncModalState.requestSequence;

    if (modal.hidden) {
      suncModalState.previousBodyOverflow = document.body.style.overflow;
    }

    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.classList.remove("is-closing", "is-open");
    renderLoadingState(modal, nextPayload);

    window.requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    if (forceRefresh) {
      suncModalState.responseCache.delete(`${nextPayload.scrapId}:${nextPayload.key}`);
    }

    fetchSuncResult(nextPayload)
      .then((responsePayload) => {
        if (requestSequence !== suncModalState.requestSequence) {
          return;
        }

        renderResultState(modal, normalizeSuncResult(responsePayload, nextPayload));
      })
      .catch((error) => {
        if (requestSequence !== suncModalState.requestSequence) {
          return;
        }

        console.warn("Failed to load local sUNC widget.", error);
        renderErrorState(modal, nextPayload, error);
      });

    return true;
  };

  window.openSuncModal = openSuncModal;
  window.closeSuncModal = closeSuncModal;
})();
