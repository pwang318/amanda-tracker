(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const style=document.createElement('style');style.textContent=[
'#rmDailyChecklist{background:#fff;border:1px solid #e6deed;border-radius:12px;padding:16px 19px;margin:12px 0 16px}',
'#rmDailyChecklist .rmCheckHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
'#rmDailyChecklist h2{font-size:18px;color:#231b3b;margin:0 0 3px}',
'#rmDailyChecklist p,#rmDailyChecklist small{font-size:11px;color:#685a76;line-height:1.5;margin:4px 0}',
'#rmDailyChecklist button{cursor:pointer;background:#fff;border:1px solid #ddd3e8;border-radius:7px;padding:7px 10px;color:#593a85;font-weight:650;font-size:11px}',
'#rmDailyChecklist .rmCheckStats{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}',
'#rmDailyChecklist .rmCheckStat{padding:5px 8px;border:1px solid #ebe5f1;border-radius:7px;font-size:11px;color:#533f6d}',
'#rmDailyChecklist .rmCheckGroups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}',
'#rmDailyChecklist .rmCheckGroup{border:1px solid #e9e3f0;border-radius:9px;padding:10px;background:#fff;min-width:0}',
'#rmDailyChecklist .rmCheckGroupHead{display:flex;justify-content:space-between;gap:9px;align-items:center}',
'#rmDailyChecklist .rmCheckGroupHead b{font-size:12px;color:#302047}',
'#rmDailyChecklist .rmCheckGroupHead strong{color:#64418d;font-size:16px}',
'#rmDailyChecklist .rmCheckItem{border-top:1px solid #f0eaf5;padding:8px 0;display:flex;justify-content:space-between;align-items:center;gap:9px}',
'#rmDailyChecklist .rmCheckItem span{min-width:0;font-size:11px;color:#3b3053;line-height:1.45}',
'#rmDailyChecklist .rmCheckItem em{font-style:normal;color:#9a4d38;font-size:10px;white-space:nowrap}',
'#rmDailyChecklist .rmCheckOverdue{font-size:11px;color:#9a4d38!important}',
'#rmDailyChecklist .rmCheckEmpty{padding:10px 0;color:#6a6174;font-size:12px}',
'@media(max-width:800px){#rmDailyChecklist .rmCheckGroups{grid-template-columns:1fr}}'
].join('\n');document.head.append(style);
const GROUPS=[
 {id:'campaign',label:'4-week campaigns',detail:'Due or missed follow-up',action:'campaign'},
 {id:'followup',label:'Relationship follow-ups',detail:'Promised touches due',action:'portfolio'},
 {id:'weekly',label:'Weekly C-agent calls',detail:'Still due this week',action:'weekly'},
 {id:'transaction',label:'Transaction calls',detail:'Contracts / CTCs needing a call',action:'transaction'},
 {id:'tuesday',label:'Tuesday updates',detail:'Listing-agent updates still outstanding',action:'tuesday'},
 {id:'meeting',label:'Meetings and growth plans',detail:'Scheduled commitments and missing plans',action:'portfolio'},
 {id:'outreach',label:'Open outreach queue',detail:'Outstanding assigned agent calls',action:'reconnect'}
];
let busy=false,lastLoaded=null,at=0;
function open(kind){
 try{
  if(kind==='campaign'&&typeof window.v350OpenLane==='function')return window.v350OpenLane('conversion');
  if(kind==='transaction'&&typeof window.v350OpenLane==='function')return window.v350OpenLane('calls');
  if(kind==='tuesday'&&typeof window.v350OpenLane==='function')return window.v350OpenLane('tuesday');
  if(kind==='reconnect'&&typeof switchTab==='function')return switchTab('reconnect');
  if(kind==='weekly'&&typeof window.rmV440OpenPortfolio==='function')return window.rmV440OpenPortfolio('work');
  if(typeof window.rmV440OpenPortfolio==='function')return window.rmV440OpenPortfolio('work');
  if(typeof switchTab==='function')return switchTab('portfolio');
 }catch(e){console.warn('Open outstanding work failed',e)}
}
const groupsFor=r=>{
 const type=String(r.Category||''),when=String(r.Status||'').toLowerCase(),due=String(r['Due Date']||'').slice(0,10);
 if(type==='4-Week Campaign')return 'campaign';
 if(type==='Follow-up')return 'followup';
 if(type==='Weekly Realtor Call')return 'weekly';
 if(type==='Transaction Call')return 'transaction';
 if(type==='Tuesday Updates')return 'tuesday';
 if(type==='Open Outreach')return 'outreach';
 if(/Portfolio · (Meeting Due|Growth Next Step|Needs Attention)/.test(type))return 'meeting';
 return null;
};
function decorate(r){
 const due=String(r['Due Date']||'').slice(0,10),late=due&&due<today();
 return {name:String(r['Agent / Item']||'Unknown agent'),due,late,context:String(r['Next Action']||''),type:String(r.Category||'')};
}
function mount(){
 const board=$('rm350Workboard');if(!board||$('rmDailyChecklist'))return;
 const e=document.createElement('section');e.id='rmDailyChecklist';e.setAttribute('aria-label','Outstanding Amanda daily checklist');
 e.innerHTML='<div class="rmCheckHeader"><div><h2>Outstanding work · daily checklist</h2><p>Overdue work carries forward until the required activity is saved. Work through these before new nonurgent tasks.</p></div><button type="button" id="rmCheckRefresh">Refresh checklist</button></div><div id="rmCheckCounts" class="rmCheckStats"></div><div id="rmCheckContent" class="rmCheckEmpty">Reading open work…</div><small>Counts are tied to existing RM workflows. Opening an item takes you to its actual record. The checklist does not silently mark tasks complete.</small>';
 const steps=board.querySelector('.rm-daily-path');if(steps)steps.before(e);else board.prepend(e);
 $('rmCheckRefresh').onclick=()=>refresh(true);
}
function classify(rows){
 const buckets=Object.fromEntries(GROUPS.map(g=>[g.id,[]]));
 for(const row of rows||[]){
  const id=groupsFor(row);if(!id)continue;
  buckets[id].push(decorate(row));
 }
 for(const val of Object.values(buckets)){
  const seen=new Set();
  const unique=val.filter(v=>{const key=v.name.toLowerCase()+'|'+v.type+'|'+v.due;if(seen.has(key))return false;seen.add(key);return true});
  val.splice(0,val.length,...unique.sort((a,b)=>Number(b.late)-Number(a.late)||String(a.due||'9999').localeCompare(String(b.due||'9999'))||a.name.localeCompare(b.name)));
 }
 return buckets;
}
function output(rows){
 const box=$('rmCheckContent'),counts=$('rmCheckCounts');if(!box||!counts)return;
 const buckets=classify(rows);const total=Object.values(buckets).reduce((n,rs)=>n+rs.length,0);
 const overdue=Object.values(buckets).flat().filter(x=>x.late).length;
 counts.innerHTML='<span class="rmCheckStat">'+total+' outstanding items</span><span class="rmCheckStat">'+overdue+' overdue · carry forward</span><span class="rmCheckStat">Review again tomorrow if unfinished</span>';
 box.className='rmCheckGroups';
 box.replaceChildren();
 for(const group of GROUPS){
  const list=buckets[group.id];
  const section=document.createElement('section');section.className='rmCheckGroup';
  const head=document.createElement('div');head.className='rmCheckGroupHead';
  head.innerHTML='<div><b>'+esc(group.label)+'</b><small>'+esc(group.detail)+'</small></div><strong>'+list.length+'</strong>';
  const button=document.createElement('button');button.type='button';button.textContent='Open list';button.onclick=()=>open(group.action);
  head.append(button);section.append(head);
  if(!list.length){const empty=document.createElement('div');empty.className='rmCheckEmpty';empty.textContent='Nothing outstanding';section.append(empty)}
  for(const item of list.slice(0,3)){
   const row=document.createElement('div');row.className='rmCheckItem';
   const label=document.createElement('span');label.textContent=item.name+(item.context?' · '+item.context:'');
   const detail=document.createElement('em');detail.textContent=item.late?'OVERDUE'+(item.due?' · '+item.due:''):item.due?'Due '+item.due:'Due this week';
   row.append(label,detail);section.append(row);
  }
  if(list.length>3){const more=document.createElement('small');more.textContent='+'+(list.length-3)+' additional in the work list';section.append(more)}
  box.append(section);
 }
}
async function fallback(){
 // If the unified work-list builder is temporarily unavailable, do not invent "zero" counts.
 const [queue,activities]=await Promise.all([
  sbFetch('rm_work_queue?select=agent_name,activity_type,work_date,status,source,owner&status=eq.open&owner=eq.Amanda&limit=1500'),
  sbFetch('amanda_activities?select=agent_name,act_type,act_date,follow_up_date&follow_up_date=not.is.null&follow_up_date=lte.'+today()+'&limit=1500')
 ]);
 const rows=(queue||[]).map(t=>({
  Category:/reconnect|talk-to|follow-up/i.test(t.activity_type||'')?'Follow-up':'Weekly Realtor Call',
  'Agent / Item':t.agent_name,'Due Date':t.work_date||'',Status:'Open','Next Action':'Complete '+(t.activity_type||'required call')
 }));
 return rows;
}
async function refresh(force=false){
 mount();if(busy||!$('rmCheckContent'))return;
 if(!force&&at&&Date.now()-at<50000)return;
 busy=true;$('rmCheckContent').textContent='Checking overdue commitments and outstanding tasks…';
 try{
  let data;
  if(typeof window.rmV462LoadMorningRows==='function'){
   // First load live Portfolio data so the same missing-plan and meeting actions
   // used elsewhere are available to this checklist.
   if(typeof window.rmV440GetPortfolioData==='function'){
    try{window.rmV440RenderedPortfolioData=await window.rmV440GetPortfolioData()}catch(e){console.warn('Portfolio work not yet available',e)}
   }
   data=await window.rmV462LoadMorningRows(today());
   try{
    const open=await sbFetch('rm_work_queue?select=id,agent_name,activity_type,source,work_date,status,owner&status=eq.open&owner=eq.Amanda&limit=1000');
    const names=new Set((data.rows||[]).map(x=>String(x['Agent / Item']||'').trim().toLowerCase()+'|'+String(x.Category||'').toLowerCase()));
    for(const q of (Array.isArray(open)?open:[])){
      const n=String(q.agent_name||'').trim();if(!n)continue;
      const k=n.toLowerCase()+'|open outreach';if(names.has(k))continue;
      names.add(k);
      data.rows.push({Category:'Open Outreach','Agent / Item':n,'Due Date':String(q.work_date||'').slice(0,10),Status:'Open','Next Action':String(q.activity_type||'Call assigned agent')});
    }
   }catch(e){console.warn('Open RM queue could not be read',e)}
   // Tuesday updates have their own completed/outstanding workflow.
   const badge=$('rmV1TuesdayBadge');
   const num=badge&&/^\\d+$/.test(String(badge.textContent||'').trim())?Number(badge.textContent.trim()):null;
   if(num!==null&&num>0)for(let k=0;k<num;k++)data.rows.push({Category:'Tuesday Updates','Agent / Item':'Outstanding listing update '+(k+1),'Due Date':today(),Status:'Open','Next Action':'Complete the Tuesday listing-agent update'});
   if(!data||!Array.isArray(data.rows))throw Error('Incomplete RM work-list results');
  }else{
   throw Error('RM unified work-list bridge is unavailable');
  }
  lastLoaded=data.rows;at=Date.now();output(data.rows);
 }catch(e){
  $('rmCheckContent').className='rmCheckEmpty';
  $('rmCheckContent').textContent='Checklist could not verify outstanding work: '+String(e.message||e)+'. Open the work lists and retry. No zero totals are substituted.';
  console.warn('RM daily checklist loading failed',e);
 }finally{busy=false}
}
window.rmRefreshOutstandingChecklist=()=>refresh(true);
function init(){
 mount();refresh(true);
 const board=$('rm350Workboard');
 if(board)new MutationObserver(()=>mount()).observe(board,{childList:true});
 window.addEventListener('focus',()=>refresh(false));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
 setInterval(()=>{if($('view-week')?.classList.contains('active'))refresh(true)},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();