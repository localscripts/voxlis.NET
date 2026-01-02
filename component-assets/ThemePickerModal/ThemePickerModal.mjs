import { fadeIn, fadeOut } from "/assets/js/fadeInOut.mjs";

const themeModal = document.getElementById("theme-modal");

const themeBackdrop = document.getElementById("theme-modal-backdrop");

const themeClose = document.getElementById("theme-modal-close");
const themeCancel = document.getElementById("theme-modal-cancel");

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

document.getElementById("theme-button").addEventListener("click", () => {
    pendingTheme = document.documentElement.dataset.theme || "red";
    sync()
    fadeIn(themeModal)
})

function close() {
    fadeOut(themeModal);
}

themeBackdrop.addEventListener("click", close);
themeClose.addEventListener("click", close);
themeCancel.addEventListener("click", close);

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

const themeButtons = document.querySelectorAll(".theme-option");
let pendingTheme = document.documentElement.dataset.theme || "red";

// sync button selection with the current actual theme
function sync() {
    themeButtons.forEach(btn => {
        btn.classList.toggle(
            "is-selected",
            btn.dataset.theme === pendingTheme
        );
    });
}

// select but dont apply the theme change yet
themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        pendingTheme = btn.dataset.theme;
        sync();
    });
});

// commits the actual theme
document.getElementById("theme-modal-apply").addEventListener("click", () => {
    document.documentElement.dataset.theme = pendingTheme;
    localStorage.setItem("voxlis-theme", pendingTheme);
    fadeOut(themeModal);
});

// cancel discards the pending theme
themeCancel.addEventListener("click", () => {
    pendingTheme = document.documentElement.dataset.theme;
    fadeOut(themeModal);
});

// restore the saved theme on page load
const savedTheme = localStorage.getItem("voxlis-theme");
if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}
