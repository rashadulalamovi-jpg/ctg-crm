/* CTG Strategy Hub v2.0 — Inline Build */
/**
 * CTG Strategy Hub v2.0  — Complete Build
 * =====================================================
 * DEPLOY: এক লাইন index.html এ </body> এর আগে যোগ করুন:
 *   <script src="ctg_strategy_hub_v2.js"><\/script>
 *
 * CRM কোনো পরিবর্তন নেই। Live data: ctgcrm_v18 localStorage
 * Own keys: ctg_hub_s1_tgt | s3_dubai | s4_gaps | s5_royal | s6_video | s7_psy
 */
(function () {
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// DATA LAYER — reads ctgcrm_v18 localStorage (ALWAYS available)
// ══════════════════════════════════════════════════════════════════════════
function getCustomers() {
  // 1. window.db — if CRM exposes it
  if (window.db && window.db.customers && window.db.customers.length > 0)
    return window.db.customers;
  // 2. ctgcrm_v18 — PRIMARY FIX (CRM uses local var db, not window.db)
  try {
    var r = localStorage.getItem('ctgcrm_v18');
    if (r) { var p = JSON.parse(r); if (p && p.customers && p.customers.length > 0) return p.customers; }
  } catch(e) {}
  // 3. Old key fallback
  try { var o = JSON.parse(localStorage.getItem('ctgcrm_v17') || '{}'); if (o.customers && o.customers.length) return o.customers; } catch(e) {}
  return [];
}
window.getCustomers = getCustomers;
function getStockBatches() {
  try { var d = JSON.parse(localStorage.getItem('ctgstock_v2') || '{}'); return d.batches || d.stockBatches || (Array.isArray(d) ? d : []); } catch(e) { return []; }
}
window.getStockBatches = getStockBatches;
function lsGet(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e) { return def; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }

// ══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════
function fmtM(n) { return '\u09f3' + Number(Math.round(n || 0)).toLocaleString('en-BD'); }
function pct(n) { return (+(n || 0)).toFixed(1) + '%'; }
function today() { return new Date().toISOString().slice(0, 10); }
function kpi(lbl, val, sub, col) {
  return '<div style="background:rgba(23,32,48,.75);border:1px solid rgba(255,255,255,.06);border-top:2px solid '
    + col + ';border-radius:10px;padding:12px">'
    + '<div style="font-size:7.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:5px">' + lbl + '</div>'
    + '<div style="font-family:var(--fm,monospace);font-size:21px;font-weight:700;color:' + col + ';line-height:1">' + val + '</div>'
    + '<div style="font-size:10px;color:var(--text3,#4a5f7a);margin-top:3px;font-family:var(--fm,monospace)">' + sub + '</div></div>';
}
function sbg(s) {
  var N = {'1':'Lead','2':'Trust','3':'Trial','4':'Repeat','5':'Trusted','6':'Royal\u2605','7':'Royal'};
  var C = {'1':'#f59e0b','2':'#4da3ff','3':'#c084fc','4':'#22d3ee','5':'#34d399','6':'#fb923c','7':'#fbbf24'};
  var n = N[s]||s, c = C[s]||'#4a5f7a';
  return '<span style="font-family:var(--fm,monospace);font-size:8px;font-weight:700;padding:2px 8px;border-radius:20px;color:' + c + ';background:' + c + '1a;border:1px solid ' + c + '44">' + n + '</span>';
}
function badge(v, c) { return '<span style="font-family:var(--fm,monospace);font-size:8.5px;font-weight:700;padding:2px 9px;border-radius:20px;color:' + c + ';background:' + c + '1a;border:1px solid ' + c + '44">' + v + '</span>'; }
function shNotify(msg) { var n = document.getElementById('shN'); if (!n) return; n.textContent = msg; n.style.display = 'block'; setTimeout(function () { n.style.display = 'none'; }, 2400); }

// ══════════════════════════════════════════════════════════════════════════
// STRATEGY CONFIG
// ══════════════════════════════════════════════════════════════════════════
var STRATS = [
  { id:1, num:'\u09e6\u09e7', name:'Trusted Customer Sales Double', desc:'\u09ee customer \u00d7 \u09eb\u09e6 pcs \u2192 +\u09e8\u09e6\u09e6 pcs/\u09ae\u09be\u09b8', phase:'\u098f\u0996\u09a8\u0987 \u09b6\u09c1\u09b0\u09c1', col:'#0F6E56', lite:'rgba(15,110,86,.13)' },
  { id:2, num:'\u09e6\u09e8', name:'Bundle First Policy', desc:'Bundle ROI vs Single ROI \u09a4\u09c1\u09b2\u09a8\u09be', phase:'\u098f\u0996\u09a8\u0987 \u09b6\u09c1\u09b0\u09c1', col:'#0F6E56', lite:'rgba(15,110,86,.13)' },
  { id:3, num:'\u09e6\u09e9', name:'Dubai Direct Dhaka', desc:'\u09eb\u09e6% advance \u00b7 \u09e9\u09e6\u2013\u09eb\u09e6 pcs/order', phase:'\u098f\u0987 \u09ae\u09be\u09b8\u09c7', col:'#8B5E0A', lite:'rgba(139,94,10,.13)' },
  { id:4, num:'\u09e6\u09ea', name:'SKU Gap Fill', desc:'Same buyer, \u09a8\u09a4\u09c1\u09a8 revenue, zero cost', phase:'\u098f\u0987 \u09ae\u09be\u09b8\u09c7', col:'#8B5E0A', lite:'rgba(139,94,10,.13)' },
  { id:5, num:'\u09e6\u09eb', name:'Royal Customer Blueprint', desc:'Trial \u2192 Trusted \u2192 Royal system', phase:'\u098f\u0996\u09a8\u0987 \u09b6\u09c1\u09b0\u09c1', col:'#185FA5', lite:'rgba(24,95,165,.13)' },
  { id:6, num:'\u09e6\u09ec', name:'Video Trust System', desc:'\u09e8\u09eb\u09e6+ cold contact \u2192 conversion', phase:'\u09e9\u09e6 \u09a6\u09bf\u09a8\u09c7', col:'#185FA5', lite:'rgba(24,95,165,.13)' },
  { id:7, num:'\u09e6\u09ed', name:'Customer Psychology Profile', desc:'Type A/B/C playbook \u2014 \u0986\u09b2\u09be\u09a6\u09be strategy', phase:'\u09e9\u09e6 \u09a6\u09bf\u09a8\u09c7', col:'#534AB7', lite:'rgba(83,74,183,.13)' },
  { id:8, num:'\u09e6\u09ee', name:'ROI Model Sourcing + Fast Rotation', desc:'avg ROI \u09e7\u09e7% \u2192 \u09e7\u09ec% (+\u09ea\u09eb% profit)', phase:'\u098f\u0996\u09a8\u0987 \u09b6\u09c1\u09b0\u09c1', col:'#0F6E56', lite:'rgba(15,110,86,.13)' },
];

// ══════════════════════════════════════════════════════════════════════════
// CSS INJECTION
// ══════════════════════════════════════════════════════════════════════════
var _CSS = `
<style id="shCSS">
.sh-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sh-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px;cursor:pointer;position:relative;overflow:hidden;transition:transform .18s,box-shadow .18s}
.sh-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3)}
.sh-acc{height:3px;width:100%;position:absolute;top:0;left:0}
.sh-gnum{font-size:52px;font-weight:900;opacity:.07;line-height:1;margin-bottom:-2px;letter-spacing:-2px}
.sh-cname{font-size:14px;font-weight:700;color:var(--text,#f0f4f8);margin-bottom:3px}
.sh-cdesc{font-size:11px;color:var(--text3,#4a5f7a);margin-bottom:12px;line-height:1.5}
.sh-cfoot{display:flex;align-items:center;justify-content:space-between}
.sh-phase{font-size:9px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:.05em;text-transform:uppercase}
.sh-pw{display:flex;align-items:center;gap:7px}
.sh-pt{width:70px;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.sh-pb{height:100%;border-radius:2px;transition:width .5s}
.sh-pp{font-family:var(--fm,monospace);font-size:11px;font-weight:700;min-width:32px;text-align:right}
.sh-det{display:none}
.sh-back{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 14px;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;cursor:pointer;color:var(--text2,#8899b4);margin-bottom:16px;transition:all .15s}
.sh-back:hover{border-color:var(--gold,#fbbf24);color:var(--gold,#fbbf24)}
.sh-dh{border-radius:12px;padding:16px 20px;margin-bottom:14px;position:relative;overflow:hidden}
.sh-dg{position:absolute;right:-8px;top:-8px;font-size:100px;font-weight:900;opacity:.055;line-height:1;letter-spacing:-4px;pointer-events:none}
.sh-dn{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.6;margin-bottom:3px}
.sh-dt{font-size:19px;font-weight:800;margin-bottom:4px}
.sh-ds{font-size:11px;opacity:.7;line-height:1.5}
.sh-kr{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.sh-tw{overflow-x:auto}
.sh-tbl{width:100%;border-collapse:collapse}
.sh-tbl th{font-size:8px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:var(--text3,#4a5f7a);padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left;background:rgba(23,32,48,.5);white-space:nowrap}
.sh-tbl td{padding:7px 10px;border-bottom:1px solid rgba(255,255,255,.03);font-size:11px;color:var(--text2,#8899b4);vertical-align:middle}
.sh-tbl tr:hover td{background:rgba(251,191,36,.02)}
.shi{background:rgba(23,32,48,.8);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 8px;color:var(--text,#f0f4f8);font-family:var(--fm,monospace);font-size:11px;outline:none;transition:border-color .15s}
.shi:focus{border-color:var(--gold,#fbbf24)}
.shsel{background:rgba(23,32,48,.8);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 8px;color:var(--text,#f0f4f8);font-family:var(--fm,monospace);font-size:11px;outline:none}
.shlbl{font-size:8px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:3px}
.shbtn{padding:5px 12px;border-radius:6px;font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--text2,#8899b4);transition:all .15s}
.shbtn:hover{border-color:var(--gold,#fbbf24);color:var(--gold,#fbbf24)}
.shbp{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:var(--gold,#fbbf24)}
.shbg{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--green,#34d399)}
.shbr{background:rgba(232,33,26,.1);border:1px solid rgba(232,33,26,.3);color:var(--red,#e8211a)}
.shform{background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px;margin-bottom:12px;display:none}
.shform.open{display:block}
.shing{background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.13);border-left:3px solid var(--gold,#fbbf24);border-radius:8px;padding:10px 13px;margin-bottom:6px;font-size:11px;color:var(--text2,#8899b4);line-height:1.6}
.sh-empty{text-align:center;padding:30px;color:var(--text3,#4a5f7a);font-family:var(--fm,monospace);font-size:11px}
.sh-tog{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:5px;border:1px solid;cursor:pointer;font-family:var(--fm,monospace);font-size:10px;font-weight:700;user-select:none;transition:all .2s}
.sh-tog-on{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.4);color:var(--green,#34d399)}
.sh-tog-off{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.07);color:var(--text4,#2a3d55)}
.sh-tog-off:hover{border-color:rgba(251,191,36,.35);color:var(--warn,#f59e0b)}
.s8sn{display:flex;background:rgba(13,17,23,.9);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:4px;gap:3px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none}
.s8sn::-webkit-scrollbar{display:none}
.s8snb{flex:1;padding:7px 8px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border:1px solid transparent;border-radius:7px;cursor:pointer;white-space:nowrap;background:none;color:var(--text3,#4a5f7a);transition:all .2s;min-width:0}
.s8snb.on{background:rgba(163,230,53,.15);color:#a3e635;border-color:rgba(163,230,53,.3)}
.s8sec{display:none}.s8sec.on{display:block}
.shcard2{background:rgba(23,32,48,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px}
.shtit{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:10px}
#shN{position:fixed;bottom:18px;right:18px;background:rgba(13,17,23,.97);border:1px solid var(--green,#34d399);border-radius:10px;padding:10px 16px;font-size:11px;font-weight:700;color:var(--green,#34d399);z-index:9999;display:none;box-shadow:0 8px 32px rgba(0,0,0,.5)}
@media(max-width:640px){.sh-grid{grid-template-columns:1fr}.sh-kr{grid-template-columns:1fr 1fr}}
</style>`;

// ══════════════════════════════════════════════════════════════════════════
// HTML — overview + all 8 strategy detail pages
// ══════════════════════════════════════════════════════════════════════════
function buildHTML() {
  return _CSS + `
<div id="shN"></div>
<div id="strategiespage" class="sec">

<!-- ── OVERVIEW ──────────────────────────────────────────────── -->
<div id="sh-ov">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:8px">
    <div>
      <div style="font-size:22px;font-weight:800">🔥 CTG Strategy Hub</div>
      <div style="font-size:11px;color:var(--text3,#4a5f7a);margin-top:3px">৮টি কৌশল · Live CRM Data</div>
    </div>
    <button class="shbtn shbp" onclick="shRefresh()">🔄 Refresh Progress</button>
  </div>
  <div class="sh-grid" id="shGrid"></div>
</div>

<!-- ── S1: Trust Sales Double ────────────────────────────────── -->
<div class="sh-det" id="sh-s1">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(15,110,86,.1);color:#0F6E56">
    <div class="sh-dg" style="color:#0F6E56">01</div>
    <div class="sh-dn">কৌশল ০১ · GAME CHANGER</div>
    <div class="sh-dt">Trusted Customer Sales Double</div>
    <div class="sh-ds">Live invoice data → monthly pcs tracking → target gap analysis</div>
  </div>
  <div class="sh-kr" id="s1kr"></div>
  <div class="shcard2">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <div class="shtit" style="margin-bottom:0">📊 MONTHLY PCS TRACKER</div>
      <select id="s1mon" onchange="s1R()" class="shsel" style="width:auto"></select>
      <input id="s1q" oninput="s1R()" placeholder="🔍 Customer..." class="shi" style="width:140px">
      <button class="shbtn shbp" onclick="s1R()">🔄</button>
    </div>
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>Avg/M</th><th>Last M</th><th>This M</th><th>Growth</th><th>🎯 Target</th><th>Gap</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody id="s1tb"></tbody>
      </table>
    </div>
    <div id="s1ft" style="margin-top:10px;padding:8px;background:rgba(23,32,48,.5);border-radius:6px;display:flex;gap:16px;flex-wrap:wrap"></div>
  </div>
  <div class="shing" id="s1ins" style="margin-top:10px"></div>
</div>

<!-- ── S2: Bundle First Policy ───────────────────────────────── -->
<div class="sh-det" id="sh-s2">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(15,110,86,.1);color:#0F6E56">
    <div class="sh-dg" style="color:#0F6E56">02</div>
    <div class="sh-dn">কৌশল ০২ · GAME CHANGER</div>
    <div class="sh-dt">Bundle First Policy</div>
    <div class="sh-ds">Invoice data → single vs multi model → ROI lift analysis</div>
  </div>
  <div class="sh-kr" id="s2kr"></div>
  <div class="shcard2">
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>Total Inv</th><th>Single</th><th>Multi</th><th>Bundle%</th><th>Single ROI</th><th>Bundle ROI</th><th>ROI Lift</th><th>Avg pcs</th><th>Score</th></tr></thead>
        <tbody id="s2tb"></tbody>
      </table>
    </div>
  </div>


<!-- S2 CUSTOMER BUNDLE ADVISOR — injected by patch -->
<div id="s2advisor" style="margin-top:14px">

  <!-- Customer Selector -->
  <div class="shcard2" style="border-top:2px solid #a3e635">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="font-family:var(--fd,Syne,sans-serif);font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#a3e635">🎯 CUSTOMER BUNDLE ADVISOR</div>
      <select id="s2custSel" onchange="s2advisor()" class="shsel" style="flex:1;min-width:160px;max-width:260px">
        <option value="">— Customer select করুন —</option>
      </select>
      <button class="shbtn shbp" onclick="s2advisor()">🔍 Analyze</button>
    </div>

    <!-- Customer History Panel -->
    <div id="s2custHist" style="display:none">

      <!-- KPI Row -->
      <div id="s2ak" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px"></div>

      <!-- 2 column layout: History + Suggestions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

        <!-- LEFT: Model History -->
        <div>
          <div style="font-family:var(--fd,Syne,sans-serif);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:8px">📦 কোন Model কত কিনেছে</div>
          <div id="s2mhist"></div>
        </div>

        <!-- RIGHT: Bundle Suggestions -->
        <div>
          <div style="font-family:var(--fd,Syne,sans-serif);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#a3e635;margin-bottom:8px">💡 RECOMMENDED BUNDLES</div>
          <div id="s2bundles"></div>
        </div>
      </div>

      <!-- Invoice Timeline -->
      <div style="margin-top:12px">
        <div style="font-family:var(--fd,Syne,sans-serif);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:8px">🕐 Recent Invoices</div>
        <div class="sh-tw">
          <table class="sh-tbl">
            <thead><tr><th>Date</th><th>Models</th><th>Qty</th><th>ROI%</th><th>Type</th><th>Bundle?</th></tr></thead>
            <tbody id="s2invtb"></tbody>
          </table>
        </div>
      </div>

    </div>
    <div id="s2custEmpty" style="text-align:center;padding:20px;color:var(--text3,#4a5f7a);font-family:var(--fm,monospace);font-size:11px">
      ⬆️ উপরে customer select করুন → তার data দেখুন → bundle suggestion পাবেন
    </div>
  </div>
</div>


</div>

<!-- ── S3: Dubai Direct Dhaka ────────────────────────────────── -->
<div class="sh-det" id="sh-s3">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(139,94,10,.1);color:#C98A1A">
    <div class="sh-dg" style="color:#C98A1A">03</div>
    <div class="sh-dn">কৌশল ০৩ · HIGH IMPACT</div>
    <div class="sh-dt">Dubai Direct Dhaka</div>
    <div class="sh-ds">ঢাকার wholesale buyer → ৫০% advance → Dubai order → deliver</div>
  </div>
  <div class="sh-kr" id="s3kr"></div>
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <button class="shbtn shbp" onclick="s3form()">+ New Deal</button>
    <button class="shbtn" onclick="s3R()">🔄</button>
  </div>
  <div class="shform" id="s3fm">
    <div style="font-size:10px;font-weight:700;color:var(--gold,#fbbf24);margin-bottom:10px">+ DUBAI DEAL</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Shop / Customer</div><input id="s3fn" class="shi" style="width:100%" placeholder="Shop name..."></div>
      <div><div class="shlbl">Requirement</div><input id="s3fr" class="shi" style="width:100%" placeholder="HP 845 G8 × 20..."></div>
      <div><div class="shlbl">Expected pcs</div><input id="s3fp" class="shi" type="number" style="width:100%" placeholder="30"></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Advance Amount (৳)</div><input id="s3fa" class="shi" type="number" style="width:100%" placeholder="0"></div>
      <div><div class="shlbl">WhatsApp</div><input id="s3fw" class="shi" style="width:100%" placeholder="017..."></div>
      <div><div class="shlbl">Note</div><input id="s3fnt" class="shi" style="width:100%" placeholder="..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="shbtn shbg" onclick="s3sv()">✓ Add</button>
      <button class="shbtn" onclick="document.getElementById('s3fm').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <div class="shcard2">
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>Shop</th><th>Req</th><th>pcs</th><th>Adv</th><th>50% Adv</th><th>Dubai Ord</th><th>QC</th><th>Shipped</th><th>Bal Pay</th><th>Delivered</th><th>Status</th><th>✕</th></tr></thead>
        <tbody id="s3tb"></tbody>
      </table>
    </div>
  </div>
</div>

<!-- ── S4: SKU Gap Fill ──────────────────────────────────────── -->
<div class="sh-det" id="sh-s4">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(139,94,10,.1);color:#C98A1A">
    <div class="sh-dg" style="color:#C98A1A">04</div>
    <div class="sh-dn">কৌশল ০৪ · HIGH IMPACT</div>
    <div class="sh-dt">SKU Gap Fill Intelligence</div>
    <div class="sh-ds">CRM models (auto) + manual gaps → Pilot → Scale/Stop decision</div>
  </div>
  <div class="sh-kr" id="s4kr"></div>
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <button class="shbtn shbp" onclick="s4form()">+ Add Gap</button>
    <button class="shbtn" onclick="s4R()">🔄</button>
  </div>
  <div class="shform" id="s4fm">
    <div style="font-size:10px;font-weight:700;color:var(--gold,#fbbf24);margin-bottom:10px">+ SKU GAP</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Customer</div><select id="s4fc" class="shsel" style="width:100%"><option value="">—</option></select></div>
      <div><div class="shlbl">Gap Models (per line)</div><textarea id="s4fm2" class="shi" style="width:100%;min-height:50px;resize:vertical" placeholder="HP 850 G7&#10;Dell 7420"></textarea></div>
      <div><div class="shlbl">Channel</div><select id="s4fch" class="shsel" style="width:100%"><option>Facebook</option><option>Bikroy</option><option>YouTube</option><option>Website</option><option>BDStall</option><option>Shop Visit</option></select></div>
      <div><div class="shlbl">Note</div><input id="s4fn" class="shi" style="width:100%" placeholder="..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="shbtn shbg" onclick="s4sv()">✓ Add</button>
      <button class="shbtn" onclick="document.getElementById('s4fm').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <div class="shcard2" style="margin-bottom:10px">
    <div class="shtit">👥 MODELS PER CUSTOMER (AUTO FROM CRM)</div>
    <div class="sh-tw"><table class="sh-tbl"><thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>CTG থেকে কিনছে</th><th>Gaps</th></tr></thead><tbody id="s4cust"></tbody></table></div>
  </div>
  <div class="shcard2">
    <div class="shtit">📋 GAP TRACKER</div>
    <div class="sh-tw"><table class="sh-tbl"><thead><tr><th>Customer</th><th>Model</th><th>Channel</th><th>Pilot</th><th>Sold</th><th>ROI%</th><th>Status</th><th>Decision</th><th>Action</th></tr></thead><tbody id="s4gap"></tbody></table></div>
  </div>
  <div class="shform" id="s4pf" style="margin-top:10px">
    <div style="font-size:10px;font-weight:700;color:#22d3ee;margin-bottom:8px">🚀 PILOT UPDATE</div>
    <input type="hidden" id="s4pid">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Pilot Qty</div><input id="s4pq" class="shi" type="number" style="width:100%"></div>
      <div><div class="shlbl">Sold Qty</div><input id="s4ps" class="shi" type="number" style="width:100%"></div>
      <div><div class="shlbl">Cost/pc (৳)</div><input id="s4pc" class="shi" type="number" style="width:100%"></div>
      <div><div class="shlbl">Sell/pc (৳)</div><input id="s4psp" class="shi" type="number" style="width:100%"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="shbtn shbg" onclick="s4psv()">✓ Update</button>
      <button class="shbtn" onclick="document.getElementById('s4pf').classList.remove('open')">Cancel</button>
    </div>
  </div>
</div>

<!-- ── S5: Royal Customer Blueprint ─────────────────────────── -->
<div class="sh-det" id="sh-s5">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(24,95,165,.1);color:#4da3ff">
    <div class="sh-dg" style="color:#4da3ff">05</div>
    <div class="sh-dn">কৌশল ০৫ · CASHFLOW</div>
    <div class="sh-dt">Royal Customer Blueprint</div>
    <div class="sh-ds">💰 Advance = Default → 🚚 Courier Release = 50% → 💳 Credit Limit = 100% 👑</div>
  </div>
  <div class="shing" style="margin-bottom:12px">💡 CEO manually unlock করবে। Customer-কে benefit বলবেন না আগে।</div>
  <div class="sh-kr" id="s5kr"></div>
  <div class="shcard2">
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>Inv</th><th>pcs</th><th>💰 Default</th><th>🚚 Courier</th><th>💳 Credit</th><th>Amount</th><th>Progress</th></tr></thead>
        <tbody id="s5tb"></tbody>
      </table>
    </div>
  </div>
</div>

<!-- ── S6: Video Trust System ────────────────────────────────── -->
<div class="sh-det" id="sh-s6">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(24,95,165,.1);color:#4da3ff">
    <div class="sh-dg" style="color:#4da3ff">06</div>
    <div class="sh-dn">কৌশল ০৬ · BRAND BUILD</div>
    <div class="sh-dt">Video Trust System</div>
    <div class="sh-ds">QC video → Dubai source video → cold lead conversion tracking</div>
  </div>
  <div class="sh-kr" id="s6kr"></div>
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <button class="shbtn shbp" onclick="s6form()">+ Video Log</button>
    <button class="shbtn" onclick="s6R()">🔄</button>
  </div>
  <div class="shform" id="s6fm">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Video Type</div><select id="s6ft" class="shsel" style="width:100%"><option>QC Proof</option><option>Dubai Source</option><option>Profit Education</option><option>Stock Arrival</option><option>Bundle Offer</option><option>Customer Review</option></select></div>
      <div><div class="shlbl">Sent To</div><select id="s6fc" class="shsel" style="width:100%"><option value="">— Select —</option></select></div>
      <div><div class="shlbl">Date</div><input id="s6fd" class="shi" type="date" style="width:100%"></div>
      <div><div class="shlbl">Model (if inquiry)</div><input id="s6fm2" class="shi" style="width:100%" placeholder="HP 445 G8..."></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Seen?</div><select id="s6fs" class="shsel" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div><div class="shlbl">Reply?</div><select id="s6fr2" class="shsel" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div><div class="shlbl">Trial Order?</div><select id="s6ftr" class="shsel" style="width:100%"><option value="0">No</option><option value="1">Yes</option></select></div>
      <div><div class="shlbl">Note</div><input id="s6fn" class="shi" style="width:100%" placeholder="..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="shbtn shbg" onclick="s6sv()">✓ Add</button>
      <button class="shbtn" onclick="document.getElementById('s6fm').classList.remove('open')">Cancel</button>
    </div>
  </div>
  <div class="shcard2">
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>#</th><th>Type</th><th>Customer</th><th>Date</th><th>Seen</th><th>Reply</th><th>Model</th><th>Trial</th><th>Status</th><th>Note</th><th>✕</th></tr></thead>
        <tbody id="s6tb"></tbody>
      </table>
    </div>
  </div>
</div>

<!-- ── S7: Psychology Profile ────────────────────────────────── -->
<div class="sh-det" id="sh-s7">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(83,74,183,.1);color:#c084fc">
    <div class="sh-dg" style="color:#c084fc">07</div>
    <div class="sh-dn">কৌশল ০৭ · INTELLIGENCE</div>
    <div class="sh-dt">Customer Psychology Profile</div>
    <div class="sh-ds">15 seconds-এ customer বোঝো → Buy trigger → Fear → Strategy</div>
  </div>
  <div class="sh-kr" id="s7kr"></div>
  <div class="shcard2" style="margin-bottom:10px">
    <div class="sh-tw">
      <table class="sh-tbl">
        <thead><tr><th>#</th><th>Customer</th><th>Stage</th><th>Personality</th><th>Order</th><th>Payment</th><th>Trust</th><th>Buy Trigger</th><th>Fear</th><th>🧠 Score</th><th>Edit</th></tr></thead>
        <tbody id="s7tb"></tbody>
      </table>
    </div>
  </div>
  <div class="shform" id="s7ef">
    <div style="font-size:10px;font-weight:700;color:#c084fc;margin-bottom:10px" id="s7etit">🧠 PROFILE</div>
    <input type="hidden" id="s7eid"><input type="hidden" id="s7ecid">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Personality</div><select id="s7ep" class="shsel" style="width:100%"><option>Growth Minded</option><option>Analytical</option><option>Risk Averse</option><option>Price Sensitive</option><option>Relationship Based</option><option>Cash Limited</option></select></div>
      <div><div class="shlbl">Order Style</div><select id="s7eo" class="shsel" style="width:100%"><option>Bulk Buyer</option><option>Test Then Scale</option><option>Small Frequent</option><option>Bundle Buyer</option><option>Mix Model</option></select></div>
      <div><div class="shlbl">Payment</div><select id="s7epay" class="shsel" style="width:100%"><option>100% Advance</option><option>Courier Release</option><option>Invoice Credit</option><option>Instant Pay</option><option>Delayed Pay</option><option>Reminder Needed</option></select></div>
      <div><div class="shlbl">Trust Style</div><select id="s7et" class="shsel" style="width:100%"><option>QC Video Based</option><option>Relationship Based</option><option>Previous Experience</option><option>Proof Based</option><option>Dubai Video Based</option></select></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
      <div><div class="shlbl">Buy Trigger</div><select id="s7ebt" class="shsel" style="width:100%"><option>New Stock</option><option>Good Price</option><option>QC Video</option><option>Dubai Arrival</option><option>Bundle Offer</option><option>Priority Stock</option></select></div>
      <div><div class="shlbl">Fear Trigger</div><select id="s7eft" class="shsel" style="width:100%"><option>Money Loss</option><option>Return Issue</option><option>Capital Lock</option><option>Wrong Model</option><option>Slow Sale</option></select></div>
      <div><div class="shlbl">Growth Mode</div><select id="s7eg" class="shsel" style="width:100%"><option>Aggressive Growth</option><option>Moderate Growth</option><option>Stable Business</option><option>Survival Mode</option></select></div>
      <div><div class="shlbl">CEO Note</div><input id="s7en" class="shi" style="width:100%" placeholder="observation..."></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="shbtn shbg" onclick="s7sv()">🧠 Save</button>
      <button class="shbtn" onclick="document.getElementById('s7ef').classList.remove('open')">Cancel</button>
    </div>
  </div>
</div>

<!-- ── S8: ROI Engine — FULL FEATURED ───────────────────────── -->
<div class="sh-det" id="sh-s8">
  <button class="sh-back" onclick="shOv()">← Back</button>
  <div class="sh-dh" style="background:rgba(15,110,86,.1);color:#a3e635">
    <div class="sh-dg" style="color:#a3e635">08</div>
    <div class="sh-dn">কৌশল ০৮ · CAPITAL EFFICIENCY</div>
    <div class="sh-dt">ROI Model Sourcing + Fast Rotation</div>
    <div class="sh-ds">Live CRM invoices + Stock → Model Intelligence → Buy/Stop/Scale</div>
  </div>

  <!-- Sub-Nav -->
  <div class="s8sn">
    <button class="s8snb on" id="s8n1" onclick="s8tab(1)">📊 Overview</button>
    <button class="s8snb" id="s8n2" onclick="s8tab(2)">🗂️ Model Table</button>
    <button class="s8snb" id="s8n3" onclick="s8tab(3)">🏆 Leaderboard</button>
    <button class="s8snb" id="s8n4" onclick="s8tab(4)">📈 12M Trend</button>
    <button class="s8snb" id="s8n5" onclick="s8tab(5)">💰 Capital</button>
    <button class="s8snb" id="s8n6" onclick="s8tab(6)">👑 CEO View</button>
  </div>

  <!-- TAB 1: Overview -->
  <div class="s8sec on" id="s8t1">
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px" id="s8k1"></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px" id="s8k2"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
      <div class="shcard2"><div class="shtit">🏷️ Categories</div><div id="s8cats"></div></div>
      <div class="shcard2"><div class="shtit">💰 Capital Guide</div><div id="s8capg"></div></div>
      <div class="shcard2"><div class="shtit">⚡ Alerts</div><div id="s8alt"></div></div>
    </div>
    <div class="shcard2"><div class="shtit">🧠 Auto Insights</div><div id="s8ins" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px"></div></div>
  </div>

  <!-- TAB 2: Model Table -->
  <div class="s8sec" id="s8t2">
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <input id="s8mq" oninput="s8filt()" placeholder="🔍 Model..." class="shi" style="width:140px">
      <select id="s8cf" onchange="s8filt()" class="shsel"><option value="">All Cat</option><option value="STAR">⭐ Star</option><option value="FAST">⚡ Fast</option><option value="HIGHROI">💰 High ROI</option><option value="SLOW">🟠 Slow</option><option value="DEAD">🔴 Dead</option></select>
      <select id="s8df" onchange="s8filt()" class="shsel"><option value="">All Dec</option><option>BUY MORE</option><option>REBUY</option><option>HOLD</option><option>REDUCE</option><option>STOP</option></select>
    </div>
    <div class="shcard2"><div class="sh-tw" id="s8tblWrap"></div></div>
  </div>

  <!-- TAB 3: Leaderboards -->
  <div class="s8sec" id="s8t3">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px">
      <div class="shcard2" style="border-top:2px solid #a3e635"><div class="shtit" style="color:#a3e635">⭐ Top Score</div><div id="lb1"></div></div>
      <div class="shcard2" style="border-top:2px solid #22d3ee"><div class="shtit" style="color:#22d3ee">⚡ Fastest</div><div id="lb2"></div></div>
      <div class="shcard2" style="border-top:2px solid #fbbf24"><div class="shtit" style="color:#fbbf24">💰 Highest ROI</div><div id="lb3"></div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div class="shcard2" style="border-top:2px solid #34d399"><div class="shtit" style="color:#34d399">💵 Most Profit</div><div id="lb4"></div></div>
      <div class="shcard2" style="border-top:2px solid #f59e0b"><div class="shtit" style="color:#f59e0b">🔒 Capital Lock</div><div id="lb5"></div></div>
      <div class="shcard2" style="border-top:2px solid #e8211a"><div class="shtit" style="color:#e8211a">⚠️ Return Risk</div><div id="lb6"></div></div>
    </div>
  </div>

  <!-- TAB 4: 12M Trend -->
  <div class="s8sec" id="s8t4">
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
      <select id="s8ts" onchange="s8trend()" class="shsel" style="min-width:200px"><option value="">— Model select করুন —</option></select>
      <button class="shbtn shbp" onclick="s8trend()">📈 Show Trend</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px" id="s8trKpi"></div>
    <div class="shcard2" style="margin-bottom:10px">
      <div class="shtit">📊 Monthly Sold Qty</div>
      <div style="height:200px;position:relative"><canvas id="sch1"></canvas></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="shcard2"><div class="shtit">💰 Monthly Profit</div><div style="height:160px;position:relative"><canvas id="sch2"></canvas></div></div>
      <div class="shcard2"><div class="shtit">📈 Monthly ROI%</div><div style="height:160px;position:relative"><canvas id="sch3"></canvas></div></div>
    </div>
  </div>

  <!-- TAB 5: Capital Allocation -->
  <div class="s8sec" id="s8t5">
    <div class="shcard2" style="border-top:2px solid #a3e635;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div class="shtit" style="color:#a3e635;margin-bottom:0">🎯 Capital Allocation Simulator</div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-family:var(--fm,monospace);font-size:11px;color:var(--text3)">৳</span>
          <input type="number" id="capInp" value="1000000" class="shi" style="width:120px;text-align:right;color:#a3e635;border-color:rgba(163,230,53,.3)" oninput="s8cap()">
          <span style="font-family:var(--fm,monospace);font-size:11px;color:var(--text3)">টাকা</span>
        </div>
      </div>
      <div id="capAlloc"></div>
    </div>
    <div class="shcard2">
      <div class="shtit">🔒 Current Capital Lock by Model</div>
      <div id="capLock"></div>
    </div>
  </div>

  <!-- TAB 6: CEO View -->
  <div class="s8sec" id="s8t6">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
      <div class="shcard2" style="border-top:2px solid #a3e635"><div class="shtit" style="color:#a3e635">🚀 BUY MORE</div><div id="ceoBM"></div></div>
      <div class="shcard2" style="border-top:2px solid #22d3ee"><div class="shtit" style="color:#22d3ee">🔄 REBUY</div><div id="ceoRB"></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
      <div class="shcard2" style="border-top:2px solid #fbbf24"><div class="shtit" style="color:#fbbf24">⏸️ HOLD</div><div id="ceoH"></div></div>
      <div class="shcard2" style="border-top:2px solid #f59e0b"><div class="shtit" style="color:#f59e0b">📉 REDUCE</div><div id="ceoRD"></div></div>
      <div class="shcard2" style="border-top:2px solid #e8211a"><div class="shtit" style="color:#e8211a">🛑 STOP</div><div id="ceoST"></div></div>
    </div>
    <div class="shcard2"><div class="shtit">🤖 CEO Intelligence Q&amp;A</div><div id="ceoQA"></div></div>
  </div>
</div>

</div><!-- /#strategiespage -->`;
}

// ══════════════════════════════════════════════════════════════════════════
// S1 — Trusted Customer Sales Double
// ══════════════════════════════════════════════════════════════════════════
function addS1Totals() {
  var tb = document.getElementById('s1tb'); if (!tb) return;
  var old = document.getElementById('s1TotalRow'); if (old) old.remove();
  var rows = Array.from(tb.querySelectorAll('tr')); if (!rows.length) return;
  var sumM = 0, sumT = 0, nT = 0;
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td'); if (cells.length < 9) return;
    sumM += parseInt(cells[5].textContent.trim()) || 0;
    var inp = cells[7].querySelector('input');
    var tv = inp ? parseInt(inp.value) : NaN;
    if (!isNaN(tv) && tv > 0) { sumT += tv; nT++; }
  });
  var gap = sumT > 0 ? sumT - sumM : null;
  var gc = gap !== null ? (gap > 0 ? '#f87171' : '#34d399') : 'var(--text4)';
  var S = 'padding:9px 10px;font-size:11px;font-weight:700;font-family:monospace;';
  var tr = document.createElement('tr'); tr.id = 's1TotalRow';
  tr.style.cssText = 'border-top:2px solid rgba(251,191,36,.3);background:rgba(251,191,36,.04)';
  tr.innerHTML = '<td style="' + S + 'color:#fbbd24;letter-spacing:.5px">TOTAL</td>'
    + '<td style="' + S + 'color:rgba(251,191,36,.5);font-size:9px">' + nT + ' customers have targets</td>'
    + '<td></td><td></td><td></td>'
    + '<td style="' + S + 'color:#34d399;font-size:16px">' + sumM + '</td>'
    + '<td></td>'
    + '<td style="' + S + 'color:#fbbd24;font-size:16px">' + (sumT || '\u2014') + '</td>'
    + '<td style="' + S + 'color:' + gc + ';font-size:16px">' + (gap !== null ? gap : '\u2014') + '</td>'
    + '<td></td><td></td>';
  tb.appendChild(tr);
}
function s1BuildSel() {
  var sel = document.getElementById('s1mon'); if (!sel || sel.options.length > 1) return;
  var now = new Date();
  var MN = ['\u099c\u09be\u09a8\u09c1','\u09ab\u09c7\u09ac\u09cd\u09b0\u09c1','\u09ae\u09be\u09b0\u09cd\u099a','\u098f\u09aa\u09cd\u09b0\u09bf\u09b2','\u09ae\u09c7','\u099c\u09c1\u09a8','\u099c\u09c1\u09b2\u09be\u0987','\u0986\u0997\u09b8\u09cd\u099f','\u09b8\u09c7\u09aa\u09cd\u099f\u09c7','\u0985\u0995\u09cd\u099f\u09cb','\u09a8\u09ad\u09c7','\u09a1\u09bf\u09b8\u09c7'];
  for (var i = 0; i < 12; i++) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var v = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    var o = document.createElement('option'); o.value = v;
    o.textContent = MN[d.getMonth()] + ' ' + d.getFullYear();
    if (i === 0) o.selected = true; sel.appendChild(o);
  }
}
window.s1R = function () {
  s1BuildSel();
  var custs = getCustomers();
  if (!custs.length) {
    var tb = document.getElementById('s1tb');
    if (tb) tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">\u09a1\u09be\u099f\u09be \u09b2\u09cb\u09a1 \u09b9\u099a\u09cd\u099b\u09c7... CRM-\u098f customer \u09a5\u09be\u0995\u09b2\u09c7 \u098f\u0996\u09be\u09a8\u09c7 \u09a6\u09c7\u0996\u09be\u09ac\u09c7\u0964 \u0986\u09ac\u09be\u09b0 \u09b2\u09cb\u09a1 \u09b9\u09b2\u09c7 🔄 click \u0995\u09b0\u09c1\u09a8\u0964</div></td></tr>';
    return;
  }
  var sel = document.getElementById('s1mon');
  var cm = sel ? sel.value : new Date().toISOString().slice(0, 7);
  var pd = new Date(cm + '-01'); pd.setMonth(pd.getMonth() - 1);
  var pm = pd.getFullYear() + '-' + String(pd.getMonth() + 1).padStart(2, '0');
  var tgts = lsGet('ctg_hub_s1_tgt', {});
  var q = ((document.getElementById('s1q') || {}).value || '').toLowerCase();
  var data = custs.map(function (c) {
    var invs = c.invoices || []; if (!invs.length) return null;
    var curQ = 0, prevQ = 0, allQ = 0;
    invs.forEach(function (inv) {
      var mk = (inv.date || '').slice(0, 7);
      var qty = (inv.items || []).reduce(function (s, x) { return s + (x.qty || 0); }, 0);
      allQ += qty; if (mk === cm) curQ += qty; if (mk === pm) prevQ += qty;
    });
    var avg = invs.length > 0 ? Math.round(allQ / invs.length) : 0;
    var growth = prevQ > 0 ? Math.round((curQ - prevQ) / prevQ * 100) : (curQ > 0 ? 100 : 0);
    var tgt = parseInt(tgts[String(c.id)] || '0') || 0;
    var gap = tgt > 0 ? tgt - curQ : 0; var prog = tgt > 0 ? Math.min(100, Math.round(curQ / tgt * 100)) : 0;
    return { c: c, avg: avg, curQ: curQ, prevQ: prevQ, growth: growth, tgt: tgt, gap: gap, prog: prog };
  }).filter(function (r) { return r && (!q || r.c.name.toLowerCase().indexOf(q) > -1); })
    .sort(function (a, b) { return b.curQ - a.curQ; });
  var totC = data.reduce(function (s, r) { return s + r.curQ; }, 0);
  var totT = data.reduce(function (s, r) { return s + r.tgt; }, 0);
  var totP = data.reduce(function (s, r) { return s + r.prevQ; }, 0);
  var ach = totT > 0 ? Math.round(totC / totT * 100) : 0;
  document.getElementById('s1kr').innerHTML = [
    kpi('\u098f\u0987 \u09ae\u09be\u09b8 pcs', totC + '', 'all customers', '#22d3ee'),
    kpi('Target Achievement', totT > 0 ? ach + '%' : '\u2014', totC + '/' + totT + ' pcs', ach >= 80 ? '#34d399' : ach >= 50 ? '#f59e0b' : '#e8211a'),
    kpi('vs Last Month', totP > 0 ? (totC >= totP ? '+' : '') + Math.round((totC - totP) / totP * 100) + '%' : '\u2014', 'growth', totC >= totP ? '#34d399' : '#e8211a'),
    kpi('Active Customers', data.length + '', 'with invoices', '#fbbf24')
  ].join('');
  var tb = document.getElementById('s1tb'); if (!tb) return;
  if (!data.length) { tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">No invoice data found.</div></td></tr>'; return; }
  tb.innerHTML = data.map(function (r, i) {
    var gc = r.growth >= 10 ? '#34d399' : r.growth <= -10 ? '#e8211a' : '#f59e0b';
    var pc2 = r.prog >= 80 ? '#34d399' : r.prog >= 50 ? '#f59e0b' : '#e8211a';
    return '<tr><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td>'
      + '<td style="font-family:var(--fu,sans-serif);font-size:12px;font-weight:700;color:var(--text);white-space:nowrap">' + r.c.name + '</td>'
      + '<td>' + sbg(String(r.c.stage || '1')) + '</td>'
      + '<td style="font-family:var(--fm,monospace)">' + r.avg + '</td>'
      + '<td style="font-family:var(--fm,monospace)">' + r.prevQ + '</td>'
      + '<td style="font-family:var(--fm,monospace);font-weight:700;color:#fbbf24">' + r.curQ + '</td>'
      + '<td style="font-family:var(--fm,monospace);font-weight:700;color:' + gc + '">' + (r.growth > 0 ? '+' : '') + r.growth + '%</td>'
      + '<td onclick="event.stopPropagation()"><input type="number" min="0" value="' + (r.tgt || '') + '" placeholder="set" class="shi" style="width:65px;text-align:right" onchange="s1st(\'' + r.c.id + '\',this.value)" onblur="s1st(\'' + r.c.id + '\',this.value)" onkeydown="if(event.key===\'Enter\')this.blur()"></td>'
      + '<td style="font-family:var(--fm,monospace);color:' + (r.gap > 0 ? '#e8211a' : '#34d399') + '">' + (r.tgt > 0 ? r.gap : '\u2014') + '</td>'
      + '<td style="min-width:100px"><div style="display:flex;align-items:center;gap:5px"><div style="flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="width:' + r.prog + '%;height:100%;background:' + pc2 + ';border-radius:3px"></div></div><span style="font-family:var(--fm,monospace);font-size:10px;font-weight:700;color:' + pc2 + '">' + (r.tgt > 0 ? r.prog + '%' : '\u2014') + '</span></div></td>'
      + '<td>' + badge(r.curQ >= r.tgt && r.tgt > 0 ? '\u2705 On Target' : r.growth >= 10 ? '\uD83D\uDFE2 Growing' : r.growth <= -10 ? '\uD83D\uDD34 Drop' : '\u26A0\uFE0F Stable', r.curQ >= r.tgt && r.tgt > 0 ? '#34d399' : r.growth >= 10 ? '#34d399' : r.growth <= -10 ? '#e8211a' : '#f59e0b') + '</td></tr>';
  }).join('');
  var below = data.filter(function (r) { return r.tgt > 0 && r.curQ < r.tgt * 0.7; });
  var ins = document.getElementById('s1ins');
  if (ins) ins.innerHTML = below.length ? '\u26A0\uFE0F ' + below.map(function (r) { return '<b>' + r.c.name + '</b> (' + Math.round(r.curQ / r.tgt * 100) + '%, gap: ' + r.gap + ' pcs)'; }).join(', ') + ' \u2014 \u098f\u0996\u09a8\u0987 ping \u0995\u09b0\u09cb\u0964' : '\u2705 \u09b8\u09ac customer target-\u098f \u0986\u099b\u09c7\u0964';
  shRefresh();
  addS1Totals();
};
window.s1st = function (id, v) { var t = lsGet('ctg_hub_s1_tgt', {}); var n = parseInt(v); if (!isNaN(n) && n > 0) t[String(id)] = n; else delete t[String(id)]; lsSet('ctg_hub_s1_tgt', t); setTimeout(window.s1R, 60); };

// ══════════════════════════════════════════════════════════════════════════
// S2 — Bundle First Policy
// ══════════════════════════════════════════════════════════════════════════
window.s2R = function () {
  var custs = getCustomers();
  if (!custs.length) {
    var tb = document.getElementById('s2tb');
    if (tb) tb.innerHTML = '<tr><td colspan="12"><div class="sh-empty">CRM invoice data নেই।</div></td></tr>';
    return;
  }
  var data = custs.map(function (c) {
    var invs = c.invoices || []; if (!invs.length) return null;
    var si = [], mi = [];
    invs.forEach(function (inv) {
      var items = inv.items || [];
      var models = items.map(function (x) { return x.model || x.description || ''; }).filter(Boolean);
      var uMods = models.filter(function (v, i, a) { return a.indexOf(v) === i; });
      var sell = items.reduce(function (s, x) { return s + (x.qty || 0) * (x.price || 0); }, 0);
      var cost = items.reduce(function (s, x) { return s + (x.qty || 0) * (x.purchasePrice || 0); }, 0);
      var roi = cost > 0 ? (sell - cost) / cost * 100 : 0;
      var qty = items.reduce(function (s, x) { return s + (x.qty || 0); }, 0);
      if (uMods.length > 1) mi.push({ roi: roi, qty: qty }); else si.push({ roi: roi, qty: qty });
    });
    var sROI = si.length ? si.reduce(function (s, x) { return s + x.roi; }, 0) / si.length : 0;
    var mROI = mi.length ? mi.reduce(function (s, x) { return s + x.roi; }, 0) / mi.length : 0;
    var allQ = invs.reduce(function (s, inv2) { return s + (inv2.items || []).reduce(function (ss, x) { return ss + (x.qty || 0); }, 0); }, 0);
    var br = invs.length > 0 ? mi.length / invs.length * 100 : 0;
    var score = Math.round(Math.max(0, Math.min(100, br * 0.4 + (mROI - sROI) * 8 + (allQ / invs.length) * 3)));
    return { c: c, inv: invs.length, si: si.length, mi: mi.length, sROI: sROI, mROI: mROI, lift: mROI - sROI, br: br, avgPcs: invs.length > 0 ? allQ / invs.length : 0, score: score };
  }).filter(Boolean).sort(function (a, b) { return b.br - a.br; });
  var totI = data.reduce(function (s, d) { return s + d.inv; }, 0);
  var totM = data.reduce(function (s, d) { return s + d.mi; }, 0);
  var bra = totI > 0 ? totM / totI * 100 : 0;
  var asr = data.filter(function (d) { return d.si > 0; }); var amr = data.filter(function (d) { return d.mi > 0; });
  var avgS = asr.length ? asr.reduce(function (s, d) { return s + d.sROI; }, 0) / asr.length : 0;
  var avgM = amr.length ? amr.reduce(function (s, d) { return s + d.mROI; }, 0) / amr.length : 0;
  document.getElementById('s2kr').innerHTML = [
    kpi('Total Invoices', totI + '', 'all', '#8899b4'),
    kpi('Bundle Ratio', pct(bra), 'target: 85%', bra >= 60 ? '#34d399' : '#f59e0b'),
    kpi('Single Avg ROI', pct(avgS), 'baseline', '#f59e0b'),
    kpi('Bundle Avg ROI', pct(avgM), 'premium', '#34d399')
  ].join('');
  var tb = document.getElementById('s2tb'); if (!tb) return;
  tb.innerHTML = data.map(function (d, i) {
    var scC = d.score >= 70 ? '#34d399' : d.score >= 40 ? '#f59e0b' : '#e8211a';
    return '<tr><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td>'
      + '<td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">' + d.c.name + '</td>'
      + '<td>' + sbg(String(d.c.stage || '1')) + '</td>'
      + '<td style="font-family:var(--fm,monospace)">' + d.inv + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:#f59e0b">' + d.si + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:#22d3ee">' + d.mi + '</td>'
      + '<td><div style="display:flex;align-items:center;gap:5px"><div style="width:40px;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="width:' + d.br.toFixed(0) + '%;height:100%;background:#22d3ee"></div></div><span style="font-family:var(--fm,monospace);font-size:10px;color:#22d3ee">' + d.br.toFixed(0) + '%</span></div></td>'
      + '<td style="font-family:var(--fm,monospace);color:#f59e0b">' + pct(d.sROI) + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:#22d3ee;font-weight:700">' + pct(d.mROI) + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:' + (d.lift > 3 ? '#34d399' : '#f59e0b') + ';font-weight:700">' + (d.lift > 0 ? '+' : '') + pct(d.lift) + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:#fbbf24">' + d.avgPcs.toFixed(1) + '</td>'
      + '<td style="font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:' + scC + '">' + d.score + '</td></tr>';
  }).join('');
  shRefresh();
};

// ══════════════════════════════════════════════════════════════════════════
// S3 — Dubai Direct Dhaka
// ══════════════════════════════════════════════════════════════════════════
window.s3form = function () { document.getElementById('s3fm').classList.add('open'); };
window.s3sv = function () {
  var n = document.getElementById('s3fn').value.trim(); if (!n) { shNotify('Shop name দাও'); return; }
  var d = lsGet('ctg_hub_s3_dubai', []);
  d.push({ id: Date.now(), name: n, req: document.getElementById('s3fr').value, pcs: parseInt(document.getElementById('s3fp').value) || 0, adv: parseInt(document.getElementById('s3fa').value) || 0, wa: document.getElementById('s3fw').value, note: document.getElementById('s3fnt').value, date: today(), adv50: 0, dubOrd: 0, qc: 0, ship: 0, bal: 0, del: 0, status: 'New' });
  lsSet('ctg_hub_s3_dubai', d);
  ['s3fn', 's3fr', 's3fp', 's3fa', 's3fw', 's3fnt'].forEach(function (x) { document.getElementById(x).value = ''; });
  document.getElementById('s3fm').classList.remove('open'); window.s3R(); shNotify('\u2705 Deal added!');
};
window.s3tog = function (idx, key) {
  var d = lsGet('ctg_hub_s3_dubai', []); if (!d[idx]) return;
  d[idx][key] = d[idx][key] ? 0 : 1;
  var sc = d[idx].adv50 + d[idx].dubOrd + d[idx].qc + d[idx].ship + d[idx].bal + d[idx].del;
  d[idx].status = sc === 6 ? 'Completed' : sc >= 4 ? 'In Progress' : sc >= 1 ? 'Started' : 'New';
  lsSet('ctg_hub_s3_dubai', d); window.s3R();
};
window.s3rm = function (idx) { var d = lsGet('ctg_hub_s3_dubai', []); d.splice(idx, 1); lsSet('ctg_hub_s3_dubai', d); window.s3R(); };
window.s3R = function () {
  var d = lsGet('ctg_hub_s3_dubai', []);
  var done = d.filter(function (x) { return x.status === 'Completed'; }).length;
  var ip = d.filter(function (x) { return x.status === 'In Progress' || x.status === 'Started'; }).length;
  document.getElementById('s3kr').innerHTML = [kpi('Total Deals', d.length + '', 'tracked', '#C98A1A'), kpi('Completed', done + '', 'full pipeline', '#34d399'), kpi('In Progress', ip + '', 'active', '#fbbf24'), kpi('New', (d.length - done - ip) + '', 'pending', '#8899b4')].join('');
  var tb = document.getElementById('s3tb'); if (!tb) return;
  if (!d.length) { tb.innerHTML = '<tr><td colspan="12"><div class="sh-empty">No deals. "+ New Deal" দিয়ে add করো।</div></td></tr>'; return; }
  var COLS = { Completed: '#34d399', 'In Progress': '#fbbf24', Started: '#22d3ee', New: '#8899b4' };
  var KEYS = [['adv50', '50% Adv'], ['dubOrd', 'Dubai Ord'], ['qc', 'QC'], ['ship', 'Ship'], ['bal', 'Bal Pay'], ['del', 'Deliver']];
  tb.innerHTML = d.map(function (x, i) {
    var sc2 = KEYS.reduce(function (s, kv) { return s + (x[kv[0]] ? 1 : 0); }, 0);
    var stC = COLS[x.status] || '#8899b4';
    return '<tr><td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">' + x.name + '</td><td style="font-size:10px;color:var(--text3)">' + (x.req || '\u2014') + '</td><td style="font-family:var(--fm,monospace);color:#22d3ee">' + (x.pcs || '\u2014') + '</td><td style="font-family:var(--fm,monospace);color:#34d399">' + (x.adv ? fmtM(x.adv) : '\u2014') + '</td>'
      + KEYS.map(function (kv) { return '<td><span onclick="s3tog(' + i + ',\'' + kv[0] + '\')" style="cursor:pointer;font-size:14px">' + (x[kv[0]] ? '\u2705' : '\u2B1C') + '</span></td>'; }).join('')
      + '<td>' + badge(x.status, stC) + '<span style="font-family:var(--fm,monospace);font-size:9px;color:var(--text3);margin-left:5px">' + sc2 + '/6</span></td>'
      + '<td><button class="shbtn shbr" onclick="s3rm(' + i + ')" style="padding:2px 7px;font-size:8px">\u2715</button></td></tr>';
  }).join('');
  shRefresh();
};

// ══════════════════════════════════════════════════════════════════════════
// S4 — SKU Gap Fill
// ══════════════════════════════════════════════════════════════════════════
function s4ctgMods(c) { var m = new Set(); (c.invoices || []).forEach(function (inv) { (inv.items || []).forEach(function (x) { var n = x.model || x.description || ''; if (n) m.add(n); }); }); return Array.from(m); }
function s4dec(g) {
  if (!g.pilotQty) { var sc = 60 + (g.channel ? 20 : 0) + (g.expRoi >= 15 ? 20 : 0); return sc >= 90 ? 'Immediate Pilot' : sc >= 70 ? 'Pilot Small' : 'Monitor'; }
  var sp = g.pilotQty > 0 ? (g.soldQty || 0) / g.pilotQty * 100 : 0;
  var roi = g.costPc > 0 ? ((g.sellPc || 0) - g.costPc) / g.costPc * 100 : 0;
  var days = g.pilotDate ? Math.round((+new Date() - +new Date(g.pilotDate)) / 86400000) : 0;
  if (sp >= 70 && roi >= 15) return 'Scale \uD83D\uDE80'; if (sp >= 30) return 'Monitor \u26A0\uFE0F'; if (days >= 14) return 'Stop \uD83D\uDED1'; return 'Pilot Running...';
}
function s4popCust(selId) { var sel = document.getElementById(selId); if (!sel) return; sel.innerHTML = '<option value="">\u2014 Customer \u2014</option>'; getCustomers().forEach(function (c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); }); }
window.s4form = function () { s4popCust('s4fc'); document.getElementById('s4fm').classList.add('open'); };
window.s4sv = function () {
  var cid = parseInt(document.getElementById('s4fc').value); var c = getCustomers().find(function (x) { return x.id === cid; });
  var models = (document.getElementById('s4fm2').value || '').split('\n').map(function (m) { return m.trim(); }).filter(Boolean);
  if (!cid || !models.length) { shNotify('Customer + Model দাও'); return; }
  var gaps = lsGet('ctg_hub_s4_gaps', []); var added = 0;
  models.forEach(function (model) { gaps.push({ id: 'G' + Date.now() + added, custId: cid, custName: c ? c.name : '', model: model, channel: document.getElementById('s4fch').value, note: document.getElementById('s4fn').value, foundDate: today(), expRoi: 15, pilotQty: 0, soldQty: 0, costPc: 0, sellPc: 0, pilotDate: '', status: 'Found' }); added++; });
  lsSet('ctg_hub_s4_gaps', gaps); document.getElementById('s4fm').classList.remove('open'); document.getElementById('s4fm2').value = ''; window.s4R(); shNotify('\u2705 ' + added + ' gap(s) added!');
};
window.s4opilot = function (id) { document.getElementById('s4pid').value = id; document.getElementById('s4pf').classList.add('open'); };
window.s4psv = function () {
  var id = document.getElementById('s4pid').value; var gaps = lsGet('ctg_hub_s4_gaps', []); var g = gaps.find(function (x) { return x.id === id; }); if (!g) return;
  g.pilotQty = parseInt(document.getElementById('s4pq').value) || 0; g.soldQty = parseInt(document.getElementById('s4ps').value) || 0; g.costPc = parseInt(document.getElementById('s4pc').value) || 0; g.sellPc = parseInt(document.getElementById('s4psp').value) || 0; g.pilotDate = g.pilotDate || today();
  var sp = g.pilotQty > 0 ? g.soldQty / g.pilotQty * 100 : 0; var roi = g.costPc > 0 ? (g.sellPc - g.costPc) / g.costPc * 100 : 0;
  g.status = sp >= 70 && roi >= 15 ? 'Scale' : sp >= 30 ? 'Monitor' : g.pilotQty > 0 ? 'Pilot Running' : 'Found';
  lsSet('ctg_hub_s4_gaps', gaps); document.getElementById('s4pf').classList.remove('open'); window.s4R(); shNotify('\u2705 Pilot updated!');
};
window.s4rm = function (id) { lsSet('ctg_hub_s4_gaps', lsGet('ctg_hub_s4_gaps', []).filter(function (g) { return g.id !== id; })); window.s4R(); };
window.s4R = function () {
  s4popCust('s4fc'); var custs = getCustomers(); var gaps = lsGet('ctg_hub_s4_gaps', []);
  document.getElementById('s4kr').innerHTML = [kpi('Gaps Found', gaps.length + '', 'total', '#22d3ee'), kpi('Pilot Running', gaps.filter(function (g) { return g.status === 'Pilot Running'; }).length + '', 'testing', '#fbbf24'), kpi('Scale Ready', gaps.filter(function (g) { return g.status === 'Scale'; }).length + '', 'buy more', '#34d399'), kpi('Customers', custs.length + '', 'tracked', '#8899b4')].join('');
  var cb = document.getElementById('s4cust'); if (cb) cb.innerHTML = custs.map(function (c, i) { var ms = s4ctgMods(c); var cg = gaps.filter(function (g) { return g.custId === c.id; }); return '<tr><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td><td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">' + c.name + '</td><td>' + sbg(String(c.stage || '1')) + '</td><td>' + (ms.length ? ms.map(function (m) { return '<span style="font-family:var(--fm,monospace);font-size:9px;color:#22d3ee;background:rgba(34,211,238,.07);border:1px solid rgba(34,211,238,.2);padding:1px 6px;border-radius:3px;margin:1px;display:inline-block">' + m + '</span>'; }).join('') : '<span style="color:var(--text4);font-size:10px">No invoices</span>') + '</td><td style="font-family:var(--fm,monospace);font-size:13px;font-weight:800;color:' + (cg.length > 0 ? '#fb923c' : 'var(--text4)') + '">' + cg.length + '</td></tr>'; }).join('');
  var SC = { Found: '#22d3ee', 'Pilot Running': '#fbbf24', Scale: '#2dd4bf', Monitor: '#f59e0b', Failed: '#e8211a', Stop: '#8899b4' };
  var gb = document.getElementById('s4gap'); if (!gb) return;
  gb.innerHTML = !gaps.length ? '<tr><td colspan="9"><div class="sh-empty">No gaps. "+ Add Gap" দিয়ে add করো।</div></td></tr>' : gaps.map(function (g) {
    var roi2 = g.costPc > 0 ? ((g.sellPc || 0) - g.costPc) / g.costPc * 100 : 0; var stC = SC[g.status] || '#8899b4'; var dec = s4dec(g);
    return '<tr><td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:600;color:var(--text)">' + g.custName + '</td><td style="font-family:var(--fm,monospace);font-size:10px;color:#2dd4bf">' + g.model + '</td><td style="font-size:10px;color:var(--text3)">' + g.channel + '</td><td style="font-family:var(--fm,monospace)">' + (g.pilotQty || '\u2014') + '</td><td style="font-family:var(--fm,monospace);color:#34d399">' + (g.pilotQty > 0 ? (g.soldQty || 0) + '/' + g.pilotQty : '\u2014') + '</td><td style="font-family:var(--fm,monospace);color:' + (roi2 >= 15 ? '#34d399' : roi2 > 0 ? '#f59e0b' : 'var(--text3)') + ';font-weight:700">' + (roi2 > 0 ? pct(roi2) : '\u2014') + '</td><td>' + badge(g.status, stC) + '</td><td style="font-family:var(--fm,monospace);font-size:10px;color:' + (dec.indexOf('Scale') > -1 ? '#34d399' : dec.indexOf('Stop') > -1 ? '#e8211a' : '#f59e0b') + '">' + dec + '</td><td onclick="event.stopPropagation()"><div style="display:flex;gap:3px"><button class="shbtn" onclick="s4opilot(\'' + g.id + '\')" style="font-size:8px;padding:2px 7px">\uD83D\uDE80</button><button class="shbtn shbr" onclick="s4rm(\'' + g.id + '\')" style="font-size:8px;padding:2px 7px">\u2715</button></div></td></tr>';
  }).join('');
  shRefresh();
};

