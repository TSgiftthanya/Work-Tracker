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