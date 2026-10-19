(function(){
var SHEET='https://docs.google.com/spreadsheets/d/1OEIvKYNgRp6GYHHO3g4og6Uc9fEggdwj7EOIpOSkWpg/edit?gid=0#gid=0';
var LOGKEY='worktracker-commplan-log-v1';
function esc2(x){return (typeof esc==='function')?esc(x):String(x==null?'':x);}
function who(){return (window.__WT_USER__&&window.__WT_USER__.name)||'ผู้ใช้';}
var STS=(typeof statuses!=='undefined'?statuses:['To Do','In Progress','Completed']);
function slab(s){return (typeof statusLabel!=='undefined'&&statusLabel[s])||s;}
var SYS=[['communication_date','วันที่ (Date)','date'],['title','เรื่องสื่อสาร (Topic) *','text'],['communication_time','เวลาสื่อสาร (Time)','time'],['publish','วันเผยแพร่ (ใช้เป็นวันที่ · External)','date'],['date_start','วันดำเนินการ','date'],['date_done','วันเสร็จสิ้น','date'],
['channel_line','ช่องทาง · LINE','bool'],['channel_top_hit','ช่องทาง · TOP HIT','bool'],['channel_banner','ช่องทาง · Banner','bool'],['channel_sms','ช่องทาง · SMS','bool'],['channel_appstaff','ช่องทาง · APP STAFF','bool'],['channel_lastmile','ช่องทาง · Lastmile','bool'],
['media_memo','สื่อ · บันทึก','bool'],['media_infographic','สื่อ · Infographic','bool'],['media_video','สื่อ · VDO','bool'],
['status','สถานะ (Status)','status'],['remark','หมายเหตุ (Remark)','text'],['sms_message','SMS Message','text'],['target','Target / Audience','text'],['owner','Owner','text'],['category','หัวข้อ','text'],['unit','หน่วยงาน','text'],['project','ชื่อโครงการ/แคมเปญ','text']];
var ALIAS={communication_date:['วันที่','date'],title:['เรื่องสื่อสาร','เรื่อง','หัวข้อเรื่อง','title','topic'],communication_time:['เวลาสื่อสาร','เวลา','time'],
channel_line:['line'],channel_top_hit:['top hit','tophit','top-hit','tophit'],channel_banner:['banner'],channel_sms:['sms'],channel_appstaff:['app staff','appstaff','app-staff'],channel_lastmile:['lastmile','last mile','last-mile'],
media_memo:['บันทึก','memo'],media_infographic:['info','infographic','อินโฟ'],media_video:['vdo','video','วิดีโอ'],
status:['สถานะ','status'],remark:['หมายเหตุ','remark','note'],sms_message:['sms message','ข้อความ sms','ข้อความ'],target:['target','audience','กลุ่มเป้าหมาย','เป้าหมาย'],owner:['owner','ผู้รับผิดชอบ','เจ้าของ'],publish:['วันเผยแพร่','เผยแพร่'],date_start:['วันดำเนินการ'],date_done:['วันเสร็จสิ้น','วันเสร็จ'],category:['หัวข้อ'],unit:['หน่วยงาน'],project:['ชื่อโครงการ/แคมเปญ','ชื่อโครงการ','แคมเปญ','โครงการ']};
var LAB2KEY={};(function(){var SL=(typeof statusLabel!=='undefined')?statusLabel:{};Object.keys(SL).forEach(function(k){LAB2KEY[SL[k].toLowerCase()]=k;LAB2KEY[k.toLowerCase()]=k;});})();
var FUZZY={'เสร็จสิ้น':'Completed','เสร็จ':'Completed','done':'Completed','ดำเนินการ':'In Progress','กำลังดำเนินการ':'In Progress','ระหว่างดำเนินการ':'In Progress','planned':'To Do','วางแผน':'To Do','รอดำเนินการ':'To Do','on hold':'On Hold','พักงาน':'On Hold'};
function tf(v){return String(v==null?'':v).trim().toUpperCase().replace(/^﻿/,'')==='TRUE'||['YES','1','✓','✔','Y','X'].indexOf(String(v||'').trim().toUpperCase())>=0;}
var THMON={'มค':1,'กพ':2,'มีค':3,'เมย':4,'พค':5,'มิย':6,'กค':7,'สค':8,'กย':9,'ตค':10,'พย':11,'ธค':12,'มกราคม':1,'กุมภาพันธ์':2,'มีนาคม':3,'เมษายน':4,'พฤษภาคม':5,'มิถุนายน':6,'กรกฎาคม':7,'สิงหาคม':8,'กันยายน':9,'ตุลาคม':10,'พฤศจิกายน':11,'ธันวาคม':12};
function normDate(s){s=(s||'').trim();if(!s)return '';
 var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m){var y=+m[1];if(y>2400)y-=543;return y+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);}
 m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);if(m){var d=+m[1],mo=+m[2],yy=+m[3];if(yy<100)yy+=2000;if(yy>2400)yy-=543;return yy+'-'+('0'+mo).slice(-2)+'-'+('0'+d).slice(-2);}
 // Thai month name/abbrev, e.g. 28-ก.ย.-69 · 31 ส.ค. 2569 · 1/ต.ค./69 (2-digit year = พ.ศ.)
 var toks=s.split(/[\s\-\/]+/).filter(Boolean),dd=null,mo2=null,yy2=null;
 for(var i=0;i<toks.length;i++){var t=toks[i].replace(/\./g,'').trim();if(mo2==null&&THMON[t]!=null){mo2=THMON[t];continue;}if(/^\d{1,4}$/.test(t)){var n=+t;if(dd==null&&t.length<=2&&n>=1&&n<=31)dd=n;else if(yy2==null)yy2=n;}}
 if(dd&&mo2&&yy2!=null){if(yy2<100)yy2+=2500;if(yy2>2400)yy2-=543;return yy2+'-'+('0'+mo2).slice(-2)+'-'+('0'+dd).slice(-2);}
 return null;}
