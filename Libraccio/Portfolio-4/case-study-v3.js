/* Libraccio case study v3 — scroll progress, gentle reveals, count-up, chapter rail */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Top scroll progress bar ---- */
  var bar = document.querySelector('.progress');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Count-up for stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduce) { el.childNodes[0].nodeValue = String(target); return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.childNodes[0].nodeValue = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var stats = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { sio.observe(el); });
  } else {
    stats.forEach(countUp);
  }

  /* ---- Spine: full-height line + node markers anchored to each section ---- */
  var spine = document.querySelector('.spine');
  var spineLine = document.querySelector('.spine-line');
  var snodes = Array.prototype.slice.call(document.querySelectorAll('.spine a'));
  var secs = snodes.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var footer = document.querySelector('footer');

  function spineLayout() {
    if (!spine) return;
    secs.forEach(function (s, i) {
      if (s) snodes[i].style.top = (s.offsetTop + 88) + 'px';
    });
    if (spineLine) spineLine.style.height = (footer ? footer.offsetTop : document.body.scrollHeight) + 'px';
  }
  function spineState() {
    if (!spine) return;
    var h = document.documentElement;
    var mid = (h.scrollTop || document.body.scrollTop) + h.clientHeight * 0.42;
    var current = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= mid) current = i; });
    snodes.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      a.classList.toggle('passed', i < current);
    });
  }
  window.addEventListener('scroll', spineState, { passive: true });
  window.addEventListener('resize', function () { spineLayout(); spineState(); });
  window.addEventListener('load', function () { spineLayout(); spineState(); });
  spineLayout();
  spineState();
})();
