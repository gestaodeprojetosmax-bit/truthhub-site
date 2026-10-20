(() => {
  'use strict';
  if (window.TruthMethodConnections) return;
  const controllers=new Map();
  let enabled=true;
  const clamp=value=>Math.min(1,Math.max(0,value));
  function create(list) {
    const items=Array.from(list.children).filter(item=>item.matches('li'));
    const markers=items.map(item=>item.querySelector('.step-marker'));
    if(items.length<2||markers.some(marker=>!marker)||!window.IntersectionObserver)return null;
    const section=list.closest('#metodo')||list;
    const header=document.querySelector('.site-header');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const mobile=matchMedia('(max-width: 700px)');
    const cleanup=[];
    let near=false, running=false, destroyed=false, frame=0, layoutFrame=0;
    let lengths=[], headerBottom=76;
    function on(target,type,callback,options){target.addEventListener(type,callback,options);cleanup.push(()=>target.removeEventListener(type,callback,options));}
    function clearGeometry(){
      list.classList.remove('method-connections-active','method-connections-vertical');
      items.forEach(item=>{['x','y','length','progress'].forEach(name=>item.style.removeProperty('--method-line-'+name));item.classList.remove('is-method-connected');delete item.dataset.methodConnected;delete item.dataset.methodProgress;});
    }
    function showStatic(){
      clearGeometry();list.dataset.methodState='static';list.dataset.methodProgress='1';
    }
    function render(){
      frame=0;if(destroyed||!running||reduced.matches||!lengths.length)return;
      // All geometry reads happen before state/style writes.
      const boxes=markers.map(marker=>marker.getBoundingClientRect());
      const viewportHeight=Math.min(innerHeight,window.visualViewport?.height||innerHeight);
      const vertical=mobile.matches;
      const trigger=headerBottom+(viewportHeight-headerBottom)*.60;
      const total=lengths.reduce((sum,value)=>sum+value,0);
      const travel=Math.max(180,Math.min(380,(viewportHeight-headerBottom)*.58));
      const horizontalProgress=clamp((viewportHeight*.82-(boxes[0].top+boxes[0].height/2))/travel);
      let passed=0;
      const progresses=lengths.map((length,index)=>{
        const progress=vertical?clamp((trigger-boxes[index].bottom)/Math.max(1,length)):clamp((horizontalProgress*total-passed)/Math.max(1,length));
        passed+=length;return progress;
      });
      const firstConnected=vertical?trigger>=boxes[0].top+boxes[0].height/2:viewportHeight*.82>=boxes[0].top+boxes[0].height/2;
      let completedLength=0;
      items.forEach((item,index)=>{
        const connected=index===0?firstConnected:progresses[index-1]>=.995;
        const progress=index<progresses.length?progresses[index]:(connected?1:0);
        if(index<lengths.length)completedLength+=progress*lengths[index];
        item.classList.toggle('is-method-connected',connected);
        item.dataset.methodConnected=String(connected);
        item.dataset.methodProgress=progress.toFixed(3);
        if(index<lengths.length)item.style.setProperty('--method-line-progress',progress.toFixed(4));
      });
      list.dataset.methodProgress=(total?completedLength/total:1).toFixed(3);
    }
    function scheduleRender(){if(!frame&&!destroyed)frame=requestAnimationFrame(render);}
    function syncRunning(){
      const next=!destroyed&&!reduced.matches&&near&&!document.hidden;
      list.dataset.methodState=reduced.matches?'static':next?'active':'paused';
      if(next===running){if(next)scheduleRender();return;}
      running=next;
      if(running){window.addEventListener('scroll',scheduleRender,{passive:true});scheduleRender();}
      else{window.removeEventListener('scroll',scheduleRender);if(frame)cancelAnimationFrame(frame);frame=0;}
    }
    function measure(){
      layoutFrame=0;if(destroyed)return;
      if(reduced.matches){syncRunning();showStatic();return;}
      const boxes=markers.map(marker=>marker.getBoundingClientRect());
      const itemBoxes=items.map(item=>item.getBoundingClientRect());
      const headerBox=header?.getBoundingClientRect();
      const headerTop=header?Math.max(0,parseFloat(getComputedStyle(header).top)||0):0;
      headerBottom=headerBox?headerBox.height+headerTop:76;
      const vertical=mobile.matches;
      const geometry=boxes.slice(0,-1).map((box,index)=>({
        x:vertical?box.left+box.width/2-itemBoxes[index].left:box.right-itemBoxes[index].left,
        y:vertical?box.bottom-itemBoxes[index].top:box.top+box.height/2-itemBoxes[index].top,
        length:Math.max(0,vertical?boxes[index+1].top-box.bottom:boxes[index+1].left-box.right)
      }));
      lengths=geometry.map(line=>line.length);
      list.classList.add('method-connections-active');
      list.classList.toggle('method-connections-vertical',vertical);
      geometry.forEach((line,index)=>{
        items[index].style.setProperty('--method-line-x',line.x.toFixed(2)+'px');
        items[index].style.setProperty('--method-line-y',line.y.toFixed(2)+'px');
        items[index].style.setProperty('--method-line-length',line.length.toFixed(2)+'px');
      });
      syncRunning();
    }
    function scheduleMeasure(){if(!layoutFrame&&!destroyed)layoutFrame=requestAnimationFrame(measure);}
    function mediaChange(){if(reduced.matches){syncRunning();showStatic();}scheduleMeasure();}
    [reduced,mobile].forEach(query=>{if(query.addEventListener){query.addEventListener('change',mediaChange);cleanup.push(()=>query.removeEventListener('change',mediaChange));}else{query.addListener(mediaChange);cleanup.push(()=>query.removeListener(mediaChange));}});
    on(window,'resize',scheduleMeasure,{passive:true});
    if(window.visualViewport)on(window.visualViewport,'resize',scheduleMeasure,{passive:true});
    on(document,'visibilitychange',syncRunning);
    const observer=new IntersectionObserver(entries=>{near=entries.some(entry=>entry.isIntersecting);syncRunning();},{rootMargin:'100% 0px 100% 0px',threshold:0});observer.observe(section);
    const resizeObserver=window.ResizeObserver?new ResizeObserver(scheduleMeasure):null;
    resizeObserver?.observe(list);if(header)resizeObserver?.observe(header);
    document.fonts?.ready.then(()=>{if(!destroyed)scheduleMeasure();});
    measure();
    return {refresh:scheduleMeasure,destroy(){if(destroyed)return;destroyed=true;syncRunning();if(frame)cancelAnimationFrame(frame);if(layoutFrame)cancelAnimationFrame(layoutFrame);observer.disconnect();resizeObserver?.disconnect();cleanup.forEach(remove=>remove());showStatic();}};
  }
  function mount(){if(!enabled)return;document.querySelectorAll('#metodo .method-steps').forEach(list=>{if(!controllers.has(list)){const controller=create(list);if(controller)controllers.set(list,controller);}});}
  function unmount(){controllers.forEach(controller=>controller.destroy());controllers.clear();}
  window.TruthMethodConnections={init(){enabled=true;mount();},refresh(){controllers.forEach(controller=>controller.refresh());},destroy(){enabled=false;unmount();}};
  window.addEventListener('pagehide',unmount);window.addEventListener('pageshow',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
