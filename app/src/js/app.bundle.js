/* js/00-core-main.js */
function coJoin(c){return c&&c.join?c.join(", "):(c||"");}

const statuses=['To Do','In Progress','Review','Revision','Approval','Ready to Publish','Completed','On Hold'];const statusLabel={'To Do':'รอดำเนินการ','In Progress':'กำลังดำเนินการ','Review':'รอตรวจงาน','Revision':'แก้ไขงาน','Approval':'รออนุมัติ','Ready to Publish':'พร้อมเผยแพร่','Completed':'เสร็จสิ้น','On Hold':'พักงานชั่วคราว'};const statusClass={'To Do':'s-todo','In Progress':'s-progress','Review':'s-review','Revision':'s-revision','Approval':'s-approval','Ready to Publish':'s-ready','Completed':'s-done','On Hold':'s-hold'};let people=['Gift','Mint','Beam','Ploy','Nok'];const projects=['7Market September','Store Communication','ALL ONLINE Campaign','Team Operations'];const weights={Copy:1,Infographic:2,Presentation:2,Video:4,Event:5};const iso=(d)=>{let a=new Date();a.setDate(a.getDate()+d);return a.toISOString().slice(0,10)};const initial=[{id:101,title:'Infographic โปรโมชัน 9.9',project:projects[0],comm:'External',kind:'Infographic',priority:'High',lead:'Mint',support:'Beam',checker:'Ploy',approver:'Gift',due:iso(-1),status:'Review',brief:'สรุปโปรโมชันให้เข้าใจใน 3 วินาที',modes:{}},{id:102,title:'VDO แนะนำ Store Connect Live',project:projects[1],comm:'Internal',kind:'Video',priority:'High',lead:'Beam',support:'Mint',checker:'Nok',approver:'Gift',due:iso(2),status:'In Progress',brief:'คู่มือรับชมสำหรับร้าน',modes:{}},{id:103,title:'สคริปต์ 7Market On The Go',project:projects[0],comm:'External',kind:'Copy',priority:'Normal',lead:'Gift',support:'',checker:'Ploy',approver:'Nok',due:iso(3),status:'To Do',brief:'เปิดรายการและช่วงนาทีทอง',modes:{}},{id:104,title:'Presentation Blueprint Display',project:projects[1],comm:'Internal',kind:'Presentation',priority:'High',lead:'Ploy',support:'Gift',checker:'Nok',approver:'Gift',due:iso(1),status:'Approval',brief:'สรุปจุดติดตั้งและมาตรฐานสื่อ',modes:{}},{id:105,title:'โพสต์ ALL ONLINE 9.9',project:projects[2],comm:'External',kind:'Copy',priority:'Normal',lead:'Nok',support:'',checker:'Ploy',approver:'Gift',due:iso(-2),status:'Completed',brief:'แคปชั่นและ CTA',completed:iso(-2),modes:{}},{id:106,title:'Infographic ขั้นตอนการติดตั้งสื่อ',project:projects[1],comm:'Internal',kind:'Infographic',priority:'Urgent',lead:'Mint',support:'Ploy',checker:'Nok',approver:'Gift',due:iso(0),status:'Revision',brief:'3 ขั้นตอน มาตรฐาน จุดติดตั้ง วิธีติดตั้ง',modes:{}},{id:107,title:'Concept งานสื่อสารพนักงาน',project:projects[3],comm:'Internal',kind:'Event',priority:'Normal',lead:'Beam',support:'Nok',checker:'Ploy',approver:'Gift',due:iso(7),status:'To Do',brief:'เสนอแนวคิดกิจกรรมภายใน',modes:{}},{id:108,title:'Banner แคมเปญออนไลน์',project:projects[2],comm:'External',kind:'Infographic',priority:'Normal',lead:'Ploy',support:'',checker:'Nok',approver:'Gift',due:iso(4),status:'Ready to Publish',brief:'สื่อสำหรับช่องทางออนไลน์',modes:{}}];let tasks;try{tasks=JSON.parse(localStorage.getItem('worktracker-tasks-v1'))||structuredClone(initial)}catch{tasks=structuredClone(initial)}for(const t of tasks){if(t.publish===undefined&&t.id>=101&&t.id<=108)t.publish=t.due}let calendarDate=new Date();calendarDate.setDate(1);let boardCalendarDate=new Date();boardCalendarDate.setDate(1);var boardCalSelected="",boardCalScope=[],dashCalSelected="",dashCalScope=[];let editing=null,wasDragging=false;var projCommFilter="";var statusRange="all";var statusDateField="publish";const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let __taskBase={};let __tasksRev=(window.__WT_STATE__&&+window.__WT_STATE__['worktracker-tasks-rev'])||0;function __snapBase(){__taskBase={};for(const t of tasks)__taskBase[String(t.id)]=JSON.stringify(t);}function __taskDiff(){var up=[],del=[],cur={};for(const t of tasks){cur[String(t.id)]=1;if(__taskBase[String(t.id)]!==JSON.stringify(t))up.push(t);}for(var k in __taskBase){if(!cur[k])del.push(/^\d+$/.test(k)?+k:k);}return{up:up,del:del};}function __applyServerTasks(list,rev){if(Array.isArray(list)){tasks=list;__tasksRev=rev;__snapBase();if(typeof render==='function')render();if(window.cpSyncLinked){try{window.cpSyncLinked();}catch(e){}}}}const persist=()=>{var df=__taskDiff();if(!df.up.length&&!df.del.length)return;fetch('/api/tasks/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({upserts:df.up,deletes:df.del})}).then(function(r){return r.json();}).then(function(res){if(res&&res.ok)__applyServerTasks(res.tasks,res.rev);}).catch(function(){});};function __taskPoll(){if(document.hidden)return;if(document.querySelector('#modalbg.open'))return;if(document.querySelector('.dragging'))return;var df=__taskDiff();if(df.up.length||df.del.length){persist();return;}fetch('/api/tasks?rev='+__tasksRev).then(function(r){return r.json();}).then(function(res){if(res&&res.ok&&res.changed)__applyServerTasks(res.tasks,res.rev);}).catch(function(){});}__snapBase();setInterval(__taskPoll,8000);const ownedBy=(t,p)=>t.lead===p||t.support.split(',').map(x=>x.trim()).includes(p);const filteredTasks=()=>{let p=$('#personFilter').value;return p?tasks.filter(t=>ownedBy(t,p)):tasks};const pill=s=>`<span class="pill ${statusClass[s]||'s-todo'}">${esc(statusLabel[s]||s)}</span>`;const isLate=t=>t.status!=='Completed'&&t.due<iso(0);function notify(s){let x=$('#toast');x.textContent=s;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2600)}function navigate(page){document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id===page));document.querySelectorAll('.nav').forEach(e=>e.classList.toggle('active',e.dataset.page===page));$('#crumb').textContent=({dashboard:'ภาพรวมงาน',board:'กระดานงาน',projects:'โปรเจกต์และทีม',workflow:'ขั้นตอนงานและ AI',automation:'รายงานและวิเคราะห์',permissions:'สิทธิ์ทีม',library:'คลังข้อมูล',deptstats:'สถิติหน่วยงาน',workload:'Workload & Capacity Workspace',masterdata:'จัดการดรอปดาวน์',commplan:'Communication Plan',specialorder:'บันทึกแผนการสั่งออเดอร์พิเศษ',teamleave:'ปฏิทินวันลาทีม'})[page];if(page==='masterdata'&&window.renderMD)window.renderMD();if(page==='commplan'&&window.renderCP)window.renderCP();if(page==='specialorder'&&window.renderSO)window.renderSO();if(page==='teamleave'&&window.renderLeave)window.renderLeave();window.scrollTo(0,0)}document.querySelectorAll('.nav').forEach(e=>e.onclick=()=>navigate(e.dataset.page));function renderCalendar(scope){dashCalScope=scope;const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1),offset=first.getDay(),days=new Date(y,m+1,0).getDate(),cells=Math.ceil((offset+days)/7)*7;$('#calMonth').textContent=new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(first);let labels=['อา','จ','อ','พ','พฤ','ศ','ส'];let html=labels.map(d=>`<div class="calweekday">${d}</div>`).join('');for(let i=0;i<cells;i++){let date=new Date(y,m,1+i-offset),key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,items=scope.filter(t=>{var _b=(window.__calBasis||'publish');var _dv=(_b==='due'?t.due:t.publish);return _dv===key&&(!window.__calComm||t.comm===window.__calComm);});const CALMAX=4;html+=`<div class="calday ${date.getMonth()===m?'':'other'} ${key===iso(0)?'today':''} ${items.length?'':'empty'}${key===dashCalSelected?' selected':''}" data-drop-date="${key}" data-cal-day="${key}"><span class="calnum">${date.getDate()}</span>${items.slice(0,CALMAX).map(t=>`<button class="calevent ${t.comm==='External'?'external':''}" data-task="${t.id}" draggable="true" title="${esc(t.title)}"><span>${esc(t.title)}</span></button>`).join('')}${items.length>CALMAX?`<button type="button" class="calmore" data-cal-day="${key}">+${items.length-CALMAX} รายการ</button>`:''}</div>`}$('#calendar').innerHTML=html}function renderBoardCalendar(scope){boardCalScope=scope;var _bb=(window.__bcalBasis||'publish'),_bc=(window.__bcalComm||'');var S2=scope.filter(function(t){return (!_bc||t.comm===_bc);});function _bd(t){return _bb==='due'?t.due:t.publish;}const y=boardCalendarDate.getFullYear(),m=boardCalendarDate.getMonth(),first=new Date(y,m,1),offset=first.getDay(),days=new Date(y,m+1,0).getDate(),cells=Math.ceil((offset+days)/7)*7;$('#boardCalMonth').textContent=new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(first);let count=S2.filter(t=>_bd(t)&&_bd(t).slice(0,7)===`${y}-${String(m+1).padStart(2,'0')}`).length;$('#boardCalendarSummary').textContent=`เดือนนี้มี ${count} งานที่กำหนดวันส่งออก · ${S2.filter(t=>!_bd(t)).length} งานยังไม่ระบุวัน`;let html=['อา','จ','อ','พ','พฤ','ศ','ส'].map(d=>`<div class="calweekday">${d}</div>`).join('');for(let i=0;i<cells;i++){let date=new Date(y,m,1+i-offset),key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,items=S2.filter(t=>_bd(t)===key);const CALMAX=4;html+=`<div class="calday ${date.getMonth()===m?'':'other'} ${key===iso(0)?'today':''} ${items.length?'':'empty'}${key===boardCalSelected?' selected':''}" data-drop-date="${key}" data-cal-day="${key}"><span class="calnum">${date.getDate()}</span>${items.slice(0,CALMAX).map(t=>`<button class="calevent ${t.comm==='External'?'external':''}" data-task="${t.id}" draggable="true" title="${esc(t.title)}"><span>${esc(t.title)}</span></button>`).join('')}${items.length>CALMAX?`<button type="button" class="calmore" data-cal-day="${key}">+${items.length-CALMAX} รายการ</button>`:''}</div>`}$('#boardCalendar').innerHTML=html}function wtTaskDate(t){var f=(typeof statusDateField!=='undefined'&&statusDateField)?statusDateField:'publish';return t[f]||t.publish||t.due||t.completed||'';}function filterByRange(arr,range){if(!range||range==='all')return arr;var now=new Date(),Y=now.getFullYear(),M=now.getMonth(),today=iso(0);var mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));mon.setHours(0,0,0,0);var sun=new Date(mon);sun.setDate(mon.getDate()+7);return arr.filter(function(t){var ds=wtTaskDate(t);if(!ds)return false;var dt=new Date(ds);if(isNaN(dt.getTime()))return false;if(range==='day')return ds===today;if(range==='year')return dt.getFullYear()===Y;if(range==='month')return dt.getFullYear()===Y&&dt.getMonth()===M;if(range==='week')return dt>=mon&&dt<sun;return true;});}function recordStatusSnapshot(){try{var hist=JSON.parse(localStorage.getItem('worktracker-status-history-v1')||'{}');var today=iso(0);var counts={};statuses.forEach(function(s){counts[s]=tasks.filter(function(t){return t.status===s;}).length;});hist[today]={counts:counts,total:tasks.length,at:new Date().toISOString()};var ks=Object.keys(hist).sort();if(ks.length>400)ks.slice(0,ks.length-400).forEach(function(k){delete hist[k];});localStorage.setItem('worktracker-status-history-v1',JSON.stringify(hist));}catch(e){}}function historyDays(){try{return Object.keys(JSON.parse(localStorage.getItem('worktracker-status-history-v1')||'{}')).length;}catch(e){return 0;}}function wtRenderTP(S,tblId,metaId){var tv=S.view||'overview';var td=S.date||'';var gr=S.gran||'all';var _cs=S.start||'',_ce=S.end||'';var MF=(S.members&&S.members.length)?S.members.slice():[];function inMF(pp){return !MF.length||MF.indexOf(pp)>=0;}var orient=S.orient||'h';function _ip(dv){if(!dv)return false;if(gr==='day')return dv===td;if(gr==='month')return (''+dv).slice(0,7)===td.slice(0,7);if(gr==='year')return (''+dv).slice(0,4)===td.slice(0,4);return true;}function _ir(dv){if(!dv)return false;dv=''+dv;if(_cs&&dv<_cs)return false;if(_ce&&dv>_ce)return false;return true;}function md(t){if(gr==='custom'){if(!_cs&&!_ce)return true;return _ir(t.publish)||_ir(t.due);}if(gr==='all'||!td)return true;return _ip(t.publish)||_ip(t.due);}var head,body;var loads={};people.forEach(function(pp){loads[pp]=tasks.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold'&&t.lead===pp;}).reduce(function(n,t){return n+(weights[t.kind]||1);},0);});if(tv==='media'){var SEC=[{g:'1. บันทึก',subs:['สื่อสารทั่วไป','BlankForm']},{g:'2. Infographic',subs:['มีPattern(บันทึก)','New Design','กระบวนการละเอียด']},{g:'3. VDO',subs:['Short Clip','Long Clip','ข้อมูลซับซ้อน','Editing']},{g:'4. Checker · ผู้ตรวจ/อนุมัติสื่อ',subs:['บันทึก','Infographic','VDO']},{g:'5. ผู้ตรวจ/อนุมัติ(เผยแพร่)',subs:['(รวม)']}];var GC=['mx-g1','mx-g2','mx-g1','mx-g2','mx-g1'];var mIdx={'บันทึก':0,'Infographic':1,'VDO':2};var mf=MF;var mems=people.filter(function(p){return !mf.length||mf.indexOf(p)>=0;});function cnt(pp){var g=[[0,0],[0,0,0],[0,0,0,0],[0,0,0],[0]];tasks.forEach(function(t){if(!md(t))return;if(t.types&&t.types.length){t.types.forEach(function(x){if(!x||x.owner!==pp)return;var si=mIdx[x.type];if(si==null)return;var di=SEC[si].subs.indexOf(x.detail||'');if(di>=0)g[si][di]++;});}if(t.checker===pp){var arr=(t.types&&t.types.length)?t.types.map(function(x){return x&&x.type;}).filter(Boolean):([{Copy:'บันทึก',Infographic:'Infographic',Video:'VDO'}[t.kind]].filter(Boolean));var seen={};arr.forEach(function(mt){if(!mt||seen[mt])return;seen[mt]=1;var di=SEC[3].subs.indexOf(mt);if(di>=0)g[3][di]++;});}if(t.approver===pp)g[4][0]++;});return g;}var data={},tot={};mems.forEach(function(pp){var gg=cnt(pp);data[pp]=gg;var s=0;gg.forEach(function(a){a.forEach(function(v){s+=v;});});tot[pp]=s;});var shown=mems.filter(function(pp){return tot[pp]>0;});var maxc=0;shown.forEach(function(pp){data[pp].forEach(function(a){a.forEach(function(v){if(v>maxc)maxc=v;});});});var bg=function(v){if(!v)return '';var a=maxc?(0.12+0.55*v/maxc):0;return ' style="background:rgba(23,102,204,'+a.toFixed(2)+');color:'+(a>0.42?'#fff':'#13233a')+';text-align:center;font-weight:600"';};if(orient==='v'){head='<thead><tr><th colspan="2" class="mx-g mx-g1">ประเภท / รายละเอียด</th>'+shown.map(function(pp){return '<th class="mx-sub">'+esc(pp)+'</th>';}).join('')+'</tr></thead>';var rr='';SEC.forEach(function(s,si){s.subs.forEach(function(sb,di){rr+='<tr>';if(di===0)rr+='<td rowspan="'+s.subs.length+'" class="mx-g '+GC[si]+'">'+esc(s.g)+'</td>';rr+='<td class="mx-sub" style="text-align:left">'+esc(sb)+'</td>'+shown.map(function(pp){var v=data[pp][si][di];return '<td'+bg(v)+'>'+(v||'')+'</td>';}).join('')+'</tr>';});});body=rr;}else{var h1='<th rowspan="2" class="mx-mem">Team Member</th>',h2='';SEC.forEach(function(s,si){h1+='<th colspan="'+s.subs.length+'" class="mx-g '+GC[si]+'">'+esc(s.g)+'</th>';s.subs.forEach(function(sb){h2+='<th class="mx-sub">'+esc(sb)+'</th>';});});head='<thead><tr>'+h1+'</tr><tr>'+h2+'</tr></thead>';body=shown.map(function(pp){var cells='';SEC.forEach(function(s,si){s.subs.forEach(function(sb,di){var v=data[pp][si][di];cells+='<td'+bg(v)+'>'+(v||'')+'</td>';});});return '<tr><td class="mx-mem"><span class="avatar">'+esc(pp.slice(0,2).toUpperCase())+'</span> &nbsp; '+esc(pp)+'</td>'+cells+'</tr>';}).join('');}}else if(tv==='review'){head='<thead><tr><th>สมาชิก</th><th>Checker · ผู้ตรวจ/อนุมัติ</th><th>ผู้ตรวจ/อนุมัติ(เผยแพร่)</th></tr></thead>';body=people.filter(inMF).map(function(pp){var nc=tasks.filter(function(t){return md(t)&&t.checker===pp;}).length;var na=tasks.filter(function(t){return md(t)&&t.approver===pp;}).length;if((nc+na)<=0)return '';return '<tr><td><span class="avatar">'+esc(pp.slice(0,2).toUpperCase())+'</span> &nbsp; '+esc(pp)+'</td><td><b>'+nc+'</b></td><td><b>'+na+'</b></td></tr>';}).join('');}else{var shO=people.filter(inMF).filter(function(pp){return tasks.filter(function(t){return t.lead===pp&&md(t);}).length>0;});function mvO(pp){var a=tasks.filter(function(t){return t.lead===pp&&md(t);});return {o:a.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold';}).length,d:a.filter(function(t){return t.status==='Completed';}).length,l:loads[pp],c:Math.round(loads[pp]/12*100)+'%'};}var MET=[['งานที่กำลังเปิด','o'],['งานเสร็จ','d'],['คะแนน Workload','l'],['Capacity','c']];if(orient==='v'){head='<thead><tr><th class="mx-mem">ตัวชี้วัด</th>'+shO.map(function(pp){return '<th>'+esc(pp)+'</th>';}).join('')+'</tr></thead>';body=MET.map(function(m){return '<tr><td class="mx-mem">'+m[0]+'</td>'+shO.map(function(pp){return '<td style="text-align:center">'+mvO(pp)[m[1]]+'</td>';}).join('')+'</tr>';}).join('');}else{head='<thead><tr><th>สมาชิก</th><th>งานที่กำลังเปิด</th><th>งานเสร็จ</th><th>คะแนน Workload</th><th>Capacity</th></tr></thead>';body=shO.map(function(pp){var v=mvO(pp);return '<tr><td><span class="avatar">'+esc(pp.slice(0,2).toUpperCase())+'</span> &nbsp; '+esc(pp)+'</td><td>'+v.o+'</td><td>'+v.d+'</td><td>'+v.l+'</td><td>'+v.c+'</td></tr>';}).join('');}}if(body.indexOf('<tr')<0)body='<tr><td class="empty" colspan="7">ไม่มีผู้ที่มี Action ในมุมมอง/ช่วงเวลานี้</td></tr>';var tbl=document.getElementById(tblId);if(tbl){tbl.className='table'+(tv==='media'?' mx':'');tbl.innerHTML=head+'<tbody>'+body+'</tbody>';}var meta=document.getElementById(metaId);if(meta)meta.textContent=(tv==='media'?('Matrix (Header 2 ชั้น) · '+(orient==='v'?'แนวตั้ง':'แนวนอน')):tv==='review'?'จำนวนงานที่แต่ละคนเป็น Checker · ผู้ตรวจ/อนุมัติ และ ผู้ตรวจ/อนุมัติ(เผยแพร่) — แยกคอลัมน์':'ภาพรวมภาระงานรายคน')+(MF.length?(' · เฉพาะ '+MF.join(', ')):'')+((gr==='custom')?((_cs||_ce)?(' · ช่วง '+(_cs||'…')+' ถึง '+(_ce||'…')):' · ทุกช่วงเวลา'):((gr!=='all'&&td)?(' · '+({day:'เฉพาะวันที่ ',month:'เฉพาะเดือน ',year:'เฉพาะปี '}[gr])+(gr==='day'?td:gr==='month'?td.slice(0,7):td.slice(0,4))):' · ทุกช่วงเวลา'));}window.wtRenderTP=wtRenderTP;function renderTaskTrash(){var el=$("#taskTrashBar");if(!el)return;var d=[];try{d=JSON.parse(localStorage.getItem("worktracker-tasks-deleted-v1")||"[]");if(!Array.isArray(d))d=[];}catch(e){}el.innerHTML=d.length?('<div class="tiny muted" style="margin-bottom:6px">\ud83d\uddd1 งานที่ลบ ('+d.length+') · กด กู้คืน เพื่อนำกลับ</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+d.map(function(t){return '<span class="pill" style="display:inline-flex;align-items:center;gap:8px;background:#eef2f7;color:#475569">'+esc(t.title||("#"+t.id))+' <button type="button" class="taskrestore" data-id="'+t.id+'" title="กู้คืน" style="border:0;background:none;color:#1766cc;cursor:pointer;font-weight:600;padding:0">\u21a9 กู้คืน</button> <button type="button" class="taskpurge" data-id="'+t.id+'" title="ลบถาวร" style="border:0;background:none;color:#c0392b;cursor:pointer;padding:0">\u2715</button></span>';}).join("")+'</div>'):"";el.querySelectorAll(".taskrestore").forEach(function(btn){btn.onclick=function(){restoreTask(+btn.dataset.id);};});el.querySelectorAll(".taskpurge").forEach(function(btn){btn.onclick=function(){purgeTask(+btn.dataset.id);};});}function restoreTask(id){var d=[];try{d=JSON.parse(localStorage.getItem("worktracker-tasks-deleted-v1")||"[]");}catch(e){}var idx=-1;for(var k=0;k<d.length;k++){if(d[k].id===id){idx=k;break;}}if(idx<0)return;var t=d[idx];d.splice(idx,1);try{localStorage.setItem("worktracker-tasks-deleted-v1",JSON.stringify(d));}catch(e){}if(!tasks.find(function(x){return x.id===t.id;}))tasks.push(t);if(t.commId&&window.CPall&&window.CPsave){var _cp=window.CPall(),_c=false;_cp.forEach(function(r){if(r.cid===t.commId){r.taskId=t.id;_c=true;}});if(_c){window.CPsave(_cp);if(window.renderCP)window.renderCP();}}if(typeof persist==="function")persist();if(typeof render==="function")render();if(typeof notify==="function")notify("กู้คืนงานแล้ว");}function purgeTask(id){var d=[];try{d=JSON.parse(localStorage.getItem("worktracker-tasks-deleted-v1")||"[]");}catch(e){}d=d.filter(function(x){return x.id!==id;});try{localStorage.setItem("worktracker-tasks-deleted-v1",JSON.stringify(d));}catch(e){}renderTaskTrash();if(typeof notify==="function")notify("ลบถาวรแล้ว");}function delTask(id){var t=tasks.find(function(x){return x.id===id;});if(!t)return;if(!window.confirm("ลบงาน “"+(t.title||("#"+id))+"” ?\nกู้คืนได้ภายหลังที่แถบ “งานที่ลบ”"))return;try{var _del=JSON.parse(localStorage.getItem("worktracker-tasks-deleted-v1")||"[]");if(!Array.isArray(_del))_del=[];_del=_del.filter(function(x){return x.id!==id;});var _cpy=JSON.parse(JSON.stringify(t));_cpy._delAt=new Date().toISOString();_del.unshift(_cpy);localStorage.setItem("worktracker-tasks-deleted-v1",JSON.stringify(_del.slice(0,50)));}catch(e){}tasks=tasks.filter(function(x){return x.id!==id;});if(typeof persist==="function")persist();if(window.CPall&&window.CPsave){var _cp=window.CPall(),_c2=false;_cp.forEach(function(r){if(r.taskId===id){r.taskId=null;_c2=true;}});if(_c2){window.CPsave(_cp);if(window.renderCP)window.renderCP();}}if(typeof render==="function")render();if(typeof notify==="function")notify("ลบงานแล้ว · กู้คืนได้");}function setupMemberMS(prefix,stateKey){
 if(!window._msCss){window._msCss=1;document.head.insertAdjacentHTML('beforeend','<style>.ms-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#fff;border:1px solid #d7e0ea;border-radius:10px;box-shadow:0 8px 24px #1936291f;padding:6px;min-width:160px;max-height:280px;overflow:auto}.ms-opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap}.ms-opt input[type=checkbox]{width:16px;height:16px;flex:none;padding:0;margin:0;border:0;accent-color:#1766cc;cursor:pointer}.ms-opt:hover{background:#f4f8ff}.ms-btn{cursor:pointer;background:#fff;text-align:left}</style>');}
 var btn=document.getElementById(prefix+'Btn'),pop=document.getElementById(prefix+'Pop');if(!btn||!pop||btn._ms)return;btn._ms=1;
 if(!Array.isArray(window[stateKey]))window[stateKey]=[];
 var ppl=(typeof people!=='undefined'&&people)?people:[];
 function label(){var a=window[stateKey]||[];btn.textContent=(a.length?(a.length===1?a[0]:(a.length+' คน')):'ทุกคน')+' ▾';}
 function build(){var a=window[stateKey]||[];
  pop.innerHTML='<label class="ms-opt"><input type="checkbox" class="ms-all" '+(a.length?'':'checked')+'> ทุกคน</label>'+ppl.map(function(p){return '<label class="ms-opt"><input type="checkbox" class="ms-one" value="'+p+'" '+(a.indexOf(p)>=0?'checked':'')+'> '+p+'</label>';}).join('');
  pop.querySelector('.ms-all').onchange=function(){window[stateKey]=[];build();label();if(typeof render==='function')render();};
  [].forEach.call(pop.querySelectorAll('.ms-one'),function(c){c.onchange=function(){var a=(window[stateKey]||[]).slice();if(c.checked){if(a.indexOf(c.value)<0)a.push(c.value);}else{a=a.filter(function(x){return x!==c.value;});}window[stateKey]=a;build();label();if(typeof render==='function')render();};});}
 btn.onclick=function(e){e.stopPropagation();var willOpen=pop.hidden;document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});pop.hidden=!willOpen;if(willOpen)build();};
 pop.onclick=function(e){e.stopPropagation();};
 if(!window._msDocBound){window._msDocBound=1;document.addEventListener('click',function(){document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});});}
 label();
}window.setupMemberMS=setupMemberMS;function render(){const scope=filteredTasks(),selected=$('#personFilter').value;renderCalendar(scope);$('#personTableHeading').textContent=selected?'งานของ '+selected+' · รวมงานที่เป็นผู้ช่วย':'ภาพรวมรายชื่อผู้รับผิดชอบ';$('#statusHeading').textContent=selected?'สถานะงานของ '+selected:'สถานะงานทั้งหมด';const completed=scope.filter(t=>t.status==='Completed').length,active=scope.filter(t=>t.status!=='Completed'&&t.status!=='On Hold').length,late=scope.filter(isLate).length,onTime=completed?Math.round(100*scope.filter(t=>t.status==='Completed'&&t.completed<=t.due).length/completed):0;$('#stats').innerHTML=[['งานทั้งหมด',scope.length,selected?'ของ '+selected:'ในทุก Project'],['งานที่กำลังดำเนินการ',active,'รวมงานรอตรวจและอนุมัติ'],['งานเลยกำหนด',late,late?'ต้องติดตาม':'ไม่มีงานเกินกำหนด'],['ส่งตรงเวลา',onTime+'%','จากงานที่ Completed']].map(([a,b,c])=>`<div class="card"><div class="klabel">${a}</div><div class="knum">${b}</div><div class="trend">${c}</div></div>`).join('');let statusScope=filterByRange(scope,statusRange);document.querySelectorAll('.status-range').forEach(function(b){var on=b.dataset.range===statusRange;b.classList.toggle('primary',on);b.classList.toggle('ghost',!on);});document.querySelectorAll('.status-field').forEach(function(b){var on=b.dataset.field===(typeof statusDateField!=='undefined'?statusDateField:'publish');b.classList.toggle('primary',on);b.classList.toggle('ghost',!on);});var _BF={publish:'วันออกงาน',due:'กำหนดส่ง'};var _RL={all:'ทุกช่วงเวลา',day:'วันนี้',week:'สัปดาห์นี้',month:'เดือนนี้',year:'ปีนี้'};var _sn=document.getElementById('statusRangeNote');if(_sn)_sn.textContent='ช่วง: '+(_RL[statusRange]||'')+' · '+statusScope.length+' งาน (นับตาม'+(_BF[(typeof statusDateField!=='undefined'?statusDateField:'publish')]||'วันออกงาน')+') · เก็บสถิติแล้ว '+historyDays()+' วัน';$('#statusChart').innerHTML=statuses.map((s)=>{let n=statusScope.filter(t=>t.status===s).length;return `<div class="statusrow"><span>${esc(statusLabel[s]||s)}</span><div class="bar"><span style="width:${statusScope.length?100*n/statusScope.length:0}%;background:${({'To Do':'#aabbb0','In Progress':'#48ad77','Review':'#e7ac65','Revision':'#df8277','Approval':'#9684ca','Ready to Publish':'#719bd1','Completed':'#9bc977','On Hold':'#a8aab2'})[s]}"></span></div><b>${n}</b></div>`}).join('');let review=scope.filter(t=>['Review','Approval'].includes(t.status)).length;let loads=Object.fromEntries(people.map(p=>[p,tasks.filter(t=>t.status!=='Completed'&&t.status!=='On Hold'&&t.lead===p).reduce((n,t)=>n+(weights[t.kind]||1),0)]));let [busy,score]=selected?[selected,loads[selected]]:Object.entries(loads).sort((a,b)=>b[1]-a[1])[0];$('#insights').innerHTML=`<div class="insight"><strong>งานที่รอการตัดสินใจ ${review} งาน</strong><p>ตรวจ Draft และยืนยันการอนุมัติก่อนขยับงานต่อ</p></div><div class="insight"><strong>Workload สูงสุด: ${esc(busy)} · ${score}/12 คะแนน</strong><p>ลองพิจารณาความพร้อมของทีมก่อนมอบหมายงานใหม่</p></div>${late?`<div class="insight"><strong>มีงานเกินกำหนด ${late} งาน</strong><p>Manager ควรตรวจสาเหตุและปรับแผนร่วมกับผู้รับผิดชอบ</p></div>`:''}`;(function(){var S={view:window.__dtpView||'overview',date:window.__dtpDate||'',gran:window.__dtpGran||'all',start:window.__dtpStart||'',end:window.__dtpEnd||'',members:window.__dtpMembers||[],orient:window.__dtpOrient||'h'};if(window.wtRenderTP)wtRenderTP(S,'dashTPtable','dtpMeta');})();$('#workload').innerHTML=people.map(p=>`<div class="statusrow"><span>${esc(p)}</span><div class="bar"><span style="width:${Math.min(100,loads[p]/12*100)}%;background:${loads[p]>10?'#dd925f':'#4faa77'}"></span></div><b>${loads[p]}</b></div>`).join('');let urgent=scope.filter(t=>isLate(t)||t.priority==='Urgent'||['Review','Approval'].includes(t.status)).slice(0,6);$('#attention').innerHTML=urgent.map(t=>`<tr><td class="link" data-task="${t.id}">${esc(t.title)}</td><td>${esc(t.lead)}</td><td style="color:${isLate(t)?'#c66f4e':''}">${esc(t.due)}${isLate(t)?' · เกินกำหนด':''}</td><td>${pill(t.status)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">ไม่มีงานที่ต้องจับตา</td></tr>';let q=$('#query').value.trim().toLowerCase(),pf=$('#projectFilter').value,tf=$('#typeFilter').value,kf=$('#kindFilter')?$('#kindFilter').value:'',rg=$('#boardRangeGran')?$('#boardRangeGran').value:'all',rv=(rg==='day'&&$('#boardRangeDate')?$('#boardRangeDate').value:($('#boardRangeVal')?$('#boardRangeVal').value:''));function _rok(t){if(rg==='all')return true;if(rg==='custom'){var _rs=$('#boardRangeStart')?$('#boardRangeStart').value:'',_re=$('#boardRangeEnd')?$('#boardRangeEnd').value:'';if(!_rs&&!_re)return true;if(!t.publish)return false;if(_rs&&t.publish<_rs)return false;if(_re&&t.publish>_re)return false;return true;}if(!rv)return true;if(!t.publish)return false;return rg==='day'?t.publish===rv:rg==='month'?t.publish.slice(0,7)===rv:t.publish.slice(0,4)===rv;}let shown=tasks.filter(t=>(!q||((t.title||'')+' '+(t.lead||'')+' '+(t.support||'')+' '+(t.checker||'')+' '+(t.approver||'')+' '+((t.types&&t.types.length)?t.types.map(function(x){return (x&&x.owner)||'';}).join(' '):'')+' '+coJoin(t.commOwner)).toLowerCase().includes(q))&&(!pf||t.project===pf)&&(!tf||t.comm===tf)&&(!kf||((t.types&&t.types.length)?t.types.some(function(x){return x&&x.type===kf;}):(t.kind==={'บันทึก':'Copy','Infographic':'Infographic','VDO':'Video'}[kf])))&&_rok(t));window.__wtBoardShown=shown;let calendarView=$('#boardGrouping').value==='calendar';$('#boardHint').textContent=$('#boardGrouping').value==='status'?'ลากการ์ดไปวางในคอลัมน์สถานะที่ต้องการเพื่ออัปเดตงาน · หรือคลิกการ์ดเพื่อแก้ไขรายละเอียด':calendarView?'ลากงานไปวางวันอื่นเพื่อเปลี่ยนวันออกงาน หรือคลิกเพื่อดูรายละเอียด':'ลากการ์ดไปคอลัมน์ชื่อคนเพื่อเปลี่ยนผู้รับผิดชอบหลัก (งานที่เป็นผู้ร่วมงานอาจแสดงซ้ำ)';$('#boardCalendarPanel').hidden=!calendarView;$('#kanban').hidden=calendarView;if(calendarView)renderBoardCalendar(shown);$('#kanban').classList.toggle('peopleboard',$('#boardGrouping').value==='person');const taskCard=t=>`<div class="task" data-task="${t.id}" draggable="true" aria-label="ลากงาน ${esc(t.title)} ไปหาผู้รับผิดชอบคนใหม่"><button class="task-del" type="button" data-del="${t.id}" title="ลบงานนี้" aria-label="ลบงาน">✕</button><div class="title">${esc(t.title)}</div>${t.priority==='Urgent'?'<div class="row"><span class="priority">● เร่งด่วน</span></div>':''}<div class="foot" style="margin-top:13px"><span class="tiny muted">กำหนดส่ง</span><span style="color:${isLate(t)?'#c66f4e':''}">◷ ${esc(t.due||'ยังไม่กำหนด')}</span></div></div>`;$('#kanban').innerHTML=$('#boardGrouping').value==='person'?people.map(p=>{let a=shown.filter(t=>ownedBy(t,p)),open=a.filter(t=>t.status!=='Completed'&&t.status!=='On Hold');return `<div class="column" data-drop-person="${esc(p)}"><div class="personhead"><span class="avatar">${esc(p.slice(0,2).toUpperCase())}</span><strong>${esc(p)}</strong><span class="pill s-todo">${a.length}</span></div><div class="personmetrics">งานที่ยังไม่เสร็จ ${open.length} · เกินกำหนด ${a.filter(isLate).length}<br>Workload ${open.reduce((n,t)=>n+(weights[t.kind]||1)*(t.lead===p?1:0.5),0)}/12</div>${a.map(t=>`<div><div class="tiny muted" style="margin:12px 2px -6px">${pill(t.status)} ${t.lead===p?'ผู้รับผิดชอบหลัก':'ผู้ร่วมงาน'}</div>${taskCard(t)}</div>`).join('')||'<div class="empty">ยังไม่มีงาน</div>'}</div>`}).join(''):[['To Do'],['In Progress'],['Review','Approval'],['Revision'],['Ready to Publish'],['Completed'],['On Hold']].map(g=>{let items=shown.filter(t=>g.includes(t.status));let label=g.map(s=>statusLabel[s]||s).join(' / ');return `<div class="column" data-drop-status="${esc(g[0])}"><div class="colhead"><span>${esc(label)}</span><span class="pill s-todo">${items.length}</span></div>${items.map(t=>taskCard(t)).join('')}</div>`}).join('');let ftasks=projCommFilter?tasks.filter(t=>t.comm===projCommFilter):tasks;let _manual=[];try{_manual=JSON.parse(localStorage.getItem('worktracker-projteams-v1')||'[]');}catch(e){}let _mComm={};_manual.forEach(function(m){if(m&&m.name)_mComm[m.name]=m.comm||'Internal';});let _mNames=_manual.map(function(m){return m&&m.name;}).filter(Boolean).filter(function(n){return !projCommFilter||_mComm[n]===projCommFilter;});let projList=[...new Set(ftasks.map(t=>t.project).filter(Boolean).concat(_mNames))];let _parch=[];try{_parch=JSON.parse(localStorage.getItem('worktracker-proj-archived-v1')||'[]');if(!Array.isArray(_parch))_parch=[];}catch(e){}let _ppur=[];try{_ppur=JSON.parse(localStorage.getItem('worktracker-proj-purged-v1')||'[]');if(!Array.isArray(_ppur))_ppur=[];}catch(e){}_parch=_parch.filter(p=>_ppur.indexOf(p)<0);projList=projList.filter(p=>_parch.indexOf(p)<0&&_ppur.indexOf(p)<0);var _ab=$('#projArchivedBar');if(_ab)_ab.innerHTML=_parch.length?('<div class="tiny muted" style="margin-bottom:6px">โปรเจกต์ที่ซ่อนไว้ ('+_parch.length+') · กด กู้คืน เพื่อนำกลับมาแสดง</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+_parch.map(p=>'<span class="pill" style="display:inline-flex;align-items:center;gap:8px;background:#eef2f7;color:#475569">'+esc(p)+' <button type="button" class="projrestore" data-proj="'+esc(p)+'" title="กู้คืน" style="border:0;background:none;color:#1766cc;cursor:pointer;font-weight:600;padding:0">↩ กู้คืน</button> <span style="color:#cbd5e1">|</span> <button type="button" class="projpurge" data-proj="'+esc(p)+'" title="ลบออกถาวร" style="border:0;background:none;color:#c0392b;cursor:pointer;font-weight:600;padding:0">✕ ลบถาวร</button></span>').join('')+'</div>'):'';if(!projList.length&&!projCommFilter)projList=projects.slice();$('#projectCards').innerHTML=projList.map(p=>{let a=ftasks.filter(t=>t.project===p),done=a.filter(t=>t.status==='Completed').length,ext=a.filter(t=>t.comm==='External').length,intn=a.filter(t=>t.comm==='Internal').length,comm=projCommFilter||(a.length?(ext>=intn?'External':'Internal'):(_mComm[p]||((p.includes('Store')||p.includes('Operations'))?'Internal':'External')));var dn=(comm==='Internal'?p.replace(/^หน่วยงาน\s+/,''):p);return `<div class="panel project" data-project="${esc(p)}"><div class="projtop"><span class="pill ${comm==='Internal'?'s-progress':'s-approval'}">${comm}</span><span style="display:flex;gap:6px"><button type="button" class="projedit" data-proj="${esc(p)}" data-comm="${comm}" data-name="${esc(dn)}" title="แก้ไขการ์ด">✎ แก้ไข</button><button type="button" class="projdel" data-proj="${esc(p)}" data-name="${esc(dn)}" title="ลบโปรเจกต์">✕ ลบ</button></span></div><h3>${esc(dn)}</h3><div class="muted tiny">${a.length} งาน · ${a.filter(isLate).length} เกินกำหนด</div><div class="progress"><span style="width:${a.length?done/a.length*100:0}%"></span></div><div class="tiny muted">${done}/${a.length} เสร็จสิ้น · ${a.length?Math.round(done/a.length*100):0}%</div></div>`}).join('')||'<div class="empty">ไม่มีโปรเจกต์ในประเภทนี้</div>';(function(){var S={view:window.__tpView||'media',date:window.__tpDate||'',gran:window.__tpGran||'all',start:window.__tpStart||'',end:window.__tpEnd||'',members:window.__tpMembers||[],orient:window.__tpOrient||'h'};wtRenderTP(S,'teamPerfTable','tpMeta');})();document.querySelectorAll('[data-task]').forEach(e=>{e.onclick=()=>{if(!wasDragging)openTask(+e.dataset.task)};if(e.draggable){e.ondragstart=ev=>{wasDragging=true;ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',String(e.dataset.task));e.classList.add('dragging')};e.ondragend=()=>{e.classList.remove('dragging');document.querySelectorAll('.drag-over').forEach(z=>z.classList.remove('drag-over'));setTimeout(()=>wasDragging=false,100)}}});document.querySelectorAll('.task-del').forEach(function(b){b.draggable=false;b.onmousedown=function(ev){ev.stopPropagation();};b.onclick=function(ev){ev.stopPropagation();delTask(+b.dataset.del);};});if(typeof renderTaskTrash==="function")renderTaskTrash();document.querySelectorAll('[data-drop-status]').forEach(col=>{col.ondragover=ev=>{if(!ev.dataTransfer.types.includes('text/plain'))return;ev.preventDefault();ev.dataTransfer.dropEffect='move';col.classList.add('drag-over')};col.ondragleave=ev=>{if(!col.contains(ev.relatedTarget))col.classList.remove('drag-over')};col.ondrop=ev=>{ev.preventDefault();col.classList.remove('drag-over');let id=Number(ev.dataTransfer.getData('text/plain')),t=tasks.find(x=>x.id===id),status=col.dataset.dropStatus;if(!t||!statuses.includes(status)||t.status===status)return;let previous=t.status;t.status=status;if(window.wtTaskLog)wtTaskLog(t.id,'ย้ายสถานะ: '+(statusLabel[previous]||previous)+' → '+(statusLabel[status]||status));if(status==='Completed'&&previous!=='Completed')t.completed=iso(0);if(status!=='Completed')delete t.completed;persist();if(window.cpSyncLinked)window.cpSyncLinked();render();notify(`ย้าย “${t.title}” ไปยัง “${statusLabel[status]}” แล้ว`)}});document.querySelectorAll('[data-drop-person]').forEach(col=>{col.ondragover=ev=>{if(!ev.dataTransfer.types.includes('text/plain'))return;ev.preventDefault();col.classList.add('drag-over')};col.ondragleave=ev=>{if(!col.contains(ev.relatedTarget))col.classList.remove('drag-over')};col.ondrop=ev=>{ev.preventDefault();col.classList.remove('drag-over');let t=tasks.find(x=>x.id===Number(ev.dataTransfer.getData('text/plain'))),person=col.dataset.dropPerson;if(!t||!people.includes(person)||t.lead===person)return;if(window.wtTaskLog)wtTaskLog(t.id,'เปลี่ยนผู้รับผิดชอบหลัก: '+(t.lead||'—')+' → '+person);t.lead=person;t.support=t.support.split(',').map(x=>x.trim()).filter(x=>x&&x!==person).join(', ');persist();render();notify(`มอบหมาย “${t.title}” ให้ ${person} เป็นผู้รับผิดชอบหลักแล้ว`)}});document.querySelectorAll('[data-drop-date]').forEach(day=>{day.ondragover=ev=>{if(!ev.dataTransfer.types.includes('text/plain'))return;ev.preventDefault();day.classList.add('drag-over')};day.ondragleave=ev=>{if(!day.contains(ev.relatedTarget))day.classList.remove('drag-over')};day.ondrop=ev=>{ev.preventDefault();day.classList.remove('drag-over');let t=tasks.find(x=>x.id===Number(ev.dataTransfer.getData('text/plain'))),date=day.dataset.dropDate;if(!t||!/^\d{4}-\d{2}-\d{2}$/.test(date)||t.publish===date)return;if(window.wtTaskLog)wtTaskLog(t.id,'เปลี่ยนวันออกงาน: '+(t.publish||'—')+' → '+date);t.publish=date;persist();render();notify(`เปลี่ยนวันออกงาน “${t.title}” เป็น ${date} แล้ว`)}});document.querySelectorAll('[data-project]').forEach(e=>e.onclick=()=>openProject(e.dataset.project))}function options(arr,v,labels){return arr.map(x=>`<option value="${esc(x)}" ${x===v?'selected':''}>${esc(labels?.[x]||x)}</option>`).join('')}function openProject(name){var base=(window.projCommFilter?tasks.filter(function(t){return t.comm===window.projCommFilter;}):tasks);var a=base.filter(function(t){return t.project===name;});var ext=a.filter(function(t){return t.comm==='External';}).length,intn=a.filter(function(t){return t.comm==='Internal';}).length;var comm=window.projCommFilter||(a.length?(ext>=intn?'External':'Internal'):((name.indexOf('Store')>=0||name.indexOf('Operations')>=0)?'Internal':'External'));var done=a.filter(function(t){return t.status==='Completed';}).length,late=a.filter(isLate).length,openN=a.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold';}).length;var pct=a.length?Math.round(done/a.length*100):0;var unit=name.indexOf('หน่วยงาน ')===0?name.slice('หน่วยงาน '.length):'';var lib=[];try{lib=JSON.parse(localStorage.getItem('worktracker-library-v1')||'[]');}catch(e){}var byComm=lib.filter(function(x){return x.comm===comm;});var links=unit?byComm.filter(function(x){return x.unit===unit;}):byComm;if(unit&&!links.length)links=byComm;var html='';html+='<div class="row" style="gap:10px;margin-bottom:14px"><span class="pill '+(comm==='Internal'?'s-progress':'s-approval')+'">'+comm+'</span>'+(unit?'<span class="pill s-todo">หน่วยงาน '+esc(unit)+'</span>':'')+'</div>';html+='<div class="cards" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:6px"><div class="card"><div class="klabel">งานทั้งหมด</div><div class="knum">'+a.length+'</div></div><div class="card"><div class="klabel">กำลังดำเนินการ</div><div class="knum">'+openN+'</div></div><div class="card"><div class="klabel">เกินกำหนด</div><div class="knum" style="color:'+(late?'#c66f4e':'')+'">'+late+'</div></div><div class="card"><div class="klabel">เสร็จสิ้น</div><div class="knum">'+pct+'%</div></div></div>';html+='<h3 class="sectiongap">งานที่เกี่ยวข้อง <span class="pill s-todo">'+a.length+'</span></h3>';if(!a.length){html+='<div class="panel empty">ไม่มีงานในโปรเจกต์นี้</div>';}else{html+='<div class="panel"><div class="tablewrap" style="max-height:260px;overflow:auto"><table class="table"><thead><tr><th>งาน</th><th>สถานะ</th><th>ผู้รับผิดชอบ</th><th>ผู้ตรวจ</th><th>กำหนด/ออก</th></tr></thead><tbody>'+a.map(function(t){return '<tr><td class="link proj-task" data-id="'+t.id+'">'+esc(t.title)+'</td><td>'+pill(t.status)+'</td><td>'+esc(t.lead||'—')+'</td><td>'+esc(t.checker||'ยังไม่กำหนด')+'</td><td style="color:'+(isLate(t)?'#c66f4e':'')+'">'+esc(t.publish||t.due||'—')+'</td></tr>';}).join('')+'</tbody></table></div></div>';}html+='<h3 class="sectiongap">ลิงก์ในคลังข้อมูลที่เกี่ยวข้อง <span class="pill s-todo">'+links.length+'</span></h3><div class="tiny muted" style="margin:-8px 0 10px">จับคู่จากประเภทการสื่อสาร '+esc(comm)+(unit?' · หน่วยงาน '+esc(unit):'')+'</div>';if(!links.length){html+='<div class="panel empty">ยังไม่มีลิงก์ที่เกี่ยวข้องในคลังข้อมูล</div>';}else{html+='<div class="panel"><div class="tablewrap"><table class="table"><thead><tr><th>ชื่อไฟล์ / งาน</th><th>หมวดหมู่</th><th>ประเภทลิงก์</th><th>หน่วยงาน</th><th>ลิงก์</th></tr></thead><tbody>'+links.map(function(x){return '<tr><td>'+esc(x.title)+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.linkType)+'</td><td>'+esc(x.unit||'—')+'</td><td><a href="'+esc(x.url)+'" target="_blank" rel="noopener" class="link">เปิดลิงก์ ↗</a></td></tr>';}).join('')+'</tbody></table></div></div>';}document.getElementById('projModalTitle').textContent=name;document.getElementById('projModalBody').innerHTML=html;document.getElementById('projModal').classList.add('open');document.querySelectorAll('#projModalBody .proj-task').forEach(function(el){el.onclick=function(){document.getElementById('projModal').classList.remove('open');openTask(Number(el.dataset.id));};});}
window.wtTaskLog=function(id,action){if(id===null||id===undefined||!action)return;try{fetch('/api/task-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,action:action})}).catch(function(){});}catch(e){}};window.wtRenderTaskHist=function(id){var el=$('#taskHist');if(!el)return;if(id===null||id===undefined){el.innerHTML='';el.dataset.loadingId='';return;}el.dataset.loadingId=String(id);el.innerHTML='<div class="tiny muted" style="border-top:1px solid #e5eaf0;padding-top:10px;margin-top:4px">ประวัติการเปลี่ยนแปลง · กำลังโหลด…</div>';var _id=String(id);fetch('/api/task-log?id='+encodeURIComponent(id)).then(function(r){return r.json();}).then(function(res){if(el.dataset.loadingId!==_id)return;var list=(res&&res.entries)||[];if(!list.length){el.innerHTML='<div class="tiny muted" style="border-top:1px solid #e5eaf0;padding-top:10px;margin-top:4px">ประวัติการเปลี่ยนแปลง · ยังไม่มีรายการบันทึก</div>';return;}var rows=list.slice().reverse().map(function(r){var d=new Date(r.at),ds='';try{ds=isNaN(d)?'':d.toLocaleString('th-TH',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){ds='';}return '<div style="display:flex;gap:8px;padding:4px 0;font-size:12px;line-height:1.5;align-items:flex-start"><span style="color:#94a3b8;white-space:nowrap">'+esc(ds)+'</span><span style="color:#1766cc;font-weight:600;white-space:nowrap">'+esc(r.by||'')+'</span><span style="color:#475569">'+esc(r.action||'')+'</span></div>';}).join('');el.innerHTML='<div class="tiny muted" style="border-top:1px solid #e5eaf0;padding-top:10px;margin-top:4px;margin-bottom:4px">ประวัติการเปลี่ยนแปลง ('+list.length+') · เห็นร่วมกันทั้งทีม</div>'+rows;}).catch(function(){if(el.dataset.loadingId!==_id)return;el.innerHTML='<div class="tiny muted" style="border-top:1px solid #e5eaf0;padding-top:10px;margin-top:4px">ประวัติการเปลี่ยนแปลง · โหลดไม่สำเร็จ</div>';});};function openTask(id){editing=id;let t=id===null?{title:'',project:projects[0],comm:'Internal',kind:'Infographic',priority:'Normal',lead:'Gift',support:'',checker:'Ploy',approver:'Gift',due:iso(3),status:'To Do',brief:'',modes:{}}:tasks.find(x=>x.id===id);$('#modalKicker').textContent=id===null?'CREATE TASK':'TASK #'+id;$('#modalTitle').textContent=id===null?'สร้างงานใหม่':t.title;for(let [f,v] of [['Title','title'],['Support','support'],['Due','due'],['Publish','publish'],['Brief','brief']])$('#f'+f).value=t[v]||'';for(let [f,arr,v] of [['Project',[...new Set(projects.concat(tasks.map(x=>x.project).filter(Boolean),(function(){try{return (JSON.parse(localStorage.getItem('worktracker-projteams-v1'))||[]).map(function(x){return x&&x.name;}).filter(Boolean);}catch(e){return [];}})(),t.project?[t.project]:[]))],'project'],['Comm',['Internal','External'],'comm'],['Kind',Object.keys(weights),'kind'],['Priority',[...new Set((window.DDget?window.DDget('priority'):['Normal','High','Urgent']).concat(t.priority?[t.priority]:[]))],'priority'],['Lead',[...new Set(people.concat(t.lead?[t.lead]:[]))],'lead'],['Checker',[...new Set(people.concat(t.checker?[t.checker]:[]))],'checker'],['Approver',[...new Set(people.concat(t.approver?[t.approver]:[]))],'approver'],['Status',statuses,'status']])$('#f'+f).innerHTML=options(arr,t[v],f==='Status'?statusLabel:null);if($('#fCommOwner')){$('#fCommOwner').value=coJoin(t.commOwner);if(window.wtCommOwnerMS)window.wtCommOwnerMS();}if(window.wtFillTypes)wtFillTypes(t);if(window.wtSupportMS)window.wtSupportMS();$('#fChannels').value=(t.channels&&t.channels.join?t.channels.join(', '):(t.channels||''));if(window.wtChannelsMS)window.wtChannelsMS();if(window.wtFillProjects)wtFillProjects($('#fComm').value||'Internal',t.project);if(window.wtToggleNote)wtToggleNote();$('#aiToggle').checked=!!t.aiCreative;$('#fConcept').value=t.concept||'';$('#creativePanel').hidden=!t.aiCreative;$('#taskMeta').textContent=id===null?'New Task · Demo':'Task #'+id+' · ข้อมูลบันทึกเฉพาะเบราว์เซอร์นี้';if(window.wtRenderTaskHist)wtRenderTaskHist(id);$('#modalbg').classList.add('open')}function closeModal(){$('#modalbg').classList.remove('open')}document.querySelectorAll('.newtask').forEach(x=>x.onclick=()=>openTask(null));$('#close').onclick=$('#cancel').onclick=closeModal;$('#modalbg').onclick=e=>{if(e.target.id==='modalbg')closeModal()};$('#save').onclick=()=>{let title=$('#fTitle').value.trim();if(!title){notify('กรุณาระบุชื่องาน');$('#fTitle').focus();return}if(!$('#fDue').value){notify('กรุณาระบุ Due Date');return}let old=editing===null?null:tasks.find(t=>t.id===editing);let next={...(old||{}),id:old?.id||Math.max(100,...tasks.map(t=>t.id))+1,title,project:$('#fProject').value,comm:$('#fComm').value,kind:(window.wtTypes&&wtTypes().kind)||$('#fKind').value,priority:$('#fPriority').value,lead:(window.wtTypes&&wtTypes().lead)||$('#fLead').value,types:(window.wtTypes?wtTypes().types:[]),support:$('#fSupport').value.trim(),channels:($('#fChannels')?$('#fChannels').value:'').split(',').map(function(x){return x.trim();}).filter(Boolean),commOwner:($('#fCommOwner')?$('#fCommOwner').value:'').split(',').map(function(x){return x.trim();}).filter(Boolean),checker:$('#fChecker').value,approver:$('#fApprover').value,due:$('#fDue').value,publish:$('#fPublish').value,status:$('#fStatus').value,brief:$('#fBrief').value,aiCreative:$('#aiToggle').checked,concept:$('#fConcept').value.trim()};if(next.status==='Completed'&&old?.status!=='Completed')next.completed=iso(0);if(next.status!=='Completed')delete next.completed;if(old&&window.wtTaskLog){var _FL={title:'ชื่องาน',project:'โปรเจกต์',comm:'ช่องทางสื่อสาร',lead:'ผู้รับผิดชอบหลัก',support:'ผู้ร่วมงาน',checker:'ผู้ตรวจ',approver:'ผู้อนุมัติ',due:'กำหนดส่ง',publish:'วันออกงาน',status:'สถานะ',brief:'รายละเอียดงาน',concept:'แนวคิด Creative'};var _ch=[];for(var _k in _FL){var _ov=old[_k]==null?'':String(old[_k]),_nv=next[_k]==null?'':String(next[_k]);if(_k==='status'){_ov=statusLabel[old[_k]]||_ov;_nv=statusLabel[next[_k]]||_nv;}if(_ov!==_nv)_ch.push(_FL[_k]+' : '+(_ov||'—')+' → '+(_nv||'—'));}if(_ch.length)wtTaskLog(old.id,'แก้ไข · '+_ch.join(' · '));}if(old)Object.assign(old,next);else{tasks.unshift(next);if(window.wtTaskLog)wtTaskLog(next.id,'สร้างงานใหม่');}persist();if(window.cpSyncLinked)window.cpSyncLinked();closeModal();render();notify('บันทึกงานแล้ว · การตัดสินใจยืนยันโดยผู้ใช้งาน')};$('#aiToggle').onchange=()=>{$('#creativePanel').hidden=!$('#aiToggle').checked};$('#ideaExample').onclick=()=>{let topic=$('#fTitle').value.trim()||'หัวข้องานนี้',brief=$('#fBrief').value.trim();$('#fConcept').value=`Concept (ตัวอย่าง): ${topic}\nKey message: สื่อสารประเด็นหลักให้เข้าใจง่ายและจำได้\nHook: เปิดด้วยสิ่งที่กลุ่มเป้าหมายสนใจ\nVisual direction: ภาพเด่นหนึ่งจุด ข้อความสั้น อ่านง่าย${brief?'\nข้อมูลจาก Brief: '+brief:''}`;notify('แสดงตัวอย่างเทมเพลต · กรุณาปรับแก้ก่อนใช้จริง')};$('#calPrev').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);render()};$('#calNext').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);render()};$('#calToday').onclick=()=>{calendarDate=new Date();calendarDate.setDate(1);render()};var _cc=$('#calComm');if(_cc)_cc.onchange=e=>{window.__calComm=e.target.value;render()};var _cb=$('#calBasis');if(_cb)_cb.onchange=e=>{window.__calBasis=e.target.value;render()};$('#boardCalPrev').onclick=()=>{boardCalendarDate.setMonth(boardCalendarDate.getMonth()-1);render()};$('#boardCalNext').onclick=()=>{boardCalendarDate.setMonth(boardCalendarDate.getMonth()+1);render()};$('#boardCalToday').onclick=()=>{boardCalendarDate=new Date();boardCalendarDate.setDate(1);render()};var _bcc=$('#bcalComm');if(_bcc)_bcc.onchange=e=>{window.__bcalComm=e.target.value;render()};var _bcb=$('#bcalBasis');if(_bcb)_bcb.onchange=e=>{window.__bcalBasis=e.target.value;render()};$('#query').oninput=render;$('#projectFilter').onchange=render;$('#typeFilter').onchange=function(){if(window.wtFillProjectFilter)wtFillProjectFilter();render();};$('#reset').onclick=()=>{if(confirm('คืนค่าข้อมูลตัวอย่างทั้งหมด?')){tasks=structuredClone(initial);persist();$('#query').value='';$('#projectFilter').value='';$('#typeFilter').value='';if($('#kindFilter'))$('#kindFilter').value='';if($('#boardRangeGran')){$('#boardRangeGran').value='all';if(window.syncBoardRange)syncBoardRange(false);}if(window.wtFillProjectFilter)wtFillProjectFilter();render();notify('คืนค่าข้อมูลตัวอย่างแล้ว')}};function wtFillProjectFilter(){var tf=$('#typeFilter')?$('#typeFilter').value:'';var el=$('#projectFilter');if(!el)return;var cur=el.value;var set={};tasks.forEach(function(t){if(t.project&&(!tf||t.comm===tf))set[t.project]=1;});try{(JSON.parse(localStorage.getItem('worktracker-projteams-v1'))||[]).forEach(function(x){if(x&&x.name&&(!tf||(x.comm||'Internal')===tf))set[x.name]=1;});}catch(e){}var list=Object.keys(set).sort();if(cur&&list.indexOf(cur)<0)cur='';el.innerHTML='<option value="">ทุก Project</option>'+list.map(function(p){return '<option value="'+esc(p)+'"'+(p===cur?' selected':'')+'>'+esc(p)+'</option>';}).join('');}window.wtFillProjectFilter=wtFillProjectFilter;wtFillProjectFilter();$('#personFilter').innerHTML='<option value="">ทุกคนในทีม</option>'+options(people,'');$('#personFilter').onchange=render;$('#boardGrouping').onchange=render;(function(){var kinds=['บันทึก','Infographic','VDO'];var kf=$('#kindFilter');if(kf){kf.innerHTML='<option value="">ทุกประเภทสื่อ</option>'+options(kinds,'');kf.onchange=render;}var TMs=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];function distinctVals(g){var s={};tasks.forEach(function(t){if(!t.publish)return;var k=g==='day'?t.publish:g==='month'?t.publish.slice(0,7):t.publish.slice(0,4);s[k]=1;});return Object.keys(s).sort().reverse();}function labelVal(g,v){var p=(''+v).split('-');if(g==='day')return (+p[2])+' '+TMs[+p[1]]+' '+(+p[0]+543);if(g==='month')return TMs[+p[1]]+' '+(+p[0]+543);return 'ปี '+(+v+543);}window.syncBoardRange=function(keep){var rg=$('#boardRangeGran'),rv=$('#boardRangeVal'),rd=$('#boardRangeDate'),rs=$('#boardRangeStart'),re=$('#boardRangeEnd'),dh=$('#boardRangeDash');if(!rg||!rv)return;var g=rg.value;if(rd)rd.hidden=(g!=='day');[rs,re,dh].forEach(function(x){if(x)x.hidden=(g!=='custom');});if(g==='all'){rv.hidden=true;rv.innerHTML='';return;}if(g==='custom'){rv.hidden=true;var _t=new Date().toISOString().slice(0,10);if(rs&&!rs.value)rs.value=_t;if(re&&!re.value)re.value=_t;return;}if(g==='day'&&rd){rv.hidden=true;if(!rd.value)rd.value=new Date().toISOString().slice(0,10);return;}var vals=distinctVals(g);var cur=keep?rv.value:'';if(vals.indexOf(cur)<0)cur=vals[0]||'';rv.hidden=false;rv.innerHTML=vals.length?vals.map(function(v){return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+labelVal(g,v)+'</option>';}).join(''):'<option value="">— ไม่มีวันส่งออก —</option>';};function syncCalToRange(){var g=$('#boardRangeGran').value,v=(g==='day'&&$('#boardRangeDate'))?$('#boardRangeDate').value:$('#boardRangeVal').value;if(!v)return;var p=(''+v).split('-');if(g==='day'||g==='month')boardCalendarDate=new Date(+p[0],(+p[1]||1)-1,1);else if(g==='year')boardCalendarDate=new Date(+v,boardCalendarDate.getMonth(),1);}var rg=$('#boardRangeGran');if(rg)rg.onchange=function(){syncBoardRange(false);syncCalToRange();render();};var rv=$('#boardRangeVal');if(rv)rv.onchange=function(){syncCalToRange();render();};var rd0=$('#boardRangeDate');if(rd0)rd0.onchange=function(){syncCalToRange();render();};var rs0=$('#boardRangeStart'),re0=$('#boardRangeEnd');if(rs0)rs0.onchange=function(){render();};if(re0)re0.onchange=function(){render();};syncBoardRange(false);})();document.addEventListener('click',e=>{let el=e.target.closest('[data-person]');if(el){$('#personFilter').value=el.dataset.person;navigate('dashboard');render()}});(function(){
function fdate(s){if(!s)return"—";var p=(""+s).split("-");if(p.length<3)return s;var d=new Date(+p[0],+p[1]-1,+p[2]);if(isNaN(d))return s;try{return new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"long",year:"numeric"}).format(d);}catch(e){return s;}}
function row(l,v){return v?('<div class="cdrow"><label>'+l+'</label><div>'+esc(v)+'</div></div>'):"";}
function closeCalDrawer(){var bg=document.getElementById("calDrawerBg"),dr=document.getElementById("calDrawer");if(bg)bg.classList.remove("open");if(dr)dr.classList.remove("open");}
window.closeCalDrawer=closeCalDrawer;
window.openCalDrawer=function(id){var t=tasks.find(function(x){return x.id===id;});if(!t)return;
 var ext=t.comm==="External";
 document.getElementById("cdTitle").textContent=t.title||"(ไม่มีหัวข้อ)";
 document.getElementById("cdTag").innerHTML='<span class="cdtag '+(ext?"ext":"int")+'">'+(ext?"External · ภายนอก":"Internal · ภายใน")+'</span>';
 var st=(typeof statusLabel==="function")?statusLabel(t.status):t.status;
 var owner=esc(t.lead||"—")+(t.support?(" , "+esc(t.support)):"");
 var html="";
 html+=row("วันที่ออกงาน",fdate(t.publish));
 html+=row("กำหนดส่ง",fdate(t.due));
 html+=row("Project / หน่วยงาน",t.project);
 html+=row("ประเภทงาน",t.kind);
 html+='<div class="cdrow"><label>ผู้รับผิดชอบ</label><div>'+owner+'</div></div>';
 html+=row("ผู้ตรวจงาน",t.checker);
 html+=row("ผู้อนุมัติ",t.approver);
 html+=(st?('<div class="cdrow"><label>สถานะ</label><div><span class="cdstat">'+esc(st)+'</span></div></div>'):"");
 html+=(t.brief?('<div class="cdrow"><label>รายละเอียด</label><div style="white-space:pre-wrap">'+esc(t.brief)+'</div></div>'):"");
 document.getElementById("cdBody").innerHTML=html;
 document.getElementById("cdEdit").onclick=function(){closeCalDrawer();openTask(id);};
 document.getElementById("calDrawerBg").classList.add("open");
 document.getElementById("calDrawer").classList.add("open");
};
function openCalDay(key,scope){var items=((scope||boardCalScope)||[]).filter(function(t){return t.publish===key;});
 document.getElementById("cdmDate").textContent=fdate(key);
 document.getElementById("cdmCount").textContent=items.length+" รายการ";
 document.getElementById("cdmList").innerHTML=items.map(function(t){var ext=t.comm==="External";return '<button type="button" class="cdmitem '+(ext?"ext":"int")+'" data-daytask="'+t.id+'" title="'+esc(t.title||"")+'">'+esc(t.title||"(ไม่มีหัวข้อ)")+'</button>';}).join("")||'<div class="tiny muted">ไม่มีรายการ</div>';
 document.getElementById("calDayModal").classList.add("open");
}
function closeCalDay(){document.getElementById("calDayModal").classList.remove("open");}
function wireCal(){
 var _cm=document.getElementById("calDayModal");
 if(_cm){document.getElementById("cdmClose").onclick=closeCalDay;_cm.onclick=function(e){if(e.target===_cm)closeCalDay();};
  document.getElementById("cdmList").addEventListener("click",function(e){var b=e.target.closest("[data-daytask]");if(!b)return;closeCalDay();openCalDrawer(+b.getAttribute("data-daytask"));});}
 var _bg=document.getElementById("calDrawerBg");if(_bg)_bg.onclick=closeCalDrawer;
 var _cc=document.getElementById("cdClose");if(_cc)_cc.onclick=closeCalDrawer;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wireCal);else wireCal();
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeCalDrawer();closeCalDay();}});
// capture-phase interceptor: redirect calendar clicks to drawer/day-list instead of openTask
document.addEventListener("click",function(e){
 var host=document.getElementById("boardCalendar");if(!host)return;
 var more=e.target.closest(".calmore");
 if(more&&host.contains(more)){e.stopPropagation();e.preventDefault();openCalDay(more.getAttribute("data-cal-day"));return;}
 var ev=e.target.closest(".calevent");
 if(ev&&host.contains(ev)){e.stopPropagation();if(!wasDragging)openCalDrawer(+ev.dataset.task);return;}
 var day=e.target.closest(".calday");
 if(day&&host.contains(day)){var k=day.getAttribute("data-cal-day");if(k){boardCalSelected=k;host.querySelectorAll(".calday.selected").forEach(function(x){x.classList.remove("selected");});day.classList.add("selected");}}
},true);

document.addEventListener("click",function(e){
 var host=document.getElementById("calendar");if(!host)return;
 var more=e.target.closest(".calmore");
 if(more&&host.contains(more)){e.stopPropagation();e.preventDefault();openCalDay(more.getAttribute("data-cal-day"),dashCalScope);return;}
 var ev=e.target.closest(".calevent");
 if(ev&&host.contains(ev)){e.stopPropagation();if(!wasDragging)openCalDrawer(+ev.dataset.task);return;}
 var day=e.target.closest(".calday");
 if(day&&host.contains(day)){var k=day.getAttribute("data-cal-day");if(k){dashCalSelected=k;host.querySelectorAll(".calday.selected").forEach(function(x){x.classList.remove("selected");});day.classList.add("selected");}}
},true);
})();
render();
;
/* js/01-automation-insights.js */
(function(){
const key='worktracker-comm-v1';
const sample=[
{id:'COM-001',status:'In Progress',owner:'Gift',follow:iso(1),topic:'สรุปโปรโมชัน 9.9 สำหรับร้าน',date:iso(0),time:'09:00',channel:'CPALL Connect',format:'Infographic',audience:1200,readers:760,duration:38,weight:2},
{id:'COM-002',status:'Review',owner:'Mint',follow:iso(-1),topic:'VDO วิธีติดตั้งสื่อหน้าร้าน',date:iso(0),time:'13:00',channel:'Teams',format:'VDO',audience:800,readers:285,duration:74,weight:4},
{id:'COM-003',status:'Completed',owner:'Beam',follow:iso(-2),topic:'ข้อความแจ้งแคมเปญ ALL ONLINE',date:iso(-1),time:'11:00',channel:'LINE',format:'ข้อความ',audience:700,readers:590,duration:16,weight:1},
{id:'COM-004',status:'In Progress',owner:'Ploy',follow:iso(2),topic:'Infographic ตรวจคุณภาพสินค้า',date:iso(0),time:'15:00',channel:'CPALL Connect',format:'Infographic',audience:1200,readers:420,duration:30,weight:2},
{id:'COM-005',status:'To Do',owner:'Nok',follow:iso(3),topic:'สคริปต์ Live 7Market',date:iso(2),time:'17:00',channel:'Social Media',format:'Live',audience:2500,readers:0,duration:0,weight:5}
].map(x=>({...x,version:1,updatedBy:'Gift',updatedAt:new Date().toISOString()}));
let records,history;try{let saved=JSON.parse(localStorage.getItem(key));records=Array.isArray(saved?.records)?saved.records:sample;history=Array.isArray(saved?.history)?saved.history:[]}catch{records=sample;history=[]}
const scoreDefaults={team:{follow:40,done:30,load:30,capacity:12,note:''},channel:{read:70,duration:30,targetSeconds:30,note:''},media:{spread:50,read:50,maxPerDay:2,note:''}};let scoreSettings;try{let stored=JSON.parse(localStorage.getItem('worktracker-score-v1'))||{};scoreSettings=Object.fromEntries(Object.entries(scoreDefaults).map(([k,v])=>[k,{...v,...stored[k]}]))}catch{scoreSettings=structuredClone(scoreDefaults)}var wlDefaults={Infographic:2,VDO:4,'บันทึก':1};var wlWeights;try{wlWeights=Object.assign({},wlDefaults,JSON.parse(localStorage.getItem('worktracker-workload-weights-v1'))||{});}catch(e){wlWeights=Object.assign({},wlDefaults);}function wlCat(f){f=(f||'').toString().toLowerCase();if(f.indexOf('info')>=0)return 'Infographic';if(f.indexOf('vdo')>=0||f.indexOf('video')>=0)return 'VDO';return 'บันทึก';}function wlWeight(f){var w=wlWeights[wlCat(f)];return (typeof w==='number'&&!isNaN(w))?w:0;}function openWlModal(){var m=item('wlModal');if(!m)return;item('wlInfo').value=wlWeights['Infographic'];item('wlVdo').value=wlWeights['VDO'];item('wlRec').value=wlWeights['บันทึก'];item('wlClose').onclick=item('wlCancel').onclick=function(){m.classList.remove('open');};m.onclick=function(e){if(e.target===m)m.classList.remove('open');};item('wlReset').onclick=function(){wlWeights=Object.assign({},wlDefaults);try{localStorage.setItem('worktracker-workload-weights-v1',JSON.stringify(wlWeights));}catch(e){}openWlModal();renderComm();if(window.notify)notify('คืนค่าน้ำหนักเริ่มต้นแล้ว');};item('wlSave').onclick=function(){var wi=parseFloat(item('wlInfo').value),wv=parseFloat(item('wlVdo').value),wr=parseFloat(item('wlRec').value);wlWeights['Infographic']=isNaN(wi)?0:wi;wlWeights['VDO']=isNaN(wv)?0:wv;wlWeights['บันทึก']=isNaN(wr)?0:wr;try{localStorage.setItem('worktracker-workload-weights-v1',JSON.stringify(wlWeights));}catch(e){}m.classList.remove('open');renderComm();if(window.notify)notify('บันทึกน้ำหนัก Workload แล้ว');};m.classList.add('open');}let editingId=null,activePerf='team';const fields={id:'cId',status:'cStatus',owner:'cOwner',follow:'cFollow',topic:'cTopic',date:'cDate',time:'cTime',channel:'cChannel',format:'cFormat',audience:'cAudience',readers:'cReaders',duration:'cDuration',weight:'cWeight'};const names={id:'Lead ID',status:'สถานะ',owner:'Owner',follow:'Follow-Up Date',topic:'หัวข้อสื่อสาร',date:'วันที่ออกสื่อ',time:'เวลาสื่อสาร',channel:'ช่องทาง',format:'รูปแบบสื่อ',audience:'กลุ่มเป้าหมาย',readers:'ผู้อ่าน',duration:'เวลาอ่าน',weight:'ความซับซ้อน'};
function monthRecs(){var m=(window.__autoMonths||[]);return (m&&m.length)?records.filter(function(r){return m.indexOf((r.date||"").slice(0,7))>=0;}):records;}
function persistComm(){localStorage.setItem(key,JSON.stringify({records,history}))}
function item(id){return document.getElementById(id)}
function renderComm(){let cfg=scoreSettings,cap=Number(cfg.team.capacity);let recs=monthRecs();item('commCapacityHead').textContent=`Workload / ${cap}`;var _wf=item('wlFormula');if(_wf)_wf.textContent='Workload = Σ (ชิ้นงานที่เปิดอยู่ × น้ำหนักสื่อ) · Infographic '+wlWeights['Infographic']+' · VDO '+wlWeights['VDO']+' · บันทึก '+wlWeights['บันทึก'];item('teamFollowHead').textContent=`Follow-Up ${cfg.team.follow}%`;item('teamDoneHead').textContent=`เสร็จสิ้น ${cfg.team.done}%`;item('teamLoadHead').textContent=`ภาระงาน ${cfg.team.load}%`;item('channelReadHead').textContent=`อัตราการอ่าน ${cfg.channel.read}%`;item('channelDurationHead').textContent=`เวลาอ่าน ${cfg.channel.duration}%`;item('mediaSpreadHead').textContent=`การกระจายสื่อ ${cfg.media.spread}%`;item('mediaReadHead').textContent=`อัตราการอ่าน ${cfg.media.read}%`;item('teamFormula').textContent=`Follow-Up = งานเปิดที่ยังไม่เลยกำหนด ÷ งานเปิด · เสร็จสิ้น = งานเสร็จ ÷ งานทั้งหมด · ภาระงานเต็มคะแนนเมื่อไม่เกิน ${cap} คะแนน`;item('teamCapacityNote').textContent=`ภาระงานนับคะแนนความซับซ้อนของรายการที่ยังไม่เสร็จ · เกณฑ์ปัจจุบัน ${cap} คะแนน/คน${cfg.team.note?' · หมายเหตุ: '+cfg.team.note:''}`;item('channelFormula').textContent=`เวลาอ่าน ${cfg.channel.targetSeconds} วินาทีขึ้นไป = 100 คะแนนในส่วนนี้ · ระวังการเทียบสื่อความยาวต่างกัน${cfg.channel.note?' · หมายเหตุ: '+cfg.channel.note:''}`;item('mediaFormula').textContent=`สัดส่วนวันที่สื่อประเภทนั้นออกไม่เกิน ${cfg.media.maxPerDay} ชิ้น = คะแนนการกระจายสื่อ${cfg.media.note?' · หมายเหตุ: '+cfg.media.note:''}`;let open=r=>!['Completed','On Hold'].includes(r.status);let sum=(a,k)=>a.reduce((n,r)=>n+(Number(r[k])||0),0);let overdue=r=>open(r)&&r.follow&&r.follow<iso(0);let sent=recs.filter(r=>r.date&&r.date<=iso(0));let readers=sum(sent,'readers'),audience=sum(sent,'audience');let teamLoad=recs.filter(open).reduce((n,r)=>n+Number(r.weight||0),0);let channelCount=[...new Set(sent.map(r=>r.channel))].length;let dayCount=[...new Set(sent.map(r=>r.date))].length;let formatCount=[...new Set(sent.map(r=>r.format))].length;let statGroups={team:[['รายการทั้งหมด',recs.length,'Lead ID ไม่ซ้ำ'],['กำลังรับผิดชอบ',recs.filter(open).length,'รายการที่ยังไม่เสร็จ'],['เกิน Follow-Up',recs.filter(overdue).length,'ต้องติดตาม'],['คะแนนภาระงาน',teamLoad,'รวมงานที่ยังไม่เสร็จ']],channel:[['สื่อที่ออกแล้ว',sent.length,'รายการที่ถึงวันออกสื่อ'],['ช่องทางที่ใช้',channelCount,'ช่องทาง'],['ผู้อ่านจริง',readers.toLocaleString(),'ข้อมูลทดลอง'],['อัตราการอ่าน',audience?Math.round(readers/audience*100)+'%':'—','อ่าน / กลุ่มเป้าหมาย']],media:[['สื่อที่ออกแล้ว',sent.length,'นับตามวันที่ออกสื่อ'],['ประเภทสื่อ',formatCount,'รูปแบบ'],['วันที่ออกสื่อ',dayCount,'วัน'],['สูงสุดต่อวัน',Math.max(0,...Object.values(sent.reduce((a,r)=>(a[r.date]=(a[r.date]||0)+1,a),{}))),'จำนวนชิ้น']]};item('perfDescription').textContent=({team:'วัดจำนวนงาน ความรับผิดชอบ Follow-Up และภาระงานของแต่ละ Owner',channel:'วัดผู้อ่าน อัตราการอ่าน และเวลาอ่านเฉลี่ยตามช่องทาง · ข้อมูลทดลอง',media:'วัดจำนวนสื่อที่ออกตามวันและรูปแบบ เพื่อดูความหนาแน่นของการสื่อสาร'})[activePerf];item('commStats').innerHTML=statGroups[activePerf].map(([a,b,c])=>`<div class="card"><div class="klabel">${a}</div><div class="knum">${b}</div><div class="trend">${c}</div></div>`).join('');document.querySelectorAll('[data-perf-panel]').forEach(el=>el.hidden=el.dataset.perfPanel!==activePerf);document.querySelectorAll('[data-perf-tab]').forEach(el=>{let selected=el.dataset.perfTab===activePerf;el.classList.toggle('active',selected);el.setAttribute('aria-selected',String(selected))});
function _cmMedia(o){var n=0,i=0,v=0;var TT=(typeof tasks!=='undefined'&&tasks)?tasks:[];var _m=(window.__autoMonths||[]);function _inM(t){if(!_m.length)return true;return _m.indexOf((t.due||"").slice(0,7))>=0||_m.indexOf((t.publish||"").slice(0,7))>=0;}TT.forEach(function(t){if(!_inM(t))return;if(t.types&&t.types.length){t.types.forEach(function(x){if(!x||x.owner!==o)return;if(x.type==='บันทึก')n++;else if(x.type==='Infographic')i++;else if(x.type==='VDO')v++;});}else if(t.lead===o){if(t.kind==='Copy')n++;else if(t.kind==='Infographic')i++;else if(t.kind==='Video')v++;}});return {n:n,i:i,v:v};}let owners=[...new Set(recs.map(r=>r.owner))].sort();item('commOwners').innerHTML=owners.map(o=>{let a=recs.filter(r=>r.owner===o),act=a.filter(open),w=act.reduce(function(s,r){return s+wlWeight(r.format);},0),mc=_cmMedia(o);return `<tr><td>${esc(o)}</td><td style="text-align:center">${mc.n||''}</td><td style="text-align:center">${mc.i||''}</td><td style="text-align:center">${mc.v||''}</td><td>${a.length}</td><td>${act.length}</td><td>${a.filter(overdue).length}</td><td><span style="color:${w>12?'#b35e43':'#24724d'}">${w}/${cap}</span></td></tr>`}).join('')||'<tr><td colspan="8" class="empty">ยังไม่มีรายการ</td></tr>';
const scoreText=n=>Number.isFinite(n)?Math.round(n)+' คะแนน':'—';item('commTeamScore').innerHTML=owners.map(o=>{let a=recs.filter(r=>r.owner===o),active=a.filter(open),late=active.filter(overdue).length,weight=sum(active,'weight'),follow=active.length?100*(active.length-late)/active.length:100,done=a.length?100*a.filter(r=>r.status==='Completed').length/a.length:0,load=weight<=cap?100:100*cap/weight,total=(cfg.team.follow*follow+cfg.team.done*done+cfg.team.load*load)/100;return `<tr><td>${esc(o)}</td><td>${Math.round(follow)}%</td><td>${Math.round(done)}%</td><td>${Math.round(load)}%</td><td><b>${scoreText(total)}</b></td></tr>`}).join('');item('commOwnerBars').innerHTML=owners.map(o=>{let score=sum(recs.filter(r=>r.owner===o&&open(r)),'weight');return `<div class="perf-bar-row"><span>${esc(o)}</span><div class="bar"><span style="width:${Math.min(100,score/cap*100)}%;background:${score>cap?'#d8914b':'#1766cc'}"></span></div><b>${score}/${cap}</b></div>`}).join('');let channels=[...new Set(recs.map(r=>r.channel))].sort();item('commChannels').innerHTML=channels.map(c=>{let a=sent.filter(r=>r.channel===c),n=sum(a,'readers'),base=sum(a,'audience'),seconds=n?Math.round(a.reduce((v,r)=>v+(Number(r.readers)||0)*(Number(r.duration)||0),0)/n):0;return `<tr><td>${esc(c)}</td><td>${a.length}</td><td>${n.toLocaleString()} / ${base.toLocaleString()}</td><td>${base?Math.round(n/base*100)+'%':'—'}</td><td>${n?seconds+' วินาที':'—'}</td></tr>`}).join('')||'<tr><td colspan="5" class="empty">ยังไม่มีสื่อที่ออกแล้ว</td></tr>';
item('commChannelScore').innerHTML=channels.map(c=>{let a=sent.filter(r=>r.channel===c),base=sum(a,'audience'),n=sum(a,'readers');if(!base)return `<tr><td>${esc(c)}</td><td>—</td><td>—</td><td>รอข้อมูลการอ่าน</td></tr>`;let rate=100*n/base,seconds=n?a.reduce((v,r)=>v+Number(r.readers||0)*Number(r.duration||0),0)/n:0,depth=Math.min(100,100*seconds/cfg.channel.targetSeconds),total=(cfg.channel.read*rate+cfg.channel.duration*depth)/100;return `<tr><td>${esc(c)}</td><td>${Math.round(rate)}%</td><td>${Math.round(depth)}% <span class="muted tiny">(${Math.round(seconds)} วิ)</span></td><td><b>${scoreText(total)}</b></td></tr>`}).join('');item('commChannelBars').innerHTML=channels.map(c=>{let a=sent.filter(r=>r.channel===c),n=sum(a,'readers'),base=sum(a,'audience'),pct=base?Math.round(n/base*100):0;return `<div class="perf-bar-row"><span>${esc(c)}</span><div class="bar"><span style="width:${pct}%;background:#3a7bd5"></span></div><b>${pct}%</b></div>`}).join('');let groups={};for(let r of sent){let k=r.date+'|'+r.format;(groups[k]??=[]).push(r)}item('commDaily').innerHTML=Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,a])=>`<tr><td>${esc(k.split('|')[0])}</td><td>${esc(k.split('|')[1])}</td><td>${a.length}</td><td>${a.map(r=>esc(r.topic)).join(' · ')}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">ยังไม่มีสื่อที่ออกแล้ว</td></tr>';
let formatTotals={};for(let r of sent)formatTotals[r.format]=(formatTotals[r.format]||0)+1;item('commFormatBars').innerHTML=Object.entries(formatTotals).sort((a,b)=>b[1]-a[1]).map(([f,n])=>`<div class="perf-bar-row"><span>${esc(f)}</span><div class="bar"><span style="width:${sent.length?Math.round(n/sent.length*100):0}%;background:#1766cc"></span></div><b>${n} ชิ้น</b></div>`).join('');item('commMediaScore').innerHTML=Object.keys(formatTotals).map(f=>{let a=sent.filter(r=>r.format===f),byDay={};for(let r of a)byDay[r.date]=(byDay[r.date]||0)+1;let dayValues=Object.values(byDay),spread=100*dayValues.filter(n=>n<=cfg.media.maxPerDay).length/dayValues.length,base=sum(a,'audience'),readRate=base?100*sum(a,'readers')/base:NaN,total=base?(cfg.media.spread*spread+cfg.media.read*readRate)/100:NaN;return `<tr><td>${esc(f)}</td><td>${a.length}</td><td>${(a.length/dayValues.length).toFixed(1)}</td><td>${Math.round(spread)}%</td><td>${base?Math.round(readRate)+'%':'—'}</td><td><b>${Number.isFinite(total)?scoreText(total):'รอข้อมูลการอ่าน'}</b></td></tr>`}).join('')||'<tr><td colspan="6" class="empty">ยังไม่มีสื่อที่ออกแล้ว</td></tr>';let alerts=[],tips=[];let late=recs.filter(overdue);if(late.length){alerts.push(`${late.length} รายการเกิน Follow-Up Date: ${late.map(r=>r.id).join(', ')}`);tips.push('ติดตามสาเหตุที่งานเกินกำหนดกับ Owner และปรับลำดับงานที่จำเป็น')}let low=sent.filter(r=>Number(r.audience)>0&&Number(r.readers)/Number(r.audience)<.4);if(low.length){alerts.push(`${low.length} รายการมีอัตราการอ่านต่ำกว่า 40%: ${low.map(r=>r.id).join(', ')}`);tips.push('ตรวจเวลาเผยแพร่และความชัดของหัวข้อในช่องทางที่อ่านต่ำ แล้วทดลองปรับก่อนสรุปสาเหตุ')}let daily={};for(let r of sent)daily[r.date]=(daily[r.date]||0)+1;let busy=Object.entries(daily).filter(([,n])=>n>=3);if(busy.length){alerts.push(`วันที่ ${busy.map(([d,n])=>d+' ('+n+' ชิ้น)').join(', ')} มีสื่อออกตั้งแต่ 3 ชิ้นขึ้นไป`);tips.push('ทบทวนการกระจายเวลาออกสื่อในวันที่หนาแน่น และเทียบผลการอ่านกับวันอื่น')}let heavy=owners.filter(o=>sum(recs.filter(r=>r.owner===o&&open(r)),'weight')>12);if(heavy.length){alerts.push(`ภาระงานเกิน 12 คะแนน: ${heavy.join(', ')}`);tips.push('พิจารณากระจายงานใหม่โดยดูทั้งคะแนนความซับซ้อนและกำหนดส่ง')}item('commAlerts').innerHTML=alerts.map(a=>`<div class="comm-alert">⚑ ${esc(a)}</div>`).join('')||'<div class="tiny muted">ยังไม่มีข้อมูลที่เข้าเกณฑ์ Alert ตัวอย่าง</div>';item('commTakeaways').innerHTML=tips.map(t=>`<div class="comm-takeaway">${esc(t)}</div>`).join('')||'<div class="tiny muted">เพิ่มข้อมูลการอ่านและวันออกสื่อเพื่อสร้างข้อเสนอแนะ</div>';
item('commRows').innerHTML=recs.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(r=>`<tr data-comm="${esc(r.id)}" style="cursor:pointer"><td class="link">${esc(r.id)}</td><td>${esc(r.topic)}</td><td>${esc(r.owner)}</td><td>${pill(r.status)}</td><td>${esc(r.date||'—')} ${esc(r.time||'')}</td><td>${esc(r.channel)}</td><td>${esc(r.format)}</td><td>v${r.version||1}</td></tr>`).join('')||'<tr><td colspan="8" class="empty">ยังไม่มีข้อมูล</td></tr>';item('commNotifications').innerHTML=[...history.slice(-3).reverse().map(h=>`<div class="comm-takeaway">${esc(h.action)} ${esc(h.id)} · v${h.version} โดย ${esc(h.editor)}</div>`),...alerts.slice(0,2).map(a=>`<div class="comm-alert">⚑ ${esc(a)}</div>`)].join('')||'<div class="tiny muted">ยังไม่มีการแจ้งเตือน</div>';item('commLog').innerHTML=history.slice(-12).reverse().map(h=>`<div class="comm-log-entry"><b>${esc(h.id)} · v${h.version}</b> ${esc(h.action)}<br><span class="muted">${esc(h.editor)} · ${new Date(h.at).toLocaleString('th-TH')} ${h.reason?'· '+esc(h.reason):''}</span><br>${esc(h.changes.join(' · '))}</div>`).join('')||'<div class="tiny muted">ยังไม่มีประวัติการแก้ไข · รายการตัวอย่างเป็นข้อมูลตั้งต้น</div>';document.querySelectorAll('[data-comm]').forEach(e=>e.onclick=()=>openComm(e.dataset.comm))}
function openComm(id){editingId=id;let r=id?records.find(x=>x.id===id):null;item('commModalTitle').textContent=r?'แก้ไข '+r.id:'เพิ่มข้อมูลสื่อสาร';item('cOwner').innerHTML=options(people,r?.owner||people[0]);item('cEditor').innerHTML=options(people,'Gift');item('cStatus').innerHTML=options(statuses,r?.status||'To Do',statusLabel);for(let [k,f] of Object.entries(fields))item(f).value=r?.[k]??({date:iso(0),follow:iso(2),time:'09:00',audience:0,readers:0,duration:0,weight:1})[k]??'';item('cId').readOnly=!!r;item('cReason').value='';item('commModal').classList.add('open')}
function closeComm(){item('commModal').classList.remove('open')}
const scoreLabels={team:'Performance ทีม',channel:'Performance ช่องทางการสื่อสาร',media:'Performance ตามประเภทสื่อ'};const scoreFieldsByView={team:[['follow','น้ำหนักคะแนน Follow-Up (%)',0,100],['done','น้ำหนักคะแนนงานเสร็จสิ้น (%)',0,100],['load','น้ำหนักคะแนนภาระงาน (%)',0,100],['capacity','Capacity ต่อคน (คะแนน)',1,100]],channel:[['read','น้ำหนักคะแนนอัตราการอ่าน (%)',0,100],['duration','น้ำหนักคะแนนเวลาอ่าน (%)',0,100],['targetSeconds','เป้าหมายเวลาอ่าน (วินาที)',1,3600]],media:[['spread','น้ำหนักคะแนนการกระจายสื่อ (%)',0,100],['read','น้ำหนักคะแนนอัตราการอ่าน (%)',0,100],['maxPerDay','จำนวนสื่อสูงสุดต่อวันต่อประเภท',1,100]]};function fillScoreModal(){let settings=scoreSettings[activePerf];item('scoreModalTitle').textContent='รายละเอียดเกณฑ์คะแนน · '+scoreLabels[activePerf];item('scoreIntro').textContent=({team:'คะแนนทีมจาก Follow-Up, อัตรางานเสร็จ และภาระงานที่ยังเปิดอยู่',channel:'คะแนนช่องทางจากอัตราการอ่านและเวลาอ่านเฉลี่ยถ่วงน้ำหนักตามจำนวนผู้อ่าน',media:'คะแนนประเภทสื่อจากการกระจายจำนวนชิ้นต่อวันและอัตราการอ่าน'})[activePerf];item('scoreFields').innerHTML=scoreFieldsByView[activePerf].map(([k,label,min,max])=>`<div class="field"><label>${label}</label><input type="number" data-score-field="${k}" min="${min}" max="${max}" step="1" value="${Number(settings[k])}"></div>`).join('')+`<div class="field wide"><label>หมายเหตุเกณฑ์เพิ่มเติม</label><textarea id="scoreNote" placeholder="อธิบายบริบทหรือเกณฑ์ที่ทีมตกลงร่วมกัน">${esc(settings.note||'')}</textarea></div>`;item('scoreExplanation').textContent='น้ำหนักตัวชี้วัดรวมต้องเท่ากับ 100% · เกณฑ์นี้เป็นตัวอย่างเพื่อทดลอง ไม่ใช่ผลประเมินบุคลากรจริง';item('scoreModal').classList.add('open')}function closeScoreModal(){item('scoreModal').classList.remove('open')}item('scoreDetails').onclick=fillScoreModal;var _wb=item('wlWeightBtn');if(_wb)_wb.onclick=openWlModal;item('scoreClose').onclick=item('scoreCancel').onclick=closeScoreModal;item('scoreModal').onclick=e=>{if(e.target===item('scoreModal'))closeScoreModal()};item('scoreReset').onclick=()=>{scoreSettings[activePerf]=structuredClone(scoreDefaults[activePerf]);localStorage.setItem('worktracker-score-v1',JSON.stringify(scoreSettings));fillScoreModal();renderComm();notify('คืนค่าเกณฑ์ตัวอย่างและคำนวณคะแนนใหม่แล้ว')};item('scoreSave').onclick=()=>{let values=Object.fromEntries([...document.querySelectorAll('[data-score-field]')].map(el=>[el.dataset.scoreField,Number(el.value)]));if(Object.values(values).some(n=>!Number.isInteger(n)||n<0)){notify('กรุณาระบุจำนวนเต็มที่ไม่ติดลบ');return}let weights=activePerf==='team'?['follow','done','load']:activePerf==='channel'?['read','duration']:['spread','read'];if(weights.reduce((n,k)=>n+values[k],0)!==100){notify('น้ำหนักตัวชี้วัดต้องรวมกันเป็น 100%');return}let limits=Object.fromEntries(scoreFieldsByView[activePerf].map(([k,,min,max])=>[k,[min,max]]));if(Object.entries(values).some(([k,n])=>n<limits[k][0]||n>limits[k][1])){notify('มีค่าเกินช่วงที่กำหนด');return}scoreSettings[activePerf]={...values,note:item('scoreNote').value.trim()};localStorage.setItem('worktracker-score-v1',JSON.stringify(scoreSettings));closeScoreModal();renderComm();notify('บันทึกเกณฑ์คะแนนและคำนวณตารางใหม่แล้ว')};document.querySelectorAll('[data-perf-tab]').forEach(tab=>tab.onclick=()=>{activePerf=tab.dataset.perfTab;renderComm()});item('commNew').onclick=()=>openComm(null);item('commClose').onclick=item('commCancel').onclick=closeComm;item('commModal').onclick=e=>{if(e.target===item('commModal'))closeComm()};item('commSave').onclick=()=>{let value=Object.fromEntries(Object.entries(fields).map(([k,f])=>[k,item(f).value.trim()]));value.id=value.id.toUpperCase();if(!value.id||!value.topic||!value.owner){notify('กรุณาระบุ Lead ID, หัวข้อสื่อสาร และ Owner');return}for(let k of ['audience','readers','duration','weight'])value[k]=Number(value[k]);if(!Number.isInteger(value.audience)||!Number.isInteger(value.readers)||value.readers<0||value.audience<0||value.readers>value.audience){notify('จำนวนผู้อ่านต้องไม่เกินกลุ่มเป้าหมาย และต้องเป็นจำนวนเต็ม');return}if(value.weight<1||value.weight>5||!Number.isInteger(value.weight)||value.duration<0){notify('กรุณาระบุคะแนนความซับซ้อน 1–5 และเวลาอ่านไม่ติดลบ');return}if(!editingId&&records.some(r=>r.id===value.id)){notify('Lead ID นี้มีอยู่แล้ว · คลิกรายการเพื่อแก้ไขข้อมูลเดิม');return}let old=editingId?records.find(r=>r.id===editingId):null;if(editingId&&!old){notify('ไม่พบรายการเดิม');return}let changes=old?Object.keys(fields).filter(k=>String(old[k]??'')!==String(value[k]??'')).map(k=>`${names[k]}: ${old[k]??'—'} → ${value[k]??'—'}`):['สร้างรายงานใหม่'];if(old&&!changes.length){notify('ไม่มีข้อมูลเปลี่ยนแปลง');return}let editor=item('cEditor').value,reason=item('cReason').value.trim(),at=new Date().toISOString(),version=(old?.version||0)+1;let next={...old,...value,version,updatedBy:editor,updatedAt:at};if(old)records[records.indexOf(old)]=next;else records.unshift(next);history.push({id:value.id,version,action:old?'แก้ไขรายการเดิม':'สร้างรายงานใหม่',editor,at,reason,changes});persistComm();closeComm();renderComm();notify(old?`อัปเดต ${value.id} เป็น v${version} และบันทึก Log แล้ว`:`สร้างรายงาน ${value.id} v1 แล้ว`)};
document.addEventListener("wt-auto-months",renderComm);
renderComm();
})();

;
/* js/02-user-chip.js */
(function(){function esc(s){return String(s==null?"":s).replace(/[&<>"\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\x27":"&#39;"}[c];});}function ini(n){return (String(n||"").trim().slice(0,2)||"?").toUpperCase();}var u=window.__WT_USER__||null;if(u){var c=document.getElementById("wtUserChip");if(c)c.textContent=u.name+(u.role?" · "+u.role:"");var a=document.getElementById("wtAvatar");if(a)a.textContent=ini(u.name);var sa=document.getElementById("wtSideAvatar");if(sa)sa.textContent=ini(u.name);var su=document.getElementById("wtSideUser");if(su)su.textContent=u.name+(u.role?" · "+u.role:"");}var lo=document.getElementById("wtLogout");if(lo)lo.onclick=function(){fetch("/api/logout",{method:"POST"}).then(function(){location.href="/login";}).catch(function(){location.href="/login";});};function loadPerm(){var tb=document.getElementById("wtPermRows");if(!tb)return;fetch("/api/users").then(function(r){return r.json();}).then(function(d){var list=(d&&d.users)||[];var src=document.getElementById("wtUserSource");if(src)src.textContent="ผู้ใช้ "+list.length+" คน · แหล่งข้อมูล: "+((d&&d.source)==="sheet"?"Google Sheet":"ผู้ใช้ตัวอย่าง (ยังไม่เชื่อมชีต)");if(!list.length){tb.innerHTML='<tr><td colspan="5" class="empty">ยังไม่มีข้อมูลผู้ใช้</td></tr>';return;}tb.innerHTML=list.map(function(x){return '<tr><td><span class="avatar">'+ini(x.name)+'</span> &nbsp; '+esc(x.name)+'</td><td>'+esc(x.team||"—")+'</td><td>'+esc(x.role||"—")+'</td><td>'+esc(x.capacity||"—")+'</td><td>'+esc(x.email||"—")+'</td></tr>';}).join("");}).catch(function(){tb.innerHTML='<tr><td colspan="5" class="empty">โหลดข้อมูลไม่สำเร็จ</td></tr>';});}var rb=document.getElementById("wtRefreshUsers");if(rb)rb.onclick=function(){rb.disabled=true;rb.textContent="กำลังนำเข้า...";fetch("/api/refresh-users",{method:"POST"}).then(function(r){return r.json();}).then(function(d){rb.disabled=false;rb.textContent="↻ นำเข้า/รีเฟรชจาก Google Sheet";if(window.notify)notify(d.ok?("นำเข้าผู้ใช้ "+d.count+" คนแล้ว"):("นำเข้าไม่สำเร็จ: "+(d.error||"")));loadPerm();}).catch(function(){rb.disabled=false;rb.textContent="↻ นำเข้า/รีเฟรชจาก Google Sheet";if(window.notify)notify("นำเข้าไม่สำเร็จ");});};document.querySelectorAll('.nav[data-page="permissions"]').forEach(function(b){b.addEventListener("click",loadPerm);});loadPerm();var _rst=document.getElementById("reset");if(_rst&&!window.__WT_PREVIEW__)_rst.style.display="none";var _sm=document.getElementById("wtSideMode");if(_sm)_sm.textContent=window.__WT_PREVIEW__?"Preview mode · ข้อมูลตัวอย่าง":"โหมดใช้งานจริง · เชื่อม Google Sheet แล้ว";})();
;
/* inline */
(function(){function meta(d){var t=document.getElementById("wtAdminTools");if(!t)return;if(d&&d.is_admin){t.hidden=false;var u=document.getElementById("wtSheetUrl");if(u&&d.sheet_url&&!u.value)u.value=d.sheet_url;}else{t.hidden=true;}}var _f=window.fetch;function refreshMeta(){_f("/api/users").then(function(r){return r.json();}).then(meta).catch(function(){});}var cb=document.getElementById("wtConnectSheet");if(cb)cb.onclick=function(){var inp=document.getElementById("wtSheetUrl");var url=(inp&&inp.value||"").trim();if(!url){if(window.notify)notify("กรุณาวางลิงก์ Google Sheet");return;}cb.disabled=true;cb.textContent="กำลังเชื่อม...";_f("/api/config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({users_csv_url:url})}).then(function(r){return r.json();}).then(function(d){cb.disabled=false;cb.textContent="เชื่อม/เปลี่ยนลิงก์";if(window.notify)notify(d.ok?("เชื่อม Google Sheet แล้ว · นำเข้าผู้ใช้ "+d.count+" คน"):("เชื่อมไม่สำเร็จ: "+(d.error||"")));if(d.ok){var rb=document.getElementById("wtRefreshUsers");if(rb)rb.click();}}).catch(function(){cb.disabled=false;cb.textContent="เชื่อม/เปลี่ยนลิงก์";if(window.notify)notify("เชื่อมไม่สำเร็จ");});};document.querySelectorAll('.nav[data-page="permissions"]').forEach(function(b){b.addEventListener("click",refreshMeta);});refreshMeta();})();
;
/* js/03-data-sync-modal.js */
(function(){
var mb=document.getElementById("wtDataModal");if(!mb)return;var wtMode='internal';function wtSetMode(m){wtMode=m;document.querySelectorAll('.wt-mode').forEach(function(b){var on=b.dataset.mode===m;b.classList.toggle('primary',on);b.classList.toggle('ghost',!on);});}document.querySelectorAll('.wt-mode').forEach(function(b){b.addEventListener('click',function(){wtSetMode(b.dataset.mode);if(typeof reset==='function')reset();});});
var SL={"To Do":"รอดำเนินการ","In Progress":"กำลังดำเนินการ","Completed":"เสร็จสิ้น"};
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function q(id){return document.getElementById(id);}
function reset(){q("wtPreviewWrap").hidden=true;q("wtPreviewRows").innerHTML="";q("wtDataSummary").textContent="";var m=q("wtDataMsg");m.textContent="";m.style.color="";var s=q("wtDataSync");s.disabled=true;s.textContent="✓ ยืนยันซิงก์เข้าระบบ";}
function op(){var i=q("wtDataUrl");reset();fetch("/api/data-meta").then(function(r){return r.json();}).then(function(d){if(i&&d&&d.data_url&&!i.value)i.value=d.data_url;}).catch(function(){});mb.classList.add("open");wtSetMode(wtMode);}
function cl(){mb.classList.remove("open");}
document.querySelectorAll(".wt-import-btn").forEach(function(b){b.onclick=op;});
var x=q("wtDataClose"),c=q("wtDataCancel");if(x)x.onclick=cl;if(c)c.onclick=cl;mb.onclick=function(e){if(e.target===mb)cl();};
function url(){return (q("wtDataUrl").value||"").trim();}
var pv=q("wtDataPreview");
if(pv)pv.onclick=function(){var u=url();var m=q("wtDataMsg");if(!u){m.style.color="#be5954";m.textContent="กรุณาวางลิงก์ Google Sheet";return;}
 pv.disabled=true;var o=pv.textContent;pv.textContent="กำลังดึง...";m.style.color="";m.textContent="กำลังดึงและตรวจข้อมูล...";
 fetch("/api/preview-data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:u,mode:wtMode})}).then(function(r){return r.json();}).then(function(d){
  pv.disabled=false;pv.textContent=o;
  if(!d.ok){m.style.color="#be5954";m.textContent="ตรวจไม่สำเร็จ: "+(d.error||"");return;}
  m.textContent="";
  q("wtPreviewRows").innerHTML=d.rows.map(function(r,idx){var bad=r.warn&&r.warn.length;var chk=bad?('<span style="color:#be5954">⚠ '+esc(r.warn.join(", "))+'</span>'):'<span style="color:#2e7d32">✓</span>';return '<tr'+(bad?' style="background:#fff6e9"':'')+'><td>'+(idx+1)+'</td><td>'+esc(r.date||"—")+'</td><td>'+esc(r.title)+'</td><td>'+esc(r.project||"—")+'</td><td>'+esc(SL[r.status]||r.status)+'</td><td>'+esc(r.kind)+'</td><td>'+esc(r.channels||"—")+'</td><td>'+esc(r.formats||"—")+'</td><td>'+chk+'</td></tr>';}).join("");
  q("wtPreviewWrap").hidden=false;
  q("wtDataSummary").textContent="พบ "+d.count+" รายการ · ⚠ เตือน "+d.warn+" · ไม่มีวันที่ "+d.no_date;
  var s=q("wtDataSync");s.disabled=false;s.textContent="✓ ยืนยันซิงก์เข้าระบบ ("+d.count+")";
 }).catch(function(){pv.disabled=false;pv.textContent=o;m.style.color="#be5954";m.textContent="ตรวจไม่สำเร็จ";});
};
var s=q("wtDataSync");
if(s)s.onclick=function(){if(s.disabled)return;var u=url();var m=q("wtDataMsg");s.disabled=true;var o=s.textContent;s.textContent="กำลังซิงก์...";m.style.color="";m.textContent="กำลังบันทึกเข้าระบบ...";
 fetch("/api/import-data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:u,mode:wtMode})}).then(function(r){return r.json();}).then(function(d){
  s.disabled=false;s.textContent=o;
  if(d.ok){m.style.color="#2e7d32";m.textContent="ซิงก์สำเร็จ "+d.count+" รายการ · กำลังรีเฟรช...";setTimeout(function(){location.reload();},900);}
  else{m.style.color="#be5954";m.textContent="ซิงก์ไม่สำเร็จ: "+(d.error||"");}
 }).catch(function(){s.disabled=false;s.textContent=o;m.style.color="#be5954";m.textContent="ซิงก์ไม่สำเร็จ";});
};
})();
;
/* js/04-library.js */
(function(){
var cardsEl=document.getElementById("libCards");if(!cardsEl)return;
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function q(id){return document.getElementById(id);}
function load(){try{return JSON.parse(localStorage.getItem("worktracker-library-v1")||"[]");}catch(e){return [];}}
function saveAll(a){localStorage.setItem("worktracker-library-v1",JSON.stringify(a));}
function detType(u){u=(u||"").toLowerCase();
 if(u.indexOf("drive.google")>=0)return "Google Drive";
 if(u.indexOf("docs.google.com/presentation")>=0)return "Google Slides";
 if(u.indexOf("docs.google.com/document")>=0)return "Google Docs";
 if(u.indexOf("docs.google.com/spreadsheets")>=0)return "Google Sheets";
 if(u.indexOf("canva.com")>=0)return "Canva";
 if(u.indexOf("youtube.com")>=0||u.indexOf("youtu.be")>=0)return "YouTube";
 if(u.indexOf("figma.com")>=0)return "Figma";
 if(u.indexOf("facebook.com")>=0)return "Facebook";
 if(u.indexOf("tiktok.com")>=0)return "TikTok";
 return "อื่นๆ";}
var TYPE_ICON={"Google Drive":"📁","Google Slides":"📊","Google Docs":"📄","Google Sheets":"📗","Canva":"🎨","YouTube":"▶️","Figma":"✒️","Facebook":"📘","TikTok":"🎵","อื่นๆ":"🔗"};
function icon(t){return TYPE_ICON[t]||"🔗";}
var libComm="Internal", libCat=null, libType=null;
function tableFor(list){
 return '<div class="tablewrap"><table class="table"><thead><tr><th>ชื่อไฟล์ / งาน</th><th>หมวดหมู่</th><th>หน่วยงาน</th><th>เพิ่มโดย</th><th>ลิงก์</th><th></th></tr></thead><tbody>'+list.map(function(x){return '<tr><td>'+esc(x.title)+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.unit||"—")+'</td><td>'+esc(x.addedBy||"—")+'</td><td><a href="'+esc(x.url)+'" target="_blank" rel="noopener" class="link">เปิดลิงก์ ↗</a></td><td><button class="ghost lib-del" style="padding:5px 9px" data-id="'+esc(x.id)+'">ลบ</button></td></tr>';}).join("")+'</tbody></table></div>';
}
function bindDel(root){root.querySelectorAll(".lib-del").forEach(function(b){b.onclick=function(){if(!confirm("ลบลิงก์นี้ออกจากคลัง?"))return;var a=load().filter(function(x){return String(x.id)!==String(b.dataset.id);});saveAll(a);render();if(window.notify)notify("ลบลิงก์แล้ว");};});}
function render(){
 var detEl=q("libDetail");
 document.querySelectorAll(".lib-comm").forEach(function(b){var on=b.dataset.comm===libComm;b.classList.toggle("primary",on);b.classList.toggle("ghost",!on);});
 var all=load().filter(function(x){return x.comm===libComm;});
 if(libType){
  cardsEl.hidden=true;detEl.hidden=false;
  var items=all.filter(function(x){return x.linkType===libType;});
  var byCat={};items.forEach(function(x){(byCat[x.category]=byCat[x.category]||[]).push(x);});
  var html='<button class="ghost" id="libBack">← กลับไปหน้าคลัง</button><h3 class="sectiongap">'+icon(libType)+' '+esc(libType)+' · '+esc(libComm)+' · '+items.length+' ลิงก์ (แยกตามหมวดหมู่)</h3>';
  if(!items.length){html+='<div class="panel empty">ยังไม่มีลิงก์ประเภทนี้</div>';}
  else{html+=Object.keys(byCat).sort().map(function(c){return '<div class="panel sectiongap"><h3>'+esc(c)+' <span class="pill s-todo">'+byCat[c].length+'</span></h3>'+tableFor(byCat[c])+'</div>';}).join("");}
  detEl.innerHTML=html;q("libBack").onclick=function(){libType=null;render();};bindDel(detEl);
 } else if(libCat){
  cardsEl.hidden=true;detEl.hidden=false;
  var items=all.filter(function(x){return x.category===libCat;});
  var groups={};items.forEach(function(x){(groups[x.linkType]=groups[x.linkType]||[]).push(x);});
  var html='<button class="ghost" id="libBack">← กลับไปหมวดหมู่</button><h3 class="sectiongap">'+esc(libCat)+' · '+esc(libComm)+' · '+items.length+' ลิงก์ (แยกตามประเภทลิงก์)</h3>';
  if(!items.length){html+='<div class="panel empty">ยังไม่มีลิงก์ในหมวดนี้ · กดปุ่ม “เพิ่มลิงก์” มุมบนขวา</div>';}
  else{html+=Object.keys(groups).sort().map(function(tp){return '<div class="panel sectiongap"><h3>'+icon(tp)+' '+esc(tp)+' <span class="pill s-todo">'+groups[tp].length+'</span></h3>'+tableFor(groups[tp])+'</div>';}).join("");}
  detEl.innerHTML=html;q("libBack").onclick=function(){libCat=null;render();};bindDel(detEl);
 } else {
  detEl.hidden=true;cardsEl.hidden=false;
  var cats=["Infographic","VDO"];
  var cardsHtml='<div class="projectgrid">'+cats.map(function(c){
   var items=all.filter(function(x){return x.category===c;});
   var types={};items.forEach(function(x){types[x.linkType]=1;});
   return '<div class="panel project lib-card" data-cat="'+c+'"><span class="pill '+(c==="VDO"?"s-revision":"s-approval")+'">'+c+'</span><h3>'+c+'</h3><div class="muted tiny">'+items.length+' ลิงก์ · '+Object.keys(types).length+' ประเภทลิงก์</div><div class="progress"><span style="width:'+(all.length?Math.round(items.length/all.length*100):0)+'%"></span></div><div class="tiny muted">คลิกเพื่อดูแยกตามประเภทลิงก์</div></div>';
  }).join("")+'</div>';
  var tc={};all.forEach(function(x){tc[x.linkType]=(tc[x.linkType]||0)+1;});
  var order=["Google Drive","Google Slides","Google Docs","Google Sheets","Canva","YouTube","Figma","Facebook","TikTok","อื่นๆ"];
  var keys=Object.keys(tc).sort(function(a,b){var ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  var chips=keys.map(function(t){return '<button class="lib-type-chip" data-type="'+esc(t)+'" style="display:inline-flex;align-items:center;gap:9px;padding:11px 15px;border:1px solid var(--line);background:#fff;border-radius:13px;cursor:pointer;font:inherit;color:var(--ink)"><span style="font-size:22px;line-height:1">'+icon(t)+'</span><span style="font-weight:500">'+esc(t)+'</span><span class="pill s-todo">'+tc[t]+'</span></button>';}).join("");
  var iconRow='<div class="panel sectiongap"><h3>ภาพรวมตามประเภทลิงก์</h3><div class="tiny muted" style="margin:-8px 0 13px">กดไอคอนเพื่อดูลิงก์ทั้งหมดของประเภทนั้น (ทุกหมวดหมู่ใน '+esc(libComm)+')</div>'+(chips?('<div class="row" style="gap:11px;flex-wrap:wrap">'+chips+'</div>'):'<div class="tiny muted">ยังไม่มีลิงก์ · เพิ่มลิงก์เพื่อให้ไอคอนประเภทปรากฏ</div>')+'</div>';
  cardsEl.innerHTML=cardsHtml+iconRow;
  cardsEl.querySelectorAll(".lib-card").forEach(function(el){el.onclick=function(){libCat=el.dataset.cat;render();};});
  cardsEl.querySelectorAll(".lib-type-chip").forEach(function(el){el.onmouseover=function(){el.style.borderColor="#8fb4e0";};el.onmouseout=function(){el.style.borderColor="var(--line)";};el.onclick=function(){libType=el.dataset.type;render();};});
 }
}
document.querySelectorAll(".lib-comm").forEach(function(b){b.onclick=function(){libComm=b.dataset.comm;libCat=null;libType=null;render();};});
var mb=q("libModal");
function openModal(){q("libTitle").value="";q("libUrl").value="";q("libUnit").value="";q("libType").value="";q("libComm").value=libComm;q("libCat").value=(libCat||"Infographic");mb.classList.add("open");}
function closeModal(){mb.classList.remove("open");}
q("libAdd").onclick=openModal;q("libClose").onclick=closeModal;q("libCancel").onclick=closeModal;mb.onclick=function(e){if(e.target===mb)closeModal();};
q("libSave").onclick=function(){
 var title=q("libTitle").value.trim(),url=q("libUrl").value.trim();
 if(!title||!url){if(window.notify)notify("กรุณากรอกชื่อและ URL");return;}
 var type=q("libType").value||detType(url);
 var a=load();
 a.push({id:Date.now(),title:title,comm:q("libComm").value,category:q("libCat").value,linkType:type,unit:q("libUnit").value.trim(),url:url,addedBy:(window.__WT_USER__&&window.__WT_USER__.name)||"",addedAt:new Date().toISOString()});
 saveAll(a);closeModal();libComm=q("libComm").value;libCat=q("libCat").value;libType=null;render();if(window.notify)notify("เพิ่มลิงก์เข้าคลังแล้ว");
};
document.querySelectorAll('.nav[data-page="library"]').forEach(function(b){b.addEventListener("click",function(){libCat=null;libType=null;render();});});
render();
})();
;
/* inline */
(function(){var m=document.getElementById("projModal");if(!m)return;var c=document.getElementById("projClose");if(c)c.onclick=function(){m.classList.remove("open");};m.addEventListener("click",function(e){if(e.target===m)m.classList.remove("open");});})();
;
/* inline */
(function(){function sync(){document.querySelectorAll(".proj-filter").forEach(function(x){var on=x.dataset.comm===(window.projCommFilter||"");x.classList.toggle("primary",on);x.classList.toggle("ghost",!on);});}document.querySelectorAll(".proj-filter").forEach(function(b){b.onclick=function(){window.projCommFilter=b.dataset.comm;sync();if(typeof render==="function")render();};});sync();})();
;
/* js/05-auto-task-stats.js */
(function(){
var wrap=document.getElementById("autoTaskStats");if(!wrap)return;
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function g(id){return document.getElementById(id);}
function chansOf(t){var b=t.brief||"";var m=/ช่องทาง:\s*([^·]+)/.exec(b);if(!m)return [];return m[1].split(",").map(function(s){return s.trim();}).filter(Boolean);}
function TASKS(){return (typeof tasks!=="undefined"&&tasks)?tasks:[];}
var comm="";window.__autoMonths=window.__autoMonths||[];var months=window.__autoMonths; // shared with Performance panel (module 01)
function announceMonths(){try{document.dispatchEvent(new CustomEvent("wt-auto-months"));}catch(e){}}
function iso(){return new Date().toISOString().slice(0,10);}
// month multi-select (same UX as Workload Workspace)
function monthsList(){var set={};TASKS().forEach(function(t){[t.due,t.publish].forEach(function(d){if(d&&/^\d{4}-\d{2}/.test(d))set[d.slice(0,7)]=1;});});return Object.keys(set).sort().reverse();}
function inMonths(t){if(!months.length)return true;return months.some(function(m){return (t.due&&t.due.slice(0,7)===m)||(t.publish&&t.publish.slice(0,7)===m);});}
function monthLabel(){if(!months.length)return "ทุกเดือน";if(months.length===1)return months[0];return months.length+" เดือน";}
function buildMonthFilter(){var pop=g("atMonthPop");if(!pop)return;
 pop.innerHTML='<label class="wc-msel-opt"><input type="checkbox" id="atMoAll" '+(months.length?'':'checked')+'> <b>ทุกเดือน</b></label><div class="wc-msel-sep"></div>'
  +monthsList().map(function(m){return '<label class="wc-msel-opt"><input type="checkbox" class="at-mo" value="'+m+'" '+(months.indexOf(m)>=0?'checked':'')+'> '+m+'</label>';}).join("");
 var lbl=g("atMonthLbl");if(lbl)lbl.textContent=monthLabel();}
function render(){
 var src=TASKS();
 var all=src.filter(function(t){return (!comm||t.comm===comm)&&inMonths(t);});
 document.querySelectorAll(".auto-comm").forEach(function(b){var on=b.dataset.comm===comm;b.classList.toggle("primary",on);b.classList.toggle("ghost",!on);});
 var today=iso();
 var out=all.filter(function(t){return t.publish&&t.publish<=today;}).length;
 var info=all.filter(function(t){return t.kind==="Infographic";}).length;
 var vdo=all.filter(function(t){return t.kind==="Video";}).length;
 wrap.innerHTML=[["งานทั้งหมด",all.length,comm||"Internal + External"],["ออกสื่อแล้ว",out,"ถึงวันออกสื่อ"],["Infographic",info,"ชิ้น"],["VDO",vdo,"ชิ้น"]].map(function(a){return '<div class="card"><div class="klabel">'+a[0]+'</div><div class="knum">'+a[1]+'</div><div class="trend">'+esc(a[2])+'</div></div>';}).join("");
 var kinds={};all.forEach(function(t){var k=t.kind||"อื่นๆ";kinds[k]=(kinds[k]||0)+1;});
 var ke=Object.keys(kinds).sort(function(a,b){return kinds[b]-kinds[a];});
 var kmax=ke.length?Math.max.apply(null,ke.map(function(k){return kinds[k];})):1;
 document.getElementById("autoByKind").innerHTML=ke.length?ke.map(function(k){return '<div class="perf-bar-row"><span>'+esc(k)+'</span><div class="bar"><span style="width:'+Math.round(kinds[k]/kmax*100)+'%;background:#1766cc"></span></div><b>'+kinds[k]+'</b></div>';}).join(""):'<div class="tiny muted">ไม่มีข้อมูล</div>';
 var chans={};all.forEach(function(t){chansOf(t).forEach(function(c){chans[c]=(chans[c]||0)+1;});});
 var ce=Object.keys(chans).sort(function(a,b){return chans[b]-chans[a];});
 var cmax=ce.length?Math.max.apply(null,ce.map(function(c){return chans[c];})):1;
 document.getElementById("autoByChannel").innerHTML=ce.length?ce.map(function(c){return '<div class="perf-bar-row"><span>'+esc(c)+'</span><div class="bar"><span style="width:'+Math.round(chans[c]/cmax*100)+'%;background:#3a7bd5"></span></div><b>'+chans[c]+'</b></div>';}).join(""):'<div class="tiny muted">ไม่มีข้อมูลช่องทางใน Task</div>';
}
document.querySelectorAll(".auto-comm").forEach(function(b){b.onclick=function(){comm=b.dataset.comm;render();};});
// month multi-select wiring: toggle popup, outside-click close, checkbox delegation
(function(){var mc=g("atMonth"),pop=g("atMonthPop");if(!mc||!pop)return;
 mc.addEventListener("click",function(e){if(e.target.closest(".wc-msel-pop"))return;pop.hidden=!pop.hidden;});
 document.addEventListener("click",function(e){if(!pop.hidden&&!mc.contains(e.target))pop.hidden=true;});
 pop.addEventListener("change",function(e){var t=e.target;
  if(t.id==="atMoAll"){if(t.checked)months.length=0;}
  else if(t.classList&&t.classList.contains("at-mo")){var v=t.value,i=months.indexOf(v);if(t.checked){if(i<0)months.push(v);}else if(i>=0)months.splice(i,1);}
  buildMonthFilter();render();announceMonths();});
})();
document.querySelectorAll('.nav[data-page="automation"]').forEach(function(b){b.addEventListener("click",function(){buildMonthFilter();render();});});
buildMonthFilter();render();
})();

;
/* js/06-internal-map.js */
(function(){
var box=document.getElementById("intMapResult");if(!box)return;
var KEY="worktracker-internal-perf-v1";
var DEFURL="https://docs.google.com/spreadsheets/d/124Bd7PsUtavxRBYCmcA-Fh00bcvXOt5MWKzFV0idaHY/edit";
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function q(id){return document.getElementById(id);}
function loadD(){try{return JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){return null;}}
function ci(H,name){for(var i=0;i<H.length;i++){if((H[i]||"").trim()===name)return i;}return -1;}
function render(){
 var d=loadD();
 if(!d||!d.headers){box.innerHTML='<div class="tiny muted">ยังไม่ได้ Mapping ข้อมูล · กดปุ่ม “⬇ Mapping ข้อมูล Internal” เพื่อดึงจาก Google Sheet</div>';return;}
 var H=d.headers,rows=d.rows||[];
 var iRead=ci(H,"ร้านที่อ่านแล้ว"),iStat=ci(H,"สถานะ"),iPri=ci(H,"ความสำคัญ");
 var totalRead=0;if(iRead>=0)rows.forEach(function(r){var v=parseInt(String(r[iRead]||"").replace(/[^0-9]/g,""),10);if(!isNaN(v))totalRead+=v;});
 var pub=iStat>=0?rows.filter(function(r){return String(r[iStat]||"").indexOf("เผยแพร่")>=0;}).length:0;
 var imp=iPri>=0?rows.filter(function(r){return String(r[iPri]||"").indexOf("สำคัญ")>=0;}).length:0;
 var cards='<div class="cards" style="margin-bottom:14px"><div class="card"><div class="klabel">ประกาศทั้งหมด</div><div class="knum">'+(d.total||rows.length)+'</div></div><div class="card"><div class="klabel">รวมร้านที่อ่านแล้ว</div><div class="knum">'+totalRead.toLocaleString()+'</div></div><div class="card"><div class="klabel">เผยแพร่แล้ว</div><div class="knum">'+pub+'</div></div><div class="card"><div class="klabel">ระดับสำคัญ</div><div class="knum">'+imp+'</div></div></div>';
 var cap=Math.min(rows.length,300);
 var thead='<thead><tr>'+H.map(function(x){return '<th>'+esc(x)+'</th>';}).join("")+'</tr></thead>';
 var body='<tbody>';for(var i=0;i<cap;i++){var r=rows[i];body+='<tr>'+H.map(function(_,j){return '<td>'+esc(r[j]||"")+'</td>';}).join("")+'</tr>';}body+='</tbody>';
 var note='<div class="tiny muted" style="margin-top:8px">'+((d.total>cap)?('แสดง '+cap+' จาก '+d.total+' รายการ · '):'')+'อัปเดตล่าสุด '+esc(d.at||"")+'</div>';
 box.innerHTML=cards+'<div class="tablewrap" style="max-height:430px;overflow:auto;border:1px solid var(--line);border-radius:10px"><table class="table">'+thead+body+'</table></div>'+note;
}
var mb=q("intMapModal");
function open(){q("intMapUrl").value=(loadD()&&loadD().url)||DEFURL;var m=q("intMapMsg");m.textContent="";m.style.color="";mb.classList.add("open");}
function close(){mb.classList.remove("open");}
q("intMapBtn").onclick=open;q("intMapClose").onclick=close;q("intMapCancel").onclick=close;mb.onclick=function(e){if(e.target===mb)close();};
q("intMapFetch").onclick=function(){
 var url=(q("intMapUrl").value||"").trim();var m=q("intMapMsg");
 if(!url){m.style.color="#be5954";m.textContent="กรุณาวางลิงก์";return;}
 var btn=q("intMapFetch");btn.disabled=true;var o=btn.textContent;btn.textContent="กำลังดึง...";m.style.color="";m.textContent="กำลังดึงข้อมูลจากชีต...";
 fetch("/api/raw-sheet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:url})}).then(function(r){return r.json();}).then(function(d){
  btn.disabled=false;btn.textContent=o;
  if(!d.ok){m.style.color="#be5954";m.textContent="ไม่สำเร็จ: "+(d.error||"");return;}
  var rec={url:url,headers:d.headers,rows:d.rows,total:d.total,at:new Date().toLocaleString("th-TH")};
  try{localStorage.setItem(KEY,JSON.stringify(rec));}catch(e){}
  close();render();if(window.notify)notify("Mapping ข้อมูล Internal "+d.total+" รายการแล้ว");
 }).catch(function(){btn.disabled=false;btn.textContent=o;m.style.color="#be5954";m.textContent="ดึงข้อมูลไม่สำเร็จ";});
};
document.querySelectorAll('.nav[data-page="automation"]').forEach(function(b){b.addEventListener("click",render);});
render();
})();
;
/* inline */
(function(){if(typeof recordStatusSnapshot==="function"){recordStatusSnapshot();if(typeof render==="function")render();}document.querySelectorAll(".status-range").forEach(function(b){b.onclick=function(){window.statusRange=b.dataset.range;if(typeof render==="function")render();};});document.querySelectorAll(".status-field").forEach(function(b){b.onclick=function(){window.statusDateField=b.dataset.field;if(typeof render==="function")render();};});})();
;
/* js/07-dept-stats.js */
(function(){
var body=document.getElementById("deptStatsBody");if(!body)return;
var DK="worktracker-dept-data-v1",QK="worktracker-dept-quota-v1";
var DEFURL="https://docs.google.com/spreadsheets/d/1Ie1IIGYw3cBELD5M9WR098obVKQ0mEdeKLeBpwVGUW8/edit";
var GDEF={m:40,d:5,near:80};
var TM=["","มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
var selYM=null, mgrName="";
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function q(id){return document.getElementById(id);}
function loadJSON(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v==null?d:v;}catch(e){return d;}}
function ymLabel(ym){var p=ym.split("-");return TM[parseInt(p[1],10)]+" "+(parseInt(p[0],10)+543);}
function pdate(s){s=(s||"").trim();var p=s.split("/");if(p.length!==3)return null;var d=parseInt(p[0],10),m=parseInt(p[1],10),y=parseInt(p[2],10);if(isNaN(d)||isNaN(m)||isNaN(y))return null;if(y<100)y=2500+y;if(y>2400)y-=543;var ym=y+"-"+("0"+m).slice(-2);return {ym:ym,ymd:ym+"-"+("0"+d).slice(-2)};}
function ci(H,name){for(var i=0;i<H.length;i++){if((H[i]||"").trim()===name)return i;}return -1;}
function recsOf(){var d=loadJSON(DK,null);if(!d||!d.headers)return null;var all=[d.headers].concat(d.rows||[]);var hi=-1;for(var i=0;i<all.length;i++){var found=false;for(var c=0;c<all[i].length;c++){if((all[i][c]||"").trim()==="หน่วยงาน"){found=true;break;}}if(found){hi=i;break;}}if(hi<0)return [];var H=all[hi];var iD=ci(H,"DATE");if(iD<0)iD=ci(H,"วันที่");var iN=ci(H,"จำนวน");var iU=ci(H,"หน่วยงาน");var out=[];for(var j=hi+1;j<all.length;j++){var r=all[j];var dept=(r[iU]||"").trim();if(!dept)continue;var pd=pdate(r[iD]);if(!pd)continue;var qv=iN>=0?parseInt(String(r[iN]||"").replace(/[^0-9]/g,""),10):1;if(isNaN(qv)||qv<=0)qv=1;out.push({ym:pd.ym,ymd:pd.ymd,dept:dept,qty:qv});}return out;}
function prevYM(ym){var p=ym.split("-");var y=parseInt(p[0],10),m=parseInt(p[1],10)-1;if(m<1){m=12;y--;}return y+"-"+("0"+m).slice(-2);}
function quotaMonth(ym){var all=loadJSON(QK,{});return all[ym]||{};}
function deptQuota(ym,dept){var qm=quotaMonth(ym);var def=qm._default||{m:GDEF.m,d:GDEF.d};var s=qm[dept];return {m:(s&&s.m!=null)?s.m:def.m,d:(s&&s.d!=null)?s.d:def.d};}
function nearPct(ym){var qm=quotaMonth(ym);return (qm._near!=null?qm._near:GDEF.near);}
function agg(recs,ym){var cur=recs.filter(function(r){return r.ym===ym;});var byDept={};cur.forEach(function(r){var o=byDept[r.dept]=byDept[r.dept]||{count:0,byDay:{}};o.count+=r.qty;o.byDay[r.ymd]=(o.byDay[r.ymd]||0)+r.qty;});var prev={};recs.filter(function(r){return r.ym===prevYM(ym);}).forEach(function(r){prev[r.dept]=(prev[r.dept]||0)+r.qty;});return {byDept:byDept,prev:prev};}
function render(){
 var recs=recsOf();
 var sel=q("deptMonth");
 if(!recs){body.innerHTML='<div class="tiny muted">ยังไม่ได้ดึงข้อมูล · กดปุ่ม “⬇ Mapping ข้อมูล” เพื่อดึงจาก Google Sheet</div>';q("deptCards").innerHTML="";q("deptAlerts").innerHTML="";sel.innerHTML="";return;}
 var months=[];recs.forEach(function(r){if(months.indexOf(r.ym)<0)months.push(r.ym);});months.sort().reverse();
 if(!selYM||months.indexOf(selYM)<0)selYM=months[0]||"";
 sel.innerHTML=months.map(function(m){return '<option value="'+m+'"'+(m===selYM?' selected':'')+'>'+esc(ymLabel(m))+'</option>';}).join("");
 var A=agg(recs,selYM);var depts=Object.keys(A.byDept);
 var near=nearPct(selYM)/100;
 var rows=depts.map(function(dp){var o=A.byDept[dp];var qo=deptQuota(selYM,dp);var mx=0;for(var k in o.byDay)if(o.byDay[k]>mx)mx=o.byDay[k];var pctM=qo.m>0?o.count/qo.m:0;var st=(o.count>qo.m||(qo.d>0&&mx>qo.d))?"over":((pctM>=near)?"near":"ok");return {dept:dp,count:o.count,prev:A.prev[dp]||0,qm:qo.m,qd:qo.d,mx:mx,pct:pctM,st:st};});
 rows.sort(function(a,b){return b.pct-a.pct||b.count-a.count;});
 var over=rows.filter(function(r){return r.st==="over";}),nearR=rows.filter(function(r){return r.st==="near";});
 var total=rows.reduce(function(n,r){return n+r.count;},0);
 q("deptMeta").textContent="เดือน "+ymLabel(selYM)+" · "+depts.length+" หน่วยงาน · "+total+" ฉบับ";
 q("deptCards").innerHTML=[["หน่วยงานทั้งหมด",depts.length,"ในเดือนนี้"],["ฉบับรวมเดือนนี้",total,"ทุกหน่วยงาน"],["ใกล้ถึงโควตา",nearR.length,"≥"+nearPct(selYM)+"%"],["เกินโควตา",over.length,over.length?"ต้องแจ้งด่วน":"ปกติ"]].map(function(a){return '<div class="card"><div class="klabel">'+a[0]+'</div><div class="knum"'+(a[0]==="เกินโควตา"&&over.length?' style="color:#be5954"':'')+'>'+a[1]+'</div><div class="trend">'+esc(a[2])+'</div></div>';}).join("");
 // alerts
 var al="";
 if(over.length){al+=over.map(function(r){var to=mgrName?('· แจ้งด่วนถึง Manager: '+esc(mgrName)):'· ⚠ ยังไม่ได้กำหนด Manager ในสิทธิ์ทีม';return '<div class="comm-alert">⚑ <b>'+esc(r.dept)+'</b> เกินโควตา '+r.count+'/'+r.qm+' ฉบับ'+(r.qd>0&&r.mx>r.qd?(' · สูงสุด/วัน '+r.mx+' เกิน '+r.qd):'')+' '+to+'</div>';}).join("");}
 if(nearR.length){al+=nearR.map(function(r){return '<div class="comm-takeaway">▲ <b>'+esc(r.dept)+'</b> ใกล้ถึงโควตา '+r.count+'/'+r.qm+' ฉบับ ('+Math.round(r.pct*100)+'%)</div>';}).join("");}
 if(!over.length&&!nearR.length)al='<div class="tiny muted">ยังไม่มีหน่วยงานที่ใกล้/เกินโควตาในเดือนนี้</div>';
 window.__deptOver={ym:selYM,items:over.map(function(r){return {dept:r.dept,count:r.count,qm:r.qm,mx:r.mx,qd:r.qd};})};q("deptAlerts").innerHTML='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">⚑ การแจ้งเตือนโควตา</h3>'+(over.length?'<button class="ghost" onclick="wtLineSendQuota()">📤 แจ้งเตือนด่วนทาง LINE</button>':'')+'</div>'+al+'</div>';if(over.length&&window.wtLineAutoNotify)window.wtLineAutoNotify();
 // table
 var head='<div class="tablewrap"><table class="table"><thead><tr><th>หน่วยงาน</th><th>ฉบับเดือนนี้</th><th>เดือนก่อน</th><th>โควตา/เดือน</th><th>% ใช้</th><th>สูงสุด/วัน</th><th>โควตา/วัน</th><th>สถานะ</th></tr></thead><tbody>';
 var stpill={ok:'<span class="pill s-done">ปกติ</span>',near:'<span class="pill s-review">ใกล้ถึง</span>',over:'<span class="pill s-revision">เกิน</span>'};
 var tb=rows.map(function(r){var chg=r.count-r.prev;var chgTxt=r.prev?((chg>0?'+':'')+chg):'—';return '<tr><td>'+esc(r.dept)+'</td><td><b>'+r.count+'</b></td><td class="muted">'+r.prev+' ('+chgTxt+')</td><td>'+r.qm+'</td><td>'+Math.round(r.pct*100)+'%</td><td'+(r.qd>0&&r.mx>r.qd?' style="color:#be5954"':'')+'>'+r.mx+'</td><td>'+r.qd+'</td><td>'+(stpill[r.st]||'')+'</td></tr>';}).join("");
 body.innerHTML=head+(tb||'<tr><td colspan="8" class="empty">ไม่มีข้อมูล</td></tr>')+'</tbody></table></div>';
}
// month select change
q("deptMonth").onchange=function(){selYM=this.value;render();};
// manager name from users
fetch("/api/users").then(function(r){return r.json();}).then(function(d){var us=(d&&d.users)||[];var m=us.filter(function(u){return /(manager|admin|ผู้จัดการ|ผู้ดูแล)/i.test(u.role||"");});mgrName=m.map(function(u){return u.name;}).join(", ");render();}).catch(function(){});
// map modal
var mm=q("deptMapModal");
q("deptMapBtn").onclick=function(){q("deptMapUrl").value=(loadJSON(DK,{}).url)||DEFURL;var x=q("deptMapMsg");x.textContent="";x.style.color="";mm.classList.add("open");};
q("deptMapClose").onclick=q("deptMapCancel").onclick=function(){mm.classList.remove("open");};mm.onclick=function(e){if(e.target===mm)mm.classList.remove("open");};
q("deptMapFetch").onclick=function(){var url=(q("deptMapUrl").value||"").trim();var x=q("deptMapMsg");if(!url){x.style.color="#be5954";x.textContent="กรุณาวางลิงก์";return;}var b=q("deptMapFetch");b.disabled=true;var o=b.textContent;b.textContent="กำลังดึง...";x.style.color="";x.textContent="กำลังดึงข้อมูล...";fetch("/api/raw-sheet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:url})}).then(function(r){return r.json();}).then(function(d){b.disabled=false;b.textContent=o;if(!d.ok){x.style.color="#be5954";x.textContent="ไม่สำเร็จ: "+(d.error||"");return;}localStorage.setItem(DK,JSON.stringify({url:url,headers:d.headers,rows:d.rows,total:d.total,at:new Date().toLocaleString("th-TH")}));mm.classList.remove("open");selYM=null;render();if(window.notify)notify("ดึงข้อมูลรายหน่วยงาน "+d.total+" รายการแล้ว");}).catch(function(){b.disabled=false;b.textContent=o;x.style.color="#be5954";x.textContent="ดึงข้อมูลไม่สำเร็จ";});};
// quota modal
var qm2=q("deptQuotaModal");
q("deptQuotaBtn").onclick=function(){var recs=recsOf();if(!recs){if(window.notify)notify("กรุณาดึงข้อมูลก่อน");return;}q("deptQuotaTitle").textContent="ตั้งค่าโควตาฉบับ · "+ymLabel(selYM);var conf=quotaMonth(selYM);var def=conf._default||{m:GDEF.m,d:GDEF.d};q("deptDefM").value=def.m;q("deptDefD").value=def.d;q("deptNear").value=(conf._near!=null?conf._near:GDEF.near);var A=agg(recs,selYM);var depts=Object.keys(A.byDept).sort(function(a,b){return A.byDept[b].count-A.byDept[a].count;});q("deptQuotaRows").innerHTML=depts.map(function(dp){var s=conf[dp]||{};return '<tr><td>'+esc(dp)+'</td><td>'+A.byDept[dp].count+'</td><td><input type="number" min="0" step="1" class="dq-m" data-dp="'+esc(dp)+'" value="'+(s.m!=null?s.m:"")+'" placeholder="ค่าเริ่มต้น" style="width:90px;padding:6px;border:1px solid #d8e3f0;border-radius:8px"></td><td><input type="number" min="0" step="1" class="dq-d" data-dp="'+esc(dp)+'" value="'+(s.d!=null?s.d:"")+'" placeholder="ค่าเริ่มต้น" style="width:80px;padding:6px;border:1px solid #d8e3f0;border-radius:8px"></td></tr>';}).join("");qm2.classList.add("open");};
q("deptQuotaClose").onclick=q("deptQuotaCancel").onclick=function(){qm2.classList.remove("open");};qm2.onclick=function(e){if(e.target===qm2)qm2.classList.remove("open");};
q("deptQuotaSave").onclick=function(){var all=loadJSON(QK,{});var conf={_default:{m:parseInt(q("deptDefM").value,10)||0,d:parseInt(q("deptDefD").value,10)||0},_near:Math.min(100,Math.max(1,parseInt(q("deptNear").value,10)||GDEF.near))};document.querySelectorAll(".dq-m").forEach(function(inp){var dp=inp.dataset.dp;var mv=inp.value.trim();var dinp=document.querySelector('.dq-d[data-dp="'+dp.replace(/"/g,'\\"')+'"]');var dv=dinp?dinp.value.trim():"";if(mv!==""||dv!==""){conf[dp]=conf[dp]||{};if(mv!=="")conf[dp].m=parseInt(mv,10);if(dv!=="")conf[dp].d=parseInt(dv,10);}});all[selYM]=conf;localStorage.setItem(QK,JSON.stringify(all));qm2.classList.remove("open");render();if(window.notify)notify("บันทึกโควตาเดือน "+ymLabel(selYM)+" แล้ว");};
document.querySelectorAll('.nav[data-page="deptstats"]').forEach(function(b){b.addEventListener("click",render);});
render();
})();
;
/* js/08-line-notify.js */
(function(){
var m=document.getElementById("lineModal");if(!m)return;
function q(id){return document.getElementById(id);}
var lineAuto=false;
function status(){return fetch("/api/line/status").then(function(r){return r.json();}).then(function(d){lineAuto=!!d.auto;var el=q("lineStatus");if(el)el.textContent="สถานะ: Token "+(d.configured?("ตั้งแล้ว (…"+d.token_tail+")"):"ยังไม่ได้ตั้ง")+" · Manager "+(d.manager?"✓":"—")+" · Group "+(d.group?"✓":"—")+" · อัตโนมัติ "+(d.auto?"เปิด":"ปิด");if(q("lineAuto"))q("lineAuto").checked=!!d.auto;return d;}).catch(function(){});}
var btn=q("lineCfgBtn");if(btn)btn.onclick=function(){q("lineToken").value="";var mm=q("lineMsg");mm.textContent="";mm.style.color="";status();m.classList.add("open");};
q("lineClose").onclick=q("lineCancel").onclick=function(){m.classList.remove("open");};m.onclick=function(e){if(e.target===m)m.classList.remove("open");};
q("lineSave").onclick=function(){var body={manager_id:q("lineManager").value.trim(),group_id:q("lineGroup").value.trim(),auto:q("lineAuto").checked};var t=q("lineToken").value.trim();if(t)body.token=t;var mm=q("lineMsg");mm.style.color="";mm.textContent="กำลังบันทึก...";fetch("/api/line/config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json();}).then(function(d){mm.style.color=d.ok?"#2e7d32":"#be5954";mm.textContent=d.ok?"บันทึกแล้ว":("ไม่สำเร็จ: "+(d.error||""));q("lineToken").value="";status();}).catch(function(){mm.style.color="#be5954";mm.textContent="บันทึกไม่สำเร็จ";});};
q("lineTest").onclick=function(){var mm=q("lineMsg");mm.style.color="";mm.textContent="กำลังส่งทดสอบ...";fetch("/api/line/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:"🔔 ทดสอบการแจ้งเตือนจาก Work Tracker",targets:["manager","group"]})}).then(function(r){return r.json();}).then(function(d){var parts=[];var rs=d.results||{};for(var k in rs){parts.push(k+": "+(rs[k].ok?"สำเร็จ":("ล้มเหลว "+(rs[k].error||""))));}mm.style.color=d.ok?"#2e7d32":"#be5954";mm.textContent=parts.join(" · ")||("ผล: "+(d.error||"ตรวจการตั้งค่า"));}).catch(function(){mm.style.color="#be5954";mm.textContent="ส่งไม่สำเร็จ";});};
var TM=["","มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
function ymL(ym){if(!ym)return"";var p=ym.split("-");return TM[parseInt(p[1],10)]+" "+(parseInt(p[0],10)+543);}
function overText(o){var lines=o.items.map(function(r){return "• "+r.dept+" "+r.count+"/"+r.qm+" ฉบับ"+((r.qd>0&&r.mx>r.qd)?(" (สูงสุด/วัน "+r.mx+" เกิน "+r.qd+")"):"");});return "⚑ แจ้งเตือนด่วน · สถิติหน่วยงาน ("+ymL(o.ym)+")\nหน่วยงานที่เกินโควตา:\n"+lines.join("\n")+"\n\nโปรดตรวจสอบใน Work Tracker";}
window.wtLineSendQuota=function(){var o=window.__deptOver;if(!o||!o.items||!o.items.length){if(window.notify)notify("ไม่มีหน่วยงานที่เกินโควตา");return;}var text=overText(o);if(!confirm("ส่งแจ้งเตือนด่วนนี้ไปยัง LINE ของ Manager และกลุ่ม?\n\n"+text))return;fetch("/api/line/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:text,targets:["manager","group"]})}).then(function(r){return r.json();}).then(function(d){if(!window.notify)return;if(d.ok)notify("ส่งแจ้งเตือน LINE แล้ว");else{var e="";var rs=d.results||{};for(var k in rs){if(!rs[k].ok)e=rs[k].error||"";}notify("ส่งไม่สำเร็จ: "+(e||d.error||"ตรวจการตั้งค่า LINE"));}}).catch(function(){window.notify&&notify("ส่ง LINE ไม่สำเร็จ");});};
var autoTried=false;
window.wtLineAutoNotify=function(){if(autoTried)return;autoTried=true;var o=window.__deptOver;if(!o||!o.items||!o.items.length)return;fetch("/api/line/notify-quota",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ym:o.ym,items:o.items})}).then(function(r){return r.json();}).then(function(d){if(d&&d.ok&&d.sent>0&&window.notify)notify("ส่งแจ้งเตือน LINE อัตโนมัติ "+d.sent+" หน่วยงาน");}).catch(function(){});};
status();
})();
;
/* js/09-dept-matrix.js */
(function(){
var mb=document.getElementById("deptMatrixBody");if(!mb)return;
var DK="worktracker-dept-data-v1";
var TM=["","มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
function esc(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function q(id){return document.getElementById(id);}
function ci(H,name){for(var i=0;i<H.length;i++){if((H[i]||"").trim()===name)return i;}return -1;}
function pdate(s){s=(s||"").trim();var p=s.split("/");if(p.length!==3)return null;var d=parseInt(p[0],10),m=parseInt(p[1],10),y=parseInt(p[2],10);if(isNaN(d)||isNaN(m)||isNaN(y))return null;if(y<100)y=2500+y;if(y>2400)y-=543;return {y:y,ym:y+"-"+("0"+m).slice(-2),ymd:y+"-"+("0"+m).slice(-2)+"-"+("0"+d).slice(-2)};}
function loadRecs(){var d=null;try{d=JSON.parse(localStorage.getItem(DK)||"null");}catch(e){}if(!d||!d.headers)return null;var all=[d.headers].concat(d.rows||[]);var hi=-1;for(var i=0;i<all.length;i++){var f=false;for(var c=0;c<all[i].length;c++){if((all[i][c]||"").trim()==="หน่วยงาน"){f=true;break;}}if(f){hi=i;break;}}if(hi<0)return [];var H=all[hi];var iD=ci(H,"DATE");if(iD<0)iD=ci(H,"วันที่");var iN=ci(H,"จำนวน");var iU=ci(H,"หน่วยงาน");var iC=ci(H,"ช่องทาง");var iT=ci(H,"หัวข้อ");var iTt=ci(H,"เรื่อง");var out=[];for(var j=hi+1;j<all.length;j++){var r=all[j];var dept=(r[iU]||"").trim();if(!dept)continue;var pd=pdate(r[iD]);if(!pd)continue;var qv=iN>=0?parseInt(String(r[iN]||"").replace(/[^0-9]/g,""),10):1;if(isNaN(qv)||qv<=0)qv=1;out.push({y:pd.y,ym:pd.ym,ymd:pd.ymd,dept:dept,chan:(iC>=0?(r[iC]||"").trim():"")||"(ไม่ระบุ)",topic:(iT>=0?(r[iT]||"").trim():"")||"(ไม่ระบุ)",title:(iTt>=0?(r[iTt]||"").trim():""),dateStr:(iD>=0?(r[iD]||"").trim():""),qty:qv});}return out;}
var gran="month",pval=null,view="dept";var curRowDim="",curColDim="",curColKeys=[],curOther=[];
function uniq(a){var s={},o=[];a.forEach(function(x){if(!s[x]){s[x]=1;o.push(x);}});return o;}
function valsOf(recs){if(gran==="day")return uniq(recs.map(function(r){return r.ymd;})).sort().reverse();if(gran==="year")return uniq(recs.map(function(r){return String(r.y);})).sort().reverse();return uniq(recs.map(function(r){return r.ym;})).sort().reverse();}
function labelOf(v){if(gran==="day"){var p=v.split("-");return parseInt(p[2],10)+" "+TM[parseInt(p[1],10)]+" "+(parseInt(p[0],10)+543);}if(gran==="year")return "ปี "+(parseInt(v,10)+543);var p2=v.split("-");return TM[parseInt(p2[1],10)]+" "+(parseInt(p2[0],10)+543);}
function inPeriod(r){if(gran==="custom"){var rs=q("dvStart")?q("dvStart").value:"",re=q("dvEnd")?q("dvEnd").value:"";if(!rs&&!re)return true;if(rs&&r.ymd<rs)return false;if(re&&r.ymd>re)return false;return true;}if(gran==="day")return r.ymd===pval;if(gran==="year")return String(r.y)===pval;return r.ym===pval;}
function fieldOf(r,dim){return dim==="หน่วยงาน"?r.dept:dim==="ช่องทาง"?r.chan:r.topic;}
function setActive(cls,attr,val){document.querySelectorAll(cls).forEach(function(b){var on=b.getAttribute(attr)===val;b.classList.toggle("primary",on);b.classList.toggle("ghost",!on);});}
function renderMatrix(){
 var recs=loadRecs();
 if(!recs){mb.innerHTML='<div class="tiny muted">ยังไม่มีข้อมูล · กดปุ่ม “⬇ Mapping ข้อมูล”</div>';return;}
 var vs=valsOf(recs);if(!pval||vs.indexOf(pval)<0)pval=vs[0];
 q("dvPeriodVal").innerHTML=vs.map(function(v){return '<option value="'+esc(v)+'"'+(v===pval?' selected':'')+'>'+esc(labelOf(v))+'</option>';}).join("");
 setActive(".dv-gran","data-gran",gran);var _isC=(gran==="custom"),_ps=q("dvPeriodVal"),_ds=q("dvStart"),_de=q("dvEnd"),_dd=q("dvDash");if(_ps)_ps.hidden=_isC;[_ds,_de,_dd].forEach(function(x){if(x)x.hidden=!_isC;});if(_isC){var _t=new Date().toISOString().slice(0,10);if(_ds&&!_ds.value)_ds.value=_t;if(_de&&!_de.value)_de.value=_t;}
 var rowDim=q("dvRow").value,colDim=q("dvCol").value;
 var f=recs.filter(inPeriod);
 var rowsSet={},colsSet={},cell={},rowTot={},colTot={},grand=0,maxc=0;
 f.forEach(function(r){var rk=fieldOf(r,rowDim),ck=fieldOf(r,colDim);rowsSet[rk]=1;colsSet[ck]=1;var key=rk+"||"+ck;cell[key]=(cell[key]||0)+r.qty;rowTot[rk]=(rowTot[rk]||0)+r.qty;colTot[ck]=(colTot[ck]||0)+r.qty;grand+=r.qty;});
 var rowKeys=Object.keys(rowsSet).sort(function(a,b){return rowTot[b]-rowTot[a];});
 var colKeys=Object.keys(colsSet).sort(function(a,b){return colTot[b]-colTot[a];});
 var CAP=20,otherCols=[];if(colKeys.length>CAP){otherCols=colKeys.slice(CAP);colKeys=colKeys.slice(0,CAP);}curRowDim=rowDim;curColDim=colDim;curColKeys=colKeys;curOther=otherCols;
 function cellVal(rk,ck){return cell[rk+"||"+ck]||0;}
 function otherVal(rk){var s=0;otherCols.forEach(function(ck){s+=cellVal(rk,ck);});return s;}
 rowKeys.forEach(function(rk){colKeys.forEach(function(ck){var v=cellVal(rk,ck);if(v>maxc)maxc=v;});if(otherCols.length){var ov=otherVal(rk);if(ov>maxc)maxc=ov;}});
 function bg(v){if(!v)return "";var a=maxc?(0.12+0.55*v/maxc):0;return 'background:rgba(23,102,204,'+a.toFixed(2)+');color:'+(a>0.42?"#fff":"#13233a")+';text-align:center;font-weight:600';}
 var th='<thead><tr><th style="position:sticky;left:0;background:#f8faf8">'+esc(rowDim)+' \\ '+esc(colDim)+'</th>'+colKeys.map(function(c){return '<th style="text-align:center">'+esc(c)+'<br><span class="muted tiny">'+colTot[c]+'</span></th>';}).join("")+(otherCols.length?'<th style="text-align:center">อื่นๆ ('+otherCols.length+')</th>':'')+'<th style="text-align:center">รวม</th></tr></thead>';
 var tb='<tbody>'+rowKeys.map(function(rk){return '<tr><td style="position:sticky;left:0;background:#fff;font-weight:600">'+esc(rk)+'</td>'+colKeys.map(function(ck){var v=cellVal(rk,ck);return '<td'+(v?' class="mcell" data-rk="'+esc(rk)+'" data-ck="'+esc(ck)+'"':'')+' style="cursor:'+(v?'pointer':'default')+';'+bg(v)+'">'+(v||"")+'</td>';}).join("")+(otherCols.length?(function(){var ov=otherVal(rk);return '<td'+(ov?' class="mcell" data-rk="'+esc(rk)+'" data-ck="__OTHER__"':'')+' style="cursor:'+(ov?'pointer':'default')+';'+bg(ov)+'">'+(ov||"")+'</td>';})():'')+'<td style="text-align:center;font-weight:700">'+rowTot[rk]+'</td></tr>';}).join("");
 var footCols=colKeys.map(function(ck){return '<td style="text-align:center;font-weight:700">'+colTot[ck]+'</td>';}).join("");
 var footOther=otherCols.length?('<td style="text-align:center;font-weight:700">'+otherCols.reduce(function(n,ck){return n+colTot[ck];},0)+'</td>'):'';
 tb+='<tr><td style="position:sticky;left:0;background:#eef3fa;font-weight:700">รวม</td>'+footCols+footOther+'<td style="text-align:center;font-weight:800;background:#eef3fa">'+grand+'</td></tr></tbody>';
 mb.innerHTML='<div class="tiny muted" style="margin-bottom:8px">'+(gran==="custom"?((q("dvStart")&&q("dvStart").value||"?")+" ถึง "+(q("dvEnd")&&q("dvEnd").value||"?")):labelOf(pval))+' · '+rowKeys.length+' '+esc(rowDim)+' × '+(colKeys.length+(otherCols.length?1:0))+' '+esc(colDim)+' · รวม '+grand+' บันทึก'+(otherCols.length?(' · รวมคอลัมน์ที่เหลือ '+otherCols.length+' รายการไว้ใน “อื่นๆ”'):'')+'</div><div class="tablewrap" style="max-height:520px;overflow:auto;border:1px solid var(--line);border-radius:10px"><table class="table" style="white-space:nowrap">'+th+tb+'</table></div>';
}
function applyView(){
 var isM=view==="matrix";
 q("deptMatrixBody").hidden=!isM;q("dvMatrixCtl").hidden=!isM;q("deptStatsBody").hidden=isM;
 setActive(".dv-view","data-view",view);
 if(isM)renderMatrix();
}
document.querySelectorAll(".dv-view").forEach(function(b){b.onclick=function(){view=b.dataset.view;applyView();};});
document.querySelectorAll(".dv-gran").forEach(function(b){b.onclick=function(){gran=b.dataset.gran;pval=null;renderMatrix();};});
q("dvPeriodVal").onchange=function(){pval=this.value;renderMatrix();};var _ds2=q("dvStart"),_de2=q("dvEnd");if(_ds2)_ds2.onchange=renderMatrix;if(_de2)_de2.onchange=renderMatrix;
q("dvRow").onchange=renderMatrix;q("dvCol").onchange=renderMatrix;
document.querySelectorAll('.nav[data-page="deptstats"]').forEach(function(b){b.addEventListener("click",function(){if(view==="matrix")renderMatrix();});});
function openCell(rk,ck){var recs=loadRecs();if(!recs)return;var list=recs.filter(function(r){if(!inPeriod(r))return false;if(fieldOf(r,curRowDim)!==rk)return false;if(ck==="__OTHER__")return curColKeys.indexOf(fieldOf(r,curColDim))<0;return fieldOf(r,curColDim)===ck;});var ckL=ck==="__OTHER__"?"อื่นๆ":ck;var t=document.getElementById("mCellTitle");if(t)t.textContent=curRowDim+": "+rk+"  ×  "+curColDim+": "+ckL+"  ·  "+list.length+" บันทึก";var rowsH=list.map(function(r){return '<tr><td>'+esc(r.dateStr||r.ymd)+'</td><td>'+esc(r.title||"—")+'</td><td>'+esc(r.topic)+'</td><td>'+esc(r.chan)+'</td><td>'+esc(r.dept)+'</td></tr>';}).join("");document.getElementById("mCellBody").innerHTML='<div class="tablewrap" style="max-height:430px;overflow:auto"><table class="table"><thead><tr><th>วันที่</th><th>เรื่อง</th><th>หัวข้อ</th><th>ช่องทาง</th><th>หน่วยงาน</th></tr></thead><tbody>'+(rowsH||'<tr><td colspan="5" class="empty">ไม่มีรายการ</td></tr>')+'</tbody></table></div>';document.getElementById("mCellModal").classList.add("open");}
function tableToCSV(tbl){var lines=[];tbl.querySelectorAll("tr").forEach(function(tr){var cells=[];tr.querySelectorAll("th,td").forEach(function(c){var t=(c.innerText||c.textContent||"").replace(/\s+/g," ").trim();if(/[",\n]/.test(t))t='"'+t.replace(/"/g,'""')+'"';cells.push(t);});lines.push(cells.join(","));});return lines.join("\r\n");}
function dlCSV(name,csv){try{var blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},150);return true;}catch(e){return false;}}
function wtExportCard(){var isM=!document.getElementById("deptMatrixBody").hidden;var host=isM?document.getElementById("deptMatrixBody"):document.getElementById("deptStatsBody");var tbl=host?host.querySelector("table"):null;if(!tbl){if(window.notify)notify("ยังไม่มีตารางให้ส่งออก");return;}var csv=tableToCSV(tbl);var name=isM?("matrix-"+(pval||"data")+".csv"):("dept-quota-"+(pval||"data")+".csv");var ok=dlCSV(name,csv);if(window.notify)notify(ok?("ส่งออก CSV แล้ว: "+name):"ส่งออกไม่สำเร็จ");}
var _cm=document.getElementById("mCellModal");if(_cm){var _cc=document.getElementById("mCellClose");if(_cc)_cc.onclick=function(){_cm.classList.remove("open");};_cm.onclick=function(e){if(e.target===_cm)_cm.classList.remove("open");};}
mb.addEventListener("click",function(e){var t=e.target;while(t&&t!==mb&&!(t.className&&(""+t.className).indexOf("mcell")>=0))t=t.parentNode;if(t&&t!==mb&&t.getAttribute)openCell(t.getAttribute("data-rk"),t.getAttribute("data-ck"));});
var _ex=document.getElementById("dvExport");if(_ex)_ex.onclick=wtExportCard;
applyView();
})();
;
/* js/10-workflow.js */
(function(){
function q(id){return document.getElementById(id);}
function esc2(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
var ctx=null;
function openEdit(proj,comm,name){
  ctx={proj:proj,comm:comm,create:false};
  var _hh=document.querySelector('#projEditModal .modalhead h2');if(_hh)_hh.textContent="แก้ไขข้อมูลการ์ด";
  q("projEditName").value=name||"";
  q("projEditComm").value=(comm==="External"?"External":"Internal");
  var n=(typeof tasks!=="undefined")?tasks.filter(function(t){return t.project===proj;}).length:0;
  q("projEditInfo").textContent="การ์ดนี้รวม "+n+" งาน · การบันทึกจะปรับใช้กับทุกงานในการ์ดนี้";
  q("projEditModal").classList.add("open");
}
function closeEdit(){q("projEditModal").classList.remove("open");ctx=null;}
window.openProjCreate=function(){ctx={create:true};var _h=document.querySelector("#projEditModal .modalhead h2");if(_h)_h.textContent="สร้าง Projects & Teams";q("projEditName").value="";q("projEditComm").value="Internal";q("projEditInfo").textContent="สร้างการ์ดใหม่ · จะเพิ่มเข้า Projects & Teams (0 งาน จนกว่าจะมอบหมายงาน)";q("projEditModal").classList.add("open");};
function delProj(proj,name){var TT=(typeof tasks!=="undefined"&&tasks)?tasks:[];var n=TT.filter(function(t){return t.project===proj;}).length;var msg="ลบการ์ดโปรเจกต์ “"+(name||proj)+"” ออกจาก Projects & Teams?"+(n?("\n(งาน "+n+" รายการยังอยู่ในระบบ ไม่ถูกลบ)"):"");if(!window.confirm(msg))return;try{var l=JSON.parse(localStorage.getItem("worktracker-projteams-v1")||"[]");l=l.filter(function(x){return (x&&x.name?x.name:x)!==proj;});localStorage.setItem("worktracker-projteams-v1",JSON.stringify(l));}catch(e){}try{var a=JSON.parse(localStorage.getItem("worktracker-proj-archived-v1")||"[]");if(!Array.isArray(a))a=[];if(a.indexOf(proj)<0)a.push(proj);localStorage.setItem("worktracker-proj-archived-v1",JSON.stringify(a));}catch(e){}if(typeof render==="function")render();if(typeof notify==="function")notify("ลบการ์ด “"+(name||proj)+"” แล้ว"+(n?(" · เก็บงาน "+n+" รายการไว้"):""));}
function restoreProj(proj){try{var a=JSON.parse(localStorage.getItem("worktracker-proj-archived-v1")||"[]");if(!Array.isArray(a))a=[];a=a.filter(function(x){return x!==proj;});localStorage.setItem("worktracker-proj-archived-v1",JSON.stringify(a));}catch(e){}if(typeof render==="function")render();if(typeof notify==="function")notify("กู้คืนโปรเจกต์ “"+proj+"” แล้ว");}
function purgeProj(proj){
  var n=((typeof tasks!=="undefined"&&tasks)?tasks:[]).filter(function(t){return t.project===proj;}).length;
  if(!window.confirm("ลบโปรเจกต์ “"+proj+"” ออกถาวร?"+(n?("\n(งาน "+n+" รายการจะยังอยู่ในระบบ ไม่ถูกลบ · การ์ดโปรเจกต์จะถูกเอาออกถาวร)"):"\nการ์ดโปรเจกต์นี้จะถูกเอาออกถาวร")))return;
  try{var pur=JSON.parse(localStorage.getItem("worktracker-proj-purged-v1")||"[]");if(!Array.isArray(pur))pur=[];if(pur.indexOf(proj)<0)pur.push(proj);localStorage.setItem("worktracker-proj-purged-v1",JSON.stringify(pur));}catch(e){}
  try{var a=JSON.parse(localStorage.getItem("worktracker-proj-archived-v1")||"[]");if(!Array.isArray(a))a=[];a=a.filter(function(x){return x!==proj;});localStorage.setItem("worktracker-proj-archived-v1",JSON.stringify(a));}catch(e){}
  try{var l=JSON.parse(localStorage.getItem("worktracker-projteams-v1")||"[]");if(Array.isArray(l)){l=l.filter(function(x){return (x&&x.name?x.name:x)!==proj;});localStorage.setItem("worktracker-projteams-v1",JSON.stringify(l));}}catch(e){}
  if(typeof render==="function")render();
  if(typeof notify==="function")notify("ลบโปรเจกต์ “"+proj+"” ออกถาวรแล้ว");
}
// intercept the edit button before the card's openProject click fires
document.addEventListener("click",function(e){
  var b=e.target.closest(".projedit");
  if(b){e.stopPropagation();e.preventDefault();openEdit(b.getAttribute("data-proj"),b.getAttribute("data-comm"),b.getAttribute("data-name"));return;}
  var d=e.target.closest(".projdel");
  if(d){e.stopPropagation();e.preventDefault();delProj(d.getAttribute("data-proj"),d.getAttribute("data-name"));return;}
  var pb=e.target.closest(".projpurge");
  if(pb){e.stopPropagation();e.preventDefault();purgeProj(pb.getAttribute("data-proj"));return;}
  var rb=e.target.closest(".projrestore");
  if(rb){e.stopPropagation();e.preventDefault();restoreProj(rb.getAttribute("data-proj"));}
},true);
function wire(){
  var m=q("projEditModal");if(!m)return;
  q("projEditClose").onclick=closeEdit;q("projEditCancel").onclick=closeEdit;
  m.onclick=function(e){if(e.target===m)closeEdit();};
  var _nb=q("newProjTeam");if(_nb)_nb.onclick=function(){if(window.openProjCreate)openProjCreate();};
  function _loadPT(){try{return JSON.parse(localStorage.getItem("worktracker-projteams-v1")||"[]");}catch(e){return [];}}
  function _savePT(l){try{localStorage.setItem("worktracker-projteams-v1",JSON.stringify(l));}catch(e){}}
  q("projEditSave").onclick=function(){
    if(!ctx)return;
    var newName=(q("projEditName").value||"").trim();
    var newComm=q("projEditComm").value;
    if(!newName){q("projEditInfo").textContent="กรุณากรอกชื่อ";return;}
    if(ctx.create){
      var l=_loadPT();
      if(l.some(function(x){return x&&x.name===newName;})){q("projEditInfo").textContent="มีชื่อนี้อยู่แล้ว";return;}
      l.push({name:newName,comm:newComm});_savePT(l);
      try{if(typeof render==="function")render();}catch(e){}
      closeEdit();
      try{if(typeof notify==="function")notify("สร้าง “"+newName+"” แล้ว");}catch(e){}
      return;
    }
    var grp=(typeof tasks!=="undefined")?tasks.filter(function(t){return t.project===ctx.proj;}):[];
    grp.forEach(function(t){
      t.project=newName;
      t.comm=newComm;
      if(t.brief){t.brief=t.brief.replace(/หน่วยงาน:\s*[^·]+/, "หน่วยงาน: "+newName);}
    });
    var l2=_loadPT(),ch=false;l2.forEach(function(x){if(x&&x.name===ctx.proj){x.name=newName;x.comm=newComm;ch=true;}});if(ch)_savePT(l2);
    try{if(typeof persist==="function")persist();}catch(e){}
    try{if(typeof render==="function")render();}catch(e){}
    closeEdit();
    try{if(typeof notify==="function")notify("บันทึกการ์ด “"+newName+"” แล้ว"+(grp.length?(" ("+grp.length+" งาน)"):""));}catch(e){}
  };
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();
;
/* js/12-task-types.js */
(function(){
var MAP=[['tm_note','บันทึก','Copy'],['tm_info','Infographic','Infographic'],['tm_vdo','VDO','Video']];
var TM_DETAILS={'บันทึก':['สื่อสารทั่วไป','BlankForm'],'Infographic':['มีPattern(บันทึก)','New Design','กระบวนการละเอียด'],'VDO':['Short Clip','Long Clip','ข้อมูลซับซ้อน','Editing']};
function q(id){return document.getElementById(id);}
window.wtTypes=function(){var types=[],kind='',lead='';MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(c&&c.checked){var owner=o?o.value:'';types.push({type:m[1],owner:owner,detail:d?d.value:''});if(!kind){kind=m[2];lead=owner;}}});return {types:types,kind:kind,lead:lead};};
window.wtFillTypes=function(t){var ppl=(typeof people!=='undefined'&&people)?people:[];var byOwn={},byDet={};((t&&t.types)||[]).forEach(function(x){if(x&&x.type){byOwn[x.type]=x.owner||'';byDet[x.type]=x.detail||'';}});
 var hasTypes=!!(t&&t.types&&t.types.length);
 MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(!c||!o)return;
  o.innerHTML=ppl.map(function(p){return '<option value="'+p+'">'+p+'</option>';}).join('');
  if(d){var _dl=((window.DDdetail?window.DDdetail(m[1]):null)||TM_DETAILS[m[1]]||[]).slice();if(hasTypes&&(m[1] in byDet)&&byDet[m[1]]&&_dl.indexOf(byDet[m[1]])<0)_dl.push(byDet[m[1]]);d.innerHTML=_dl.map(function(x){return '<option value="'+x+'">'+x+'</option>';}).join('');}
  if(hasTypes){var on=(m[1] in byOwn);c.checked=on;o.value=on?(byOwn[m[1]]||(t.lead||ppl[0])):((t&&t.lead)||ppl[0]);if(d&&on&&byDet[m[1]])d.value=byDet[m[1]];}
  else{var match=(t&&((t.kind==='Copy'&&m[1]==='บันทึก')||(t.kind==='Infographic'&&m[1]==='Infographic')||(t.kind==='Video'&&m[1]==='VDO')));c.checked=!!match;o.value=(t&&t.lead)||ppl[0];}
  o.disabled=!c.checked;if(d)d.disabled=!c.checked;});
};
function wire(){MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(c&&!c._wl){c._wl=1;c.addEventListener('change',function(){if(o)o.disabled=!c.checked;if(d)d.disabled=!c.checked;});}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
;
/* inline */
(function(){
function esc2(s){s=String(s==null?'':s);return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function wtProjectsFor(comm){var set={};try{tasks.forEach(function(t){if(t.project&&t.comm===comm)set[t.project]=1;});}catch(e){}
 try{(JSON.parse(localStorage.getItem('worktracker-projteams-v1'))||[]).forEach(function(x){if(x&&x.name&&(x.comm||'Internal')===comm)set[x.name]=1;});}catch(e){}
 var hide={};try{(JSON.parse(localStorage.getItem('worktracker-proj-archived-v1'))||[]).forEach(function(n){if(n)hide[n]=1;});}catch(e){}
 try{(JSON.parse(localStorage.getItem('worktracker-proj-purged-v1'))||[]).forEach(function(n){if(n)hide[n]=1;});}catch(e){}
 return Object.keys(set).filter(function(n){return !hide[n];});}
window.wtFillProjects=function(comm,selected){var el=document.getElementById('fProject');if(!el)return;
 var list=wtProjectsFor(comm);if(!list.length&&typeof projects!=='undefined')list=projects.slice();
 if(selected&&list.indexOf(selected)<0)list=[selected].concat(list);
 var sel=(selected&&list.indexOf(selected)>=0)?selected:(list[0]||'');
 el.innerHTML=list.map(function(p){return '<option value="'+esc2(p)+'"'+(p===sel?' selected':'')+'>'+esc2(p)+'</option>';}).join('');};
function wire(){var c=document.getElementById('fComm');if(c&&!c._wlp){c._wlp=1;c.addEventListener('change',function(){if(window.wtFillProjects)wtFillProjects(c.value,'');if(window.wtToggleNote)wtToggleNote();});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
;
/* js/13-team-perf-wiring.js */
(function(){function wire(){
 document.querySelectorAll('.tp-view').forEach(function(b){b.onclick=function(){window.__tpView=b.dataset.tpview;document.querySelectorAll('.tp-view').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});var _mc=document.getElementById('tpMatrixCtl');if(_mc)_mc.hidden=false;if(typeof render==='function')render();};});
 (function(){var DIMS=[['member','สมาชิก'],['media','ประเภทสื่อ'],['detail','รายละเอียด'],['role','บทบาท']];if(window.setupMemberMS)setupMemberMS('tpMember','__tpMembers');document.querySelectorAll('.tp-orient').forEach(function(b){b.onclick=function(){window.__tpOrient=b.dataset.or;document.querySelectorAll('.tp-orient').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});if(typeof render==='function')render();};});var mc=document.getElementById('tpMatrixCtl');if(mc)mc.hidden=false;})();var d=document.getElementById('tpDate');var g=document.getElementById('tpGran');
 function _today(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
 var st=document.getElementById('tpStart'),en=document.getElementById('tpEnd'),dash=document.getElementById('tpDash');
 function _sync(){if(!g)return;window.__tpGran=g.value;var isCustom=(g.value==='custom');var isSingle=(g.value!=='all'&&!isCustom);
  if(d){d.hidden=!isSingle;if(isSingle&&!d.value)d.value=_today();window.__tpDate=isSingle?d.value:'';}
  [st,en,dash].forEach(function(x){if(x)x.hidden=!isCustom;});
  if(isCustom){if(st&&!st.value)st.value=_today();if(en&&!en.value)en.value=_today();window.__tpStart=st?st.value:'';window.__tpEnd=en?en.value:'';}
  if(typeof render==='function')render();}
 if(g)g.onchange=_sync;
 if(d)d.onchange=function(){window.__tpDate=d.value;if(typeof render==='function')render();};
 if(st)st.onchange=function(){window.__tpStart=st.value;if(typeof render==='function')render();};
 if(en)en.onchange=function(){window.__tpEnd=en.value;if(typeof render==='function')render();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();})();
;
/* inline */
(function(){window.wtToggleNote=function(){var cm=document.getElementById("fComm");var ext=!!(cm&&cm.value==="External");var row=document.getElementById("tm_note_row");if(row)row.style.display=ext?"none":"";if(ext){var c=document.getElementById("tm_note_chk");if(c)c.checked=false;var o=document.getElementById("tm_note_own");if(o)o.disabled=true;}};})();
;
/* js/14-master-data.js */
(function(){
var DDKEY='worktracker-dropdowns-v1';
var DEF={priority:['Normal','High','Urgent'],people:(typeof people!=='undefined'?people.slice():['Gift','Mint','Beam','Ploy','Nok']),supporting:(typeof people!=='undefined'?people.slice():['Gift','Mint','Beam','Ploy','Nok']),channels:['LINE','TOP HIT','Banner','SMS','APP STAFF','Lastmile'],detail_note:['สื่อสารทั่วไป','BlankForm'],detail_info:['มีPattern(บันทึก)','New Design','กระบวนการละเอียด'],detail_vdo:['Short Clip','Long Clip','ข้อมูลซับซ้อน','Editing']};
function load(){try{var s=JSON.parse(localStorage.getItem(DDKEY)||'null');return (s&&typeof s==='object')?s:null;}catch(e){return null;}}
function save(s){try{localStorage.setItem(DDKEY,JSON.stringify(s));}catch(e){}}
function all(){var s=load(),seeded=false;if(!s){s={};seeded=true;}Object.keys(DEF).forEach(function(k){if(!Array.isArray(s[k])){s[k]=DEF[k].slice();seeded=true;}});if(!Array.isArray(s.__topics)){s.__topics=[];seeded=true;}(s.__topics||[]).slice().forEach(function(tp){if(tp&&(tp.title||'').toLowerCase().indexOf('supporting')>=0){var o=Array.isArray(s[tp.key])?s[tp.key]:[];if(!Array.isArray(s.supporting))s.supporting=[];o.forEach(function(v){if(s.supporting.indexOf(v)<0)s.supporting.push(v);});delete s[tp.key];s.__topics=s.__topics.filter(function(x){return x.key!==tp.key;});seeded=true;}});if(seeded)save(s);return s;}
window.DDget=function(k){var s=all();return Array.isArray(s[k])?s[k].slice():[];};
window.DDdetail=function(m){var k=(m==='บันทึก')?'detail_note':(m==='Infographic')?'detail_info':(m==='VDO')?'detail_vdo':null;return k?window.DDget(k):[];};
function sync(){var s=all();if(typeof people!=='undefined')people=(s.people||[]).slice();if(typeof render==='function')render();}
window.DDsync=sync;
function T(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
function mediaOf(k){return k==='detail_note'?'บันทึก':k==='detail_info'?'Infographic':k==='detail_vdo'?'VDO':null;}
function useCount(key,val){var m=mediaOf(key),n=0;T().forEach(function(t){
 if(key==='priority'){if(t.priority===val)n++;}
 else if(key==='people'){var hit=(t.lead===val||t.checker===val||t.approver===val||(t.commOwner&&t.commOwner.indexOf?t.commOwner.indexOf(val)>=0:t.commOwner===val));if(!hit&&t.support)hit=t.support.split(',').map(function(x){return x.trim();}).indexOf(val)>=0;if(!hit&&t.types)hit=t.types.some(function(x){return x&&x.owner===val;});if(hit)n++;}
 else if(key==='channels'){if(t.channels&&t.channels.indexOf(val)>=0)n++;}
 else if(m){if(t.types&&t.types.some(function(x){return x&&x.type===m&&(x.detail||'')===val;}))n++;}});return n;}
function renameVal(key,old,nw){var s=all(),arr=s[key]||[],i=arr.indexOf(old);if(i<0)return;arr[i]=nw;save(s);sync();var m=mediaOf(key);
 T().forEach(function(t){
  if(key==='priority'){if(t.priority===old)t.priority=nw;}
  else if(key==='people'){if(t.lead===old)t.lead=nw;if(t.checker===old)t.checker=nw;if(t.approver===old)t.approver=nw;if(t.commOwner){if(t.commOwner.map)t.commOwner=t.commOwner.map(function(x){return x===old?nw:x;});else if(t.commOwner===old)t.commOwner=nw;}if(t.support)t.support=t.support.split(',').map(function(x){return x.trim();}).map(function(x){return x===old?nw:x;}).filter(Boolean).join(', ');if(t.types)t.types.forEach(function(x){if(x&&x.owner===old)x.owner=nw;});}
  else if(key==='channels'){if(t.channels)t.channels=t.channels.map(function(x){return x===old?nw:x;});}
  else if(m){if(t.types)t.types.forEach(function(x){if(x&&x.type===m&&(x.detail||'')===old)x.detail=nw;});}});
 if(typeof persist==='function')persist();}
function addVal(key,val){val=(val||'').trim();if(!val)return{ok:false,msg:'กรุณาระบุค่า'};var s=all(),arr=s[key]||(s[key]=[]);if(arr.some(function(x){return String(x).toLowerCase()===val.toLowerCase();}))return{ok:false,msg:'มีตัวเลือกนี้อยู่แล้ว'};arr.push(val);save(s);sync();return{ok:true};}
function delVal(key,idx){var s=all();if(s[key])s[key].splice(idx,1);save(s);sync();}
function move(key,idx,dir){var s=all(),arr=s[key];if(!arr)return;var j=idx+dir;if(j<0||j>=arr.length)return;var t=arr[idx];arr[idx]=arr[j];arr[j]=t;save(s);sync();}
function addTopic(title){var s=all(),key='cust_'+Date.now().toString(36);(s.__topics=s.__topics||[]).push({key:key,title:title});s[key]=[];save(s);}
function delTopic(key){var s=all();s.__topics=(s.__topics||[]).filter(function(t){return t.key!==key;});delete s[key];save(s);}
var EDIT=null;
function esc2(x){return (typeof esc==='function')?esc(x):String(x);}
function editCard(cfg){var s=all(),arr=(s[cfg.key]||[]);
 var rows=arr.map(function(v,idx){
  if(EDIT&&EDIT.key===cfg.key&&EDIT.idx===idx){return '<div class="md-row"><input class="md-inp" id="md_e_'+cfg.key+'" value="'+esc2(v)+'"><span class="md-ops"><button class="ghost mdbtn" data-mdact="commit" data-key="'+cfg.key+'" data-idx="'+idx+'">✓</button><button class="ghost mdbtn" data-mdact="cancel">✕</button></span></div>';}
  return '<div class="md-row"><span class="md-val">'+esc2(v)+'</span><span class="md-ops">'
   +'<button class="ghost mdbtn" data-mdact="up" data-key="'+cfg.key+'" data-idx="'+idx+'" '+(idx===0?'disabled':'')+' title="เลื่อนขึ้น">↑</button>'
   +'<button class="ghost mdbtn" data-mdact="down" data-key="'+cfg.key+'" data-idx="'+idx+'" '+(idx===arr.length-1?'disabled':'')+' title="เลื่อนลง">↓</button>'
   +'<button class="ghost mdbtn" data-mdact="edit" data-key="'+cfg.key+'" data-idx="'+idx+'" title="แก้ไข">✎</button>'
   +'<button class="ghost mdbtn danger" data-mdact="del" data-key="'+cfg.key+'" data-idx="'+idx+'" title="ลบ">✕</button>'
   +'</span></div>';}).join('');
 var del=cfg.custom?'<button class="ghost mdbtn danger" data-mdact="deltopic" data-key="'+cfg.key+'" style="float:right" title="ลบหัวข้อ">ลบหัวข้อ</button>':'';
 return '<div class="panel md-card"><div class="md-head">'+del+'<b>'+esc2(cfg.title)+'</b> <span class="pill">'+arr.length+'</span>'
  +(cfg.desc?'<div class="tiny muted" style="margin-top:3px">'+esc2(cfg.desc)+'</div>':'')+'</div>'
  +'<div class="md-list">'+(rows||'<div class="tiny muted" style="padding:6px 2px">ยังไม่มีตัวเลือก</div>')+'</div>'
  +'<div class="md-add"><input class="md-inp" id="md_a_'+cfg.key+'" placeholder="เพิ่มตัวเลือกใหม่..."><button class="primary mdbtn" data-mdact="add" data-key="'+cfg.key+'">＋ เพิ่ม</button></div></div>';}
function lockCard(cfg){var opts=cfg.optsFn?cfg.optsFn():(cfg.opts||[]);
 var rows=opts.map(function(v){return '<div class="md-row md-ro"><span class="md-val">'+esc2(v)+'</span><span class="tiny muted">🔒</span></div>';}).join('');
 var link=cfg.link?'<div class="md-add"><button class="ghost mdbtn" data-mdact="goto" data-key="'+cfg.link+'">ไปที่หน้า Projects & Teams →</button></div>':'';
 return '<div class="panel md-card md-locked"><div class="md-head"><b>'+esc2(cfg.title)+'</b> <span class="pill">'+(opts.length||'—')+'</span> <span class="pill md-syspill">ระบบ · ล็อก</span>'
  +'<div class="tiny muted" style="margin-top:3px">'+esc2(cfg.note||'')+'</div></div>'
  +'<div class="md-list">'+(rows||'<div class="tiny muted" style="padding:6px 2px">—</div>')+'</div>'+link+'</div>';}
window.renderMD=function(){var host=document.getElementById('mdCards');if(!host)return;var s=all();
 var edit=[{key:'priority',title:'ระดับความสำคัญ (Priority)',desc:'ช่อง Priority ในการ์ดงาน'},
  {key:'people',title:'ทีมงาน / ผู้รับผิดชอบ',desc:'ผู้รับผิดชอบ · Checker · ผู้ตรวจ/อนุมัติ(เผยแพร่) · Supporting · ฟิลเตอร์รายคน'},
  {key:'detail_note',title:'รายละเอียด · บันทึก',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ บันทึก'},
  {key:'detail_info',title:'รายละเอียด · Infographic',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ Infographic'},
  {key:'detail_vdo',title:'รายละเอียด · VDO',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ VDO'},{key:'supporting',title:'Supporting Creator',desc:'ช่อง Supporting Creator ในการ์ดงาน (เลือกได้หลายคน)'},
  {key:'channels',title:'ช่องทางการสื่อสาร',desc:'ช่องทางเผยแพร่ในการ์ดงาน (เลือกได้หลายช่อง) · แสดงบนการ์ด Task Board'}];
 (s.__topics||[]).forEach(function(tp){edit.push({key:tp.key,title:tp.title,desc:'หัวข้อกำหนดเอง · ยังไม่ผูกกับฟิลด์ในการ์ดงาน',custom:true});});
 var locked=[{title:'ประเภทการสื่อสาร',opts:['Internal','External'],note:'ผูกกับ routing · แยกโปรเจกต์ · ฟิลเตอร์'},
  {title:'ประเภทสื่อ (ประเภทงาน)',opts:['บันทึก','Infographic','VDO'],note:'ผูกกับ Matrix · kind · หัวข้อรายละเอียดสื่อ'},
  {title:'สถานะงาน',optsFn:function(){return (typeof statuses!=='undefined'?statuses:[]).map(function(x){return (typeof statusLabel!=='undefined'&&statusLabel[x])||x;});},note:'ผูกกับคอลัมน์บนกระดานงาน'},
  {title:'Project',opts:[],note:'จัดการที่หน้า Projects & Teams (แยก Internal/External)',link:'projects'}];
 var html='<div class="md-grouplbl">แก้ไขได้ (Master Data)</div>'+edit.map(editCard).join('')
  +'<div class="md-grouplbl">ระบบ · ดูอย่างเดียว</div>'+locked.map(lockCard).join('');
 host.innerHTML=html;
 if(EDIT){var e=document.getElementById('md_e_'+EDIT.key);if(e){e.focus();e.select();}}};
function tell(m){if(typeof notify==='function')notify(m);}
function commitEdit(key,idx,val){var s=all(),arr=s[key]||[],old=arr[idx];val=(val||'').trim();if(!val){tell('ห้ามเว้นว่าง');return false;}if(val===old){EDIT=null;return true;}if(arr.some(function(x,i){return i!==idx&&String(x).toLowerCase()===val.toLowerCase();})){tell('มีตัวเลือกนี้อยู่แล้ว');return false;}renameVal(key,old,val);EDIT=null;tell('บันทึกแล้ว · อัปเดตงานที่เกี่ยวข้องให้อัตโนมัติ');return true;}
function doAdd(key){var inp=document.getElementById('md_a_'+key);var r=addVal(key,inp?inp.value:'');if(!r.ok){tell(r.msg);return;}tell('เพิ่มตัวเลือกแล้ว');EDIT=null;window.renderMD();}
function bind(){var host=document.getElementById('mdCards');if(host&&!host._md){host._md=1;
 host.addEventListener('click',function(e){var b=e.target.closest('[data-mdact]');if(!b)return;var act=b.dataset.mdact,key=b.dataset.key,idx=b.dataset.idx!=null?+b.dataset.idx:-1;
  if(act==='add')doAdd(key);
  else if(act==='edit'){EDIT={key:key,idx:idx};window.renderMD();}
  else if(act==='cancel'){EDIT=null;window.renderMD();}
  else if(act==='commit'){var inp=document.getElementById('md_e_'+key);if(commitEdit(key,idx,inp?inp.value:''))window.renderMD();}
  else if(act==='del'){var s=all(),arr=s[key]||[],val=arr[idx],n=useCount(key,val);var msg=n>0?('ตัวเลือก “'+val+'” กำลังถูกใช้ใน '+n+' งาน\n• งานเดิมจะยังเก็บค่าเดิมไว้ (ข้อมูลไม่หาย)\n• แต่จะไม่แสดงเป็นตัวเลือกใหม่อีก\n\nยืนยันการลบ?'):('ลบตัวเลือก “'+val+'” ?');if(!confirm(msg))return;delVal(key,idx);EDIT=null;tell('ลบแล้ว');window.renderMD();}
  else if(act==='up'){move(key,idx,-1);window.renderMD();}
  else if(act==='down'){move(key,idx,1);window.renderMD();}
  else if(act==='deltopic'){if(!confirm('ลบหัวข้อกำหนดเองนี้ทั้งหมด?'))return;delTopic(key);window.renderMD();}
  else if(act==='goto'){if(typeof navigate==='function')navigate(key);}});
 host.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var t=e.target;if(!t.classList||!t.classList.contains('md-inp'))return;e.preventDefault();var id=t.id||'';
  if(id.indexOf('md_a_')===0)doAdd(id.slice(5));
  else if(id.indexOf('md_e_')===0&&EDIT){if(commitEdit(EDIT.key,EDIT.idx,t.value))window.renderMD();}});}
 var ab=document.getElementById('mdAddTopic');if(ab&&!ab._md){ab._md=1;ab.onclick=function(){var name=window.prompt('ชื่อหัวข้อดรอปดาวน์ใหม่:');if(name==null)return;name=name.trim();if(!name)return;addTopic(name);tell('เพิ่มหัวข้อแล้ว');window.renderMD();};}}
document.head.insertAdjacentHTML('beforeend','<style>#mdCards{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;align-items:stretch}.md-grouplbl{grid-column:1/-1;font-size:11px;font-weight:800;letter-spacing:.5px;color:#64748b;text-transform:uppercase;margin:6px 0 -4px}.md-card{padding:14px 16px;display:flex;flex-direction:column}.md-head{margin-bottom:8px}.md-list{display:flex;flex-direction:column;gap:1px;margin-bottom:10px}.md-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;border-radius:8px}.md-row:hover{background:#f4f8ff}.md-ro:hover{background:transparent}.md-val{font-size:13px;color:#1f2a37}.md-ops{display:flex;gap:1px;flex-shrink:0}.mdbtn{padding:3px 8px;font-size:12px;line-height:1.1;border-radius:7px}.mdbtn[disabled]{opacity:.3;cursor:default}.mdbtn.danger{color:#c0392b}.md-add{display:flex;gap:6px;margin-top:auto}.md-inp{flex:1;min-width:0;padding:6px 9px;border:1px solid #d7e0ea;border-radius:8px;font-size:13px}.md-locked{opacity:.95;background:#fbfcfe}.md-syspill{background:#eef2f7;color:#64748b}</style>');
sync();bind();
})();
;
/* js/15-dashboard-perf-wiring.js */
(function(){function wire(){
 document.querySelectorAll('.dtp-view').forEach(function(b){b.onclick=function(){window.__dtpView=b.dataset.dtpview;document.querySelectorAll('.dtp-view').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});var _mc=document.getElementById('dtpMatrixCtl');if(_mc)_mc.hidden=false;if(typeof render==='function')render();};});
 if(window.setupMemberMS)setupMemberMS('dtpMember','__dtpMembers');
 document.querySelectorAll('.dtp-orient').forEach(function(b){b.onclick=function(){window.__dtpOrient=b.dataset.or;document.querySelectorAll('.dtp-orient').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});if(typeof render==='function')render();};});
 var mc=document.getElementById('dtpMatrixCtl');if(mc)mc.hidden=false;
 var d=document.getElementById('dtpDate'),g=document.getElementById('dtpGran');
 function _today(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
 var s0=document.getElementById('dtpStart'),e0=document.getElementById('dtpEnd'),dash=document.getElementById('dtpDash');
 function _sync(){if(!g)return;window.__dtpGran=g.value;var isCustom=(g.value==='custom');var isSingle=(g.value!=='all'&&!isCustom);
  if(d){d.hidden=!isSingle;if(isSingle&&!d.value)d.value=_today();window.__dtpDate=isSingle?d.value:'';}
  [s0,e0,dash].forEach(function(x){if(x)x.hidden=!isCustom;});
  if(isCustom){if(s0&&!s0.value)s0.value=_today();if(e0&&!e0.value)e0.value=_today();window.__dtpStart=s0?s0.value:'';window.__dtpEnd=e0?e0.value:'';}
  if(typeof render==='function')render();}
 if(g)g.onchange=_sync;
 if(d)d.onchange=function(){window.__dtpDate=d.value;if(typeof render==='function')render();};
 if(s0)s0.onchange=function(){window.__dtpStart=s0.value;if(typeof render==='function')render();};
 if(e0)e0.onchange=function(){window.__dtpEnd=e0.value;if(typeof render==='function')render();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();})();
;
/* js/16-communication-plan.js */
(function(){
var KEY='worktracker-commplan-v1';
var CH=[['line','LINE'],['tophit','TOP HIT'],['banner','Banner'],['sms','SMS'],['appstaff','APP STAFF'],['lastmile','Lastmile']];
var CHKEYS=['line','tophit','banner','sms','appstaff','lastmile'];
var MD=[['memo','บันทึก'],['info','Infographic'],['vdo','VDO']];
var STS=(typeof statuses!=='undefined'?statuses:['To Do','In Progress','Completed']);
var PROG=['In Progress','Review','Approval','Revision','Ready to Publish'];
var editingCP=null;
var F={search:'',gran:'all',date:'',start:'',end:'',ch:'',md:'',status:'',sort:'date'};
window.__cpF=F;
function esc2(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(s)?s:[];}catch(e){return [];}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a));}catch(e){}}
window.CPall=load;window.CPsave=save;
function newId(){return 'C'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
window.CPnewId=newId;
function slab(s){return (typeof statusLabel!=='undefined'&&statusLabel[s])||s;}
function dow(d){try{var x=new Date(d+'T00:00:00');return ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][x.getDay()];}catch(e){return '';}}
function stCls(s){return s==='Completed'?'s-progress':(PROG.indexOf(s)>=0?'s-approval':'');}
function inRange(d){if(F.gran==='all'||!d)return true;if(F.gran==='custom'){if(!F.start&&!F.end)return true;if(F.start&&d<F.start)return false;if(F.end&&d>F.end)return false;return true;}if(!F.date)return true;
 if(F.gran==='day')return d===F.date;
 if(F.gran==='month')return d.slice(0,7)===F.date.slice(0,7);
 if(F.gran==='week'){var a=new Date(F.date+'T00:00:00');var off=(a.getDay()+6)%7;var mon=new Date(a);mon.setDate(a.getDate()-off);var sun=new Date(mon);sun.setDate(mon.getDate()+6);var k=function(z){return z.getFullYear()+'-'+('0'+(z.getMonth()+1)).slice(-2)+'-'+('0'+z.getDate()).slice(-2);};return d>=k(mon)&&d<=k(sun);}
 return true;}
function match(r,ignoreCh){
 if(F.search){var q=F.search.toLowerCase();if((((r.topic||'')+' '+(r.remark||'')).toLowerCase()).indexOf(q)<0)return false;}
 if(!inRange(r.date||''))return false;
 if(!ignoreCh&&F.ch&&!(r.ch&&r.ch[F.ch]))return false;
 if(F.md&&!(r.md&&r.md[F.md]))return false;
 if(F.status&&r.status!==F.status)return false;
 return true;}
function sortRows(a){a=a.slice();a.sort(function(x,y){
 if(F.sort==='topic')return (x.topic||'').localeCompare(y.topic||'');
 if(F.sort==='date_desc')return (y.date||'').localeCompare(x.date||'')||(y.time||'').localeCompare(x.time||'');
 return (x.date||'').localeCompare(y.date||'')||(x.time||'').localeCompare(y.time||'');});return a;}
function tags(obj,defs){var t=defs.filter(function(d){return obj&&obj[d[0]];}).map(function(d){return '<span class="cp-tag cp-tag-'+d[0]+'">'+esc2(d[1])+'</span>';}).join(' ');return t||'<span class="tiny muted">—</span>';}
function taskCell(r){
 if(r.taskId&&typeof tasks!=='undefined'){var t=tasks.find(function(x){return x.id===r.taskId;});if(t)return '<span class="pill '+stCls(t.status)+'" title="มี Task แล้ว · #'+t.id+'">◉ '+esc2(slab(t.status))+'</span>';}
 return '<button class="ghost cp-mini" data-cpact="task" data-cid="'+esc2(r.cid)+'">＋ Task</button>';}
window.cpSyncLinked=function(){var _a=load(),_ch=false;_a.forEach(function(r){if(r.taskId&&typeof tasks!=='undefined'&&tasks){var _t=tasks.find(function(x){return x.id===r.taskId;});if(_t){if(r.status!==_t.status){r.status=_t.status;_ch=true;}}else{r.taskId=null;_ch=true;}}});if(_ch)save(_a);};window.renderCP=function(){window.cpSyncLinked();
 var host=document.getElementById('cpTable');if(!host)return;
 var all=load();
 // base = all filters EXCEPT channel (so channel facet counts stay informative); fr = fully-filtered set
 var base=all.filter(function(r){return match(r,true);});
 var fr=base.filter(function(r){return !F.ch||(r.ch&&r.ch[F.ch]);});
 // 6 KPIs from the fully-filtered set. Status buckets are MECE (comp+prog+plan=tot); SMS is a separate axis.
 var tot=fr.length,comp=0,prog=0,plan=0,sms=0,overdue=0,today=new Date().toISOString().slice(0,10);
 fr.forEach(function(r){var s=r.status;if(s==='Completed')comp++;else if(PROG.indexOf(s)>=0)prog++;else plan++;if(r.ch&&r.ch.sms)sms++;if(s!=='Completed'&&s!=='Cancelled'&&r.date&&r.date<today)overdue++;});
 var rate=tot?Math.round(100*comp/tot):0;
 if(comp+prog+plan!==tot&&typeof console!=='undefined')console.warn('CP KPI bucket mismatch (dedupe guard):',comp,prog,plan,'≠',tot);
 var sm=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};
 sm('cpSumTotal',tot);sm('cpSumComp',comp);sm('cpSumProg',prog);sm('cpSumPlan',plan);sm('cpSumSms',sms);sm('cpSumRate',rate+'%');
 var _no=document.getElementById('cpStNote');if(_no)_no.innerHTML='<b>สถานะ = สถานะการผลิต</b> (ซิงก์จาก Task Board): เสร็จสิ้น = ผลิตเสร็จ · กำลังดำเนินการ = อยู่ระหว่างผลิต/ตรวจ (รวม Ready to Publish) · วางแผนไว้ = ยังไม่เริ่ม · การเผยแพร่จริงแยกจากสถานะการผลิต'+(overdue?' · <span class="cp-od">⚠ เลยวันออกสื่อแต่ยังไม่เสร็จ '+overdue+' รายการ</span>':'');
 // channel + media facet counts over base (not narrowed by the channel filter)
 var _chc={line:0,tophit:0,banner:0,sms:0,appstaff:0,lastmile:0};base.forEach(function(r){if(r.ch){CHKEYS.forEach(function(k){if(r.ch[k])_chc[k]++;});}});
 var _mdc={memo:0,info:0,vdo:0};base.forEach(function(r){if(r.md){['memo','info','vdo'].forEach(function(k){if(r.md[k])_mdc[k]++;});}});
 sm('cpChLine',_chc.line);sm('cpChTophit',_chc.tophit);sm('cpChBanner',_chc.banner);sm('cpChSmsCount',_chc.sms);sm('cpChAppstaff',_chc.appstaff);sm('cpChLastmile',_chc.lastmile);sm('cpChAll',base.length);
 var _cr=document.getElementById('cpChRow');if(_cr)_cr.querySelectorAll('[data-cpch]').forEach(function(b){b.classList.toggle('primary',(b.dataset.cpch||'')===(F.ch||''));});
 var _bw=document.getElementById('cpBreakWrap');if(_bw)_bw.innerHTML=breakdownHtml(base.length,_chc,_mdc);
 var rows=sortRows(fr);var ncol=10;var html='';
 if(!rows.length)html='<tr><td class="empty" colspan="'+ncol+'">ไม่มีรายการ · กด “＋ เพิ่มรายการ” หรือ “นำเข้าข้อมูล”</td></tr>';
 else{var curd=null,grp=(F.sort==='date'||F.sort==='date_desc');
  rows.forEach(function(r){
   var gk=r.date||r.day||'';if(grp&&gk!==curd){curd=gk;var cnt=rows.filter(function(x){return (x.date||x.day||'')===curd;}).length;var glb=curd?(esc2(curd)+(/^\d{4}-/.test(curd)?(' · '+dow(curd)):'')):'ไม่ระบุวันที่';html+='<tr class="cp-grp"><td colspan="'+ncol+'"><div class="cp-grp-in"><span class="cp-grp-date">📅 '+glb+'</span><span class="cp-grp-count">'+cnt+' รายการ</span></div></td></tr>';}
   html+='<tr><td>'+esc2(r.day||dow(r.date).slice(0,2))+'</td><td>'+esc2(r.date||'—')+'</td><td><b>'+esc2(r.topic||'')+'</b></td><td>'+esc2(r.time||'—')+'</td><td>'+tags(r.ch,CH)+'</td><td>'+tags(r.md,MD)+'</td><td><span class="pill '+stCls(r.status)+'">'+esc2(slab(r.status))+'</span></td><td class="cp-remark" title="'+esc2(r.remark||'')+'">'+esc2(r.remark||'')+'</td><td>'+taskCell(r)+'</td><td class="cp-ops">'+opsMenu(r.cid,true)+'</td></tr>';
  });}
 host.innerHTML='<colgroup><col class="cp-c-day"><col class="cp-c-date"><col class="cp-c-topic"><col class="cp-c-time"><col class="cp-c-ch"><col class="cp-c-md"><col class="cp-c-st"><col class="cp-c-remark"><col class="cp-c-task"><col class="cp-c-ops"></colgroup><thead><tr><th>วัน</th><th>วันที่</th><th>เรื่องสื่อสาร</th><th>เวลา</th><th>ช่องทาง</th><th>รูปแบบสื่อ</th><th>สถานะ</th><th>หมายเหตุ</th><th>Task</th><th>จัดการ</th></tr></thead><tbody>'+html+'</tbody>';
 var shost=document.getElementById('cpSmsTable');
 if(shost){var sq=((document.getElementById('cpSmsSearch')||{}).value||'').toLowerCase();
  var srows=sortRows(all.filter(function(r){return r.ch&&r.ch.sms;})).filter(function(r){if(!sq)return true;return (((r.topic||'')+' '+(r.sms_msg||'')+' '+(r.sms_target||'')+' '+(r.owner||'')).toLowerCase()).indexOf(sq)>=0;});
  var sh='';
  if(!srows.length)sh='<tr><td class="empty" colspan="9">ไม่มีรายการ SMS</td></tr>';
  else srows.forEach(function(r){sh+='<tr><td>'+esc2(r.date||'—')+'</td><td>'+esc2(r.time||'—')+'</td><td><b>'+esc2(r.topic||'')+'</b></td><td class="cp-remark" title="'+esc2(r.sms_msg||'')+'">'+esc2(r.sms_msg||'')+'</td><td>'+esc2(r.sms_target||'—')+'</td><td>'+esc2(r.owner||'—')+'</td><td><span class="pill '+stCls(r.status)+'">'+esc2(slab(r.status))+'</span></td><td class="cp-remark" title="'+esc2(r.remark||'')+'">'+esc2(r.remark||'')+'</td><td class="cp-ops">'+opsMenu(r.cid,false)+'</td></tr>';});
  shost.innerHTML='<colgroup><col class="cp-c-date"><col class="cp-c-time"><col class="cp-c-topic"><col class="cp-c-smsmsg"><col class="cp-c-target"><col class="cp-c-owner"><col class="cp-c-st"><col class="cp-c-remark"><col class="cp-c-ops"></colgroup><thead><tr><th>วันที่</th><th>เวลา</th><th>เรื่องสื่อสาร</th><th>SMS Message</th><th>Target</th><th>Owner</th><th>สถานะ</th><th>หมายเหตุ</th><th>จัดการ</th></tr></thead><tbody>'+sh+'</tbody>';}
};
function g(id){return document.getElementById(id);}
// consolidated "More Actions" kebab (same data-cpact handlers, just grouped)
function opsMenu(cid,full){var e=esc2(cid);
 var items='<button class="cp-mi" data-cpact="edit" data-cid="'+e+'">✎ แก้ไข</button>'
  +(full?'<button class="cp-mi" data-cpact="dup" data-cid="'+e+'">⧉ ทำซ้ำ</button>':'')
  +'<button class="cp-mi danger" data-cpact="del" data-cid="'+e+'">✕ ลบ</button>';
 return '<div class="cp-actions"><button class="ghost cp-kebab" data-cpmenu data-cid="'+e+'" title="การจัดการ" aria-label="การจัดการ">⋯</button><div class="cp-menu" hidden>'+items+'</div></div>';}
function closeCpMenus(){document.querySelectorAll('.cp-menu').forEach(function(m){m.hidden=true;m.style.left='';m.style.top='';});document.querySelectorAll('.cp-kebab.open').forEach(function(k){k.classList.remove('open');});}
// Channel & Media breakdown (expand/collapse). % over UNIQUE records; usage counts are not record counts.
function bkRow(label,n,uniq,color,attr){var p=uniq?Math.round(100*n/uniq):0;return '<button class="cp-bk-row"'+(attr||'')+'><span class="cp-bk-lb">'+esc2(label)+'</span><span class="cp-bk-bar"><i style="width:'+p+'%;background:'+color+'"></i></span><b class="cp-bk-n">'+n+'</b><span class="cp-bk-pc">'+p+'%</span></button>';}
function breakdownHtml(uniq,chc,mdc){var open=!!window.__cpBkOpen;var use=chc.line+chc.tophit+chc.banner+chc.sms+chc.appstaff+chc.lastmile;
 var head='<button class="cp-bk-head" id="cpBkToggle" aria-expanded="'+open+'"><span id="cpBkCaret">'+(open?'▾':'▸')+'</span> รายละเอียด Channel &amp; Media Breakdown <span class="tiny muted">(ตามตัวกรอง · '+uniq+' รายการ)</span></button>';
 var ch='<div class="cp-bk-sub">ช่องทาง · คลิกเพื่อกรอง</div>'+bkRow('LINE',chc.line,uniq,'#1766cc',' data-cpch="line"')+bkRow('TOP HIT',chc.tophit,uniq,'#3a7bd5',' data-cpch="tophit"')+bkRow('Banner',chc.banner,uniq,'#6aa0e0',' data-cpch="banner"')+bkRow('SMS',chc.sms,uniq,'#e08a2b',' data-cpch="sms"')+bkRow('APP STAFF',chc.appstaff,uniq,'#2e7d4f',' data-cpch="appstaff"')+bkRow('Lastmile',chc.lastmile,uniq,'#8e5bd0',' data-cpch="lastmile"');
 var md='<div class="cp-bk-sub">รูปแบบสื่อ · คลิกเพื่อกรอง</div>'+bkRow('บันทึก',mdc.memo,uniq,'#1766cc',' data-cpmd="memo"')+bkRow('Infographic',mdc.info,uniq,'#4b90e2',' data-cpmd="info"')+bkRow('VDO',mdc.vdo,uniq,'#8e5bd0',' data-cpmd="vdo"');
 var note='<div class="cp-bk-note">% คิดจากจำนวนรายการไม่ซ้ำ ('+uniq+') · 1 รายการมีได้หลายช่องทาง/รูปแบบ → ผลรวมการใช้งาน ('+use+') จึงมากกว่าจำนวนรายการ (ไม่ใช่การนับซ้ำ)</div>';
 return head+'<div class="cp-bk-body" id="cpBkBody"'+(open?'':' hidden')+'><div class="cp-bk-cols">'+ch+md+'</div>'+note+'</div>';}
// position the fixed menu near its kebab (escapes the .cp-table-wrap overflow clip)
function positionCpMenu(kb,menu){var r=kb.getBoundingClientRect();var mw=menu.offsetWidth||140,mh=menu.offsetHeight||120;var left=Math.max(8,Math.min(r.right-mw,window.innerWidth-mw-8));var top=r.bottom+4;if(top+mh>window.innerHeight-8)top=Math.max(8,r.top-mh-4);menu.style.left=left+'px';menu.style.top=top+'px';}
function toggleSms(){var e=g('cpSmsFields');if(e)e.hidden=!g('cpf_ch_sms').checked;}
function openCP(cid){editingCP=cid;var r=cid?load().find(function(x){return x.cid===cid;}):null;
 g('cpModalTitle').textContent=cid?'แก้ไขรายการ':'เพิ่มรายการ';
 g('cpf_date').value=r?(r.date||''):'';g('cpf_time').value=r?(r.time||''):'';g('cpf_topic').value=r?(r.topic||''):'';g('cpf_remark').value=r?(r.remark||''):'';
 CHKEYS.forEach(function(k){var e=g('cpf_ch_'+k);if(e)e.checked=!!(r&&r.ch&&r.ch[k]);});
 ['memo','info','vdo'].forEach(function(k){g('cpf_md_'+k).checked=!!(r&&r.md&&r.md[k]);});
 g('cpf_status').value=r?(r.status||STS[0]):STS[0];
 g('cpf_sms_msg').value=r?(r.sms_msg||''):'';g('cpf_sms_target').value=r?(r.sms_target||''):'';g('cpf_owner').value=r?(r.owner||''):'';
 toggleSms();g('cpModalbg').classList.add('open');}
function closeCP(){g('cpModalbg').classList.remove('open');}
function saveCP(){var topic=g('cpf_topic').value.trim();if(!topic){if(typeof notify==='function')notify('กรุณาระบุเรื่องสื่อสาร');g('cpf_topic').focus();return;}
 var all=load();var r=editingCP?all.find(function(x){return x.cid===editingCP;}):null;var isNew=!r;if(isNew){r={cid:newId(),src:'manual',taskId:null};all.push(r);}
 r.date=g('cpf_date').value;r.time=g('cpf_time').value.trim();r.topic=topic;r.remark=g('cpf_remark').value.trim();
 r.ch={};CHKEYS.forEach(function(k){var e=g('cpf_ch_'+k);r.ch[k]=!!(e&&e.checked);});
 r.md={memo:g('cpf_md_memo').checked,info:g('cpf_md_info').checked,vdo:g('cpf_md_vdo').checked};
 r.status=g('cpf_status').value;r.sms_msg=g('cpf_sms_msg').value.trim();r.sms_target=g('cpf_sms_target').value.trim();r.owner=g('cpf_owner').value;if(r.taskId&&typeof tasks!=='undefined'&&tasks){var _t=tasks.find(function(x){return x.id===r.taskId;});if(_t&&_t.status!==r.status){_t.status=r.status;if(typeof persist==='function')persist();if(typeof render==='function')render();}}
 save(all);closeCP();window.renderCP();if(typeof notify==='function')notify(isNew?'เพิ่มรายการแล้ว':'บันทึกแล้ว');}
function delCP(cid){var all=load();var r=all.find(function(x){return x.cid===cid;});if(!r)return;if(!window.confirm('ลบรายการ “'+(r.topic||cid)+'” ?'))return;save(all.filter(function(x){return x.cid!==cid;}));window.renderCP();if(typeof notify==='function')notify('ลบแล้ว');}
function dupCP(cid){var all=load();var r=all.find(function(x){return x.cid===cid;});if(!r)return;var c=JSON.parse(JSON.stringify(r));c.cid=newId();c.taskId=null;c.topic=(r.topic||'')+' (คัดลอก)';all.push(c);save(all);window.renderCP();if(typeof notify==='function')notify('ทำซ้ำแล้ว');}
function createTaskFromCP(cid){var all=load();var r=all.find(function(x){return x.cid===cid;});if(!r)return;
 if(typeof tasks==='undefined'){if(typeof notify==='function')notify('ยังไม่พร้อมสร้าง Task');return;}
 if(r.taskId&&tasks.find(function(t){return t.id===r.taskId;})){if(typeof notify==='function')notify('มี Task สำหรับรายการนี้แล้ว');return;}
 var kind=r.md&&r.md.vdo?'Video':(r.md&&r.md.info?'Infographic':'Copy');
 var types=[];if(r.md){if(r.md.memo)types.push({type:'บันทึก',owner:'',detail:''});if(r.md.info)types.push({type:'Infographic',owner:'',detail:''});if(r.md.vdo)types.push({type:'VDO',owner:'',detail:''});}
 var nid=Math.max.apply(null,[100].concat(tasks.map(function(t){return t.id;})))+1;
 var chList=CH.filter(function(c){return r.ch&&r.ch[c[0]];}).map(function(c){return c[1];});
 var t={id:nid,title:r.topic||('Comm '+cid),project:'Communication Plan',comm:'Internal',kind:kind,priority:'Normal',lead:'',support:'',checker:'',approver:'',due:r.date||'',publish:r.date||'',status:(r.status||'To Do'),brief:(chList.length?('ช่องทาง: '+chList.join(', ')):''),types:types,modes:{},commId:cid};
 tasks.push(t);if(typeof persist==='function')persist();r.taskId=nid;save(all);
 if(typeof render==='function')render();window.renderCP();if(typeof notify==='function')notify('สร้าง Task แล้ว · เชื่อมกับ Communication Plan');}
window.cpCreateTaskFromCP=createTaskFromCP;
function init(){
 var stSel=g('cpf_status'),fst=g('cpFSt'),own=g('cpf_owner');
 if(stSel)stSel.innerHTML=STS.map(function(s){return '<option value="'+esc2(s)+'">'+esc2(slab(s))+'</option>';}).join('');
 if(fst)fst.innerHTML='<option value="">ทุกสถานะ</option>'+STS.map(function(s){return '<option value="'+esc2(s)+'">'+esc2(slab(s))+'</option>';}).join('');
 if(own){var ppl=(window.DDget?window.DDget('people'):(typeof people!=='undefined'?people:[]));own.innerHTML='<option value="">—</option>'+ppl.map(function(p){return '<option value="'+esc2(p)+'">'+esc2(p)+'</option>';}).join('');}
 var on=function(id,ev,fn){var e=g(id);if(e)e.addEventListener(ev,fn);};
 on('cpSearch','input',function(e){F.search=e.target.value;window.renderCP();});
 on('cpGran','change',function(e){F.gran=e.target.value;var d=g('cpDate'),s=g('cpStart'),en=g('cpEnd'),dh=g('cpDash');var isCustom=(F.gran==='custom');var isSingle=(F.gran!=='all'&&!isCustom);var today=new Date().toISOString().slice(0,10);d.hidden=!isSingle;[s,en,dh].forEach(function(x){if(x)x.hidden=!isCustom;});if(isSingle&&!d.value){d.value=today;F.date=d.value;}if(isCustom){if(!s.value)s.value=today;if(!en.value)en.value=today;F.start=s.value;F.end=en.value;}window.renderCP();});
 on('cpDate','change',function(e){F.date=e.target.value;window.renderCP();});on('cpStart','change',function(e){F.start=e.target.value;window.renderCP();});on('cpEnd','change',function(e){F.end=e.target.value;window.renderCP();});
 on('cpFCh','change',function(e){F.ch=e.target.value;window.renderCP();});var _cr=document.getElementById('cpChRow');if(_cr)_cr.querySelectorAll('[data-cpch]').forEach(function(b){b.onclick=function(){F.ch=(F.ch===b.dataset.cpch?'':b.dataset.cpch);var s=document.getElementById('cpFCh');if(s)s.value=F.ch;window.renderCP();};});
 on('cpFMd','change',function(e){F.md=e.target.value;window.renderCP();});
 // Channel/Media breakdown panel: toggle + click-to-filter (delegated on the stable container)
 on('cpBreakWrap','click',function(e){
  if(e.target.closest('#cpBkToggle')){window.__cpBkOpen=!window.__cpBkOpen;var b=g('cpBkBody');if(b)b.hidden=!window.__cpBkOpen;var c=g('cpBkCaret');if(c)c.textContent=window.__cpBkOpen?'▾':'▸';return;}
  var chEl=e.target.closest('[data-cpch]');if(chEl){F.ch=(F.ch===chEl.dataset.cpch?'':chEl.dataset.cpch);var s=g('cpFCh');if(s)s.value=F.ch;window.renderCP();return;}
  var mdEl=e.target.closest('[data-cpmd]');if(mdEl){F.md=(F.md===mdEl.dataset.cpmd?'':mdEl.dataset.cpmd);var s2=g('cpFMd');if(s2)s2.value=F.md;window.renderCP();return;}
 });
 on('cpFSt','change',function(e){F.status=e.target.value;window.renderCP();});
 on('cpSort','change',function(e){F.sort=e.target.value;window.renderCP();});
 on('cpSmsSearch','input',function(){window.renderCP();});
 on('cpAdd','click',function(){openCP(null);});
 on('cpSave','click',saveCP);on('cpCancel','click',closeCP);on('cpClose','click',closeCP);
 on('cpf_ch_sms','change',toggleSms);
 var mb=g('cpModalbg');if(mb)mb.addEventListener('click',function(e){if(e.target.id==='cpModalbg')closeCP();});
 ['cpConnect','cpImport'].forEach(function(id){on(id,'click',function(){if(window.cpWizard)window.cpWizard();else if(typeof notify==='function')notify('ตัวช่วยนำเข้า Google Sheet กำลังจะมาในขั้นถัดไป');});});
 [g('cpTable'),g('cpSmsTable')].forEach(function(T){if(T&&!T._cp){T._cp=1;T.addEventListener('click',function(e){
   var kb=e.target.closest('[data-cpmenu]');
   if(kb){e.stopPropagation();var menu=kb.parentNode.querySelector('.cp-menu');var wasOpen=menu&&menu.hidden===false;closeCpMenus();if(menu&&!wasOpen){menu.hidden=false;kb.classList.add('open');positionCpMenu(kb,menu);}return;}
   var b=e.target.closest('[data-cpact]');if(!b)return;closeCpMenus();var act=b.dataset.cpact,cid=b.dataset.cid;if(act==='edit')openCP(cid);else if(act==='del')delCP(cid);else if(act==='dup')dupCP(cid);else if(act==='task')createTaskFromCP(cid);});}});
 if(!window.__cpMenuDoc){window.__cpMenuDoc=1;document.addEventListener('click',function(e){if(!e.target.closest('.cp-actions'))closeCpMenus();});window.addEventListener('resize',closeCpMenus);document.addEventListener('scroll',closeCpMenus,true);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
;
/* js/17-cp-import-wizard.js */
(function(){
var SHEET='https://docs.google.com/spreadsheets/d/1OEIvKYNgRp6GYHHO3g4og6Uc9fEggdwj7EOIpOSkWpg/edit?gid=0#gid=0';
var LOGKEY='worktracker-commplan-log-v1';
function esc2(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function who(){return (window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้';}
var STS=(typeof statuses!=='undefined'?statuses:['To Do','In Progress','Completed']);
function slab(s){return (typeof statusLabel!=='undefined'&&statusLabel[s])||s;}
var SYS=[['day','วัน (Day)','text'],['communication_date','วันที่ (Date)','date'],['title','เรื่องสื่อสาร (Topic) *','text'],['communication_time','เวลาสื่อสาร (Time)','time'],['publish','วันเผยแพร่ (ใช้เป็นวันที่ · External)','date'],['date_start','วันดำเนินการ','date'],['date_done','วันเสร็จสิ้น','date'],
['channel_line','ช่องทาง · LINE','bool'],['channel_top_hit','ช่องทาง · TOP HIT','bool'],['channel_banner','ช่องทาง · Banner','bool'],['channel_sms','ช่องทาง · SMS','bool'],['channel_appstaff','ช่องทาง · APP STAFF','bool'],['channel_lastmile','ช่องทาง · Lastmile','bool'],
['media_memo','สื่อ · บันทึก','bool'],['media_infographic','สื่อ · Infographic','bool'],['media_video','สื่อ · VDO','bool'],
['status','สถานะ (Status)','status'],['remark','หมายเหตุ (Remark)','text'],['sms_message','SMS Message','text'],['target','Target / Audience','text'],['owner','Owner','text'],['category','หัวข้อ','text'],['unit','หน่วยงาน','text'],['project','ชื่อโครงการ/แคมเปญ','text']];
var ALIAS={day:['วัน','วันในสัปดาห์','วันที่สื่อสาร (วัน)','weekday'],communication_date:['วันที่','date'],title:['เรื่องสื่อสาร','เรื่อง','หัวข้อเรื่อง','title','topic'],communication_time:['เวลาสื่อสาร','เวลา','time'],
channel_line:['line'],channel_top_hit:['top hit','tophit','top-hit','tophit'],channel_banner:['banner'],channel_sms:['sms'],channel_appstaff:['app staff','appstaff','app-staff'],channel_lastmile:['lastmile','last mile','last-mile'],
media_memo:['บันทึก','memo'],media_infographic:['info','infographic','อินโฟ'],media_video:['vdo','video','วิดีโอ'],
status:['สถานะ','status'],remark:['หมายเหตุ','remark','note'],sms_message:['sms message','ข้อความ sms','ข้อความ'],target:['target','audience','กลุ่มเป้าหมาย','เป้าหมาย'],owner:['owner','ผู้รับผิดชอบ','เจ้าของ'],publish:['วันเผยแพร่','เผยแพร่'],date_start:['วันดำเนินการ'],date_done:['วันเสร็จสิ้น','วันเสร็จ'],category:['หัวข้อ'],unit:['หน่วยงาน'],project:['ชื่อโครงการ/แคมเปญ','ชื่อโครงการ','แคมเปญ','โครงการ']};
var LAB2KEY={};(function(){var SL=(typeof statusLabel!=='undefined')?statusLabel:{};Object.keys(SL).forEach(function(k){LAB2KEY[SL[k].toLowerCase()]=k;LAB2KEY[k.toLowerCase()]=k;});})();
var FUZZY={'เสร็จสิ้น':'Completed','เสร็จ':'Completed','done':'Completed','ดำเนินการ':'In Progress','กำลังดำเนินการ':'In Progress','ระหว่างดำเนินการ':'In Progress','planned':'To Do','วางแผน':'To Do','รอดำเนินการ':'To Do','on hold':'On Hold','พักงาน':'On Hold'};
function tf(v){return String(v==null?'':v).trim().toUpperCase().replace(/^﻿/,'')==='TRUE'||['YES','1','✓','✔','Y','X'].indexOf(String(v||'').trim().toUpperCase())>=0;}
var THMON={'มค':1,'กพ':2,'มีค':3,'เมย':4,'พค':5,'มิย':6,'กค':7,'สค':8,'กย':9,'ตค':10,'พย':11,'ธค':12,'มกราคม':1,'กุมภาพันธ์':2,'มีนาคม':3,'เมษายน':4,'พฤษภาคม':5,'มิถุนายน':6,'กรกฎาคม':7,'สิงหาคม':8,'กันยายน':9,'ตุลาคม':10,'พฤศจิกายน':11,'ธันวาคม':12};
function normDate(s){s=(s||'').trim();if(!s)return '';
 var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m){var y=+m[1];if(y>2400)y-=543;return y+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);}
 m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);if(m){var d=+m[1],mo=+m[2],yy=+m[3];if(yy<100)yy+=2000;if(yy>2400)yy-=543;return yy+'-'+('0'+mo).slice(-2)+'-'+('0'+d).slice(-2);}
 // Thai month name/abbrev, e.g. 28-ก.ย.-69 · 31 ส.ค. 2569 · 1/ต.ค./69 (2-digit year = พ.ศ.)
 var toks=s.split(/[\s\-\/]+/).filter(Boolean),dd=null,mo2=null,yy2=null;
 for(var i=0;i<toks.length;i++){var t=toks[i].replace(/\./g,'').trim();if(mo2==null&&THMON[t]!=null){mo2=THMON[t];continue;}if(/^\d{1,4}$/.test(t)){var n=+t;if(dd==null&&t.length<=2&&n>=1&&n<=31)dd=n;else if(yy2==null)yy2=n;}}
 if(dd&&mo2&&yy2!=null){if(yy2<100)yy2+=2500;if(yy2>2400)yy2-=543;return yy2+'-'+('0'+mo2).slice(-2)+'-'+('0'+dd).slice(-2);}
 return null;}
function statusNorm(s){s=(s||'').trim();if(!s)return {k:'To Do',warn:false};var low=s.toLowerCase();if(LAB2KEY[low])return {k:LAB2KEY[low],warn:false};if(FUZZY[s]||FUZZY[low])return {k:FUZZY[s]||FUZZY[low],warn:false};return {k:'To Do',warn:true};}
var WDAY={'จันทร์':1,'อังคาร':1,'พุธ':1,'พฤหัสบดี':1,'พฤหัส':1,'ศุกร์':1,'เสาร์':1,'อาทิตย์':1,'วันจันทร์':1,'วันอังคาร':1,'วันพุธ':1,'วันพฤหัสบดี':1,'วันศุกร์':1,'วันเสาร์':1,'วันอาทิตย์':1};function dupKey(o){return (o.date||o.day||'')+'|'+(o.topic||'').trim()+'|'+(o.time||'').trim();}

var WZ=null,el=null;
function build(){
 if(el)return el;
 el=document.createElement('div');el.className='modalbg';el.id='cpWzBg';
 el.innerHTML='<div class="modal" style="max-width:1000px;width:94vw"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="eyebrow">GOOGLE SHEET IMPORT</div><h2 id="wzTitle" style="margin:4px 0 0">นำเข้าข้อมูล</h2></div><button class="ghost" id="wzClose">✕</button></div><div class="wz-steps" id="wzSteps"></div><div id="wzBody" style="margin-top:6px"></div><div class="row" style="justify-content:space-between;gap:8px;margin-top:16px"><button class="ghost" id="wzBack">ย้อนกลับ</button><div class="row" style="gap:8px"><span class="tiny muted" id="wzHint"></span><button class="primary" id="wzNext">ถัดไป</button></div></div></div>';
 document.body.appendChild(el);
 el.addEventListener('click',function(e){if(e.target.id==='cpWzBg')close();});
 el.querySelector('#wzClose').onclick=close;
 el.querySelector('#wzBack').onclick=function(){go(WZ.step-1);};
 el.querySelector('#wzNext').onclick=next;
 return el;
}
function close(){if(el)el.classList.remove('open');}
var STEPS=['เชื่อมต่อ','จับคู่คอลัมน์','ตรวจสอบ','พรีวิว','ยืนยัน','ผลลัพธ์'];
function renderSteps(){el.querySelector('#wzSteps').innerHTML=STEPS.map(function(s,i){return '<span class="wz-step'+(i===WZ.step?' on':'')+(i<WZ.step?' done':'')+'">'+(i+1)+'. '+s+'</span>';}).join('');}
function setHint(t){el.querySelector('#wzHint').textContent=t||'';}

window.cpWizard=function(){build();WZ={step:0,url:SHEET,mode:'internal',headers:[],rows:[],total:0,map:{},parsed:[],dupMode:'skip',result:null};el.classList.add('open');go(0);};

function go(step){if(step<0)step=0;WZ.step=step;renderSteps();var B=el.querySelector('#wzBody');var back=el.querySelector('#wzBack'),next=el.querySelector('#wzNext');back.style.visibility=step===0?'hidden':'visible';next.textContent='ถัดไป';next.disabled=false;setHint('');
 if(step===0)stepConnect(B);
 else if(step===1)stepMap(B);
 else if(step===2)stepValidate(B);
 else if(step===3)stepPreview(B);
 else if(step===4)stepConfirm(B);
 else if(step===5)stepResult(B);
}
function next(){var s=WZ.step;
 if(s===0){if(!WZ.headers.length){setHint('กรุณากด “เชื่อมต่อ & อ่านชีต” ก่อน');return;}go(1);}
 else if(s===1){if(!WZ.map.title&&WZ.map.title!==0){setHint('ต้องจับคู่คอลัมน์ “เรื่องสื่อสาร” ก่อน');return;}buildParsed();go(2);}
 else if(s===2){go(3);}
 else if(s===3){go(4);}
 else if(s===4){doImport();go(5);}
 else if(s===5){close();if(window.renderCP)window.renderCP();}
}

// STEP 1 — connect
function stepConnect(B){
 B.innerHTML='<div class="field"><label>ลิงก์ Google Sheet (แชร์แบบ “ทุกคนที่มีลิงก์ดูได้”)</label><input id="wzUrl" class="cp-inp" style="width:100%" value="'+esc2(WZ.url)+'"></div>'+'<div class="row" style="gap:8px;margin-top:8px;align-items:center"><span class="tiny muted">ประเภทข้อมูล:</span><button class="ghost cp-mode'+(WZ.mode==="internal"?" primary":"")+'" data-mode="internal">Internal · ภายใน</button><button class="ghost cp-mode'+(WZ.mode==="external"?" primary":"")+'" data-mode="external">External · ลูกค้า</button></div>'
 +'<div class="row" style="gap:8px;margin-top:6px"><button class="primary" id="wzConnect">เชื่อมต่อ & อ่านชีต</button><span class="tiny muted" id="wzConnMsg">'+(WZ.total?('พบ '+WZ.total+' แถว · '+WZ.headers.length+' คอลัมน์'):'')+'</span></div>'
 +(WZ.headers&&WZ.headers.length?('<div class="field" style="margin-top:12px;max-width:240px"><label>แถวหัวตาราง (ตรวจพบอัตโนมัติ · ปรับได้)</label><input type="number" min="1" id="wzHdrRow" class="cp-inp" value="'+((WZ.hdrIdx||0)+1)+'"></div><div class="tiny muted" style="margin-top:4px">คอลัมน์ที่ใช้งาน: '+WZ.headers.filter(function(h){return h;}).map(function(h){return '<span class="cp-tag">'+esc2(h)+'</span>';}).join(' ')+'</div>'):'');
 B.querySelector('#wzConnect').onclick=function(){
  var url=B.querySelector('#wzUrl').value.trim();WZ.url=url;var msg=B.querySelector('#wzConnMsg');msg.textContent='กำลังเชื่อมต่อ...';
  fetch('/api/raw-sheet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,mode:WZ.mode})}).then(function(r){return r.json();}).then(function(d){
   if(!d.ok){msg.textContent='✕ '+(d.error||'อ่านชีตไม่สำเร็จ');return;}
   WZ.rawHeaders=d.headers||[];WZ.rawRows=d.rows||[];detectHeader();autoMap();
   msg.textContent='✓ อ่านสำเร็จ · แถวข้อมูล '+WZ.total+' แถว';stepConnect(B);
  }).catch(function(e){msg.textContent='✕ '+e;});
 };
 B.querySelectorAll('.cp-mode').forEach(function(mb){mb.onclick=function(){WZ.mode=mb.dataset.mode;WZ.headers=[];WZ.rawHeaders=[];WZ.rawRows=[];WZ.total=0;stepConnect(B);};});
 var hr=B.querySelector('#wzHdrRow');if(hr)hr.onchange=function(){var v=parseInt(hr.value,10);if(isNaN(v)||v<1)v=1;WZ.hdrIdx=v-1;applyHeader();autoMap();stepConnect(B);};
}
function grid(){return [WZ.rawHeaders||[]].concat(WZ.rawRows||[]);}
function detectHeader(){var G=grid();var hi=-1;for(var i=0;i<G.length;i++){if((G[i]||[]).some(function(c){var t=(c||'').trim();return t==='เรื่องสื่อสาร'||t==='เรื่อง';})){hi=i;break;}}WZ.hdrIdx=(hi<0?0:hi);applyHeader();}
function applyHeader(){var G=grid();var hi=WZ.hdrIdx||0;var H=G[hi]||[];var sub=null,dataStart=hi+1;
 var titleJ=-1;for(var j=0;j<H.length;j++){var t=(H[j]||'').trim();if(t==='เรื่องสื่อสาร'||t==='เรื่อง'){titleJ=j;break;}}
 if(hi+1<G.length){var nxt=G[hi+1]||[];var te=(titleJ<0)||!((nxt[titleJ]||'').trim());
  var looksSub=nxt.some(function(c){var u=(c||'').trim().toUpperCase();return u&&['LINE','SMS','BANNER','TOP HIT','TOPHIT','APP STAFF','APPSTAFF','LASTMILE','INFOGRAPHIC','INFO','VDO','บันทึก'].some(function(k){return u.indexOf(k)>=0;});});
  if(te&&looksSub){sub=nxt;dataStart=hi+2;}}
 WZ.headers=H.map(function(c,j){var s=(sub&&sub[j])?(''+sub[j]).trim():'';return s||(''+(c||'')).trim();});
 WZ.rows=G.slice(dataStart).filter(function(r){return (r||[]).some(function(c){return (c||'').trim();});});
 WZ.total=WZ.rows.length;}
function autoMap(){WZ.map={};var used={};
 // Two passes: exact header match first (so e.g. "วัน" and "วันที่" never steal each
 // other via substring), then fuzzy substring for anything still unmapped.
 function pass(exact){SYS.forEach(function(f){var key=f[0];if(key in WZ.map)return;var al=ALIAS[key]||[];for(var j=0;j<WZ.headers.length;j++){if(used[j])continue;var hh=(WZ.headers[j]||'').toLowerCase().trim();if(!hh)continue;for(var a=0;a<al.length;a++){var av=al[a];if(exact?(hh===av):(hh.indexOf(av)>=0)){WZ.map[key]=j;used[j]=1;return;}}}});}
 pass(true);pass(false);}

// STEP 2 — map
function stepMap(B){
 var opts=function(sel){return '<option value="-1">— ไม่ใช้ —</option>'+WZ.headers.map(function(h,j){return '<option value="'+j+'"'+(sel===j?' selected':'')+'>'+esc2(h||('คอลัมน์ '+(j+1)))+'</option>';}).join('');};
 var rows=SYS.map(function(f){var k=f[0];var cur=(k in WZ.map)?WZ.map[k]:-1;var ok=(cur>=0);return '<tr><td>'+esc2(f[1])+'</td><td style="text-align:center">→</td><td><select class="filter wz-map" data-k="'+k+'" style="min-width:200px">'+opts(cur)+'</select></td><td>'+(ok?'<span class="pill s-progress">จับคู่แล้ว</span>':'<span class="tiny muted">ไม่ได้ใช้</span>')+'</td></tr>';}).join('');
 B.innerHTML='<div class="tiny muted" style="margin-bottom:8px">ระบบจับคู่คอลัมน์อัตโนมัติจากชื่อที่ใกล้เคียง · ปรับได้ด้วยตนเอง · TRUE/FALSE จะถูกแปลงเป็น Checkbox อัตโนมัติ</div><div class="cp-table-wrap" style="max-height:420px"><table class="table"><thead><tr><th>คอลัมน์จาก Google Sheet</th><th></th><th>ฟิลด์ในระบบ</th><th>สถานะ</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 B.querySelectorAll('.wz-map').forEach(function(s){s.onchange=function(){var v=+s.value;if(v<0)delete WZ.map[s.dataset.k];else WZ.map[s.dataset.k]=v;stepMap(B);};});
}

// build parsed+validated rows
function cell(r,k){var j=WZ.map[k];return (j==null||j<0||j>=r.length)?'':(r[j]||'');}
function parseRow(r){
 var o={date:'',day:'',time:(cell(r,'communication_time')||'').trim(),topic:(cell(r,'title')||'').trim(),
  ch:{line:tf(cell(r,'channel_line')),tophit:tf(cell(r,'channel_top_hit')),banner:tf(cell(r,'channel_banner')),sms:tf(cell(r,'channel_sms')),appstaff:tf(cell(r,'channel_appstaff')),lastmile:tf(cell(r,'channel_lastmile'))},
  md:{memo:tf(cell(r,'media_memo')),info:tf(cell(r,'media_infographic')),vdo:tf(cell(r,'media_video'))},
  remark:(cell(r,'remark')||'').trim(),sms_msg:(cell(r,'sms_message')||'').trim(),sms_target:(cell(r,'target')||'').trim(),owner:(cell(r,'owner')||'').trim()};
 var _pd='';['communication_date','publish','date_start'].forEach(function(k){if(_pd)return;var v=(cell(r,k)||'').trim();if(v)_pd=v;});var _dc=(cell(r,'day')||'').trim();o.day=_dc;if(_pd){if(WDAY[_pd]){o.day=o.day||_pd;o.date='';o._rawDate='';}else{o.date=normDate(_pd);o._rawDate=_pd;}}else{o.date='';o._rawDate='';}var _ex=[],_c=(cell(r,'category')||'').trim(),_u=(cell(r,'unit')||'').trim(),_pj=(cell(r,'project')||'').trim(),_s=(cell(r,'date_start')||'').trim(),_e=(cell(r,'date_done')||'').trim();if(_c)_ex.push('หัวข้อ: '+_c);if(_u)_ex.push('หน่วยงาน: '+_u);if(_pj)_ex.push('โครงการ: '+_pj);if(_s)_ex.push('เริ่ม: '+_s);if(_e)_ex.push('เสร็จ: '+_e);if(_ex.length)o.remark=[o.remark].concat(_ex).filter(Boolean).join(' · ');var sn=statusNorm(cell(r,'status'));o.status=sn.k;o._statusWarn=sn.warn;return o;}
function validate(o,existKeys,batchSeen){var errs=[],level='valid';
 if(!o.topic)errs.push({c:'เรื่องสื่อสาร',m:'ไม่มีข้อมูล (จำเป็น)',e:true});
 if(o.date===null){errs.push({c:'วันที่',m:'รูปแบบวันที่ไม่ถูกต้อง: '+o._rawDate,e:true});}
 else if(o.date===''&&!o.day){errs.push({c:'วัน/วันที่',m:'ไม่มีวัน/วันที่',e:false});}
 if(o._statusWarn)errs.push({c:'สถานะ',m:'สถานะไม่รู้จัก · ตั้งเป็น รอดำเนินการ',e:false});
 var hasErr=errs.some(function(x){return x.e;});
 var k=dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time});
 var isDup=(!hasErr)&&(existKeys[k]||batchSeen[k]);
 if(hasErr)level='error';else if(isDup){level='duplicate';errs.push({c:'ซ้ำ',m:'มีข้อมูลเดิม (วันที่+เรื่อง+เวลา)',e:false});}
 else if(errs.length)level='warning';
 return {level:level,errs:errs};}
function fillCols(){var cols=[];['communication_date','day','publish','date_start','date_done','project'].forEach(function(k){if(WZ.map[k]!=null&&WZ.map[k]>=0)cols.push(WZ.map[k]);});cols.forEach(function(j){var last='';WZ.rows.forEach(function(r){var v=(r[j]||'').trim();if(v)last=v;else if(last)r[j]=last;});});}function buildParsed(){fillCols();var existKeys={};(window.CPall?window.CPall():[]).forEach(function(r){existKeys[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=1;});
 var batchSeen={};WZ.parsed=WZ.rows.map(function(r){var o=parseRow(r);var v=validate(o,existKeys,batchSeen);var k=dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time});if(o.topic)batchSeen[k]=1;return {o:o,level:v.level,errs:v.errs,sel:(v.level!=='error'),skip:false};});}
function revalidate(p){var existKeys={};(window.CPall?window.CPall():[]).forEach(function(r){existKeys[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=1;});var v=validate(p.o,existKeys,{});p.level=v.level;p.errs=v.errs;}
function counts(){var c={total:WZ.parsed.length,valid:0,warning:0,error:0,duplicate:0};WZ.parsed.forEach(function(p){c[p.level]++;});return c;}

// STEP 3 — validate summary
function stepValidate(B){var c=counts();
 B.innerHTML='<div class="cp-sum"><div class="cp-chip"><b>'+c.total+'</b><span>ทั้งหมด</span></div>'
  +'<div class="cp-chip" style="border-color:#bfe3c4"><b style="color:#2e7d4f">'+c.valid+'</b><span>พร้อมนำเข้า ✓</span></div>'
  +'<div class="cp-chip" style="border-color:#f3dca6"><b style="color:#9a6b16">'+c.warning+'</b><span>เตือน ⚠</span></div>'
  +'<div class="cp-chip" style="border-color:#f0b4ab"><b style="color:#c0392b">'+c.error+'</b><span>ผิดพลาด ✕</span></div>'
  +'<div class="cp-chip" style="border-color:#c9d6ea"><b style="color:#3a6ea5">'+c.duplicate+'</b><span>ซ้ำ ⟳</span></div></div>'
  +'<div class="tiny muted">• แถวที่ผิดพลาด (✕) จะไม่ถูกนำเข้า · แถวเตือน (⚠) นำเข้าได้ · แถวซ้ำ (⟳) จัดการได้ในขั้นยืนยัน<br>• กด “ถัดไป” เพื่อดูพรีวิวและแก้ไขข้อมูลก่อนนำเข้า</div>';
}

// STEP 4 — preview (editable)
function badge(level){var m={valid:['✓','s-progress'],warning:['⚠','s-approval'],error:['✕','s-reject'],duplicate:['⟳','']};var b=m[level]||m.valid;return '<span class="pill '+b[1]+'" title="'+esc2((WZ._errMap&&'')||level)+'">'+b[0]+'</span>';}
function stepPreview(B){
 var flt=WZ._pflt||'all';
 var head='<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">'
  +['all:ทั้งหมด','valid:พร้อม ✓','warning:เตือน ⚠','error:ผิดพลาด ✕','duplicate:ซ้ำ ⟳'].map(function(x){var k=x.split(':')[0];return '<button class="ghost cp-mini wz-flt'+(flt===k?' primary':'')+'" data-f="'+k+'">'+x.split(':')[1]+'</button>';}).join('')
  +'<span style="flex:1"></span><button class="ghost cp-mini" id="wzSelAll">เลือกทั้งหมด</button><button class="ghost cp-mini" id="wzSelNone">ไม่เลือก</button></div>';
 var rows='';
 WZ.parsed.forEach(function(p,i){ if(flt!=='all'&&p.level!==flt)return;
  var errT=p.errs.map(function(e){return (e.e?'✕ ':'⚠ ')+e.c+': '+e.m;}).join('\n');
  var cls=p.level==='error'?'wz-err':(p.level==='warning'?'wz-warn':(p.level==='duplicate'?'wz-dup':''));
  rows+='<tr class="'+cls+(p.skip?' wz-skip':'')+'" title="'+esc2(errT)+'">'
   +'<td><input type="checkbox" class="wz-sel" data-i="'+i+'"'+(p.sel&&!p.skip?' checked':'')+(p.level==='error'?' disabled':'')+'></td>'
   +'<td>'+badge(p.level)+'</td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="day" value="'+esc2(p.o.day||'')+'" style="width:72px"></td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="date" value="'+esc2(p.o.date===null?p.o._rawDate:(p.o.date||''))+'" style="width:120px"></td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="time" value="'+esc2(p.o.time||'')+'" style="width:80px"></td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="topic" value="'+esc2(p.o.topic||'')+'" style="width:220px"></td>'
   +'<td>'+chTags(p.o.ch)+'</td><td>'+mdTags(p.o.md)+'</td>'
   +'<td><select class="wz-ed filter" data-i="'+i+'" data-f="status">'+STS.map(function(s){return '<option value="'+s+'"'+(p.o.status===s?' selected':'')+'>'+esc2(slab(s))+'</option>';}).join('')+'</select></td>'
   +'<td><button class="ghost cp-mini wz-skipbtn" data-i="'+i+'">'+(p.skip?'ยกเลิกข้าม':'ข้าม')+'</button></td>'
   +'</tr>';
 });
 if(!rows)rows='<tr><td class="empty" colspan="10">ไม่มีแถวในตัวกรองนี้</td></tr>';
 B.innerHTML=head+'<div class="cp-table-wrap" style="max-height:440px"><table class="table"><thead><tr><th>นำเข้า</th><th>สถานะ</th><th>วัน</th><th>วันที่</th><th>เวลา</th><th>เรื่องสื่อสาร</th><th>ช่องทาง</th><th>สื่อ</th><th>สถานะงาน</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="tiny muted" style="margin-top:6px">วางเมาส์บนแถวเพื่อดูสาเหตุ · แก้ไขช่องวันที่/เวลา/เรื่อง/สถานะได้โดยตรง แล้วระบบจะตรวจสอบใหม่ทันที</div>';
 B.querySelectorAll('.wz-flt').forEach(function(b){b.onclick=function(){WZ._pflt=b.dataset.f;stepPreview(B);};});
 B.querySelector('#wzSelAll').onclick=function(){WZ.parsed.forEach(function(p){if(p.level!=='error')p.sel=true;});stepPreview(B);};
 B.querySelector('#wzSelNone').onclick=function(){WZ.parsed.forEach(function(p){p.sel=false;});stepPreview(B);};
 B.querySelectorAll('.wz-sel').forEach(function(c){c.onchange=function(){WZ.parsed[+c.dataset.i].sel=c.checked;};});
 B.querySelectorAll('.wz-skipbtn').forEach(function(b){b.onclick=function(){var p=WZ.parsed[+b.dataset.i];p.skip=!p.skip;stepPreview(B);};});
 B.querySelectorAll('.wz-ed').forEach(function(inp){inp.onchange=function(){var p=WZ.parsed[+inp.dataset.i];var f=inp.dataset.f;
   if(f==='day'){p.o.day=inp.value.trim();}
   else if(f==='date'){var vv=inp.value.trim();if(!vv){p.o.date='';p.o._rawDate='';}else if(WDAY[vv]){p.o.day=vv;p.o.date='';p.o._rawDate='';}else{p.o.date=normDate(vv);p.o._rawDate=vv;}}
   else if(f==='time')p.o.time=inp.value.trim();
   else if(f==='topic')p.o.topic=inp.value.trim();
   else if(f==='status')p.o.status=inp.value;
   revalidate(p);if(p.level==='error')p.sel=false;stepPreview(B);};});
}
function chTags(ch){var D=[['line','LINE'],['tophit','TOP HIT'],['banner','Banner'],['sms','SMS'],['appstaff','APP STAFF'],['lastmile','Lastmile']];var t=D.filter(function(d){return ch[d[0]];}).map(function(d){return '<span class="cp-tag cp-tag-'+d[0]+'">'+d[1]+'</span>';}).join(' ');return t||'<span class="tiny muted">—</span>';}
function mdTags(md){var D=[['memo','บันทึก'],['info','Info'],['vdo','VDO']];var t=D.filter(function(d){return md[d[0]];}).map(function(d){return '<span class="cp-tag">'+d[1]+'</span>';}).join(' ');return t||'<span class="tiny muted">—</span>';}

// STEP 5 — confirm
function stepConfirm(B){var c=counts();
 var willImport=WZ.parsed.filter(function(p){return p.sel&&!p.skip&&p.level!=='error';}).length;
 var dups=WZ.parsed.filter(function(p){return p.sel&&!p.skip&&p.level==='duplicate';}).length;
 B.innerHTML='<div class="tiny muted" style="margin-bottom:10px">ตรวจสอบก่อนนำเข้าจริง · ข้อมูลจะถูกบันทึกลงระบบ (Communication Plan) และสร้าง Communication ID ให้แต่ละรายการ</div>'
  +'<div class="field" style="max-width:360px"><label>วิธีจัดการข้อมูลซ้ำ ('+dups+' แถว)</label><select class="filter" id="wzDup"><option value="skip">ข้าม (Skip) — ค่าเริ่มต้น</option><option value="update">อัปเดตข้อมูลเดิม (Update)</option><option value="new">นำเข้าเป็นรายการใหม่ (Import as New)</option></select></div>'
  +'<div class="cp-sum" style="margin-top:12px"><div class="cp-chip"><b>'+willImport+'</b><span>จะนำเข้า</span></div><div class="cp-chip"><b>'+dups+'</b><span>ในนั้นเป็นรายการซ้ำ</span></div><div class="cp-chip"><b style="color:#c0392b">'+c.error+'</b><span>ผิดพลาด (ไม่นำเข้า)</span></div></div>'
  +'<div class="tiny muted">กด “ถัดไป” เพื่อนำเข้าตามที่เลือก (จะไม่เขียนทับข้อมูลเดิมโดยอัตโนมัติ)</div>';
 B.querySelector('#wzDup').value=WZ.dupMode;B.querySelector('#wzDup').onchange=function(e){WZ.dupMode=e.target.value;};
 el.querySelector('#wzNext').textContent='นำเข้าข้อมูล';
}
function assign(rec,o){rec.date=o.date||'';rec.day=o.day||'';rec.time=o.time||'';rec.topic=o.topic||'';rec.ch={line:!!o.ch.line,tophit:!!o.ch.tophit,banner:!!o.ch.banner,sms:!!o.ch.sms,appstaff:!!o.ch.appstaff,lastmile:!!o.ch.lastmile};rec.md={memo:!!o.md.memo,info:!!o.md.info,vdo:!!o.md.vdo};rec.status=o.status||'To Do';rec.remark=o.remark||'';rec.sms_msg=o.sms_msg||'';rec.sms_target=o.sms_target||'';rec.owner=o.owner||'';}
function doImport(){var all=window.CPall?window.CPall():[];var byKey={};all.forEach(function(r){byKey[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=r;});
 var imported=0,updated=0,skipped=0,failed=0,failRows=[];
 WZ.parsed.forEach(function(p){
  if(!p.sel||p.skip){skipped++;return;}
  if(p.level==='error'){failed++;failRows.push({topic:p.o.topic||'(ไม่มีชื่อ)',reason:p.errs.filter(function(e){return e.e;}).map(function(e){return e.c+': '+e.m;}).join('; ')});return;}
  var o=p.o,isDup=p.level==='duplicate';
  if(isDup){if(WZ.dupMode==='skip'){skipped++;return;}if(WZ.dupMode==='update'){var ex=byKey[dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time})];if(ex){assign(ex,o);updated++;return;}}}
  var rec={cid:(window.CPnewId?window.CPnewId():('C'+Date.now()+Math.random())),src:'sheet',taskId:null,importedAt:new Date().toISOString(),importedBy:who()};
  assign(rec,o);all.push(rec);byKey[dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time})]=rec;imported++;
 });
 if(window.CPsave)window.CPsave(all);
 var log=[];try{log=JSON.parse(localStorage.getItem(LOGKEY)||'[]');if(!Array.isArray(log))log=[];}catch(e){log=[];}
 var entry={at:new Date().toISOString(),by:who(),source:WZ.url,imported:imported,updated:updated,skipped:skipped,failed:failed,total:WZ.parsed.length};
 log.unshift(entry);try{localStorage.setItem(LOGKEY,JSON.stringify(log.slice(0,50)));}catch(e){}
 WZ.result={imported:imported,updated:updated,skipped:skipped,failed:failed,failRows:failRows};
 if(window.renderCP)window.renderCP();
}

// STEP 6 — result
function stepResult(B){var r=WZ.result||{imported:0,updated:0,skipped:0,failed:0,failRows:[]};
 B.innerHTML='<div class="cp-sum"><div class="cp-chip" style="border-color:#bfe3c4"><b style="color:#2e7d4f">'+r.imported+'</b><span>นำเข้าใหม่</span></div><div class="cp-chip"><b>'+r.updated+'</b><span>อัปเดต</span></div><div class="cp-chip"><b>'+r.skipped+'</b><span>ข้าม</span></div><div class="cp-chip" style="border-color:#f0b4ab"><b style="color:#c0392b">'+r.failed+'</b><span>ไม่สำเร็จ</span></div></div>'
  +(r.failRows&&r.failRows.length?('<div class="tiny muted" style="margin:4px 0 6px">รายการที่นำเข้าไม่สำเร็จ:</div><div class="cp-table-wrap" style="max-height:200px"><table class="table"><thead><tr><th>เรื่อง</th><th>สาเหตุ</th></tr></thead><tbody>'+r.failRows.map(function(f){return '<tr><td>'+esc2(f.topic)+'</td><td class="wz-err">'+esc2(f.reason)+'</td></tr>';}).join('')+'</tbody></table></div>'):'<div class="tiny muted">บันทึกประวัติการนำเข้าแล้ว (ผู้ดำเนินการ · วันเวลา · แหล่งข้อมูล · จำนวน)</div>')
  +'<div class="tiny muted" style="margin-top:8px">ข้อมูลถูกบันทึกลงระบบแล้ว · กด “เสร็จสิ้น” เพื่อปิด</div>';
 el.querySelector('#wzNext').textContent='เสร็จสิ้น';el.querySelector('#wzBack').style.visibility='hidden';
}
})();
;
/* js/18-supporting-creator.js */
(function(){
window.wtSupportMS=function(){
 var btn=document.getElementById('fSupportBtn'),pop=document.getElementById('fSupportPop'),inp=document.getElementById('fSupport');
 if(!btn||!pop||!inp)return;
 if(!window._msCss){window._msCss=1;document.head.insertAdjacentHTML('beforeend','<style>.ms-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#fff;border:1px solid #d7e0ea;border-radius:10px;box-shadow:0 8px 24px #1936291f;padding:6px;min-width:160px;max-height:260px;overflow:auto}.ms-opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap}.ms-opt input[type=checkbox]{width:16px;height:16px;flex:none;padding:0;margin:0;border:0;accent-color:#1766cc;cursor:pointer}.ms-opt:hover{background:#f4f8ff}.ms-btn{cursor:pointer;background:#fff;text-align:left}</style>');}
 function cur(){return (inp.value||'').split(',').map(function(x){return x.trim();}).filter(Boolean);}
 var opts=(window.DDget?window.DDget('supporting'):[]);if(!opts||!opts.length)opts=(typeof people!=='undefined'?people.slice():[]);
 cur().forEach(function(v){if(opts.indexOf(v)<0)opts.push(v);});
 function label(){var a=cur();btn.textContent=(a.length?(a.length<=2?a.join(', '):a.length+' คน'):'— เลือกผู้ช่วย —');}
 function build(){var a=cur();pop.innerHTML=opts.length?opts.map(function(pp){return '<label class="ms-opt"><input type="checkbox" value="'+pp+'" '+(a.indexOf(pp)>=0?'checked':'')+'> '+pp+'</label>';}).join(''):'<div class="tiny muted" style="padding:6px">ยังไม่มีรายชื่อ — เพิ่มที่หน้าจัดการดรอปดาวน์</div>';
  [].forEach.call(pop.querySelectorAll('input'),function(c){c.onchange=function(){var a=cur();if(c.checked){if(a.indexOf(c.value)<0)a.push(c.value);}else{a=a.filter(function(x){return x!==c.value;});}inp.value=a.join(', ');label();};});}
 btn.onclick=function(e){e.stopPropagation();var willOpen=pop.hidden;document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});pop.hidden=!willOpen;if(willOpen)build();};
 pop.onclick=function(e){e.stopPropagation();};
 if(!window._msDocBound){window._msDocBound=1;document.addEventListener('click',function(){document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});});}
 label();
};
})();
;
/* js/19-team-leave.js */
(function(){
var LK='worktracker-leave-v1',SK='worktracker-leave-settings-v1',AK='worktracker-leave-audit-v1';
var DEFSET={maxPerDay:2,weekendOff:true,holidays:[],types:[
 {id:'annual',name:'ลาพักร้อน',ent:10,active:true},{id:'sick',name:'ลาป่วย',ent:30,active:true},
 {id:'personal',name:'ลากิจ',ent:5,active:true},{id:'comp',name:'วันหยุดชดเชย',ent:0,active:true},{id:'other',name:'อื่นๆ',ent:0,active:true},{id:'adopt',name:'ลาเพื่อดูแลบุตรบุญธรรม',ent:0,active:true,special:true},{id:'hajj',name:'ลาประกอบพิธีฮัจย์',ent:0,active:true,special:true},{id:'maternity',name:'ลาคลอด(หญิง)',ent:98,active:true,special:true},{id:'military',name:'ลาเพื่อรับราชการทหาร',ent:0,active:true,special:true},{id:'ordain',name:'ลาอุปสมบท',ent:0,active:true,special:true},{id:'childsick',name:'ลาต่อเนื่องเพื่อเลี้ยงดูบุตรที่ป่วย',ent:0,active:true,special:true},{id:'spouse',name:'ลาช่วยคู่สมรสเลี้ยงดูบุตร',ent:0,active:true,special:true},{id:'sterilize',name:'ลาทำหมัน',ent:0,active:true,special:true}],quota:{}};
function esc2(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function loadL(){try{var s=JSON.parse(localStorage.getItem(LK)||'[]');return Array.isArray(s)?s:[];}catch(e){return [];}}
function saveL(a){try{localStorage.setItem(LK,JSON.stringify(a));}catch(e){}}
function loadSet(){var s;try{s=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){s=null;}if(!s||typeof s!=='object')s={};if(typeof s.maxPerDay!=='number')s.maxPerDay=DEFSET.maxPerDay;if(typeof s.weekendOff!=='boolean')s.weekendOff=true;if(!Array.isArray(s.holidays))s.holidays=[];if(!Array.isArray(s.types)||!s.types.length)s.types=DEFSET.types.map(function(t){return {id:t.id,name:t.name,ent:t.ent,active:true,special:!!t.special};});else{DEFSET.types.forEach(function(dt){if(dt.special&&!s.types.some(function(x){return x.id===dt.id;}))s.types.push({id:dt.id,name:dt.name,ent:dt.ent,active:true,special:true});});}if(!s.quota||typeof s.quota!=='object')s.quota={};return s;}
function saveSet(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch(e){}}
function audit(action,req,detail){try{var a=JSON.parse(localStorage.getItem(AK)||'[]');if(!Array.isArray(a))a=[];a.unshift({at:new Date().toISOString(),user:ME(),action:action,reqId:req&&req.id,emp:req&&req.emp,detail:detail||''});localStorage.setItem(AK,JSON.stringify(a.slice(0,300)));}catch(e){}}
window.LVall=loadL;window.LVsave=saveL;
function PEOPLE(){return (window.DDget?window.DDget('people'):[])||((typeof people!=='undefined')?people:[]);}
function ME(){return (window.__WT_USER__&&window.__WT_USER__.name)||'';}
function canApprove(){var r=((window.__WT_USER__&&window.__WT_USER__.role)||'').toLowerCase();if(!r)return true;return /admin|manager|lead|head|หัวหน้า|ผู้จัดการ/.test(r);}
function typeName(id){var t=loadSet().types.filter(function(x){return x.id===id;})[0];return t?t.name:id;}
function newId(){return 'L'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
// --- date utils ---
function pad(n){return ('0'+n).slice(-2);}
function fmt(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function pd(s){var p=(s||'').split('-');return new Date(+p[0],(+p[1]||1)-1,+p[2]||1);}
function isWeekend(ds){var g=pd(ds).getDay();return g===0||g===6;}
function isHol(ds){return loadSet().holidays.some(function(h){return h.date===ds;});}
function isOff(ds){var s=loadSet();return (s.weekendOff&&isWeekend(ds))||isHol(ds);}
function eachDay(a,b){var out=[],d=pd(a),e=pd(b);if(e<d)return out;var g=0;while(fmt(d)<=fmt(e)&&g<400){out.push(fmt(d));d.setDate(d.getDate()+1);g++;}return out;}
function workDays(a,b){return eachDay(a,b).filter(function(ds){return !isOff(ds);});}
function totalDays(r){var wd=workDays(r.start,r.end||r.start);if(!wd.length)return 0;if((r.duration==='am'||r.duration==='pm')&&wd.length===1)return 0.5;return wd.length;}
function activeOn(ds){return loadL().filter(function(r){return (r.status==='Pending'||r.status==='Approved')&&r.start<=ds&&(r.end||r.start)>=ds&&!isOff(ds);});}
function capOn(ds){var seen={};activeOn(ds).forEach(function(r){seen[r.emp]=1;});return Object.keys(seen).length;}
function maxOn(ds){var s=loadSet();return (s.quota&&s.quota[ds])||s.maxPerDay;}
function capState(ds){var n=capOn(ds),m=maxOn(ds);if(n>m)return 'over';if(n>=m)return 'full';if(m>=2&&n>=m-1)return 'nearly';return 'avail';}
function balance(emp,typeId,year){year=year||new Date().getFullYear();var t=loadSet().types.filter(function(x){return x.id===typeId;})[0];var ent=t?(t.ent||0):0;var used=0,pend=0;loadL().forEach(function(r){if(r.emp!==emp||r.type!==typeId)return;if((''+r.start).slice(0,4)!=(''+year))return;if(r.status==='Approved')used+=totalDays(r);else if(r.status==='Pending')pend+=totalDays(r);});return {ent:ent,used:used,pend:pend,remaining:ent-used,avail:ent-used-pend};}
function conflictOf(r){ // does any working day exceed quota (counting this req)?
 return workDays(r.start,r.end||r.start).some(function(ds){var seen={};activeOn(ds).forEach(function(x){if(x.id!==r.id)seen[x.emp]=1;});seen[r.emp]=1;return Object.keys(seen).length>maxOn(ds);});}
var STCLS={Pending:'s-approval',Approved:'s-progress',Rejected:'s-reject',Cancelled:'',Draft:''};
var STLAB={Pending:'รออนุมัติ',Approved:'อนุมัติ',Rejected:'ไม่อนุมัติ',Cancelled:'ยกเลิก',Draft:'ร่าง'};

// ================= RENDER =================
window.renderLeave=function(){
 var host=document.getElementById('lvCalendar');if(!host)return;
 var set=loadSet();var today=fmt(new Date());var ym=today.slice(0,7);
 var all=loadL();
 // summary
 var tItems=activeOn(today);var tNames=Object.keys(tItems.reduce(function(a,r){a[r.emp]=1;return a;},{}));
 setT('lvSumToday',tNames.length);setT('lvSumTodayNames',tNames.join(', '));
 setT('lvSumPending',all.filter(function(r){return r.status==='Pending';}).length);
 var mdays=0;all.forEach(function(r){if(r.status==='Approved'||r.status==='Pending')workDays(r.start,r.end||r.start).forEach(function(ds){if(ds.slice(0,7)===ym)mdays+=((r.duration==='am'||r.duration==='pm')&&workDays(r.start,r.end||r.start).length===1?0.5:1);});});
 setT('lvSumMonth',mdays);
 // full/over days this month
 var fullset={};Object.keys({}); var fdays={};
 for(var dd=1;dd<=31;dd++){var ds=ym+'-'+pad(dd);if(pd(ds).getMonth()!==LVcal.getMonth())continue;}
 var fcount=0;(function(){var y=LVcal.getFullYear(),m=LVcal.getMonth();var dim=new Date(y,m+1,0).getDate();for(var i=1;i<=dim;i++){var ds=y+'-'+pad(m+1)+'-'+pad(i);if(isOff(ds))continue;var st=capState(ds);if(st==='full'||st==='over')fcount++;}})();
 setT('lvSumFull',fcount);
 // calendar or list
 if(LVview==='list')renderCalList();else renderMonth();
 renderApproval();renderTeamList();renderReport();
 // populate filter dropdowns (once-ish)
 fillSel('lvFEmp','ทุกคน',PEOPLE());
 fillTypeSel('lvFType','ทุกประเภทลา');
};
function setT(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function fillSel(id,blank,arr){var e=document.getElementById(id);if(!e)return;var cur=e.value;e.innerHTML='<option value="">'+blank+'</option>'+arr.map(function(p){return '<option value="'+esc2(p)+'">'+esc2(p)+'</option>';}).join('');if(cur)e.value=cur;}
function fillTypeSel(id,blank){var e=document.getElementById(id);if(!e)return;var cur=e.value;e.innerHTML='<option value="">'+blank+'</option>'+loadSet().types.map(function(t){return '<option value="'+t.id+'">'+esc2(t.name)+'</option>';}).join('');if(cur)e.value=cur;}

var LVcal=new Date();LVcal.setDate(1);var LVview='month';var LVsel='';
function renderMonth(){
 document.getElementById('lvCalendar').hidden=false;document.getElementById('lvCalList').hidden=true;
 var y=LVcal.getFullYear(),m=LVcal.getMonth(),first=new Date(y,m,1),off=first.getDay(),dim=new Date(y,m+1,0).getDate(),cells=Math.ceil((off+dim)/7)*7;
 setT('lvCalMonth',new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(first));
 var html=['อา','จ','อ','พ','พฤ','ศ','ส'].map(function(d){return '<div class="calweekday">'+d+'</div>';}).join('');
 var today=fmt(new Date());
 for(var i=0;i<cells;i++){var date=new Date(y,m,1+i-off),ds=fmt(date),inM=date.getMonth()===m;
  var items=activeOn(ds);var members={};items.forEach(function(r){members[r.emp]=members[r.emp]||r;});var names=Object.keys(members);
  var off2=isOff(ds);var n=names.length,mx=maxOn(ds),st=capState(ds);
  var badge=off2?'<span class="lv-badge lv-off">หยุด</span>':(n?('<span class="lv-badge lv-'+st+'">'+n+'/'+mx+'</span>'):'');
  var MAX=3;var evts=names.slice(0,MAX).map(function(nm){var r=members[nm];return '<button class="calevent lv-ev '+(r.status==='Approved'?'lv-ap':'lv-pd')+'" data-lvday="'+ds+'" title="'+esc2(nm+' · '+typeName(r.type)+' · '+STLAB[r.status])+'"><span>'+esc2(nm)+'</span></button>';}).join('');
  var more=n>MAX?'<button type="button" class="calmore" data-lvday="'+ds+'">+'+(n-MAX)+' คน</button>':'';
  html+='<div class="calday '+(inM?'':'other')+' '+(ds===today?'today':'')+' '+(off2?'lv-holiday':'')+'" data-lvday="'+ds+'"><span class="calnum">'+date.getDate()+'</span>'+badge+evts+more+'</div>';
 }
 document.getElementById('lvCalendar').innerHTML=html;
}
function renderCalList(){
 document.getElementById('lvCalendar').hidden=true;var L=document.getElementById('lvCalList');L.hidden=false;
 var y=LVcal.getFullYear(),m=LVcal.getMonth();setT('lvCalMonth',new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(new Date(y,m,1)));
 var dim=new Date(y,m+1,0).getDate(),rows='';
 for(var i=1;i<=dim;i++){var ds=y+'-'+pad(m+1)+'-'+pad(i);var items=activeOn(ds);if(!items.length)continue;var mx=maxOn(ds),st=capState(ds);var seen={};items.forEach(function(r){seen[r.emp]=r;});var names=Object.keys(seen);
  rows+='<tr><td style="white-space:nowrap"><b>'+ds+'</b> · '+thDow(ds)+'</td><td>'+names.map(function(nm){var r=seen[nm];return '<span class="cp-tag '+(r.status==='Approved'?'':'cp-tag-sms')+'">'+esc2(nm)+'</span>';}).join(' ')+'</td><td><span class="lv-badge lv-'+st+'">'+names.length+'/'+mx+'</span></td></tr>';}
 if(!rows)rows='<tr><td class="empty" colspan="3">เดือนนี้ยังไม่มีวันลา</td></tr>';
 L.innerHTML='<div class="cp-table-wrap"><table class="table"><thead><tr><th>วันที่</th><th>ผู้ลา</th><th>โควตา</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function thDow(ds){return ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][pd(ds).getDay()];}

function renderApproval(){
 var t=document.getElementById('lvApprovalTable');if(!t)return;
 var pend=loadL().filter(function(r){return r.status==='Pending';}).sort(function(a,b){return (a.start||'').localeCompare(b.start||'');});
 var ca=canApprove();
 var rows=pend.map(function(r){var bal=balance(r.emp,r.type);var cf=conflictOf(r);
  var capTxt=workDays(r.start,r.end||r.start).map(function(ds){return capOn(ds)+'/'+maxOn(ds);}).join(', ')||'—';
  return '<tr><td>'+avatar(r.emp)+'</td><td>'+esc2(typeName(r.type))+'</td><td style="white-space:nowrap">'+esc2(r.start)+(r.end&&r.end!==r.start?(' → '+esc2(r.end)):'')+'</td><td>'+durLab(r.duration)+'</td><td style="text-align:center">'+totalDays(r)+'</td><td style="text-align:center">'+bal.remaining+'</td><td style="text-align:center">'+capTxt+'</td><td>'+(cf?'<span class="pill s-reject">Conflict</span>':'<span class="tiny muted">Normal</span>')+(r.managerAlert?' <span class="pill s-approval">\ud83d\udd14 แจ้งหัวหน้า</span>':'')+(isSpecial(r.type)?' <span class="pill" style="background:#eef2f7;color:#64748b">พิเศษ</span>':'')+'</td><td class="cp-ops">'+(ca?('<button class="ghost cp-mini" data-lvact="approve" data-id="'+r.id+'">อนุมัติ</button><button class="ghost cp-mini danger" data-lvact="reject" data-id="'+r.id+'">ไม่อนุมัติ</button>'):'')+'<button class="ghost cp-mini" data-lvact="detail" data-id="'+r.id+'">ดู</button></td></tr>';}).join('');
 if(!rows)rows='<tr><td class="empty" colspan="9">ไม่มีคำขอรออนุมัติ</td></tr>';
 t.innerHTML='<thead><tr><th>สมาชิก</th><th>ประเภท</th><th>วันลา</th><th>ลักษณะ</th><th>วัน</th><th>คงเหลือ</th><th>โควตา</th><th>Conflict</th><th>จัดการ</th></tr></thead><tbody>'+rows+'</tbody>';
}
function avatar(nm){return '<span class="avatar">'+esc2((nm||'').slice(0,2).toUpperCase())+'</span> &nbsp; '+esc2(nm);}
function durLab(d){return d==='am'?'ครึ่งเช้า':d==='pm'?'ครึ่งบ่าย':'เต็มวัน';}

var TLF={search:'',range:'all',start:'',end:'',emp:'',type:'',status:''};
function inRangeTL(r){if(TLF.range==='all')return true;var t=fmt(new Date());var days=eachDay(r.start,r.end||r.start);
 if(TLF.range==='today')return days.indexOf(t)>=0;
 if(TLF.range==='month')return days.some(function(d){return d.slice(0,7)===t.slice(0,7);});
 if(TLF.range==='week'){var a=new Date();var off=(a.getDay()+6)%7;var mon=new Date(a);mon.setDate(a.getDate()-off);var sun=new Date(mon);sun.setDate(mon.getDate()+6);return days.some(function(d){return d>=fmt(mon)&&d<=fmt(sun);});}
 if(TLF.range==='custom'){if(!TLF.start&&!TLF.end)return true;return days.some(function(d){return (!TLF.start||d>=TLF.start)&&(!TLF.end||d<=TLF.end);});}
 return true;}
function renderTeamList(){
 var t=document.getElementById('lvListTable');if(!t)return;
 var rows=loadL().filter(function(r){if(TLF.emp&&r.emp!==TLF.emp)return false;if(TLF.type&&r.type!==TLF.type)return false;if(TLF.status&&r.status!==TLF.status)return false;if(TLF.search){var q=TLF.search.toLowerCase();if(((r.emp||'')+' '+(r.reason||'')).toLowerCase().indexOf(q)<0)return false;}return inRangeTL(r);})
  .sort(function(a,b){return (b.start||'').localeCompare(a.start||'');});
 var ca=canApprove(),me=ME();
 var body=rows.map(function(r){var own=(r.emp===me);
  return '<tr><td style="white-space:nowrap"><b>'+esc2(r.start)+'</b>'+(r.end&&r.end!==r.start?('<br><span class="tiny muted">→ '+esc2(r.end)+'</span>'):'')+'</td><td>'+avatar(r.emp)+'</td><td>'+esc2(typeName(r.type))+'</td><td>'+durLab(r.duration)+'</td><td style="text-align:center">'+totalDays(r)+'</td><td><span class="pill '+(STCLS[r.status]||'')+'">'+(STLAB[r.status]||r.status)+'</span>'+(r.conflict?' <span class="pill s-reject">!</span>':'')+'</td><td class="cp-remark" title="'+esc2(r.reason||'')+'">'+esc2(r.reason||'')+'</td><td class="cp-ops"><button class="ghost cp-mini" data-lvact="detail" data-id="'+r.id+'">ดู</button>'+((own||ca)&&(r.status==='Pending'||r.status==='Approved')?'<button class="ghost cp-mini" data-lvact="edit" data-id="'+r.id+'">แก้ไข</button><button class="ghost cp-mini danger" data-lvact="cancel" data-id="'+r.id+'">ยกเลิก</button>':'')+'</td></tr>';}).join('');
 if(!body)body='<tr><td class="empty" colspan="8">ไม่มีรายการ</td></tr>';
 t.innerHTML='<thead><tr><th>วันที่</th><th>สมาชิก</th><th>ประเภท</th><th>ลักษณะ</th><th>วัน</th><th>สถานะ</th><th>เหตุผล</th><th>จัดการ</th></tr></thead><tbody>'+body+'</tbody>';
}
function renderReport(){
 var t=document.getElementById('lvReportTable');if(!t)return;var set=loadSet();var yr=new Date().getFullYear();
 var tys=set.types.filter(function(x){return x.active!==false;});
 var head='<thead><tr><th>สมาชิก</th>'+tys.map(function(x){return '<th style="text-align:center">'+esc2(x.name)+'</th>';}).join('')+'<th style="text-align:center">Pending</th><th style="text-align:center">อนุมัติรวม</th><th style="text-align:center">คงเหลือ(พักร้อน)</th></tr></thead>';
 var body=PEOPLE().map(function(emp){var cells='';var pend=0,appr=0;tys.forEach(function(x){var b=balance(emp,x.id,yr);cells+='<td style="text-align:center">'+(b.used||'')+'</td>';pend+=b.pend;appr+=b.used;});var annual=balance(emp,'annual',yr);
  return '<tr><td class="link" data-lvact="history" data-emp="'+esc2(emp)+'" style="cursor:pointer">'+avatar(emp)+'</td>'+cells+'<td style="text-align:center">'+(pend||'')+'</td><td style="text-align:center"><b>'+(appr||'')+'</b></td><td style="text-align:center">'+annual.remaining+'/'+annual.ent+'</td></tr>';}).join('');
 t.innerHTML=head+'<tbody>'+body+'</tbody>';
}

// ================= MODAL: ADD/EDIT =================
function g(id){return document.getElementById(id);}
var editingLV=null;
function openLeave(id){editingLV=id;var r=id?loadL().filter(function(x){return x.id===id;})[0]:null;
 g('lvModalTitle').textContent=id?'แก้ไขคำขอลา':'ขอวันลา';
 fillSel('lvf_emp','',PEOPLE());var emp=g('lvf_emp');emp.querySelector('option[value=""]')&&emp.removeChild(emp.querySelector('option[value=""]'));
 emp.value=r?r.emp:(PEOPLE().indexOf(ME())>=0?ME():PEOPLE()[0]);
 var ts=loadSet().types.filter(function(x){return x.active!==false;});g('lvf_type').innerHTML=ts.map(function(x){return '<option value="'+x.id+'">'+esc2(x.name)+'</option>';}).join('');
 g('lvf_type').value=r?r.type:(ts[0]&&ts[0].id);
 var t0=fmt(new Date());g('lvf_start').value=r?r.start:t0;g('lvf_end').value=r?(r.end||r.start):t0;g('lvf_dur').value=r?(r.duration||'full'):'full';g('lvf_reason').value=r?(r.reason||''):'';
 updPreview();g('lvModal').classList.add('open');
}
function closeLeave(){g('lvModal').classList.remove('open');}
function updPreview(){
 var st=g('lvf_start').value,en=g('lvf_end').value||st,dur=g('lvf_dur').value,emp=g('lvf_emp').value,ty=g('lvf_type').value;
 if(en<st){g('lvf_end').value=st;en=st;}
 var tmp={id:editingLV,emp:emp,type:ty,start:st,end:en,duration:dur};var days=totalDays(tmp);g('lvf_days').value=days+' วัน';
 var bal=balance(emp,ty);var warn=[];
 var wd=workDays(st,en);
 if(!wd.length)warn.push('⚠ ช่วงที่เลือกเป็นวันหยุด/สุดสัปดาห์ทั้งหมด — ไม่นับเป็นวันลา');
 wd.forEach(function(ds){var seen={};activeOn(ds).forEach(function(x){if(x.id!==editingLV)seen[x.emp]=1;});var others=Object.keys(seen);seen[emp]=1;var n=Object.keys(seen).length,mx=maxOn(ds);if(n>mx)warn.push('⚠ '+ds+' มีผู้ลาแล้ว '+others.length+'/'+mx+' คน ('+others.join(', ')+') — เกินโควตา');else if(n===mx)warn.push('• '+ds+' จะเต็มโควตา '+n+'/'+mx+' คน');});
 // duplicate same member same day
 wd.forEach(function(ds){var dup=loadL().some(function(x){return x.id!==editingLV&&x.emp===emp&&(x.status==='Pending'||x.status==='Approved')&&x.start<=ds&&(x.end||x.start)>=ds;});if(dup)warn.push('⚠ '+emp+' มีคำขอลาซ้ำในวันที่ '+ds);});
 if(days>bal.remaining)warn.push('⚠ วันลาคงเหลือไม่พอ (คงเหลือ '+bal.remaining+' · ขอ '+days+')');
 var html='<div class="lv-prev-grid"><div><span class="tiny muted">คงเหลือ ('+esc2(typeName(ty))+')</span><br><b>'+bal.remaining+'/'+bal.ent+' วัน</b></div><div><span class="tiny muted">หลังหัก Pending</span><br><b>'+bal.avail+' วัน</b></div><div><span class="tiny muted">รวมที่ขอ</span><br><b>'+days+' วัน</b></div></div>';
 if(warn.length)html+='<div class="lv-warn">'+warn.map(esc2).join('<br>')+'</div>';
 var _ov=loadL().filter(function(x){return x.status==='Pending'&&x.id!==editingLV&&x.emp!==emp&&!((x.end||x.start)<st||x.start>en);});if(_ov.length)html+='<div class="lv-warn" style="background:#f4f8ff;color:#1a4f8f;border-color:#cfe0f5"><b>คำขอที่ทับซ้อน (รออนุมัติ):</b><br>'+_ov.map(function(x){return '• '+esc2(x.emp)+' · '+esc2(x.start)+(x.end&&x.end!==x.start?('\u2192'+esc2(x.end)):'')+' · '+esc2(typeName(x.type));}).join('<br>')+'</div>';
 g('lvPreview').innerHTML=html;
}
function isSpecial(id){var t=loadSet().types.filter(function(x){return x.id===id;})[0];return !!(t&&t.special);}
function saveLeave(){
 var emp=g('lvf_emp').value,ty=g('lvf_type').value,st=g('lvf_start').value,en=g('lvf_end').value||st,dur=g('lvf_dur').value,reason=g('lvf_reason').value.trim();
 if(!emp){notify&&notify('เลือกสมาชิก');return;}if(!st){notify&&notify('เลือกวันเริ่มลา');return;}if(en<st)en=st;
 var all=loadL();var r=editingLV?all.filter(function(x){return x.id===editingLV;})[0]:null;var isNew=!r;
 if(isNew){r={id:newId(),requestedAt:new Date().toISOString(),approvedBy:'',approvedAt:'',rejectReason:''};all.push(r);}
 r.emp=emp;r.type=ty;r.start=st;r.end=en;r.duration=dur;r.reason=reason;r.total=totalDays(r);var _over=conflictOf(r),_sp=isSpecial(ty);if(_over&&!_sp){var _od=workDays(st,en).filter(function(ds){var seen={};activeOn(ds).forEach(function(x){if(x.id!==r.id)seen[x.emp]=1;});seen[emp]=1;return Object.keys(seen).length>maxOn(ds);});if(!window.confirm('\u26a0 เกินโควตาการลาของทีม\nวันที่เต็ม/เกิน: '+_od.join(', ')+'\nแนะนำให้เลื่อนวันลา\n\nยืนยันส่งคำขอต่อ? (จะติดธง Conflict ให้หัวหน้าพิจารณา)'))return;}r.managerAlert=!!(_over&&_sp);
 if(isNew||r.status==='Rejected'||r.status==='Cancelled')r.status='Pending';
 r.conflict=conflictOf(r);
 saveL(all);audit(isNew?'created':'edited',r,'');closeLeave();
 if(window.renderLeave)window.renderLeave();if(r.managerAlert){audit('manager-alert',r,'ลาพิเศษเกินโควตา');if(typeof notify==='function')notify('\ud83d\udd14 แจ้งหัวหน้า: ลาพิเศษ ('+typeName(ty)+') เกินโควตา — ส่งให้พิจารณาแล้ว');}else if(typeof notify==='function')notify(isNew?('ส่งคำขอลาแล้ว'+(r.conflict?' (มี Conflict — รอหัวหน้าพิจารณา)':'')):'บันทึกการแก้ไขแล้ว');
}
function approveLV(id){if(!canApprove()){notify&&notify('ไม่มีสิทธิ์อนุมัติ');return;}var all=loadL();var r=all.filter(function(x){return x.id===id;})[0];if(!r)return;
 var over=conflictOf(r);var bal=balance(r.emp,r.type);var low=(totalDays(r)>bal.remaining);
 var msg=[];if(over)msg.push('วันลานี้จะทำให้บางวันเกินโควตาทีม');if(low)msg.push('วันลาคงเหลือไม่พอ (เหลือ '+bal.remaining+')');
 if(msg.length&&!window.confirm('⚠ '+msg.join('\n')+'\n\nยืนยันการอนุมัติ?'))return;
 r.status='Approved';r.approvedBy=ME();r.approvedAt=new Date().toISOString();r.conflict=conflictOf(r);saveL(all);audit('approved',r,'');window.renderLeave();notify&&notify('อนุมัติแล้ว');}
function rejectLV(id){if(!canApprove()){notify&&notify('ไม่มีสิทธิ์');return;}var rs=window.prompt('เหตุผลที่ไม่อนุมัติ (ถ้ามี):','');if(rs===null)return;var all=loadL();var r=all.filter(function(x){return x.id===id;})[0];if(!r)return;r.status='Rejected';r.rejectReason=rs;r.approvedBy=ME();r.approvedAt=new Date().toISOString();saveL(all);audit('rejected',r,rs);window.renderLeave();notify&&notify('ไม่อนุมัติแล้ว');}
function cancelLV(id){var all=loadL();var r=all.filter(function(x){return x.id===id;})[0];if(!r)return;if(!(r.emp===ME()||canApprove())){notify&&notify('ยกเลิกได้เฉพาะของตนเอง');return;}if(!window.confirm('ยกเลิกคำขอลานี้? (ถ้าเคยอนุมัติ วันลาจะถูกคืนอัตโนมัติ)'))return;r.status='Cancelled';saveL(all);audit('cancelled',r,'');window.renderLeave();notify&&notify('ยกเลิกแล้ว');}
function dayDetail(ds){var items=activeOn(ds);var seen={};items.forEach(function(r){seen[r.emp]=r;});var names=Object.keys(seen);
 g('lvDetKick').textContent='TEAM AVAILABILITY';g('lvDetTitle').textContent=ds+' · '+thDow(ds);
 var mx=maxOn(ds),st=capState(ds);
 var rows=names.map(function(nm){var r=seen[nm];return '<tr><td>'+avatar(nm)+'</td><td>'+esc2(typeName(r.type))+'</td><td>'+durLab(r.duration)+'</td><td><span class="pill '+(STCLS[r.status]||'')+'">'+(STLAB[r.status])+'</span></td></tr>';}).join('')||'<tr><td class="empty" colspan="4">ไม่มีผู้ลา</td></tr>';
 g('lvDetBody').innerHTML='<div class="lv-warn" style="background:#f4f8ff;color:#1a4f8f">โควตา '+names.length+'/'+mx+' คน · สถานะ '+({avail:'ว่าง',nearly:'ใกล้เต็ม',full:'เต็ม',over:'เกินโควตา'}[st])+(isOff(ds)?' · (วันหยุด)':'')+'</div><table class="table"><thead><tr><th>สมาชิก</th><th>ประเภท</th><th>ลักษณะ</th><th>สถานะ</th></tr></thead><tbody>'+rows+'</tbody></table>';
 g('lvDetailModal').classList.add('open');
}
function reqDetail(id){var r=loadL().filter(function(x){return x.id===id;})[0];if(!r)return;var bal=balance(r.emp,r.type);
 g('lvDetKick').textContent='LEAVE #'+r.id.slice(0,6);g('lvDetTitle').textContent=r.emp+' · '+typeName(r.type);
 var avail=workDays(r.start,r.end||r.start).map(function(ds){return '<tr><td>'+ds+'</td><td>'+Object.keys(activeOn(ds).reduce(function(a,x){a[x.emp]=1;return a;},{})).join(', ')+'</td><td>'+capOn(ds)+'/'+maxOn(ds)+'</td><td>'+({avail:'ว่าง',nearly:'ใกล้เต็ม',full:'เต็ม',over:'เกิน'}[capState(ds)])+'</td></tr>';}).join('');
 g('lvDetBody').innerHTML='<div class="lv-prev-grid"><div><span class="tiny muted">ช่วงลา</span><br><b>'+esc2(r.start)+(r.end&&r.end!==r.start?(' → '+esc2(r.end)):'')+'</b></div><div><span class="tiny muted">รวม</span><br><b>'+totalDays(r)+' วัน ('+durLab(r.duration)+')</b></div><div><span class="tiny muted">สถานะ</span><br><span class="pill '+(STCLS[r.status]||'')+'">'+(STLAB[r.status])+'</span></div><div><span class="tiny muted">คงเหลือ</span><br><b>'+bal.remaining+'/'+bal.ent+'</b></div></div>'
  +(r.reason?'<div class="field"><label>เหตุผล</label><div>'+esc2(r.reason)+'</div></div>':'')
  +(r.approvedBy?'<div class="tiny muted">ดำเนินการโดย '+esc2(r.approvedBy)+(r.rejectReason?(' · เหตุผล: '+esc2(r.rejectReason)):'')+'</div>':'')
  +'<div style="margin-top:10px;font-weight:700">Team Availability</div><table class="table"><thead><tr><th>วันที่</th><th>ผู้ลา</th><th>โควตา</th><th>สถานะ</th></tr></thead><tbody>'+(avail||'<tr><td class="empty" colspan="4">—</td></tr>')+'</tbody></table>';
 g('lvDetailModal').classList.add('open');
}
function empHistory(emp){var rs=loadL().filter(function(r){return r.emp===emp;}).sort(function(a,b){return (b.start||'').localeCompare(a.start||'');});
 g('lvDetKick').textContent='LEAVE HISTORY';g('lvDetTitle').textContent=emp;
 var rows=rs.map(function(r){return '<tr><td style="white-space:nowrap">'+esc2(r.start)+(r.end&&r.end!==r.start?(' → '+esc2(r.end)):'')+'</td><td>'+esc2(typeName(r.type))+'</td><td>'+durLab(r.duration)+'</td><td style="text-align:center">'+totalDays(r)+'</td><td><span class="pill '+(STCLS[r.status]||'')+'">'+(STLAB[r.status]||r.status)+'</span></td><td>'+esc2(r.approvedBy||'')+'</td><td class="cp-remark">'+esc2(r.reason||'')+'</td></tr>';}).join('')||'<tr><td class="empty" colspan="7">ไม่มีประวัติ</td></tr>';
 g('lvDetBody').innerHTML='<div class="cp-table-wrap"><table class="table"><thead><tr><th>วันที่</th><th>ประเภท</th><th>ลักษณะ</th><th>วัน</th><th>สถานะ</th><th>อนุมัติโดย</th><th>เหตุผล</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 g('lvDetailModal').classList.add('open');
}
function closeDet(){g('lvDetailModal').classList.remove('open');}

// ================= SETTINGS =================
function openSet(){var s=loadSet();g('lvs_max').value=s.maxPerDay;g('lvs_weekend').value=s.weekendOff?'no':'yes';renderSetTypes();renderSetHol();g('lvSetModal').classList.add('open');}
function closeSet(){saveSetFromUI();g('lvSetModal').classList.remove('open');if(window.renderLeave)window.renderLeave();}
function saveSetFromUI(){var s=loadSet();s.maxPerDay=Math.max(1,parseInt(g('lvs_max').value,10)||1);s.weekendOff=(g('lvs_weekend').value==='no');saveSet(s);}
function renderSetTypes(){var s=loadSet();g('lvs_types').innerHTML=s.types.map(function(t,i){return '<div class="lv-setrow"><input class="cp-inp lv-tname" data-i="'+i+'" value="'+esc2(t.name)+'" style="flex:1"><input class="cp-inp lv-tent" data-i="'+i+'" type="number" value="'+(t.ent||0)+'" style="width:80px" title="สิทธิ์/ปี"><label class="cp-ck"><input type="checkbox" class="lv-tact" data-i="'+i+'" '+(t.active!==false?'checked':'')+'> ใช้งาน</label><label class="cp-ck"><input type="checkbox" class="lv-tsp" data-i="'+i+'" '+(t.special?'checked':'')+'> พิเศษ</label><button class="ghost cp-mini danger lv-tdel" data-i="'+i+'">✕</button></div>';}).join('');
 g('lvs_types').querySelectorAll('.lv-tname').forEach(function(e){e.onchange=function(){var s=loadSet();s.types[+e.dataset.i].name=e.value.trim()||s.types[+e.dataset.i].name;saveSet(s);renderSetTypes();};});
 g('lvs_types').querySelectorAll('.lv-tent').forEach(function(e){e.onchange=function(){var s=loadSet();s.types[+e.dataset.i].ent=parseInt(e.value,10)||0;saveSet(s);};});
 g('lvs_types').querySelectorAll('.lv-tact').forEach(function(e){e.onchange=function(){var s=loadSet();s.types[+e.dataset.i].active=e.checked;saveSet(s);};});g('lvs_types').querySelectorAll('.lv-tsp').forEach(function(e){e.onchange=function(){var s=loadSet();s.types[+e.dataset.i].special=e.checked;saveSet(s);};});
 g('lvs_types').querySelectorAll('.lv-tdel').forEach(function(e){e.onclick=function(){if(!confirm('ลบประเภทลานี้?'))return;var s=loadSet();s.types.splice(+e.dataset.i,1);saveSet(s);renderSetTypes();};});
}
function renderSetHol(){var s=loadSet();s.holidays.sort(function(a,b){return (a.date||'').localeCompare(b.date||'');});g('lvs_holidays').innerHTML=s.holidays.map(function(h,i){return '<div class="lv-setrow"><span style="flex:1"><b>'+esc2(h.date)+'</b> · '+esc2(h.name||'')+'</span><button class="ghost cp-mini danger lv-hdel" data-i="'+i+'">✕</button></div>';}).join('')||'<div class="tiny muted">ยังไม่มีวันหยุด</div>';
 g('lvs_holidays').querySelectorAll('.lv-hdel').forEach(function(e){e.onclick=function(){var s=loadSet();s.holidays.splice(+e.dataset.i,1);saveSet(s);renderSetHol();};});
}

// ================= EXPORT =================
function exportCSV(){var rows=loadL().slice().sort(function(a,b){return (a.start||'').localeCompare(b.start||'');});
 var head=['Employee','LeaveType','Start','End','Duration','TotalDays','Status','Conflict','Reason','RequestedAt','ApprovedBy'];
 var lines=[head.join(',')];rows.forEach(function(r){var row=[r.emp,typeName(r.type),r.start,r.end||r.start,durLab(r.duration),totalDays(r),STLAB[r.status]||r.status,r.conflict?'Conflict':'Normal',(r.reason||'').replace(/[\r\n,]/g,' '),r.requestedAt||'',r.approvedBy||''];lines.push(row.map(function(c){return '"'+String(c==null?'':c).replace(/"/g,'""')+'"';}).join(','));});
 var blob=new Blob(["﻿"+lines.join('\n')],{type:'text/csv;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='team-leave-'+fmt(new Date())+'.csv';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);notify&&notify('ส่งออก CSV แล้ว');}

// ================= WIRING =================
function init(){
 var on=function(id,ev,fn){var e=g(id);if(e)e.addEventListener(ev,fn);};
 on('lvAdd','click',function(){openLeave(null);});
 on('lvSettingsBtn','click',openSet);on('lvExport','click',exportCSV);
 on('lvClose','click',closeLeave);on('lvCancel','click',closeLeave);
 ['lvf_start','lvf_end','lvf_dur','lvf_emp','lvf_type'].forEach(function(id){on(id,'change',updPreview);});
 on('lvSave','click',saveLeave);
 var mb=g('lvModal');if(mb)mb.addEventListener('click',function(e){if(e.target.id==='lvModal')closeLeave();});
 on('lvSetClose','click',closeSet);on('lvSetDone','click',closeSet);
 var sm=g('lvSetModal');if(sm)sm.addEventListener('click',function(e){if(e.target.id==='lvSetModal')closeSet();});
 on('lvs_max','change',saveSetFromUI);on('lvs_weekend','change',saveSetFromUI);
 on('lvs_addtype','click',function(){var nm=g('lvs_newtype').value.trim();if(!nm)return;var s=loadSet();s.types.push({id:'t'+Date.now().toString(36),name:nm,ent:parseInt(g('lvs_newent').value,10)||0,active:true});saveSet(s);g('lvs_newtype').value='';g('lvs_newent').value='';renderSetTypes();});
 on('lvs_addhol','click',function(){var d=g('lvs_holdate').value;if(!d)return;var s=loadSet();if(!s.holidays.some(function(h){return h.date===d;}))s.holidays.push({date:d,name:g('lvs_holname').value.trim()||'วันหยุด'});saveSet(s);g('lvs_holname').value='';renderSetHol();});
 on('lvDetClose','click',closeDet);var dm=g('lvDetailModal');if(dm)dm.addEventListener('click',function(e){if(e.target.id==='lvDetailModal')closeDet();});
 // calendar nav + view
 on('lvCalPrev','click',function(){LVcal.setMonth(LVcal.getMonth()-1);window.renderLeave();});
 on('lvCalNext','click',function(){LVcal.setMonth(LVcal.getMonth()+1);window.renderLeave();});
 on('lvCalToday','click',function(){LVcal=new Date();LVcal.setDate(1);window.renderLeave();});
 document.querySelectorAll('.lv-view').forEach(function(b){b.onclick=function(){LVview=b.dataset.lvview;document.querySelectorAll('.lv-view').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});window.renderLeave();};});
 // summary card filters
 document.querySelectorAll('.lv-card').forEach(function(c){c.onclick=function(){var f=c.dataset.lvf;TLF.status='';TLF.range='all';if(f==='pending')TLF.status='Pending';else if(f==='today')TLF.range='today';else if(f==='month')TLF.range='month';var rs=g('lvFRange');if(rs)rs.value=TLF.range;var ss=g('lvFStatus');if(ss)ss.value=TLF.status;window.renderLeave();var el=g('lvListTable');if(el)el.scrollIntoView({behavior:'smooth',block:'center'});};});
 // team list filters
 on('lvSearch','input',function(e){TLF.search=e.target.value;renderTeamList();});
 on('lvFRange','change',function(e){TLF.range=e.target.value;var cu=(TLF.range==='custom');['lvFStart','lvFEnd','lvFDash'].forEach(function(id){var x=g(id);if(x)x.hidden=!cu;});renderTeamList();});
 on('lvFStart','change',function(e){TLF.start=e.target.value;renderTeamList();});
 on('lvFEnd','change',function(e){TLF.end=e.target.value;renderTeamList();});
 on('lvFEmp','change',function(e){TLF.emp=e.target.value;renderTeamList();});
 on('lvFType','change',function(e){TLF.type=e.target.value;renderTeamList();});
 on('lvFStatus','change',function(e){TLF.status=e.target.value;renderTeamList();});
 // delegated actions (tables)
 ['lvApprovalTable','lvListTable','lvReportTable','lvCalendar','lvCalList'].forEach(function(tid){var T=g(tid);if(T&&!T._lv){T._lv=1;T.addEventListener('click',function(e){var b=e.target.closest('[data-lvact],[data-lvday]');if(!b)return;if(b.dataset.lvday){dayDetail(b.dataset.lvday);return;}var act=b.dataset.lvact,id=b.dataset.id;if(act==='approve')approveLV(id);else if(act==='reject')rejectLV(id);else if(act==='detail')reqDetail(id);else if(act==='edit')openLeave(id);else if(act==='cancel')cancelLV(id);else if(act==='history')empHistory(b.dataset.emp);});}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
;
/* js/20-cm-report.js */
(function(){
// ===== Communication Manager · report skill =====
function E(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function pct(n,d){return d?Math.round(100*n/d):0;}
function iso0(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function num(x){var n=parseFloat(x);return isNaN(n)?0:n;}
var SL=(typeof statusLabel!=='undefined')?statusLabel:{};
function slab(s){return SL[s]||s;}
var WT=(typeof weights!=='undefined')?weights:{Copy:1,Infographic:2,Presentation:2,Video:4,Video:4,Event:5};

function gather(){
 var T=(typeof tasks!=='undefined'&&tasks)?tasks:[];
 var R=(typeof records!=='undefined'&&records)?records:[];
 var CP=(window.CPall?window.CPall():[])||[];
 var LV=(window.LVall?window.LVall():[])||[];
 var PPL=((window.DDget?window.DDget('people'):null)||(typeof people!=='undefined'?people:[])||[]);
 var today=iso0(),ym=today.slice(0,7),yr=today.slice(0,4);
 // ---- tasks overview ----
 var byStatus={};T.forEach(function(t){byStatus[t.status]=(byStatus[t.status]||0)+1;});
 var done=T.filter(function(t){return t.status==='Completed';}).length;
 var pub=T.filter(function(t){return t.status==='Ready to Publish'||t.status==='Completed';}).length;
 var active=T.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold';}).length;
 var overdue=T.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold'&&t.due&&t.due<today;});
 // ---- media mix ----
 var mt={'บันทึก':0,'Infographic':0,'VDO':0};
 T.forEach(function(t){if(t.types&&t.types.length){var seen={};t.types.forEach(function(x){if(x&&x.type&&mt[x.type]!=null&&!seen[x.type]){seen[x.type]=1;mt[x.type]++;}});}else{var k={Copy:'บันทึก',Infographic:'Infographic',Video:'VDO'}[t.kind];if(k)mt[k]++;}});
 // ---- channels (records) ----
 var chMap={};R.forEach(function(r){var c=r.channel||'(ไม่ระบุ)';var o=chMap[c]||(chMap[c]={n:0,aud:0,rd:0});o.n++;o.aud+=num(r.audience);o.rd+=num(r.readers);});
 var chans=Object.keys(chMap).map(function(c){var o=chMap[c];return {c:c,n:o.n,aud:o.aud,rd:o.rd,rate:pct(o.rd,o.aud)};});
 var chWith=chans.filter(function(x){return x.aud>0;});
 chWith.sort(function(a,b){return b.rate-a.rate;});
 var best=chWith[0],worst=chWith[chWith.length-1];
 var totAud=0,totRd=0;R.forEach(function(r){totAud+=num(r.audience);totRd+=num(r.readers);});
 var overallRate=pct(totRd,totAud);
 // ---- team workload ----
 var team=PPL.map(function(p){
  var openLead=T.filter(function(t){return t.lead===p&&t.status!=='Completed'&&t.status!=='On Hold';});
  var load=openLead.reduce(function(s,t){return s+(WT[t.kind]||1);},0);
  var owns=T.filter(function(t){return t.types&&t.types.some(function(x){return x&&x.owner===p;});}).length;
  var chk=T.filter(function(t){return t.checker===p;}).length;
  return {p:p,open:openLead.length,load:load,owns:owns,chk:chk};
 });
 var CAP=12;
 var over=team.filter(function(x){return x.load>CAP;});
 var idle=team.filter(function(x){return x.open===0;});
 team.sort(function(a,b){return b.load-a.load;});
 // ---- communication plan ----
 var cpByStatus={};CP.forEach(function(r){cpByStatus[r.status]=(cpByStatus[r.status]||0)+1;});
 var cpCh={line:0,tophit:0,banner:0,sms:0};CP.forEach(function(r){if(r.ch){['line','tophit','banner','sms'].forEach(function(k){if(r.ch[k])cpCh[k]++;});}});
 var cpLinked=CP.filter(function(r){return r.taskId&&(typeof tasks!=='undefined'&&tasks.find(function(t){return t.id===r.taskId;}));}).length;
 var cpNoTask=CP.length-cpLinked;
 // ---- leave ----
 var lvPending=LV.filter(function(r){return r.status==='Pending';}).length;
 var lvToday=LV.filter(function(r){return (r.status==='Pending'||r.status==='Approved')&&r.start<=today&&(r.end||r.start)>=today;});
 var lvTodayNames=Object.keys(lvToday.reduce(function(a,r){a[r.emp]=1;return a;},{}));
 var lvConflict=LV.filter(function(r){return (r.status==='Pending'||r.status==='Approved')&&r.conflict;}).length;
 return {today:today,ym:ym,yr:yr,T:T,R:R,CP:CP,LV:LV,PPL:PPL,byStatus:byStatus,done:done,pub:pub,active:active,overdue:overdue,mt:mt,chans:chans,best:best,worst:worst,overallRate:overallRate,totAud:totAud,totRd:totRd,team:team,over:over,idle:idle,CAP:CAP,cpByStatus:cpByStatus,cpCh:cpCh,cpLinked:cpLinked,cpNoTask:cpNoTask,lvPending:lvPending,lvTodayNames:lvTodayNames,lvConflict:lvConflict};
}

function insights(d){
 var out=[];
 if(d.chans.length){
  if(d.best)out.push({t:'ok',m:'ช่องทางอ่านดีที่สุด: <b>'+E(d.best.c)+'</b> ('+d.best.rate+'%)'});
  if(d.worst&&d.worst!==d.best)out.push({t:(d.worst.rate<40?'warn':'info'),m:'ช่องทางที่ควรปรับปรุง: <b>'+E(d.worst.c)+'</b> ('+d.worst.rate+'%)'+(d.worst.rate<40?' — อัตราอ่านต่ำกว่า 40%':'')});
  out.push({t:(d.overallRate>=60?'ok':d.overallRate>=40?'info':'warn'),m:'อัตราการอ่านรวมทุกช่องทาง <b>'+d.overallRate+'%</b> ('+d.totRd.toLocaleString()+'/'+d.totAud.toLocaleString()+')'});
 }
 if(d.overdue.length)out.push({t:'warn',m:'มีงานเกินกำหนด <b>'+d.overdue.length+'</b> รายการ — ควรเร่งติดตาม'});
 if(d.over.length)out.push({t:'warn',m:'สมาชิกภาระงานสูงเกิน '+d.CAP+': <b>'+d.over.map(function(x){return E(x.p)+' ('+x.load+')';}).join(', ')+'</b>'});
 if(d.idle.length)out.push({t:'info',m:'สมาชิกที่ยังไม่มีงานเปิดอยู่: <b>'+d.idle.map(function(x){return E(x.p);}).join(', ')+'</b> — พิจารณากระจายงาน'});
 var topType=Object.keys(d.mt).sort(function(a,b){return d.mt[b]-d.mt[a];})[0];
 if(topType&&d.mt[topType])out.push({t:'info',m:'ประเภทสื่อที่ผลิตมากสุด: <b>'+E(topType)+'</b> ('+d.mt[topType]+' งาน)'});
 if(d.cpNoTask)out.push({t:'info',m:'Communication Plan ที่ยังไม่สร้าง Task: <b>'+d.cpNoTask+'</b> รายการ'});
 if(d.lvPending)out.push({t:'warn',m:'คำขอลารออนุมัติ <b>'+d.lvPending+'</b> รายการ'+(d.lvConflict?(' · มี Conflict '+d.lvConflict):'')});
 if(d.lvTodayNames.length)out.push({t:'info',m:'วันนี้มีลา <b>'+d.lvTodayNames.length+'</b> คน: '+d.lvTodayNames.map(E).join(', ')});
 if(!out.length)out.push({t:'ok',m:'ภาพรวมอยู่ในเกณฑ์ปกติ'});
 return out;
}

function buildHTML(d){
 var ic={ok:'✅',warn:'⚠️',info:'ℹ️'};
 var H='';
 H+='<div class="cm-meta tiny muted">สร้างโดย Communication Manager · '+E(d.today)+' · ผู้จัดทำ: '+E((window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้')+'</div>';
 // Insights first (executive summary)
 H+='<div class="cm-sec"><h3>บทวิเคราะห์ &amp; ข้อเสนอแนะ</h3>'+insights(d).map(function(x){return '<div class="cm-ins cm-'+x.t+'">'+ic[x.t]+' '+x.m+'</div>';}).join('')+'</div>';
 // KPI chips
 H+='<div class="cm-sec"><h3>ภาพรวมงาน</h3><div class="cm-kpis">'
  +kpi(d.T.length,'งานทั้งหมด')+kpi(d.active,'กำลังดำเนินการ')+kpi(d.done,'เสร็จสิ้น')+kpi(d.pub,'พร้อม/เผยแพร่')+kpi(d.overdue.length,'เกินกำหนด')+'</div>';
 // status table
 H+='<table class="table cm-t"><thead><tr><th>สถานะงาน</th><th>จำนวน</th></tr></thead><tbody>'
  +Object.keys(d.byStatus).map(function(s){return '<tr><td>'+E(slab(s))+'</td><td style="text-align:center">'+d.byStatus[s]+'</td></tr>';}).join('')+'</tbody></table></div>';
 // media mix
 H+='<div class="cm-sec"><h3>ประเภทสื่อ (จากงาน)</h3><div class="cm-kpis">'+kpi(d.mt['บันทึก'],'บันทึก')+kpi(d.mt['Infographic'],'Infographic')+kpi(d.mt['VDO'],'VDO')+'</div></div>';
 // channels
 if(d.chans.length){H+='<div class="cm-sec"><h3>ผลการสื่อสารตามช่องทาง</h3><table class="table cm-t"><thead><tr><th>ช่องทาง</th><th>จำนวนสื่อ</th><th>ผู้อ่าน/กลุ่มเป้าหมาย</th><th>อัตราอ่าน</th></tr></thead><tbody>'
  +d.chans.map(function(c){return '<tr><td>'+E(c.c)+'</td><td style="text-align:center">'+c.n+'</td><td style="text-align:center">'+c.rd.toLocaleString()+' / '+c.aud.toLocaleString()+'</td><td style="text-align:center"><b>'+(c.aud?c.rate+'%':'—')+'</b></td></tr>';}).join('')
  +'<tr><td><b>รวม</b></td><td style="text-align:center"><b>'+d.R.length+'</b></td><td style="text-align:center"><b>'+d.totRd.toLocaleString()+' / '+d.totAud.toLocaleString()+'</b></td><td style="text-align:center"><b>'+d.overallRate+'%</b></td></tr></tbody></table></div>';}
 // team
 H+='<div class="cm-sec"><h3>ภาระงานทีม</h3><table class="table cm-t"><thead><tr><th>สมาชิก</th><th>งานเปิดอยู่</th><th>รับผิดชอบสื่อ</th><th>Checker</th><th>Workload/'+d.CAP+'</th></tr></thead><tbody>'
  +d.team.map(function(x){return '<tr><td>'+E(x.p)+'</td><td style="text-align:center">'+x.open+'</td><td style="text-align:center">'+x.owns+'</td><td style="text-align:center">'+x.chk+'</td><td style="text-align:center"><b style="color:'+(x.load>d.CAP?'#c0392b':'#2e7d4f')+'">'+x.load+'</b></td></tr>';}).join('')+'</tbody></table></div>';
 // communication plan
 H+='<div class="cm-sec"><h3>Communication Plan</h3><div class="cm-kpis">'+kpi(d.CP.length,'ทั้งหมด')+kpi(d.cpCh.line,'LINE')+kpi(d.cpCh.tophit,'TOP HIT')+kpi(d.cpCh.banner,'Banner')+kpi(d.cpCh.sms,'SMS')+kpi(d.cpLinked,'มี Task')+'</div>'
  +'<table class="table cm-t"><thead><tr><th>สถานะ</th><th>จำนวน</th></tr></thead><tbody>'+Object.keys(d.cpByStatus).map(function(s){return '<tr><td>'+E(slab(s))+'</td><td style="text-align:center">'+d.cpByStatus[s]+'</td></tr>';}).join('')+'</tbody></table></div>';
 // leave
 H+='<div class="cm-sec"><h3>วันลาทีม</h3><div class="cm-kpis">'+kpi(d.lvPending,'รออนุมัติ')+kpi(d.lvTodayNames.length,'ลาวันนี้')+kpi(d.lvConflict,'Conflict')+'</div></div>';
 return H;
}
function kpi(v,l){return '<div class="cm-kpi"><b>'+v+'</b><span>'+E(l)+'</span></div>';}

window.cmReport=function(){
 var d=gather();var host=document.getElementById('cmReportBody');if(!host)return;
 window.__cmData=d;host.innerHTML=buildHTML(d);host._plain=host.innerText;
 document.getElementById('cmReportModal').classList.add('open');
};
function dl(){var host=document.getElementById('cmReportBody');var doc='<!doctype html><html lang="th"><head><meta charset="utf-8"><title>Communication Manager Report</title><style>body{font-family:system-ui,"Noto Sans Thai",sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:#1f2a37}h2{margin:0 0 4px}h3{margin:20px 0 8px;border-bottom:2px solid #1766cc;padding-bottom:4px}table{border-collapse:collapse;width:100%;margin:6px 0}th,td{border:1px solid #e2e8f0;padding:6px 10px;font-size:13px;text-align:left}th{background:#f3f6fb}.cm-ins{padding:6px 10px;border-radius:8px;margin:4px 0;background:#f6f9ff}.cm-kpis{display:flex;gap:10px;flex-wrap:wrap}.cm-kpi{border:1px solid #e2ebf6;border-radius:10px;padding:8px 14px;min-width:90px}.cm-kpi b{display:block;font-size:20px}.cm-kpi span{font-size:11px;color:#64748b}</style></head><body><h2>สรุปรายงาน &amp; วิเคราะห์ภาพรวม</h2>'+host.innerHTML+'</body></html>';
 var blob=new Blob([doc],{type:'text/html;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='communication-report-'+iso0()+'.html';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);if(typeof notify==='function')notify('ดาวน์โหลดรายงานแล้ว');}
function _unesc(s){return String(s).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}function buildText(d){var L=[];L.push('\ud83d\udccb สรุปรายงานการสื่อสาร \u00b7 '+d.today);L.push('');L.push('\ud83d\udcca ภาพรวมงาน: ทั้งหมด '+d.T.length+' | กำลังดำเนินการ '+d.active+' | เสร็จสิ้น '+d.done+' | พร้อม/เผยแพร่ '+d.pub+' | เกินกำหนด '+d.overdue.length);L.push('\ud83c\udfac ประเภทสื่อ: บันทึก '+d.mt['บันทึก']+' \u00b7 Infographic '+d.mt['Infographic']+' \u00b7 VDO '+d.mt['VDO']);if(d.chans.length){var ch=d.chans.slice().sort(function(a,b){return b.rate-a.rate;}).map(function(c){return _unesc(c.c)+' '+(c.aud?c.rate+'%':'\u2014');}).join(' \u00b7 ');L.push('\ud83d\udce1 ช่องทาง (อ่านรวม '+d.overallRate+'%): '+ch);}L.push('\ud83d\udc65 Workload ทีม: '+d.team.slice(0,8).map(function(x){return _unesc(x.p)+' '+x.load;}).join(', ')+(d.over.length?(' | ล้น: '+d.over.map(function(x){return _unesc(x.p);}).join(', ')):'')+(d.idle.length?(' | ว่าง: '+d.idle.map(function(x){return _unesc(x.p);}).join(', ')):''));L.push('\ud83d\uddc2\ufe0f Communication Plan: '+d.CP.length+' รายการ | LINE '+d.cpCh.line+' \u00b7 TOP HIT '+d.cpCh.tophit+' \u00b7 Banner '+d.cpCh.banner+' \u00b7 SMS '+d.cpCh.sms+' | มี Task '+d.cpLinked);L.push('\ud83c\udf34 วันลาทีม: รออนุมัติ '+d.lvPending+' \u00b7 ลาวันนี้ '+d.lvTodayNames.length+(d.lvConflict?(' \u00b7 Conflict '+d.lvConflict):''));L.push('');L.push('\ud83d\udd0e ข้อเสนอแนะ:');insights(d).forEach(function(x){L.push('\u2022 '+_unesc(x.m));});L.push('');L.push('(สร้างโดย Communication Manager \u00b7 Work Tracker)');return L.join('\n');}function cpy(){var txt=buildText(window.__cmData||gather());if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){if(typeof notify==='function')notify('คัดลอกรายงานแล้ว');});}else{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);if(typeof notify==='function')notify('คัดลอกรายงานแล้ว');}}
function init(){
 var b=document.getElementById('cmReportBtn');if(b)b.onclick=window.cmReport;
 var c=document.getElementById('cmReportClose');if(c)c.onclick=function(){document.getElementById('cmReportModal').classList.remove('open');};
 var mb=document.getElementById('cmReportModal');if(mb)mb.addEventListener('click',function(e){if(e.target.id==='cmReportModal')mb.classList.remove('open');});
 var dlb=document.getElementById('cmReportDl');if(dlb)dlb.onclick=dl;
 var cb=document.getElementById('cmReportCopy');if(cb)cb.onclick=cpy;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
;
/* js/21a-wcap-engine.js */
/* Workload & Capacity & KPI engine — pure, framework-free, works in Node and browser.
   Single source of truth = Job Tracker tasks + leave + people. No mock data. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.WCAP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DEFAULTS = {
    media: {
      "บันทึก": { "สื่อสารทั่วไป": { base: 1, hrs: 1.0 }, "BlankForm": { base: 1, hrs: 0.5 }, "_default": { base: 1, hrs: 1.0 } },
      "Infographic": { "มีPattern(บันทึก)": { base: 2, hrs: 2.0 }, "New Design": { base: 3, hrs: 4.0 }, "กระบวนการละเอียด": { base: 4, hrs: 6.0 }, "_default": { base: 2, hrs: 2.0 } },
      "VDO": { "Short Clip": { base: 3, hrs: 4.0 }, "Long Clip": { base: 5, hrs: 8.0 }, "ข้อมูลซับซ้อน": { base: 6, hrs: 10.0 }, "Editing": { base: 4, hrs: 4.0 }, "_default": { base: 3, hrs: 4.0 } }
    },
    checkerBase: 1, checkerHrs: 0.5, approvalBase: 1, approvalHrs: 0.5, commBase: 1, commHrs: 0.5,
    difficulty: { Easy: 1.00, Medium: 1.25, Hard: 1.50 },
    importance: { Normal: 1.00, High: 1.15, Critical: 1.30 },
    urgency: { Normal: 1.00, Urgent: 1.15, Emergency: 1.30 },
    responsibility: { primary: 90, support: 10 },
    kpiWeights: { productivity: 30, timeliness: 30, quality: 25, ownership: 15 },
    capacity: { benchmark: 0.625, scheduledHours: 160, hoursPerLeaveDay: 8, meetingHours: 0, otherHours: 0, perMember: {} },
    statusThresholds: { balanced: 70, high: 90, overload: 100 },
    grades: [{ min: 90, label: "Excellent" }, { min: 80, label: "Good" }, { min: 70, label: "Meets Expectations" }, { min: 0, label: "Needs Improvement" }]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function settings(user) { // shallow-merge user overrides onto DEFAULTS (one level + known subkeys)
    var S = clone(DEFAULTS); if (!user) return S;
    ["checkerBase", "approvalBase", "checkerHrs", "approvalHrs", "commBase", "commHrs"].forEach(function (k) { if (user[k] != null) S[k] = user[k]; });
    if (user.media) { for (var m in user.media) { S.media[m] = S.media[m] || {}; for (var dk in user.media[m]) { S.media[m][dk] = Object.assign({}, S.media[m][dk] || {}, user.media[m][dk]); } } }
    ["difficulty", "importance", "urgency", "responsibility", "kpiWeights", "capacity", "statusThresholds"].forEach(function (k) {
      if (user[k]) { for (var kk in user[k]) S[k][kk] = user[k][kk]; }
    });
    if (user.grades) S.grades = user.grades;
    return S;
  }

  var MEDIA = ["บันทึก", "Infographic", "VDO"];
  function round1(n) { return Math.round(n * 10) / 10; }

  // task.priority (single field) -> difficulty/importance/urgency keys
  function taskMods(t) {
    return { dif: t.difficulty || "Easy", imp: t.priority === "High" ? "High" : (t.importance || "Normal"), urg: t.priority === "Urgent" ? "Urgent" : (t.urgency || "Normal") };
  }
  function mult(S, m) { return (S.difficulty[m.dif] || 1) * (S.importance[m.imp] || 1) * (S.urgency[m.urg] || 1); }
  function mediaCell(S, media, detail) { var mm = S.media[media]; if (!mm) return { base: 0, hrs: 0 }; return mm[detail] || mm["_default"] || { base: 0, hrs: 0 }; }
  function baseFor(S, media, detail) { return mediaCell(S, media, detail).base || 0; }
  function hrsFor(S, media, detail) { return mediaCell(S, media, detail).hrs || 0; }

  function taskUnits(t) { // media units {media,detail,owner}; handles legacy kind-only tasks
    var out = [], ty = t.types || [];
    if (ty.length) ty.forEach(function (x) { if (x && x.type) out.push({ media: x.type, detail: x.detail || "", owner: x.owner || t.lead || "" }); });
    else { var m = { Copy: "บันทึก", Infographic: "Infographic", Video: "VDO" }[t.kind]; if (m) out.push({ media: m, detail: "", owner: t.lead || "" }); }
    return out;
  }
  function supportList(t) { return (t.support || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean); }
  // ผู้รับผิดชอบในการสื่อสาร (commOwner) from the Task Board — array now, legacy comma-string tolerated.
  function commList(t) { var c = t.commOwner; if (!c) return []; if (c.map) return c.map(function (s) { return String(s).trim(); }).filter(Boolean); return String(c).split(",").map(function (s) { return s.trim(); }).filter(Boolean); }

  // Job Workload for one media unit = Base x Difficulty x Importance x Urgency
  function jobUnitWorkload(S, t, unit) { return baseFor(S, unit.media, unit.detail) * mult(S, taskMods(t)); }

  // Responsibility shares for a task's production work -> {primary, supportEach, nSupport} (sum=100%)
  function responsibility(S, t) {
    var sup = supportList(t), n = sup.length;
    if (!n) return { primary: 1, supportEach: 0, nSupport: 0, support: [] };
    return { primary: S.responsibility.primary / 100, supportEach: (S.responsibility.support / 100) / n, nSupport: n, support: sup };
  }

  // Per-member workload across a task set. Returns {member:{บันทึก,Infographic,VDO,checker,approval,total}}
  function memberWorkload(tasks, S) {
    S = S || DEFAULTS; var acc = {};
    function ensure(p) { return acc[p] || (acc[p] = { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0, comm: 0, total: 0 }); }
    tasks.forEach(function (t) {
      if (t.status === "Cancelled") return;
      var mu = mult(S, taskMods(t)), units = taskUnits(t), R = responsibility(S, t);
      units.forEach(function (u) {
        var jw = baseFor(S, u.media, u.detail) * mu;
        if (u.owner) { var a = ensure(u.owner); if (a[u.media] != null) a[u.media] += jw * R.primary; a.total += jw * R.primary; }
        R.support.forEach(function (sp) { var a = ensure(sp); if (a[u.media] != null) a[u.media] += jw * R.supportEach; a.total += jw * R.supportEach; });
      });
      if (t.checker) { var cv = S.checkerBase * mu; var a = ensure(t.checker); a.checker += cv; a.total += cv; } // flat per task — no media-count multiplier (consistent with Approver/comm)
      if (t.approver) { var av = S.approvalBase * mu; var b = ensure(t.approver); b.approval += av; b.total += av; }
      commList(t).forEach(function (cp) { var cw = S.commBase * mu; var a = ensure(cp); a.comm += cw; a.total += cw; }); // each comm owner credited in full
    });
    for (var p in acc) { MEDIA.forEach(function (m) { acc[p][m] = round1(acc[p][m]); }); acc[p].checker = round1(acc[p].checker); acc[p].approval = round1(acc[p].approval); acc[p].comm = round1(acc[p].comm); acc[p].total = round1(acc[p].total); }
    return acc;
  }

  // Approved leave days for a member within YYYY-MM (honours half-day + weekend/holiday off)
  function leaveDays(leaveReqs, member, ym, leaveSettings) {
    leaveReqs = leaveReqs || []; var ls = leaveSettings || { weekendOff: true, holidays: [] };
    function isOff(ds) { var g = new Date(ds + "T00:00:00").getDay(); var we = ls.weekendOff && (g === 0 || g === 6); var ho = (ls.holidays || []).some(function (h) { return h.date === ds; }); return we || ho; }
    var days = 0;
    leaveReqs.forEach(function (r) {
      if (r.emp !== member || r.status !== "Approved") return;
      var s = new Date((r.start || "") + "T00:00:00"), e = new Date((r.end || r.start || "") + "T00:00:00"), g = 0, wd = [];
      while (s <= e && g < 400) { var ds = s.getFullYear() + "-" + ("0" + (s.getMonth() + 1)).slice(-2) + "-" + ("0" + s.getDate()).slice(-2); if (!isOff(ds) && (!ym || ds.slice(0, 7) === ym)) wd.push(ds); s.setDate(s.getDate() + 1); g++; }
      if (!wd.length) return;
      days += ((r.duration === "am" || r.duration === "pm") && wd.length === 1) ? 0.5 : wd.length;
    });
    return days;
  }

  // nMonths scales the monthly scheduled/meeting/other budget when a scope spans several months.
  function capacity(member, S, lvDays, nMonths) {
    S = S || DEFAULTS; nMonths = nMonths || 1; var c = S.capacity, pm = c.perMember[member] || {};
    var sched = (pm.scheduledHours != null ? pm.scheduledHours : c.scheduledHours) * nMonths;
    var meeting = (pm.meetingHours != null ? pm.meetingHours : c.meetingHours) * nMonths;
    var other = (pm.otherHours != null ? pm.otherHours : c.otherHours) * nMonths;
    var leaveH = (lvDays || 0) * c.hoursPerLeaveDay;
    var avail = Math.max(0, sched - leaveH - meeting - other);
    return { scheduled: sched, leaveDays: lvDays || 0, leaveHours: leaveH, meeting: meeting, other: other, availHours: avail, points: round1(avail * c.benchmark), months: nMonths };
  }
  function utilization(plannedWorkload, capPoints) { return capPoints > 0 ? Math.round(100 * plannedWorkload / capPoints) : null; }
  function loadStatus(util, S) { if (util == null) return "N/A"; var th = (S || DEFAULTS).statusThresholds; if (util > th.overload) return "Overload"; if (util > th.high) return "High Load"; if (util >= th.balanced) return "Balanced"; return "Available"; }

  // Planned (standard) hours for a whole task = Σ unit Std-Hrs × mult (+ checker/approval hrs). Basis for Productivity.
  function plannedHours(S, t) {
    S = S || DEFAULTS; var mu = mult(S, taskMods(t)), h = 0, units = taskUnits(t);
    units.forEach(function (u) { h += hrsFor(S, u.media, u.detail) * mu; });
    if (t.checker) h += (S.checkerHrs || 0) * mu;
    if (t.approver) h += (S.approvalHrs || 0) * mu;
    h += (S.commHrs || 0) * mu * commList(t).length; // comm owners each add their standard hours
    return round1(h);
  }
  function ownedCompleted(tasks, member) {
    return tasks.filter(function (t) { return t.status === "Completed" && (t.lead === member || (t.types || []).some(function (u) { return u && u.owner === member; })); });
  }
  // Productivity = planned Std-Hrs / actual hours logged (capped at 100; faster-than-standard = 100). N/A if no actual hours.
  function productivity(tasks, member, S) {
    S = S || DEFAULTS; var comp = ownedCompleted(tasks, member), planned = 0, actual = 0, n = 0;
    comp.forEach(function (t) { if (t.actualHours != null && t.actualHours !== "" && +t.actualHours > 0) { planned += plannedHours(S, t); actual += +t.actualHours; n++; } });
    if (!n || actual <= 0) return null;
    return Math.min(100, Math.round(100 * planned / actual));
  }
  // Quality is no longer derived from task revisions — it is a direct manager score 0..100
  // per member/month, passed into kpi() (see the qual arg). Nothing to compute here.

  // KPI — honest: computes what data supports, marks the rest N/A, re-normalises weights (never auto-zero).
  // own  = manager Ownership rubric score 0..100 (or null/"" -> N/A).
  // qual = manager "ความถูกต้องแม่นยำ" score 0..100 per member/month (or null/"" -> N/A).
  function kpi(tasks, member, S, own, qual) {
    S = S || DEFAULTS;
    var mine = tasks.filter(function (t) { return t.lead === member || (t.types || []).some(function (u) { return u && u.owner === member; }); });
    var comp = mine.filter(function (t) { return t.status === "Completed"; });
    var timeliness = null;
    if (comp.length) { var w = 0, ok = 0; comp.forEach(function (t) { var ww = 1; w += ww; var dlv = t.completed || t.publish || ""; if (t.due && dlv && dlv <= t.due) ok += ww; }); timeliness = Math.round(100 * ok / w); }
    var prod = productivity(tasks, member, S);
    var qualSc = (qual != null && qual !== "") ? Math.max(0, Math.min(100, Math.round(+qual))) : null;
    var ownership = (own != null && own !== "") ? Math.max(0, Math.min(100, Math.round(+own))) : null;
    var parts = [["productivity", prod], ["timeliness", timeliness], ["quality", qualSc], ["ownership", ownership]];
    var wsum = 0, sc = 0, avail = [], na = [];
    parts.forEach(function (p) { if (p[1] != null) { var wt = S.kpiWeights[p[0]] || 0; wsum += wt; sc += p[1] * wt; avail.push(p[0]); } else na.push(p[0]); });
    var total = wsum ? Math.round(sc / wsum) : null;
    return { productivity: prod, timeliness: timeliness, quality: qualSc, ownership: ownership, total: total, available: avail, na: na, completed: comp.length };
  }
  function grade(total, S) { if (total == null) return "N/A"; var g = (S || DEFAULTS).grades; for (var i = 0; i < g.length; i++) if (total >= g[i].min) return g[i].label; return g[g.length - 1].label; }

  // Team roll-up for Overview. ym = "YYYY-MM" | ["YYYY-MM", …] | null. ownStore = {member: ownershipScore} (optional).
  function team(tasks, people, S, leaveReqs, ym, leaveSettings, ownStore, qualStore) {
    S = S || DEFAULTS; ownStore = ownStore || {}; qualStore = qualStore || {};
    var months = Array.isArray(ym) ? ym.slice() : (ym ? [ym] : []);
    var nMonths = months.length || 1;
    var wl = memberWorkload(tasks, S), rows = [];
    people.forEach(function (p) {
      var w = wl[p] || { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0, comm: 0, total: 0 };
      var lv = months.length ? months.reduce(function (s, m) { return s + leaveDays(leaveReqs, p, m, leaveSettings); }, 0) : leaveDays(leaveReqs, p, null, leaveSettings);
      var cap = capacity(p, S, lv, nMonths);
      var util = utilization(w.total, cap.points);
      var k = kpi(tasks, p, S, ownStore[p] != null ? ownStore[p] : null, qualStore[p] != null ? qualStore[p] : null);
      rows.push({ member: p, workload: w, capacity: cap, utilization: util, status: loadStatus(util, S), kpi: k, grade: grade(k.total, S) });
    });
    var totW = rows.reduce(function (s, r) { return s + r.workload.total; }, 0);
    var totC = rows.reduce(function (s, r) { return s + r.capacity.points; }, 0);
    var overloaded = rows.filter(function (r) { return r.status === "Overload"; }).length;
    var kpis = rows.map(function (r) { return r.kpi.total; }).filter(function (x) { return x != null; });
    var overdue = tasks.filter(function (t) { return t.status !== "Completed" && t.status !== "On Hold" && t.status !== "Cancelled" && t.due && t.due < (new Date().toISOString().slice(0, 10)); }).length;
    return {
      rows: rows, totalWorkload: round1(totW), totalCapacity: round1(totC),
      avgUtilization: totC > 0 ? Math.round(100 * totW / totC) : null,
      avgKpi: kpis.length ? Math.round(kpis.reduce(function (a, b) { return a + b; }, 0) / kpis.length) : null,
      overloaded: overloaded, overdue: overdue
    };
  }

  // Workload by media type (team) for the Overview donut
  function mediaBreakdown(tasks, S) {
    var wl = memberWorkload(tasks, S), agg = { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0, comm: 0 };
    for (var p in wl) { ["บันทึก", "Infographic", "VDO", "checker", "approval", "comm"].forEach(function (k) { agg[k] += wl[p][k]; }); }
    for (var k in agg) agg[k] = round1(agg[k]);
    return agg;
  }

  // Per-month team roll-up for trend charts. months = ["2026-05", …] (ascending).
  // ownStoreByYm = {ym:{member:score}} (optional). Each month's scope = tasks whose due/publish is in that month.
  function trend(tasks, people, S, leaveReqs, months, leaveSettings, ownStoreByYm, qualStoreByYm) {
    S = S || DEFAULTS; ownStoreByYm = ownStoreByYm || {}; qualStoreByYm = qualStoreByYm || {};
    return (months || []).map(function (ym) {
      var scoped = tasks.filter(function (t) { return t.status !== "Cancelled" && ((t.due && t.due.slice(0, 7) === ym) || (t.publish && t.publish.slice(0, 7) === ym)); });
      var T = team(scoped, people, S, leaveReqs, ym, leaveSettings, ownStoreByYm[ym] || {}, qualStoreByYm[ym] || {});
      return { ym: ym, workload: T.totalWorkload, capacity: T.totalCapacity, utilization: T.avgUtilization, kpi: T.avgKpi, overloaded: T.overloaded, overdue: T.overdue };
    });
  }

  return {
    DEFAULTS: DEFAULTS, settings: settings, MEDIA: MEDIA,
    taskMods: taskMods, mult: mult, baseFor: baseFor, hrsFor: hrsFor, taskUnits: taskUnits, supportList: supportList, commList: commList,
    jobUnitWorkload: jobUnitWorkload, responsibility: responsibility, plannedHours: plannedHours,
    memberWorkload: memberWorkload, leaveDays: leaveDays, capacity: capacity, utilization: utilization, loadStatus: loadStatus,
    productivity: productivity, kpi: kpi, grade: grade, team: team, mediaBreakdown: mediaBreakdown, trend: trend, round1: round1
  };
});

;
/* js/21b-wcap-page.js */
(function(){
// Workload & Capacity & KPI Workspace — UI (uses window.WCAP engine; SSOT = tasks/people/leave/DDget)
var WKEY='worktracker-wcap-v1', HKEY='worktracker-wcap-history-v1', AKEY='worktracker-wcap-audit-v1', PKEY='worktracker-wcap-perf-v1', OKEY='worktracker-wcap-own-v1', QKEY='worktracker-wcap-qual-v1';
function E(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function g(id){return document.getElementById(id);}
function jload(k,df){try{var s=JSON.parse(localStorage.getItem(k)||'null');return s==null?df:s;}catch(e){return df;}}
function jsave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function W(){return window.WCAP;}
function getS(){return W().settings(jload(WKEY,null));}
function saveUser(u){jsave(WKEY,u);}
function PEOPLE(){return ((window.DDget?window.DDget('people'):null)||(typeof people!=='undefined'?people:[])||[]);}
function TASKS(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
function LEAVE(){return jload('worktracker-leave-v1',[])||[];}
function LSET(){return jload('worktracker-leave-settings-v1',{weekendOff:true,holidays:[]});}
function PERF(){return jload(PKEY,{})||{};}
function OWNS(){return jload(OKEY,{})||{};}
function QUALS(){return jload(QKEY,{})||{};}
function ownMap(ym){var o=OWNS(),m={};for(var k in o){var i=k.lastIndexOf('|');if(i>0&&k.slice(i+1)===ym&&o[k]&&o[k].score!=null)m[k.slice(0,i)]=+o[k].score;}return m;}
function qualMap(ym){var o=QUALS(),m={};for(var k in o){var i=k.lastIndexOf('|');if(i>0&&k.slice(i+1)===ym&&o[k]&&o[k].score!=null)m[k.slice(0,i)]=+o[k].score;}return m;}
function decorate(list){var pf=PERF();return list.map(function(t){var p=pf[t.id];if(!p)return t;var c=Object.assign({},t);if(p.actualHours!=null)c.actualHours=p.actualHours;return c;});}
function ME(){return (window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้';}
function audit(action,detail){var a=jload(AKEY,[]);if(!Array.isArray(a))a=[];a.unshift({at:new Date().toISOString(),by:ME(),action:action,detail:detail||''});jsave(AKEY,a.slice(0,300));}

var ST={tab:'overview',months:[],member:'',media:'',status:'',mmode:'points',drill:null,capView:'month'};
var MEDIA=['บันทึก','Infographic','VDO'];
var STATUS_LABELS=(typeof statusLabel!=='undefined')?statusLabel:{};

function monthsList(){var set={};TASKS().forEach(function(t){[t.due,t.publish].forEach(function(d){if(d&&/^\d{4}-\d{2}/.test(d))set[d.slice(0,7)]=1;});});var cur=new Date().toISOString().slice(0,7);set[cur]=1;return Object.keys(set).sort().reverse();}
function selMonths(){return (ST.months||[]).filter(Boolean).slice().sort();}
function curYM(){var s=selMonths();return s.length?s[s.length-1]:new Date().toISOString().slice(0,7);}
function inMonth(t){var s=selMonths();if(!s.length)return true;return s.some(function(m){return (t.due&&t.due.slice(0,7)===m)||(t.publish&&t.publish.slice(0,7)===m);});}
function hasMedia(t){if(!ST.media)return true;var u=W().taskUnits(t);return u.some(function(x){return x.media===ST.media;});}
function scope(){return decorate(TASKS().filter(function(t){if(t.status==='Cancelled')return false;if(!inMonth(t))return false;if(ST.status&&t.status!==ST.status)return false;if(!hasMedia(t))return false;return true;}));}
function allScoped(){return decorate(TASKS().filter(function(t){if(t.status==='Cancelled')return false;if(ST.status&&t.status!==ST.status)return false;if(!hasMedia(t))return false;return true;}));}
function recentMonths(n){var d=new Date(curYM()+'-01T00:00:00'),out=[];for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2));}return out;}
function teamData(){var s=selMonths();return W().team(scope(),PEOPLE(),getS(),LEAVE(),(s.length?s:curYM()),LSET(),ownMap(curYM()),qualMap(curYM()));}
function rowsShown(T){return T.rows.filter(function(r){return !ST.member||r.member===ST.member;});}

// media unit COUNT per member (for matrix count mode)
function countMatrix(tasks){var acc={};function ens(p){return acc[p]||(acc[p]={'บันทึก':0,'Infographic':0,'VDO':0,checker:0,approval:0,comm:0,total:0});}
 tasks.forEach(function(t){var units=W().taskUnits(t);units.forEach(function(u){if(u.owner){var a=ens(u.owner);if(a[u.media]!=null)a[u.media]++;a.total++;}});if(t.checker){var a=ens(t.checker);a.checker++;a.total++;}if(t.approver){var b=ens(t.approver);b.approval++;b.total++;}W().commList(t).forEach(function(cp){var c=ens(cp);c.comm++;c.total++;});});return acc;}

function kpi(v,l,sub){return '<div class="wc-kpi"><div class="wl">'+E(l)+'</div><div class="wv">'+v+'</div>'+(sub?'<div class="ws">'+E(sub)+'</div>':'')+'</div>';}
function NA(x){return x==null?'<span class="wc-na">N/A</span>':x;}
function statusPill(s){var m={Available:'wc-ok',Balanced:'wc-bl',"High Load":'wc-hi',Overload:'wc-ov','N/A':'wc-na2'}[s]||'wc-na2';return '<span class="pill '+m+'">'+E(s)+'</span>';}
function bar(u){if(u==null)return '<span class="wc-na">N/A</span>';var c=u>100?'#c0392b':u>90?'#e08a2b':u>=70?'#1766cc':'#2e7d4f';return '<div class="wc-prog"><div style="width:'+Math.min(100,u)+'%;background:'+c+'"></div></div> <span class="wc-pu">'+u+'%</span>';}

// monthly trend mini-chart (workload bars + util%/KPI lines), inline SVG
function trendChart(tr){var VW=560,H=150,padL=34,padR=12,padT=16,padB=26,n=tr.length;if(!n)return '<div class="wc-sub">ยังไม่มีข้อมูล</div>';
 var maxW=Math.max(1,Math.max.apply(null,tr.map(function(x){return x.workload||0;})));
 var span=(VW-padL-padR), gap=span/n, bw=gap*0.5;
 var cx=function(i){return padL+gap*i+gap/2;};
 var yW=function(v){return (H-padB)-(H-padT-padB)*(v||0)/maxW;};
 var yP=function(p){return (H-padB)-(H-padT-padB)*Math.min(100,(p||0))/100;};
 var bars=tr.map(function(x,i){var by=yW(x.workload),hh=(H-padB)-by;return '<rect x="'+(cx(i)-bw/2).toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,hh).toFixed(1)+'" rx="3" fill="#cfe0f7"></rect><text x="'+cx(i).toFixed(1)+'" y="'+(by-4).toFixed(1)+'" text-anchor="middle" font-size="9.5" fill="#64748b">'+(x.workload||0)+'</text><text x="'+cx(i).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-size="10" fill="#64748b">'+x.ym.slice(2)+'</text>';}).join('');
 function line(key,color,acc){var pts=[],dots='';tr.forEach(function(x,i){var v=x[key];if(v==null)return;var X=cx(i),Y=acc(v);pts.push(X.toFixed(1)+','+Y.toFixed(1));dots+='<circle cx="'+X.toFixed(1)+'" cy="'+Y.toFixed(1)+'" r="3" fill="'+color+'"></circle>';});return (pts.length>1?'<polyline fill="none" stroke="'+color+'" stroke-width="2" points="'+pts.join(' ')+'"></polyline>':'')+dots;}
 return '<svg viewBox="0 0 '+VW+' '+H+'" width="100%" height="'+H+'" role="img" aria-label="trend">'
  +'<line x1="'+padL+'" y1="'+(H-padB)+'" x2="'+(VW-padR)+'" y2="'+(H-padB)+'" stroke="#e2e8f0"></line>'
  +bars+line('utilization','#e08a2b',yP)+line('kpi','#2e7d4f',yP)+'</svg>'
  +'<div class="wc-legend"><span style="color:#8fb4e8">▇ Workload (pts)</span> · <span style="color:#e08a2b">● Utilization %</span> · <span style="color:#2e7d4f">● KPI</span></div>';
}
// media-type palette + category list (shared by donut/legend/compare)
var MBPAL={'บันทึก':'#1766cc','Infographic':'#4b90e2','VDO':'#8e5bd0','checker':'#e08a2b','approval':'#2e7d4f','comm':'#d9488a'};
var MBCATS=[['บันทึก','บันทึก'],['Infographic','Infographic'],['VDO','VDO'],['ตรวจ/อนุมัติสื่อ','checker'],['อื่นๆ (เผยแพร่)','approval'],['การสื่อสาร','comm']];
function mbTotal(m){return MBCATS.reduce(function(s,c){return s+(m[c[1]]||0);},0);}
function prevYM(ym){var d=new Date(ym+'-01T00:00:00'),x=new Date(d.getFullYear(),d.getMonth()-1,1);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2);}
function mbForYM(ym){var list=allScoped().filter(function(t){return (t.due&&t.due.slice(0,7)===ym)||(t.publish&&t.publish.slice(0,7)===ym);});return W().mediaBreakdown(list,getS());}
// SVG donut: parts=[{val,color}]
function donut(parts,tot){var r=52,cx=70,cy=70,C=2*Math.PI*r,off=0;
 var segs=parts.filter(function(p){return p.val>0;}).map(function(p){var dash=C*(p.val/(tot||1));var s='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+p.color+'" stroke-width="17" stroke-dasharray="'+dash.toFixed(2)+' '+(C-dash).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>';off+=dash;return s;}).join('');
 if(!segs)segs='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#eef2f7" stroke-width="17"></circle>';
 return '<svg viewBox="0 0 140 140" width="172" height="172" role="img" aria-label="media donut">'+segs+'<text x="70" y="66" text-anchor="middle" font-size="19" font-weight="700" fill="#13233a">'+W().round1(tot)+'</text><text x="70" y="84" text-anchor="middle" font-size="10" fill="#64748b">pts รวม</text></svg>';}
function dChip(d){if(d==null)return '';var r=W().round1(d);if(Math.abs(r)<0.05)return '<span style="color:#94a3b8;font-size:11px">– 0</span>';var up=r>0;return '<span style="font-size:11px;font-weight:600;color:'+(up?'#c0392b':'#2e7d4f')+'">'+(up?'▲ +':'▼ ')+r+'</span>';}
function mediaChart(mb){
 // MoM delta shown only when exactly ONE month is selected in the top filter (clear previous-month basis)
 var sel=(ST.months||[]).filter(Boolean),one=sel.length===1?sel[0]:null;
 var tot=mbTotal(mb),showD=one!=null,pm=showD?mbForYM(prevYM(one)):null;
 var legend=MBCATS.map(function(c){var k=c[1],v=mb[k]||0,pc=tot?Math.round(100*v/tot):0,col=MBPAL[k];var d=showD?(v-(pm[k]||0)):null;
  return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #f1f5f9"><span style="width:11px;height:11px;border-radius:3px;background:'+col+';flex:none"></span><span style="flex:1;font-size:13px;color:#334155">'+E(c[0])+'</span><span style="font-weight:600;min-width:42px;text-align:right">'+v+'</span><span style="color:#64748b;min-width:38px;text-align:right">'+pc+'%</span><span style="min-width:56px;text-align:right">'+(showD?dChip(d):'')+'</span></div>';}).join('');
 var parts=MBCATS.map(function(c){return {val:mb[c[1]]||0,color:MBPAL[c[1]]};});
 return '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:none">'+donut(parts,tot)+'</div><div style="flex:1;min-width:220px">'+legend+'</div></div>'
  +(showD?'<div class="wc-legend">▲▼ เทียบเดือนก่อน ('+prevYM(one)+') · หน่วย pts</div>':'<div class="wc-legend">เลือกเดือนเดียวที่ตัวกรองด้านบนเพื่อดูการเปลี่ยนแปลงเทียบเดือนก่อน (MoM)</div>');
}
// ---------- TAB: OVERVIEW ----------
function renderOverview(){var T=teamData(),mb=W().mediaBreakdown(scope(),getS());
 var mbTot=mb['บันทึก']+mb['Infographic']+mb['VDO']+mb.checker+mb.approval+mb.comm;function pc(n){return mbTot?Math.round(100*n/mbTot):0;}
 var h='<div class="wc-kpis">'+kpi(T.totalWorkload+' pts','Total Team Workload')+kpi(T.totalCapacity+' pts','Team Capacity',PEOPLE().length+' คน')+kpi((T.avgUtilization==null?'N/A':T.avgUtilization+'%'),'Team Utilization')+kpi((T.avgKpi==null?'N/A':T.avgKpi+' / 100'),'Team KPI (avg)')+kpi(T.overloaded,'Overloaded Members')+kpi(T.overdue,'Overdue Work')+'</div>';
 h+='<div class="wc-2col"><div class="panel"><h3>Workload by Media Type</h3>'+mediaChart(mb)+'</div>';
 h+='<div class="panel"><h3>Workload & KPI by Member</h3><table class="table wc-t"><thead><tr><th>Member</th><th>Workload</th><th>Util</th><th>KPI</th><th>Grade</th></tr></thead><tbody>'
  +rowsShown(T).map(function(r){return '<tr><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+r.workload.total+'</td><td style="text-align:center">'+(r.utilization==null?'—':r.utilization+'%')+'</td><td style="text-align:center">'+NA(r.kpi.total)+'</td><td>'+(r.kpi.total==null?'<span class="wc-na">N/A</span>':'<span class="pill wc-bl">'+E(r.grade)+'</span>')+'</td></tr>';}).join('')
  +'</tbody></table></div></div>';
 var months=recentMonths(6),ownBy={},qualBy={};months.forEach(function(ym){ownBy[ym]=ownMap(ym);qualBy[ym]=qualMap(ym);});
 var tr=W().trend(allScoped(),PEOPLE(),getS(),LEAVE(),months,LSET(),ownBy,qualBy);
 h+='<div class="panel"><h3>แนวโน้มรายเดือน (6 เดือน) <span class="wc-sub">Workload · Utilization · KPI</span></h3>'+trendChart(tr)+'</div>';
 return h;
}
// ---------- TAB: MATRIX ----------
function renderMatrix(){var T=teamData();var pts=(ST.mmode!=='count');var data=pts?null:countMatrix(scope());
 var max=0;rowsShown(T).forEach(function(r){var w=pts?r.workload:(data[r.member]||{});['บันทึก','Infographic','VDO','checker','approval','comm'].forEach(function(k){var v=(w[k]||0);if(v>max)max=v;});});
 function hm(v){if(!v)return '';var a=max?(0.12+0.55*v/max):0;return ' style="background:rgba(23,102,204,'+a.toFixed(2)+');color:'+(a>0.42?'#fff':'#13233a')+';font-weight:600;text-align:center"';}
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">Workload Matrix <span class="wc-sub">member × media</span></h3><div class="row" style="gap:6px"><button class="ghost wc-mmode'+(pts?' primary':'')+'" data-mmode="points">Workload Points</button><button class="ghost wc-mmode'+(pts?'':' primary')+'" data-mmode="count">จำนวนงาน</button></div></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>บันทึก</th><th>Infographic</th><th>VDO</th><th>ตรวจ/อนุมัติ</th><th>อื่นๆ</th><th>การสื่อสาร</th><th>รวม</th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var w=pts?r.workload:(data[r.member]||{'บันทึก':0,'Infographic':0,'VDO':0,checker:0,approval:0,comm:0,total:0});return '<tr><td><b>'+E(r.member)+'</b></td><td'+hm(w['บันทึก'])+'>'+(w['บันทึก']||'')+'</td><td'+hm(w['Infographic'])+'>'+(w['Infographic']||'')+'</td><td'+hm(w['VDO'])+'>'+(w['VDO']||'')+'</td><td'+hm(w.checker)+'>'+(w.checker||'')+'</td><td'+hm(w.approval)+'>'+(w.approval||'')+'</td><td'+hm(w.comm)+'>'+(w.comm||'')+'</td><td style="text-align:center"><b>'+(pts?r.workload.total:w.total)+'</b></td></tr>';}).join('');
 h+='</tbody></table><div class="wc-legend">เข้ม = ภาระงานมาก · โหมด: '+(pts?'Workload Points (ถ่วงน้ำหนัก)':'จำนวนงาน')+'</div></div>';
 return h;
}
// ---------- TAB: CAPACITY ----------
function capMembers(){return ST.member?[ST.member]:PEOPLE();}
function capBaseDay(){var S=getS();return W().round1(S.capacity.hoursPerLeaveDay*S.capacity.benchmark);} // pts per full working day (8h × benchmark)
function _pd(ds){return new Date(ds+'T00:00:00');}
function _fmtDM(ds){var d=_pd(ds);return d.getDate()+'/'+(d.getMonth()+1);}
function _isoD(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function weekStart(ds){var d=_pd(ds),g=d.getDay();d.setDate(d.getDate()+(g===0?-6:1-g));return _isoD(d);} // Monday of that week
function weekdaysOf(wkISO){var out=[],d=_pd(wkISO);for(var i=0;i<5;i++){out.push(_isoD(d));d.setDate(d.getDate()+1);}return out;}
function leaveFracDay(member,ds){var frac=0;LEAVE().forEach(function(r){if(r.emp!==member||r.status!=='Approved')return;var s=r.start||'',e=r.end||r.start||'';if(ds>=s&&ds<=e){if((r.duration==='am'||r.duration==='pm')&&s===e)frac=Math.max(frac,0.5);else frac=1;}});return frac;}
// day/week heatmap of workload by delivery date — surfaces clustering months hide
function renderCapGrid(gran){var S=getS(),tasks=scope(),baseDay=capBaseDay();
 function pkey(t){var d=(t.due||t.publish||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return null;return gran==='day'?d:weekStart(d);}
 var groups={};tasks.forEach(function(t){var k=pkey(t);if(k)(groups[k]=groups[k]||[]).push(t);});
 var periods=Object.keys(groups).sort();
 if(!periods.length)return '<div class="panel"><div class="wc-sub">ไม่มีงานที่มีวันกำหนดส่ง/วันออกงานในช่วงที่เลือก — ลองเลือกเดือนที่ตัวกรองด้านบน หรือระบุวันในการ์ดงาน</div></div>';
 var grid={};periods.forEach(function(p){var wl=W().memberWorkload(groups[p],S);for(var m in wl){grid[m]=grid[m]||{};grid[m][p]=wl[m].total;}});
 var members=capMembers(),max=0;
 members.forEach(function(m){periods.forEach(function(p){var v=(grid[m]&&grid[m][p])||0;if(v>max)max=v;});});
 function capOf(m,p){if(gran==='day')return W().round1(baseDay*(1-leaveFracDay(m,p)));var c=0;weekdaysOf(p).forEach(function(d){c+=baseDay*(1-leaveFracDay(m,d));});return W().round1(c);}
 function cell(m,p){var v=W().round1((grid[m]&&grid[m][p])||0),cap=capOf(m,p),over=v>cap;
  var a=max?(0.12+0.55*v/max):0,bg=!v?'':(over?'rgba(192,57,43,'+Math.min(0.9,0.4+0.5*v/(max||1)).toFixed(2)+')':'rgba(23,102,204,'+a.toFixed(2)+')'),col=!v?'#cbd5e1':((over||a>0.42)?'#fff':'#13233a');
  return '<td title="'+E(m)+' · '+(gran==='day'?E(p):'สัปดาห์ '+_fmtDM(p))+' · '+v+'/'+cap+' pts'+(over?' · เกินกำลัง':'')+'" style="text-align:center;font-weight:600'+(v?';background:'+bg+';color:'+col:';color:#cbd5e1')+(over?';outline:2px solid #c0392b;outline-offset:-2px':'')+'">'+(v||'·')+(over?' ⚠':'')+'</td>';}
 var head='<tr><th style="position:sticky;left:0;background:#fff">Member</th>'+periods.map(function(p){return '<th style="text-align:center;white-space:nowrap">'+(gran==='week'?_fmtDM(p)+'–'+_fmtDM(weekdaysOf(p)[4]):_fmtDM(p))+'</th>';}).join('')+'</tr>';
 var body=members.map(function(m){return '<tr><td style="position:sticky;left:0;background:#fff"><b>'+E(m)+'</b></td>'+periods.map(function(p){return cell(m,p);}).join('')+'</tr>';}).join('');
 var teamRow='<tr><td style="position:sticky;left:0;background:#f8fafc"><b>รวมทีม</b></td>'+periods.map(function(p){var tt=0;members.forEach(function(m){tt+=(grid[m]&&grid[m][p])||0;});var cap=gran==='day'?baseDay*members.length:baseDay*5*members.length;var over=tt>cap;return '<td style="text-align:center;font-weight:700'+(over?';color:#c0392b':'')+'">'+W().round1(tt)+(over?' ⚠':'')+'</td>';}).join('')+'</tr>';
 var lim=gran==='day'?baseDay:W().round1(baseDay*5);
 return '<div class="panel"><div style="overflow:auto"><table class="table wc-t"><thead>'+head+'</thead><tbody>'+body+teamRow+'</tbody></table></div>'
  +'<div class="wc-legend">แดง + ⚠ = ภาระงาน'+(gran==='day'?'วันนั้น':'สัปดาห์นั้น')+'เกินกำลัง (~'+lim+' pts/'+(gran==='day'?'วัน':'สัปดาห์')+'/คน, หักวันลาแล้ว) · เข้ม = งานหนาแน่น · นับตามวันกำหนดส่ง (ไม่มี→วันออกงาน) · "·" = ไม่มีงานส่งวันนั้น</div></div>';
}
function renderCapacity(){var S=getS(),cv=ST.capView||'month';
 var toggle='<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="ghost wc-capview'+(cv==='month'?' primary':'')+'" data-cv="month">รายเดือน (สรุป)</button><button class="ghost wc-capview'+(cv==='week'?' primary':'')+'" data-cv="week">รายสัปดาห์</button><button class="ghost wc-capview'+(cv==='day'?' primary':'')+'" data-cv="day">รายวัน</button></div>';
 if(cv==='day'||cv==='week')return toggle+renderCapGrid(cv);
 var T=teamData();
 var h=toggle+'<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">Capacity Planner</h3><span class="wc-sub">Available = Scheduled − Leave − Meeting − Other · Capacity = Hrs × '+S.capacity.benchmark+'</span></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>Available Hrs</th><th>Capacity (pts)</th><th>Planned</th><th>Remaining</th><th>Utilization</th><th>Status</th><th></th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var rem=W().round1(r.capacity.points-r.workload.total);return '<tr><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+r.capacity.availHours+(r.capacity.leaveDays?' <span class="wc-na">(ลา '+r.capacity.leaveDays+'d)</span>':'')+'</td><td style="text-align:center">'+r.capacity.points+'</td><td style="text-align:center">'+r.workload.total+'</td><td style="text-align:center">'+rem+'</td><td>'+bar(r.utilization)+'</td><td>'+statusPill(r.status)+'</td><td><button class="ghost cp-mini wc-capedit" data-m="'+E(r.member)+'">✎ Capacity</button></td></tr>';}).join('');
 h+='</tbody></table></div>';
 if(ST.drill&&ST._capedit){var m=ST.drill,pm=(S.capacity.perMember[m]||{});
  h+='<div class="panel"><h3>ตั้งค่า Capacity · '+E(m)+'</h3><div class="wc-form">'
   +'<label>Scheduled Hours/เดือน<input type="number" id="wc_sched" value="'+(pm.scheduledHours!=null?pm.scheduledHours:S.capacity.scheduledHours)+'"></label>'
   +'<label>Meeting Hours<input type="number" id="wc_meet" value="'+(pm.meetingHours!=null?pm.meetingHours:S.capacity.meetingHours)+'"></label>'
   +'<label>Other Committed<input type="number" id="wc_other" value="'+(pm.otherHours!=null?pm.otherHours:S.capacity.otherHours)+'"></label></div>'
   +'<div class="row" style="gap:8px;margin-top:8px"><button class="primary" id="wc_capsave">บันทึก</button><button class="ghost" id="wc_capclose">ปิด</button></div></div>';
 }
 return h;
}
// ---------- TAB: KPI ----------
function renderKPI(){var T=teamData(),S=getS();
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">KPI Performance</h3><span class="wc-sub">Prod '+S.kpiWeights.productivity+' · Time '+S.kpiWeights.timeliness+' · Qual '+S.kpiWeights.quality+' · Other '+S.kpiWeights.ownership+' · N/A re-normalised (ไม่ให้ 0 อัตโนมัติ)</span></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>Productivity</th><th>Timeliness</th><th>Quality</th><th>Overview (Other)</th><th>Total /100</th><th>Grade</th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var k=r.kpi;return '<tr class="wc-kpirow" data-m="'+E(r.member)+'"><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+NA(k.productivity)+'</td><td style="text-align:center">'+NA(k.timeliness)+'</td><td style="text-align:center">'+NA(k.quality)+'</td><td style="text-align:center">'+NA(k.ownership)+'</td><td style="text-align:center"><b>'+NA(k.total)+'</b></td><td>'+(k.total==null?'<span class="wc-na">N/A</span>':'<span class="pill wc-bl">'+E(r.grade)+'</span>')+'</td></tr>';}).join('');
 h+='</tbody></table><div class="wc-legend">คลิกชื่อสมาชิกเพื่อบันทึก Performance Log (ชั่วโมงจริง · คะแนนความถูกต้องแม่นยำ · Overview (Other)) ที่ปลดล็อก Productivity · Quality · Overview (Other)</div></div>';
 if(ST.drill){var m=ST.drill;var pf=PERF();var comp=scope().filter(function(t){return t.status==='Completed'&&(t.lead===m||(t.types||[]).some(function(u){return u&&u.owner===m;}));});
  var om=OWNS()[m+'|'+curYM()]||{};var qm=QUALS()[m+'|'+curYM()]||{};
  h+='<div class="panel"><h3>Performance Log · '+E(m)+' · '+curYM()+' <span class="wc-sub">('+comp.length+' งานที่เสร็จ)</span></h3>';
  h+='<div class="wc-sub" style="margin-bottom:8px">กรอก “ชั่วโมงจริง” ของแต่ละงาน → ปลดล็อก Productivity · เว้นว่าง = N/A (ไม่คิดเป็น 0)</div>';
  h+='<table class="table wc-t"><thead><tr><th>งาน</th><th>กำหนด</th><th>ส่งจริง</th><th>ตรงเวลา</th><th>Std Hrs</th><th>Actual Hrs</th></tr></thead><tbody>'
   +(comp.length?comp.map(function(t){var dlv=t.completed||t.publish||'';var ok=t.due&&dlv&&dlv<=t.due;var p=pf[t.id]||{};return '<tr><td>'+E(t.title)+'</td><td>'+E(t.due||'—')+'</td><td>'+E(dlv||'—')+'</td><td>'+(ok?'<span class="pill wc-ok">ตรง</span>':'<span class="pill wc-ov">ช้า</span>')+'</td><td style="text-align:center;color:#64748b">'+W().plannedHours(getS(),t)+'</td><td style="text-align:center"><input type="number" step="0.5" min="0" class="wc-perf" data-id="'+E(t.id)+'" data-f="actualHours" value="'+(p.actualHours!=null?p.actualHours:'')+'" style="width:72px"></td></tr>';}).join(''):'<tr><td class="empty" colspan="6">ยังไม่มีงานที่เสร็จ (Productivity/Timeliness = N/A)</td></tr>')
   +'</tbody></table>';
  h+='<h4 class="wc-h4" style="margin-top:14px">Quality · ความถูกต้องแม่นยำ (ผู้จัดการประเมิน) · ถ่วงน้ำหนัก '+getS().kpiWeights.quality+'%</h4>';
  h+='<div class="wc-form"><label>Score (0–100)<input type="number" min="0" max="100" id="wc_qual" value="'+(qm.score!=null?qm.score:'')+'"></label><label style="flex:1;min-width:220px">หลักฐาน/เหตุผล (Evidence)<input type="text" id="wc_qual_note" value="'+E(qm.note||'')+'" placeholder="เช่น งานถูกต้องครบถ้วน ไม่มีข้อผิดพลาด / มีจุดต้องแก้เล็กน้อย"></label></div>';
  h+='<div class="row" style="gap:8px;margin-top:8px"><button class="primary" id="wc_qual_save">บันทึก Quality</button>'+(qm.by?'<span class="wc-sub">ล่าสุดโดย '+E(qm.by)+' · '+E((qm.at||'').slice(0,10))+'</span>':'<span class="wc-sub">ให้คะแนนความถูกต้องแม่นยำของงานในเดือนนี้ (0–100)</span>')+'</div>';
  h+='<h4 class="wc-h4" style="margin-top:14px">Overview (Other) · ถ่วงน้ำหนัก '+getS().kpiWeights.ownership+'%</h4>';
  h+='<div class="wc-form"><label>Score (0–100)<input type="number" min="0" max="100" id="wc_own" value="'+(om.score!=null?om.score:'')+'"></label><label style="flex:1;min-width:220px">หลักฐาน/เหตุผล (Evidence)<input type="text" id="wc_own_note" value="'+E(om.note||'')+'" placeholder="เช่น รับงานด่วนแทนทีม, แก้ปัญหาเชิงรุก"></label></div>';
  h+='<div class="row" style="gap:8px;margin-top:8px"><button class="primary" id="wc_own_save">บันทึก Overview (Other)</button>'+(om.by?'<span class="wc-sub">ล่าสุดโดย '+E(om.by)+' · '+E((om.at||'').slice(0,10))+'</span>':'<span class="wc-sub">ให้คะแนนพร้อมหลักฐานเพื่อความเป็นธรรม</span>')+'</div>';
  h+='</div>';
 }
 return h;
}
// ---------- TAB: SCORING SETTINGS ----------
function renderSettings(){var S=getS();var u=jload(WKEY,{})||{};var hist=jload(HKEY,[])||[];
 var kw=S.kpiWeights;var kwSum=kw.productivity+kw.timeliness+kw.quality+kw.ownership;
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">Scoring Settings</h3><div class="row" style="gap:8px"><input type="date" id="wc_eff" class="filter" title="Effective Date"><button class="primary" id="wc_savever">บันทึกเวอร์ชัน</button><button class="ghost" id="wc_reset">Reset ค่าเริ่มต้น</button></div></div>';
 h+='<div class="wc-sub" style="margin:4px 0 12px">แก้ไขแล้วมีผลกับการคำนวณทันที · กด “บันทึกเวอร์ชัน” เพื่อเก็บ snapshot พร้อม Effective Date (ไม่เปลี่ยนรายงานย้อนหลัง) · เฉพาะ Admin ควรแก้</div>';
 // media base/hrs
 h+='<h4 class="wc-h4">1. Media Score (Base × Standard Hours)</h4><table class="table wc-t"><thead><tr><th>ประเภท · รายละเอียด</th><th>Base</th><th>Std Hours</th></tr></thead><tbody>';
 MEDIA.forEach(function(m){Object.keys(S.media[m]).filter(function(k){return k!=='_default';}).forEach(function(k){var c=S.media[m][k];h+='<tr><td>'+E(m)+' · '+E(k)+'</td><td><input type="number" step="1" class="wc-mb" data-m="'+E(m)+'" data-k="'+E(k)+'" value="'+c.base+'"></td><td><input type="number" step="0.5" class="wc-mh" data-m="'+E(m)+'" data-k="'+E(k)+'" value="'+c.hrs+'"></td></tr>';});});
 h+='<tr><td>Checker</td><td><input type="number" class="wc-g" data-g="checkerBase" value="'+S.checkerBase+'"></td><td><input type="number" step="0.5" class="wc-g" data-g="checkerHrs" value="'+S.checkerHrs+'"></td></tr>';
 h+='<tr><td>Approval (เผยแพร่)</td><td><input type="number" class="wc-g" data-g="approvalBase" value="'+S.approvalBase+'"></td><td><input type="number" step="0.5" class="wc-g" data-g="approvalHrs" value="'+S.approvalHrs+'"></td></tr>';
 h+='<tr><td>การสื่อสาร (ผู้รับผิดชอบสื่อสาร)</td><td><input type="number" class="wc-g" data-g="commBase" value="'+S.commBase+'"></td><td><input type="number" step="0.5" class="wc-g" data-g="commHrs" value="'+S.commHrs+'"></td></tr></tbody></table>';
 // multipliers
 h+='<div class="wc-2col"><div><h4 class="wc-h4">2. Multipliers</h4><table class="table wc-t"><tbody>'
  +mulRow('Difficulty','difficulty',['Easy','Medium','Hard'],S)+mulRow('Importance','importance',['Normal','High','Critical'],S)+mulRow('Urgency','urgency',['Normal','Urgent','Emergency'],S)
  +'<tr><td>Responsibility</td><td colspan="3">Primary <input type="number" class="wc-r" data-r="primary" value="'+S.responsibility.primary+'" style="width:60px">% · Support <input type="number" class="wc-r" data-r="support" value="'+S.responsibility.support+'" style="width:60px">%</td></tr>'
  +'</tbody></table></div>';
 // kpi weights + capacity
 h+='<div><h4 class="wc-h4">3. KPI Weights <span class="wc-sub" id="wc_kwsum" style="color:'+(kwSum===100?'#2e7d4f':'#c0392b')+'">(รวม '+kwSum+'%)</span></h4><table class="table wc-t"><tbody>'
  +['productivity','timeliness','quality','ownership'].map(function(k){var KWLAB={productivity:'productivity',timeliness:'timeliness',quality:'quality',ownership:'Overview (Other)'};return '<tr><td>'+(KWLAB[k]||k)+'</td><td><input type="number" class="wc-kw" data-k="'+k+'" value="'+kw[k]+'">%</td></tr>';}).join('')
  +'</tbody></table>'
  +'<h4 class="wc-h4">4. Capacity & Thresholds</h4><table class="table wc-t"><tbody>'
  +'<tr><td>Benchmark (pt/hr)</td><td><input type="number" step="0.025" class="wc-c" data-c="benchmark" value="'+S.capacity.benchmark+'"></td></tr>'
  +'<tr><td>Scheduled Hrs/เดือน (default)</td><td><input type="number" class="wc-c" data-c="scheduledHours" value="'+S.capacity.scheduledHours+'"></td></tr>'
  +'<tr><td>Hours per Leave Day</td><td><input type="number" class="wc-c" data-c="hoursPerLeaveDay" value="'+S.capacity.hoursPerLeaveDay+'"></td></tr>'
  +'<tr><td>Balanced ≥ / High ≥ / Overload ></td><td><input type="number" class="wc-th" data-t="balanced" value="'+S.statusThresholds.balanced+'" style="width:55px"> <input type="number" class="wc-th" data-t="high" value="'+S.statusThresholds.high+'" style="width:55px"> <input type="number" class="wc-th" data-t="overload" value="'+S.statusThresholds.overload+'" style="width:55px"></td></tr>'
  +'</tbody></table></div></div>';
 // version history
 h+='<h4 class="wc-h4">5. Version History</h4>'+(hist.length?('<table class="table wc-t"><thead><tr><th>Effective</th><th>บันทึกเมื่อ</th><th>โดย</th><th></th></tr></thead><tbody>'+hist.slice(0,10).map(function(v,i){return '<tr><td>'+E(v.effective||'—')+'</td><td>'+E((v.at||'').slice(0,10))+'</td><td>'+E(v.by||'')+'</td><td><button class="ghost cp-mini wc-restore" data-i="'+i+'">↩ คืนค่า</button></td></tr>';}).join('')+'</tbody></table>'):'<div class="wc-sub">ยังไม่มีเวอร์ชันที่บันทึก</div>');
 h+='</div>';
 return h;
}
function mulRow(label,key,keys,S){return '<tr><td>'+label+'</td>'+keys.map(function(k){return '<td>'+k+' <input type="number" step="0.05" class="wc-mul" data-mk="'+key+'" data-kk="'+k+'" value="'+S[key][k]+'" style="width:58px"></td>';}).join('')+'</tr>';}

function renderWC(){var body=g('wcBody');if(!body||!W())return;
 document.querySelectorAll('.wc-tab').forEach(function(b){b.classList.toggle('primary',b.dataset.wctab===ST.tab);b.classList.toggle('ghost',b.dataset.wctab!==ST.tab);});
 var fn={overview:renderOverview,matrix:renderMatrix,capacity:renderCapacity,kpi:renderKPI,settings:renderSettings}[ST.tab]||renderOverview;
 body.innerHTML=fn();bindBody();
}
function u(){return jload(WKEY,{})||{};}
function setU(path,val){var uu=u();var cur=uu;for(var i=0;i<path.length-1;i++){cur[path[i]]=cur[path[i]]||{};cur=cur[path[i]];}cur[path[path.length-1]]=val;saveUser(uu);}
function bindBody(){
 // matrix mode
 document.querySelectorAll('.wc-mmode').forEach(function(b){b.onclick=function(){ST.mmode=b.dataset.mmode;renderWC();};});
 // capacity day/week/month view toggle
 document.querySelectorAll('.wc-capview').forEach(function(b){b.onclick=function(){ST.capView=b.dataset.cv;ST._capedit=0;renderWC();};});
 // capacity edit
 document.querySelectorAll('.wc-capedit').forEach(function(b){b.onclick=function(){ST.drill=b.dataset.m;ST._capedit=1;renderWC();};});
 if(g('wc_capclose'))g('wc_capclose').onclick=function(){ST._capedit=0;ST.drill=null;renderWC();};
 if(g('wc_capsave'))g('wc_capsave').onclick=function(){var m=ST.drill;var uu=u();uu.capacity=uu.capacity||{};uu.capacity.perMember=uu.capacity.perMember||{};uu.capacity.perMember[m]={scheduledHours:+g('wc_sched').value,meetingHours:+g('wc_meet').value,otherHours:+g('wc_other').value};saveUser(uu);audit('capacity',m);ST._capedit=0;ST.drill=null;if(typeof notify==='function')notify('บันทึก Capacity '+m+' แล้ว');renderWC();};
 // kpi drill
 document.querySelectorAll('.wc-kpirow').forEach(function(tr){tr.querySelector('td').onclick=function(){ST.drill=(ST.drill===tr.dataset.m?null:tr.dataset.m);renderWC();};tr.style.cursor='pointer';});
 // performance log capture (actual hours)
 document.querySelectorAll('.wc-perf').forEach(function(e){e.onchange=function(){var pf=PERF(),id=e.dataset.id;pf[id]=pf[id]||{};if(e.value===''){delete pf[id][e.dataset.f];}else{pf[id][e.dataset.f]=+e.value;}if(!Object.keys(pf[id]).length)delete pf[id];jsave(PKEY,pf);audit('perf-log',id+'·'+e.dataset.f+'='+e.value);renderWC();};});
 if(g('wc_qual_save'))g('wc_qual_save').onclick=function(){var o=QUALS(),key=ST.drill+'|'+curYM(),sc=g('wc_qual').value;if(sc===''){delete o[key];}else{o[key]={score:Math.max(0,Math.min(100,Math.round(+sc))),note:g('wc_qual_note').value||'',by:ME(),at:new Date().toISOString()};}jsave(QKEY,o);audit('quality',key+'='+sc);if(typeof notify==='function')notify('บันทึก Quality '+ST.drill+' แล้ว');renderWC();};
 if(g('wc_own_save'))g('wc_own_save').onclick=function(){var o=OWNS(),key=ST.drill+'|'+curYM(),sc=g('wc_own').value;if(sc===''){delete o[key];}else{o[key]={score:Math.max(0,Math.min(100,Math.round(+sc))),note:g('wc_own_note').value||'',by:ME(),at:new Date().toISOString()};}jsave(OKEY,o);audit('ownership',key+'='+sc);if(typeof notify==='function')notify('บันทึก Overview (Other) '+ST.drill+' แล้ว');renderWC();};
 // version restore
 document.querySelectorAll('.wc-restore').forEach(function(b){b.onclick=function(){var hh=jload(HKEY,[])||[],v=hh[+b.dataset.i];if(!v||!v.settings)return;if(!window.confirm('คืนค่า Scoring Settings เป็นเวอร์ชัน Effective '+(v.effective||'—')+'?\\n(ค่าปัจจุบันจะถูกแทนที่)'))return;jsave(WKEY,v.settings);audit('restore',v.effective||'');if(typeof notify==='function')notify('คืนค่าเวอร์ชัน '+(v.effective||'')+' แล้ว');renderWC();};});
 // settings inputs -> live update
 document.querySelectorAll('.wc-mb').forEach(function(e){e.onchange=function(){setU(['media',e.dataset.m,e.dataset.k,'base'],+e.value);afterSet();};});
 document.querySelectorAll('.wc-mh').forEach(function(e){e.onchange=function(){setU(['media',e.dataset.m,e.dataset.k,'hrs'],+e.value);afterSet();};});
 document.querySelectorAll('.wc-g').forEach(function(e){e.onchange=function(){setU([e.dataset.g],+e.value);afterSet();};});
 document.querySelectorAll('.wc-mul').forEach(function(e){e.onchange=function(){setU([e.dataset.mk,e.dataset.kk],+e.value);afterSet();};});
 document.querySelectorAll('.wc-r').forEach(function(e){e.onchange=function(){setU(['responsibility',e.dataset.r],+e.value);afterSet();};});
 document.querySelectorAll('.wc-kw').forEach(function(e){e.onchange=function(){setU(['kpiWeights',e.dataset.k],+e.value);var s=getS().kpiWeights;var sum=s.productivity+s.timeliness+s.quality+s.ownership;var el=g('wc_kwsum');if(el){el.textContent='(รวม '+sum+'%)';el.style.color=sum===100?'#2e7d4f':'#c0392b';}if(typeof notify==='function'&&sum!==100)notify('⚠ KPI Weights ต้องรวม = 100% (ตอนนี้ '+sum+'%)');};});
 document.querySelectorAll('.wc-c').forEach(function(e){e.onchange=function(){setU(['capacity',e.dataset.c],+e.value);afterSet();};});
 document.querySelectorAll('.wc-th').forEach(function(e){e.onchange=function(){setU(['statusThresholds',e.dataset.t],+e.value);afterSet();};});
 if(g('wc_savever'))g('wc_savever').onclick=function(){var s=getS().kpiWeights;var sum=s.productivity+s.timeliness+s.quality+s.ownership;if(sum!==100){if(typeof notify==='function')notify('⚠ KPI Weights ต้องรวม 100% ก่อนบันทึกเวอร์ชัน');return;}var hist=jload(HKEY,[]);if(!Array.isArray(hist))hist=[];hist.unshift({effective:(g('wc_eff').value||new Date().toISOString().slice(0,10)),at:new Date().toISOString(),by:ME(),settings:u()});jsave(HKEY,hist.slice(0,50));audit('save-version',g('wc_eff').value||'');if(typeof notify==='function')notify('บันทึกเวอร์ชันแล้ว');renderWC();};
 if(g('wc_reset'))g('wc_reset').onclick=function(){if(!window.confirm('Reset Scoring Settings กลับค่าเริ่มต้นทั้งหมด?'))return;jsave(WKEY,{});audit('reset','');if(typeof notify==='function')notify('รีเซ็ตค่าเริ่มต้นแล้ว');renderWC();};
}
function afterSet(){audit('edit-setting','');if(ST.tab==='settings')renderWC();}

function exportReport(){var T=teamData();var S=getS();
 function tr(cells){return '<tr>'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}
 var body='<h2>Team Overview — '+curYM()+'</h2><p>Workload '+T.totalWorkload+' · Capacity '+T.totalCapacity+' · Utilization '+(T.avgUtilization==null?'N/A':T.avgUtilization+'%')+' · KPI avg '+(T.avgKpi==null?'N/A':T.avgKpi)+' · Overloaded '+T.overloaded+' · Overdue '+T.overdue+'</p>';
 function na(x){return x==null?'N/A':x;}
 body+='<h2>Capacity & KPI by member</h2><table><thead><tr><th>Member</th><th>Workload</th><th>Capacity</th><th>Util</th><th>Status</th><th>Prod</th><th>Time</th><th>Qual</th><th>Other</th><th>KPI</th><th>Grade</th></tr></thead><tbody>'+rowsShown(T).map(function(r){return tr([r.member,r.workload.total,r.capacity.points,(r.utilization==null?'—':r.utilization+'%'),r.status,na(r.kpi.productivity),na(r.kpi.timeliness),na(r.kpi.quality),na(r.kpi.ownership),na(r.kpi.total),(r.kpi.total==null?'N/A':r.grade)]);}).join('')+'</tbody></table>';
 var doc='<!doctype html><meta charset=utf-8><title>Workload & Capacity Report</title><style>body{font-family:system-ui,"Noto Sans Thai",sans-serif;max-width:820px;margin:20px auto;padding:0 16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px 10px;font-size:13px}h2{border-bottom:2px solid #1766cc;padding-bottom:4px}</style><h1>Workload & Capacity & KPI Report</h1>'+body;
 var b=new Blob([doc],{type:'text/html;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='workload-report-'+curYM()+'.html';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);if(typeof notify==='function')notify('Export รายงานแล้ว');}

function monthBtnLabel(){var s=selMonths();if(!s.length)return 'ทุกเดือน';if(s.length===1)return s[0];return s.length+' เดือน';}
function buildMonthFilter(){var pop=g('wcMonthPop');if(!pop)return;var s=selMonths();
 pop.innerHTML='<label class="wc-msel-opt"><input type="checkbox" id="wcMoAll" '+(s.length?'':'checked')+'> <b>ทุกเดือน</b></label><div class="wc-msel-sep"></div>'
  +monthsList().map(function(m){return '<label class="wc-msel-opt"><input type="checkbox" class="wc-mo" value="'+m+'" '+(s.indexOf(m)>=0?'checked':'')+'> '+m+'</label>';}).join('');
 var lbl=g('wcMonthLbl');if(lbl)lbl.textContent=monthBtnLabel();}
function initFilters(){
 buildMonthFilter();
 var me=g('wcMember');if(me){me.innerHTML='<option value="">ทุกสมาชิก</option>'+PEOPLE().map(function(p){return '<option value="'+E(p)+'">'+E(p)+'</option>';}).join('');}
 var md=g('wcMedia');if(md)md.innerHTML='<option value="">ทุกประเภทสื่อ</option>'+MEDIA.map(function(m){return '<option value="'+E(m)+'">'+E(m)+'</option>';}).join('');
 var stt=g('wcStatus');if(stt){var ss=(typeof statuses!=='undefined'?statuses:[]);stt.innerHTML='<option value="">ทุกสถานะ</option>'+ss.map(function(s){return '<option value="'+s+'">'+E(STATUS_LABELS[s]||s)+'</option>';}).join('');}
}
function init(){
 if(!g('wcBody'))return;
 initFilters();
 document.querySelectorAll('.wc-tab').forEach(function(b){b.onclick=function(){ST.tab=b.dataset.wctab;ST.drill=null;ST._capedit=0;renderWC();};});
 var on=function(id,fn){var e=g(id);if(e)e.onchange=fn;};
 // month multi-select: open/close popup, outside-click close, checkbox delegation
 var mc=g('wcMonth'),pop=g('wcMonthPop');
 if(mc&&pop){
  mc.addEventListener('click',function(e){if(e.target.closest('.wc-msel-pop'))return;pop.hidden=!pop.hidden;});
  document.addEventListener('click',function(e){if(!pop.hidden&&!mc.contains(e.target))pop.hidden=true;});
  pop.addEventListener('change',function(e){var t=e.target;
   if(t.id==='wcMoAll'){if(t.checked)ST.months=[];}
   else if(t.classList&&t.classList.contains('wc-mo')){ST.months=ST.months||[];var v=t.value,i=ST.months.indexOf(v);if(t.checked){if(i<0)ST.months.push(v);}else if(i>=0)ST.months.splice(i,1);}
   buildMonthFilter();renderWC();});
 }
 on('wcMember',function(e){ST.member=e.target.value;renderWC();});
 on('wcMedia',function(e){ST.media=e.target.value;renderWC();});
 on('wcStatus',function(e){ST.status=e.target.value;renderWC();});
 var ex=g('wcExport');if(ex)ex.onclick=exportReport;
 document.querySelectorAll('[data-page="workload"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(renderWC,0);});});
 renderWC();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

;
/* js/22-special-order.js */
(function(){
// บันทึกแผนการสั่งออเดอร์พิเศษ (Special Order Plan) — self-contained page. SSOT: localStorage -> data.json
var KEY='worktracker-specialorder-v1';
function esc2(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function g(id){return document.getElementById(id);}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(s)?s:[];}catch(e){return [];}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a));}catch(e){}}
function newId(){return 'SO'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
var THMON={'มค':1,'กพ':2,'มีค':3,'เมย':4,'พค':5,'มิย':6,'กค':7,'สค':8,'กย':9,'ตค':10,'พย':11,'ธค':12,'มกราคม':1,'กุมภาพันธ์':2,'มีนาคม':3,'เมษายน':4,'พฤษภาคม':5,'มิถุนายน':6,'กรกฎาคม':7,'สิงหาคม':8,'กันยายน':9,'ตุลาคม':10,'พฤศจิกายน':11,'ธันวาคม':12};
// parse one date (ISO out). Thai month supported; missing year -> defYear.
function soDate(s,defY){s=(s||'').trim();if(!s)return '';
 var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m){var y=+m[1];if(y>2400)y-=543;return y+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);}
 m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/);if(m){var d=+m[1],mo=+m[2],yy=m[3]?+m[3]:(defY||new Date().getFullYear());if(yy<100)yy+=2500;if(yy>2400)yy-=543;return yy+'-'+('0'+mo).slice(-2)+'-'+('0'+d).slice(-2);}
 var toks=s.split(/[\s\-\/]+/).filter(Boolean),dd=null,mo2=null,yy2=null;
 for(var i=0;i<toks.length;i++){var t=toks[i].replace(/\./g,'').trim();if(mo2==null&&THMON[t]!=null){mo2=THMON[t];continue;}if(/^\d{1,4}$/.test(t)){var n=+t;if(dd==null&&t.length<=2&&n>=1&&n<=31)dd=n;else if(yy2==null)yy2=n;}}
 if(dd&&mo2){var Y=(yy2!=null)?yy2:(defY||new Date().getFullYear());if(Y<100)Y+=2500;if(Y>2400)Y-=543;return Y+'-'+('0'+mo2).slice(-2)+'-'+('0'+dd).slice(-2);}
 return '';}
function dow(d){try{var x=new Date(d+'T00:00:00');return ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][x.getDay()];}catch(e){return '';}}
function num(v){var n=parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10);return isNaN(n)?0:n;}
// status bucket
function stBucket(s){s=(s||'').trim();if(!s)return 'other';if(s.indexOf('ดำเนินการแล้ว')>=0)return 'done';if(s.indexOf('ระหว่างดำเนินการ')>=0||s.indexOf('กำลังดำเนินการ')>=0)return 'prog';return 'other';}
function stPill(s){var b=stBucket(s),c={done:'so-st-done',prog:'so-st-prog',other:'so-st-other'}[b];var lbl=(s||'').trim()||'—';return '<span class="pill '+c+'" title="'+esc2(s||'')+'">'+esc2(lbl.length>26?lbl.slice(0,25)+'…':lbl)+'</span>';}

var F={search:'',status:'',dept:'',gran:'all',date:'',start:'',end:'',sort:'date'};
window.__soF=F;
function inRange(d){if(F.gran==='all'||!d)return true;if(F.gran==='custom'){if(!F.start&&!F.end)return true;if(F.start&&d<F.start)return false;if(F.end&&d>F.end)return false;return true;}if(!F.date)return true;if(F.gran==='day')return d===F.date;if(F.gran==='month')return d.slice(0,7)===F.date.slice(0,7);return true;}
function match(r){
 if(F.search){var q=F.search.toLowerCase();if((((r.request||'')+' '+(r.docNo||'')+' '+(r.purpose||'')+' '+(r.dept||'')+' '+(r.note||'')).toLowerCase()).indexOf(q)<0)return false;}
 if(!inRange(r.actionDate||''))return false;
 if(F.status&&stBucket(r.status)!==F.status)return false;
 if(F.dept&&(r.dept||'')!==F.dept)return false;
 return true;}
function sortRows(a){a=a.slice();a.sort(function(x,y){
 if(F.sort==='doc')return (x.docNo||'').localeCompare(y.docNo||'');
 if(F.sort==='date_desc')return (y.actionDate||'').localeCompare(x.actionDate||'');
 return (x.actionDate||'').localeCompare(y.actionDate||'')||(x.docNo||'').localeCompare(y.docNo||'');});return a;}

// ---- More-Actions kebab (reuses global .cp-actions/.cp-menu CSS) ----
function soOps(id){var e=esc2(id);return '<div class="cp-actions"><button class="ghost cp-kebab" data-somenu data-id="'+e+'" title="การจัดการ">⋯</button><div class="cp-menu" hidden><button class="cp-mi" data-soact="edit" data-id="'+e+'">✎ แก้ไข</button><button class="cp-mi" data-soact="dup" data-id="'+e+'">⧉ ทำซ้ำ</button><button class="cp-mi danger" data-soact="del" data-id="'+e+'">✕ ลบ</button></div></div>';}
function soCloseMenus(){document.querySelectorAll('#soTable .cp-menu').forEach(function(m){m.hidden=true;m.style.left='';m.style.top='';});document.querySelectorAll('#soTable .cp-kebab.open').forEach(function(k){k.classList.remove('open');});}
function soPos(kb,menu){var r=kb.getBoundingClientRect(),mw=menu.offsetWidth||140,mh=menu.offsetHeight||120;var left=Math.max(8,Math.min(r.right-mw,window.innerWidth-mw-8));var top=r.bottom+4;if(top+mh>window.innerHeight-8)top=Math.max(8,r.top-mh-4);menu.style.left=left+'px';menu.style.top=top+'px';}

window.renderSO=function(){
 var host=g('soTable');if(!host)return;
 var all=load();
 var rows=all.filter(match);
 // summary (filtered)
 var done=0,prog=0,other=0,branches=0,sku=0;
 rows.forEach(function(r){var b=stBucket(r.status);if(b==='done')done++;else if(b==='prog')prog++;else other++;branches+=num(r.branches);sku+=num(r.sku);});
 var sm=function(id,v){var e=g(id);if(e)e.textContent=v;};
 sm('soSumTotal',rows.length);sm('soSumDone',done);sm('soSumProg',prog);sm('soSumOther',other);sm('soSumBranch',branches.toLocaleString());sm('soSumSku',sku.toLocaleString());
 // dept + status filter options (from full data)
 var depts=[];all.forEach(function(r){if(r.dept&&depts.indexOf(r.dept)<0)depts.push(r.dept);});depts.sort();
 var dsel=g('soFDept');if(dsel&&dsel._n!==depts.length+1){dsel._n=depts.length+1;dsel.innerHTML='<option value="">ทุกหน่วยงาน</option>'+depts.map(function(d){return '<option value="'+esc2(d)+'">'+esc2(d)+'</option>';}).join('');dsel.value=F.dept;}
 // table
 var srt=sortRows(rows),ncol=11,html='';
 if(!srt.length)html='<tr><td class="empty" colspan="'+ncol+'">ไม่มีรายการ · กด “＋ เพิ่มรายการ” หรือ “นำเข้าข้อมูล”</td></tr>';
 else{var grp=(F.sort==='date'||F.sort==='date_desc'),curd=null;
  srt.forEach(function(r){
   var gk=r.actionDate||'';if(grp&&gk!==curd){curd=gk;var cnt=srt.filter(function(x){return (x.actionDate||'')===curd;}).length;var glb=curd?(esc2(curd)+' · '+dow(curd)):'ไม่ระบุวันที่';html+='<tr class="cp-grp"><td colspan="'+ncol+'"><div class="cp-grp-in"><span class="cp-grp-date">📅 '+glb+'</span><span class="cp-grp-count">'+cnt+' รายการ</span></div></td></tr>';}
   html+='<tr><td>'+esc2(r.actionDate||(r.actionRaw||'—'))+'</td><td class="so-doc">'+esc2(r.docNo||'—')+'</td><td><b>'+esc2(r.request||'')+'</b></td><td>'+esc2(r.purpose||'—')+'</td><td style="text-align:center">'+esc2(r.sku||'')+'</td><td style="text-align:center">'+esc2(r.qty||'')+'</td><td style="text-align:right">'+esc2(r.branches||'')+'</td><td>'+esc2(r.requiredDate||'—')+'</td><td>'+esc2(r.dept||'—')+'</td><td>'+stPill(r.status)+'</td><td class="cp-ops">'+soOps(r.soid)+'</td></tr>';
  });}
 host.innerHTML='<colgroup><col class="so-c-ad"><col class="so-c-doc"><col class="so-c-req"><col class="so-c-pur"><col class="so-c-sku"><col class="so-c-qty"><col class="so-c-br"><col class="so-c-rd"><col class="so-c-dept"><col class="so-c-st"><col class="so-c-ops"></colgroup><thead><tr><th>วันที่ดำเนินการ</th><th>เลขที่เอกสาร</th><th>ความต้องการ</th><th>วัตถุประสงค์</th><th>SKU</th><th>จำนวน</th><th>สาขา</th><th>วันที่ต้องการ</th><th>หน่วยงาน</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>'+html+'</tbody>';
};

// ---------- Add / Edit modal ----------
var editing=null;
var FLD={actionDate:'sof_ad',docNo:'sof_doc',request:'sof_req',purpose:'sof_pur',sku:'sof_sku',qty:'sof_qty',branches:'sof_br',requiredDate:'sof_rd',dept:'sof_dept',status:'sof_st',note:'sof_note'};
function openSO(id){editing=id;var r=id?load().find(function(x){return x.soid===id;}):null;
 g('soModalTitle').textContent=r?'แก้ไขรายการ':'เพิ่มรายการออเดอร์พิเศษ';
 for(var k in FLD){var e=g(FLD[k]);if(e)e.value=(r&&r[k]!=null)?r[k]:'';}
 g('soModalbg').classList.add('open');}
function closeSO(){g('soModalbg').classList.remove('open');}
function saveSO(){var o={};for(var k in FLD){var e=g(FLD[k]);o[k]=e?e.value.trim():'';}
 if(!o.request){if(typeof notify==='function')notify('กรุณาระบุ “ความต้องการ”');return;}
 if(o.actionDate){var d=soDate(o.actionDate);if(d)o.actionDate=d;}
 var all=load();if(editing){var r=all.find(function(x){return x.soid===editing;});if(r){for(var k2 in o)r[k2]=o[k2];}}else{o.soid=newId();o.src='manual';all.push(o);}
 save(all);closeSO();window.renderSO();if(typeof notify==='function')notify(editing?'บันทึกแล้ว':'เพิ่มรายการแล้ว');}
function delSO(id){var all=load();var r=all.find(function(x){return x.soid===id;});if(!r)return;if(!window.confirm('ลบรายการ “'+(r.request||id)+'” ?'))return;save(all.filter(function(x){return x.soid!==id;}));window.renderSO();if(typeof notify==='function')notify('ลบแล้ว');}
function dupSO(id){var all=load();var r=all.find(function(x){return x.soid===id;});if(!r)return;var c=JSON.parse(JSON.stringify(r));c.soid=newId();c.request=(r.request||'')+' (คัดลอก)';all.push(c);save(all);window.renderSO();if(typeof notify==='function')notify('ทำซ้ำแล้ว');}

// ---------- Import (Google Sheet mapping) ----------
var SYS=[['actionDate','วันที่ดำเนินการ'],['docNo','เลขที่เอกสาร'],['request','ความต้องการ'],['purpose','วัตถุประสงค์'],['sku','SKU'],['qty','จำนวน'],['branches','จำนวนสาขา'],['requiredDate','วันที่ต้องการ'],['dept','หน่วยงานที่รับผิดชอบ'],['status','สถานะ'],['note','หมายเหตุ']];
var ALIAS={actionDate:['วันที่ดำเนินการ','วันดำเนินการ','action date'],docNo:['เลขที่เอกสาร','เลขที่','เอกสาร','doc'],request:['ความต้องการ','request','เรื่อง'],purpose:['วัตถุประสงค์','purpose'],sku:['sku'],qty:['จำนวน','qty','quantity'],branches:['จำนวนสาขา','สาขา','branch'],requiredDate:['วันที่ต้องการ','วันต้องการ','required'],dept:['หน่วยงานที่รับผิดชอบ','หน่วยงาน','รับผิดชอบ','dept'],status:['สถานะ','status'],note:['หมายเหตุ','remark','note']};
var IMP={url:'',headers:[],rows:[],map:{}};
function autoMap(){IMP.map={};var used={};
 // pass 1: exact
 SYS.forEach(function(f){var k=f[0],al=ALIAS[k];for(var j=0;j<IMP.headers.length;j++){if(used[j])continue;var hh=(IMP.headers[j]||'').toLowerCase().trim();for(var a=0;a<al.length;a++){if(hh===al[a].toLowerCase()){IMP.map[k]=j;used[j]=1;return;}}}});
 // pass 2: contains
 SYS.forEach(function(f){var k=f[0];if(k in IMP.map)return;var al=ALIAS[k];for(var j=0;j<IMP.headers.length;j++){if(used[j])continue;var hh=(IMP.headers[j]||'').toLowerCase().trim();for(var a=0;a<al.length;a++){if(hh.indexOf(al[a].toLowerCase())>=0){IMP.map[k]=j;used[j]=1;return;}}}});}
function impCell(r,k){var j=IMP.map[k];return (j==null||j<0||j>=r.length)?'':((r[j]||'').trim());}
function impParse(r){var o={};SYS.forEach(function(f){o[f[0]]=impCell(r,f[0]);});o.actionRaw=o.actionDate;var d=soDate(o.actionDate);o.actionDate=d;return o;}
function openImp(){IMP={url:'',headers:[],rows:[],map:{}};g('soImpUrl').value='';g('soImpBody').innerHTML='<div class="tiny muted">วางลิงก์ Google Sheet (แชร์แบบ “ทุกคนที่มีลิงก์ดูได้”) แล้วกด “ดึงตัวอย่าง/ตรวจสอบ”</div>';g('soImpGo').disabled=true;g('soImpBg').classList.add('open');}
function closeImp(){g('soImpBg').classList.remove('open');}
function impFetch(){var url=g('soImpUrl').value.trim();if(!url){if(typeof notify==='function')notify('ยังไม่ได้ใส่ลิงก์');return;}
 g('soImpBody').innerHTML='<div class="tiny muted">กำลังอ่านข้อมูล…</div>';
 fetch('/api/raw-sheet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url})}).then(function(r){return r.json();}).then(function(d){
  if(!d||!d.ok){g('soImpBody').innerHTML='<div class="wz-err">'+esc2((d&&d.error)||'อ่านข้อมูลไม่สำเร็จ')+'</div>';return;}
  IMP.url=url;IMP.headers=d.headers||[];IMP.rows=d.rows||[];autoMap();renderImp(d.total||IMP.rows.length);
 }).catch(function(e){g('soImpBody').innerHTML='<div class="wz-err">ข้อผิดพลาด: '+esc2(String(e))+'</div>';});}
function renderImp(total){
 var mapRows=SYS.map(function(f){var cur=(f[0] in IMP.map)?IMP.map[f[0]]:-1,ok=cur>=0;
  var opts='<option value="-1">— ไม่ใช้ —</option>'+IMP.headers.map(function(h,j){return '<option value="'+j+'"'+(cur===j?' selected':'')+'>'+esc2(h||('คอลัมน์ '+(j+1)))+'</option>';}).join('');
  return '<tr><td>'+esc2(f[1])+'</td><td style="text-align:center">→</td><td><select class="filter so-map" data-k="'+f[0]+'" style="min-width:190px">'+opts+'</select></td><td>'+(ok?'<span class="pill so-st-done">จับคู่แล้ว</span>':'<span class="tiny muted">ไม่ได้ใช้</span>')+'</td></tr>';}).join('');
 var parsed=IMP.rows.map(impParse),bad=parsed.filter(function(o){return o.actionRaw&&!o.actionDate;}).length;
 var prev=parsed.slice(0,8).map(function(o){return '<tr><td>'+(o.actionDate||'<span class="wz-err">'+esc2(o.actionRaw||'—')+'</span>')+'</td><td>'+esc2(o.docNo||'—')+'</td><td>'+esc2((o.request||'').slice(0,40))+'</td><td>'+esc2(o.purpose||'—')+'</td><td style="text-align:center">'+esc2(o.sku||'')+'</td><td style="text-align:right">'+esc2(o.branches||'')+'</td><td>'+esc2(o.status||'—')+'</td></tr>';}).join('');
 g('soImpBody').innerHTML='<div class="tiny muted" style="margin-bottom:6px">อ่านสำเร็จ · '+total+' แถว · ระบบจับคู่อัตโนมัติ (ปรับได้)</div>'
  +'<div class="cp-table-wrap" style="max-height:230px"><table class="table"><thead><tr><th>คอลัมน์จาก Sheet → ฟิลด์</th><th></th><th>ฟิลด์ในระบบ</th><th>สถานะ</th></tr></thead><tbody>'+mapRows+'</tbody></table></div>'
  +'<div class="tiny muted" style="margin:10px 0 4px">ตัวอย่างข้อมูลที่จะนำเข้า'+(bad?(' · <span class="wz-err">วันที่อ่านไม่ได้ '+bad+' แถว (จะเก็บข้อความเดิมไว้)</span>'):'')+'</div>'
  +'<div class="cp-table-wrap" style="max-height:220px"><table class="table"><thead><tr><th>วันที่</th><th>เลขที่เอกสาร</th><th>ความต้องการ</th><th>วัตถุประสงค์</th><th>SKU</th><th>สาขา</th><th>สถานะ</th></tr></thead><tbody>'+prev+'</tbody></table></div>'
  +'<label class="cp-ck" style="margin-top:10px"><input type="checkbox" id="soImpDedup" checked> ข้ามรายการซ้ำ (เลขที่เอกสารเดิม)</label>';
 g('soImpGo').disabled=false;
 document.querySelectorAll('.so-map').forEach(function(s){s.onchange=function(){var v=+s.value;if(v<0)delete IMP.map[s.dataset.k];else IMP.map[s.dataset.k]=v;renderImp(total);};});
}
function impDo(){var parsed=IMP.rows.map(impParse).filter(function(o){return (o.request||'').trim();});
 if(!parsed.length){if(typeof notify==='function')notify('ไม่มีรายการที่นำเข้าได้ (ต้องมี “ความต้องการ”)');return;}
 var dedup=g('soImpDedup')&&g('soImpDedup').checked;var all=load();var have={};if(dedup)all.forEach(function(r){if(r.docNo)have[r.docNo.trim()]=1;});
 var added=0,skipped=0;parsed.forEach(function(o){if(dedup&&o.docNo&&have[o.docNo.trim()]){skipped++;return;}o.soid=newId();o.src='sheet';all.push(o);if(o.docNo)have[o.docNo.trim()]=1;added++;});
 save(all);closeImp();window.renderSO();if(typeof notify==='function')notify('นำเข้า '+added+' รายการ'+(skipped?(' · ข้ามซ้ำ '+skipped):''));}

function init(){
 if(!g('soTable'))return;
 var on=function(id,ev,fn){var e=g(id);if(e)e.addEventListener(ev,fn);};
 on('soSearch','input',function(e){F.search=e.target.value;window.renderSO();});
 on('soFSt','change',function(e){F.status=e.target.value;window.renderSO();});
 on('soFDept','change',function(e){F.dept=e.target.value;window.renderSO();});
 on('soSort','change',function(e){F.sort=e.target.value;window.renderSO();});
 on('soGran','change',function(e){F.gran=e.target.value;var d=g('soDate'),s=g('soStart'),en=g('soEnd'),dh=g('soDash');var isC=(F.gran==='custom'),isS=(F.gran!=='all'&&!isC),t=new Date().toISOString().slice(0,10);if(d)d.hidden=!isS;[s,en,dh].forEach(function(x){if(x)x.hidden=!isC;});if(isS&&d&&!d.value){d.value=t;F.date=t;}if(isC){if(s&&!s.value)s.value=t;if(en&&!en.value)en.value=t;F.start=s?s.value:'';F.end=en?en.value:'';}window.renderSO();});
 on('soDate','change',function(e){F.date=e.target.value;window.renderSO();});on('soStart','change',function(e){F.start=e.target.value;window.renderSO();});on('soEnd','change',function(e){F.end=e.target.value;window.renderSO();});
 on('soAdd','click',function(){openSO(null);});
 on('soSave','click',saveSO);on('soCancel','click',closeSO);on('soClose','click',closeSO);
 var mb=g('soModalbg');if(mb)mb.addEventListener('click',function(e){if(e.target.id==='soModalbg')closeSO();});
 on('soImport','click',openImp);on('soImpFetch','click',impFetch);on('soImpGo','click',impDo);on('soImpClose','click',closeImp);on('soImpCancel','click',closeImp);
 var ib=g('soImpBg');if(ib)ib.addEventListener('click',function(e){if(e.target.id==='soImpBg')closeImp();});
 // table: kebab menu + actions (delegation)
 var T=g('soTable');if(T&&!T._so){T._so=1;T.addEventListener('click',function(e){
  var kb=e.target.closest('[data-somenu]');if(kb){e.stopPropagation();var menu=kb.parentNode.querySelector('.cp-menu');var was=menu&&menu.hidden===false;soCloseMenus();if(menu&&!was){menu.hidden=false;kb.classList.add('open');soPos(kb,menu);}return;}
  var b=e.target.closest('[data-soact]');if(!b)return;soCloseMenus();var act=b.dataset.soact,id=b.dataset.id;if(act==='edit')openSO(id);else if(act==='del')delSO(id);else if(act==='dup')dupSO(id);});}
 if(!window.__soMenuDoc){window.__soMenuDoc=1;document.addEventListener('click',function(e){if(!e.target.closest('#soTable .cp-actions'))soCloseMenus();});window.addEventListener('resize',soCloseMenus);document.addEventListener('scroll',soCloseMenus,true);}
 window.renderSO();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

;
/* js/23-task-export.js */
/* Task Board → export all tasks as a real .xlsx file (pure JS, no deps). */
(function(){
  // ---- minimal UTF-8 + CRC32 + stored-zip (xlsx = zip of XML parts) ----
  function u8(s){
    if(typeof TextEncoder!=='undefined') return new TextEncoder().encode(s);
    var out=[],i,c,c2,cp;
    for(i=0;i<s.length;i++){c=s.charCodeAt(i);
      if(c<0x80)out.push(c);
      else if(c<0x800)out.push(0xC0|c>>6,0x80|c&63);
      else if(c>=0xD800&&c<0xDC00){c2=s.charCodeAt(++i);cp=0x10000+((c&0x3FF)<<10)+(c2&0x3FF);out.push(0xF0|cp>>18,0x80|cp>>12&63,0x80|cp>>6&63,0x80|cp&63);}
      else out.push(0xE0|c>>12,0x80|c>>6&63,0x80|c&63);
    }
    return new Uint8Array(out);
  }
  var _crcT=(function(){var t=[],n,c,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
  function crc32(b){var c=0xFFFFFFFF,i;for(i=0;i<b.length;i++)c=_crcT[(c^b[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function zipStore(files){
    function u16(v){return [v&255,(v>>8)&255];}
    function u32(v){return [v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];}
    var parts=[],central=[],offset=0,i;
    for(i=0;i<files.length;i++){
      var nm=u8(files[i].name),dt=files[i].data,crc=crc32(dt);
      var lh=new Uint8Array([].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(dt.length),u32(dt.length),u16(nm.length),u16(0)));
      parts.push(lh,nm,dt);
      var cd=new Uint8Array([].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(dt.length),u32(dt.length),u16(nm.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset)));
      central.push(cd,nm);
      offset+=lh.length+nm.length+dt.length;
    }
    var cdSize=0,j;for(j=0;j<central.length;j++)cdSize+=central[j].length;
    var eocd=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdSize),u32(offset),u16(0)));
    var all=parts.concat(central,[eocd]),total=0,k;
    for(k=0;k<all.length;k++)total+=all[k].length;
    var out=new Uint8Array(total),p=0;
    for(k=0;k<all.length;k++){out.set(all[k],p);p+=all[k].length;}
    return out;
  }
  function xesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function colRef(n){var s='';n++;while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
  function sheetXml(rows){
    var xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    for(var r=0;r<rows.length;r++){
      xml+='<row r="'+(r+1)+'">';
      for(var c=0;c<rows[r].length;c++){
        xml+='<c r="'+colRef(c)+(r+1)+'" t="inlineStr"><is><t xml:space="preserve">'+xesc(rows[r][c])+'</t></is></c>';
      }
      xml+='</row>';
    }
    return xml+'</sheetData></worksheet>';
  }
  function buildXlsx(rows){
    var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>';
    var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
    var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<sheets><sheet name="Task Board" sheetId="1" r:id="rId1"/></sheets></workbook>';
    var wbr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
    return zipStore([
      {name:'[Content_Types].xml',data:u8(ct)},
      {name:'_rels/.rels',data:u8(rels)},
      {name:'xl/workbook.xml',data:u8(wb)},
      {name:'xl/_rels/workbook.xml.rels',data:u8(wbr)},
      {name:'xl/worksheets/sheet1.xml',data:u8(sheetXml(rows))}
    ]);
  }
  // ---- map tasks → rows ----
  function statusTH(s){try{return (typeof statusLabel!=='undefined'&&statusLabel[s])||s||'';}catch(e){return s||'';}}
  function typesStr(t){
    var a=(t&&t.types)||[];
    if(!a||!a.length)return t&&t.kind?String(t.kind):'';
    return a.map(function(x){
      if(!x)return '';
      return (x.type||'')+(x.owner?(': '+x.owner):'')+(x.detail?(' ('+x.detail+')'):'');
    }).filter(Boolean).join(', ');
  }
  function arrStr(v){
    if(v==null)return '';
    if(v.join)return v.join(', ');
    return String(v);
  }
  function buildRows(list){
    var H=['ID','ชื่องาน','ประเภทการสื่อสาร','Project','สถานะ','ความสำคัญ','ผู้รับผิดชอบหลัก','ผู้ร่วมงาน','ผู้รับผิดชอบรายประเภท','Checker / ผู้ตรวจ','ผู้อนุมัติ / เผยแพร่','กำหนดส่ง (Due)','วันเผยแพร่','วันเสร็จสิ้น','Brief','ช่องทางการสื่อสาร','ผู้รับผิดชอบในการสื่อสาร'];
    var rows=[H];
    list=list||[];
    for(var i=0;i<list.length;i++){
      var t=list[i]||{};
      rows.push([
        t.id,t.title,t.comm,t.project,statusTH(t.status),t.priority,
        t.lead,t.support,typesStr(t),t.checker,t.approver,
        t.due,t.publish,t.completed,t.brief,
        arrStr(t.channels),arrStr(t.commOwner)
      ]);
    }
    return rows;
  }
  function allTasks(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
  function filteredTasks(){
    // the board publishes its current filtered set to window.__wtBoardShown;
    // fall back to all tasks if the board hasn't rendered yet.
    var s=window.__wtBoardShown;
    return (s&&s.length!==undefined)?s:allTasks();
  }
  function download(list,suffix,scopeLabel){
    try{
      var rows=buildRows(list);
      var bytes=buildXlsx(rows);
      var blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      var d=new Date();var pad=function(n){return (n<10?'0':'')+n;};
      var fn='WorkTracker-TaskBoard'+(suffix||'')+'-'+d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.xlsx';
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download=fn;document.body.appendChild(a);a.click();
      setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},300);
      if(typeof notify==='function')notify('Export '+(rows.length-1)+' งาน'+(scopeLabel||'')+' เป็น .xlsx แล้ว');
    }catch(e){
      if(typeof notify==='function')notify('Export ไม่สำเร็จ: '+(e&&e.message||e));
    }
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest)return;
    if(e.target.closest('#wtExportXlsx')){e.preventDefault();download(allTasks(),'','ทั้งหมด');return;}
    if(e.target.closest('#wtExportXlsxFiltered')){e.preventDefault();download(filteredTasks(),'-filtered',' (ที่กรอง)');return;}
  });
})();

;
/* js/24-task-channels.js */
/* Task modal: "ช่องทางการสื่อสาร" multi-select (options from จัดการดรอปดาวน์ → channels). */
(function(){
  window.wtChannelsMS=function(){
    var btn=document.getElementById('fChannelsBtn'),pop=document.getElementById('fChannelsPop'),inp=document.getElementById('fChannels');
    if(!btn||!pop||!inp)return;
    // reuse the shared .ms-pop / .ms-opt styles injected by the supporting multi-select
    if(!window._msCss){window._msCss=1;document.head.insertAdjacentHTML('beforeend','<style>.ms-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#fff;border:1px solid #d7e0ea;border-radius:10px;box-shadow:0 8px 24px #1936291f;padding:6px;min-width:160px;max-height:260px;overflow:auto}.ms-opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap}.ms-opt input[type=checkbox]{width:16px;height:16px;flex:none;padding:0;margin:0;border:0;accent-color:#1766cc;cursor:pointer}.ms-opt:hover{background:#f4f8ff}.ms-btn{cursor:pointer;background:#fff;text-align:left}</style>');}
    function cur(){return (inp.value||'').split(',').map(function(x){return x.trim();}).filter(Boolean);}
    var opts=(window.DDget?window.DDget('channels'):[]);if(!opts)opts=[];
    cur().forEach(function(v){if(opts.indexOf(v)<0)opts.push(v);});
    function label(){var a=cur();btn.textContent=(a.length?(a.length<=2?a.join(', '):a.length+' ช่อง'):'— เลือกช่องทาง —');}
    function build(){var a=cur();pop.innerHTML=opts.length?opts.map(function(ch){return '<label class="ms-opt"><input type="checkbox" value="'+ch+'" '+(a.indexOf(ch)>=0?'checked':'')+'> '+ch+'</label>';}).join(''):'<div class="tiny muted" style="padding:6px">ยังไม่มีช่องทาง — เพิ่มที่หน้าจัดการดรอปดาวน์</div>';
      [].forEach.call(pop.querySelectorAll('input'),function(c){c.onchange=function(){var a=cur();if(c.checked){if(a.indexOf(c.value)<0)a.push(c.value);}else{a=a.filter(function(x){return x!==c.value;});}inp.value=a.join(', ');label();};});}
    btn.onclick=function(e){e.stopPropagation();var willOpen=pop.hidden;document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});pop.hidden=!willOpen;if(willOpen)build();};
    pop.onclick=function(e){e.stopPropagation();};
    if(!window._msDocBound){window._msDocBound=1;document.addEventListener('click',function(){document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});});}
    label();
  };
})();

;
/* js/25-task-commowner.js */
/* Task modal: "ผู้รับผิดชอบในการสื่อสาร" multi-select (options from จัดการดรอปดาวน์ → people). */
(function(){
  window.wtCommOwnerMS=function(){
    var btn=document.getElementById('fCommOwnerBtn'),pop=document.getElementById('fCommOwnerPop'),inp=document.getElementById('fCommOwner');
    if(!btn||!pop||!inp)return;
    // reuse the shared .ms-pop / .ms-opt styles injected by the supporting multi-select
    if(!window._msCss){window._msCss=1;document.head.insertAdjacentHTML('beforeend','<style>.ms-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#fff;border:1px solid #d7e0ea;border-radius:10px;box-shadow:0 8px 24px #1936291f;padding:6px;min-width:160px;max-height:260px;overflow:auto}.ms-opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap}.ms-opt input[type=checkbox]{width:16px;height:16px;flex:none;padding:0;margin:0;border:0;accent-color:#1766cc;cursor:pointer}.ms-opt:hover{background:#f4f8ff}.ms-btn{cursor:pointer;background:#fff;text-align:left}</style>');}
    function cur(){return (inp.value||'').split(',').map(function(x){return x.trim();}).filter(Boolean);}
    var opts=(window.DDget?window.DDget('people'):(typeof people!=='undefined'?people:[]));if(!opts)opts=[];opts=opts.slice();
    cur().forEach(function(v){if(opts.indexOf(v)<0)opts.push(v);});
    function label(){var a=cur();btn.textContent=(a.length?(a.length<=2?a.join(', '):a.length+' คน'):'— เลือกผู้รับผิดชอบ —');}
    function build(){var a=cur();pop.innerHTML=opts.length?opts.map(function(ch){return '<label class="ms-opt"><input type="checkbox" value="'+ch+'" '+(a.indexOf(ch)>=0?'checked':'')+'> '+ch+'</label>';}).join(''):'<div class="tiny muted" style="padding:6px">ยังไม่มีรายชื่อ — เพิ่มที่หน้าจัดการดรอปดาวน์</div>';
      [].forEach.call(pop.querySelectorAll('input'),function(c){c.onchange=function(){var a=cur();if(c.checked){if(a.indexOf(c.value)<0)a.push(c.value);}else{a=a.filter(function(x){return x!==c.value;});}inp.value=a.join(', ');label();};});}
    btn.onclick=function(e){e.stopPropagation();var willOpen=pop.hidden;document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});pop.hidden=!willOpen;if(willOpen)build();};
    pop.onclick=function(e){e.stopPropagation();};
    if(!window._msDocBound){window._msDocBound=1;document.addEventListener('click',function(){document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});});}
    label();
  };
})();

;
/* js/26-access-control.js */
(function(){
  var ACCESS_KEY='worktracker-access-v1';
  // Pages an admin can grant/deny per person (order matches the sidebar).
  var PAGES=[
    ['board','กระดานงาน'],
    ['commplan','Communication Plan'],
    ['specialorder','ออเดอร์พิเศษ'],
    ['teamleave','ปฏิทินวันลาทีม'],
    ['projects','โปรเจกต์และทีม'],
    ['automation','รายงานและวิเคราะห์'],
    ['deptstats','สถิติหน่วยงาน'],
    ['workload','Workload Workspace'],
    ['library','คลังข้อมูล'],
    ['masterdata','จัดการดรอปดาวน์']
  ];
  var PIDS={}; PAGES.forEach(function(p){PIDS[p[0]]=1;});
  // 'permissions' page is where this editor lives -> always admin-only.
  // 'dashboard' and anything unknown -> always allowed.

  function esc(s){return String(s==null?'':s).replace(/[&<>"\x27]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\x27':'&#39;'}[c];});}
  function curUser(){return window.__WT_USER__||{};}
  function isAdmin(u){u=u||curUser();return /manager|admin|ผู้ดูแล|ผู้จัดการ|หัวหน้า/i.test(String(u&&u.role||''));}
  function emailKey(u){return String((u&&u.email)||'').trim().toLowerCase();}
  function nameKey(u){return String((u&&u.name)||'').trim().toLowerCase();}

  // Default page policy per role. Unknown/blank roles -> allow all (never lock out by surprise).
  function rolePreset(role){
    var r=String(role||'').toLowerCase();
    var all={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:1,workload:1,library:1,masterdata:1};
    var creator={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:0,deptstats:0,workload:0,library:0,masterdata:0};
    var checker={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:0,workload:1,library:0,masterdata:0};
    var approver={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:1,workload:1,library:0,masterdata:0};
    if(/approver|อนุมัติ/.test(r))return approver;
    if(/checker|ตรวจ|qa|quality|คุณภาพ/.test(r))return checker;
    if(/creator|สร้าง|ครีเอ|designer|editor|คอนเทนต์|content/.test(r))return creator;
    return all; // manager/admin bypass elsewhere; unrecognized roles stay open
  }

  function accessMap(){try{return JSON.parse(localStorage.getItem(ACCESS_KEY)||'{}')||{};}catch(e){return {};}}
  function saveAccessMap(m){try{localStorage.setItem(ACCESS_KEY,JSON.stringify(m));}catch(e){}}

  // Find a user's access record: by email first, then fall back to name
  // (so sessions issued before email was added to the token still match).
  function recFor(u){
    var m=accessMap(),ek=emailKey(u);
    if(ek&&m[ek])return m[ek];
    var nk=nameKey(u);
    if(nk){for(var k in m){if(m[k]&&String(m[k]._name||'').trim().toLowerCase()===nk)return m[k];}}
    return null;
  }

  // Is page `pid` visible to user `u`?
  function allowed(pid,u){
    u=u||curUser();
    if(pid==='permissions')return isAdmin(u);
    if(isAdmin(u))return true;          // admins/managers always see everything
    if(!PIDS[pid])return true;          // dashboard + anything not gated
    var rec=recFor(u);
    if(!rec)return true;                // no record set = default allow
    return rec[pid]!==false;
  }
  window.wtPageAllowed=allowed;

  function firstAllowed(){
    for(var i=0;i<PAGES.length;i++){if(allowed(PAGES[i][0]))return PAGES[i][0];}
    return 'dashboard';
  }

  // Hide nav buttons for pages this user may not see.
  function applyNavGate(){
    var u=curUser();
    document.querySelectorAll('.nav[data-page]').forEach(function(b){
      var pid=b.dataset.page;
      b.style.display=allowed(pid,u)?'':'none';
    });
    var act=document.querySelector('.page.active');
    if(act&&!allowed(act.id,u)){var f=firstAllowed();if(window.navigate)window.navigate(f);}
  }
  window.wtApplyNavGate=applyNavGate;

  // Guard programmatic navigation too (reassigns the global navigate binding).
  if(typeof window.navigate==='function'&&!window.__navGuarded){
    var _nav=window.navigate;
    window.navigate=function(page){
      if(!allowed(page)){if(window.notify)notify('ไม่มีสิทธิ์เข้าถึงหน้านี้');page=firstAllowed();}
      return _nav(page);
    };
    window.__navGuarded=1;
  }

  // ---- Admin editor (rendered inside the สิทธิ์ทีม page) ----
  function renderEditor(){
    var host=document.getElementById('permissions');
    if(!host||!isAdmin())return;
    var box=document.getElementById('wtAccessBox');
    if(!box){
      box=document.createElement('div');
      box.id='wtAccessBox';
      box.className='card';
      box.style.marginTop='18px';
      host.appendChild(box);
    }
    box.innerHTML='<div style="font-weight:600;font-size:15px">กำหนดสิทธิ์การเข้าถึงรายหน้า (รายคน)</div>'+
      '<div class="tiny" style="color:#7a889c;margin:4px 0 10px">ติ๊ก = เห็นเมนูนั้น · เอาออก = ซ่อนเมนูนั้นสำหรับผู้ใช้คนนั้น · แอดมิน/ผู้จัดการเห็นทุกหน้าเสมอ · มีผลเต็มที่เมื่อผู้ใช้โหลดหน้าใหม่/ล็อกอินใหม่</div>'+
      '<div id="wtAccRows" class="tiny" style="color:#7a889c">กำลังโหลดรายชื่อ...</div>';
    fetch('/api/users').then(function(r){return r.json();}).then(function(d){
      var users=(d&&d.users)||[];
      var m=accessMap();
      var th='<th style="position:sticky;left:0;background:#fff;text-align:left;min-width:150px">ผู้ใช้</th>'+
        PAGES.map(function(p){return '<th style="writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;height:120px;padding:4px 2px;font-weight:500">'+esc(p[1])+'</th>';}).join('');
      var rows=users.map(function(u){
        var adm=isAdmin(u);
        var ek=emailKey(u);
        var rec=(ek&&m[ek])||null;
        var cells=PAGES.map(function(p){
          var pid=p[0];
          var on=adm?true:(!rec||rec[pid]!==false);
          return '<td style="text-align:center"><input type="checkbox" class="wtAcc" data-email="'+esc(ek)+'" data-name="'+esc(u.name||'')+'" data-page="'+pid+'" '+(on?'checked':'')+(adm?' disabled':'')+'></td>';
        }).join('');
        var who='<div style="font-weight:500">'+esc(u.name||'—')+(adm?' <span class="pill" style="background:#eaf1fb;color:#1766cc">แอดมิน · เห็นทุกหน้า</span>':'')+'</div><div class="tiny" style="color:#9aa7b8">'+esc(u.email||'—')+(u.role?' · '+esc(u.role):'')+'</div>';
        return '<tr data-row-email="'+esc(ek)+'" data-role="'+esc(u.role||'')+'"><td style="position:sticky;left:0;background:#fff;text-align:left">'+who+'</td>'+cells+'</tr>';
      }).join('');
      if(!users.length)rows='<tr><td colspan="'+(PAGES.length+1)+'" class="empty">ยังไม่มีข้อมูลผู้ใช้</td></tr>';
      document.getElementById('wtAccRows').innerHTML=
        '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap"><button type="button" id="wtAccPreset" class="primary tiny">ใช้ค่าเริ่มต้นตามบทบาท</button><button type="button" id="wtAccAll" class="ghost tiny">เปิดทุกหน้าทุกคน</button><button type="button" id="wtAccNone" class="ghost tiny">ซ่อนทุกหน้าทุกคน</button><button type="button" id="wtAccSave" class="primary tiny" style="margin-left:auto">บันทึกสิทธิ์</button></div>'+
        '<div class="tiny" style="color:#9aa7b8;margin:-2px 0 8px">กด “ใช้ค่าเริ่มต้นตามบทบาท” เพื่อเติมค่าตามนโยบาย แล้วปรับรายคนได้ จากนั้นกด “บันทึกสิทธิ์”</div>'+
        '<div style="overflow:auto;border:1px solid #e3ebf4;border-radius:10px"><table class="table" style="margin:0"><thead><tr>'+th+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
      var allBtn=document.getElementById('wtAccAll'),noneBtn=document.getElementById('wtAccNone'),saveBtn=document.getElementById('wtAccSave'),presetBtn=document.getElementById('wtAccPreset');
      function setAll(v){document.querySelectorAll('#wtAccRows input.wtAcc:not([disabled])').forEach(function(c){c.checked=v;});}
      if(allBtn)allBtn.onclick=function(){setAll(true);};
      if(noneBtn)noneBtn.onclick=function(){setAll(false);};
      if(presetBtn)presetBtn.onclick=function(){
        document.querySelectorAll('#wtAccRows tr[data-row-email]').forEach(function(tr){
          var boxes=tr.querySelectorAll('input.wtAcc');
          if(!boxes.length||boxes[0].disabled)return; // skip admin rows
          var preset=rolePreset(tr.dataset.role||'');
          boxes.forEach(function(c){c.checked=preset[c.dataset.page]!==false;});
        });
        if(window.notify)notify('เติมค่าเริ่มต้นตามบทบาทแล้ว · ตรวจแล้วกด “บันทึกสิทธิ์”');
      };
      if(saveBtn)saveBtn.onclick=function(){
        var map=accessMap();
        // rebuild records for every non-admin user shown
        document.querySelectorAll('#wtAccRows tr[data-row-email]').forEach(function(tr){
          var boxes=tr.querySelectorAll('input.wtAcc');
          if(!boxes.length||boxes[0].disabled)return; // skip admin rows
          var ek=boxes[0].dataset.email;if(!ek)return;
          var nm=boxes[0].dataset.name||'';
          var entry={_name:nm};
          boxes.forEach(function(c){entry[c.dataset.page]=!!c.checked;});
          map[ek]=entry;
        });
        saveAccessMap(map);
        if(window.notify)notify('บันทึกสิทธิ์การเข้าถึงแล้ว');
        applyNavGate();
      };
    }).catch(function(){var el=document.getElementById('wtAccRows');if(el)el.textContent='โหลดรายชื่อไม่สำเร็จ';});
  }

  function boot(){
    applyNavGate();
    if(isAdmin()){
      renderEditor();
      document.querySelectorAll('.nav[data-page="permissions"]').forEach(function(b){b.addEventListener('click',renderEditor);});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

