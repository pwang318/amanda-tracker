'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('ui/daily-execution-coaching.js', 'utf8');
const html = fs.readFileSync('index.html','utf8');
new vm.Script(code,{filename:'daily-execution-coaching.js'});
// Assignment clicks must open an actionable log-and-complete panel, never just a Realtor profile.
assert(code.includes('function openTask(q){'), 'Assignment handler required');
assert(code.includes("panel.id='execAssignmentAction'"), 'Assignment detail must contain an inline completion form');
assert(code.includes("execAssignmentProfile"), 'Realtor profile must remain an optional secondary action');
assert(code.includes("execAssignmentOutcome"), 'Amanda must select an actual contact outcome');
assert(code.includes("sbFetch('amanda_activities?select=id'"), 'Completion first persists actual activity');
assert(code.includes("completion_activity_id:id"), 'Only recorded activity may complete an exact queue assignment');
assert(code.includes("changed.some(row=>String(row.id)===String(q.id)"), 'Queue clearance must be confirmed from database result');
assert(code.includes('function rmSupplementKey(q){'),'Supplemental assignments need stable record identifiers');
assert(code.includes("'[RM_SUPPLEMENT_KEY:'+rmSupplementKey(q)+'] '"),'Saving supplemental activity must link it to the exact generated assignment');
assert(code.includes('!resolvedSupplementKeys.has(rmSupplementKey(r))'),'Completed supplemental work must disappear from open worklists');
assert(code.includes("if(!q.id){\n    status.textContent='Activity saved."),'Supplemental completion must be verified after saving');
assert(!code.includes('cannot be cleared automatically. Opening Activity Log'),'No supplemental assignment should dead-end in the log screen');
for(const label of [
 'Cold calls today','Prospecting minutes','Meetings logged','Overdue before today',
 'Due today','Weekly calls remaining','Open 4-week follow-ups',
 'Missing growth plans','Activity logged today'
]){
 assert(code.includes(label),'Missing daily tile '+label);
}
assert(!code.includes("['Needs a due date'"),'Weekly calls and growth plans are not missing deadlines');
assert(code.includes("const index=key==='plans'?detailGroups.length-1:match?(match[1]==='section'?Number(match[2]):categoryStart+Number(match[2]))"),'Category indexes derive from their actual section offset, with exact missing-plan destination');
assert(code.includes("if(kind==='plans')return showDetail('plans')"),'Missing growth plans tile opens only missing growth plans');
assert(code.includes("detailGroups.push(exactPlans)"),'Exact missing growth plans group is independently addressable');
assert(code.includes("const board=$('rm350Workboard')||$('view-week')"), 'Daily plan mounts inside the visible board');
assert(code.includes('window.rmV440GetPortfolioData'), 'Portfolio work must load into the daily task list');
assert(code.includes("rows.map((q,i)=>"), 'Every assigned item must be accessible');
assert(!/Fresh start · November 9 onward/i.test(code), 'Internal reset wording not user facing');
assert(html.includes('ui/daily-execution-coaching.js?v='), 'Daily script loaded');
for(const path of ['ui/daily-execution-coaching.js','ui/fast-activity-workflow.js']){
 const count=html.split('<script defer src="./'+path+'?v=').length-1;
 assert.equal(count,1,'Expected exactly one script load for '+path);
}
assert(!code.includes('Fresh start ·'), 'Private wording must not appear in Amanda daily plan');
console.log('PASS: mapped RM task destinations, visible workboard, portfolio source and daily metrics');

assert(code.includes('execCategoryGrid'), 'Compact Today must show category buttons');
assert(code.includes('showDetail(\'category:\''), 'Category buttons open focused drilldowns');
assert(code.includes('execBack'), 'Focused work list needs Back to Today');
assert(code.includes('execDetailArea') && code.includes('detail.hidden=true'), 'Detailed task list is hidden on home');

