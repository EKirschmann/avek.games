// The home page rail: whichever game sits nearest the middle is the one in focus, and its
// accent tints the light behind it. Arrows, dots, arrow keys and a tap on a faded neighbour
// all bring a game to the middle. Without this script the rail is a plain swipeable row.
(function () {
	var show = document.querySelector(".showcase");
	if (!show) return;
	var rail = show.querySelector(".rail");
	var games = Array.prototype.slice.call(rail.querySelectorAll(".game"));
	var dots = Array.prototype.slice.call(show.querySelectorAll(".dots button"));
	var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var current = -1;

	show.classList.add("live");
	show.querySelector(".steer").hidden = false;

	function centre(i, smooth) {
		var g = games[Math.max(0, Math.min(games.length - 1, i))];
		rail.scrollTo({ left: g.offsetLeft - (rail.clientWidth - g.offsetWidth) / 2, behavior: smooth && !still ? "smooth" : "auto" });
	}

	function settle() {
		var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, gap = Infinity;
		games.forEach(function (g, i) {
			var d = Math.abs(g.offsetLeft + g.offsetWidth / 2 - mid);
			if (d < gap) { gap = d; best = i; }
		});
		if (best === current) return;
		current = best;
		games.forEach(function (g, i) {
			var on = i === best;
			g.classList.toggle("is-current", on);
			// Links in a faded neighbour stay out of the tab order until it is in the middle.
			g.querySelectorAll(".about a").forEach(function (a) { a.tabIndex = on ? 0 : -1; });
		});
		dots.forEach(function (d, i) { d.setAttribute("aria-current", i === best ? "true" : "false"); });
		show.style.setProperty("--glow", getComputedStyle(games[best]).getPropertyValue("--p"));
	}

	var queued = false;
	rail.addEventListener("scroll", function () {
		if (queued) return;
		queued = true;
		requestAnimationFrame(function () { queued = false; settle(); });
	}, { passive: true });
	window.addEventListener("resize", function () { centre(current, false); });

	show.querySelectorAll("[data-step]").forEach(function (b) {
		b.addEventListener("click", function () { centre(current + Number(b.dataset.step), true); });
	});
	dots.forEach(function (d) {
		d.addEventListener("click", function () { centre(Number(d.dataset.to), true); });
	});
	games.forEach(function (g, i) {
		g.addEventListener("click", function (e) {
			if (i === current) return;
			e.preventDefault();
			centre(i, true);
		});
	});
	rail.addEventListener("keydown", function (e) {
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			e.preventDefault();
			centre(current + (e.key === "ArrowRight" ? 1 : -1), true);
		}
	});

	// Open on the middle game so both neighbours show, or on the one a link named.
	var named = games.findIndex(function (g) { return "#" + g.id === location.hash; });
	centre(named >= 0 ? named : 1, false);
	settle();
})();
