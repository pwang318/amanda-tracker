'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
for(const [path,signals] of [
  ['ui/fast-activity-workflow.js',['Fast prospecting log','save.click()','Meeting Scheduled','Linked bookings held','rm_work_queue','rmDailyActivityBrief']],
]){
 const src=fs.readFileSync(path,'utf8');
 new vm.Script(src,{filename:path});
 for(const signal of signals)assert(src.includes(signal),path+': missing '+signal);
}
assert(html.includes('window.rmV462LoadMorningRows=loadMorningRows;\nasync function ensureXlsx(){'),'work-list bridge must contain real newline');
assert(!html.includes('window.rmV462LoadMorningRows=loadMorningRows;\\nasync function ensureXlsx(){'),'no broken escaped newline in HTML');
for(const script of ['ui/fast-activity-workflow.js'])assert(html.includes(script+'?v='),'dashboard must load '+script);
assert(html.includes('const cut=plusDays(day,-365);'),'extended 4-week campaign history');
assert(html.includes('if(age<0)return;'),'never remove an overdue campaign just because it passed 35 days');
const fast=fs.readFileSync('ui/fast-activity-workflow.js','utf8');
assert(!fast.includes("sbFetch('amanda_activities',{method:'POST'"),'rapid log must not bypass existing native activity validator');
assert(fast.includes("save.click()"),'quick log routes through native activity save');
assert(fast.includes("status:'worked'"),'matched saved call can close matching open call task');
assert(fast.includes('allowed')||fast.includes('alias'),'task completion needs exact activity type restrictions');
assert(!html.includes('outstanding-daily-checklist.js?v='),'Replaced checklist is not loaded');
console.log('PASS new RM rapid logging, campaign rollover, daily plan and source bridge');
