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
'#view-week #rm350Workboard.rmExecReady>.rm350-hero,#view-week #rm350Workboard.rmExecReady>.rm350-shell{display:none!important}',
'body[data-rm-tab="week"] #view-week.rm350-board > #rmExecutionPlan{display:block!important}',
'#rmExecutionPlan h2{margin:0 0 5px;font-size:20px;color:#211b35}',
'#rmExecutionPlan h3{font-size:15px;margin:13px 0 8px;color:#302242}',
'#rmExecutionPlan p,#rmExecutionPlan small{font-size:12px;color:#685b78;line-height:1.5}',
'#rmExecutionPlan button{border:1px solid #ded4e8;border-radius:8px;background:white;color:#593b83;font-size:12px;font-weight:650;padding:8px 11px;cursor:pointer}',
'#rmExecutionPlan button:disabled{opacity:.5}',
'#rmExecutionPlan .execRow{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}',
'#rmExecutionPlan .execMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}',
'#rmExecutionPlan #execProspecting{background:#f5effb;border:1px solid #ddd0ed;padding:15px}',
'#rmExecutionPlan #execPriorities{background:#fff;border:1px solid #e7dff0;padding:14px}',
'#rmExecutionPlan #execPriorities .execTasks{display:block;margin-top:7px}',
'#rmExecutionPlan #execPriorities .execTasks section{border:0;padding:0}',
'#rmExecutionPlan #execPriorities .execTasks li{margin-bottom:4px}',
'#rmExecutionPlan .execMetric{min-width:0}',
'#rmExecutionPlan #execMoreMetrics{margin:10px 0;border-bottom:1px solid #eee7f4;padding-bottom:8px}',
'#rmExecutionPlan #execMoreMetrics>summary{font-size:12px}',
'#rmExecutionPlan #execWeeklyGoals{background:#faf8fd}',
'#rmExecutionPlan #execHomeWork{margin:10px 0 12px}',
'#rmExecutionPlan #execHomeWork h3{margin:0 0 8px}',
'#rmExecutionPlan #execPriorities{background:#faf9fc;padding:10px 12px}',
'#rmExecutionPlan #execPriorities .execRow{gap:8px}',
'#rmExecutionPlan #execPriorities button{white-space:normal}',
'#rmExecutionPlan #execCloseout,#rmExecutionPlan #execOOO,#rmExecutionPlan #execCoaching,#rmExecutionPlan #execBusinessDetails{border-top:1px solid #f0eaf5;padding-top:7px;margin-top:8px}',
'#rmExecutionPlan .execMetric strong{overflow-wrap:anywhere}',
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
 '#rmExecutionPlan .execQuickLog{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:15px 17px;margin:0 0 14px;border:1px solid #d9c9ec;border-radius:12px;background:#f5f0fa}',
 '#rmExecutionPlan .execQuickLog strong{display:block;font-size:17px;color:#311b50;margin-bottom:3px}',
 '#rmExecutionPlan .execQuickLog span{display:block;font-size:12px;line-height:1.4;color:#715e86}',
 '#rmExecutionPlan #execQuickLogBtn{background:#67419a;color:#fff;border-color:#67419a;font-size:14px;font-weight:750;padding:12px 20px;min-height:44px}',
 '#rmExecutionPlan .execTimeline{margin:9px 0;padding:10px 14px}',
 '#rmExecutionPlan .execTimelineItem{padding:7px 0;grid-template-columns:75px minmax(0,1fr)}',
 '@media(max-width:540px){#rmExecutionPlan #execQuickLogBtn{width:100%}}',
 '#rmExecutionPlan #execMoreMetrics{display:none!important}',
 '#rmExecutionPlan #execOutreach{background:#f6f2fb;border:1px solid #e1d7ee}',
 '#rmExecutionPlan .execTimeline{border:1px solid #e8dff0;border-radius:11px;padding:14px;margin:12px 0;background:#fff}',
 '#rmExecutionPlan .execTimelineItem{display:grid;grid-template-columns:85px minmax(0,1fr);gap:12px;border-top:1px solid #eee8f3;padding:10px 0;font-size:12px}',
 '#rmExecutionPlan .execTimelineItem time{color:#6e5b81;white-space:nowrap}',
 '#rmExecutionPlan .execTimelineItem strong{display:block;color:#2f2347;font-size:13px}',
 '#rmExecutionPlan .execTimelineItem span{display:block;color:#655573;line-height:1.45;overflow-wrap:anywhere}',
 '#rmExecutionPlan .execOutcomeMetric{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0;min-height:120px;white-space:normal}',
 '#rmExecutionPlan .execOutcomeMetric strong{display:block;margin:0;line-height:1.2}',
 '#rmExecutionPlan .execOutcomeMetric .execOutcomeLabel{display:block!important;position:static!important;line-height:1.35!important;margin:0!important;font-weight:650;overflow-wrap:anywhere}',
 '#rmExecutionPlan .execOutcomeMetric .execOutcomeCaption{display:block!important;position:static!important;line-height:1.45!important;margin:0!important;color:#675d75;overflow-wrap:anywhere}',
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
'@media(max-width:750px){#rmExecutionPlan .execMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}#rmExecutionPlan .execTasks{grid-template-columns:1fr}}',
'@media(max-width:420px){#rmExecutionPlan{padding:12px}#rmExecutionPlan .execMetrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}#rmExecutionPlan .execMetric{padding:9px}#rmExecutionPlan .execMetric strong{font-size:19px}}'
].join('\n');document.head.append(styles);
let blocks=[],activities=[],queue=[],completedQueue=[],fullWork=[],fullVerified=false,loaded=false,working=false,selected=iso();
let activeDetail=null,detailGroups=[];
let sourceWarnings=[];
let businessResults={loading:false,error:'Not loaded',data:null};
const off=b=>/^(out of office|pto|vacation|time off)$/i.test(String(b.block_type||'').trim());
const close=b=>String(b.block_type||'')==='Daily Closeout'&&String(b.title||'').startsWith('Execution closeout');
const outDates=()=>new Set(blocks.filter(off).map(b=>String(b.work_date).slice(0,10)));
const isOff=d=>outDates().has(d);
const workday=d=>{const n=new Date(d+'T12:00:00').getDay();return n!==0&&n!==6&&!isOff(d)};
const nextWorkday=d=>{for(let i=1;i<=45;i++){const s=addDays(d,i);if(workday(s))return s}return null};
const activeFor=d=>activities.filter(x=>String(x.act_date||'').slice(0,10)===d);
const coldFor=d=>activeFor(d).filter(x=>String(x.act_type||'').trim()==='Cold Calls').length;
const meetingFor=d=>activeFor(d).filter(x=>/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(x.act_type||'')).length;
// Only genuinely held meetings count; booked or cancelled items do not.
const heldMeeting=a=>/held|completed|positive/i.test(String(a.outcome||''))&&!/cancel|no.show|reschedul/i.test(String(a.outcome||''));
const newMeetingFor=d=>activeFor(d).filter(a=>/^New Realtor Meeting$/i.test(String(a.act_type||'').trim())&&heldMeeting(a)).length;
const breadFor=d=>activeFor(d).filter(a=>/^Break Breads?$/i.test(String(a.act_type||'').trim())&&heldMeeting(a)).length;
const weekStart=d=>{const x=new Date(d+'T12:00:00'),day=x.getDay();return addDays(d,-((day+6)%7))};
function weeklyGoals(d){
 const start=weekStart(d),days=Array.from({length:5},(_,i)=>addDays(start,i)).filter(x=>x>=COACHING_START&&workday(x));
 const target=days.length,through=days.filter(x=>x<=d),weekRows=days.flatMap(x=>activeFor(x));
 const unique=(rx)=>weekRows.filter(a=>rx.test(String(a.act_type||'').trim())&&heldMeeting(a)).length;
 const newHeld=unique(/^New Realtor Meeting$/i),breads=unique(/^Break Breads?$/i);
 const calls=days.reduce((n,x)=>n+coldFor(x),0);
 const minutes=days.reduce((acc,x)=>{const m=dataOf(closeRecord(x))?.prospecting_minutes;if(m!=null&&Number.isFinite(Number(m))){acc.total+=Number(m);acc.known++}return acc},{total:0,known:0});
 const goalCalls=target*25,goalMinutes=target*60;
 const scoreRows=[{name:'Cold calls',done:calls,goal:goalCalls},{name:'New Realtor meetings held',done:newHeld,goal:target},{name:'Break Breads held',done:breads,goal:target}];
 const measured=scoreRows.filter(x=>x.goal>0),pct=measured.length?Math.round(100*measured.reduce((n,x)=>n+Math.min(x.done/x.goal,1),0)/measured.length):null;
 return {start,days,target,through,newHeld,breads,calls,minutes,goalCalls,goalMinutes,pct,scoreRows};
}
const closeRecord=d=>blocks.filter(b=>close(b)&&b.work_date===d).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))[0];
function dataOf(b){if(!b)return null;try{return JSON.parse(b.notes||'{}')}catch(e){return null}}
function planned(d){return queue.filter(q=>String(q.status||'').toLowerCase()==='open'&&String(q.work_date||'').slice(0,10)===d&&d>=COACHING_START)}
function pastDue(d){return queue.filter(q=>String(q.status||'').toLowerCase()==='open'&&q.work_date&&String(q.work_date).slice(0,10)>=COACHING_START&&String(q.work_date).slice(0,10)<d)}
function mount(){
 const board=$('rm350Workboard')||$('view-week');if(!board)return;
 const existing=$('rmExecutionPlan');if(existing){if(existing.parentElement!==board)board.prepend(existing);if(loaded&&board.id==='rm350Workboard')board.classList.add('rmExecReady');return;}
 const div=document.createElement('section');div.id='rmExecutionPlan';
 div.innerHTML='<div id="execQuickLog" class="execQuickLog"><div><strong>Log Activity</strong><span>Calls, new Realtor outreach, messages and meetings</span></div><button type="button" id="execQuickLogBtn">+ Log Activity</button></div><div class="execRow"><div><h2>Today’s plan</h2><p>Your daily goals, open work, completed activity, and next steps.</p></div><button id="execReload" type="button">Refresh live activity</button></div>'+
 '<div id="execNotice" class="execNotice">Loading shared activity and schedule…</div>'+
 '<div id="execProspecting" class="execNotice" aria-live="polite"></div><div id="execOutreach" class="execNotice"></div><section id="execActivityTimeline" class="execTimeline"><div class="execRow"><h3>Today’s activity</h3><button type="button" id="execActivityAll">View all activity</button></div><div id="execTimelineRows">Loading activity…</div></section><div class="execHomeWork" id="execHomeWork"><h3>Open work</h3><div id="execCategoryGrid" class="execCategoryGrid"></div></div><div id="execPriorities" class="execNotice" aria-live="polite"></div><div id="execMetrics" class="execMetrics"></div><details id="execMoreMetrics" hidden><summary>More activity details</summary><div id="execSecondaryMetrics" class="execMetrics"></div></details><div id="execWeeklyGoals" class="execNotice" aria-live="polite"></div>'+ '<details id="execBusinessDetails"><summary>Business results · meetings, referrals & C-to-B growth</summary><div id="execBusinessResults" class="execNotice">Checking source records…</div></details>'+
 
 '<div class="execDetailArea" id="execDetailArea" hidden><button type="button" id="execBack" class="execBack">← Back to Today</button><div class="execRow"><h3 id="execDetailTitle"></h3><button type="button" id="execDetailRefresh">Refresh worklist</button></div><div id="execTaskSummary" class="execTasks"></div></div>'+
 '<details id="execCloseout"><summary>Daily results & closeout · what was missed</summary><div id="execMissedSummary" class="execNotice" aria-live="polite"></div>'+
 '<div class="execForm"><label>Review date<input type="date" id="execReviewDate"></label>'+
 '<label>Main reason<select id="execReason"><option value="">Select a reason</option><option value="meetings">Realtor or business meetings</option><option value="transactions">Urgent transactions or client needs</option><option value="relationships">Existing partner calls</option><option value="interruptions">Schedule changes or interruptions</option><option value="time">Other priorities / time management</option><option value="other">Other / coaching needed</option></select></label></div>'+
 '<div class="execForm"><label>Actual cold-call / prospecting minutes · required<input id="execMinutes" type="number" min="0" max="480" step="1" required placeholder="Enter actual minutes"></label></div><label style="font-size:12px;color:#56476b">Reason for gaps and next workday plan</label><textarea id="execNote" maxlength="2000" placeholder="Example: Two appointments ran long. Tomorrow I will block two 30-minute prospecting sessions."></textarea>'+
 '<div style="margin-top:9px"><button id="execSaveCloseout" type="button">Save coaching closeout</button> <span id="execSaveStatus" class="execStatus"></span></div>'+
 '<small>Report actual minutes every scheduled workday, including zero. Saving a closeout does not complete open tasks.</small></details>'+
 '<details id="execOOO"><summary>Out-of-office calendar & coverage plan</summary><p>Days off are excluded from prospecting-goal calculations, not treated as missed goals. Any due relationship work still requires coverage or rescheduling.</p>'+
 '<div id="execDates" class="execDates"></div><div class="execForm"><label>First day off<input id="execOOOStart" type="date"></label><label>Last day off<input id="execOOOEnd" type="date"></label><button id="execSaveOOO" type="button">Save days off</button></div>'+
 '<div id="execOOOCoverage" class="execNotice"></div><div id="execOOOStatus" class="execStatus"></div></details>'+
 '<details id="execCoaching"><summary>Director coaching</summary><div id="execTrends">Loading trend…</div></details>';
 // The RM workboard is the only visible direct child of Today: its siblings are intentionally hidden by the existing layout CSS.
 board.prepend(div);
 $('execQuickLogBtn').onclick=()=>{
  if(typeof window.switchTab==='function'){window.switchTab('log');return}
  const log=$('view-log');if(log){log.scrollIntoView({behavior:'smooth',block:'start'});log.querySelector('input:not([type="hidden"])')?.focus({preventScroll:true})}
 };
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
  sourceWarnings=[];
  const settled=await Promise.allSettled([
   sbFetch('rm_day_blocks?select=*&owner=eq.Amanda&work_date=gte.'+from+'&work_date=lte.'+to+'&limit=1200'),
   sbFetch('amanda_activities?select=*&act_date=gte.'+from+'&act_date=lte.'+to+'&limit=10000'),
   sbFetch('rm_work_queue?select=id,work_date,agent_name,activity_type,reason,status,owner&owner=eq.Amanda&status=eq.open&work_date=gte.'+COACHING_START+'&limit=2500'),
   sbFetch('rm_work_queue?select=id,work_date,agent_name,activity_type,reason,status,owner&owner=eq.Amanda&status=neq.open&work_date=gte.'+COACHING_START+'&limit=2500')
  ]);
  const names=['Schedule','Logged activities','Outstanding assignments','Completed assignments'];
  const previous=[blocks,activities,queue,completedQueue];
  const result=settled.map((entry,i)=>{
   if(entry.status==='fulfilled'&&Array.isArray(entry.value))return entry.value;
   sourceWarnings.push(names[i]);
   return loaded?previous[i]:[];
  });
  if(sourceWarnings.length===4&&!loaded)throw Error('All shared data sources are temporarily unavailable');
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
  const warning=$('execNotice');
  if(sourceWarnings.length&&warning){warning.className='execNotice execWarn';warning.textContent='Partial data: '+sourceWarnings.join(', ')+' could not be verified. Previously loaded records are retained where available; refresh to retry.';}
  const board=$('rm350Workboard');
  if(board)board.classList.toggle('rmExecReady',fullVerified||!sourceWarnings.includes('Outstanding assignments'));
  await refreshBusinessResults();
 }catch(e){
  $('rm350Workboard')?.classList.remove('rmExecReady');
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
function taskList(title,rows,empty,showHeading=true){
 const list=rows.map((q,i)=>{
  const agent=q.agent_name||q['Agent / Item']||'Assigned agent';
  const type=q.Category||q.activity_type||'Assigned work';
  const action=q['Next Action']||q.reason||'Open relationship to review and log the next step';
  const due=q.work_date||q['Due Date']||'';
  return '<li><button type="button" class="execTaskGo" data-index="'+i+'"><b>'+safe(agent)+'</b><span style="display:block;font-size:11px;color:#736482">'+safe(type)+(due?' · Due '+safe(due):'')+'</span><span style="display:block;font-size:12px;color:#453755;margin-top:4px">'+safe(action)+'</span><span style="display:block;font-size:11px;margin-top:4px">Open agent record ↗</span></button></li>';
 }).join('');
 return '<section>'+(showHeading?'<strong>'+safe(title)+' · '+rows.length+'</strong>':'')+(rows.length?'<ul>'+list+'</ul>':'<p>'+safe(empty)+'</p>')+'</section>';
}
function openActivityDetail(kind,scroll=true){
 const d=iso();
 const week=weeklyGoals(d);
 const base=kind==='weeknew'||kind==='weekbread'?week.days.flatMap(x=>activeFor(x)):activeFor(d);
 const rows=base.filter(a=>kind==='cold'?String(a.act_type||'').trim()==='Cold Calls':kind==='meetings'?/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(a.act_type||''):kind==='newmeet'||kind==='weeknew'?/^New Realtor Meeting$/i.test(String(a.act_type||''))&&heldMeeting(a):kind==='bread'||kind==='weekbread'?/^Break Breads?$/i.test(String(a.act_type||''))&&heldMeeting(a):true);
 activeDetail='activity:'+kind;
 const home=$('execHomeWork'),detail=$('execDetailArea'),list=$('execTaskSummary');
 if(!home||!detail||!list)return;
 home.hidden=true;detail.hidden=false;
 const title=kind==='cold'?'Cold calls logged today':kind==='meetings'?'Meetings logged today':kind==='newmeet'?'New Realtor meetings held today':kind==='bread'?'Break Breads held today':kind==='weeknew'?'New Realtor meetings held this week':kind==='weekbread'?'Break Breads held this week':'Activity logged today';
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
 list.innerHTML=taskList(group[0],group[1],group[2],false)+
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
 const allRaw=fullVerified?canonical.concat(queueOnly):queue;
 const identity=q=>[String(q.agent_name||'').trim().toLowerCase(),String(q.activity_type||q.Category||'').trim().toLowerCase(),String(q.work_date||'').slice(0,10)].join('|');
 const all=allRaw.filter((q,i,rows)=>rows.findIndex(x=>identity(x)===identity(q))===i);
 const late=all.filter(q=>q.work_date&&q.work_date>=COACHING_START&&q.work_date<d);
 const need=all.filter(q=>q.work_date===d);
 const priorities=[...late,...need].filter((q,i,arr)=>arr.findIndex(x=>String(x.agent_name||'').trim().toLowerCase()+'|'+String(x.activity_type||'').toLowerCase()+'|'+String(x.work_date||'')===String(q.agent_name||'').trim().toLowerCase()+'|'+String(q.activity_type||'').toLowerCase()+'|'+String(q.work_date||''))===i);
 const undated=all.filter(q=>!q.work_date);
 const tmrw=next?all.filter(q=>q.work_date===next):[];
 const weekEnd=addDays(d,7);
 const thisWeek=all.filter(q=>q.work_date&&q.work_date>d&&q.work_date<=weekEnd&&(!next||q.work_date!==next));
 const done=completedQueue.filter(q=>/^(worked|complete|completed|done|closed|resolved)$/i.test(String(q.status||''))).map(q=>({...q,Category:q.activity_type,work_date:String(q.work_date||'').slice(0,10)}));
 const nextOff=[...outDates()].filter(x=>x>=d).sort();
 const notice=$('execNotice');notice.className='execNotice'+(offNow?'':' execWarn');
 notice.textContent=offNow?'Out of office today — no cold-call target or missed-day flag. Outstanding agent commitments still require coverage.':cold<25?'Prospecting below minimum: '+cold+' of 25 logged. The full 60-minute block is also required; actual time is not verified by call count.':'25+ calls logged. Keep the protected 60-minute prospecting block; elapsed time is not inferred.';
 const sections=[
  ['Overdue before today',late,'No unfinished assignments dated before today'],
  ['Due today · campaigns and other work',need,'No dated tasks due today'],
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
  ['New Realtor outreach',/outreach|reconnect|cold call/i]
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
 const todayCampaigns=need.filter(q=>/4.week|campaign/i.test(q.Category||q.activity_type||''));
 const todayOther=need.filter(q=>!/4.week|campaign/i.test(q.Category||q.activity_type||''));
 $('execProspecting').innerHTML='<div class="execRow"><div><strong>Prospecting today</strong><p>Cold calls: <b>'+cold+' / 25 minimum</b> · Time: <b>'+(dataOf(closeRecord(d))?.prospecting_minutes==null?'Not reported':dataOf(closeRecord(d)).prospecting_minutes+' / 60 min')+'</b></p><small>Complete the full 60-minute block and report actual minutes, even if fewer than 25 calls were made.</small></div><div><button type="button" id="execProspectLog">Log cold call</button> <button type="button" id="execProspectTime">Report minutes</button></div></div>';
 $('execProspectLog').onclick=()=>{if(typeof window.switchTab==='function')window.switchTab('log');const agent=$('rmFastAgent')||$('agentInput');if(agent)agent.focus()};
 $('execProspectTime').onclick=()=>{$('execCloseout').open=true;$('execCloseout').scrollIntoView({behavior:'smooth',block:'center'});$('execMinutes').focus()};
 const outreach=$('execOutreach');if(outreach){outreach.innerHTML='<div class="execRow"><div><strong>New Realtor outreach</strong><p>'+cold+' cold calls logged today · Goal: at least 25 calls and 60 minutes</p></div><button type="button" id="execOutreachLog">Log outreach</button></div>';const b=$('execOutreachLog');if(b)b.onclick=()=>{if(typeof window.switchTab==='function')window.switchTab('log');($('rmFastAgent')||$('agentInput'))?.focus()}}
 const timeline=$('execTimelineRows');if(timeline){const todayRows=activeFor(d).slice().sort((a,b)=>String(b.created_at||b.act_date||'').localeCompare(String(a.created_at||a.act_date||'')));timeline.innerHTML=todayRows.length?todayRows.slice(0,3).map(a=>{const when=a.created_at?new Date(a.created_at):null;const time=when&&!Number.isNaN(when.valueOf())?when.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'Time unavailable';return '<div class="execTimelineItem"><time>'+safe(time)+'</time><div><strong>'+safe(a.agent_name||'Agent not specified')+'</strong><span>'+safe([a.act_type,a.outcome].filter(Boolean).join(' · ')||'Activity logged')+'</span></div></div>'}).join(''):'<p>No activity recorded today yet.</p>';const all=$('execActivityAll');if(all){all.textContent='View all activity ('+todayRows.length+')';all.onclick=()=>showDetail('activity:all')}}

 const priorityBox=$('execPriorities');
 priorityBox.innerHTML='<div class="execRow"><strong>Deadline check</strong><div><button type="button" id="execDueList">Due today · '+need.length+' ('+todayCampaigns.length+' campaigns, '+todayOther.length+' other)</button> <button type="button" id="execOverdueList">Overdue · '+late.length+'</button></div></div>';
 $('execDueList').onclick=()=>showDetail('section:1');
 $('execOverdueList').onclick=()=>showDetail('section:0');
 const wg=weeklyGoals(d),weekLabel=fmt(wg.start);
 $('execWeeklyGoals').innerHTML='<strong>This week · '+safe(weekLabel)+'</strong>'+
 '<p>New Realtor meetings <b>'+wg.newHeld+' / '+wg.target+'</b> held · Break Breads <b>'+wg.breads+' / '+wg.target+'</b> held · Calls <b>'+wg.calls+' / '+wg.goalCalls+'</b> logged · Prospecting <b>'+wg.minutes.total+' / '+wg.goalMinutes+'</b> minutes reported'+(wg.minutes.known<wg.days.length?' (incomplete reporting)':'')+'.</p>'+
 '<p><strong>Activity pace: '+(wg.pct==null?'—':wg.pct+'%')+'</strong> · 85% coaching benchmark · '+(wg.target?'Weekly meeting pace: '+Math.ceil(wg.target*.85)+' each for 85%.':'No scheduled workdays.')+'</p>';
 const metricRows=[
  ['Cold calls today',offNow?'PTO':cold+' / 25+','cold'],
  ['Prospecting minutes',dataOf(closeRecord(d))?.prospecting_minutes==null?'Not logged / 60':dataOf(closeRecord(d)).prospecting_minutes+' / 60','closeout'],
  ['Meetings logged',meetingFor(d),'meetings'],
  ['New meetings today',offNow?'PTO':newMeetingFor(d)+' / 1','newmeet'],
  ['Break Breads today',offNow?'PTO':breadFor(d)+' / 1','bread'],
  ['New meetings this week',wg.newHeld+' / '+wg.target,'weeknew'],
  ['Break Breads this week',wg.breads+' / '+wg.target,'weekbread'],
  ['Overdue (before today)'+noticeMissing,late.length,'section:0'],
  ['Due today · '+todayCampaigns.length+' campaigns + '+todayOther.length+' other'+noticeMissing,need.length,'section:1'],
  ['Weekly calls remaining'+noticeMissing,weekly.length,'category:2'],
  ['Open 4-week follow-ups'+noticeMissing,campaigns.length,'category:0'],
  ['Missing growth plans'+noticeMissing,missingPlans.length,'plans'],
  ['Activity logged today',activeFor(d).length,'feed']
 ];
 const mainMetricKeys=new Set(['weeknew','weekbread']);
 const metricMarkup=x=>'<div class="execMetric" role="button" tabindex="0" data-exec-target="'+safe(x[2])+'" aria-label="Open '+safe(x[0])+'"><strong>'+safe(x[1])+'</strong><span>'+safe(x[0])+' ↗</span></div>';
 $('execMetrics').innerHTML=metricRows.filter(x=>mainMetricKeys.has(x[2])).map(metricMarkup).join('');
 $('execSecondaryMetrics').innerHTML=metricRows.filter(x=>!mainMetricKeys.has(x[2])).map(metricMarkup).join('');
 detailGroups=sections.concat(categoryRows);
 detailGroups.push(exactPlans);
 const grid=$('execCategoryGrid');
 grid.innerHTML=categoryRows.map((group,i)=>'<button type="button" class="execCategoryBtn" data-category="'+i+'"><span>'+safe(group[0])+'</span><strong>'+group[1].length+' ↗</strong></button>').join('');
 grid.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>showDetail('category:'+b.dataset.category));
 $('rmExecutionPlan').querySelectorAll('[data-exec-target]').forEach(tile=>{
  const action=()=>{
   const kind=tile.dataset.execTarget;
   if(kind==='cold')return showDetail('activity:cold');
   if(kind==='meetings')return showDetail('activity:meetings');
   if(kind==='newmeet'||kind==='weeknew')return showDetail('activity:'+kind);
   if(kind==='bread'||kind==='weekbread')return showDetail('activity:'+kind);
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
 renderBusinessResults();
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

const nameKey=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const scheduledActivity=a=>/meeting scheduled|meeting booked|appointment scheduled/i.test(String(a.outcome||''))&&!!String(a.agent_name||'').trim();
function linkBookedToHeld(booked,held){
 const used=new Set(),matched=[];
 for(const b of booked){
  const target=String(b.follow_up_date||'').slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(target))continue;
  const h=held.find(x=>{
   if(used.has(x.id)||nameKey(x.agent_name)!==nameKey(b.agent_name))return false;
   const delta=(Date.parse(String(x.act_date).slice(0,10)+'T12:00:00')-Date.parse(target+'T12:00:00'))/86400000;
   return delta>=-7&&delta<=14&&String(x.act_date).slice(0,10)>=String(b.act_date).slice(0,10);
  });
  if(h){used.add(h.id);matched.push({booked:b,held:h})}
 }
 return matched;
}
async function refreshBusinessResults(){
 const host=$('execBusinessResults');if(!host||businessResults.loading)return;
 businessResults.loading=true;host.textContent='Reconciling activity, referrals and growth records…';
 try{
  if(typeof sbFetch!=='function')throw Error('Shared database unavailable');
  // Business outcomes are provisional; do not substitute this for the Director weighted scorecard.
  const [leadRows,migrations,profiles]=await Promise.allSettled([
   sbFetch('velocify_leads?select=lead_key,referral_partner_name,date_added&date_added=gte.'+COACHING_START+'&order=date_added.desc&limit=10000'),
   sbFetch('tier_migrations?select=agent_name,from_tier,to_tier,migration_date&migration_date=gte.'+COACHING_START+'&order=migration_date.desc&limit=1000'),
   typeof window.rm470LoadAllProfiles==='function'?window.rm470LoadAllProfiles():Promise.reject(Error('Power BI agent profiles not available'))
  ]);
  const ok=r=>r.status==='fulfilled'&&Array.isArray(r.value);
  const profileList=ok(profiles)?profiles.value:null;
  const latest=profileList?.map(p=>String(p.powerbi_last_seen_at||'').slice(0,10)).filter(Boolean).sort().at(-1);
  const cNames=new Set((profileList||[]).filter(p=>String(p.powerbi_last_seen_at||'').slice(0,10)===latest&&String(p.powerbi_level||p.tier||'').trim().toUpperCase()==='C'&&p.relationship_status!=='inactive'&&p.do_not_contact!==true&&p.display_name!=='__HIDDEN__'&&p.relationship_type!=='strategic_partner').map(p=>nameKey(p.agent_name)));
  const seenKeys=new Set(),referrals=[];
  if(ok(leadRows)&&latest){
   for(const row of leadRows.value){
    const k=nameKey(row.referral_partner_name),id=String(row.lead_key||'').trim();
    if(!k||!cNames.has(k)||!id||seenKeys.has(id))continue;
    seenKeys.add(id);referrals.push(row);
   }
  }
  const moved=ok(migrations)?[...new Map(migrations.value.filter(r=>String(r.from_tier||'').toUpperCase()==='C'&&String(r.to_tier||'').toUpperCase()==='B'&&r.agent_name).map(r=>[nameKey(r.agent_name),r])).values()]:null;
  businessResults={loading:false,error:null,data:{
   referrals:ok(leadRows)&&latest?referrals:null,migrations:moved,
   detailsMissing:[!ok(leadRows)?'Velocify leads':null,!latest?'Power BI profile dates':null,!ok(migrations)?'tier migrations':null].filter(Boolean),
   sourceDate:latest
  }};
 }catch(e){businessResults={loading:false,error:String(e.message||e),data:null}}
 renderBusinessResults();
}
function renderBusinessResults(){
 const host=$('execBusinessResults');if(!host)return;
 if(businessResults.loading){host.textContent='Loading business outcomes…';return}
 const data=businessResults.data;
 const now=iso(),start=weekStart(now),from=start>COACHING_START?start:COACHING_START;
 const week=activities.filter(a=>String(a.act_date||'').slice(0,10)>=from&&String(a.act_date||'').slice(0,10)<=now);
 const bookings=week.filter(scheduledActivity);
 const held=week.filter(a=>/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(a.act_type||'')&&heldMeeting(a));
 const linked=linkBookedToHeld(activities.filter(scheduledActivity),activities.filter(a=>/^(New Realtor Meeting|Business Planning|Break Breads?|Team Meeting|Strategic Partner Meeting|Partner Meeting|Retention Meeting)$/i.test(a.act_type||'')&&heldMeeting(a))).filter(pair=>String(pair.held.act_date||'').slice(0,10)>=from).length;
 const nextStepHeld=held.filter(a=>/^\d{4}-\d{2}-\d{2}$/.test(String(a.follow_up_date||'').slice(0,10)));
 const open=queue.filter(q=>String(q.status||'').toLowerCase()==='open'&&/follow.up|campaign|weekly.*call|growth/i.test(String(q.activity_type||'')));
 const completed=completedQueue.filter(q=>/^(worked|complete|completed|done|closed|resolved)$/i.test(String(q.status||''))&&/follow.up|campaign|weekly.*call|growth/i.test(String(q.activity_type||'')));
 const row=(label,value)=>'<div class="execMetric execOutcomeMetric" style="display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:12px!important"><strong style="display:block!important">'+safe(value)+'</strong><div style="display:block!important;line-height:1.5!important;font-size:13px!important;white-space:normal!important">'+safe(label)+'</div></div>';
 host.innerHTML='<div class="execMetrics">'+
  row('Meetings booked',bookings.length)+
  row('Meetings held',held.length)+
  row('Meetings matched to bookings',linked)+
  row('Held with a next step',nextStepHeld.length+' / '+held.length)+
  row('C-agent referrals',data?.referrals?data.referrals.length:'Unavailable')+
  row('C-to-B growth',data?.migrations?data.migrations.length:'Unavailable')+
  '</div>';

}

function renderMissedSummary(d){
 const el=$('execMissedSummary');if(!el)return;
 if(!loaded){el.textContent='Daily results are not yet verified. Refresh live activity before reviewing missed goals.';return}
 if(isOff(d)){el.innerHTML='<strong>Approved day off.</strong> No daily cold-call or prospecting-minute goal applies. Open relationship commitments still require coverage.';return}
 const calls=coldFor(d),shortfall=Math.max(0,25-calls),record=dataOf(closeRecord(d));
 const mins=record?.prospecting_minutes;
 const minsKnown=Number.isFinite(Number(mins))&&mins!==null&&mins!==undefined&&mins!=='';
 const minShort=minsKnown?Math.max(0,60-Number(mins)):null;
 // Match today's snapshot task sources, but only count items that remain open.
 const canonical=fullVerified?fullWork.filter(r=>{const date=String(r['Due Date']||'').slice(0,10);return date>=COACHING_START}).map(r=>({
  agent_name:r['Agent / Item'],activity_type:r.Category,work_date:String(r['Due Date']||'').slice(0,10)
 })):[];
 const unique=canonical.concat(queue.filter(q=>!canonical.some(r=>String(r.agent_name||'').trim().toLowerCase()===String(q.agent_name||'').trim().toLowerCase()&&String(r.activity_type||'').trim().toLowerCase()===String(q.activity_type||'').trim().toLowerCase()&&r.work_date===String(q.work_date||'').slice(0,10))));
 const due=unique.filter(q=>String(q.work_date||'').slice(0,10)===d);
 const past=unique.filter(q=>{const date=String(q.work_date||'').slice(0,10);return date>=COACHING_START&&date<d});
 const goals=[
  '<li><strong>Cold calls:</strong> '+calls+' of 25 minimum logged'+(shortfall?' — '+shortfall+' below minimum':' — minimum met')+'</li>',
  '<li><strong>Prospecting time:</strong> '+(minsKnown?Number(mins)+' of 60 minutes reported'+(minShort?' — '+minShort+' minutes short':' — minimum met'):'Not reported — cannot confirm whether the 60-minute goal was met')+'</li>',
  '<li><strong>New Realtor meetings held:</strong> '+newMeetingFor(d)+' / 1 daily pacing target</li>',
  '<li><strong>Break Breads held:</strong> '+breadFor(d)+' / 1 daily pacing target</li>',
  '<li><strong>Weekly meetings:</strong> '+weeklyGoals(d).newHeld+' / '+weeklyGoals(d).target+' new; '+weeklyGoals(d).breads+' / '+weeklyGoals(d).target+' Break Breads</li>'
 ];
 const taskLine=q=>safe(q.agent_name||q['Agent / Item']||'Unspecified agent')+' · '+safe(q.activity_type||q.Category||'Follow-up');
 el.innerHTML='<strong>Results for '+safe(fmt(d))+'</strong><ul>'+goals.join('')+'</ul>'+
  '<strong>Open work still needing attention</strong><p>'+due.length+' due on this date; '+past.length+' earlier open item(s) carried forward.</p>'+
  (due.length?'<ul>'+due.slice(0,15).map(q=>'<li>'+taskLine(q)+'</li>').join('')+(due.length>15?'<li>Plus '+(due.length-15)+' more — use the Due Today worklist.</li>':'')+'</ul>':'')+
  (!fullVerified?'<p><strong>Partial worklist:</strong> some relationship sources could not be verified. Do not interpret an empty list as no outstanding work.</p>':'')+
  '<small>Open tasks are current, not a historical record of missed work. Meeting goals are weekly; daily goals show pace.</small>';
}
function populateCloseout(){
 if(!$('execReviewDate'))return;const d=selected;const record=dataOf(closeRecord(d));
 renderMissedSummary(d);
 $('execSaveCloseout').disabled=isOff(d);
 $('execReason').value=record?.reason||'';
 $('execNote').value=record?.note||'';
 $('execMinutes').value=record?.prospecting_minutes??'';
 $('execSaveStatus').textContent=isOff(d)?'Approved day off: no closeout required.':record?'Previously saved; you can update this explanation.':'';
}
async function saveCloseout(){
 const d=$('execReviewDate').value,reason=$('execReason').value,note=$('execNote').value.trim(),status=$('execSaveStatus');
 if(isOff(d)){status.textContent='Days off do not require a missed-goal closeout.';return}
 const minutes=$('execMinutes').value.trim();if(minutes===''||!Number.isInteger(Number(minutes))||Number(minutes)<0||Number(minutes)>480){status.textContent='Enter actual cold-call/prospecting minutes (0–480). Required every scheduled workday.';$('execMinutes').focus();return}
 const shortDay=Number(minutes)<60||coldFor(d)<25||newMeetingFor(d)<1||breadFor(d)<1;
 if(shortDay&&(!reason||!note)){status.textContent='A daily pacing goal was missed. Select a reason and add a next-workday plan.';return}
 const obj={reason,note,prospecting_minutes:Number(minutes),logged_cold_calls:coldFor(d),target:25,logged_meetings:meetingFor(d),saved_at:new Date().toISOString()};
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