// ══════════════════════════════════════════════════════════════════════════
// S5 — Royal Customer Blueprint
// ══════════════════════════════════════════════════════════════════════════
function s5u(id) { var d = lsGet('ctg_hub_s5_royal', {}); return d[String(id)] || { cour: 0, cred: 0, amt: 0 }; }
window.s5tog = function (id, key) { var d = lsGet('ctg_hub_s5_royal', {}); if (!d[String(id)]) d[String(id)] = { cour: 0, cred: 0, amt: 0 }; d[String(id)][key] = d[String(id)][key] ? 0 : 1; lsSet('ctg_hub_s5_royal', d); window.s5R(); };
window.s5amt = function (id, v) { var d = lsGet('ctg_hub_s5_royal', {}); if (!d[String(id)]) d[String(id)] = { cour: 0, cred: 0, amt: 0 }; d[String(id)].amt = parseInt(String(v).replace(/[^\d]/g, '')) || 0; lsSet('ctg_hub_s5_royal', d); };
function s5prog(c) { var u = s5u(c.id); return Math.round(((u.cour ? 1 : 0) + (u.cred ? 1 : 0)) / 2 * 100); }
window.s5R = function () {
  var custs = getCustomers();
  var royal = custs.filter(function (c) { return s5prog(c) >= 100; }).length;
  var cour = custs.filter(function (c) { var p = s5prog(c); return p >= 50 && p < 100; }).length;
  var totCr = custs.reduce(function (s, c) { var u = s5u(c.id); return s + (u.cred ? u.amt || 0 : 0); }, 0);
  document.getElementById('s5kr').innerHTML = [kpi('\uD83D\uDC51 Royal 100%', royal + '', 'both unlocked', '#fbbf24'), kpi('\uD83D\uDE9A Courier 50%', cour + '', 'courier active', '#22d3ee'), kpi('\u2B1C Default 0%', (custs.length - royal - cour) + '', 'advance only', '#8899b4'), kpi('\uD83D\uDCB3 Credit Exposure', fmtM(totCr), 'active credit', '#c084fc')].join('');
  var tb = document.getElementById('s5tb'); if (!tb) return;
  if (!custs.length) { tb.innerHTML = '<tr><td colspan="10"><div class="sh-empty">CRM customer নেই।</div></td></tr>'; return; }
  tb.innerHTML = custs.map(function (c, i) {
    var u = s5u(c.id); var p = s5prog(c); var pC = p >= 100 ? '#fbbf24' : p >= 50 ? '#22d3ee' : '#8899b4';
    var ti = (c.invoices || []).length;
    var tp = (c.invoices || []).reduce(function (s, inv) { return s + (inv.items || []).reduce(function (ss, x) { return ss + (x.qty || 0); }, 0); }, 0);
    return '<tr><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td>'
      + '<td style="font-family:var(--fu,sans-serif);font-size:12px;font-weight:700;color:var(--text)">' + c.name + '</td>'
      + '<td>' + sbg(String(c.stage || '1')) + '</td>'
      + '<td style="font-family:var(--fm,monospace)">' + ti + '</td>'
      + '<td style="font-family:var(--fm,monospace);color:#22d3ee">' + tp + '</td>'
      + '<td><span style="font-family:var(--fm,monospace);font-size:9px;color:var(--text4);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:2px 7px">\uD83D\uDCB0 Advance</span></td>'
      + '<td onclick="event.stopPropagation()"><span class="sh-tog ' + (u.cour ? 'sh-tog-on' : 'sh-tog-off') + '" onclick="s5tog(' + c.id + ',\'cour\')">' + (u.cour ? '\u2705 Unlocked' : '\uD83D\uDD12 Unlock') + '</span></td>'
      + '<td onclick="event.stopPropagation()"><span class="sh-tog ' + (u.cred ? 'sh-tog-on' : 'sh-tog-off') + '" onclick="s5tog(' + c.id + ',\'cred\')" style="' + (u.cred ? 'background:rgba(192,132,252,.1);border-color:rgba(192,132,252,.4);color:#c084fc' : '') + '">' + (u.cred ? '\u2705 Active' : '\uD83D\uDD12 Unlock') + '</span></td>'
      + '<td onclick="event.stopPropagation()">' + (u.cred ? '<div style="display:flex;align-items:center;gap:4px"><span style="font-family:var(--fm,monospace);font-size:10px;color:#c084fc">\u09f3</span><input type="text" value="' + (u.amt ? Number(u.amt).toLocaleString('en-BD') : '') + '" placeholder="0" class="shi" style="width:80px;color:#c084fc" onblur="s5amt(' + c.id + ',this.value.replace(/,/g,\'\'))" onkeydown="if(event.key===\'Enter\')this.blur()"></div>' : '<span style="color:var(--text4);font-size:10px">\u2014</span>') + '</td>'
      + '<td style="min-width:110px"><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="width:' + p + '%;height:100%;background:' + pC + ';border-radius:3px"></div></div><span style="font-family:var(--fm,monospace);font-size:11px;font-weight:800;color:' + pC + '">' + p + '%</span></div></td></tr>';
  }).join('');
  shRefresh();
};

