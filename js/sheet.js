// ── S0 TRANSFER ──
// When the player completes s0.html it stores data in dh2-s0-transfer.
// sheet.html picks it up on load and applies it to the sheet.
function applyS0Transfer() {
  try {
    const raw = localStorage.getItem('dh2-s0-transfer');
    if (!raw) return;
    const t = JSON.parse(raw);
    if (!t.fromS0 || !t.class) return;
    localStorage.removeItem('dh2-s0-transfer'); // consume it

    // Switch to the right class
    if (!CLASSES[t.class]) return;
    if (currentClass && currentClass !== t.class) save();
    currentClass = t.class;
    localStorage.setItem('dh2-last-class', t.class);
    document.getElementById('class-picker').value = t.class;
    buildPages(t.class);

    // Restore existing save for this class if any, then override with S0 values
    let d = null;
    try { d = JSON.parse(localStorage.getItem(saveKey(t.class))); } catch {}
    restoreData(d);

    // Apply S0 choices
    if (t.subclass)  { const el = document.getElementById('f-subclass');  if (el) { el.value = t.subclass;  onSubclassChange(); } }
    if (t.ancestry)  { const el = document.getElementById('f-ancestry');  if (el) { el.value = t.ancestry;  onHeritageChange(); } }
    if (t.community) { const el = document.getElementById('f-community'); if (el) { el.value = t.community; onHeritageChange(); } }

    // Apply traits
    Object.entries(t.traits || {}).forEach(([trait, val]) => {
      const el = document.getElementById('t-' + trait);
      if (el && val !== '') el.value = val;
    });

    // Apply experiences
    if (t.exps && t.exps.length) {
      const expWrap = document.getElementById('exp-list');
      if (expWrap) {
        expWrap.innerHTML = '';
        t.exps.forEach(exp => {
          if (exp[0]) addExpRow(expWrap, exp[0], exp[1] || '+2');
        });
      }
    }

    // Apply connection/group answers to character background
    const s0d = t.s0Data || {};
    const connQs = s0d['s0-conn-qs'] ? JSON.parse(s0d['s0-conn-qs']) : [];
    const grpQs  = s0d['s0-grp-qs']  ? JSON.parse(s0d['s0-grp-qs'])  : [];
    const allEntries = [];
    connQs.forEach(q => {
      const key = 'conn:' + q.substring(0,40).replace(/\s+/g,'_').replace(/[^a-z0-9_]/gi,'');
      const a = (s0d[key] || '').trim();
      if (a) allEntries.push(q + ': ' + a);
    });
    grpQs.forEach(q => {
      const key = 'grp:' + q.substring(0,40).replace(/\s+/g,'_').replace(/[^a-z0-9_]/gi,'');
      const a = (s0d[key] || '').trim();
      if (a) allEntries.push(q + ': ' + a);
    });
    if (s0d['s0-extra-notes']) allEntries.push(s0d['s0-extra-notes']);
    if (allEntries.length) {
      const ts = new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});
      appendHistoryEntry('— Session 0 —\n\n' + allEntries.join('\n'), ts);
    }

    // Also check if we should go straight to domain cards
    if (localStorage.getItem('dh2-s0-goto-cards') === '1') {
      localStorage.removeItem('dh2-s0-goto-cards');
      setTimeout(() => showSheetTab('cards'), 300);
    } else {
      showSheetTab('sheet');
    }

    renderFeatureBar();
    onHeritageChange();
    renderSidebar();
    save();
  } catch(e) { console.error('S0 transfer error:', e); }
}
// ── STATE & SHEET LOGIC ──

let currentClass = '';

// ─────────────────────────────────────────────
// SVG PIP ICONS
// ─────────────────────────────────────────────
function shieldSVG() {
  return `<svg viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg"><path class="pip-shape" d="M11 1 L21 5 L21 13 Q21 21 11 25 Q1 21 1 13 L1 5 Z"/></svg>`;
}

function heartSVG() {
  return `<svg viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg"><path class="pip-shape" d="M10 16 C10 16 2 10.5 2 5.5 C2 3 4 1 6.5 1 C8 1 9.5 2 10 3.5 C10.5 2 12 1 13.5 1 C16 1 18 3 18 5.5 C18 10.5 10 16 10 16Z"/></svg>`;
}

function boltSVG() {
  return `<svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg"><path class="pip-shape" d="M8 1 L2 12 L7 12 L6 21 L12 10 L7 10 Z"/></svg>`;
}

function starSVG() {
  return `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path class="pip-shape" d="M10 1 L11.8 7.5 L18.5 7.5 L13 11.5 L15 18 L10 14 L5 18 L7 11.5 L1.5 7.5 L8.2 7.5 Z"/></svg>`;
}

