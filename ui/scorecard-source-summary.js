(function(){
'use strict';
const css=document.createElement('style');css.id='rmSourceScorecardStyle';
css.textContent=[
'#rmActualScorecard{margin:8px 0 18px;padding:16px;border:1px solid #e6dfef;border-radius:12px;background:#fff;color:#241d3a}',
// The daily page is a work queue, not a second scorecard. Hide native scorecard duplicate.
'#view-week #rm490Score,#rm350Workboard #rm490Score,body[data-rm-tab="week"] #rm490Score{display:none!important}',
'#rmActualScorecard h2{font-size:18px;margin:0 0 4px;color:#201734}',
'#rmActualScorecard .rmActualSubtitle{font-size:12px;color:#6e637b;line-height:1.5;margin:0 0 12px}',
'#rmActualScorecard .rmActualGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}',
'#rmActualScorecard .rmActualTile{padding:13px;border:1px solid #eee7f3;border-radius:9px;background:#faf9fc;text-align:left;width:100%;cursor:pointer}',
'#rmActualScorecard .rmActualTile strong{display:block;color:#523286;font-size:25px;line-height:1.3}',
'#rmActualScorecard .rmActualTile span{font-size:11px;color:#665b76}',
'#rmActualScorecard .rmActualFooter{font-size:11px;color:#6e647d;margin:12px 0 0}',
'#rmActualScorecard .rmCurrentWeighted{padding:14px 16px;margin:12px 0;background:#f7f2fb;border:1px solid #e7ddee;border-radius:10px;font-size:15px;font-weight:650;color:#402465}',
 '#rmTodayWeighted{padding:14px 16px;margin:12px 0;background:#f7f2fb;border:1px solid #e7ddee;border-radius:10px;font-size:15px;font-weight:650;color:#402465}',
 '#rmTodayWeighted strong{display:block;font-size:30px;color:#462776;margin:4px 0}',
 '#rmTodayWeighted small{display:block;font-size:12px;color:#665777;line-height:1.4}',
'#rmActualScorecard .rmCurrentWeighted strong{font-size:30px;display:block;margin:3px 0}',
'#rmActualScorecard button{border:1px solid #d8cbe8;border-radius:7px;background:white;color:#50317f;padding:7px 12px;cursor:pointer;font-size:11px}',
'#rmActualScorecard .rmActualHead{display:flex;justify-content:space-between;gap:10px;align-items:center}',
'.rm85Roadmap{margin:14px 0;padding:15px 0;border-top:1px solid #e4dfea;color:#2c2143}',
'.rm85Roadmap{margin:8px 0;padding:0;border:1px solid #e5dced;border-radius:10px;background:#fcfafe;overflow:hidden}',
'.rm85Disclosure summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap;cursor:pointer;padding:13px 15px;font-size:13px;font-weight:750;color:#50377a;list-style-position:inside}',
'.rm85Disclosure summary:focus-visible{outline:2px solid #7953a8;outline-offset:-2px}',
'.rm85SummaryText{flex:1 1 190px}',
'.rm85SummaryHint{font-weight:600;font-size:11px;color:#766289}',
'.rm85DetailBody{padding:0 15px 15px;border-top:1px solid #ece4f3}',
'.rm85Disclosure[open] .rm85SummaryHint{display:none}',
'.rm85Roadmap h3{font-size:17px;margin:0 0 5px;color:#2c2143}',
'.rm85Roadmap p,.rm85Roadmap li{font-size:12px;line-height:1.55;color:#625574}',
'.rm85Roadmap .rm85Gap{font-weight:800;color:#4b3174;font-size:14px;margin:8px 0}',
'.rm85Roadmap .rm85Actions{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}',
'.rm85Roadmap button{border:1px solid #d6c8e7;border-radius:8px;padding:9px 11px;background:#fff;color:#50317f;font-size:12px;font-weight:700;min-height:42px;cursor:pointer}',
'.rm85Roadmap .rm85Scenario{font-size:12px;color:#5f5270;line-height:1.55}',
'#rmFinalWeightedScore:has(h2){display:block}',
'#rm490Score{padding:16px!important;border:1px solid #e5dfee!important;border-radius:12px!important;background:#fff!important;box-shadow:none!important}',
'#rm490Score>h2{font-size:18px!important;margin:0 0 10px!important}',
'#rm490Score .rm490-scoregrid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px!important}',
'#rm490Score .rm490-scoregrid button{padding:12px!important;border:1px solid #e5dfee!important;border-radius:9px!important;box-shadow:none!important;text-align:left!important;min-height:90px!important}',
'#rm490Score .rm490-scoregrid button strong{font-size:23px!important;line-height:1.3!important}',
'#rm490Score .rm490-scoregrid progress{display:none!important}',
'#rm490Score .rm490-scoregrid small{font-size:11px!important;line-height:1.35!important;display:block!important}',
'#rm490Score:has(#rmTodayWeighted) #rmTodayWeighted{margin:7px 0!important;padding:12px 14px!important;min-height:0!important;font-size:13px!important}',
'#rm490Score:has(#rmTodayWeighted) #rmTodayWeighted strong{font-size:20px!important;line-height:1.35!important}',
'#rm490Score #rm85Roadmap{margin:8px 0!important}',
'#rm490Score #rm85Roadmap>details>summary{padding:10px 12px!important}',
'@media(max-width:720px){#rm490Score .rm490-scoregrid{grid-template-columns:1fr!important}}',
'@media(max-width:850px){#rmActualScorecard .rmActualGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
].join('\n');document.head.append(css);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let busy=false, lastFetch=0,refreshing=false;
const num=x=>{const n=Number(x);return Number.isFinite(n)?n:NaN};
const points=(count,target,weight)=>Number.isFinite(count)&&Number.isFinite(target)&&target>0?Math.min(weight,Math.max(0,count)/target*weight):NaN;
function liveScoreFromNative(){
 const d=window.rmV429ScoreData;
 if(!d||!d.target||!d.counts)return null;
 const t=d.target,k=d.counts;
 const tierA=num(k.A),tierB=num(k.B),channel=num(k.Channel);
 const tierPts=points(channel,num(t.Channel),15)+points(tierA,num(t.A),15)+points(tierB,num(t.B),20);
 const denominator=num(d.total),projected=num(d.projectedLeadCount);
 const ratioTarget=num(d.ratioTarget);
 const ratioPts=denominator>0&&ratioTarget>0&&Number.isFinite(projected)?Math.min(30,Math.max(0,projected/denominator)/ratioTarget*30):NaN;
 const activeCount=num(d.activePartnerCount);
 const activePts=points(activeCount,200,20);
 const total=tierPts+ratioPts+activePts;
 if(!Number.isFinite(total))return null;
 return {total,tierPts,ratioPts,activePts,projected,denominator};
}
// No weighted score is inferred when the authoritative scorecard data is unavailable.
// Practical scorecard planning is sourced from the same live model as the weighted score.
function renderPathTo85(live){
 const hosts=['rm85RoadmapScorecard'].map(id=>document.getElementById(id)).filter(Boolean);if(!hosts.length)return;
 for(const host of hosts){
 const data=window.rmV429ScoreData;
 if(!live||!data||!data.counts||!data.target){
  host.innerHTML='<details class="rm85Disclosure"><summary>Why the weighted score is pending</summary><div class="rm85DetailBody"><p>Power BI import totals must match the current stamped agent roster, and referred leads must be verified. A score will appear after reconciliation; no provisional points have been invented.</p></div></details>';
  continue;
 }
 const t=data.target,k=data.counts,percent=live.total;
 const deficit=Math.max(0,85.1-percent);
 const channelNow=Math.max(0,num(k.Channel)),aNow=Math.max(0,num(k.A)),bNow=Math.max(0,num(k.B));
 const channelGoal=num(t.Channel),aGoal=num(t.A),bGoal=num(t.B);
 const active=num(data.activePartnerCount),denom=num(data.total),ratio=num(data.ratioTarget),projected=num(data.projectedLeadCount);
 const valid=[channelNow,aNow,bNow,channelGoal,aGoal,bGoal,active,denom,ratio,projected].every(Number.isFinite)&&ratio>0&&denom>0;
 if(!valid){host.innerHTML='<h3>Path to 85%+</h3><p>Waiting for current tier and referral data.</p>';continue}
 const tierGoal=points(channelGoal,channelGoal,15)+points(aGoal,aGoal,15)+points(bGoal,bGoal,20);
 const activePts=points(active,200,20);
 const neededLeadPoints=Math.max(0,85.11-tierGoal-activePts);
 const requiredProjection=Math.ceil(neededLeadPoints/30*ratio*denom);
 const possible=neededLeadPoints<=30;
 const referralsNeeded=Math.max(0,requiredProjection-Math.round(projected));
 const leadGoal=Math.ceil(ratio*denom);
 const gapText=deficit>0?deficit.toFixed(1)+' points to reach 85%+':'Target reached — protect the result and keep growing';
 const wasOpen=!!host.querySelector('details.rm85Disclosure[open]');
 const summary=deficit>0?'Scorecard plan · '+deficit.toFixed(1)+' points to 85%+':'Scorecard plan · Target reached';
 const overview='<span class="rm85SummaryText">'+esc(summary)+'</span><span class="rm85SummaryHint">View action plan</span>';
 host.innerHTML='<details class="rm85Disclosure"'+(wasOpen?' open':'')+'><summary>'+overview+'</summary><div class="rm85DetailBody">'+ '<h3>Path to 85%+</h3>'+
 '<div class="rm85Gap">'+esc(gapText)+'</div>'+
 '<p><strong>Amanda’s focus:</strong> Move C agents toward B, earn more agent referrals, protect active relationships, and complete scheduled follow-ups. Daily calls and meetings create opportunities; they do not earn points directly.</p>'+
 '<p><strong>Daily:</strong> Complete due and overdue commitments first; protect a full 60-minute prospecting block with at least 25 new-agent calls. <strong>Weekly:</strong> Hold 3 new Realtor meetings and 3 Break Breads, review every C agent near B, and confirm which meetings produced referrals or next steps.</p>'+
 '<p><strong>Current milestones:</strong> B '+esc(bNow)+' / '+esc(bGoal)+' ('+Math.max(0,bGoal-bNow)+' to go); A '+esc(aNow)+' / '+esc(aGoal)+'; Channel '+esc(channelNow)+' / '+esc(channelGoal)+'; active agents '+esc(active)+' / 200.</p>'+
 (possible?'<p class="rm85Scenario"><strong>Illustrative team path:</strong> If Channel, A and B reach their current milestones, and active agents remain at '+esc(active)+', projected month-end referrals must reach approximately <strong>'+esc(requiredProjection)+'</strong> to exceed 85%. Current projection: '+esc(Math.round(projected))+'. This is '+esc(referralsNeeded)+' more projected referrals than today. The full referral-ratio target is '+esc(leadGoal)+' projected leads. These are planning scenarios, not guaranteed outcomes.</p>':
 '<p class="rm85Scenario">Even full tier and referral points would not reach 85% at this active-agent count. Growing the active roster must be part of the plan.</p>')+
 '<p><strong>Friday scorecard review:</strong> Compare the actual weighted score with 85, verify newly referred leads, C-to-B conversions and active-agent growth, then set next week’s priority agent list. A call or meeting only counts as scorecard progress when it leads to a measurable result.</p>'+
 '<p><strong>Ownership:</strong> Amanda drives C-to-B opportunities and C-agent referrals. Director-led Channel, A and existing B account results contribute to the same team scorecard.</p>'+
 '<div class="rm85Actions"><button type="button" data-rm85-action="growth">Open C-to-B opportunities</button><button type="button" data-rm85-action="prospects">Open prospect list</button><button type="button" data-rm85-action="leads">Review referred leads</button></div></div></details>';
 host.querySelector('[data-rm85-action="growth"]').onclick=()=>{if(typeof window.rmOpenCWork==='function')window.rmOpenCWork('near');else if(typeof window.v350OpenLane==='function')window.v350OpenLane('growth');else if(typeof window.switchTab==='function')window.switchTab('growth')};
 host.querySelector('[data-rm85-action="prospects"]').onclick=()=>{
  if(typeof window.rmOpenProspectList==='function')return window.rmOpenProspectList();
  if(typeof window.switchTab==='function')window.switchTab('pipeline');
 };

 host.querySelector('[data-rm85-action="leads"]').onclick=()=>{if(typeof window.rmV429OpenScoreDetail==='function')window.rmV429OpenScoreDetail('leads');else if(typeof window.switchTab==='function')window.switchTab('scorecard')};
 }
}
function renderLiveScore(){
 const targets=[document.getElementById('rmCurrentWeighted')].filter(Boolean);if(!targets.length)return;
 const live=liveScoreFromNative();
 if(live){
  for(const el of targets)el.innerHTML='Current weighted score<strong>'+live.total.toFixed(1)+' / 100</strong><small>Tier growth '+live.tierPts.toFixed(1)+'/50 · Lead pace '+live.ratioPts.toFixed(1)+'/30 · Active growth '+live.activePts.toFixed(1)+'/20 · Updates automatically</small>';
  renderPathTo85(live);
  return;
 }
 for(const el of targets)el.innerHTML='Weighted score · verification pending<strong>Not yet reconciled</strong><small>The latest import and matched Realtor roster do not agree. Imported counts may be shown below for context, but no weighted score can be certified yet.</small>';
 renderPathTo85(null);
}
let receiptBusy=false,receiptStamp='',lastReceiptCheck=0;
async function refreshTodayImportedCounts(force=false){
 if(receiptBusy||(!force&&Date.now()-lastReceiptCheck<45000))return;
 if(typeof sbFetch!=='function')return;
 receiptBusy=true;
 try{
  const result=await sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&source_app=like.core-team-tracker%25&order=imported_at.desc&limit=1');
  if(!Array.isArray(result)||!result.length||String(result[0].errors||'0')!=='0')throw Error('Latest report receipt missing or failed');
  const row=result[0],source=String(row.source_app||'');
  const vals=Object.fromEntries([...source.matchAll(/(?:^|;)(Channel|A|B|C)=(\d+)/g)].map(m=>[m[1],Number(m[2])]));
  const total=Number(row.rows_processed);
  if(!Number.isFinite(total)||!Number.isFinite(vals.B))throw Error('Tier totals missing in receipt');
  receiptStamp=String(row.imported_at||'');
  // Display read-only imported counts, explicitly not a substitute for reconciled scorecard.
  if(!liveScoreFromNative()){
   const mappings=[['rm490ValueB',String(vals.B),'rm490GapB','Imported B-tier total · roster validation pending'],
     ['rm490Valueactive',String(total),'rm490Gapactive','Imported agent rows · roster validation pending'],
     ['rm490Valueleads','Pending','rm490Gapleads','Referral lead reconciliation pending']];
   for(const [valueId,value,noteId,note] of mappings){
    const el=document.getElementById(valueId),sub=document.getElementById(noteId);
    if(el)el.textContent=value;if(sub)sub.textContent=note;
   }
   const box=document.getElementById('rmTodayWeighted');
   if(box)box.innerHTML='Weighted score · verification pending<strong>Not yet reconciled</strong><small>Power BI import: '+esc(total)+' rows · A '+esc(vals.A??'—')+' · B '+esc(vals.B)+' · C '+esc(vals.C??'—')+'. These counts are imported, not yet matched to the full agent roster. Referral and weighted results remain unverified.</small>';
  }
  lastReceiptCheck=Date.now();
 }catch(e){
  const mappings=[['rm490ValueB','Unavailable'],['rm490Valueactive','Unavailable'],['rm490Valueleads','Unavailable']];
  if(!liveScoreFromNative())for(const [id,value] of mappings){const el=document.getElementById(id);if(el)el.textContent=value}
  lastReceiptCheck=Date.now();
 }finally{receiptBusy=false}
}
async function refreshNativeScore(){
 if(refreshing)return;
 refreshing=true;
 try{if(typeof window.rmV428RenderOfficialScorecard==='function')await window.rmV428RenderOfficialScorecard(true)}
 catch(e){console.warn('Live scorecard refresh failed',e)}
 finally{refreshing=false;renderLiveScore()}
}

function mountTodayScore(){
 // Never recreate the duplicate Scorecard Progress section on Today's workday.
 document.getElementById('rmTodayWeighted')?.remove();
 document.getElementById('rm85Roadmap')?.remove();
 return;
 const heading=[...document.querySelectorAll('h2,h3')].find(el=>/^scorecard progress$/i.test((el.textContent||'').trim()));
 if(!heading||document.getElementById('rmTodayWeighted'))return;
 const div=document.createElement('div');div.id='rmTodayWeighted';div.className='rmCurrentWeighted';div.setAttribute('role','status');div.textContent='Updating weighted score…';
 heading.insertAdjacentElement('afterend',div);
 const roadmap=document.createElement('section');roadmap.id='rm85Roadmap';roadmap.className='rm85Roadmap';roadmap.setAttribute('aria-label','Plan for an 85 percent scorecard');div.insertAdjacentElement('afterend',roadmap);
}
function mount(){
 mountTodayScore();
 const score=document.getElementById('view-scorecard');if(!score)return;
 let panel=document.getElementById('rmActualScorecard');
 if(!panel){
  panel=document.createElement('section');panel.id='rmActualScorecard';
  panel.innerHTML='<div class="rmActualHead"><h2>Scorecard</h2><button id="rmActualRefresh" type="button">Refresh</button></div><div id="rmCurrentWeighted" class="rmCurrentWeighted" role="status">Loading weighted score…</div><div class="rmActualGrid" id="rmActualGrid"><div class="rmActualTile">Loading totals…</div></div><p id="rmActualFooter" class="rmActualFooter"></p>';
  const official=document.getElementById('rmFinalWeightedScore');
  if(official)official.before(panel);else score.prepend(panel);
  panel.querySelector('#rmActualRefresh').onclick=()=>load(true);
 }
 if(!document.getElementById('rm85RoadmapScorecard')){
  const roadmap=document.createElement('section');roadmap.id='rm85RoadmapScorecard';roadmap.className='rm85Roadmap';roadmap.setAttribute('aria-label','Plan for an 85 percent scorecard');panel.querySelector('#rmCurrentWeighted')?.insertAdjacentElement('afterend',roadmap);
 }
 if(Date.now()-lastFetch>60000&&!busy)load(false);
 tidy();
}
function tidy(){
 // Keep historical validation guidance away from Amanda's operational scorecard.
 const official=document.getElementById('rmFinalWeightedScore');if(!official)return;
 const heading=[...official.querySelectorAll('h2')].find(el=>/scorecard verification required/i.test(el.textContent||''));
 if(!heading)return;
 const alert=heading.parentElement;
 if(alert&&alert!==official&&alert.textContent.length<1600)alert.hidden=true;
}
async function load(force){
 if(busy)return;busy=true;
 const grid=document.getElementById('rmActualGrid'),footer=document.getElementById('rmActualFooter');
 if(!grid){busy=false;return}
 grid.innerHTML='<div class="rmActualTile">Loading scorecard…</div>';
 try{
  if(typeof sbFetch!=='function')throw Error('Shared report connection unavailable');
  const month=new Date(),start=month.getFullYear()+'-'+String(month.getMonth()+1).padStart(2,'0')+'-01';
  const imports=await sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&source_app=like.core-team-tracker%25&order=imported_at.desc&limit=1');
  if(!Array.isArray(imports)||!imports.length)throw Error('Power BI import receipt not available');
  if(String(imports[0].errors||'0')!=='0')throw Error('Latest import did not finish cleanly');
  const log=imports[0],text=String(log.source_app||'');
  const tiers=Object.fromEntries([...text.matchAll(/(?:^|;)(Channel|A|B|C)=(\d+)/g)].map(m=>[m[1],Number(m[2])]));
  const total=Number(log.rows_processed);
  if(!Number.isFinite(total)||!Number.isFinite(tiers.A)||!Number.isFinite(tiers.B)||!Number.isFinite(tiers.C))throw Error('Tier figures missing in latest report');
  const vals=[['Active agents',total],['A tier',tiers.A],['B tier',tiers.B],['C tier',tiers.C]];
  await refreshNativeScore();
  grid.innerHTML=vals.map(([label,value])=>'<button type="button" class="rmActualTile" data-score-detail="'+esc(label==='Active agents'?'active':label==='A tier'?'A':label==='B tier'?'B':'C')+'"><strong>'+esc(value)+'</strong><span>'+esc(label)+' · View agents ↗</span></button>').join('');
  grid.querySelectorAll('[data-score-detail]').forEach(button=>button.onclick=()=>{const key=button.dataset.scoreDetail;if(typeof window.rmV429OpenScoreDetail==='function')window.rmV429OpenScoreDetail(key)});
  footer.textContent='Latest Power BI import: '+new Date(log.imported_at).toLocaleString()+'.';
  lastFetch=Date.now();
 }catch(e){grid.innerHTML='<div class="rmActualTile" style="grid-column:1/-1">Current totals could not be refreshed.</div>';footer.textContent='Select Refresh to try again.';renderLiveScore();}
 finally{busy=false;tidy()}
}
function init(){
 mount();
 refreshTodayImportedCounts(true);
 [1200,3800,8000].forEach(ms=>setTimeout(()=>{mountTodayScore();renderLiveScore();refreshTodayImportedCounts(true)},ms));
 const root=document.getElementById('view-scorecard');
 if(root){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(root,{childList:true,subtree:true})}
 window.addEventListener('focus',()=>{if(!document.hidden)load(true)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
 // Refresh the visible scorecard each minute; the native calculation uses current source records.
 setInterval(()=>{if(!document.hidden&&((root&&root.getClientRects().length)||(document.getElementById('rmTodayWeighted')?.getClientRects().length)))load(true)},60000);
 setInterval(()=>{if(!document.hidden){mountTodayScore();refreshTodayImportedCounts(true)}},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();