const fadeDuration = "duration-300"

export function fadeOut(el, callback) {
	el.classList.add("transition-opacity", fadeDuration);

	el.classList.add("opacity-0");
	setTimeout(() => {
		el.classList.add("hidden");
		if (callback) callback();
	}, 300);
}

export function fadeIn(el, callback) {
	el.classList.add("opacity-0", "transition-opacity", fadeDuration);

	el.classList.remove("hidden");

	setTimeout(() => {
		el.classList.remove("opacity-0");
		if (callback) setTimeout(callback, 290); // duration ms minus 10
	}, 10);
}

export function toggleHidden(el, state) {
	el.classList.toggle("hidden", state);
}

export function clearChildren(el) {
	while (el.firstChild) el.firstChild.remove();
}

export function daysToLabel(days) {
	if (days === -1) return "Lifetime";
	if (days === 1) return "1 day";
	return `${days} days`;
}