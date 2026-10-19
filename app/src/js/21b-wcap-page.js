(function(){
// Workload & Capacity & KPI Workspace — UI (uses window.WCAP engine; SSOT = tasks/people/leave/DDget)
var WKEY='worktracker-wcap-v1', HKEY='worktracker-wcap-history-v1', AKEY='worktracker-wcap-audit-v1', PKEY='worktracker-wcap-perf-v1', OKEY='worktracker-wcap-own-v1';
function E(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function g(id){return document.getElementById(id);}
function jload(k,df){try{var s=JSON.parse(localStorage.getItem(k)||'null');return s==null?df:s;}catch(e){return df;}}
function jsave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function W(){return window.WCAP;}
function getS(){return W().settings(jload(WKEY,null));}
function saveUser(u){jsave(WKEY,u);}
function PEOPLE(){return ((window.DDget?window.DDget('people'):null)||(typeof people!=='undefined'?people:[])||[]);}
function TASKS(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
function LEAVE(){return jload('worktracker-leave-v1',[])||[];}
function LSET(){return jload('worktracker-leave-settings-v1',{weekendOff:true,holidays:[]});}
function PERF(){return jload(PKEY,{})||{};}
function OWNS(){return jload(OKEY,{})||{};}
function ownMap(ym){var o=OWNS(),m={};for(var k in o){var i=k.lastIndexOf('|');if(i>0&&k.slice(i+1)===ym&&o[k]&&o[k].score!=null)m[k.slice(0,i)]=+o[k].score;}return m;}
function decorate(list){var pf=PERF();return list.map(function(t){var p=pf[t.id];if(!p)return t;var c=Object.assign({},t);if(p.actualHours!=null)c.actualHours=p.actualHours;if(p.revisions!=null)c.revisions=p.revisions;return c;});}
function ME(){return (window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้';}
function audit(action,detail){var a=jload(AKEY,[]);if(!Array.isArray(a))a=[];a.unshift({at:new Date().toISOString(),by:ME(),action:action,detail:detail||''});jsave(AKEY,a.slice(0,300));}

var ST={tab:'overview',months:[],member:'',media:'',status:'',mmode:'points',drill:null,capView:'month'};
var MEDIA=['บันทึก','Infographic','VDO'];
var STATUS_LABELS=(typeof statusLabel!=='undefined')?statusLabel:{};

function monthsList(){var set={};TASKS().forEach(function(t){[t.due,t.publish].forEach(function(d){if(d&&/^\d{4}-\d{2}/.test(d))set[d.slice(0,7)]=1;});});var cur=new Date().toISOString().slice(0,7);set[cur]=1;return Object.keys(set).sort().reverse();}
function selMonths(){return (ST.months||[]).filter(Boolean).slice().sort();}
function curYM(){var s=selMonths();return s.length?s[s.length-1]:new Date().toISOString().slice(0,7);}
function inMonth(t){var s=selMonths();if(!s.length)return true;return s.some(function(m){return (t.due&&t.due.slice(0,7)===m)||(t.publish&&t.publish.slice(0,7)===m);});}
function hasMedia(t){if(!ST.media)return true;var u=W().taskUnits(t);return u.some(function(x){return x.media===ST.media;});}
function scope(){return decorate(TASKS().filter(function(t){if(t.status==='Cancelled')return false;if(!inMonth(t))return false;if(ST.status&&t.status!==ST.status)return false;if(!hasMedia(t))return false;return true;}));}
function allScoped(){return decorate(TASKS().filter(function(t){if(t.status==='Cancelled')return false;if(ST.status&&t.status!==ST.status)return false;if(!hasMedia(t))return false;return true;}));}
function recentMonths(n){var d=new Date(curYM()+'-01T00:00:00'),out=[];for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2));}return out;}
function teamData(){var s=selMonths();return W().team(scope(),PEOPLE(),getS(),LEAVE(),(s.length?s:curYM()),LSET(),ownMap(curYM()));}
function rowsShown(T){return T.rows.filter(function(r){return !ST.member||r.member===ST.member;});}

// media unit COUNT per member (for matrix count mode)
function countMatrix(tasks){var acc={};function ens(p){return acc[p]||(acc[p]={'บันทึก':0,'Infographic':0,'VDO':0,checker:0,approval:0,total:0});}
 tasks.forEach(function(t){var units=W().taskUnits(t),ms={};units.forEach(function(u){ms[u.media]=1;if(u.owner){var a=ens(u.owner);if(a[u.media]!=null)a[u.media]++;a.total++;}});if(t.checker){var a=ens(t.checker);var n=Object.keys(ms).length||1;a.checker+=n;a.total+=n;}if(t.approver){var b=ens(t.approver);b.approval++;b.total++;}});return acc;}

function kpi(v,l,sub){return '<div class="wc-kpi"><div class="wl">'+E(l)+'</div><div class="wv">'+v+'</div>'+(sub?'<div class="ws">'+E(sub)+'</div>':'')+'</div>';}
function NA(x){return x==null?'<span class="wc-na">N/A</span>':x;}
function statusPill(s){var m={Available:'wc-ok',Balanced:'wc-bl',"High Load":'wc-hi',Overload:'wc-ov','N/A':'wc-na2'}[s]||'wc-na2';return '<span class="pill '+m+'">'+E(s)+'</span>';}
function bar(u){if(u==null)return '<span class="wc-na">N/A</span>';var c=u>100?'#c0392b':u>90?'#e08a2b':u>=70?'#1766cc':'#2e7d4f';return '<div class="wc-prog"><div style="width:'+Math.min(100,u)+'%;background:'+c+'"></div></div> <span class="wc-pu">'+u+'%</span>';}

// monthly trend mini-chart (workload bars + util%/KPI lines), inline SVG
function trendChart(tr){var VW=560,H=150,padL=34,padR=12,padT=16,padB=26,n=tr.length;if(!n)return '<div class="wc-sub">ยังไม่มีข้อมูล</div>';
 var maxW=Math.max(1,Math.max.apply(null,tr.map(function(x){return x.workload||0;})));
 var span=(VW-padL-padR), gap=span/n, bw=gap*0.5;
 var cx=function(i){return padL+gap*i+gap/2;};
 var yW=function(v){return (H-padB)-(H-padT-padB)*(v||0)/maxW;};
 var yP=function(p){return (H-padB)-(H-padT-padB)*Math.min(100,(p||0))/100;};
 var bars=tr.map(function(x,i){var by=yW(x.workload),hh=(H-padB)-by;return '<rect x="'+(cx(i)-bw/2).toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,hh).toFixed(1)+'" rx="3" fill="#cfe0f7"></rect><text x="'+cx(i).toFixed(1)+'" y="'+(by-4).toFixed(1)+'" text-anchor="middle" font-size="9.5" fill="#64748b">'+(x.workload||0)+'</text><text x="'+cx(i).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-size="10" fill="#64748b">'+x.ym.slice(2)+'</text>';}).join('');
 function line(key,color,acc){var pts=[],dots='';tr.forEach(function(x,i){var v=x[key];if(v==null)return;var X=cx(i),Y=acc(v);pts.push(X.toFixed(1)+','+Y.toFixed(1));dots+='<circle cx="'+X.toFixed(1)+'" cy="'+Y.toFixed(1)+'" r="3" fill="'+color+'"></circle>';});return (pts.length>1?'<polyline fill="none" stroke="'+color+'" stroke-width="2" points="'+pts.join(' ')+'"></polyline>':'')+dots;}
 return '<svg viewBox="0 0 '+VW+' '+H+'" width="100%" height="'+H+'" role="img" aria-label="trend">'
  +'<line x1="'+padL+'" y1="'+(H-padB)+'" x2="'+(VW-padR)+'" y2="'+(H-padB)+'" stroke="#e2e8f0"></line>'
  +bars+line('utilization','#e08a2b',yP)+line('kpi','#2e7d4f',yP)+'</svg>'
  +'<div class="wc-legend"><span style="color:#8fb4e8">▇ Workload (pts)</span> · <span style="color:#e08a2b">● Utilization %</span> · <span style="color:#2e7d4f">● KPI</span></div>';
}
// media-type palette + category list (shared by donut/legend/compare)
var MBPAL={'บันทึก':'#1766cc','Infographic':'#4b90e2','VDO':'#8e5bd0','checker':'#e08a2b','approval':'#2e7d4f'};
var MBCATS=[['บันทึก','บันทึก'],['Infographic','Infographic'],['VDO','VDO'],['ตรวจ/อนุมัติสื่อ','checker'],['อื่นๆ (เผยแพร่)','approval']];
function mbTotal(m){return MBCATS.reduce(function(s,c){return s+(m[c[1]]||0);},0);}
function prevYM(ym){var d=new Date(ym+'-01T00:00:00'),x=new Date(d.getFullYear(),d.getMonth()-1,1);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2);}
function mbForYM(ym){var list=allScoped().filter(function(t){return (t.due&&t.due.slice(0,7)===ym)||(t.publish&&t.publish.slice(0,7)===ym);});return W().mediaBreakdown(list,getS());}
// SVG donut: parts=[{val,color}]
function donut(parts,tot){var r=52,cx=70,cy=70,C=2*Math.PI*r,off=0;
 var segs=parts.filter(function(p){return p.val>0;}).map(function(p){var dash=C*(p.val/(tot||1));var s='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+p.color+'" stroke-width="17" stroke-dasharray="'+dash.toFixed(2)+' '+(C-dash).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>';off+=dash;return s;}).join('');
 if(!segs)segs='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#eef2f7" stroke-width="17"></circle>';
 return '<svg viewBox="0 0 140 140" width="172" height="172" role="img" aria-label="media donut">'+segs+'<text x="70" y="66" text-anchor="middle" font-size="19" font-weight="700" fill="#13233a">'+W().round1(tot)+'</text><text x="70" y="84" text-anchor="middle" font-size="10" fill="#64748b">pts รวม</text></svg>';}
function dChip(d){if(d==null)return '';var r=W().round1(d);if(Math.abs(r)<0.05)return '<span style="color:#94a3b8;font-size:11px">– 0</span>';var up=r>0;return '<span style="font-size:11px;font-weight:600;color:'+(up?'#c0392b':'#2e7d4f')+'">'+(up?'▲ +':'▼ ')+r+'</span>';}
function mediaChart(mb){
 // MoM delta shown only when exactly ONE month is selected in the top filter (clear previous-month basis)
 var sel=(ST.months||[]).filter(Boolean),one=sel.length===1?sel[0]:null;
 var tot=mbTotal(mb),showD=one!=null,pm=showD?mbForYM(prevYM(one)):null;
 var legend=MBCATS.map(function(c){var k=c[1],v=mb[k]||0,pc=tot?Math.round(100*v/tot):0,col=MBPAL[k];var d=showD?(v-(pm[k]||0)):null;
  return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #f1f5f9"><span style="width:11px;height:11px;border-radius:3px;background:'+col+';flex:none"></span><span style="flex:1;font-size:13px;color:#334155">'+E(c[0])+'</span><span style="font-weight:600;min-width:42px;text-align:right">'+v+'</span><span style="color:#64748b;min-width:38px;text-align:right">'+pc+'%</span><span style="min-width:56px;text-align:right">'+(showD?dChip(d):'')+'</span></div>';}).join('');
 var parts=MBCATS.map(function(c){return {val:mb[c[1]]||0,color:MBPAL[c[1]]};});
 return '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:none">'+donut(parts,tot)+'</div><div style="flex:1;min-width:220px">'+legend+'</div></div>'
  +(showD?'<div class="wc-legend">▲▼ เทียบเดือนก่อน ('+prevYM(one)+') · หน่วย pts</div>':'<div class="wc-legend">เลือกเดือนเดียวที่ตัวกรองด้านบนเพื่อดูการเปลี่ยนแปลงเทียบเดือนก่อน (MoM)</div>');
}
// ---------- TAB: OVERVIEW ----------
function renderOverview(){var T=teamData(),mb=W().mediaBreakdown(scope(),getS());
 var mbTot=mb['บันทึก']+mb['Infographic']+mb['VDO']+mb.checker+mb.approval;function pc(n){return mbTot?Math.round(100*n/mbTot):0;}
 var h='<div class="wc-kpis">'+kpi(T.totalWorkload+' pts','Total Team Workload')+kpi(T.totalCapacity+' pts','Team Capacity',PEOPLE().length+' คน')+kpi((T.avgUtilization==null?'N/A':T.avgUtilization+'%'),'Team Utilization')+kpi((T.avgKpi==null?'N/A':T.avgKpi+' / 100'),'Team KPI (avg)')+kpi(T.overloaded,'Overloaded Members')+kpi(T.overdue,'Overdue Work')+'</div>';
 h+='<div class="wc-2col"><div class="panel"><h3>Workload by Media Type</h3>'+mediaChart(mb)+'</div>';
 h+='<div class="panel"><h3>Workload & KPI by Member</h3><table class="table wc-t"><thead><tr><th>Member</th><th>Workload</th><th>Util</th><th>KPI</th><th>Grade</th></tr></thead><tbody>'
  +rowsShown(T).map(function(r){return '<tr><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+r.workload.total+'</td><td style="text-align:center">'+(r.utilization==null?'—':r.utilization+'%')+'</td><td style="text-align:center">'+NA(r.kpi.total)+'</td><td>'+(r.kpi.total==null?'<span class="wc-na">N/A</span>':'<span class="pill wc-bl">'+E(r.grade)+'</span>')+'</td></tr>';}).join('')
  +'</tbody></table></div></div>';
 var months=recentMonths(6),ownBy={};months.forEach(function(ym){ownBy[ym]=ownMap(ym);});
 var tr=W().trend(allScoped(),PEOPLE(),getS(),LEAVE(),months,LSET(),ownBy);
 h+='<div class="panel"><h3>แนวโน้มรายเดือน (6 เดือน) <span class="wc-sub">Workload · Utilization · KPI</span></h3>'+trendChart(tr)+'</div>';
 return h;
}
// ---------- TAB: MATRIX ----------
function renderMatrix(){var T=teamData();var pts=(ST.mmode!=='count');var data=pts?null:countMatrix(scope());
 var max=0;rowsShown(T).forEach(function(r){var w=pts?r.workload:(data[r.member]||{});['บันทึก','Infographic','VDO','checker','approval'].forEach(function(k){var v=(w[k]||0);if(v>max)max=v;});});
 function hm(v){if(!v)return '';var a=max?(0.12+0.55*v/max):0;return ' style="background:rgba(23,102,204,'+a.toFixed(2)+');color:'+(a>0.42?'#fff':'#13233a')+';font-weight:600;text-align:center"';}
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">Workload Matrix <span class="wc-sub">member × media</span></h3><div class="row" style="gap:6px"><button class="ghost wc-mmode'+(pts?' primary':'')+'" data-mmode="points">Workload Points</button><button class="ghost wc-mmode'+(pts?'':' primary')+'" data-mmode="count">จำนวนงาน</button></div></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>บันทึก</th><th>Infographic</th><th>VDO</th><th>ตรวจ/อนุมัติ</th><th>อื่นๆ</th><th>รวม</th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var w=pts?r.workload:(data[r.member]||{'บันทึก':0,'Infographic':0,'VDO':0,checker:0,approval:0,total:0});return '<tr><td><b>'+E(r.member)+'</b></td><td'+hm(w['บันทึก'])+'>'+(w['บันทึก']||'')+'</td><td'+hm(w['Infographic'])+'>'+(w['Infographic']||'')+'</td><td'+hm(w['VDO'])+'>'+(w['VDO']||'')+'</td><td'+hm(w.checker)+'>'+(w.checker||'')+'</td><td'+hm(w.approval)+'>'+(w.approval||'')+'</td><td style="text-align:center"><b>'+(pts?r.workload.total:w.total)+'</b></td></tr>';}).join('');
 h+='</tbody></table><div class="wc-legend">เข้ม = ภาระงานมาก · โหมด: '+(pts?'Workload Points (ถ่วงน้ำหนัก)':'จำนวนงาน')+'</div></div>';
 return h;
}
// ---------- TAB: CAPACITY ----------
function capMembers(){return ST.member?[ST.member]:PEOPLE();}
function capBaseDay(){var S=getS();return W().round1(S.capacity.hoursPerLeaveDay*S.capacity.benchmark);} // pts per full working day (8h × benchmark)
function _pd(ds){return new Date(ds+'T00:00:00');}
function _fmtDM(ds){var d=_pd(ds);return d.getDate()+'/'+(d.getMonth()+1);}
function _isoD(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function weekStart(ds){var d=_pd(ds),g=d.getDay();d.setDate(d.getDate()+(g===0?-6:1-g));return _isoD(d);} // Monday of that week
function weekdaysOf(wkISO){var out=[],d=_pd(wkISO);for(var i=0;i<5;i++){out.push(_isoD(d));d.setDate(d.getDate()+1);}return out;}
function leaveFracDay(member,ds){var frac=0;LEAVE().forEach(function(r){if(r.emp!==member||r.status!=='Approved')return;var s=r.start||'',e=r.end||r.start||'';if(ds>=s&&ds<=e){if((r.duration==='am'||r.duration==='pm')&&s===e)frac=Math.max(frac,0.5);else frac=1;}});return frac;}
// day/week heatmap of workload by delivery date — surfaces clustering months hide
function renderCapGrid(gran){var S=getS(),tasks=scope(),baseDay=capBaseDay();
 function pkey(t){var d=(t.due||t.publish||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return null;return gran==='day'?d:weekStart(d);}
 var groups={};tasks.forEach(function(t){var k=pkey(t);if(k)(groups[k]=groups[k]||[]).push(t);});
 var periods=Object.keys(groups).sort();
 if(!periods.length)return '<div class="panel"><div class="wc-sub">ไม่มีงานที่มีวันกำหนดส่ง/วันออกงานในช่วงที่เลือก — ลองเลือกเดือนที่ตัวกรองด้านบน หรือระบุวันในการ์ดงาน</div></div>';
 var grid={};periods.forEach(function(p){var wl=W().memberWorkload(groups[p],S);for(var m in wl){grid[m]=grid[m]||{};grid[m][p]=wl[m].total;}});
 var members=capMembers(),max=0;
 members.forEach(function(m){periods.forEach(function(p){var v=(grid[m]&&grid[m][p])||0;if(v>max)max=v;});});
 function capOf(m,p){if(gran==='day')return W().round1(baseDay*(1-leaveFracDay(m,p)));var c=0;weekdaysOf(p).forEach(function(d){c+=baseDay*(1-leaveFracDay(m,d));});return W().round1(c);}
 function cell(m,p){var v=W().round1((grid[m]&&grid[m][p])||0),cap=capOf(m,p),over=v>cap;
  var a=max?(0.12+0.55*v/max):0,bg=!v?'':(over?'rgba(192,57,43,'+Math.min(0.9,0.4+0.5*v/(max||1)).toFixed(2)+')':'rgba(23,102,204,'+a.toFixed(2)+')'),col=!v?'#cbd5e1':((over||a>0.42)?'#fff':'#13233a');
  return '<td title="'+E(m)+' · '+(gran==='day'?E(p):'สัปดาห์ '+_fmtDM(p))+' · '+v+'/'+cap+' pts'+(over?' · เกินกำลัง':'')+'" style="text-align:center;font-weight:600'+(v?';background:'+bg+';color:'+col:';color:#cbd5e1')+(over?';outline:2px solid #c0392b;outline-offset:-2px':'')+'">'+(v||'·')+(over?' ⚠':'')+'</td>';}
 var head='<tr><th style="position:sticky;left:0;background:#fff">Member</th>'+periods.map(function(p){return '<th style="text-align:center;white-space:nowrap">'+(gran==='week'?_fmtDM(p)+'–'+_fmtDM(weekdaysOf(p)[4]):_fmtDM(p))+'</th>';}).join('')+'</tr>';
 var body=members.map(function(m){return '<tr><td style="position:sticky;left:0;background:#fff"><b>'+E(m)+'</b></td>'+periods.map(function(p){return cell(m,p);}).join('')+'</tr>';}).join('');
 var teamRow='<tr><td style="position:sticky;left:0;background:#f8fafc"><b>รวมทีม</b></td>'+periods.map(function(p){var tt=0;members.forEach(function(m){tt+=(grid[m]&&grid[m][p])||0;});var cap=gran==='day'?baseDay*members.length:baseDay*5*members.length;var over=tt>cap;return '<td style="text-align:center;font-weight:700'+(over?';color:#c0392b':'')+'">'+W().round1(tt)+(over?' ⚠':'')+'</td>';}).join('')+'</tr>';
 var lim=gran==='day'?baseDay:W().round1(baseDay*5);
 return '<div class="panel"><div style="overflow:auto"><table class="table wc-t"><thead>'+head+'</thead><tbody>'+body+teamRow+'</tbody></table></div>'
  +'<div class="wc-legend">แดง + ⚠ = ภาระงาน'+(gran==='day'?'วันนั้น':'สัปดาห์นั้น')+'เกินกำลัง (~'+lim+' pts/'+(gran==='day'?'วัน':'สัปดาห์')+'/คน, หักวันลาแล้ว) · เข้ม = งานหนาแน่น · นับตามวันกำหนดส่ง (ไม่มี→วันออกงาน) · "·" = ไม่มีงานส่งวันนั้น</div></div>';
}
function renderCapacity(){var S=getS(),cv=ST.capView||'month';
 var toggle='<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="ghost wc-capview'+(cv==='month'?' primary':'')+'" data-cv="month">รายเดือน (สรุป)</button><button class="ghost wc-capview'+(cv==='week'?' primary':'')+'" data-cv="week">รายสัปดาห์</button><button class="ghost wc-capview'+(cv==='day'?' primary':'')+'" data-cv="day">รายวัน</button></div>';
 if(cv==='day'||cv==='week')return toggle+renderCapGrid(cv);
 var T=teamData();
 var h=toggle+'<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">Capacity Planner</h3><span class="wc-sub">Available = Scheduled − Leave − Meeting − Other · Capacity = Hrs × '+S.capacity.benchmark+'</span></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>Available Hrs</th><th>Capacity (pts)</th><th>Planned</th><th>Remaining</th><th>Utilization</th><th>Status</th><th></th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var rem=W().round1(r.capacity.points-r.workload.total);return '<tr><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+r.capacity.availHours+(r.capacity.leaveDays?' <span class="wc-na">(ลา '+r.capacity.leaveDays+'d)</span>':'')+'</td><td style="text-align:center">'+r.capacity.points+'</td><td style="text-align:center">'+r.workload.total+'</td><td style="text-align:center">'+rem+'</td><td>'+bar(r.utilization)+'</td><td>'+statusPill(r.status)+'</td><td><button class="ghost cp-mini wc-capedit" data-m="'+E(r.member)+'">✎ Capacity</button></td></tr>';}).join('');
 h+='</tbody></table></div>';
 if(ST.drill&&ST._capedit){var m=ST.drill,pm=(S.capacity.perMember[m]||{});
  h+='<div class="panel"><h3>ตั้งค่า Capacity · '+E(m)+'</h3><div class="wc-form">'
   +'<label>Scheduled Hours/เดือน<input type="number" id="wc_sched" value="'+(pm.scheduledHours!=null?pm.scheduledHours:S.capacity.scheduledHours)+'"></label>'
   +'<label>Meeting Hours<input type="number" id="wc_meet" value="'+(pm.meetingHours!=null?pm.meetingHours:S.capacity.meetingHours)+'"></label>'
   +'<label>Other Committed<input type="number" id="wc_other" value="'+(pm.otherHours!=null?pm.otherHours:S.capacity.otherHours)+'"></label></div>'
   +'<div class="row" style="gap:8px;margin-top:8px"><button class="primary" id="wc_capsave">บันทึก</button><button class="ghost" id="wc_capclose">ปิด</button></div></div>';
 }
 return h;
}
// ---------- TAB: KPI ----------
function renderKPI(){var T=teamData(),S=getS();
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">KPI Performance</h3><span class="wc-sub">Prod '+S.kpiWeights.productivity+' · Time '+S.kpiWeights.timeliness+' · Qual '+S.kpiWeights.quality+' · Own '+S.kpiWeights.ownership+' · N/A re-normalised (ไม่ให้ 0 อัตโนมัติ)</span></div>';
 h+='<table class="table wc-t" style="margin-top:10px"><thead><tr><th>Member</th><th>Productivity</th><th>Timeliness</th><th>Quality</th><th>Ownership</th><th>Total /100</th><th>Grade</th></tr></thead><tbody>';
 h+=rowsShown(T).map(function(r){var k=r.kpi;return '<tr class="wc-kpirow" data-m="'+E(r.member)+'"><td><b>'+E(r.member)+'</b></td><td style="text-align:center">'+NA(k.productivity)+'</td><td style="text-align:center">'+NA(k.timeliness)+'</td><td style="text-align:center">'+NA(k.quality)+'</td><td style="text-align:center">'+NA(k.ownership)+'</td><td style="text-align:center"><b>'+NA(k.total)+'</b></td><td>'+(k.total==null?'<span class="wc-na">N/A</span>':'<span class="pill wc-bl">'+E(r.grade)+'</span>')+'</td></tr>';}).join('');
 h+='</tbody></table><div class="wc-legend">คลิกชื่อสมาชิกเพื่อบันทึก Performance Log (ชั่วโมงจริง/รอบแก้/Ownership) ที่ปลดล็อก Productivity · Quality · Ownership</div></div>';
 if(ST.drill){var m=ST.drill;var pf=PERF();var comp=scope().filter(function(t){return t.status==='Completed'&&(t.lead===m||(t.types||[]).some(function(u){return u&&u.owner===m;}));});
  var om=OWNS()[m+'|'+curYM()]||{};
  h+='<div class="panel"><h3>Performance Log · '+E(m)+' · '+curYM()+' <span class="wc-sub">('+comp.length+' งานที่เสร็จ)</span></h3>';
  h+='<div class="wc-sub" style="margin-bottom:8px">กรอก “ชั่วโมงจริง” และ “รอบแก้ (Revisions)” → ปลดล็อก Productivity &amp; Quality · เว้นว่าง = N/A (ไม่คิดเป็น 0)</div>';
  h+='<table class="table wc-t"><thead><tr><th>งาน</th><th>กำหนด</th><th>ส่งจริง</th><th>ตรงเวลา</th><th>Std Hrs</th><th>Actual Hrs</th><th>Revisions</th></tr></thead><tbody>'
   +(comp.length?comp.map(function(t){var dlv=t.completed||t.publish||'';var ok=t.due&&dlv&&dlv<=t.due;var p=pf[t.id]||{};return '<tr><td>'+E(t.title)+'</td><td>'+E(t.due||'—')+'</td><td>'+E(dlv||'—')+'</td><td>'+(ok?'<span class="pill wc-ok">ตรง</span>':'<span class="pill wc-ov">ช้า</span>')+'</td><td style="text-align:center;color:#64748b">'+W().plannedHours(getS(),t)+'</td><td style="text-align:center"><input type="number" step="0.5" min="0" class="wc-perf" data-id="'+E(t.id)+'" data-f="actualHours" value="'+(p.actualHours!=null?p.actualHours:'')+'" style="width:72px"></td><td style="text-align:center"><input type="number" step="1" min="0" class="wc-perf" data-id="'+E(t.id)+'" data-f="revisions" value="'+(p.revisions!=null?p.revisions:'')+'" style="width:62px"></td></tr>';}).join(''):'<tr><td class="empty" colspan="7">ยังไม่มีงานที่เสร็จ (KPI = N/A)</td></tr>')
   +'</tbody></table>';
  h+='<h4 class="wc-h4" style="margin-top:14px">Ownership (ผู้จัดการประเมิน) · ถ่วงน้ำหนัก '+getS().kpiWeights.ownership+'%</h4>';
  h+='<div class="wc-form"><label>Score (0–100)<input type="number" min="0" max="100" id="wc_own" value="'+(om.score!=null?om.score:'')+'"></label><label style="flex:1;min-width:220px">หลักฐาน/เหตุผล (Evidence)<input type="text" id="wc_own_note" value="'+E(om.note||'')+'" placeholder="เช่น รับงานด่วนแทนทีม, แก้ปัญหาเชิงรุก"></label></div>';
  h+='<div class="row" style="gap:8px;margin-top:8px"><button class="primary" id="wc_own_save">บันทึก Ownership</button>'+(om.by?'<span class="wc-sub">ล่าสุดโดย '+E(om.by)+' · '+E((om.at||'').slice(0,10))+'</span>':'<span class="wc-sub">ให้คะแนนพร้อมหลักฐานเพื่อความเป็นธรรม</span>')+'</div>';
  h+='</div>';
 }
 return h;
}
// ---------- TAB: SCORING SETTINGS ----------
function renderSettings(){var S=getS();var u=jload(WKEY,{})||{};var hist=jload(HKEY,[])||[];
 var kw=S.kpiWeights;var kwSum=kw.productivity+kw.timeliness+kw.quality+kw.ownership;
 var h='<div class="panel"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap"><h3 style="margin:0">Scoring Settings</h3><div class="row" style="gap:8px"><input type="date" id="wc_eff" class="filter" title="Effective Date"><button class="primary" id="wc_savever">บันทึกเวอร์ชัน</button><button class="ghost" id="wc_reset">Reset ค่าเริ่มต้น</button></div></div>';
 h+='<div class="wc-sub" style="margin:4px 0 12px">แก้ไขแล้วมีผลกับการคำนวณทันที · กด “บันทึกเวอร์ชัน” เพื่อเก็บ snapshot พร้อม Effective Date (ไม่เปลี่ยนรายงานย้อนหลัง) · เฉพาะ Admin ควรแก้</div>';
 // media base/hrs
 h+='<h4 class="wc-h4">1. Media Score (Base × Standard Hours)</h4><table class="table wc-t"><thead><tr><th>ประเภท · รายละเอียด</th><th>Base</th><th>Std Hours</th></tr></thead><tbody>';
 MEDIA.forEach(function(m){Object.keys(S.media[m]).filter(function(k){return k!=='_default';}).forEach(function(k){var c=S.media[m][k];h+='<tr><td>'+E(m)+' · '+E(k)+'</td><td><input type="number" step="1" class="wc-mb" data-m="'+E(m)+'" data-k="'+E(k)+'" value="'+c.base+'"></td><td><input type="number" step="0.5" class="wc-mh" data-m="'+E(m)+'" data-k="'+E(k)+'" value="'+c.hrs+'"></td></tr>';});});
 h+='<tr><td>Checker</td><td><input type="number" class="wc-g" data-g="checkerBase" value="'+S.checkerBase+'"></td><td><input type="number" step="0.5" class="wc-g" data-g="checkerHrs" value="'+S.checkerHrs+'"></td></tr>';
 h+='<tr><td>Approval (เผยแพร่)</td><td><input type="number" class="wc-g" data-g="approvalBase" value="'+S.approvalBase+'"></td><td><input type="number" step="0.5" class="wc-g" data-g="approvalHrs" value="'+S.approvalHrs+'"></td></tr></tbody></table>';
 // multipliers
 h+='<div class="wc-2col"><div><h4 class="wc-h4">2. Multipliers</h4><table class="table wc-t"><tbody>'
  +mulRow('Difficulty','difficulty',['Easy','Medium','Hard'],S)+mulRow('Importance','importance',['Normal','High','Critical'],S)+mulRow('Urgency','urgency',['Normal','Urgent','Emergency'],S)
  +'<tr><td>Responsibility</td><td colspan="3">Primary <input type="number" class="wc-r" data-r="primary" value="'+S.responsibility.primary+'" style="width:60px">% · Support <input type="number" class="wc-r" data-r="support" value="'+S.responsibility.support+'" style="width:60px">%</td></tr>'
  +'</tbody></table></div>';
 // kpi weights + capacity
 h+='<div><h4 class="wc-h4">3. KPI Weights <span class="wc-sub" id="wc_kwsum" style="color:'+(kwSum===100?'#2e7d4f':'#c0392b')+'">(รวม '+kwSum+'%)</span></h4><table class="table wc-t"><tbody>'
  +['productivity','timeliness','quality','ownership'].map(function(k){return '<tr><td>'+k+'</td><td><input type="number" class="wc-kw" data-k="'+k+'" value="'+kw[k]+'">%</td></tr>';}).join('')
  +'</tbody></table>'
  +'<h4 class="wc-h4">4. Capacity & Thresholds</h4><table class="table wc-t"><tbody>'
  +'<tr><td>Benchmark (pt/hr)</td><td><input type="number" step="0.025" class="wc-c" data-c="benchmark" value="'+S.capacity.benchmark+'"></td></tr>'
  +'<tr><td>Scheduled Hrs/เดือน (default)</td><td><input type="number" class="wc-c" data-c="scheduledHours" value="'+S.capacity.scheduledHours+'"></td></tr>'
  +'<tr><td>Hours per Leave Day</td><td><input type="number" class="wc-c" data-c="hoursPerLeaveDay" value="'+S.capacity.hoursPerLeaveDay+'"></td></tr>'
  +'<tr><td>Balanced ≥ / High ≥ / Overload ></td><td><input type="number" class="wc-th" data-t="balanced" value="'+S.statusThresholds.balanced+'" style="width:55px"> <input type="number" class="wc-th" data-t="high" value="'+S.statusThresholds.high+'" style="width:55px"> <input type="number" class="wc-th" data-t="overload" value="'+S.statusThresholds.overload+'" style="width:55px"></td></tr>'
  +'</tbody></table></div></div>';
 // version history
 h+='<h4 class="wc-h4">5. Version History</h4>'+(hist.length?('<table class="table wc-t"><thead><tr><th>Effective</th><th>บันทึกเมื่อ</th><th>โดย</th><th></th></tr></thead><tbody>'+hist.slice(0,10).map(function(v,i){return '<tr><td>'+E(v.effective||'—')+'</td><td>'+E((v.at||'').slice(0,10))+'</td><td>'+E(v.by||'')+'</td><td><button class="ghost cp-mini wc-restore" data-i="'+i+'">↩ คืนค่า</button></td></tr>';}).join('')+'</tbody></table>'):'<div class="wc-sub">ยังไม่มีเวอร์ชันที่บันทึก</div>');
 h+='</div>';
 return h;
}
function mulRow(label,key,keys,S){return '<tr><td>'+label+'</td>'+keys.map(function(k){return '<td>'+k+' <input type="number" step="0.05" class="wc-mul" data-mk="'+key+'" data-kk="'+k+'" value="'+S[key][k]+'" style="width:58px"></td>';}).join('')+'</tr>';}

function renderWC(){var body=g('wcBody');if(!body||!W())return;
 document.querySelectorAll('.wc-tab').forEach(function(b){b.classList.toggle('primary',b.dataset.wctab===ST.tab);b.classList.toggle('ghost',b.dataset.wctab!==ST.tab);});
 var fn={overview:renderOverview,matrix:renderMatrix,capacity:renderCapacity,kpi:renderKPI,settings:renderSettings}[ST.tab]||renderOverview;
 body.innerHTML=fn();bindBody();
}
function u(){return jload(WKEY,{})||{};}
function setU(path,val){var uu=u();var cur=uu;for(var i=0;i<path.length-1;i++){cur[path[i]]=cur[path[i]]||{};cur=cur[path[i]];}cur[path[path.length-1]]=val;saveUser(uu);}
function bindBody(){
 // matrix mode
 document.querySelectorAll('.wc-mmode').forEach(function(b){b.onclick=function(){ST.mmode=b.dataset.mmode;renderWC();};});
 // capacity day/week/month view toggle
 document.querySelectorAll('.wc-capview').forEach(function(b){b.onclick=function(){ST.capView=b.dataset.cv;ST._capedit=0;renderWC();};});
 // capacity edit
 document.querySelectorAll('.wc-capedit').forEach(function(b){b.onclick=function(){ST.drill=b.dataset.m;ST._capedit=1;renderWC();};});
 if(g('wc_capclose'))g('wc_capclose').onclick=function(){ST._capedit=0;ST.drill=null;renderWC();};
 if(g('wc_capsave'))g('wc_capsave').onclick=function(){var m=ST.drill;var uu=u();uu.capacity=uu.capacity||{};uu.capacity.perMember=uu.capacity.perMember||{};uu.capacity.perMember[m]={scheduledHours:+g('wc_sched').value,meetingHours:+g('wc_meet').value,otherHours:+g('wc_other').value};saveUser(uu);audit('capacity',m);ST._capedit=0;ST.drill=null;if(typeof notify==='function')notify('บันทึก Capacity '+m+' แล้ว');renderWC();};
 // kpi drill
 document.querySelectorAll('.wc-kpirow').forEach(function(tr){tr.querySelector('td').onclick=function(){ST.drill=(ST.drill===tr.dataset.m?null:tr.dataset.m);renderWC();};tr.style.cursor='pointer';});
 // performance log capture (actual hours / revisions)
 document.querySelectorAll('.wc-perf').forEach(function(e){e.onchange=function(){var pf=PERF(),id=e.dataset.id;pf[id]=pf[id]||{};if(e.value===''){delete pf[id][e.dataset.f];}else{pf[id][e.dataset.f]=+e.value;}if(!Object.keys(pf[id]).length)delete pf[id];jsave(PKEY,pf);audit('perf-log',id+'·'+e.dataset.f+'='+e.value);renderWC();};});
 if(g('wc_own_save'))g('wc_own_save').onclick=function(){var o=OWNS(),key=ST.drill+'|'+curYM(),sc=g('wc_own').value;if(sc===''){delete o[key];}else{o[key]={score:Math.max(0,Math.min(100,Math.round(+sc))),note:g('wc_own_note').value||'',by:ME(),at:new Date().toISOString()};}jsave(OKEY,o);audit('ownership',key+'='+sc);if(typeof notify==='function')notify('บันทึก Ownership '+ST.drill+' แล้ว');renderWC();};
 // version restore
 document.querySelectorAll('.wc-restore').forEach(function(b){b.onclick=function(){var hh=jload(HKEY,[])||[],v=hh[+b.dataset.i];if(!v||!v.settings)return;if(!window.confirm('คืนค่า Scoring Settings เป็นเวอร์ชัน Effective '+(v.effective||'—')+'?\\n(ค่าปัจจุบันจะถูกแทนที่)'))return;jsave(WKEY,v.settings);audit('restore',v.effective||'');if(typeof notify==='function')notify('คืนค่าเวอร์ชัน '+(v.effective||'')+' แล้ว');renderWC();};});
 // settings inputs -> live update
 document.querySelectorAll('.wc-mb').forEach(function(e){e.onchange=function(){setU(['media',e.dataset.m,e.dataset.k,'base'],+e.value);afterSet();};});
 document.querySelectorAll('.wc-mh').forEach(function(e){e.onchange=function(){setU(['media',e.dataset.m,e.dataset.k,'hrs'],+e.value);afterSet();};});
 document.querySelectorAll('.wc-g').forEach(function(e){e.onchange=function(){setU([e.dataset.g],+e.value);afterSet();};});
 document.querySelectorAll('.wc-mul').forEach(function(e){e.onchange=function(){setU([e.dataset.mk,e.dataset.kk],+e.value);afterSet();};});
 document.querySelectorAll('.wc-r').forEach(function(e){e.onchange=function(){setU(['responsibility',e.dataset.r],+e.value);afterSet();};});
 document.querySelectorAll('.wc-kw').forEach(function(e){e.onchange=function(){setU(['kpiWeights',e.dataset.k],+e.value);var s=getS().kpiWeights;var sum=s.productivity+s.timeliness+s.quality+s.ownership;var el=g('wc_kwsum');if(el){el.textContent='(รวม '+sum+'%)';el.style.color=sum===100?'#2e7d4f':'#c0392b';}if(typeof notify==='function'&&sum!==100)notify('⚠ KPI Weights ต้องรวม = 100% (ตอนนี้ '+sum+'%)');};});
 document.querySelectorAll('.wc-c').forEach(function(e){e.onchange=function(){setU(['capacity',e.dataset.c],+e.value);afterSet();};});
 document.querySelectorAll('.wc-th').forEach(function(e){e.onchange=function(){setU(['statusThresholds',e.dataset.t],+e.value);afterSet();};});
 if(g('wc_savever'))g('wc_savever').onclick=function(){var s=getS().kpiWeights;var sum=s.productivity+s.timeliness+s.quality+s.ownership;if(sum!==100){if(typeof notify==='function')notify('⚠ KPI Weights ต้องรวม 100% ก่อนบันทึกเวอร์ชัน');return;}var hist=jload(HKEY,[]);if(!Array.isArray(hist))hist=[];hist.unshift({effective:(g('wc_eff').value||new Date().toISOString().slice(0,10)),at:new Date().toISOString(),by:ME(),settings:u()});jsave(HKEY,hist.slice(0,50));audit('save-version',g('wc_eff').value||'');if(typeof notify==='function')notify('บันทึกเวอร์ชันแล้ว');renderWC();};
 if(g('wc_reset'))g('wc_reset').onclick=function(){if(!window.confirm('Reset Scoring Settings กลับค่าเริ่มต้นทั้งหมด?'))return;jsave(WKEY,{});audit('reset','');if(typeof notify==='function')notify('รีเซ็ตค่าเริ่มต้นแล้ว');renderWC();};
}
function afterSet(){audit('edit-setting','');if(ST.tab==='settings')renderWC();}

function exportReport(){var T=teamData();var S=getS();
 function tr(cells){return '<tr>'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}
 var body='<h2>Team Overview — '+curYM()+'</h2><p>Workload '+T.totalWorkload+' · Capacity '+T.totalCapacity+' · Utilization '+(T.avgUtilization==null?'N/A':T.avgUtilization+'%')+' · KPI avg '+(T.avgKpi==null?'N/A':T.avgKpi)+' · Overloaded '+T.overloaded+' · Overdue '+T.overdue+'</p>';
 function na(x){return x==null?'N/A':x;}
 body+='<h2>Capacity & KPI by member</h2><table><thead><tr><th>Member</th><th>Workload</th><th>Capacity</th><th>Util</th><th>Status</th><th>Prod</th><th>Time</th><th>Qual</th><th>Own</th><th>KPI</th><th>Grade</th></tr></thead><tbody>'+rowsShown(T).map(function(r){return tr([r.member,r.workload.total,r.capacity.points,(r.utilization==null?'—':r.utilization+'%'),r.status,na(r.kpi.productivity),na(r.kpi.timeliness),na(r.kpi.quality),na(r.kpi.ownership),na(r.kpi.total),(r.kpi.total==null?'N/A':r.grade)]);}).join('')+'</tbody></table>';
 var doc='<!doctype html><meta charset=utf-8><title>Workload & Capacity Report</title><style>body{font-family:system-ui,"Noto Sans Thai",sans-serif;max-width:820px;margin:20px auto;padding:0 16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px 10px;font-size:13px}h2{border-bottom:2px solid #1766cc;padding-bottom:4px}</style><h1>Workload & Capacity & KPI Report</h1>'+body;
 var b=new Blob([doc],{type:'text/html;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='workload-report-'+curYM()+'.html';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);if(typeof notify==='function')notify('Export รายงานแล้ว');}

function monthBtnLabel(){var s=selMonths();if(!s.length)return 'ทุกเดือน';if(s.length===1)return s[0];return s.length+' เดือน';}
function buildMonthFilter(){var pop=g('wcMonthPop');if(!pop)return;var s=selMonths();
 pop.innerHTML='<label class="wc-msel-opt"><input type="checkbox" id="wcMoAll" '+(s.length?'':'checked')+'> <b>ทุกเดือน</b></label><div class="wc-msel-sep"></div>'
  +monthsList().map(function(m){return '<label class="wc-msel-opt"><input type="checkbox" class="wc-mo" value="'+m+'" '+(s.indexOf(m)>=0?'checked':'')+'> '+m+'</label>';}).join('');
 var lbl=g('wcMonthLbl');if(lbl)lbl.textContent=monthBtnLabel();}
function initFilters(){
 buildMonthFilter();
 var me=g('wcMember');if(me){me.innerHTML='<option value="">ทุกสมาชิก</option>'+PEOPLE().map(function(p){return '<option value="'+E(p)+'">'+E(p)+'</option>';}).join('');}
 var md=g('wcMedia');if(md)md.innerHTML='<option value="">ทุกประเภทสื่อ</option>'+MEDIA.map(function(m){return '<option value="'+E(m)+'">'+E(m)+'</option>';}).join('');
 var stt=g('wcStatus');if(stt){var ss=(typeof statuses!=='undefined'?statuses:[]);stt.innerHTML='<option value="">ทุกสถานะ</option>'+ss.map(function(s){return '<option value="'+s+'">'+E(STATUS_LABELS[s]||s)+'</option>';}).join('');}
}
function init(){
 if(!g('wcBody'))return;
 initFilters();
 document.querySelectorAll('.wc-tab').forEach(function(b){b.onclick=function(){ST.tab=b.dataset.wctab;ST.drill=null;ST._capedit=0;renderWC();};});
 var on=function(id,fn){var e=g(id);if(e)e.onchange=fn;};
 // month multi-select: open/close popup, outside-click close, checkbox delegation
 var mc=g('wcMonth'),pop=g('wcMonthPop');
 if(mc&&pop){
  mc.addEventListener('click',function(e){if(e.target.closest('.wc-msel-pop'))return;pop.hidden=!pop.hidden;});
  document.addEventListener('click',function(e){if(!pop.hidden&&!mc.contains(e.target))pop.hidden=true;});
  pop.addEventListener('change',function(e){var t=e.target;
   if(t.id==='wcMoAll'){if(t.checked)ST.months=[];}
   else if(t.classList&&t.classList.contains('wc-mo')){ST.months=ST.months||[];var v=t.value,i=ST.months.indexOf(v);if(t.checked){if(i<0)ST.months.push(v);}else if(i>=0)ST.months.splice(i,1);}
   buildMonthFilter();renderWC();});
 }
 on('wcMember',function(e){ST.member=e.target.value;renderWC();});
 on('wcMedia',function(e){ST.media=e.target.value;renderWC();});
 on('wcStatus',function(e){ST.status=e.target.value;renderWC();});
 var ex=g('wcExport');if(ex)ex.onclick=exportReport;
 document.querySelectorAll('[data-page="workload"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(renderWC,0);});});
 renderWC();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