function diamondSVG() {
  return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path class="pip-shape" d="M8 1 L15 8 L8 15 L1 8 Z"/></svg>`;
}

function renderHopePips(container, count, filled) {
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<count;i++) {
    const p = document.createElement('div');
    p.className = 'hope-pip' + (i<filled?' filled':'');
    p.innerHTML = starSVG();
    p.addEventListener('click', () => {
      const newVal = getPipCount(container,'hope-pip') > i ? i : i+1;
      renderHopePips(container, count, newVal);
      save();
    });
    container.appendChild(p);
  }
}

function adjustHopeCount(delta) {
  const container = document.getElementById('hope-pips');
  if (!container) return;
  const current = container.querySelectorAll('.hope-pip').length;
  const filled = container.querySelectorAll('.hope-pip.filled').length;
  const newCount = Math.min(6, Math.max(1, current + delta));
  if (newCount === current) return;
  renderHopePips(container, newCount, Math.min(filled, newCount));
  save();
}

function getPipCount(container, cls) {
  return container.querySelectorAll('.'+cls+'.filled').length;
}

function makeShieldPips(container, count, filled) {
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<count;i++) {
    const p = document.createElement('div');
    p.className = 'shield-pip' + (i<filled?' filled':'');
    p.innerHTML = shieldSVG();
    p.addEventListener('click', () => {
      const cur = container.querySelectorAll('.shield-pip.filled').length;
      const newVal = cur > i ? i : i+1;
      makeShieldPips(container, count, newVal);
      save();
    });
    container.appendChild(p);
  }
}

function makeBoxPips(container, count, filled, cls) {
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<count;i++) {
    const b = document.createElement('div');
    b.className = cls + (i<filled?' filled':'');
    if (cls === 'hpbox') b.innerHTML = heartSVG();
    else if (cls === 'stressbox') b.innerHTML = boltSVG();
    else if (cls === 'companion-hpbox') b.innerHTML = heartSVG();
    b.addEventListener('click', () => {
      const cur = container.querySelectorAll('.'+cls+'.filled').length;
      const newVal = cur > i ? i : i+1;
      makeBoxPips(container, count, newVal, cls);
      save();
    });
    container.appendChild(b);
  }
}

function adjustBoxCount(containerId, cls, delta) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const current = container.querySelectorAll('.'+cls).length;
  const filled = container.querySelectorAll('.'+cls+'.filled').length;
  const min = cls === 'hpbox' ? 1 : 1;
  const max = 12;
  const newCount = Math.min(max, Math.max(min, current + delta));
  if (newCount === current) return;
  makeBoxPips(container, newCount, Math.min(filled, newCount), cls);
  save();
}

function makeProfDots(container, filled) {
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<6;i++) {
    const d = document.createElement('div');
    d.className = 'prof-dot' + (i<filled?' filled':'');
    d.innerHTML = diamondSVG();
    d.addEventListener('click', () => {
      const cur = container.querySelectorAll('.prof-dot.filled').length;
      const newVal = cur > i ? i : i+1;
      makeProfDots(container, newVal);
      save();
    });
    container.appendChild(d);
  }
}

// ─────────────────────────────────────────────
// DYNAMIC LISTS
// ─────────────────────────────────────────────
function addExpRow(container, name='', bonus='') {
  const row = document.createElement('div');
  row.className = 'exp-row';
  row.innerHTML = `
    <input type="text" placeholder="Experience name..." value="${name}" oninput="save()">
    <input type="number" class="exp-bonus" placeholder="+2" value="${bonus}" oninput="save()">
    <button class="rm" onclick="this.parentElement.remove();save()">×</button>`;
  container.appendChild(row);
}

function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function stripTags(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&[a-z]+;/g,'').trim();}

// Split "Name — Trait — Damage — Handed\nFeature text" cleanly

function toggleHints() {
  const hintsOn = !document.body.classList.contains('hints-off');
  if (hintsOn) {
    document.body.classList.add('hints-off');
    // Clear all data-hint placeholders
    document.querySelectorAll('input[data-hint]').forEach(el => el.placeholder = '');
  } else {
    document.body.classList.remove('hints-off');
    // Restore data-hint placeholders
    document.querySelectorAll('input[data-hint]').forEach(el => el.placeholder = el.dataset.hint);
  }
  const btn = document.getElementById('hints-btn');
  if (btn) {
    btn.textContent = hintsOn ? '✦ Hints' : '○ Hints';
    btn.classList.toggle('off', hintsOn);
  }
  // Save preference
  localStorage.setItem('dh2-hints', hintsOn ? 'off' : 'on');
}

function applyHintsPref() {
  const pref = localStorage.getItem('dh2-hints');
  if (pref === 'off') {
    document.body.classList.add('hints-off');
    const btn = document.getElementById('hints-btn');
    if (btn) { btn.textContent = '○ Hints'; btn.classList.add('off'); }
  }
}

function wPart(str, idx) {
  if (!str) return '';
  const main = str.split('\n')[0];
  const parts = main.split('—');
  return stripTags((parts[idx]||'').trim());
}
function wFeature(str) {
  if (!str) return '';
  const lines = str.split('\n');
  const main = lines[0];
  const parts = main.split('—');
  // The 4th dash-segment (index 3) is handedness like "One-Handed"
  const handed = stripTags((parts[3]||'').trim());
  // Lines after the first are the feature description
  const feat = stripTags(lines.slice(1).join(' ').trim());
  // Combine: "One-Handed — Quick: When you make an attack..."
  if (handed && feat) return handed + ' — ' + feat;
  return handed || feat;
}

function buildFeatureCard(title, subtitle, features, accentColor) {
  const id = 'fc-' + title.replace(/\s+/g,'-').toLowerCase() + '-' + Math.random().toString(36).slice(2,6);
  const featureHTML = features.map(f =>
    `<div style="margin-bottom:6px;"><strong style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.06em;color:${accentColor};">${f.name}:</strong> <span style="font-size:12.5px;line-height:1.6;">${f.text}</span></div>`
  ).join('');
  return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${accentColor};border-radius:0 5px 5px 0;overflow:hidden;">
    <div onclick="toggleFeatureCard('${id}')" style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;cursor:pointer;gap:8px;">
      <div>
        <span style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--text);letter-spacing:0.06em;">${title}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);margin-left:8px;">${subtitle}</span>
      </div>
      <span id="${id}-arrow" style="font-size:10px;color:var(--muted);flex-shrink:0;">▾</span>
    </div>
    <div id="${id}" style="display:none;padding:0 10px 9px;border-top:1px solid var(--border);">
      <div style="padding-top:8px;">${featureHTML}</div>
    </div>
  </div>`;
}

function toggleFeatureCard(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : '';
  if (arrow) arrow.textContent = open ? '▾' : '▴';
}

function renderFeatureBar() {
  const bar = document.getElementById('feature-bar');
  if (!bar) return;
  const ancestryVal = document.getElementById('f-ancestry')?.value || '';
  const communityVal = document.getElementById('f-community')?.value || '';
  const subclassVal = document.getElementById('f-subclass')?.value || '';

  const cards = [];

  if (communityVal && COMMUNITY_DATA[communityVal]) {
    const d = COMMUNITY_DATA[communityVal];
    cards.push(buildFeatureCard(communityVal, 'Community — ' + d.description.split('.')[0] + '.', d.features, 'var(--gold-dim)'));
  }
  if (ancestryVal && ANCESTRY_DATA[ancestryVal]) {
    const d = ANCESTRY_DATA[ancestryVal];
    cards.push(buildFeatureCard(ancestryVal, 'Ancestry — ' + d.description.split('.')[0] + '.', d.features, 'var(--teal)'));
  }
  if (subclassVal && currentClass && SUBCLASSES[currentClass]) {
    const sub = SUBCLASSES[currentClass].subclasses.find(s => s.name === subclassVal);
    if (sub) {
      const tierFeatures = [
        { name: 'Foundation', text: sub.foundation.replace(/<[^>]*>/g,'') },
        { name: 'Specialization (Lv 5)', text: sub.specialization.replace(/<[^>]*>/g,'') },
        { name: 'Mastery (Lv 8)', text: sub.mastery.replace(/<[^>]*>/g,'') },
      ];
      cards.push(buildFeatureCard(subclassVal, (sub.spellcast ? 'Spellcast: ' + sub.spellcast + ' · ' : '') + 'Subclass', tierFeatures, 'var(--red-dim)'));
    }
  }

  if (!cards.length) { bar.style.display = 'none'; } 
  else {
    bar.style.display = 'grid';
    bar.style.gridTemplateColumns = cards.length === 3 ? '1fr 1fr 1fr' : cards.length === 2 ? '1fr 1fr' : '1fr';
    bar.innerHTML = cards.join('');
  }

  // Show heritage HP/stress tip if ancestry has relevant features
  const tip = document.getElementById('heritage-hp-tip');
  if (tip && ancestryVal && ANCESTRY_DATA[ancestryVal]) {
    const features = ANCESTRY_DATA[ancestryVal].features || [];
    const hpFeature = features.find(f => f.text.includes('Hit Point slot'));
    const stressFeature = features.find(f => f.text.includes('Stress slot'));
    const msgs = [];
    if (hpFeature) msgs.push(`✦ ${ancestryVal} — <strong>${hpFeature.name}:</strong> ${hpFeature.text} Use + to add it.`);
    if (stressFeature) msgs.push(`✦ ${ancestryVal} — <strong>${stressFeature.name}:</strong> ${stressFeature.text} Use + to add it.`);
    if (msgs.length) { tip.innerHTML = msgs.join('<br>'); tip.style.display = 'block'; }
    else tip.style.display = 'none';
  } else if (tip) { tip.style.display = 'none'; }
}


function onMixedAncestryChange() {
  const a1 = document.getElementById('f-mixed-a1')?.value || '';
  const a2 = document.getElementById('f-mixed-a2')?.value || '';
  // Save selections
  if (a1) localStorage.setItem('dh2-mixed-a1-' + (currentClass||''), a1);
  if (a2) localStorage.setItem('dh2-mixed-a2-' + (currentClass||''), a2);

  // Update the feature bar to show the chosen features
  renderMixedAncestryFeatures(a1, a2);
}

function renderMixedAncestryFeatures(a1, a2) {
  // Temporarily patch ANCESTRY_DATA['Mixed Ancestry'] with the chosen features
  // so renderFeatureBar picks them up correctly
  if (a1 && a2 && ANCESTRY_DATA[a1] && ANCESTRY_DATA[a2]) {
    const feat1 = ANCESTRY_DATA[a1].features[0];
    const feat2 = ANCESTRY_DATA[a2].features[1] || ANCESTRY_DATA[a2].features[0];
    ANCESTRY_DATA['Mixed Ancestry']._resolved = [feat1, feat2];
    ANCESTRY_DATA['Mixed Ancestry'].features = [feat1, feat2];
    ANCESTRY_DATA['Mixed Ancestry'].description = a1 + ' / ' + a2;
    renderFeatureBar();
  }
}

function onHeritageChange() {
  renderFeatureBar();
  const ancestryVal = document.getElementById('f-ancestry')?.value || '';
  const mixedDiv = document.getElementById('mixed-ancestry-pickers');
  if (mixedDiv) {
    if (ancestryVal === 'Mixed Ancestry') {
      mixedDiv.style.display = 'block';
      // Populate selects if empty
      ['f-mixed-a1','f-mixed-a2'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel && sel.options.length <= 1) {
          Object.keys(ANCESTRY_DATA).filter(a=>a!=='Mixed Ancestry').forEach(a => {
            const opt = document.createElement('option');
            opt.value = a; opt.textContent = a;
            sel.appendChild(opt);
          });
        }
      });
      // Restore saved values
      const saved1 = localStorage.getItem('dh2-mixed-a1-' + (currentClass||''));
      const saved2 = localStorage.getItem('dh2-mixed-a2-' + (currentClass||''));
      const s1 = document.getElementById('f-mixed-a1');
      const s2 = document.getElementById('f-mixed-a2');
      if (s1 && saved1) { s1.value = saved1; onMixedAncestryChange(); }
      if (s2 && saved2) { s2.value = saved2; onMixedAncestryChange(); }
    } else {
      mixedDiv.style.display = 'none';
    }
  }
}
function onSubclassChange() { renderFeatureBar(); }
function onAncestryChange() { renderFeatureBar(); }
function onCommunityChange() { renderFeatureBar(); }

function addInvRow(container, val='', qty='') {
  const row = document.createElement('div');
  row.className = 'inv-line';
  row.innerHTML = `<input type="text" placeholder="Item..." value="${escHtml(val)}" oninput="save()" style="flex:1;"><input type="number" placeholder="qty" value="${escHtml(qty)}" oninput="save()" style="width:46px;text-align:center;"><button class="rm" onclick="this.parentElement.remove();save()" title="Remove">×</button>`;
  container.appendChild(row);
}

function addInvArmor(container, n='', thresh='', score='', feature='') {
  const wrap = document.createElement('div');
  wrap.className = 'inv-armor-wrap';
  wrap.style.marginBottom = '8px';
  wrap.innerHTML = `
    <div class="weapon-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div class="weapon-label">Inventory Armor</div>
        <button class="rm" onclick="this.closest('.inv-armor-wrap').remove();save()" title="Remove armor">×</button>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:5px;margin-bottom:4px;">
        <div class="wfield"><span class="ey">Name</span><input type="text" placeholder="Chainmail Armor..." value="${escHtml(n)}" oninput="save()"></div>
        <div class="wfield"><span class="ey">Thresholds</span><input type="text" placeholder="7/15" value="${escHtml(thresh)}" oninput="save()"></div>
        <div class="wfield"><span class="ey">Score</span><input type="text" placeholder="4" value="${escHtml(score)}" oninput="save()"></div>
      </div>
      <div class="wfield"><span class="ey">Feature</span><input type="text" placeholder="Heavy: −1 Evasion, Flexible: +1 Evasion..." value="${escHtml(feature)}" oninput="save()"></div>
    </div>`;
  container.appendChild(wrap);
}

function addInvWeapon(container, n='',t='',d='',f='') {
  const wrap = document.createElement('div');
  wrap.className = 'inv-weapon-wrap';
  wrap.style.marginBottom='8px';
  wrap.innerHTML = `
    <div class="weapon-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div class="weapon-label">Inventory Weapon</div>
        <div style="display:flex;gap:10px;font-size:11px;align-items:center;">
          <label><input type="checkbox" style="width:auto;" oninput="save()"> Primary</label>
          <label><input type="checkbox" style="width:auto;" oninput="save()"> Secondary</label>
          <button class="rm" onclick="this.closest('.inv-weapon-wrap').remove();save()" title="Remove weapon">×</button>
        </div>
      </div>
      <div class="weapon-fields">
        <div class="wfield"><span class="ey">Name</span><input type="text" placeholder="Weapon name..." value="${escHtml(n)}" oninput="save()"></div>
        <div class="wfield"><span class="ey">Trait & Range</span><input type="text" placeholder="Agility Melee" value="${escHtml(t)}" oninput="save()"></div>
        <div class="wfield"><span class="ey">Damage & Type</span><input type="text" placeholder="d8+1 phy" value="${escHtml(d)}" oninput="save()"></div>
      </div>
      <div class="wfield"><span class="ey">Feature</span><input type="text" placeholder="One-Handed, Paired..." value="${escHtml(f)}" oninput="save()"></div>
    </div>`;
  container.appendChild(wrap);
}

function buildPages(cls) {
  const c = CLASSES[cls];
  const pages = document.getElementById('pages');
  pages.innerHTML = '';

  // ── PAGE 1: STAT SHEET ──
  const p1 = document.createElement('div');
  p1.className = 'page';
  p1.innerHTML = `
    <div class="class-header">
      <div class="class-name-block">
        <div class="class-name-big">${cls.toUpperCase()}</div>
        <div class="class-domains">${c.domains}</div>
        <button onclick="showChangeClassModal()" style="margin-top:8px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.08em;background:none;border:1px solid var(--border2);color:var(--muted);padding:3px 8px;border-radius:3px;cursor:pointer;width:100%;">↺ Change Class</button>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start;">
      <div class="portrait-slot" onclick="document.getElementById('portrait-upload').click()" title="Click to upload portrait">
        <img id="portrait-img" src="" style="display:none;">
        <div class="portrait-placeholder" id="portrait-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          PORTRAIT
        </div>
        <button class="portrait-remove" onclick="event.stopPropagation();removePortrait()" title="Remove">×</button>
      </div>
      <input type="file" id="portrait-upload" accept="image/*" style="display:none" onchange="uploadPortrait(this)">
      <div class="char-fields">
        <div class="char-fields-row1">
          <div><span class="ey">Name</span><input type="text" id="f-name" placeholder="Character name..." oninput="save()"></div>
          <div><span class="ey">Pronouns</span><input type="text" id="f-pronouns" placeholder="they/them..." oninput="save()"></div>
        </div>
        <div class="char-fields-row2">
          <div>
            <span class="ey">Heritage</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <select id="f-community" class="hdr-select" onchange="onHeritageChange();save()">
                <option value="">Community...</option>
                ${Object.keys(COMMUNITY_DATA).map(a=>`<option value="${a}">${a}</option>`).join('')}
              </select>
              <select id="f-ancestry" class="hdr-select" onchange="onHeritageChange();save()">
                <option value="">Ancestry...</option>
                ${Object.keys(ANCESTRY_DATA).map(a=>`<option value="${a}">${a}</option>`).join('')}
              </select>
              <div id="mixed-ancestry-pickers" style="display:none;margin-top:4px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;padding:6px 8px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
                  <div>
                    <select id="f-mixed-a1" style="width:100%;font-family:'Cinzel',serif;font-size:10px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:3px 6px;border-radius:3px;outline:none;" onchange="onMixedAncestryChange();save()">
                      <option value="">1st feature from...</option>
                    </select>
                  </div>
                  <div>
                    <select id="f-mixed-a2" style="width:100%;font-family:'Cinzel',serif;font-size:10px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:3px 6px;border-radius:3px;outline:none;" onchange="onMixedAncestryChange();save()">
                      <option value="">2nd feature from...</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span class="ey">Subclass</span>
            <select id="f-subclass" class="hdr-select" onchange="onSubclassChange();save()">
              <option value="">Pick subclass...</option>
              ${(SUBCLASSES[cls]?.subclasses||[]).map(s=>`<option value="${s.name}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="char-level-field"><span class="ey">Level</span><input type="number" id="f-level" min="1" max="10" placeholder="1" oninput="save()"></div>
        </div>
      </div>
      </div><!-- /portrait+fields row -->
    </div>
    <div class="page-inner">

      <!-- HERITAGE + SUBCLASS FEATURE BAR -->
      <div id="feature-bar" style="display:none;margin-bottom:0.75rem;gap:0.5rem;"></div>

      <!-- TRAITS ROW -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-family:'Cinzel',serif;font-size:11px;color:var(--muted);letter-spacing:0.08em;">TRAITS</span>
        <span class="hint-text suggested-traits-line" style="font-family:'Crimson Pro',serif;font-size:12px;color:var(--muted);">Suggested: ${c.suggestedTraits.replace(/\n/g,' · ')}</span>
      </div>
      <div class="traits-row" style="margin-bottom:0;">
        ${['agility','strength','finesse','instinct','presence','knowledge'].map(t=>`
        <div class="trait-block">
          <div class="trait-name">${t.toUpperCase()}</div>
          <input type="number" class="trait-score" id="t-${t}" value="" oninput="save()">
          <div class="trait-actions">${{agility:'Sprint\nLeap\nManeuver',strength:'Lift\nSmash\nGrapple',finesse:'Control\nHide\nTinker',instinct:'Perceive\nSense\nNavigate',presence:'Charm\nPerform\nDeceive',knowledge:'Recall\nAnalyze\nComprehend'}[t].split('\n').join('<br>')}</div>
        </div>`).join('')}
      </div>

      <!-- CHARACTER DESCRIPTION -->
      <div style="margin-top:0.75rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span class="ey">Description</span>
          <span class="hint-text" style="font-family:'Crimson Pro',serif;font-size:11px;color:var(--muted);">${c.descOptions.clothes && `Clothes: ${c.descOptions.clothes}`}</span>
        </div>
        <div class="hint-text" style="font-family:'Crimson Pro',serif;font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:6px;">
          <span>${c.descOptions.eyes ? `Eyes like ${c.descOptions.eyes} · ` : ''}${c.descOptions.body ? `Body: ${c.descOptions.body} · ` : ''}${c.descOptions.skin ? `Skin: ${c.descOptions.skin} · ` : ''}${c.descOptions.attitude ? `Attitude like ${c.descOptions.attitude}` : ''}</span>
        </div>
        <textarea id="appearance" rows="2" placeholder="Describe your character's appearance..." oninput="save()" style="resize:none;font-size:13px;"></textarea>
      </div>

    </div>

    <div class="page-inner" style="padding-top:0.75rem;">
      <div class="p1-grid">

        <!-- LEFT COLUMN -->
        <div class="p1-left">

          <div>
            <div style="display:flex;gap:8px;margin-bottom:0.75rem;">
              <div style="flex:1;">
                ${sh("Evasion","Your Evasion is the Difficulty enemies must beat to hit you. Higher evasion = harder to hit. It starts at your class default and can be modified by subclass, armor, and features.")}
                <div style="text-align:center;">
                  <input type="number" id="f-evasion" value="${c.evasionStart}" oninput="save()" style="width:60px;text-align:center;font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:var(--gold);background:transparent;border:none;border-bottom:1px solid var(--border2);outline:none;">
                  <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);margin-top:2px;">Start at ${c.evasionStart}</div>
                </div>
              </div>
              <div style="flex:2;">
                ${sh("Armor Slots","When you take damage, you can mark an Armor Slot to reduce the severity by one threshold — turning Severe into Major, for example. All slots clear on a rest. Your armor score determines how many you have.")}
                <div class="shields-wrap" id="armor-pips"></div>
              </div>
            </div>
          </div>

          <div>
            ${sh("Damage & Health","Damage is compared to three thresholds. Below Minor = nothing. Minor = mark 1 HP. Major = mark 2 HP. Severe = mark 3 HP. Add your level to all thresholds. When you mark your last HP you make a Death Move.")}
            <p style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);text-align:center;margin-bottom:6px;">Add your current level to your damage thresholds.</p>
            <div class="thresh-row">
              <div class="thresh-box"><div class="thresh-label">Minor</div><input type="number" class="thresh-num" id="thresh-minor" placeholder="—" oninput="save()"><div class="thresh-mark">1 HP</div></div>
              <div class="thresh-box"><div class="thresh-label">Major</div><input type="number" class="thresh-num" id="thresh-major" placeholder="—" oninput="save()"><div class="thresh-mark">2 HP</div></div>
              <div class="thresh-box"><div class="thresh-label">Severe</div><input type="number" class="thresh-num" id="thresh-severe" placeholder="—" oninput="save()"><div class="thresh-mark">3 HP</div></div>
            </div>
            <div class="hp-stress-area">
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                  <span class="ey" style="margin:0;">HP</span>
                  <button onclick="adjustBoxCount('hp-boxes','hpbox',-1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">−</button>
                  <button onclick="adjustBoxCount('hp-boxes','hpbox',1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">+</button>
                </div>
                <div class="checkbox-row" id="hp-boxes"></div>
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                  <span class="ey" style="margin:0;">Stress</span>
                  <button onclick="adjustBoxCount('stress-boxes','stressbox',-1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">−</button>
                  <button onclick="adjustBoxCount('stress-boxes','stressbox',1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">+</button>
                </div>
                <div class="checkbox-row" id="stress-boxes"></div>
              </div>
            </div>
            <div id="heritage-hp-tip" style="display:none;margin-top:6px;font-family:'Crimson Pro',serif;font-size:11px;color:var(--gold);background:var(--gold-faint);border:1px solid var(--gold-dim);border-radius:4px;padding:4px 8px;line-height:1.5;"></div>
          </div>

          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              ${sh("Hope","Hope is your primary resource. Gain Hope when your Hope Die is higher on a roll. Spend it to use Experiences, activate class abilities, and help allies. Max 6 by default.")}
              <button onclick="adjustHopeCount(-1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">−</button>
              <button onclick="adjustHopeCount(1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">+</button>
            </div>
            <p style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:4px;font-style:italic;">Spend a Hope to use an experience or help an ally.</p>
            <div class="hope-pips" id="hope-pips"></div>
            <div style="padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;margin-top:6px;font-size:12px;line-height:1.5;">
              <strong style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);">${c.featureName.split(' ')[0]}:</strong> ${c.featureHope}
            </div>
          </div>

          <div>
            ${sh("Experience","Experiences are specific things your character excels at — like Navigating Ruins +2. Spend a Hope to add an applicable Experience bonus to any action roll.")}
            <p style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:6px;">Spend a Hope to add an applicable Experience to a roll.</p>
            <div id="exp-list"></div>
            <button class="add-row-btn" onclick="addExpRow(document.getElementById('exp-list'));save()">+ Add Experience</button>
          </div>

          <div>
            ${sh("Gold","Currency in Daggerheart. Handfuls are small change. Bags are moderate wealth. A Chest is significant treasure. 10 Handfuls = 1 Bag. 10 Bags = 1 Chest.")}
            <div class="gold-row">
              <div class="gold-box"><span class="ey">Handfuls</span><input type="number" id="gold-h" min="0" placeholder="0" oninput="save()"></div>
              <div class="gold-box"><span class="ey">Bags</span><input type="number" id="gold-b" min="0" placeholder="0" oninput="save()"></div>
              <div class="gold-box"><span class="ey">Chest</span><input type="number" id="gold-c" min="0" placeholder="0" oninput="save()"></div>
            </div>
          </div>

          <div>
            ${sh("Class Feature","Your defining class ability. This is what makes your class unique. Some features are passive, others require spending Hope or marking Stress to activate.")}
            <div class="cf-name">${c.featureName}</div>
            <div class="cf-body" id="cf-body">${c.featureBody.replace(/\n/g,'<br>')}</div>
          </div>



          ${cls === 'Seraph' ? `
          <div>
            ${sh("Prayer Dice","Seraph only. Roll d4s equal to your Spellcast trait at session start. Spend any number to aid yourself or an ally within Far range — reduce damage, add to a roll, or gain Hope equal to the result.")}
            <p style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:6px;">Roll d4s equal to your Spellcast trait at session start.</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">
              <button onclick="addPrayerDie()" style="font-family:'Cinzel',serif;font-size:8px;padding:2px 8px;border-radius:3px;border:1px solid var(--gold-dim);background:var(--gold-faint);color:var(--gold);cursor:pointer;">+ Add</button>
              <button onclick="clearPrayerDice()" style="font-family:'Cinzel',serif;font-size:8px;padding:2px 8px;border-radius:3px;border:1px solid var(--border2);background:none;color:var(--muted);cursor:pointer;">Clear All</button>
            </div>
            <div id="prayer-dice-row" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
          </div>` : ''}

        </div>

        <!-- MIDDLE COLUMN -->
        <div class="p1-mid">

          <div>
            ${sh("Active Weapons","Your currently equipped weapons. Each weapon uses a specific trait for attack rolls and has a damage type (physical or magic). Proficiency adds to your damage rolls.")}
            <div style="text-align:center;margin-bottom:8px;">
              <span class="ey" style="display:inline;">Proficiency</span>
              <div class="prof-row" id="prof-dots"></div>
            </div>

            <div class="weapon-section" style="margin-bottom:6px;">
              <div class="weapon-label">Primary Weapon</div>
              <div class="weapon-fields" style="grid-template-columns:2fr 1.2fr 1.2fr;gap:4px;margin-bottom:4px;">
                <div class="wfield"><span class="ey">Name</span><input type="text" id="w1-name" data-hint="${wPart(c.suggestedPrimary,0)}" placeholder="${wPart(c.suggestedPrimary,0)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Trait / Range</span><input type="text" id="w1-trait" data-hint="${wPart(c.suggestedPrimary,1)}" placeholder="${wPart(c.suggestedPrimary,1)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Damage</span><input type="text" id="w1-damage" data-hint="${wPart(c.suggestedPrimary,2)}" placeholder="${wPart(c.suggestedPrimary,2)}" oninput="save()"></div>
              </div>
              <div class="wfield"><span class="ey">Feature</span><input type="text" id="w1-feature" data-hint="${wFeature(c.suggestedPrimary)}" placeholder="${wFeature(c.suggestedPrimary)}" oninput="save()"></div>
            </div>

            <div class="weapon-section" style="margin-bottom:6px;">
              <div class="weapon-label">Secondary Weapon</div>
              <div class="weapon-fields" style="grid-template-columns:2fr 1.2fr 1.2fr;gap:4px;margin-bottom:4px;">
                <div class="wfield"><span class="ey">Name</span><input type="text" id="w2-name" data-hint="${wPart(c.suggestedSecondary,0)}" placeholder="${wPart(c.suggestedSecondary,0)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Trait / Range</span><input type="text" id="w2-trait" data-hint="${wPart(c.suggestedSecondary,1)}" placeholder="${wPart(c.suggestedSecondary,1)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Damage</span><input type="text" id="w2-damage" data-hint="${wPart(c.suggestedSecondary,2)}" placeholder="${wPart(c.suggestedSecondary,2)}" oninput="save()"></div>
              </div>
              <div class="wfield"><span class="ey">Feature</span><input type="text" id="w2-feature" data-hint="${wFeature(c.suggestedSecondary)}" placeholder="${wFeature(c.suggestedSecondary)}" oninput="save()"></div>
            </div>

            ${sh("Active Armor","Your currently equipped armor. Base Thresholds are the damage breakpoints before adding your level. Base Score is how many Armor Slots you have. Some armor has features like −1 Evasion.")}
            <div class="weapon-section">
              <div class="weapon-fields" style="grid-template-columns:2fr 1fr 1fr;">
                <div class="wfield"><span class="ey">Name</span><input type="text" id="armor-name" data-hint="${wPart(c.suggestedArmor,0)}" placeholder="${wPart(c.suggestedArmor,0)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Base Thresholds</span><input type="text" id="armor-thresh" data-hint="${wPart(c.suggestedArmor,1)}" placeholder="${wPart(c.suggestedArmor,1)}" oninput="save()"></div>
                <div class="wfield"><span class="ey">Base Score</span><input type="text" id="armor-score" data-hint="${wPart(c.suggestedArmor,2)}" placeholder="${wPart(c.suggestedArmor,2)}" oninput="save()"></div>
              </div>
              <div class="wfield" style="margin-top:4px;"><span class="ey">Feature</span><input type="text" id="armor-feature" data-hint="${wFeature(c.suggestedArmor)}" placeholder="${wFeature(c.suggestedArmor)}" oninput="save()"></div>
            </div>

            ${sh("Inventory","Items you're carrying. Track general gear, spare weapons, and spare armor here. Talk to your GM about what you can reasonably carry.")}
            <div id="inv-list" style="margin-bottom:4px;"></div>
            <button class="add-row-btn" onclick="addInvRow(document.getElementById('inv-list'));save()">+ Add Item</button>
            <div style="margin-top:8px;" id="inv-armor-wrap"></div>
            <button class="add-row-btn" onclick="addInvArmor(document.getElementById('inv-armor-wrap'));save()" style="margin-top:4px;">+ Add Inventory Armor</button>
            <div style="margin-top:8px;" id="inv-weapons-wrap"></div>
            <button class="add-row-btn" onclick="addInvWeapon(document.getElementById('inv-weapons-wrap'));save()" style="margin-top:4px;">+ Add Inventory Weapon</button>
          </div>

          ${cls === 'Ranger' ? `
          <div>
            ${sh("Companion","Ranger only. Your bonded animal companion. They act as an extension of you in the field — use their traits for attacks and manage their HP separately from yours.")}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
              <div><span class="ey">Name</span><input type="text" id="companion-name" placeholder="Companion name..." oninput="save()"></div>
              <div><span class="ey">Species</span><input type="text" id="companion-species" placeholder="Wolf, Hawk..." oninput="save()"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px;">
              <div><span class="ey">Evasion</span><input type="number" id="companion-evasion" placeholder="10" oninput="save()"></div>
              <div><span class="ey">Damage</span><input type="text" id="companion-damage" placeholder="d6 phy" oninput="save()"></div>
              <div><span class="ey">Trait</span><input type="text" id="companion-trait" placeholder="Agility" oninput="save()"></div>
            </div>
            <div style="margin-bottom:6px;">
              <span class="ey">Companion HP</span>
              <div style="display:flex;align-items:center;gap:5px;margin-top:3px;">
                <button onclick="adjustBoxCount('companion-hp','companion-hpbox',-1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">−</button>
                <div class="checkbox-row" id="companion-hp" style="flex-wrap:wrap;"></div>
                <button onclick="adjustBoxCount('companion-hp','companion-hpbox',1)" style="font-family:'Cinzel',serif;font-size:9px;width:16px;height:16px;border-radius:3px;border:1px solid var(--border2);background:var(--bg3);color:var(--muted);cursor:pointer;line-height:1;padding:0;">+</button>
              </div>
            </div>
            <div><span class="ey">Features & Level-Up Options</span><textarea id="companion-features" rows="4" placeholder="Companion features, level-up choices..." oninput="save()" style="resize:none;"></textarea></div>
          </div>` : ''}

        </div>

        <!-- RIGHT COLUMN -->
        <div class="p1-right">

          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;background:var(--bg4);border-bottom:1px solid var(--border);">
              ${sh("Domain Cards","Your active spells and abilities. You can hold up to 5 in your loadout. Using a card may place it in your vault — mark Stress equal to its Recall Cost (shown top-right of the card) to bring it back into your loadout.")}
              <button onclick="showSheetTab('cards')" style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:3px 10px;border-radius:3px;cursor:pointer;white-space:nowrap;">Manage →</button>
            </div>
            <div id="loadout-quick" style="padding:0.5rem 0.75rem;"></div>
            <div id="loadout-quick-empty" style="padding:0.75rem;font-size:12px;color:var(--muted);font-style:italic;text-align:center;">No cards in loadout.<br>Go to Domain Cards tab to add.</div>
          </div>

          <div>
            ${sh("Miscellaneous","Free notes space. Use it for scars, ongoing effects, reminders, temporary conditions, debts, relationships — anything that doesn't fit elsewhere.")}
            <textarea id="misc-notes" rows="8" placeholder="Scars, conditions, special notes..." oninput="save()"></textarea>
          </div>

          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:0.85rem 1rem;text-align:center;">
            <div class="sh" style="margin-bottom:6px;">Session Notes</div>
            <p style="font-size:12px;color:var(--muted);font-style:italic;margin-bottom:8px;">Session notes & log live in the Session Notes tab.</p>
            <button onclick="showSheetTab('notes')" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:6px 16px;border-radius:4px;cursor:pointer;">Go to Session Notes →</button>
          </div>

        </div>

      </div>
    </div>
    `;
  pages.appendChild(p1);

  // ── PAGE 2: HISTORY → BACKGROUND QUESTIONS → GUIDE (collapsible) ──
  const p2 = document.createElement('div');
  p2.className = 'page';

  // Suggested questions removed — players use custom questions or Session 0

  p2.innerHTML = `

    <!-- ① HISTORY — OWN FULL SECTION AT TOP -->
    <div class="section-block">
      <div class="section-block-header">
        <div class="section-block-title">Character Background</div>
      </div>
      <div class="page-inner" style="padding-top:0.75rem;">
        <div id="history-empty" style="font-size:13px;color:var(--muted);font-style:italic;text-align:center;padding:1.5rem 0;">No background entries yet — answer questions below and submit them.</div>
        <div id="history-list"></div>
      </div>
    </div>

    <!-- ② BACKGROUND QUESTIONS — COLLAPSIBLE -->
    <div class="section-block" style="border-top:1px solid var(--border2);">
      <div class="section-block-header" style="cursor:pointer;user-select:none;" onclick="toggleBgq()">
        <div class="section-block-title">Background Questions</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="event.stopPropagation();submitAllBgq()" class="hdr-btn gold-btn">Submit All Answered ↑</button>
          <div id="bgq-toggle-btn" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;color:var(--muted);white-space:nowrap;">▼ EXPAND</div>
        </div>
      </div>
      <div id="bgq-body" style="display:none;">
        <div class="page-inner" style="padding-top:0.75rem;">
          <p style="font-size:13px;color:var(--muted);font-style:italic;margin-bottom:1rem;">Write your own background questions and answers, or use Session 0 to generate them with your party.</p>
          <div id="custom-bgq-list"></div>
          <button class="add-row-btn" onclick="addCustomBgq();save()">+ Add Question</button>
        </div>
      </div>
    </div>

    <!-- ③ CHARACTER GUIDE — COLLAPSIBLE, BELOW -->
    <div class="section-block" style="border-top:1px solid var(--border2);">
      <div class="section-block-header" style="cursor:pointer;user-select:none;" onclick="toggleGuide()">
        <div>
          <div class="section-block-title">${cls} — Character Guide</div>
          <div style="font-size:11px;color:var(--muted);font-style:italic;margin-top:2px;">${c.tagline}</div>
        </div>
        <div id="guide-toggle-btn" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;color:var(--muted);white-space:nowrap;">▼ EXPAND</div>
      </div>
      <div id="guide-body" style="display:none;">
        <div class="page-inner" style="padding-top:0.75rem;">
          <div class="p2-grid">
            <div class="p2-left">
              <div class="hint-text"><div class="sh">Suggested Traits</div><p style="font-size:13px;line-height:1.7;">${c.suggestedTraits.replace(/\n/g,'<br>')}</p></div>
              <div class="hint-text"><div class="sh">Suggested Primary Weapon</div><p style="font-size:13px;line-height:1.7;">${c.suggestedPrimary.replace(/\n/g,'<br>')}</p></div>
              ${c.suggestedSecondary?`<div class="hint-text"><div class="sh">Suggested Secondary Weapon</div><p style="font-size:13px;line-height:1.7;">${c.suggestedSecondary.replace(/\n/g,'<br>')}</p></div>`:''}
              <div class="hint-text"><div class="sh">Suggested Armor</div><p style="font-size:13px;line-height:1.7;">${c.suggestedArmor.replace(/\n/g,'<br>')}</p></div>
              <div><div class="sh">Starting Inventory</div><p style="font-size:12px;line-height:1.8;">${c.startingInventory.replace(/\n/g,'<br>')}</p></div>

            </div>
            <div class="p2-mid" style="grid-column:span 2;">
              <div class="tier-box"><div class="tier-header">Tier 2: Levels 2–4</div><div class="tier-intro">At level 2, gain an additional Experience at +2 and gain a +1 bonus to your Proficiency.</div><p style="font-size:10px;font-family:'Cinzel',serif;color:var(--muted);margin-bottom:6px;">Choose two options and mark them.</p>${tierOptions(2)}</div>
              <div class="tier-box"><div class="tier-header">Tier 3: Levels 5–7</div><div class="tier-intro">At level 5, gain an additional Experience at +2 and clear all marks on character traits. Then gain a +1 bonus to your Proficiency.</div><p style="font-size:10px;font-family:'Cinzel',serif;color:var(--muted);margin-bottom:6px;">Choose two options from the list below or any from the previous tier and mark them.</p>${tierOptions(3)}</div>
              <div class="tier-box"><div class="tier-header">Tier 4: Levels 8–10</div><div class="tier-intro">At level 8, gain an additional Experience at +2 and clear all marks on character traits. Then gain a +1 bonus to your Proficiency.</div><p style="font-size:10px;font-family:'Cinzel',serif;color:var(--muted);margin-bottom:6px;">Choose two options from the list below or any from the previous tier and mark them.</p>${tierOptions(4)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  pages.appendChild(p2);

  // Now wire up dynamic elements
  makeBoxPips(document.getElementById('hp-boxes'), 5, 0, 'hpbox');
  makeBoxPips(document.getElementById('stress-boxes'), 6, 0, 'stressbox');
  makeShieldPips(document.getElementById('armor-pips'), 12, 0);
  renderHopePips(document.getElementById('hope-pips'), 6, 0);
  renderCompanionHp();
  makeProfDots(document.getElementById('prof-dots'), 1);
  addExpRow(document.getElementById('exp-list'));
  addExpRow(document.getElementById('exp-list'));
  addInvRow(document.getElementById('inv-list'));
}

// ─────────────────────────────────────────────
// DOMAIN CARD DATA
// ─────────────────────────────────────────────

function renderAncestryRef() {
  const grid = document.getElementById('ancestry-ref-grid');
  if (!grid || grid.children.length) return; // already rendered
  Object.entries(ANCESTRY_DATA).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--teal);border-radius:0 5px 5px 0;padding:10px 12px;';
    card.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;">${name}</div>
      <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:8px;line-height:1.5;">${data.description}</div>
      ${data.features.map(f=>`<div style="margin-bottom:5px;"><strong style="font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:0.06em;color:var(--teal);">${f.name}:</strong> <span style="font-size:12.5px;line-height:1.6;">${f.text}</span></div>`).join('')}`;
    grid.appendChild(card);
  });
}

