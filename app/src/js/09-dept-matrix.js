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