// Unit tests for the WCAP engine (run: node wcap.test.js)
var W = require("../js/21a-wcap-engine.js");
var S = W.settings();
var pass = 0, fail = 0;
function eq(name, got, exp) { var ok = Math.abs((got || 0) - (exp || 0)) < 1e-6 || got === exp; console.log((ok ? "PASS" : "FAIL") + " · " + name + "  got=" + got + " exp=" + exp); ok ? pass++ : fail++; }
function ok(name, cond) { console.log((cond ? "PASS" : "FAIL") + " · " + name); cond ? pass++ : fail++; }

// 1) base score lookup (detail + default fallback)
eq("base Infographic/New Design = 3", W.baseFor(S, "Infographic", "New Design"), 3);
eq("base VDO/Long Clip = 5", W.baseFor(S, "VDO", "Long Clip"), 5);
eq("base Infographic/'' falls back to default 2", W.baseFor(S, "Infographic", ""), 2);

// 2) multiplier from priority (High->importance1.15, Urgent->urgency1.15)
eq("mult Normal = 1.00", W.mult(S, W.taskMods({ priority: "Normal" })), 1.00);
eq("mult High = 1.15", W.mult(S, W.taskMods({ priority: "High" })), 1.15);
eq("mult Urgent = 1.15", W.mult(S, W.taskMods({ priority: "Urgent" })), 1.15);

// 3) job unit workload = base x mult
eq("jobUnit Infographic/New Design @High = 3*1.15 = 3.45",
  W.jobUnitWorkload(S, { priority: "High" }, { media: "Infographic", detail: "New Design" }), 3.45);

// 4) responsibility split sums to 100%
var r1 = W.responsibility(S, { support: "" });
ok("no support -> primary 100%", r1.primary === 1 && r1.supportEach === 0);
var r2 = W.responsibility(S, { support: "A, B" });
ok("support x2 -> 90% + 2*(5%) = 100%", Math.abs(r2.primary + r2.supportEach * r2.nSupport - 1) < 1e-9 && r2.nSupport === 2);

// 5) member workload: single task, owner primary, support split, checker, approver
var tasks = [{
  id: 1, status: "In Progress", priority: "Normal", lead: "Gift", support: "Mint",
  checker: "Beam", approver: "Ploy",
  types: [{ type: "Infographic", owner: "Gift", detail: "New Design" }, { type: "VDO", owner: "Gift", detail: "Short Clip" }]
}];
var wl = W.memberWorkload(tasks, S);
// Gift: Infographic 3*0.9=2.7, VDO 3*0.9=2.7 -> total 5.4
eq("Gift Infographic = 2.7", wl.Gift["Infographic"], 2.7);
eq("Gift VDO = 2.7", wl.Gift["VDO"], 2.7);
eq("Gift total = 5.4", wl.Gift.total, 5.4);
// Mint (support 10% of each media): 3*0.1 + 3*0.1 = 0.6
eq("Mint (support) total = 0.6", wl.Mint.total, 0.6);
// Beam checker: 2 media types * base1 = 2
eq("Beam checker = 2", wl.Beam.checker, 2);
// Ploy approver: base1 = 1
eq("Ploy approval = 1", wl.Ploy.approval, 1);

// 6) legacy task (kind only, no types) -> lead owns media default
var wl2 = W.memberWorkload([{ id: 2, status: "To Do", kind: "Video", lead: "Nok", priority: "Normal" }], S);
eq("legacy Nok VDO default base 3", wl2.Nok["VDO"], 3);

// 7) capacity + utilization + status
var cap = W.capacity("Gift", S, 0); // 160h * 0.625 = 100 pts
eq("capacity points (160h,0.625) = 100", cap.points, 100);
eq("utilization 50/100 = 50%", W.utilization(50, 100), 50);
ok("status 50% -> Available", W.loadStatus(50, S) === "Available");
ok("status 80% -> Balanced", W.loadStatus(80, S) === "Balanced");
ok("status 95% -> High Load", W.loadStatus(95, S) === "High Load");
ok("status 120% -> Overload", W.loadStatus(120, S) === "Overload");

// 8) leave reduces capacity (2 approved days -> -16h)
var capL = W.capacity("Gift", S, 2);
eq("capacity with 2 leave days = (160-16)*0.625 = 90", capL.points, 90);

// 9) KPI honest N/A + re-normalise (only timeliness available)
var kt = [{ status: "Completed", lead: "Gift", due: "2026-10-10", completed: "2026-10-09" },
          { status: "Completed", lead: "Gift", due: "2026-10-10", completed: "2026-10-12" }];
var k = W.kpi(kt, "Gift", S);
eq("timeliness 1/2 on-time = 50", k.timeliness, 50);
ok("productivity/quality/ownership = N/A", k.productivity === null && k.quality === null && k.ownership === null);
eq("total re-normalised to timeliness only = 50", k.total, 50);
ok("na lists 3 components", k.na.length === 3);
// no data -> total N/A (never auto-zero)
ok("no completed -> total N/A", W.kpi([], "X", S).total === null);