// ══════════════════════════════════════════════════════════════════════════
// S6 — Video Trust System
// ══════════════════════════════════════════════════════════════════════════
function s6popCust() { var sel = document.getElementById('s6fc'); if (!sel) return; sel.innerHTML = '<option value="">\u2014 Customer/Lead \u2014</option>'; getCustomers().forEach(function (c) { var o = document.createElement('option'); o.value = c.name; o.textContent = c.name; sel.appendChild(o); }); var o2 = document.createElement('option'); o2.value = 'Cold Lead'; o2.textContent = '\uD83D\uDCE1 Cold Lead'; sel.appendChild(o2); }
window.s6form = function () { s6popCust(); var df = document.getElementById('s6fd'); if (df) df.value = today(); document.getElementById('s6fm').classList.add('open'); };
window.s6sv = function () {
  var logs = lsGet('ctg_hub_s6_video', []);
  logs.push({ id: Date.now(), type: document.getElementById('s6ft').value, cust: document.getElementById('s6fc').value || 'Unknown', date: document.getElementById('s6fd').value || today(), model: document.getElementById('s6fm2').value, seen: parseInt(document.getElementById('s6fs').value) || 0, reply: parseInt(document.getElementById('s6fr2').value) || 0, trial: parseInt(document.getElementById('s6ftr').value) || 0, note: document.getElementById('s6fn').value });
  lsSet('ctg_hub_s6_video', logs); document.getElementById('s6fm').classList.remove('open'); document.getElementById('s6fm2').value = ''; document.getElementById('s6fn').value = ''; window.s6R(); shNotify('\u2705 Video log added!');
};
window.s6rm = function (id) { lsSet('ctg_hub_s6_video', lsGet('ctg_hub_s6_video', []).filter(function (v) { return v.id !== id; })); window.s6R(); };
window.s6R = function () {
  s6popCust(); var logs = lsGet('ctg_hub_s6_video', []);
  var sent = logs.length; var seen = logs.filter(function (v) { return v.seen; }).length; var reply = logs.filter(function (v) { return v.reply; }).length; var trial = logs.filter(function (v) { return v.trial; }).length;
  document.getElementById('s6kr').innerHTML = [kpi('Videos Sent', sent + '', 'total', '#4da3ff'), kpi('Seen', seen + '', pct(sent > 0 ? seen / sent * 100 : 0), '#22d3ee'), kpi('Reply', reply + '', pct(sent > 0 ? reply / sent * 100 : 0), '#f59e0b'), kpi('Trial Orders', trial + '', 'conv: ' + (sent > 0 ? Math.round(trial / sent * 100) : 0) + '%', '#34d399')].join('');
  var tb = document.getElementById('s6tb'); if (!tb) return;
  if (!logs.length) { tb.innerHTML = '<tr><td colspan="11"><div class="sh-empty">No logs. "+ Video Log" দিয়ে শুরু করো।</div></td></tr>'; return; }
  var STC = { '\uD83D\uDFE2 Converted': '#34d399', '\u26A0\uFE0F Replied': '#f59e0b', '\uD83D\uDCE7 Seen': '#22d3ee', '\uD83D\uDCE4 Sent': '#8899b4' };
  tb.innerHTML = logs.slice().reverse().map(function (v) {
    var stL = v.trial ? '\uD83D\uDFE2 Converted' : v.reply ? '\u26A0\uFE0F Replied' : v.seen ? '\uD83D\uDCE7 Seen' : '\uD83D\uDCE4 Sent'; var stC = STC[stL] || '#8899b4';
    return '<tr><td style="font-family:var(--fm,monospace);font-size:9px;color:var(--text4)">' + String(v.id).slice(-5) + '</td><td>' + badge(v.type, '#4da3ff') + '</td><td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:600;color:var(--text)">' + v.cust + '</td><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">' + v.date + '</td><td style="font-size:14px">' + (v.seen ? '\u2705' : '\u2B1C') + '</td><td style="font-size:14px">' + (v.reply ? '\u2705' : '\u2B1C') + '</td><td style="font-family:var(--fm,monospace);font-size:10px;color:#22d3ee">' + (v.model || '\u2014') + '</td><td style="font-size:14px">' + (v.trial ? '\u2705' : '\u2B1C') + '</td><td>' + badge(stL, stC) + '</td><td style="font-size:10px;color:var(--text3)">' + (v.note || '\u2014') + '</td><td><button class="shbtn shbr" onclick="s6rm(' + v.id + ')" style="font-size:8px;padding:2px 7px">\u2715</button></td></tr>';
  }).join('');
  shRefresh();
};

