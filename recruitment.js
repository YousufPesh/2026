const routes={
 compare:{question:'I want to keep working. Part-time MBA or specialized master’s?',reason:'A comparison needs both programs.',intent:['Program fit','Work schedule'],active:['mba','masters'],summary:'Two program specialists',mba:['Format · Schedule · Workload','MBA program pages'],masters:['Format · Schedule · Workload','Master’s program pages'],result:'One useful comparison',text:'Compare options around work.',points:['Study format','Schedule','Workload'],boundary:'Based on published program information'},
 requirements:{question:'What do I need to apply for the part-time MBA?',reason:'One program. An application question.',intent:['Part-time MBA','Entry requirements'],active:['mba'],summary:'One program specialist',mba:['Requirements · Documents','MBA admissions requirements'],result:'A clear application checklist',text:'Know what to prepare.',points:['Entry requirements','Required documents'],boundary:'Admission remains a separate decision'},
 timing:{question:'When does the specialized master’s start, and when should I apply?',reason:'Master’s timing → Master’s specialist',intent:['Specialized master’s','Dates & deadlines'],active:['masters'],summary:'One program specialist',masters:['Start dates · Deadlines','Master’s intake and deadline pages'],result:'Dates for the right program',text:'Plan for the relevant intake.',points:['Start dates','Application deadlines'],boundary:'Unclear timing → Ask admissions'},
 exception:{question:'My background doesn’t meet a listed requirement. Could you make an exception?',reason:'An individual exception needs human judgment.',intent:['Individual situation','Exception request'],active:[],summary:'Hand off to admissions',human:true,result:'A person takes the next step',text:'Question + context → Admissions',points:['Student’s question','Conversation context'],boundary:'Exception decision → Admissions'}
};

