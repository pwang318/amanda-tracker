(function(){
'use strict';
const $=id=>document.getElementById(id);
const COACHING_START='2026-11-09';
const iso=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addDays=(s,n)=>{let d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const fmt=s=>new Date(s+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const reasons={'meetings':'Realtor or business meetings','transactions':'Urgent transactions or client needs','relationships':'Existing partner calls','interruptions':'Schedule changes or interruptions','time':'Other priorities / not enough time','other':'Other / coaching needed'};
const styles=document.createElement('style');styles.id='rmExecutionCoachingStyles';
styles.textContent=[
'#rmExecutionPlan{margin:12px 0;border:1px solid #e7deee;border-radius:12px;background:white;padding:17px 20px}',
'body[data-rm-tab="week"] #view-week.rm350-board > #rmExecutionPlan{display:block!important}',
'#rmExecutionPlan h2{margin:0 0 5px;font-size:20px;color:#211b35}',
'#rmExecutionPlan h3{font-size:15px;margin:13px 0 8px;color:#302242}',
'#rmExecutionPlan p,#rmExecutionPlan small{font-size:12px;color:#685b78;line-height:1.5}',
'#rmExecutionPlan button{border:1px solid #ded4e8;border-radius:8px;background:white;color:#593b83;font-size:12px;font-weight:650;padding:8px 11px;cursor:pointer}',
'#rmExecutionPlan button:disabled{opacity:.5}',
'#rmExecutionPlan .execRow{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}',
'#rmExecutionPlan .execMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}',
'#rmExecutionPlan .execMetric[role="button"]{cursor:pointer;transition:border-color .15s,background .15s}',
'#rmExecutionPlan .execMetric[role="button"]:hover,#rmExecutionPlan .execMetric[role="button"]:focus-visible{border-color:#9871c5;background:#f2eafa;outline:2px solid #7351a5;outline-offset:2px}',
'#rmExecutionPlan .execTaskDetails>summary{cursor:pointer;color:#593b83;font-size:12px;font-weight:700;padding:9px 0}',
'#rmExecutionPlan #execTaskSummary>h3{grid-column:1/-1;margin:16px 0 2px}',
'#rmExecutionPlan #execTaskSummary>p{grid-column:1/-1}',
'#rmExecutionPlan .execCategoryGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}',
'#rmExecutionPlan .execCategoryBtn{display:flex;align-items:center;justify-content:space-between;text-align:left;gap:8px;padding:14px!important;min-height:60px!important;font-size:13px!important}',
'#rmExecutionPlan .execCategoryBtn strong{font-size:19px;color:#523784}',
'#rmExecutionPlan .execDetailArea[hidden],#rmExecutionPlan .execHomeWork[hidden]{display:none!important}',
'#rmExecutionPlan .execDetailArea{border-top:1px solid #eee7f5;padding-top:14px}',
'#rmExecutionPlan .execDetailArea .execTasks{display:block}',
'#rmExecutionPlan .execDetailArea .execTasks section{border:0;padding:0}',
'#rmExecutionPlan .execDetailArea .execTasks ul{max-height:none;overflow:visible}',
'#rmExecutionPlan .execBack{margin-bottom:12px;background:#f6f1fb!important}',
'@media(max-width:750px){#rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
'@media(max-width:420px){#rmExecutionPlan .execCategoryGrid{grid-template-columns:1fr}}',
'#rmExecutionPlan .execTaskDetails{border-top:1px solid #eee7f5;margin:9px 0}',
'#rmExecutionPlan .execMetric{background:#faf8fc;border:1px solid #ede8f1;border-radius:9px;padding:11px}',
'#rmExecutionPlan .execMetric strong{display:block;font-size:23px;color:#523784}',
'#rmExecutionPlan .execMetric span{font-size:11px;color:#645674}',
'#rmExecutionPlan .execNotice{border-radius:9px;padding:10px 12px;background:#f8f4fb;color:#573877;font-size:12px;line-height:1.5;margin:10px 0}',
'#rmExecutionPlan .execWarn{background:#fff8ee;color:#795028}',
'#rmExecutionPlan .execTasks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
'#rmExecutionPlan .execTasks section{border:1px solid #ece5f1;border-radius:9px;padding:11px;min-width:0}',
'#rmExecutionPlan .execTasks ul{margin:7px 0;padding-left:19px;max-height:320px;overflow-y:auto;font-size:12px;color:#3d3151}',
'#rmExecutionPlan .execTasks li{margin-bottom:6px}',
'#rmExecutionPlan .execTaskGo{display:block;text-align:left;width:100%;padding:4px!important;border:0!important;background:transparent!important;color:#543781!important}',
'#rmExecutionPlan .execForm{display:flex;flex-wrap:wrap;align-items:end;gap:9px;margin:10px 0}',
'#rmExecutionPlan .execForm label{font-size:12px;display:flex;flex-direction:column;gap:3px;color:#56476b}',
'#rmExecutionPlan input,#rmExecutionPlan select,#rmExecutionPlan textarea{border:1px solid #ddd1e8;background:white;color:#302440;border-radius:7px;padding:8px;font:inherit;font-size:12px}',
'#rmExecutionPlan textarea{width:100%;box-sizing:border-box;min-height:65px}',
'#rmExecutionPlan .execStatus{font-size:12px;color:#664780;min-height:17px}',
'#rmExecutionPlan .execDates{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}',
'#rmExecutionPlan .execDate{background:#f1eaf8;border-radius:7px;padding:6px 8px;color:#583887;font-size:11px}',
'#rmExecutionPlan .execDate button{border:0;background:transparent;padding:0 3px 0 8px}',
'#rmExecutionPlan summary{cursor:pointer;color:#56387f;font-weight:750;font-size:13px;padding:8px 0}',
'@media(max-width:750px){#rmExecutionPlan .execMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}#rmExecutionPlan .execTasks{grid-template-columns:1fr}}'
].join('\n');document.head.append(styles);
let blocks=[],activities=[],queue=[],completedQueue=[],fullWork=[],fullVerified=false,loaded=false,working=false,selected=iso();
let activeDetail=null,detailGroups=[];
const off=b=>/^(out of office|pto|vacation|time off)$/i.test(String(b.block_type||'').trim());
const close=b=>String(b.block_type||'')==='Daily Closeout'&&String(b.title||'').startsWith('Execution closeout');
const outDates=()=>new Set(blocks.filter(off).map(b=>String(b.work_date).slice(0,10)));
const isOff=d=>outDates().has(d);
const workday=d=>{const n=new Date(d+'T12:00:00').getDay();return n!==0&&n!==6&&!isOff(d)};
const nextWorkday=d=>{for(let i=1;i<=45;i++){const s=addDays(d,i);if(workday(s))return s}return null};
const activeFor=d=>activities.filter(x=>String(x.act_date||'').slice(0,10)===d);
const coldFor=d=>activeFor(d).filter(x=>String(x.act_type||'').trim()==='Cold Calls').length;
const meetingFor=d=>activeFor(d).filter(x=>/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(x.act_type||'')).length;
const closeRecord=d=>blocks.filter(b=>close(b)&&b.work_date===d).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))[0];
function dataOf(b){if(!b)return null;try{return JSON.parse(b.notes||'{}')}catch(e){return null}}
function planned(d){return queue.filter(q=>String(q.status||'').toLowerCase()==='open'&&String(q.work_date||'').slice(0,10)===d&&d>=COACHING_START)}
function pastDue(d){return queue.filter(q=>String(q.status||'').toLowerCase()==='open'&&q.work_date&&String(q.work_date).slice(0,10)>=COACHING_START&&String(q.work_date).slice(0,10)<d)}
function mount(){
 const board=$('rm350Workboard')||$('view-week');if(!board)return;
 const existing=$('rmExecutionPlan');if(existing){if(existing.parentElement!==board)board.prepend(existing);return;}
 const div=document.createElement('section');div.id='rmExecutionPlan';
 div.innerHTML='<div class="execRow"><div><h2>Today’s plan</h2><p>Your daily goals, open work, completed activity, and next steps.</p></div><button id="execReload" type="button">Refresh live activity</button></div>'+
 '<div id="execNotice" class="execNotice">Loading shared activity and schedule…</div>'+
 '<div id="execMetrics" class="execMetrics"></div>'+
 '<div class="execHomeWork" id="execHomeWork"><h3>Open work by category</h3><p>Choose a worklist to see the assigned agents and next actions.</p><div id="execCategoryGrid" class="execCategoryGrid"></div></div>'+
 '<div class="execDetailArea" id="execDetailArea" hidden><button type="button" id="execBack" class="execBack">← Back to Today</button><div class="execRow"><h3 id="execDetailTitle"></h3><button type="button" id="execDetailRefresh">Refresh worklist</button></div><div id="execTaskSummary" class="execTasks"></div></div>'+
 '<details id="execCloseout"><summary>End-of-day closeout · why goals were missed</summary>'+
 '<div class="execForm"><label>Review date<input type="date" id="execReviewDate"></label>'+
 '<label>Main reason<select id="execReason"><option value="">Select a reason</option><option value="meetings">Realtor or business meetings</option><option value="transactions">Urgent transactions or client needs</option><option value="relationships">Existing partner calls</option><option value="interruptions">Schedule changes or interruptions</option><option value="time">Other priorities / time management</option><option value="other">Other / coaching needed</option></select></label></div>'+
 '<div class="execForm"><label>Prospecting minutes completed (self-reported)<input id="execMinutes" type="number" min="0" max="480" step="1" placeholder="0–480"></label></div><label style="font-size:12px;color:#56476b">What happened and what is the next workday plan?</label><textarea id="execNote" maxlength="2000" placeholder="Example: Two appointments ran long. Tomorrow I will block two 30-minute prospecting sessions."></textarea>'+
 '<div style="margin-top:9px"><button id="execSaveCloseout" type="button">Save coaching closeout</button> <span id="execSaveStatus" class="execStatus"></span></div>'+
 '<small>Reasons explain results; they do not mark outstanding follow-ups complete. No closeout needed on approved days off.</small></details>'+
 '<details id="execOOO"><summary>Out-of-office calendar & coverage plan</summary><p>Days off are excluded from prospecting-goal calculations, not treated as missed goals. Any due relationship work still requires coverage or rescheduling.</p>'+
 '<div id="execDates" class="execDates"></div><div class="execForm"><label>First day off<input id="execOOOStart" type="date"></label><label>Last day off<input id="execOOOEnd" type="date"></label><button id="execSaveOOO" type="button">Save days off</button></div>'+
 '<div id="execOOOCoverage" class="execNotice"></div><div id="execOOOStatus" class="execStatus"></div></details>'+
 '<details id="execCoaching"><summary>Director coaching</summary><div id="execTrends">Loading trend…</div></details>';
 // The RM workboard is the only visible direct child of Today: its siblings are intentionally hidden by the existing layout CSS.
 board.prepend(div);
 $('execReload').onclick=()=>refresh(true);
 $('execDetailRefresh').onclick=()=>refresh(true);
 $('execBack').onclick=()=>showDetail(null);
 $('execSaveCloseout').onclick=saveCloseout;
 $('execSaveOOO').onclick=saveOOO;
 $('execReviewDate').value=selected;
 $('execReviewDate').onchange=()=>{selected=$('execReviewDate').value;populateCloseout()};
 $('execOOOStart').value='2026-11-12';$('execOOOEnd').value='2026-11-13';
 // Phone and desktop use the same live plan; only the layout changes.
 div.dataset.sameDataOnMobile='true';
 if(loaded)render();
}
async function refresh(force=false){
 mount();if(working)return;working=true;
 try{
  if(typeof sbFetch!=='function')throw Error('Shared database connection unavailable');
  const from=COACHING_START,to=addDays(iso(),21);
  const result=await Promise.all([
   sbFetch('rm_day_blocks?select=*&owner=eq.Amanda&work_date=gte.'+from+'&work_date=lte.'+to+'&limit=1200'),
   sbFetch('amanda_activities?select=*&act_date=gte.'+from+'&act_date=lte.'+to+'&limit=10000'),
   sbFetch('rm_work_queue?select=id,work_date,agent_name,activity_type,reason,status,owner&owner=eq.Amanda&status=eq.open&work_date=gte.'+COACHING_START+'&limit=2500'),
   sbFetch('rm_work_queue?select=id,work_date,agent_name,activity_type,reason,status,owner&owner=eq.Amanda&status=neq.open&work_date=gte.'+COACHING_START+'&limit=2500')
  ]);
  if(result.some(r=>!Array.isArray(r)))throw Error('One of the live data lists is unavailable');
  [blocks,activities,queue,completedQueue]=result;
  activities=activities.filter(a=>{try{return typeof window.isAmandaDailyActivity==='function'?window.isAmandaDailyActivity(a):(typeof window.activityCreditsPerson==='function'?window.activityCreditsPerson(a,'Amanda'):true)}catch(e){return true}});
  fullVerified=false;fullWork=[];
  if(typeof window.rmV462LoadMorningRows==='function'){
   try{
    // Ensure portfolio relationship work is loaded before assembling the complete morning work list.
    if(typeof window.rmV440GetPortfolioData==='function')window.rmV440RenderedPortfolioData=await window.rmV440GetPortfolioData();
    const overview=await window.rmV462LoadMorningRows(iso());
    if(Array.isArray(overview?.rows)){
     const portfolio=window.rmV440RenderedPortfolioData;
     const missingPlans=(Array.isArray(portfolio?.rows)?portfolio.rows:[]).filter(r=>!String(r.next_growth_opportunity||'').trim()).map(r=>({
      'Agent / Item':r.name||r.agent_name||'',Category:'Missing Growth Plan','Due Date':'',
      'Next Action':'Document the next growth opportunity and a follow-up commitment.'
     })).filter(r=>r['Agent / Item']);
     fullWork=overview.rows.concat(missingPlans);fullVerified=true;
    }
   }catch(err){console.warn('Full RM work list not verified',err)}
  }
  loaded=true;render();
 }catch(e){
  const el=$('execNotice');if(el){el.textContent='Unable to verify live work and daily goals. '+String(e.message||e)+'. Please refresh; no zero counts substituted.';el.className='execNotice execWarn'}
 }finally{working=false}
}
function openTask(q){
 const name=String(q.agent_name||q['Agent / Item']||'').trim();
 const type=String(q.Category||q.activity_type||'').toLowerCase();
 // Take Amanda to the selected relationship rather than an unrelated workflow landing page.
 if(name&&typeof window.openContactModal==='function'){
  Promise.resolve(window.openContactModal(name)).catch(err=>{
   console.warn('Could not open agent profile',name,err);
   if(typeof window.switchTab==='function')window.switchTab('contacts');
  });
  return;
 }
 if(/tuesday/.test(type)&&typeof window.switchTab==='function')return window.switchTab('tuesday');
 if(/transaction/.test(type)&&typeof window.v350OpenLane==='function')return window.v350OpenLane('calls');
 if(typeof window.switchTab==='function')return window.switchTab('portfolio');
}
function taskList(title,rows,empty){
 const list=rows.map((q,i)=>{
  const agent=q.agent_name||q['Agent / Item']||'Assigned agent';
  const type=q.Category||q.activity_type||'Assigned work';
  const action=q['Next Action']||q.reason||'Open relationship to review and log the next step';
  const due=q.work_date||q['Due Date']||'';
  return '<li><button type="button" class="execTaskGo" data-index="'+i+'"><b>'+safe(agent)+'</b><span style="display:block;font-size:11px;color:#736482">'+safe(type)+(due?' · Due '+safe(due):'')+'</span><span style="display:block;font-size:12px;color:#453755;margin-top:4px">'+safe(action)+'</span><span style="display:block;font-size:11px;margin-top:4px">Open agent record ↗</span></button></li>';
 }).join('');
 return '<section><strong>'+safe(title)+' · '+rows.length+'</strong>'+(rows.length?'<ul>'+list+'</ul>':'<p>'+safe(empty)+'</p>')+'</section>';
}
function openActivityDetail(kind,scroll=true){
 const d=iso();
 const rows=activeFor(d).filter(a=>kind==='cold'?String(a.act_type||'').trim()==='Cold Calls':kind==='meetings'?/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(a.act_type||''):true);
 activeDetail='activity:'+kind;
 const home=$('execHomeWork'),detail=$('execDetailArea'),list=$('execTaskSummary');
 if(!home||!detail||!list)return;
 home.hidden=true;detail.hidden=false;
 const title=kind==='cold'?'Cold calls logged today':kind==='meetings'?'Meetings logged today':'Activity logged today';
 $('execDetailTitle').textContent=title+' · '+rows.length;
 const escapeDate=x=>String(x||'').slice(0,10);
 list.innerHTML='<section><p>These are the saved activity records counted in this tile. Select an agent to review their relationship, or log another activity below.</p>'+
 (rows.length?'<ul>'+rows.map((a,i)=>{
  const detailText=[a.act_type,a.outcome].filter(Boolean).join(' · ');
  const date=escapeDate(a.act_date);
  const timestamp=String(a.created_at||'').replace('T',' ').slice(0,19);
  return '<li><button type="button" class="execTaskGo" data-activity-index="'+i+'"><b>'+safe(a.agent_name||'Agent not recorded')+'</b><span style="display:block;font-size:12px;color:#625373">'+safe(detailText)+'</span><span style="display:block;font-size:11px;color:#756886">'+safe(date)+(timestamp?' · Logged '+safe(timestamp):'')+'</span><span style="display:block">Open agent record ↗</span></button></li>';
 }).join('')+'</ul>':'<p>No saved activity records match this tile.</p>')+
 '<button type="button" id="execLogRelated">'+(kind==='cold'?'Log next cold call':kind==='meetings'?'Log a meeting':'Log activity')+' ↗</button></section>';
 list.querySelectorAll('[data-activity-index]').forEach(button=>button.onclick=()=>{
  const a=rows[Number(button.dataset.activityIndex)];
  if(a)openTask({agent_name:a.agent_name,activity_type:a.act_type});
 });
 $('execLogRelated').onclick=()=>{
  if(typeof window.switchTab!=='function')return;
  window.switchTab('log');
  if(kind==='cold'){
   const input=$('rmFastAgent')||$('agentInput');input?.focus();
  }else $('agentInput')?.focus();
 };
 if(scroll)detail.scrollIntoView({behavior:'smooth',block:'start'});
}
function showDetail(key,scroll=true){
 if(typeof key==='string'&&key.startsWith('activity:'))return openActivityDetail(key.slice(9),scroll);
 activeDetail=key;
 const detail=$('execDetailArea'),home=$('execHomeWork'),list=$('execTaskSummary');
 if(!detail||!home||!list)return;
 if(key===null){
  detail.hidden=true;home.hidden=false;list.replaceChildren();
  if(scroll)$('rmExecutionPlan')?.scrollIntoView({behavior:'smooth',block:'start'});
  return;
 }
 const match=/^(section|category):(\d+)$/.exec(key);
 const index=key==='plans'?detailGroups.length-1:match?(match[1]==='section'?Number(match[2]):5+Number(match[2])):-1;
 const group=detailGroups[index];
 if(!group){activeDetail=null;detail.hidden=true;home.hidden=false;return}
 home.hidden=true;detail.hidden=false;
 $('execDetailTitle').textContent=group[0]+' · '+group[1].length;
 list.innerHTML=taskList(group[0],group[1],group[2])+
  (!fullVerified?'<p class="execNotice execWarn">Some sources are unavailable. Check the original worklists before treating this category as clear.</p>':'');
 list.querySelectorAll('.execTaskGo').forEach(button=>{
  button.onclick=()=>{
   if(group[0]==='Completed assigned tasks'){if(typeof window.switchTab==='function')window.switchTab('feed');return}
   const q=group[1][Number(button.dataset.index)];if(q)openTask(q);
  };
 });
 if(scroll)detail.scrollIntoView({behavior:'smooth',block:'start'});
}
function render(){
 if(!$('execNotice'))return;const d=iso(),offNow=isOff(d),cold=coldFor(d),next=nextWorkday(d);
 const cleanFull=fullWork.filter(r=>{const due=String(r['Due Date']||'').slice(0,10);return !due||due>=COACHING_START});
 const canonical=cleanFull.map(r=>({agent_name:r['Agent / Item'],activity_type:r.Category,work_date:String(r['Due Date']||'').slice(0,10),Category:r.Category,'Next Action':r['Next Action']}));
 const queueOnly=queue.filter(q=>!canonical.some(r=>String(r.agent_name||'').trim().toLowerCase()===String(q.agent_name||'').trim().toLowerCase()&&String(r.activity_type||'').toLowerCase()===String(q.activity_type||'').toLowerCase()));
 const all=fullVerified?canonical.concat(queueOnly):queue;
 const late=all.filter(q=>q.work_date&&q.work_date>=COACHING_START&&q.work_date<d);
 const need=all.filter(q=>q.work_date===d);
 const undated=all.filter(q=>!q.work_date);
 const tmrw=next?all.filter(q=>q.work_date===next):[];
 const weekEnd=addDays(d,7);
 const thisWeek=all.filter(q=>q.work_date&&q.work_date>d&&q.work_date<=weekEnd&&(!next||q.work_date!==next));
 const done=completedQueue.filter(q=>/^(worked|complete|completed|done|closed|resolved)$/i.test(String(q.status||''))).map(q=>({...q,Category:q.activity_type,work_date:String(q.work_date||'').slice(0,10)}));
 const nextOff=[...outDates()].filter(x=>x>=d).sort();
 const notice=$('execNotice');notice.className='execNotice'+(offNow?'':' execWarn');
 notice.textContent=offNow?'Out of office today — no cold-call target or missed-day flag. Outstanding agent commitments still require coverage.':cold<25?'Prospecting below minimum: '+cold+' of 25 logged. The full 60-minute block is also required; actual time is not verified by call count.':'25+ calls logged. Keep the protected 60-minute prospecting block; elapsed time is not inferred.';
 const sections=[
  ['Overdue work',late,'No overdue assigned work found in the available lists'],
  ['Due today',need,'No dated tasks due today'],
  ['Next workday · '+(next?fmt(next):'unknown'),tmrw,'No dated work scheduled for the next workday'],
  ['Upcoming dated work',thisWeek,'No other dated work scheduled in the next seven days'],
  ['Completed queue work',done,'No completed assigned queue entries verified']
 ];
 const categories=[
  ['4-week campaigns',/4.week|campaign|conversion/i],
  ['Relationship follow-ups',/follow.up|portfolio.*follow|partner touch|needs attention/i],
  ['Weekly Realtor calls',/weekly realtor|weekly.*call/i],
  ['Transaction and Tuesday updates',/transaction|contract|ctc|tuesday/i],
  ['Meetings and growth plans',/meeting|business plan|growth.*plan|growth next step/i],
  ['C-agent growth and protection',/c.agent|growth|retention|protect|promotion/i],
  ['Outreach and reconnect',/outreach|reconnect|cold call/i]
 ];
 const categoryRows=categories.map(([title])=>[title,[],'No currently open items found for this category']);
 const otherRows=[];
 for(const q of all){
  const type=String(q.Category||q.activity_type||q.reason||'');
  const index=categories.findIndex(([,rx])=>rx.test(type));
  if(index>=0)categoryRows[index][1].push(q);else otherRows.push(q);
 }
 if(otherRows.length)categoryRows.push(['Other assigned tasks',otherRows,'No other tasks verified']);
 const weekly=all.filter(q=>/weekly realtor|weekly.*call/i.test(q.Category||q.activity_type||''));
 const campaigns=all.filter(q=>/4.week|campaign/i.test(q.Category||q.activity_type||''));
 const missingPlans=all.filter(q=>/missing growth plan/i.test(q.Category||q.activity_type||''));
 const noticeMissing=!fullVerified?' (partial)':'';
 const exactPlans=['Missing growth plans',missingPlans,'No agents with missing growth plans found in available worklists'];
 $('execMetrics').innerHTML=[
  ['Cold calls today',offNow?'PTO':cold+' / 25+','cold'],
  ['Prospecting minutes',dataOf(closeRecord(d))?.prospecting_minutes==null?'Not logged / 60':dataOf(closeRecord(d)).prospecting_minutes+' / 60','closeout'],
  ['Meetings logged',meetingFor(d),'meetings'],
  ['Overdue work'+noticeMissing,late.length,'section:0'],
  ['Due today'+noticeMissing,need.length,'section:1'],
  ['Weekly calls remaining'+noticeMissing,weekly.length,'category:2'],
  ['4-week follow-ups'+noticeMissing,campaigns.length,'category:0'],
  ['Missing growth plans'+noticeMissing,missingPlans.length,'plans'],
  ['Activity logged today',activeFor(d).length,'feed']
 ].map(x=>'<div class="execMetric" role="button" tabindex="0" data-exec-target="'+safe(x[2])+'" aria-label="Open '+safe(x[0])+'"><strong>'+safe(x[1])+'</strong><span>'+safe(x[0])+' ↗</span></div>').join('');
 detailGroups=sections.concat(categoryRows);
 detailGroups.push(exactPlans);
 const grid=$('execCategoryGrid');
 grid.innerHTML=categoryRows.map((group,i)=>'<button type="button" class="execCategoryBtn" data-category="'+i+'"><span>'+safe(group[0])+'</span><strong>'+group[1].length+' ↗</strong></button>').join('');
 grid.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>showDetail('category:'+b.dataset.category));
 $('execMetrics').querySelectorAll('[data-exec-target]').forEach(tile=>{
  const action=()=>{
   const kind=tile.dataset.execTarget;
   if(kind==='cold')return showDetail('activity:cold');
   if(kind==='meetings')return showDetail('activity:meetings');
   if(kind==='feed')return showDetail('activity:all');
   if(kind==='log'){if(typeof window.switchTab==='function')window.switchTab('log');return}
   if(kind==='closeout'){$('execCloseout').open=true;$('execCloseout').scrollIntoView({behavior:'smooth',block:'center'});return}
   if(kind==='plans')return showDetail('plans');
   if(kind.startsWith('section:')||kind.startsWith('category:'))return showDetail(kind);
  };
  tile.addEventListener('click',action);
  tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}});
 });
 showDetail(activeDetail,false);
 const dayEls=$('execDates');dayEls.replaceChildren();
 for(const b of blocks.filter(off).sort((a,b)=>a.work_date.localeCompare(b.work_date))){
  const span=document.createElement('span');span.className='execDate';span.append(document.createTextNode(fmt(b.work_date)+' · off'));
  const button=document.createElement('button');button.type='button';button.textContent='×';button.title='Remove this day off';button.onclick=()=>removeOOO(b);span.append(button);dayEls.append(span)
 }
 if(!dayEls.childNodes.length)dayEls.textContent='No time off entered in this date range.';
 const cover=$('execOOOCoverage'),plannedOff=[...outDates()].filter(x=>x>=d).sort();
 if(plannedOff.length){
  const first=plannedOff[0],last=plannedOff[plannedOff.length-1],due=queue.filter(q=>q.work_date&&q.work_date>=first&&q.work_date<=last);
  cover.textContent='Before leave: review '+due.length+' dated assigned queue item(s) during planned time off, plus campaign/transaction commitments. Arrange coverage or reschedule. Return on '+(nextWorkday(last)?fmt(nextWorkday(last)):'the next scheduled workday')+'.';
 }else cover.textContent='Add time off so those days are excluded from daily prospecting coaching. Date-specific work must still be reviewed.';
 populateCloseout();renderTrends();
}
function populateCloseout(){
 if(!$('execReviewDate'))return;const d=selected;const record=dataOf(closeRecord(d));
 $('execSaveCloseout').disabled=isOff(d);
 $('execReason').value=record?.reason||'';
 $('execNote').value=record?.note||'';
 $('execMinutes').value=record?.prospecting_minutes??'';
 $('execSaveStatus').textContent=isOff(d)?'Approved day off: no closeout required.':record?'Previously saved; you can update this explanation.':'';
}
async function saveCloseout(){
 const d=$('execReviewDate').value,reason=$('execReason').value,note=$('execNote').value.trim(),status=$('execSaveStatus');
 if(isOff(d)){status.textContent='Days off do not require a missed-goal closeout.';return}
 if(!reason||!note){status.textContent='Choose a reason and enter a practical next-workday plan.';return}
 const minutes=$('execMinutes').value.trim();if(minutes!==''&&(!Number.isInteger(Number(minutes))||Number(minutes)<0||Number(minutes)>480)){status.textContent='Enter 0–480 prospecting minutes, or leave blank if unknown.';return}
 const obj={reason,note,prospecting_minutes:minutes===''?null:Number(minutes),logged_cold_calls:coldFor(d),target:25,logged_meetings:meetingFor(d),saved_at:new Date().toISOString()};
 const prev=closeRecord(d),record={work_date:d,owner:'Amanda',title:'Execution closeout · daily coaching',start_time:'17:58:00',end_time:'17:59:00',block_type:'Daily Closeout',notes:JSON.stringify(obj)};
 $('execSaveCloseout').disabled=true;status.textContent='Saving to shared tracker…';
 try{
  const out=await sbFetch(prev?'rm_day_blocks?id=eq.'+encodeURIComponent(prev.id):'rm_day_blocks',{method:prev?'PATCH':'POST',body:JSON.stringify(prev?{notes:record.notes}:record),prefer:'return=representation'});
  if(!Array.isArray(out)||!out.length)throw Error('Shared save was not confirmed');
  status.textContent='Closeout saved to shared RM schedule.';await refresh(true)
 }catch(e){status.textContent='Save not verified: '+String(e.message||e)}
 finally{$('execSaveCloseout').disabled=false}
}
async function saveOOO(){
 const a=$('execOOOStart').value,b=$('execOOOEnd').value,status=$('execOOOStatus');if(!a||!b||a>b){status.textContent='Select a valid start and end date.';return}
 const dates=[],known=outDates();for(let d=a;d<=b&&dates.length<=31;d=addDays(d,1)){if(!known.has(d))dates.push(d)}
 if(dates.length>31){status.textContent='Select 31 days or fewer at a time.';return}
 if(!dates.length){status.textContent='Those dates are already saved.';return}
 $('execSaveOOO').disabled=true;status.textContent='Saving time off…';
 try{
  const rows=dates.map(d=>({work_date:d,owner:'Amanda',title:'Out of office',start_time:'09:00:00',end_time:'17:00:00',block_type:'Out of office',notes:'Approved out of office. Exclude from prospecting goals; check coverage for due agent commitments.'}));
  const saved=await sbFetch('rm_day_blocks',{method:'POST',body:JSON.stringify(rows),prefer:'return=representation'});
  if(!Array.isArray(saved)||saved.length!==rows.length)throw Error('Saved dates not fully confirmed');
  status.textContent='Saved '+saved.length+' out-of-office date(s).';await refresh(true)
 }catch(e){status.textContent='Save not verified: '+String(e.message||e)}
 finally{$('execSaveOOO').disabled=false}
}
async function removeOOO(b){
 if(!confirm('Remove '+fmt(b.work_date)+' from Amanda’s planned time off?'))return;
 const status=$('execOOOStatus');status.textContent='Updating shared schedule…';
 try{
  await sbFetch('rm_day_blocks?id=eq.'+encodeURIComponent(b.id),{method:'DELETE',prefer:'return=minimal'});
  status.textContent='Removed day off; daily goals will apply if it is a workday.';await refresh(true)
 }catch(e){status.textContent='Could not verify the change: '+String(e.message||e)}
}
function renderTrends(){
 const host=$('execTrends');if(!host)return;
 const dates=[];for(let d=iso(),n=0;n<10&&d>=COACHING_START;d=addDays(d,-1)){if(workday(d)){dates.push(d);n++}}
 const rows=dates.map(d=>({date:d,cold:coldFor(d),meet:meetingFor(d),reason:dataOf(closeRecord(d))?.reason||'',note:dataOf(closeRecord(d))?.note||'',minutes:dataOf(closeRecord(d))?.prospecting_minutes??null}));
 const met=rows.filter(x=>x.cold>=25).length,short=rows.filter(x=>x.cold<25),withExplanation=short.filter(x=>x.reason).length;
 const counts={};for(const r of rows)if(r.reason)counts[r.reason]=(counts[r.reason]||0)+1;
 host.innerHTML='<p>Prospecting minimum met '+met+' of '+rows.length+' scheduled workdays. '+short.length+' below minimum; '+withExplanation+' of those have a saved explanation. This view uses logged cold-call entries only, not assumed time worked.</p>'+
 '<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th align="left">Day</th><th align="left">Cold calls</th><th align="left">Meetings</th><th align="left">Prospecting minutes</th><th align="left">Closeout reason</th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td style="padding:6px;border-bottom:1px solid #eee">'+safe(fmt(r.date))+'</td><td>'+r.cold+' / 25</td><td>'+r.meet+'</td><td>'+(r.minutes==null?'Not logged':r.minutes+' / 60')+'</td><td>'+safe(reasons[r.reason]||(r.cold>=25?'Goal met':'Not documented'))+'</td></tr>').join('')+'</tbody></table></div>'+
 '<p><strong>Frequent explanations:</strong> '+(Object.keys(counts).length?Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(x=>safe(reasons[x[0]]||x[0])+' ('+x[1]+')').join(' · '):'None saved yet')+'.</p><small>Interpret low-call days alongside partner service, calendar commitments, and lead results. A missed goal is a coaching prompt, not proof of inactivity.</small>';
}
window.rmRefreshExecutionCoaching=()=>refresh(true);
window.rmAmandaIsOOO=d=>loaded?isOff(String(d||iso()).slice(0,10)):null;
window.rmAmandaNextWorkday=d=>loaded?nextWorkday(String(d||iso()).slice(0,10)):null;
function init(){
 mount();refresh(true);
 // The app may replace the Today view after page initialization. Observe the document rather than a stale board node.
 let scheduled=false;
 new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{mount()}catch(e){console.error('RM daily plan mount failed',e)}})}).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('focus',()=>refresh(false));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();