/* RM home: presentation only. All worklist state and actions live in daily-execution-coaching.js. */
(function(){
'use strict';
if(document.getElementById('rmTodayCleanV4'))return;
const style=document.createElement('style');
style.id='rmTodayCleanV4';
style.textContent=[
 '#view-week{max-width:1180px;margin:0 auto}',
 '#view-week #rm350Workboard{border:1px solid #e7e0ef;border-radius:12px;box-shadow:none;padding:15px 18px}',
 '#view-week #rm350Workboard:has(> #rmExecutionPlan)>:not(#rmExecutionPlan){display:none!important}',
 '#view-week #rm350Workboard:has(> #rmExecutionPlan){min-height:0!important;padding-bottom:18px!important}',
 '#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(3,minmax(0,1fr))}',
 '#view-week #rmExecutionPlan .execCategoryBtn{min-width:0}',
 '@media(max-width:820px){#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:440px){#view-week #rm350Workboard{padding:10px!important}#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:1fr}}'
].join('\n');
document.head.append(style);
})();
