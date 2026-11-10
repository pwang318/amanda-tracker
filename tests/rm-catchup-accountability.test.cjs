'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const daily=fs.readFileSync('ui/daily-execution-coaching.js','utf8');
const fast=fs.readFileSync('ui/fast-activity-workflow.js','utf8');
new vm.Script(daily,{filename:'daily-execution-coaching.js'});
new vm.Script(fast,{filename:'fast-activity-workflow.js'});
assert(daily.includes("categoryRows.push(['Catch-up assignments'"),'Catch-up tasks need their own worklist');
assert(daily.includes('execCatchupStatus'),'Catch-up progress must appear in daily priorities');
assert(daily.includes("showDetail('category:'+(categoryRows.length-1))"),'Catch-up tile must open its list');
assert(daily.includes("window.addEventListener('rm-work-queue-changed'"),'Completing work must refresh the dashboard');
assert(fast.includes("window.isAmandaDailyActivity(a)"),'Only Amanda activity may satisfy her assignments');
assert(fast.includes("if(/talk-to/.test(taskType)&&/voicemail"),'Voicemails must not complete talk-to conversations');
assert(fast.includes("const used=new Set()"),'One saved outcome cannot complete multiple assignments');
assert(fast.includes("await reconcile()"),'Normal saved activity must also be reconciled');
const a=fast.indexOf('async function reconcile(){'),b=fast.indexOf('\nasync function refresh(',a);
assert(a>=0&&b>a,'Reconciliation function exists');
const factory=new Function('iso','sbFetch','cached','nameKey','window','CustomEvent',fast.slice(a,b)+'return reconcile;');
(async()=>{
 const tasks=[
  {id:'one',agent_name:'Agent A',activity_type:'Reconnect Outreach',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'},
  {id:'two',agent_name:'Agent A',activity_type:'Reconnect Outreach',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'},
  {id:'three',agent_name:'Agent B',activity_type:'Agent Talk-to',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'}
 ];
 const activities=[
  {id:'activity1',agent_name:'Agent A',act_type:'Reconnect Outreach',act_date:'2026-11-09',outcome:'Left voicemail'},
  {id:'activity2',agent_name:'Agent B',act_type:'Agent Talk-to',act_date:'2026-11-09',outcome:'Left voicemail'}
 ];
 const updated=[];
 const fn=factory(()=> '2026-11-09',async(url,opts)=>{if(!opts)return tasks;updated.push(url);return []},activities,s=>s.toLowerCase().replace(/[^a-z]/g,''),{isAmandaDailyActivity:()=>true,dispatchEvent:()=>{}},class{constructor(){}});
 await fn();
 assert.equal(updated.length,1,'Only one task should be marked worked');
 assert(updated[0].includes('id=eq.one'),'Early completion of scheduled catch-up must be allowed');
 console.log('Catch-up guard and one-to-one outcome reconciliation PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
