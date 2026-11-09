(function(){
'use strict';
const ctl=()=>window.rmGrowthCommand;
const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
let selected='',leadByAgent={},duplicateKeys=[],ready=false;
function group(s){s=String(s||'').toLowerCase();if(s==='started')return'applied';if(s==='contacted'||s==='scheduled'||s.includes('meeting scheduled')||s==='nurture - contacted')return'contacted';if(s==='funding')return'funding';if(s==='processing'||s==='submittal'||s==='ready for pack out')return'processing';if(s.includes('does not qualify')||s.includes('withdrawn')||s.includes('denied')||s.includes('not interested')||s.includes('bad lead')||s.includes('do not contact'))return'excluded';return'other'}
function el(id){return document.getElementById(id)}
async function reload(){
el('gdStatus').textContent='Checking Velocify lead status…';
try{
const rows=await sbFetch('velocify_leads?select=id,lead_key,referral_partner_name,status,lp_user&limit=5000');
if(!Array.isArray(rows))throw Error('Lead feed unavailable');
const groups=new Map();for(const r of rows){const key=r.lead_key||String(r.id);const arr=groups.get(key)||[];arr.push(r);groups.set(key,arr)}
duplicateKeys=[];leadByAgent={};for(const [key,arr] of groups){if(arr.length>1){duplicateKeys.push({key,arr});continue}const r=arr[0],agent=norm(r.referral_partner_name);if(!agent)continue;const x=leadByAgent[agent]||(leadByAgent[agent]={total:0,applied:0,contacted:0,processing:0,funding:0,excluded:0,other:0});x.total++;x[group(r.status)]++}
ready=true;draw();
}catch(e){ready=false;el('gdStatus').textContent='Could not verify live Velocify records: '+e.message}
}
function rowFor(name){return ctl()?.state?.profiles.find(p=>norm(p.agent_name)===norm(name))}
function draw(){
const state=ctl()?.state;if(!state?.loaded||!ready)return;el('gdStatus').textContent='Live Velocify lead keys: '+Object.values(leadByAgent).reduce((n,x)=>n+x.total,0)+' · Duplicate keys excluded: '+duplicateKeys.length+'.';
const table=el('gdRows');table.replaceChildren();
for(const a of state.rows.filter(x=>x.rm==='Amanda'&&leadByAgent[norm(x.sourceName)]).sort((a,b)=>b.score-a.score).slice(0,100)){
const n=leadByAgent[norm(a.sourceName)],tr=document.createElement('tr');for(const v of [a.name,a.tier,n.total,n.applied,n.contacted,n.processing,n.funding,n.excluded]){const td=document.createElement('td');td.textContent=v;tr.append(td)}
const cell=document.createElement('td'),b=document.createElement('button');b.textContent='Edit growth plan';b.onclick=()=>edit(a.sourceName);cell.append(b);tr.append(cell);table.append(tr)
}
const migration=el('gdMigrations');migration.replaceChildren();const list=document.createElement('ul');for(const m of state.migrations.filter(m=>['B','A','Channel'].includes(m.to_tier)).slice(0,12)){const p=state.rows.find(r=>norm(r.sourceName)===norm(m.agent_name));const li=document.createElement('li');li.textContent=m.agent_name+' · '+m.from_tier+' → '+m.to_tier+' · '+m.migration_date+' · '+(!p?'Outside latest active batch':p.tier===m.to_tier?'Matches current tier':'NEEDS VERIFICATION');list.append(li)}migration.append(list);
const commitments=el('gdCommitments');commitments.replaceChildren();for(const a of state.rows.filter(x=>x.rm==='Amanda'&&x.next_growth_opportunity).sort((a,b)=>String(a.growth_opportunity_deadline||'9999').localeCompare(String(b.growth_opportunity_deadline||'9999'))).slice(0,25)){const b=document.createElement('button');b.textContent=a.name+': '+a.next_growth_opportunity+' · due '+(a.growth_opportunity_deadline||'not set');b.onclick=()=>edit(a.sourceName);commitments.append(b)}
}
function edit(name){
const p=rowFor(name);if(!p){el('gdStatus').textContent='Agent is missing from the latest shared profiles';return}selected=p.agent_name;el('gdDialog').hidden=false;el('gdTitle').textContent='Growth plan · '+(p.display_name||p.agent_name);
for(const id of ['next_growth_opportunity','growth_opportunity_deadline','partner_pain_points','referral_leakage_notes','recovery_plan'])el('gd_'+id).value=p[id]||'';
for(const id of ['high_potential_flag','competitor_risk_flag'])el('gd_'+id).checked=!!p[id];el('gdSaveStatus').textContent='';
}
async function save(){
if(!selected)return;const data={};for(const id of ['next_growth_opportunity','growth_opportunity_deadline','partner_pain_points','referral_leakage_notes','recovery_plan'])data[id]=el('gd_'+id).value.trim()||null;
for(const id of ['high_potential_flag','competitor_risk_flag'])data[id]=el('gd_'+id).checked;
el('gdSave').disabled=true;el('gdSaveStatus').textContent='Saving…';
try{await sbFetch('agent_profiles?agent_name=eq.'+encodeURIComponent(selected),{method:'PATCH',body:JSON.stringify(data)});
const found=await sbFetch('agent_profiles?select=agent_name,next_growth_opportunity&agent_name=eq.'+encodeURIComponent(selected));if(!Array.isArray(found)||found.length!==1||found[0].next_growth_opportunity!==data.next_growth_opportunity)throw Error('Shared data verification failed');
el('gdSaveStatus').textContent='Saved and verified. Record actual referrals and closings in the normal work log.';await ctl().refresh();draw();
}catch(e){el('gdSaveStatus').textContent='Save not verified: '+e.message}finally{el('gdSave').disabled=false}
}
function start(){
const view=el('view-growth-command');if(!view||el('gdPanel'))return;
const style=document.createElement('style');style.textContent='#gdPanel{margin-top:12px}#gdPanel section{background:white;border:1px solid #e3d9eb;padding:15px;border-radius:12px;margin:12px 0}#gdPanel h3{margin:0 0 6px;font-size:17px}#gdPanel p{font-size:12px;line-height:1.5}#gdPanel button{margin:3px;padding:8px 10px;border-radius:8px;background:#f2e9fa;color:#4b286d;border:1px solid #bfa9d7;cursor:pointer;font-family:inherit}#gdPanel table{width:100%;border-collapse:collapse;min-width:800px}#gdPanel td,#gdPanel th{font-size:12px;text-align:left;padding:9px;border-bottom:1px solid #e9e1ef}#gdPanel .scroll{overflow:auto}#gdDialog{position:fixed;inset:0;z-index:99999;background:#261633b8;align-items:center;justify-content:center;padding:15px}#gdDialog:not([hidden]){display:flex}#gdDialog[hidden]{display:none}#gdDialog article{background:white;width:min(570px,100%);max-height:90vh;overflow:auto;padding:20px;border-radius:13px}#gdDialog label{display:block;margin:10px 0 4px;font-size:12px}#gdDialog input[type=text],#gdDialog input[type=date]{display:block;width:100%;padding:9px;border:1px solid #c7b4d4;border-radius:7px}';document.head.append(style);
const panel=document.createElement('div');panel.id='gdPanel';panel.innerHTML='<section><h3>Loan Partner Conversion Check</h3><p>Uses distinct Velocify lead keys and their recorded statuses. Started = applied; Contacted = appointment. Funding status is NOT automatically a verified closing. Duplicate lead keys are held out of totals to protect LP ownership and prevent double counting.</p><button id="gdRefresh">Refresh Velocify</button><button id="gdDuplicates">Review duplicate exceptions</button><p id="gdStatus" role="status">Loading current records…</p><div class="scroll"><table><thead><tr><th>Agent</th><th>Tier</th><th>Distinct leads</th><th>Applied</th><th>Contacted</th><th>Processing</th><th>Funding status</th><th>Excluded</th><th>Action</th></tr></thead><tbody id="gdRows"></tbody></table></div><p>Lead status counts and annual Power BI closings are different sources and time windows. A verified lead-to-close conversion percentage is not yet available.</p></section><section><h3>Referral Commitments &amp; Recovery Plans</h3><p>Save a measurable next opportunity, deadline, referral-loss reason, and recovery action to the shared agent profile. Results must be confirmed through actual LP production.</p><button id="gdTop">Edit top-priority relationship</button><div id="gdCommitments"></div></section><section><h3>Historical Tier Movement</h3><p>B = 2 annual closes; A = 4; Channel = 10. Review historical movements against the latest active tier before reporting promotions.</p><div id="gdMigrations"></div></section><div id="gdDialog" hidden><article role="dialog" aria-modal="true"><h3 id="gdTitle"></h3><div id="gdFields"></div><button id="gdSave">Save &amp; verify</button><button id="gdClose">Close</button><p id="gdSaveStatus" role="status"></p></article></div>';
view.append(panel);
const fields=[['next_growth_opportunity','Next specific referral / buyer commitment','text'],['growth_opportunity_deadline','Due date','date'],['partner_pain_points','Business / conversion blocker','text'],['referral_leakage_notes','Why referrals are going elsewhere','text'],['recovery_plan','How we will protect or recover the relationship','text'],['high_potential_flag','High-growth potential','checkbox'],['competitor_risk_flag','Competitor / retention risk','checkbox']];
for(const [id,label,type] of fields){const node=document.createElement('label');node.textContent=label;const input=document.createElement('input');input.id='gd_'+id;input.type=type;node.append(input);el('gdFields').append(node)}
el('gdRefresh').onclick=()=>reload();el('gdDuplicates').onclick=()=>{el('gdStatus').textContent=duplicateKeys.map(d=>d.key+' ('+d.arr.length+' records; LPs '+[...new Set(d.arr.map(r=>r.lp_user||'unknown'))].join('/')+')').join(' | ')||'No duplicate lead keys';};
el('gdTop').onclick=()=>{const x=ctl()?.state?.rows.filter(x=>x.rm==='Amanda').sort((a,b)=>b.score-a.score)[0];if(x)edit(x.sourceName)};
el('gdClose').onclick=()=>{el('gdDialog').hidden=true};el('gdSave').onclick=save;
let attempts=0;function wait(){if(ctl()?.state?.loaded)reload();else if(attempts++<18)setTimeout(wait,700);else el('gdStatus').textContent='Open the Grow + Protect work order and refresh shared profiles first.'}wait();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();