(() => {
  if (window.openCardWarningModal) {
    return;
  }

  const escapeHtml = window.VOXLIS_UTILS.escapeHtml;

  function closeCardWarningModal({ immediate = false } = {}) {
    const modal = document.getElementById("moreInfoModal");
    if (!modal || modal.hidden || !modal.classList.contains("is-warning-prompt")) {
      return;
    }

    window.requestCloseMoreInfoModal?.({ immediate });
  }

  const openCardWarningModal = (warningConfig, action) => {
    if (typeof window.openMoreInfoModal !== "function") {
      return false;
    }

    const description = String(warningConfig?.description || "").trim();
    const title = String(warningConfig?.title || "Warning").trim() || "Warning";
    const href = String(action?.href || "").trim();
    const target = action?.target == null ? "_blank" : String(action.target).trim();
    const variant = String(warningConfig?.variant || warningConfig?.type || "").trim().toLowerCase();
    const isInsecurePrompt = variant === "warningred";
    const warningMarkdown = [
      isInsecurePrompt ? "> [!INSECURE BORDER]" : "> [!WARN BORDER]",
      ...description.split(/\r?\n/).map((line) => `> ${escapeHtml(line)}`),
    ].join("\n");
    const normalizedHref =
      window.normalizeWebsiteTargetList?.(href)?.[0] ||
      href;

    if (!description || !normalizedHref) {
      return false;
    }

    return (
      window.openMoreInfoModal({
        title,
        contentMarkdown: warningMarkdown,
        websiteUrl: normalizedHref,
        websiteTarget: target,
        websiteLabel: "Press to continue",
        websiteIconClass: "",
        closeLabel: "Close",
        preserveTitle: true,
        modalVariant: isInsecurePrompt ? "insecure-prompt" : "warning-prompt",
        pushHistory: false,
      }) ?? false
    );
  };

  window.openCardWarningModal = openCardWarningModal;
  window.closeCardWarningModal = closeCardWarningModal;
})();
