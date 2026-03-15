(() => {
  const TOAST_STACK_ID = "siteToastStack";
  const TOAST_EXIT_DURATION_MS = 320;
  const activeToasts = new Map();

  const ensureToastStack = () => {
    let stack = document.getElementById(TOAST_STACK_ID);
    if (stack) return stack;

    stack = document.createElement("div");
    stack.id = TOAST_STACK_ID;
    stack.className = "site-toast-stack";
    document.body.appendChild(stack);
    return stack;
  };

  const getToastKey = ({ key, title, message, icon }) =>
    key || `${title}::${message}::${icon}`;

  const armToastDismiss = (toast, duration) => {
    window.clearTimeout(toast._dismissTimeoutId);
    if (!Number.isFinite(duration) || duration <= 0) {
      toast._dismissTimeoutId = null;
      return;
    }
    toast._dismissTimeoutId = window.setTimeout(() => dismissToast(toast), duration);
  };

  const dismissToast = (toast, source = "default") => {
    if (!toast || toast.dataset.closing === "true") return;
    toast.dataset.closing = "true";
    toast.dataset.dismissSource = source;
    toast.classList.remove("is-visible");
    toast.classList.add("is-leaving");
    window.clearTimeout(toast._dismissTimeoutId);
    if (toast.dataset.toastKey && activeToasts.get(toast.dataset.toastKey) === toast) {
      activeToasts.delete(toast.dataset.toastKey);
    }
    window.setTimeout(() => toast.remove(), TOAST_EXIT_DURATION_MS);
  };

  const dismissToastByKey = (key, source = "default") => {
    if (!key) return false;
    const toast = activeToasts.get(key);
    if (!toast) return false;
    dismissToast(toast, source);
    return true;
  };

  const showSiteToast = ({
    key = "",
    title = "Notice",
    message = "",
    duration = 3200,
    icon = "fa-bell",
    actionLabel = "",
    actionIcon = "",
    onAction = null,
    dismissLabel = "",
    clickToAction = false,
    showClose = true,
  } = {}) => {
    const stack = ensureToastStack();
    const toastKey = getToastKey({ key, title, message, icon });
    const existingToast = activeToasts.get(toastKey);

    if (existingToast && existingToast.isConnected && existingToast.dataset.closing !== "true") {
      existingToast.classList.remove("is-leaving");
      existingToast.classList.add("is-visible");
      armToastDismiss(existingToast, duration);
      return existingToast;
    }

    const toast = document.createElement("section");
    toast.className = "site-toast";
    if (clickToAction && typeof onAction === "function") {
      toast.classList.add("is-clickable");
    }
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.dataset.toastKey = toastKey;

    const head = document.createElement("div");
    head.className = "site-toast-head";

    const iconWrap = document.createElement("span");
    iconWrap.className = "site-toast-icon";
    iconWrap.setAttribute("aria-hidden", "true");

    const iconEl = document.createElement("i");
    iconEl.className = `fas ${icon}`;
    iconWrap.appendChild(iconEl);

    const titleEl = document.createElement("p");
    titleEl.className = "site-toast-title";
    titleEl.textContent = title;

    head.append(iconWrap, titleEl);

    if (showClose) {
      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "site-toast-close";
      closeButton.setAttribute("aria-label", "Close notification");

      const closeIcon = document.createElement("i");
      closeIcon.className = "fas fa-xmark";
      closeButton.appendChild(closeIcon);

      closeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        dismissToast(toast, "close-button");
      });

      head.appendChild(closeButton);
    }

    const messageEl = document.createElement("p");
    messageEl.className = "site-toast-message";
    messageEl.textContent = message;

    toast.append(head, messageEl);

    if (actionLabel || dismissLabel) {
      const actions = document.createElement("div");
      actions.className = "site-toast-actions";

      if (actionLabel) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "site-toast-action";
        if (actionIcon) {
          const actionIconEl = document.createElement("i");
          actionIconEl.className = `fas ${actionIcon} site-toast-action-icon`;
          actionIconEl.setAttribute("aria-hidden", "true");
          actionButton.appendChild(actionIconEl);
        }
        const actionLabelEl = document.createElement("span");
        actionLabelEl.textContent = actionLabel;
        actionButton.appendChild(actionLabelEl);
        actionButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof onAction === "function") {
            onAction(toast);
          }
          dismissToast(toast, "action");
        });

        actions.appendChild(actionButton);
      }

      if (dismissLabel) {
        const dismissButton = document.createElement("button");
        dismissButton.type = "button";
        dismissButton.className = "site-toast-action site-toast-action-secondary";
        dismissButton.textContent = dismissLabel;
        dismissButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          dismissToast(toast, "close-button");
        });

        actions.appendChild(dismissButton);
      }

      toast.appendChild(actions);
    }

    activeToasts.set(toastKey, toast);
    stack.appendChild(toast);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        toast.classList.add("is-visible");
      });
    });

    armToastDismiss(toast, duration);
    toast.addEventListener("click", () => {
      if (clickToAction && typeof onAction === "function") {
        onAction(toast);
        dismissToast(toast, "action");
        return;
      }
      dismissToast(toast, "toast");
    }, { once: true });
    toast.addEventListener("mouseenter", () => window.clearTimeout(toast._dismissTimeoutId));
    toast.addEventListener("mouseleave", () => {
      armToastDismiss(toast, 1200);
    });

    return toast;
  };

  const initDisabledThemeNotice = (scope = document) => {
    const dropdown = scope.getElementById("themeDropdown");
    const selected = scope.getElementById("themeDropdownSelected");
    const optionsRoot = scope.getElementById("themeDropdownOptions");
    if (!dropdown || !selected) return;

    dropdown.classList.add("theme-dropdown-disabled");
    selected.setAttribute("aria-disabled", "true");

    const notify = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      showSiteToast({
        title: dropdown.dataset.disabledTitle || "Themes Disabled",
        message:
          dropdown.dataset.disabledMessage ||
          "Theme switching is disabled for now.",
        duration: Number(dropdown.dataset.disabledDuration) || 3200,
        icon: "fa-lock",
      });
    };

    selected.addEventListener("click", notify);
    selected.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        notify(event);
      }
    });

    optionsRoot?.querySelectorAll(".theme-dropdown-option").forEach((option) => {
      option.addEventListener("click", notify);
    });
  };

  window.showSiteToast = showSiteToast;
  window.dismissSiteToastByKey = dismissToastByKey;
  window.initDisabledThemeNotice = initDisabledThemeNotice;
})();
