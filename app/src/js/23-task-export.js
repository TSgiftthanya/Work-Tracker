/* Task Board → export all tasks as a real .xlsx file (pure JS, no deps). */
(function(){
  // ---- minimal UTF-8 + CRC32 + stored-zip (xlsx = zip of XML parts) ----
  function u8(s){
    if(typeof TextEncoder!=='undefined') return new TextEncoder().encode(s);
    var out=[],i,c,c2,cp;
    for(i=0;i<s.length;i++){c=s.charCodeAt(i);
      if(c<0x80)out.push(c);
      else if(c<0x800)out.push(0xC0|c>>6,0x80|c&63);
      else if(c>=0xD800&&c<0xDC00){c2=s.charCodeAt(++i);cp=0x10000+((c&0x3FF)<<10)+(c2&0x3FF);out.push(0xF0|cp>>18,0x80|cp>>12&63,0x80|cp>>6&63,0x80|cp&63);}
      else out.push(0xE0|c>>12,0x80|c>>6&63,0x80|c&63);
    }
    return new Uint8Array(out);
  }
  var _crcT=(function(){var t=[],n,c,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
  function crc32(b){var c=0xFFFFFFFF,i;for(i=0;i<b.length;i++)c=_crcT[(c^b[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function zipStore(files){
    function u16(v){return [v&255,(v>>8)&255];}
    function u32(v){return [v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];}
    var parts=[],central=[],offset=0,i;
    for(i=0;i<files.length;i++){
      var nm=u8(files[i].name),dt=files[i].data,crc=crc32(dt);
      var lh=new Uint8Array([].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(dt.length),u32(dt.length),u16(nm.length),u16(0)));
      parts.push(lh,nm,dt);
      var cd=new Uint8Array([].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(dt.length),u32(dt.length),u16(nm.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset)));
      central.push(cd,nm);
      offset+=lh.length+nm.length+dt.length;
    }
    var cdSize=0,j;for(j=0;j<central.length;j++)cdSize+=central[j].length;
    var eocd=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdSize),u32(offset),u16(0)));
    var all=parts.concat(central,[eocd]),total=0,k;
    for(k=0;k<all.length;k++)total+=all[k].length;
    var out=new Uint8Array(total),p=0;
    for(k=0;k<all.length;k++){out.set(all[k],p);p+=all[k].length;}
    return out;
  }
  function xesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function colRef(n){var s='';n++;while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
  function sheetXml(rows){
    var xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    for(var r=0;r<rows.length;r++){
      xml+='<row r="'+(r+1)+'">';
      for(var c=0;c<rows[r].length;c++){
        xml+='<c r="'+colRef(c)+(r+1)+'" t="inlineStr"><is><t xml:space="preserve">'+xesc(rows[r][c])+'</t></is></c>';
      }
      xml+='</row>';
    }
    return xml+'</sheetData></worksheet>';
  }
  function buildXlsx(rows){
    var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>';
    var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
    var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<sheets><sheet name="Task Board" sheetId="1" r:id="rId1"/></sheets></workbook>';
    var wbr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
    return zipStore([
      {name:'[Content_Types].xml',data:u8(ct)},
      {name:'_rels/.rels',data:u8(rels)},
      {name:'xl/workbook.xml',data:u8(wb)},
      {name:'xl/_rels/workbook.xml.rels',data:u8(wbr)},
      {name:'xl/worksheets/sheet1.xml',data:u8(sheetXml(rows))}
    ]);
  }
  // ---- map tasks → rows ----
  function statusTH(s){try{return (typeof statusLabel!=='undefined'&&statusLabel[s])||s||'';}catch(e){return s||'';}}
  function typesStr(t){
    var a=(t&&t.types)||[];
    if(!a||!a.length)return t&&t.kind?String(t.kind):'';
    return a.map(function(x){
      if(!x)return '';
      return (x.type||'')+(x.owner?(': '+x.owner):'')+(x.detail?(' ('+x.detail+')'):'');
    }).filter(Boolean).join(', ');
  }
  function arrStr(v){
    if(v==null)return '';
    if(v.join)return v.join(', ');
    return String(v);
  }
  function buildRows(list){
    var H=['ID','ชื่องาน','ประเภทการสื่อสาร','Project','สถานะ','ความสำคัญ','ผู้รับผิดชอบหลัก','ผู้ร่วมงาน','ผู้รับผิดชอบรายประเภท','Checker / ผู้ตรวจ','ผู้อนุมัติ / เผยแพร่','กำหนดส่ง (Due)','วันเผยแพร่','วันเสร็จสิ้น','Brief','ช่องทางการสื่อสาร','ผู้รับผิดชอบในการสื่อสาร'];
    var rows=[H];
    list=list||[];
    for(var i=0;i<list.length;i++){
      var t=list[i]||{};
      rows.push([
        t.id,t.title,t.comm,t.project,statusTH(t.status),t.priority,
        t.lead,t.support,typesStr(t),t.checker,t.approver,
        t.due,t.publish,t.completed,t.brief,
        arrStr(t.channels),arrStr(t.commOwner)
      ]);
    }
    return rows;
  }
  function allTasks(){return (typeof tasks!=='undefined'&&tasks)?tasks:[];}
  function filteredTasks(){
    // the board publishes its current filtered set to window.__wtBoardShown;
    // fall back to all tasks if the board hasn't rendered yet.
    var s=window.__wtBoardShown;
    return (s&&s.length!==undefined)?s:allTasks();
  }
  function download(list,suffix,scopeLabel){
    try{
      var rows=buildRows(list);
      var bytes=buildXlsx(rows);
      var blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      var d=new Date();var pad=function(n){return (n<10?'0':'')+n;};
      var fn='WorkTracker-TaskBoard'+(suffix||'')+'-'+d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.xlsx';
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download=fn;document.body.appendChild(a);a.click();
      setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},300);
      if(typeof notify==='function')notify('Export '+(rows.length-1)+' งาน'+(scopeLabel||'')+' เป็น .xlsx แล้ว');
    }catch(e){
      if(typeof notify==='function')notify('Export ไม่สำเร็จ: '+(e&&e.message||e));
    }
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest)return;
    if(e.target.closest('#wtExportXlsx')){e.preventDefault();download(allTasks(),'','ทั้งหมด');return;}
    if(e.target.closest('#wtExportXlsxFiltered')){e.preventDefault();download(filteredTasks(),'-filtered',' (ที่กรอง)');return;}
  });
})();
