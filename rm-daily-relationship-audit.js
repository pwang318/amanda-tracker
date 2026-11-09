(function(){'use strict';
/* Relationship checks belong in the filtered Grow + Protect view, not as an all-roster daily demand. */
function removeLegacy(){
  for(const id of ['rmDailyRelationshipReview','rmDailyProspecting','rmDailyRelationshipAuditStyles','rmCompactWorkspaceStyles']){
    const el=document.getElementById(id);if(el)el.remove();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeLegacy);
else removeLegacy();
window.addEventListener('rm-growth-updated',removeLegacy);
})();