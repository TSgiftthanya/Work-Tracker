(function(){function esc(s){return String(s==null?"":s).replace(/[&<>"\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\x27":"&#39;"}[c];});}function ini(n){return (String(n||"").trim().slice(0,2)||"?").toUpperCase();}var u=window.__WT_USER__||null;if(u){var c=document.getElementById("wtUserChip");if(c)c.textContent=u.name+(u.role?" · "+u.role:"");var a=document.getElementById("wtAvatar");if(a)a.textContent=ini(u.name);var sa=document.getElementById("wtSideAvatar");if(sa)sa.textContent=ini(u.name);var su=document.getElementById("wtSideUser");if(su)su.textContent=u.name+(u.role?" · "+u.role:"");}var lo=document.getElementById("wtLogout");if(lo)lo.onclick=function(){fetch("/api/logout",{method:"POST"}).then(function(){location.href="/login";}).catch(function(){location.href="/login";});};function loadPerm(){var tb=document.getElementById("wtPermRows");if(!tb)return;fetch("/api/users").then(function(r){return r.json();}).then(function(d){var list=(d&&d.users)||[];var src=document.getElementById("wtUserSource");if(src)src.textContent="ผู้ใช้ "+list.length+" คน · แหล่งข้อมูล: "+((d&&d.source)==="sheet"?"Google Sheet":"ผู้ใช้ตัวอย่าง (ยังไม่เชื่อมชีต)");if(!list.length){tb.innerHTML='<tr><td colspan="5" class="empty">ยังไม่มีข้อมูลผู้ใช้</td></tr>';return;}tb.innerHTML=list.map(function(x){return '<tr><td><span class="avatar">'+ini(x.name)+'</span> &nbsp; '+esc(x.name)+'</td><td>'+esc(x.team||"—")+'</td><td>'+esc(x.role||"—")+'</td><td>'+esc(x.capacity||"—")+'</td><td>'+esc(x.email||"—")+'</td></tr>';}).join("");}).catch(function(){tb.innerHTML='<tr><td colspan="5" class="empty">โหลดข้อมูลไม่สำเร็จ</td></tr>';});}var rb=document.getElementById("wtRefreshUsers");if(rb)rb.onclick=function(){rb.disabled=true;rb.textContent="กำลังนำเข้า...";fetch("/api/refresh-users",{method:"POST"}).then(function(r){return r.json();}).then(function(d){rb.disabled=false;rb.textContent="↻ นำเข้า/รีเฟรชจาก Google Sheet";if(window.notify)notify(d.ok?("นำเข้าผู้ใช้ "+d.count+" คนแล้ว"):("นำเข้าไม่สำเร็จ: "+(d.error||"")));loadPerm();}).catch(function(){rb.disabled=false;rb.textContent="↻ นำเข้า/รีเฟรชจาก Google Sheet";if(window.notify)notify("นำเข้าไม่สำเร็จ");});};document.querySelectorAll('.nav[data-page="permissions"]').forEach(function(b){b.addEventListener("click",loadPerm);});loadPerm();var _rst=document.getElementById("reset");if(_rst&&!window.__WT_PREVIEW__)_rst.style.display="none";var _sm=document.getElementById("wtSideMode");if(_sm)_sm.textContent=window.__WT_PREVIEW__?"Preview mode · ข้อมูลตัวอย่าง":"โหมดใช้งานจริง · เชื่อม Google Sheet แล้ว";})();
;
/* Guard: some browsers / password managers autofill a bare text input with the logged-in
   user's email. If that lands in a search box, the list filters to the user's email — which
   matches no card (search haystacks are names, not emails) — so the board/pages look empty
   ("งานหาย"). The inputs now carry anti-autofill attributes; this clears any value the
   browser still injects that equals the current user's own email/name, across a few delayed
   passes (autofill fires after load), then re-renders. It never blocks real typing. */
(function(){
  var u=window.__WT_USER__||{};
  var bad=[String(u.email||'').trim().toLowerCase(),String(u.name||'').trim().toLowerCase()].filter(Boolean);
  if(!bad.length)return;
  var map=[['#query','render'],['#cpSearch','renderCP'],['#soSearch','renderSO'],['#lvSearch','renderLeave']];
  function sweep(){
    map.forEach(function(p){
      var el=document.querySelector(p[0]); if(!el)return;
      var v=String(el.value||'').trim().toLowerCase();
      if(v&&bad.indexOf(v)>=0){
        el.value='';
        try{if(typeof window[p[1]]==='function')window[p[1]]();}catch(e){}
      }
    });
  }
  [0,200,600,1200,2000].forEach(function(ms){setTimeout(sweep,ms);});
  try{window.addEventListener('load',function(){setTimeout(sweep,50);});}catch(e){}
  // Some password managers fill a field only when it gains focus — re-check shortly after.
  try{document.addEventListener('focusin',function(e){var t=e&&e.target;if(t&&t.matches&&t.matches('#query,#cpSearch,#soSearch,#lvSearch'))setTimeout(sweep,60);},true);}catch(e){}
})();