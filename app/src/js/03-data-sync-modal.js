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