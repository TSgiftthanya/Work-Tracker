(function(){
  var ACCESS_KEY='worktracker-access-v1';
  // Pages an admin can grant/deny per person (order matches the sidebar).
  var PAGES=[
    ['board','กระดานงาน'],
    ['commplan','Communication Plan'],
    ['specialorder','ออเดอร์พิเศษ'],
    ['teamleave','ปฏิทินวันลาทีม'],
    ['projects','โปรเจกต์และทีม'],
    ['automation','รายงานและวิเคราะห์'],
    ['deptstats','สถิติหน่วยงาน'],
    ['workload','Workload Workspace'],
    ['library','คลังข้อมูล'],
    ['masterdata','จัดการดรอปดาวน์']
  ];
  var PIDS={}; PAGES.forEach(function(p){PIDS[p[0]]=1;});
  // 'permissions' page is where this editor lives -> always admin-only.
  // 'dashboard' and anything unknown -> always allowed.

  function esc(s){return String(s==null?'':s).replace(/[&<>"\x27]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\x27':'&#39;'}[c];});}
  function curUser(){return window.__WT_USER__||{};}
  function isAdmin(u){u=u||curUser();return /manager|admin|ผู้ดูแล|ผู้จัดการ|หัวหน้า/i.test(String(u&&u.role||''));}
  function emailKey(u){return String((u&&u.email)||'').trim().toLowerCase();}
  function nameKey(u){return String((u&&u.name)||'').trim().toLowerCase();}

  // Default page policy per role. Unknown/blank roles -> allow all (never lock out by surprise).
  function rolePreset(role){
    var r=String(role||'').toLowerCase();
    var all={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:1,workload:1,library:1,masterdata:1};
    var creator={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:0,deptstats:0,workload:0,library:0,masterdata:0};
    var checker={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:0,workload:1,library:0,masterdata:0};
    var approver={board:1,commplan:1,specialorder:1,teamleave:1,projects:1,automation:1,deptstats:1,workload:1,library:0,masterdata:0};
    if(/approver|อนุมัติ/.test(r))return approver;
    if(/checker|ตรวจ|qa|quality|คุณภาพ/.test(r))return checker;
    if(/creator|สร้าง|ครีเอ|designer|editor|คอนเทนต์|content/.test(r))return creator;
    return all; // manager/admin bypass elsewhere; unrecognized roles stay open
  }

  function accessMap(){try{return JSON.parse(localStorage.getItem(ACCESS_KEY)||'{}')||{};}catch(e){return {};}}
  function saveAccessMap(m){try{localStorage.setItem(ACCESS_KEY,JSON.stringify(m));}catch(e){}}

  // Find a user's access record: by email first, then fall back to name
  // (so sessions issued before email was added to the token still match).
  function recFor(u){
    var m=accessMap(),ek=emailKey(u);
    if(ek&&m[ek])return m[ek];
    var nk=nameKey(u);
    if(nk){for(var k in m){if(m[k]&&String(m[k]._name||'').trim().toLowerCase()===nk)return m[k];}}
    return null;
  }

  // Is page `pid` visible to user `u`?
  function allowed(pid,u){
    u=u||curUser();
    if(pid==='permissions')return isAdmin(u);
    if(isAdmin(u))return true;          // admins/managers always see everything
    if(!PIDS[pid])return true;          // dashboard + anything not gated
    var rec=recFor(u);
    if(!rec)return true;                // no record set = default allow
    return rec[pid]!==false;
  }
  window.wtPageAllowed=allowed;

  function firstAllowed(){
    for(var i=0;i<PAGES.length;i++){if(allowed(PAGES[i][0]))return PAGES[i][0];}
    return 'dashboard';
  }

  // Hide nav buttons for pages this user may not see.
  function applyNavGate(){
    var u=curUser();
    document.querySelectorAll('.nav[data-page]').forEach(function(b){
      var pid=b.dataset.page;
      b.style.display=allowed(pid,u)?'':'none';
    });
    var act=document.querySelector('.page.active');
    if(act&&!allowed(act.id,u)){var f=firstAllowed();if(window.navigate)window.navigate(f);}
  }
  window.wtApplyNavGate=applyNavGate;

  // Guard programmatic navigation too (reassigns the global navigate binding).
  if(typeof window.navigate==='function'&&!window.__navGuarded){
    var _nav=window.navigate;
    window.navigate=function(page){
      if(!allowed(page)){if(window.notify)notify('ไม่มีสิทธิ์เข้าถึงหน้านี้');page=firstAllowed();}
      return _nav(page);
    };
    window.__navGuarded=1;
  }

  // ---- Admin editor (rendered inside the สิทธิ์ทีม page) ----
  function renderEditor(){
    var host=document.getElementById('permissions');
    if(!host||!isAdmin())return;
    var box=document.getElementById('wtAccessBox');
    if(!box){
      box=document.createElement('div');
      box.id='wtAccessBox';
      box.className='card';
      box.style.marginTop='18px';
      host.appendChild(box);
    }
    box.innerHTML='<div style="font-weight:600;font-size:15px">กำหนดสิทธิ์การเข้าถึงรายหน้า (รายคน)</div>'+
      '<div class="tiny" style="color:#7a889c;margin:4px 0 10px">ติ๊ก = เห็นเมนูนั้น · เอาออก = ซ่อนเมนูนั้นสำหรับผู้ใช้คนนั้น · แอดมิน/ผู้จัดการเห็นทุกหน้าเสมอ · มีผลเต็มที่เมื่อผู้ใช้โหลดหน้าใหม่/ล็อกอินใหม่</div>'+
      '<div id="wtAccRows" class="tiny" style="color:#7a889c">กำลังโหลดรายชื่อ...</div>';
    fetch('/api/users').then(function(r){return r.json();}).then(function(d){
      var users=(d&&d.users)||[];
      var m=accessMap();
      var th='<th style="position:sticky;left:0;background:#fff;text-align:left;min-width:150px">ผู้ใช้</th>'+
        PAGES.map(function(p){return '<th style="writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;height:120px;padding:4px 2px;font-weight:500">'+esc(p[1])+'</th>';}).join('');
      var rows=users.map(function(u){
        var adm=isAdmin(u);
        var ek=emailKey(u);
        var rec=(ek&&m[ek])||null;
        var cells=PAGES.map(function(p){
          var pid=p[0];
          var on=adm?true:(!rec||rec[pid]!==false);
          return '<td style="text-align:center"><input type="checkbox" class="wtAcc" data-email="'+esc(ek)+'" data-name="'+esc(u.name||'')+'" data-page="'+pid+'" '+(on?'checked':'')+(adm?' disabled':'')+'></td>';
        }).join('');
        var who='<div style="font-weight:500">'+esc(u.name||'—')+(adm?' <span class="pill" style="background:#eaf1fb;color:#1766cc">แอดมิน · เห็นทุกหน้า</span>':'')+'</div><div class="tiny" style="color:#9aa7b8">'+esc(u.email||'—')+(u.role?' · '+esc(u.role):'')+'</div>';
        return '<tr data-row-email="'+esc(ek)+'" data-role="'+esc(u.role||'')+'"><td style="position:sticky;left:0;background:#fff;text-align:left">'+who+'</td>'+cells+'</tr>';
      }).join('');
      if(!users.length)rows='<tr><td colspan="'+(PAGES.length+1)+'" class="empty">ยังไม่มีข้อมูลผู้ใช้</td></tr>';
      document.getElementById('wtAccRows').innerHTML=
        '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap"><button type="button" id="wtAccPreset" class="primary tiny">ใช้ค่าเริ่มต้นตามบทบาท</button><button type="button" id="wtAccAll" class="ghost tiny">เปิดทุกหน้าทุกคน</button><button type="button" id="wtAccNone" class="ghost tiny">ซ่อนทุกหน้าทุกคน</button><button type="button" id="wtAccSave" class="primary tiny" style="margin-left:auto">บันทึกสิทธิ์</button></div>'+
        '<div class="tiny" style="color:#9aa7b8;margin:-2px 0 8px">กด “ใช้ค่าเริ่มต้นตามบทบาท” เพื่อเติมค่าตามนโยบาย แล้วปรับรายคนได้ จากนั้นกด “บันทึกสิทธิ์”</div>'+
        '<div style="overflow:auto;border:1px solid #e3ebf4;border-radius:10px"><table class="table" style="margin:0"><thead><tr>'+th+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
      var allBtn=document.getElementById('wtAccAll'),noneBtn=document.getElementById('wtAccNone'),saveBtn=document.getElementById('wtAccSave'),presetBtn=document.getElementById('wtAccPreset');
      function setAll(v){document.querySelectorAll('#wtAccRows input.wtAcc:not([disabled])').forEach(function(c){c.checked=v;});}
      if(allBtn)allBtn.onclick=function(){setAll(true);};
      if(noneBtn)noneBtn.onclick=function(){setAll(false);};
      if(presetBtn)presetBtn.onclick=function(){
        document.querySelectorAll('#wtAccRows tr[data-row-email]').forEach(function(tr){
          var boxes=tr.querySelectorAll('input.wtAcc');
          if(!boxes.length||boxes[0].disabled)return; // skip admin rows
          var preset=rolePreset(tr.dataset.role||'');
          boxes.forEach(function(c){c.checked=preset[c.dataset.page]!==false;});
        });
        if(window.notify)notify('เติมค่าเริ่มต้นตามบทบาทแล้ว · ตรวจแล้วกด “บันทึกสิทธิ์”');
      };
      if(saveBtn)saveBtn.onclick=function(){
        var map=accessMap();
        // rebuild records for every non-admin user shown
        document.querySelectorAll('#wtAccRows tr[data-row-email]').forEach(function(tr){
          var boxes=tr.querySelectorAll('input.wtAcc');
          if(!boxes.length||boxes[0].disabled)return; // skip admin rows
          var ek=boxes[0].dataset.email;if(!ek)return;
          var nm=boxes[0].dataset.name||'';
          var entry={_name:nm};
          boxes.forEach(function(c){entry[c.dataset.page]=!!c.checked;});
          map[ek]=entry;
        });
        saveAccessMap(map);
        if(window.notify)notify('บันทึกสิทธิ์การเข้าถึงแล้ว');
        applyNavGate();
      };
    }).catch(function(){var el=document.getElementById('wtAccRows');if(el)el.textContent='โหลดรายชื่อไม่สำเร็จ';});
  }

  function boot(){
    applyNavGate();
    if(isAdmin()){
      renderEditor();
      document.querySelectorAll('.nav[data-page="permissions"]').forEach(function(b){b.addEventListener('click',renderEditor);});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
