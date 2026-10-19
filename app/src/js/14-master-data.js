(function(){
var DDKEY='worktracker-dropdowns-v1';
var DEF={priority:['Normal','High','Urgent'],people:(typeof people!=='undefined'?people.slice():['Gift','Mint','Beam','Ploy','Nok']),supporting:(typeof people!=='undefined'?people.slice():['Gift','Mint','Beam','Ploy','Nok']),detail_note:['สื่อสารทั่วไป','BlankForm'],detail_info:['มีPattern(บันทึก)','New Design','กระบวนการละเอียด'],detail_vdo:['Short Clip','Long Clip','ข้อมูลซับซ้อน','Editing']};
function load(){try{var s=JSON.parse(localStorage.getItem(DDKEY)||'null');return (s&&typeof s==='object')?s:null;}catch(e){return null;}}
function save(s){try{localStorage.setItem(DDKEY,JSON.stringify(s));}catch(e){}}
function all(){var s=load(),seeded=false;if(!s){s={};seeded=true;}Object.keys(DEF).forEach(function(k){if(!Array.isArray(s[k])){s[k]=DEF[k].slice();seeded=true;}});if(!Array.isArray(s.__topics)){s.__topics=[];seeded=true;}(s.__topics||[]).slice().forEach(function(tp){if(tp&&(tp.title||'').toLowerCase().indexOf('supporting')>=0){var o=Array.isArray(s[tp.key])?s[tp.key]:[];if(!Array.isArray(s.supporting))s.supporting=[];o.forEach(function(v){if(s.supporting.indexOf(v)<0)s.supporting.push(v);});delete s[tp.key];s.__topics=s.__topics.filter(function(x){return x.key!==tp.key;});seeded=true;}});if(seeded)save(s);return s;}
window.DDget=function(k){var s=all();return Array.isArray(s[k])?s[k].slice():[];};
window.DDdetail=function(m){var k=(m==='บันทึก')?'detail_note':(m==='Infographic')?'detail_info':(m==='VDO')?'detail_vdo':null;return k?window.DDget(k):[];};
function sync(){var s=all();if(typeof people!=='undefined')people=(s.people||[]).slice();if(typeof render==='function')render();}
window.DDsync=sync;
function T(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
function mediaOf(k){return k==='detail_note'?'บันทึก':k==='detail_info'?'Infographic':k==='detail_vdo'?'VDO':null;}
function useCount(key,val){var m=mediaOf(key),n=0;T().forEach(function(t){
 if(key==='priority'){if(t.priority===val)n++;}
 else if(key==='people'){var hit=(t.lead===val||t.checker===val||t.approver===val);if(!hit&&t.support)hit=t.support.split(',').map(function(x){return x.trim();}).indexOf(val)>=0;if(!hit&&t.types)hit=t.types.some(function(x){return x&&x.owner===val;});if(hit)n++;}
 else if(m){if(t.types&&t.types.some(function(x){return x&&x.type===m&&(x.detail||'')===val;}))n++;}});return n;}
function renameVal(key,old,nw){var s=all(),arr=s[key]||[],i=arr.indexOf(old);if(i<0)return;arr[i]=nw;save(s);sync();var m=mediaOf(key);
 T().forEach(function(t){
  if(key==='priority'){if(t.priority===old)t.priority=nw;}
  else if(key==='people'){if(t.lead===old)t.lead=nw;if(t.checker===old)t.checker=nw;if(t.approver===old)t.approver=nw;if(t.support)t.support=t.support.split(',').map(function(x){return x.trim();}).map(function(x){return x===old?nw:x;}).filter(Boolean).join(', ');if(t.types)t.types.forEach(function(x){if(x&&x.owner===old)x.owner=nw;});}
  else if(m){if(t.types)t.types.forEach(function(x){if(x&&x.type===m&&(x.detail||'')===old)x.detail=nw;});}});
 if(typeof persist==='function')persist();}
function addVal(key,val){val=(val||'').trim();if(!val)return{ok:false,msg:'กรุณาระบุค่า'};var s=all(),arr=s[key]||(s[key]=[]);if(arr.some(function(x){return String(x).toLowerCase()===val.toLowerCase();}))return{ok:false,msg:'มีตัวเลือกนี้อยู่แล้ว'};arr.push(val);save(s);sync();return{ok:true};}
function delVal(key,idx){var s=all();if(s[key])s[key].splice(idx,1);save(s);sync();}
function move(key,idx,dir){var s=all(),arr=s[key];if(!arr)return;var j=idx+dir;if(j<0||j>=arr.length)return;var t=arr[idx];arr[idx]=arr[j];arr[j]=t;save(s);sync();}
function addTopic(title){var s=all(),key='cust_'+Date.now().toString(36);(s.__topics=s.__topics||[]).push({key:key,title:title});s[key]=[];save(s);}
function delTopic(key){var s=all();s.__topics=(s.__topics||[]).filter(function(t){return t.key!==key;});delete s[key];save(s);}
var EDIT=null;
function esc2(x){return (typeof esc==='function')?esc(x):String(x);}
function editCard(cfg){var s=all(),arr=(s[cfg.key]||[]);
 var rows=arr.map(function(v,idx){
  if(EDIT&&EDIT.key===cfg.key&&EDIT.idx===idx){return '<div class="md-row"><input class="md-inp" id="md_e_'+cfg.key+'" value="'+esc2(v)+'"><span class="md-ops"><button class="ghost mdbtn" data-mdact="commit" data-key="'+cfg.key+'" data-idx="'+idx+'">✓</button><button class="ghost mdbtn" data-mdact="cancel">✕</button></span></div>';}
  return '<div class="md-row"><span class="md-val">'+esc2(v)+'</span><span class="md-ops">'
   +'<button class="ghost mdbtn" data-mdact="up" data-key="'+cfg.key+'" data-idx="'+idx+'" '+(idx===0?'disabled':'')+' title="เลื่อนขึ้น">↑</button>'
   +'<button class="ghost mdbtn" data-mdact="down" data-key="'+cfg.key+'" data-idx="'+idx+'" '+(idx===arr.length-1?'disabled':'')+' title="เลื่อนลง">↓</button>'
   +'<button class="ghost mdbtn" data-mdact="edit" data-key="'+cfg.key+'" data-idx="'+idx+'" title="แก้ไข">✎</button>'
   +'<button class="ghost mdbtn danger" data-mdact="del" data-key="'+cfg.key+'" data-idx="'+idx+'" title="ลบ">✕</button>'
   +'</span></div>';}).join('');
 var del=cfg.custom?'<button class="ghost mdbtn danger" data-mdact="deltopic" data-key="'+cfg.key+'" style="float:right" title="ลบหัวข้อ">ลบหัวข้อ</button>':'';
 return '<div class="panel md-card"><div class="md-head">'+del+'<b>'+esc2(cfg.title)+'</b> <span class="pill">'+arr.length+'</span>'
  +(cfg.desc?'<div class="tiny muted" style="margin-top:3px">'+esc2(cfg.desc)+'</div>':'')+'</div>'
  +'<div class="md-list">'+(rows||'<div class="tiny muted" style="padding:6px 2px">ยังไม่มีตัวเลือก</div>')+'</div>'
  +'<div class="md-add"><input class="md-inp" id="md_a_'+cfg.key+'" placeholder="เพิ่มตัวเลือกใหม่..."><button class="primary mdbtn" data-mdact="add" data-key="'+cfg.key+'">＋ เพิ่ม</button></div></div>';}
function lockCard(cfg){var opts=cfg.optsFn?cfg.optsFn():(cfg.opts||[]);
 var rows=opts.map(function(v){return '<div class="md-row md-ro"><span class="md-val">'+esc2(v)+'</span><span class="tiny muted">🔒</span></div>';}).join('');
 var link=cfg.link?'<div class="md-add"><button class="ghost mdbtn" data-mdact="goto" data-key="'+cfg.link+'">ไปที่หน้า Projects & Teams →</button></div>':'';
 return '<div class="panel md-card md-locked"><div class="md-head"><b>'+esc2(cfg.title)+'</b> <span class="pill">'+(opts.length||'—')+'</span> <span class="pill md-syspill">ระบบ · ล็อก</span>'
  +'<div class="tiny muted" style="margin-top:3px">'+esc2(cfg.note||'')+'</div></div>'
  +'<div class="md-list">'+(rows||'<div class="tiny muted" style="padding:6px 2px">—</div>')+'</div>'+link+'</div>';}
window.renderMD=function(){var host=document.getElementById('mdCards');if(!host)return;var s=all();
 var edit=[{key:'priority',title:'ระดับความสำคัญ (Priority)',desc:'ช่อง Priority ในการ์ดงาน'},
  {key:'people',title:'ทีมงาน / ผู้รับผิดชอบ',desc:'ผู้รับผิดชอบ · Checker · ผู้ตรวจ/อนุมัติ(เผยแพร่) · Supporting · ฟิลเตอร์รายคน'},
  {key:'detail_note',title:'รายละเอียด · บันทึก',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ บันทึก'},
  {key:'detail_info',title:'รายละเอียด · Infographic',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ Infographic'},
  {key:'detail_vdo',title:'รายละเอียด · VDO',desc:'ตัวเลือก “รายละเอียด” เมื่อเลือกประเภทสื่อ VDO'},{key:'supporting',title:'Supporting Creator',desc:'ช่อง Supporting Creator ในการ์ดงาน (เลือกได้หลายคน)'}];
 (s.__topics||[]).forEach(function(tp){edit.push({key:tp.key,title:tp.title,desc:'หัวข้อกำหนดเอง · ยังไม่ผูกกับฟิลด์ในการ์ดงาน',custom:true});});
 var locked=[{title:'ประเภทการสื่อสาร',opts:['Internal','External'],note:'ผูกกับ routing · แยกโปรเจกต์ · ฟิลเตอร์'},
  {title:'ประเภทสื่อ (ประเภทงาน)',opts:['บันทึก','Infographic','VDO'],note:'ผูกกับ Matrix · kind · หัวข้อรายละเอียดสื่อ'},
  {title:'สถานะงาน',optsFn:function(){return (typeof statuses!=='undefined'?statuses:[]).map(function(x){return (typeof statusLabel!=='undefined'&&statusLabel[x])||x;});},note:'ผูกกับคอลัมน์บนกระดานงาน'},
  {title:'Project',opts:[],note:'จัดการที่หน้า Projects & Teams (แยก Internal/External)',link:'projects'}];
 var html='<div class="md-grouplbl">แก้ไขได้ (Master Data)</div>'+edit.map(editCard).join('')
  +'<div class="md-grouplbl">ระบบ · ดูอย่างเดียว</div>'+locked.map(lockCard).join('');
 host.innerHTML=html;
 if(EDIT){var e=document.getElementById('md_e_'+EDIT.key);if(e){e.focus();e.select();}}};
function tell(m){if(typeof notify==='function')notify(m);}
function commitEdit(key,idx,val){var s=all(),arr=s[key]||[],old=arr[idx];val=(val||'').trim();if(!val){tell('ห้ามเว้นว่าง');return false;}if(val===old){EDIT=null;return true;}if(arr.some(function(x,i){return i!==idx&&String(x).toLowerCase()===val.toLowerCase();})){tell('มีตัวเลือกนี้อยู่แล้ว');return false;}renameVal(key,old,val);EDIT=null;tell('บันทึกแล้ว · อัปเดตงานที่เกี่ยวข้องให้อัตโนมัติ');return true;}
function doAdd(key){var inp=document.getElementById('md_a_'+key);var r=addVal(key,inp?inp.value:'');if(!r.ok){tell(r.msg);return;}tell('เพิ่มตัวเลือกแล้ว');EDIT=null;window.renderMD();}
function bind(){var host=document.getElementById('mdCards');if(host&&!host._md){host._md=1;
 host.addEventListener('click',function(e){var b=e.target.closest('[data-mdact]');if(!b)return;var act=b.dataset.mdact,key=b.dataset.key,idx=b.dataset.idx!=null?+b.dataset.idx:-1;
  if(act==='add')doAdd(key);
  else if(act==='edit'){EDIT={key:key,idx:idx};window.renderMD();}
  else if(act==='cancel'){EDIT=null;window.renderMD();}
  else if(act==='commit'){var inp=document.getElementById('md_e_'+key);if(commitEdit(key,idx,inp?inp.value:''))window.renderMD();}
  else if(act==='del'){var s=all(),arr=s[key]||[],val=arr[idx],n=useCount(key,val);var msg=n>0?('ตัวเลือก “'+val+'” กำลังถูกใช้ใน '+n+' งาน\n• งานเดิมจะยังเก็บค่าเดิมไว้ (ข้อมูลไม่หาย)\n• แต่จะไม่แสดงเป็นตัวเลือกใหม่อีก\n\nยืนยันการลบ?'):('ลบตัวเลือก “'+val+'” ?');if(!confirm(msg))return;delVal(key,idx);EDIT=null;tell('ลบแล้ว');window.renderMD();}
  else if(act==='up'){move(key,idx,-1);window.renderMD();}
  else if(act==='down'){move(key,idx,1);window.renderMD();}
  else if(act==='deltopic'){if(!confirm('ลบหัวข้อกำหนดเองนี้ทั้งหมด?'))return;delTopic(key);window.renderMD();}
  else if(act==='goto'){if(typeof navigate==='function')navigate(key);}});
 host.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var t=e.target;if(!t.classList||!t.classList.contains('md-inp'))return;e.preventDefault();var id=t.id||'';
  if(id.indexOf('md_a_')===0)doAdd(id.slice(5));
  else if(id.indexOf('md_e_')===0&&EDIT){if(commitEdit(EDIT.key,EDIT.idx,t.value))window.renderMD();}});}
 var ab=document.getElementById('mdAddTopic');if(ab&&!ab._md){ab._md=1;ab.onclick=function(){var name=window.prompt('ชื่อหัวข้อดรอปดาวน์ใหม่:');if(name==null)return;name=name.trim();if(!name)return;addTopic(name);tell('เพิ่มหัวข้อแล้ว');window.renderMD();};}}
document.head.insertAdjacentHTML('beforeend','<style>#mdCards{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;align-items:stretch}.md-grouplbl{grid-column:1/-1;font-size:11px;font-weight:800;letter-spacing:.5px;color:#64748b;text-transform:uppercase;margin:6px 0 -4px}.md-card{padding:14px 16px;display:flex;flex-direction:column}.md-head{margin-bottom:8px}.md-list{display:flex;flex-direction:column;gap:1px;margin-bottom:10px}.md-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;border-radius:8px}.md-row:hover{background:#f4f8ff}.md-ro:hover{background:transparent}.md-val{font-size:13px;color:#1f2a37}.md-ops{display:flex;gap:1px;flex-shrink:0}.mdbtn{padding:3px 8px;font-size:12px;line-height:1.1;border-radius:7px}.mdbtn[disabled]{opacity:.3;cursor:default}.mdbtn.danger{color:#c0392b}.md-add{display:flex;gap:6px;margin-top:auto}.md-inp{flex:1;min-width:0;padding:6px 9px;border:1px solid #d7e0ea;border-radius:8px;font-size:13px}.md-locked{opacity:.95;background:#fbfcfe}.md-syspill{background:#eef2f7;color:#64748b}</style>');
sync();bind();
})();