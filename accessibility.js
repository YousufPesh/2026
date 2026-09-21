'use strict';
const $=s=>document.querySelector(s);
let selected=0,view='before',activeStep=null;
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
    const path=b.x>=a.x+a.w+8
      ? `M ${a.x+a.w+3} ${a.y+a.h/2} L ${b.x-4} ${b.y+b.h/2}`
      : `M ${a.x+a.w/2} ${a.y-3} L ${b.x+b.w/2} ${b.y+b.h+4}`;
    $(`#workflow-forward-${i}`).setAttribute('d',path);
  }
  const top=rects[4],source=rects[0],right=base.width-11,bottom=base.height-22;
  $('#workflow-return').setAttribute('d',`M ${top.x+top.w+3} ${top.y+top.h/2} H ${right-8} Q ${right} ${top.y+top.h/2} ${right} ${top.y+top.h/2+8} V ${bottom-10} Q ${right} ${bottom} ${right-10} ${bottom} H ${source.x+source.w/2+8} Q ${source.x+source.w/2} ${bottom} ${source.x+source.w/2} ${bottom-8} V ${source.y+source.h+5}`);
}
let wireAnimation;
function animateWorkflowWires(){cancelAnimationFrame(wireAnimation);const end=performance.now()+1000;function frame(){drawWorkflowWires();if(performance.now()<end)wireAnimation=requestAnimationFrame(frame);}frame();}
new ResizeObserver(drawWorkflowWires).observe($('.workflow-canvas'));
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>{const collection=button.dataset.source==='collection';document.querySelectorAll('[data-source]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));$('#source-art').classList.toggle('collection',collection);$('#source-title').textContent=collection?'Course materials':'Your document';$('#source-systems').hidden=!collection;$('#source-caption').textContent=collection?'Connect course or file systems.':'Start with a PDF from your computer.';$('#source-detail').textContent=collection?'Bring materials from Canvas, Blackboard, Brightspace D2L, or SharePoint into the workflow. Audit and remediate a collection of documents.':'Use one document to see what needs attention, what changes, and where your team’s judgment matters.';announce(collection?'Course materials from Canvas, Blackboard, Brightspace D2L, or SharePoint.':'Showing the single-PDF source.');}));
const comparisonCaptions={syllabus:['The page looks organized. Its semantic structure is missing.','Selected headings, lists, table roles, and reading order are illustrated.'],assessment:['The grid is visible. Header and cell relationships are not tagged.','The illustration identifies table headers and data cells.'],reading:['Two columns are visible. Their reading sequence is not defined by tags.','Follow the left column, then the right, then the figure.'],assignment:['Section titles and checklist items have no semantic tags.','Headings, prose, and lists are identified; the photo is decorative.'],math:['Handwritten formulas sit inside an untagged scan.','The explanation is rebuilt as typed text and formulas.'],chart:['The chart’s values rely on visual presentation.','The figure text alternative states attendance for each session.']};
examples.forEach((example,i)=>{const option=document.createElement('option');option.value=i;option.textContent=example.name;$('#example-select').append(option);});

const panels={
 sources:['01 / Source systems','One PDF. Or your course materials.','Bring documents into the workflow from a file or a connected source.'],
 audit:['02 / Audit','Understand what needs attention.','Scan the document for issues that its visual appearance may hide.'],
 remediation:['03 / AI remediation','Match the work to the document.','Choose the approach, address the structure, and compare the changes.'],
 review:['04 / Human review','Inspect, edit, and check again.','Your team reviews the result, applies corrections, and revalidates.'],
 output:['05 / Accessible PDF','Close the loop at the source.','Use the reviewed result, keep track of progress, and repeat as materials change.']
};
function openStep(id,{focus=true,hash=true}={}){
 if(!panels[id])return;
 activeStep=id;

 document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==id);
 document.querySelectorAll('[data-flow]').forEach(el=>{const current=el.dataset.flow===id;el.setAttribute('aria-expanded',String(current));if(current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 const [kicker,title,intro]=panels[id];$('#panel-kicker').textContent=kicker;$('#panel-title').textContent=title;$('#panel-intro').textContent=intro;
 $('#example-view').hidden=!['audit','remediation','review','output'].includes(id);
 view=id==='audit'?'before':'after';renderExample();
 if(hash)history.replaceState(null,'',`#${id}`);
 animateWorkflowWires();
 if(!$('#step-panel').open)$('#step-panel').showModal();
 $('.step-popup-body').scrollTop=0;
 if(focus)$('#panel-title').focus({preventScroll:true});
 announce(`${title} ${examples[selected].name} remains selected.`);
}
function closeStep(){if($('#step-panel').open)$('#step-panel').close();}
$('#close-step').addEventListener('click',closeStep);
$('#step-panel').addEventListener('close',()=>{
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
document.querySelectorAll('[data-flow],[data-open]').forEach(el=>el.addEventListener('click',()=>openStep(el.dataset.flow||el.dataset.open)));
function renderExample(){
 const e=examples[selected];const mode=e.mode==='Reconstruct'?'Full reconstruction':e.mode;
 $('#example-select').value=selected;$('#example-mode').textContent=mode;$('#recommended-mode').textContent=mode;
 document.querySelectorAll('[data-example]').forEach(el=>el.textContent=e[el.dataset.example]);document.querySelectorAll('[data-example-name]').forEach(el=>el.textContent=e.name);
 $('#document-image').src=`assets/${e[view]}`;const alt=`${view==='before'?'Before':'After'} synthetic illustration. ${e.subject} ${view==='before'?'No existing tag structure.':e.change}`;$('#document-image').alt=alt;
 $('#dialog-image').src=`assets/${e[view]}`;$('#dialog-image').alt=alt;$('#dialog-title').textContent=`${e.name} · ${view==='before'?'Before':'After'}`;
 $('#example-caption').textContent=comparisonCaptions[e.id][view==='before'?0:1];$('#text-summary').textContent=e.summary;
 document.querySelectorAll('[data-state],[data-dialog-state]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.state||button.dataset.dialogState)===view)));
}
$('#example-select').addEventListener('change',event=>{selected=Number(event.target.value);renderExample();announce(`${examples[selected].name} selected for the walkthrough.`);});
document.querySelectorAll('[data-state],[data-dialog-state]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.state||button.dataset.dialogState;renderExample();announce(`${examples[selected].name}, ${view}. ${$('#example-caption').textContent}`);}));
const reviewSteps=[
 ['Inspect and edit in the Tag Editor','Check the tags against the content. Correct roles and heading hierarchy, adjust reading order, and review image descriptions. Use the original document to check meaning.'],
 ['Apply the corrections','Save the changes made in the Tag Editor to the document. Applying an edit is the step before checking the revised result.'],
 ['Revalidate the revised document','Run validation again after applying the corrections. Check the revised document for remaining issues.'],
 ['Read the updated report','After applying changes and revalidating, review the updated findings and score. Use remaining issues to guide another round of human review.']
];
function selectReview(index){document.querySelectorAll('[data-review]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.review)===index)));$('#review-detail-title').textContent=reviewSteps[index][0];$('#review-detail-copy').textContent=reviewSteps[index][1];$('#tag-edit-illustration').hidden=index!==0;$('#report-points').hidden=index!==3;}
document.querySelectorAll('[data-review]').forEach(el=>el.addEventListener('click',()=>selectReview(Number(el.dataset.review))));
const scopes={document:['Document','Inspect changes and review the updated report.','document'],course:['Course','Follow the documents in the courses you can access.','folder'],department:['Department','See the broader view when your access spans courses.','campus']};
document.querySelectorAll('[data-scope]').forEach(button=>button.addEventListener('click',()=>{const scope=button.dataset.scope;document.querySelectorAll('[data-scope]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));document.querySelectorAll('.scope-plate').forEach(el=>el.classList.toggle('is-selected',el.classList.contains(`${scope}-plate`)));$('#scope-name').textContent=scopes[scope][0];$('#scope-copy').textContent=scopes[scope][1];setIcon($('#scope-icon'),scopes[scope][2]);announce(`${scopes[scope][0]}: ${scopes[scope][1]}`);}));
const dialog=$('#image-dialog');
function resetZoom(){ $('.dialog-scroll').classList.remove('zoomed');$('#zoom').setAttribute('aria-pressed','false');$('#zoom').textContent='Zoom in';$('.dialog-scroll').scrollTo(0,0);}
$('#enlarge').addEventListener('click',()=>{renderExample();resetZoom();dialog.showModal();});$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>$('#enlarge').focus({preventScroll:true}));
dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,summary,[tabindex="0"]')];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
$('#zoom').addEventListener('click',()=>{const zoomed=$('.dialog-scroll').classList.toggle('zoomed');$('#zoom').setAttribute('aria-pressed',String(zoomed));$('#zoom').textContent=zoomed?'Fit to width':'Zoom in';if(!zoomed)$('.dialog-scroll').scrollTo(0,0);});

history.scrollRestoration='manual';
function readHash(){const hash=location.hash.slice(1);const aliases={scale:'sources',approach:'remediation',pipeline:'review',results:'remediation',oversight:'output','your-pdf':'sources'};const id=aliases[hash]||hash;if(panels[id])openStep(id,{focus:false,hash:false});else if(activeStep)closeStep();}
window.addEventListener('hashchange',readHash);
selectReview(0);renderExample();readHash();animateWorkflowWires();
requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
