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