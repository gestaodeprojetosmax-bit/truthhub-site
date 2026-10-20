(() => {
  'use strict';
  if (window.TruthServiceStack) return;

  let controller = null;
  let enabled = true;
  const mobileQuery = '(max-width: 700px)';
  const motionQuery = '(prefers-reduced-motion: no-preference)';
  const step = 12;
  const gap = 32;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createController(grid) {
    const cards = Array.from(grid.querySelectorAll(':scope > .solution-card'));
    if (cards.length < 2 || !window.IntersectionObserver || !window.requestAnimationFrame) return null;

    const header = document.querySelector('.site-header');
    const adminBar = document.querySelector('#wpadminbar');
    const mobile = window.matchMedia(mobileQuery);
    const motion = window.matchMedia(motionQuery);
    const landscape = window.matchMedia('(orientation: landscape)');
    const viewport = window.visualViewport;
    const events = [];
    const mediaEvents = [];
    let mode = 'off';
    let layout = null;
    let near = false;
    let running = false;
    let frame = 0;
    let layoutFrame = 0;
    let focusFrame = 0;
    let destroyed = false;
    let nearObserver = null;
    let revealObserver = null;
    let resizeObserver = null;
    const scales = cards.map(() => '1');

    function listen(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      events.push(() => target.removeEventListener(type, handler, options));
    }

    function listenMedia(query) {
      if (query.addEventListener) {
        query.addEventListener('change', scheduleLayout);
        mediaEvents.push(() => query.removeEventListener('change', scheduleLayout));
      } else {
        query.addListener(scheduleLayout);
        mediaEvents.push(() => query.removeListener(scheduleLayout));
      }
    }

    function resetScales() {
      cards.forEach((card, index) => {
        card.style.removeProperty('--service-stack-scale');
        scales[index] = '1';
      });
    }

    function render() {
      frame = 0;
      if (destroyed || mode !== 'stack' || !near || !layout) return;
      // Read every box before writing any transform variable.
      const boxes = cards.map(card => card.getBoundingClientRect());
      const travel = Math.min(240, layout.viewportHeight * .28);
      const nextScales = cards.map((card, index) => {
        if (index === cards.length - 1) return '1';
        const nextPin = layout.top + (index + 1) * step;
        const progress = clamp((nextPin + travel - boxes[index + 1].top) / travel, 0, 1);
        return (1 - .04 * progress).toFixed(4);
      });
      nextScales.forEach((value, index) => {
        if (value === scales[index]) return;
        cards[index].style.setProperty('--service-stack-scale', value);
        scales[index] = value;
      });
    }

    function scheduleRender() {
      if (!frame && !destroyed) frame = window.requestAnimationFrame(render);
    }

    function setRunning(value) {
      if (running === value) return;
      running = value;
      grid.classList.toggle('service-stack-in-view', value);
      if (value) {
        window.addEventListener('scroll', scheduleRender, { passive: true });
        scheduleRender();
      } else {
        window.removeEventListener('scroll', scheduleRender);
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        resetScales();
      }
    }

    function clearMode() {
      setRunning(false);
      nearObserver?.disconnect();
      revealObserver?.disconnect();
      nearObserver = null;
      revealObserver = null;
      near = false;
      grid.classList.remove('service-stack-active', 'service-stack-in-view', 'service-stack-reveal');
      ['top', 'tail', 'gap', 'step'].forEach(name => grid.style.removeProperty('--service-stack-' + name));
      cards.forEach(card => {
        card.classList.remove('service-stack-revealed');
        card.style.removeProperty('--service-stack-index');
      });
      resetScales();
    }

    function enableStack() {
      cards.forEach((card, index) => card.style.setProperty('--service-stack-index', String(index)));
      grid.classList.add('service-stack-active');
      nearObserver = new IntersectionObserver(entries => {
        if (destroyed || mode !== 'stack') return;
        near = entries.some(entry => entry.isIntersecting);
        setRunning(near);
      }, { rootMargin: '150% 0px 150% 0px', threshold: 0 });
      nearObserver.observe(grid);
    }

    function enableReveal() {
      grid.classList.add('service-stack-reveal');
      revealObserver = new IntersectionObserver(entries => {
        if (destroyed || mode !== 'reveal') return;
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('service-stack-revealed');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: .025 });
      cards.forEach(card => revealObserver.observe(card));
    }

    function measureLayout() {
      layoutFrame = 0;
      if (destroyed) return;
      // The layout heights are unaffected by the visual scale applied on scroll.
      const heights = cards.map(card => card.offsetHeight);
      const headerBox = header?.getBoundingClientRect();
      const adminBox = adminBar?.getBoundingClientRect();
      const headerTop = header ? Math.max(0, parseFloat(getComputedStyle(header).top) || 0) : 0;
      const headerBottom = headerBox ? headerBox.height + headerTop : 75;
      const adminFixed = adminBar && getComputedStyle(adminBar).position === 'fixed';
      const adminBottom = adminFixed && adminBox ? Math.max(0, adminBox.bottom) : 0;
      const top = Math.ceil(Math.max(0, headerBottom, adminBottom) + 10);
      const viewportHeight = Math.min(window.innerHeight, viewport?.height || window.innerHeight);
      const zoomed = !!viewport && Math.abs(viewport.scale - 1) > .01;
      const neededHeight = Math.max(...heights) + top + (cards.length - 1) * step + 28;
      const canEnhance = mobile.matches && motion.matches;
      const canStack = canEnhance && !landscape.matches && !zoomed &&
        window.CSS?.supports('position', 'sticky') && viewportHeight >= neededHeight;
      const nextMode = canStack ? 'stack' : canEnhance ? 'reveal' : 'off';
      let total = 0;
      const offsets = heights.map(height => { const offset = total; total += height + gap; return offset; });
      layout = { top, viewportHeight, heights, offsets };

      if (nextMode !== mode) {
        clearMode();
        mode = nextMode;
        if (mode === 'stack') enableStack();
        if (mode === 'reveal') enableReveal();
      }
      if (mode === 'stack') {
        grid.style.setProperty('--service-stack-top', top + 'px');
        grid.style.setProperty('--service-stack-step', step + 'px');
        grid.style.setProperty('--service-stack-gap', gap + 'px');
        grid.style.setProperty('--service-stack-tail', Math.round(Math.min(140, viewportHeight * .16)) + 'px');
        if (near) scheduleRender();
      }
    }

    function scheduleLayout() {
      if (!layoutFrame && !destroyed) layoutFrame = window.requestAnimationFrame(measureLayout);
    }

    function revealFocusedCard(event) {
      if (mode !== 'stack' || !layout) return;
      const card = event.target.closest('.solution-card');
      const index = cards.indexOf(card);
      if (index < 0) return;
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
      focusFrame = window.requestAnimationFrame(() => {
        focusFrame = 0;
        if (destroyed || mode !== 'stack' || !card.contains(document.activeElement)) return;
        const focusedBox = document.activeElement.getBoundingClientRect();
        const cardBoxes = cards.map(item => item.getBoundingClientRect());
        const gridBox = grid.getBoundingClientRect();
        const pin = layout.top + index * step;
        const covered = cardBoxes.some((box, nextIndex) => nextIndex > index &&
          box.top < focusedBox.bottom + 8 && box.bottom > focusedBox.top - 8);
        const outOfView = focusedBox.top < pin + 6 || focusedBox.bottom > layout.viewportHeight - 12;
        if (!covered && !outOfView) return;
        // Native scrolling only: focus stays on the same link and the card's full
        // natural reading position is restored before any following card overlaps it.
        const target = Math.max(0, window.scrollY + gridBox.top + layout.offsets[index] - pin);
        window.scrollTo({ top: target, behavior: 'instant' });
        scheduleRender();
      });
    }

    listen(window, 'resize', scheduleLayout, { passive: true });
    if (viewport) listen(viewport, 'resize', scheduleLayout, { passive: true });
    listen(grid, 'focusin', revealFocusedCard);
    listenMedia(mobile);
    listenMedia(motion);
    listenMedia(landscape);
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(scheduleLayout);
      cards.forEach(card => resizeObserver.observe(card));
      if (header) resizeObserver.observe(header);
    }
    document.fonts?.ready.then(() => { if (!destroyed) scheduleLayout(); });
    measureLayout();

    return {
      refresh: scheduleLayout,
      get mode() { return mode; },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        clearMode();
        mode = 'off';
        resizeObserver?.disconnect();
        events.forEach(remove => remove());
        mediaEvents.forEach(remove => remove());
        if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
        if (focusFrame) window.cancelAnimationFrame(focusFrame);
        layoutFrame = focusFrame = 0;
      }
    };
  }

  function mount() {
    if (!enabled || controller) return;
    const grid = document.querySelector('#solucoes .solutions-grid');
    if (grid) controller = createController(grid);
  }
  function unmount() {
    controller?.destroy();
    controller = null;
  }
  window.TruthServiceStack = {
    init() { enabled = true; mount(); },
    refresh() { controller?.refresh(); },
    destroy() { enabled = false; unmount(); },
    get mode() { return controller?.mode || 'off'; }
  };
  window.addEventListener('pagehide', unmount);
  window.addEventListener('pageshow', mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
