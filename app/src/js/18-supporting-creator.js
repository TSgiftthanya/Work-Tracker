(function(){
window.wtSupportMS=function(){
 var btn=document.getElementById('fSupportBtn'),pop=document.getElementById('fSupportPop'),inp=document.getElementById('fSupport');
 if(!btn||!pop||!inp)return;
 if(!window._msCss){window._msCss=1;document.head.insertAdjacentHTML('beforeend','<style>.ms-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#fff;border:1px solid #d7e0ea;border-radius:10px;box-shadow:0 8px 24px #1936291f;padding:6px;min-width:160px;max-height:260px;overflow:auto}.ms-opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;font-size:13px;cursor:pointer;white-space:nowrap}.ms-opt input[type=checkbox]{width:16px;height:16px;flex:none;padding:0;margin:0;border:0;accent-color:#1766cc;cursor:pointer}.ms-opt:hover{background:#f4f8ff}.ms-btn{cursor:pointer;background:#fff;text-align:left}</style>');}
 function cur(){return (inp.value||'').split(',').map(function(x){return x.trim();}).filter(Boolean);}
 var opts=(window.DDget?window.DDget('supporting'):[]);if(!opts||!opts.length)opts=(typeof people!=='undefined'?people.slice():[]);
 cur().forEach(function(v){if(opts.indexOf(v)<0)opts.push(v);});
 function label(){var a=cur();btn.textContent=(a.length?(a.length<=2?a.join(', '):a.length+' คน'):'— เลือกผู้ช่วย —');}
 function build(){var a=cur();pop.innerHTML=opts.length?opts.map(function(pp){return '<label class="ms-opt"><input type="checkbox" value="'+pp+'" '+(a.indexOf(pp)>=0?'checked':'')+'> '+pp+'</label>';}).join(''):'<div class="tiny muted" style="padding:6px">ยังไม่มีรายชื่อ — เพิ่มที่หน้าจัดการดรอปดาวน์</div>';
  [].forEach.call(pop.querySelectorAll('input'),function(c){c.onchange=function(){var a=cur();if(c.checked){if(a.indexOf(c.value)<0)a.push(c.value);}else{a=a.filter(function(x){return x!==c.value;});}inp.value=a.join(', ');label();};});}
 btn.onclick=function(e){e.stopPropagation();var willOpen=pop.hidden;document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});pop.hidden=!willOpen;if(willOpen)build();};
 pop.onclick=function(e){e.stopPropagation();};
 if(!window._msDocBound){window._msDocBound=1;document.addEventListener('click',function(){document.querySelectorAll('.ms-pop').forEach(function(x){x.hidden=true;});});}
 label();
};
})();