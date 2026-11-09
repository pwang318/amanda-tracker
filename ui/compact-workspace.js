(function(){
'use strict';
const css=document.createElement('style');
css.textContent=`
.rmRefinedWorkOrder{padding:16px 20px!important;border:1px solid #e8e1ef!important;border-radius:12px!important;background:#fff!important;box-shadow:none!important}
.rmRefinedWorkOrder h2{font-size:19px!important;line-height:1.25!important;margin:0 0 7px!important}
.rmRefinedWorkOrder h3,.rmRefinedWorkOrder h4{font-size:14px!important;line-height:1.3!important}
.rmRefinedWorkOrder p{font-size:12px!important;line-height:1.4!important;margin:3px 0!important}
.rmRefinedWorkOrder button,.rmRefinedWorkOrder a[class*="btn"],.rmRefinedWorkOrder [role="button"]{padding:7px 11px!important;min-height:0!important;min-width:0!important;font-size:11px!important;line-height:1.3!important;font-weight:650!important;border-radius:7px!important;box-shadow:none!important;transform:none!important;letter-spacing:normal!important}
.rmRefinedWorkOrder button,.rmRefinedWorkOrder a[class*="btn"]{background:#fff!important;border:1px solid #ded4ea!important;color:#57348b!important}
.rmRefinedWorkOrder button.rmRefinedPrimary{background:#57348b!important;border-color:#57348b!important;color:#fff!important}
.rmRefinedWorkOrder .rmRefinedRow{padding-top:9px!important;padding-bottom:9px!important;min-height:0!important;margin:0!important;box-shadow:none!important}
.rmRefinedWorkOrder .rmRefinedRow button{max-width:230px!important}
.rmRefinedWorkOrder button:hover,.rmRefinedWorkOrder a:hover{border-color:#57348b!important}
.rmRefinedWorkOrder button:focus-visible,.rmRefinedWorkOrder a:focus-visible{outline:2px solid #57348b!important;outline-offset:3px}
[data-director-only-warning="true"]{display:none!important}
@media(max-width:760px){.rmRefinedWorkOrder{padding:12px!important}.rmRefinedWorkOrder .rmRefinedRow{flex-wrap:wrap!important}.rmRefinedWorkOrder button{max-width:100%!important}}
`;document.head.append(css);
const warnings=/(shared power bi cannot be verified|shared data:\s*reconciliation required|only \d+ of \d+ agent profiles stamped|power bi import incomplete)/i;
function paint(){
 const headings=[...document.querySelectorAll('h1,h2,h3,h4')];
 const h=headings.find(x=>/today.s work order/i.test(x.textContent||''));
 if(h){
  let p=h;
  for(let i=0;i<7&&p.parentElement;i++){
   p=p.parentElement;
   const t=p.textContent||'';
   if(/urgent updates/i.test(t)&&/grow actual business/i.test(t)){p.classList.add('rmRefinedWorkOrder');break}
  }
  const panel=document.querySelector('.rmRefinedWorkOrder');
  if(panel){
   for(const b of panel.querySelectorAll('button'))if(/transaction calls|4-week campaign follow-ups|start prospecting block/i.test(b.textContent||''))b.classList.add('rmRefinedPrimary');
   for(const e of panel.querySelectorAll('section,article,div,li')){
    if(e===panel||e.querySelectorAll('button').length>3)continue;
    const t=(e.textContent||'').trim();
    if(t.length<1400 && /^(?:[1-5]\s*)?(?:urgent updates|follow-ups due today|protect c-agent relationships|daily prospecting|grow actual business)/i.test(t))e.classList.add('rmRefinedRow');
   }
  }
 }
 for(const e of document.querySelectorAll('body *')){
  if(e.children.length || !warnings.test(e.textContent||''))continue;
  let target=e;
  while(target.parentElement&&target.parentElement!==document.body){
   const p=target.parentElement;
   if(p.querySelectorAll('button,input,textarea').length>1||(p.textContent||'').length>700)break;
   target=p;if(p.matches('aside,section,[role="alert"]'))break;
  }
  if((target.textContent||'').length<700)target.setAttribute('data-director-only-warning','true');
 }
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;paint()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{paint();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true})});
else{paint();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true})}
})();