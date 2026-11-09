(function(){
'use strict';
const id='rmDailyRelationshipReview';const $=name=>document.getElementById(name);
function go(mode){const cmd=window.rmGrowthCommand;if(cmd&&typeof cmd.open==='function'){cmd.open();if(mode==='protect'&&typeof cmd.view==='function')cmd.view('protect')}else if(typeof switchTab==='function')switchTab('portfolio')}
function update(){
const st=window.rmGrowthCommand&&window.rmGrowthCommand.state,title=$('rmDailyRelationshipHeadline'),detail=$('rmDailyRelationshipDetail');if(!title||!detail)return;
if(!st||!st.loaded){title.textContent='Review your active C-agent relationships today';detail.textContent='Check buyer opportunities, referral gaps and next commitments. Live profile counts are loading.';return}
const all=st.rows.filter(r=>r.tier==='C'),stale=all.filter(r=>r.daysNoLead!==null&&r.daysNoLead>=30),unknown=all.filter(r=>r.daysNoLead===null),near=all.filter(r=>r.closings===1),missing=all.filter(r=>!String(r.next_growth_opportunity||'').trim());
title.textContent='Review '+all.length+' active C-agent relationships today';
const latest=st.profiles.filter(p=>String(p.powerbi_last_seen_at||'').slice(0,10)===String(st.lastSeen||'').slice(0,10));
const imported=st.importLog?Number(st.importLog.rows_processed):null;
const mismatch=imported===null||!Number.isFinite(imported)||imported!==latest.length;
detail.textContent=(mismatch?'⚠ POWER BI SCORECARD NOT RECONCILED: '+(imported===null?'import total unavailable':imported+' source rows')+' / '+latest.length+' matched profiles · ':'')+stale.length+' with no recorded lead in 30+ days · '+near.length+' with one closing · '+missing.length+' missing a next growth action'+(unknown.length?' · '+unknown.length+' need last-lead verification':'')+'. Actual referrals and closings matter more than call volume.';
}
function mount(){
const pace=$('rm358Pace');if(!pace||$(id))return;const head=pace.querySelector('.rm358-pace-head');if(!head)return;
const wrap=document.createElement('aside');wrap.id=id;wrap.setAttribute('aria-label','Daily C-agent relationship review');
const copy=document.createElement('div');copy.className='rmDailyRelationCopy';
const kicker=document.createElement('span');kicker.className='rmDailyRelationEyebrow';kicker.textContent='DAILY RELATIONSHIP CHECK';
const title=document.createElement('strong');title.id='rmDailyRelationshipHeadline';
const detail=document.createElement('small');detail.id='rmDailyRelationshipDetail';
copy.append(kicker,title,detail);const actions=document.createElement('div');actions.className='rmDailyRelationActions';
const all=document.createElement('button');all.type='button';all.textContent='Review all C agents →';all.addEventListener('click',()=>go('grow'));
const risk=document.createElement('button');risk.type='button';risk.textContent='Protect at-risk C agents →';risk.addEventListener('click',()=>go('protect'));
actions.append(all,risk);wrap.append(copy,actions);head.after(wrap);update();
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
'@media(max-width:670px){.rmDailyRelationActions,.rmDailyRelationActions button{width:100%}}'
].join('\n');document.head.append(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.addEventListener('rm-growth-updated',()=>{mount();update()});
let pending=false;function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;mount()})}
function watch(){const root=$('view-week');if(root){new MutationObserver(schedule).observe(root,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();