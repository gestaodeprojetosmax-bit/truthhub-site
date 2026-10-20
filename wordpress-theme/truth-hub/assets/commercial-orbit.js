(() => {
  'use strict';
  if (window.TruthCommercialOrbit) return;
  const instances = new Map();
  let enabled = true;

  function create(root) {
    const stage = root.querySelector('[data-orbit-stage]');
    const items = Array.from(root.querySelectorAll('[data-orbit-item]'));
    const button = root.querySelector('[data-orbit-toggle]');
    const buttonLabel = root.querySelector('[data-orbit-toggle-label]');
    if (!stage || !items.length || !button || !window.IntersectionObserver) return null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let manualPause = false;
    let hovering = false;
    let focused = false;
    let frame = 0;
    let layoutFrame = 0;
    let lastTime = 0;
    let phase = -Math.PI / 2;
    let radiusX = 100;
    let radiusY = 101;
    let destroyed = false;
    const removers = [];
    function on(target,type,handler,options) {
      target.addEventListener(type,handler,options);
      removers.push(() => target.removeEventListener(type,handler,options));
    }
    function paint() {
      items.forEach((item,index) => {
        const angle = phase + index * Math.PI * 2 / items.length;
        const depth = Math.sin(angle);
        item.style.setProperty('--orbit-x',(Math.cos(angle)*radiusX).toFixed(2)+'px');
        item.style.setProperty('--orbit-y',(depth*radiusY).toFixed(2)+'px');
        item.style.setProperty('--orbit-z',(depth*23).toFixed(2)+'px');
        item.style.setProperty('--orbit-scale',(.98+depth*.035).toFixed(4));
      });
    }
    function tick(time) {
      frame = 0;
      if (destroyed || root.dataset.orbitState !== 'running') return;
      if (lastTime) phase += Math.min(64,time-lastTime) * Math.PI * 2 / 36000;
      lastTime = time;
      paint();
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (destroyed) return;
      const motionAllowed = !reduced.matches;
      const running = motionAllowed && visible && !document.hidden && !manualPause && !hovering && !focused;
      root.dataset.orbitState = !motionAllowed ? 'static' : running ? 'running' : 'paused';
      button.hidden = !motionAllowed;
      button.setAttribute('aria-pressed',String(manualPause));
      if (buttonLabel) buttonLabel.textContent = manualPause ? 'Retomar rotação' : 'Pausar rotação';
      button.querySelector('path')?.setAttribute('d',manualPause ? 'M5 3l7 5-7 5Z' : 'M5 3v10M11 3v10');
      items.forEach(item => { if(motionAllowed) item.tabIndex=0; else item.removeAttribute('tabindex'); });
      if (running) {
        if (!frame) { lastTime=0; frame=requestAnimationFrame(tick); }
      } else {
        if(frame) cancelAnimationFrame(frame);
        frame=0; lastTime=0;
      }
    }
    function measure() {
      layoutFrame=0;
      if (destroyed) return;
      // Read dimensions together. The labels themselves are never rotated.
      const width=stage.clientWidth;
      const height=stage.clientHeight;
      const halfLabel=Math.max(...items.map(item=>item.offsetWidth))/2;
      radiusX=Math.max(30,width/2-halfLabel-9);
      radiusY=Math.min(105,height*.365);
      root.classList.add('is-enhanced');
      paint();
      sync();
    }
    function scheduleMeasure() { if(!layoutFrame&&!destroyed) layoutFrame=requestAnimationFrame(measure); }
    on(button,'click',()=>{manualPause=!manualPause;sync();});
    on(stage,'pointerenter',event=>{if(event.pointerType==='mouse'||event.pointerType==='pen'){hovering=true;sync();}});
    on(stage,'pointerleave',()=>{hovering=false;sync();});
    on(stage,'pointercancel',()=>{hovering=false;sync();});
    on(stage,'focusin',event=>{if(event.target.matches('[data-orbit-item]')){focused=true;sync();}});
    on(stage,'focusout',event=>{if(!stage.contains(event.relatedTarget)){focused=false;sync();}});
    on(document,'visibilitychange',sync);
    on(window,'resize',scheduleMeasure,{passive:true});
    const mediaChange=()=>{hovering=false;focused=stage.contains(document.activeElement)&&document.activeElement.matches('[data-orbit-item]');sync();};
    if(reduced.addEventListener){reduced.addEventListener('change',mediaChange);removers.push(()=>reduced.removeEventListener('change',mediaChange));}
    else{reduced.addListener(mediaChange);removers.push(()=>reduced.removeListener(mediaChange));}
    const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);sync();},{threshold:0});
    observer.observe(stage);
    const resizeObserver=window.ResizeObserver?new ResizeObserver(scheduleMeasure):null;
    resizeObserver?.observe(stage);
    document.fonts?.ready.then(()=>{if(!destroyed)scheduleMeasure();});
    measure();
    return {refresh:scheduleMeasure,destroy(){if(destroyed)return;destroyed=true;if(frame)cancelAnimationFrame(frame);if(layoutFrame)cancelAnimationFrame(layoutFrame);observer.disconnect();resizeObserver?.disconnect();removers.forEach(remove=>remove());root.classList.remove('is-enhanced');root.dataset.orbitState='static';button.hidden=true;button.setAttribute('aria-pressed','false');if(buttonLabel)buttonLabel.textContent='Pausar rotação';items.forEach(item=>{item.removeAttribute('tabindex');['x','y','z','scale'].forEach(name=>item.style.removeProperty('--orbit-'+name));});}};
  }
  function mount(){if(!enabled)return;document.querySelectorAll('[data-commercial-orbit]').forEach(root=>{if(!instances.has(root)){const instance=create(root);if(instance)instances.set(root,instance);}});}
  function unmount(){instances.forEach(instance=>instance.destroy());instances.clear();}
  window.TruthCommercialOrbit={init(){enabled=true;mount();},refresh(){instances.forEach(instance=>instance.refresh());},destroy(){enabled=false;unmount();}};
  window.addEventListener('pagehide',unmount);
  window.addEventListener('pageshow',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
