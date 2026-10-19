(function(){function wire(){
 document.querySelectorAll('.tp-view').forEach(function(b){b.onclick=function(){window.__tpView=b.dataset.tpview;document.querySelectorAll('.tp-view').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});var _mc=document.getElementById('tpMatrixCtl');if(_mc)_mc.hidden=false;if(typeof render==='function')render();};});
 (function(){var DIMS=[['member','สมาชิก'],['media','ประเภทสื่อ'],['detail','รายละเอียด'],['role','บทบาท']];if(window.setupMemberMS)setupMemberMS('tpMember','__tpMembers');document.querySelectorAll('.tp-orient').forEach(function(b){b.onclick=function(){window.__tpOrient=b.dataset.or;document.querySelectorAll('.tp-orient').forEach(function(x){x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b);});if(typeof render==='function')render();};});var mc=document.getElementById('tpMatrixCtl');if(mc)mc.hidden=false;})();var d=document.getElementById('tpDate');var g=document.getElementById('tpGran');
 function _today(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
 var st=document.getElementById('tpStart'),en=document.getElementById('tpEnd'),dash=document.getElementById('tpDash');
 function _sync(){if(!g)return;window.__tpGran=g.value;var isCustom=(g.value==='custom');var isSingle=(g.value!=='all'&&!isCustom);
  if(d){d.hidden=!isSingle;if(isSingle&&!d.value)d.value=_today();window.__tpDate=isSingle?d.value:'';}
  [st,en,dash].forEach(function(x){if(x)x.hidden=!isCustom;});
  if(isCustom){if(st&&!st.value)st.value=_today();if(en&&!en.value)en.value=_today();window.__tpStart=st?st.value:'';window.__tpEnd=en?en.value:'';}
  if(typeof render==='function')render();}
 if(g)g.onchange=_sync;
 if(d)d.onchange=function(){window.__tpDate=d.value;if(typeof render==='function')render();};
 if(st)st.onchange=function(){window.__tpStart=st.value;if(typeof render==='function')render();};
 if(en)en.onchange=function(){window.__tpEnd=en.value;if(typeof render==='function')render();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();})();