function statusNorm(s){s=(s||'').trim();if(!s)return {k:'To Do',warn:false};var low=s.toLowerCase();if(LAB2KEY[low])return {k:LAB2KEY[low],warn:false};if(FUZZY[s]||FUZZY[low])return {k:FUZZY[s]||FUZZY[low],warn:false};return {k:'To Do',warn:true};}
var WDAY={'จันทร์':1,'อังคาร':1,'พุธ':1,'พฤหัสบดี':1,'พฤหัส':1,'ศุกร์':1,'เสาร์':1,'อาทิตย์':1,'วันจันทร์':1,'วันอังคาร':1,'วันพุธ':1,'วันพฤหัสบดี':1,'วันศุกร์':1,'วันเสาร์':1,'วันอาทิตย์':1};function dupKey(o){return (o.date||o.day||'')+'|'+(o.topic||'').trim()+'|'+(o.time||'').trim();}

var WZ=null,el=null;
function build(){
 if(el)return el;
 el=document.createElement('div');el.className='modalbg';el.id='cpWzBg';
 el.innerHTML='<div class="modal" style="max-width:1000px;width:94vw"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="eyebrow">GOOGLE SHEET IMPORT</div><h2 id="wzTitle" style="margin:4px 0 0">นำเข้าข้อมูล</h2></div><button class="ghost" id="wzClose">✕</button></div><div class="wz-steps" id="wzSteps"></div><div id="wzBody" style="margin-top:6px"></div><div class="row" style="justify-content:space-between;gap:8px;margin-top:16px"><button class="ghost" id="wzBack">ย้อนกลับ</button><div class="row" style="gap:8px"><span class="tiny muted" id="wzHint"></span><button class="primary" id="wzNext">ถัดไป</button></div></div></div>';
 document.body.appendChild(el);
 el.addEventListener('click',function(e){if(e.target.id==='cpWzBg')close();});
 el.querySelector('#wzClose').onclick=close;
 el.querySelector('#wzBack').onclick=function(){go(WZ.step-1);};
 el.querySelector('#wzNext').onclick=next;
 return el;
}
function close(){if(el)el.classList.remove('open');}
var STEPS=['เชื่อมต่อ','จับคู่คอลัมน์','ตรวจสอบ','พรีวิว','ยืนยัน','ผลลัพธ์'];
function renderSteps(){el.querySelector('#wzSteps').innerHTML=STEPS.map(function(s,i){return '<span class="wz-step'+(i===WZ.step?' on':'')+(i<WZ.step?' done':'')+'">'+(i+1)+'. '+s+'</span>';}).join('');}
function setHint(t){el.querySelector('#wzHint').textContent=t||'';}

