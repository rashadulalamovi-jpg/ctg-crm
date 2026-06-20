/**
 * CTG Click Shop — Strategy Hub Module
 * Version: 1.0  |  8 Strategies
 *
 * HOW TO ADD TO EXISTING CRM:
 * 1. Upload this file to same GitHub repo: ctg_strategy_hub.js
 * 2. Add ONE line before </body> in index.html:
 *    <script src="ctg_strategy_hub.js"></script>
 * 3. Done. No other changes needed.
 *
 * DATA KEYS READ (never written to):
 *   window.db.customers      — CRM live customers + invoices
 *   ctgstock_v2              — Stock age batches
 *   ctg_s1_targets           — Customer monthly targets (Strategy 1)
 *
 * DATA KEYS WRITTEN (own keys only):
 *   ctg_hub_s1_targets       — Monthly sales targets
 *   ctg_hub_s3_dubai         — Dubai Direct deals
 *   ctg_hub_s5_royal         — Royal benefit unlocks
 *   ctg_hub_s4_gaps          — SKU Gap tracker
 *   ctg_hub_s6_video         — Video Trust tracker
 *   ctg_hub_s7_psy           — Psychology profiles
 */
(function () {
  'use strict';

  // ══ 1. SAFE DATA HELPERS ══════════════════════════════════════════════════
  function getCustomers() {
    try { return (window.db && window.db.customers) || []; } catch (e) { return []; }
  }
  function getStockBatches() {
    try {
      var d = JSON.parse(localStorage.getItem('ctgstock_v2') || '{}');
      return d.batches || d.stockBatches || [];
    } catch (e) { return []; }
  }
  function lsGet(k, def) {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch (e) { return def; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysAgo(d) {
    if (!d) return '—';
    var ms = new Date() - new Date(d);
    var dy = Math.round(ms / 86400000);
    return dy === 0 ? 'Today' : dy + 'd ago';
  }
  function fmtM(n) { return '৳' + Number(Math.round(n || 0)).toLocaleString('en-BD'); }
  function pct(n) { return (n || 0).toFixed(1) + '%'; }

  // Per-strategy computed progress
  function calcProgress(id) {
    var custs = getCustomers();
    if (id === 1) {
      var tgts = lsGet('ctg_hub_s1_targets', {});
      var set = Object.keys(tgts).length;
      return custs.length > 0 ? Math.min(100, Math.round(set / custs.length * 100)) : 0;
    }
    if (id === 2) {
      var multi = 0, total = 0;
      custs.forEach(function (c) {
        (c.invoices || []).forEach(function (inv) {
          total++;
          if ((inv.items || []).length > 1) multi++;
        });
      });
      return total > 0 ? Math.round(multi / total * 100) : 0;
    }
    if (id === 3) {
      var deals = lsGet('ctg_hub_s3_dubai', []);
      var done = deals.filter(function (d) { return d.status === 'Completed'; }).length;
      return deals.length > 0 ? Math.round(done / deals.length * 100) : 0;
    }
    if (id === 4) {
      var gaps = lsGet('ctg_hub_s4_gaps', []);
      var scaled = gaps.filter(function (g) { return g.status === 'Scale'; }).length;
      return gaps.length > 0 ? Math.round(scaled / gaps.length * 100) : 0;
    }
    if (id === 5) {
      var royals = lsGet('ctg_hub_s5_royal', {});
      var full = Object.values(royals).filter(function (u) { return u.cour && u.cred; }).length;
      return custs.length > 0 ? Math.round(full / custs.length * 100) : 0;
    }
    if (id === 6) {
      var vids = lsGet('ctg_hub_s6_video', []);
      var conv = vids.filter(function (v) { return v.trialOrder; }).length;
      return vids.length > 0 ? Math.round(conv / vids.length * 100) : 0;
    }
    if (id === 7) {
      var profs = lsGet('ctg_hub_s7_psy', []);
      return custs.length > 0 ? Math.round(profs.length / custs.length * 100) : 0;
    }
    if (id === 8) {
      var batches = getStockBatches();
      var star = batches.filter(function (b) {
        var roi = b.costPc > 0 ? (b.sellPc - b.costPc) / b.costPc * 100 : 0;
        return roi >= 15;
      }).length;
      return batches.length > 0 ? Math.round(star / batches.length * 100) : 0;
    }
    return 0;
  }

  var STRATEGIES = [
    { id: 1, num: '০১', name: 'Trusted Customer Sales Double', desc: '৮ customer × ৫০ pcs → +২০০ pcs/মাস', phase: 'এখনই শুরু', col: '#0F6E56', light: 'rgba(15,110,86,.12)' },
    { id: 2, num: '০২', name: 'Bundle First Policy',           desc: 'Bundle ROI ১৩.৩৫% vs Single ৬.৯৪%', phase: 'এখনই শুরু', col: '#0F6E56', light: 'rgba(15,110,86,.12)' },
    { id: 3, num: '০৩', name: 'Dubai Direct Dhaka',            desc: '৫০% advance · ৩০–৫০ pcs/order',     phase: 'এই মাসে',    col: '#854F0B', light: 'rgba(133,79,11,.12)' },
    { id: 4, num: '০৪', name: 'SKU Gap Fill',                  desc: 'Same buyer, নতুন revenue, zero cost', phase: 'এই মাসে',    col: '#854F0B', light: 'rgba(133,79,11,.12)' },
    { id: 5, num: '০৫', name: 'Royal Customer Blueprint',      desc: 'Trial → Trusted → Royal system',    phase: 'এখনই শুরু', col: '#185FA5', light: 'rgba(24,95,165,.12)' },
    { id: 6, num: '০৬', name: 'Video Trust System',            desc: '২৫০+ cold contact → conversion',    phase: '৩০ দিনে',    col: '#185FA5', light: 'rgba(24,95,165,.12)' },
    { id: 7, num: '০৭', name: 'Customer Psychology Profile',   desc: 'Type A/B/C playbook — আলাদা strategy', phase: '৩০ দিনে', col: '#534AB7', light: 'rgba(83,74,183,.12)' },
    { id: 8, num: '০৮', name: 'ROI Model Sourcing + Fast Rotation', desc: 'avg ROI ১১% → ১৬% (+৪৫% profit)', phase: 'এখনই শুরু', col: '#0F6E56', light: 'rgba(15,110,86,.12)' },
  ];

  // ══ 2. CSS ════════════════════════════════════════════════════════════════
  var CSS = `
#strategiespage { }
.sh-overview { max-width:1200px; }
.sh-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.sh-card {
  background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
  border-radius:14px; padding:20px; cursor:pointer; position:relative;
  overflow:hidden; transition:transform .2s,box-shadow .2s;
}
.sh-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,.3); }
.sh-card-accent { height:3px; width:100%; position:absolute; top:0; left:0; }
.sh-num { font-family:var(--fd,Syne,sans-serif); font-size:52px; font-weight:900; opacity:.08; line-height:1; margin-bottom:-4px; letter-spacing:-2px; }
.sh-name { font-family:var(--fu,'Plus Jakarta Sans',sans-serif); font-size:15px; font-weight:700; color:var(--text,#f0f4f8); margin-bottom:4px; }
.sh-desc { font-size:11px; color:var(--text3,#4a5f7a); margin-bottom:12px; line-height:1.5; }
.sh-foot { display:flex; align-items:center; justify-content:space-between; }
.sh-phase { font-family:var(--fd,Syne,sans-serif); font-size:9px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:.05em; text-transform:uppercase; }
.sh-prog-wrap { display:flex; align-items:center; gap:7px; }
.sh-prog-track { width:70px; height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
.sh-prog-bar { height:100%; border-radius:2px; transition:width .5s; }
.sh-prog-pct { font-family:var(--fm,'IBM Plex Mono',monospace); font-size:11px; font-weight:700; min-width:32px; text-align:right; }
/* Detail pages */
.sh-detail { display:none; }
.sh-back { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:6px 14px; font-family:var(--fd,Syne,sans-serif); font-size:10px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; cursor:pointer; color:var(--text2,#8899b4); margin-bottom:16px; transition:all .15s; }
.sh-back:hover { border-color:var(--gold,#fbbf24); color:var(--gold,#fbbf24); }
.sh-det-hdr { border-radius:12px; padding:18px 20px; margin-bottom:14px; position:relative; overflow:hidden; }
.sh-det-ghost { position:absolute; right:-8px; top:-8px; font-size:100px; font-weight:900; opacity:.06; line-height:1; letter-spacing:-4px; pointer-events:none; }
.sh-det-num { font-family:var(--fd,Syne,sans-serif); font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; opacity:.6; margin-bottom:4px; }
.sh-det-title { font-family:var(--fd,Syne,sans-serif); font-size:20px; font-weight:800; margin-bottom:4px; }
.sh-det-sub { font-size:12px; opacity:.7; line-height:1.5; }
.sh-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
.sh-kpi { background:rgba(23,32,48,.7); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:12px; }
.sh-kpi-lbl { font-family:var(--fd,Syne,sans-serif); font-size:7.5px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:var(--text3,#4a5f7a); margin-bottom:5px; }
.sh-kpi-val { font-family:var(--fm,'IBM Plex Mono',monospace); font-size:20px; font-weight:700; line-height:1; }
.sh-kpi-sub { font-size:10px; color:var(--text3,#4a5f7a); margin-top:3px; font-family:var(--fm,'IBM Plex Mono',monospace); }
/* Inputs */
.sh-input { background:rgba(23,32,48,.8); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:5px 8px; color:var(--text,#f0f4f8); font-family:var(--fm,'IBM Plex Mono',monospace); font-size:11px; outline:none; transition:border-color .15s; }
.sh-input:focus { border-color:var(--gold,#fbbf24); }
.sh-input[type=number] { width:68px; text-align:right; }
/* Toggler */
.sh-tog { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:5px; border:1px solid; cursor:pointer; font-family:var(--fm,'IBM Plex Mono',monospace); font-size:10px; font-weight:700; white-space:nowrap; user-select:none; transition:all .2s; }
.sh-tog-on  { background:rgba(52,211,153,.1); border-color:rgba(52,211,153,.4); color:var(--green,#34d399); }
.sh-tog-off { background:rgba(255,255,255,.03); border-color:rgba(255,255,255,.08); color:var(--text4,#2a3d55); }
.sh-tog-off:hover { border-color:rgba(251,191,36,.35); color:var(--warn,#f59e0b); }
/* Table */
.sh-tbl-wrap { overflow-x:auto; }
.sh-tbl { width:100%; border-collapse:collapse; }
.sh-tbl th { font-family:var(--fd,Syne,sans-serif); font-size:8px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:var(--text3,#4a5f7a); padding:8px 10px; border-bottom:1px solid rgba(255,255,255,.06); text-align:left; background:rgba(23,32,48,.5); white-space:nowrap; }
.sh-tbl td { padding:7px 10px; border-bottom:1px solid rgba(255,255,255,.03); font-size:11px; color:var(--text2,#8899b4); vertical-align:middle; }
.sh-tbl tr:hover td { background:rgba(251,191,36,.02); }
/* Status badge */
.sh-badge { font-family:var(--fm,'IBM Plex Mono',monospace); font-size:8px; font-weight:700; padding:2px 8px; border-radius:20px; border:1px solid; white-space:nowrap; display:inline-block; }
/* Btn */
.sh-btn { padding:5px 12px; border-radius:6px; font-family:var(--fd,Syne,sans-serif); font-size:9px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; cursor:pointer; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:var(--text2,#8899b4); transition:all .15s; }
.sh-btn:hover { border-color:var(--gold,#fbbf24); color:var(--gold,#fbbf24); }
.sh-btn-p { background:rgba(251,191,36,.1); border-color:rgba(251,191,36,.3); color:var(--gold,#fbbf24); }
.sh-btn-g { background:rgba(52,211,153,.1); border-color:rgba(52,211,153,.3); color:var(--green,#34d399); }
.sh-btn-r { background:rgba(232,33,26,.1); border-color:rgba(232,33,26,.3); color:var(--red,#e8211a); }
.sh-inline-form { background:rgba(23,32,48,.7); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:14px; margin-bottom:12px; display:none; }
.sh-inline-form.open { display:block; }
.sh-fg { display:flex; flex-direction:column; gap:3px; }
.sh-lbl { font-family:var(--fd,Syne,sans-serif); font-size:8px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--text3,#4a5f7a); }
.sh-textarea { background:rgba(23,32,48,.8); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:6px 8px; color:var(--text,#f0f4f8); font-family:var(--fm,'IBM Plex Mono',monospace); font-size:11px; outline:none; width:100%; resize:vertical; min-height:50px; }
.sh-select { background:rgba(23,32,48,.8); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:5px 8px; color:var(--text,#f0f4f8); font-family:var(--fm,'IBM Plex Mono',monospace); font-size:11px; outline:none; }
/* Insight card */
.sh-insight { background:rgba(251,191,36,.04); border:1px solid rgba(251,191,36,.12); border-left:3px solid var(--gold,#fbbf24); border-radius:8px; padding:10px 13px; margin-bottom:6px; font-size:11px; color:var(--text2,#8899b4); line-height:1.6; }
/* Empty state */
.sh-empty { text-align:center; padding:32px; color:var(--text3,#4a5f7a); font-family:var(--fm,'IBM Plex Mono',monospace); font-size:11px; }
.sh-notif { position:fixed; bottom:18px; right:18px; background:rgba(13,17,23,.97); border:1px solid var(--green,#34d399); border-radius:10px; padding:10px 16px; font-family:var(--fd,Syne,sans-serif); font-size:11px; font-weight:700; color:var(--green,#34d399); z-index:9999; display:none; box-shadow:0 8px 32px rgba(0,0,0,.5); }
@media(max-width:640px){.sh-grid{grid-template-columns:1fr}.sh-kpi-row{grid-template-columns:1fr 1fr}}
`;

  // ══ 3. HTML BUILDER ═══════════════════════════════════════════════════════
  function buildHTML() {
    return `
<div id="strategiespage" class="sec">
<style>${CSS}</style>
<div class="sh-notif" id="shNotif"></div>

<!-- OVERVIEW -->
<div id="sh-overview">
  <div class="flex-between mb-18" style="margin-bottom:18px">
    <div>
      <div style="font-family:var(--fd,Syne,sans-serif);font-size:22px;font-weight:800">🔥 CTG Strategy Hub</div>
      <div style="font-size:11px;color:var(--text3,#4a5f7a);margin-top:3px">৮টি কৌশল · Live CRM Data · CEO Intelligence System</div>
    </div>
    <button class="sh-btn sh-btn-p" onclick="shRefreshAll()">🔄 Refresh All</button>
  </div>
  <div class="sh-grid" id="shCards"></div>
</div>

<!-- S1 DETAIL -->
<div class="sh-detail" id="sh-s1">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(15,110,86,.1);color:#0F6E56">
    <div class="sh-det-ghost" style="color:#0F6E56">01</div>
    <div class="sh-det-num">কৌশল ০১ · GAME CHANGER #1</div>
    <div class="sh-det-title">Trusted Customer Sales Double</div>
    <div class="sh-det-sub">Live CRM invoice data থেকে প্রতিটি customer-এর monthly pcs track করো। Target set করো। Gap দেখো।</div>
  </div>
  <div class="sh-kpi-row" id="s1Kpi"></div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px;margin-bottom:14px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📊 CUSTOMER MONTHLY PCS TRACKER</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <select id="s1MonSel" onchange="s1Render()" class="sh-select" style="width:auto"></select>
      <input id="s1Search" oninput="s1Render()" placeholder="🔍 Customer..." class="sh-input" style="width:160px">
    </div>
    <div class="sh-tbl-wrap">
      <table class="sh-tbl"><thead><tr>
        <th>#</th><th>Customer</th><th>Stage</th><th>Avg/Month</th><th>Last Month</th><th>This Month</th><th>Growth %</th>
        <th>🎯 Target</th><th>Gap</th><th>Progress</th><th>Status</th>
      </tr></thead><tbody id="s1Body"></tbody></table>
    </div>
    <div id="s1Foot" style="margin-top:10px;padding:10px 12px;background:rgba(23,32,48,.5);border-radius:6px;display:flex;gap:16px;flex-wrap:wrap"></div>
  </div>
  <div class="sh-insight" id="s1Insight"></div>
</div>

<!-- S2 DETAIL -->
<div class="sh-detail" id="sh-s2">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(15,110,86,.1);color:#0F6E56">
    <div class="sh-det-ghost" style="color:#0F6E56">02</div>
    <div class="sh-det-num">কৌশল ০২ · GAME CHANGER #2</div>
    <div class="sh-det-title">Bundle First Policy</div>
    <div class="sh-det-sub">Invoice data থেকে single vs multi model analysis। Bundle ROI vs Single ROI comparison।</div>
  </div>
  <div class="sh-kpi-row" id="s2Kpi"></div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📊 CUSTOMER BUNDLE INTELLIGENCE</div>
    <div class="sh-tbl-wrap">
      <table class="sh-tbl"><thead><tr>
        <th>#</th><th>Customer</th><th>Stage</th><th>Total Inv</th><th>Single Inv</th><th>Multi Inv</th>
        <th>Bundle Ratio</th><th>Single ROI</th><th>Multi ROI</th><th>ROI Lift</th><th>Avg pcs/Inv</th><th>Score</th>
      </tr></thead><tbody id="s2Body"></tbody></table>
    </div>
  </div>
</div>

<!-- S3 DETAIL — Dubai Direct Dhaka -->
<div class="sh-detail" id="sh-s3">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(133,79,11,.1);color:#BA7517">
    <div class="sh-det-ghost" style="color:#BA7517">03</div>
    <div class="sh-det-num">কৌশল ০৩ · HIGH IMPACT</div>
    <div class="sh-det-title">Dubai Direct Dhaka</div>
    <div class="sh-det-sub">ঢাকার বড় wholesale buyer যারা Dubai থেকে কেনে — তাদের target। ৫০% advance, ৩০–৫০ pcs/order।</div>
  </div>
  <div class="sh-kpi-row" id="s3Kpi"></div>
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <button class="sh-btn sh-btn-p" onclick="s3OpenForm()">+ New Deal</button>
    <button class="sh-btn" onclick="s3Render()">🔄 Refresh</button>
  </div>
  <!-- Add form -->
  <div class="sh-inline-form" id="s3Form">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:10px;font-weight:700;color:var(--gold,#fbbf24);margin-bottom:10px;letter-spacing:1px">+ NEW DUBAI DEAL</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Customer / Shop Name</div><input id="s3fName" class="sh-input" style="width:100%" placeholder="Shop name..."></div>
      <div class="sh-fg"><div class="sh-lbl">Requirement (models)</div><input id="s3fReq" class="sh-input" style="width:100%" placeholder="HP 845 G8 × 20..."></div>
      <div class="sh-fg"><div class="sh-lbl">Expected pcs</div><input id="s3fPcs" class="sh-input" type="number" style="width:100%" placeholder="30"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Advance Amount (৳)</div><input id="s3fAdv" class="sh-input" type="number" style="width:100%" placeholder="0"></div>
      <div class="sh-fg"><div class="sh-lbl">Contact / WA</div><input id="s3fWa" class="sh-input" style="width:100%" placeholder="017..."></div>
      <div class="sh-fg"><div class="sh-lbl">Notes</div><input id="s3fNote" class="sh-input" style="width:100%" placeholder="Any note..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sh-btn sh-btn-g" onclick="s3SaveDeal()">✓ Add Deal</button>
      <button class="sh-btn" onclick="document.getElementById('s3Form').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <!-- Pipeline table -->
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📋 DEAL PIPELINE</div>
    <div class="sh-tbl-wrap">
      <table class="sh-tbl"><thead><tr>
        <th>Shop</th><th>Requirement</th><th>pcs</th><th>Advance</th>
        <th>50% Adv</th><th>Dubai Order</th><th>QC Done</th><th>Shipped</th><th>Bal Pay</th><th>Delivered</th>
        <th>Status</th><th>Actions</th>
      </tr></thead><tbody id="s3Body"></tbody></table>
    </div>
  </div>
</div>

<!-- S4 DETAIL — SKU Gap Fill -->
<div class="sh-detail" id="sh-s4">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(133,79,11,.1);color:#BA7517">
    <div class="sh-det-ghost" style="color:#BA7517">04</div>
    <div class="sh-det-num">কৌশল ০৪ · HIGH IMPACT</div>
    <div class="sh-det-title">SKU Gap Fill Intelligence</div>
    <div class="sh-det-sub">Customer CRM-এ কোন model কেনে (auto) + বাইরে কী বেচে (manual research) → Pilot → Scale/Stop।</div>
  </div>
  <div class="sh-kpi-row" id="s4Kpi"></div>
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <button class="sh-btn sh-btn-p" onclick="s4OpenForm()">+ Add Gap</button>
    <button class="sh-btn" onclick="s4Render()">🔄 Refresh</button>
  </div>
  <div class="sh-inline-form" id="s4Form">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:10px;font-weight:700;color:var(--gold,#fbbf24);margin-bottom:10px;letter-spacing:1px">+ ADD SKU GAP</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Customer</div><select id="s4fCust" class="sh-select" style="width:100%"><option value="">— select —</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Gap Models (per line)</div><textarea id="s4fModels" class="sh-textarea" placeholder="HP 850 G7&#10;Dell 7420"></textarea></div>
      <div class="sh-fg"><div class="sh-lbl">Channel Found</div><select id="s4fCh" class="sh-select" style="width:100%"><option>Facebook</option><option>Bikroy</option><option>YouTube</option><option>Website</option><option>BDStall</option><option>Shop Visit</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Evidence Note</div><input id="s4fNote" class="sh-input" style="width:100%" placeholder="listing দেখলাম..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sh-btn sh-btn-g" onclick="s4SaveGap()">✓ Add</button>
      <button class="sh-btn" onclick="document.getElementById('s4Form').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px;margin-bottom:12px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">👥 CUSTOMER CTG MODELS (LIVE)</div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>CTG Models Bought (auto)</th><th>Gaps Found</th></tr></thead><tbody id="s4CustBody"></tbody></table></div>
  </div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📋 GAP TRACKER</div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr>
      <th>Customer</th><th>Gap Model</th><th>Channel</th><th>Pilot Qty</th><th>Sold</th><th>ROI %</th><th>Status</th><th>Decision</th><th>Actions</th>
    </tr></thead><tbody id="s4GapBody"></tbody></table></div>
  </div>
  <!-- S4 Pilot update form -->
  <div class="sh-inline-form" id="s4PilotForm" style="margin-top:10px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:10px;font-weight:700;color:var(--cyan,#22d3ee);margin-bottom:8px;letter-spacing:1px">🚀 PILOT UPDATE</div>
    <input type="hidden" id="s4pfId">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Pilot Qty</div><input id="s4pfQty" class="sh-input" type="number" style="width:100%" placeholder="2"></div>
      <div class="sh-fg"><div class="sh-lbl">Sold Qty</div><input id="s4pfSold" class="sh-input" type="number" style="width:100%" placeholder="0"></div>
      <div class="sh-fg"><div class="sh-lbl">Cost/Pc (৳)</div><input id="s4pfCost" class="sh-input" type="number" style="width:100%" placeholder="22000"></div>
      <div class="sh-fg"><div class="sh-lbl">Sell/Pc (৳)</div><input id="s4pfSell" class="sh-input" type="number" style="width:100%" placeholder="25000"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sh-btn sh-btn-g" onclick="s4SavePilot()">✓ Update</button>
      <button class="sh-btn" onclick="document.getElementById('s4PilotForm').classList.remove('open')">Cancel</button>
    </div>
  </div>
</div>

<!-- S5 DETAIL — Royal Customer Blueprint -->
<div class="sh-detail" id="sh-s5">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(24,95,165,.1);color:#4da3ff">
    <div class="sh-det-ghost" style="color:#4da3ff">05</div>
    <div class="sh-det-num">কৌশল ০৫ · CASHFLOW PROTECTOR</div>
    <div class="sh-det-title">Royal Customer Blueprint</div>
    <div class="sh-det-sub">Default: Advance Payment → Courier Release Benefit → Credit Limit Benefit। CEO manually unlock করবে।</div>
  </div>
  <!-- How it works -->
  <div style="background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.12);border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <span style="font-family:var(--fd,Syne,sans-serif);font-size:8px;font-weight:800;letter-spacing:1.5px;color:var(--gold,#fbbf24)">HOW IT WORKS</span>
    <span style="font-family:var(--fm,'IBM Plex Mono',monospace);font-size:10px;color:var(--text2,#8899b4)">💰 Advance Payment = Default (সবার জন্য) → <b style="color:var(--cyan,#22d3ee)">🚚 Courier Release</b> = 50% unlock → <b style="color:var(--purple,#c084fc)">💳 Credit Limit</b> = 100% Royal</span>
  </div>
  <div class="sh-kpi-row" id="s5Kpi"></div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📊 CUSTOMER ROYAL PROGRESS</div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr>
      <th>#</th><th>Customer</th><th>Stage</th><th>Total Inv</th><th>Total pcs</th>
      <th>💰 Default</th><th>🚚 Courier Release</th><th>💳 Credit Limit</th><th>Credit Amount</th>
      <th>Unlocked</th><th>Progress</th>
    </tr></thead><tbody id="s5Body"></tbody></table>
  </div></div>
</div>

<!-- S6 DETAIL — Video Trust System -->
<div class="sh-detail" id="sh-s6">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(24,95,165,.1);color:#4da3ff">
    <div class="sh-det-ghost" style="color:#4da3ff">06</div>
    <div class="sh-det-num">কৌশল ০৬ · BRAND BUILD</div>
    <div class="sh-det-title">Video Trust System</div>
    <div class="sh-det-sub">QC proof → Dubai source → Profit education video → Cold lead conversion tracking।</div>
  </div>
  <div class="sh-kpi-row" id="s6Kpi"></div>
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <button class="sh-btn sh-btn-p" onclick="s6OpenForm()">+ Add Video Log</button>
    <button class="sh-btn" onclick="s6Render()">🔄 Refresh</button>
  </div>
  <div class="sh-inline-form" id="s6Form">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:10px;font-weight:700;color:var(--blue,#4da3ff);margin-bottom:10px;letter-spacing:1px">+ VIDEO LOG</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Video Title / Type</div><select id="s6fType" class="sh-select" style="width:100%"><option>QC Proof Video</option><option>Dubai Source Video</option><option>Profit Education</option><option>Customer Review</option><option>Stock Arrival Video</option><option>Bundle Offer Video</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Sent To (Customer)</div><select id="s6fCust" class="sh-select" style="width:100%"><option value="">— select —</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Sent Date</div><input id="s6fDate" class="sh-input" type="date" style="width:100%"></div>
      <div class="sh-fg"><div class="sh-lbl">Model Inquired (if any)</div><input id="s6fModel" class="sh-input" style="width:100%" placeholder="HP 445 G8..."></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Seen? (1=Yes)</div><select id="s6fSeen" class="sh-select" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Reply Received?</div><select id="s6fReply" class="sh-select" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Trial Order Placed?</div><select id="s6fTrial" class="sh-select" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Notes</div><input id="s6fNote" class="sh-input" style="width:100%" placeholder="Any notes..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sh-btn sh-btn-g" onclick="s6SaveLog()">✓ Add Log</button>
      <button class="sh-btn" onclick="document.getElementById('s6Form').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">📊 VIDEO TRACKING LOG</div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr>
      <th>#</th><th>Video Type</th><th>Customer</th><th>Sent</th><th>Seen</th><th>Reply</th><th>Model Inquiry</th><th>Trial Order</th><th>Conversion</th><th>Notes</th><th>Actions</th>
    </tr></thead><tbody id="s6Body"></tbody></table></div>
  </div>
</div>

<!-- S7 DETAIL — Customer Psychology -->
<div class="sh-detail" id="sh-s7">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(83,74,183,.1);color:#c084fc">
    <div class="sh-det-ghost" style="color:#c084fc">07</div>
    <div class="sh-det-num">কৌশল ০৭ · INTELLIGENCE</div>
    <div class="sh-det-title">Customer Psychology Profile</div>
    <div class="sh-det-sub">15 seconds-এ customer-কে বোঝো। Buying trigger → Fear trigger → Sales strategy।</div>
  </div>
  <div class="sh-kpi-row" id="s7Kpi"></div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px;margin-bottom:12px">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:12px">👥 PSYCHOLOGY TABLE <span style="font-weight:400;color:var(--text4,#2a3d55);text-transform:none;letter-spacing:0"> — Row click করলে edit mode</span></div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr>
      <th>#</th><th>Customer</th><th>Stage</th><th>Personality</th><th>Order Style</th><th>Payment</th><th>Trust Style</th><th>Buy Trigger</th><th>Fear Trigger</th><th>🧠 Score</th><th>Action</th>
    </tr></thead><tbody id="s7Body"></tbody></table></div>
  </div>
  <!-- Inline edit form -->
  <div class="sh-inline-form" id="s7EditForm">
    <div style="font-family:var(--fd,Syne,sans-serif);font-size:10px;font-weight:700;color:var(--purple,#c084fc);margin-bottom:10px;letter-spacing:1px" id="s7FormTitle">🧠 BRAIN PROFILE</div>
    <input type="hidden" id="s7fId">
    <input type="hidden" id="s7fCustId">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Personality</div><select id="s7fPers" class="sh-select" style="width:100%"><option>Growth Minded</option><option>Analytical</option><option>Risk Averse</option><option>Price Sensitive</option><option>Relationship Based</option><option>Cash Limited</option><option>Fast Decision Maker</option><option>Slow Decision Maker</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Order Style</div><select id="s7fOrd" class="sh-select" style="width:100%"><option>Bulk Buyer</option><option>Test Then Scale</option><option>Small Frequent</option><option>Single Model Buyer</option><option>Bundle Buyer</option><option>Mix Model Buyer</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Payment Style</div><select id="s7fPay" class="sh-select" style="width:100%"><option>100% Advance</option><option>Courier Release</option><option>Invoice Credit</option><option>Instant Payment</option><option>Delayed Payment</option><option>Reminder Needed</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Trust Style</div><select id="s7fTrust" class="sh-select" style="width:100%"><option>QC Video Based</option><option>Relationship Based</option><option>Previous Experience</option><option>Proof Based</option><option>Dubai Video Based</option></select></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div class="sh-fg"><div class="sh-lbl">Buying Trigger</div><select id="s7fBuy" class="sh-select" style="width:100%"><option>New Stock</option><option>Good Price</option><option>QC Video</option><option>Dubai Arrival</option><option>Bundle Offer</option><option>Priority Stock</option><option>Market Demand</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Fear Trigger</div><select id="s7fFear" class="sh-select" style="width:100%"><option>Money Loss</option><option>Return Issue</option><option>Capital Lock</option><option>Wrong Model</option><option>Slow Sale</option><option>Unsold Stock</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">Growth Mindset</div><select id="s7fGrow" class="sh-select" style="width:100%"><option>Aggressive Growth</option><option>Moderate Growth</option><option>Stable Business</option><option>Survival Mode</option></select></div>
      <div class="sh-fg"><div class="sh-lbl">CEO Notes</div><input id="s7fNote" class="sh-input" style="width:100%" placeholder="Observation..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sh-btn sh-btn-g" onclick="s7SaveProfile()">🧠 Save Profile</button>
      <button class="sh-btn" onclick="document.getElementById('s7EditForm').classList.remove('open')">Cancel</button>
    </div>
  </div>
</div>

<!-- S8 DETAIL — ROI Model Sourcing -->
<div class="sh-detail" id="sh-s8">
  <button class="sh-back" onclick="shShowOverview()">← Back to Strategies</button>
  <div class="sh-det-hdr" style="background:rgba(15,110,86,.1);color:#0F6E56">
    <div class="sh-det-ghost" style="color:#0F6E56">08</div>
    <div class="sh-det-num">কৌশল ০৮ · CAPITAL EFFICIENCY</div>
    <div class="sh-det-title">ROI Model Sourcing + Fast Rotation</div>
    <div class="sh-det-sub">Stock Age + Sales Invoice data → Model category → Capital Allocation → Buy More / Hold / Stop।</div>
  </div>
  <div class="sh-kpi-row" id="s8Kpi"></div>
  <div style="background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3,#4a5f7a)">📊 MODEL INTELLIGENCE TABLE</div>
      <select id="s8CatFilter" onchange="s8Render()" class="sh-select" style="width:auto"><option value="">All Categories</option><option value="STAR">⭐ Star</option><option value="FAST">⚡ Fast</option><option value="HIGHROI">💰 High ROI</option><option value="SLOW">🟠 Slow</option><option value="DEAD">🔴 Dead</option></select>
    </div>
    <div class="sh-tbl-wrap"><table class="sh-tbl"><thead><tr>
      <th>#</th><th>Model</th><th>Cost/Pc</th><th>Sell/Pc</th><th>Profit/Pc</th><th>ROI %</th>
      <th>Recv'd</th><th>Sold</th><th>Avail</th><th>7D</th><th>30D</th><th>Sell-Out</th>
      <th>Rot Score</th><th>ROI Score</th><th>Overall</th><th>Category</th><th>Decision</th>
    </tr></thead><tbody id="s8Body"></tbody></table></div>
  </div>
  <div class="sh-insight" id="s8Insight" style="margin-top:12px"></div>
</div>

</div><!-- /strategiespage -->`;
  }

  // ══ 4. RENDER FUNCTIONS ═══════════════════════════════════════════════════

  // ── Shared helpers ──────────────────────────────────────────────────────
  var STAGE_NAMES = {'1':'Lead','2':'Trust','3':'Trial','4':'Repeat','5':'Trusted','6':'Royal★','7':'Royal'};
  var STAGE_COLS  = {'1':'#f59e0b','2':'#4da3ff','3':'#c084fc','4':'#22d3ee','5':'#34d399','6':'#fb923c','7':'#fbbf24'};
  function sbg(s) {
    var n = STAGE_NAMES[s] || s, c = STAGE_COLS[s] || '#4a5f7a';
    return '<span class="sh-badge" style="color:'+c+';background:'+c+'1a;border-color:'+c+'44">'+n+'</span>';
  }
  function sBadge(v, col, bg) {
    return '<span class="sh-badge" style="color:'+col+';background:'+(bg||col+'1a')+';border-color:'+col+'44">'+v+'</span>';
  }
  function kpiCard(lbl, val, sub, col) {
    return '<div class="sh-kpi" style="border-top:2px solid '+col+'"><div class="sh-kpi-lbl">'+lbl+'</div><div class="sh-kpi-val" style="color:'+col+'">'+val+'</div><div class="sh-kpi-sub">'+sub+'</div></div>';
  }
  function setKpi(id, cards) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = cards.join('');
  }
  function tog(on, onF, offF, label) {
    var cls = on ? 'sh-tog sh-tog-on' : 'sh-tog sh-tog-off';
    var fn = on ? offF : onF;
    return '<span class="'+cls+'" onclick="'+fn+'">'+(on ? '✅ Unlocked' : '🔒 '+label)+'</span>';
  }
  function notify(msg) {
    var n = document.getElementById('shNotif');
    if (!n) return;
    n.textContent = msg; n.style.display = 'block';
    setTimeout(function () { n.style.display = 'none'; }, 2400);
  }

  // ── Overview ──────────────────────────────────────────────────────────────
  function renderOverview() {
    var el = document.getElementById('shCards');
    if (!el) return;
    el.innerHTML = STRATEGIES.map(function (s) {
      var p = calcProgress(s.id);
      var pCol = p >= 80 ? '#34d399' : p >= 50 ? '#22d3ee' : p > 0 ? '#f59e0b' : '#e8211a';
      return '<div class="sh-card" onclick="shOpenStrategy(' + s.id + ')">'
        + '<div class="sh-card-accent" style="background:' + s.col + '"></div>'
        + '<div class="sh-num" style="color:' + s.col + '">' + s.num + '</div>'
        + '<div class="sh-name">' + s.name + '</div>'
        + '<div class="sh-desc">' + s.desc + '</div>'
        + '<div class="sh-foot">'
          + '<span class="sh-phase" style="background:' + s.light + ';color:' + s.col + '">' + s.phase + '</span>'
          + '<div class="sh-prog-wrap">'
            + '<div class="sh-prog-track"><div class="sh-prog-bar" style="width:' + p + '%;background:' + pCol + '"></div></div>'
            + '<span class="sh-prog-pct" style="color:' + pCol + '">' + p + '%</span>'
          + '</div>'
        + '</div>'
      + '</div>';
    }).join('');
  }

  // ── S1 ────────────────────────────────────────────────────────────────────
  function s1BuildMonthSel() {
    var sel = document.getElementById('s1MonSel');
    if (!sel || sel.options.length > 1) return;
    var now = new Date();
    for (var i = 0; i < 12; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      var MNAMES = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      var opt = document.createElement('option');
      opt.value = val; opt.textContent = MNAMES[d.getMonth()] + ' ' + d.getFullYear();
      if (i === 0) opt.selected = true;
      sel.appendChild(opt);
    }
  }
  window.s1Render = function () {
    s1BuildMonthSel();
    var custs = getCustomers();
    var sel = document.getElementById('s1MonSel');
    var curM = sel ? sel.value : new Date().toISOString().slice(0,7);
    var prevDate = new Date(curM + '-01'); prevDate.setMonth(prevDate.getMonth() - 1);
    var prevM = prevDate.getFullYear() + '-' + String(prevDate.getMonth() + 1).padStart(2, '0');
    var tgts = lsGet('ctg_hub_s1_targets', {});
    var q = ((document.getElementById('s1Search') || {}).value || '').toLowerCase();

    var data = custs.map(function (c) {
      var invs = c.invoices || [];
      var allQ = 0, allM = 0, curQ = 0, prevQ = 0;
      invs.forEach(function (inv) {
        var mk = (inv.date || '').slice(0, 7);
        var qty = (inv.items || []).reduce(function (s, x) { return s + (x.qty || 0); }, 0);
        allQ += qty; allM++;
        if (mk === curM) curQ += qty;
        if (mk === prevM) prevQ += qty;
      });
      var avg = allM > 0 ? Math.round(allQ / allM) : 0;
      var growth = prevQ > 0 ? Math.round((curQ - prevQ) / prevQ * 100) : (curQ > 0 ? 100 : 0);
      var tgt = parseInt(tgts[String(c.id)] || '0') || 0;
      var gap = tgt > 0 ? tgt - curQ : 0;
      var prog = tgt > 0 ? Math.min(100, Math.round(curQ / tgt * 100)) : 0;
      return { c: c, avg: avg, curQ: curQ, prevQ: prevQ, growth: growth, tgt: tgt, gap: gap, prog: prog };
    }).filter(function (r) { return r.c.invoices && r.c.invoices.length > 0 && (!q || r.c.name.toLowerCase().indexOf(q) > -1); })
      .sort(function (a, b) { return b.curQ - a.curQ; });

    var totCur = data.reduce(function (s, r) { return s + r.curQ; }, 0);
    var totTgt = data.reduce(function (s, r) { return s + r.tgt; }, 0);
    var totPrev = data.reduce(function (s, r) { return s + r.prevQ; }, 0);
    var achPct = totTgt > 0 ? Math.round(totCur / totTgt * 100) : 0;

    setKpi('s1Kpi', [
      kpiCard('এই মাস মোট pcs', totCur + '', 'all customers', '#22d3ee'),
      kpiCard('Target Achievement', totTgt > 0 ? achPct + '%' : '—', totCur + ' / ' + totTgt + ' pcs', achPct >= 80 ? '#34d399' : achPct >= 50 ? '#f59e0b' : '#e8211a'),
      kpiCard('vs Last Month', (totPrev > 0 ? ((totCur - totPrev) >= 0 ? '+' : '') + Math.round((totCur - totPrev) / totPrev * 100) + '%' : '—'), 'growth', totCur >= totPrev ? '#34d399' : '#e8211a'),
      kpiCard('Active Customers', data.length + '', 'with invoices', '#fbbf24'),
    ]);

    var tb = document.getElementById('s1Body');
    if (!tb) return;
    if (!data.length) { tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">No live CRM data found yet.</div></td></tr>'; return; }
    tb.innerHTML = data.map(function (r, i) {
      var gc = r.growth >= 10 ? '#34d399' : r.growth <= -10 ? '#e8211a' : '#f59e0b';
      var pc2 = r.prog >= 80 ? '#34d399' : r.prog >= 50 ? '#f59e0b' : '#e8211a';
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:12px;font-weight:700;color:var(--text);white-space:nowrap">' + r.c.name + '</td>'
        + '<td>' + sbg(String(r.c.stage || '1')) + '</td>'
        + '<td style="font-family:var(--fm);color:var(--text2)">' + r.avg + '/M</td>'
        + '<td style="font-family:var(--fm);color:var(--text2)">' + r.prevQ + '</td>'
        + '<td style="font-family:var(--fm);font-weight:700;color:#fbbf24">' + r.curQ + '</td>'
        + '<td style="font-family:var(--fm);font-weight:700;color:' + gc + '">' + (r.growth > 0 ? '+' : '') + r.growth + '%</td>'
        + '<td onclick="event.stopPropagation()"><input type="number" min="0" value="' + (r.tgt || '') + '" placeholder="set target" class="sh-input" onchange="s1SaveTarget(\'' + r.c.id + '\',this.value)" onblur="s1SaveTarget(\'' + r.c.id + '\',this.value)" onkeydown="if(event.key===\'Enter\')this.blur()"></td>'
        + '<td style="font-family:var(--fm);color:' + (r.gap > 0 ? '#e8211a' : '#34d399') + '">' + (r.tgt > 0 ? r.gap : '—') + '</td>'
        + '<td style="min-width:100px"><div style="display:flex;align-items:center;gap:5px"><div style="flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="width:' + r.prog + '%;height:100%;background:' + pc2 + ';border-radius:3px"></div></div><span style="font-family:var(--fm);font-size:10px;font-weight:700;color:' + pc2 + '">' + (r.tgt > 0 ? r.prog + '%' : '—') + '</span></div></td>'
        + '<td>' + sBadge(r.curQ >= r.tgt && r.tgt > 0 ? '✅ On Target' : r.growth >= 10 ? '🟢 Growing' : r.growth <= -10 ? '🔴 Drop' : '⚠️ Stable', r.curQ >= r.tgt && r.tgt > 0 ? '#34d399' : r.growth >= 10 ? '#34d399' : r.growth <= -10 ? '#e8211a' : '#f59e0b') + '</td>'
      + '</tr>';
    }).join('');

    var foot = document.getElementById('s1Foot');
    if (foot) foot.innerHTML = [
      { lbl: 'মোট এই মাস', val: totCur + ' pcs', col: '#fbbf24' },
      { lbl: 'মোট গত মাস', val: totPrev + ' pcs', col: '#8899b4' },
      { lbl: 'Total Target', val: totTgt + ' pcs', col: '#22d3ee' },
      { lbl: 'Achievement', val: totTgt > 0 ? achPct + '%' : '—', col: achPct >= 80 ? '#34d399' : '#e8211a' },
    ].map(function (f) {
      return '<div style="display:flex;flex-direction:column;gap:2px"><div style="font-family:var(--fd);font-size:8px;letter-spacing:1px;color:var(--text3)">' + f.lbl + '</div><div style="font-family:var(--fm);font-size:14px;font-weight:700;color:' + f.col + '">' + f.val + '</div></div>';
    }).join('<div style="width:1px;background:rgba(255,255,255,.06)"></div>');

    var ins = document.getElementById('s1Insight');
    if (ins) {
      var below = data.filter(function (r) { return r.tgt > 0 && r.curQ < r.tgt * 0.7; });
      ins.innerHTML = below.length
        ? '⚠️ Below 70% target: ' + below.map(function (r) { return '<b>' + r.c.name + '</b> (' + Math.round(r.curQ / r.tgt * 100) + '% — gap: ' + r.gap + ' pcs)'; }).join(', ') + '. এখনই ping করো।'
        : '✅ সব customer target-এ আছে।';
    }
    renderOverview();
  };
  window.s1SaveTarget = function (cId, val) {
    var tgts = lsGet('ctg_hub_s1_targets', {});
    var n = parseInt(val);
    if (!isNaN(n) && n > 0) tgts[String(cId)] = n; else delete tgts[String(cId)];
    lsSet('ctg_hub_s1_targets', tgts);
    setTimeout(window.s1Render, 60);
  };

  // ── S2 ────────────────────────────────────────────────────────────────────
  window.s2Render = function () {
    var custs = getCustomers();
    var data = custs.map(function (c) {
      var invs = c.invoices || [];
      var singles = [], multis = [];
      invs.forEach(function (inv) {
        var items = inv.items || [];
        var models = Array.from(new Set(items.map(function (x) { return x.model || x.description || ''; }).filter(Boolean)));
        var sell = items.reduce(function (s, x) { return s + (x.qty || 0) * (x.price || 0); }, 0);
        var cost = items.reduce(function (s, x) { return s + (x.qty || 0) * (x.purchasePrice || 0); }, 0);
        var roi = cost > 0 ? (sell - cost) / cost * 100 : 0;
        var qty = items.reduce(function (s, x) { return s + (x.qty || 0); }, 0);
        if (models.length > 1) multis.push({ roi: roi, qty: qty });
        else singles.push({ roi: roi, qty: qty });
      });
      if (!invs.length) return null;
      var sROI = singles.length ? singles.reduce(function (s, x) { return s + x.roi; }, 0) / singles.length : 0;
      var mROI = multis.length ? multis.reduce(function (s, x) { return s + x.roi; }, 0) / multis.length : 0;
      var allQ = invs.reduce(function (s, inv) { return s + (inv.items || []).reduce(function (ss, x) { return ss + (x.qty || 0); }, 0); }, 0);
      var avgPcs = invs.length > 0 ? allQ / invs.length : 0;
      var bRatio = invs.length > 0 ? multis.length / invs.length * 100 : 0;
      var score = Math.round(Math.min(100, bRatio * 0.4 + (mROI - sROI) * 8 + avgPcs * 3));
      return { c: c, inv: invs.length, singles: singles.length, multis: multis.length, sROI: sROI, mROI: mROI, lift: mROI - sROI, bRatio: bRatio, avgPcs: avgPcs, score: Math.max(0, score) };
    }).filter(Boolean).sort(function (a, b) { return b.bRatio - a.bRatio; });

    var totInv = data.reduce(function (s, d) { return s + d.inv; }, 0);
    var totM = data.reduce(function (s, d) { return s + d.multis; }, 0);
    var avgSROI = data.filter(function (d) { return d.singles > 0; }).reduce(function (s, d) { return s + d.sROI; }, 0) / (data.filter(function (d) { return d.singles > 0; }).length || 1);
    var avgMROI = data.filter(function (d) { return d.multis > 0; }).reduce(function (s, d) { return s + d.mROI; }, 0) / (data.filter(function (d) { return d.multis > 0; }).length || 1);
    var bRatioAll = totInv > 0 ? totM / totInv * 100 : 0;

    setKpi('s2Kpi', [
      kpiCard('Total Invoices', totInv + '', 'all customers', '#8899b4'),
      kpiCard('Bundle Ratio', pct(bRatioAll), 'target: 85%', bRatioAll >= 60 ? '#34d399' : '#f59e0b'),
      kpiCard('Single Avg ROI', pct(avgSROI), 'baseline', '#f59e0b'),
      kpiCard('Bundle Avg ROI', pct(avgMROI), 'premium: +' + pct(avgMROI - avgSROI), '#34d399'),
    ]);

    var tb = document.getElementById('s2Body');
    if (!tb) return;
    if (!data.length) { tb.innerHTML = '<tr><td colspan="12"><div class="sh-empty">No live CRM data found yet.</div></td></tr>'; return; }
    tb.innerHTML = data.map(function (d, i) {
      var sc = d.score; var scC = sc >= 70 ? '#34d399' : sc >= 40 ? '#f59e0b' : '#e8211a';
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:700;color:var(--text)">' + d.c.name + '</td>'
        + '<td>' + sbg(String(d.c.stage || '1')) + '</td>'
        + '<td style="font-family:var(--fm)">' + d.inv + '</td>'
        + '<td style="font-family:var(--fm);color:#f59e0b">' + d.singles + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee">' + d.multis + '</td>'
        + '<td><div style="display:flex;align-items:center;gap:5px"><div style="width:40px;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="width:' + d.bRatio + '%;height:100%;background:#22d3ee"></div></div><span style="font-family:var(--fm);font-size:10px;color:#22d3ee">' + d.bRatio.toFixed(0) + '%</span></div></td>'
        + '<td style="font-family:var(--fm);color:#f59e0b">' + pct(d.sROI) + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee;font-weight:700">' + pct(d.mROI) + '</td>'
        + '<td style="font-family:var(--fm);color:' + (d.lift > 3 ? '#34d399' : '#f59e0b') + ';font-weight:700">' + (d.lift > 0 ? '+' : '') + pct(d.lift) + '</td>'
        + '<td style="font-family:var(--fm);color:#fbbf24">' + d.avgPcs.toFixed(1) + '</td>'
        + '<td style="font-family:var(--fm);font-size:15px;font-weight:800;color:' + scC + '">' + sc + '</td>'
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S3 Dubai Direct ────────────────────────────────────────────────────────
  window.s3OpenForm = function () { document.getElementById('s3Form').classList.add('open'); };
  window.s3SaveDeal = function () {
    var name = document.getElementById('s3fName').value.trim();
    var req  = document.getElementById('s3fReq').value.trim();
    var pcs  = parseInt(document.getElementById('s3fPcs').value) || 0;
    var adv  = parseInt(document.getElementById('s3fAdv').value) || 0;
    var wa   = document.getElementById('s3fWa').value.trim();
    var note = document.getElementById('s3fNote').value.trim();
    if (!name) { notify('Shop name দাও'); return; }
    var deals = lsGet('ctg_hub_s3_dubai', []);
    deals.push({ id: Date.now(), name: name, req: req, pcs: pcs, advAmt: adv, wa: wa, note: note, date: today(), adv50: 0, dubaiOrder: 0, qcDone: 0, shipped: 0, balPay: 0, delivered: 0, status: 'New' });
    lsSet('ctg_hub_s3_dubai', deals);
    ['s3fName','s3fReq','s3fPcs','s3fAdv','s3fWa','s3fNote'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('s3Form').classList.remove('open');
    window.s3Render();
    notify('✅ Deal added!');
  };
  window.s3Toggle = function (idx, key) {
    var deals = lsGet('ctg_hub_s3_dubai', []);
    if (!deals[idx]) return;
    deals[idx][key] = deals[idx][key] ? 0 : 1;
    // Auto-update status
    var d = deals[idx];
    var score = d.adv50 + d.dubaiOrder + d.qcDone + d.shipped + d.balPay + d.delivered;
    d.status = score === 6 ? 'Completed' : score >= 4 ? 'In Progress' : score >= 2 ? 'Started' : 'New';
    lsSet('ctg_hub_s3_dubai', deals);
    window.s3Render();
  };
  window.s3Remove = function (idx) {
    var deals = lsGet('ctg_hub_s3_dubai', []);
    deals.splice(idx, 1);
    lsSet('ctg_hub_s3_dubai', deals);
    window.s3Render();
  };
  window.s3Render = function () {
    var deals = lsGet('ctg_hub_s3_dubai', []);
    var done = deals.filter(function (d) { return d.status === 'Completed'; }).length;
    var inProg = deals.filter(function (d) { return d.status === 'In Progress' || d.status === 'Started'; }).length;
    setKpi('s3Kpi', [
      kpiCard('Total Deals', deals.length + '', 'tracked', '#ba7517'),
      kpiCard('Completed', done + '', 'all stages done', '#34d399'),
      kpiCard('In Progress', inProg + '', 'pipeline active', '#fbbf24'),
      kpiCard('New', (deals.length - done - inProg) + '', 'not started', '#8899b4'),
    ]);
    var tb = document.getElementById('s3Body'); if (!tb) return;
    if (!deals.length) { tb.innerHTML = '<tr><td colspan="12"><div class="sh-empty">No deals yet. "+ New Deal" দিয়ে add করো।</div></td></tr>'; return; }
    function stageChk(idx, key, val) {
      return '<span onclick="s3Toggle(' + idx + ',\'' + key + '\')" style="cursor:pointer;font-size:14px">' + (val ? '✅' : '⬜') + '</span>';
    }
    tb.innerHTML = deals.map(function (d, i) {
      var sc = d.adv50 + d.dubaiOrder + d.qcDone + d.shipped + d.balPay + d.delivered;
      var statCol = d.status === 'Completed' ? '#34d399' : d.status === 'In Progress' ? '#fbbf24' : d.status === 'Started' ? '#22d3ee' : '#8899b4';
      return '<tr>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:700;color:var(--text);white-space:nowrap">' + d.name + '</td>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text2)">' + (d.req || '—') + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee">' + (d.pcs || '—') + '</td>'
        + '<td style="font-family:var(--fm);color:#34d399">' + (d.advAmt ? fmtM(d.advAmt) : '—') + '</td>'
        + '<td>' + stageChk(i, 'adv50', d.adv50) + '</td>'
        + '<td>' + stageChk(i, 'dubaiOrder', d.dubaiOrder) + '</td>'
        + '<td>' + stageChk(i, 'qcDone', d.qcDone) + '</td>'
        + '<td>' + stageChk(i, 'shipped', d.shipped) + '</td>'
        + '<td>' + stageChk(i, 'balPay', d.balPay) + '</td>'
        + '<td>' + stageChk(i, 'delivered', d.delivered) + '</td>'
        + '<td>' + sBadge(d.status || 'New', statCol) + '<span style="font-family:var(--fm);font-size:9px;color:var(--text3);margin-left:5px">' + sc + '/6</span></td>'
        + '<td onclick="event.stopPropagation()"><button class="sh-btn sh-btn-r" onclick="s3Remove(' + i + ')" style="padding:2px 7px;font-size:8px">✕</button></td>'
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S4 SKU Gap ─────────────────────────────────────────────────────────────
  function s4PopCustSel(selId) {
    var sel = document.getElementById(selId); if (!sel) return;
    sel.innerHTML = '<option value="">— Customer —</option>';
    getCustomers().forEach(function (c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); });
  }
  function s4CtgModels(c) {
    var m = new Set();
    (c.invoices || []).forEach(function (inv) { (inv.items || []).forEach(function (x) { var n = x.model || x.description || ''; if (n) m.add(n); }); });
    return Array.from(m);
  }
  function s4Score(g) { return Math.min(100, 20 + (g.channel ? 20 : 0) + (g.repeated ? 20 : 0) + ((g.expRoi || 0) >= 15 ? 20 : 0) + (g.lowRet ? 20 : 0)); }
  function s4Decision(g) {
    if (!g.pilotQty) return s4Score(g) >= 90 ? 'Immediate Pilot' : s4Score(g) >= 70 ? 'Pilot Small Qty' : 'Monitor';
    var sp = g.pilotQty > 0 ? (g.soldQty || 0) / g.pilotQty * 100 : 0;
    var roi = g.costPc > 0 ? ((g.sellPc || 0) - g.costPc) / g.costPc * 100 : 0;
    var days = g.pilotDate ? Math.round((new Date() - new Date(g.pilotDate)) / 86400000) : 0;
    if (sp >= 70 && roi >= 15) return 'Scale 🚀';
    if (sp >= 30) return 'Monitor ⚠️';
    if (days >= 14) return 'Stop 🛑';
    return 'Pilot Running...';
  }
  var S4_STATUS_C = { Found: '#22d3ee', 'Pilot Running': '#fbbf24', 'Success': '#34d399', Scale: '#2dd4bf', Monitor: '#f59e0b', Failed: '#e8211a', Stop: '#8899b4' };

  window.s4OpenForm = function () { s4PopCustSel('s4fCust'); document.getElementById('s4Form').classList.add('open'); };
  window.s4SaveGap = function () {
    var custId = parseInt(document.getElementById('s4fCust').value);
    var c = getCustomers().find(function (x) { return x.id === custId; });
    var models = (document.getElementById('s4fModels').value || '').split('\n').map(function (m) { return m.trim(); }).filter(Boolean);
    var ch = document.getElementById('s4fCh').value;
    var note = document.getElementById('s4fNote').value;
    if (!custId || !models.length) { notify('Customer + Model দাও'); return; }
    var gaps = lsGet('ctg_hub_s4_gaps', []); var added = 0;
    models.forEach(function (model) {
      gaps.push({ id: 'GAP-' + Date.now() + '-' + added, custId: custId, custName: c ? c.name : '', model: model, channel: ch, note: note, foundDate: today(), expRoi: 15, repeated: 0, lowRet: 1, pilotQty: 0, soldQty: 0, costPc: 0, sellPc: 0, pilotDate: '', status: 'Found' }); added++;
    });
    lsSet('ctg_hub_s4_gaps', gaps);
    document.getElementById('s4Form').classList.remove('open');
    document.getElementById('s4fModels').value = ''; document.getElementById('s4fNote').value = '';
    window.s4Render(); notify('✅ ' + added + ' gap(s) added!');
  };
  window.s4OpenPilot = function (id) {
    document.getElementById('s4pfId').value = id; document.getElementById('s4PilotForm').classList.add('open');
  };
  window.s4SavePilot = function () {
    var id = document.getElementById('s4pfId').value;
    var gaps = lsGet('ctg_hub_s4_gaps', []);
    var g = gaps.find(function (x) { return x.id === id; }); if (!g) return;
    g.pilotQty = parseInt(document.getElementById('s4pfQty').value) || 0;
    g.soldQty  = parseInt(document.getElementById('s4pfSold').value) || 0;
    g.costPc   = parseInt(document.getElementById('s4pfCost').value) || 0;
    g.sellPc   = parseInt(document.getElementById('s4pfSell').value) || 0;
    g.pilotDate = g.pilotDate || today();
    g.status = g.pilotQty > 0 ? 'Pilot Running' : 'Found';
    var sp = g.pilotQty > 0 ? g.soldQty / g.pilotQty * 100 : 0;
    var roi = g.costPc > 0 ? (g.sellPc - g.costPc) / g.costPc * 100 : 0;
    if (sp >= 70 && roi >= 15) g.status = 'Scale';
    else if (sp >= 30) g.status = 'Monitor';
    lsSet('ctg_hub_s4_gaps', gaps);
    document.getElementById('s4PilotForm').classList.remove('open');
    window.s4Render(); notify('✅ Pilot updated!');
  };
  window.s4Remove = function (id) {
    lsSet('ctg_hub_s4_gaps', lsGet('ctg_hub_s4_gaps', []).filter(function (g) { return g.id !== id; }));
    window.s4Render();
  };
  window.s4Render = function () {
    s4PopCustSel('s4fCust');
    var custs = getCustomers(); var gaps = lsGet('ctg_hub_s4_gaps', []);
    var scales = gaps.filter(function (g) { return g.status === 'Scale'; }).length;
    var pilots = gaps.filter(function (g) { return g.status === 'Pilot Running'; }).length;
    setKpi('s4Kpi', [
      kpiCard('Gaps Found', gaps.length + '', 'total', '#22d3ee'),
      kpiCard('Pilot Running', pilots + '', 'currently testing', '#fbbf24'),
      kpiCard('Scale Ready', scales + '', 'buy more', '#34d399'),
      kpiCard('Customers', custs.length + '', 'CTG models tracked', '#8899b4'),
    ]);
    var cb = document.getElementById('s4CustBody'); if (!cb) return;
    cb.innerHTML = custs.map(function (c, i) {
      var ctgM = s4CtgModels(c); var cGaps = gaps.filter(function (g) { return g.custId === c.id; });
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:700;color:var(--text)">' + c.name + '</td>'
        + '<td>' + sbg(String(c.stage || '1')) + '</td>'
        + '<td>' + (ctgM.length ? ctgM.map(function (m) { return '<span style="font-family:var(--fm);font-size:9px;color:#22d3ee;background:rgba(34,211,238,.07);border:1px solid rgba(34,211,238,.2);padding:1px 6px;border-radius:3px;margin:1px">' + m + '</span>'; }).join('') : '<span style="color:var(--text4);font-size:10px">No invoice models</span>') + '</td>'
        + '<td style="font-family:var(--fm);font-size:13px;font-weight:800;color:' + (cGaps.length > 0 ? '#fb923c' : 'var(--text4)') + '">' + cGaps.length + '</td>'
      + '</tr>';
    }).join('');
    var gb = document.getElementById('s4GapBody');
    gb.innerHTML = !gaps.length ? '<tr><td colspan="9"><div class="sh-empty">No gaps yet. "+ Add Gap" দিয়ে add করো।</div></td></tr>' : gaps.map(function (g) {
      var roi = g.costPc > 0 ? ((g.sellPc || 0) - g.costPc) / g.costPc * 100 : 0;
      var stC = S4_STATUS_C[g.status] || '#8899b4';
      var dec = s4Decision(g);
      return '<tr>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:600;color:var(--text)">' + g.custName + '</td>'
        + '<td style="font-family:var(--fm);font-size:10px;color:#2dd4bf">' + g.model + '</td>'
        + '<td style="font-size:10px;color:var(--text3)">' + g.channel + '</td>'
        + '<td style="font-family:var(--fm);color:var(--text)">' + (g.pilotQty || '—') + '</td>'
        + '<td style="font-family:var(--fm);color:#34d399">' + (g.pilotQty > 0 ? (g.soldQty || 0) + '/' + g.pilotQty : '—') + '</td>'
        + '<td style="font-family:var(--fm);color:' + (roi >= 15 ? '#34d399' : roi > 0 ? '#f59e0b' : 'var(--text3)') + ';font-weight:700">' + (roi > 0 ? pct(roi) : '—') + '</td>'
        + '<td>' + sBadge(g.status, stC) + '</td>'
        + '<td style="font-family:var(--fm);font-size:10px;color:' + (dec.indexOf('Scale') > -1 ? '#34d399' : dec.indexOf('Stop') > -1 ? '#e8211a' : '#f59e0b') + '">' + dec + '</td>'
        + '<td onclick="event.stopPropagation()"><div style="display:flex;gap:4px">'
          + '<button class="sh-btn" onclick="s4OpenPilot(\'' + g.id + '\')" style="font-size:8px;padding:2px 7px">🚀</button>'
          + '<button class="sh-btn sh-btn-r" onclick="s4Remove(\'' + g.id + '\')" style="font-size:8px;padding:2px 7px">✕</button>'
        + '</div></td>'
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S5 Royal Blueprint ────────────────────────────────────────────────────
  function s5U(id) { var d = lsGet('ctg_hub_s5_royal', {}); return d[String(id)] || { cour: 0, cred: 0, creditAmt: 0 }; }
  window.s5Toggle = function (id, key) {
    var d = lsGet('ctg_hub_s5_royal', {});
    if (!d[String(id)]) d[String(id)] = { cour: 0, cred: 0, creditAmt: 0 };
    d[String(id)][key] = d[String(id)][key] ? 0 : 1;
    lsSet('ctg_hub_s5_royal', d); window.s5Render();
  };
  window.s5SetCredit = function (id, val) {
    var d = lsGet('ctg_hub_s5_royal', {});
    if (!d[String(id)]) d[String(id)] = { cour: 0, cred: 0, creditAmt: 0 };
    d[String(id)].creditAmt = parseInt(String(val).replace(/[^\d]/g, '')) || 0;
    lsSet('ctg_hub_s5_royal', d);
  };
  function s5Prog(c) {
    var u = s5U(c.id);
    if (String(c.stage) === '7') return 100;
    return Math.round(((u.cour ? 1 : 0) + (u.cred ? 1 : 0)) / 2 * 100);
  }
  window.s5Render = function () {
    var custs = getCustomers();
    var royal = custs.filter(function (c) { return s5Prog(c) >= 100; }).length;
    var cour = custs.filter(function (c) { var p = s5Prog(c); return p >= 50 && p < 100; }).length;
    var totCredit = custs.reduce(function (s, c) { var u = s5U(c.id); return s + (u.cred ? u.creditAmt || 0 : 0); }, 0);
    setKpi('s5Kpi', [
      kpiCard('👑 Royal (100%)', royal + '', 'both benefits unlocked', '#fbbf24'),
      kpiCard('🚚 Courier (50%)', cour + '', 'courier release active', '#22d3ee'),
      kpiCard('⬜ Default (0%)', (custs.length - royal - cour) + '', 'advance payment only', '#8899b4'),
      kpiCard('💳 Credit Exposure', fmtM(totCredit), 'active credit limits', '#c084fc'),
    ]);
    var tb = document.getElementById('s5Body'); if (!tb) return;
    if (!custs.length) { tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">No CRM customers found.</div></td></tr>'; return; }
    tb.innerHTML = custs.map(function (c, i) {
      var u = s5U(c.id); var p = s5Prog(c);
      var pC = p >= 100 ? '#fbbf24' : p >= 50 ? '#22d3ee' : '#8899b4';
      var totInv = (c.invoices || []).length;
      var totPcs = (c.invoices || []).reduce(function (s, inv) { return s + (inv.items || []).reduce(function (ss, x) { return ss + (x.qty || 0); }, 0); }, 0);
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:12px;font-weight:700;color:var(--text)">' + c.name + '</td>'
        + '<td>' + sbg(String(c.stage || '1')) + '</td>'
        + '<td style="font-family:var(--fm);color:var(--text)">' + totInv + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee">' + totPcs + '</td>'
        + '<td><span style="font-family:var(--fm);font-size:9px;color:var(--text4);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:2px 8px">💰 Advance</span></td>'
        + '<td onclick="event.stopPropagation()">' + tog(u.cour, 's5Toggle(' + c.id + ',\'cour\')', 's5Toggle(' + c.id + ',\'cour\')', 'Unlock') + '</td>'
        + '<td onclick="event.stopPropagation()">' + tog(u.cred, 's5Toggle(' + c.id + ',\'cred\')', 's5Toggle(' + c.id + ',\'cred\')', 'Unlock') + '</td>'
        + '<td onclick="event.stopPropagation()">' + (u.cred ? '<div style="display:flex;align-items:center;gap:4px"><span style="font-family:var(--fm);font-size:10px;color:#c084fc">৳</span><input type="text" value="' + (u.creditAmt ? Number(u.creditAmt).toLocaleString('en-BD') : '') + '" placeholder="0" class="sh-input" style="width:80px;color:#c084fc" onblur="s5SetCredit(' + c.id + ',this.value.replace(/,/g,\'\'))" onkeydown="if(event.key===\'Enter\')this.blur()"></div>' : '<span style="color:var(--text4);font-size:10px">—</span>') + '</td>'
        + '<td style="font-family:var(--fm);font-size:13px;font-weight:800;color:' + pC + '">' + ((u.cour ? 1 : 0) + (u.cred ? 1 : 0)) + '/2</td>'
        + '<td style="min-width:110px"><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="width:' + p + '%;height:100%;background:' + pC + ';border-radius:3px"></div></div><span style="font-family:var(--fm);font-size:11px;font-weight:800;color:' + pC + '">' + p + '%</span></div></td>'
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S6 Video Trust ──────────────────────────────────────────────────────────
  function s6PopCustSel() {
    var sel = document.getElementById('s6fCust'); if (!sel) return;
    sel.innerHTML = '<option value="">— Cold Lead / Customer —</option>';
    getCustomers().forEach(function (c) { var o = document.createElement('option'); o.value = c.name; o.textContent = c.name; sel.appendChild(o); });
    var o = document.createElement('option'); o.value = 'Cold Lead'; o.textContent = '📡 Cold Lead (New)'; sel.appendChild(o);
  }
  window.s6OpenForm = function () { s6PopCustSel(); var df = document.getElementById('s6fDate'); if (df) df.value = today(); document.getElementById('s6Form').classList.add('open'); };
  window.s6SaveLog = function () {
    var type = document.getElementById('s6fType').value;
    var cust = document.getElementById('s6fCust').value || 'Unknown';
    var date = document.getElementById('s6fDate').value || today();
    var model = document.getElementById('s6fModel').value;
    var seen = parseInt(document.getElementById('s6fSeen').value) || 0;
    var reply = parseInt(document.getElementById('s6fReply').value) || 0;
    var trial = parseInt(document.getElementById('s6fTrial').value) || 0;
    var note = document.getElementById('s6fNote').value;
    var logs = lsGet('ctg_hub_s6_video', []);
    logs.push({ id: Date.now(), type: type, customer: cust, date: date, model: model, seen: seen, reply: reply, trialOrder: trial, note: note });
    lsSet('ctg_hub_s6_video', logs);
    document.getElementById('s6Form').classList.remove('open');
    document.getElementById('s6fModel').value = ''; document.getElementById('s6fNote').value = '';
    window.s6Render(); notify('✅ Video log added!');
  };
  window.s6Remove = function (id) {
    lsSet('ctg_hub_s6_video', lsGet('ctg_hub_s6_video', []).filter(function (v) { return v.id !== id; }));
    window.s6Render();
  };
  window.s6Render = function () {
    s6PopCustSel();
    var logs = lsGet('ctg_hub_s6_video', []);
    var sent = logs.length; var seen = logs.filter(function (v) { return v.seen; }).length;
    var reply = logs.filter(function (v) { return v.reply; }).length;
    var trial = logs.filter(function (v) { return v.trialOrder; }).length;
    var convRate = sent > 0 ? Math.round(trial / sent * 100) : 0;
    setKpi('s6Kpi', [
      kpiCard('Videos Sent', sent + '', 'total logged', '#4da3ff'),
      kpiCard('Seen', seen + '', pct(sent > 0 ? seen / sent * 100 : 0) + ' of sent', '#22d3ee'),
      kpiCard('Reply', reply + '', pct(sent > 0 ? reply / sent * 100 : 0) + ' of sent', '#f59e0b'),
      kpiCard('Trial Orders', trial + '', 'conversion rate: ' + convRate + '%', '#34d399'),
    ]);
    var tb = document.getElementById('s6Body'); if (!tb) return;
    if (!logs.length) { tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">No video logs yet. "+ Add Video Log" দিয়ে শুরু করো।</div></td></tr>'; return; }
    tb.innerHTML = logs.slice().reverse().map(function (v) {
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:9px;color:var(--text4)">' + v.id.toString().slice(-6) + '</td>'
        + '<td>' + sBadge(v.type.replace(' Video', ''), '#4da3ff') + '</td>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:600;color:var(--text)">' + (v.customer || '—') + '</td>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text3)">' + v.date + '</td>'
        + '<td style="font-size:14px">' + (v.seen ? '✅' : '⬜') + '</td>'
        + '<td style="font-size:14px">' + (v.reply ? '✅' : '⬜') + '</td>'
        + '<td style="font-family:var(--fm);font-size:10px;color:#22d3ee">' + (v.model || '—') + '</td>'
        + '<td style="font-size:14px">' + (v.trialOrder ? '✅' : '⬜') + '</td>'
        + '<td>' + sBadge(v.trialOrder ? '🟢 Converted' : v.reply ? '⚠️ Replied' : v.seen ? '📧 Seen' : '📤 Sent', v.trialOrder ? '#34d399' : v.reply ? '#f59e0b' : v.seen ? '#22d3ee' : '#8899b4') + '</td>'
        + '<td style="font-size:10px;color:var(--text3)">' + (v.note || '—') + '</td>'
        + '<td onclick="event.stopPropagation()"><button class="sh-btn sh-btn-r" onclick="s6Remove(' + v.id + ')" style="font-size:8px;padding:2px 7px">✕</button></td>'
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S7 Psychology ──────────────────────────────────────────────────────────
  function s7BS(p) {
    var s = p.scores || {};
    var pos = (s.trust || 0) + (s.growth || 0) + (s.payment || 0);
    var neg = (s.returnRisk || 0) + (s.creditRisk || 0);
    return Math.round(Math.max(0, Math.min(100, ((pos * 2) - (neg * 1.5)) / (3 * 2 + 2 * 1.5) * 100)));
  }
  window.s7OpenEdit = function (custId) {
    var custs = getCustomers(); var c = custs.find(function (x) { return String(x.id) === String(custId); }); if (!c) return;
    var profs = lsGet('ctg_hub_s7_psy', []);
    var p = profs.find(function (x) { return String(x.custId) === String(custId); }) || {};
    document.getElementById('s7fId').value = p.id || '';
    document.getElementById('s7fCustId').value = custId;
    document.getElementById('s7FormTitle').textContent = '🧠 ' + c.name + ' — Brain Profile';
    var fields = { s7fPers: p.personality, s7fOrd: p.order, s7fPay: p.payment, s7fTrust: p.trust, s7fBuy: p.buyTrigger, s7fFear: p.fearTrigger, s7fGrow: p.growth };
    Object.keys(fields).forEach(function (id) { var el = document.getElementById(id); if (el && fields[id]) el.value = fields[id]; });
    document.getElementById('s7fNote').value = p.notes || '';
    document.getElementById('s7EditForm').classList.add('open');
    document.getElementById('s7EditForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  window.s7SaveProfile = function () {
    var custId = document.getElementById('s7fCustId').value;
    var custs = getCustomers(); var c = custs.find(function (x) { return String(x.id) === String(custId); }); if (!c) return;
    var editId = document.getElementById('s7fId').value;
    var obj = {
      id: editId || String(Date.now()), custId: custId, name: c.name, stage: String(c.stage || '1'),
      personality: document.getElementById('s7fPers').value, order: document.getElementById('s7fOrd').value,
      payment: document.getElementById('s7fPay').value, trust: document.getElementById('s7fTrust').value,
      buyTrigger: document.getElementById('s7fBuy').value, fearTrigger: document.getElementById('s7fFear').value,
      growth: document.getElementById('s7fGrow').value, notes: document.getElementById('s7fNote').value,
      scores: { trust: 7, growth: 6, payment: 8, returnRisk: 3, creditRisk: 2 },
      lastUpdated: today()
    };
    var profs = lsGet('ctg_hub_s7_psy', []);
    if (editId) profs = profs.map(function (p) { return p.id === editId ? obj : p; });
    else profs.push(obj);
    lsSet('ctg_hub_s7_psy', profs);
    document.getElementById('s7EditForm').classList.remove('open');
    window.s7Render(); notify('🧠 Profile saved!');
  };
  window.s7Remove = function (id) {
    lsSet('ctg_hub_s7_psy', lsGet('ctg_hub_s7_psy', []).filter(function (p) { return p.id !== id; }));
    window.s7Render();
  };
  window.s7Render = function () {
    var custs = getCustomers(); var profs = lsGet('ctg_hub_s7_psy', []);
    setKpi('s7Kpi', [
      kpiCard('Profiled', profs.length + '', 'of ' + custs.length + ' customers', '#c084fc'),
      kpiCard('High Trust', profs.filter(function (p) { return (p.scores || {}).trust >= 7; }).length + '', 'trust score 7+', '#22d3ee'),
      kpiCard('Growth Minded', profs.filter(function (p) { return p.growth === 'Aggressive Growth'; }).length + '', 'aggressive growth', '#34d399'),
      kpiCard('Not Profiled', (custs.length - profs.length) + '', 'click row to add', '#f59e0b'),
    ]);
    var tb = document.getElementById('s7Body'); if (!tb) return;
    tb.innerHTML = custs.map(function (c, i) {
      var p = profs.find(function (x) { return String(x.custId) === String(c.id); });
      var bs = p ? s7BS(p) : 0; var bc = bs >= 70 ? '#34d399' : bs >= 45 ? '#f59e0b' : '#e8211a';
      return '<tr onclick="s7OpenEdit(\'' + c.id + '\')" style="cursor:pointer">'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:12px;font-weight:700;color:var(--text)">' + c.name + '</td>'
        + '<td>' + sbg(String(c.stage || '1')) + '</td>'
        + (p
          ? '<td>' + sBadge(p.personality, '#c084fc') + '</td>'
            + '<td>' + sBadge(p.order, '#fbbf24') + '</td>'
            + '<td>' + sBadge(p.payment, '#34d399') + '</td>'
            + '<td>' + sBadge(p.trust, '#2dd4bf') + '</td>'
            + '<td>' + sBadge(p.buyTrigger || '—', '#f472b6') + '</td>'
            + '<td>' + sBadge(p.fearTrigger || '—', '#e8211a') + '</td>'
            + '<td><div style="display:flex;align-items:center;gap:5px"><span style="font-family:var(--fm);font-size:16px;font-weight:800;color:' + bc + '">' + bs + '</span><div style="width:28px;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="width:' + bs + '%;height:100%;background:' + bc + '"></div></div></div></td>'
            + '<td onclick="event.stopPropagation()"><button class="sh-btn" onclick="s7Remove(\'' + p.id + '\')" style="font-size:8px;padding:2px 7px">✕</button></td>'
          : '<td colspan="7" style="font-family:var(--fm);font-size:10px;color:var(--text4)">Profile নেই — click to add</td>'
            + '<td>' + sBadge('+ Add', '#c084fc') + '</td>'
        )
      + '</tr>';
    }).join('');
    renderOverview();
  };

  // ── S8 ROI Model Sourcing ──────────────────────────────────────────────────
  function s8Models() {
    var custs = getCustomers();
    var modelMap = {};
    custs.forEach(function (c) {
      (c.invoices || []).forEach(function (inv) {
        var date = inv.date || '';
        var mk = date.slice(0, 7);
        var now7 = new Date(); now7.setDate(now7.getDate() - 7);
        var now30 = new Date(); now30.setDate(now30.getDate() - 30);
        (inv.items || []).forEach(function (x) {
          var name = x.model || x.description || 'Unknown';
          if (!modelMap[name]) modelMap[name] = { model: name, sold: 0, revenue: 0, cost: 0, d7: 0, d30: 0 };
          var qty = x.qty || 0; var invDate = new Date(date);
          modelMap[name].sold += qty;
          modelMap[name].revenue += qty * (x.price || 0);
          modelMap[name].cost += qty * (x.purchasePrice || 0);
          if (date && invDate >= now7) modelMap[name].d7 += qty;
          if (date && invDate >= now30) modelMap[name].d30 += qty;
        });
      });
    });
    var batches = getStockBatches();
    batches.forEach(function (b) {
      var name = b.model || 'Unknown';
      if (!modelMap[name]) modelMap[name] = { model: name, sold: 0, revenue: 0, cost: 0, d7: 0, d30: 0 };
      var m = modelMap[name];
      m.recQty = (m.recQty || 0) + (b.qty || b.receivedQty || 0);
      m.costPc = b.costPc || b.cost || m.costPc || 0;
      m.sellPc = b.sellPc || b.sellPrice || m.sellPc || 0;
      m.stockAge = b.stockAge || (b.purchaseDate ? Math.round((new Date() - new Date(b.purchaseDate)) / 86400000) : 0);
    });
    return Object.values(modelMap).map(function (m) {
      m.recQty = m.recQty || m.sold;
      m.avail = Math.max(0, (m.recQty || 0) - m.sold - (m.returnQty || 0));
      if (!m.costPc && m.cost > 0 && m.sold > 0) m.costPc = Math.round(m.cost / m.sold);
      if (!m.sellPc && m.revenue > 0 && m.sold > 0) m.sellPc = Math.round(m.revenue / m.sold);
      m.profitPc = m.sellPc - m.costPc;
      m.roi = m.costPc > 0 ? (m.profitPc / m.costPc) * 100 : 0;
      m.totalProfit = m.sold * m.profitPc;
      var daily = m.d30 / 30;
      m.sellOutDays = daily > 0 ? Math.round(m.avail / daily) : (m.avail > 0 ? 999 : 0);
      // Scores
      m.rotScore = m.sellOutDays <= 7 ? 10 : m.sellOutDays <= 15 ? 8 : m.sellOutDays <= 30 ? 6 : m.sellOutDays <= 45 ? 3 : 0;
      m.roiScore = m.roi >= 25 ? 10 : m.roi >= 20 ? 8.5 : m.roi >= 15 ? 7 : m.roi >= 12 ? 5 : m.roi >= 10 ? 3 : 1;
      m.overallScore = Math.round(m.roiScore * 50 + m.rotScore * 50);
      // Category
      if (m.roi >= 15 && m.sellOutDays <= 15) m.cat = 'STAR';
      else if (m.sellOutDays <= 15 && m.roi < 15) m.cat = 'FAST';
      else if (m.roi >= 20 && m.sellOutDays > 15) m.cat = 'HIGHROI';
      else if (m.sellOutDays > 45 && m.roi < 10) m.cat = 'DEAD';
      else m.cat = 'SLOW';
      // Decision
      m.decision = { STAR: 'BUY MORE', FAST: 'REBUY', HIGHROI: 'HOLD', SLOW: 'REDUCE', DEAD: 'STOP' }[m.cat] || 'HOLD';
      return m;
    }).filter(function (m) { return m.sold > 0 || m.recQty > 0; }).sort(function (a, b) { return b.overallScore - a.overallScore; });
  }
  var CAT_DEF = {
    STAR: { lbl: '⭐ Star', col: '#a3e635', bg: 'rgba(163,230,53,.1)' },
    FAST: { lbl: '⚡ Fast', col: '#22d3ee', bg: 'rgba(34,211,238,.1)' },
    HIGHROI: { lbl: '💰 High ROI', col: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
    SLOW: { lbl: '🟠 Slow', col: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
    DEAD: { lbl: '🔴 Dead', col: '#e8211a', bg: 'rgba(232,33,26,.1)' },
  };
  var DEC_C = { 'BUY MORE': '#a3e635', REBUY: '#22d3ee', HOLD: '#fbbf24', REDUCE: '#f59e0b', STOP: '#e8211a' };
  window.s8Render = function () {
    var models = s8Models();
    var catF = (document.getElementById('s8CatFilter') || {}).value || '';
    if (catF) models = models.filter(function (m) { return m.cat === catF; });
    var stars = models.filter(function (m) { return m.cat === 'STAR'; }).length;
    var avgRoi = models.length > 0 ? models.reduce(function (s, m) { return s + m.roi; }, 0) / models.length : 0;
    var capLock = models.reduce(function (s, m) { return s + m.avail * m.costPc; }, 0);
    setKpi('s8Kpi', [
      kpiCard('Total Models', models.length + '', 'in CRM invoices', '#8899b4'),
      kpiCard('⭐ Star Models', stars + '', 'high ROI + fast', '#a3e635'),
      kpiCard('Avg ROI', pct(avgRoi), 'across all models', avgRoi >= 15 ? '#34d399' : '#f59e0b'),
      kpiCard('Capital Locked', fmtM(capLock), 'in available stock', capLock > 500000 ? '#f59e0b' : '#34d399'),
    ]);
    var tb = document.getElementById('s8Body'); if (!tb) return;
    if (!models.length) { tb.innerHTML = '<tr><td colspan="17"><div class="sh-empty">No model data found. CRM-এ invoice add করলে auto-populate হবে।</div></td></tr>'; return; }
    tb.innerHTML = models.map(function (m, i) {
      var cat = CAT_DEF[m.cat] || { lbl: m.cat, col: '#8899b4', bg: 'rgba(255,255,255,.05)' };
      var sdC = m.sellOutDays <= 15 ? '#a3e635' : m.sellOutDays <= 30 ? '#22d3ee' : m.sellOutDays <= 45 ? '#f59e0b' : '#e8211a';
      var scC = m.overallScore >= 70 ? '#a3e635' : m.overallScore >= 45 ? '#22d3ee' : '#f59e0b';
      return '<tr>'
        + '<td style="font-family:var(--fm);font-size:10px;color:var(--text4)">' + (i + 1) + '</td>'
        + '<td style="font-family:var(--fu);font-size:11px;font-weight:700;color:var(--text);white-space:nowrap">' + m.model + '</td>'
        + '<td style="font-family:var(--fm);color:var(--text2)">' + fmtM(m.costPc) + '</td>'
        + '<td style="font-family:var(--fm);color:#fbbf24">' + fmtM(m.sellPc) + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee">' + fmtM(m.profitPc) + '</td>'
        + '<td style="font-family:var(--fm);font-weight:700;color:' + (m.roi >= 15 ? '#a3e635' : m.roi >= 10 ? '#f59e0b' : '#e8211a') + '">' + pct(m.roi) + '</td>'
        + '<td style="font-family:var(--fm);color:var(--text2)">' + (m.recQty || '—') + '</td>'
        + '<td style="font-family:var(--fm);color:#34d399">' + m.sold + '</td>'
        + '<td style="font-family:var(--fm);color:' + (m.avail <= 3 ? '#e8211a' : '#8899b4') + '">' + m.avail + '</td>'
        + '<td style="font-family:var(--fm);color:#22d3ee">' + m.d7 + '</td>'
        + '<td style="font-family:var(--fm);font-weight:700;color:#a3e635">' + m.d30 + '</td>'
        + '<td style="font-family:var(--fm);font-weight:700;color:' + sdC + '">' + (m.sellOutDays >= 999 ? '∞' : m.sellOutDays + 'd') + '</td>'
        + '<td style="font-family:var(--fm);font-size:11px;font-weight:700;color:#22d3ee">' + m.rotScore.toFixed(1) + '</td>'
        + '<td style="font-family:var(--fm);font-size:11px;font-weight:700;color:#a3e635">' + m.roiScore.toFixed(1) + '</td>'
        + '<td><div style="display:flex;align-items:center;gap:4px"><span style="font-family:var(--fm);font-size:16px;font-weight:800;color:' + scC + '">' + m.overallScore + '</span></div></td>'
        + '<td><span class="sh-badge" style="color:' + cat.col + ';background:' + cat.bg + ';border-color:' + cat.col + '44">' + cat.lbl + '</span></td>'
        + '<td><span style="font-family:var(--fm);font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;color:' + (DEC_C[m.decision] || '#8899b4') + ';background:' + (DEC_C[m.decision] || '#8899b4') + '18">' + m.decision + '</span></td>'
      + '</tr>';
    }).join('');

    var ins = document.getElementById('s8Insight'); if (!ins) return;
    var all = s8Models();
    var buy = all.filter(function (m) { return m.decision === 'BUY MORE'; });
    var stop = all.filter(function (m) { return m.decision === 'STOP'; });
    ins.innerHTML = '💡 '
      + (buy.length ? '<b>Buy More:</b> ' + buy.slice(0, 3).map(function (m) { return m.model + ' (ROI ' + pct(m.roi) + ')'; }).join(', ') + '. ' : '')
      + (stop.length ? '⚠️ <b>Stop Buying:</b> ' + stop.slice(0, 3).map(function (m) { return m.model; }).join(', ') + '. Capital lock হচ্ছে।' : '');
    renderOverview();
  };

  // ══ 5. NAVIGATION ═════════════════════════════════════════════════════════
  window.shRefreshAll = function () { renderOverview(); };
  window.shShowOverview = function () {
    document.getElementById('sh-overview').style.display = '';
    document.querySelectorAll('.sh-detail').forEach(function (d) { d.style.display = 'none'; });
    renderOverview();
  };
  window.shOpenStrategy = function (id) {
    document.getElementById('sh-overview').style.display = 'none';
    document.querySelectorAll('.sh-detail').forEach(function (d) { d.style.display = 'none'; });
    var det = document.getElementById('sh-s' + id);
    if (det) { det.style.display = 'block'; det.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    var renders = { 1: window.s1Render, 2: window.s2Render, 3: window.s3Render, 4: window.s4Render, 5: window.s5Render, 6: window.s6Render, 7: window.s7Render, 8: window.s8Render };
    if (renders[id]) renders[id]();
  };

  // ══ 6. INSTALL ════════════════════════════════════════════════════════════
  function install() {
    // Add strategy section to main div
    var main = document.querySelector('.main') || document.querySelector('#app > div');
    if (!main) { setTimeout(install, 400); return; }
    if (document.getElementById('strategiespage')) return; // already installed

    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildHTML();
    while (wrapper.firstChild) main.appendChild(wrapper.firstChild);

    // Add nav button
    var nav = document.querySelector('nav.nav') || document.querySelector('nav');
    if (nav) {
      // Remove old strategy button if exists
      var old = document.getElementById('s1NavBtn');
      if (old) old.remove();
      var btn = document.createElement('button');
      btn.className = 'nb';
      btn.id = 'stratHubBtn';
      btn.innerHTML = '🔥 Strategies';
      btn.style.cssText = 'color:#fbbf24;font-weight:800;letter-spacing:.5px';
      btn.onclick = function () { if (typeof window.goTo === 'function') window.goTo('strategiespage', this); };
      nav.appendChild(btn);
    }

    // Patch goTo
    if (typeof window.goTo === 'function') {
      var _orig = window.goTo;
      var _patched = false;
      if (!window._stratHubPatched) {
        window._stratHubPatched = true;
        window.goTo = function (id, btn2) {
          _orig.apply(this, arguments);
          if (id === 'strategiespage') {
            setTimeout(function () { renderOverview(); }, 60);
          }
        };
      }
    }

    renderOverview();
    notify('🔥 Strategy Hub loaded!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(install, 600); });
  } else {
    setTimeout(install, 600);
  }
})();
