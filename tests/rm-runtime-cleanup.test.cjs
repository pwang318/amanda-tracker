'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const compact=fs.readFileSync('ui/compact-workspace.js','utf8');
const daily=fs.readFileSync('ui/daily-execution-coaching.js','utf8');
const fast=fs.readFileSync('ui/fast-activity-workflow.js','utf8');
for(const [name,code] of [['compact',compact],['daily',daily],['fast',fast]])new vm.Script(code,{filename:name});
for(const name of ['compact-workspace','daily-execution-coaching','fast-activity-workflow','relationship-funnel','scorecard-source-summary']){
 const count=html.split('./ui/'+name+'.js?v=').length-1;
 assert.equal(count,1,'Expected one script loader for '+name);
}
assert.equal(html.split('id="rm-uniform-prospecting-row"').length-1,1,'Old repeated style should exist once');
assert(!html.includes('outstanding-daily-checklist.js'),'Obsolete checklist must not load');
assert(!fs.existsSync('ui/outstanding-daily-checklist.js'),'Obsolete checklist source must be deleted');
assert(!compact.includes('MutationObserver'),'Compact style must not re-render on every DOM change');
assert(compact.includes('moveTodayAboveScorecard(today)'), 'Today section should precede Scorecard Progress on the RM home screen');
assert(compact.includes('score.before(todayCard)'), 'Place real #rm492Additional Today container before #rm490Score');
assert(compact.includes("document.getElementById('rm492Additional')") && compact.includes("document.getElementById('rm490Score')"),'Use concrete homepage DOM containers, not generic heading traversal');
assert(compact.includes('body:not([data-rm-tab="director"]) #rmSharedPowerBiWarning'), 'Floating Power BI warning is hidden for RM while retaining director diagnostics');
assert(daily.includes('id="execProspectShortcut"'), 'Prospect shortcut must appear in the growth section');
assert(daily.includes("$('execProspectShortcut').replaceChildren(shortcut)"), 'Prospect link must be physically moved from the other worklists');
assert(daily.includes("['Undated follow-ups',undated"), 'Undated items should not be misrepresented as meetings to schedule');
assert(!fast.includes("setInterval(()=>{if($('view-week')"),'Fast logger should not poll the Today view continuously');
assert(!html.includes('setInterval(function(){iconifyNav()'),'No 1.5-second whole-page restyling');
assert(!html.includes('setInterval(()=>refresh(false),30000)'),'No 30-second dashboard polling');
assert(!html.includes('setInterval(function(){if(document.visibilityState===\'visible\')refreshLeadCounter(false);},30000)'),'No 30-second lead polling');
for(const id of ['execHomeWork','execProspecting','execSaveCloseout'])assert(daily.includes('id="'+id+'"'),'Preserve live control '+id);
console.log('PASS RM cleanup: unique scripts and styles, retired checklist, removed high-frequency polling');

assert(compact.includes('rmExecReady'),'Legacy workboard must only be hidden once execution is ready');
assert(!compact.includes(':has(> #rmExecutionPlan)>:not(#rmExecutionPlan)'),'Never hide every legacy workboard child unconditionally');
assert(daily.includes('Promise.allSettled(['),'Independent database sources must permit partial recovery');
assert(daily.includes('sourceWarnings.join'),'Partial results must clearly warn rather than silently substitute zeros');
assert(daily.includes("classList.remove('rmExecReady')"),'Failed execution must restore legacy fallback');
assert(daily.includes("classList.add('rmExecReady')"),'Loaded execution can hide redundant legacy header');

assert(!html.includes("e.textContent='⚠ Shared Power BI cannot be verified:"),'No blocking Power BI warning banner in daily workspace');
assert(html.includes('unique_stamped_profiles:names.size'),'Power BI report and unique profile counts must remain separate');
assert(html.includes('raw:expected,total:receipt.total'),'Source receipt totals must not silently become stamped-profile counts');
assert(html.includes('reconciliation_gap:discrepancy'),'Agent-row reconciliation gap must remain auditable');

assert(daily.includes("const preview=list.cloneNode(true)"), 'Realtor call-list content must render inside Prospect & Grow, not just navigate away');
assert(daily.includes("id=\"execInlineProspects\""), 'Prospect & Grow includes its own expandable Realtor call list');
assert(daily.includes(String.raw`/^Shared data:\s*reconciliation required\b/i`), 'Floating warning matcher must match actual notice text');
assert(!daily.includes(String.raw`/^Shared data:\\s*reconciliation required\\b/i`), 'Do not double-escape the floating warning regex');
