(function(){
var MAP=[['tm_note','บันทึก','Copy'],['tm_info','Infographic','Infographic'],['tm_vdo','VDO','Video']];
var TM_DETAILS={'บันทึก':['สื่อสารทั่วไป','BlankForm'],'Infographic':['มีPattern(บันทึก)','New Design','กระบวนการละเอียด'],'VDO':['Short Clip','Long Clip','ข้อมูลซับซ้อน','Editing']};
function q(id){return document.getElementById(id);}
window.wtTypes=function(){var types=[],kind='',lead='';MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(c&&c.checked){var owner=o?o.value:'';types.push({type:m[1],owner:owner,detail:d?d.value:''});if(!kind){kind=m[2];lead=owner;}}});return {types:types,kind:kind,lead:lead};};
window.wtFillTypes=function(t){var ppl=(typeof people!=='undefined'&&people)?people:[];var byOwn={},byDet={};((t&&t.types)||[]).forEach(function(x){if(x&&x.type){byOwn[x.type]=x.owner||'';byDet[x.type]=x.detail||'';}});
 var hasTypes=!!(t&&t.types&&t.types.length);
 MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(!c||!o)return;
  o.innerHTML=ppl.map(function(p){return '<option value="'+p+'">'+p+'</option>';}).join('');
  if(d){var _dl=((window.DDdetail?window.DDdetail(m[1]):null)||TM_DETAILS[m[1]]||[]).slice();if(hasTypes&&(m[1] in byDet)&&byDet[m[1]]&&_dl.indexOf(byDet[m[1]])<0)_dl.push(byDet[m[1]]);d.innerHTML=_dl.map(function(x){return '<option value="'+x+'">'+x+'</option>';}).join('');}
  if(hasTypes){var on=(m[1] in byOwn);c.checked=on;o.value=on?(byOwn[m[1]]||(t.lead||ppl[0])):((t&&t.lead)||ppl[0]);if(d&&on&&byDet[m[1]])d.value=byDet[m[1]];}
  else{var match=(t&&((t.kind==='Copy'&&m[1]==='บันทึก')||(t.kind==='Infographic'&&m[1]==='Infographic')||(t.kind==='Video'&&m[1]==='VDO')));c.checked=!!match;o.value=(t&&t.lead)||ppl[0];}
  o.disabled=!c.checked;if(d)d.disabled=!c.checked;});
};
function wire(){MAP.forEach(function(m){var c=q(m[0]+'_chk'),o=q(m[0]+'_own'),d=q(m[0]+'_detail');if(c&&!c._wl){c._wl=1;c.addEventListener('change',function(){if(o)o.disabled=!c.checked;if(d)d.disabled=!c.checked;});}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();