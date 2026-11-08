// Muted loops play only while on screen, so a page of clips costs only what is seen.
// With reduced motion asked for, nothing plays by itself; each clip gets its controls.
(function () {
	var loops = document.querySelectorAll("video.loop");
	if (!loops.length) return;
	var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (still || !("IntersectionObserver" in window)) {
		loops.forEach(function (v) { v.controls = true; v.preload = "metadata"; });
		return;
	}
	var watch = new IntersectionObserver(function (seen) {
		seen.forEach(function (e) {
			if (e.isIntersecting) { var p = e.target.play(); if (p) p.catch(function () { e.target.controls = true; }); }
			else e.target.pause();
		});
	}, { threshold: 0.35 });
	loops.forEach(function (v) { watch.observe(v); });
})();
