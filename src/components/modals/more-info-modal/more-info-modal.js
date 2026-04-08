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
        src="/public/assets/misc/hmmm.gif"
        alt="Verification pending"
        loading="lazy"
      >
    </div>
  `;
  const MIRROR_PICKER_TITLE = "Choose Your Mirror Site";
  const MIRROR_PICKER_NOTE =
    "All of the provided domains are official. Multiple domains are available because some may not function properly depending on your Internet Service Provider.";
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
  const MARKDOWN_BUTTON_GROUP_PATTERN = /^\s*\[!(BUTTONS|LINKS)\]/i;
  const MARKDOWN_BUTTON_GROUP_PREFIX_PATTERN = /^\s*\[!(BUTTONS|LINKS)\](?:\s|<br\s*\/?>)*/i;
  const MARKDOWN_CALLOUTS = {
    tip: {
      label: "Tip",
      iconClass: "fa-lightbulb",
      color: "#22C55E",
    },
    note: {
      label: "Note",
      iconClass: "",
      iconMarkup: '<span class="info-modal-callout-title-icon is-note" aria-hidden="true"></span>',
      color: "#3B82F6",
    },
    warning: {
      label: "Warning",
      iconClass: "fa-triangle-exclamation",
      color: "#F59E0B",
    },
  };
  const ACTIVE_CATALOG = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};

  const reviewSourceCache = new Map();
  const modalState = {
    closeTimerId: 0,
    previousBodyOverflow: "",
    requestToken: 0,
    activePath: "",
    trackingSlug: "",
    websiteTargets: [],
    websiteTitle: "",
    choiceWarningConfig: null,
    choiceTarget: "_blank",
  };

  let markedConfigured = false;
  let modalPathResolver = null;

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
  const startCase = (value = "") =>
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  const getDefaultEntryLabel = () => startCase(ACTIVE_CATALOG.labels?.itemSingular || "card");
  const getDefaultModalTitle = () => `${getDefaultEntryLabel()} Information`;
  const getCurrentLocationTarget = () =>
    normalizePath(`${window.location.pathname || "/"}${window.location.search || ""}`);

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
      iconMarkup: config.iconMarkup || "",
      color: normalizeHexColor(match[2]) || config.color,
      colorRgb: hexToRgbString(match[2]) || hexToRgbString(config.color),
      hasBorder: Boolean(match[3]),
    };
  };

  const isMarkdownButtonGroup = (value = "") => MARKDOWN_BUTTON_GROUP_PATTERN.test(String(value).trim());

  const normalizeWebsiteHref = (value = "") => {
    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) {
      return "";
    }

    if (/^#/.test(normalizedValue) || normalizedValue.startsWith("/")) {
      return normalizedValue;
    }

    if (/^\/\//.test(normalizedValue)) {
      return `https:${normalizedValue}`;
    }

    if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedValue)) {
      return normalizedValue;
    }

    return `https://${normalizedValue.replace(/^\/+/, "")}`;
  };

  const normalizeWebsiteTargetList = (value) => {
    const values = Array.isArray(value) ? value : [value];
    return [...new Set(values.map((entry) => normalizeWebsiteHref(entry)).filter(Boolean))];
  };

  const normalizeWarningConfig = (warningConfig = null) => {
    if (!warningConfig || typeof warningConfig !== "object") {
      return null;
    }

    const variant = String(warningConfig.variant || warningConfig.type || "").trim().toLowerCase();
    const description = String(warningConfig.description || "").trim();
    if (!variant || !description) {
      return null;
    }

    return {
      variant,
      title: String(warningConfig.title || "Important warning").trim() || "Important warning",
      description,
    };
  };

  const buildWebsiteChoiceEntry = (href = "", index = 0, label = "") => {
    const normalizedHref = normalizeWebsiteHref(href);
    if (!normalizedHref || normalizedHref === "#") {
      return null;
    }

    const normalizedLabel = String(label || "").trim();
    try {
      const parsedUrl = new URL(normalizedHref, window.location.origin);
      const hostname = parsedUrl.hostname.replace(/^www\./i, "");
      return {
        href: parsedUrl.href,
        label: normalizedLabel || hostname || `Link ${index + 1}`,
        detail: parsedUrl.href,
      };
    } catch {
      return {
        href: normalizedHref,
        label: normalizedLabel || `Link ${index + 1}`,
        detail: normalizedHref,
      };
    }
  };

  const buildChoiceButtonMarkup = (entry, { interactive = false, target = "_blank" } = {}) => {
    if (!entry?.href) {
      return "";
    }

    const buttonTarget = String(target || "_blank").trim() || "_blank";
    return `
      <a
        class="info-modal-choice-btn"
        href="${escapeHtml(entry.href)}"
        target="${escapeHtml(buttonTarget)}"
        rel="noopener noreferrer"
        ${interactive ? `data-info-modal-choice-url="${escapeHtml(entry.href)}" data-info-modal-choice-target="${escapeHtml(buttonTarget)}"` : ""}
      >
        <span class="info-modal-choice-head">
          <span class="info-modal-choice-label">${escapeHtml(entry.label)}</span>
          <span class="info-modal-choice-action" aria-hidden="true">
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
            <span>Visit</span>
          </span>
        </span>
        <span class="info-modal-choice-url">${escapeHtml(entry.detail)}</span>
      </a>
    `;
  };

  const buildMirrorPickerContentHtml = (entries = [], { target = "_blank" } = {}) => `
    <p class="info-modal-choice-note">${escapeHtml(MIRROR_PICKER_NOTE)}</p>
    <div class="info-modal-choice-group">
      ${entries.map((entry) => buildChoiceButtonMarkup(entry, { interactive: true, target })).join("")}
    </div>
  `;

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

  const enhanceMarkdownButtonGroups = (root) => {
    if (!root) {
      return;
    }

    root.querySelectorAll("blockquote").forEach((blockquote) => {
      const firstParagraph = blockquote.querySelector(":scope > p");
      if (!firstParagraph || !isMarkdownButtonGroup(firstParagraph.textContent?.trim() || "")) {
        return;
      }

      firstParagraph.innerHTML = firstParagraph.innerHTML.replace(MARKDOWN_BUTTON_GROUP_PREFIX_PATTERN, "");
      if (!firstParagraph.textContent.trim() && !firstParagraph.children.length) {
        firstParagraph.remove();
      }

      const seenHrefs = new Set();
      const entries = [...blockquote.querySelectorAll("a[href]")]
        .map((link, index) => buildWebsiteChoiceEntry(link.getAttribute("href"), index, link.textContent))
        .filter((entry) => {
          if (!entry || seenHrefs.has(entry.href)) {
            return false;
          }

          seenHrefs.add(entry.href);
          return true;
        });
      if (!entries.length) {
        return;
      }

      const groupNode = document.createElement("div");
      groupNode.className = "info-modal-choice-group";
      groupNode.innerHTML = entries.map((entry) => buildChoiceButtonMarkup(entry)).join("");
      blockquote.replaceWith(groupNode);
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
      const titleIconMarkup = callout.iconMarkup
        ? callout.iconMarkup
        : `<i class="fas ${escapeHtml(callout.iconClass)}" aria-hidden="true"></i>`;
      titleNode.innerHTML = `${titleIconMarkup}${escapeHtml(callout.label)}`;
      blockquote.insertBefore(titleNode, blockquote.firstChild);
    });
  };

  const enhanceMarkdownContent = (root) => {
    if (!root) {
      return;
    }

    enhanceMarkdownButtonGroups(root);
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
      return false;
    }

    if (target === "_blank") {
      window.open(href, "_blank", "noopener");
      return true;
    }

    window.location.assign(href);
    return true;
  };

  const closeOpenSiteModals = () => {
    window.closeCardWarningModal?.({ immediate: true });
    window.requestCloseMoreInfoModal?.({ immediate: true });
    window.closeSuncModal?.({ immediate: true });
  };

  const openWebsiteAction = (href = "", { target = "_blank", warningConfig = null } = {}) => {
    const normalizedHref = normalizeWebsiteHref(href);
    if (!normalizedHref || normalizedHref === "#") {
      return false;
    }

    const normalizedWarningConfig = normalizeWarningConfig(warningConfig);
    if (normalizedWarningConfig && typeof window.openCardWarningModal === "function") {
      const opened =
        window.openCardWarningModal(
          normalizedWarningConfig,
          {
            href: normalizedHref,
            target,
          },
        ) ?? false;

      if (opened) {
        return true;
      }
    }

    return runAction({
      href: normalizedHref,
      target,
    });
  };

  const trackModalCardAction = (action = "") => {
    const trackingSlug = String(modalState.trackingSlug || "").trim();
    const trackingAction = String(action || "").trim().toLowerCase();
    if (!trackingSlug || !trackingAction) {
      return;
    }

    window.VOXLIS_CLICK_TRACKER?.trackAction?.({
      slug: trackingSlug,
      action: trackingAction,
    });
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
          <h2 class="info-modal-title" id="moreInfoModalTitle">${escapeHtml(getDefaultModalTitle())}</h2>
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
            <i class="fas fa-times" aria-hidden="true"></i> <span id="moreInfoModalCloseLabel">Close</span>
          </button>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      const choiceButton = event.target.closest("[data-info-modal-choice-url]");
      if (choiceButton) {
        event.preventDefault();
        const href = choiceButton.dataset.infoModalChoiceUrl || choiceButton.getAttribute("href") || "";
        if (!href || href === "#") {
          return;
        }

        requestCloseMoreInfoModal({ immediate: true });
        openWebsiteAction(href, {
          target:
            choiceButton.dataset.infoModalChoiceTarget ||
            modalState.choiceTarget ||
            choiceButton.getAttribute("target") ||
            "_blank",
          warningConfig: modalState.choiceWarningConfig,
        });
        return;
      }

      if (event.target.closest("[data-more-info-close]")) {
        if (event.target.closest(".info-modal-close-btn")) {
          trackModalCardAction("close");
        }
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
      const websiteTargets = normalizeWebsiteTargetList(
        modalState.websiteTargets.length ? modalState.websiteTargets : websiteButton.getAttribute("href"),
      );
      const href = websiteTargets[0] || websiteButton.getAttribute("href") || "";
      if (!href || href === "#") {
        event.preventDefault();
        return;
      }

      trackModalCardAction("website");
      const warningVariant = websiteButton.dataset.warningVariant || "";
      const warningConfig = warningVariant
        ? {
            variant: warningVariant,
            title: websiteButton.dataset.warningTitle || "Important warning",
            description: websiteButton.dataset.warningDescription || "",
          }
        : null;

      if (typeof window.openWebsiteDestination === "function") {
        event.preventDefault();
        const opened =
          window.openWebsiteDestination({
            websites: websiteTargets,
            warningConfig,
            target: websiteButton.getAttribute("target") || "",
            title: modalState.websiteTitle || "",
            closeOpenModals: websiteTargets.length > 1,
          }) ?? false;

        if (opened) {
          return;
        }
      }

      event.preventDefault();
      openWebsiteAction(href, {
        target: websiteButton.getAttribute("target") || "",
        warningConfig,
      });
    });

    document.body.appendChild(modal);
    return modal;
  };

  const finishMoreInfoModalClose = () => {
    const modal = document.getElementById("moreInfoModal");
    if (!modal) {
      return;
    }

    const closeLabelNode = modal.querySelector("#moreInfoModalCloseLabel");
    modal.hidden = true;
    modal.classList.remove("is-open", "is-closing", "is-tag-guide", "is-mirror-picker");
    document.body.style.overflow = modalState.previousBodyOverflow;
    modalState.previousBodyOverflow = "";
    modalState.closeTimerId = 0;
    modalState.activePath = "";
    modalState.trackingSlug = "";
    modalState.websiteTargets = [];
    modalState.websiteTitle = "";
    modalState.choiceWarningConfig = null;
    modalState.choiceTarget = "_blank";
    if (closeLabelNode) {
      closeLabelNode.textContent = "Close";
    }
  };

  function closeMoreInfoModal({ immediate = false } = {}) {
    const modal = document.getElementById("moreInfoModal");
    if (!modal || modal.hidden) {
      return;
    }

    modalState.requestToken += 1;
    window.clearTimeout(modalState.closeTimerId);
    if (immediate) {
      finishMoreInfoModalClose();
      return;
    }

    if (modal.classList.contains("is-closing")) {
      return;
    }

    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    modalState.closeTimerId = window.setTimeout(
      finishMoreInfoModalClose,
      MODAL_EXIT_MS,
    );
  }

  const requestCloseMoreInfoModal = ({ immediate = false } = {}) => {
    const activePath = normalizePath(modalState.activePath);
    const currentPath = getCurrentLocationTarget();
    let shouldRequestHistoryBack = false;

    if (activePath !== "/" && currentPath === activePath) {
      if (window.history.state?.moreInfoModal === activePath) {
        shouldRequestHistoryBack = true;
      } else {
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
          ACTIVE_CATALOG.homePath || "/",
        );
      }
    }

    if (shouldRequestHistoryBack) {
      window.history.back();
      if (!immediate) {
        return;
      }
    }

    closeMoreInfoModal({ immediate });
  };

  const openMoreInfoModal = ({
    title = getDefaultEntryLabel(),
    description = "",
    reviewUrl,
    websiteUrl = "",
    websiteWarningConfig = null,
    choiceWarningConfig = null,
    choiceTarget = "_blank",
    contentHtml = "",
    highlightContentKey = "",
    preserveTitle = false,
    hideWebsiteButton = false,
    trackingSlug = "",
    modalPath = "",
    pushHistory = true,
    closeLabel = "Close",
    modalVariant = "",
  } = {}) => {
    const modalContentHtml = String(contentHtml).trim();
    const isMirrorPicker = modalVariant === "mirror-picker";
    const isTagGuide = hideWebsiteButton && Boolean(modalContentHtml) && !isMirrorPicker;
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
    const closeLabelNode = modal.querySelector("#moreInfoModalCloseLabel");
    const exploitName = String(title).trim() || getDefaultEntryLabel();
    const modalTitle = preserveTitle || exploitName.endsWith(" Information")
      ? exploitName
      : `${exploitName} Information`;
    const modalDescription = String(description).trim();
    const modalWebsiteTargets = normalizeWebsiteTargetList(websiteUrl);
    const primaryWebsiteUrl = modalWebsiteTargets[0] || "";
    const normalizedModalPath = modalPath ? normalizePath(modalPath) : "";
    const normalizedChoiceWarningConfig = normalizeWarningConfig(choiceWarningConfig);
    const resolvedChoiceTarget = String(choiceTarget || "_blank").trim() || "_blank";
    const requestToken = modalState.requestToken + 1;

    window.clearTimeout(modalState.closeTimerId);
    if (modal.hidden) {
      modalState.previousBodyOverflow = document.body.style.overflow;
    }

    modalState.requestToken = requestToken;
    modalState.activePath = normalizedModalPath;
    modalState.trackingSlug = String(trackingSlug).trim();
    modalState.websiteTargets = modalWebsiteTargets;
    modalState.websiteTitle = exploitName;
    modalState.choiceWarningConfig = normalizedChoiceWarningConfig;
    modalState.choiceTarget = resolvedChoiceTarget;
    titleNode.textContent = modalTitle;
    nameNode.textContent = "";
    nameNode.hidden = true;
    descriptionNode.textContent = modalDescription;
    descriptionNode.hidden = !modalDescription;
    if (closeLabelNode) {
      closeLabelNode.textContent = String(closeLabel || "Close").trim() || "Close";
    }
    if (infoNode) {
      infoNode.hidden = !modalDescription;
    }
    if (websiteButton) {
      const shouldHideWebsiteButton = hideWebsiteButton || !modalWebsiteTargets.length;
      websiteButton.hidden = shouldHideWebsiteButton;
      websiteButton.setAttribute("href", shouldHideWebsiteButton ? "#" : primaryWebsiteUrl);
      websiteButton.setAttribute(
        "title",
        modalWebsiteTargets.length > 1 ? "Choose a mirror site" : "Open website",
      );
      delete websiteButton.dataset.warningVariant;
      delete websiteButton.dataset.warningTitle;
      delete websiteButton.dataset.warningDescription;

      const warningVariant = websiteWarningConfig?.variant || websiteWarningConfig?.type || "";
      if (!shouldHideWebsiteButton && warningVariant) {
        websiteButton.dataset.warningVariant = warningVariant;
        websiteButton.dataset.warningTitle = websiteWarningConfig.title || "Important warning";
        websiteButton.dataset.warningDescription = websiteWarningConfig.description || "";
      }
    }
    markdownNode.innerHTML = LOADING_MARKUP;
    contentNode.scrollTop = 0;

    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.classList.remove("is-closing", "is-open", "is-tag-guide", "is-mirror-picker");
    if (isTagGuide) {
      modal.classList.add("is-tag-guide");
    }
    if (isMirrorPicker) {
      modal.classList.add("is-mirror-picker");
    }
    window.requestAnimationFrame(() => {
      if (!modal.hidden) {
        modal.classList.add("is-open");
      }
    });

    if (pushHistory && normalizedModalPath && getCurrentLocationTarget() !== normalizedModalPath) {
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

  const openWebsiteDestination = ({
    websites = [],
    title = "",
    warningConfig = null,
    target = "_blank",
    closeOpenModals = false,
  } = {}) => {
    const entries = normalizeWebsiteTargetList(websites)
      .map((href, index) => buildWebsiteChoiceEntry(href, index))
      .filter(Boolean);
    if (!entries.length) {
      return false;
    }

    if (entries.length === 1) {
      return openWebsiteAction(entries[0].href, {
        target,
        warningConfig,
      });
    }

    if (closeOpenModals) {
      closeOpenSiteModals();
    }

    return openMoreInfoModal({
      title: MIRROR_PICKER_TITLE,
      contentHtml: buildMirrorPickerContentHtml(entries, { target }),
      preserveTitle: true,
      hideWebsiteButton: true,
      choiceWarningConfig: warningConfig,
      choiceTarget: target,
      closeLabel: "Close",
      modalVariant: "mirror-picker",
      pushHistory: false,
    });
  };

  const syncMoreInfoModalToPath = () => {
    const resolvedPath = getCurrentLocationTarget();
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
  window.normalizeWebsiteTargetList = normalizeWebsiteTargetList;
  window.openWebsiteDestination = openWebsiteDestination;
  window.openMoreInfoModal = openMoreInfoModal;
  window.closeMoreInfoModal = closeMoreInfoModal;
  window.requestCloseMoreInfoModal = requestCloseMoreInfoModal;
  window.registerMoreInfoModalPathResolver = registerMoreInfoModalPathResolver;
  window.syncMoreInfoModalToPath = syncMoreInfoModalToPath;
})();