assert(code.includes("['Cold calls today',offNow?'PTO':cold+' / 25+','cold']"),'Cold-call tile must open logged cold-call records');
assert(code.includes("['Meetings logged',meetingFor(d),'meetings']"),'Meeting tile must open logged meeting records');
assert(code.includes("if(kind==='cold')return showDetail('activity:cold')"),'Cold-call detail click must be wired');
assert(code.includes("if(kind==='meetings')return showDetail('activity:meetings')"),'Meeting detail click must be wired');
assert(code.includes("const base=kind==='weeknew'||kind==='weekbread'?week.days.flatMap(x=>activeFor(x)):activeFor(d)"),'Daily and weekly drilldowns must match their relevant date ranges');
assert(code.includes("list.querySelectorAll('[data-activity-index]')"),'Specific logged activity rows must be actionable');
assert(code.includes("id=\"execLogRelated\""),'Activity drilldown must provide a new logging action');
assert(code.includes("activeDetail='activity:'+kind"),'Activity breakdown stays visible after refresh');
console.log('PASS exact cold-call and meeting record drilldowns with agent and logging controls');

assert(code.includes('function renderMissedSummary(d)'), 'Daily closeout must show concrete missed goals');
assert(code.includes('Cold calls:</strong>'), 'Daily closeout shows call target and gap');
assert(code.includes('Prospecting time:</strong>'), 'Daily closeout shows prospecting minutes and gap');
assert(code.includes('Open work still needing attention'), 'Closeout shows currently open assignments');
assert(code.includes('Partial worklist:'), 'Closeout warns when full relationship sources are unverified');
assert(code.includes('renderMissedSummary(d);'), 'Review date changes refresh missed-goal summary');

assert(code.includes('const newMeetingFor=d=>'),'New meetings must be counted separately');
assert(code.includes('const breadFor=d=>'),'Break Breads must be counted separately');
assert(code.includes('heldMeeting(a)'),'Only held meetings count toward new targets');
assert(code.includes('Math.ceil(wg.target*.85)'),'85% weekly benchmark must round to a whole held meeting');
assert(code.includes("['New meetings today'"),'Daily new meeting tile visible');
assert(code.includes("['Break Breads today'"),'Daily Break Bread tile visible');
assert(code.includes("['New meetings this week'"),'Weekly new meeting tile visible');
assert(code.includes("['Break Breads this week'"),'Weekly Break Bread tile visible');
assert(code.includes("if(kind==='newmeet'||kind==='weeknew')"),'New meeting tiles must open their matching records');
assert(code.includes("if(kind==='bread'||kind==='weekbread')"),'Break Bread tiles must open their matching records');
assert(code.includes('filter(x=>x>=COACHING_START&&workday(x))'),'PTO must reduce weekly expectations');

assert(code.includes('id="execBusinessDetails"'), 'Daily RM has an expandable outcomes view');
assert(code.includes('function linkBookedToHeld(booked,held)'), 'Booked meetings must match held meetings by agent and date');
assert(code.includes('function refreshBusinessResults()'), 'Outcome evidence must refresh from shared sources');
assert(code.includes("sbFetch('velocify_leads?select=lead_key,referral_partner_name,date_added"), 'Referral outcome uses Velocify unique leads');
assert(code.includes("sbFetch('tier_migrations?select=agent_name,from_tier,to_tier,migration_date"), 'C-to-B result uses tier transition records');
assert(code.includes('No zero substituted.'), 'Unknown outcomes must not be shown as zero');
assert(code.includes('Open relationship follow-ups'), 'Open follow-ups visible in results panel');
assert(code.includes('Follow-up completion rate cannot be confirmed'), 'Do not invent a due-date completion cohort');