function renderCommunityRef() {
  const grid = document.getElementById('community-ref-grid');
  if (!grid || grid.children.length) return;
  Object.entries(COMMUNITY_DATA).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--gold-dim);border-radius:0 5px 5px 0;padding:10px 12px;';
    card.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;">${name}</div>
      <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:8px;line-height:1.5;">${data.description}</div>
      ${data.features.map(f=>`<div style="margin-bottom:5px;"><strong style="font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:0.06em;color:var(--gold);">${f.name}:</strong> <span style="font-size:12.5px;line-height:1.6;">${f.text}</span></div>`).join('')}`;
    grid.appendChild(card);
  });
}

function renderClassRef() {
  const cls = document.getElementById('ref-class-picker')?.value;
  const container = document.getElementById('class-ref-content');
  if (!container) return;
  if (!cls || !SUBCLASSES[cls]) {
    container.innerHTML = '<p style="font-size:13px;color:var(--muted);font-style:italic;text-align:center;padding:1.5rem 0;">Select a class above to view its subclasses and reference info.</p>';
    return;
  }
  const data = SUBCLASSES[cls];
  const classData = CLASSES[cls];
  let html = '';

  // Class overview strip
  html += `<div style="margin-bottom:1.25rem;">
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;color:var(--gold);margin-bottom:4px;">${classData?.domains || ''}</div>
    <p style="font-size:13px;color:var(--muted);font-style:italic;line-height:1.6;">${data.tagline}</p>
  </div>`;

  // Class Feature
  if (classData) {
    html += `<div class="ref-section-hdr">Class Feature</div>
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px 14px;margin-bottom:1.25rem;">
      <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px;">${classData.featureName}</div>
      <div style="font-size:13px;line-height:1.65;">${classData.featureBody.replace(/\n/g,'<br>')}</div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:13px;line-height:1.6;color:var(--text);">${classData.featureHope}</div>
    </div>`;
  }

  // Subclasses
  html += `<div class="ref-section-hdr">Subclasses</div>`;
  data.subclasses.forEach(sub => {
    html += `<div class="subclass-card">
      <div class="subclass-header">
        <span class="subclass-class-tag">${cls}</span>
        <span class="subclass-name">${sub.name}</span>
        ${sub.spellcast ? `<span class="subclass-spellcast">Spellcast: ${sub.spellcast}</span>` : ''}
      </div>
      <div class="subclass-body">
        <div class="subclass-tier">
          <div class="subclass-tier-label foundation">Foundation — Character Creation</div>
          <div class="subclass-tier-text">${sub.foundation.replace(/\n/g,'<br>')}</div>
        </div>
        <div class="subclass-tier">
          <div class="subclass-tier-label specialization">Specialization — Level 5</div>
          <div class="subclass-tier-text">${sub.specialization.replace(/\n/g,'<br>')}</div>
        </div>
        <div class="subclass-tier">
          <div class="subclass-tier-label mastery">Mastery — Level 8</div>
          <div class="subclass-tier-text">${sub.mastery.replace(/\n/g,'<br>')}</div>
        </div>
      </div>
    </div>`;
  });

  // Beastforms for Druid
  if (data.beastforms) {
    html += `<div class="ref-section-hdr" style="margin-top:1.25rem;">Beastform List</div>`;
    [1,2,3,4].forEach(tier => {
      const forms = data.beastforms.filter(b => b.tier === tier);
      if (!forms.length) return;
      html += `<div style="font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:0.12em;color:var(--muted);margin:0.75rem 0 0.5rem;">Tier ${tier}</div>
      <div class="beastform-grid">`;
      forms.forEach(b => {
        html += `<div class="beastform-card">
          <div class="beastform-tier-badge">Tier ${b.tier}</div>
          <div class="beastform-name">${b.name}</div>
          <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:4px;">(${b.examples})</div>
          <div class="beastform-stats">${b.stats}</div>
          <div class="beastform-text">${b.text.replace(/\n/g,'<br>')}</div>
        </div>`;
      });
      html += `</div>`;
    });
  }

  container.innerHTML = html;
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// SESSION 0 WIZARD
// ─────────────────────────────────────────────

function sh(title, tip) {
  if (!tip) return `<div class="sh">${title}</div>`;
  const id = 'tip-' + title.replace(/\s+/g,'-').toLowerCase().replace(/[^a-z0-9-]/g,'') + '-' + Math.random().toString(36).slice(2,5);
  return `<div class="tip-wrap"><div class="sh">${title}</div><button class="tip-btn" onclick="event.stopPropagation();toggleTip(this)" title="What is this?">?</button><div class="tip-popover"><strong>${title}</strong>${tip}</div></div>`;
}

function toggleTip(btn) {
  const pop = btn.nextElementSibling;
  if (!pop) return;
  const isOpen = pop.classList.contains('open');
  // Close all other popovers
  document.querySelectorAll('.tip-popover.open').forEach(p => p.classList.remove('open'));
  if (!isOpen) pop.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.tip-wrap')) {
    document.querySelectorAll('.tip-popover.open').forEach(p => p.classList.remove('open'));
  }
});

function onConditionChange(checkbox) {
  if (label) label.classList.toggle('cond-label-active', checkbox.checked);
  save();
}



// ─────────────────────────────────────────────
// PRAYER DICE (SERAPH)
// ─────────────────────────────────────────────
function addPrayerDie(value) {
  const row = document.getElementById('prayer-dice-row');
  if (!row) return;
  const die = document.createElement('div');
  die.className = 'prayer-die' + (value === 'spent' ? ' spent' : '');
  die.innerHTML = `<span class="prayer-die-val">${(typeof value === 'number') ? value : 'd4'}</span><div class="prayer-die-rm" onclick="this.closest('.prayer-die').remove();save()">×</div>`;
  die.addEventListener('click', e => {
    if (e.target.classList.contains('prayer-die-rm')) return;
    die.classList.toggle('spent');
    save();
  });
  row.appendChild(die);
  save();
}

function clearPrayerDice() {
  const row = document.getElementById('prayer-dice-row');
  if (row) row.innerHTML = '';
  save();
}

// ─────────────────────────────────────────────
// DOWNTIME MOVES
// ─────────────────────────────────────────────
function clearDowntime() {
  document.querySelectorAll('.downtime-check').forEach(c => c.checked = false);
  save();
}

// ─────────────────────────────────────────────
// COUNTDOWN TRACKERS
// ─────────────────────────────────────────────
function addCountdown(label='', total=8, marked=0) {
  const list = document.getElementById('countdown-list');
  if (!list) return;
  const id = 'cd-' + Date.now();
  const row = document.createElement('div');
  row.className = 'countdown-row';
  row.id = id;
  row.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <input type="text" placeholder="Effect name..." value="${escHtml(label)}" oninput="save()" style="flex:1;font-size:12px;">
      <input type="number" min="1" max="20" value="${total}" oninput="rebuildCdPips(this);save()" style="width:42px;font-size:12px;text-align:center;" title="Total ticks">
      <button onclick="this.closest('.countdown-row').remove();save()" style="font-family:'Cinzel',serif;font-size:9px;width:18px;height:18px;border-radius:3px;border:1px solid var(--border2);background:none;color:var(--muted);cursor:pointer;padding:0;line-height:1;">×</button>
    </div>
    <div class="countdown-pips"></div>`;
  list.appendChild(row);
  buildCdPips(row.querySelector('.countdown-pips'), total, marked);
  save();
}

