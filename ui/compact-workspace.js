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
 'body:not([data-rm-tab="director"]) #rmSharedPowerBiWarning{display:none!important;visibility:hidden!important;pointer-events:none!important}',
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
  if(/MUST DO/i.test(t)&&/BUILD NEW BUSINESS/i.test(t)&&/4.Week Campaigns/i.test(t)&&!parent.querySelector('#rmExecutionPlan')&&!parent.querySelector('#rm350Workboard'))return parent;
  parent=parent.parentElement;
 }
 return title.closest('details')||null;
}
function findActivityCard(today){
 const heads=[...document.querySelectorAll('h2,h3,h4,strong')];
 const heading=heads.find(el=>!el.closest('#execQuickLog')&&/^(log an activity|log activity)$/i.test((el.textContent||'').trim())&&el.parentElement&&/open activity log/i.test(el.parentElement.parentElement?.textContent||''));
 if(!heading)return null;
 let node=heading.parentElement;
 while(node&&node!==today){
  if(node.querySelector('button,a')&&/open activity log/i.test(node.textContent||'')&&(node.textContent||'').length<550)return node;
  node=node.parentElement;
 }
 return null;
}
function moveTodayAboveScorecard(today){
 const board=document.getElementById('rm350Workboard')||document.getElementById('rmExecutionPlan');
 if(!board)return;
 const headings=[...document.querySelectorAll('h1,h2,h3')];
 const score=headings.find(el=>/^scorecard progress$/i.test((el.textContent||'').trim())&&today.contains(el))||
   headings.find(el=>/^scorecard progress$/i.test((el.textContent||'').trim()));
 if(!score)return;
 // The Today heading and dashboard may be siblings inside the same card.
 const todayHeading=headings.find(el=>/^today$/i.test((el.textContent||'').trim())&&today.contains(el)&&!el.closest('#rmExecutionPlan'));
 const source=todayHeading||board;
 let common=source;while(common&&!common.contains(score))common=common.parentElement;
 if(!common||common===document.body&&!today.contains(score))return;
 const branch=(node,ancestor)=>{let n=node;while(n&&n.parentElement!==ancestor)n=n.parentElement;return n};
 const todayCard=branch(source,common),scoreCard=branch(score,common);
 if(!todayCard||!scoreCard||todayCard===scoreCard)return;
 if(todayCard.parentElement!==scoreCard.parentElement)return;
 if((scoreCard.compareDocumentPosition(todayCard)&Node.DOCUMENT_POSITION_FOLLOWING)!==0)return;
 common.insertBefore(todayCard,scoreCard);
}

function mount(){
 const today=document.getElementById('view-week');if(!today)return;
 moveTodayAboveScorecard(today);
 // Director diagnostics remain in the Director view; suppress RM floating alerts.
 const directorVisible=document.body.dataset.rmTab==='director';
 if(!directorVisible){
  for(const node of document.querySelectorAll('div,section,aside,[role="status"],[role="alert"]')){
   if(node.id==='rmExecutionPlan'||node.id==='view-week')continue;
   const value=(node.textContent||'').trim();
   if(!/^Shared data:\s*reconciliation required\b/i.test(value)||value.length>650)continue;
   // Match the innermost warning card only, never the whole Today page.
   if([...node.children].some(child=>/Shared data:\s*reconciliation required/i.test(child.textContent||'')&&(child.textContent||'').length<650))continue;
   node.hidden=true;node.style.setProperty('display','none','important');node.setAttribute('aria-hidden','true');
  }
 }

 const legacy=findLegacyDrawer(today);
 if(legacy&&!legacy.hidden){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.style.display='none'}
 // The new Log Activity control is the first action inside Today's live plan.
 // Remove the old duplicate card at the bottom without removing its Log tab or saved records.
 const quick=document.getElementById('execQuickLogBtn');
 // The old bottom Today card repeats the daily plan and pushes work beneath the scorecard.
 // Hide that exact small card only, never the live execution plan or its worklists.
 if(quick){
  const title=[...today.querySelectorAll('h1,h2,h3,h4')].find(el=>/^today$/i.test((el.textContent||'').trim()));
  if(title){
   let node=title.parentElement;
   while(node&&node!==today){
    const copy=(node.textContent||'').trim();
    if(copy.length>900||node.contains(document.getElementById('rmExecutionPlan'))||node.contains(document.getElementById('rmActualScorecard')))break;
    if(/log an activity/i.test(copy)&&/open activity log/i.test(copy)){
     node.hidden=true;node.style.setProperty('display','none','important');node.setAttribute('aria-hidden','true');break;
    }
    node=node.parentElement;
   }
  }
 }

 const card=findActivityCard(today);
 if(quick&&card&&!card.contains(quick)){
  card.hidden=true;card.style.setProperty('display','none','important');
  card.setAttribute('aria-hidden','true');
 }
 const duplicate=document.getElementById('rmTopActivityShortcut');
 if(quick&&duplicate)duplicate.remove();

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
// Refresh compact layout on meaningful work updates, not on every DOM change.
window.addEventListener('rm-work-queue-changed',mount);
window.addEventListener('rm-growth-updated',mount);
window.addEventListener('focus',mount);
// Allow the async daily dashboard to finish its initial mount.
setTimeout(mount,300);
setTimeout(mount,1200);
})();