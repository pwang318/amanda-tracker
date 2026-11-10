(function(){
'use strict';
const css=document.createElement('style');css.id='rmSourceScorecardStyle';
css.textContent=[
'#rmActualScorecard{margin:8px 0 18px;padding:16px;border:1px solid #e6dfef;border-radius:12px;background:#fff;color:#241d3a}',
'#rmActualScorecard h2{font-size:18px;margin:0 0 4px;color:#201734}',
'#rmActualScorecard .rmActualSubtitle{font-size:12px;color:#6e637b;line-height:1.5;margin:0 0 12px}',
'#rmActualScorecard .rmActualGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}',
'#rmActualScorecard .rmActualTile{padding:13px;border:1px solid #eee7f3;border-radius:9px;background:#faf9fc}',
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
'.rm85Roadmap h3{font-size:17px;margin:0 0 5px;color:#2c2143}',
'.rm85Roadmap p,.rm85Roadmap li{font-size:12px;line-height:1.55;color:#625574}',
'.rm85Roadmap .rm85Gap{font-weight:800;color:#4b3174;font-size:14px;margin:8px 0}',
'.rm85Roadmap .rm85Actions{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}',
'.rm85Roadmap button{border:1px solid #d6c8e7;border-radius:8px;padding:9px 11px;background:#fff;color:#50317f;font-size:12px;font-weight:700;min-height:42px;cursor:pointer}',
'.rm85Roadmap .rm85Scenario{font-size:12px;color:#5f5270;line-height:1.55}',
'#rmFinalWeightedScore:has(h2){display:block}',
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
// Practical scorecard planning is sourced from the same live model as the weighted score.
function renderPathTo85(live){
 const hosts=['rm85Roadmap','rm85RoadmapScorecard'].map(id=>document.getElementById(id)).filter(Boolean);if(!hosts.length)return;
 for(const host of hosts){
 const data=window.rmV429ScoreData;
 if(!live||!data||!data.counts||!data.target){
  host.innerHTML='<h3>Path to 85%+</h3><p>Scorecard data is unavailable. Refresh the scorecard to see the current targets; no goals have been estimated.</p>';
  return;
 }
 const t=data.target,k=data.counts,percent=live.total;
 const deficit=Math.max(0,85.1-percent);
 const channelNow=Math.max(0,num(k.Channel)),aNow=Math.max(0,num(k.A)),bNow=Math.max(0,num(k.B));
 const channelGoal=num(t.Channel),aGoal=num(t.A),bGoal=num(t.B);
 const active=num(data.activePartnerCount),denom=num(data.total),ratio=num(data.ratioTarget),projected=num(data.projectedLeadCount);
 const valid=[channelNow,aNow,bNow,channelGoal,aGoal,bGoal,active,denom,ratio,projected].every(Number.isFinite)&&ratio>0&&denom>0;
 if(!valid){host.innerHTML='<h3>Path to 85%+</h3><p>Waiting for verified tier and referral data before calculating a plan.</p>';return}
 const tierGoal=points(channelGoal,channelGoal,15)+points(aGoal,aGoal,15)+points(bGoal,bGoal,20);
 const activePts=points(active,200,20);
 const neededLeadPoints=Math.max(0,85.11-tierGoal-activePts);
 const requiredProjection=Math.ceil(neededLeadPoints/30*ratio*denom);
 const possible=neededLeadPoints<=30;
 const referralsNeeded=Math.max(0,requiredProjection-Math.round(projected));
 const leadGoal=Math.ceil(ratio*denom);
 const gapText=deficit>0?deficit.toFixed(1)+' points to reach 85%+':'Target reached — protect the result and keep growing';
 host.innerHTML='<h3>Path to 85%+</h3>'+
 '<div class="rm85Gap">'+esc(gapText)+'</div>'+
 '<p><strong>Amanda’s focus:</strong> Move C agents toward B, earn more agent referrals, protect active relationships, and complete scheduled follow-ups. Daily calls and meetings create opportunities; they do not earn points directly.</p>'+
 '<p><strong>Daily:</strong> At least 25 cold calls in a full 60-minute prospecting block, plus assigned follow-ups. <strong>Weekly:</strong> 3 new Realtor meetings and 3 relationship meetings (Break Breads). Prioritize C agents near their next closing.</p>'+
 '<p><strong>Current milestones:</strong> B '+esc(bNow)+' / '+esc(bGoal)+' ('+Math.max(0,bGoal-bNow)+' to go); A '+esc(aNow)+' / '+esc(aGoal)+'; Channel '+esc(channelNow)+' / '+esc(channelGoal)+'; active agents '+esc(active)+' / 200.</p>'+
 (possible?'<p class="rm85Scenario"><strong>Illustrative team path:</strong> If Channel, A and B reach their current milestones, and active agents remain at '+esc(active)+', projected month-end referrals must reach approximately <strong>'+esc(requiredProjection)+'</strong> to exceed 85%. Current projection: '+esc(Math.round(projected))+'. This is '+esc(referralsNeeded)+' more projected referrals than today. The full referral-ratio target is '+esc(leadGoal)+' projected leads. These are planning scenarios, not guaranteed outcomes.</p>':
 '<p class="rm85Scenario">Even full tier and referral points would not reach 85% at this active-agent count. Growing the active roster must be part of the plan.</p>')+
 '<p><strong>Ownership:</strong> Amanda drives C-to-B opportunities and C-agent referrals. Director-led Channel, A and existing B account results contribute to the same team scorecard.</p>'+
 '<div class="rm85Actions"><button type="button" id="rm85Growth">Open C-to-B opportunities</button><button type="button" id="rm85Prospects">Open prospect list</button><button type="button" id="rm85Leads">Review referred leads</button></div>';
 host.querySelector('#rm85Growth').onclick=()=>{if(typeof window.v350OpenLane==='function')window.v350OpenLane('growth');else if(typeof window.switchTab==='function')window.switchTab('growth')};
 host.querySelector('#rm85Prospects').onclick=async()=>{
  if(typeof window.switchTab!=='function')return;
  window.switchTab('pipeline');
  try{if(typeof window.rmRenderNewAgentCallList==='function')await window.rmRenderNewAgentCallList()}catch(e){console.warn('Prospect list refresh unavailable',e)}
  document.getElementById('rmNewAgentCallList')?.scrollIntoView({behavior:'smooth',block:'start'});
 };
 host.querySelector('#rm85Leads').onclick=()=>{if(typeof window.rmV429OpenScoreDetail==='function')window.rmV429OpenScoreDetail('leads');else if(typeof window.switchTab==='function')window.switchTab('scorecard')};
 }
}
function renderLiveScore(){
 const targets=[document.getElementById('rmCurrentWeighted'),document.getElementById('rmTodayWeighted')].filter(Boolean);if(!targets.length)return;
 const live=liveScoreFromNative();
 if(live){
  for(const el of targets)el.innerHTML='Current weighted score<strong>'+live.total.toFixed(1)+' / 100</strong><small>Tier growth '+live.tierPts.toFixed(1)+'/50 · Lead pace '+live.ratioPts.toFixed(1)+'/30 · Active growth '+live.activePts.toFixed(1)+'/20 · Updates automatically</small>';
  renderPathTo85(live);
  return;
 }
 for(const el of targets)el.innerHTML='Current weighted score<strong>Unavailable</strong><small>Waiting for current Power BI and Velocify data.</small>';
 renderPathTo85(null);
}
async function refreshNativeScore(){
 if(refreshing)return;
 refreshing=true;
 try{if(typeof window.rmV428RenderOfficialScorecard==='function')await window.rmV428RenderOfficialScorecard(true)}
 catch(e){console.warn('Live scorecard refresh failed',e)}
 finally{refreshing=false;renderLiveScore()}
}

function mountTodayScore(){
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
  grid.innerHTML=vals.map(([label,value])=>'<div class="rmActualTile"><strong>'+esc(value)+'</strong><span>'+esc(label)+'</span></div>').join('');
  footer.textContent='Latest Power BI import: '+new Date(log.imported_at).toLocaleString()+'.';
  lastFetch=Date.now();
 }catch(e){grid.innerHTML='<div class="rmActualTile" style="grid-column:1/-1">Current totals could not be refreshed.</div>';footer.textContent='Select Refresh to try again.';renderLiveScore();}
 finally{busy=false;tidy()}
}
function init(){
 mount();
 const root=document.getElementById('view-scorecard');
 if(root){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(root,{childList:true,subtree:true})}
 window.addEventListener('focus',()=>{if(!document.hidden)load(true)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
 // Refresh the visible scorecard each minute; the native calculation uses current source records.
 setInterval(()=>{if(!document.hidden&&((root&&root.getClientRects().length)||(document.getElementById('rmTodayWeighted')?.getClientRects().length)))load(true)},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();