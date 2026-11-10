(function(){
'use strict';
const $=id=>document.getElementById(id);
const css=document.createElement('style');css.textContent=[
'#rmFastLog,#rmBusinessOutcomes{padding:15px;margin:14px 0;background:#fff;border:1px solid #e5ddec;border-radius:11px}',
'#rmFastLog h3,#rmBusinessOutcomes h3{margin:0 0 6px;font-size:17px;color:#2a2147}',
'#rmFastLog p,#rmBusinessOutcomes p{font-size:12px;line-height:1.5;color:#6c5e79}',
'#rmFastLog input{border:1px solid #ded4e8;border-radius:7px;padding:9px 11px;width:min(100%,440px);box-sizing:border-box}',
'#rmFastLog .rmFastActions{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}',
'#rmFastLog button,#rmBusinessOutcomes button{border:1px solid #dacee8;border-radius:7px;background:#fff;color:#593885;padding:8px 10px;font-size:12px;cursor:pointer}',
'#rmFastLog button:disabled{opacity:.5}',
'#rmFastLog .rmFastStatus{min-height:18px;font-size:12px;color:#6a557a;margin:8px 0}',
'#rmBusinessOutcomes .rmMetrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}',
'#rmBusinessOutcomes .rmMetric{padding:10px;background:#faf8fc;border:1px solid #ebe5f1;border-radius:8px}',
'#rmBusinessOutcomes .rmMetric b{display:block;font-size:22px;color:#533482}',
'#rmBusinessOutcomes .rmMetric span{font-size:11px;color:#695d78}',
'#rmProspectDailyStrip{padding:10px 13px;background:#fff;border:1px solid #e9e2f0;border-radius:9px;margin:8px 0;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
'#rmProspectDailyStrip b{font-size:13px;color:#3e2b61}',
'#rmProspectDailyStrip span{font-size:11px;color:#675977}',
'#rmProspectDailyStrip button{background:white;border:1px solid #dbd1e6;border-radius:7px;padding:7px 10px;color:#543684;cursor:pointer}',
'#rmBusinessOutcomes{max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}',
'#rmBusinessOutcomes .rmMetrics{min-width:0}',
'#rmBusinessOutcomes .rmMetric{min-width:0;overflow-wrap:anywhere}',
'#rmBusinessOutcomes .rmMetric b{font-size:clamp(17px,3vw,22px);line-height:1.2}',
'#rmBusinessOutcomes p{max-width:100%;line-height:1.55}',
'@media(max-width:750px){#rmBusinessOutcomes .rmMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}}',
'@media(max-width:480px){#rmBusinessOutcomes{padding:12px;margin:10px 0}#rmBusinessOutcomes .rmMetrics{grid-template-columns:1fr 1fr;gap:7px}#rmBusinessOutcomes .rmMetric{padding:9px}#rmBusinessOutcomes .rmMetric span{font-size:11px}}'
].join('\n');document.head.append(css);
const nameKey=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const iso=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'—';
const attempt=a=>/^(Cold Calls|Agent Talk-to|New Agent Follow-up|Reconnect Outreach|Realtor Buddy Referral Ask)$/i.test(a.act_type||'');
const connected=a=>/connected|positive|meaningful conversation|talked|reached|meeting scheduled/i.test(a.outcome||'');
const missed=a=>/no answer|voicemail|not reached/i.test(a.outcome||'');
const booked=a=>/meeting scheduled|meeting booked/i.test(a.outcome||'');
const held=a=>/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Partner Meeting|Strategic Partner Meeting|Retention Meeting)$/i.test(a.act_type||'')&&/positive|held|completed/i.test(a.outcome||'');
let cached=[],lastFetch=0,inFlight=null,queue=[];
async function load(force=false){
 if(!force&&Date.now()-lastFetch<25000)return cached;
 if(inFlight)return inFlight;
 inFlight=(async()=>{
  if(typeof sbFetch!=='function')throw Error('Shared activity connection unavailable');
  const month=iso(new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const rows=await sbFetch('amanda_activities?select=id,agent_name,act_type,act_date,outcome,follow_up_date,created_at&act_date=gte.'+month+'&order=created_at.desc&limit=10000');
  if(!Array.isArray(rows))throw Error('Live activity returned an invalid response');
  cached=[...new Map(rows.filter(x=>x.id!=null).map(x=>[x.id,x])).values()];
  lastFetch=Date.now();return cached;
 })().finally(()=>{inFlight=null});
 return inFlight;
}
function breakdown(rows){
 const day=iso(),current=rows.filter(r=>r.act_date===day),attempts=current.filter(attempt);
 const bookedRows=current.filter(booked),heldRows=current.filter(held);
 return {cold:current.filter(r=>r.act_type==='Cold Calls').length,attempts:attempts.length,connections:attempts.filter(connected).length,
  missed:attempts.filter(missed).length,booked:bookedRows.length,held:heldRows.length};
}
function meetings(rows){
 const scheduled=rows.filter(x=>booked(x)&&x.follow_up_date&&x.agent_name).sort((a,b)=>String(a.follow_up_date).localeCompare(String(b.follow_up_date)));
 const completed=rows.filter(x=>held(x)&&x.agent_name);
 const used=new Set();let linked=0;
 for(const a of scheduled){
  const found=completed.find(h=>{
   if(used.has(h.id)||nameKey(h.agent_name)!==nameKey(a.agent_name))return false;
   const diff=(Date.parse(h.act_date+'T12:00:00')-Date.parse(a.follow_up_date+'T12:00:00'))/86400000;
   return diff>=-7&&diff<=14&&h.act_date>=a.act_date;
  });
  if(found){used.add(found.id);linked++}
 }
 return {booked:scheduled.length,held:completed.length,linked,unmatched:completed.length-linked};
}
function metric(label,value){return '<div class="rmMetric"><b>'+esc(value)+'</b><span>'+esc(label)+'</span></div>'}
function render(){
 const m=breakdown(cached),j=meetings(cached);
 const target=$('rmBusinessOutcomesBody');
 if(target)target.innerHTML='<div class="rmMetrics">'+[
 ['Cold calls today',m.cold+' / 25+'],['Connection rate',pct(m.connections,m.attempts)],
 ['Booking per connection',pct(m.booked,m.connections)],['Linked bookings held',j.linked+' / '+j.booked]
 ].map(([a,b])=>metric(a,b)).join('')+'</div><p>Prospecting: Protect the full 60 minutes and make at least 25 cold-call attempts. Keep dialing for the full hour, even if you reach 25 early. Meeting tracking: '+j.unmatched+' completed meeting(s) do not have a matching booking in the activity log. Check those records if needed. Relationship success means new leads and repeat business—not just a good conversation.</p>';

}
function mount(){
 const log=$('view-log'),home=$('view-week'),board=$('rm350Workboard');
 if(log&&!$('rmFastLog')){
  const e=document.createElement('section');e.id='rmFastLog';e.innerHTML='<h3>Fast prospecting log</h3><p>Same validated activity save, fewer clicks. Enter an agent, select the outcome, and move to the next call. Keep using the full 60-minute block after 25 calls.</p>'+
  '<label for="rmFastAgent">Agent name</label><div><input id="rmFastAgent" autocomplete="off" list="rmFastNames" placeholder="Agent name"><datalist id="rmFastNames"></datalist></div>'+
  '<div class="rmFastActions"><button data-fast="No answer">No answer</button><button data-fast="Left voicemail">Voicemail</button><button data-fast="Positive">Connected</button><button data-fast="Meeting Scheduled">Meeting booked</button></div>'+
  '<div id="rmFastBooking" hidden><label for="rmFastDate">Scheduled meeting date </label><input id="rmFastDate" type="date"></div>'+
  '<div id="rmFastStatus" class="rmFastStatus" role="status">Log each attempt and its result.</div><div id="rmFastMetrics"></div>';
  log.insertBefore(e,log.querySelector('.card')||log.firstChild);
  e.querySelectorAll('[data-fast]').forEach(b=>b.onclick=()=>quickSave(b.dataset.fast));
  loadNames();
 }
 if($('rmBusinessOutcomes')&&$('rm358Pace')&&!$('rm358Pace').contains($('rmBusinessOutcomes')))$('rm358Pace').append($('rmBusinessOutcomes'));
 if(board&&!$('rmBusinessOutcomes')){
  const e=document.createElement('section');e.id='rmBusinessOutcomes';
  e.innerHTML='<h3>Conversion and follow-through</h3><div id="rmBusinessOutcomesBody">Loading saved activity…</div><button type="button" id="rmBusinessRefresh">Refresh activity</button>';
  const host=$('rm358Pace');if(host)host.append(e);else board.after(e);$('rmBusinessRefresh').onclick=()=>refresh(true);
 }
}
async function loadNames(){
 try{
  const agents=await sbFetch('agent_profiles?select=agent_name,display_name,do_not_contact,relationship_status&limit=2000');
  const dl=$('rmFastNames');if(!dl||!Array.isArray(agents))return;
  for(const value of [...new Set(agents.filter(a=>!a.do_not_contact&&!/deleted|inactive|archived|removed/i.test(a.relationship_status||'')).map(a=>a.display_name||a.agent_name).filter(Boolean))].sort()){
   const opt=document.createElement('option');opt.value=value;dl.append(opt);
  }
 }catch(e){/* native save still validates the contact */}
}
async function quickSave(outcome){
 const input=$('rmFastAgent'),name=input?.value.trim(),save=$('logBtn');
 if(!name){$('rmFastStatus').textContent='Enter an agent first.';input?.focus();return}
 if(!save||!$('activityType')){$('rmFastStatus').textContent='Standard Log Activity form unavailable; refresh and retry.';return}
 if(outcome==='Meeting Scheduled'&&(!$('rmFastDate')?.value)){$('rmFastBooking').hidden=false;$('rmFastStatus').textContent='Choose the appointment date, then click Meeting booked again.';return}
 // Use the established RM save pathway, retaining duplicate prevention, follow-up requirements and contact matching.
 $('agentInput').value=name;$('agentInput').dispatchEvent(new Event('input',{bubbles:true}));
 $('activityType').value='Cold Calls';$('activityType').dispatchEvent(new Event('change',{bubbles:true}));
 $('activityDate').value=iso();
 $('activityOutcome').value=outcome;$('activityOutcome').dispatchEvent(new Event('change',{bubbles:true}));
 $('activityNotes').value={'No answer':'No answer; attempted new-agent outreach.','Left voicemail':'Left voicemail for prospective Realtor.','Positive':'Connected live with prospective Realtor; discussed business.','Meeting Scheduled':'Spoke with agent and scheduled introductory meeting.'}[outcome];
 if($('activityRmAmanda'))$('activityRmAmanda').checked=true;if($('activityRmNyny'))$('activityRmNyny').checked=false;
 if($('activityOwner'))$('activityOwner').value='Amanda';
 if(outcome==='Meeting Scheduled'){$('followupDate').value=$('rmFastDate').value;if($('activityNextStepOwner'))$('activityNextStepOwner').value='Amanda'}
 const status=$('rmFastStatus');status.textContent='Submitting via validated Log Activity…';
 const buttons=[...$('rmFastLog').querySelectorAll('[data-fast]')];buttons.forEach(b=>b.disabled=true);
 save.click();
 // No success claim until the native form clears its agent input after a successful save.
 let retries=0;const p=setInterval(async()=>{
  retries++;
  if($('agentInput')?.value===''&&!save.disabled){
   clearInterval(p);buttons.forEach(b=>b.disabled=false);
   status.textContent='Saved '+name+' · '+outcome+'. Ready for next agent.';
   input.value='';$('rmFastBooking').hidden=true;$('rmFastDate').value='';
   await refresh(true);
   try{await reconcile()}catch(e){status.textContent+=' Outstanding work needs a refresh.'}
   input.focus();return;
  }
  if(retries>=40){clearInterval(p);buttons.forEach(b=>b.disabled=false);status.textContent='Check the standard activity form for validation errors before retrying.'}
 },500);
}
async function reconcile(){
 // Only identical activity types satisfy call tasks. Never automatically complete a growth plan or meeting task.
 const day=iso();
 const pending=await sbFetch('rm_work_queue?select=id,agent_name,activity_type,work_date,status,owner&status=eq.open&owner=eq.Amanda&limit=500');
 const eligible=cached.filter(a=>a.act_date===day&&/^(Cold Calls|Agent Talk-to|New Agent Follow-up|Reconnect Outreach)$/i.test(a.act_type||''));
 const alias={'agent talk-to':['agent talk-to','talk-to (text/call)','active agent talk-to'],'cold calls':['cold calls'],'new agent follow-up':['new agent follow-up'],'reconnect outreach':['reconnect outreach']};
 for(const t of (Array.isArray(pending)?pending:[])){
  if(t.work_date&&t.work_date>day)continue;
  const matched=eligible.some(a=>nameKey(a.agent_name)===nameKey(t.agent_name)&&
   (alias[String(a.act_type).toLowerCase()]||[]).includes(String(t.activity_type||'').toLowerCase())&&
   (!t.work_date||a.act_date>=t.work_date));
  if(!matched)continue;
  await sbFetch('rm_work_queue?id=eq.'+encodeURIComponent(t.id)+'&status=eq.open',{method:'PATCH',prefer:'return=minimal',body:JSON.stringify({status:'worked',completed_at:new Date().toISOString()})}).catch(()=>{});
 }
}
async function refresh(force=false){
 mount();
 try{await load(force);render()}catch(e){const body=$('rmBusinessOutcomesBody');if(body)body.textContent='Unable to verify saved activity. Refresh to retry; no counts substituted.'}
}
window.rmDailyActivityBrief=async()=>{
 await load(true);
 const d=breakdown(cached),j=meetings(cached);
 return {date:iso(),...d,connection_rate:d.attempts?d.connections/d.attempts:null,booking_per_connection:d.connections?d.booked/d.connections:null,linked_booked_to_held:j.linked,unlinked_held:j.unmatched};
};
function start(){
 mount();refresh(true);
 let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount()})}).observe(document.body,{subtree:true,childList:true});
 window.addEventListener('focus',()=>refresh(false));
 // No fixed-interval polling: refresh on saved activity, explicit refresh, or focus.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();