// ══════════════════════════════════════════════════════════════════════════
// S7 — Customer Psychology Profile
// ══════════════════════════════════════════════════════════════════════════
function s7bs(p) { var s = p.scores || {}; var pos = (s.trust || 7) + (s.growth || 6) + (s.pay || 8); var neg = (s.ret || 3) + (s.cred || 2); return Math.round(Math.max(0, Math.min(100, ((pos * 2) - (neg * 1.5)) / (3 * 2 + 2 * 1.5) * 100))); }
window.s7edit = function (cid) {
  var c = getCustomers().find(function (x) { return String(x.id) === String(cid); }); if (!c) return;
  var profs = lsGet('ctg_hub_s7_psy', []); var p = profs.find(function (x) { return String(x.cid) === String(cid); }) || {};
  document.getElementById('s7eid').value = p.id || ''; document.getElementById('s7ecid').value = cid;
  document.getElementById('s7etit').textContent = '\uD83E\uDDE0 ' + c.name;
  var fm = { s7ep: p.pers, s7eo: p.ord, s7epay: p.pay, s7et: p.trust, s7ebt: p.buy, s7eft: p.fear, s7eg: p.grow };
  Object.keys(fm).forEach(function (id) { var el = document.getElementById(id); if (el && fm[id]) el.value = fm[id]; });
  document.getElementById('s7en').value = p.note || '';
  document.getElementById('s7ef').classList.add('open');
  document.getElementById('s7ef').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
window.s7sv = function () {
  var cid = document.getElementById('s7ecid').value; var c = getCustomers().find(function (x) { return String(x.id) === String(cid); }); if (!c) return;
  var eid = document.getElementById('s7eid').value;
  var obj = { id: eid || String(Date.now()), cid: cid, name: c.name, stage: String(c.stage || '1'), pers: document.getElementById('s7ep').value, ord: document.getElementById('s7eo').value, pay: document.getElementById('s7epay').value, trust: document.getElementById('s7et').value, buy: document.getElementById('s7ebt').value, fear: document.getElementById('s7eft').value, grow: document.getElementById('s7eg').value, note: document.getElementById('s7en').value, scores: { trust: 7, growth: 6, pay: 8, ret: 3, cred: 2 }, updated: today() };
  var profs = lsGet('ctg_hub_s7_psy', []);
  if (eid) profs = profs.map(function (p) { return p.id === eid ? obj : p; }); else profs.push(obj);
  lsSet('ctg_hub_s7_psy', profs); document.getElementById('s7ef').classList.remove('open'); window.s7R(); shNotify('\uD83E\uDDE0 Profile saved!');
};
window.s7R = function () {
  var custs = getCustomers(); var profs = lsGet('ctg_hub_s7_psy', []);
  document.getElementById('s7kr').innerHTML = [kpi('Profiled', profs.length + '', custs.length + ' customers', '#c084fc'), kpi('Not Profiled', (custs.length - profs.length) + '', 'click to add', '#f59e0b'), kpi('Aggressive Growth', profs.filter(function (p) { return p.grow === 'Aggressive Growth'; }).length + '', '', '#34d399'), kpi('\uD83E\uDDE0 Avg Score', profs.length > 0 ? Math.round(profs.reduce(function (s, p) { return s + s7bs(p); }, 0) / profs.length) + '' : '\u2014', 'brain score', '#c084fc')].join('');
  var tb = document.getElementById('s7tb'); if (!tb) return;
  tb.innerHTML = custs.map(function (c, i) {
    var p = profs.find(function (x) { return String(x.cid) === String(c.id); }); var bs = p ? s7bs(p) : 0; var bc = bs >= 70 ? '#34d399' : bs >= 45 ? '#f59e0b' : '#e8211a';
    return '<tr onclick="s7edit(\'' + c.id + '\')" style="cursor:pointer"><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td><td style="font-family:var(--fu,sans-serif);font-size:12px;font-weight:700;color:var(--text)">' + c.name + '</td><td>' + sbg(String(c.stage || '1')) + '</td>'
      + (p ? '<td>' + badge(p.pers, '#c084fc') + '</td><td>' + badge(p.ord, '#fbbf24') + '</td><td>' + badge(p.pay, '#34d399') + '</td><td>' + badge(p.trust, '#2dd4bf') + '</td><td>' + badge(p.buy || '\u2014', '#f472b6') + '</td><td>' + badge(p.fear || '\u2014', '#e8211a') + '</td><td><div style="display:flex;align-items:center;gap:5px"><span style="font-family:var(--fm,monospace);font-size:16px;font-weight:800;color:' + bc + '">' + bs + '</span></div></td><td onclick="event.stopPropagation()"><button class="shbtn shbr" onclick="event.stopPropagation();s7rm(\'' + (p.id) + '\')" style="font-size:8px;padding:2px 7px">\u2715</button></td>'
      : '<td colspan="7" style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">Profile নেই — click করুন</td><td>' + badge('+ Add', '#c084fc') + '</td>')
      + '</tr>';
  }).join('');
  shRefresh();
};
window.s7rm = function (id) { lsSet('ctg_hub_s7_psy', lsGet('ctg_hub_s7_psy', []).filter(function (p) { return p.id !== id; })); window.s7R(); };

// ══════════════════════════════════════════════════════════════════════════
// S8 — ROI Model Engine (FULL: 6 sub-tabs + Chart.js)
// ══════════════════════════════════════════════════════════════════════════
var _ch = {};
function loadChart(cb) { if (window.Chart) { if (cb) cb(); return; } var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'; s.onload = function () { if (cb) cb(); }; document.head.appendChild(s); }
function mkCh(id, data, labels, col, type, fmt) {
  if (!window.Chart) return; var ctx = document.getElementById(id); if (!ctx) return;
  if (_ch[id]) { _ch[id].destroy(); }
  _ch[id] = new window.Chart(ctx, { type: type || 'bar', data: { labels: labels, datasets: [{ data: data, backgroundColor: col + 'b3', borderColor: col, borderWidth: 1.5, borderRadius: 3, fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return fmt ? fmt(c.raw) : c.raw; } } } }, scales: { x: { ticks: { color: '#4a5f7a', font: { family: 'IBM Plex Mono', size: 9 } }, grid: { color: 'rgba(255,255,255,.04)' } }, y: { ticks: { color: '#4a5f7a', font: { family: 'IBM Plex Mono', size: 9 } }, grid: { color: 'rgba(255,255,255,.04)' } } } } });
}

