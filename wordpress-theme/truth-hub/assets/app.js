(() => {
  document.querySelectorAll('[data-wa]').forEach(link => {
    link.href = 'https://wa.me/5512991057907?text=' + encodeURIComponent(link.dataset.wa);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (toggle && nav) {
    const close = () => { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menu'); nav.classList.remove('is-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu'); nav.classList.toggle('is-open',open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click',close));
    document.addEventListener('keydown',event => { if(event.key==='Escape' && toggle.getAttribute('aria-expanded')==='true') { close(); toggle.focus(); } });
    document.addEventListener('click',event => { if(!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
    window.matchMedia('(min-width: 701px)').addEventListener('change',close);
  }
})();
