(function(){
'use strict';
const id='rmDailyRelationshipReview';const $=name=>document.getElementById(name);
function go(mode){const cmd=window.rmGrowthCommand;if(cmd&&typeof cmd.open==='function'){cmd.open();if((mode==='protect'||mode==='near')&&typeof cmd.view==='function')cmd.view(mode)}else if(typeof switchTab==='function')switchTab('portfolio')}
function update(){
const st=window.rmGrowthCommand&&window.rmGrowthCommand.state,title=$('rmDailyRelationshipHeadline'),detail=$('rmDailyRelationshipDetail');if(!title||!detail)return;
if(!st||!st.loaded){title.textContent='Review your active C-agent relationships today';detail.textContent=st&&!st.loading?'⚠ Shared agent data could not be verified. Refresh the Grow + Protect work order before relying on any counts.':'Check buyer opportunities, referral gaps and next commitments. Live profile counts are loading.';return}
const all=st.rows.filter(r=>r.tier==='C'),stale=all.filter(r=>r.daysNoLead!==null&&r.daysNoLead>=30),unknown=all.filter(r=>r.daysNoLead===null),near=all.filter(r=>r.closings===1),missing=all.filter(r=>!String(r.next_growth_opportunity||'').trim());
title.textContent='Review '+all.length+' active C-agent relationships today';
detail.textContent=stale.length+' with no recorded lead in 30+ days · '+near.length+' with one closing · '+missing.length+' missing a next growth action'+(unknown.length?' · '+unknown.length+' need last-lead verification':'')+'.';
}
function mountProspecting(head){
if($('rmDailyProspecting'))return;
const section=document.createElement('section');section.id='rmDailyProspecting';section.setAttribute('aria-label','Daily prospecting time');
const label=document.createElement('strong');label.textContent='PROTECTED PROSPECTING · 60 MINUTES DAILY';
const explain=document.createElement('p');explain.textContent='Reserve one uninterrupted hour for cold calls and new-agent outreach, or use two 30-minute blocks. This is new-business prospecting, separate from existing-agent follow-ups.';
const schedule=document.createElement('div');schedule.className='rmProspectSchedule';
for(const [n,time] of [[1,'09:00'],[2,'14:00']]){
 const block=document.createElement('label');block.className='rmProspectSlot';
 const title=document.createElement('span');title.textContent='Block '+n+' · 30 minutes';
 const input=document.createElement('input');input.type='time';input.value=time;input.setAttribute('aria-label','Prospecting block '+n+' start time');
 block.append(title,input);schedule.append(block);
}
const footer=document.createElement('div');footer.className='rmProspectFooter';
const note=document.createElement('small');note.textContent='Suggested times are editable for today. Blocks are planned time, not logged activity or calendar reservations.';
const action=document.createElement('button');action.type='button';action.textContent='Log prospecting activity →';action.addEventListener('click',()=>{if(typeof switchTab==='function')switchTab('log');else {note.textContent='Activity log unavailable. Open the Log Activity section from navigation.'}});
footer.append(note,action);section.append(label,explain,schedule,footer);head.after(section);
}
function mount(){
const pace=$('rm358Pace');if(!pace)return;const head=pace.querySelector('.rm358-pace-head');if(!head)return;mountProspecting(head);if($(id))return;
const wrap=document.createElement('aside');wrap.id=id;wrap.setAttribute('aria-label','Daily C-agent relationship review');
const copy=document.createElement('div');copy.className='rmDailyRelationCopy';
const kicker=document.createElement('span');kicker.className='rmDailyRelationEyebrow';kicker.textContent='DAILY RELATIONSHIP CHECK';
const title=document.createElement('strong');title.id='rmDailyRelationshipHeadline';
const detail=document.createElement('small');detail.id='rmDailyRelationshipDetail';
copy.append(kicker,title,detail);const actions=document.createElement('div');actions.className='rmDailyRelationActions';
const all=document.createElement('button');all.type='button';all.textContent='Review all C agents →';all.addEventListener('click',()=>go('grow'));
const risk=document.createElement('button');risk.type='button';risk.textContent='Protect at-risk C agents →';risk.addEventListener('click',()=>go('protect'));
const nearBtn=document.createElement('button');nearBtn.type='button';nearBtn.textContent='C agents close to B →';nearBtn.addEventListener('click',()=>go('near'));actions.append(all,risk,nearBtn);wrap.append(copy,actions);$('rmDailyProspecting').after(wrap);update();
}
const style=document.createElement('style');style.id='rmDailyRelationshipAuditStyles';
style.textContent=[
'#rmDailyRelationshipReview{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;padding:15px 17px;margin:11px 0 16px;background:#f5f0fb;border:1px solid #d8c6ed;border-left:4px solid #7350af;border-radius:11px}',
'.rmDailyRelationCopy{display:flex;flex:1;min-width:230px;flex-direction:column;gap:4px}',
'.rmDailyRelationEyebrow{font-size:10px;color:#654399;font-weight:800;letter-spacing:.07em}',
'#rmDailyRelationshipHeadline{font-size:15px;color:#2f214a;font-weight:800}',
'#rmDailyRelationshipDetail{font-size:11px;line-height:1.5;color:#625474}',
'.rmDailyRelationActions{display:flex;gap:7px;flex-wrap:wrap}',
'.rmDailyRelationActions button{background:#583588;border:1px solid #583588;color:white;border-radius:8px;padding:9px 12px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700}',
'.rmDailyRelationActions button+button{background:white;color:#583588}',
'#rmDailyProspecting{padding:16px 18px;margin:10px 0 15px;background:#fff;border:1px solid #e2d8ee;border-left:4px solid #583588;border-radius:10px;color:#32244d}',
'#rmDailyProspecting strong{font-size:14px;color:#382151}',
'#rmDailyProspecting p{font-size:12px;margin:7px 0;line-height:1.55}',
'.rmProspectSchedule{display:flex;flex-wrap:wrap;gap:10px;margin-top:9px}',
'.rmProspectSlot{display:flex;align-items:center;gap:8px;background:#f6f0fc;border-radius:8px;padding:9px 11px;font-size:12px}',
'.rmProspectSlot input{font:inherit;border:1px solid #d3c4e4;border-radius:6px;padding:5px;background:white}',
'.rmProspectFooter{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-top:10px}',
'.rmProspectFooter small{font-size:11px;color:#695779;flex:1}',
'.rmProspectFooter button{background:#583588;color:white;border:0;border-radius:8px;padding:9px 12px;cursor:pointer;font-weight:700}',
'@media(max-width:670px){.rmDailyRelationActions,.rmDailyRelationActions button{width:100%}}'
].join('\n');document.head.append(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.addEventListener('rm-growth-updated',()=>{mount();update()});
let pending=false;function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;mount()})}
function watch(){const root=$('view-week');if(root){new MutationObserver(schedule).observe(root,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();

/* RM workspace visual clean-up. Presentation only; underlying data validation remains active. */
(function compactAmandaWorkspace(){
 const style=document.createElement('style');style.id='rmCompactWorkspaceStyles';
 style.textContent=String.raw`
 .rmCompactWorkOrder{padding:17px 20px!important;border:1px solid #e5dced!important;border-radius:14px!important;box-shadow:none!important;background:#fff!important}
 .rmCompactWorkOrder h2,.rmCompactWorkOrder h3{letter-spacing:-.02em!important}
 .rmCompactWorkOrder button,.rmCompactWorkOrder a[class*="btn"],.rmCompactWorkOrder [role="button"]{
   min-height:0!important;padding:8px 12px!important;font-size:12px!important;line-height:1.3!important;
   border-radius:8px!important;box-shadow:none!important;transform:none!important;
   font-weight:650!important;white-space:normal!important;
 }
 .rmCompactWorkOrder button:not(:hover),.rmCompactWorkOrder a[class*="btn"]:not(:hover){box-shadow:none!important}
 .rmCompactWorkOrder button,.rmCompactWorkOrder a[class*="btn"]{background:#fff!important;color:#56318a!important;border:1px solid #dcd0ec!important}
 .rmCompactWorkOrder button.rmCompactPrimary,.rmCompactWorkOrder a.rmCompactPrimary{background:#58358c!important;border-color:#58358c!important;color:#fff!important}
 .rmCompactWorkOrder button:focus-visible,.rmCompactWorkOrder a:focus-visible{outline:2px solid #58358c!important;outline-offset:3px!important}
 .rmCompactWorkOrder .rmCompactTask{padding-top:10px!important;padding-bottom:10px!important;margin-top:0!important;margin-bottom:0!important;min-height:0!important}
 .rmCompactWorkOrder .rmCompactTask p{font-size:12px!important;line-height:1.4!important;margin:3px 0!important}
 .rmCompactWorkOrder .rmCompactTask h3,.rmCompactWorkOrder .rmCompactTask h4{font-size:14px!important}
 .rmCompactWorkOrder .rmCompactTask>div:last-child{gap:6px!important}
 .rmCompactWorkOrder .rmCompactTask[style*="background"]{background:#fff!important}
 #rmDailyRelationshipReview{background:#fff!important;border:1px solid #e7dfec!important;border-left:3px solid #58358c!important;padding:12px 15px!important}
 #rmDailyProspecting{background:#faf8fd!important;border:1px solid #e4dbef!important;border-left:3px solid #58358c!important;padding:12px 15px!important}
 #rmDailyProspecting button,.rmDailyRelationActions button{padding:7px 11px!important;font-size:11px!important;box-shadow:none!important;background:#58358c!important;color:#fff!important}
 .rmDailyRelationActions button+button{background:#fff!important;color:#58358c!important}
 #rmGrowAdminAudit{display:none!important}
 @media(max-width:760px){.rmCompactWorkOrder{padding:12px!important}.rmCompactWorkOrder .rmCompactTask{display:flex!important;flex-wrap:wrap!important;gap:8px!important}}
 `;
 document.head.append(style);
 function clean(){
  const week=document.getElementById('view-week')||document;
  const headings=[...week.querySelectorAll('h1,h2,h3,h4')];
  const header=headings.find(x=>/today.s work order/i.test(x.textContent||''));
  if(header){
   let panel=header.closest('section,article');
   if(!panel){panel=header.parentElement?.parentElement?.parentElement}
   if(panel&&panel!==document.body){
    panel.classList.add('rmCompactWorkOrder');
    const nodes=[...panel.querySelectorAll('div,li,article,section')];
    for(const el of nodes){
     if(el===panel)continue;
     const children=[...el.children];
     const self=children.some(c=>/^(1|2|3|4|5)$/.test((c.textContent||'').trim())) ||
       (el.querySelector('button')&&/^(urgent updates|follow-ups due today|protect c-agent relationships|daily prospecting|grow actual business)/i.test((el.textContent||'').trim()));
     if(self&&children.length>=2&&children.length<=6&&el.querySelectorAll('button').length<=3)el.classList.add('rmCompactTask');
    }
    const buttons=[...panel.querySelectorAll('button')];
    buttons.forEach(b=>{if(/^(transaction calls|4-week campaign follow-ups|start prospecting block)$/i.test((b.textContent||'').replace(/[→›]/g,'').trim()))b.classList.add('rmCompactPrimary')});
   }
  }
  // Hide only the RM-facing reconciliation notices; never change validation or counts.
  for(const el of document.querySelectorAll('body *')){
   if(el.children.length!==0 || !el.textContent)continue;
   const t=el.textContent.trim();
   if(!(/Shared Power BI cannot be verified/i.test(t)||/Shared data: reconciliation required/i.test(t)))continue;
   let target=el;
   for(let i=0;i<3&&target.parentElement;i++){
    const p=target.parentElement;
    if(p===document.body||p.querySelectorAll('button,input').length>1||p.textContent.length>650)break;
    target=p;
    if(p.matches('[role="alert"],aside,section')||p.getBoundingClientRect().height>20&&p.getBoundingClientRect().height<105)break;
   }
   target.style.setProperty('display','none','important');
  }
 }
 let pending=false;function enqueue(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;clean()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{clean();new MutationObserver(enqueue).observe(document.body,{childList:true,subtree:true})});
 else{clean();new MutationObserver(enqueue).observe(document.body,{childList:true,subtree:true})}
})();

})();