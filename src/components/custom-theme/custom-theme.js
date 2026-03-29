(() => {
  const THEME_CHANGE_EVENT = "site-theme-change";
  const DEFAULT_HEX = "#3B82F6";
  const DEFAULT_THEME_NAME = "Custom Theme";
  const CUSTOM_THEME_NAME_STORAGE_KEY = "voxlis-custom-theme-name";
  const CUSTOM_THEME_ICON_STORAGE_KEY = "voxlis-custom-theme-icon";
  const CUSTOM_THEME_LOCKED = true;
  const MODAL_EXIT_MS = 240;
  const BUTTON_FEEDBACK_MS = 1400;
  const ICON_SIZE = 128;

  const initCustomThemePicker = (scope = document) => {
    const control = scope.getElementById("customThemeControl");
    const trigger = scope.getElementById("customThemeTrigger");
    const modal = scope.getElementById("customThemeModal");

    if (!control || !trigger) {
      return;
    }

    if (control.dataset.customThemeBound === "true") {
      return;
    }

    if (CUSTOM_THEME_LOCKED) {
      const showLockedNotice = (event) => {
        event.preventDefault();
        event.stopPropagation();

        modal?.classList.remove("is-open", "is-closing");
        if (modal) {
          modal.hidden = true;
        }

        window.showSiteToast?.({
          key: "custom-theme-locked",
          title: "Locked For Now",
          message: "Custom theme sharing is locked for now.",
          duration: 3200,
          icon: "fa-lock",
        });
      };

      trigger.addEventListener("click", showLockedNotice);
      trigger.setAttribute("aria-expanded", "false");
      control.dataset.customThemeBound = "true";
      return;
    }

    const nameInput = scope.getElementById("customThemeNameInput");
    const iconButton = scope.getElementById("customThemeIconButton");
    const iconInput = scope.getElementById("customThemeIconInput");
    const iconImage = scope.getElementById("customThemeIconImage");
    const iconPlaceholder = scope.getElementById("customThemeIconPlaceholder");
    const error = scope.getElementById("customThemeError");
    const copyButton = scope.getElementById("customThemeCopy");
    const pasteButton = scope.getElementById("customThemePaste");
    const sendButton = scope.getElementById("customThemeSend");
    const closeButton = scope.getElementById("customThemeClose");

    if (
      !modal ||
      !nameInput ||
      !iconButton ||
      !iconInput ||
      !iconImage ||
      !iconPlaceholder ||
      !error ||
      !copyButton ||
      !pasteButton ||
      !sendButton ||
      !closeButton
    ) {
      return;
    }

    const getStoredHex = () =>
      window.getStoredCustomSiteThemeHex?.() || DEFAULT_HEX;

    const getActiveTheme = () =>
      window.getActiveSiteTheme?.() || "blue";

    const normalizeThemeName = (value) => {
      const trimmed = typeof value === "string" ? value.trim() : "";
      return trimmed || DEFAULT_THEME_NAME;
    };

    const getStoredThemeName = () =>
      normalizeThemeName(window.localStorage.getItem(CUSTOM_THEME_NAME_STORAGE_KEY) || "");

    const getStoredThemeIcon = () =>
      window.localStorage.getItem(CUSTOM_THEME_ICON_STORAGE_KEY) || "";

    const setStoredThemeName = (value) => {
      const nextName = normalizeThemeName(value);
      window.localStorage.setItem(CUSTOM_THEME_NAME_STORAGE_KEY, nextName);
      return nextName;
    };

    const setStoredThemeIcon = (value) => {
      const nextValue = typeof value === "string" ? value : "";
      if (nextValue) {
        window.localStorage.setItem(CUSTOM_THEME_ICON_STORAGE_KEY, nextValue);
      } else {
        window.localStorage.removeItem(CUSTOM_THEME_ICON_STORAGE_KEY);
      }
      return nextValue;
    };

    let previousBodyOverflow = "";
    let closeTimerId = 0;

    const isModalOpen = () => !modal.hidden;

    const setError = (message = "") => {
      error.textContent = message;
      error.hidden = !message;
    };

    const unlockBody = () => {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = "";
    };

    const flashButtonLabel = (button, label) => {
      const labelNode = button.querySelector(".custom-theme-btn-label");
      const defaultLabel = button.dataset.defaultLabel || labelNode?.textContent || button.textContent;
      const currentTimerId = Number.parseInt(button.dataset.feedbackTimerId || "0", 10);

      if (currentTimerId) {
        window.clearTimeout(currentTimerId);
      }

      button.dataset.defaultLabel = defaultLabel;

      if (labelNode) {
        labelNode.textContent = label;
      } else {
        button.textContent = label;
      }

      const nextTimerId = window.setTimeout(() => {
        if (labelNode) {
          labelNode.textContent = defaultLabel;
        } else {
          button.textContent = defaultLabel;
        }
        button.dataset.feedbackTimerId = "0";
      }, BUTTON_FEEDBACK_MS);

      button.dataset.feedbackTimerId = `${nextTimerId}`;
    };

    const syncIconPreview = (iconDataUrl = "") => {
      if (iconDataUrl) {
        iconImage.src = iconDataUrl;
        iconImage.hidden = false;
        iconPlaceholder.hidden = true;
        return;
      }

      iconImage.removeAttribute("src");
      iconImage.hidden = true;
      iconPlaceholder.hidden = false;
    };

    const syncFields = () => {
      nameInput.value = getStoredThemeName();
      syncIconPreview(getStoredThemeIcon());
    };

    const readFileAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Failed to read image."));
        reader.readAsDataURL(file);
      });

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image."));
        image.src = src;
      });

    const buildIconDataUrl = async (file) => {
      const source = await readFileAsDataUrl(file);
      const image = await loadImage(source);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is unavailable.");
      }

      canvas.width = ICON_SIZE;
      canvas.height = ICON_SIZE;
      context.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const scale = Math.min(ICON_SIZE / image.width, ICON_SIZE / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (ICON_SIZE - width) / 2;
      const y = (ICON_SIZE - height) / 2;

      context.drawImage(image, x, y, width, height);
      return canvas.toDataURL("image/png");
    };

    const buildThemePackageText = () => {
      const cssText = window.getCustomSiteThemeCssText?.() || "";
      return JSON.stringify(
        {
          version: 1,
          name: normalizeThemeName(nameInput.value),
          icon: getStoredThemeIcon(),
          css: cssText,
        },
        null,
        2
      );
    };

    const applyThemePackageText = (text) => {
      const raw = typeof text === "string" ? text.trim() : "";
      if (!raw) {
        setError("Clipboard is empty.");
        return false;
      }

      let payload = null;
      let cssText = raw;

      try {
        payload = JSON.parse(raw);
      } catch (_error) {
        payload = null;
      }

      if (payload && typeof payload === "object") {
        cssText = typeof payload.css === "string" ? payload.css.trim() : "";
        const nextThemeName = normalizeThemeName(payload.name);
        const nextIcon = typeof payload.icon === "string" ? payload.icon : "";

        nameInput.value = nextThemeName;
        setStoredThemeName(nextThemeName);
        setStoredThemeIcon(nextIcon);
        syncIconPreview(nextIcon);
      }

      const nextTheme = window.applyCustomSiteThemeCssText?.(cssText);
      if (!nextTheme) {
        setError("Clipboard theme is invalid.");
        return false;
      }

      window.syncThemeSwitcherUI?.(document);
      setError("");
      return true;
    };

    const closePopover = ({ restoreFocus = false } = {}) => {
      window.clearTimeout(closeTimerId);
      closeTimerId = 0;

      if (!modal.hidden) {
        modal.classList.remove("is-open");
        modal.classList.add("is-closing");

        closeTimerId = window.setTimeout(() => {
          modal.hidden = true;
          modal.classList.remove("is-closing");
          unlockBody();
          closeTimerId = 0;
        }, MODAL_EXIT_MS);
      }

      trigger.classList.remove("is-active");
      trigger.setAttribute("aria-expanded", "false");
      setError("");

      if (restoreFocus) {
        trigger.focus();
      }
    };

    const openPopover = () => {
      window.clearTimeout(closeTimerId);
      closeTimerId = 0;

      syncFields();
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      modal.hidden = false;
      modal.classList.remove("is-closing");
      trigger.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
      setError("");

      requestAnimationFrame(() => {
        modal.classList.add("is-open");
        nameInput.focus();
        nameInput.select();
      });
    };

    const syncState = () => {
      const storedHex = getStoredHex();
      const isCustomActive = getActiveTheme() === "custom";

      trigger.style.setProperty("color", isCustomActive ? storedHex : "");

      if (isModalOpen()) {
        syncFields();
      }
    };

    const copyThemePackage = async () => {
      const text = buildThemePackageText();

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          throw new Error("Clipboard copy is unavailable.");
        }

        flashButtonLabel(copyButton, "Copied");
        setError("");
      } catch (_error) {
        setError("Clipboard copy was blocked.");
      }
    };

    const pasteThemePackage = async () => {
      if (!navigator.clipboard?.readText) {
        setError("Clipboard paste was blocked.");
        return;
      }

      try {
        const nextText = await navigator.clipboard.readText();
        if (!applyThemePackageText(nextText)) {
          return;
        }

        flashButtonLabel(pasteButton, "Pasted");
      } catch (_error) {
        setError("Clipboard paste was blocked.");
      }
    };

    const sendThemePackage = async () => {
      const text = buildThemePackageText();
      const title = normalizeThemeName(nameInput.value);

      try {
        if (navigator.share) {
          await navigator.share({
            title,
            text,
          });
          flashButtonLabel(sendButton, "Sent");
          setError("");
          return;
        }

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          flashButtonLabel(sendButton, "Copied");
          setError("");
          return;
        }

        throw new Error("Share is unavailable.");
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        setError("Share was blocked.");
      }
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isModalOpen()) {
        openPopover();
        return;
      }

      closePopover();
    });

    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      closePopover({ restoreFocus: true });
    });

    nameInput.addEventListener("input", () => {
      setStoredThemeName(nameInput.value);
      setError("");
    });

    iconButton.addEventListener("click", (event) => {
      event.preventDefault();
      iconInput.click();
    });

    iconInput.addEventListener("change", async () => {
      const [file] = iconInput.files || [];
      if (!file) {
        return;
      }

      try {
        const nextIcon = await buildIconDataUrl(file);
        setStoredThemeIcon(nextIcon);
        syncIconPreview(nextIcon);
        setError("");
      } catch (_error) {
        setError("Icon import failed.");
      } finally {
        iconInput.value = "";
      }
    });

    copyButton.addEventListener("click", async (event) => {
      event.preventDefault();
      copyButton.disabled = true;
      await copyThemePackage();
      copyButton.disabled = false;
    });

    pasteButton.addEventListener("click", async (event) => {
      event.preventDefault();
      pasteButton.disabled = true;
      await pasteThemePackage();
      pasteButton.disabled = false;
    });

    sendButton.addEventListener("click", async (event) => {
      event.preventDefault();
      sendButton.disabled = true;
      await sendThemePackage();
      sendButton.disabled = false;
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closePopover({ restoreFocus: true });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isModalOpen()) {
        closePopover({ restoreFocus: true });
      }
    });

    window.addEventListener(THEME_CHANGE_EVENT, syncState);

    control.dataset.customThemeBound = "true";
    trigger.setAttribute("aria-expanded", "false");
    syncState();
  };

  window.initCustomThemePicker = initCustomThemePicker;
})();
