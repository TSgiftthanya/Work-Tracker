(function(){function wire(){
 document.querySelectorAll('.dtp-view').forEach(function(b){b.onclick=function(){window.__dtpView=b.dataset.dtpview;document.querySelectorAll('.dtp-view').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});var _mc=document.getElementById('dtpMatrixCtl');if(_mc)_mc.hidden=false;if(typeof render==='function')render();};});
 if(window.setupMemberMS)setupMemberMS('dtpMember','__dtpMembers');
 document.querySelectorAll('.dtp-orient').forEach(function(b){b.onclick=function(){window.__dtpOrient=b.dataset.or;document.querySelectorAll('.dtp-orient').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});if(typeof render==='function')render();};});
 var mc=document.getElementById('dtpMatrixCtl');if(mc)mc.hidden=false;
 var d=document.getElementById('dtpDate'),g=document.getElementById('dtpGran');
 function _today(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
 var s0=document.getElementById('dtpStart'),e0=document.getElementById('dtpEnd'),dash=document.getElementById('dtpDash');
 function _sync(){if(!g)return;window.__dtpGran=g.value;var isCustom=(g.value==='custom');var isSingle=(g.value!=='all'&&!isCustom);
  if(d){d.hidden=!isSingle;if(isSingle&&!d.value)d.value=_today();window.__dtpDate=isSingle?d.value:'';}
  [s0,e0,dash].forEach(function(x){if(x)x.hidden=!isCustom;});
  if(isCustom){if(s0&&!s0.value)s0.value=_today();if(e0&&!e0.value)e0.value=_today();window.__dtpStart=s0?s0.value:'';window.__dtpEnd=e0?e0.value:'';}
  if(typeof render==='function')render();}
 if(g)g.onchange=_sync;
 if(d)d.onchange=function(){window.__dtpDate=d.value;if(typeof render==='function')render();};
 if(s0)s0.onchange=function(){window.__dtpStart=s0.value;if(typeof render==='function')render();};
 if(e0)e0.onchange=function(){window.__dtpEnd=e0.value;if(typeof render==='function')render();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();})();