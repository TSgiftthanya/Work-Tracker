(function(){
// ===== Communication Manager · report skill =====
function E(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function pct(n,d){return d?Math.round(100*n/d):0;}
function iso0(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function num(x){var n=parseFloat(x);return isNaN(n)?0:n;}
var SL=(typeof statusLabel!=='undefined')?statusLabel:{};
function slab(s){return SL[s]||s;}
var WT=(typeof weights!=='undefined')?weights:{Copy:1,Infographic:2,Presentation:2,Video:4,Video:4,Event:5};

function gather(){
 var T=(typeof tasks!=='undefined'&&tasks)?tasks:[];
 var R=(typeof records!=='undefined'&&records)?records:[];
 var CP=(window.CPall?window.CPall():[])||[];
 var LV=(window.LVall?window.LVall():[])||[];
 var PPL=((window.DDget?window.DDget('people'):null)||(typeof people!=='undefined'?people:[])||[]);
 var today=iso0(),ym=today.slice(0,7),yr=today.slice(0,4);
 // ---- tasks overview ----
 var byStatus={};T.forEach(function(t){byStatus[t.status]=(byStatus[t.status]||0)+1;});
 var done=T.filter(function(t){return t.status==='Completed';}).length;
 var pub=T.filter(function(t){return t.status==='Ready to Publish'||t.status==='Completed';}).length;
 var active=T.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold';}).length;
 var overdue=T.filter(function(t){return t.status!=='Completed'&&t.status!=='On Hold'&&t.due&&t.due<today;});
 // ---- media mix ----
 var mt={'บันทึก':0,'Infographic':0,'VDO':0};
 T.forEach(function(t){if(t.types&&t.types.length){var seen={};t.types.forEach(function(x){if(x&&x.type&&mt[x.type]!=null&&!seen[x.type]){seen[x.type]=1;mt[x.type]++;}});}else{var k={Copy:'บันทึก',Infographic:'Infographic',Video:'VDO'}[t.kind];if(k)mt[k]++;}});
 // ---- channels (records) ----
 var chMap={};R.forEach(function(r){var c=r.channel||'(ไม่ระบุ)';var o=chMap[c]||(chMap[c]={n:0,aud:0,rd:0});o.n++;o.aud+=num(r.audience);o.rd+=num(r.readers);});
 var chans=Object.keys(chMap).map(function(c){var o=chMap[c];return {c:c,n:o.n,aud:o.aud,rd:o.rd,rate:pct(o.rd,o.aud)};});
 var chWith=chans.filter(function(x){return x.aud>0;});
 chWith.sort(function(a,b){return b.rate-a.rate;});
 var best=chWith[0],worst=chWith[chWith.length-1];
 var totAud=0,totRd=0;R.forEach(function(r){totAud+=num(r.audience);totRd+=num(r.readers);});
 var overallRate=pct(totRd,totAud);
 // ---- team workload ----
 var team=PPL.map(function(p){
  var openLead=T.filter(function(t){return t.lead===p&&t.status!=='Completed'&&t.status!=='On Hold';});
  var load=openLead.reduce(function(s,t){return s+(WT[t.kind]||1);},0);
  var owns=T.filter(function(t){return t.types&&t.types.some(function(x){return x&&x.owner===p;});}).length;
  var chk=T.filter(function(t){return t.checker===p;}).length;
  return {p:p,open:openLead.length,load:load,owns:owns,chk:chk};
 });
 var CAP=12;
 var over=team.filter(function(x){return x.load>CAP;});
 var idle=team.filter(function(x){return x.open===0;});
 team.sort(function(a,b){return b.load-a.load;});
 // ---- communication plan ----
 var cpByStatus={};CP.forEach(function(r){cpByStatus[r.status]=(cpByStatus[r.status]||0)+1;});
 var cpCh={line:0,tophit:0,banner:0,sms:0};CP.forEach(function(r){if(r.ch){['line','tophit','banner','sms'].forEach(function(k){if(r.ch[k])cpCh[k]++;});}});
 var cpLinked=CP.filter(function(r){return r.taskId&&(typeof tasks!=='undefined'&&tasks.find(function(t){return t.id===r.taskId;}));}).length;
 var cpNoTask=CP.length-cpLinked;
 // ---- leave ----
 var lvPending=LV.filter(function(r){return r.status==='Pending';}).length;
 var lvToday=LV.filter(function(r){return (r.status==='Pending'||r.status==='Approved')&&r.start<=today&&(r.end||r.start)>=today;});
 var lvTodayNames=Object.keys(lvToday.reduce(function(a,r){a[r.emp]=1;return a;},{}));
 var lvConflict=LV.filter(function(r){return (r.status==='Pending'||r.status==='Approved')&&r.conflict;}).length;
 return {today:today,ym:ym,yr:yr,T:T,R:R,CP:CP,LV:LV,PPL:PPL,byStatus:byStatus,done:done,pub:pub,active:active,overdue:overdue,mt:mt,chans:chans,best:best,worst:worst,overallRate:overallRate,totAud:totAud,totRd:totRd,team:team,over:over,idle:idle,CAP:CAP,cpByStatus:cpByStatus,cpCh:cpCh,cpLinked:cpLinked,cpNoTask:cpNoTask,lvPending:lvPending,lvTodayNames:lvTodayNames,lvConflict:lvConflict};
}

function insights(d){
 var out=[];
 if(d.chans.length){
  if(d.best)out.push({t:'ok',m:'ช่องทางอ่านดีที่สุด: <b>'+E(d.best.c)+'</b> ('+d.best.rate+'%)'});
  if(d.worst&&d.worst!==d.best)out.push({t:(d.worst.rate<40?'warn':'info'),m:'ช่องทางที่ควรปรับปรุง: <b>'+E(d.worst.c)+'</b> ('+d.worst.rate+'%)'+(d.worst.rate<40?' — อัตราอ่านต่ำกว่า 40%':'')});
  out.push({t:(d.overallRate>=60?'ok':d.overallRate>=40?'info':'warn'),m:'อัตราการอ่านรวมทุกช่องทาง <b>'+d.overallRate+'%</b> ('+d.totRd.toLocaleString()+'/'+d.totAud.toLocaleString()+')'});
 }
 if(d.overdue.length)out.push({t:'warn',m:'มีงานเกินกำหนด <b>'+d.overdue.length+'</b> รายการ — ควรเร่งติดตาม'});
 if(d.over.length)out.push({t:'warn',m:'สมาชิกภาระงานสูงเกิน '+d.CAP+': <b>'+d.over.map(function(x){return E(x.p)+' ('+x.load+')';}).join(', ')+'</b>'});
 if(d.idle.length)out.push({t:'info',m:'สมาชิกที่ยังไม่มีงานเปิดอยู่: <b>'+d.idle.map(function(x){return E(x.p);}).join(', ')+'</b> — พิจารณากระจายงาน'});
 var topType=Object.keys(d.mt).sort(function(a,b){return d.mt[b]-d.mt[a];})[0];
 if(topType&&d.mt[topType])out.push({t:'info',m:'ประเภทสื่อที่ผลิตมากสุด: <b>'+E(topType)+'</b> ('+d.mt[topType]+' งาน)'});
 if(d.cpNoTask)out.push({t:'info',m:'Communication Plan ที่ยังไม่สร้าง Task: <b>'+d.cpNoTask+'</b> รายการ'});
 if(d.lvPending)out.push({t:'warn',m:'คำขอลารออนุมัติ <b>'+d.lvPending+'</b> รายการ'+(d.lvConflict?(' · มี Conflict '+d.lvConflict):'')});
 if(d.lvTodayNames.length)out.push({t:'info',m:'วันนี้มีลา <b>'+d.lvTodayNames.length+'</b> คน: '+d.lvTodayNames.map(E).join(', ')});
 if(!out.length)out.push({t:'ok',m:'ภาพรวมอยู่ในเกณฑ์ปกติ'});
 return out;
}

function buildHTML(d){
 var ic={ok:'✅',warn:'⚠️',info:'ℹ️'};
 var H='';
 H+='<div class="cm-meta tiny muted">สร้างโดย Communication Manager · '+E(d.today)+' · ผู้จัดทำ: '+E((window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้')+'</div>';
 // Insights first (executive summary)
 H+='<div class="cm-sec"><h3>บทวิเคราะห์ &amp; ข้อเสนอแนะ</h3>'+insights(d).map(function(x){return '<div class="cm-ins cm-'+x.t+'">'+ic[x.t]+' '+x.m+'</div>';}).join('')+'</div>';
 // KPI chips
 H+='<div class="cm-sec"><h3>ภาพรวมงาน</h3><div class="cm-kpis">'
  +kpi(d.T.length,'งานทั้งหมด')+kpi(d.active,'กำลังดำเนินการ')+kpi(d.done,'เสร็จสิ้น')+kpi(d.pub,'พร้อม/เผยแพร่')+kpi(d.overdue.length,'เกินกำหนด')+'</div>';
 // status table
 H+='<table class="table cm-t"><thead><tr><th>สถานะงาน</th><th>จำนวน</th></tr></thead><tbody>'
  +Object.keys(d.byStatus).map(function(s){return '<tr><td>'+E(slab(s))+'</td><td style="text-align:center">'+d.byStatus[s]+'</td></tr>';}).join('')+'</tbody></table></div>';
 // media mix
 H+='<div class="cm-sec"><h3>ประเภทสื่อ (จากงาน)</h3><div class="cm-kpis">'+kpi(d.mt['บันทึก'],'บันทึก')+kpi(d.mt['Infographic'],'Infographic')+kpi(d.mt['VDO'],'VDO')+'</div></div>';
 // channels
 if(d.chans.length){H+='<div class="cm-sec"><h3>ผลการสื่อสารตามช่องทาง</h3><table class="table cm-t"><thead><tr><th>ช่องทาง</th><th>จำนวนสื่อ</th><th>ผู้อ่าน/กลุ่มเป้าหมาย</th><th>อัตราอ่าน</th></tr></thead><tbody>'
  +d.chans.map(function(c){return '<tr><td>'+E(c.c)+'</td><td style="text-align:center">'+c.n+'</td><td style="text-align:center">'+c.rd.toLocaleString()+' / '+c.aud.toLocaleString()+'</td><td style="text-align:center"><b>'+(c.aud?c.rate+'%':'—')+'</b></td></tr>';}).join('')
  +'<tr><td><b>รวม</b></td><td style="text-align:center"><b>'+d.R.length+'</b></td><td style="text-align:center"><b>'+d.totRd.toLocaleString()+' / '+d.totAud.toLocaleString()+'</b></td><td style="text-align:center"><b>'+d.overallRate+'%</b></td></tr></tbody></table></div>';}
 // team
 H+='<div class="cm-sec"><h3>ภาระงานทีม</h3><table class="table cm-t"><thead><tr><th>สมาชิก</th><th>งานเปิดอยู่</th><th>รับผิดชอบสื่อ</th><th>Checker</th><th>Workload/'+d.CAP+'</th></tr></thead><tbody>'
  +d.team.map(function(x){return '<tr><td>'+E(x.p)+'</td><td style="text-align:center">'+x.open+'</td><td style="text-align:center">'+x.owns+'</td><td style="text-align:center">'+x.chk+'</td><td style="text-align:center"><b style="color:'+(x.load>d.CAP?'#c0392b':'#2e7d4f')+'">'+x.load+'</b></td></tr>';}).join('')+'</tbody></table></div>';
 // communication plan
 H+='<div class="cm-sec"><h3>Communication Plan</h3><div class="cm-kpis">'+kpi(d.CP.length,'ทั้งหมด')+kpi(d.cpCh.line,'LINE')+kpi(d.cpCh.tophit,'TOP HIT')+kpi(d.cpCh.banner,'Banner')+kpi(d.cpCh.sms,'SMS')+kpi(d.cpLinked,'มี Task')+'</div>'
  +'<table class="table cm-t"><thead><tr><th>สถานะ</th><th>จำนวน</th></tr></thead><tbody>'+Object.keys(d.cpByStatus).map(function(s){return '<tr><td>'+E(slab(s))+'</td><td style="text-align:center">'+d.cpByStatus[s]+'</td></tr>';}).join('')+'</tbody></table></div>';
 // leave
 H+='<div class="cm-sec"><h3>วันลาทีม</h3><div class="cm-kpis">'+kpi(d.lvPending,'รออนุมัติ')+kpi(d.lvTodayNames.length,'ลาวันนี้')+kpi(d.lvConflict,'Conflict')+'</div></div>';
 return H;
}
function kpi(v,l){return '<div class="cm-kpi"><b>'+v+'</b><span>'+E(l)+'</span></div>';}

window.cmReport=function(){
 var d=gather();var host=document.getElementById('cmReportBody');if(!host)return;
 window.__cmData=d;host.innerHTML=buildHTML(d);host._plain=host.innerText;
 document.getElementById('cmReportModal').classList.add('open');
};
function dl(){var host=document.getElementById('cmReportBody');var doc='<!doctype html><html lang="th"><head><meta charset="utf-8"><title>Communication Manager Report</title><style>body{font-family:system-ui,"Noto Sans Thai",sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:#1f2a37}h2{margin:0 0 4px}h3{margin:20px 0 8px;border-bottom:2px solid #1766cc;padding-bottom:4px}table{border-collapse:collapse;width:100%;margin:6px 0}th,td{border:1px solid #e2e8f0;padding:6px 10px;font-size:13px;text-align:left}th{background:#f3f6fb}.cm-ins{padding:6px 10px;border-radius:8px;margin:4px 0;background:#f6f9ff}.cm-kpis{display:flex;gap:10px;flex-wrap:wrap}.cm-kpi{border:1px solid #e2ebf6;border-radius:10px;padding:8px 14px;min-width:90px}.cm-kpi b{display:block;font-size:20px}.cm-kpi span{font-size:11px;color:#64748b}</style></head><body><h2>สรุปรายงาน &amp; วิเคราะห์ภาพรวม</h2>'+host.innerHTML+'</body></html>';
 var blob=new Blob([doc],{type:'text/html;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='communication-report-'+iso0()+'.html';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);if(typeof notify==='function')notify('ดาวน์โหลดรายงานแล้ว');}
function _unesc(s){return String(s).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}function buildText(d){var L=[];L.push('\ud83d\udccb สรุปรายงานการสื่อสาร \u00b7 '+d.today);L.push('');L.push('\ud83d\udcca ภาพรวมงาน: ทั้งหมด '+d.T.length+' | กำลังดำเนินการ '+d.active+' | เสร็จสิ้น '+d.done+' | พร้อม/เผยแพร่ '+d.pub+' | เกินกำหนด '+d.overdue.length);L.push('\ud83c\udfac ประเภทสื่อ: บันทึก '+d.mt['บันทึก']+' \u00b7 Infographic '+d.mt['Infographic']+' \u00b7 VDO '+d.mt['VDO']);if(d.chans.length){var ch=d.chans.slice().sort(function(a,b){return b.rate-a.rate;}).map(function(c){return _unesc(c.c)+' '+(c.aud?c.rate+'%':'\u2014');}).join(' \u00b7 ');L.push('\ud83d\udce1 ช่องทาง (อ่านรวม '+d.overallRate+'%): '+ch);}L.push('\ud83d\udc65 Workload ทีม: '+d.team.slice(0,8).map(function(x){return _unesc(x.p)+' '+x.load;}).join(', ')+(d.over.length?(' | ล้น: '+d.over.map(function(x){return _unesc(x.p);}).join(', ')):'')+(d.idle.length?(' | ว่าง: '+d.idle.map(function(x){return _unesc(x.p);}).join(', ')):''));L.push('\ud83d\uddc2\ufe0f Communication Plan: '+d.CP.length+' รายการ | LINE '+d.cpCh.line+' \u00b7 TOP HIT '+d.cpCh.tophit+' \u00b7 Banner '+d.cpCh.banner+' \u00b7 SMS '+d.cpCh.sms+' | มี Task '+d.cpLinked);L.push('\ud83c\udf34 วันลาทีม: รออนุมัติ '+d.lvPending+' \u00b7 ลาวันนี้ '+d.lvTodayNames.length+(d.lvConflict?(' \u00b7 Conflict '+d.lvConflict):''));L.push('');L.push('\ud83d\udd0e ข้อเสนอแนะ:');insights(d).forEach(function(x){L.push('\u2022 '+_unesc(x.m));});L.push('');L.push('(สร้างโดย Communication Manager \u00b7 Work Tracker)');return L.join('\n');}function cpy(){var txt=buildText(window.__cmData||gather());if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){if(typeof notify==='function')notify('คัดลอกรายงานแล้ว');});}else{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);if(typeof notify==='function')notify('คัดลอกรายงานแล้ว');}}
function init(){
 var b=document.getElementById('cmReportBtn');if(b)b.onclick=window.cmReport;
 var c=document.getElementById('cmReportClose');if(c)c.onclick=function(){document.getElementById('cmReportModal').classList.remove('open');};
 var mb=document.getElementById('cmReportModal');if(mb)mb.addEventListener('click',function(e){if(e.target.id==='cmReportModal')mb.classList.remove('open');});
 var dlb=document.getElementById('cmReportDl');if(dlb)dlb.onclick=dl;
 var cb=document.getElementById('cmReportCopy');if(cb)cb.onclick=cpy;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();