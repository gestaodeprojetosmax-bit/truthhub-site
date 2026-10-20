
(function(){
  const menuButton=document.querySelector('.menu-button');const nav=document.querySelector('.nav');
  if(menuButton&&nav){
    const close=()=>{menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menu');nav.classList.remove('is-open');document.body.classList.remove('menu-open')};
    menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open)});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    window.addEventListener('resize',()=>{if(window.innerWidth>900)close()});
  }
  const year=document.getElementById('year'); if(year)year.textContent=new Date().getFullYear();
  const header=document.querySelector('.header'); if(header){let r=false;const update=()=>{header.classList.toggle('scrolled',scrollY>24);r=false};addEventListener('scroll',()=>{if(!r){requestAnimationFrame(update);r=true}},{passive:true});update()}
})();

