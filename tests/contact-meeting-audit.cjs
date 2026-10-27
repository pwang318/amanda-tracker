(function(){
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
function block(a,b){return html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));}
const profiles=[{agent_name:'Sample Canonical',display_name:'Sample Corrected'},{agent_name:'Example Person One'},{agent_name:'Example Person Two'}];
const ctx={sbFetch:async path=>{let m=path.match(/(?:agent_name|display_name)=ilike\.([^&]+)/);return m?profiles.filter(p=>String(p[path.includes('display_name=ilike')?'display_name':'agent_name']||'').toLowerCase()===decodeURIComponent(m[1]).toLowerCase()):[];}};
vm.createContext(ctx);vm.runInContext(block('async function findAgentProfileByName','function openAddAgentModal'),ctx);
vm.runInContext(block('function splitAddress','function applyAddressToFields'),ctx);
vm.runInContext(block('function isValidBirthdayFormat','function normalizeBirthdayForImport'),ctx);
(async()=>{let fails=0;for(const [name,test] of [
 ['corrected name resolves existing profile',async()=>assert.equal((await ctx.findAgentProfileByName('Sample Corrected')).exact?.agent_name,'Sample Canonical')],
 ['distinct example profiles remain distinct',async()=>assert.equal((await ctx.findAgentProfileByName('Example Person One')).exact.agent_name,'Example Person One')],
 ['invalid calendar birthday rejected',()=>assert.equal(ctx.isValidBirthdayFormat('02/31'),false)],
 ['leap birthday accepted',()=>assert.equal(ctx.isValidBirthdayFormat('02/29'),true)],
 ['ZIP without state round trips',()=>assert.equal(ctx.splitAddress('100 Example Road, Sample City, 12345').zip,'12345')]
 ]){try{await test();console.log('PASS',name)}catch(e){fails++;console.error('FAIL',name,e.message)}}process.exitCode=fails?1:0;})();

})();
(function(){
const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync(process.env.TRACKER_SOURCE||__dirname+'/../index.html','utf8');
const code=html.slice(html.indexOf('async function logActivity(){'),html.indexOf('async function loadFollowups(){'));
async function run(failAfterSave){
const els=new Proxy({}, {get:(o,k)=>o[k]||(o[k]={value:'',checked:false,disabled:false,classList:{remove(){}},style:{}})});
Object.assign(els.agentInput,{value:'Sample Corrected'});els.activityType.value='Cold Calls';els.activityDate.value='2026-10-27';els.activityOutcome.value='Positive';els.activityNotes.value='Spoke about next steps.';els.activityRmAmanda.checked=true;
let writes=[],queued=0,messages=[];
const c={document:{getElementById:id=>els[id]},window:{},console:{error(){},warn(){}},DIRECTOR_LEADERSHIP_TYPES:[],NOTES_REQUIRED_TYPES:[],NOTES_MANDATORY_NO_MIN:[],MIN_NOTE_WORDS:3,
clearLogErrorBanner(){},countWords:s=>String(s).split(' ').length,toast:m=>messages.push(m),wp37GatePartnerTouch:async()=>true,appendRmMeta:s=>s,
findAgentProfileByName:async()=>({exact:{agent_name:'Sample Canonical'}}),sbFetch:async(p,o)=>{if(o){writes.push(JSON.parse(o.body));return[{id:1}]}return[]},
clearOldFollowups:async()=>{},completeActiveFlagAfterActivity:async()=>{if(failAfterSave)throw new Error('network refresh')},rmSmartUpdateNurtureCadence:async()=>{},isNetworkFailure:()=>true,queueOffline:()=>queued++,today:()=> '2026-10-27',syncActivityParticipants(){},updateActivityRelationshipOwnerHint(){},updateNotesRequirementHint(){},vibrateSaved(){},resetIntakeChecklist(){},applyLockState(){},initAutocomplete(){},rmRefreshAfterMutation:async()=>{},openIntake:null};
vm.createContext(c);vm.runInContext(code,c);await c.logActivity();return{writes,queued,messages};}
(async()=>{const r=await run(true);assert.equal(r.writes[0].agent_name,'Sample Canonical');assert.equal(r.queued,0,'saved activity must not be queued again');assert(r.messages.some(m=>m.startsWith('Activity saved.')));console.log('PASS canonical activity name and post-save failure does not duplicate');})();

})();
(function(){
const fs=require('fs'),vm=require('vm'),assert=require('assert');const h=fs.readFileSync(__dirname+'/../index.html','utf8');const src=h.slice(h.indexOf('let growthContainerVersion=0;'),h.indexOf('async function loadContactDataQuality'));
let el={innerHTML:''};const rows=[{agent_name:'__roster_delete_v42__',tier:'C',closes_past_year:1},{agent_name:'Real Agent',tier:'C',closes_past_year:1},{agent_name:'Real Agent',tier:'C',closes_past_year:1},{agent_name:'Hidden Agent',display_name:'__HIDDEN__',tier:'C',closes_past_year:1}];
const c={document:{getElementById:()=>el},sbFetch:async()=>rows,rm470LoadAllProfiles:async()=>rows,properCase:x=>x,escHtml:x=>x,console};vm.createContext(c);vm.runInContext(src,c);(async()=>{await c.loadAgentGrowth();assert(!el.innerHTML.includes('__roster'));assert(!el.innerHTML.includes('Hidden Agent'));assert.equal((el.innerHTML.match(/Real Agent/g)||[]).length,1);console.log('PASS growth excludes hidden/system rows and repeated profiles');})();

})();
(function(){
const fs=require('fs'),vm=require('vm'),assert=require('assert');const h=fs.readFileSync(__dirname+'/../index.html','utf8');const a=h.indexOf('window.rm470StartMeeting=function');const code=h.slice(a,h.indexOf(' function exportRows',a));
let switched=0;const elements={agentInput:{value:'Other Agent',dispatchEvent(){}},activityType:{value:'Cold Calls',dispatchEvent(){}},activityNotes:{value:'Private notes for Other Agent'},activityOutcome:{value:'Positive'},followupDate:{value:'2026-10-28'},activityDate:{value:'2026-10-26'}};
const c={window:{},$:id=>elements[id],switchTab:()=>switched++,Event:function(){},toast(){},confirm:()=>false,today:()=> '2026-10-27',resetIntakeChecklist(){}};vm.createContext(c);vm.runInContext(code,c);c.window.rm470StartMeeting('New Agent');assert.equal(elements.agentInput.value,'Other Agent');assert.equal(switched,0);c.confirm=()=>true;c.window.rm470StartMeeting('New Agent');assert.equal(elements.activityNotes.value,'');assert.equal(elements.followupDate.value,'');assert.equal(elements.activityType.value,'New Realtor Meeting');console.log('PASS meeting launch protects draft and clears other-agent details only after confirmation');

})();