'use strict';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

const channels={
 website:{label:'Website search',from:'From website search',summary:'A student is searching your program website for an answer.'},
 email:{label:'Email',from:'From email',summary:'A student has emailed your team and is waiting for useful guidance.'},
 form:{label:'Inquiry form',from:'From an inquiry form',summary:'A student has shared their interest and is waiting to understand what comes next.'},
 phone:{label:'Phone · after hours',from:'From an after-hours call',summary:'A student is calling after hours, when no one on the program team is available.'}
};

const routes={
 compare:{
  question:'I want to keep working. Which program fits my goals and schedule?',
  title:'Compare relevant program options',
  reason:'The question needs information from more than one program.',
  intent:['Program fit','Work schedule'],
  active:['mba','masters'],
  mba:['Format · Schedule · Workload','MBA program pages'],
  masters:['Format · Schedule · Workload','Master’s program pages'],
  result:'A useful program comparison',
  resultText:'The student can compare study format, schedule, and workload.',
  points:['Study format','Schedule','Workload'],
  boundary:'Based on published program information',
  interest:'Part-time MBA · Specialized master’s',
  recordQuestion:'Program fit · Schedule · Workload',
  matters:'Keep working while studying',
  reviewWhy:'The student wants help comparing programs around a work schedule.',
  established:'Relevant formats, schedules, and workloads from both programs.',
  decision:'Whether one-to-one guidance would help the student compare program fit.',
  draft:'Would it help to talk through which program fits around your work schedule?',
  next:'Compare relevant programs',
  nextCopy:'Review how each option fits the student’s goals and work schedule.',
  nextStatus:'Grounded in approved program information'
 },
 requirements:{
  question:'What do I need to apply for the part-time MBA?',
  title:'Find the relevant application requirements',
  reason:'This is a published-information question about one program.',
  intent:['Part-time MBA','Application requirements'],
  active:['mba'],
  mba:['Requirements · Documents','MBA admissions requirements'],
  masters:['Not needed for this question',''],
  result:'A clear application checklist',
  resultText:'The student can see the published requirements and documents to prepare.',
  points:['Entry requirements','Required documents'],
  boundary:'Admission remains a separate decision',
  interest:'Part-time MBA',
  recordQuestion:'Entry requirements · Application documents',
  matters:'Preparing a complete application',
  reviewWhy:'The student may need help clarifying an application requirement.',
  established:'Published requirements and required documents for the part-time MBA.',
  decision:'Whether the open question needs individual clarification from admissions.',
  draft:'Would it help to review the published MBA requirements and documents together?',
  next:'Review the application checklist',
  nextCopy:'See the published requirements and prepare the required documents.',
  nextStatus:'Grounded in published application requirements'
 },
 timing:{
  question:'When does the specialized master’s start, and when should I apply?',
  title:'Find the relevant intake and deadline',
  reason:'The timing belongs to one program and one current intake.',
  intent:['Specialized master’s','Dates and deadlines'],
  active:['masters'],
  mba:['Not needed for this question',''],
  masters:['Start dates · Deadlines','Master’s intake and deadline pages'],
  result:'Dates for the right program',
  resultText:'The student can plan around the relevant intake and application deadline.',
  points:['Start dates','Application deadlines'],
  boundary:'An unclear date should be confirmed by admissions',
  interest:'Specialized master’s',
  recordQuestion:'Start dates · Application deadlines',
  matters:'Planning when to begin studying',
  reviewWhy:'The student may need confirmation if a published date is unclear.',
  established:'The current published intake dates and application deadlines.',
  decision:'Whether admissions needs to confirm an unclear or changing date.',
  draft:'Would you like help confirming the relevant intake and application deadline?',
  next:'Prepare for the relevant intake',
  nextCopy:'Review the start date and work backward from the application deadline.',
  nextStatus:'Grounded in published dates and deadlines'
 },
 exception:{
  question:'My background doesn’t meet a listed part-time MBA requirement. Could an exception be made?',
  title:'Establish what the published requirement says',
  reason:'The program specialist can establish the requirement, but not decide an exception.',
  intent:['Part-time MBA','Exception request'],
  active:['mba'],
  mba:['Published requirement','MBA admissions requirements'],
  masters:['Not needed for this question',''],
  human:true,
  result:'A decision-ready counselor handoff',
  resultText:'The published requirement and the student’s question travel together.',
  points:['Published requirement','Student’s question','Conversation context'],
  boundary:'The exception decision remains with admissions',
  interest:'Part-time MBA',
  recordQuestion:'Background · Listed requirement · Exception request',
  matters:'Understanding whether an individual situation can be reviewed',
  reviewWhy:'The student is asking for an exception to a listed program requirement.',
  established:'The listed requirement, the student’s stated background, and the conversation context.',
  decision:'Whether this situation should receive an exception review or be guided to another path.',
  draft:'A counselor can review your background and the listed requirement with you.',
  next:'Continue with an admissions counselor',
  nextCopy:'Bring the published requirement, the student’s question, and the conversation context into one review.',
  nextStatus:'Human judgment required'
 }
};