function buildCdPips(container, total, marked) {
  container.innerHTML = '';
  for (let i=0;i<total;i++) {
    const pip = document.createElement('div');
    pip.className = 'cd-pip' + (i < marked ? ' marked' : '');
    pip.addEventListener('click', () => { pip.classList.toggle('marked'); save(); });
    container.appendChild(pip);
  }
}

function rebuildCdPips(input) {
  const row = input.closest('.countdown-row');
  const pips = row.querySelector('.countdown-pips');
  const marked = pips.querySelectorAll('.cd-pip.marked').length;
  buildCdPips(pips, parseInt(input.value)||8, Math.min(marked, parseInt(input.value)||8));
}

function saveCountdowns() {
  return [...document.querySelectorAll('.countdown-row')].map(row => ({
    label: row.querySelector('input[type="text"]')?.value || '',
    total: parseInt(row.querySelector('input[type="number"]')?.value) || 8,
    marked: row.querySelectorAll('.cd-pip.marked').length,
  }));
}

function restoreCountdowns(arr) {
  if (!arr) return;
  arr.forEach(({label, total, marked}) => addCountdown(label, total, marked));
}

function saveDowntime() {
  return [...document.querySelectorAll('.downtime-check')].map(c => c.checked);
}

function restoreDowntime(arr) {
  if (!arr) return;
  const checks = document.querySelectorAll('.downtime-check');
  arr.forEach((val, i) => { if (checks[i]) checks[i].checked = val; });
}

