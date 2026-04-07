(() => {
  const screen = document.getElementById("loading-screen");
  if (!screen) return;

  const dismiss = () => {
    screen.classList.add("is-hidden");
    screen.addEventListener("transitionend", () => screen.remove(), { once: true });
  };

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
