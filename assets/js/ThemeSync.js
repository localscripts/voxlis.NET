function updateAds(theme) {
    document.querySelectorAll(".sponsored-image").forEach(img => {
        img.src = `/assets/ads/voxlis.${theme}.big.png`;
    });
}

function updateLogos(theme) {
    document.querySelectorAll(".voxlis-logo").forEach(img => {
        img.src = `/assets/branding/voxlis.${theme}.png`;
    });
}

function updateHearts(theme) {
    const src = `/assets/img/hearts/heart.${theme}.svg`;
    document.querySelectorAll(".heart-img").forEach(img => {
        img.src = src;
        img.style.backgroundImage = `url(${src})`
    });
}

function updateAll() {
    const theme = document.documentElement.dataset.theme || "red";
    updateAds(theme);
    updateLogos(theme);
    updateHearts(theme);
}

document.addEventListener("DOMContentLoaded", updateAll);

const observer = new MutationObserver(updateAll);
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
});