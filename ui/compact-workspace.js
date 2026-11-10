/* RM workspace layout: keep existing live data/actions, remove duplicate legacy tool drawer. */
(function(){
'use strict';
if(document.getElementById('rmTodayCleanV5'))return;
const style=document.createElement('style');
style.id='rmTodayCleanV5';
style.textContent=[
 '#view-week{max-width:1180px;margin:0 auto;min-width:0}',
 '#view-week *,#view-scorecard *{box-sizing:border-box;min-width:0}',
 '#view-week #rm350Workboard{border:1px solid #e7e0ef;border-radius:12px;box-shadow:none;padding:15px 18px}',
 '#view-week #rm350Workboard.rmExecReady>.rm350-hero,#view-week #rm350Workboard.rmExecReady>.rm350-shell,#view-week #rm350Workboard.rmExecReady>.rm358-banner,#view-week #rm350Workboard.rmExecReady>.rm358-source-drawer{display:none!important}',
 '#view-week #rm350Workboard:has(> #rmExecutionPlan){min-height:0!important;padding-bottom:18px!important}',
 '#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(3,minmax(0,1fr))}',
 '#view-week #rmExecutionPlan .execCategoryBtn{min-width:0;white-space:normal;overflow-wrap:anywhere}',
 '#view-week h1,#view-week h2,#view-week h3,#view-week p,#view-week button,#view-week span,#view-scorecard h1,#view-scorecard h2,#view-scorecard p{overflow-wrap:break-word;word-break:normal;white-space:normal}',
 '#view-week [class*="tile"],#view-week [class*="card"],#view-week [class*="metric"]{min-width:0}',
 '#rmSharedPowerBiWarning{position:static!important;z-index:auto!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.45!important;max-width:100%!important}',
 '#rmTopActivityShortcut{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin:12px 0;padding:14px 16px;border:1px solid #e5ddec;background:#faf8fd;border-radius:12px;color:#271c40}',
 '#rmTopActivityShortcut strong{font-size:16px}',
 '#rmTopActivityShortcut button{border:1px solid #a48ac6;background:#68429b;color:white;border-radius:9px;padding:10px 16px;cursor:pointer;font-weight:600}',
 '#rmTopActivityShortcut button:focus-visible{outline:3px solid #b398df;outline-offset:2px}',
 '@media(max-width:820px){#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:440px){#view-week #rm350Workboard{padding:10px!important}#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:1fr}#rmTopActivityShortcut button{width:100%}}'
].join('\n');
document.head.append(style);
function mount(){
 const today=document.getElementById('view-week');if(!today)return;
 // The legacy More work tools disclosure contains duplicate tracker-era controls.
 // Only suppress that specific disclosure; never remove the actual logging forms.
 for(const summary of today.querySelectorAll('summary,button,[role="button"]')){
  if(!/^more (work )?tools$/i.test((summary.textContent||'').trim()))continue;
  const drawer=summary.closest('details')||summary.parentElement;
  if(drawer&&drawer!==today&&drawer.querySelectorAll('button,a,input,select').length>0){
   drawer.hidden=true;drawer.setAttribute('aria-hidden','true');
  }
 }
 if(document.getElementById('rmTopActivityShortcut'))return;
 const shortcut=document.createElement('div');shortcut.id='rmTopActivityShortcut';
 shortcut.innerHTML='<strong>Log activity</strong><button type="button">Open activity log</button>';
 shortcut.querySelector('button').addEventListener('click',function(){
  const log=document.getElementById('view-log');
  const buttons=[...document.querySelectorAll('button,[role="tab"],a')];
  const nav=buttons.find(b=>b.closest('nav,[role="tablist"],.tabs,.tab-bar,.nav')&&(/^(log activity|activity log|log)$/i.test((b.textContent||'').trim())||b.getAttribute('href')==='#view-log'||b.dataset.tab==='log'));
  if(nav){nav.click();return}
  const native=[...buttons].find(b=>b!==this&&b.getAttribute('onclick')&&/showTab\(['"]log['"]\)/.test(b.getAttribute('onclick')));
  if(native){native.click();return}
  if(log){log.scrollIntoView({behavior:'smooth',block:'start'});const first=log.querySelector('input:not([type="hidden"]),button');if(first)first.focus({preventScroll:true})}
 });
 const anchor=document.getElementById('rm350Workboard')||today.firstElementChild;
 if(anchor&&anchor.parentNode===today)today.insertBefore(shortcut,anchor);
 else today.prepend(shortcut);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(document.body,{childList:true,subtree:true});
})();