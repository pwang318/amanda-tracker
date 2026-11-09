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
 v350OpenLane: name => events.push('lane:' + name),
 switchTab: name => events.push('tab:' + name),
 rmV440OpenPortfolio: name => events.push('portfolio:' + name)
};
const ctx = { window: win };
vm.createContext(ctx);
vm.runInContext(m[0].replace(/\nfunction taskList\($/, '') + '\nthis.open = openTask;',ctx);
for(const [type, expected] of [
 ['4-Week Campaign','lane:conversion'],
 ['Tuesday Updates','tab:tuesday'],
 ['Transaction Call','lane:calls'],
 ['Weekly Realtor Call','lane:smart'],
 ['Cold Calls','tab:log'],
 ['Reconnect Outreach','tab:reconnect'],
 ['C-agent growth','tab:growth'],
 ['Portfolio · Meeting Due','portfolio:work'],
 ['Missing Growth Plan','portfolio:work'],
 ['Portfolio · Growth Next Step','portfolio:work'],
 ['Portfolio · Partner Touch Due','portfolio:work'],
 ['Follow-up','portfolio:work']
]){
 events.length = 0;
 ctx.open({Category:type,agent_name:'Sample Agent'});
 assert.equal(events[0],expected,'Wrong destination for ' + type);
}
for(const [key,title] of [
 ['log','Cold calls today'],
 ['closeout','Prospecting minutes'],
 ['overdue','Overdue work'],
 ['today','Due today'],
 ['next','Next workday · '],
 ['week','Next 7 days (later)'],
 ['done','Completed assigned tasks'],
 ['undated','Needs a due date']
]){
 assert(code.includes("['"+title+"'") || code.includes("['"+title+"',"),'Missing metric ' + title);
}
assert(code.includes("const board=$('rm350Workboard')||$('view-week')"), 'Daily plan mounts inside the visible board');
assert(code.includes('window.rmV440GetPortfolioData'), 'Portfolio work must load into the daily task list');
assert(code.includes("rows.map((q,i)=>"), 'Every assigned item must be accessible');
assert(!/Fresh start · November 9 onward/i.test(code), 'Internal reset wording not user facing');
assert(html.includes('ui/daily-execution-coaching.js?v='), 'Daily script loaded');
console.log('PASS: mapped RM task destinations, visible workboard, portfolio source and daily metrics');
