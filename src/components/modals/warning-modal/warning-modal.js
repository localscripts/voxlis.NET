(() => {
  if (window.openCardWarningModal) {
    return;
  }

  const WARNING_MODAL_EXIT_MS = 320;
  const warningModalState = {
    closeTimerId: 0,
    pendingAction: null,
    previousBodyOverflow: "",
  };
  const getWarningVariant = (warningConfig = {}) =>
    String(warningConfig?.variant || warningConfig?.type || "").trim().toLowerCase();

  const ensureWarningModal = () => {
    let modal = document.getElementById("cardWarningModal");
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = "card-warning-modal";
    modal.id = "cardWarningModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="card-warning-dialog" role="dialog" aria-modal="true" aria-labelledby="cardWarningTitle" aria-describedby="cardWarningDescription">
        <div class="card-warning-head">
          <div class="card-warning-icon" aria-hidden="true">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
          <div class="card-warning-copy">
            <p class="card-warning-title" id="cardWarningTitle">Warning</p>
            <p class="card-warning-description" id="cardWarningDescription"></p>
          </div>
        </div>
        <div class="card-warning-actions">
          <button class="card-warning-btn is-primary" type="button" data-card-warning-continue>
            <span class="card-warning-btn-label">Press to continue</span>
          </button>
          <button class="card-warning-btn is-secondary" type="button" data-card-warning-close>Close</button>
        </div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (
        event.target === modal ||
        event.target.closest("[data-card-warning-close]")
      ) {
        closeCardWarningModal();
      }
    });

    const continueButton = modal.querySelector("[data-card-warning-continue]");
    continueButton?.addEventListener("click", continueWarningModalAction);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeCardWarningModal();
      }
    });

    document.body.appendChild(modal);
    return modal;
  };

  const completeWarningModalClose = () => {
    const modal = document.getElementById("cardWarningModal");
    if (!modal) return;

    modal.hidden = true;
    modal.classList.remove("is-open", "is-closing", "is-warning", "is-warningred");
    warningModalState.pendingAction = null;
    document.body.style.overflow = warningModalState.previousBodyOverflow;
    warningModalState.previousBodyOverflow = "";
    warningModalState.closeTimerId = 0;
  };

  function closeCardWarningModal({ immediate = false } = {}) {
    const modal = document.getElementById("cardWarningModal");
    if (!modal || modal.hidden) {
      return;
    }

    window.clearTimeout(warningModalState.closeTimerId);
    if (immediate) {
      completeWarningModalClose();
      return;
    }

    if (modal.classList.contains("is-closing")) {
      return;
    }

    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    warningModalState.closeTimerId = window.setTimeout(
      completeWarningModalClose,
      WARNING_MODAL_EXIT_MS,
    );
  }

  function continueWarningModalAction() {
    const action = warningModalState.pendingAction;
    closeCardWarningModal();

    if (!action?.href) {
      return;
    }

    if (action.target === "_blank") {
      window.open(action.href, "_blank", "noopener");
      return;
    }

    window.location.assign(action.href);
  }

  const openCardWarningModal = (warningConfig, action) => {
    if (!warningConfig?.description || !action?.href) {
      return false;
    }

    const modal = ensureWarningModal();
    const titleNode = modal.querySelector("#cardWarningTitle");
    const descriptionNode = modal.querySelector("#cardWarningDescription");
    const continueButton = modal.querySelector("[data-card-warning-continue]");

    window.clearTimeout(warningModalState.closeTimerId);
    warningModalState.pendingAction = action;
    if (modal.hidden) {
      warningModalState.previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";

    titleNode.textContent = warningConfig.title || "Warning";
    descriptionNode.textContent = warningConfig.description;

    modal.hidden = false;
    modal.classList.remove("is-closing", "is-warning", "is-warningred");
    modal.classList.add(
      "is-open",
      getWarningVariant(warningConfig) === "warningred" ? "is-warningred" : "is-warning",
    );

    window.requestAnimationFrame(() => {
      continueButton?.focus();
    });

    return true;
  };

  window.openCardWarningModal = openCardWarningModal;
  window.closeCardWarningModal = closeCardWarningModal;
})();
