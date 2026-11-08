// Decorative homepage motion. No tracking, external requests, or stored preferences.
(function () {
	'use strict';
	var body = document.body;
	var opening = document.querySelector('.opening');
	var worlds = document.querySelector('.worlds');
	var button = document.querySelector('.motion-toggle');
	if (!opening || !worlds || !button) return;
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	var finePointer = window.matchMedia('(pointer: fine)');
	var paused = false;
	var frame = null;
	var animations = [];
	function enabled() { return !paused && !reduced.matches && !document.hidden; }
	function resetLook() { worlds.style.setProperty('--look-x', '0px'); worlds.style.setProperty('--look-y', '0px'); }
	function updateMotion() {
		body.classList.toggle('motion-ready', !reduced.matches);
		body.classList.toggle('motion-paused', paused || reduced.matches);
		button.disabled = reduced.matches;
		button.setAttribute('aria-pressed', String(paused || reduced.matches));
		button.querySelector('span').textContent = reduced.matches ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion';
		animations.forEach(function (animation) {
			if (reduced.matches) animation.finish();
			else if (paused) animation.pause();
			else animation.play();
		});
		if (!enabled()) resetLook();
	}
	button.hidden = false;
	button.addEventListener('click', function () { paused = !paused; updateMotion(); });
	reduced.addEventListener('change', updateMotion);
	updateMotion();
	opening.addEventListener('pointermove', function (event) {
		if (!enabled() || !finePointer.matches || frame) return;
		frame = requestAnimationFrame(function () {
			frame = null;
			if (!enabled()) return;
			var rect = opening.getBoundingClientRect();
			worlds.style.setProperty('--look-x', ((event.clientX - rect.left) / rect.width - .5) * 12 + 'px');
			worlds.style.setProperty('--look-y', ((event.clientY - rect.top) / rect.height - .5) * 10 + 'px');
		});
	});
	opening.addEventListener('pointerleave', resetLook);
	document.addEventListener('visibilitychange', function () { body.classList.toggle('page-hidden', document.hidden); });
	body.classList.toggle('page-hidden', document.hidden);
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			body.classList.toggle('opening-away', !entries[0].isIntersecting);
		}, { threshold: 0 }).observe(opening);
		var reveal = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				reveal.unobserve(entry.target);
				if (!enabled()) return;
				var animation = entry.target.animate([{ opacity: .25, transform: 'translateY(25px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.2,.7,.25,1)' });
				animations.push(animation);
				animation.finished.then(function () { animations = animations.filter(function (item) { return item !== animation; }); });
			});
		}, { threshold: .12 });
		document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
	}
	document.querySelectorAll('a[href="#our-games"], a[href="#main"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
			var destination = document.querySelector(link.hash);
			if (!destination) return;
			event.preventDefault();
			history.pushState(null, '', link.hash);
			destination.scrollIntoView({ behavior: enabled() ? 'smooth' : 'instant' });
			destination.setAttribute('tabindex', '-1');
			destination.focus({ preventScroll: true });
		});
	});
})();
