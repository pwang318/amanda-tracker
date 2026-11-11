/* Consistent visible Realtor name casing across RM views.
   Presentation only: never rewrite input values, data IDs, saved names or search keys. */
(function(){
'use strict';
const selector=[
 '.rmGrowAgentLink',
 '#rmInvitePlanner tbody td:first-child button',
 '.execWorkCardHeader b',
 '.execEodTask b',
 '.execManagerTask > strong',
 '.rm-v312-name',
 '.contact-name',
 '.rmGrowAgentName'
].join(',');
function displayName(value){
 return String(value||'').split(/(\s+|-|')/).map(part=>{
  if(!part||/^\s+$/.test(part)||part==='-'||part==="'")return part;
  if(/^(II|III|IV)$/i.test(part))return part.toUpperCase();
  if(/^(Jr\.?|Sr\.?)$/i.test(part))return part[0].toUpperCase()+part.slice(1).toLowerCase();
  if(part===part.toUpperCase()||part===part.toLowerCase()){
   const x=part.toLocaleLowerCase('en-US');return x[0].toLocaleUpperCase('en-US')+x.slice(1);
  }
  return part;
 }).join('');
}
function updateLabel(el){
 if(el.closest('input,textarea,select,[contenteditable="true"]'))return;
 const node=Array.from(el.childNodes).find(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim());
 if(!node)return;
 const original=node.nodeValue;
 const pieces=original.split(' · ');
 const revised=displayName(pieces[0])+(pieces.length>1?' · '+pieces.slice(1).join(' · '):'');
 if(original!==revised)node.nodeValue=revised;
}
let queued=false;
function sync(){
 queued=false;
 document.querySelectorAll(selector).forEach(updateLabel);
}
function request(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(sync);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
 request();new MutationObserver(request).observe(document.body,{childList:true,subtree:true});
});else{
 request();new MutationObserver(request).observe(document.body,{childList:true,subtree:true});
}
window.addEventListener('rm-growth-updated',request);
window.addEventListener('rm-work-queue-changed',request);
})();
