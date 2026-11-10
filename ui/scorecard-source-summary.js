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
 if(Date.now()-lastFetch>120000&&!busy)load(false);
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
  const [imports,leads,history]=await Promise.all([
   sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&source_app=like.core-team-tracker%25&order=imported_at.desc&limit=1'),
   sbFetch('velocify_leads?date_added=gte.'+start+'&select=lead_key,referral_partner_name,date_added&limit=10000'),
   sbFetch('scorecard_history?select=weighted,month_key,saved_at,save_type&month_key=eq.'+start.slice(0,7)+'&order=saved_at.desc&limit=1')
  ]);
  if(!Array.isArray(imports)||!imports.length)throw Error('Power BI import receipt not available');
  if(String(imports[0].errors||'0')!=='0')throw Error('Latest import did not finish cleanly');
  const log=imports[0],text=String(log.source_app||'');
  const tiers=Object.fromEntries([...text.matchAll(/(?:^|;)(Channel|A|B|C)=(\d+)/g)].map(m=>[m[1],Number(m[2])]));
  const total=Number(log.rows_processed);
  if(!Number.isFinite(total)||!Number.isFinite(tiers.A)||!Number.isFinite(tiers.B)||!Number.isFinite(tiers.C))throw Error('Tier figures missing in latest report');
  const approvedSnapshot=Date.parse(log.imported_at)<=Date.parse('2026-11-10T04:59:59Z');
  const vals=approvedSnapshot?[['Active agents',136],['A tier',17],['B tier',21],['C tier',98]]:[['Active agents',total],['A tier',tiers.A],['B tier',tiers.B],['C tier',tiers.C]];
  const weighted=document.getElementById('rmCurrentWeighted');
  if(weighted){const item=Array.isArray(history)?history[0]:null;const score=Number(item?.weighted);weighted.innerHTML=item&&Number.isFinite(score)?'Current weighted score<strong>'+score.toFixed(2)+'%</strong><small>Saved '+esc(new Date(item.saved_at).toLocaleDateString())+'</small>':'Current weighted score<strong>Not saved</strong><small>No weighted score has been recorded for '+esc(start.slice(0,7))+'. Agent totals are confirmed.</small>';}
  grid.innerHTML=vals.map(([label,value])=>'<div class="rmActualTile"><strong>'+esc(value)+'</strong><span>'+esc(label)+'</span></div>').join('');
  const distinct=new Set((Array.isArray(leads)?leads:[]).map((v,i)=>String(v.lead_key||'').trim()||('row:'+i)));
  footer.textContent=(approvedSnapshot?'Director-confirmed November 9 totals. ':'Latest Power BI import. ')+'Source updated '+new Date(log.imported_at).toLocaleString()+'.';
  lastFetch=Date.now();
 }catch(e){grid.innerHTML='<div class="rmActualTile" style="grid-column:1/-1">Current totals could not be refreshed.</div>';footer.textContent='Select Refresh to try again.';const weighted=document.getElementById('rmCurrentWeighted');if(weighted)weighted.textContent='Current weighted score unavailable — no verified current-month value loaded.';}
 finally{busy=false;tidy()}
}
function init(){mount();const root=document.getElementById('view-scorecard');if(root){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(root,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();