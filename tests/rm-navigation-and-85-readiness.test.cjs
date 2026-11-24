'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const daily=fs.readFileSync('ui/daily-execution-coaching.js','utf8');
const score=fs.readFileSync('ui/scorecard-source-summary.js','utf8');
const index=fs.readFileSync('index.html','utf8');
new vm.Script(daily,{filename:'daily-execution-coaching.js'});
new vm.Script(score,{filename:'scorecard-source-summary.js'});
assert(index.includes("cold:{icon:rm352Svg('plus'),title:'New Realtor Outreach',desc:'Open the qualified prospect call list.',external:'pipeline'}"),'Original homepage outreach must open Pipeline');
assert(index.includes("['Must do','Get these done today',['schedule','calls','tuesday']]"),'Do not show removed LP handoffs as a daily button');
assert(!index.includes('Work Mack’s weekly listing-agent update list.'),'No stale employee name in Tuesday help');
assert(index.includes("const level=String(r.powerbi_level||r.tier||'').trim().toUpperCase()"),'Tier drilldowns must match Power BI classification');
assert(daily.includes("window.rmOpenProspectList=openProspectList"),'All prospect links share the verified opener');
assert(daily.includes('id="execInlineProspects"'),'In-page Realtor call-list is actionable');
assert(daily.includes('New Realtor prospecting · view call list'), 'Single prospect section identifies actual call list');
assert(daily.includes('<summary>New Realtor prospecting · view call list</summary>'), 'Prospect shortcut must not show an unrelated assignment count');
assert(!daily.includes('New Realtor prospect list <small>Assigned outreach</small>'), 'Legacy misleading zero-count label must be absent');
assert(daily.includes('id="execMoreMetrics"><summary>'),'Supplementary metric tiles must be accessible');
assert(daily.includes("categoryRows.push(['Catch-up assignments'"),'Catch-up list remains separate');
const routes=[];
const start=daily.indexOf('function openTask(q){'),end=daily.indexOf('function taskList(',start);
assert(start>=0&&end>start,'Task routing must exist');
const elements={};
const element=id=>elements[id]??={hidden:true,before(){},scrollIntoView(){}};
const openTask=new Function('window','$','safe','openManagementTemplate',daily.slice(start,end)+'return openTask;')({
 openContactModal:name=>routes.push('agent:'+name),
},element,String,(type,q)=>routes.push(type+':'+q.agent_name));
const makeHost=()=>{const controls={};return {innerHTML:'',querySelector:id=>(controls[id]||={onclick:null})}};
const home=makeHost(),scorePage=makeHost();
const model={
 counts:{Channel:1,A:17,B:21,C:98},
 target:{Channel:3,A:18,B:27},
 total:136,activePartnerCount:136,projectedLeadCount:73,ratioTarget:1.15
};
const browser={
 rmV429ScoreData:model,
 rmOpenCWork:key=>routes.push('growth:'+key),
 rmOpenProspectList:()=>routes.push('prospects'),
 rmV429OpenScoreDetail:key=>routes.push('score:'+key)
};
const doc={getElementById:id=>id==='rm85Roadmap'?home:id==='rm85RoadmapScorecard'?scorePage:null};
const helperStart=score.indexOf('const num=x=>'),helperEnd=score.indexOf('function renderLiveScore()',helperStart);
assert(helperStart>=0&&helperEnd>helperStart,'Dynamic score/roadmap helpers must exist');
const helpers=new Function('window','document','esc','console',score.slice(helperStart,helperEnd)+'return {liveScoreFromNative,renderPathTo85};')(browser,doc,String,{warn:()=>{}});
(async()=>{
 for (const [name,type] of [['Calvin','4-Week Campaign'],['Heather','Weekly Realtor Call'],['Jack','Tuesday Listing Update'],['Mingtao','Follow-up']]) {
  openTask({agent_name:name,activity_type:type});
  assert.equal(element('execDetailArea').hidden,false);
  assert.match(element('execAssignmentAction').innerHTML,new RegExp(name));
  element('execAssignmentProfile').onclick();
 }
 openTask({agent_name:'Kelly',activity_type:'CTC Call'});
 assert.deepEqual(routes.splice(0),['agent:Calvin','agent:Heather','agent:Jack','agent:Mingtao','ctc:Kelly']);
 const live=helpers.liveScoreFromNative();
 assert(Math.abs(live.total-62.325)<0.02,'Roadmap must use the actual weighted score formula');
 helpers.renderPathTo85(live);
 assert(scorePage.innerHTML.includes('113'),'Scenario must correctly calculate projected leads for 85%+');
 assert.equal(home.innerHTML,'','The roadmap appears on Scorecard only');
 scorePage.querySelector('[data-rm85-action="growth"]').onclick();
 scorePage.querySelector('[data-rm85-action="prospects"]').onclick();
 scorePage.querySelector('[data-rm85-action="leads"]').onclick();
 assert.deepEqual(routes,['growth:near','prospects','score:leads'],'Roadmap buttons must open prioritized agents, prospect list, and referred leads');
 assert(score.includes("data-score-detail"),'Scorecard source tiles must be clickable');
 console.log('Navigation, language, source links and live 85% roadmap regression PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