function savePrayerDice() {
  const row = document.getElementById('prayer-dice-row');
  if (!row) return null;
  return [...row.querySelectorAll('.prayer-die')].map(d => ({
    spent: d.classList.contains('spent'),
  }));
}

function restorePrayerDice(arr) {
  if (!arr) return;
  arr.forEach(({spent}) => addPrayerDie(spent ? 'spent' : 'd4'));
}

function saveCompanion() {
  const fields = ['companion-name','companion-species','companion-evasion','companion-damage','companion-trait','companion-features'];
  const d = {};
  fields.forEach(id => { const el=document.getElementById(id); if(el) d[id]=el.value; });
  d.companionHp = document.querySelectorAll('#companion-hp .companion-hpbox.filled').length;
  d.companionHpTotal = document.querySelectorAll('#companion-hp .companion-hpbox').length;
  return d;
}

function restoreCompanion(d) {
  if (!d) return;
  const fields = ['companion-name','companion-species','companion-evasion','companion-damage','companion-trait','companion-features'];
  fields.forEach(id => { const el=document.getElementById(id); if(el && d[id]) el.value=d[id]; });
  if (d.companionHp != null) {
    makeBoxPips(document.getElementById('companion-hp'), d.companionHpTotal||4, d.companionHp, 'companion-hpbox');
  }
}

function renderCompanionHp() {
  const el = document.getElementById('companion-hp');
  if (el && !el.children.length) makeBoxPips(el, 4, 0, 'companion-hpbox');
}