window.cpWizard=function(){build();WZ={step:0,url:SHEET,mode:'internal',headers:[],rows:[],total:0,map:{},parsed:[],dupMode:'skip',result:null};el.classList.add('open');go(0);};

function go(step){if(step<0)step=0;WZ.step=step;renderSteps();var B=el.querySelector('#wzBody');var back=el.querySelector('#wzBack'),next=el.querySelector('#wzNext');back.style.visibility=step===0?'hidden':'visible';next.textContent='ถัดไป';next.disabled=false;setHint('');
 if(step===0)stepConnect(B);
 else if(step===1)stepMap(B);
 else if(step===2)stepValidate(B);
 else if(step===3)stepPreview(B);
 else if(step===4)stepConfirm(B);
 else if(step===5)stepResult(B);
}
function next(){var s=WZ.step;
 if(s===0){if(!WZ.headers.length){setHint('กรุณากด “เชื่อมต่อ & อ่านชีต” ก่อน');return;}go(1);}
 else if(s===1){if(!WZ.map.title&&WZ.map.title!==0){setHint('ต้องจับคู่คอลัมน์ “เรื่องสื่อสาร” ก่อน');return;}buildParsed();go(2);}
 else if(s===2){go(3);}
 else if(s===3){go(4);}
 else if(s===4){doImport();go(5);}
 else if(s===5){close();if(window.renderCP)window.renderCP();}
}

// STEP 1 — connect
function stepConnect(B){
 B.innerHTML='<div class="field"><label>ลิงก์ Google Sheet (แชร์แบบ “ทุกคนที่มีลิงก์ดูได้”)</label><input id="wzUrl" class="cp-inp" style="width:100%" value="'+esc2(WZ.url)+'"></div>'+'<div class="row" style="gap:8px;margin-top:8px;align-items:center"><span class="tiny muted">ประเภทข้อมูล:</span><button class="ghost cp-mode'+(WZ.mode==="internal"?" primary":"")+'" data-mode="internal">Internal · ภายใน</button><button class="ghost cp-mode'+(WZ.mode==="external"?" primary":"")+'" data-mode="external">External · ลูกค้า</button></div>'
 +'<div class="row" style="gap:8px;margin-top:6px"><button class="primary" id="wzConnect">เชื่อมต่อ & อ่านชีต</button><span class="tiny muted" id="wzConnMsg">'+(WZ.total?('พบ '+WZ.total+' แถว · '+WZ.headers.length+' คอลัมน์'):'')+'</span></div>'
 +(WZ.headers&&WZ.headers.length?('<div class="field" style="margin-top:12px;max-width:240px"><label>แถวหัวตาราง (ตรวจพบอัตโนมัติ · ปรับได้)</label><input type="number" min="1" id="wzHdrRow" class="cp-inp" value="'+((WZ.hdrIdx||0)+1)+'"></div><div class="tiny muted" style="margin-top:4px">คอลัมน์ที่ใช้งาน: '+WZ.headers.filter(function(h){return h;}).map(function(h){return '<span class="cp-tag">'+esc2(h)+'</span>';}).join(' ')+'</div>'):'');
 B.querySelector('#wzConnect').onclick=function(){
  var url=B.querySelector('#wzUrl').value.trim();WZ.url=url;var msg=B.querySelector('#wzConnMsg');msg.textContent='กำลังเชื่อมต่อ...';
  fetch('/api/raw-sheet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,mode:WZ.mode})}).then(function(r){return r.json();}).then(function(d){
   if(!d.ok){msg.textContent='✕ '+(d.error||'อ่านชีตไม่สำเร็จ');return;}
   WZ.rawHeaders=d.headers||[];WZ.rawRows=d.rows||[];detectHeader();autoMap();
   msg.textContent='✓ อ่านสำเร็จ · แถวข้อมูล '+WZ.total+' แถว';stepConnect(B);
  }).catch(function(e){msg.textContent='✕ '+e;});
 };
 B.querySelectorAll('.cp-mode').forEach(function(mb){mb.onclick=function(){WZ.mode=mb.dataset.mode;WZ.headers=[];WZ.rawHeaders=[];WZ.rawRows=[];WZ.total=0;stepConnect(B);};});
 var hr=B.querySelector('#wzHdrRow');if(hr)hr.onchange=function(){var v=parseInt(hr.value,10);if(isNaN(v)||v<1)v=1;WZ.hdrIdx=v-1;applyHeader();autoMap();stepConnect(B);};
}
function grid(){return [WZ.rawHeaders||[]].concat(WZ.rawRows||[]);}
function detectHeader(){var G=grid();var hi=-1;for(var i=0;i<G.length;i++){if((G[i]||[]).some(function(c){var t=(c||'').trim();return t==='เรื่องสื่อสาร'||t==='เรื่อง';})){hi=i;break;}}WZ.hdrIdx=(hi<0?0:hi);applyHeader();}
function applyHeader(){var G=grid();var hi=WZ.hdrIdx||0;var H=G[hi]||[];var sub=null,dataStart=hi+1;
 var titleJ=-1;for(var j=0;j<H.length;j++){var t=(H[j]||'').trim();if(t==='เรื่องสื่อสาร'||t==='เรื่อง'){titleJ=j;break;}}
 if(hi+1<G.length){var nxt=G[hi+1]||[];var te=(titleJ<0)||!((nxt[titleJ]||'').trim());
  var looksSub=nxt.some(function(c){var u=(c||'').trim().toUpperCase();return u&&['LINE','SMS','BANNER','TOP HIT','TOPHIT','APP STAFF','APPSTAFF','LASTMILE','INFOGRAPHIC','INFO','VDO','บันทึก'].some(function(k){return u.indexOf(k)>=0;});});
  if(te&&looksSub){sub=nxt;dataStart=hi+2;}}
 WZ.headers=H.map(function(c,j){var s=(sub&&sub[j])?(''+sub[j]).trim():'';return s||(''+(c||'')).trim();});
 WZ.rows=G.slice(dataStart).filter(function(r){return (r||[]).some(function(c){return (c||'').trim();});});
 WZ.total=WZ.rows.length;}
