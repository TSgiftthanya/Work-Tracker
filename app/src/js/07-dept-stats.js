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