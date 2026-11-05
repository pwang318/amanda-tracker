'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
function match(re,label){const m=html.match(re);assert(m,label+' missing');return m[0]}
const tuesday=match(/<script id="rm-v312-clean-tuesday-js">[\s\S]*?<\/script>/,'Tuesday implementation');
const portfolio=match(/<script id="rm-v440-portfolio-today-flow">[\s\S]*?<\/script>/,'Amanda portfolio');
const detail=match(/<script id="rm-v442-portfolio-today-drawer">[\s\S]*?<\/script>/,'flag detail');
for(const [id,block] of [['Tuesday',tuesday],['Portfolio',portfolio],['Flag detail',detail]]){
 const source=block.replace(/^<script[^>]*>/,'').replace(/<\/script>$/,'');
 new vm.Script(source,{filename:id+'.js'});
}
assert(tuesday.includes("displayRows.filter(r=>!noCall(listingClass(r))&&!done(r,S))"),'Completed or cleared Tuesday work must be absent from outstanding rows');
assert(tuesday.includes("complete=displayRows.filter"),'Tuesday completed counts must be retained for reporting');
assert(tuesday.includes("rowMatchKey(a)===mk"),'Tuesday completion must match stable transaction identity');
assert(portfolio.includes("r.owner!=='Amanda'"),'Weekly work must count Amanda-owned relationships only');
assert(portfolio.includes("seenPortfolioNames"),'Portfolio rows must be unique');
assert(portfolio.includes("String(a.display_name||'').trim()==='__HIDDEN__'"),'Hidden profiles must be excluded');
assert(portfolio.includes("inactive|deleted|archived|removed"),'Inactive and removed relationships must be excluded');
assert(detail.includes("Competitor risk flagged"),'Performance warnings must include specific reasons');
assert(html.includes("rm-v495-health-details"),'Secondary health tiles should be collapsed by default');
assert(html.includes("#rm350Workboard #rm490Referral{display:none!important}"),'Homepage must not duplicate the referral counter');
const fn=match(/function weeklyCallsDue\(\)\{[^\n]+\}/,'weeklyCallsDue');
const norm=match(/function norm\(v\)\{[^\n]+\}/,'normalize');
const missing=match(/function missingGrowthPlansDue\(data\)\{[^\n]+\}/,'missingGrowthPlansDue');
const ctx={window:{_rmV267BuyerAgentState:{rows:[
 {name:'Agent A',owner:'Amanda',due:true,waiting:false},
 {name:' Agent A ',owner:'Amanda',due:true,waiting:false},
 {name:'Agent B',owner:'Nyny',due:true,waiting:false},
 {name:'Agent C',owner:'Amanda',due:false,waiting:false},
 {name:'Agent D',owner:'Amanda',due:true,waiting:true},
 {name:'Agent E',owner:'Amanda',due:true,waiting:false}
]}},Set};
vm.createContext(ctx);vm.runInContext(norm+';'+fn+';'+missing,ctx);
assert.equal(ctx.weeklyCallsDue(),2,'Amanda weekly calls must count only distinct due Amanda agents');
assert.equal(ctx.missingGrowthPlansDue({rows:[{name:'Agent A',next_growth_opportunity:''},{name:'Agent A',next_growth_opportunity:''},{name:'Agent B',next_growth_opportunity:'Grow pipeline'}]}),1,'Missing growth plans must be unique per agent');
console.log('PASS RM Tuesday, Amanda ownership, unique growth plans, explicit flags, inactive guards, streamlined home');
