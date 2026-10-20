(() => {
  'use strict';
  const hero=document.querySelector('.hero-art');
  const articles=[...document.querySelectorAll('.diagnostic-deliverables>article')];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroObserver,deliveryObserver,heroTimer=0;
  function finishHero(){
    clearTimeout(heroTimer);heroTimer=0;heroObserver?.disconnect();
    if(hero){hero.classList.remove('hero-motion-playing');hero.classList.add('hero-motion-complete');hero.dataset.heroMotion='complete';}
  }
  function finishDeliveries(){
    deliveryObserver?.disconnect();articles.forEach(article=>{article.classList.add('is-entered');article.dataset.deliveryMotion='complete';});
  }
  function finish(){finishHero();finishDeliveries();}
  if(reduced.matches||!window.IntersectionObserver){finish();return;}
  if(hero){
    hero.classList.add('hero-motion-ready');hero.dataset.heroMotion='ready';
    heroObserver=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting)||document.hidden)return;
      heroObserver.disconnect();hero.classList.add('hero-motion-playing');hero.dataset.heroMotion='playing';heroTimer=setTimeout(finishHero,2400);
    },{threshold:.25});
    heroObserver.observe(hero.querySelector('.orbit-scene')||hero);
  }
  if(articles.length){
    articles.forEach((article,index)=>{article.classList.add('delivery-motion-ready');article.style.setProperty('--delivery-delay',`${index*65}ms`);article.dataset.deliveryMotion='ready';});
    deliveryObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('is-entered');entry.target.dataset.deliveryMotion='complete';deliveryObserver.unobserve(entry.target);});
      if(articles.every(article=>article.dataset.deliveryMotion==='complete'))deliveryObserver.disconnect();
    },{threshold:.15,rootMargin:'0px 0px -4% 0px'});
    articles.forEach(article=>deliveryObserver.observe(article));
  }
  reduced.addEventListener('change',event=>{if(event.matches)finish();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&hero?.dataset.heroMotion==='playing')finishHero();});
  window.addEventListener('pagehide',finish,{once:true});
})();
