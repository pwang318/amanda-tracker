'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('ui/daily-execution-coaching.js','utf8');
const match=code.match(/function openActivityDetail\(kind,scroll=true\)\{[\s\S]*?\n\}\nfunction showDetail\(/);
assert(match,'Missing real activity detail implementation');
const nodes={};
const list={
 innerHTML:'',
 querySelectorAll(selector){
  if(selector!=='[data-activity-index]')return [];
  return [...this.innerHTML.matchAll(/data-activity-index="(\d+)"/g)].map(m=>({dataset:{activityIndex:m[1]},onclick:null}));
 }
};
nodes.execHomeWork={hidden:false};nodes.execDetailArea={hidden:true,scrollIntoView(){}};
nodes.execTaskSummary=list;nodes.execDetailTitle={textContent:''};nodes.execLogRelated={onclick:null};
nodes.rmFastAgent={focus(){events.push('focus:cold')}};nodes.agentInput={focus(){events.push('focus:agent')}};
const events=[];
const today='2026-11-09';
const activities=[
 {id:1,agent_name:'Agent Alpha',act_type:'Cold Calls',act_date:today,outcome:'No answer',created_at:'2026-11-09T14:30:00'},
 {id:2,agent_name:'Agent Beta',act_type:'Cold Calls',act_date:today,outcome:'Positive',created_at:'2026-11-09T15:30:00'},
 {id:3,agent_name:'Agent Gamma',act_type:'Break Bread',act_date:today,outcome:'Held',created_at:'2026-11-09T16:30:00'},
 {id:4,agent_name:'Other Date',act_type:'Cold Calls',act_date:'2026-11-08',outcome:'No answer'}
];
const ctx={
 iso:()=>today,activeFor:date=>activities.filter(x=>x.act_date===date),
 $:id=>nodes[id],safe:x=>String(x??''),activeDetail:null,
 window:{switchTab:tab=>events.push('tab:'+tab)},
 openTask:task=>events.push('agent:'+task.agent_name)
};
vm.createContext(ctx);
vm.runInContext(match[0].replace(/\nfunction showDetail\($/,'')+'\nthis.openDetail=openActivityDetail;',ctx);
ctx.openDetail('cold',false);
assert.equal(nodes.execDetailTitle.textContent,'Cold calls logged today · 2');
assert(nodes.execTaskSummary.innerHTML.includes('Agent Alpha'));
assert(nodes.execTaskSummary.innerHTML.includes('Agent Beta'));
assert(!nodes.execTaskSummary.innerHTML.includes('Agent Gamma'));
assert.equal(nodes.execDetailArea.hidden,false);
assert.equal(nodes.execHomeWork.hidden,true);
nodes.execLogRelated.onclick();
assert.deepEqual(events,['tab:log','focus:cold']);
events.length=0;
ctx.openDetail('meetings',false);
assert.equal(nodes.execDetailTitle.textContent,'Meetings logged today · 1');
assert(nodes.execTaskSummary.innerHTML.includes('Agent Gamma'));
assert(!nodes.execTaskSummary.innerHTML.includes('Agent Beta'));
nodes.execLogRelated.onclick();
assert.deepEqual(events,['tab:log','focus:agent']);
console.log('PASS real cold-call and meeting drilldown renders exact matching saved activity rows, correct counts and logging actions');