function autoMap(){WZ.map={};var used={};SYS.forEach(function(f){var key=f[0];var al=ALIAS[key]||[];for(var j=0;j<WZ.headers.length;j++){if(used[j])continue;var hh=(WZ.headers[j]||'').toLowerCase().trim();for(var a=0;a<al.length;a++){if(hh===al[a]||hh.indexOf(al[a])>=0){WZ.map[key]=j;used[j]=1;return;}}}});}

// STEP 2 — map
function stepMap(B){
 var opts=function(sel){return '<option value="-1">— ไม่ใช้ —</option>'+WZ.headers.map(function(h,j){return '<option value="'+j+'"'+(sel===j?' selected':'')+'>'+esc2(h||('คอลัมน์ '+(j+1)))+'</option>';}).join('');};
 var rows=SYS.map(function(f){var k=f[0];var cur=(k in WZ.map)?WZ.map[k]:-1;var ok=(cur>=0);return '<tr><td>'+esc2(f[1])+'</td><td style="text-align:center">→</td><td><select class="filter wz-map" data-k="'+k+'" style="min-width:200px">'+opts(cur)+'</select></td><td>'+(ok?'<span class="pill s-progress">จับคู่แล้ว</span>':'<span class="tiny muted">ไม่ได้ใช้</span>')+'</td></tr>';}).join('');
 B.innerHTML='<div class="tiny muted" style="margin-bottom:8px">ระบบจับคู่คอลัมน์อัตโนมัติจากชื่อที่ใกล้เคียง · ปรับได้ด้วยตนเอง · TRUE/FALSE จะถูกแปลงเป็น Checkbox อัตโนมัติ</div><div class="cp-table-wrap" style="max-height:420px"><table class="table"><thead><tr><th>คอลัมน์จาก Google Sheet</th><th></th><th>ฟิลด์ในระบบ</th><th>สถานะ</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 B.querySelectorAll('.wz-map').forEach(function(s){s.onchange=function(){var v=+s.value;if(v<0)delete WZ.map[s.dataset.k];else WZ.map[s.dataset.k]=v;stepMap(B);};});
}

