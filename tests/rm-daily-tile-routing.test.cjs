'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('ui/daily-execution-coaching.js', 'utf8');
const html = fs.readFileSync('index.html','utf8');
new vm.Script(code,{filename:'daily-execution-coaching.js'});
const m = code.match(/function openTask\(q\)\{[\s\S]*?\n\}\nfunction taskList\(/);
assert(m, 'openTask handler is present');
const events = [];
const win = {
 openContactModal: name => events.push('agent:'+name),
 v350OpenLane: name => events.push('lane:' + name),
 switchTab: name => events.push('tab:' + name)
};
const ctx = { window: win, Promise, console };
vm.createContext(ctx);
vm.runInContext(m[0].replace(/\nfunction taskList\($/, '') + '\nthis.open = openTask;',ctx);
for(const type of [
 '4-Week Campaign','Tuesday Updates','Transaction Call','Weekly Realtor Call',
 'Cold Calls','Reconnect Outreach','C-agent growth','Portfolio · Meeting Due',
 'Missing Growth Plan','Portfolio · Growth Next Step','Portfolio · Partner Touch Due','Follow-up'
]){
 events.length = 0;
 ctx.open({Category:type,agent_name:'Sample Agent'});
 assert.equal(events[0],'agent:Sample Agent','Must open exact agent record for ' + type);
}
for(const label of [
 'Cold calls today','Prospecting minutes','Meetings logged','Overdue work',
 'Due today','Weekly calls remaining','4-week follow-ups',
 'Missing growth plans','Activity logged today'
]){
 assert(code.includes(label),'Missing daily tile '+label);
}
assert(!code.includes("['Needs a due date'"),'Weekly calls and growth plans are not missing deadlines');
assert(code.includes("const index=key==='plans'?detailGroups.length-1:match?(match[1]==='section'?Number(match[2]):5+Number(match[2]))"),'Category indexes match the section offset, with exact missing-plan destination');
assert(code.includes("if(kind==='plans')return showDetail('plans')"),'Missing growth plans tile opens only missing growth plans');
assert(code.includes("detailGroups.push(exactPlans)"),'Exact missing growth plans group is independently addressable');
assert(code.includes("const board=$('rm350Workboard')||$('view-week')"), 'Daily plan mounts inside the visible board');
assert(code.includes('window.rmV440GetPortfolioData'), 'Portfolio work must load into the daily task list');
assert(code.includes("rows.map((q,i)=>"), 'Every assigned item must be accessible');
assert(!/Fresh start · November 9 onward/i.test(code), 'Internal reset wording not user facing');
assert(html.includes('ui/daily-execution-coaching.js?v='), 'Daily script loaded');
for(const path of ['ui/daily-execution-coaching.js','ui/outstanding-daily-checklist.js','ui/fast-activity-workflow.js']){
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

assert(code.includes('id="execPriorities"'), 'Today priorities must be visible on the snapshot');
assert(code.includes("const priorities=[...late,...need]"), 'Today priorities must use the same overdue and due-today records as tiles');
assert(code.includes("data-priority="), 'Today priorities show clickable agent-specific items');
assert(code.includes("taskList(group[0],group[1],group[2],false)"), 'Drilldown must not repeat relationship heading');
assert(code.includes('Actual cold-call / prospecting minutes · required'), 'Actual prospecting minutes must be labeled as required');
assert(code.includes("if(minutes===''||!Number.isInteger(Number(minutes))"), 'Closeout refuses to save without actual minutes');
assert(code.includes('85% coaching benchmark'), 'Compact weekly benchmark remains visible');