function s8getMods() {
  var custs = getCustomers(); var mm = {};
  var n7 = new Date(); n7.setDate(n7.getDate() - 7);
  var n30 = new Date(); n30.setDate(n30.getDate() - 30);
  custs.forEach(function (c) {
    (c.invoices || []).forEach(function (inv) {
      var iD = new Date(inv.date || '');
      (inv.items || []).forEach(function (x) {
        var nm = x.model || x.description || 'Unknown'; if (!mm[nm]) mm[nm] = { model: nm, sold: 0, rev: 0, cost: 0, d7: 0, d30: 0, ret: 0 };
        var m = mm[nm]; var q = x.qty || 0; m.sold += q; m.rev += q * (x.price || 0); m.cost += q * (x.purchasePrice || 0);
        if (inv.date) { if (iD >= n7) m.d7 += q; if (iD >= n30) m.d30 += q; }
      });
      (inv.returns || []).forEach(function (r) { var nm = r.model || ''; if (mm[nm]) mm[nm].ret += (r.qty || 0); });
    });
  });
  getStockBatches().forEach(function (b) {
    var nm = b.model || 'Unknown'; if (!mm[nm]) mm[nm] = { model: nm, sold: 0, rev: 0, cost: 0, d7: 0, d30: 0, ret: 0 };
    var m = mm[nm]; m.recv = (m.recv || 0) + (b.qty || b.receivedQty || 0);
    m.costPc = m.costPc || b.costPc || b.cost || 0; m.sellPc = m.sellPc || b.sellPc || b.sellPrice || 0;
    m.stockAge = b.stockAge || (b.purchaseDate ? Math.round((+new Date() - +new Date(b.purchaseDate)) / 86400000) : 0);
  });
  return Object.values(mm).filter(function (m) { return m.sold > 0 || m.recv > 0; }).map(function (m) {
    m.recv = m.recv || m.sold;
    if (!m.costPc && m.cost > 0 && m.sold > 0) m.costPc = Math.round(m.cost / m.sold);
    if (!m.sellPc && m.rev > 0 && m.sold > 0) m.sellPc = Math.round(m.rev / m.sold);
    m.profitPc = m.sellPc - m.costPc; m.roi = m.costPc > 0 ? m.profitPc / m.costPc * 100 : 0;
    m.totalProfit = m.sold * m.profitPc; m.avail = Math.max(0, (m.recv || 0) - m.sold - m.ret);
    m.retPct = m.sold > 0 ? m.ret / m.sold * 100 : 0;
    var daily = m.d30 / 30; m.sellOut = daily > 0 ? Math.round(m.avail / daily) : (m.avail > 0 ? 999 : 0);
    m.rotSc = m.sellOut <= 7 ? 10 : m.sellOut <= 15 ? 8 : m.sellOut <= 30 ? 6 : m.sellOut <= 45 ? 3 : 0;
    m.roiSc = m.roi >= 25 ? 10 : m.roi >= 20 ? 8.5 : m.roi >= 15 ? 7 : m.roi >= 12 ? 5 : m.roi >= 10 ? 3 : 1;
    m.score = Math.round(m.roiSc * 50 + m.rotSc * 50);
    if (m.roi >= 15 && m.sellOut <= 15) m.cat = 'STAR';
    else if (m.sellOut <= 15 && m.roi < 15) m.cat = 'FAST';
    else if (m.roi >= 20 && m.sellOut > 15) m.cat = 'HIGHROI';
    else if (m.sellOut > 45 && m.roi < 10) m.cat = 'DEAD';
    else m.cat = 'SLOW';
    m.dec = { STAR: 'BUY MORE', FAST: 'REBUY', HIGHROI: 'HOLD', SLOW: 'REDUCE', DEAD: 'STOP' }[m.cat];
    return m;
  }).sort(function (a, b) { return b.score - a.score; });
}
var CAT = { STAR: { lbl: '\u2B50 Star', col: '#a3e635' }, FAST: { lbl: '\u26A1 Fast', col: '#22d3ee' }, HIGHROI: { lbl: '\uD83D\uDCB0 High ROI', col: '#fbbf24' }, SLOW: { lbl: '\uD83D\DFE0 Slow', col: '#f59e0b' }, DEAD: { lbl: '\uD83D\uDD34 Dead', col: '#e8211a' } };
var DC = { 'BUY MORE': '#a3e635', REBUY: '#22d3ee', HOLD: '#fbbf24', REDUCE: '#f59e0b', STOP: '#e8211a' };

