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
.rmGrowStat{background:#fff;border:1px solid #e7dcef;border-radius:10px;padding:13px;cursor:pointer}.rmGrowStat:hover,.rmGrowStat:focus{outline:2px solid #7855a3;outline-offset:2px}
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
.rmGrowAgentLink{background:none;border:0;padding:0;color:#52318a;font:inherit;font-weight:750;text-align:left;text-decoration:underline;text-decoration-color:#c7b0df;text-underline-offset:3px;cursor:pointer}.rmGrowAgentLink:hover{color:#301757;text-decoration-color:#301757}.rmGrowAgentLink:focus-visible{outline:2px solid #7855a3;outline-offset:3px;border-radius:3px}
.rmGrowSmall{font-size:11px;color:#6b597b}
.rmGrowFilters{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.rmGrowFilters input,.rmGrowFilters select{font-size:12px;padding:9px;border:1px solid #d2c6dc;border-radius:8px;background:white}
.rmGrowFilters input{flex:1;min-width:150px}.rmGrowHelp{font-size:12px;line-height:1.6;color:#5b4971;margin:10px 0}.rmGrowHelp strong{color:#36224e}#rmGrowAdminAudit{margin:8px 0}#rmGrowAdminAudit summary{cursor:pointer;font-size:11px;color:#675578}#rmGrowMeta{padding:9px 12px;font-size:11px;margin-top:7px}
.rmGrowSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.rmGrowSteps>div{background:#f5f0fa;border-radius:10px;padding:12px;font-size:12px;line-height:1.5}
@media(max-width:720px){.rmGrowStatGrid{grid-template-columns:repeat(2,1fr)}.rmGrowSteps{grid-template-columns:1fr}}
`;
const escape=(s)=>String(s===null||s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const date=s=>String(s||'').slice(0,10);
const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const validDay=v=>/^\d{4}-\d{2}-\d{2}$/.test(date(v))&&Number.isFinite(Date.parse(date(v)+'T12:00:00'));
const dueType=p=>{const candidates=[date(p.growth_opportunity_deadline),date(p.followup)].filter(validDay);if(!candidates.length)return 'none';const earliest=[...candidates].sort()[0],today=todayKey();return earliest<today?'overdue':earliest===today?'today':'future'};
const dueDate=p=>[date(p.growth_opportunity_deadline),date(p.followup)].filter(validDay).sort()[0]||'';
const attentionReason=p=>{const reasons=[];const due=dueType(p);if(due==='overdue')reasons.push('Overdue commitment or follow-up');else if(due==='today')reasons.push('Due today');if(p.competitor_risk_flag)reasons.push('Competitor/retention risk');if(p.daysNoLead===null)reasons.push('Last lead needs verification');else if(p.daysNoLead>=30)reasons.push('No recorded lead in '+p.daysNoLead+' days');if(p.closings===1)reasons.push('One closing away from B threshold');if(!String(p.next_growth_opportunity||'').trim())reasons.push('No growth action saved');return reasons.join(' · ')||'Maintain referral relationship'};
const todayRank=p=>{const due=dueType(p);return (due==='overdue'?10000:due==='today'?8000:0)+(p.competitor_risk_flag?1800:0)+(p.closings===1?1200:0)+(p.daysNoLead!==null&&p.daysNoLead>=30?700:0)+(p.daysNoLead===null?300:0)+(!String(p.next_growth_opportunity||'').trim()?200:0)+p.score};
const safeNumber=n=>n===null||n===undefined||n===''?null:Math.max(0,Number(n)||0);
const state={breadHistory:[],faceEvents:[],profiles:[],rows:[],ownerMap:{},migrations:[],view:'grow',search:'',sort:'priority',tier:'all',loading:false,loaded:false,lastSeen:null,importLog:null};
const getTier=p=>{const t=String(p.powerbi_level||p.tier||'').trim().toUpperCase();return ['C','B','A','CHANNEL'].includes(t)?(t==='CHANNEL'?'Channel':t):null};
const getOwner=(p,tier)=>tier==='C'?'Amanda':'Director';
function daysSince(value){const v=date(value);if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;const t=Date.parse(v+'T12:00:00');return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/86400000)):null}
function action(p){if(dueType(p)==='overdue')return 'Overdue: complete the agreed follow-up, confirm the next referral step, and log the result';
if(dueType(p)==='today')return 'Due today: contact the agent, confirm the commitment, and log the next step';
if(p.competitor_risk_flag)return 'Protect: identify the issue, agree on a recovery action and follow-up date';
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
if(tier!=='C')continue;
seen.add(k);
const rm=getOwner(p,tier),closes=safeNumber(p.closes_past_year),leads=safeNumber(p.total_leads_past_year),daysNoLead=daysSince(p.latest_lead_date);
const r={name:typeof resolvedDisplayName==='function'?resolvedDisplayName(p.agent_name):(typeof displayName==='function'?displayName(p.display_name||p.agent_name):(p.display_name||p.agent_name)),sourceName:p.agent_name,tier,rm,closings:closes,leads,daysNoLead,latestLead:date(p.latest_lead_date),latestClose:date(p.latest_close_date),competitor_risk_flag:!!p.competitor_risk_flag,high_potential_flag:!!p.high_potential_flag,next_growth_opportunity:p.next_growth_opportunity||'',growth_opportunity_deadline:p.growth_opportunity_deadline||'',partner_pain_points:p.partner_pain_points||'',referral_leakage_notes:p.referral_leakage_notes||'',recovery_plan:p.recovery_plan||'',last_contact:date(p.last_meaningful_contact_date),followup:date(p.next_rm_followup),migration:state.migrations.find(m=>key(m.agent_name)===k)};
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
state.importLog=null;try{const imports=await sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&order=imported_at.desc&limit=1');if(Array.isArray(imports)&&imports.length)state.importLog=imports[0];}catch(e){console.warn('Import reconciliation ledger unavailable',e)}
try { const [breads,events]=await Promise.all([
 sbFetch('break_breads?select=agent_name,date,logged_by&order=date.desc&limit=2000'),
 sbFetch('face_time_events?select=agent_name,event_date,status,rm&order=event_date.desc&limit=2000')
 ]);state.breadHistory=Array.isArray(breads)?breads:[];state.faceEvents=Array.isArray(events)?events:[];}
 catch(e){state.breadHistory=[];state.faceEvents=[];console.warn('Meeting history unavailable',e)}
 state.profiles=profiles;state.ownerMap=Object.fromEntries(owners.filter(x=>x.agent_name).map(o=>[key(o.agent_name),o]));state.migrations=migrations;normalize();state.loaded=true;setStatus('');render();window.dispatchEvent(new Event('rm-growth-updated'));
}catch(e){state.loaded=false;state.rows=[];state.profiles=[];state.lastSeen=null;state.importLog=null;setStatus('Could not verify live shared data. No saved totals are being shown. '+(e.message||'Retry refresh.'));render();}
finally{state.loading=false;if(!state.loaded)window.dispatchEvent(new Event('rm-growth-updated'));}
}
function setStatus(msg){const n=document.getElementById('rmGrowStatus');if(n)n.textContent=msg}
function filtered(){
let rows=state.rows;
if(state.view==='grow')rows=rows.filter(r=>r.tier==='C');
if(state.view==='protect')rows=rows.filter(r=>r.rm==='Amanda'&&(r.daysNoLead===null||r.daysNoLead>=30||r.competitor_risk_flag));
if(state.view==='convert')rows=rows.filter(r=>r.rm==='Amanda'&&r.leads>0);
if(state.view==='near')rows=rows.filter(r=>r.closings===1);
if(state.view==='missing')rows=rows.filter(r=>!String(r.next_growth_opportunity||'').trim());


if(state.search)rows=rows.filter(r=>r.name.toLowerCase().includes(state.search.toLowerCase()));
const comparisons={
 priority:(a,b)=>todayRank(b)-todayRank(a),
 'leads-desc':(a,b)=>(b.leads??-1)-(a.leads??-1),
 'leads-asc':(a,b)=>(a.leads??Infinity)-(b.leads??Infinity),
 'closings-desc':(a,b)=>(b.closings??-1)-(a.closings??-1),
 'closings-asc':(a,b)=>(a.closings??Infinity)-(b.closings??Infinity),
 'lastlead-desc':(a,b)=>(b.daysNoLead??-1)-(a.daysNoLead??-1),
 'lastlead-asc':(a,b)=>(a.daysNoLead??Infinity)-(b.daysNoLead??Infinity),
 'name':(a,b)=>a.name.localeCompare(b.name)
};
const compare=comparisons[state.sort]||comparisons.priority;
return [...rows].sort((a,b)=>compare(a,b)||a.name.localeCompare(b.name));
}
function cell(row,value){const el=document.createElement('td');el.textContent=String(value===null||value===undefined?'—':value);row.append(el);return el}
function stats(){
const all=state.rows,near=all.filter(r=>r.closings===1),protect=all.filter(r=>r.daysNoLead===null||r.daysNoLead>=30||r.competitor_risk_flag),missing=all.filter(r=>!String(r.next_growth_opportunity||'').trim());
return [['All active C agents',all.length,'grow'],['Need attention',protect.length,'protect'],['Close to B',near.length,'near'],['Missing next step',missing.length,'missing']];
}


let rmInviteRows=[],rmInviteSelected=null;
function rmInvitePlannerRender(){
 const panel=document.getElementById('rmInvitePlanner');if(!panel)return;
 const tbody=panel.querySelector('tbody'),caption=panel.querySelector('.rmInviteCount');if(!tbody||!caption)return;
 tbody.replaceChildren();
 if(!state.loaded){caption.textContent='Load current profiles to see invitations.';return;}
 const today=todayKey(),latest=date(state.lastSeen),seen=new Set(),history=new Map(),scheduled=new Map();
 for(const b of state.breadHistory){const k=key(b.agent_name),d=date(b.date);if(k&&d&&(!history.has(k)||d>history.get(k)))history.set(k,d)}
 for(const e of state.faceEvents){
  const k=key(e.agent_name),d=date(e.event_date),s=String(e.status||'').toLowerCase();
  if(k&&d>=today&&!/cancel|complete|held|done/.test(s)&&(!scheduled.has(k)||d<scheduled.get(k)))scheduled.set(k,d);
  if(k&&d<=today&&/complete|held|done/.test(s)&&(!history.has(k)||d>history.get(k)))history.set(k,d);
 }
 rmInviteRows=state.profiles.filter(p=>{
  const k=key(p.agent_name);if(!k||seen.has(k)||date(p.powerbi_last_seen_at)!==latest||getTier(p)!=='C'||p.do_not_contact===true||p.relationship_status==='inactive'||p.display_name==='__HIDDEN__'||p.relationship_type==='strategic_partner')return false;
  seen.add(k);return true;
 }).map(p=>{const k=key(p.agent_name),last=history.get(k)||'',next=scheduled.get(k)||date(p.next_meeting_date),contact=date(p.last_meaningful_contact_date);
  return {p,name:p.display_name||p.agent_name,last,next:next>=today?next:'',contact,days:last?daysSince(last):null,leads:Number(p.total_leads_past_year)||0,closes:Number(p.closes_past_year)||0};
 });
 const search=key(panel.querySelector('#rmInviteSearch')?.value),status=panel.querySelector('#rmInviteFilter')?.value||'all',sort=panel.querySelector('#rmInviteSort')?.value||'urgent';
 const candidates=rmInviteRows.filter(x=>(!search||key(x.name).includes(search))&&(status==='all'||(status==='unscheduled'?!x.next:!!x.next)));
 candidates.sort(sort==='az'?(a,b)=>a.name.localeCompare(b.name):sort==='scheduled'?(a,b)=>(a.next||'9999').localeCompare(b.next||'9999'): (a,b)=>Number(!!a.next)-Number(!!b.next)||(b.days??9999)-(a.days??9999)||b.leads-a.leads||a.name.localeCompare(b.name));
 const unscheduled=rmInviteRows.filter(x=>!x.next).length;
 caption.textContent=unscheduled+' C agents without a future meeting recorded · '+candidates.length+' matching of '+rmInviteRows.length+' C accounts.';
 for(const x of candidates){
  const tr=document.createElement('tr'),name=document.createElement('td'),btn=document.createElement('button');
  btn.className='rmGrowAgentLink';btn.type='button';btn.textContent=x.name;btn.onclick=()=>{if(window.rmGrowthDeepDive?.edit)window.rmGrowthDeepDive.edit(x.p.agent_name)};name.append(btn);tr.append(name);
  for(const v of [x.last||'Not recorded',x.next||'Not scheduled',x.contact||'Not recorded',x.closes===1?'Close to B':x.leads>0?'Existing referral partner':'Build relationship']){
   const td=document.createElement('td');td.textContent=v;tr.append(td);
  }
  const act=document.createElement('td');
  for(const kind of ['Book','Log']){
   const b=document.createElement('button');b.type='button';b.className='rmGrowBtn'+(kind==='Log'?' alt':'');b.textContent=kind;b.style.margin='2px';b.onclick=()=>rmInviteOpen(kind,x);act.append(b);
  }
  tr.append(act);tbody.append(tr);
 }
 if(!candidates.length)caption.textContent='No C-agent relationships match the selected filters.';
}
function rmInviteOpen(mode,item){
 rmInviteSelected={mode,item};const form=document.getElementById('rmInviteForm');if(!form)return;
 form.hidden=false;form.querySelector('#rmInviteAgent').textContent=mode+' · '+item.name;
 form.querySelector('#rmInviteDate').value=todayKey();form.querySelector('#rmInviteDate').min=mode==='Book'?todayKey():'';
 form.querySelector('#rmInviteType').value='Break Bread';form.querySelector('#rmInviteNotes').value='';
 form.querySelector('#rmInviteSave').textContent=mode==='Book'?'Save visit booking':'Log completed visit';
 form.querySelector('#rmInviteResult').textContent='';form.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function rmInviteSave(){
 if(!rmInviteSelected)return;
 const form=document.getElementById('rmInviteForm'),{mode,item}=rmInviteSelected;
 const dateValue=form.querySelector('#rmInviteDate').value,type=form.querySelector('#rmInviteType').value,notes=form.querySelector('#rmInviteNotes').value.trim();
 const result=form.querySelector('#rmInviteResult'),save=form.querySelector('#rmInviteSave');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)||mode==='Book'&&dateValue<todayKey()){result.textContent='Choose a valid visit date.';return}
 if(mode==='Log'&&!notes){result.textContent='Enter a short visit outcome before logging.';return}
 if(mode==='Book'&&rmInviteRows.some(r=>key(r.p.agent_name)===key(item.p.agent_name)&&r.next===dateValue)){result.textContent='A visit is already scheduled on that date.';return}
 save.disabled=true;result.textContent='Saving to shared Face Time records…';
 try{
  const agent_name=item.p.agent_name;
  const payload={agent_name,event_date:dateValue,rm:'Amanda',status:mode==='Book'?'scheduled':'completed',created_by:'Amanda',notes:type+(notes?' · '+notes:'')};
  const out=await sbFetch('face_time_events?select=id',{method:'POST',prefer:'return=representation',body:JSON.stringify(payload)});
  if(!Array.isArray(out)||!out[0]?.id)throw Error('The visit save was not confirmed.');
  // One shared visit event per action; do not duplicate the event into assignment queues.
  result.textContent=mode==='Book'?'Visit booked and saved.':'Visit logged successfully.';
  form.hidden=true;rmInviteSelected=null;await refresh();
 }catch(e){result.textContent='Unable to confirm the save: '+String(e.message||e)}
 finally{save.disabled=false}
}

function render(){
rmInvitePlannerRender();
const grid=document.getElementById('rmGrowStats'),tbody=document.getElementById('rmGrowRows'),subtitle=document.getElementById('rmGrowSubtitle'),brief=document.getElementById('rmGrowBrief'),meta=document.getElementById('rmGrowMeta');
if(!grid||!tbody)return;grid.replaceChildren();tbody.replaceChildren();
if(!state.loaded){const count=document.getElementById('rmGrowViewCount');if(count)count.textContent='Live C-agent count unavailable.';meta.textContent='Live data unavailable. Refresh to retry.';const clean=document.getElementById('rmGrowCleanSummary');if(clean)clean.textContent='Unable to verify current C-agent counts. Refresh shared data.';subtitle.textContent='No unverified production counts displayed.';brief.textContent='Today’s priorities require current shared data.';return}
const latest=state.lastSeen?new Date(state.lastSeen).toLocaleString():'not available';
const stamped=state.profiles.filter(p=>date(p.powerbi_last_seen_at)===date(state.lastSeen)),stampedC=stamped.filter(p=>getTier(p)==='C');
const importRow=state.importLog,raw=importRow?Number(importRow.rows_processed):null;
const importDate=date(importRow&&importRow.imported_at),stampDate=date(state.lastSeen);
const receiptCurrent=Boolean(importDate&&stampDate&&importDate===stampDate);
const excluded=raw===null?null:raw-stamped.length;
const nov9Approved=receiptCurrent&&stampDate==='2026-11-09'&&raw===136&&stamped.length===132
 &&stamped.filter(p=>getTier(p)==='A').length===16
 &&stamped.filter(p=>getTier(p)==='B').length===21
 &&stamped.filter(p=>getTier(p)==='C').length===95;
const verified=receiptCurrent&&raw!==null&&Number.isFinite(raw)&&excluded>=0;
const warning=nov9Approved?'November 9 import reconciled: four approved source-row exclusions.'
 :!verified?' RECONCILIATION REQUIRED: latest import receipt or stamped profile batch not verified; do not use these as official Power BI totals.'
 :excluded>0?' RECONCILIATION REQUIRED: '+excluded+' source-row exclusion'+(excluded===1?'':'s')+' must be reviewed before treating import totals as official.'
 :' Import receipt matches the latest stamped profile count.';
meta.textContent='Data verification · '+latest+' · '+stamped.length+' stamped profiles; '+stampedC.length+' stamped C profiles; '+(importRow?raw+' imported rows':'import receipt unavailable')+'. '+warning+' Inactive, hidden and non-C profiles excluded.';
const summary=document.getElementById('rmGrowCleanSummary');if(summary)summary.textContent=state.rows.length+' active C relationships · Review growth, protect those at risk, and follow referrals through to business.';
stats().forEach(([label,value,target])=>{const c=document.createElement('div');c.className='rmGrowStat';c.setAttribute('role','button');c.tabIndex=0;c.setAttribute('aria-label','View '+label);const activate=()=>view(target);c.addEventListener('click',activate);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});const strong=document.createElement('strong');strong.textContent=value;const sub=document.createElement('span');sub.textContent=label;c.append(strong,sub);grid.append(c)});
const list=filtered();const viewLabel={grow:'All active C accounts',protect:'Need Attention',convert:'Referral Opportunities',near:'Close to B',missing:'Missing Next Step'};const viewCount=document.getElementById('rmGrowViewCount');if(viewCount)viewCount.textContent=(viewLabel[state.view]||'Selected view')+': '+list.length+' of '+state.rows.length+' active C agents. These are filtered groups, not missing records.';const sortTitle={priority:'today’s follow-ups and relationship risk','leads-desc':'most annual leads','leads-asc':'fewest annual leads','closings-desc':'most annual closings','closings-asc':'fewest annual closings','lastlead-desc':'longest since last lead','lastlead-asc':'shortest since last lead',name:'agent name'};subtitle.textContent=list.length+' relationships · Sorted by '+(sortTitle[state.sort]||'priority')+'. Counts may overlap across views.';
for(const p of list){
const tr=document.createElement('tr');const agentCell=cell(tr,'');const agentLink=document.createElement('button');agentLink.type='button';agentLink.className='rmGrowAgentLink';agentLink.textContent=p.name+' · '+p.tier;agentLink.setAttribute('aria-label','Open '+p.name+' agent plan');agentLink.addEventListener('click',()=>{try{if(!window.rmGrowthDeepDive?.edit||window.rmGrowthDeepDive.edit(p.sourceName)===false)throw Error('Plan editor unavailable');}catch(e){setStatus('Could not open '+p.name+' plan. Refresh shared data.')}});agentCell.append(agentLink);cell(tr,p.rm);cell(tr,p.leads);cell(tr,p.closings);cell(tr,p.closings===1?'1 more for B':p.closings===0?'2 more for B':'Verify tier');cell(tr,p.daysNoLead===null?'Unknown':p.daysNoLead+' days');
const actionCell=cell(tr,attentionReason(p)+' — '+p.action);if(p.partner_pain_points){const d=document.createElement('div');d.className='rmGrowSmall';d.textContent='Known blocker: '+p.partner_pain_points;actionCell.append(d)}
const td=document.createElement('td');const btn=document.createElement('button');btn.className='rmGrowBtn alt';btn.textContent='Agent plan';btn.addEventListener('click',()=>{try{if(window.rmGrowthDeepDive&&typeof window.rmGrowthDeepDive.edit==='function'){const opened=window.rmGrowthDeepDive.edit(p.sourceName);if(opened===false)throw Error('Agent record could not be opened');}else throw Error('Agent plan editor is unavailable. Refresh this page.');}catch(e){setStatus('Could not open '+p.name+' plan: '+(e.message||'Unknown error'));}});const log=document.createElement('button');log.className='rmGrowBtn alt';log.textContent='Log';log.setAttribute('aria-label','Log activity for '+p.name);log.style.marginLeft='5px';td.append(btn,log);log.addEventListener('click',()=>{if(typeof prefillActivityLog==='function')prefillActivityLog(p.sourceName);else switchTab('log')});tr.append(td);tbody.append(tr);
}
if(!list.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=8;td.textContent='No relationships match this view. Try a different filter.';tr.append(td);tbody.append(tr)}
const owned=state.rows,focus=[...owned].sort((a,b)=>todayRank(b)-todayRank(a)||a.name.localeCompare(b.name)).slice(0,5);
brief.replaceChildren();const intro=document.createElement('p');intro.textContent='Today’s top five relationship priorities:';brief.append(intro);
const ol=document.createElement('ol');for(const p of focus){const li=document.createElement('li');li.textContent=p.name+' — '+attentionReason(p)+(dueDate(p)?' · Next due '+dueDate(p):'')+' — '+p.action;const act=document.createElement('button');act.type='button';act.className='rmGrowBtn alt';act.textContent='Open plan';act.style.marginLeft='8px';act.addEventListener('click',()=>{try{if(!window.rmGrowthDeepDive?.edit||window.rmGrowthDeepDive.edit(p.sourceName)===false)throw Error('Editor unavailable');}catch(e){setStatus('Could not open '+p.name+' plan. Refresh shared data.')}});li.append(act);ol.append(li)}brief.append(ol);
const note=document.createElement('p');note.className='rmGrowSmall';note.textContent='Contact each priority agent, identify a real buyer or referral opportunity, agree on a dated next step, and log what happened. Follow up on referred buyers with the assigned loan partner.';brief.append(note);
const home=document.getElementById('rmGrowHomeHint');if(home)home.textContent=owned.filter(r=>r.tier==='C'&&r.closings===1).length+' C agents with 1 close · '+owned.filter(r=>r.daysNoLead!==null&&r.daysNoLead>=30).length+' with 30+ days since last lead. Open the work order →';
}
function view(v){state.view=v;document.querySelectorAll('.rmGrowNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));const desc={grow:'All C Accounts: grow relationships with a clear referral goal and a dated next step.',protect:'Need Attention: agents with 30+ days without a recorded lead, unknown lead date, or a competitor risk flag. Call to understand their buyer pipeline, resolve service issues, agree on a referral opportunity, and schedule follow-up.',convert:'Referral Opportunities: C agents who have referred at least one lead in the past year. Coordinate with their loan partner to move qualified buyers forward and ask for the next referral.',near:'Close to B: C agents with one annual closing. One additional verified closing would meet the two-closing B threshold, subject to official tier rules.',missing:'Missing Next Step: C agents without a saved next growth opportunity. Set a specific buyer/referral action and due date.'};const expl=document.getElementById('rmGrowViewExplain');if(expl)expl.textContent=desc[v]||desc.grow;render();}

/* Compact daily activity overview. Independent of work queue: only real activity, not imported transaction triggers. */
const rmActivityEscape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[ch]));
const rmActivityToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function rmActivityCardCreate(){
 const home=document.getElementById('view-week');
 if(!home||document.getElementById('rmActivityTodayCard'))return;
 const css=document.createElement('style');css.textContent=`
 #rmActivityTodayCard{background:white;border:1px solid #e5dfed;border-radius:14px;margin:12px 0;padding:15px;color:#211b32;box-shadow:0 2px 8px rgba(32,23,55,.04)}
 #rmActivityTodayCard .rmActHead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
 #rmActivityTodayCard h2{font-size:17px;margin:0;font-weight:750}#rmActivityTodayCard .rmActMeta{font-size:12px;color:#716781}
 #rmActivityTodayCard .rmActRefresh{border:1px solid #d8cde7;border-radius:8px;padding:7px 12px;color:#573981;background:white;cursor:pointer;font-weight:600}
 #rmActivityTodayCard .rmActStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}
 #rmActivityTodayCard .rmActStat{background:#faf8fd;border-radius:9px;padding:10px}#rmActivityTodayCard .rmActStat strong{display:block;font-size:21px;color:#52367c}#rmActivityTodayCard .rmActStat span{font-size:11px;color:#655b71}
 #rmActivityTodayCard .rmActItems{margin:0;padding:0;list-style:none}#rmActivityTodayCard .rmActItems li{display:flex;gap:10px;justify-content:space-between;border-top:1px solid #eeeaf3;padding:9px 0;font-size:12px;line-height:1.45}
 #rmActivityTodayCard .rmActItems small{color:#716781}#rmActivityTodayCard .rmActEmpty{font-size:12px;color:#716781}
 @media(max-width:620px){#rmActivityTodayCard .rmActStats{grid-template-columns:repeat(2,minmax(0,1fr))}#rmActivityTodayCard .rmActItems li{display:block}}
 `;document.head.appendChild(css);
 const card=document.createElement('section');card.id='rmActivityTodayCard';card.setAttribute('aria-label',"Amanda's activity today");
 card.innerHTML='<div class="rmActHead"><div><h2>Amanda’s Activity Today</h2><div class="rmActMeta" id="rmActDate"></div></div><button type="button" class="rmActRefresh" id="rmActRefresh">Refresh activity</button></div><div class="rmActStats" id="rmActStats"></div><div class="rmActMeta" style="margin-bottom:6px">Most recent logged activity</div><ul class="rmActItems" id="rmActItems"><li>Loading today’s activity…</li></ul><div class="rmActMeta" id="rmActUpdated"></div>';
 home.insertBefore(card,home.firstChild);card.querySelector('#rmActRefresh').addEventListener('click',rmActivityCardLoad);
 rmActivityCardLoad();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)rmActivityCardLoad()});
 window.addEventListener('focus',rmActivityCardLoad);
}
let rmActivityBusy=false;
async function rmActivityCardLoad(){
 const card=document.getElementById('rmActivityTodayCard');if(!card||rmActivityBusy)return;
 const today=rmActivityToday();card.querySelector('#rmActDate').textContent=today;
 const list=card.querySelector('#rmActItems'),stats=card.querySelector('#rmActStats');
 if(typeof sbFetch!=='function'){list.innerHTML='<li>Shared activity data is unavailable.</li>';return}
 rmActivityBusy=true;
 try{
 const rows=await sbFetch('amanda_activities?select=id,agent_name,act_type,act_date,outcome,created_at,notes&act_date=eq.'+today+'&order=created_at.desc&limit=1000');
 if(!Array.isArray(rows))throw Error('The shared activity service did not return a list.');
 const items=rows.filter(a=>{
  const t=String(a.act_type||'').toLowerCase(),n=String(a.notes||'');
  return !/transaction snapshot|clear to close|new contract/.test(t)&&!n.includes('[TXN_TRIGGER]')&&!n.includes('[TXN_SNAPSHOT]')&&!n.includes('[TXN_SUPPRESSED]');
 });
 const calls=items.filter(a=>/call|talk.to|outreach|check.in|listing agent update/.test(String(a.act_type||'').toLowerCase()));
 const conversations=items.filter(a=>/connected|talked|positive|spoke|conversation|reached/.test(String(a.outcome||'').toLowerCase()));
 const meetings=items.filter(a=>/meeting|break bread|business planning/.test(String(a.act_type||'').toLowerCase()));
 const followups=items.filter(a=>/follow.up|check.in|reconnect/.test(String(a.act_type||'').toLowerCase()));
 stats.innerHTML=[['Calls logged',calls.length],['Conversations',conversations.length],['Meetings',meetings.length],['Follow-ups',followups.length]].map(([label,n])=>'<div class="rmActStat"><strong>'+n+'</strong><span>'+label+'</span></div>').join('');
 list.innerHTML=items.length?items.slice(0,5).map(a=>'<li><span><strong>'+rmActivityEscape(a.agent_name||'Agent')+'</strong> · '+rmActivityEscape(a.act_type||'Activity')+'<br><small>'+rmActivityEscape(a.outcome||'Logged')+'</small></span></li>').join(''):'<li class="rmActEmpty">No activity logged today yet.</li>';
 card.querySelector('#rmActUpdated').textContent='From shared activity log · '+items.length+' logged activities today';
 }catch(e){list.innerHTML='<li>Could not load today’s activity. Use Refresh activity to try again.</li>';stats.innerHTML='';}
 finally{rmActivityBusy=false;}
}

function create(){
if(document.getElementById('rmGrowthHome'))return;
const style=document.createElement('style');style.textContent=STYLE;document.head.append(style);
const home=document.getElementById('view-week');if(!home)return;
rmActivityCardCreate();
const box=document.createElement('section');box.id='rmGrowthHome';box.innerHTML='<h2>📈 Grow & Protect Agent Business</h2><p>All active C accounts only. Grow C → B opportunities, protect existing C relationships, and convert referrals into business. Meetings are activities—not the outcome.</p><p id="rmGrowHomeHint">Open the growth work order for live priorities →</p><div class="rmGrowthHomeActions"><button class="rmGrowBtn" id="rmGrowHomeOpen">Open Growth Work Order</button><button class="rmGrowBtn alt" id="rmGrowHomePortfolio">Portfolio Health</button><button class="rmGrowBtn alt" id="rmGrowHomeRefresh">Refresh priorities</button></div>';
box.hidden=true;home.insertBefore(box,home.firstChild); // Avoid duplicating the daily relationship reminder
let nav=document.querySelector('.tab[data-tab="growth"]');if(nav){const newnav=document.createElement('div');newnav.className='tab';newnav.dataset.tab='growth-command';newnav.title='Live growth, retention, conversion and weekly action plan';newnav.innerHTML='<span class="nav-num">↑</span><span>Grow + Protect</span>';nav.before(newnav);nav.hidden=true;nav.setAttribute('aria-hidden','true');nav.style.display='none';newnav.addEventListener('click',()=>open())}
const target=document.getElementById('view-growth');if(!target)return;
const page=document.createElement('div');page.className='view';page.id='view-growth-command';page.innerHTML='<div class="rmGrowTop"><h2>Grow & Protect · C-Agent Work Order</h2><p>One place to grow existing C relationships, protect referrals and track business results.</p></div><div class="rmGrowthHomeActions"><button id="rmGrowRefresh" class="rmGrowBtn">↻ Refresh shared data</button><button id="rmGrowPortfolio" class="rmGrowBtn alt">Portfolio health</button><button id="rmGrowExistingGrowth" class="rmGrowBtn alt">Tier results</button></div><p class="rmGrowSmall" id="rmGrowStatus" role="status"></p><p id="rmGrowCleanSummary" class="rmGrowHelp">Loading live C-agent priorities…</p><details id="rmGrowAdminAudit"><summary>Data verification · admin details</summary><div class="rmGrowNotice" id="rmGrowMeta">Checking live data…</div></details><div id="rmGrowStats" class="rmGrowStatGrid"></div><div class="rmGrowNav"><button data-view="grow" class="active">All C Accounts · Growth</button><button data-view="protect">Need Attention</button><button data-view="convert">Referral Opportunities</button><button data-view="near">Close to B</button><button data-view="missing">Missing Next Step</button></div><p id="rmGrowViewExplain" class="rmGrowHelp" role="status">All C accounts: review each agent’s leads, closings and next growth action.</p><p id="rmGrowViewCount" class="rmGrowHelp" aria-live="polite">Showing all active C agents.</p><section class="rmGrowList"><h3>Priority relationships</h3><p id="rmGrowSubtitle" class="rmGrowSmall">Refresh to load.</p><div class="rmGrowFilters"><input id="rmGrowSearch" type="search" placeholder="Search agent names…" aria-label="Search growth agents"><select id="rmGrowSort" aria-label="Sort C-agent relationships"><option value="priority">Sort: Recommended priority</option><option value="closings-desc">Closings: most first</option><option value="closings-asc">Closings: fewest first</option><option value="leads-desc">Leads: most first</option><option value="leads-asc">Leads: fewest first</option><option value="lastlead-desc">Days since lead: longest</option><option value="lastlead-asc">Days since lead: shortest</option><option value="name">Agent name: A to Z</option></select><button class="rmGrowBtn alt" id="rmGrowExport">Export visible CSV</button></div><div class="rmGrowTableWrap"><table class="rmGrowTable"><thead><tr><th>Agent / tier</th><th>RM</th><th>12m leads</th><th>12m closings</th><th>To B</th><th>Last lead</th><th>Why this agent / next action</th><th>Actions</th></tr></thead><tbody id="rmGrowRows"></tbody></table></div></section><section class="rmGrowList"><h3>Today’s Top Priorities</h3><div id="rmGrowBrief" class="rmGrowSmall">Loads with shared source.</div></section><section class="rmGrowList"><h3>30 / 60 / 90 growth framework</h3><div class="rmGrowSteps"><div><b>30 days — discover</b><p>Confirm buyer demand, identify service and conversion blockers, and set a dated referral commitment.</p></div><div><b>60 days — convert</b><p>Follow qualified referrals through preapproval and contracts. Coordinate with the correct LP on barriers.</p></div><div><b>90 days — measure</b><p>Review actual referrals, closings, retained activity, and verified tier movement; reset the plan.</p></div></div><p class="rmGrowSmall">Production and last-lead figures reflect shared agent profiles, not a complete loan-level conversion funnel. Review LP Tracker for individual buyer status. Contact history and outreach reasons must be logged through the existing RM workflow.</p></section>';
target.after(page);
const invite=document.createElement('section');invite.id='rmInvitePlanner';invite.className='rmGrowList';invite.innerHTML='<h3>Break Bread & Office Visit Invitations</h3><p class="rmGrowHelp">Who should Amanda invite next? Shows active C agents, prior Break Breads and upcoming meetings from shared records. Click a name to open their plan. No calls are automatically assigned.</p><p class="rmInviteCount rmGrowSmall">Loading current relationships…</p><div class="rmGrowFilters"><input id="rmInviteSearch" type="search" placeholder="Search agents…" aria-label="Search C-agent Face Time"><select id="rmInviteFilter"><option value="all">All C accounts</option><option value="unscheduled">Needs scheduling</option><option value="scheduled">Already scheduled</option></select><select id="rmInviteSort"><option value="urgent">Sort: most urgent</option><option value="scheduled">Next booked date</option><option value="az">Agent A–Z</option></select></div><div class="rmGrowTableWrap"><table class="rmGrowTable"><thead><tr><th>Agent</th><th>Last visit</th><th>Next meeting</th><th>Last meaningful contact</th><th>Why prioritize</th><th>Action</th></tr></thead><tbody></tbody></table></div><p class="rmGrowSmall">Missing meeting history means not recorded, not necessarily never met. Confirm invitations before scheduling.</p>';
page.querySelector('.rmGrowTop')?.after(invite);
const visitForm=document.createElement('section');visitForm.id='rmInviteForm';visitForm.className='rmGrowList';visitForm.hidden=true;
visitForm.innerHTML='<h3 id="rmInviteAgent">Visit</h3><div class="rmGrowFilters"><label>Date <input id="rmInviteDate" type="date" required></label><label>Visit type <select id="rmInviteType"><option>Break Bread</option><option>Office Visit</option><option>Agent Lunch</option></select></label></div><label>Notes / visit outcome <textarea id="rmInviteNotes" rows="2" style="width:100%;min-height:75px" placeholder="Purpose, outcome, or next step"></textarea></label><div class="rmGrowthHomeActions"><button class="rmGrowBtn" type="button" id="rmInviteSave">Save</button><button class="rmGrowBtn alt" type="button" id="rmInviteCancel">Cancel</button></div><p id="rmInviteResult" role="status" class="rmGrowHelp"></p>';
invite.after(visitForm);
for(const id of ['rmInviteSearch','rmInviteFilter','rmInviteSort'])document.getElementById(id)?.addEventListener(id==='rmInviteSearch'?'input':'change',rmInvitePlannerRender);
document.getElementById('rmInviteSave').onclick=rmInviteSave;
document.getElementById('rmInviteCancel').onclick=()=>{visitForm.hidden=true;rmInviteSelected=null};


document.getElementById('rmGrowHomeOpen').onclick=open;
document.getElementById('rmGrowHomePortfolio').onclick=()=>switchTab('portfolio');
document.getElementById('rmGrowHomeRefresh').onclick=()=>refresh();
document.getElementById('rmGrowPortfolio').onclick=()=>switchTab('portfolio');
document.getElementById('rmGrowExistingGrowth').onclick=()=>{const panel=document.getElementById('gdMigrations');if(panel){panel.closest('details').open=true;panel.scrollIntoView({behavior:'smooth',block:'start'});}else setStatus('Tier results are loading. Refresh the page to retry.');};
document.getElementById('rmGrowRefresh').onclick=refresh;
document.querySelectorAll('.rmGrowNav button').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
document.getElementById('rmGrowSearch').addEventListener('input',e=>{state.search=e.target.value;render()});document.getElementById('rmGrowSort').addEventListener('change',e=>{state.sort=e.target.value;render()});

document.getElementById('rmGrowExport').addEventListener('click',()=>{const rows=[['Agent','Tier','Owner','Leads past year','Closings past year','Closings to B','Days since last lead','Suggested action','Source'],...filtered().map(p=>[p.name,p.tier,p.rm,p.leads??'',p.closings??'',p.closings===1?1:p.closings===0?2:'verify',p.daysNoLead??'',p.action,'Shared agent profile'])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='rm-growth-work-order.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
refresh();
}
function open(){if(typeof switchTab==='function'){switchTab('growth-command');if(!state.loaded)refresh();}else location.href='./c-to-b-opportunities.html'}
window.rmGrowthCommand={refresh,open,view,state};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',create);else create();
})();