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
