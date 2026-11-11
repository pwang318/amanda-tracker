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
 '#view-week #rm350Workboard.rmExecReady #rm492Additional{display:none!important}',
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
 '#view-week #rm350Workboard{background:#fff!important;border:1px solid #e7e7eb!important;border-radius:16px!important;box-shadow:none!important}',
 '#view-week #rmExecutionPlan{background:transparent!important;border:0!important;box-shadow:none!important;padding:6px 2px!important;color:#202127!important}',
 '#view-week #rmExecutionPlan h2,#view-week #rmExecutionPlan h3{color:#24242b!important;letter-spacing:-.025em!important}',
 '#view-week #rmExecutionPlan p,#view-week #rmExecutionPlan small{color:#6e707a!important;line-height:1.5!important}',
 '#view-week #rmExecutionPlan button{font-weight:600!important;transition:background .16s,border-color .16s!important}',
 '#view-week #rmExecutionPlan button:focus-visible{outline:2px solid #86749f!important;outline-offset:2px!important}',
 '#view-week #rmExecutionPlan .execQuickLog,#view-week #rmExecutionPlan #execProspecting,#view-week #rmExecutionPlan #execPriorities,#view-week #rmExecutionPlan #execWeeklyGoals,#view-week #rmExecutionPlan #execOutreach{background:#fafafb!important;border:1px solid #e9e9ed!important;border-radius:12px!important;box-shadow:none!important}',
 '#view-week #rmExecutionPlan #execQuickLogBtn,#view-week #rmExecutionPlan .execTaskGo,#view-week #rmExecutionPlan .execManagerOpen{background:#66547e!important;border-color:#66547e!important;color:#fff!important;border-radius:9px!important;box-shadow:none!important}',
 '#view-week #rmExecutionPlan .execMetric,#view-week #rmExecutionPlan .execCategoryBtn,#view-week #rmExecutionPlan .execOutcomeMetric{background:#fff!important;border:1px solid #e8e8ed!important;border-radius:11px!important;box-shadow:none!important}',
 '#view-week #rmExecutionPlan .execMetric strong,#view-week #rmExecutionPlan .execCategoryBtn strong{color:#453956!important}',
 '#view-week #rmExecutionPlan .execMetric[role="button"]:hover,#view-week #rmExecutionPlan .execCategoryBtn:hover{background:#f6f4f8!important;border-color:#c9bfd5!important;transform:none!important}',
 '#view-week #rmExecutionPlan .execCategoryBtn{min-height:58px!important;padding:11px 13px!important}',
 '#view-week #rmExecutionPlan .execWorkCardList{gap:10px!important}',
 '#view-week #rmExecutionPlan .execWorkCard{background:#fff!important;border:1px solid #e7e7eb!important;border-radius:12px!important;box-shadow:0 1px 3px rgba(16,20,30,.035)!important;padding:15px!important}',
 '#view-week #rmExecutionPlan .execWorkCardHeader b{color:#252630!important;font-size:15px!important}',
 '#view-week #rmExecutionPlan .execWorkCardHeader span,#view-week #rmExecutionPlan .execWorkCardBody p{color:#696b77!important}',
 '#view-week #rmExecutionPlan .execWorkCardBody strong{color:#383944!important}',
 '#view-week #rmExecutionPlan .execWorkBadges small{background:#f4f4f6!important;color:#5a5e69!important;border-radius:7px!important}',
 '#view-week #rmExecutionPlan .execListGuide,#view-week #rmExecutionPlan .execAssignmentAction{background:#fafafb!important;border:1px solid #e9e9ef!important;border-radius:12px!important}',
 '#view-week #rmExecutionPlan .execManagerTask,#view-week #rmExecutionPlan .execRegularWork{background:#fff!important;border:1px solid #e8e8ed!important;box-shadow:none!important}',
 '#view-week #rmExecutionPlan #execCampaignShortcut{background:#fafafb!important;border:1px solid #e8e8ed!important;border-radius:11px!important;color:#35313b!important}',
 '#view-week #rmExecutionPlan summary{color:#4e425f!important}',
 '#view-week #rmExecutionPlan .execStep{background:#736480!important}',
 '@media(max-width:560px){#view-week #rm350Workboard{padding:10px!important}#view-week #rmExecutionPlan .execWorkCard{padding:12px!important}#view-week #rmExecutionPlan .execCategoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}',
 '#view-week #rmExecutionPlan .execWorkCardList{grid-template-columns:1fr!important;gap:8px!important}',
 '#view-week #rmExecutionPlan .execGroupedCard{padding:15px 17px!important;gap:0!important}',
 '#view-week #rmExecutionPlan .execGroupedCard .execWorkCardHeader{margin-bottom:6px!important}',
 '#view-week #rmExecutionPlan .execGroupedCard .execWorkCardHeader b{font-size:16px!important;letter-spacing:-.02em!important}',
 '#view-week #rmExecutionPlan .execGroupedCard .execWorkCardHeader span{font-size:11px!important;color:#81838e!important}',
 '#view-week #rmExecutionPlan .execGroupedAction{display:flex;align-items:center;gap:15px;justify-content:space-between;padding:11px 0;border-top:1px solid #eff0f2}',
 '#view-week #rmExecutionPlan .execGroupedActionInfo{flex:1;min-width:0}',
 '#view-week #rmExecutionPlan .execGroupedActionInfo strong{font-size:13px;font-weight:650;color:#32333a}',
 '#view-week #rmExecutionPlan .execGroupedActionInfo p{font-size:12px!important;margin:4px 0!important;color:#656771!important;line-height:1.45!important}',
 '#view-week #rmExecutionPlan .execGroupedActionInfo small{font-size:11px!important;color:#858692!important;display:block;line-height:1.4}',
 '#view-week #rmExecutionPlan .execGroupedDue{font-size:11px;color:#797b85;margin-left:10px;background:#f5f5f7;padding:4px 7px;border-radius:6px}',
 '#view-week #rmExecutionPlan .execGroupedAction .execTaskGo{width:auto!important;flex:0 0 auto;min-width:160px;max-width:190px;background:#66547e!important;border:0!important;color:#fff!important;font-size:11px!important;padding:9px 12px!important}',
 '@media(max-width:620px){#view-week #rmExecutionPlan .execGroupedAction{flex-wrap:wrap;gap:8px}#view-week #rmExecutionPlan .execGroupedAction .execTaskGo{max-width:none;min-width:0;width:100%!important}}',
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
 // #rm492Additional is the legacy duplicate Today wrapper, not Amanda's live
 // daily plan. Keep only the actual #rmExecutionPlan before the scorecard.
 const host=document.getElementById('rm350Workboard');
 const plan=document.getElementById('rmExecutionPlan');
 const score=document.getElementById('rm490Score');
 if(!host||!plan||!score||!host.contains(plan)||!host.contains(score))return;
 if(plan.parentElement!==score.parentElement)return;
 if((score.compareDocumentPosition(plan)&Node.DOCUMENT_POSITION_FOLLOWING)!==0)return;
 score.before(plan);
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
setTimeout(mount,3500);
setTimeout(mount,7000);
window.addEventListener('load',mount);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)mount()});
})();