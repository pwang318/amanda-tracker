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
assert(fast.includes('const used=new Set(completedWithActivity.map('),'Previously used activity IDs must be reserved across refreshes');
assert(fast.includes('completion_activity_id:matched.id'),'Task completion must reference its saved activity');
assert(fast.includes('await reconcile()'),'Normal saved activity must also be reconciled');
assert(fast.includes('const used=new Set();let linked=0'),'Meeting matching must not depend on task reconciliation');
const a=fast.indexOf('async function reconcile(){'),b=fast.indexOf('\nasync function refresh(',a);
assert(a>=0&&b>a,'Reconciliation function exists');
const factory=new Function('iso','sbFetch','cached','nameKey','window','CustomEvent','console',fast.slice(a,b)+'return reconcile;');
(async()=>{
 const tasks=[
  {id:'one',agent_name:'Agent A',activity_type:'Reconnect Outreach',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'},
  {id:'two',agent_name:'Agent A',activity_type:'Reconnect Outreach',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'},
  {id:'three',agent_name:'Agent B',activity_type:'Agent Talk-to',work_date:'2026-11-16',reason:'Catch-up from 2026-08-19'}
 ];
 const activities=[
  {id:501,agent_name:'Agent A',act_type:'Reconnect Outreach',act_date:'2026-11-09',outcome:'Left voicemail'},
  {id:502,agent_name:'Agent B',act_type:'Agent Talk-to',act_date:'2026-11-09',outcome:'Left voicemail'}
 ];
 const updated=[],linked=new Set(),warnings=[];
 const fetch=async(url,opts)=>{
  if(!opts){
   if(url.includes('completion_activity_id=not.is.null'))return [...linked].map(id=>({completion_activity_id:id}));
   return tasks.filter(t=>!updated.includes(t.id));
  }
  const id=/id=eq\.([^&]+)/.exec(url)?.[1];
  const body=JSON.parse(opts.body);
  assert(!linked.has(body.completion_activity_id),'Activity must never resolve two tasks');
  updated.push(id);linked.add(body.completion_activity_id);
  return [{id,completion_activity_id:body.completion_activity_id}];
 };
 const fn=factory(()=> '2026-11-09',fetch,activities,s=>s.toLowerCase().replace(/[^a-z]/g,''),{isAmandaDailyActivity:()=>true,dispatchEvent:()=>{}},class{constructor(){}},{warn:(...args)=>warnings.push(args)});
 await fn();
 await fn();
 assert.deepEqual(updated,['one'],'One outreach attempt may only close one assignment across repeated refreshes');
 assert.equal(warnings.length,0,'No completion verification warnings');
 console.log('Catch-up work, meeting metrics and one-to-one completion safeguards PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
