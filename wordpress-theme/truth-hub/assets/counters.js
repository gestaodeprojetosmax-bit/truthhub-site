/* Progressive enhancement for the nine institutional indicators. */
(() => {
  'use strict';
  const targets = [...document.querySelectorAll('.metric > strong, .about-stats strong, .case-result')];
  if (!targets.length) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const records = new Map();
  const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const duration = 1450;
  let observer;

  function finish(record) {
    if (record.frame) cancelAnimationFrame(record.frame);
    record.frame = 0;
    record.number.textContent = record.final;
    record.element.dataset.counterState = 'complete';
    observer?.unobserve(record.element);
    if ([...records.values()].every(item => item.element.dataset.counterState === 'complete')) {
      observer?.disconnect();
    }
  }

  function finishAll() {
    records.forEach(finish);
    observer?.disconnect();
  }

  function animate(record) {
    if (record.element.dataset.counterState !== 'ready') return;
    if (motion.matches || document.hidden) return finish(record);
    observer.unobserve(record.element);
    record.element.dataset.counterState = 'running';
    record.number.textContent = '0';
    const started = performance.now();
    function tick(now) {
      if (motion.matches || document.hidden) return finish(record);
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      record.number.textContent = format.format(Math.floor(record.target * eased));
      if (progress < 1) record.frame = requestAnimationFrame(tick);
      else finish(record);
    }
    record.frame = requestAnimationFrame(tick);
  }

  // Override broad existing descendant-span rules only on new wrappers.
  // Existing suffix spans remain untouched, preserving their original styling.
  function textSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.setAttribute('aria-hidden', 'true');
    Object.assign(span.style, {
      display: 'inline', font: 'inherit', color: 'inherit',
      letterSpacing: 'inherit', lineHeight: 'inherit',
      margin: '0', padding: '0', maxWidth: 'none', verticalAlign: 'baseline'
    });
    return span;
  }

  function setup() {
    const canAnimate = !motion.matches && !document.hidden && 'IntersectionObserver' in window;
    if (canAnimate) observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animate(records.get(entry.target));
      });
      if ([...records.values()].every(record => record.element.dataset.counterState === 'complete')) {
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    targets.forEach(element => {
      const originalLabel = element.textContent.replace(/\s+/g, ' ').trim();
      const numericNode = [...element.childNodes].find(node =>
        node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent)
      );
      if (!numericNode) return;
      const match = /\d[\d.]*/.exec(numericNode.textContent);
      if (!match) return;
      const target = Number(match[0].replace(/\./g, ''));
      if (!Number.isFinite(target) || target <= 0) return;
      const prefix = numericNode.textContent.slice(0, match.index);
      const suffix = numericNode.textContent.slice(match.index + match[0].length);
      const number = textSpan(match[0]);
      number.dataset.counterValue = '';
      number.style.display = 'inline-block';
      number.style.fontVariantNumeric = 'tabular-nums';
      number.style.textAlign = 'right';
      const fragment = document.createDocumentFragment();
      if (prefix) fragment.append(textSpan(prefix));
      fragment.append(number);
      if (suffix) fragment.append(textSpan(suffix));
      element.dataset.counterLabel = originalLabel;
      element.removeAttribute('aria-label');
      [...element.children].forEach(child => child.setAttribute('aria-hidden', 'true'));
      numericNode.replaceWith(fragment);
      // Measure the final figure after local fonts have loaded. Its reserved
      // width keeps prefixes and suffixes still during the entire animation.
      const numberFontSize = parseFloat(getComputedStyle(number).fontSize);
      number.style.minWidth = `${number.getBoundingClientRect().width / numberFontSize}em`;
      const accessibleLabel = document.createElement('span');
      accessibleLabel.textContent = originalLabel;
      accessibleLabel.setAttribute('aria-hidden', 'false');
      accessibleLabel.dataset.counterAccessibleLabel = '';
      Object.assign(accessibleLabel.style, {
        position: 'absolute', width: '1px', height: '1px', padding: '0',
        margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: '0'
      });
      element.append(accessibleLabel);
      element.dataset.counterTarget = String(target);
      element.dataset.counterState = canAnimate ? 'ready' : 'complete';
      const record = { element, number, target, final: match[0], frame: 0 };
      records.set(element, record);
      observer?.observe(element);
    });

    const reducedMotionChanged = event => { if (event.matches) finishAll(); };
    motion.addEventListener('change', reducedMotionChanged);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) finishAll();
    });
    window.addEventListener('pagehide', finishAll, { once: true });
  }

  // The original HTML stays fully visible while fonts load and if JS fails.
  if (document.fonts?.ready) document.fonts.ready.then(setup, setup);
  else setup();
})();
