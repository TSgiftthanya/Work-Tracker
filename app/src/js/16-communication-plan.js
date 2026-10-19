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