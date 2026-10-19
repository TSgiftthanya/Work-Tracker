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