// build parsed+validated rows
function cell(r,k){var j=WZ.map[k];return (j==null||j<0||j>=r.length)?'':(r[j]||'');}
function parseRow(r){
 var o={date:'',day:'',time:(cell(r,'communication_time')||'').trim(),topic:(cell(r,'title')||'').trim(),
  ch:{line:tf(cell(r,'channel_line')),tophit:tf(cell(r,'channel_top_hit')),banner:tf(cell(r,'channel_banner')),sms:tf(cell(r,'channel_sms')),appstaff:tf(cell(r,'channel_appstaff')),lastmile:tf(cell(r,'channel_lastmile'))},
  md:{memo:tf(cell(r,'media_memo')),info:tf(cell(r,'media_infographic')),vdo:tf(cell(r,'media_video'))},
  remark:(cell(r,'remark')||'').trim(),sms_msg:(cell(r,'sms_message')||'').trim(),sms_target:(cell(r,'target')||'').trim(),owner:(cell(r,'owner')||'').trim()};
 var _pd='';['communication_date','publish','date_start'].forEach(function(k){if(_pd)return;var v=(cell(r,k)||'').trim();if(v)_pd=v;});var _dc=(cell(r,'day')||'').trim();o.day=_dc;if(_pd){if(WDAY[_pd]){o.day=o.day||_pd;o.date='';o._rawDate='';}else{o.date=normDate(_pd);o._rawDate=_pd;}}else{o.date='';o._rawDate='';}var _ex=[],_c=(cell(r,'category')||'').trim(),_u=(cell(r,'unit')||'').trim(),_pj=(cell(r,'project')||'').trim(),_s=(cell(r,'date_start')||'').trim(),_e=(cell(r,'date_done')||'').trim();if(_c)_ex.push('หัวข้อ: '+_c);if(_u)_ex.push('หน่วยงาน: '+_u);if(_pj)_ex.push('โครงการ: '+_pj);if(_s)_ex.push('เริ่ม: '+_s);if(_e)_ex.push('เสร็จ: '+_e);if(_ex.length)o.remark=[o.remark].concat(_ex).filter(Boolean).join(' · ');var sn=statusNorm(cell(r,'status'));o.status=sn.k;o._statusWarn=sn.warn;return o;}
function validate(o,existKeys,batchSeen){var errs=[],level='valid';
 if(!o.topic)errs.push({c:'เรื่องสื่อสาร',m:'ไม่มีข้อมูล (จำเป็น)',e:true});
 if(o.date===null){errs.push({c:'วันที่',m:'รูปแบบวันที่ไม่ถูกต้อง: '+o._rawDate,e:true});}
 else if(o.date===''&&!o.day){errs.push({c:'วัน/วันที่',m:'ไม่มีวัน/วันที่',e:false});}
 if(o._statusWarn)errs.push({c:'สถานะ',m:'สถานะไม่รู้จัก · ตั้งเป็น รอดำเนินการ',e:false});
 var hasErr=errs.some(function(x){return x.e;});
 var k=dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time});
 var isDup=(!hasErr)&&(existKeys[k]||batchSeen[k]);
 if(hasErr)level='error';else if(isDup){level='duplicate';errs.push({c:'ซ้ำ',m:'มีข้อมูลเดิม (วันที่+เรื่อง+เวลา)',e:false});}
 else if(errs.length)level='warning';
 return {level:level,errs:errs};}
function fillCols(){var cols=[];['communication_date','day','publish','date_start','date_done','project'].forEach(function(k){if(WZ.map[k]!=null&&WZ.map[k]>=0)cols.push(WZ.map[k]);});cols.forEach(function(j){var last='';WZ.rows.forEach(function(r){var v=(r[j]||'').trim();if(v)last=v;else if(last)r[j]=last;});});}function buildParsed(){fillCols();var existKeys={};(window.CPall?window.CPall():[]).forEach(function(r){existKeys[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=1;});
 var batchSeen={};WZ.parsed=WZ.rows.map(function(r){var o=parseRow(r);var v=validate(o,existKeys,batchSeen);var k=dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time});if(o.topic)batchSeen[k]=1;return {o:o,level:v.level,errs:v.errs,sel:(v.level!=='error'),skip:false};});}
