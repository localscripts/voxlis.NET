(() => {
  const screen = document.getElementById("loading-screen");
  if (!screen) return;

  const dismiss = () => {
    screen.classList.add("is-hidden");
    screen.addEventListener("transitionend", () => screen.remove(), { once: true });
  };

  // Check API for per-slug issues and render orange tags
  const statusTags = document.getElementById("loading-status-tags");
  if (statusTags) {
    fetch("https://api.voxlis.net/api/endpoints", { cache: "no-cache" })
      .then((r) => r.ok ? r.json() : null)
      .then((payload) => {
        if (!payload || typeof payload !== "object") return;

        const slugsWithIssues = [];

        Object.entries(payload).forEach(([slug, value]) => {
          if (!value || typeof value !== "object" || slug === "TEST") return;
          // Each value is { platform: { issues, updated } }
          const hasIssues = Object.values(value).some(
            (platformState) =>
              platformState && typeof platformState === "object" && platformState.issues === true
          );
          if (hasIssues) slugsWithIssues.push(slug);
        });

        slugsWithIssues.forEach((slug) => {
          const tag = document.createElement("span");
          tag.className = "loading-status-tag";
          tag.innerHTML = `<i class="fa-solid fa-tag"></i>${slug}`;
          statusTags.appendChild(tag);
        });
      })
      .catch(() => {});
  }

  // Show button after 2s
  const actions = screen.querySelector(".loading-actions");
  if (actions) setTimeout(() => actions.classList.add("is-visible"), 2000);

  // Skip once
  const skipBtn = screen.querySelector(".loading-skip-btn:not([data-skip-forever])");
  if (skipBtn) skipBtn.addEventListener("click", dismiss);

  // Auto-dismiss when app signals ready
  window.addEventListener("voxlis:app-ready", dismiss, { once: true });

  // Hard fallback
  const fallback = setTimeout(dismiss, 8000);
  window.addEventListener("voxlis:app-ready", () => clearTimeout(fallback), { once: true });
})();
