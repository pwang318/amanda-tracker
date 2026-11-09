(function(){
'use strict';
const STYLE=[
'#rmOutcomeFunnel{background:#fff;border:1px solid #e6e0ed;border-radius:12px;padding:17px 19px;margin:14px 0;color:#302647;font:inherit}',
'#rmOutcomeFunnel h3{font-size:17px;margin:0 0 4px;color:#241d3d}',
'#rmOutcomeFunnel .rmFunnelIntro{font-size:12px;color:#695e79;margin:4px 0 12px;line-height:1.5}',
'#rmOutcomeFunnel .rmFunnelGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}',
'#rmOutcomeFunnel .rmMetric{border:1px solid #e9e4f0;border-radius:9px;padding:11px;background:#fff}',
'#rmOutcomeFunnel .rmMetric strong{display:block;font-size:23px;color:#50317f;font-weight:750}',
'#rmOutcomeFunnel .rmMetric span{display:block;font-size:11px;color:#695d77;margin-top:4px}',
'#rmOutcomeFunnel .rmFunnelRates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}',
'#rmOutcomeFunnel .rmRate{padding:10px;border-radius:8px;background:#f8f5fc;font-size:11px;line-height:1.5}',
'#rmOutcomeFunnel .rmRate b{display:block;font-size:17px;color:#50317f}',
'#rmOutcomeFunnel .rmFunnelActions{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px}',
'#rmOutcomeFunnel button{border:1px solid #d8cce8;background:#fff;color:#50317f;padding:7px 12px;border-radius:7px;font-size:12px;cursor:pointer}',
'#rmOutcomeFunnel .rmFunnelNotes{font-size:11px;color:#665c72;line-height:1.55;margin-top:11px}',
'#rmOutcomeFunnel .rmDataIssue{padding:8px 10px;border-radius:8px;background:#f7f4fb;color:#675273;font-size:11px;margin:10px 0}',
'@media(max-width:800px){#rmOutcomeFunnel .rmFunnelGrid{grid-template-columns:repeat(2,minmax(0,1fr))}#rmOutcomeFunnel .rmFunnelRates{grid-template-columns:1fr}}'
].join('\n');
const style=document.createElement('style');style.textContent=STYLE;document.head.append(style);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString();
const pct=(a,b)=>b>0?(100*a/b).toFixed(1)+'%':'—';
const dayStart=()=>{let d=new Date();d.setDate(1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01'};
function eligible(a){
 const type=String(a.act_type||'').toLowerCase();
 // Do not combine LP transaction updates, snapshots, and administrative records with agent-development prospecting.
 return /^(cold calls|agent talk-to|new agent follow-up|reconnect outreach|realtor buddy referral ask|listing agent call)$/.test(type);
}
function classify(rows){
 const s={attempts:0,voicemail:0,connected:0,scheduled:0,held:0,retained:null,other:0};
 for(const a of rows){
  const t=String(a.act_type||'').toLowerCase(),o=String(a.outcome||'').toLowerCase();
  if(eligible(a)){
   s.attempts++;
   if(/voicemail|left vm|no answer|not reached|no response/.test(o))s.voicemail++;
   else if(/connected|talked|meaningful conversation|positive|spoke|reached|meeting scheduled/.test(o))s.connected++;
   else s.other++;
   if(/meeting scheduled|appointment scheduled|meeting booked/.test(o))s.scheduled++;
  }else if(/^(new realtor meeting|business planning|break breads?|partner meeting|strategic partner meeting|team meeting)$/.test(t)&&/meeting held|held|positive|completed/.test(o)){
   s.held++;
  }
 }
 return s;
}
function card(label,value,caption){return '<div class="rmMetric"><strong>'+esc(value)+'</strong><span>'+esc(label)+'</span><span>'+esc(caption)+'</span></div>'}
function root(){
 const byId=document.getElementById('view-scorecard')||document.getElementById('view-score')||document.getElementById('view-my-scorecard');
 if(byId)return byId;
 const heads=[...document.querySelectorAll('h1,h2,h3')].filter(h=>/scorecard/i.test(h.textContent||''));
 const match=heads.find(h=>/my scorecard|scorecard progress|scorecard breakdown/i.test(h.textContent||'')&&!h.closest('#view-week'));
 return match?.closest('.view,section,main')||null;
}
function mount(){
 const host=root();if(!host||host.querySelector('#rmOutcomeFunnel'))return;
 const section=document.createElement('section');section.id='rmOutcomeFunnel';
 section.innerHTML='<h3>Relationship activity → business outcomes</h3><p class="rmFunnelIntro">This month: see whether outreach is producing live conversations and meetings—not just dial counts.</p><div id="rmFunnelBody" role="status">Checking shared activity records…</div><div class="rmFunnelActions"><small id="rmFunnelUpdated"></small><button type="button" id="rmFunnelRefresh">Refresh performance</button></div>';
 const heading=host.querySelector('h1,h2,h3');
 if(heading&&heading.parentElement&&heading.parentElement!==host){heading.parentElement.after(section)}
 else host.prepend(section);
 section.querySelector('#rmFunnelRefresh').addEventListener('click',refresh);
 refresh();
}
let loading=false;
async function refresh(){
 if(loading)return;const body=document.getElementById('rmFunnelBody');if(!body)return;
 loading=true;body.textContent='Updating from shared activity records…';
 try{
  if(typeof sbFetch!=='function')throw Error('Shared activity connection not available');
  const month=dayStart();
  const [rows,receipts]=await Promise.all([
   sbFetch('amanda_activities?select=id,agent_name,act_type,outcome,act_date&act_date=gte.'+month+'&order=act_date.desc&limit=10000'),
   sbFetch('powerbi_import_log?select=imported_at,source_app,rows_processed,errors&source_app=like.core-team-tracker%25&order=imported_at.desc&limit=1').catch(()=>[])
  ]);
  if(!Array.isArray(rows))throw Error('Activity feed did not return records');
  const unique=[...new Map(rows.filter(r=>r.id!=null).map(r=>[r.id,r])).values()];
  const s=classify(unique);
  const raw=Array.isArray(receipts)&&receipts.length?receipts[0]:null;
  let receipt='';
  if(raw){
   const tiers=Object.fromEntries([...String(raw.source_app||'').matchAll(/(?:^|;)(Channel|A|B|C)=(\d+)/g)].map(m=>[m[1],Number(m[2])]));
   receipt='<div class="rmDataIssue"><b>Latest reported Power BI source figures (not verified for compensation):</b> '+esc(raw.rows_processed)+' imported rows · '+['Channel','A','B','C'].filter(t=>tiers[t]!==undefined).map(t=>t+' '+tiers[t]).join(' · ')+'. The official weighted score remains withheld until agent-profile reconciliation succeeds.</div>';
  }
  body.innerHTML='<div class="rmFunnelGrid">'+
   card('Outreach attempts',fmt(s.attempts),'Prospecting + relationship development')+
   card('No answer / voicemail',fmt(s.voicemail),'Did not reach an agent')+
   card('Live conversations',fmt(s.connected),'Connected or positive outcome')+
   card('Meetings scheduled',fmt(s.scheduled),'Explicit booked outcome')+
   card('Meetings held',fmt(s.held),'Logged meeting event')+
   '</div><div class="rmFunnelRates">'+
   '<div class="rmRate"><b>'+pct(s.connected,s.attempts)+'</b>Live connection rate · connected ÷ outreach attempts</div>'+
   '<div class="rmRate"><b>'+pct(s.scheduled,s.connected)+'</b>Meetings scheduled ÷ live conversations (same-period activity ratio)</div>'+
   '<div class="rmRate"><b>'+pct(s.held,s.scheduled)+'</b>Meetings held ÷ meetings scheduled (same-period activity ratio)</div>'+
   '</div>'+receipt+
   '<div class="rmFunnelNotes">Retained relationship rate: <b>not reliably measurable yet</b>. A meeting or positive conversation does not prove the agent retained or sent business. This section excludes LP transaction updates and system snapshots. A scheduled meeting and held meeting may be recorded in different months, so the ratios are indicators, not cohort conversion. '+s.other+' outreach records have outcomes that cannot be classified as connected or missed. Check actual agent records before making coaching decisions.</div>';
  document.getElementById('rmFunnelUpdated').textContent='Activity period: '+month+' to today · '+unique.length+' records examined';
 }catch(e){body.innerHTML='<p class="rmDataIssue">Shared activity could not be verified. '+esc(e.message||e)+' Try Refresh performance. No zero values are substituted.</p>'}
 finally{loading=false}
}
function start(){mount();const observer=new MutationObserver(()=>{if(!document.getElementById('rmOutcomeFunnel'))mount()});observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();