function revalidate(p){var existKeys={};(window.CPall?window.CPall():[]).forEach(function(r){existKeys[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=1;});var v=validate(p.o,existKeys,{});p.level=v.level;p.errs=v.errs;}
function counts(){var c={total:WZ.parsed.length,valid:0,warning:0,error:0,duplicate:0};WZ.parsed.forEach(function(p){c[p.level]++;});return c;}

// STEP 3 — validate summary
function stepValidate(B){var c=counts();
 B.innerHTML='<div class="cp-sum"><div class="cp-chip"><b>'+c.total+'</b><span>ทั้งหมด</span></div>'
  +'<div class="cp-chip" style="border-color:#bfe3c4"><b style="color:#2e7d4f">'+c.valid+'</b><span>พร้อมนำเข้า ✓</span></div>'
  +'<div class="cp-chip" style="border-color:#f3dca6"><b style="color:#9a6b16">'+c.warning+'</b><span>เตือน ⚠</span></div>'
  +'<div class="cp-chip" style="border-color:#f0b4ab"><b style="color:#c0392b">'+c.error+'</b><span>ผิดพลาด ✕</span></div>'
  +'<div class="cp-chip" style="border-color:#c9d6ea"><b style="color:#3a6ea5">'+c.duplicate+'</b><span>ซ้ำ ⟳</span></div></div>'
  +'<div class="tiny muted">• แถวที่ผิดพลาด (✕) จะไม่ถูกนำเข้า · แถวเตือน (⚠) นำเข้าได้ · แถวซ้ำ (⟳) จัดการได้ในขั้นยืนยัน<br>• กด “ถัดไป” เพื่อดูพรีวิวและแก้ไขข้อมูลก่อนนำเข้า</div>';
}

// STEP 4 — preview (editable)
function badge(level){var m={valid:['✓','s-progress'],warning:['⚠','s-approval'],error:['✕','s-reject'],duplicate:['⟳','']};var b=m[level]||m.valid;return '<span class="pill '+b[1]+'" title="'+esc2((WZ._errMap&&'')||level)+'">'+b[0]+'</span>';}
function stepPreview(B){
 var flt=WZ._pflt||'all';
 var head='<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">'
  +['all:ทั้งหมด','valid:พร้อม ✓','warning:เตือน ⚠','error:ผิดพลาด ✕','duplicate:ซ้ำ ⟳'].map(function(x){var k=x.split(':')[0];return '<button class="ghost cp-mini wz-flt'+(flt===k?' primary':'')+'" data-f="'+k+'">'+x.split(':')[1]+'</button>';}).join('')
  +'<span style="flex:1"></span><button class="ghost cp-mini" id="wzSelAll">เลือกทั้งหมด</button><button class="ghost cp-mini" id="wzSelNone">ไม่เลือก</button></div>';
 var rows='';
 WZ.parsed.forEach(function(p,i){ if(flt!=='all'&&p.level!==flt)return;
  var errT=p.errs.map(function(e){return (e.e?'✕ ':'⚠ ')+e.c+': '+e.m;}).join('\n');
  var cls=p.level==='error'?'wz-err':(p.level==='warning'?'wz-warn':(p.level==='duplicate'?'wz-dup':''));
  rows+='<tr class="'+cls+(p.skip?' wz-skip':'')+'" title="'+esc2(errT)+'">'
   +'<td><input type="checkbox" class="wz-sel" data-i="'+i+'"'+(p.sel&&!p.skip?' checked':'')+(p.level==='error'?' disabled':'')+'></td>'
   +'<td>'+badge(p.level)+'</td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="date" value="'+esc2(p.o.date===null?p.o._rawDate:(p.o.date||p.o.day||''))+'" style="width:120px"></td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="time" value="'+esc2(p.o.time||'')+'" style="width:80px"></td>'
   +'<td><input class="wz-ed cp-inp" data-i="'+i+'" data-f="topic" value="'+esc2(p.o.topic||'')+'" style="width:220px"></td>'
   +'<td>'+chTags(p.o.ch)+'</td><td>'+mdTags(p.o.md)+'</td>'
   +'<td><select class="wz-ed filter" data-i="'+i+'" data-f="status">'+STS.map(function(s){return '<option value="'+s+'"'+(p.o.status===s?' selected':'')+'>'+esc2(slab(s))+'</option>';}).join('')+'</select></td>'
   +'<td><button class="ghost cp-mini wz-skipbtn" data-i="'+i+'">'+(p.skip?'ยกเลิกข้าม':'ข้าม')+'</button></td>'
   +'</tr>';
 });
 if(!rows)rows='<tr><td class="empty" colspan="9">ไม่มีแถวในตัวกรองนี้</td></tr>';
 B.innerHTML=head+'<div class="cp-table-wrap" style="max-height:440px"><table class="table"><thead><tr><th>นำเข้า</th><th>สถานะ</th><th>วันที่</th><th>เวลา</th><th>เรื่องสื่อสาร</th><th>ช่องทาง</th><th>สื่อ</th><th>สถานะงาน</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="tiny muted" style="margin-top:6px">วางเมาส์บนแถวเพื่อดูสาเหตุ · แก้ไขช่องวันที่/เวลา/เรื่อง/สถานะได้โดยตรง แล้วระบบจะตรวจสอบใหม่ทันที</div>';
 B.querySelectorAll('.wz-flt').forEach(function(b){b.onclick=function(){WZ._pflt=b.dataset.f;stepPreview(B);};});
 B.querySelector('#wzSelAll').onclick=function(){WZ.parsed.forEach(function(p){if(p.level!=='error')p.sel=true;});stepPreview(B);};
 B.querySelector('#wzSelNone').onclick=function(){WZ.parsed.forEach(function(p){p.sel=false;});stepPreview(B);};
 B.querySelectorAll('.wz-sel').forEach(function(c){c.onchange=function(){WZ.parsed[+c.dataset.i].sel=c.checked;};});
 B.querySelectorAll('.wz-skipbtn').forEach(function(b){b.onclick=function(){var p=WZ.parsed[+b.dataset.i];p.skip=!p.skip;stepPreview(B);};});
 B.querySelectorAll('.wz-ed').forEach(function(inp){inp.onchange=function(){var p=WZ.parsed[+inp.dataset.i];var f=inp.dataset.f;
   if(f==='date'){var vv=inp.value.trim();if(!vv){p.o.date='';p.o._rawDate='';}else if(WDAY[vv]){p.o.day=vv;p.o.date='';p.o._rawDate='';}else{p.o.date=normDate(vv);p.o._rawDate=vv;}}
   else if(f==='time')p.o.time=inp.value.trim();
   else if(f==='topic')p.o.topic=inp.value.trim();
   else if(f==='status')p.o.status=inp.value;
   revalidate(p);if(p.level==='error')p.sel=false;stepPreview(B);};});
}
function chTags(ch){var D=[['line','LINE'],['tophit','TOP HIT'],['banner','Banner'],['sms','SMS'],['appstaff','APP STAFF'],['lastmile','Lastmile']];var t=D.filter(function(d){return ch[d[0]];}).map(function(d){return '<span class="cp-tag cp-tag-'+d[0]+'">'+d[1]+'</span>';}).join(' ');return t||'<span class="tiny muted">—</span>';}
function mdTags(md){var D=[['memo','บันทึก'],['info','Info'],['vdo','VDO']];var t=D.filter(function(d){return md[d[0]];}).map(function(d){return '<span class="cp-tag">'+d[1]+'</span>';}).join(' ');return t||'<span class="tiny muted">—</span>';}

// STEP 5 — confirm
function stepConfirm(B){var c=counts();
 var willImport=WZ.parsed.filter(function(p){return p.sel&&!p.skip&&p.level!=='error';}).length;
 var dups=WZ.parsed.filter(function(p){return p.sel&&!p.skip&&p.level==='duplicate';}).length;
 B.innerHTML='<div class="tiny muted" style="margin-bottom:10px">ตรวจสอบก่อนนำเข้าจริง · ข้อมูลจะถูกบันทึกลงระบบ (Communication Plan) และสร้าง Communication ID ให้แต่ละรายการ</div>'
  +'<div class="field" style="max-width:360px"><label>วิธีจัดการข้อมูลซ้ำ ('+dups+' แถว)</label><select class="filter" id="wzDup"><option value="skip">ข้าม (Skip) — ค่าเริ่มต้น</option><option value="update">อัปเดตข้อมูลเดิม (Update)</option><option value="new">นำเข้าเป็นรายการใหม่ (Import as New)</option></select></div>'
  +'<div class="cp-sum" style="margin-top:12px"><div class="cp-chip"><b>'+willImport+'</b><span>จะนำเข้า</span></div><div class="cp-chip"><b>'+dups+'</b><span>ในนั้นเป็นรายการซ้ำ</span></div><div class="cp-chip"><b style="color:#c0392b">'+c.error+'</b><span>ผิดพลาด (ไม่นำเข้า)</span></div></div>'
  +'<div class="tiny muted">กด “ถัดไป” เพื่อนำเข้าตามที่เลือก (จะไม่เขียนทับข้อมูลเดิมโดยอัตโนมัติ)</div>';
 B.querySelector('#wzDup').value=WZ.dupMode;B.querySelector('#wzDup').onchange=function(e){WZ.dupMode=e.target.value;};
 el.querySelector('#wzNext').textContent='นำเข้าข้อมูล';
}
function assign(rec,o){rec.date=o.date||'';rec.day=o.day||'';rec.time=o.time||'';rec.topic=o.topic||'';rec.ch={line:!!o.ch.line,tophit:!!o.ch.tophit,banner:!!o.ch.banner,sms:!!o.ch.sms,appstaff:!!o.ch.appstaff,lastmile:!!o.ch.lastmile};rec.md={memo:!!o.md.memo,info:!!o.md.info,vdo:!!o.md.vdo};rec.status=o.status||'To Do';rec.remark=o.remark||'';rec.sms_msg=o.sms_msg||'';rec.sms_target=o.sms_target||'';rec.owner=o.owner||'';}
function doImport(){var all=window.CPall?window.CPall():[];var byKey={};all.forEach(function(r){byKey[dupKey({date:r.date||'',day:r.day||'',topic:r.topic,time:r.time})]=r;});
 var imported=0,updated=0,skipped=0,failed=0,failRows=[];
 WZ.parsed.forEach(function(p){
  if(!p.sel||p.skip){skipped++;return;}
  if(p.level==='error'){failed++;failRows.push({topic:p.o.topic||'(ไม่มีชื่อ)',reason:p.errs.filter(function(e){return e.e;}).map(function(e){return e.c+': '+e.m;}).join('; ')});return;}
  var o=p.o,isDup=p.level==='duplicate';
  if(isDup){if(WZ.dupMode==='skip'){skipped++;return;}if(WZ.dupMode==='update'){var ex=byKey[dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time})];if(ex){assign(ex,o);updated++;return;}}}
  var rec={cid:(window.CPnewId?window.CPnewId():('C'+Date.now()+Math.random())),src:'sheet',taskId:null,importedAt:new Date().toISOString(),importedBy:who()};
  assign(rec,o);all.push(rec);byKey[dupKey({date:o.date||'',day:o.day||'',topic:o.topic,time:o.time})]=rec;imported++;
 });
 if(window.CPsave)window.CPsave(all);
 var log=[];try{log=JSON.parse(localStorage.getItem(LOGKEY)||'[]');if(!Array.isArray(log))log=[];}catch(e){log=[];}
 var entry={at:new Date().toISOString(),by:who(),source:WZ.url,imported:imported,updated:updated,skipped:skipped,failed:failed,total:WZ.parsed.length};
 log.unshift(entry);try{localStorage.setItem(LOGKEY,JSON.stringify(log.slice(0,50)));}catch(e){}
 WZ.result={imported:imported,updated:updated,skipped:skipped,failed:failed,failRows:failRows};
 if(window.renderCP)window.renderCP();
}

