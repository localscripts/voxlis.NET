function update() {
    const theme = document.documentElement.dataset.theme || "red";
    document.querySelectorAll(".sponsored-image").forEach(img => {
        img.src = `/assets/ads/voxlis.${theme}.big.png`;
    });
}

document.addEventListener("DOMContentLoaded", update);

const observer = new MutationObserver(update);
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
});
