(function(){
'use strict';
const STYLE = `
#rmGrowthHome{margin:12px 0 18px;padding:17px;background:#f3eefb;border:2px solid #ad96d4;border-radius:15px;color:#36224e}
#rmGrowthHome h2{font-size:18px;margin:0 0 4px}#rmGrowthHome p{margin:4px 0 12px;font-size:12px;line-height:1.5}
.rmGrowthHomeActions{display:flex;gap:8px;flex-wrap:wrap}
.rmGrowBtn{padding:9px 12px;border:0;border-radius:9px;background:#573281;color:white;font-weight:700;cursor:pointer;font-family:inherit}
.rmGrowBtn.alt{background:white;color:#573281;border:1px solid #a996c6}
#view-growth-command{max-width:1170px}
.rmGrowTop{background:linear-gradient(110deg,#43215f,#7855a3);color:#fff;border-radius:15px;padding:20px;margin-bottom:14px}
.rmGrowTop h2{margin:0 0 6px;font-size:25px}
.rmGrowTop p{margin:0;font-size:13px;line-height:1.5;color:#f2e8fa}
.rmGrowNotice{background:#fff3dc;border-left:4px solid #b78021;border-radius:8px;padding:10px 12px;font-size:12px;margin:10px 0}
.rmGrowStatGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
.rmGrowStat{background:#fff;border:1px solid #e7dcef;border-radius:10px;padding:13px}
.rmGrowStat strong{display:block;font-size:23px;color:#533078}.rmGrowStat span{font-size:11px;color:#63536f}
.rmGrowNav{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}
.rmGrowNav button{background:#fff;border:1px solid #cbbbdc;padding:10px 13px;border-radius:9px;cursor:pointer;font-family:inherit}
.rmGrowNav button.active{background:#573281;color:#fff}
.rmGrowList{background:#fff;border:1px solid #e6dceb;border-radius:12px;padding:14px;margin-top:10px}
.rmGrowList h3{font-size:17px;margin:0 0 7px}
.rmGrowTableWrap{overflow:auto}
.rmGrowTable{border-collapse:collapse;width:100%;min-width:760px}
.rmGrowTable th,.rmGrowTable td{padding:10px 8px;text-align:left;border-bottom:1px solid #eee9f3;font-size:12px;vertical-align:top}
.rmGrowTable th{color:#533878;background:#f5effa}
.rmGrowTable tr:last-child td{border:0}
.rmGrowSmall{font-size:11px;color:#6b597b}
.rmGrowFilters{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.rmGrowFilters input,.rmGrowFilters select{font-size:12px;padding:9px;border:1px solid #d2c6dc;border-radius:8px;background:white}
.rmGrowFilters input{flex:1;min-width:150px}
.rmGrowSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.rmGrowSteps>div{background:#f5f0fa;border-radius:10px;padding:12px;font-size:12px;line-height:1.5}
@media(max-width:720px){.rmGrowStatGrid{grid-template-columns:repeat(2,1fr)}.rmGrowSteps{grid-template-columns:1fr}}
`;
const escape=(s)=>String(s===null||s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const date=s=>String(s||'').slice(0,10);
const safeNumber=n=>n===null||n===undefined||n===''?null:Math.max(0,Number(n)||0);
const state={profiles:[],rows:[],ownerMap:{},migrations:[],view:'grow',search:'',tier:'all',loading:false,loaded:false,lastSeen:null};
const getTier=p=>{const t=String(p.powerbi_level||p.tier||'').trim();return ['C','B','A','Channel'].includes(t)?t:null};
const getOwner=(p,tier)=>tier==='C'?'Amanda':'Director';
function daysSince(value){const v=date(value);if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;const t=Date.parse(v+'T12:00:00');return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/86400000)):null}
function action(p){if(p.competitor_risk_flag)return 'Service recovery: find out what changed and agree on a recovery action';
if(p.daysNoLead!==null&&p.daysNoLead>=30)return 'Re-engage: identify buyer activity and ask for the next qualified referral';
if(p.next_growth_opportunity)return 'Follow through: '+p.next_growth_opportunity;
if(p.closings>0&&p.tier==='C')return 'Review current pipeline and the next closing opportunity';
if(p.leads>0)return 'Review referred buyers, conversion blockers, and next referral';
return 'Ask about upcoming buyers and agree on a dated referral goal';}
function score(p){return (p.tier==='C'?40:0)+(p.closings===1?35:0)+(p.high_potential_flag?18:0)+(p.leads?Math.min(p.leads,15):0)+(p.competitor_risk_flag?20:0)+(p.daysNoLead!==null&&p.daysNoLead>=30?25:0);}
function normalize(){
const seen=new Set(),out=[];
const latestStamp=state.profiles.map(p=>date(p.powerbi_last_seen_at)).filter(Boolean).sort().at(-1)||null;
for(const p of state.profiles){
if(!latestStamp||date(p.powerbi_last_seen_at)!==latestStamp)continue;
const k=key(p.agent_name),tier=getTier(p);
if(!k||seen.has(k)||k.startsWith('__')||p.display_name==='__HIDDEN__'||p.do_not_contact===true||p.relationship_status==='inactive'||p.relationship_type==='strategic_partner')continue;
seen.add(k);
if(tier!=='C')continue;
const rm=getOwner(p,tier),closes=safeNumber(p.closes_past_year),leads=safeNumber(p.total_leads_past_year),daysNoLead=daysSince(p.latest_lead_date);
const r={name:p.display_name||p.agent_name,sourceName:p.agent_name,tier,rm,closings:closes,leads,daysNoLead,latestLead:date(p.latest_lead_date),latestClose:date(p.latest_close_date),competitor_risk_flag:!!p.competitor_risk_flag,high_potential_flag:!!p.high_potential_flag,next_growth_opportunity:p.next_growth_opportunity||'',growth_opportunity_deadline:p.growth_opportunity_deadline||'',partner_pain_points:p.partner_pain_points||'',referral_leakage_notes:p.referral_leakage_notes||'',recovery_plan:p.recovery_plan||'',last_contact:date(p.last_meaningful_contact_date),followup:date(p.next_rm_followup),migration:state.migrations.find(m=>key(m.agent_name)===k)};
r.score=score(r);r.action=action(r);out.push(r);
}
state.rows=out;state.lastSeen=state.profiles.map(p=>p.powerbi_last_seen_at).filter(Boolean).sort().at(-1)||null;
}
async function refresh(){
if(state.loading)return;state.loading=true;setStatus('Loading authoritative shared agent records…');
try{
if(typeof sbFetch!=='function'||typeof rm470LoadAllProfiles!=='function')throw Error('Shared RM data client is unavailable.');
const [profiles,owners,migrations]=await Promise.all([
rm470LoadAllProfiles(),
sbFetch('agent_assignments?select=agent_name,rm&limit=2000'),
sbFetch('tier_migrations?select=agent_name,from_tier,to_tier,migration_date&order=migration_date.desc&limit=300')
]);
if(!Array.isArray(profiles)||!Array.isArray(owners)||!Array.isArray(migrations))throw Error('The shared source returned incomplete data.');
state.profiles=profiles;state.ownerMap=Object.fromEntries(owners.filter(x=>x.agent_name).map(o=>[key(o.agent_name),o]));state.migrations=migrations;normalize();state.loaded=true;setStatus('');render();
}catch(e){state.loaded=false;state.rows=[];setStatus('Could not verify live shared data. No saved totals are being shown. '+(e.message||'Retry refresh.'));render();}
finally{state.loading=false;}
}
function setStatus(msg){const n=document.getElementById('rmGrowStatus');if(n)n.textContent=msg}
function filtered(){
let rows=state.rows;
if(state.view==='grow')rows=rows.filter(r=>r.tier==='C');
if(state.view==='protect')rows=rows.filter(r=>r.rm==='Amanda'&&(r.daysNoLead===null||r.daysNoLead>=30||r.competitor_risk_flag));
if(state.view==='convert')rows=rows.filter(r=>r.rm==='Amanda'&&r.leads>0);


if(state.search)rows=rows.filter(r=>r.name.toLowerCase().includes(state.search.toLowerCase()));
return [...rows].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}
function cell(row,value){const el=document.createElement('td');el.textContent=String(value===null||value===undefined?'—':value);row.append(el);return el}
function stats(){
const all=state.rows,near=all.filter(r=>r.closings===1),protect=all.filter(r=>r.daysNoLead===null||r.daysNoLead>=30||r.competitor_risk_flag),referring=all.filter(r=>r.leads>0);
return [['Active C agents',all.length],['C agents with 1 closing',near.length],['Retention attention',protect.length],['C agents with annual leads',referring.length]];
}
function render(){
const grid=document.getElementById('rmGrowStats'),tbody=document.getElementById('rmGrowRows'),subtitle=document.getElementById('rmGrowSubtitle'),brief=document.getElementById('rmGrowBrief'),meta=document.getElementById('rmGrowMeta');
if(!grid||!tbody)return;grid.replaceChildren();tbody.replaceChildren();
if(!state.loaded){meta.textContent='Live data unavailable. Refresh to retry.';subtitle.textContent='No unverified production counts displayed.';brief.textContent='Weekly review requires current shared data.';return}
const latest=state.lastSeen?new Date(state.lastSeen).toLocaleString():'not available';
meta.textContent='All active C accounts only · Latest Power BI profile stamp: '+latest+' · Excludes inactive, hidden and non-C profiles. Import row totals are not interchangeable with active C counts.';
stats().forEach(([label,value])=>{const c=document.createElement('div');c.className='rmGrowStat';const strong=document.createElement('strong');strong.textContent=value;const sub=document.createElement('span');sub.textContent=label;c.append(strong,sub);grid.append(c)});
const list=filtered();subtitle.textContent=list.length+' relationships · Sorted by actionable priority (not guaranteed promotion or closing).';
for(const p of list){
const tr=document.createElement('tr');cell(tr,p.name+' · '+p.tier);cell(tr,p.rm);cell(tr,p.leads);cell(tr,p.closings);cell(tr,p.daysNoLead===null?'Unknown':p.daysNoLead+' days');
const actionCell=cell(tr,p.action);if(p.partner_pain_points){const d=document.createElement('div');d.className='rmGrowSmall';d.textContent='Known blocker: '+p.partner_pain_points;actionCell.append(d)}
const td=document.createElement('td');const btn=document.createElement('button');btn.className='rmGrowBtn alt';btn.textContent='Log follow-up';btn.addEventListener('click',()=>{if(typeof prefillActivityLog==='function')prefillActivityLog(p.sourceName);else switchTab('log')});td.append(btn);tr.append(td);tbody.append(tr);
}
if(!list.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=7;td.textContent='No relationships match this view. Try a different filter.';tr.append(td);tbody.append(tr)}
const owned=state.rows,focus=[...owned].sort((a,b)=>b.score-a.score).slice(0,5);
brief.replaceChildren();const intro=document.createElement('p');intro.textContent='Weekly review — top five Amanda priorities (derived from current portfolio signals):';brief.append(intro);
const ol=document.createElement('ol');for(const p of focus){const li=document.createElement('li');li.textContent=p.name+' ('+p.tier+') — '+p.action;ol.append(li)}brief.append(ol);
const note=document.createElement('p');note.className='rmGrowSmall';note.textContent='Amanda sees all active C profiles from the latest stamped Power BI batch. B, A and Channel relationships are excluded. Counts are for eligible profiles only; they are not the raw Power BI import row count.';brief.append(note);
const home=document.getElementById('rmGrowHomeHint');if(home)home.textContent=owned.filter(r=>r.tier==='C'&&r.closings===1).length+' C agents with 1 close · '+owned.filter(r=>r.daysNoLead!==null&&r.daysNoLead>=30).length+' with 30+ days since last lead. Open the work order →';
}
function view(v){state.view=v;document.querySelectorAll('.rmGrowNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();}
function create(){
if(document.getElementById('rmGrowthHome'))return;
const style=document.createElement('style');style.textContent=STYLE;document.head.append(style);
const home=document.getElementById('view-week');if(!home)return;
const box=document.createElement('section');box.id='rmGrowthHome';box.innerHTML='<h2>📈 Grow & Protect Agent Business</h2><p>All active C accounts only. Grow C → B opportunities, protect existing C relationships, and convert referrals into business. Meetings are activities—not the outcome.</p><p id="rmGrowHomeHint">Open the growth work order for live priorities →</p><div class="rmGrowthHomeActions"><button class="rmGrowBtn" id="rmGrowHomeOpen">Open Growth Work Order</button><button class="rmGrowBtn alt" id="rmGrowHomePortfolio">Portfolio Health</button><button class="rmGrowBtn alt" id="rmGrowHomeRefresh">Refresh priorities</button></div>';
home.insertBefore(box,home.firstChild);
let nav=document.querySelector('.tab[data-tab="growth"]');if(nav){const newnav=document.createElement('div');newnav.className='tab';newnav.dataset.tab='growth-command';newnav.title='Live growth, retention, conversion and weekly action plan';newnav.innerHTML='<span class="nav-num">↑</span><span>Grow + Protect</span>';nav.before(newnav);newnav.addEventListener('click',()=>open())}
const target=document.getElementById('view-growth');if(!target)return;
const page=document.createElement('div');page.className='view';page.id='view-growth-command';page.innerHTML='<div class="rmGrowTop"><h2>Grow & Protect · Business Growth Work Order</h2><p>Amanda’s complete active C-account work order. B, A and Channel accounts are not shown here.</p></div><div class="rmGrowthHomeActions"><button id="rmGrowRefresh" class="rmGrowBtn">↻ Refresh shared data</button><button id="rmGrowPortfolio" class="rmGrowBtn alt">Portfolio health</button><button id="rmGrowExistingGrowth" class="rmGrowBtn alt">Existing tier movement</button></div><p class="rmGrowSmall" id="rmGrowStatus" role="status"></p><div class="rmGrowNotice" id="rmGrowMeta">Current data pending. No cached Power BI fallbacks will be used.</div><div id="rmGrowStats" class="rmGrowStatGrid"></div><div class="rmGrowNav"><button data-view="grow" class="active">All C Accounts · Growth</button><button data-view="protect">Protect Active</button><button data-view="convert">Convert Referrals</button></div><section class="rmGrowList"><h3>Priority relationships</h3><p id="rmGrowSubtitle" class="rmGrowSmall">Refresh to load.</p><div class="rmGrowFilters"><input id="rmGrowSearch" type="search" placeholder="Search agent names…" aria-label="Search growth agents"><button class="rmGrowBtn alt" id="rmGrowExport">Export visible CSV</button></div><div class="rmGrowTableWrap"><table class="rmGrowTable"><thead><tr><th>Agent / tier</th><th>RM</th><th>12m leads</th><th>12m closings</th><th>Last lead</th><th>Recommended next action</th><th>Log work</th></tr></thead><tbody id="rmGrowRows"></tbody></table></div></section><section class="rmGrowList"><h3>Monday Growth Brief</h3><div id="rmGrowBrief" class="rmGrowSmall">Loads with shared source.</div></section><section class="rmGrowList"><h3>30 / 60 / 90 growth framework</h3><div class="rmGrowSteps"><div><b>30 days — discover</b><p>Confirm buyer demand, identify service and conversion blockers, and set a dated referral commitment.</p></div><div><b>60 days — convert</b><p>Follow qualified referrals through preapproval and contracts. Coordinate with the correct LP on barriers.</p></div><div><b>90 days — measure</b><p>Review actual referrals, closings, retained activity, and verified tier movement; reset the plan.</p></div></div><p class="rmGrowSmall">Production and last-lead figures reflect shared agent profiles, not a complete loan-level conversion funnel. Review LP Tracker for individual buyer status. Contact history and outreach reasons must be logged through the existing RM workflow.</p></section>';
target.after(page);
document.getElementById('rmGrowHomeOpen').onclick=open;
document.getElementById('rmGrowHomePortfolio').onclick=()=>switchTab('portfolio');
document.getElementById('rmGrowHomeRefresh').onclick=()=>refresh();
document.getElementById('rmGrowPortfolio').onclick=()=>switchTab('portfolio');
document.getElementById('rmGrowExistingGrowth').onclick=()=>switchTab('growth');
document.getElementById('rmGrowRefresh').onclick=refresh;
document.querySelectorAll('.rmGrowNav button').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
document.getElementById('rmGrowSearch').addEventListener('input',e=>{state.search=e.target.value;render()});

document.getElementById('rmGrowExport').addEventListener('click',()=>{const rows=[['Agent','Tier','Owner','Leads past year','Closings past year','Days since last lead','Suggested action','Source'],...filtered().map(p=>[p.name,p.tier,p.rm,p.leads??'',p.closings??'',p.daysNoLead??'',p.action,'Shared agent profile'])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='rm-growth-work-order.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
refresh();
}
function open(){if(typeof switchTab==='function'){switchTab('growth-command');if(!state.loaded)refresh();}else location.href='./c-to-b-opportunities.html'}
window.rmGrowthCommand={refresh,open,view,state};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',create);else create();
})();