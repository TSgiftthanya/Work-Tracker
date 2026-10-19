/* Workload & Capacity & KPI engine — pure, framework-free, works in Node and browser.
   Single source of truth = Job Tracker tasks + leave + people. No mock data. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.WCAP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DEFAULTS = {
    media: {
      "บันทึก": { "สื่อสารทั่วไป": { base: 1, hrs: 1.0 }, "BlankForm": { base: 1, hrs: 0.5 }, "_default": { base: 1, hrs: 1.0 } },
      "Infographic": { "มีPattern(บันทึก)": { base: 2, hrs: 2.0 }, "New Design": { base: 3, hrs: 4.0 }, "กระบวนการละเอียด": { base: 4, hrs: 6.0 }, "_default": { base: 2, hrs: 2.0 } },
      "VDO": { "Short Clip": { base: 3, hrs: 4.0 }, "Long Clip": { base: 5, hrs: 8.0 }, "ข้อมูลซับซ้อน": { base: 6, hrs: 10.0 }, "Editing": { base: 4, hrs: 4.0 }, "_default": { base: 3, hrs: 4.0 } }
    },
    checkerBase: 1, checkerHrs: 0.5, approvalBase: 1, approvalHrs: 0.5,
    difficulty: { Easy: 1.00, Medium: 1.25, Hard: 1.50 },
    importance: { Normal: 1.00, High: 1.15, Critical: 1.30 },
    urgency: { Normal: 1.00, Urgent: 1.15, Emergency: 1.30 },
    responsibility: { primary: 90, support: 10 },
    kpiWeights: { productivity: 30, timeliness: 30, quality: 25, ownership: 15 },
    capacity: { benchmark: 0.625, scheduledHours: 160, hoursPerLeaveDay: 8, meetingHours: 0, otherHours: 0, perMember: {} },
    statusThresholds: { balanced: 70, high: 90, overload: 100 },
    grades: [{ min: 90, label: "Excellent" }, { min: 80, label: "Good" }, { min: 70, label: "Meets Expectations" }, { min: 0, label: "Needs Improvement" }]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function settings(user) { // shallow-merge user overrides onto DEFAULTS (one level + known subkeys)
    var S = clone(DEFAULTS); if (!user) return S;
    ["checkerBase", "approvalBase", "checkerHrs", "approvalHrs"].forEach(function (k) { if (user[k] != null) S[k] = user[k]; });
    if (user.media) { for (var m in user.media) { S.media[m] = S.media[m] || {}; for (var dk in user.media[m]) { S.media[m][dk] = Object.assign({}, S.media[m][dk] || {}, user.media[m][dk]); } } }
    ["difficulty", "importance", "urgency", "responsibility", "kpiWeights", "capacity", "statusThresholds"].forEach(function (k) {
      if (user[k]) { for (var kk in user[k]) S[k][kk] = user[k][kk]; }
    });
    if (user.grades) S.grades = user.grades;
    return S;
  }

  var MEDIA = ["บันทึก", "Infographic", "VDO"];
  function round1(n) { return Math.round(n * 10) / 10; }

  // task.priority (single field) -> difficulty/importance/urgency keys
  function taskMods(t) {
    return { dif: t.difficulty || "Easy", imp: t.priority === "High" ? "High" : (t.importance || "Normal"), urg: t.priority === "Urgent" ? "Urgent" : (t.urgency || "Normal") };
  }
  function mult(S, m) { return (S.difficulty[m.dif] || 1) * (S.importance[m.imp] || 1) * (S.urgency[m.urg] || 1); }
  function mediaCell(S, media, detail) { var mm = S.media[media]; if (!mm) return { base: 0, hrs: 0 }; return mm[detail] || mm["_default"] || { base: 0, hrs: 0 }; }
  function baseFor(S, media, detail) { return mediaCell(S, media, detail).base || 0; }
  function hrsFor(S, media, detail) { return mediaCell(S, media, detail).hrs || 0; }

  function taskUnits(t) { // media units {media,detail,owner}; handles legacy kind-only tasks
    var out = [], ty = t.types || [];
    if (ty.length) ty.forEach(function (x) { if (x && x.type) out.push({ media: x.type, detail: x.detail || "", owner: x.owner || t.lead || "" }); });
    else { var m = { Copy: "บันทึก", Infographic: "Infographic", Video: "VDO" }[t.kind]; if (m) out.push({ media: m, detail: "", owner: t.lead || "" }); }
    return out;
  }
  function supportList(t) { return (t.support || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean); }

  // Job Workload for one media unit = Base x Difficulty x Importance x Urgency
  function jobUnitWorkload(S, t, unit) { return baseFor(S, unit.media, unit.detail) * mult(S, taskMods(t)); }

  // Responsibility shares for a task's production work -> {primary, supportEach, nSupport} (sum=100%)
  function responsibility(S, t) {
    var sup = supportList(t), n = sup.length;
    if (!n) return { primary: 1, supportEach: 0, nSupport: 0, support: [] };
    return { primary: S.responsibility.primary / 100, supportEach: (S.responsibility.support / 100) / n, nSupport: n, support: sup };
  }

  // Per-member workload across a task set. Returns {member:{บันทึก,Infographic,VDO,checker,approval,total}}
  function memberWorkload(tasks, S) {
    S = S || DEFAULTS; var acc = {};
    function ensure(p) { return acc[p] || (acc[p] = { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0, total: 0 }); }
    tasks.forEach(function (t) {
      if (t.status === "Cancelled") return;
      var mu = mult(S, taskMods(t)), units = taskUnits(t), R = responsibility(S, t), mediaSeen = {};
      units.forEach(function (u) {
        mediaSeen[u.media] = 1;
        var jw = baseFor(S, u.media, u.detail) * mu;
        if (u.owner) { var a = ensure(u.owner); if (a[u.media] != null) a[u.media] += jw * R.primary; a.total += jw * R.primary; }
        R.support.forEach(function (sp) { var a = ensure(sp); if (a[u.media] != null) a[u.media] += jw * R.supportEach; a.total += jw * R.supportEach; });
      });
      if (t.checker) { var nC = Object.keys(mediaSeen).length || 1; var cv = S.checkerBase * mu * nC; var a = ensure(t.checker); a.checker += cv; a.total += cv; }
      if (t.approver) { var av = S.approvalBase * mu; var b = ensure(t.approver); b.approval += av; b.total += av; }
    });
    for (var p in acc) { MEDIA.forEach(function (m) { acc[p][m] = round1(acc[p][m]); }); acc[p].checker = round1(acc[p].checker); acc[p].approval = round1(acc[p].approval); acc[p].total = round1(acc[p].total); }
    return acc;
  }

  // Approved leave days for a member within YYYY-MM (honours half-day + weekend/holiday off)
  function leaveDays(leaveReqs, member, ym, leaveSettings) {
    leaveReqs = leaveReqs || []; var ls = leaveSettings || { weekendOff: true, holidays: [] };
    function isOff(ds) { var g = new Date(ds + "T00:00:00").getDay(); var we = ls.weekendOff && (g === 0 || g === 6); var ho = (ls.holidays || []).some(function (h) { return h.date === ds; }); return we || ho; }
    var days = 0;
    leaveReqs.forEach(function (r) {
      if (r.emp !== member || r.status !== "Approved") return;
      var s = new Date((r.start || "") + "T00:00:00"), e = new Date((r.end || r.start || "") + "T00:00:00"), g = 0, wd = [];
      while (s <= e && g < 400) { var ds = s.getFullYear() + "-" + ("0" + (s.getMonth() + 1)).slice(-2) + "-" + ("0" + s.getDate()).slice(-2); if (!isOff(ds) && (!ym || ds.slice(0, 7) === ym)) wd.push(ds); s.setDate(s.getDate() + 1); g++; }
      if (!wd.length) return;
      days += ((r.duration === "am" || r.duration === "pm") && wd.length === 1) ? 0.5 : wd.length;
    });
    return days;
  }

  // nMonths scales the monthly scheduled/meeting/other budget when a scope spans several months.
  function capacity(member, S, lvDays, nMonths) {
    S = S || DEFAULTS; nMonths = nMonths || 1; var c = S.capacity, pm = c.perMember[member] || {};
    var sched = (pm.scheduledHours != null ? pm.scheduledHours : c.scheduledHours) * nMonths;
    var meeting = (pm.meetingHours != null ? pm.meetingHours : c.meetingHours) * nMonths;
    var other = (pm.otherHours != null ? pm.otherHours : c.otherHours) * nMonths;
    var leaveH = (lvDays || 0) * c.hoursPerLeaveDay;
    var avail = Math.max(0, sched - leaveH - meeting - other);
    return { scheduled: sched, leaveDays: lvDays || 0, leaveHours: leaveH, meeting: meeting, other: other, availHours: avail, points: round1(avail * c.benchmark), months: nMonths };
  }
  function utilization(plannedWorkload, capPoints) { return capPoints > 0 ? Math.round(100 * plannedWorkload / capPoints) : null; }
  function loadStatus(util, S) { if (util == null) return "N/A"; var th = (S || DEFAULTS).statusThresholds; if (util > th.overload) return "Overload"; if (util > th.high) return "High Load"; if (util >= th.balanced) return "Balanced"; return "Available"; }

  // Planned (standard) hours for a whole task = Σ unit Std-Hrs × mult (+ checker/approval hrs). Basis for Productivity.
  function plannedHours(S, t) {
    S = S || DEFAULTS; var mu = mult(S, taskMods(t)), h = 0, units = taskUnits(t), ms = {};
    units.forEach(function (u) { ms[u.media] = 1; h += hrsFor(S, u.media, u.detail) * mu; });
    if (t.checker) h += (S.checkerHrs || 0) * mu * (Object.keys(ms).length || 1);
    if (t.approver) h += (S.approvalHrs || 0) * mu;
    return round1(h);
  }
  function ownedCompleted(tasks, member) {
    return tasks.filter(function (t) { return t.status === "Completed" && (t.lead === member || (t.types || []).some(function (u) { return u && u.owner === member; })); });
  }
  // Productivity = planned Std-Hrs / actual hours logged (capped at 100; faster-than-standard = 100). N/A if no actual hours.
  function productivity(tasks, member, S) {
    S = S || DEFAULTS; var comp = ownedCompleted(tasks, member), planned = 0, actual = 0, n = 0;
    comp.forEach(function (t) { if (t.actualHours != null && t.actualHours !== "" && +t.actualHours > 0) { planned += plannedHours(S, t); actual += +t.actualHours; n++; } });
    if (!n || actual <= 0) return null;
    return Math.min(100, Math.round(100 * planned / actual));
  }
  // Quality = first-pass rate (revisions = 0) over completed tasks that have revision data. N/A if none logged.
  function quality(tasks, member, S) {
    var comp = ownedCompleted(tasks, member), tot = 0, fp = 0;
    comp.forEach(function (t) { if (t.revisions != null && t.revisions !== "") { tot++; if (+t.revisions <= 0) fp++; } });
    if (!tot) return null;
    return Math.round(100 * fp / tot);
  }

  // KPI — honest: computes what data supports, marks the rest N/A, re-normalises weights (never auto-zero).
  // own = manager Ownership rubric score 0..100 (or null/"" -> N/A).
  function kpi(tasks, member, S, own) {
    S = S || DEFAULTS;
    var mine = tasks.filter(function (t) { return t.lead === member || (t.types || []).some(function (u) { return u && u.owner === member; }); });
    var comp = mine.filter(function (t) { return t.status === "Completed"; });
    var timeliness = null;
    if (comp.length) { var w = 0, ok = 0; comp.forEach(function (t) { var ww = 1; w += ww; var dlv = t.completed || t.publish || ""; if (t.due && dlv && dlv <= t.due) ok += ww; }); timeliness = Math.round(100 * ok / w); }
    var prod = productivity(tasks, member, S);
    var qual = quality(tasks, member, S);
    var ownership = (own != null && own !== "") ? Math.max(0, Math.min(100, Math.round(+own))) : null;
    var parts = [["productivity", prod], ["timeliness", timeliness], ["quality", qual], ["ownership", ownership]];
    var wsum = 0, sc = 0, avail = [], na = [];
    parts.forEach(function (p) { if (p[1] != null) { var wt = S.kpiWeights[p[0]] || 0; wsum += wt; sc += p[1] * wt; avail.push(p[0]); } else na.push(p[0]); });
    var total = wsum ? Math.round(sc / wsum) : null;
    return { productivity: prod, timeliness: timeliness, quality: qual, ownership: ownership, total: total, available: avail, na: na, completed: comp.length };
  }
  function grade(total, S) { if (total == null) return "N/A"; var g = (S || DEFAULTS).grades; for (var i = 0; i < g.length; i++) if (total >= g[i].min) return g[i].label; return g[g.length - 1].label; }

  // Team roll-up for Overview. ym = "YYYY-MM" | ["YYYY-MM", …] | null. ownStore = {member: ownershipScore} (optional).
  function team(tasks, people, S, leaveReqs, ym, leaveSettings, ownStore) {
    S = S || DEFAULTS; ownStore = ownStore || {};
    var months = Array.isArray(ym) ? ym.slice() : (ym ? [ym] : []);
    var nMonths = months.length || 1;
    var wl = memberWorkload(tasks, S), rows = [];
    people.forEach(function (p) {
      var w = wl[p] || { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0, total: 0 };
      var lv = months.length ? months.reduce(function (s, m) { return s + leaveDays(leaveReqs, p, m, leaveSettings); }, 0) : leaveDays(leaveReqs, p, null, leaveSettings);
      var cap = capacity(p, S, lv, nMonths);
      var util = utilization(w.total, cap.points);
      var k = kpi(tasks, p, S, ownStore[p] != null ? ownStore[p] : null);
      rows.push({ member: p, workload: w, capacity: cap, utilization: util, status: loadStatus(util, S), kpi: k, grade: grade(k.total, S) });
    });
    var totW = rows.reduce(function (s, r) { return s + r.workload.total; }, 0);
    var totC = rows.reduce(function (s, r) { return s + r.capacity.points; }, 0);
    var overloaded = rows.filter(function (r) { return r.status === "Overload"; }).length;
    var kpis = rows.map(function (r) { return r.kpi.total; }).filter(function (x) { return x != null; });
    var overdue = tasks.filter(function (t) { return t.status !== "Completed" && t.status !== "On Hold" && t.status !== "Cancelled" && t.due && t.due < (new Date().toISOString().slice(0, 10)); }).length;
    return {
      rows: rows, totalWorkload: round1(totW), totalCapacity: round1(totC),
      avgUtilization: totC > 0 ? Math.round(100 * totW / totC) : null,
      avgKpi: kpis.length ? Math.round(kpis.reduce(function (a, b) { return a + b; }, 0) / kpis.length) : null,
      overloaded: overloaded, overdue: overdue
    };
  }

  // Workload by media type (team) for the Overview donut
  function mediaBreakdown(tasks, S) {
    var wl = memberWorkload(tasks, S), agg = { "บันทึก": 0, "Infographic": 0, "VDO": 0, checker: 0, approval: 0 };
    for (var p in wl) { ["บันทึก", "Infographic", "VDO", "checker", "approval"].forEach(function (k) { agg[k] += wl[p][k]; }); }
    for (var k in agg) agg[k] = round1(agg[k]);
    return agg;
  }

  // Per-month team roll-up for trend charts. months = ["2026-05", …] (ascending).
  // ownStoreByYm = {ym:{member:score}} (optional). Each month's scope = tasks whose due/publish is in that month.
  function trend(tasks, people, S, leaveReqs, months, leaveSettings, ownStoreByYm) {
    S = S || DEFAULTS; ownStoreByYm = ownStoreByYm || {};
    return (months || []).map(function (ym) {
      var scoped = tasks.filter(function (t) { return t.status !== "Cancelled" && ((t.due && t.due.slice(0, 7) === ym) || (t.publish && t.publish.slice(0, 7) === ym)); });
      var T = team(scoped, people, S, leaveReqs, ym, leaveSettings, ownStoreByYm[ym] || {});
      return { ym: ym, workload: T.totalWorkload, capacity: T.totalCapacity, utilization: T.avgUtilization, kpi: T.avgKpi, overloaded: T.overloaded, overdue: T.overdue };
    });
  }

  return {
    DEFAULTS: DEFAULTS, settings: settings, MEDIA: MEDIA,
    taskMods: taskMods, mult: mult, baseFor: baseFor, hrsFor: hrsFor, taskUnits: taskUnits, supportList: supportList,
    jobUnitWorkload: jobUnitWorkload, responsibility: responsibility, plannedHours: plannedHours,
    memberWorkload: memberWorkload, leaveDays: leaveDays, capacity: capacity, utilization: utilization, loadStatus: loadStatus,
    productivity: productivity, quality: quality, kpi: kpi, grade: grade, team: team, mediaBreakdown: mediaBreakdown, trend: trend, round1: round1
  };
});
