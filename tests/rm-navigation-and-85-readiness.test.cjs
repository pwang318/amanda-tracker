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
assert(daily.includes("data-outreach=\"true\""),'Prospect tile is actionable');
assert(daily.includes('id="execMoreMetrics"><summary>'),'Supplementary metric tiles must be accessible');
assert(daily.includes("categoryRows.push(['Catch-up assignments'"),'Catch-up list remains separate');
const routes=[];
const start=daily.indexOf('function openTask(q){'),end=daily.indexOf('function taskList(',start);
assert(start>=0&&end>start,'Task routing must exist');
const openTask=new Function('window','Promise','console',daily.slice(start,end)+'return openTask;')({
 v350OpenLane:key=>routes.push('lane:'+key),
 openContactModal:name=>{routes.push('agent:'+name);return Promise.resolve()},
 switchTab:tab=>routes.push('tab:'+tab)
},Promise,{warn:()=>{}});
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
 await openTask({agent_name:'Calvin',activity_type:'4-Week Campaign'});
 await openTask({agent_name:'Heather',activity_type:'Weekly Realtor Call'});
 await openTask({agent_name:'Jack',activity_type:'Tuesday Listing Update'});
 await openTask({agent_name:'Kelly',activity_type:'CTC Call'});
 await openTask({agent_name:'Mingtao',activity_type:'Follow-up'});
 assert.deepEqual(routes.splice(0),['lane:conversion','lane:smart','lane:tuesday','lane:calls','agent:Mingtao'],'Every assignment must open the appropriate lane or named agent');
 const live=helpers.liveScoreFromNative();
 assert(Math.abs(live.total-62.325)<0.02,'Roadmap must use the actual weighted score formula');
 helpers.renderPathTo85(live);
 assert(home.innerHTML.includes('113')&&scorePage.innerHTML.includes('113'),'Scenario must correctly calculate projected leads for 85%+');
 assert(home.innerHTML===scorePage.innerHTML,'Today and Scorecard must show the same roadmap');
 home.querySelector('#rm85Growth').onclick();
 scorePage.querySelector('#rm85Prospects').onclick();
 home.querySelector('#rm85Leads').onclick();
 assert.deepEqual(routes,['growth:near','prospects','score:leads'],'Roadmap buttons must open prioritized agents, prospect list, and referred leads');
 assert(score.includes("data-score-detail"),'Scorecard source tiles must be clickable');
 console.log('Navigation, language, source links and live 85% roadmap regression PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
