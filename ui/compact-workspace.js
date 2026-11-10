(function(){
'use strict';
const css=document.createElement('style');css.id='rmTodayCleanV3';
css.textContent=[
'#view-week{max-width:1180px;margin:0 auto}',
'#view-week #rm350Workboard{padding:15px 18px!important;border:1px solid #e7e0ef!important;box-shadow:none!important;border-radius:12px!important}',
'#view-week #rm350Workboard .rm-daily-step{padding:10px 5px!important;min-height:0!important}',
'#view-week #rm350Workboard .rm-daily-step-title{font-size:14px!important}',
'#view-week #rm350Workboard .rm-daily-step-description{font-size:12px!important;line-height:1.35!important}',
'#view-week #rm350Workboard .rm-daily-step-link,#view-week #rm350Workboard button,#view-week #rm350Workboard a[class*="btn"]{background:#fff!important;background-image:none!important;color:#553584!important;border:1px solid #ddd3eb!important;border-radius:7px!important;padding:8px 11px!important;min-height:0!important;min-width:0!important;font-size:11px!important;line-height:1.3!important;font-weight:650!important;box-shadow:none!important;transform:none!important}',
'#view-week #rm350Workboard button:hover,#view-week #rm350Workboard a:hover{background:#f4f0f9!important;border-color:#9c82c0!important}',
'#view-week #rm350Workboard button:focus-visible,#view-week #rm350Workboard a:focus-visible{outline:2px solid #553584!important;outline-offset:2px!important}',
'#view-week #rm350Workboard .rm-daily-step-link.rm-daily-primary,#view-week #rm350Workboard .rm-daily-primary{background:#fff!important;color:#553584!important;border-color:#ddd3eb!important}',
'#view-week #rm350Workboard .rm-daily-step-link.rm-daily-primary:hover{background:#f4f0f9!important}',
'#rmDailyRelationshipReview,#rmDailyProspecting{display:none!important}',
'#rmWorkdayPlan{display:none!important}',
'#view-week .rm-daily-prospect-step{background:#fff!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:10px 5px!important}',
'#view-week .rm-daily-prospect-step .rm-daily-step-num{background:#f1e9fa!important;color:#593b89!important}',
'#rmWorkdayPlan summary{cursor:pointer;color:#553584;font-size:12px;font-weight:750}',
'#rmWorkdayPlan p{font-size:11px;line-height:1.4;color:#6a5d77;margin:6px 0}',
'#rmWorkdayPlan .rmPlanRows{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;margin-top:8px}',
'#rmWorkdayPlan .rmPlanRow{display:flex;gap:9px;padding:6px 2px;font-size:11px;border-bottom:1px solid #f1ebf5}',
'#rmWorkdayPlan .rmPlanTime{min-width:93px;color:#6c617b;font-variant-numeric:tabular-nums}',
'#rmWorkdayPlan .rmPlanName{color:#34234e;font-weight:600}',
'#view-week .rmTodayHideSecondary{display:none!important}',
'#view-week #rm490Score,#view-week #rm490Bottom,#view-week #rm492Additional,#view-week #rmV441Bottom{display:none!important}',
'#view-week #rmV440PortfolioToday{margin:10px 0!important;padding:12px 15px!important;box-shadow:none!important}',
'#view-week #rmV440PortfolioToday .rm-v440-pt-row{padding:9px 10px!important}',
'[data-director-only-warning="true"]{display:none!important}',
'@media(max-width:820px){#rmWorkdayPlan .rmPlanRows{grid-template-columns:1fr}}'
].join('\n');document.head.append(css);
function getWorkboard(){
 return document.getElementById('rm350Workboard') ||
 [...document.querySelectorAll('#view-week h1,#view-week h2,#view-week h3')].map(h=>{
  if(!/today.s work order/i.test(h.textContent||''))return null;
  let p=h;for(let i=0;i<7&&p.parentElement;i++){p=p.parentElement;if(/urgent updates/i.test(p.textContent||'')&&/grow actual business/i.test(p.textContent||'')&&(p.textContent||'').length<10000)return p}return null;
 }).find(Boolean);
}
function mountPlan(board){
 if(board.querySelector('#rmWorkdayPlan'))return;
 const d=document.createElement('details');d.id='rmWorkdayPlan';
 const s=document.createElement('summary');s.textContent='8-hour workday plan · see time blocks';
 const note=document.createElement('p');note.textContent='eight hours of work, with a separate 30-minute lunch. Prospecting is protected for 60 minutes; planned time does not mean an activity has been completed.';
 const rows=document.createElement('div');rows.className='rmPlanRows';
 slots.forEach(([time,name,dur])=>{const row=document.createElement('div');row.className='rmPlanRow';const a=document.createElement('span');a.className='rmPlanTime';a.textContent=time;const b=document.createElement('span');b.className='rmPlanName';b.textContent=name+' · '+dur;row.append(a,b);rows.append(row)});
 d.append(s,note,rows);board.append(d);
}
function findBlock(h,required){
 let p=h;
 for(let i=0;i<7&&p.parentElement;i++){
  p=p.parentElement;const t=p.textContent||'';
  if(p.id==='view-week'||p.id==='rm350Workboard')break;
  if(required.every(x=>t.toLowerCase().includes(x.toLowerCase()))&&t.length<18000)return p;
 }
 return null;
}
function hideSecondary(){
 const home=document.getElementById('view-week');if(!home)return;
 for(const h of home.querySelectorAll('h1,h2,h3,h4')){
  const name=(h.textContent||'').trim();
  if(/^scorecard progress$/i.test(name)){
   const p=findBlock(h,['Referral Leads','B-tier Accounts','Active Agents']);
   if(p)p.classList.add('rmTodayHideSecondary');
  }
  if(/^Today$/i.test(name)){
   const p=findBlock(h,['More work tools','Log an activity']);
   if(p)p.classList.add('rmTodayHideSecondary');
  }
  if(/^Today's Schedule$/i.test(name)||/^Recent Contact Attempts$/i.test(name)){
   const card=h.closest('.card,section,article')||findBlock(h,[]);
   if(card&&card.id!=='view-week')card.classList.add('rmTodayHideSecondary');
  }
 }
}
function hideWarnings(){
 const rx=/(shared power bi cannot be verified|shared data:\s*reconciliation required|only \d+ of \d+ agent profiles stamped|power bi import incomplete)/i;
 for(const el of document.querySelectorAll('body *')){
  if(el.children.length||!rx.test(el.textContent||''))continue;
  let p=el;for(let i=0;i<4&&p.parentElement&&p.parentElement!==document.body;i++){
   const q=p.parentElement;if(q.querySelectorAll('button,input,textarea').length>1||(q.textContent||'').length>500)break;
   p=q;if(p.matches('[role="alert"],aside,section'))break;
  }p.setAttribute('data-director-only-warning','true');
 }
}


// The legacy lower "Today's Priorities" card is an empty shell.
// Only hide the compact shell; never hide a populated task list or the actual execution plan.
function hideEmptyLegacyPriorities(){
 const home=document.getElementById('view-week');if(!home)return;
 for(const heading of home.querySelectorAll('h1,h2,h3,h4')){
  if(!/^today[’']s priorities$/i.test(String(heading.textContent||'').trim()))continue;
  if(heading.closest('#rmExecutionPlan,#rm350Workboard'))continue;
  let panel=null,p=heading.parentElement;
  for(let depth=0;p&&p!==home&&depth<5;depth++,p=p.parentElement){
   if(p.querySelector('#rmExecutionPlan,#rm350Workboard'))break;
   const content=String(p.textContent||'').trim();
   const hasImport=/import new contacts|ctcs/i.test(content);
   const meaningful=p.querySelector('li,[data-priority],[data-agent],.rm-daily-step,.rmCheckItem,table tbody tr');
   if(hasImport&&content.length<450&&!meaningful){panel=p;break}
  }
  if(panel)panel.classList.add('rmTodayHideSecondary');
 }
}
function prospectingExpectation(){
 const board=getWorkboard();if(!board)return;
 const row=board.querySelector('.rm-daily-prospect-step');if(!row)return;
 // Label the expected output, but never treat 25 completed calls as permission to end the time block early.
 const subtitle=row.querySelector('.rm-daily-step-copy small');
 const heading=row.querySelector('.rm-daily-step-copy b');
 if(heading&&heading.textContent!=='Daily prospecting · 60 minutes · 25+ calls')heading.textContent='Daily prospecting · 60 minutes · 25+ calls';
 if(subtitle){
  const wording='Minimum 25 cold-call attempts. Keep dialing for the full hour—even after 25. Prioritize live conversations and booked meetings; log the outcome of each attempt.';
  if(subtitle.textContent!==wording)subtitle.textContent=wording;
 }
}

function render(){
 const board=getWorkboard();
 if(board){
  const oldPlan=board.querySelector('#rmWorkdayPlan');if(oldPlan)oldPlan.remove();
  const desc=[...board.querySelectorAll('p')].find(x=>/one clear route through your day/i.test(x.textContent||''));
  if(desc&&desc.textContent!=='Your focused worklist: transactions, follow-ups, prospecting, and agent growth.')desc.textContent='Your focused worklist: transactions, follow-ups, prospecting, and agent growth.';
 }
 prospectingExpectation();hideSecondary();hideEmptyLegacyPriorities();hideWarnings();
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
function start(){
 render();
 const home=document.getElementById('view-week');if(home)new MutationObserver(schedule).observe(home,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();