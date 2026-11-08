// A native scroll rail with one matching set of cards on either side. At rest,
// move an edge copy back to its identical middle card so browsing can continue.
(function () {
	'use strict';
	var show = document.querySelector('.showcase');
	if (!show) return;
	var rail = show.querySelector('.rail');
	var games = Array.from(rail.querySelectorAll('.game'));
	var dots = Array.from(show.querySelectorAll('[data-to]'));
	var count = games.length;
	if (count < 2) return;
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	var current = -1;
	var target = null;
	var finishTimer;
	var scrollFrame;
	var pointerDown = false;
	var drag = null;
	var suppressClickUntil = 0;
	var userMoved = false;
	var normalizing = false;
	var mod = function (n) { return ((n % count) + count) % count; };
	var canAnimate = function () { return !reduced.matches && !document.body.classList.contains('motion-paused'); };

	games.forEach(function (game, i) { game.dataset.index = i; });
	function copy(game) {
		var clone = game.cloneNode(true);
		clone.removeAttribute('id');
		clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
		clone.dataset.clone = 'true';
		clone.setAttribute('aria-hidden', 'true');
		clone.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = -1; });
		return clone;
	}
	var before = document.createDocumentFragment();
	var after = document.createDocumentFragment();
	games.forEach(function (game) { before.append(copy(game)); after.append(copy(game)); });
	rail.prepend(before);
	rail.append(after);
	var items = Array.from(rail.querySelectorAll('.game'));
	show.classList.add('live');
	show.querySelector('.steer').hidden = false;

	function position(index) {
		return items[index].offsetLeft - (rail.clientWidth - items[index].offsetWidth) / 2;
	}
	function nearest() {
		var middle = rail.scrollLeft + rail.clientWidth / 2;
		var best = 0;
		var gap = Infinity;
		items.forEach(function (item, i) {
			var distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
			if (distance < gap) { gap = distance; best = i; }
		});
		return best;
	}
	function sync(index) {
		var logical = Number(items[index].dataset.index);
		if (logical === current) return;
		current = logical;
		items.forEach(function (item) {
			var active = Number(item.dataset.index) === current;
			item.classList.toggle('is-current', active);
			if (item.dataset.clone) return;
			if (active) item.removeAttribute('aria-hidden');
			else item.setAttribute('aria-hidden', 'true');
			item.querySelectorAll('a').forEach(function (link) { link.tabIndex = active ? 0 : -1; });
		});
		dots.forEach(function (dot, i) { dot.setAttribute('aria-current', i === current ? 'true' : 'false'); });
		show.querySelector('.current-count').textContent = String(current + 1).padStart(2, '0');
		show.style.setProperty('--glow', getComputedStyle(games[current]).getPropertyValue('--p'));
		if (userMoved) show.querySelector('.rail-announcement').textContent = games[current].getAttribute('aria-label');
		var focused = document.activeElement;
		if (focused && games.some(function (g, i) { return i !== current && g.contains(focused); })) rail.focus({ preventScroll: true });
	}
	function jump(index) {
		normalizing = true;
		rail.classList.add('is-snapping');
		rail.scrollTo({ left: position(index), behavior: 'instant' });
		sync(index);
		requestAnimationFrame(function () {
			rail.classList.remove('is-snapping');
			normalizing = false;
		});
	}
	function finish() {
		if (pointerDown || normalizing) return;
		var index = nearest();
		// Smooth scrolling may still be running when a scrollend event from an
		// earlier movement arrives. Only normalize after the requested card arrives.
		if (target !== null && Math.abs(rail.scrollLeft - position(target)) > 2) return;
		target = null;
		sync(index);
		if (Math.abs(rail.scrollLeft - position(index)) > 2) { choose(index, true); return; }
		if (index < count || index >= count * 2) jump(count + mod(index));
	}
	function choose(index, smooth) {
		if (index < 0 || index >= items.length) {
			var base = target === null ? nearest() : target;
			var direction = index > base ? 1 : -1;
			base = count + mod(base);
			jump(base);
			index = base + direction;
		}
		target = index;
		userMoved = true;
		rail.scrollTo({ left: position(index), behavior: smooth && canAnimate() ? 'smooth' : 'instant' });
		clearTimeout(finishTimer);
		finishTimer = setTimeout(finish, 180);
	}
	function move(direction) { choose((target === null ? nearest() : target) + direction, true); }
	function chooseGame(logical, smooth) {
		var base = target === null ? nearest() : target;
		var delta = mod(logical - mod(base));
		if (delta > count / 2) delta -= count;
		choose(base + delta, smooth);
	}
	rail.addEventListener('scroll', function () {
		if (!scrollFrame) scrollFrame = requestAnimationFrame(function () { scrollFrame = null; sync(nearest()); });
		clearTimeout(finishTimer);
		finishTimer = setTimeout(finish, 160);
	}, { passive: true });
	rail.addEventListener('scrollend', finish);
	rail.addEventListener('wheel', function () { target = null; userMoved = true; }, { passive: true });
	show.querySelectorAll('[data-step]').forEach(function (button) {
		button.addEventListener('click', function () { move(Number(button.dataset.step)); });
	});
	dots.forEach(function (button, i) { button.addEventListener('click', function () { chooseGame(i, true); }); });
	rail.addEventListener('keydown', function (event) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			move(event.key === 'ArrowRight' ? 1 : -1);
		}
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			chooseGame(event.key === 'Home' ? 0 : count - 1, true);
		}
	});
	rail.addEventListener('click', function (event) {
		var card = event.target.closest('.game');
		if (!card) return;
		if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
		if (Number(card.dataset.index) !== current || card.dataset.clone) {
			event.preventDefault();
			choose(items.indexOf(card), true);
		}
	});
	rail.addEventListener('dragstart', function (event) { event.preventDefault(); });
	rail.addEventListener('pointerdown', function (event) {
		if (!event.isPrimary || event.button !== 0) return;
		pointerDown = true;
		target = null;
		userMoved = true;
		if (event.pointerType === 'mouse') drag = { x: event.clientX, left: rail.scrollLeft, active: false, id: event.pointerId };
	});
	rail.addEventListener('pointermove', function (event) {
		if (!drag || event.pointerId !== drag.id) return;
		var delta = event.clientX - drag.x;
		if (!drag.active && Math.abs(delta) > 8) {
			drag.active = true;
			rail.classList.add('is-dragging');
			rail.setPointerCapture(event.pointerId);
		}
		if (drag.active) { event.preventDefault(); rail.scrollLeft = drag.left - delta; }
	});
	function endPointer(event) {
		if (!pointerDown) return;
		pointerDown = false;
		if (drag && drag.active) {
			suppressClickUntil = performance.now() + 350;
			rail.classList.remove('is-dragging');
			if (rail.hasPointerCapture(drag.id)) rail.releasePointerCapture(drag.id);
			choose(nearest(), true);
		}
		drag = null;
		clearTimeout(finishTimer);
		finishTimer = setTimeout(finish, 180);
	}
	window.addEventListener('pointerup', endPointer);
	window.addEventListener('pointercancel', endPointer);

	function hashGame() { return games.findIndex(function (game) { return '#' + game.id === location.hash; }); }
	document.querySelectorAll('.world[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			var index = games.findIndex(function (game) { return '#' + game.id === link.hash; });
			if (index < 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			history.pushState(null, '', link.hash);
			jump(count + index);
			target = null;
			userMoved = true;
			show.scrollIntoView({ behavior: canAnimate() ? 'smooth' : 'instant', block: 'start' });
			rail.focus({ preventScroll: true });
		});
	});
	window.addEventListener('hashchange', function () {
		var index = hashGame();
		if (index >= 0) { target = null; jump(count + index); }
	});
	var initial = hashGame();
	jump(count + (initial >= 0 ? initial : 1));
	// Height-only changes (including browser chrome on phones) can also reset
	// a scroll container during relayout. Keep the selected game in the middle.
	window.addEventListener('resize', function () {
		target = null;
		jump(count + current);
	});
})();
