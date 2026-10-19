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
