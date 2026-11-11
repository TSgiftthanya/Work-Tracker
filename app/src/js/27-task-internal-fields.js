/* Task modal: "หัวข้อ" + "หน่วยงาน" single-selects.
   Options come from จัดการดรอปดาวน์ (Master Data) → int_topic / int_dept.
   Shown only when ประเภทการสื่อสาร = Internal. Saved on the task as intTopic / intDept. */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function fill(selId,key,cur){
    var el=document.getElementById(selId); if(!el)return;
    var opts=(window.DDget?window.DDget(key):[])||[];
    cur=cur==null?'':String(cur);
    // keep a value that was already saved even if it was later removed from master data
    if(cur&&opts.indexOf(cur)<0)opts=[cur].concat(opts);
    el.innerHTML='<option value="">— เลือก —</option>'+opts.map(function(v){
      return '<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(v)+'</option>';
    }).join('');
    el.value=cur;
  }
  function isInternal(){var c=document.getElementById('fComm');return !c||c.value==='Internal';}
  // Populate both selects for a task and show/hide per comm type.
  window.wtFillIntFields=function(t){
    t=t||{};
    fill('fIntTopic','int_topic',t.intTopic);
    fill('fIntDept','int_dept',t.intDept);
    window.wtToggleIntFields();
  };
  // Show/hide the Internal-only row; when showing, refresh options against the
  // latest master data while keeping the current selection.
  window.wtToggleIntFields=function(){
    var on=isInternal();
    ['fIntTopicField','fIntDeptField'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display=on?'':'none';});
    if(on){
      fill('fIntTopic','int_topic',(document.getElementById('fIntTopic')||{}).value);
      fill('fIntDept','int_dept',(document.getElementById('fIntDept')||{}).value);
    }
  };
})();