// STEP 6 — result
function stepResult(B){var r=WZ.result||{imported:0,updated:0,skipped:0,failed:0,failRows:[]};
 B.innerHTML='<div class="cp-sum"><div class="cp-chip" style="border-color:#bfe3c4"><b style="color:#2e7d4f">'+r.imported+'</b><span>นำเข้าใหม่</span></div><div class="cp-chip"><b>'+r.updated+'</b><span>อัปเดต</span></div><div class="cp-chip"><b>'+r.skipped+'</b><span>ข้าม</span></div><div class="cp-chip" style="border-color:#f0b4ab"><b style="color:#c0392b">'+r.failed+'</b><span>ไม่สำเร็จ</span></div></div>'
  +(r.failRows&&r.failRows.length?('<div class="tiny muted" style="margin:4px 0 6px">รายการที่นำเข้าไม่สำเร็จ:</div><div class="cp-table-wrap" style="max-height:200px"><table class="table"><thead><tr><th>เรื่อง</th><th>สาเหตุ</th></tr></thead><tbody>'+r.failRows.map(function(f){return '<tr><td>'+esc2(f.topic)+'</td><td class="wz-err">'+esc2(f.reason)+'</td></tr>';}).join('')+'</tbody></table></div>'):'<div class="tiny muted">บันทึกประวัติการนำเข้าแล้ว (ผู้ดำเนินการ · วันเวลา · แหล่งข้อมูล · จำนวน)</div>')
  +'<div class="tiny muted" style="margin-top:8px">ข้อมูลถูกบันทึกลงระบบแล้ว · กด “เสร็จสิ้น” เพื่อปิด</div>';
 el.querySelector('#wzNext').textContent='เสร็จสิ้น';el.querySelector('#wzBack').style.visibility='hidden';
}
})();