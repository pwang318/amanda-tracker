/* Compact relationship notes for RM assignment completion. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const css=document.createElement('style');css.id='rmRelationshipNotesStyle';
css.textContent=`
#execAssignmentAction .rmRelField{margin:10px 0}
#execAssignmentAction .rmRelLabel{display:block;font-size:12px;font-weight:650;color:#30313a;margin:0 0 7px}
#execAssignmentAction .rmRelChoices{display:flex;flex-wrap:wrap;gap:7px 15px}
#execAssignmentAction .rmRelChoices label{display:inline-flex;gap:5px;align-items:center;font-size:12px;font-weight:400;color:#333;white-space:normal;cursor:pointer}
#execAssignmentAction .rmRelChoices input{accent-color:#685087;margin:0;width:auto!important}
#execAssignmentAction #rmRelFields textarea{width:100%;min-height:52px;max-height:100px;background:#fff;border:1px solid #dddde3;border-radius:8px;padding:9px;box-sizing:border-box;font-size:12px}
#execAssignmentAction #rmRelFields select,#execAssignmentAction #rmRelFields input[type=date]{width:100%;border:1px solid #dddde3;background:#fff;border-radius:8px;padding:9px;font-size:12px;box-sizing:border-box}
#execAssignmentAction .rmRelGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#execAssignmentAction #rmRelFields{padding:5px 0;border-top:1px solid #ebebee;margin-top:10px}
#execAssignmentAction #rmRelFields[hidden],#execAssignmentAction #rmRelConversation[hidden]{display:none!important}
#execAssignmentAction .rmRelError{font-size:12px;color:#a42740;margin-top:5px}
#execAssignmentAction #execAssignmentNotes{display:none!important}
#execAssignmentAction .rmRelOriginalNotes{display:none!important}
@media(max-width:620px){#execAssignmentAction .rmRelGrid{grid-template-columns:1fr}#execAssignmentAction .rmRelChoices{gap:9px 12px}}
`;document.head.append(css);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checklist=(name,options)=>'<div class="rmRelChoices">'+options.map(x=>'<label><input type="checkbox" name="'+name+'" value="'+escapeHtml(x)+'"> '+escapeHtml(x)+'</label>').join('')+'</div>';
const selection=(id,opts)=>'<select id="'+id+'">'+opts.map(([value,label])=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(label)+'</option>').join('')+'</select>';
const isConversation=()=>['call-spoke','text-reply','meeting-held'].includes($('rmRelOutcome')?.value);
const method=()=>document.querySelector('input[name="rmRelMethod"]:checked')?.value||'Call';
function update(){
 const m=method(),out=$('rmRelOutcome');if(!out)return;
 const items=m==='Text'?[['text-pending','Sent — awaiting reply'],['text-reply','Meaningful reply received'],['text-ack','Acknowledgment only']]:m==='Meeting'?[['meeting-held','Meeting held'],['meeting-missed','Meeting not held']]:[['call-spoke','Spoke with agent'],['call-vm','Left voicemail'],['call-no','No answer']];
 const old=out.value;out.innerHTML=items.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');
 if(items.some(x=>x[0]===old))out.value=old;
 $('rmRelConversation').hidden=!isConversation();
 $('rmRelFields').hidden=false;
}
function mount(){
 const panel=$('execAssignmentAction'),native=$('execAssignmentNotes'),save=$('execAssignmentSave'),nativeOutcome=$('execAssignmentOutcome');
 if(!panel||!native||!save||!nativeOutcome||panel.querySelector('#rmRelFields'))return;
 const title=(panel.querySelector('.execRow p')?.textContent||'').toLowerCase();
 // Transaction and non-relationship tasks keep their existing specialized workflow.
 if(/ctc|clear.to.close|new contract|under contract|tuesday|transaction|portfolio plan|growth plan/.test(title))return;
 const originalLabel=native.closest('label');if(originalLabel)originalLabel.classList.add('rmRelOriginalNotes');
 const oldOutcome=nativeOutcome.closest('label');if(oldOutcome)oldOutcome.style.display='none';
 const wrap=document.createElement('section');wrap.id='rmRelFields';
 wrap.innerHTML='<div class="rmRelGrid"><div class="rmRelField"><span class="rmRelLabel">Contact method</span><div class="rmRelChoices">'+['Call','Text','Meeting'].map((x,i)=>'<label><input type="radio" name="rmRelMethod" value="'+x+'" '+(!i?'checked':'')+'> '+x+'</label>').join('')+'</div></div><div class="rmRelField"><label class="rmRelLabel" for="rmRelOutcome">Actual outcome</label><select id="rmRelOutcome"></select></div></div>'+
 '<div id="rmRelConversation">'+
 '<div class="rmRelField"><span class="rmRelLabel">What did you talk about?</span>'+checklist('rmRelTopics',['Buyer activity','Market conditions','Listings','Upcoming business','Relationship check-in'])+'</div>'+
 '<div class="rmRelField"><span class="rmRelLabel">What did you ask for?</span>'+checklist('rmRelAsks',['Buyer lead / referral','Break Bread','Business planning','Team meeting','Agent introduction','Other opportunity'])+'</div>'+
 '<div class="rmRelField"><label class="rmRelLabel" for="rmRelAskResult">What was the result?</label>'+selection('rmRelAskResult',[['','Select result'],['Lead received','Lead received'],['Potential opportunity','Potential opportunity'],['Agreed — needs scheduling','Agreed — needs scheduling'],['Scheduled','Scheduled'],['Interested — follow up','Interested — follow up'],['Declined','Declined'],['Nothing available now','Nothing available right now']])+'</div>'+
 '<div class="rmRelField"><span class="rmRelLabel">How can we help?</span>'+checklist('rmRelSupport',['Financing help','Preapproval','Buyer strategy','Schedule meeting','No need identified'])+'</div>'+
 '<div class="rmRelField"><label class="rmRelLabel" for="rmRelSummary">What did you learn? Any opportunities?</label><textarea id="rmRelSummary" maxlength="500" placeholder="Buyer activity, what the agent shared, and any opportunity or next action..."></textarea></div>'+
 '</div>'+
 '<div class="rmRelField"><label class="rmRelLabel" for="rmRelNext">Next step</label>'+selection('rmRelNext',[['','Choose next step'],['Follow up with agent','Follow up with agent'],['Schedule meeting','Schedule meeting'],['Follow up on referral','Follow up on referral'],['No further action','No further action']])+'</div>'+
 '<p id="rmRelError" class="rmRelError" role="alert" hidden></p>';
 native.parentElement.before(wrap);
 wrap.querySelectorAll('input[name="rmRelMethod"]').forEach(e=>e.addEventListener('change',update));
 $('rmRelOutcome').addEventListener('change',update);update();
 const nativeFollow=$('execAssignmentFollowup');
 if(nativeFollow?.closest('label'))nativeFollow.closest('label').querySelector('input').setAttribute('aria-label','Next follow-up date');
 save.addEventListener('click',event=>{
  const val=$('rmRelOutcome')?.value||'',conversation=isConversation();
  const all=name=>[...wrap.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value);
  const topics=all('rmRelTopics'),asks=all('rmRelAsks'),support=all('rmRelSupport');
  const result=$('rmRelAskResult').value,summary=$('rmRelSummary').value.trim(),next=$('rmRelNext').value;
  const error=$('rmRelError');error.hidden=true;error.textContent='';
  // Never trap an assignment behind additional optional fields. Preserve missing
  // conversation details explicitly for director review instead of inventing an ask.
  const gaps=[];
  if(conversation&&!asks.length)gaps.push('opportunity request');
  if(conversation&&!result)gaps.push('request result');
  if(conversation&&!summary)gaps.push('conversation summary');
  if(next&&next!=='No further action'&&!nativeFollow?.value)gaps.push('follow-up date');
  if(gaps.length){error.textContent='Saved record will flag missing: '+gaps.join(', ')+'. Add these now for better coaching notes.';error.hidden=false;}
  const outcomeMap={'call-spoke':'Talked','call-vm':'Voicemail','call-no':'No answer','text-pending':'Text sent','text-reply':'Talked','text-ack':'Text sent','meeting-held':'Completed non-call task','meeting-missed':'No answer'};
  nativeOutcome.value=outcomeMap[val]||'No answer';
  const detail=[
   'Contact method: '+method(),
   'Actual outcome: '+$('rmRelOutcome').selectedOptions[0].textContent,
   ...(conversation?[
     'Discussed: '+(topics.join(', ')||'Not specified'),
     'Asked for: '+(asks.join(', ')||'Not documented'),
     'Opportunity result: '+(result||'Not documented'),
     'How we can help: '+(support.join(', ')||'Not specified'),
     'What we learned: '+(summary||'Not documented')
   ]:[]),
   'Next step: '+(next||'Not specified')
  ];
  native.value=detail.join(' | ');
 },true);
}
let queued=false;
function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
function start(){mount();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})}
})();


/* RM Account Executive approach: every agent conversation; no buyer data stored. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const style=document.createElement('style');style.textContent=String.raw\`
.rmAeReminder{border:1px solid #dfd6eb;border-left:3px solid #7651ae;background:#fbfafe;border-radius:11px;padding:12px 14px;margin:0 0 12px;color:#322b3d;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.rmAeReminder strong{font-weight:700}.rmAeReminder p{margin:3px 0 8px;color:#666075;font-size:12px}
.rmAeReminder details{margin-top:9px;border-top:1px solid #ebe5f1;padding-top:9px}
.rmAeReminder summary{cursor:pointer;color:#62448b;font-weight:700}
.rmAeReminder ol,.rmAeReminder ul{padding-left:20px;margin:8px 0}
.rmAeReminder li{margin:6px 0}.rmAeReminder label{display:block;margin:8px 0 4px;font-weight:650;font-size:12px}
.rmAeReminder select,.rmAeReminder textarea{width:100%;max-width:100%;box-sizing:border-box;background:white;border:1px solid #ddd4e7;border-radius:8px;padding:9px;color:#28232e;font:13px inherit}
.rmAeReminder textarea{min-height:60px;resize:vertical}.rmAeReminder .rmAeFine{font-size:11px;color:#6c6277}
@media(max-width:620px){.rmAeReminder{padding:11px;margin-bottom:10px}}
\`;document.head.appendChild(style);
const guide='<details><summary>Open Account Executive Guide</summary>'+
'<ol><li><b>Prepare:</b> Open the authorized pipeline separately. Review recent leads, pre-approvals and contracts, discussing each actual buyer individually with the agent. Do not enter buyer details here.</li>'+
'<li><b>Ask for feedback:</b> What did the agent hear from each buyer? How was LP communication and buyer experience? What could we improve? What is the next step?</li>'+
'<li><b>Find opportunities:</b> Any unhappy buyers or deals going sideways with another lender? Need a purchase-power review? Buyers unable to win offers (10 Ways to Win)? Need down-payment/closing-cost assistance (NFM FLEX if eligible)? Contingent buyers who may benefit from bridge/equity options? Financing is subject to qualification.</li>'+
'<li><b>Own the handoff:</b> Decide if Amanda can resolve it or needs the LP. If LP involvement is needed, confirm they received it and verify action taken.</li>'+
'<li><b>Close the gap:</b> Always circle back with the agent, confirm they understand and are satisfied; if unresolved, give a status update and keep the follow-up open.</li>'+
'<li><b>Document:</b> Save meaningful relationship notes, who owns the next action and when it is due. Never store buyer names or financial details in this tracker.</li></ol></details>';
function mount(){
 const log=$('view-log'),form=$('logNormalFields');if(form&&!$('rmAeLog')){
  const panel=document.createElement('section');panel.className='rmAeReminder';panel.id='rmAeLog';
  panel.innerHTML='<strong>Every agent conversation · Account Executive approach</strong><p>Before: review the pipeline. During: ask about each buyer and business opportunities. After: log what you learned and close the loop.</p>'+guide+
  '<label for="rmAeLearning">What did we learn or uncover? (agent-level information only)</label><textarea id="rmAeLearning" placeholder="Agent feedback, experience themes, opportunities; no buyer details"></textarea>'+
  '<label for="rmAeOwner">Follow-up needed?</label><select id="rmAeOwner"><option value="none">No follow-up needed</option><option value="rm">Amanda / RM follow-up</option><option value="lp">LP action needed, then agent update</option></select>'+
  '<div id="rmAeFollowFields" hidden><label for="rmAeNext">Action to take / agent update plan</label><textarea id="rmAeNext" placeholder="What needs doing, and when will you update the agent?"></textarea><p class="rmAeFine">Set the existing Follow-up date and Next Step Owner below. This remains open until LP action (if required) is verified AND the agent has been updated.</p></div>'+
  '<p class="rmAeFine">Quick guide only. Buyer-specific pipeline stays in its authorized system.</p>';
  form.prepend(panel);
  $('rmAeOwner').addEventListener('change',function(){const need=this.value!=='none';$('rmAeFollowFields').hidden=!need;if(need){const out=$('activityOutcome');if(out){out.value='Requires follow-up';out.dispatchEvent(new Event('change',{bubbles:true}))}const step=$('activityNextStepOwner');if(step&&this.value==='rm')step.value='Amanda';} });
 }
 const week=$('view-week');if(week&&!$('rmAeToday')){
  const panel=document.createElement('div');panel.id='rmAeToday';panel.className='rmAeReminder';
  panel.innerHTML='<strong>Every agent call: Account Executive approach</strong><p>Review their actual pipeline → discuss experience and opportunities → act → update the agent → document. Not just a general check-in.</p><button type="button" class="btn-sm" id="rmAeOpenLog">Open guide &amp; Log Activity</button>';
  const anchor=week.querySelector('.v95-amanda-greeting');if(anchor)anchor.after(panel);else week.prepend(panel);
  $('rmAeOpenLog').addEventListener('click',()=>{if(typeof window.switchTab==='function')window.switchTab('log');$('rmAeLog')?.scrollIntoView({block:'start',behavior:'smooth'})});
 }
}
function install(){
 mount();
 if(typeof window.logActivity==='function'&&!window.logActivity.__rmAeWrapped){
  const original=window.logActivity;
  const wrapped=async function(){
   const kind=$('rmAeOwner')?.value||'none',learning=($('rmAeLearning')?.value||'').trim(),next=($('rmAeNext')?.value||'').trim();
   if(kind!=='none'){
    if(!learning||!next){if(typeof window.toast==='function')window.toast('Record the relationship feedback and next step before saving.','error');return;}
    if(!$('followupDate')?.value){if(typeof window.toast==='function')window.toast('Set an agent follow-up date so the loop stays open.','error');return;}
    const o=$('activityOutcome');if(o&&o.value!=='Requires follow-up'){o.value='Requires follow-up';o.dispatchEvent(new Event('change',{bubbles:true}))}
    const owner=$('activityNextStepOwner');if(owner&&!owner.value){if(kind==='rm')owner.value='Amanda';else{if(typeof window.toast==='function')window.toast('Select the responsible LP as Next Step Owner.','error');return;}}
    if(kind==='lp'&&owner&&['Amanda','Nyny',''].includes(owner.value)){if(typeof window.toast==='function')window.toast('Choose the LP responsible for action. Amanda still owns the agent update.','error');return;}
   }
   const notes=$('activityNotes');let originalNotes=notes?.value||'';
   if(notes&&(learning||kind!=='none')){
    const extra=['AE Review: '+(learning||'No new issue documented')];
    if(kind!=='none')extra.push('AE FOLLOW-UP OPEN | '+(kind==='lp'?'LP action and verification needed; ':'RM action needed; ')+'Amanda to update agent and confirm satisfaction | Next: '+next);
    notes.value=[originalNotes,...extra].filter(Boolean).join('\n');
   }
   try{const result=await original.apply(this,arguments);return result}
   finally{if(notes&&notes.isConnected&&notes.value.includes('AE Review:'))notes.value=originalNotes;}
  };wrapped.__rmAeWrapped=true;window.logActivity=wrapped;
 }
 if(typeof window.confirmMarkHandled==='function'&&!window.confirmMarkHandled.__rmAeWrapped){
  const original=window.confirmMarkHandled;
  const wrapped=async function(id,agentName){
   const note=$('fu-handled-notes-'+id);const box=$('fu-'+id);
   const isAe=(box?.textContent||'').includes('AE FOLLOW-UP OPEN');
   if(isAe){
    if(!note||!/\bagent\b/i.test(note.value)||!/\b(updated|contacted|spoke|confirmed|followed up|reached)\b/i.test(note.value)){
      if(typeof window.toast==='function')window.toast('Before closing, document how the agent was updated and confirm the outcome.','error');return;
    }
   }
   return original.apply(this,arguments);
  };wrapped.__rmAeWrapped=true;window.confirmMarkHandled=wrapped;
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
