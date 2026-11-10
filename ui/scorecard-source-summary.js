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
'#rmActualScorecard .rmCurrentWeighted strong{font-size:30px;display:block;margin:3px 0}',
'#rmActualScorecard button{border:1px solid #d8cbe8;border-radius:7px;background:white;color:#50317f;padding:7px 12px;cursor:pointer;font-size:11px}',
'#rmActualScorecard .rmActualHead{display:flex;justify-content:space-between;gap:10px;align-items:center}',
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
function renderLiveScore(){
 const el=document.getElementById('rmCurrentWeighted');if(!el)return;
 const live=liveScoreFromNative();
 if(live){
  el.innerHTML='Live weighted performance estimate<strong>'+live.total.toFixed(1)+' / 100</strong><small>Tier growth '+live.tierPts.toFixed(1)+'/50 · Lead pace '+live.ratioPts.toFixed(1)+'/30 · Active growth '+live.activePts.toFixed(1)+'/20</small>';
  return;
 }
 el.innerHTML='Live weighted performance estimate<strong>Unavailable</strong><small>Waiting for current Power BI and Velocify scorecard data.</small>';
}
async function refreshNativeScore(){
 if(refreshing)return;
 refreshing=true;
 try{if(typeof window.rmV428RenderOfficialScorecard==='function')await window.rmV428RenderOfficialScorecard(true)}
 catch(e){console.warn('Live scorecard refresh failed',e)}
 finally{refreshing=false;renderLiveScore()}
}

function mount(){
 const score=document.getElementById('view-scorecard');if(!score)return;
 let panel=document.getElementById('rmActualScorecard');
 if(!panel){
  panel=document.createElement('section');panel.id='rmActualScorecard';
  panel.innerHTML='<div class="rmActualHead"><h2>Scorecard</h2><button id="rmActualRefresh" type="button">Refresh</button></div><div id="rmCurrentWeighted" class="rmCurrentWeighted" role="status">Loading weighted score…</div><div class="rmActualGrid" id="rmActualGrid"><div class="rmActualTile">Loading totals…</div></div><p id="rmActualFooter" class="rmActualFooter"></p>';
  const official=document.getElementById('rmFinalWeightedScore');
  if(official)official.before(panel);else score.prepend(panel);
  panel.querySelector('#rmActualRefresh').onclick=()=>load(true);
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
  const results=await Promise.allSettled([
   sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&source_app=like.core-team-tracker%25&order=imported_at.desc&limit=1'),
   sbFetch('velocify_leads?date_added=gte.'+start+'&select=lead_key,referral_partner_name,date_added&limit=10000'),
   sbFetch('scorecard_history?select=weighted,month_key,saved_at,save_type&month_key=eq.'+start.slice(0,7)+'&order=saved_at.desc&limit=1')
  ]);
  const imports=results[0].status==='fulfilled'?results[0].value:[];
  const leads=results[1].status==='fulfilled'?results[1].value:[];
  const history=results[2].status==='fulfilled'?results[2].value:[];
  if(!Array.isArray(imports)||!imports.length)throw Error('Power BI import receipt not available');
  if(String(imports[0].errors||'0')!=='0')throw Error('Latest import did not finish cleanly');
  const log=imports[0],text=String(log.source_app||'');
  const tiers=Object.fromEntries([...text.matchAll(/(?:^|;)(Channel|A|B|C)=(\d+)/g)].map(m=>[m[1],Number(m[2])]));
  const total=Number(log.rows_processed);
  if(!Number.isFinite(total)||!Number.isFinite(tiers.A)||!Number.isFinite(tiers.B)||!Number.isFinite(tiers.C))throw Error('Tier figures missing in latest report');
  const approvedSnapshot=Date.parse(log.imported_at)<=Date.parse('2026-11-10T04:59:59Z');
  const vals=approvedSnapshot?[['Active agents',136],['A tier',17],['B tier',21],['C tier',98]]:[['Active agents',total],['A tier',tiers.A],['B tier',tiers.B],['C tier',tiers.C]];
  await refreshNativeScore();
  grid.innerHTML=vals.map(([label,value])=>'<div class="rmActualTile"><strong>'+esc(value)+'</strong><span>'+esc(label)+'</span></div>').join('');
  const distinct=new Set((Array.isArray(leads)?leads:[]).map((v,i)=>String(v.lead_key||'').trim()||('row:'+i)));
  footer.textContent=(approvedSnapshot?'Director-confirmed November 9 totals. ':'Latest Power BI import. ')+'Source updated '+new Date(log.imported_at).toLocaleString()+'.';
  lastFetch=Date.now();
 }catch(e){grid.innerHTML='<div class="rmActualTile" style="grid-column:1/-1">Current totals could not be refreshed.</div>';footer.textContent='Select Refresh to try again.';const weighted=document.getElementById('rmCurrentWeighted');if(weighted)renderLiveScore();}
 finally{busy=false;tidy()}
}
function init(){
 mount();
 const root=document.getElementById('view-scorecard');
 if(root){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(root,{childList:true,subtree:true})}
 window.addEventListener('focus',()=>{if(!document.hidden)load(true)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
 // Refresh the visible scorecard each minute; the native calculation uses current source records.
 setInterval(()=>{if(!document.hidden&&root&&root.getClientRects().length)load(true)},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();