assert(code.includes('id="execPriorities"'), 'Today deadline summary must be visible on the snapshot');
assert(code.indexOf('id="execPriorities"') < code.indexOf('id="execHomeWork"'),'Deadline summary precedes secondary work category shortcuts');
assert(code.includes("const priorities=[...late,...need]"), 'Today priorities must use the same overdue and due-today records as tiles');
assert(code.includes("id=\"execDueList\"") && code.includes("id=\"execOverdueList\""), 'Today deadlines have dedicated clickable worklist actions');
assert(code.includes("taskList(group[0],group[1],group[2],false)"), 'Drilldown must not repeat relationship heading');
assert(code.includes('Actual cold-call / prospecting minutes · required'), 'Actual prospecting minutes must be labeled as required');
assert(code.includes("if(minutes===''||!Number.isInteger(Number(minutes))"), 'Closeout refuses to save without actual minutes');
assert(code.includes('85% coaching benchmark'), 'Compact weekly benchmark remains visible');

const compact=fs.readFileSync('ui/compact-workspace.js','utf8');
new vm.Script(compact,{filename:'compact-workspace.js'});
assert(compact.includes('rmTodayCleanV5'),'Compact styling must be loaded once');
assert(!compact.includes('MutationObserver'),'Compact styling must not continuously re-render the entire Today page');
assert(compact.includes('rmExecReady'),'Legacy board is only hidden once the live plan succeeds');

assert.equal(html.split('<script defer src="./ui/compact-workspace.js?v=').length-1,1,'Compact workspace must be loaded exactly once');
assert(code.includes("id=\"execMoreMetrics\""),'Secondary statistics should be collapsed into details');
assert(code.includes("mainMetricKeys"),'Primary snapshot uses a focused metric subset');

assert(code.includes('id="execProspecting"'),'Prospecting must be prominent in Today view');
assert(code.includes('execProspectLog') && code.includes('execProspectTime'),'Prospecting needs logging and time entry actions');
assert(code.includes('todayCampaigns=need.filter'),'Due today must show the four-week campaign breakdown');
assert(code.includes('todayOther=need.filter'),'Due today must show non-campaign assigned work separately');
assert(code.includes('const all=allRaw.map'),'Snapshot normalizes assignment dates without merging distinct saved tasks');
assert(code.includes('Overdue (before today)'),'Overdue tile must have an unambiguous time window');

assert(!html.includes('outstanding-daily-checklist.js?v='),'Obsolete checklist must not load on the homepage');
const repeated=(html.match(/id="rm-uniform-prospecting-row"/g)||[]).length;
assert.equal(repeated,1,'Legacy duplicate inline style blocks must be consolidated');

// Manager accountability and outstanding-work regression safeguards.
assert(code.includes('completed_at,completion_activity_id'), 'Assignment feed must include verification timestamps and activity IDs');
assert(code.includes('q.completed_at&&'), 'Completed-today must not infer completion from original due dates');
assert(code.includes("'Undated follow-ups',undated"), 'Unscheduled work must have its own task drilldown');
assert(code.includes("showDetail('section:5')"), 'Needs-scheduling action must open the undated list');
assert(code.includes('historicalCatchupUnverified'), 'All historical catch-up records must be reconciled against the original cohort');
assert(code.includes('sourceWarnings.length===0&&fullVerified'), 'Last verified refresh requires every source to succeed');
assert(code.includes('observe(root,{childList:true,subtree:false})'), 'Daily dashboard must not observe all document subtree changes');

assert(code.includes('New Realtor prospecting · view call list'),'The single prospecting section clearly names the call list');
assert(code.includes('<summary>New Realtor prospecting · view call list</summary>'),'Single prospecting list provides clear expand-to-view action');
assert(!code.includes('New Realtor prospect list <small>Assigned outreach</small>'),'No misleading zero-review prospect tile');
assert(code.includes("addEventListener('toggle',()=>{if($('execInlineProspects').open)showInlineProspects()})"),'Single Realtor call-list section loads on expansion');