function showSheetTab(tab) {
  document.getElementById('tab-sheet').style.display = tab === 'sheet' ? '' : 'none';
  document.getElementById('tab-notes').style.display = tab === 'notes' ? '' : 'none';
  document.getElementById('tab-cards').style.display = tab === 'cards' ? '' : 'none';
  document.getElementById('tab-ref').style.display = tab === 'ref' ? '' : 'none';
  document.getElementById('tab-s0').style.display = tab === 's0' ? '' : 'none';
  // Tab bar buttons (removed from DOM, guard against null)
  ['sheet','notes','cards','ref'].forEach(t => {
    const btn = document.getElementById('tab-' + t + '-btn');
    if (btn) btn.classList.toggle('active', t === tab);
  });
  // Left nav items
  ['sheet','notes','cards','ref'].forEach(t => {
    const el = document.getElementById('nav-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  localStorage.setItem('dh2-active-tab', tab);
  // Show class picker only on character sheet tab
  const classSection = document.getElementById('nav-class-section');
  const classDivider = document.getElementById('nav-class-divider');
  if (classSection) classSection.style.display = tab === 'sheet' ? '' : 'none';
  if (classDivider) classDivider.style.display = tab === 'sheet' ? '' : 'none';
  if (tab === 'cards') {
    const domainFilter = document.getElementById('cards-filter-domain');
    if (domainFilter && domainFilter.value === '' && currentClass) domainFilter.value = '__class__';
    renderLoadout();
    renderCardBrowser();
  }
  if (tab === 'sheet') { renderLoadoutQuick(); }
  if (tab === 'ref') {
    const picker = document.getElementById('ref-class-picker');
    if (picker && !picker.value && currentClass) { picker.value = currentClass; renderClassRef(); }
    renderAncestryRef();
    renderCommunityRef();
  }

}

function addManualSessionEntry() {
  const text = prompt('Add a session log entry:');
  if (!text || !text.trim()) return;
  const ts = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  appendSessionEntry(text.trim(), ts);
  save();
}

function submitSingleQ(id, question) {
  const el = document.getElementById(id);
  const answer = el ? el.value.trim() : '';
  if (!answer) { el && el.focus(); return; }
  const ts = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  appendHistoryEntry(`${question}\n${answer}`, ts);
  save();
}

function toggleBgq() {
  const body = document.getElementById('bgq-body');
  const btn = document.getElementById('bgq-toggle-btn');
  if (!body) return;
  const collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  btn.textContent = collapsed ? '▲ COLLAPSE' : '▼ EXPAND';
}

function submitSessionNote() {
  const titleEl = document.getElementById('session-title');
  const notesEl = document.getElementById('session-notes');
  const text = notesEl ? notesEl.value.trim() : '';
  if (!text) { if (notesEl) notesEl.focus(); return; }
  const title = titleEl && titleEl.value.trim() ? titleEl.value.trim() : '';
  const ts = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  appendSessionEntry(text, ts, title);
  if (notesEl) { notesEl.value = ''; }
  if (titleEl) { titleEl.value = ''; }
  save();
}

function appendSessionEntry(text, ts, title) {
  const log = document.getElementById('session-log');
  const empty = document.getElementById('session-log-empty');
  if (!log) return;
  if (empty) empty.style.display = 'none';
  const id = 'se-' + Date.now() + '-' + Math.random().toString(36).slice(2,6);
  const entry = document.createElement('div');
  entry.className = 'session-entry';
  entry.dataset.text = text;
  entry.dataset.ts = ts || '';
  entry.dataset.title = title || '';
  entry.id = id;
  entry.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--teal);border-radius:0 5px 5px 0;padding:0;margin-bottom:10px;overflow:hidden;';
  entry.innerHTML = buildSessionEntryHTML(id, title, ts, text, false);
  log.insertBefore(entry, log.firstChild);
}

function buildSessionEntryHTML(id, title, ts, text, editing) {
  if (editing) {
    return `
      <div style="padding:10px 12px;border-bottom:1px solid var(--border);">
        <input type="text" value="${escHtml(title)}" placeholder="Session title..." id="edit-title-${id}"
          style="width:100%;font-family:'Cinzel',serif;font-size:12px;font-weight:600;background:var(--in);border:none;border-bottom:1px solid var(--border2);color:var(--text);padding:3px 0;outline:none;margin-bottom:6px;">
        <textarea id="edit-text-${id}" rows="6"
          style="width:100%;background:var(--in);border:1px solid var(--border2);border-radius:3px;color:var(--text);font-family:'Crimson Pro',serif;font-size:14px;padding:6px 8px;resize:vertical;outline:none;line-height:1.6;">${escHtml(text)}</textarea>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <button onclick="saveSessionEdit('${id}')" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:5px 14px;border-radius:3px;cursor:pointer;">Save</button>
          <button onclick="cancelSessionEdit('${id}')" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:none;border:1px solid var(--border2);color:var(--muted);padding:5px 14px;border-radius:3px;cursor:pointer;">Cancel</button>
        </div>
      </div>`;
  }
  return `
    <div style="padding:10px 12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;gap:8px;">
        <div>
          ${title ? `<div style="font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px;">${escHtml(title)}</div>` : ''}
          <span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;color:var(--teal);">Session — ${escHtml(ts||'')}</span>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button onclick="editSessionEntry('${id}')" style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.08em;background:none;border:1px solid var(--border2);color:var(--muted);padding:3px 9px;border-radius:3px;cursor:pointer;">Edit</button>
          <button class="rm" onclick="removeSessionEntry('${id}')" title="Delete" style="font-size:14px;">×</button>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.7;white-space:pre-wrap;color:var(--text);">${escHtml(text)}</div>
    </div>`;
}

function editSessionEntry(id) {
  const entry = document.getElementById(id);
  if (!entry) return;
  entry.innerHTML = buildSessionEntryHTML(id, entry.dataset.title||'', entry.dataset.ts||'', entry.dataset.text||'', true);
  // focus the title
  const t = document.getElementById('edit-title-'+id);
  if (t) t.focus();
}

function saveSessionEdit(id) {
  const entry = document.getElementById(id);
  if (!entry) return;
  const newTitle = (document.getElementById('edit-title-'+id)||{}).value||'';
  const newText = (document.getElementById('edit-text-'+id)||{}).value||'';
  entry.dataset.title = newTitle;
  entry.dataset.text = newText;
  entry.innerHTML = buildSessionEntryHTML(id, newTitle, entry.dataset.ts||'', newText, false);
  save();
}

function cancelSessionEdit(id) {
  const entry = document.getElementById(id);
  if (!entry) return;
  entry.innerHTML = buildSessionEntryHTML(id, entry.dataset.title||'', entry.dataset.ts||'', entry.dataset.text||'', false);
}

function removeSessionEntry(id) {
  const entry = document.getElementById(id);
  if (entry) entry.remove();
  const log = document.getElementById('session-log');
  const empty = document.getElementById('session-log-empty');
  if (log && empty && !log.children.length) empty.style.display = '';
  save();
}

function toggleGuide() {
  const body = document.getElementById('guide-body');
  const btn = document.getElementById('guide-toggle-btn');
  if (!body) return;
  const collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  btn.textContent = collapsed ? '▲ COLLAPSE' : '▼ EXPAND';
}

function addCustomBgq(q='', a='') {
  const container = document.getElementById('custom-bgq-list');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'custom-bgq-row';
  row.style.cssText = 'margin-bottom:10px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:8px 10px;';
  row.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:5px;align-items:center;">
      <input type="text" placeholder="Question..." value="${escHtml(q)}" oninput="save()" style="flex:1;font-style:italic;">
      <button class="rm" onclick="this.closest('.custom-bgq-row').remove();save()" title="Remove">×</button>
    </div>
    <textarea placeholder="Your answer..." oninput="save()" rows="3" style="width:100%;background:var(--in);border:1px solid var(--border);border-radius:3px;padding:5px 7px;color:var(--text);font-family:'Crimson Pro',serif;font-size:14px;resize:vertical;outline:none;line-height:1.6;">${escHtml(a)}</textarea>`;
  container.appendChild(row);
}

function submitAllBgq() {
  // Collect from the guide's built-in bgqs
  const cls = CLASSES[currentClass];
  const entries = [];
  if (cls) {
    cls.bgQuestions.forEach((q, i) => {
      const el = document.getElementById('bgq'+i);
      if (el && el.value.trim()) entries.push({ q, a: el.value.trim() });
    });
    cls.connQuestions.forEach((q, i) => {
      const el = document.getElementById('connq'+i);
      if (el && el.value.trim()) entries.push({ q, a: el.value.trim() });
    });
  }
  // Collect custom bgqs
  document.querySelectorAll('.custom-bgq-row').forEach(row => {
    const ins = row.querySelectorAll('input, textarea');
    const q = ins[0]?.value?.trim();
    const a = ins[1]?.value?.trim();
    if (q || a) entries.push({ q: q || '(Custom question)', a: a || '' });
  });
  if (!entries.length) { alert('No answered questions to submit yet.'); return; }
  const ts = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const text = entries.map(e => `${e.q}\n${e.a}`).join('\n\n');
  appendHistoryEntry(text, ts);
  save();
}

function appendHistoryEntry(text, ts) {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  if (!list) return;
  if (empty) empty.style.display = 'none';
  const entry = document.createElement('div');
  entry.className = 'history-entry';
  entry.dataset.text = text;
  entry.dataset.ts = ts || '';
  entry.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--gold-dim);border-radius:0 5px 5px 0;padding:10px 12px;margin-bottom:8px;position:relative;';
  entry.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
      <span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;color:var(--gold);">${escHtml(ts||'')}</span>
      <button class="rm" onclick="removeHistoryEntry(this)" title="Delete entry" style="font-size:14px;">×</button>
    </div>
    <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;color:var(--text);">${escHtml(text)}</div>`;
  list.appendChild(entry);
}

function removeHistoryEntry(btn) {
  const entry = btn.closest('.history-entry');
  if (entry) { entry.remove(); }
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  if (list && empty && !list.children.length) empty.style.display = '';
  save();
}

function addManualHistory() {
  const text = prompt('Add a history entry — a key moment, a decision, anything worth remembering:');
  if (!text || !text.trim()) return;
  const ts = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  appendHistoryEntry(text.trim(), ts);
  save();
}

function tierOptions(tier) {
  const opts = [
    'Gain a +1 bonus to two unmarked character traits and mark them.',
    'Permanently gain one Hit Point slot.',
    'Permanently gain one Stress slot.',
    'Permanently gain a +1 bonus to two Experiences.',
    `Choose an additional domain card of your level or lower from a domain you have access to${tier===2?' (up to level 4)':tier===3?' (up to level 7)':''}.`,
    'Permanently gain a +1 bonus to your Evasion.',
    'Take an upgraded subclass card. Then cross out the multiclass option for this tier.',
    'Increase your Proficiency by +1.',
    'Multiclass: Choose an additional class for your character, then cross out an unused "Take an upgraded subclass card" and the other multiclass option on this sheet.',
  ];
  return opts.map((o,i)=>`<div class="tier-option"><input type="checkbox" id="t${tier}o${i}" onchange="save()"><label for="t${tier}o${i}" style="font-size:12px;cursor:pointer;">${o}</label></div>`).join('');
}

// ─────────────────────────────────────────────
// SAVE / LOAD
// ─────────────────────────────────────────────

// Save key is per class so switching never corrupts another class's data

// ── TRAIT SYSTEM ──
// traitChanged is called from the sheet input oninput
// Traits are NEVER auto-filled from class defaults — user enters them
function traitChanged(name, value) {
  save();
}

function saveKey(cls) { return 'dh2-sheet-' + (cls||'').toLowerCase(); }

function save() {
  if (!currentClass) return;
  const d = { class: currentClass };
  ['f-name','f-pronouns','f-subclass','f-level','f-evasion','t-agility','t-strength','t-finesse','t-instinct','t-presence','t-knowledge','thresh-minor','thresh-major','thresh-severe','w1-name','w1-trait','w1-damage','w1-feature','w2-name','w2-trait','w2-damage','w2-feature','armor-name','armor-thresh','armor-score','armor-feature','gold-h','gold-b','gold-c','session-notes','session-title','domain-notes','misc-notes','appearance'].forEach(id=>{
    const el=document.getElementById(id); if(el) d[id]=el.value;
  });
  // save select fields separately
  const anc = document.getElementById('f-ancestry'); if(anc) d['f-ancestry'] = anc.value;
  const com = document.getElementById('f-community'); if(com) d['f-community'] = com.value;
  const sub = document.getElementById('f-subclass'); if(sub) d['f-subclass'] = sub.value;
  // bgq/connq removed — questions now handled via custom-bgq-list only
  // custom bg questions
  d.customBgqs = [...document.querySelectorAll('.custom-bgq-row')].map(r=>{const ins=r.querySelectorAll('input,textarea');return{q:ins[0]?.value||'',a:ins[1]?.value||''};});
  // history entries
  d.history = [...document.querySelectorAll('#history-list .history-entry')].map(e=>({text:e.dataset.text,ts:e.dataset.ts}));
  // session log entries
  d.sessionLog = [...document.querySelectorAll('#session-log .session-entry')].map(e=>({id:e.id,text:e.dataset.text,ts:e.dataset.ts,title:e.dataset.title||''}));
  d.hope = document.querySelectorAll('#hope-pips .hope-pip.filled').length;
  d.hopeTotal = document.querySelectorAll('#hope-pips .hope-pip').length;
  d.hp = document.querySelectorAll('#hp-boxes .hpbox.filled').length;
  d.hpTotal = document.querySelectorAll('#hp-boxes .hpbox').length;
  d.stress = document.querySelectorAll('#stress-boxes .stressbox.filled').length;
  d.stressTotal = document.querySelectorAll('#stress-boxes .stressbox').length;
  d.armor = document.querySelectorAll('#armor-pips .shield-pip.filled').length;
  d.prof = document.querySelectorAll('#prof-dots .prof-dot.filled').length;

  // class-specific
  d.prayerDice = savePrayerDice();
  d.companion = saveCompanion();
  // downtime
  // downtime removed
  for(let t=2;t<=4;t++) for(let o=0;o<9;o++){const el=document.getElementById(`t${t}o${o}`);if(el)d[`t${t}o${o}`]=el.checked;}
  d.exps = [...document.querySelectorAll('#exp-list .exp-row')].map(r=>[r.querySelectorAll('input')[0].value,r.querySelectorAll('input')[1].value]);
  d.inv = [...document.querySelectorAll('#inv-list .inv-line')].map(r=>{const ins=r.querySelectorAll('input');return[ins[0]?.value||'',ins[1]?.value||''];});
  d.invWeaps = [...document.querySelectorAll('.inv-weapon-wrap')].map(w=>{
    const ins=w.querySelectorAll('input[type=text]'); const cbs=w.querySelectorAll('input[type=checkbox]');
    return{n:ins[0]?.value,t:ins[1]?.value,d:ins[2]?.value,f:ins[3]?.value,p:cbs[0]?.checked,s:cbs[1]?.checked};
  });
  d.invArmors = [...document.querySelectorAll('.inv-armor-wrap')].map(w=>{
    const ins=w.querySelectorAll('input[type=text]');
    return{n:ins[0]?.value||'',thresh:ins[1]?.value||'',score:ins[2]?.value||'',f:ins[3]?.value||''};
  });
  // save to per-class key AND a 'last' pointer so we reload the right class on next open
  localStorage.setItem(saveKey(currentClass), JSON.stringify(d));
  localStorage.setItem('dh2-last-class', currentClass);
  renderSidebar();
  applyHintsPref();
}

function fillSuggestedTraits() {
  // No-op: traits are never auto-filled
}


function applyClassDefaults(cls) {
  const c = CLASSES[cls];
  if (!c) return;
  // Evasion
  const ev = document.getElementById('f-evasion');
  if (ev && !ev.value) ev.value = c.evasionStart;
  // Level defaults to 1
  const lvl = document.getElementById('f-level');
  if (lvl && !lvl.value) lvl.value = '1';
  // HP and Stress
  if (c.hpStart) makeBoxPips(document.getElementById('hp-boxes'), c.hpStart, 0, 'hpbox');
  if (c.stressStart) makeBoxPips(document.getElementById('stress-boxes'), c.stressStart, 0, 'stressbox');
  // Suggested thresholds (base values before adding level — player adds level themselves)
  // These are the minor/major/severe breakpoints from the suggested armor
  // Parse from suggestedArmor e.g. "Chainmail Armor — Thresholds 7/15 — Score 4"
  const armorParts = c.suggestedArmor.split('—');
  if (armorParts[1]) {
    const threshMatch = armorParts[1].match(/(\d+)\/(\d+)/);
    if (threshMatch) {
      const minor = document.getElementById('thresh-minor');
      const major = document.getElementById('thresh-major');
      const severe = document.getElementById('thresh-severe');
      if (minor) minor.value = threshMatch[1];
      if (major) major.value = threshMatch[2];
      // Severe is typically minor + major
      if (severe) severe.value = parseInt(threshMatch[1]) + parseInt(threshMatch[2]);
    }
  }
  // Armor score
  const scoreMatch = armorParts[2]?.match(/(\d+)/);
  if (scoreMatch) {
    const armorScore = document.getElementById('armor-score');
    if (armorScore) armorScore.value = scoreMatch[1];
  }
  // Proficiency starts at 1
  makeProfDots(document.getElementById('prof-dots'), 1);
}

function restoreData(d) {
  const traitIds = ['t-agility','t-strength','t-finesse','t-instinct','t-presence','t-knowledge'];
  const cls = CLASSES[currentClass];

  // Always set HP/stress/evasion from class data first
  applyClassDefaults(currentClass);

  // Restore saved traits only if they exist — otherwise leave blank
  if (d) {
    traitIds.forEach(k => {
      const el = document.getElementById(k);
      if (el && d[k] !== undefined && d[k] !== '') el.value = d[k];
    });
  }

  if (!d) return;

  // All other text fields
  Object.keys(d).forEach(k => {
    if (['class','exps','inv','invWeaps'].includes(k)) return;
    if (traitIds.includes(k)) return; // already handled
    if (typeof d[k] === 'boolean') { const el = document.getElementById(k); if (el) el.checked = d[k]; return; }
    if (typeof d[k] === 'number') return;
    if (typeof d[k] === 'string' && d[k] !== '') { const el = document.getElementById(k); if (el) el.value = d[k]; }
  });

  // checkboxes
  for(let t=2;t<=4;t++) for(let o=0;o<9;o++){const el=document.getElementById(`t${t}o${o}`);if(el)el.checked=!!d[`t${t}o${o}`];}
  // pips
  if(d.hope!=null){renderHopePips(document.getElementById('hope-pips'), d.hopeTotal||6, d.hope);}
  if(d.hp!=null) makeBoxPips(document.getElementById('hp-boxes'), d.hpTotal||(cls?.hpStart||5), d.hp, 'hpbox');
  if(d.stress!=null) makeBoxPips(document.getElementById('stress-boxes'), d.stressTotal||(cls?.stressStart||6), d.stress, 'stressbox');
  if(d.armor!=null) makeShieldPips(document.getElementById('armor-pips'),12,d.armor);
  if(d.prof!=null) makeProfDots(document.getElementById('prof-dots'),d.prof);
  // dynamic lists
  const expContainer = document.getElementById('exp-list');
  expContainer.innerHTML='';
  (d.exps||[]).forEach(([n,b])=>addExpRow(expContainer,n,b));
  if(!expContainer.children.length){addExpRow(expContainer);addExpRow(expContainer);}
  const invContainer = document.getElementById('inv-list');
  invContainer.innerHTML='';
  (d.inv||[]).forEach(item=>{
    if(Array.isArray(item)) addInvRow(invContainer,item[0],item[1]);
    else addInvRow(invContainer,item,'');
  });
  if(!invContainer.children.length) addInvRow(invContainer);
  const iaContainer = document.getElementById('inv-armor-wrap');
  if(iaContainer){iaContainer.innerHTML='';(d.invArmors||[]).forEach(a=>addInvArmor(iaContainer,a.n||'',a.thresh||'',a.score||'',a.f||''));}
  const iwContainer = document.getElementById('inv-weapons-wrap');
  iwContainer.innerHTML='';
  (d.invWeaps||[]).forEach(w=>addInvWeapon(iwContainer,w.n||'',w.t||'',w.d||'',w.f||''));
  // custom bg questions
  const cbContainer = document.getElementById('custom-bgq-list');
  if(cbContainer){cbContainer.innerHTML='';(d.customBgqs||[]).forEach(({q,a})=>addCustomBgq(q,a));}
  // history entries
  const hList = document.getElementById('history-list');
  if(hList){hList.innerHTML='';(d.history||[]).forEach(({text,ts})=>appendHistoryEntry(text,ts));}
  // session log entries — stored newest-first so restore in reverse to re-insert newest-first
  const sLog = document.getElementById('session-log');
  const sEmpty = document.getElementById('session-log-empty');
  if(sLog){
    sLog.innerHTML='';
    const entries = d.sessionLog||[];
    entries.forEach(({text,ts,title,id})=>appendSessionEntry(text,ts,title||''));
    if(sEmpty) sEmpty.style.display = entries.length ? 'none' : '';
  }
  // render ancestry/community feature bar
  renderFeatureBar();
  // Show mixed ancestry pickers if Mixed Ancestry was saved
  onHeritageChange();
  // Restore mixed ancestry sub-selections if saved
  const savedA1 = localStorage.getItem('dh2-mixed-a1-' + (currentClass||''));
  const savedA2 = localStorage.getItem('dh2-mixed-a2-' + (currentClass||''));
  if (savedA1) { const el = document.getElementById('f-mixed-a1'); if (el) { el.value = savedA1; } }
  if (savedA2) { const el = document.getElementById('f-mixed-a2'); if (el) { el.value = savedA2; } }
  if (savedA1 || savedA2) onMixedAncestryChange();
  // class-specific
  restorePrayerDice(d.prayerDice);
  restoreCompanion(d.companion);
  renderCompanionHp();
  // downtime
  // downtime removed
}

function loadSheet() {
  // Check for last used class
  const lastCls = localStorage.getItem('dh2-last-class');
  // Also check legacy key for backwards compat
  let legacyData = null;
  try { legacyData = JSON.parse(localStorage.getItem('dh2-sheet')); } catch {}
  const cls = lastCls || (legacyData && legacyData.class) || null;
  if (!cls || !CLASSES[cls]) return;
  currentClass = cls;
  document.getElementById('class-picker').value = cls;
  buildPages(cls);
  // Try per-class key first, fall back to legacy
  let d = null;
  try { d = JSON.parse(localStorage.getItem(saveKey(cls))); } catch {}
  if (!d && legacyData && legacyData.class === cls) d = legacyData;
  restoreData(d);
  loadPortrait();
  renderSidebar();
  renderLoadoutQuick();
}

function uploadPortrait(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    setPortrait(e.target.result);
    savePortrait(e.target.result);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function setPortrait(dataUrl) {
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  if (!img || !placeholder) return;
  if (dataUrl) {
    img.src = dataUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

function savePortrait(dataUrl) {
  if (!currentClass) return;
  const key = 'dh2-portrait-' + currentClass.toLowerCase();
  if (dataUrl) localStorage.setItem(key, dataUrl);
  else localStorage.removeItem(key);
}

function loadPortrait() {
  if (!currentClass) return;
  const key = 'dh2-portrait-' + currentClass.toLowerCase();
  const dataUrl = localStorage.getItem(key);
  setPortrait(dataUrl || '');
}

function removePortrait() {
  setPortrait('');
  savePortrait('');
}

function prefillSuggestedTraits(cls) {
  // No-op: traits are never auto-filled
}


function showChangeClassModal() {
  // Build a simple inline modal for class selection
  const existing = document.getElementById('change-class-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  const modal = document.createElement('div');
  modal.id = 'change-class-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';

  const classes = Object.keys(CLASSES);
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.16em;color:var(--gold);margin-bottom:6px;">CHANGE CLASS</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6;">Pick a new class. Your current sheet will be saved and you can switch back anytime from the character list.</p>
      <div style="display:grid;grid-template-columns:1fr;gap:5px;margin-bottom:20px;max-height:60vh;overflow-y:auto;">
        ${classes.map(c => `
          <button onclick="confirmChangeClass('${c}')" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.08em;background:var(--bg3);border:1px solid var(--border2);color:var(--muted);padding:10px 12px;border-radius:5px;cursor:pointer;text-align:left;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold-dim)';this.style.color='var(--text)';" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--muted)';">
            ${c}
          </button>`).join('')}
      </div>
      <button onclick="document.getElementById('change-class-modal').style.display='none'" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;background:none;border:1px solid var(--border2);color:var(--muted);padding:8px 20px;border-radius:4px;cursor:pointer;width:100%;">Cancel</button>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

function confirmChangeClass(cls) {
  document.getElementById('change-class-modal').style.display = 'none';
  if (cls === currentClass) return;
  switchClass(cls);
}

function switchClass(cls, silent=false) {
  if (!cls) return;
  if (currentClass && cls === currentClass) return;
  if (!silent) {
    if (currentClass) {
      const hasData = (() => {
        try { const d = JSON.parse(localStorage.getItem(saveKey(currentClass))); return d && (d['f-name']||d.exps?.some(e=>e[0])); } catch { return false; }
      })();
      if (hasData && !confirm(`Switch to ${cls}? Your ${currentClass} sheet will be saved separately and you can switch back anytime.`)) {
        document.getElementById('class-picker').value = currentClass;
        return;
      }
    }
    // Normal switch: save current and load new
    if (currentClass) save();
    currentClass = cls;
    localStorage.setItem('dh2-last-class', cls);
    buildPages(cls);
    let d = null;
    try { d = JSON.parse(localStorage.getItem(saveKey(cls))); } catch {}
    restoreData(d);
    loadPortrait();
    renderSidebar();
    renderLoadoutQuick();
  } else {
    // Silent mode (Session 0): just rebuild the sheet for this class
    // without saving or creating new character entries
    currentClass = cls;
    localStorage.setItem('dh2-last-class', cls);
    document.getElementById('class-picker').value = cls;
    buildPages(cls);
    let d = null;
    try { d = JSON.parse(localStorage.getItem(saveKey(cls))); } catch {}
    restoreData(d);
    // Don't call renderSidebar() — that would show/save a new character entry
  }
}

// ─────────────────────────────────────────────
// CHARACTER LIST (sidebar)
// ─────────────────────────────────────────────
function getAllCharKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('dh2-sheet-') && k !== 'dh2-sheet-') keys.push(k);
  }
  return keys;
}

function renderMobileCharBar() {
  const inner = document.getElementById('mob-char-inner');
  if (!inner) return;
  // remove old char buttons but keep the + New button
  inner.querySelectorAll('.mob-char-btn').forEach(b => b.remove());
  const newBtn = inner.querySelector('.mob-new-btn');
  const keys = getAllCharKeys();
  const chars = [];
  keys.forEach(k => {
    try { const d = JSON.parse(localStorage.getItem(k)); if (d && d.class) chars.push({key:k,data:d}); } catch {}
  });
  chars.sort((a,b)=>(a.data['f-name']||a.data.class).localeCompare(b.data['f-name']||b.data.class));
  chars.forEach(({key,data}) => {
    const btn = document.createElement('button');
    btn.className = 'mob-char-btn' + (key === saveKey(currentClass) ? ' active' : '');
    btn.innerHTML = `<span>${escHtml(data['f-name']||'(unnamed)')}</span><span class="mob-cls">${escHtml(data.class||'')}${data['f-level']?' · Lv '+data['f-level']:''}</span>`;
    btn.onclick = () => loadCharacter(key);
    inner.insertBefore(btn, newBtn);
  });
}

function renderSidebar() {
  const list = document.getElementById('char-list');
  const empty = document.getElementById('sidebar-empty');
  const keys = getAllCharKeys();
  // collect valid chars
  const chars = [];
  keys.forEach(k => {
    try {
      const d = JSON.parse(localStorage.getItem(k));
      if (d && d.class) chars.push({ key: k, data: d });
    } catch {}
  });
  // sort by name
  chars.sort((a, b) => (a.data['f-name'] || a.data.class).localeCompare(b.data['f-name'] || b.data.class));

  // clear existing items (keep empty msg)
  list.querySelectorAll('.char-item').forEach(el => el.remove());

  if (chars.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  chars.forEach(({ key, data }) => {
    const item = document.createElement('div');
    item.className = 'char-item' + (key === saveKey(currentClass) && data['f-name'] === (document.getElementById('f-name')||{}).value ? ' active' : '');
    // determine active: same save key
    const isActive = key === saveKey(currentClass);
    if (isActive) item.classList.add('active');

    const name = data['f-name'] || '(unnamed)';
    const cls = data.class || '';
    const lvl = data['f-level'] ? `Lv ${data['f-level']}` : '';
    const community = data['f-community'] || '';
    const ancestry = data['f-ancestry'] || '';
    const heritage = [community, ancestry].filter(Boolean).join(' ');
    item.innerHTML = `
      <div class="char-item-body" onclick="loadCharacter('${key}')">
        <div class="char-name">${escHtml(name)}</div>
        <div class="char-meta">${escHtml(cls)}${lvl ? ' · ' + lvl : ''}${heritage ? ' · ' + escHtml(heritage) : ''}</div>
      </div>
      <button class="char-del" onclick="deleteCharacter('${key}', event)" title="Delete">×</button>`;
    list.appendChild(item);
  });
  renderMobileCharBar();
}

function loadCharacter(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    if (!d || !d.class || !CLASSES[d.class]) return;
    if (currentClass && currentClass !== d.class) save();
    currentClass = d.class;
    localStorage.setItem('dh2-last-class', d.class);
    document.getElementById('class-picker').value = d.class;
    buildPages(d.class);
    restoreData(d);
    renderSidebar();
    renderLoadoutQuick();
    // Always switch to sheet tab so the new character is visible
    showSheetTab('sheet');
  } catch(e) { console.error(e); }
}

function deleteCharacter(key, e) {
  e.stopPropagation();
  const d = JSON.parse(localStorage.getItem(key)||'{}');
  const name = d['f-name'] || d.class || 'this character';
  if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
  localStorage.removeItem(key);
  // if we deleted the active one, clear the view
  if (key === saveKey(currentClass)) {
    currentClass = '';
    localStorage.removeItem('dh2-last-class');
    document.getElementById('class-picker').value = '';
    document.getElementById('pages').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:1.5rem;"><div style="font-family:\'Cinzel\',serif;font-size:13px;letter-spacing:0.15em;color:var(--muted);">NO CHARACTER LOADED</div><button onclick="newCharacter()" style="font-family:\'Cinzel\',serif;font-size:12px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:14px 32px;border-radius:6px;cursor:pointer;">+ New Character</button></div>';
  }
  renderSidebar();
}

function newCharacter() {
  const modal = document.getElementById('new-char-modal');
  if (modal) { modal.style.display = 'flex'; }
}

function closeNewCharModal() {
  const modal = document.getElementById('new-char-modal');
  if (modal) modal.style.display = 'none';
}


function newCharDirect() {
  closeNewCharModal();
  // Show class picker — on pick, create fresh sheet for that class
  showPickClassModal();
}

function showPickClassModal() {
  const existing = document.getElementById('pick-class-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  const modal = document.createElement('div');
  modal.id = 'pick-class-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';

  const classes = Object.keys(CLASSES);
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.16em;color:var(--gold);margin-bottom:6px;">CHOOSE YOUR CLASS</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6;">Pick a class to start building your character.</p>
      <div style="display:grid;grid-template-columns:1fr;gap:5px;margin-bottom:20px;max-height:60vh;overflow-y:auto;">
        ${classes.map(c => `
          <button onclick="pickClassAndStart('${c}')" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.08em;background:var(--bg3);border:1px solid var(--border2);color:var(--muted);padding:10px 12px;border-radius:5px;cursor:pointer;text-align:left;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold-dim)';this.style.color='var(--text)';" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--muted)';">
            ${c}
          </button>`).join('')}
      </div>
      <button onclick="document.getElementById('pick-class-modal').style.display='none'" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;background:none;border:1px solid var(--border2);color:var(--muted);padding:8px 20px;border-radius:4px;cursor:pointer;width:100%;">Cancel</button>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

function pickClassAndStart(cls) {
  document.getElementById('pick-class-modal').style.display = 'none';
  if (currentClass) save();
  currentClass = cls;
  localStorage.setItem('dh2-last-class', cls);
  document.getElementById('class-picker').value = cls;
  buildPages(cls);
  restoreData(null); // fresh sheet
  renderSidebar();
  showSheetTab('sheet');
}

function exportCharacters() {
  const keys = getAllCharKeys();
  if (!keys.length) { alert('No saved characters to export.'); return; }

  const data = { version: 1, exported: new Date().toISOString(), characters: [] };
  keys.forEach(k => {
    try {
      const d = JSON.parse(localStorage.getItem(k));
      if (d) data.characters.push(d);
    } catch(e) {}
  });

  // Also export loadouts and flipped cards per class
  data.loadouts = {};
  data.flipped = {};
  Object.keys(CLASSES).forEach(cls => {
    const lk = 'dh2-loadout-' + cls.toLowerCase();
    const fk = 'dh2-flipped-' + cls.toLowerCase();
    const lv = localStorage.getItem(lk);
    const fv = localStorage.getItem(fk);
    if (lv) data.loadouts[cls] = JSON.parse(lv);
    if (fv) data.flipped[cls] = JSON.parse(fv);
  });

  // Export Session 0 data
  const s0 = localStorage.getItem('dh2-s0-wizard');
  if (s0) data.session0 = JSON.parse(s0);

  // Also export portraits per class
  data.portraits = {};
  Object.keys(CLASSES).forEach(cls => {
    const pk = 'dh2-portrait-' + cls.toLowerCase();
    const pv = localStorage.getItem(pk);
    if (pv) data.portraits[cls] = pv;
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'haven-characters-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importCharacters(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.characters || !Array.isArray(data.characters)) {
        alert('Invalid file — no character data found.'); return;
      }

      const existing = getAllCharKeys().length;
      let imported = 0;
      let skipped = 0;

      data.characters.forEach(d => {
        if (!d.class || !CLASSES[d.class]) { skipped++; return; }
        const key = saveKey(d.class);
        // Check if a character already exists for this class
        const exists = localStorage.getItem(key);
        if (exists) {
          const existingName = JSON.parse(exists)['f-name'] || '(unnamed)';
          const incomingName = d['f-name'] || '(unnamed)';
          if (!confirm(`A ${d.class} character "${existingName}" already exists. Replace with "${incomingName}"?`)) {
            skipped++; return;
          }
        }
        localStorage.setItem(key, JSON.stringify(d));
        imported++;
      });

      // Restore loadouts and flipped
      if (data.loadouts) {
        Object.entries(data.loadouts).forEach(([cls, ids]) => {
          localStorage.setItem('dh2-loadout-' + cls.toLowerCase(), JSON.stringify(ids));
        });
      }
      if (data.flipped) {
        Object.entries(data.flipped).forEach(([cls, ids]) => {
          localStorage.setItem('dh2-flipped-' + cls.toLowerCase(), JSON.stringify(ids));
        });
      }
      if (data.session0) {
        localStorage.setItem('dh2-s0-wizard', JSON.stringify(data.session0));
      }
      if (data.portraits) {
        Object.entries(data.portraits).forEach(([cls, dataUrl]) => {
          localStorage.setItem('dh2-portrait-' + cls.toLowerCase(), dataUrl);
        });
      }

      // Reset file input so the same file can be re-imported if needed
      input.value = '';

      alert(`Import complete: ${imported} character${imported !== 1 ? 's' : ''} imported${skipped ? ', ' + skipped + ' skipped' : ''}.`);
      renderSidebar();
      // Load the first imported character if nothing is currently loaded
      if (!currentClass && imported > 0) {
        const firstClass = data.characters.find(d => d.class && CLASSES[d.class])?.class;
        if (firstClass) loadCharacter(saveKey(firstClass));
      }
    } catch(err) {
      alert('Could not read file. Make sure it\'s a valid Haven export.');
      input.value = '';
    }
  };
  reader.readAsText(file);
}

function saveSheet() {
  if (!currentClass) return;
  save();
  renderSidebar();
  const btn = document.getElementById('save-btn');
  if (btn) { btn.textContent = 'Saved ✓'; setTimeout(() => btn.textContent = 'Save', 1500); }
}

let _autoSaveTimer = null;
function autoSaveIndicator() {
  const btn = document.getElementById('save-btn');
  if (!btn) return;
  clearTimeout(_autoSaveTimer);
  btn.textContent = 'Saving…';
  _autoSaveTimer = setTimeout(() => { btn.textContent = 'Save'; }, 800);
}

function clearSheet() {
  if (!confirm(`Clear the ${currentClass} sheet? This cannot be undone.`)) return;
  localStorage.removeItem(saveKey(currentClass));
  localStorage.removeItem('dh2-last-class');
  currentClass = '';
  document.getElementById('class-picker').value = '';
  document.getElementById('pages').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:1.5rem;"><div style="font-family:\'Cinzel\',serif;font-size:13px;letter-spacing:0.15em;color:var(--muted);">NO CHARACTER LOADED</div><button onclick="newCharacter()" style="font-family:\'Cinzel\',serif;font-size:12px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:14px 32px;border-radius:6px;cursor:pointer;">+ New Character</button></div>';
  renderSidebar();
}

function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('dh2-theme', next);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = next === 'light' ? '☾ Dark Mode' : '☀ Light Mode';
  const hdrBtn = document.getElementById('theme-btn-hdr');
  if (hdrBtn) hdrBtn.textContent = next === 'light' ? '☾' : '☀';
}

function initTheme() {
  const saved = localStorage.getItem('dh2-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = saved === 'light' ? '☾ Dark Mode' : '☀ Light Mode';
  const hdrBtn = document.getElementById('theme-btn-hdr');
  if (hdrBtn) hdrBtn.textContent = saved === 'light' ? '☾' : '☀';
}

// ── MIGRATE: clear stale partial trait saves ──
(function migrateStaleSaves() {
  const traitIds = ['t-agility','t-strength','t-finesse','t-instinct','t-presence','t-knowledge'];
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('dh2-sheet-')) keys.push(k);
  }
  keys.forEach(key => {
    try {
      const d = JSON.parse(localStorage.getItem(key));
      if (!d) return;
      const savedCount = traitIds.filter(k => d[k] !== undefined && d[k] !== '').length;
      if (savedCount > 0 && savedCount < 6) {
        traitIds.forEach(k => { delete d[k]; });
        localStorage.setItem(key, JSON.stringify(d));
      }
    } catch(e) {}
  });
})();

// ── INIT ──
initTheme();
loadSheet();
applyS0Transfer(); // must run after loadSheet
renderSidebar();
// restore last active tab
const savedTab = localStorage.getItem('dh2-active-tab');
if (savedTab === 'notes') showSheetTab('notes');
else if (savedTab === 'cards') showSheetTab('cards');
else if (savedTab === 'ref') showSheetTab('ref');
// s0 tab removed — S0 is now at s0.html

function newCharViaS0() {
  closeNewCharModal();
  if (currentClass) save();
  // Go to standalone S0 page
  window.location.href = 's0.html';
}

function s0FillSuggestedTraits() {
  // No-op stub kept for compatibility
}
