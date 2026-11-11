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
  let message='';
  if(conversation&&!asks.length)message='Select what you asked for, including a lead or meeting opportunity.';
  else if(conversation&&!result)message='Record what came of the opportunity request.';
  else if(conversation&&!summary)message='Add a brief note on what you learned or what the agent shared.';
  else if(next&&next!=='No further action'&&!nativeFollow?.value)message='Choose a follow-up date for this next step.';
  if(message){event.stopImmediatePropagation();event.preventDefault();error.textContent=message;error.hidden=false;error.scrollIntoView({block:'nearest'});return}
  const outcomeMap={'call-spoke':'Talked','call-vm':'Voicemail','call-no':'No answer','text-pending':'Text sent','text-reply':'Talked','text-ack':'Text sent','meeting-held':'Completed non-call task','meeting-missed':'No answer'};
  nativeOutcome.value=outcomeMap[val]||'No answer';
  const detail=[
   'Contact method: '+method(),
   'Actual outcome: '+$('rmRelOutcome').selectedOptions[0].textContent,
   ...(conversation?[
     'Discussed: '+(topics.join(', ')||'Not specified'),
     'Asked for: '+asks.join(', '),
     'Opportunity result: '+result,
     'How we can help: '+(support.join(', ')||'Not specified'),
     'What we learned: '+summary
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
