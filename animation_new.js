(function () {
  'use strict';

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Module-scope list of squares so the parallax/recycle loop can reach them.
  var squares = [];

  function generateSquares() {
    var container = document.querySelector('.bg-squares');
    if (!container) return;
    squares = [];

    var w = window.innerWidth;
    var vh = window.innerHeight;
    // A starfield of boxes — wide range of sizes, plenty of them
    var count = w < 600 ? 40 : w < 1000 ? 50 : 70;

    for (var i = 0; i < count; i++) {
      // Parallax wrapper handles scroll-driven translation
      var wrap = document.createElement('div');
      wrap.className = 'square-wrap';

      // Inner square handles idle animation (rotate, drift, fade)
      var sq = document.createElement('div');
      sq.className = 'square';

      // Color mix: ~50% green, ~30% warm coral, ~20% neutral (border-trace)
      var tint = Math.random();
      if (tint < 0.50) sq.classList.add('tint-green');
      else if (tint < 0.80) sq.classList.add('tint-warm');

      // Size buckets — most small ("stars"), some medium, few large.
      // Parallax factor goes with size: large = close (moves with content),
      // small = distant (barely shifts).
      var sizeRoll = Math.random();
      var size, parallax;
      if (sizeRoll < 0.55) {
        size = rand(10, 40);                 // tiny twinklers (far)
        parallax = rand(0.03, 0.12);
        sq.classList.add('small');
      } else if (sizeRoll < 0.85) {
        size = rand(50, 140);                // medium
        parallax = rand(0.28, 0.5);
      } else {
        size = rand(160, 320);               // large drifters (near)
        parallax = rand(0.7, 0.95);
      }

      // Smaller squares twinkle faster; larger ones move slower
      var drift = size < 50 ? rand(35, 70) : rand(50, 100);
      var fade = size < 50 ? rand(4, 9) : size < 150 ? rand(10, 18) : rand(14, 24);
      var rotCycle = size < 50 ? rand(60, 120) : rand(80, 160);
      var rotDir = Math.random() < 0.5 ? '360deg' : '-360deg';

      // Size + position on the wrapper (parallax acts on the wrapper).
      // Place squares uniformly around the viewport in pixel units; as the
      // user scrolls, squares that drift off one edge are recycled to the
      // other edge so density stays uniform for any scroll distance.
      var topPx = rand(-0.1, 1.1) * vh;
      wrap.style.width = size + 'px';
      wrap.style.height = size + 'px';
      wrap.style.left = rand(-6, 100) + '%';
      wrap.style.top = topPx + 'px';
      wrap.style.setProperty('--parallax-factor', parallax.toFixed(3));

      // Idle animation parameters on the inner square
      sq.style.setProperty('--dur', drift + 's');
      sq.style.setProperty('--dur-fade', fade + 's');
      sq.style.setProperty('--dur-rot', rotCycle + 's');
      sq.style.setProperty('--rot-start', rand(0, 360).toFixed(1) + 'deg');
      sq.style.setProperty('--rot-dir', rotDir);
      sq.style.setProperty('--dx', rand(-70, 70).toFixed(1) + 'px');
      sq.style.setProperty('--dy', rand(-80, 80).toFixed(1) + 'px');

      sq.style.animationDelay =
        '-' + rand(0, rotCycle).toFixed(1) + 's, ' +
        '-' + rand(0, drift).toFixed(1) + 's, ' +
        '-' + rand(0, fade).toFixed(1) + 's';

      wrap.appendChild(sq);
      container.appendChild(wrap);

      squares.push({
        wrap: wrap,
        topPx: topPx,
        size: size,
        factor: parallax
      });
    }
  }

  // Recycle squares that have parallaxed off the visible area. When a square's
  // effective viewport position goes far enough above the viewport, shift its
  // base position down by (viewport + size + buffer) so it re-emerges from
  // below. Same in reverse for upward scrolling. Density stays uniform.
  function recycleSquares(scrollY) {
    var vh = window.innerHeight;
    var margin = 80;
    for (var i = 0; i < squares.length; i++) {
      var sq = squares[i];
      // Small squares barely move with parallax — skip the work for them
      if (sq.factor < 0.15) continue;

      var visualTop = sq.topPx - scrollY * sq.factor;
      var cycle = vh + 2 * sq.size + 2 * margin;

      if (visualTop < -(sq.size + margin)) {
        sq.topPx += cycle;
        sq.wrap.style.top = sq.topPx + 'px';
      } else if (visualTop > vh + margin) {
        sq.topPx -= cycle;
        sq.wrap.style.top = sq.topPx + 'px';
      }
    }
  }

  // Scroll-driven parallax. Sets --scroll-y on the root; each wrapper
  // translates by --scroll-y * --parallax-factor (negated, so boxes shift
  // up as the page scrolls down — large boxes ride the content closely,
  // small boxes barely move).
  function setupParallax() {
    var content = document.querySelector('.content');
    var root = document.documentElement;
    var ticking = false;
    var lastY = 0;

    function commit() {
      root.style.setProperty('--scroll-y', lastY + 'px');
      recycleSquares(lastY);
      ticking = false;
    }

    function request() {
      if (!ticking) {
        requestAnimationFrame(commit);
        ticking = true;
      }
    }

    function onContentScroll() {
      lastY = content.scrollTop;
      request();
    }

    function onWindowScroll() {
      // Used on mobile, where the body scrolls instead of .content
      lastY = window.scrollY || window.pageYOffset || 0;
      request();
    }

    if (content) content.addEventListener('scroll', onContentScroll, { passive: true });
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    // Prime initial value
    commit();
  }

  function setupMenuToggle() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Make publication rows clickable — clicking anywhere on the row
  // (except on another link) opens the title link.
  function setupRowClicks() {
    var rows = document.querySelectorAll('.publications article');
    rows.forEach(function (art) {
      var titleLink = art.querySelector('.text > a[href]');
      if (!titleLink) return;

      art.addEventListener('click', function (e) {
        // If the click landed on any link (the title link itself, or one of
        // the nav links below), let the browser handle it normally.
        if (e.target.closest('a')) return;

        var href = titleLink.getAttribute('href');
        var target = titleLink.getAttribute('target');
        if (target === '_blank') {
          window.open(href, '_blank', 'noopener');
        } else {
          window.location.href = href;
        }
      });
    });
  }

  // Forward wheel events from anywhere on the page (sidebar, gutters,
  // background) to the .content box. Only active on desktop, where .content
  // is the scroll container; on mobile the body scrolls naturally.
  function setupWheelForwarding() {
    var content = document.querySelector('.content');
    if (!content) return;

    window.addEventListener('wheel', function (e) {
      // On mobile the page itself scrolls — leave wheel handling to the browser
      if (window.innerWidth <= 820) return;

      // If the wheel target is already inside .content, let native scroll handle it
      if (content.contains(e.target)) return;

      // If the wheel landed inside the sidebar AND the sidebar has its own
      // overflow (rare — only on short viewports), let it scroll natively
      var sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar.contains(e.target) &&
          sidebar.scrollHeight > sidebar.clientHeight + 1) {
        return;
      }

      // Forward the wheel delta to the content box
      e.preventDefault();
      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;        // line mode (Firefox)
      else if (e.deltaMode === 2) delta *= 800;  // page mode
      content.scrollTop += delta;
    }, { passive: false });
  }

  function init() {
    generateSquares();
    setupMenuToggle();
    setupRowClicks();
    setupParallax();
    setupWheelForwarding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