'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const meta={
 compare:{label:'comparing programs',interest:'Part-time MBA · Specialized master’s',questions:'Fit · Format · Schedule · Workload',context:'Keep working while studying',draft:'Want to talk through which program fits around work?',next:'Compare programs around work.',nextCopy:['Study format','Schedule','Workload'],options:[['Compare study formats','See how the options fit around work.'],['Talk through program fit','Bring the open questions to admissions.'],['Keep exploring','Take more time to weigh the options.']]},
 requirements:{label:'exploring entry requirements',interest:'Part-time MBA',questions:'Entry requirements · Application documents',context:'Preparing to apply',draft:'Would you like to review the MBA requirements and documents together?',next:'Prepare for an application.',nextCopy:['Requirements','Documents','Checklist'],options:[['Review the checklist','See what to prepare.'],['Ask about a requirement','Discuss the unclear requirement with admissions.'],['Continue exploring','Decide whether the program fits.']]},
 timing:{label:'exploring start dates',interest:'Specialized master’s',questions:'Start dates · Application deadlines',context:'Planning when to study',draft:'Shall we review the published intake dates and application deadlines?',next:'Find the right timing.',nextCopy:['Start dates','Deadlines','Planning'],options:[['Review published timing','Check the relevant intake and deadline.'],['Clarify an unclear date','Ask admissions to confirm.'],['Consider a later intake','Explore a different start date.']]},
 exception:{label:'asking about an exception',interest:'Program with the listed requirement',questions:'Background · Requirement · Exception request',context:'Exception unresolved',draft:'A counselor can review your background and the requirement with you.',next:'Bring the question to admissions.',nextCopy:['Question','Background','Human review'],options:[['Discuss the situation','Review the background and requirement together.'],['Clarify the open question','Keep the exception request visible.'],['Explore other options','Consider alternatives while the question is reviewed.']]}
};
const state={route:'compare',layers:true,active:null,reviews:{},next:{},expanded:false,meeting:null};
for(const key of Object.keys(routes)){state.reviews[key]={draft:meta[key].draft,status:'unreviewed',editing:false,feedback:'Awaiting review'};state.next[key]=0;}
const panels=new Set(['visit','guidance','knowledge','context','review','next','outcome']);
function announce(t){$('#announcement').textContent=t;}
function pressed(selector,value,attribute){$$(selector).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attribute]===value)));}
let panelMotion=null,closing=false;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function cardTransform(card){
 const source=card.getBoundingClientRect(),target=$('#step-panel').getBoundingClientRect();
 // Internal handoffs can lead to a card outside the current viewport.
 if(source.bottom<0||source.top>innerHeight)return 'translateY(10px) scale(.97)';
 return `translate(${source.left+source.width/2-target.left-target.width/2}px,${source.top+source.height/2-target.top-target.height/2}px) scale(${source.width/target.width},${source.height/target.height})`;
}
function fillCover(card){
 $('#panel-title').textContent=card.querySelector('strong').textContent;
 $('#panel-caption').textContent=card.querySelector('small').textContent;
 $('#panel-number').textContent=card.querySelector('.node-number').textContent;
 $('#panel-art').replaceChildren(card.querySelector('.node-art').cloneNode(true));
 $('.panel-cover').classList.toggle('human-cover',card.classList.contains('human-node'));
}
function openStep(id){
 if(!panels.has(id)||closing)return;
 if(!state.expanded&&id==='outcome'){setExpanded(true);return;}
 const dialog=$('#step-panel'),wasOpen=dialog.open,card=$(`[data-stage="${id}"]`);
 if(panelMotion){panelMotion.cancel();panelMotion=null;}
 state.active=id;
 $$('[data-panel]').forEach(e=>e.hidden=e.dataset.panel!==id);
 $$('[data-stage]').forEach(b=>{const active=b===card;b.setAttribute('aria-expanded',String(active));if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 fillCover(card);renderRoute();
 if(!wasOpen)dialog.showModal();
 $('.step-popup-body').scrollTop=0;$('#panel-title').focus({preventScroll:true});
 if(!reducedMotion()){
  if(!wasOpen){
   panelMotion=dialog.animate([{transform:cardTransform(card),opacity:.25},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'});
   $('.step-popup-body').animate([{opacity:0},{opacity:1}],{duration:180,delay:100,fill:'backwards'});
  }else $('.cover-content').animate([{opacity:.3},{opacity:1}],{duration:180});
 }
 announce($('#panel-title').textContent+' opened. Alex’s selected question is unchanged.');
}
async function closeStep(){
 const dialog=$('#step-panel');if(!dialog.open||closing)return;
 closing=true;
 const currentTransform=getComputedStyle(dialog).transform;
 if(panelMotion){panelMotion.cancel();panelMotion=null;}
 const card=$(`[data-stage="${state.active}"]`);
 if(!reducedMotion()&&card){
  panelMotion=dialog.animate([{transform:currentTransform,opacity:1},{transform:cardTransform(card),opacity:0}],{duration:220,easing:'cubic-bezier(.4,0,.8,.2)',fill:'forwards'});
  try{await panelMotion.finished;}catch{}
 }
 dialog.close();
 if(panelMotion){panelMotion.cancel();panelMotion=null;}
 closing=false;
}
$$('[data-stage],[data-open]').forEach(b=>b.addEventListener('click',()=>openStep(b.dataset.stage||b.dataset.open)));
$('#close-step').addEventListener('click',closeStep);
$('#step-panel').addEventListener('cancel',e=>{e.preventDefault();closeStep();});
$('#step-panel').addEventListener('close',()=>{const id=state.active;state.active=null;$$('[data-stage]').forEach(b=>{b.setAttribute('aria-expanded','false');b.removeAttribute('aria-current');});if(id)$(`[data-stage="${id}"]`).focus({preventScroll:true});announce('Back to the recruitment flow. Your selections are retained.');});
$('#step-panel').addEventListener('click',e=>{if(e.target!==$('#step-panel'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeStep();});
$('#step-panel').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=$$('#step-panel button,#step-panel select,#step-panel textarea,#step-panel summary').filter(el=>!el.disabled&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('#panel-title'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
function selectRoute(key){if(!routes[key])return;state.route=key;renderRoute();announce('Alex’s question: '+routes[key].question);}
const questionLabels={compare:'Program fit',requirements:'Requirements',timing:'Dates',exception:'An exception'};
$$('[data-question-options]').forEach(group=>{for(const [key,label] of Object.entries(questionLabels)){const b=document.createElement('button');b.dataset.route=key;b.textContent=label;b.setAttribute('aria-pressed',String(key===state.route));group.append(b);}});
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>selectRoute(b.dataset.route)));
function renderRoute(){const r=routes[state.route],m=meta[state.route];$('#selected-status').textContent='Alex · '+m.label;pressed('[data-route]',state.route,'route');$$('[data-question]').forEach(e=>e.textContent='“'+r.question+'”');$$('[data-result]').forEach(e=>e.textContent=r.result);$$('[data-result-text]').forEach(e=>e.textContent=r.text);$('#route-reason').textContent=r.reason;chips('#route-intent',r.intent);chips('#result-points',r.points);$('#route-summary').textContent=r.summary;$('#result-boundary').textContent=r.boundary;$('#specialists').hidden=!!r.human;$('#layers-toggle').hidden=!!r.human;$('#human-route').hidden=!r.human;for(const key of ['mba','masters']){const el=$('#'+key+'-expert'),active=r.active.includes(key);el.classList.toggle('inactive',!active);el.querySelector('.expert-status').textContent=active?'Consulted':'Not needed';el.querySelector('.contribution').textContent=active?r[key][0]:'Other program';el.querySelector('.source-layer').hidden=!active;el.querySelector('.source-name').textContent=active?r[key][1]:'';}
$('#record-interest').textContent=m.interest;$('#record-questions').textContent=m.questions;$('#record-context').textContent=m.context;$$('.copy-feedback').forEach(e=>e.textContent='');$$('[data-copy-question]').forEach(b=>b.innerHTML='Copy question <span aria-hidden="true">⧉</span>');renderHelp();renderReview();renderNext();}
function chips(selector,values){$(selector).replaceChildren(...values.map(t=>{const e=document.createElement('span');e.textContent=t;return e;}));}
const help={compare:['Explore the fit.',['Work schedule','Part-time MBA','Master’s'],['calendar','layers','layers']],requirements:['Prepare an application.',['Requirements','Documents','Checklist'],['checklist','layers','checklist']],timing:['Plan the timing.',['Start dates','Deadlines','Next intake'],['calendar','calendar','layers']],exception:['Bring in admissions.',['Open question','Context','Human review'],['question','layers','checklist']]};
const cueIcons={target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m12 12 8-8"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18m-13 4h3m3 0h3"/>',checklist:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m7 9 2 2 3-4m1 3h4m-10 6h3m3 0h4"/>',layers:'<path d="m3 7 9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',question:'<path d="M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3v1"/><circle cx="12" cy="12" r="10"/>'};
function visualCues(selector,values){$(selector).replaceChildren(...values.map(text=>{const e=document.createElement('span');e.textContent=text;return e;}));}
function renderHelp(){const h=help[state.route];$('#help-title').textContent=h[0];$('#help-copy').replaceChildren(...h[1].map((text,i)=>{const e=document.createElement('div');e.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${cueIcons[h[2][i]]}</svg>`;const label=document.createElement('span');label.textContent=text;e.append(label);return e;}));}
$$('[data-copy-question]').forEach(button=>button.addEventListener('click',async()=>{const feedback=button.closest('.question-card').querySelector('.copy-feedback');try{await navigator.clipboard.writeText(routes[state.route].question);button.textContent='Copied ✓';feedback.textContent='Ready to paste into your demo.';}catch{const quote=button.closest('.question-card').querySelector('blockquote');const range=document.createRange();range.selectNodeContents(quote);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);feedback.textContent='Question selected. Use your copy shortcut.';}}));
$$('[data-meeting]').forEach(button=>button.addEventListener('click',()=>{state.meeting=button.dataset.meeting;pressed('[data-meeting]',state.meeting,'meeting');$('#meeting-status').textContent=state.meeting+' selected · Demo only, no booking';}));

$('#layers-toggle').addEventListener('click',()=>{state.layers=!state.layers;$('#specialists').classList.toggle('layers-expanded',state.layers);$('#layers-toggle').setAttribute('aria-expanded',String(state.layers));$('#layers-toggle').innerHTML=state.layers?'Fold layers <span aria-hidden="true">−</span>':'Expand layers <span aria-hidden="true">+</span>';});
function renderReview(){const m=meta[state.route],v=state.reviews[state.route];$('#brief-interest').textContent=m.interest;$('#brief-questions').textContent=m.questions;$('#brief-context').textContent=m.context+' · Transcript + summary';$('#draft-message').textContent=v.draft;$('#draft-message').hidden=v.editing;$('#editor-wrap').hidden=!v.editing;$('#draft-editor').value=v.draft;$('#review-feedback').textContent=v.feedback;$$('[data-action]').forEach(b=>{b.setAttribute('aria-pressed',String((b.dataset.action==='approve'&&v.status==='approved')||(b.dataset.action==='hold'&&v.status==='held')||(b.dataset.action==='edit'&&v.editing)));b.disabled=v.editing&&b.dataset.action!=='edit';});}

$$('[data-action]').forEach(b=>b.addEventListener('click',()=>{const v=state.reviews[state.route];if(b.dataset.action==='edit'){v.editing=true;v.status='unreviewed';v.feedback='Editing · Review again after saving';}else if(b.dataset.action==='approve'){v.status='approved';v.feedback='Wording approved · Nothing sent';}else{v.status='held';v.feedback='On hold · Questions to resolve';}renderReview();renderNext();if(v.editing)$('#draft-editor').focus();}));
$('#draft-editor').addEventListener('input',e=>{state.reviews[state.route].draft=e.target.value;});
$('#save-edit').addEventListener('click',()=>{const v=state.reviews[state.route];if(!v.draft.trim()){v.feedback='Add wording before saving.';$('#review-feedback').textContent=v.feedback;$('#draft-editor').focus();return;}v.editing=false;v.status='edited';v.feedback='Edit saved · Needs review';renderReview();renderNext();$('[data-action="edit"]').focus();});
function renderNext(){const m=meta[state.route],v=state.reviews[state.route];$('#next-title').textContent=m.next;visualCues('#next-copy',m.nextCopy);const status={unreviewed:'Follow-up · Awaiting review',approved:'Follow-up · Wording approved',held:'Follow-up · On hold',edited:'Follow-up · Edit needs review'};$('#next-review').textContent=status[v.status];$('#next-options').replaceChildren(...m.options.map((o,i)=>{const b=document.createElement('button');b.textContent=o[0];b.dataset.next=String(i);b.setAttribute('aria-pressed',String(state.next[state.route]===i));b.addEventListener('click',()=>{state.next[state.route]=i;renderNextChoice();});return b;}));renderNextChoice();}
function renderNextChoice(){const i=state.next[state.route],option=meta[state.route].options[i];$$('[data-next]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.next)===i)));$('#next-choice-title').textContent=option[0];$('#next-choice-copy').textContent=option[1];$('#destination-choice').textContent=option[0];}
function drawWires(){const canvas=$('#flow'),base=canvas.getBoundingClientRect(),nodes=$$('.node').map(el=>{const r=el.getBoundingClientRect();return{x:r.x-base.x,y:r.y-base.y,w:r.width,h:r.height};});$('.wires').setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);$$('.wires>path').forEach((path,i)=>{const a=nodes[i],b=nodes[i+1];if(!a||!b)return;const d=b.x>a.x+a.w+8?`M ${a.x+a.w+3} ${a.y+a.h/2} L ${b.x-5} ${b.y+b.h/2}`:`M ${a.x+a.w/2} ${a.y-4} L ${b.x+b.w/2} ${b.y+b.h+8}`;path.setAttribute('d',d);});}
let frame,flowTimer;
function animateWires(){cancelAnimationFrame(frame);const end=performance.now()+950;function tick(){drawWires();if(performance.now()<end)frame=requestAnimationFrame(tick);}tick();}
function setExpanded(expanded,{focus=false}={}){
 const changed=state.expanded!==expanded,returnFocus=focus||$('#flow').contains(document.activeElement);clearTimeout(flowTimer);state.expanded=expanded;$('.graphic-stage').classList.toggle('flow-folded',!expanded);
 $('#replay').setAttribute('aria-expanded',String(expanded));$('#replay').innerHTML=expanded?'Collapse flow <span aria-hidden="true">↙</span>':'Expand flow <span aria-hidden="true">↗</span>';
 $$('.node').forEach(card=>{const cover=card.dataset.stage==='outcome';card.inert=!expanded&&!cover;if(!expanded&&!cover)card.setAttribute('aria-hidden','true');else card.removeAttribute('aria-hidden');if(!expanded&&cover){card.removeAttribute('aria-haspopup');card.setAttribute('aria-controls','flow');card.setAttribute('aria-label','Expand recruitment flow: A path to your campus');}else{card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-controls','step-panel');card.removeAttribute('aria-label');}card.setAttribute('aria-expanded','false');});
 $('.human-branch').hidden=!expanded;$('.graphic-footnote').textContent=expanded?'Illustrative pathways · Students may continue, pause, or leave.':'Illustrated recruitment journey';
 const moving=changed&&!reducedMotion();$('.graphic-stage').classList.toggle('flow-moving',moving);$('#flow').setAttribute('aria-busy',String(moving));
 if(moving){$$('.node').forEach(card=>card.inert=true);flowTimer=setTimeout(()=>{$$('.node').forEach(card=>card.inert=!state.expanded&&card.dataset.stage!=='outcome');$('.graphic-stage').classList.remove('flow-moving');$('#flow').setAttribute('aria-busy','false');if(returnFocus)$('[data-stage="outcome"]').focus({preventScroll:true});},850);}else if(returnFocus)$('[data-stage="outcome"]').focus({preventScroll:true});
 animateWires();announce(expanded?'Recruitment journey expanded. Seven stages available.':'Journey folded into A path to your campus.');
}
$('#replay').addEventListener('click',()=>setExpanded(!state.expanded));
$('#collapse-journey').addEventListener('click',async()=>{await closeStep();setExpanded(false,{focus:true});$('.graphic-stage').scrollIntoView({block:'start',behavior:reducedMotion()?'instant':'smooth'});});
new ResizeObserver(drawWires).observe($('#flow'));renderRoute();setExpanded(false);
