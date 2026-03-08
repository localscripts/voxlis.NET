const layer = document.getElementById("heart-layer")

function spawnHeart() {
	const heart = document.createElement("div")
	heart.className = "heart heart-img"

	const scale = 0.4 + Math.random() * 0.8

	heart.style.left = Math.random() * 100 + "%"
	heart.style.animationDuration = (90 + Math.random() * 60) + "s"
	heart.style.opacity = 0.05 + Math.random() * 0.5
	heart.style.setProperty("--scale", scale)
	heart.style.backgroundImage = `url(${getHeartSrc()})`

	layer.appendChild(heart)

	setTimeout(() => heart.remove(), 180000)
}

function getHeartSrc() {
	const theme = document.documentElement.dataset.theme || "red"
	return `/assets/img/hearts/heart.${theme}.svg`
}

// initial gentle fill
for (let i = 0; i < 20; i++) {
	setTimeout(spawnHeart, i * 800)
}

// then slowly add more
setInterval(spawnHeart, 7000)
