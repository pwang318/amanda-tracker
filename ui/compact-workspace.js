(function(){
'use strict';
var style=document.createElement('style');style.id='rmClean2026Style';
style.textContent=[
'.rmCleanWorkOrder{padding:15px 18px!important;border:1px solid #e8e2ee!important;border-radius:12px!important;background:#fff!important;box-shadow:none!important}',
'.rmCleanWorkOrder h2{font-size:19px!important;margin-bottom:6px!important}',
'.rmCleanWorkOrder p{font-size:12px!important;line-height:1.4!important}',
'.rmCleanWorkOrder .rmCleanTask{padding-top:9px!important;padding-bottom:9px!important;min-height:0!important;margin:0!important;box-shadow:none!important}',
'.rmCleanWorkOrder button,.rmCleanWorkOrder a[class*="btn"]{background:#fff!important;color:#57348b!important;border:1px solid #ded4ea!important;padding:7px 10px!important;min-height:0!important;min-width:0!important;font-size:11px!important;line-height:1.3!important;font-weight:650!important;border-radius:7px!important;box-shadow:none!important;transform:none!important}',
'.rmCleanWorkOrder button:hover{background:#f4eff9!important;border-color:#9f83c3!important}',
'.rmCleanWorkOrder button:focus-visible{outline:2px solid #57348b!important;outline-offset:2px!important}',
'.rmCleanWorkOrder .rmCleanTask button{max-width:225px!important}',
'#rmWorkdayPlan{border-top:1px solid #ede7f3;margin-top:10px;padding:12px 3px 2px}',
'#rmWorkdayPlan summary{font-size:12px;font-weight:750;color:#503576;cursor:pointer}',
'#rmWorkdayPlan p{font-size:11px;color:#6d6279;margin:9px 0}',
'#rmWorkdayPlan .rmPlanRows{display:grid;grid-template-columns:1fr 1fr;gap:3px 15px}',
'#rmWorkdayPlan .rmPlanRow{display:flex;align-items:baseline;gap:9px;padding:6px 3px;border-bottom:1px solid #f0eaf5;font-size:11px}',
'#rmWorkdayPlan .rmPlanTime{min-width:95px;color:#776b86;font-variant-numeric:tabular-nums}',
'#rmWorkdayPlan .rmPlanName{font-weight:600;color:#33224e}',
'#rmDailyRelationshipReview,#rmDailyProspecting{display:none!important}',
'[data-director-only-warning="true"]{display:none!important}',
'@media(max-width:800px){#rmWorkdayPlan .rmPlanRows{grid-template-columns:1fr}.rmCleanWorkOrder .rmCleanTask{flex-wrap:wrap!important}}'
].join('\n');document.head.append(style);
var jobs=[
 ['8:30–9:15','Urgent transaction checks','45 min'],
 ['9:15–10:15','Protected new-agent prospecting','60 min'],
 ['10:15–11:45','Campaign and overdue follow-ups','90 min'],
 ['11:45–12:45','C-agent retention and growth','60 min'],
 ['12:45–1:15','Lunch, outside work hours','break'],
 ['1:15–2:30','Transaction and buyer follow-through','75 min'],
 ['2:30–3:30','New/existing agent meetings','60 min'],
 ['3:30–4:15','LP coordination and referrals','45 min'],
 ['4:15–5:00','Activity log and next-day planning','45 min']
];
function mountPlan(panel){
 if(panel.querySelector('#rmWorkdayPlan'))return;
 var d=document.createElement('details');d.id='rmWorkdayPlan';
 var s=document.createElement('summary');s.textContent='8-hour workday plan · expand time blocks';
 var intro=document.createElement('p');intro.textContent='480 minutes of planned activity, including 60 minutes of prospecting. Adapt around meetings; planned time is not a completed activity or calendar booking. Lunch is separate.';
 var rows=document.createElement('div');rows.className='rmPlanRows';
 jobs.forEach(function(job){var row=document.createElement('div');row.className='rmPlanRow';var tm=document.createElement('span');tm.className='rmPlanTime';tm.textContent=job[0];var label=document.createElement('span');label.className='rmPlanName';label.textContent=job[1]+' · '+job[2];row.append(tm,label);rows.append(row)});
 d.append(s,intro,rows);panel.append(d);
}
function panel(){
 var h=[...document.querySelectorAll('h1,h2,h3,h4')].find(function(x){return /today.s work order/i.test(x.textContent||'')});
 if(!h)return null;var p=h;
 for(var i=0;i<9&&p.parentElement;i++){p=p.parentElement;var t=p.textContent||'';if(/urgent updates/i.test(t)&&/grow actual business/i.test(t)&&t.length<12500)return p}
 return null;
}
function simplify(){
 var root=panel();
 if(root){
  root.classList.add('rmCleanWorkOrder');
  ['Urgent updates','Follow-ups due today','Protect C-agent relationships','Daily prospecting','Grow actual business'].forEach(function(name){
   var h=[...root.querySelectorAll('h3,h4,h5,strong,b')].find(function(x){return (x.textContent||'').trim().toLowerCase().startsWith(name.toLowerCase())});
   if(!h)return;var p=h;
   for(var i=0;i<6&&p.parentElement;i++){p=p.parentElement;var buttons=p.querySelectorAll('button').length;if(buttons>0&&buttons<=3&&(p.textContent||'').length<950){p.classList.add('rmCleanTask');break}}
  });
  var desc=[...root.querySelectorAll('p')].find(function(x){return /one clear route through your day/i.test(x.textContent||'')});
  if(desc)desc.textContent='A focused worklist for transactions, relationships and business growth.';
  mountPlan(root);
 }
 ['rmDailyRelationshipReview','rmDailyProspecting'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove()});
 // Detailed scorecard belongs in My Scorecard, not repeated as large loading cards on Today.
 [...document.querySelectorAll('#view-week h1,#view-week h2,#view-week h3')].forEach(function(h){
  if(!/^scorecard progress$/i.test((h.textContent||'').trim()))return;
  var p=h;for(var i=0;i<6&&p.parentElement;i++){p=p.parentElement;var t=p.textContent||'';
   if(/referral leads/i.test(t)&&/b-tier accounts/i.test(t)&&/active agents/i.test(t)&&!/today.s work order/i.test(t)){p.style.setProperty('display','none','important');break}
  }
 });
}
function suppressWarnings(){
 var regex=/(shared power bi cannot be verified|shared data:\s*reconciliation required|only \d+ of \d+ agent profiles stamped|power bi import incomplete)/i;
 for(var el of document.querySelectorAll('body *')){
  if(el.children.length||!regex.test(el.textContent||''))continue;
  var node=el;
  for(var i=0;i<4&&node.parentElement&&node.parentElement!==document.body;i++){
   var p=node.parentElement;
   if(p.querySelectorAll('button,input,textarea').length>1||(p.textContent||'').length>500)break;
   node=p;if(p.matches('[role="alert"],section,aside'))break;
  }
  node.setAttribute('data-director-only-warning','true');
 }
}
function run(){simplify();suppressWarnings()}
var pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;run()})}
function start(){run();var area=document.getElementById('view-week');if(area)new MutationObserver(schedule).observe(area,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();