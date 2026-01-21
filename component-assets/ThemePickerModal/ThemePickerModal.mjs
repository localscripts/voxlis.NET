import { fadeIn, fadeOut } from "/assets/js/Utilities.mjs";

const themeModal = document.getElementById("theme-modal");

const themeBackdrop = document.getElementById("theme-modal-backdrop");

const themeClose = document.getElementById("theme-modal-close");

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

document.getElementById("theme-button").addEventListener("click", () => {
    sync()
    fadeIn(themeModal)
})

function close() {
    fadeOut(themeModal);
}

themeBackdrop.addEventListener("click", close);
themeClose.addEventListener("click", close);

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

const themeButtons = document.querySelectorAll(".theme-option");

// sync button selection with the current actual theme
function sync() {
    const activeTheme = document.documentElement.dataset.theme || "red";

    themeButtons.forEach(btn => {
        btn.classList.toggle(
            "is-selected",
            btn.dataset.theme === activeTheme
        );
    });
}

// select but dont apply the theme change yet
themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const t = btn.dataset.theme

        document.documentElement.dataset.theme = t;
        localStorage.setItem("voxlis-theme", t);

        sync();
    });
});

// restore the saved theme on page load
const savedTheme = localStorage.getItem("voxlis-theme");
if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}