window.s8tab = function (n) {
  for (var i = 1; i <= 6; i++) {
    var t = document.getElementById('s8t' + i); var b = document.getElementById('s8n' + i);
    if (t) { t.classList.toggle('on', i === n); }
    if (b) { b.classList.toggle('on', i === n); }
  }
  if (n === 1) s8ov(); if (n === 2) s8tbl(); if (n === 3) s8lb(); if (n === 4) { loadChart(null); s8initTrendSel(); } if (n === 5) s8cap(); if (n === 6) s8ceo();
};

function s8ov() {
  var ms = s8getMods();
  var stars = ms.filter(function (m) { return m.cat === 'STAR'; }); var dead = ms.filter(function (m) { return m.cat === 'DEAD'; }); var fast = ms.filter(function (m) { return m.cat === 'FAST'; }); var slow = ms.filter(function (m) { return m.cat === 'SLOW'; });
  var avgR = ms.length > 0 ? ms.reduce(function (s, m) { return s + m.roi; }, 0) / ms.length : 0;
  var avgS = ms.filter(function (m) { return m.sellOut < 999; }); avgS = avgS.length > 0 ? avgS.reduce(function (s, m) { return s + m.sellOut; }, 0) / avgS.length : 0;
  var capLock = ms.reduce(function (s, m) { return s + m.avail * m.costPc; }, 0);
  var totP = ms.reduce(function (s, m) { return s + m.totalProfit; }, 0);
  var k1 = document.getElementById('s8k1'); var k2 = document.getElementById('s8k2');
  if (k1) k1.innerHTML = [kpi('Total Models', ms.length + '', 'in CRM invoices', '#8899b4'), kpi('\u2B50 Star', stars.length + '', 'ROI\u226515%+Fast', '#a3e635'), kpi('\u26A1 Fast', fast.length + '', 'sell-out \u226415d', '#22d3ee'), kpi('\uD83D\uDFE0 Slow', slow.length + '', '>30d', '#f59e0b'), kpi('\uD83D\uDD34 Dead', dead.length + '', 'stop buying', '#e8211a')].join('');
  if (k2) k2.innerHTML = [kpi('Avg ROI', pct(avgR), 'all models', avgR >= 15 ? '#34d399' : '#f59e0b'), kpi('Avg Sell-Out', Math.round(avgS) + 'd', 'to clear', '#22d3ee'), kpi('Capital Locked', fmtM(capLock), 'in stock', capLock > 500000 ? '#f59e0b' : '#34d399'), kpi('Total Profit', fmtM(totP), 'from sold', '#c084fc'), kpi('Best Model', ms.length > 0 ? ms[0].model.slice(0, 14) : '\u2014', 'score: ' + (ms.length > 0 ? ms[0].score : 0), '#a3e635')].join('');
  var cats = document.getElementById('s8cats');
  if (cats) cats.innerHTML = Object.keys(CAT).map(function (k) { var n2 = ms.filter(function (m) { return m.cat === k; }).length; var c = CAT[k]; return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 9px;background:' + c.col + '1a;border:1px solid ' + c.col + '33;border-radius:6px;margin-bottom:5px"><span style="font-size:9px;font-weight:700;color:' + c.col + '">' + c.lbl + '</span><span style="font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:' + c.col + '">' + n2 + '</span></div>'; }).join('');
  var capg = document.getElementById('s8capg');
  if (capg) { var alcs = [{ lbl: '\u2B50 Star', p: 50, c: '#a3e635' }, { lbl: '\u26A1 Fast', p: 30, c: '#22d3ee' }, { lbl: '\uD83D\uDCB0 High ROI', p: 15, c: '#fbbf24' }, { lbl: '\uD83E\uDDEA Test', p: 5, c: '#c084fc' }]; capg.innerHTML = alcs.map(function (a) { return '<div style="margin-bottom:7px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:9px;font-weight:700;color:' + a.c + '">' + a.lbl + '</span><span style="font-family:var(--fm,monospace);font-size:11px;font-weight:700;color:' + a.c + '">' + a.p + '%</span></div><div style="height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="width:' + a.p + '%;height:100%;background:' + a.c + ';border-radius:2px"></div></div></div>'; }).join(''); }
  var alt = document.getElementById('s8alt'); var alerts = [];
  ms.forEach(function (m) {
    if (m.cat === 'STAR' && m.avail < 5) alerts.push({ col: '#a3e635', txt: '\uD83D\uDD25 <b>' + m.model + '</b> — Star! Only ' + m.avail + ' pcs left. Buy now!' });
    if (m.cat === 'DEAD') alerts.push({ col: '#e8211a', txt: '\uD83D\uDED1 <b>' + m.model + '</b> — Dead. Stop buying. Clear ' + m.avail + ' pcs.' });
    if (m.avail * m.costPc > 200000 && m.sellOut > 30) alerts.push({ col: '#f59e0b', txt: '\u26A0\uFE0F <b>' + m.model + '</b> — ' + fmtM(m.avail * m.costPc) + ' locked. ' + m.sellOut + 'd sell-out.' });
  });
  if (alt) alt.innerHTML = !alerts.length ? '<div style="color:var(--text3);font-size:11px">\u2705 No critical alerts.</div>' : alerts.slice(0, 4).map(function (a) { return '<div style="padding:7px 9px;background:' + a.col + '18;border:1px solid ' + a.col + '33;border-radius:6px;margin-bottom:5px;font-size:11px;color:' + a.col + '">' + a.txt + '</div>'; }).join('');
  var ins = document.getElementById('s8ins');
  if (ins) ins.innerHTML = ms.slice(0, 8).map(function (m) {
    var cat = CAT[m.cat] || { col: '#8899b4', lbl: m.cat }; var dc = DC[m.dec] || '#8899b4';
    return '<div style="background:rgba(23,32,48,.6);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:12px;border-left:3px solid ' + cat.col + '"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px"><div><div style="font-family:var(--fu,sans-serif);font-size:12px;font-weight:700;color:var(--text)">' + m.model + '</div><div style="margin-top:3px">' + badge(cat.lbl, cat.col) + '</div></div><span style="font-family:var(--fm,monospace);font-size:18px;font-weight:800;color:' + cat.col + '">' + m.score + '</span></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:7px">' + [['ROI', pct(m.roi), m.roi >= 15 ? '#a3e635' : '#f59e0b'], ['Sell-Out', m.sellOut >= 999 ? '\u221E' : m.sellOut + 'd', m.sellOut <= 15 ? '#a3e635' : m.sellOut <= 30 ? '#f59e0b' : '#e8211a'], ['Profit/Pc', fmtM(m.profitPc), '#22d3ee']].map(function (s) { return '<div style="background:rgba(255,255,255,.03);border-radius:4px;padding:4px 6px"><div style="font-size:7px;color:var(--text3)">' + s[0] + '</div><div style="font-family:var(--fm,monospace);font-size:11px;font-weight:700;color:' + s[2] + '">' + s[1] + '</div></div>'; }).join('') + '</div><div style="background:' + dc + '18;border:1px solid ' + dc + '33;border-radius:6px;padding:5px 8px;font-size:10px;color:' + dc + '"><b>' + m.dec + '</b></div></div>';
  }).join('');
}

function s8tbl() {
  var cf = (document.getElementById('s8cf') || {}).value || ''; var df = (document.getElementById('s8df') || {}).value || ''; var q = ((document.getElementById('s8mq') || {}).value || '').toLowerCase();
  var ms = s8getMods().filter(function (m) { return (!q || m.model.toLowerCase().indexOf(q) > -1) && (!cf || m.cat === cf) && (!df || m.dec === df); });
  var wrap = document.getElementById('s8tblWrap'); if (!wrap) return;
  if (!ms.length) { wrap.innerHTML = '<div class="sh-empty">No models. Invoice data থাকলে দেখাবে।</div>'; return; }
  wrap.innerHTML = '<table class="sh-tbl"><thead><tr><th>#</th><th>Model</th><th>ROI%</th><th>Profit/Pc</th><th>Cost</th><th>Sell</th><th>Sold</th><th>Avail</th><th>7D</th><th>30D</th><th>Sell-Out</th><th>Rot Sc</th><th>ROI Sc</th><th>Score</th><th>Category</th><th>Decision</th></tr></thead><tbody>'
    + ms.map(function (m, i) {
      var cat = CAT[m.cat] || { lbl: m.cat, col: '#8899b4' }; var scC = m.score >= 70 ? '#a3e635' : m.score >= 45 ? '#22d3ee' : '#f59e0b';
      var sdC = m.sellOut <= 15 ? '#a3e635' : m.sellOut <= 30 ? '#22d3ee' : m.sellOut <= 45 ? '#f59e0b' : '#e8211a';
      return '<tr><td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">' + (i+1) + '</td><td style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text);white-space:nowrap">' + m.model + '</td><td style="font-family:var(--fm,monospace);font-weight:700;color:' + (m.roi >= 15 ? '#a3e635' : m.roi >= 10 ? '#f59e0b' : '#e8211a') + '">' + pct(m.roi) + '</td><td style="font-family:var(--fm,monospace);color:#22d3ee">' + fmtM(m.profitPc) + '</td><td style="font-family:var(--fm,monospace);color:var(--text2)">' + fmtM(m.costPc) + '</td><td style="font-family:var(--fm,monospace);color:#fbbf24">' + fmtM(m.sellPc) + '</td><td style="font-family:var(--fm,monospace);color:#34d399">' + m.sold + '</td><td style="font-family:var(--fm,monospace);color:' + (m.avail <= 3 ? '#e8211a' : 'var(--text2)') + '">' + m.avail + '</td><td style="font-family:var(--fm,monospace);color:#22d3ee">' + m.d7 + '</td><td style="font-family:var(--fm,monospace);font-weight:700;color:#a3e635">' + m.d30 + '</td><td style="font-family:var(--fm,monospace);font-weight:700;color:' + sdC + '">' + (m.sellOut >= 999 ? '\u221E' : m.sellOut + 'd') + '</td><td style="font-family:var(--fm,monospace);font-size:11px;color:#22d3ee">' + m.rotSc.toFixed(1) + '</td><td style="font-family:var(--fm,monospace);font-size:11px;color:#a3e635">' + m.roiSc.toFixed(1) + '</td><td><span style="font-family:var(--fm,monospace);font-size:16px;font-weight:800;color:' + scC + '">' + m.score + '</span></td><td>' + badge(cat.lbl, cat.col) + '</td><td><span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;color:' + (DC[m.dec] || '#8899b4') + ';background:' + (DC[m.dec] || '#8899b4') + '18">' + m.dec + '</span></td></tr>';
    }).join('') + '</tbody></table>';
}
window.s8filt = s8tbl;

function s8lb() {
  var ms = s8getMods();
  function lbR(elId, sorted, valFn, col) { var el = document.getElementById(elId); if (!el) return; el.innerHTML = sorted.slice(0, 6).map(function (m, i) { return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)"><span style="font-family:var(--fm,monospace);font-size:10px;color:var(--text4)">#' + (i+1) + '</span><div style="flex:1;font-family:var(--fu,sans-serif);font-size:11px;font-weight:600;color:var(--text)">' + m.model + '</div><span style="font-family:var(--fm,monospace);font-size:13px;font-weight:700;color:' + col + '">' + valFn(m) + '</span></div>'; }).join(''); }
  lbR('lb1', ms.slice().sort(function (a, b) { return b.score - a.score; }), function (m) { return m.score + '/100'; }, '#a3e635');
  lbR('lb2', ms.filter(function (m) { return m.sellOut < 999; }).sort(function (a, b) { return a.sellOut - b.sellOut; }), function (m) { return m.sellOut + 'd'; }, '#22d3ee');
  lbR('lb3', ms.slice().sort(function (a, b) { return b.roi - a.roi; }), function (m) { return pct(m.roi); }, '#fbbf24');
  lbR('lb4', ms.slice().sort(function (a, b) { return b.totalProfit - a.totalProfit; }), function (m) { return fmtM(m.totalProfit); }, '#34d399');
  lbR('lb5', ms.filter(function (m) { return m.avail * m.costPc > 0; }).sort(function (a, b) { return b.avail * b.costPc - a.avail * a.costPc; }), function (m) { return fmtM(m.avail * m.costPc); }, '#f59e0b');
  lbR('lb6', ms.filter(function (m) { return m.retPct > 0; }).sort(function (a, b) { return b.retPct - a.retPct; }), function (m) { return pct(m.retPct); }, '#e8211a');
}

function s8initTrendSel() { var sel = document.getElementById('s8ts'); if (!sel || sel.options.length > 1) return; s8getMods().forEach(function (m) { var o = document.createElement('option'); o.value = m.model; o.textContent = m.model; sel.appendChild(o); }); }
window.s8trend = function () {
  s8initTrendSel(); var nm = (document.getElementById('s8ts') || {}).value || ''; if (!nm) return;
  var custs = getCustomers(); var byM = {}; var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  custs.forEach(function (c) { (c.invoices || []).forEach(function (inv) { var mk = (inv.date || '').slice(0, 7); if (!mk) return; (inv.items || []).forEach(function (x) { if ((x.model || x.description || '') !== nm) return; if (!byM[mk]) byM[mk] = { qty: 0, profit: 0, roi: 0, cnt: 0 }; var q = x.qty || 0; byM[mk].qty += q; byM[mk].profit += q * ((x.price || 0) - (x.purchasePrice || 0)); byM[mk].roi += x.purchasePrice > 0 ? ((x.price || 0) - x.purchasePrice) / x.purchasePrice * 100 : 0; byM[mk].cnt++; }); }); });
  var months = Object.keys(byM).sort().slice(-12); if (!months.length) { var tk = document.getElementById('s8trKpi'); if (tk) tk.innerHTML = '<div style="color:var(--text3);font-size:11px;grid-column:1/-1">No invoice data for this model yet.</div>'; return; }
  var labels = months.map(function (m) { var p = m.split('-'); return MN[parseInt(p[1]) - 1] + '\'' + p[0].slice(2); });
  var qD = months.map(function (m) { return byM[m].qty; }); var pD = months.map(function (m) { return byM[m].profit; }); var rD = months.map(function (m) { return byM[m].cnt > 0 ? byM[m].roi / byM[m].cnt : 0; });
  var bI = qD.indexOf(Math.max.apply(null, qD)); var wI = qD.indexOf(Math.min.apply(null, qD)); var avgR = rD.reduce(function (s, v) { return s + v; }, 0) / (rD.length || 1);
  var tk = document.getElementById('s8trKpi'); if (tk) tk.innerHTML = [kpi('Best Month', labels[bI] + ' (' + qD[bI] + 'pcs)', '', '#a3e635'), kpi('Worst Month', labels[wI] + ' (' + qD[wI] + 'pcs)', '', '#e8211a'), kpi('Avg ROI', pct(avgR), 'from invoices', '#22d3ee')].join('');
  loadChart(function () {
    mkCh('sch1', qD, labels, '#22d3ee', 'bar', function (v) { return v + ' pcs'; });
    mkCh('sch2', pD, labels, '#a3e635', 'bar', fmtM);
    mkCh('sch3', rD, labels, '#fbbf24', 'line', pct);
  });
};

function s8cap() {
  var ms = s8getMods(); var budget = parseInt((document.getElementById('capInp') || {}).value || '1000000') || 1000000;
  var stars = ms.filter(function (m) { return m.cat === 'STAR'; }); var fast = ms.filter(function (m) { return m.cat === 'FAST'; }); var high = ms.filter(function (m) { return m.cat === 'HIGHROI'; });
  var alcs = [{ lbl: '\u2B50 Star Models', pct2: 50, mods: stars, col: '#a3e635' }, { lbl: '\u26A1 Fast Rotation', pct2: 30, mods: fast, col: '#22d3ee' }, { lbl: '\uD83D\uDCB0 High ROI', pct2: 15, mods: high, col: '#fbbf24' }, { lbl: '\uD83E\uDDEA Experimental', pct2: 5, mods: [], col: '#c084fc' }];
  var ca = document.getElementById('capAlloc'); if (!ca) return;
  ca.innerHTML = alcs.map(function (a) {
    var amt = Math.round(budget * a.pct2 / 100);
    var plist = a.mods.slice(0, 3).map(function (m) { var qty = Math.max(1, Math.floor(amt / (a.mods.length || 1) / (m.costPc || 1))); return '<div style="display:flex;justify-content:space-between;padding:3px 7px;background:rgba(255,255,255,.03);border-radius:4px;margin-bottom:3px"><span style="font-size:10px;color:var(--text)">' + m.model + '</span><span style="font-family:var(--fm,monospace);font-size:10px;color:' + a.col + '">' + qty + ' pcs (' + fmtM(qty * m.profitPc) + ')</span></div>'; }).join('');
    return '<div style="margin-bottom:10px;background:' + a.col + '0a;border:1px solid ' + a.col + '33;border-radius:10px;padding:12px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:9px;font-weight:700;color:' + a.col + '">' + a.lbl + '</span><span style="font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:' + a.col + '">' + fmtM(amt) + '</span></div><div style="height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-bottom:7px"><div style="width:' + a.pct2 + '%;height:100%;background:' + a.col + '"></div></div>' + (plist || '<div style="font-size:10px;color:var(--text3)">এই category-তে model নেই।</div>') + '</div>';
  }).join('');
  var ms2 = ms.filter(function (m) { return m.avail * m.costPc > 0; }).sort(function (a, b) { return b.avail * b.costPc - a.avail * a.costPc; }); var totL = ms2.reduce(function (s, m) { return s + m.avail * m.costPc; }, 0);
  var cl = document.getElementById('capLock'); if (!cl) return;
  cl.innerHTML = '<div style="font-family:var(--fm,monospace);font-size:11px;color:var(--text3);margin-bottom:8px">Total: <b style="color:#f59e0b">' + fmtM(totL) + '</b></div>'
    + ms2.map(function (m) { var lk = m.avail * m.costPc; return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:600;color:var(--text);min-width:150px;white-space:nowrap">' + m.model + '</span><div style="flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="width:' + Math.round(lk / totL * 100) + '%;height:100%;background:' + (m.cat === 'DEAD' ? '#e8211a' : m.cat === 'SLOW' ? '#f59e0b' : '#34d399') + '"></div></div><span style="font-family:var(--fm,monospace);font-size:10px;font-weight:700;color:var(--text2);min-width:80px;text-align:right">' + fmtM(lk) + '</span>' + badge((CAT[m.cat] || { lbl: m.cat }).lbl, (CAT[m.cat] || { col: '#8899b4' }).col) + '</div>'; }).join('');
}

function s8ceo() {
  var ms = s8getMods();
  function pan(elId, mods, col) { var el = document.getElementById(elId); if (!el) return; if (!mods.length) { el.innerHTML = '<div style="color:var(--text3);font-size:11px;padding:8px">None.</div>'; return; } el.innerHTML = mods.map(function (m) { return '<div style="padding:9px;background:rgba(23,32,48,.6);border:1px solid rgba(255,255,255,.05);border-radius:8px;margin-bottom:6px;border-left:3px solid ' + col + '"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">' + m.model + '</span><span style="font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:' + col + '">' + m.score + '</span></div><div style="display:flex;gap:10px;flex-wrap:wrap"><span style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">ROI: <b style="color:' + col + '">' + pct(m.roi) + '</b></span><span style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">Out: <b style="color:#22d3ee">' + (m.sellOut >= 999 ? '\u221E' : m.sellOut + 'd') + '</b></span><span style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">Profit/Pc: <b style="color:#c084fc">' + fmtM(m.profitPc) + '</b></span></div></div>'; }).join(''); }
  pan('ceoBM', ms.filter(function (m) { return m.dec === 'BUY MORE'; }), '#a3e635');
  pan('ceoRB', ms.filter(function (m) { return m.dec === 'REBUY'; }), '#22d3ee');
  pan('ceoH', ms.filter(function (m) { return m.dec === 'HOLD'; }), '#fbbf24');
  pan('ceoRD', ms.filter(function (m) { return m.dec === 'REDUCE'; }), '#f59e0b');
  pan('ceoST', ms.filter(function (m) { return m.dec === 'STOP'; }), '#e8211a');
  var buy = ms.filter(function (m) { return m.dec === 'BUY MORE'; }); var stop = ms.filter(function (m) { return m.dec === 'STOP'; });
  var fastMs = ms.filter(function (m) { return m.sellOut < 999; }).sort(function (a, b) { return a.sellOut - b.sellOut; });
  var profT = ms.slice().sort(function (a, b) { return b.totalProfit - a.totalProfit; });
  var budget = parseInt((document.getElementById('capInp') || {}).value || '1000000') || 1000000;
  var qa = [
    { q: '\u0995\u09cb\u09a8 models \u09a6\u09cd\u09b0\u09c1\u09a4 cash \u0986\u09a8\u09c7?', a: fastMs.slice(0, 3).map(function (m) { return '<b>' + m.model + '</b> (' + m.sellOut + 'd)'; }).join(', ') || '\u2014' },
    { q: 'Maximum profit \u0995\u09cb\u09a8 models?', a: profT.slice(0, 3).map(function (m) { return '<b>' + m.model + '</b> (' + fmtM(m.totalProfit) + ')'; }).join(', ') || '\u2014' },
    { q: '\u0995\u09cb\u09a5\u09be\u09af\u09bc \u09ac\u09c7\u09b6\u09bf capital \u09a6\u09c7\u09ac\u09cb?', a: buy.slice(0, 3).map(function (m) { return '<b>' + m.model + '</b> (Score: ' + m.score + ')'; }).join(', ') || '\u2014' },
    { q: '\u0995\u09cb\u09a8 models stop?', a: stop.slice(0, 3).map(function (m) { return '<b>' + m.model + '</b> (' + m.sellOut + 'd, ' + pct(m.roi) + ')'; }).join(', ') || '\u2705 \u0995\u09cb\u09a8\u09cb dead model \u09a8\u09c7\u0987' },
    { q: fmtM(budget) + ' \u0986\u099c \u09b0\u09be\u0996\u09ac\u09cb \u0995\u09cb\u09a5\u09be\u09af\u09bc?', a: '\u2B50 Star: <b>' + fmtM(budget * 0.5) + '</b>' + (buy.length ? ' \u2192 ' + buy.slice(0, 2).map(function (m) { return m.model; }).join(', ') : '') + '<br>\u26A1 Fast: <b>' + fmtM(budget * 0.3) + '</b><br>\uD83D\uDCB0 High ROI: <b>' + fmtM(budget * 0.15) + '</b><br>\uD83E\uDDEA Test: <b>' + fmtM(budget * 0.05) + '</b>' },
  ];
  var qa_el = document.getElementById('ceoQA'); if (!qa_el) return;
  qa_el.innerHTML = qa.map(function (q2) { return '<div style="padding:11px 13px;background:rgba(23,32,48,.6);border:1px solid rgba(255,255,255,.05);border-radius:10px;margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:#a3e635;margin-bottom:5px">Q: ' + q2.q + '</div><div style="font-size:12px;color:var(--text2,#8899b4);line-height:1.7">' + q2.a + '</div></div>'; }).join('');
}
window.s8R = function () { s8ov(); };

// ══════════════════════════════════════════════════════════════════════════
// PROGRESS CALC + OVERVIEW
// ══════════════════════════════════════════════════════════════════════════
function calcProg(id) {
  var c = getCustomers(); var t, d, g;
  if (id === 1) { t = lsGet('ctg_hub_s1_tgt', {}); return Math.min(100, Math.round(Object.keys(t).length / Math.max(1, c.length) * 100)); }
  if (id === 2) { var tot = 0, mi = 0; c.forEach(function(cu){(cu.invoices||[]).forEach(function(inv){tot++;if((inv.items||[]).length>1)mi++;});}); return tot>0?Math.round(mi/tot*100):0; }
  if (id === 3) { d = lsGet('ctg_hub_s3_dubai', []); var dn = d.filter(function(x){return x.status==='Completed';}).length; return d.length>0?Math.round(dn/d.length*100):0; }
  if (id === 4) { g = lsGet('ctg_hub_s4_gaps', []); var sc = g.filter(function(x){return x.status==='Scale';}).length; return g.length>0?Math.round(sc/g.length*100):0; }
  if (id === 5) { var r = lsGet('ctg_hub_s5_royal', {}); var full = Object.values(r).filter(function(u){return u.cour&&u.cred;}).length; return c.length>0?Math.round(full/c.length*100):0; }
  if (id === 6) { var v = lsGet('ctg_hub_s6_video', []); var conv = v.filter(function(x){return x.trial;}).length; return v.length>0?Math.round(conv/v.length*100):0; }
  if (id === 7) { var p = lsGet('ctg_hub_s7_psy', []); return c.length>0?Math.min(100,Math.round(p.length/c.length*100)):0; }
  if (id === 8) { var b = getStockBatches(); var st = b.filter(function(x){return x.costPc>0&&(x.sellPc-x.costPc)/x.costPc*100>=15;}).length; return b.length>0?Math.round(st/b.length*100):0; }
  return 0;
}

window.shRefresh = function () {
  var g = document.getElementById('shGrid'); if (!g) return;
  g.innerHTML = STRATS.map(function (s) {
    var p = calcProg(s.id); var pC = p >= 80 ? '#34d399' : p >= 50 ? '#22d3ee' : p > 0 ? '#f59e0b' : '#e8211a';
    return '<div class="sh-card" onclick="shOpen(' + s.id + ')"><div class="sh-acc" style="background:' + s.col + '"></div><div class="sh-gnum" style="color:' + s.col + '">' + s.num + '</div><div class="sh-cname">' + s.name + '</div><div class="sh-cdesc">' + s.desc + '</div><div class="sh-cfoot"><span class="sh-phase" style="background:' + s.lite + ';color:' + s.col + '">' + s.phase + '</span><div class="sh-pw"><div class="sh-pt"><div class="sh-pb" style="width:' + p + '%;background:' + pC + '"></div></div><span class="sh-pp" style="color:' + pC + '">' + p + '%</span></div></div></div>';
  }).join('');
};

window.shOv = function () {
  document.getElementById('sh-ov').style.display = '';
  document.querySelectorAll('.sh-det').forEach(function (d) { d.style.display = 'none'; });
  shRefresh();
};

window.shOpen = function (id) {
  document.getElementById('sh-ov').style.display = 'none';
  document.querySelectorAll('.sh-det').forEach(function (d) { d.style.display = 'none'; });
  var det = document.getElementById('sh-s' + id); if (det) { det.style.display = 'block'; det.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  var renders = { 1: window.s1R, 2: window.s2R, 3: window.s3R, 4: window.s4R, 5: window.s5R, 6: window.s6R, 7: window.s7R, 8: function () { loadChart(function () { s8ov(); }); } };
  if (renders[id]) renders[id]();
  // Also reset s8 tab state when opening S8
  if (id === 8) { document.querySelectorAll('.s8sec').forEach(function(t){t.classList.remove('on');}); var t1=document.getElementById('s8t1'); if(t1)t1.classList.add('on'); document.querySelectorAll('.s8snb').forEach(function(b){b.classList.remove('on');}); var b1=document.getElementById('s8n1'); if(b1)b1.classList.add('on'); }
};

// ══════════════════════════════════════════════════════════════════════════
// INSTALL — self-installs into CRM without modifying anything
// ══════════════════════════════════════════════════════════════════════════
function install() {
  if (document.getElementById('strategiespage')) return;

  // 1. Inject HTML
  var main = document.querySelector('.main') || document.querySelector('#app') || document.body;
  var div = document.createElement('div'); div.innerHTML = buildHTML();
  while (div.firstChild) main.appendChild(div.firstChild);

  // 2. Add nav button (remove old one first)
  var nav = document.querySelector('nav.nav') || document.querySelector('nav');
  if (nav) {
    var old = document.getElementById('stratHubBtn');
    if (old) old.remove();
    var btn = document.createElement('button');
    btn.className = 'nb'; btn.id = 'stratHubBtn';
    btn.innerHTML = '\uD83D\uDD25 Strategies';
    btn.style.cssText = 'color:#fbbf24;font-weight:900';
    btn.onclick = function () {
      if (typeof window.goTo === 'function') {
        window.goTo('strategiespage', this);
      } else {
        document.querySelectorAll('.sec').forEach(function (s) { s.classList.remove('active'); });
        var sp = document.getElementById('strategiespage');
        if (sp) sp.classList.add('active');
        document.querySelectorAll('.nb').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
    };
    nav.appendChild(btn);
  }

  // 3. Patch goTo to trigger shRefresh
  if (typeof window.goTo === 'function' && !window._shPatched) {
    window._shPatched = true;
    var _orig = window.goTo;
    window.goTo = function (id, b) {
      _orig.apply(this, arguments);
      if (id === 'strategiespage') setTimeout(shRefresh, 80);
    };
  }

  // 4. Build overview
  shRefresh();
  s1BuildSel();
  shNotify('\uD83D\uDD25 Strategy Hub v2.0 ready!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { setTimeout(install, 900); });
} else {
  setTimeout(install, 900);
}

})(); // end IIFE

/* ══ S2 Customer Bundle Advisor JS ══════════════════════════════════════ */
(function() {

// ── local getCustomers fallback (window.getCustomers set by main IIFE) ──
var getCustomers = window.getCustomers || function() {
  if (window.db && window.db.customers && window.db.customers.length > 0) return window.db.customers;
  try { var r = localStorage.getItem('ctgcrm_v18'); if (r) { var p = JSON.parse(r); if (p && p.customers && p.customers.length > 0) return p.customers; } } catch(e) {}
  return [];
};

// ── populate customer selector ──────────────────────────────────────────
function s2popCust() {
  var sel = document.getElementById('s2custSel'); if (!sel) return;
  if (sel.options.length > 1) return;
  getCustomers().forEach(function(c) {
    var o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o);
  });
}

// ── model price segment classifier ─────────────────────────────────────
function segment(costPc) {
  if (costPc < 20000) return { name:'Budget', col:'#8899b4' };
  if (costPc < 30000) return { name:'Entry',  col:'#22d3ee' };
  if (costPc < 38000) return { name:'Mid',    col:'#a3e635' };
  if (costPc < 45000) return { name:'Premium',col:'#fbbf24' };
  return { name:'High-End', col:'#c084fc' };
}

// ── build bundle score ──────────────────────────────────────────────────
function bundleScore(m1, m2) {
  // Price diversity bonus (different segments = better bundle)
  var s1 = segment(m1.cost || m1.costPc || 0);
  var s2 = segment(m2.cost || m2.costPc || 0);
  var diversity = s1.name !== s2.name ? 25 : 0;
  // ROI bonus
  var avgRoi = ((m1.roi || 0) + (m2.roi || 0)) / 2;
  var roiBonus = avgRoi >= 18 ? 30 : avgRoi >= 15 ? 20 : avgRoi >= 12 ? 10 : 0;
  // Demand bonus (d30)
  var demandBonus = ((m1.d30 || 0) + (m2.d30 || 0)) > 10 ? 20 : 10;
  // Cross-sell bonus (customer hasn't bought m2 before)
  return Math.min(100, diversity + roiBonus + demandBonus + 25);
}

// ── main advisor function ───────────────────────────────────────────────
window.s2advisor = function() {
  s2popCust();
  var sel = document.getElementById('s2custSel'); if (!sel) return;
  var cid = sel.value;
  var hist  = document.getElementById('s2custHist');
  var empty = document.getElementById('s2custEmpty');
  if (!cid) { if(hist) hist.style.display='none'; if(empty) empty.style.display='block'; return; }
  if (hist)  hist.style.display  = 'block';
  if (empty) empty.style.display = 'none';

  var custs = getCustomers();
  var c = custs.find(function(x){ return String(x.id) === String(cid); });
  if (!c) return;

  var invs = c.invoices || [];

  // ── 1. Per-model stats ───────────────────────────────────────────────
  var mStat = {};
  var singleCnt = 0, multiCnt = 0, totalQty = 0;
  invs.forEach(function(inv) {
    var items = inv.items || [];
    var uMods = [];
    items.forEach(function(x) {
      var nm = x.model || x.description || 'Unknown';
      if (uMods.indexOf(nm) < 0) uMods.push(nm);
      if (!mStat[nm]) mStat[nm] = { model:nm, qty:0, rev:0, cost:0, invCnt:0, costPc:x.purchasePrice||0 };
      mStat[nm].qty     += x.qty || 0;
      mStat[nm].rev     += (x.qty||0)*(x.price||0);
      mStat[nm].cost    += (x.qty||0)*(x.purchasePrice||0);
      mStat[nm].invCnt  += 1;
      if (x.purchasePrice) mStat[nm].costPc = x.purchasePrice;
      totalQty += x.qty || 0;
    });
    if (uMods.length > 1) multiCnt++; else singleCnt++;
  });

  Object.values(mStat).forEach(function(m) {
    m.roi = m.cost > 0 ? (m.rev - m.cost) / m.cost * 100 : 0;
    m.profitPc = m.qty > 0 ? (m.rev - m.cost) / m.qty : 0;
    m.seg = segment(m.costPc);
  });

  var modArr = Object.values(mStat).sort(function(a,b){ return b.qty - a.qty; });
  var bundleRatio = invs.length > 0 ? multiCnt / invs.length * 100 : 0;
  var totalProfit = modArr.reduce(function(s,m){ return s + (m.rev - m.cost); }, 0);

  // ── 2. KPI row ───────────────────────────────────────────────────────
  function kc(lbl, val, sub, col) {
    return '<div style="background:rgba(23,32,48,.75);border:1px solid rgba(255,255,255,.06);border-top:2px solid '+col+';border-radius:10px;padding:11px">'
      +'<div style="font-size:7.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--text3,#4a5f7a);margin-bottom:5px">'+lbl+'</div>'
      +'<div style="font-family:var(--fm,monospace);font-size:20px;font-weight:700;color:'+col+';line-height:1">'+val+'</div>'
      +'<div style="font-size:10px;color:var(--text3,#4a5f7a);margin-top:3px;font-family:var(--fm,monospace)">'+sub+'</div>'
      +'</div>';
  }
  var ak = document.getElementById('s2ak');
  if (ak) ak.innerHTML = [
    kc('Total Invoices', invs.length+'', 'all orders', '#22d3ee'),
    kc('Bundle Ratio', bundleRatio.toFixed(0)+'%', singleCnt+' single / '+multiCnt+' bundle', bundleRatio>=60?'#34d399':'#f59e0b'),
    kc('Total pcs', totalQty+'', 'all models combined', '#fbbf24'),
    kc('Total Profit', '\u09f3'+Math.round(totalProfit/1000)+'K', 'from this customer', '#a3e635'),
  ].join('');

  // ── 3. Model history list ────────────────────────────────────────────
  var mh = document.getElementById('s2mhist');
  if (mh) mh.innerHTML = modArr.map(function(m, i) {
    var pct2 = modArr[0].qty > 0 ? m.qty / modArr[0].qty * 100 : 0;
    var roiCol = m.roi >= 18 ? '#34d399' : m.roi >= 14 ? '#a3e635' : m.roi >= 10 ? '#f59e0b' : '#e8211a';
    return '<div style="padding:9px;background:rgba(23,32,48,.6);border:1px solid rgba(255,255,255,.05);border-radius:8px;margin-bottom:6px;border-left:3px solid '+m.seg.col+'">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
      +'<div><div style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">'+m.model+'</div>'
      +'<span style="font-size:8px;font-weight:700;padding:1px 7px;border-radius:20px;color:'+m.seg.col+';background:'+m.seg.col+'1a;border:1px solid '+m.seg.col+'33">'+m.seg.name+'</span></div>'
      +'<div style="text-align:right"><div style="font-family:var(--fm,monospace);font-size:16px;font-weight:800;color:#fbbf24">'+m.qty+' pcs</div>'
      +'<div style="font-family:var(--fm,monospace);font-size:10px;color:'+roiCol+'">ROI '+m.roi.toFixed(1)+'%</div></div></div>'
      +'<div style="height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">'
      +'<div style="width:'+pct2.toFixed(0)+'%;height:100%;background:'+m.seg.col+';border-radius:2px"></div></div>'
      +'</div>';
  }).join('') || '<div style="color:var(--text3);font-size:11px;padding:10px">No model data।</div>';

  // ── 4. Bundle Suggestions ────────────────────────────────────────────
  // Get all available models from CRM + stock
  var allMs = [];
  try {
    var batches = JSON.parse(localStorage.getItem('ctgstock_v2') || '{}').batches || [];
    batches.forEach(function(b) { if (b.model && b.costPc > 0) allMs.push({ model:b.model, costPc:b.costPc, sellPc:b.sellPc||0, roi:b.costPc>0?(b.sellPc-b.costPc)/b.costPc*100:0, d30:b.avail||0, seg:segment(b.costPc) }); });
  } catch(e){}
  // Fallback: use from invoice data of all customers
  if (allMs.length === 0) {
    var mmap = {};
    custs.forEach(function(cu){ (cu.invoices||[]).forEach(function(inv){ (inv.items||[]).forEach(function(x){ var nm=x.model||x.description||''; if(nm&&!mmap[nm]) mmap[nm]={model:nm,costPc:x.purchasePrice||0,sellPc:x.price||0,roi:x.purchasePrice>0?(x.price-x.purchasePrice)/x.purchasePrice*100:0,d30:0,seg:segment(x.purchasePrice||0)}; }); }); });
    allMs = Object.values(mmap);
  }

  // Top 3 anchor models (most bought by this customer)
  var anchors = modArr.slice(0, 3);
  var suggestions = [];

  anchors.forEach(function(anchor) {
    // Find complementary models (not same, different segment preferred)
    var candidates = allMs.filter(function(m) {
      return m.model !== anchor.model && m.roi > 10;
    }).sort(function(a,b){ return b.roi - a.roi; });

    // Pick top 2 complements per anchor
    var picked = [];
    candidates.forEach(function(c2) {
      if (picked.length >= 2) return;
      // Prefer different segment
      var diffSeg = c2.seg.name !== anchor.seg.name;
      var score = bundleScore(anchor, c2) + (diffSeg ? 10 : 0);
      // Avoid duplicates in suggestions
      var already = suggestions.some(function(s) {
        return (s.a === anchor.model && s.b === c2.model) || (s.a === c2.model && s.b === anchor.model);
      });
      if (!already) { picked.push({ a: anchor, b: c2, score: score }); }
    });
    picked.forEach(function(p) { suggestions.push({ a:p.a.model, b:p.b.model, aRoi:anchor.roi, bRoi:p.b.roi, aSeg:anchor.seg, bSeg:p.b.seg, score:p.score, aQty:anchor.qty }); });
  });

  // Sort by score, take top 4
  suggestions.sort(function(a,b){ return b.score - a.score; });
  suggestions = suggestions.slice(0, 4);

  // Why text
  function whyText(s) {
    var avgRoi = (s.aRoi + s.bRoi) / 2;
    var tips = [];
    if (s.aSeg.name !== s.bSeg.name) tips.push('দুটো আলাদা segment — customer এর shop সব range cover করবে');
    if (avgRoi >= 18) tips.push('Avg ROI '+avgRoi.toFixed(1)+'% — profitable combination');
    if (s.aQty >= 20) tips.push(s.a+' already popular এই customer এ — '+ s.b+' দিলে avg order বাড়বে');
    tips.push('একসাথে offer দিলে per-invoice profit বাড়বে');
    return tips[0] || 'Complementary models — bundle করলে order value বাড়বে';
  }

  // Qty suggestion
  function qtySug(s) {
    var baseQty = Math.max(3, Math.round(s.aQty / 4));
    return baseQty + ' × ' + s.a + ' + ' + Math.max(2, Math.round(baseQty*0.6)) + ' × ' + s.b;
  }

  var bun = document.getElementById('s2bundles');
  if (bun) {
    if (!suggestions.length) {
      bun.innerHTML = '<div style="color:var(--text3);font-size:11px;padding:10px">ডেটা কম — বেশি invoice থাকলে suggestion improve হবে।</div>';
    } else {
      bun.innerHTML = suggestions.map(function(s, i) {
        var avgRoi = (s.aRoi + s.bRoi) / 2;
        var roiCol = avgRoi >= 18 ? '#34d399' : avgRoi >= 15 ? '#a3e635' : '#f59e0b';
        var scoreCol = s.score >= 80 ? '#a3e635' : s.score >= 60 ? '#22d3ee' : '#f59e0b';
        var rank = ['🥇','🥈','🥉','🏅'][i] || '•';
        return '<div style="padding:12px;background:rgba(23,32,48,.8);border:1px solid rgba(255,255,255,.07);border-radius:10px;margin-bottom:8px;position:relative;overflow:hidden">'
          // Score badge
          +'<div style="position:absolute;top:8px;right:10px;font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:'+scoreCol+'">'+s.score+'</div>'
          // Rank + title
          +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
          +'<span style="font-size:16px">'+rank+'</span>'
          +'<div><div style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text)">Bundle #'+(i+1)+'</div>'
          +'<div style="font-size:9px;color:var(--text3);font-family:var(--fm,monospace)">Score: '+s.score+'/100</div></div></div>'
          // Models
          +'<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;margin-bottom:8px">'
          +'<div style="background:'+s.aSeg.col+'15;border:1px solid '+s.aSeg.col+'33;border-radius:6px;padding:7px 9px">'
          +'<div style="font-family:var(--fm,monospace);font-size:9px;font-weight:700;color:'+s.aSeg.col+'">'+s.aSeg.name+'</div>'
          +'<div style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text);margin-top:2px">'+s.a+'</div>'
          +'<div style="font-family:var(--fm,monospace);font-size:10px;color:'+roiCol+';margin-top:2px">ROI '+s.aRoi.toFixed(1)+'%</div>'
          +'</div>'
          +'<div style="font-size:18px;text-align:center">➕</div>'
          +'<div style="background:'+s.bSeg.col+'15;border:1px solid '+s.bSeg.col+'33;border-radius:6px;padding:7px 9px">'
          +'<div style="font-family:var(--fm,monospace);font-size:9px;font-weight:700;color:'+s.bSeg.col+'">'+s.bSeg.name+'</div>'
          +'<div style="font-family:var(--fu,sans-serif);font-size:11px;font-weight:700;color:var(--text);margin-top:2px">'+s.b+'</div>'
          +'<div style="font-family:var(--fm,monospace);font-size:10px;color:'+roiCol+';margin-top:2px">ROI '+s.bRoi.toFixed(1)+'%</div>'
          +'</div></div>'
          // Avg ROI + qty suggestion
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:7px">'
          +'<div style="background:rgba(163,230,53,.06);border:1px solid rgba(163,230,53,.15);border-radius:5px;padding:5px 8px">'
          +'<div style="font-size:8px;color:#a3e635;font-weight:700;letter-spacing:.5px">AVG BUNDLE ROI</div>'
          +'<div style="font-family:var(--fm,monospace);font-size:15px;font-weight:800;color:#a3e635">'+avgRoi.toFixed(1)+'%</div>'
          +'</div>'
          +'<div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.15);border-radius:5px;padding:5px 8px">'
          +'<div style="font-size:8px;color:#fbbf24;font-weight:700;letter-spacing:.5px">QTY SUGGESTION</div>'
          +'<div style="font-family:var(--fm,monospace);font-size:10px;font-weight:700;color:#fbbf24;line-height:1.4;margin-top:2px">'+qtySug(s)+'</div>'
          +'</div></div>'
          // Why
          +'<div style="background:rgba(255,255,255,.03);border-radius:5px;padding:6px 8px;font-size:10px;color:var(--text2,#8899b4);line-height:1.5">'
          +'💡 '+whyText(s)
          +'</div>'
          +'</div>';
      }).join('');
    }
  }

  // ── 5. Invoice timeline ──────────────────────────────────────────────
  var itb = document.getElementById('s2invtb');
  if (itb) itb.innerHTML = invs.slice().reverse().slice(0, 10).map(function(inv) {
    var items = inv.items || [];
    var uMods = []; var allQty = 0; var sell = 0; var cost = 0;
    items.forEach(function(x) {
      var nm = x.model||x.description||'?';
      if (uMods.indexOf(nm) < 0) uMods.push(nm);
      allQty += x.qty||0; sell += (x.qty||0)*(x.price||0); cost += (x.qty||0)*(x.purchasePrice||0);
    });
    var roi = cost > 0 ? (sell-cost)/cost*100 : 0;
    var isBundle = uMods.length > 1;
    var roiCol = roi >= 18 ? '#34d399' : roi >= 14 ? '#a3e635' : roi >= 10 ? '#f59e0b' : '#e8211a';
    return '<tr>'
      +'<td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">'+(inv.date||'—')+'</td>'
      +'<td style="font-size:10px;color:var(--text)">'
      + uMods.map(function(m){ return '<span style="font-family:var(--fm,monospace);font-size:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:3px;padding:1px 5px;margin:1px;display:inline-block">'+m+'</span>'; }).join('')
      +'</td>'
      +'<td style="font-family:var(--fm,monospace);color:#22d3ee">'+allQty+'</td>'
      +'<td style="font-family:var(--fm,monospace);font-weight:700;color:'+roiCol+'">'+roi.toFixed(1)+'%</td>'
      +'<td style="font-family:var(--fm,monospace);font-size:10px;color:var(--text3)">'+(inv.status||'—')+'</td>'
      +'<td>'+(isBundle
        ? '<span style="font-size:10px;font-weight:700;color:#a3e635;background:rgba(163,230,53,.1);border:1px solid rgba(163,230,53,.25);border-radius:4px;padding:2px 8px">✓ Bundle</span>'
        : '<span style="font-size:10px;color:var(--text4);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:2px 8px">Single</span>')
      +'</td></tr>';
  }).join('') || '<tr><td colspan="6" style="color:var(--text3);text-align:center;padding:16px">No invoices</td></tr>';
};

// ── patch s2R to also populate customer selector ─────────────────────
var _s2Rorig = window.s2R;
window.s2R = function() {
  if (_s2Rorig) _s2Rorig.apply(this, arguments);
  setTimeout(s2popCust, 100);
};

// ── also patch shOpen to init advisor when S2 opens ──────────────────
var _shOpenOrig = window.shOpen;
window.shOpen = function(id) {
  if (_shOpenOrig) _shOpenOrig.apply(this, arguments);
  if (id === 2) setTimeout(s2popCust, 200);
};

})();