assert(code.includes("group('Overdue — explanation required',overdue,true,true)"),'Manager review lists every overdue assignment');
assert(code.includes("group('Due today — review or document a blocker',due,true,true)"),'Manager review lists every due-today assignment');
assert(code.includes("group('Upcoming assignments',upcoming,false,false)"),'Manager review keeps future work separate');
assert(code.includes("group('Undated follow-ups',unscheduled,false,false)"),'Manager review includes undated assignments');
assert(code.includes('data-carry-reason')&&code.includes('data-carry-next'),'Carry-forward requires both reason and next action');
assert(code.includes('carry_forward_logged_at:new Date().toISOString()'),'Saved carry-forward comments have timestamps');
assert(code.includes('Save could not be verified'),'Carry-forward writes require response verification');
assert(code.includes('Explanations never mark assignments completed'),'Carry-forward explanation does not close work');

assert(code.includes('Other open portfolio work — managed in worklists'), 'Manager review includes supplemental worklist assignments');
assert(code.includes('data-carry-open'), 'Manager review can open specific Realtor records');
assert(code.includes('managerTasks[Number(button.getAttribute'), 'Manager-review navigation maps each tile to its own assignment');

assert(!code.includes('id="execQuickGuide"'), 'RM Today must stay clear of the unwanted onboarding guide');
assert(code.includes('id="execRecentDisclosure"'), 'Recent activity should be collapsed until needed');
assert(code.includes("group[1].length>0||['New contract calls','CTC calls','Tuesday transaction updates'].includes(group[0])"), 'Transaction tiles remain visible when empty');
assert(code.includes("group[0]!=='Catch-up assignments'"), 'Catch-up remains a separate explicit list, not an extra tile');
assert(code.includes('catchupRows.push(q);\n  }\n  const type='), 'Catch-up CTC calls must also appear in CTC list, without duplicating the underlying queue');
assert(code.includes("group[0]!=='New Realtor outreach assignments'"), 'Do not duplicate prospecting in relationship tiles');
assert(code.includes("id=\"execCatchupList\""), 'Catch-up work remains available in primary work order');

assert(code.includes('id="execInlineProspects"'),'One Realtor call-list section stays in Prospect & Grow');
assert(code.includes('worklistExplanation(group[0],group[1])'),'Each category displays why its Realtors are listed and what to do');
assert(code.includes("const key=title.startsWith('Due today')"), 'Date-varying sections must still show their guidance');
assert(code.includes('const action=taskNextAction(q);'),'Every task must use its own type and saved next action');
assert(code.includes("reason:r.Notes||r.Status||''"),'Portfolio-specific notes are retained as the reason Realtor appears');
assert(code.includes("source:'Amanda-owned portfolio worklist'"),'Portfolio assignments identify their source');
assert(code.includes(".filter(r=>r.agent_name)"),'Unidentified people are not displayed as named Realtors');
assert(code.includes('Why here:')&&code.includes('Next action:'),'Individual Realtor rows distinguish reason from action');
assert(code.includes('aria-label="Open '), 'Each category names the actual assignment count');
assert(code.includes('tile.onclick=action;')&&code.includes('tile.onkeydown='),'Re-render must replace rather than duplicate tile handlers');
assert(code.includes("if(group[0]==='Completed queue work')"), 'Completed queue opens completed activity, not open Realtor work');

assert(code.includes('Why here:')&&code.includes('Next action:'),'Each assignment labels its reason and expected next action');
assert(code.includes("'4-week campaigns':")&&code.includes("'Weekly Realtor calls':")&&code.includes("'Portfolio attention reviews':"),'All key relationship categories have clear instructions');
assert(!code.includes('id="execProspectShortcut"'),'Redundant Realtor prospect shortcut must not render');
assert(code.includes("undated.length?'<div class="),'No empty Needs Scheduling tile on daily homepage');

// Checkpoint reminders and separate transaction queues must remain discoverable.
for(const label of ['New contract calls','CTC calls','Tuesday transaction updates','Other transaction calls']) assert(code.includes("['"+label+"',"),'Missing dedicated RM transaction worklist: '+label);
for(const time of ['9:30 AM','11:30 AM','2:00 PM','4:00 PM']) assert(code.includes(time),'Missing workday reminder: '+time);
assert(code.includes('execNudgeDismiss')&&code.includes('execNudgeOpen'),'Reminder must be actionable and dismissible');
assert(code.includes('!offNow&&loaded&&!sourceWarnings.length&&fullVerified'),'Reminders must be suppressed for PTO and incomplete data');