const stages={
 interest:{number:'01',title:'Student interest',caption:'Four ways a conversation begins'},
 expertise:{number:'02',title:'Coordinated expertise',caption:'Question, specialists, and sources together'},
 slate:{number:'03',title:'Recorded in Slate',caption:'Conversation context for admissions'},
 review:{number:'04',title:'Counselor review',caption:'Decision-ready context and follow-up'},
 next:{number:'05',title:'A clear next step',caption:'One connected recruitment journey'}
};
const state={channel:'website',route:'compare',reviews:{},expanded:false,activeStage:null};
for(const [key,route] of Object.entries(routes))state.reviews[key]={draft:route.draft,status:'unreviewed',editing:false,feedback:'Awaiting review'};

function announce(message){$('#announcement').textContent=message;}
function setPressed(selector,value,key){$$(selector).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[key]===value)));}
function fillChips(selector,values){$(selector).replaceChildren(...values.map(value=>{const chip=document.createElement('span');chip.textContent=value;return chip;}));}

function setExpanded(expanded,{focus=false}={}){
 state.expanded=expanded;
 $('#journey').classList.toggle('is-collapsed',!expanded);
 $('#journey-toggle').setAttribute('aria-expanded',String(expanded));
 $('#journey-toggle').innerHTML=expanded?'Collapse flow <span aria-hidden="true">↙</span>':'Expand flow <span aria-hidden="true">↗</span>';
 $$('[data-stage]').forEach(card=>{
  const cover=card.dataset.stage==='next';
  card.inert=!expanded&&!cover;
  card.setAttribute('aria-expanded','false');
  if(!expanded&&!cover)card.setAttribute('aria-hidden','true');else card.removeAttribute('aria-hidden');
  if(!expanded&&cover){card.removeAttribute('aria-haspopup');card.setAttribute('aria-controls','journey-canvas');card.setAttribute('aria-label','Expand recruitment journey: A clear next step');}
  else{card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-controls','stage-dialog');card.removeAttribute('aria-label');}
 });
 if(focus)$('[data-stage="next"]').focus({preventScroll:true});
 announce(expanded?'Recruitment journey expanded. Five stages are available.':'Recruitment journey collapsed into A clear next step.');
}

function openStage(id){
 if(!stages[id])return;
 if(!state.expanded){setExpanded(true,{focus:true});return;}
 const dialog=$('#stage-dialog'),stage=stages[id];
 state.activeStage=id;
 $$('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==id);
 $$('[data-stage]').forEach(card=>{const active=card.dataset.stage===id;card.setAttribute('aria-expanded',String(active));if(active)card.setAttribute('aria-current','step');else card.removeAttribute('aria-current');});
 $('#panel-number').textContent=stage.number;
 $('#panel-title').textContent=stage.title;
 $('#panel-caption').textContent=stage.caption;
 $('.panel-header').classList.toggle('is-human',id==='review');
 if(!dialog.open)dialog.showModal();
 $('.panel-body').scrollTop=0;
 $('#panel-title').focus({preventScroll:true});
 announce(`${stage.title} opened.`);
}

function closeStage({returnFocus=true}={}){
 const dialog=$('#stage-dialog'),id=state.activeStage;
 if(!dialog.open)return;
 dialog.close();
 state.activeStage=null;
 $$('[data-stage]').forEach(card=>{card.setAttribute('aria-expanded','false');card.removeAttribute('aria-current');});
 if(returnFocus&&id)$(`[data-stage="${id}"]`).focus({preventScroll:true});
 announce('Back to the recruitment journey. Your selections are retained.');
}

function renderChannel(){
 const channel=channels[state.channel];
 setPressed('[data-channel]',state.channel,'channel');
 $('#channel-summary').textContent=channel.summary;
 $('#question-channel').textContent=channel.from;
 $('#record-channel').textContent=channel.label;
 $('#next-channel').textContent=channel.from;
}

function renderSpecialist(key,route){
 const card=$(`#${key}-specialist`);
 const active=route.active.includes(key);
 card.classList.toggle('is-active',active);
 card.querySelector('.status').textContent=active?'Consulted':'Not needed';
 card.querySelector('.contribution').textContent=route[key][0];
 card.querySelector('.source').hidden=!active;
 card.querySelector('.source strong').textContent=route[key][1];
}

function renderReview(){
 const route=routes[state.route],review=state.reviews[state.route];
 $('#review-why').textContent=route.reviewWhy;
 $('#review-established').textContent=route.established;
 $('#review-decision').textContent=route.decision;
 $('#draft-message').textContent=review.draft;
 $('#draft-message').hidden=review.editing;
 $('#editor-wrap').hidden=!review.editing;
 $('#draft-editor').value=review.draft;
 $('#review-feedback').textContent=review.feedback;
 $$('[data-action]').forEach(button=>{
  const selected=(button.dataset.action==='approve'&&review.status==='approved')||(button.dataset.action==='hold'&&review.status==='held')||(button.dataset.action==='edit'&&review.editing);
  button.setAttribute('aria-pressed',String(selected));
  button.disabled=review.editing&&button.dataset.action!=='edit';
 });
}

function renderRoute(){
 const route=routes[state.route];
 setPressed('[data-route]',state.route,'route');
 $('#selected-question').textContent=`“${route.question}”`;
 $('#route-title').textContent=route.title;
 $('#route-reason').textContent=route.reason;
 fillChips('#route-intent',route.intent);
 renderSpecialist('mba',route);
 renderSpecialist('masters',route);
 $('#human-boundary').hidden=!route.human;
 $('#result-title').textContent=route.result;
 $('#result-text').textContent=route.resultText;
 fillChips('#result-points',route.points);
 $('#result-boundary').textContent=route.boundary;
 $('#record-interest').textContent=route.interest;
 $('#record-question').textContent=route.recordQuestion;
 $('#record-matters').textContent=route.matters;
 $('#next-title').textContent=route.next;
 $('#next-copy').textContent=route.nextCopy;
 $('#next-status').textContent=route.nextStatus;
 renderReview();
}

$$('[data-channel]').forEach(button=>button.addEventListener('click',()=>{
 state.channel=button.dataset.channel;
 renderChannel();
 announce(`${channels[state.channel].label} selected. The conversation context has been updated.`);
}));

$$('[data-route]').forEach(button=>button.addEventListener('click',()=>{
 state.route=button.dataset.route;
 renderRoute();
 announce(`Question selected: ${routes[state.route].question}`);
}));

$$('[data-action]').forEach(button=>button.addEventListener('click',()=>{
 const review=state.reviews[state.route];
 if(button.dataset.action==='edit'){
  review.editing=true;
  review.status='unreviewed';
  review.feedback='Editing · Review again after saving';
 }else if(button.dataset.action==='approve'){
  review.status='approved';
  review.feedback='Follow-up wording approved · Nothing sent';
 }else{
  review.status='held';
  review.feedback='Follow-up held · Resolve the open question first';
 }
 renderReview();
 if(review.editing)$('#draft-editor').focus();
}));

$('#draft-editor').addEventListener('input',event=>{state.reviews[state.route].draft=event.target.value;});
$('#save-edit').addEventListener('click',()=>{
 const review=state.reviews[state.route];
 if(!review.draft.trim()){
  review.feedback='Add wording before saving.';
  $('#review-feedback').textContent=review.feedback;
  $('#draft-editor').focus();
  return;
 }
 review.editing=false;
 review.status='edited';
 review.feedback='Edit saved · Needs review';
 renderReview();
 $('[data-action="edit"]').focus();
});

$('#journey-toggle').addEventListener('click',()=>setExpanded(!state.expanded,{focus:state.expanded}));
$$('[data-stage]').forEach(card=>card.addEventListener('click',()=>openStage(card.dataset.stage)));
$$('[data-open-stage]').forEach(button=>button.addEventListener('click',()=>openStage(button.dataset.openStage)));
$('#close-stage').addEventListener('click',()=>closeStage());
$('#stage-dialog').addEventListener('cancel',event=>{event.preventDefault();closeStage();});
$('#stage-dialog').addEventListener('click',event=>{if(event.target===$('#stage-dialog'))closeStage();});
$('#collapse-journey').addEventListener('click',()=>{
 closeStage({returnFocus:false});
 setExpanded(false,{focus:true});
 $('#journey').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});

renderChannel();
renderRoute();
setExpanded(false);