// 10) partial media override must NOT wipe sibling details/_default (deep-merge)
var Sover = W.settings({ media: { "บันทึก": { "สื่อสารทั่วไป": { base: 9 } } } });
ok("override base kept = 9", Sover.media["บันทึก"]["สื่อสารทั่วไป"].base === 9);
ok("override keeps hrs of same cell", Sover.media["บันทึก"]["สื่อสารทั่วไป"].hrs === 1.0);
ok("override keeps sibling BlankForm", Sover.media["บันทึก"]["BlankForm"] && Sover.media["บันทึก"]["BlankForm"].base === 1);
ok("override keeps _default + other media", Sover.media["บันทึก"]["_default"].base === 1 && Sover.media["Infographic"]["New Design"].base === 3);

// 11) planned standard hours (Σ unit Std-Hrs × mult, + checker/approver hrs)
eq("plannedHours Info/New Design @Normal = 4", W.plannedHours(S, { priority: "Normal", types: [{ type: "Infographic", owner: "G", detail: "New Design" }] }), 4);
eq("plannedHours + checker(0.5) + approver(0.5) over บันทึก(1.0) = 2.0",
  W.plannedHours(S, { priority: "Normal", checker: "C", approver: "A", types: [{ type: "บันทึก", owner: "G", detail: "สื่อสารทั่วไป" }] }), 2.0);

var pt = [
  { id: 11, status: "Completed", lead: "Gift", priority: "Normal", due: "2026-10-10", completed: "2026-10-09", types: [{ type: "Infographic", owner: "Gift", detail: "New Design" }], actualHours: 4, revisions: 0 },
  { id: 12, status: "Completed", lead: "Gift", priority: "Normal", due: "2026-10-10", completed: "2026-10-12", types: [{ type: "VDO", owner: "Gift", detail: "Short Clip" }], actualHours: 8, revisions: 2 }
];
// 12) productivity = planned/actual, capped at 100, N/A without actual hours
eq("productivity planned8/actual12 = 67", W.productivity(pt, "Gift", S), 67);
ok("productivity N/A when no actual hours", W.productivity([{ id: 9, status: "Completed", lead: "Gift", types: [{ type: "VDO", owner: "Gift" }] }], "Gift", S) === null);
ok("productivity capped 100 when faster than std", W.productivity([{ id: 8, status: "Completed", lead: "Gift", priority: "Normal", types: [{ type: "VDO", owner: "Gift", detail: "Short Clip" }], actualHours: 1 }], "Gift", S) === 100);
// 13) quality = first-pass rate over tasks with revision data
eq("quality first-pass 1/2 = 50", W.quality(pt, "Gift", S), 50);
ok("quality N/A when no revision data", W.quality([{ id: 7, status: "Completed", lead: "Gift", types: [{ type: "VDO", owner: "Gift" }] }], "Gift", S) === null);
// 14) KPI with all four components available (ownership passed in)
var k4 = W.kpi(pt, "Gift", S, 80);
eq("kpi productivity = 67", k4.productivity, 67);
eq("kpi quality = 50", k4.quality, 50);
eq("kpi timeliness = 50", k4.timeliness, 50);
eq("kpi ownership = 80", k4.ownership, 80);
eq("kpi total weighted (67*30+50*30+50*25+80*15)/100 = 60", k4.total, 60);
ok("kpi all 4 available, na empty", k4.na.length === 0 && k4.available.length === 4);
eq("ownership clamped 150 -> 100", W.kpi(pt, "Gift", S, 150).ownership, 100);
ok("ownership '' -> N/A", W.kpi(pt, "Gift", S, "").ownership === null);
// 15) trend returns per-month team roll-up
var trd = W.trend(pt, ["Gift"], S, [], ["2026-10"], null, {});
ok("trend one month, ym tagged", trd.length === 1 && trd[0].ym === "2026-10");
ok("trend month carries numeric workload", typeof trd[0].workload === "number" && trd[0].workload > 0);

// 16) multi-month filter: capacity scales by nMonths, team accepts an array of months
eq("capacity 2 months = 200 pts", W.capacity("Gift", S, 0, 2).points, 200);
eq("capacity 2 months w/ 2 leave days = (320-16)*0.625 = 190", W.capacity("Gift", S, 2, 2).points, 190);
var tmArr = W.team(pt, ["Gift"], S, [], ["2026-09", "2026-10"], null, {});
ok("team array ym -> nMonths 2, capacity doubled", tmArr.rows[0].capacity.months === 2 && tmArr.rows[0].capacity.points === 200);
ok("team single ym string still nMonths 1", W.team(pt, ["Gift"], S, [], "2026-10", null, {}).rows[0].capacity.months === 1);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
