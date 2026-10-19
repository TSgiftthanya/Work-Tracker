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
// intercept the edit button before the card's openProject click fires
document.addEventListener("click",function(e){
  var b=e.target.closest(".projedit");
  if(b){e.stopPropagation();e.preventDefault();openEdit(b.getAttribute("data-proj"),b.getAttribute("data-comm"),b.getAttribute("data-name"));}
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