assert(code.includes("group[1].length>0||['New contract calls','CTC calls','Tuesday transaction updates'].includes(group[0])"),'Contract and CTC worklist tiles must remain visible even with no matches');

// WhatsApp templates must use the exact imported transaction, not an empty duplicate editor.
for(const marker of ['execWhatsAppCtc','execWhatsAppContract','execWaFiles','execWaFileList','TXN_ID','TXN_CLIENT','TXN_PROPERTY','TXN_BUYER_AGENT','TXN_LISTING_AGENT','TXN_CLOSE_DATE'])
 assert(code.includes(marker),'Missing imported WhatsApp transaction field: '+marker);
assert(code.includes("window.v176OpenTransaction(isCtc?'CTC Call':'Under Contract Call',agent,role,file.id)"),'Selected import must open established transaction workbench');
assert(code.includes("!allFiles.has(unique)"),'Imported files must be deduplicated per batch and transaction ID');
assert(code.includes("String(modal.dataset.txnId||'')!==file.id"),'Prefill must not attach details to the wrong file');
assert(code.includes('No client or Realtor information has been guessed.'),'Missing imports must never be silently invented');
assert(!code.includes('navigator.clipboard.writeText(value)'),'Retire competing empty management composer; existing imported workbench owns copy action');

 // Consistent Realtor task cards and completion behavior.
 for(const label of ['execWorkCardList','execWorkCardHeader','execWorkCardBody','execWorkCardFooter','Log CTC call','Log New Contract call','Log activity / Complete'])
  assert(code.includes(label),'Missing shared worklist card: '+label);
 assert(code.includes('holder.hidden=false;'),'Manager review clicks must reveal the task completion panel');
 assert(code.includes("if($('execHomeWork'))$('execHomeWork').hidden=true"),'Assignment action must be visible');
 assert(code.includes('data-carry-open')&&code.includes('Log activity / Complete ↗'),'Manager review must use same completion workflow');

assert(code.includes("if(category==='CTC calls')return openManagementTemplate('ctc')"),'CTC tile must use original imported file workbench');
assert(code.includes("if(category==='New contract calls')return openManagementTemplate('contract')"),'New Contract tile must use original imported file workbench');
assert(code.includes("return openManagementTemplate('ctc',q)"),'CTC assignment cannot show generic completion form');
assert(code.includes("return openManagementTemplate('contract',q)"),'New Contract assignment cannot show generic completion form');
assert(code.includes("String(modal.dataset.txnId||'')!==file.id"),'Original workbench must verify exact transaction ID');
assert(code.includes("Open imported files"),'CTC and Contract tiles must not report stale generic queue counts as active loans');

assert(code.includes("if(group[0]==='CTC calls'||group[0]==='New contract calls')"),'Old transaction detail views must route to original workbench');
assert(code.includes("if(index>=0&&!['CTC calls','New contract calls'].includes(categories[index][0]))"),'Historical August catch-ups must not be counted as current imported CTC calls');

assert(code.includes("const current=[...allFiles.values()].filter(x=>x.batch===newestBatch)"),'Current calls must use only most recent import batch');
assert(code.includes("file.closeDate?'Est. close '"),'File picker displays estimated closing dates rather than activity dates');
assert(code.includes("historical.length+' older imported record(s) hidden"),'Old files must be kept outside current transaction list');

assert(code.includes('function paintImportedCallCounters()'),'Transaction worklist tiles must use actual import counts');
assert(code.includes('refreshImportedCallCounters(true)'),'Transaction counters must refresh from shared imports');
assert(code.includes("new Set(selected.filter(x=>x.batch===latest)"),'Latest import count must deduplicate exact transaction IDs');
assert(code.includes("' imported file'"),'Imported count must be labeled as files, not completed calls');
