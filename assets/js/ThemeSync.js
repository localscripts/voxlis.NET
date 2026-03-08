// TODO: many of these can be easily changed to regular CSS with data attributes
// instead of manually doing this through JS
// apart from the favicon I think, which still requires JS

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

const favicon = document.querySelector("link[rel~='icon']");
function updatePageIcon(theme) {
	favicon.href = `/assets/img/hearts/heart.${theme}.svg`;
}

function updateAll() {
	const theme = document.documentElement.dataset.theme || "red";
	updateAds(theme);
	updateLogos(theme);
	updateHearts(theme);
	updatePageIcon(theme);
}

document.addEventListener("DOMContentLoaded", updateAll);

const observer = new MutationObserver(updateAll);
observer.observe(document.documentElement, {
	attributes: true,
	attributeFilter: ["data-theme"],
});