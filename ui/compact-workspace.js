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
function findLegacyDrawer(today){
 const nodes=[...today.querySelectorAll('summary,h2,h3,h4,button,div,span,p')];
 const title=nodes.find(el=>el.children.length===0&&/^more (work )?tools$/i.test((el.textContent||'').trim()));
 if(!title)return null;
 // A self-contained legacy group contains its original MUST DO / BUILD NEW BUSINESS headings.
 let parent=title.parentElement;
 while(parent&&parent!==today){
  const t=(parent.textContent||'').slice(0,12000);
  if(/MUST DO/i.test(t)&&/BUILD NEW BUSINESS/i.test(t)&&/4.Week Campaigns/i.test(t))return parent;
  parent=parent.parentElement;
 }
 return title.closest('details')||null;
}
function findActivityCard(today){
 const heads=[...today.querySelectorAll('h2,h3,h4,strong')];
 const heading=heads.find(el=>/^(log an activity|log activity)$/i.test((el.textContent||'').trim()));
 if(!heading)return null;
 let node=heading.parentElement;
 while(node&&node!==today){
  if(node.querySelector('button,a')&&/open activity log/i.test(node.textContent||'')&&(node.textContent||'').length<550)return node;
  node=node.parentElement;
 }
 return null;
}
function mount(){
 const today=document.getElementById('view-week');if(!today)return;
 const legacy=findLegacyDrawer(today);
 if(legacy&&!legacy.hidden){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.style.display='none'}
 // Move the real Log Activity card, preserving its original click handler.
 const card=findActivityCard(today);
 const first=document.getElementById('rm350Workboard')||today.firstElementChild;
 if(card&&card.parentElement!==today){
  today.insertBefore(card,first&&first.parentElement===today?first:today.firstChild);
  card.id='rmTodayActivityCard';
 }
 if(card){
  const duplicate=document.getElementById('rmTopActivityShortcut');
  if(duplicate)duplicate.remove();
  return;
 }
 if(document.getElementById('rmTopActivityShortcut'))return;
 const shortcut=document.createElement('div');shortcut.id='rmTopActivityShortcut';
 shortcut.innerHTML='<strong>Log activity</strong><button type="button">Open activity log</button>';
 shortcut.querySelector('button').addEventListener('click',function(){
  const target=[...document.querySelectorAll('button,a')].find(el=>el!==this&&/open activity log/i.test((el.textContent||'').trim()));
  if(target){target.click();return}
  const nav=[...document.querySelectorAll('nav button,nav a,[role="tab"],.tab-bar button')].find(el=>/^(log activity|activity log|log)$/i.test((el.textContent||'').trim())||el.dataset.tab==='log');
  if(nav){nav.click();return}
  const log=document.getElementById('view-log');
  if(log){log.scrollIntoView({behavior:'smooth',block:'start'});log.querySelector('input:not([type="hidden"]),button')?.focus({preventScroll:true})}
 });
 today.insertBefore(shortcut,first&&first.parentElement===today?first:today.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}).observe(document.body,{childList:true,subtree:true});
})();