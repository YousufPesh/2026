'use strict';
const $=s=>document.querySelector(s);
let selected=0,view='before',activeStep=null,revealed=false;
const icons={document:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/>',layers:'<path d="m3 7 9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3M8 16l3 3 5-5"/>',refresh:'<path d="M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5M4 17a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',report:'<path d="M5 3h14v18H5zM8 8h8M8 12h3m3 0h2M8 16h3m3 0h2"/>',folder:'<path d="M3 6h7l2 3h9v12H3zM3 9h18"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/>',campus:'<path d="m3 8 9-5 9 5zM5 10v9m5-9v9m4-9v9m5-9v9M3 21h18"/>'};
function setIcon(el,name){el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;el.setAttribute('aria-hidden','true');}
document.querySelectorAll('[data-icon]').forEach(el=>setIcon(el,el.dataset.icon));
function announce(text){$('#announcement').textContent=text;}
function drawWorkflowWires(){
  const canvas=$('.workflow-canvas');
  const nodes=[...canvas.querySelectorAll('[data-workflow-node]')];
  const base=canvas.getBoundingClientRect();
  if(!base.width||!base.height)return;
  const rects=nodes.map(el=>{const r=el.getBoundingClientRect();return {x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height};});
  const svg=$('.workflow-wires');svg.setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);
  for(let i=0;i<4;i++){
    const a=rects[i],b=rects[i+1];
    let path,arrowX,arrowY,arrowRotation=0;
    if(base.width<700){
      const routeRight=i%2===0;
      const sy=a.y+a.h*.52,ey=b.y+b.h*.52,radius=10;
      if(routeRight){
        const sx=a.x+a.w+4,ex=b.x+b.w+4,lane=Math.min(base.width-36,Math.max(a.x+a.w,b.x+b.w)+34);
        path=`M ${sx} ${sy} H ${lane-radius} Q ${lane} ${sy} ${lane} ${sy-radius} V ${ey+radius} Q ${lane} ${ey} ${lane-radius} ${ey} H ${ex}`;
        arrowX=lane;arrowY=(sy+ey)/2;
      }else{
        const sx=a.x-4,ex=b.x-4,lane=Math.max(22,Math.min(a.x,b.x)-48);
        path=`M ${sx} ${sy} H ${lane+radius} Q ${lane} ${sy} ${lane} ${sy-radius} V ${ey+radius} Q ${lane} ${ey} ${lane+radius} ${ey} H ${ex}`;
        arrowX=lane;arrowY=(sy+ey)/2;
      }
      arrowRotation=-90;
    }else if(b.x>=a.x+a.w+18){
      const sx=a.x+a.w+5,sy=a.y+a.h/2,ex=b.x-8,ey=b.y+b.h/2,mx=(sx+ex)/2;
      path=`M ${sx} ${sy} C ${mx} ${sy} ${mx} ${ey} ${ex} ${ey}`;
      arrowX=mx;arrowY=(sy+ey)/2;
    }else{
      const sx=a.x+a.w/2,sy=a.y-5,ex=b.x+b.w/2,ey=b.y+b.h+6,mid=(sy+ey)/2,sign=ex>=sx?1:-1;
      const radius=Math.max(3,Math.min(10,Math.abs(ex-sx)/2,Math.abs(sy-ey)/2));
      path=`M ${sx} ${sy} V ${mid+radius} Q ${sx} ${mid} ${sx+sign*radius} ${mid} H ${ex-sign*radius} Q ${ex} ${mid} ${ex} ${mid-radius} V ${ey}`;
      arrowX=(sx+ex)/2;arrowY=mid;
    }
    $(`#workflow-forward-${i}`).setAttribute('d',path);
    $(`#workflow-step-arrow-${i}`).setAttribute('transform',`translate(${arrowX} ${arrowY}) rotate(${arrowRotation})`);
  }
  const top=rects[4],source=rects[0],right=base.width-24,bottom=base.height-32;
  $('#workflow-return').setAttribute('d',`M ${top.x+top.w+5} ${top.y+top.h/2} H ${right-10} Q ${right} ${top.y+top.h/2} ${right} ${top.y+top.h/2+10} V ${bottom-10} Q ${right} ${bottom} ${right-10} ${bottom} H ${source.x+source.w/2+10} Q ${source.x+source.w/2} ${bottom} ${source.x+source.w/2} ${bottom-10} V ${source.y+source.h+7}`);
}
let wireAnimation;
function animateWorkflowWires(){cancelAnimationFrame(wireAnimation);const end=performance.now()+1000;function frame(){drawWorkflowWires();if(performance.now()<end)wireAnimation=requestAnimationFrame(frame);}frame();}
new ResizeObserver(drawWorkflowWires).observe($('.workflow-canvas'));
function setRevealed(value){
 revealed=value;$('#access-graphic').classList.toggle('structure-revealed',value);
 $('#reveal-structure').setAttribute('aria-expanded',String(value));
 $('#reveal-structure').innerHTML=value?'Close the workflow <span aria-hidden="true">↙</span>':'See the workflow <span aria-hidden="true">↗</span>';
 $('#flow-hint').textContent=value?'Select a step.':'Open the PDF to reveal the flow.';
 document.querySelectorAll('[data-flow]').forEach(el=>{const hidden=!value&&el.dataset.flow!=='output';el.disabled=hidden;if(hidden)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');});
 const output=$('[data-flow="output"]');output.setAttribute('aria-label',value?'Accessible PDF: open step':'Accessible PDF: see the workflow');
 output.setAttribute('aria-controls',value?'step-panel':'workflow-canvas');if(value)output.setAttribute('aria-haspopup','dialog');else output.removeAttribute('aria-haspopup');
 animateWorkflowWires();
}
$('#reveal-structure').addEventListener('click',()=>{setRevealed(!revealed);announce(revealed?'Remediation flow revealed.':'Collapsed to the accessible PDF.');});
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>{const collection=button.dataset.source==='collection';document.querySelectorAll('[data-source]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));$('#source-art').classList.toggle('collection',collection);$('#source-title').textContent=collection?'Course materials':'Your document';$('#source-systems').hidden=!collection;}));
const comparisonCaptions={syllabus:['The page looks organized. Its semantic structure is missing.','Selected headings, lists, table roles, and reading order are illustrated.'],assessment:['The grid is visible. Header and cell relationships are not tagged.','The illustration identifies table headers and data cells.'],reading:['Two columns are visible. Their reading sequence is not defined by tags.','Follow the left column, then the right, then the figure.'],assignment:['Section titles and checklist items have no semantic tags.','Headings, prose, and lists are identified; the photo is decorative.'],math:['Handwritten formulas sit inside an untagged scan.','The explanation is rebuilt as typed text and formulas.'],chart:['The chart’s values rely on visual presentation.','The figure text alternative states attendance for each session.']};
examples.forEach((example,i)=>{const option=document.createElement('option');option.value=i;option.textContent=example.name;$('#example-select').append(option);});

const panels={sources:['01 / Source systems','One PDF. Or a collection.'],audit:['02 / Audit','Accessibility at a glance.'],remediation:['03 / AI remediation','Two ways to remediate.'],review:['04 / Human review','Inspect. Edit. Revalidate.'],output:['05 / Accessible PDF','Back to the source.']};
const stepIds=Object.keys(panels);
const stepLabels=['Source systems','Audit','AI remediation','Human review','Accessible PDF'];
let switchingStep=false,stepMotion=null,stepSwitchVersion=0;
function cancelStepSwitch(){stepSwitchVersion++;stepMotion?.cancel();stepMotion=null;switchingStep=false;$('#step-panel').classList.remove('step-switching');}
function updateStepNavigation(){
 const index=stepIds.indexOf(activeStep);
 for(const [selector,offset] of [['#previous-step',-1],['#next-step',1]]){
  const button=$(selector),target=index+offset;
  button.disabled=target<0||target>=stepIds.length;
  const label=button.disabled?(offset<0?'First step':'Last step'):`${offset<0?'Previous':'Next'}: ${stepLabels[target]}`;
  button.setAttribute('aria-label',label);
 }
}
function stepCardTransform(id,frame){
 const card=$(`[data-flow="${id}"]`).getBoundingClientRect();
 const x=card.left+card.width/2-frame.left-frame.width/2;
 const y=card.top+card.height/2-frame.top-frame.height/2;
 const scale=Math.min(card.width/frame.width,card.height/frame.height);
 return `translate(${x}px,${y}px) scale(${scale})`;
}
function bringStepIntoView(id){
 const card=$(`[data-flow="${id}"]`).getBoundingClientRect();
 if(card.top<40||card.bottom>window.innerHeight-40){
  window.scrollTo({top:Math.max(0,window.scrollY+card.top-(window.innerHeight-card.height)/2),behavior:'instant'});
 }
}
async function switchStep(offset){
 const panel=$('#step-panel'),target=stepIds.indexOf(activeStep)+offset;
 if(switchingStep||!panel.open||target<0||target>=stepIds.length)return;
 switchingStep=true;const version=++stepSwitchVersion;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const frame=panel.getBoundingClientRect();
 try{
  if(!reduced){
   panel.classList.add('step-switching');
   stepMotion=panel.animate([
    {opacity:1,transform:'translate(0,0) scale(1)'},
    {opacity:0,transform:stepCardTransform(activeStep,frame)}
   ],{duration:440,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
   await stepMotion.finished;
   if(version!==stepSwitchVersion||!panel.open)return;
   bringStepIntoView(stepIds[target]);
   // Let the audience see the flow before the next card expands.
   await new Promise(resolve=>setTimeout(resolve,320));
  }
  if(version!==stepSwitchVersion||!panel.open)return;
  openStep(stepIds[target],{focus:false,transition:true});
  stepMotion?.cancel();
  const preferred=$(offset<0?'#previous-step':'#next-step');
  (preferred.disabled?$(offset<0?'#next-step':'#previous-step'):preferred).focus({preventScroll:true});
  if(!reduced){
   const origin=stepCardTransform(stepIds[target],frame);
   panel.classList.remove('step-switching');
   stepMotion=panel.animate([
    {opacity:0,transform:origin},
    {opacity:1,transform:'translate(0,0) scale(1)'}
   ],{duration:500,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
   await stepMotion.finished;
  }
 }catch(error){if(error.name!=='AbortError')throw error;}
 finally{if(version===stepSwitchVersion){stepMotion?.cancel();stepMotion=null;switchingStep=false;panel.classList.remove('step-switching');}}
}
$('#previous-step').addEventListener('click',()=>switchStep(-1));
$('#next-step').addEventListener('click',()=>switchStep(1));
function openStep(id,{focus=true,hash=true,transition=false}={}){
 if(!panels[id])return;
 if(!transition)cancelStepSwitch();
 if(!revealed)setRevealed(true);
 const enteringReview=id==='review'&&activeStep!=='review';
 activeStep=id;
 updateStepNavigation();

 document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==id);
 document.querySelectorAll('[data-flow]').forEach(el=>{const current=el.dataset.flow===id;el.setAttribute('aria-expanded',String(current));if(current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 const [kicker,title]=panels[id];$('#panel-kicker').textContent=kicker;$('#panel-title').textContent=title;
 $('#example-view').hidden=id!=='remediation';$('.document-context').hidden=true;
 view=id==='audit'||id==='remediation'?'before':'after';renderExample();
 if(hash)history.replaceState(null,'',`#${id}`);
 animateWorkflowWires();
 if(!$('#step-panel').open)$('#step-panel').showModal();
 $('.step-popup-body').scrollTop=0;
 if(id==='review')startReviewLoop({reset:enteringReview});else stopReviewLoop();
 if(focus)$('#panel-title').focus({preventScroll:true});
 announce(id==='remediation'?`${title} ${examples[selected].name}.`:title);
}
function closeStep(){cancelStepSwitch();stopReviewLoop();if($('#step-panel').open)$('#step-panel').close();}
$('#close-step').addEventListener('click',closeStep);
$('#step-panel').addEventListener('close',()=>{
 cancelStepSwitch();
 stopReviewLoop();
 const previous=activeStep;activeStep=null;
 document.querySelectorAll('[data-flow]').forEach(el=>{el.setAttribute('aria-expanded','false');el.removeAttribute('aria-current');});
 history.replaceState(null,'','#access');
 if(previous)$(`[data-flow="${previous}"]`).focus({preventScroll:true});
 announce('Step closed. Back to the remediation flow.');
});
$('#step-panel').addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const controls=[...$('#step-panel').querySelectorAll('button,select,summary,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
 const first=controls[0],last=controls.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
$('#step-panel').addEventListener('click',event=>{
 if(event.target!==$('#step-panel'))return;
 const r=$('#step-panel').getBoundingClientRect();
 if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeStep();
});
document.querySelectorAll('[data-flow],[data-open]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.flow==='output'&&!revealed){setRevealed(true);return;}openStep(el.dataset.flow||el.dataset.open);}));
function renderExample(){
 const e=examples[selected];const mode=e.mode==='Reconstruct'?'Full reconstruction':e.mode;
 $('#example-select').value=selected;$('#example-mode').textContent=mode;document.querySelectorAll('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===(e.mode==='Reconstruct'?'reconstruct':'preserve'))));
 document.querySelectorAll('[data-example]').forEach(el=>el.textContent=e[el.dataset.example]);document.querySelectorAll('[data-example-name]').forEach(el=>el.textContent=e.name);
 $('#document-image').src=`assets/${e[view]}`;const alt=`${view==='before'?'Before':'After'} synthetic illustration. ${e.subject} ${view==='before'?'No existing tag structure.':e.change}`;$('#document-image').alt=alt;
 $('#dialog-image').src=`assets/${e[view]}`;$('#dialog-image').alt=alt;$('#dialog-title').textContent=`${e.name} · ${view==='before'?'Before':'After'}`;
 $('#example-caption').textContent=comparisonCaptions[e.id][view==='before'?0:1];$('#text-summary').textContent=e.summary;
 document.querySelectorAll('[data-state],[data-dialog-state]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.state||button.dataset.dialogState)===view)));
}
$('#example-select').addEventListener('change',event=>{selected=Number(event.target.value);renderExample();announce(`${examples[selected].name} selected for the walkthrough.`);});
document.querySelectorAll('[data-state],[data-dialog-state]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.state||button.dataset.dialogState;renderExample();announce(`${examples[selected].name}, ${view}. ${$('#example-caption').textContent}`);}));
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{selected=el.dataset.mode==='reconstruct'?4:0;view='before';renderExample();}));
const reviewPhases=[
 ['Inspect & edit','Inspect the document. Choose the right tag and reading order.'],
 ['Apply changes','Approve the edits and apply them to the PDF.'],
 ['Revalidate','Scan the revised PDF against the accessibility checks.'],
 ['Updated report','Place the revised PDF beside its new compliance report.']
];
const reviewDurations=[8000,4500,6000,6000];
const reviewMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let reviewPhase=0,reviewTimer=null,reviewPaused=reviewMotion.matches;
function updateReviewToggle(){const button=$('#review-loop-toggle');button.setAttribute('aria-pressed',String(reviewPaused));button.textContent=reviewPaused?(reviewMotion.matches?'Play loop':'Resume loop'):'Pause loop';$('.review-loop-controls>span').classList.toggle('is-paused',reviewPaused);}
function stopReviewLoop(){clearTimeout(reviewTimer);reviewTimer=null;}
function scheduleReviewLoop(){stopReviewLoop();if(activeStep!=='review'||reviewPaused)return;reviewTimer=setTimeout(()=>{setReviewPhase((reviewPhase+1)%reviewPhases.length,{restart:false});scheduleReviewLoop();},reviewDurations[reviewPhase]);}
function setReviewPhase(index,{restart=true,announcePhase=false}={}){reviewPhase=(index+reviewPhases.length)%reviewPhases.length;$('#review-loop').dataset.reviewPhase=reviewPhase;document.querySelectorAll('.review-sequence [data-review]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.review)===reviewPhase)));$('#review-loop-caption').textContent=reviewPhases[reviewPhase][1];if(announcePhase)announce(`${reviewPhases[reviewPhase][0]}. ${reviewPhases[reviewPhase][1]}`);if(restart)scheduleReviewLoop();}
function startReviewLoop({reset=false}={}){if(reset){reviewPaused=reviewMotion.matches;setReviewPhase(0,{restart:false});}updateReviewToggle();scheduleReviewLoop();}
document.querySelectorAll('.review-sequence [data-review]').forEach(el=>el.addEventListener('click',()=>setReviewPhase(Number(el.dataset.review),{announcePhase:true})));
$('#review-loop-toggle').addEventListener('click',()=>{reviewPaused=!reviewPaused;updateReviewToggle();if(reviewPaused){stopReviewLoop();announce('Human review loop paused.');}else{scheduleReviewLoop();announce('Human review loop playing.');}});
reviewMotion.addEventListener('change',event=>{reviewPaused=event.matches;updateReviewToggle();if(reviewPaused)stopReviewLoop();else scheduleReviewLoop();});
const dialog=$('#image-dialog');
function resetZoom(){ $('.dialog-scroll').classList.remove('zoomed');$('#zoom').setAttribute('aria-pressed','false');$('#zoom').textContent='Zoom in';$('.dialog-scroll').scrollTo(0,0);}
$('#enlarge').addEventListener('click',()=>{renderExample();resetZoom();dialog.showModal();});$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>$('#enlarge').focus({preventScroll:true}));
dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,summary,[tabindex="0"]')];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
$('#zoom').addEventListener('click',()=>{const zoomed=$('.dialog-scroll').classList.toggle('zoomed');$('#zoom').setAttribute('aria-pressed',String(zoomed));$('#zoom').textContent=zoomed?'Fit to width':'Zoom in';if(!zoomed)$('.dialog-scroll').scrollTo(0,0);});

history.scrollRestoration='manual';
function readHash(){const hash=location.hash.slice(1);const aliases={scale:'sources',approach:'remediation',pipeline:'review',results:'remediation',oversight:'output','your-pdf':'sources'};const id=aliases[hash]||hash;if(panels[id])openStep(id,{focus:false,hash:false});else if(activeStep)closeStep();}
window.addEventListener('hashchange',readHash);
setRevealed(false);setReviewPhase(0,{restart:false});updateReviewToggle();renderExample();readHash();animateWorkflowWires();
requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
