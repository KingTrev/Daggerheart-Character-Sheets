// ── s0.js — Session 0 Character Creation ──
// Expose key functions globally

// Standalone S0 flow. Reads CLASSES, SUBCLASSES, ANCESTRY_DATA, COMMUNITY_DATA
// from the data files. On completion writes character data to localStorage
// so sheet.html can pick it up.

const S0_SAVE_KEY = 'dh2-s0-wizard';

// ── UTILITIES ──
function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function toggleTip(btn) {
  const pop = btn.nextElementSibling;
  if (!pop) return;
  const isOpen = pop.classList.contains('open');
  document.querySelectorAll('.tip-popover.open').forEach(p => p.classList.remove('open'));
  if (!isOpen) pop.classList.add('open');
}

function s0QKey(q) { return 'ans:' + q.substring(0, 40).replace(/\s+/g,'_').replace(/[^a-z0-9_]/gi,''); }

const S0_STEPS = [
  { id:'welcome' },
  { id:'pick-class' },
  { id:'how-class' },
  { id:'pick-subclass' },
  { id:'pick-ancestry' },
  { id:'pick-community' },
  { id:'how-dice' },
  { id:'traits' },
  { id:'experiences' },
  { id:'how-combat' },
  { id:'connections' },
  { id:'group-questions' },
  { id:'done' },
];

let s0Step = 0;
let s0Data = {};

function loadS0Data() {
  try { s0Data = JSON.parse(localStorage.getItem('dh2-s0-wizard')) || {}; } catch(e) { s0Data = {}; }
  s0Step = s0Data.step || 0;
}

function saveS0Data() {
  s0Data.step = s0Step;
  localStorage.setItem('dh2-s0-wizard', JSON.stringify(s0Data));
}

function saveS0() { saveS0Data(); }



function updateMixedAncestryPreview() {
  const a1val = s0Data['s0-mixed-a1'];
  const a2val = s0Data['s0-mixed-a2'];
  const prev1 = document.getElementById('mixed-prev-1');
  const prev2 = document.getElementById('mixed-prev-2');

  if (prev1) {
    const d = a1val && ANCESTRY_DATA[a1val];
    if (d && d.features[0]) {
      prev1.innerHTML = `<strong>${d.features[0].name}:</strong> ${d.features[0].text}`;
      prev1.style.display = 'block';
    } else {
      prev1.style.display = 'none';
    }
  }

  if (prev2) {
    const d = a2val && ANCESTRY_DATA[a2val];
    if (d) {
      const feat = d.features[1] || d.features[0];
      prev2.innerHTML = `<strong>${feat.name}:</strong> ${feat.text}`;
      prev2.style.display = 'block';
    } else {
      prev2.style.display = 'none';
    }
  }
}
function s0GoToDomainCards() {
  localStorage.setItem('dh2-s0-goto-cards','1'); window.location.href = 'sheet.html';
  // Small delay to let the tab render, then inject the return button
  setTimeout(() => {
    if (document.getElementById('s0-return-btn')) return;
    const b = document.createElement('button');
    b.id = 's0-return-btn';
    b.textContent = '← Return to Session 0';
    b.style.cssText = [
      'position:fixed','bottom:20px','right:20px','z-index:9999',
      "font-family:'Cinzel',serif",'font-size:10px','letter-spacing:0.1em',
      'background:#141008','border:1px solid #7a6530','color:#c9a84c',
      'padding:10px 18px','border-radius:6px','cursor:pointer',
      'box-shadow:0 4px 12px rgba(0,0,0,0.5)'
    ].join(';');
    b.onclick = () => { b.remove(); };
    document.body.appendChild(b);
  }, 150);
}
function s0Go(dir) {
  s0Step = Math.max(0, Math.min(S0_STEPS.length - 1, s0Step + dir));
  saveS0Data();
  renderS0();
}

function s0GoTo(n) {
  s0Step = n;
  saveS0Data();
  renderS0();
}

function renderS0Connections() { renderS0(); }

function renderS0() {
  loadS0Data();
  const wiz = document.getElementById('s0-wizard');
  if (!wiz) return;
  const step = S0_STEPS[s0Step];

  // Progress bar
  const pct = Math.round((s0Step / (S0_STEPS.length - 1)) * 100);
  let html = `
    <div style="margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <!-- step label updated via updateS0Header() -->
      </div>
      <div style="background:var(--bg3);border-radius:4px;height:6px;overflow:hidden;">
        <div style="background:var(--gold);height:100%;width:${pct}%;transition:width 0.3s;border-radius:4px;"></div>
      </div>
    </div>`;

  html += renderS0Step(step.id);

  // Nav buttons
  html += `<div style="display:flex;gap:10px;margin-top:1.5rem;justify-content:space-between;">`;
  if (s0Step > 0) html += `<button onclick="s0Go(-1)" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;background:none;border:1px solid var(--border2);color:var(--muted);padding:10px 20px;border-radius:4px;cursor:pointer;flex:1;">← Back</button>`;
  else html += `<div></div>`;
  if (s0Step < S0_STEPS.length - 1) html += `<button onclick="s0Go(1)" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:10px 24px;border-radius:4px;cursor:pointer;flex:2;">Continue →</button>`;
  html += `</div>`;

  wiz.innerHTML = html;

  // Post-render hooks for dynamic selects
  function wireClassSelect() {
    const sel = document.getElementById('s0-class');
    if (!sel) return;
    function updatePreview() {
      // Highlight selected card
      document.querySelectorAll('[id^="s0-classcard-"]').forEach(el => { el.style.borderColor='var(--border)'; el.style.background='var(--bg3)'; });
      if (sel.value) {
        const card = document.getElementById('s0-classcard-' + sel.value);
        if (card) { card.style.borderColor='var(--gold-dim)'; card.style.background='var(--bg4)'; }
        // Collapse list after picking
        const allCards = document.getElementById('s0-all-cards');
        const toggleBtn = document.getElementById('s0-toggle-classes');
        if (allCards) allCards.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '▼ Show all';
      }
      const preview = document.getElementById('s0-class-preview');
      const c = CLASSES[sel.value];
      if (preview && c) {
        preview.innerHTML = `<div style="background:var(--bg3);border:1px solid var(--gold-dim);border-left:3px solid var(--gold);border-radius:0 6px 6px 0;padding:14px;margin-bottom:0.5rem;">
          <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--gold);margin-bottom:6px;">${sel.value} — ${c.domains}</div>
          <p style="font-size:13px;line-height:1.75;margin-bottom:10px;">${c.tagline}</p>
          <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--teal);margin-bottom:3px;">CORE FEATURE</div>
          <p style="font-size:13px;font-weight:600;margin-bottom:4px;">${c.featureName}</p>
          <p style="font-size:12px;line-height:1.7;color:var(--muted);">${c.featureBody.replace(/<[^>]*>/g,'').substring(0,300)}...</p>
          <div style="margin-top:10px;font-family:'Cinzel',serif;font-size:9px;color:var(--teal);" class="hint-text">SUGGESTED TRAITS</div>
          <p style="font-size:12px;margin-top:3px;" class="hint-text">${c.suggestedTraits.replace(/\n/g,' · ')}</p>
          <div style="margin-top:8px;font-family:'Cinzel',serif;font-size:9px;color:var(--teal);">STARTING EVASION</div>
          <p style="font-size:14px;font-weight:700;color:var(--gold);margin-top:2px;">${c.evasionStart}</p>
        </div>`;
      } else if (preview) { preview.innerHTML = ''; }
    }
    sel.addEventListener('change', () => {
      if (sel.id) s0Data[sel.id] = sel.value;
      // Clear saved trait overrides so new class defaults show
      ['agility','strength','finesse','instinct','presence','knowledge'].forEach(t => {
        delete s0Data['s0-trait-' + t];
      });
      saveS0Data();
      if (sel.value) {
        switchClass(sel.value, true);
        setTimeout(() => renderS0(), 50);
      }
      updatePreview();
    });
    updatePreview();
  }
  function wireAncestrySelect() {
    const sel = document.getElementById('s0-ancestry');
    if (!sel) return;
    function update() {
      const det = document.getElementById('s0-ancestry-detail');
      const d = ANCESTRY_DATA[sel.value];
      if (!det) return;
      if (!d) { det.style.display = 'none'; return; }
      det.style.display = '';
      let extraHTML = '';
      // Clank: prompt to choose which Experience gets +1
      if (sel.value === 'Clank') {
        extraHTML = `<div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:5px;padding:12px 14px;margin-top:8px;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px;">PURPOSEFUL DESIGN — +1 EXPERIENCE BONUS</div>
          <p style="font-size:12px;line-height:1.7;margin-bottom:8px;">Decide who made you and for what purpose. Which of your Experiences best aligns with this? It gains a permanent +1 bonus.</p>
          <label style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;color:var(--muted);display:block;margin-bottom:4px;">EXPERIENCE NAME (e.g. "Former Guard")</label>
          <input type="text" id="s0-clank-exp" placeholder="Which Experience gets +1?" value="${s0Data['s0-clank-exp']||''}"
            style="width:100%;font-family:'Crimson Pro',serif;font-size:13px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:8px 10px;border-radius:4px;outline:none;"
            oninput="s0Data['s0-clank-exp']=this.value;saveS0Data();">
          <p style="font-size:11px;color:var(--muted);margin-top:6px;">Write this Experience on your sheet with +1 added to its value (e.g. if you plan +2, write +3).</p>
        </div>`;
      }
      // Mixed Ancestry: show two ancestry pickers
      if (sel.value === 'Mixed Ancestry') {
        const ancestryOptions = Object.keys(ANCESTRY_DATA).filter(a=>a!=='Mixed Ancestry').map(a=>`<option value="${a}">${a}</option>`).join('');
        extraHTML = `<div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:5px;padding:12px 14px;margin-top:8px;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px;">MIXED ANCESTRY — CHOOSE TWO</div>
          <p style="font-size:12px;line-height:1.7;margin-bottom:10px;">Take the <strong>first feature</strong> of one ancestry and the <strong>second feature</strong> of another.</p>
          <label style="font-family:'Cinzel',serif;font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">FIRST FEATURE FROM</label>
          <select id="s0-mixed-a1" style="width:100%;font-family:'Cinzel',serif;font-size:13px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:8px 10px;border-radius:4px;outline:none;margin-bottom:8px;" oninput="s0Data['s0-mixed-a1']=this.value;saveS0Data();updateMixedAncestryPreview();">
            <option value="">— Choose ancestry —</option>${ancestryOptions}
          </select>
          <label style="font-family:'Cinzel',serif;font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">SECOND FEATURE FROM</label>
          <select id="s0-mixed-a2" style="width:100%;font-family:'Cinzel',serif;font-size:13px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:8px 10px;border-radius:4px;outline:none;margin-bottom:8px;" oninput="s0Data['s0-mixed-a2']=this.value;saveS0Data();updateMixedAncestryPreview();">
            <option value="">— Choose ancestry —</option>${ancestryOptions}
          </select>
          <div id="mixed-prev-1" style="font-size:12px;padding:8px 10px;background:var(--bg2);border-radius:3px;border-left:2px solid var(--teal);margin-bottom:4px;display:${s0Data['s0-mixed-a1']&&ANCESTRY_DATA[s0Data['s0-mixed-a1']]?'block':'none'}">${s0Data['s0-mixed-a1']&&ANCESTRY_DATA[s0Data['s0-mixed-a1']]?`<strong>${ANCESTRY_DATA[s0Data['s0-mixed-a1']].features[0]?.name}:</strong> ${ANCESTRY_DATA[s0Data['s0-mixed-a1']].features[0]?.text||''}`:'&nbsp;'}</div>
          <div id="mixed-prev-2" style="font-size:12px;padding:8px 10px;background:var(--bg2);border-radius:3px;border-left:2px solid var(--gold-dim);display:${s0Data['s0-mixed-a2']&&ANCESTRY_DATA[s0Data['s0-mixed-a2']]?'block':'none'}">${s0Data['s0-mixed-a2']&&ANCESTRY_DATA[s0Data['s0-mixed-a2']]?`<strong>${ANCESTRY_DATA[s0Data['s0-mixed-a2']].features[1]?.name||ANCESTRY_DATA[s0Data['s0-mixed-a2']].features[0]?.name}:</strong> ${ANCESTRY_DATA[s0Data['s0-mixed-a2']].features[1]?.text||ANCESTRY_DATA[s0Data['s0-mixed-a2']].features[0]?.text||''}`:'&nbsp;'}</div>
        </div>`;
      }
      det.innerHTML = `<div style="background:var(--bg3);border:1px solid var(--teal);border-radius:5px;padding:12px 14px;margin-top:10px;">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--teal);margin-bottom:6px;">${sel.value.toUpperCase()} FEATURES</div>
        <p style="font-size:12px;line-height:1.7;margin-bottom:8px;">${d.description}</p>
        ${d.features.map(f=>`<div style="font-size:12px;line-height:1.7;margin-bottom:4px;padding-left:10px;border-left:2px solid var(--teal);"><strong>${f.name}:</strong> ${f.text.replace(/<[^>]*>/g,'')}</div>`).join('')}
      </div>${extraHTML}`;
      // Restore mixed ancestry selects
      if (sel.value === 'Mixed Ancestry') {
        setTimeout(() => {
          const a1 = document.getElementById('s0-mixed-a1'); if (a1 && s0Data['s0-mixed-a1']) a1.value = s0Data['s0-mixed-a1'];
          const a2 = document.getElementById('s0-mixed-a2'); if (a2 && s0Data['s0-mixed-a2']) a2.value = s0Data['s0-mixed-a2'];
        }, 0);
      }
    }
    sel.addEventListener('change', () => { if (sel.id) s0Data[sel.id] = sel.value; saveS0Data(); update(); });
    if (sel.value) update();
  }
  function wireCommunitySelect() {
    const sel = document.getElementById('s0-community');
    if (!sel) return;
    function update() {
      const det = document.getElementById('s0-community-detail');
      const d = COMMUNITY_DATA[sel.value];
      if (!det) return;
      if (!d) { det.style.display = 'none'; return; }
      det.style.display = '';
      det.innerHTML = `<div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:5px;padding:12px 14px;margin-top:10px;">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px;">${sel.value.toUpperCase()} FEATURES</div>
        <p style="font-size:12px;line-height:1.7;margin-bottom:8px;">${d.description}</p>
        ${d.features.map(f=>`<div style="font-size:12px;line-height:1.7;margin-bottom:4px;padding-left:10px;border-left:2px solid var(--gold-dim);"><strong>${f.name}:</strong> ${f.text.replace(/<[^>]*>/g,'')}</div>`).join('')}
      </div>`;
    }
    sel.addEventListener('change', () => { if (sel.id) s0Data[sel.id] = sel.value; saveS0Data(); update(); });
    if (sel.value) update();
  }
  wireClassSelect();
  wireAncestrySelect();
  wireCommunitySelect();

  // Wire "Apply to Sheet" button on done step
  const applyBtn = document.getElementById('s0-apply-btn');
  if (applyBtn) {
    applyBtn.onclick = () => {
      s0ApplyAndGo();
    };
  }

  // Re-attach textarea listeners — support both id-keyed and data-qkey-keyed
  wiz.querySelectorAll('textarea,input[type=text]').forEach(el => {
    el.addEventListener('input', () => {
      const key = el.dataset.qkey || el.id;
      if (key) { s0Data[key] = el.value; saveS0Data(); }
    });
    const key = el.dataset.qkey || el.id;
    if (key && s0Data[key] !== undefined && !el.value) el.value = s0Data[key];
  });
  // Re-attach select listeners
  wiz.querySelectorAll('select').forEach(el => {
    el.addEventListener('change', () => {
      if (el.id) s0Data[el.id] = el.value;
      saveS0Data();
      if (el.id === 's0-class') renderS0(); // re-render on class change
    });
    if (el.id && s0Data[el.id]) el.value = s0Data[el.id];
  });
}

function s0Card(title, body, accent) {
  return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${accent||'var(--border2)'};border-radius:0 6px 6px 0;padding:12px 14px;margin-bottom:10px;">${title?`<div style="font-family:'Cinzel',serif;font-size:10px;font-weight:700;letter-spacing:0.12em;color:${accent||'var(--muted)'};margin-bottom:5px;">${title}</div>`:''}${body}</div>`;
}

function s0Section(title, content) {
  return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:1rem;">
    <div style="background:var(--bg3);border-bottom:1px solid var(--border);padding:10px 14px;">
      <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:0.1em;color:var(--gold);">${title}</div>
    </div>
    <div style="padding:14px;">${content}</div>
  </div>`;
}

function renderS0Step(id) {
  const cls = s0Data['s0-class'] || '';
  const clsData = CLASSES[cls];

  switch(id) {

    case 'welcome': return s0Section('Welcome to Daggerheart', `
      <p style="font-size:16px;line-height:1.8;margin-bottom:1.25rem;">You're about to build a character for <strong>Daggerheart</strong> — a fantasy tabletop RPG built around collaborative storytelling, dramatic moments, and a dice system unlike anything you've played before.</p>

      <p style="font-size:14px;line-height:1.8;margin-bottom:1.5rem;color:var(--muted);">This guide will walk you through everything step by step. Pick what excites you. There are no wrong answers.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.25rem;">
        ${s0Card('✦ Different from D&D', `<p style="font-size:13px;line-height:1.7;">No initiative. No action economy. The story flows — players and the GM trade the spotlight naturally. Every roll has a consequence, win or lose.</p>`, 'var(--teal)')}
        ${s0Card('⚔ Hope & Fear', `<p style="font-size:13px;line-height:1.7;">Two dice. One gold, one red. The higher one sets the tone — even a success can invite danger, and even a failure can bring opportunity.</p>`, 'var(--gold)')}
        ${s0Card('◈ Domain Cards', `<p style="font-size:13px;line-height:1.7;">Your special abilities aren't passive stats — they're cards you load up before an adventure and spend in the moment. Manage them carefully.</p>`, 'var(--red)')}
        ${s0Card('✧ Your Story', `<p style="font-size:13px;line-height:1.7;">Experiences, ancestry, community — your character's history shapes what they're good at in ways that feel personal, not just mechanical.</p>`, 'var(--muted)')}
      </div>

      <p style="font-size:13px;color:var(--muted);line-height:1.7;">This walkthrough takes about <strong style="color:var(--text);">30–45 minutes</strong> on your own, longer if you're doing it with your whole table. Your progress saves automatically.</p>
    `);

    case 'how-dice': {
      const traitName = cls && clsData ? Object.entries({Agility:clsData.traits.agility,Strength:clsData.traits.strength,Finesse:clsData.traits.finesse,Instinct:clsData.traits.instinct,Presence:clsData.traits.presence,Knowledge:clsData.traits.knowledge}).sort((a,b)=>b[1]-a[1])[0][0] : 'Presence';
      const traitVal = cls && clsData ? Math.max(...Object.values(clsData.traits)) : 2;
      return s0Section('How Rolls Work', `
        <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">When you try something risky, you roll <strong style="color:var(--gold);">two d12s</strong> — a gold Hope Die and a red Fear Die. Take the <strong>higher number</strong>, add your relevant trait, and compare to the Difficulty the GM sets.</p>

        <div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:6px;padding:12px 14px;margin-bottom:1rem;font-size:13px;line-height:1.8;">
          <strong style="color:var(--gold);">Example:</strong> Your ${cls||'character'} rolls to ${cls==='Bard'?'charm a guard':'make a bold move'}. You roll the two dice and get <strong style="color:var(--gold);">8</strong> (Hope) and <strong style="color:var(--red);">5</strong> (Fear). You add your ${traitName} of <strong>+${traitVal}</strong>. Total: <strong>${8+traitVal}</strong>. If the Difficulty is 12, you succeed — and the Hope Die was higher, so you also gain a Hope token.
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:1rem;">
          <div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:6px;padding:10px 12px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--gold);letter-spacing:0.1em;margin-bottom:5px;">SUCCESS WITH HOPE ✦</div>
            <p style="font-size:12px;line-height:1.6;color:var(--muted);">You get what you want. You gain 1 Hope to spend later.</p>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--red-dim);border-radius:6px;padding:10px 12px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--red);letter-spacing:0.1em;margin-bottom:5px;">SUCCESS WITH FEAR ✦</div>
            <p style="font-size:12px;line-height:1.6;color:var(--muted);">You get what you want — but the GM gains 1 Fear and makes a move.</p>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:6px;padding:10px 12px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--gold);letter-spacing:0.1em;margin-bottom:5px;">FAILURE WITH HOPE ✦</div>
            <p style="font-size:12px;line-height:1.6;color:var(--muted);">Things don't go your way, but you gain 1 Hope. Silver lining.</p>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--red-dim);border-radius:6px;padding:10px 12px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--red);letter-spacing:0.1em;margin-bottom:5px;">FAILURE WITH FEAR ✦</div>
            <p style="font-size:12px;line-height:1.6;color:var(--muted);">Things go badly. GM gains 1 Fear. Major consequences coming.</p>
          </div>
        </div>

        <div style="background:var(--bg3);border:1px solid var(--teal-dim);border-radius:6px;padding:10px 12px;">
          <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--teal);letter-spacing:0.1em;margin-bottom:4px;">CRITICAL SUCCESS — DOUBLES</div>
          <p style="font-size:12px;line-height:1.6;color:var(--muted);">Both dice show the same number. Automatic success regardless of Difficulty. Gain Hope, clear Stress, deal bonus damage on attacks.</p>
        </div>
      `);
    }

    case 'how-hope': return s0Section('Hope & Fear', `
      <p style="font-size:14px;line-height:1.8;margin-bottom:1.25rem;">Hope and Fear are a shared economy between players and GM — a constant tug-of-war that reflects how the story is going.</p>
      ${s0Card('YOU SPEND HOPE TO:', `<ul style="font-size:13px;line-height:1.9;padding-left:1.2rem;"><li>Add an Experience bonus to a roll</li><li>Activate class Hope abilities</li><li>Help an ally (give them advantage)</li><li>Recall a spent domain card (mark Stress = Recall Cost)</li></ul>`, 'var(--gold)')}
      ${s0Card('GM SPENDS FEAR TO:', `<ul style="font-size:13px;line-height:1.9;padding-left:1.2rem;"><li>Make enemies act between PC turns</li><li>Introduce complications mid-scene</li><li>Trigger environmental dangers</li><li>Escalate the stakes dramatically</li></ul>`, 'var(--red)')}
      <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-top:8px;">The GM can hold up to 12 Fear and it carries between sessions — so a quiet session now can mean a dangerous one next time.</p>
    `);

    case 'how-combat': return s0Section('Combat, Damage & Resting', `
      <p style="font-size:14px;line-height:1.8;margin-bottom:1.25rem;">Daggerheart combat is fluid and narrative-first. There are no strict initiative turns — the GM and players trade off the spotlight using Hope and Fear.</p>
      ${s0Card('HP & STRESS', `<p style="font-size:13px;line-height:1.75;margin-bottom:8px;">You have two damage tracks. <strong>Stress</strong> is mental and emotional strain — manageable but limiting. <strong>Hit Points</strong> are physical wounds. When you mark your last HP, you make a <strong>Death Move</strong> — a dramatic moment that might save you, change you, or end your story.</p>`, 'var(--red)')}
      ${s0Card('DAMAGE THRESHOLDS', `<p style="font-size:13px;line-height:1.75;">Instead of subtracting exact numbers, damage is compared against three thresholds. Below Minor = nothing. Minor = mark 1 HP. Major = mark 2 HP. Severe = mark 3 HP. <strong>Add your level to all thresholds</strong> — you get tougher as you grow.</p>`, 'var(--gold)')}
      ${s0Card('ARMOR & EVASION', `<p style="font-size:13px;line-height:1.75;">Your <strong>Evasion</strong> is the Difficulty for attacks against you. When an attack succeeds, you can mark an <strong>Armor Slot</strong> to reduce the damage severity by one threshold. Slots clear on a rest.</p>`, 'var(--teal)')}
      ${s0Card('RESTS', `<div style="font-size:13px;line-height:1.75;"><p style="margin-bottom:6px;"><strong>Short rest (~1hr):</strong> Swap domain cards freely, then take <strong>2 downtime moves</strong>:<br>• <em>Tend Wounds</em> — clear 1d4+Tier HP for you or an ally<br>• <em>Clear Stress</em> — clear 1d4+Tier Stress<br>• <em>Repair Armor</em> — clear 1d4+Tier Armor Slots<br>• <em>Prepare</em> — gain 1 Hope (2 Hope each if done with allies)<br><span style="color:var(--muted);font-size:12px;">GM gains 1d4 Fear.</span></p><p><strong>Long rest (several hrs):</strong> Same moves but full versions — clear ALL HP / Stress / Armor. Also: <em>Work on a Project</em>. After 3 short rests in a row, next must be a long rest.<br><span style="color:var(--muted);font-size:12px;">GM gains 1d4 + number of PCs Fear.</span></p></div>`, 'var(--muted)')}
    `);

    case 'pick-class': return s0Section('Choose Your Class', `
      <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">Your class is the foundation of who you are as an adventurer — your core mechanic, your starting stats, and which two <strong>domains</strong> you draw from. Browse the options below and pick what excites you.</p>
      <div style="margin-bottom:1.25rem;">
        <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);display:block;margin-bottom:6px;">YOUR CLASS</span>
        <select id="s0-class" style="width:100%;font-family:'Cinzel',serif;font-size:14px;background:var(--bg3);border:1px solid var(--gold-dim);color:var(--text);padding:10px 12px;border-radius:4px;outline:none;">
          <option value="">— Choose a class —</option>
          ${Object.keys(CLASSES).map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div id="s0-class-preview"></div>
      <div style="margin-top:1.25rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);">ALL CLASSES AT A GLANCE</div>
          <button id="s0-toggle-classes" onclick="
            var cards=document.getElementById('s0-all-cards');
            var isHidden=cards.style.display==='none';
            cards.style.display=isHidden?'':'none';
            this.textContent=isHidden?'▲ Hide':'▼ Show all';
          " style="font-family:'Cinzel',serif;font-size:9px;background:none;border:1px solid var(--border2);color:var(--muted);padding:3px 10px;border-radius:3px;cursor:pointer;">▼ Show all</button>
        </div>
        <div id="s0-all-cards" style="display:none;display:grid;grid-template-columns:1fr;gap:8px;">
          ${Object.entries(CLASSES).map(([name,c])=>`
          <div onclick="document.getElementById('s0-class').value='${name}';document.getElementById('s0-class').dispatchEvent(new Event('change'));"
            style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px 14px;cursor:pointer;transition:border-color 0.15s,background 0.15s;" id="s0-classcard-${name}">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
              <span style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--text);">${name}</span>
              <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:0.1em;">${c.domains}</span>
            </div>
            <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:6px;">${c.tagline}</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:9px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:2px 7px;color:var(--muted);">${c.featureName}</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:9px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:2px 7px;color:var(--muted);">Evasion ${c.evasionStart}</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:9px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:2px 7px;color:var(--muted);font-style:italic;">${c.descOptions.attitude}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>
    `);

    case 'how-class': {
      if (!cls || !clsData) return s0Section('Your Class', `<p style="color:var(--muted);">Go back and pick a class first.</p>`);
      return s0Section('Your Class — ' + cls, `
        <p style="font-size:14px;line-height:1.8;margin-bottom:1.25rem;">${clsData.tagline}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.25rem;">
          <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:12px 14px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.12em;color:var(--muted);margin-bottom:4px;">DOMAINS</div>
            <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--gold);">${clsData.domains}</div>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:12px 14px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.12em;color:var(--muted);margin-bottom:4px;">STARTING EVASION</div>
            <div style="font-size:20px;font-weight:700;color:var(--gold);">${clsData.evasionStart}</div>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:12px 14px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.12em;color:var(--muted);margin-bottom:4px;">HIT POINTS</div>
            <div style="font-size:20px;font-weight:700;color:var(--red);">${clsData.hpStart}</div>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:12px 14px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.12em;color:var(--muted);margin-bottom:4px;">STRESS SLOTS</div>
            <div style="font-size:20px;font-weight:700;color:var(--muted);">${clsData.stressStart}</div>
          </div>
        </div>

        ${s0Card(clsData.featureName, `<p style="font-size:13px;line-height:1.75;">${clsData.featureBody.replace(/<[^>]*>/g,'')}</p>`, 'var(--teal)')}
        ${s0Card('HOPE ABILITY', `<p style="font-size:13px;line-height:1.75;">${clsData.featureHope.replace(/<[^>]*>/g,'')}</p>`, 'var(--gold)')}

        <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:12px 14px;margin-top:8px;">
          <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.12em;color:var(--muted);margin-bottom:8px;">SUGGESTED STARTING TRAITS</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${Object.entries({Agility:clsData.traits.agility,Strength:clsData.traits.strength,Finesse:clsData.traits.finesse,Instinct:clsData.traits.instinct,Presence:clsData.traits.presence,Knowledge:clsData.traits.knowledge}).map(([name,val])=>{
              const sign = val > 0 ? '+' : '';
              const col = val > 0 ? 'var(--teal)' : val < 0 ? 'var(--red)' : 'var(--muted)';
              return '<div style="background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:5px 10px;font-size:12px;"><span style="color:var(--muted);font-size:10px;font-family:\'Cinzel\',serif;letter-spacing:0.08em;">'+name+' </span><strong style="color:'+col+';">'+sign+val+'</strong></div>';
            }).join('')}
          </div>
        </div>
      `);
    }

    case 'pick-subclass': {
      const subs = cls && SUBCLASSES[cls] ? SUBCLASSES[cls].subclasses : [];
      return s0Section('Choose Your Subclass', `
        ${!cls ? `<p style="color:var(--muted);font-style:italic;">Go back and choose a class first.</p>` : `
        <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">Every <strong>${cls}</strong> chooses one of two subclasses. Your subclass sets your <strong>Spellcast trait</strong> and gives you a path of three features — Foundation (level 1), Specialization (level 5), and Mastery (level 8).</p>
        <div style="margin-bottom:1.5rem;">
          <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);display:block;margin-bottom:6px;">YOUR CHOICE</span>
          <select id="s0-subclass" style="width:100%;font-family:'Cinzel',serif;font-size:14px;background:var(--bg3);border:1px solid var(--gold-dim);color:var(--text);padding:10px 12px;border-radius:4px;outline:none;">
            <option value="">— Choose a subclass —</option>
            ${subs.map(s=>`<option value="${s.name}">${s.name}</option>`).join('')}
          </select>
        </div>`}
      `);
    }

    case 'pick-ancestry': return s0Section('Choose Your Ancestry', `
      <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">Your ancestry is <em>what you are</em> — the physical and cultural heritage you were born into. Each ancestry gives you unique features that stack on top of your class abilities.</p>
      <div style="margin-bottom:1rem;">
        <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);display:block;margin-bottom:6px;">YOUR ANCESTRY</span>
        <select id="s0-ancestry" style="width:100%;font-family:'Cinzel',serif;font-size:14px;background:var(--bg3);border:1px solid var(--gold-dim);color:var(--text);padding:10px 12px;border-radius:4px;outline:none;">
          <option value="">— Choose an ancestry —</option>
          ${Object.keys(ANCESTRY_DATA).map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div id="s0-ancestry-detail" style="display:none;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:0.75rem;">
        ${Object.entries(ANCESTRY_DATA).map(([name,d])=>`
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:8px 10px;cursor:pointer;transition:border-color 0.15s;" onclick="document.getElementById('s0-ancestry').value='${name}';document.getElementById('s0-ancestry').dispatchEvent(new Event('change'));">
          <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px;">${name}</div>
          <div style="font-size:11px;color:var(--muted);line-height:1.5;">${d.description.split('.')[0]}.</div>
        </div>`).join('')}
      </div>
      <div data-s0-init="ancestry-select"></div>
    `);

    case 'pick-community': return s0Section('Choose Your Community', `
      <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">Your community is <em>how you were raised</em> — the society and culture that shaped your values, skills, and worldview. It's separate from your ancestry and adds another layer of features.</p>
      <div style="margin-bottom:1rem;">
        <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);display:block;margin-bottom:6px;">YOUR COMMUNITY</span>
        <select id="s0-community" style="width:100%;font-family:'Cinzel',serif;font-size:14px;background:var(--bg3);border:1px solid var(--gold-dim);color:var(--text);padding:10px 12px;border-radius:4px;outline:none;">
          <option value="">— Choose a community —</option>
          ${Object.keys(COMMUNITY_DATA).map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div id="s0-community-detail" style="display:none;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:0.75rem;">
        ${Object.entries(COMMUNITY_DATA).map(([name,d])=>`
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:8px 10px;cursor:pointer;" onclick="document.getElementById('s0-community').value='${name}';document.getElementById('s0-community').dispatchEvent(new Event('change'));">
          <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px;">${name}</div>
          <div style="font-size:11px;color:var(--muted);line-height:1.5;">${d.description.split('.')[0]}.</div>
        </div>`).join('')}
      </div>
      <div data-s0-init="community-select"></div>
    `);

    case 'traits': {
      const traitList = ['agility','strength','finesse','instinct','presence','knowledge'];
      const traitDesc = {
        agility:['Sprint, Leap, Maneuver','Speed, acrobatics, ranged attacks for some classes.'],
        strength:['Lift, Smash, Grapple','Physical force, melee attacks, breaking things.'],
        finesse:['Control, Hide, Tinker','Precision, stealth, lockpicking, delicate work.'],
        instinct:['Perceive, Sense, Navigate','Awareness, survival, reading the room.'],
        presence:['Charm, Perform, Deceive','Social influence, leadership, performance.'],
        knowledge:['Recall, Analyze, Comprehend','Lore, investigation, magical study.']
      };
      // Use saved s0 value only — start blank if not yet filled
      const liveTraits = traitList.map(t => {
        const savedKey = 's0-trait-' + t;
        const val = s0Data[savedKey] !== undefined ? s0Data[savedKey] : '';
        return { name:t, val };
      });
      return s0Section('Your Traits', `
        <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:10px 14px;margin-bottom:14px;"><div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.12em;color:var(--gold);margin-bottom:6px;">STAT ARRAY</div><div style="font-size:13px;color:var(--text);line-height:1.6;">Assign these six modifiers to your traits in any order: <strong style="color:var(--gold);">+2, +1, +1, +0, +0, −1</strong>. Your class suggests which traits to prioritize, but the choice is yours.</div></div>
        <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">These are your six core stats. ${cls && clsData ? `Your <strong>${cls}</strong> starts with the suggested spread — edit any value and it'll sync to your character sheet.` : 'Choose a class first to see suggested traits.'}</p>
        ${cls && clsData ? `<div class="hint-text" style="background:var(--bg3);border:1px solid var(--gold-dim);border-left:3px solid var(--gold);border-radius:0 5px 5px 0;padding:10px 14px;margin-bottom:1rem;font-size:13px;line-height:1.7;">Suggested: <strong>${clsData.suggestedTraits.replace(/\n/g,' · ')}</strong></div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem;">
          ${liveTraits.map(({name,val})=>`
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:10px 12px;display:flex;align-items:center;gap:10px;">
            <input type="number" id="s0-trait-${name}" value="${val}"
              oninput="s0SyncTrait('${name}', this.value)"
              style="width:52px;font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:var(--gold);background:var(--bg2);border:1px solid var(--border2);border-radius:3px;text-align:center;outline:none;padding:4px 0;flex-shrink:0;">
            <div>
              <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--text);">${name.charAt(0).toUpperCase()+name.slice(1)}</div>
              <div style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);">${traitDesc[name][0]}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:1px;">${traitDesc[name][1]}</div>
            </div>
          </div>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--muted);font-style:italic;">These values sync directly to your character sheet.</p>
      `);
    }


    case 'experiences': {
      // Read experiences from s0Data
      let exps = s0Data['s0-exps'] || [];
      // Ensure at least 2 rows
      while (exps.length < 2) exps.push(['', '+2']);

      return s0Section('Experiences & Domain Cards', `
        <p style="font-size:14px;line-height:1.8;margin-bottom:0.5rem;">Experiences are specific things your character excels at beyond their raw stats. Work with your GM to come up with two. They should feel personal — not just <em>"fighting"</em> but <em>"fighting while outnumbered."</em></p>
        <p style="font-size:12px;color:var(--muted);font-style:italic;margin-bottom:1.25rem;">Examples: Navigating ruins +2 · Persuading sailors +2 · Surviving the wilderness +3 · Reading ancient texts +2</p>

        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:1rem;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:0.1em;margin-bottom:10px;">YOUR EXPERIENCES</div>
          ${exps.map((e,i) => `
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            <input type="text" id="s0-exp-name-${i}" value="${escHtml(e[0]||'')}" placeholder="Experience name..."
              oninput="s0SaveExp()"
              style="flex:1;background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:8px 10px;color:var(--text);font-family:'Crimson Pro',serif;font-size:14px;outline:none;">
            <input type="text" id="s0-exp-bonus-${i}" value="${escHtml(e[1]||'+2')}" placeholder="+2"
              oninput="s0SaveExp()"
              style="width:54px;background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:8px;color:var(--gold);font-family:'Cinzel',serif;font-size:13px;text-align:center;outline:none;">
            <button onclick="s0RemoveExp(${i})" style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;padding:0 4px;">×</button>
          </div>`).join('')}
          <button onclick="s0AddExpRow()" style="width:100%;margin-top:4px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:none;border:1px dashed var(--border2);color:var(--muted);padding:7px;border-radius:3px;cursor:pointer;">+ Add Experience</button>
        </div>

        ${s0Card('DOMAIN CARDS', `
          <p style="font-size:13px;line-height:1.75;margin-bottom:8px;">At level 1 you start with <strong>2 domain cards</strong>. Browse and add cards from your class's domains${cls && clsData ? ` — <strong>${clsData.domains}</strong>` : ''}.</p>
          <button onclick="s0GoToDomainCards()" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:7px 16px;border-radius:4px;cursor:pointer;">Browse Domain Cards →</button>
        `, 'var(--gold)')}
      `);
    }


    case 'connections': {
      const suggested = [
        'How did you all end up together — was it chance, a shared cause, or someone who called in a favor?',
        'Who in this group do you trust most with your life? Who are you still figuring out?',
        'What\'s something one of the other characters knows about you that the rest of the party doesn\'t?',
        'You\'ve already been through something hard together. What was it, and did it bring you closer or create tension?',
        'Who in this group challenges you the most — and why do you keep travelling with them anyway?',
        'Who owes who a favor? Is it the kind that can actually be repaid?',
        'What\'s something you\'ve noticed about another character that they probably don\'t realize you\'ve noticed?',
        'If everything goes wrong on this adventure, who do you trust to make the hard call?',
        'What does another character do that secretly annoys you, even though you\'d never say it?',
        'Who in the party has surprised you the most since you\'ve been travelling together?',
        'Is there anyone in this group you\'d die for without hesitation? Anyone you\'re not sure about?',
        'What\'s a moment you witnessed that made you think differently about someone in the party?',
        'Does anyone in the group keep a secret from the others? Do you know what it is?',
        'What\'s something the party does together that feels like a ritual or tradition, even if you\'ve never said it out loud?',
      ];
      const active = s0Data['s0-conn-qs'] ? JSON.parse(s0Data['s0-conn-qs']) : [];
      return s0Section('Party Connections', `
        <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">Go around the table and answer these together. Add suggested questions from the dropdown, or write your own. When done, hit <strong>Send to Background</strong>.</p>

        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:1rem;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:0.1em;margin-bottom:8px;">ADD A SUGGESTED QUESTION</div>
          <div style="display:flex;gap:8px;">
            <select id="s0-conn-suggest" style="flex:1;font-family:'Crimson Pro',serif;font-size:13px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:7px 10px;border-radius:4px;outline:none;">
              <option value="">— Pick a question to add —</option>
              ${suggested.filter(q => !active.includes(q)).map(q => `<option value="${escHtml(q)}">${q.length > 70 ? q.substring(0,70)+'…' : q}</option>`).join('')}
            </select>
            <button onclick="s0AddConnQuestion()" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:7px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;">+ Add</button>
          </div>
        </div>

        <div id="s0-conn-list">
          ${active.map((q,i) => {
            const key = 'conn:' + s0QKey(q);
            const saved = s0Data[key] || '';
            return `
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:10px;">
            <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
              <p style="font-size:13px;font-weight:600;color:var(--text);line-height:1.6;flex:1;">${q}</p>
              <button onclick="s0RemoveConnQuestion(${i})" style="background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;line-height:1;flex-shrink:0;padding:0;">×</button>
            </div>
            <textarea data-qkey="${key}" rows="2" placeholder="Discuss at the table and write what you agreed on..." style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:7px 9px;color:var(--text);font-family:'Crimson Pro',serif;font-size:13px;resize:none;outline:none;line-height:1.6;">${escHtml(saved)}</textarea>
          </div>`;
          }).join('')}
        </div>

        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:1rem;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:0.1em;margin-bottom:8px;">WRITE YOUR OWN QUESTION</div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="s0-conn-custom-input" placeholder="Ask something specific to your party..." style="flex:1;background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:8px 10px;color:var(--text);font-family:'Crimson Pro',serif;font-size:13px;outline:none;">
            <button onclick="s0AddConnCustom()" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:7px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;">+ Add</button>
          </div>
        </div>

        <button onclick="s0SendConnectionsToBackground()" style="width:100%;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:10px;border-radius:4px;cursor:pointer;">↓ Send Answers to Character Background</button>
      `);
    }

    case 'group-questions': {
      const suggested = [
        'What tone does the group want? (Gritty & grounded / Heroic & epic / Dark & tragic / Somewhere in between)',
        'Are there any themes or content that anyone wants to avoid entirely? Write them down.',
        'How much roleplay vs. combat does the group want on average?',
        'What does this party care about more than anything — gold, justice, survival, glory, or each other?',
        'When things go wrong, does this group push forward together or does everyone look out for themselves?',
        'What\'s the group\'s relationship with authority — work within the system, around it, or against it?',
        'How do you handle player absence — does the story pause, or does someone run the absent character?',
        'Is this a long campaign or a shorter arc? Does everyone have the same expectations?',
        'How do you want to handle character death — is it permanent, or is resurrection on the table?',
        'Are we keeping secrets between characters, or do players share info out-of-character freely?',
        'What\'s the food/snack situation at the table?',
        'How do you prefer to end sessions — at a natural beat, on a cliffhanger, or at a set time?',
      ];
      const active = s0Data['s0-grp-qs'] ? JSON.parse(s0Data['s0-grp-qs']) : [];
      return s0Section('Table Agreements', `
        <p style="font-size:14px;line-height:1.8;margin-bottom:1rem;">These are for the whole table — GM included. Add suggested questions or write your own. When done, hit <strong>Send to Background</strong>.</p>

        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:1rem;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:0.1em;margin-bottom:8px;">ADD A SUGGESTED QUESTION</div>
          <div style="display:flex;gap:8px;">
            <select id="s0-grp-suggest" style="flex:1;font-family:'Crimson Pro',serif;font-size:13px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:7px 10px;border-radius:4px;outline:none;">
              <option value="">— Pick a question to add —</option>
              ${suggested.filter(q => !active.includes(q)).map(q => `<option value="${escHtml(q)}">${q.length > 70 ? q.substring(0,70)+'…' : q}</option>`).join('')}
            </select>
            <button onclick="s0AddGrpQuestion()" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:7px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;">+ Add</button>
          </div>
        </div>

        <div id="s0-grp-list">
          ${active.map((q,i) => {
            const key = 'grp:' + s0QKey(q);
            const saved = s0Data[key] || '';
            return `
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:10px;">
            <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
              <p style="font-size:13px;font-weight:600;color:var(--text);line-height:1.6;flex:1;">${q}</p>
              <button onclick="s0RemoveGrpQuestion(${i})" style="background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;line-height:1;flex-shrink:0;padding:0;">×</button>
            </div>
            <textarea data-qkey="${key}" rows="2" placeholder="Discuss and write your answer..." style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:7px 9px;color:var(--text);font-family:'Crimson Pro',serif;font-size:13px;resize:none;outline:none;line-height:1.6;">${escHtml(saved)}</textarea>
          </div>`;
          }).join('')}
        </div>

        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:12px 14px;margin-bottom:1rem;">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:0.1em;margin-bottom:8px;">WRITE YOUR OWN QUESTION</div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="s0-grp-custom-input" placeholder="Add a house rule, preference, or anything else..." style="flex:1;background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:8px 10px;color:var(--text);font-family:'Crimson Pro',serif;font-size:13px;outline:none;">
            <button onclick="s0AddGrpCustom()" style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:7px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;">+ Add</button>
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.12em;color:var(--muted);display:block;margin-bottom:6px;">ADDITIONAL NOTES</span>
          <textarea id="s0-extra-notes" rows="3" placeholder="Lines & veils, house rules, scheduling notes..." style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:8px 10px;color:var(--text);font-family:'Crimson Pro',serif;font-size:13px;resize:none;outline:none;line-height:1.6;"></textarea>
        </div>

        <button onclick="s0SendGroupToBackground()" style="width:100%;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:10px;border-radius:4px;cursor:pointer;">↓ Send Table Agreements to Background</button>
      `);
    }


    case 'done': {
      // Apply session 0 choices to sheet fields
      const applyToSheet = () => s0ApplyAndGo();
      return s0Section('You\'re Ready to Play', `
        <p style="font-size:15px;line-height:1.8;margin-bottom:1rem;">Session 0 complete. Here's a summary of what you've decided:</p>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:1.25rem;">
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px;line-height:1.9;">
            <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--muted);">CLASS</span><span style="font-weight:600;">${s0Data['s0-class']||'—'}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--muted);">SUBCLASS</span><span>${s0Data['s0-subclass']||'—'}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--muted);">ANCESTRY</span><span>${s0Data['s0-ancestry']||'—'}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--muted);">COMMUNITY</span><span>${s0Data['s0-community']||'—'}</span>
          </div>
        </div>
        ${s0Card('WHAT\'S ALREADY DONE', `<ul style="font-size:13px;line-height:1.9;padding-left:1.2rem;">
          <li>Your class is set on the Character Sheet</li>
          <li>Any experiences you added are on the sheet</li>
          <li>Connection & table agreement answers are in your Character Background</li>
        </ul>`, 'var(--teal)')}
        ${s0Card('STILL TO DO', `<ul style="font-size:13px;line-height:1.9;padding-left:1.2rem;">
          <li>Fill in your character name, pronouns on the sheet</li>
          <li>Set your HP and Stress totals</li>
          <li>Add your 2 starting domain cards (use Domain Cards tab)</li>
          <li>Review your class feature and subclass Foundation</li>
          <li>Hit <strong>Save</strong></li>
        </ul>`, 'var(--gold)')}
        <button id="s0-apply-btn" onclick="s0ApplyAndGo()" style="width:100%;margin-top:1rem;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.1em;background:var(--gold-faint);border:1px solid var(--gold-dim);color:var(--gold);padding:13px;border-radius:4px;cursor:pointer;">Apply to Sheet & Go →</button>
      `);
      // Wire the button after render via post-render hook marker
    }


    default: return '';
  }
}

function s0SyncTrait(traitName, value) {
  s0Data['s0-trait-' + traitName] = value;
  saveS0Data();
  // Sync to sheet input
  const sheetEl = document.getElementById('t-' + traitName);
  if (sheetEl) sheetEl.value = value;
  // Save to s0Data for transfer to sheet
  saveS0Data();
}

function s0SaveExp() {
  const exps = [];
  let i = 0;
  while (document.getElementById('s0-exp-name-' + i)) {
    const name = document.getElementById('s0-exp-name-' + i)?.value || '';
    const bonus = document.getElementById('s0-exp-bonus-' + i)?.value || '+2';
    exps.push([name, bonus]);
    i++;
  }
  s0Data['s0-exps'] = exps;
  saveS0Data();
}

function s0AddExpRow() {
  s0SaveExp(); // save current values first
  s0Data['s0-exps'] = s0Data['s0-exps'] || [];
  s0Data['s0-exps'].push(['', '+2']);
  saveS0Data();
  renderS0();
}

function s0RemoveExp(idx) {
  s0SaveExp(); // save current first
  s0Data['s0-exps'] = s0Data['s0-exps'] || [];
  s0Data['s0-exps'].splice(idx, 1);
  saveS0Data();
  renderS0();
}



// Key answers by question text slug so they survive re-renders
function s0SaveCurrentAnswers(prefix) {
  const list = document.getElementById('s0-' + prefix + '-list');
  if (!list) return;
  [...list.children].forEach(block => {
    const ta = block.querySelector('textarea');
    if (ta && ta.dataset.qkey) s0Data[ta.dataset.qkey] = ta.value;
  });
  saveS0Data();
}

function s0AddConnQuestion() {
  const sel = document.getElementById('s0-conn-suggest');
  if (!sel || !sel.value) return;
  s0SaveCurrentAnswers('conn');
  const qs = s0Data['s0-conn-qs'] ? JSON.parse(s0Data['s0-conn-qs']) : [];
  if (!qs.includes(sel.value)) qs.push(sel.value);
  s0Data['s0-conn-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0AddConnCustom() {
  const input = document.getElementById('s0-conn-custom-input');
  if (!input || !input.value.trim()) return;
  s0SaveCurrentAnswers('conn');
  const qs = s0Data['s0-conn-qs'] ? JSON.parse(s0Data['s0-conn-qs']) : [];
  qs.push(input.value.trim());
  s0Data['s0-conn-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0RemoveConnQuestion(idx) {
  s0SaveCurrentAnswers('conn');
  const qs = s0Data['s0-conn-qs'] ? JSON.parse(s0Data['s0-conn-qs']) : [];
  qs.splice(idx, 1);
  s0Data['s0-conn-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0AddGrpQuestion() {
  const sel = document.getElementById('s0-grp-suggest');
  if (!sel || !sel.value) return;
  s0SaveCurrentAnswers('grp');
  const qs = s0Data['s0-grp-qs'] ? JSON.parse(s0Data['s0-grp-qs']) : [];
  if (!qs.includes(sel.value)) qs.push(sel.value);
  s0Data['s0-grp-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0AddGrpCustom() {
  const input = document.getElementById('s0-grp-custom-input');
  if (!input || !input.value.trim()) return;
  s0SaveCurrentAnswers('grp');
  const qs = s0Data['s0-grp-qs'] ? JSON.parse(s0Data['s0-grp-qs']) : [];
  qs.push(input.value.trim());
  s0Data['s0-grp-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0RemoveGrpQuestion(idx) {
  s0SaveCurrentAnswers('grp');
  const qs = s0Data['s0-grp-qs'] ? JSON.parse(s0Data['s0-grp-qs']) : [];
  qs.splice(idx, 1);
  s0Data['s0-grp-qs'] = JSON.stringify(qs);
  saveS0Data();
  renderS0();
}

function s0SendConnectionsToBackground() {
  s0SaveCurrentAnswers('conn');
  const qs = s0Data['s0-conn-qs'] ? JSON.parse(s0Data['s0-conn-qs']) : [];
  const entries = qs.map(q => {
    const key = 'conn:' + s0QKey(q);
    const a = (s0Data[key] || '').trim();
    return a ? q + '\n' + a : null;
  }).filter(Boolean);
  if (!entries.length) { alert('Fill in at least one answer first.'); return; }
  const ts = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  saveS0Data();
  alert('Answers saved! They will be added to your Character Background when you finish Session 0.');
}

function s0SendGroupToBackground() {
  s0SaveCurrentAnswers('grp');
  const qs = s0Data['s0-grp-qs'] ? JSON.parse(s0Data['s0-grp-qs']) : [];
  const entries = qs.map(q => {
    const key = 'grp:' + s0QKey(q);
    const a = (s0Data[key] || '').trim();
    return a ? q + ': ' + a : null;
  }).filter(Boolean);
  const notes = (s0Data['s0-extra-notes'] || '').trim();
  if (notes) entries.push('Additional notes: ' + notes);
  if (!entries.length) { alert('Fill in at least one answer first.'); return; }
  const ts = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  // Saved to s0Data for transfer to sheet
  alert('Table agreements sent to your Character Background!');
}


function s0FillSuggestedTraits() {
  // No-op: traits are never auto-filled
}


// ── APPLY S0 TO SHEET ──
// Called when user clicks "Apply to Sheet & Go" on the done step.
// Writes all S0 data to localStorage so sheet.html can restore it.
function s0ApplyAndGo() {
  const cls = s0Data['s0-class'];
  if (!cls) { alert('Please choose a class first.'); return; }

  // Save all S0 data to a transfer key that sheet.js picks up
  const transfer = {
    fromS0: true,
    class: cls,
    subclass: s0Data['s0-subclass'] || '',
    ancestry: s0Data['s0-ancestry'] || '',
    community: s0Data['s0-community'] || '',
    traits: {
      agility:   s0Data['s0-trait-agility']   || '',
      strength:  s0Data['s0-trait-strength']  || '',
      finesse:   s0Data['s0-trait-finesse']   || '',
      instinct:  s0Data['s0-trait-instinct']  || '',
      presence:  s0Data['s0-trait-presence']  || '',
      knowledge: s0Data['s0-trait-knowledge'] || '',
    },
    exps: s0Data['s0-exps'] || [],
    notes: s0Data['s0-extra-notes'] || '',
    connQs: s0Data['s0-conn-qs'] || '[]',
    grpQs:  s0Data['s0-grp-qs']  || '[]',
    s0Data: s0Data,
  };
  localStorage.setItem('dh2-s0-transfer', JSON.stringify(transfer));
  window.location.href = 'sheet.html';
}

// Ensure global exposure
window.s0ApplyAndGo = s0ApplyAndGo;
window.s0Go = s0Go;
window.s0GoTo = s0GoTo;
window.s0SyncTrait = s0SyncTrait;
window.s0SaveExp = s0SaveExp;
window.s0AddExpRow = s0AddExpRow;
window.s0RemoveExp = s0RemoveExp;
window.s0AddConnQuestion = s0AddConnQuestion;
window.s0AddConnCustom = s0AddConnCustom;
window.s0RemoveConnQuestion = s0RemoveConnQuestion;
window.s0AddGrpQuestion = s0AddGrpQuestion;
window.s0AddGrpCustom = s0AddGrpCustom;
window.s0RemoveGrpQuestion = s0RemoveGrpQuestion;
window.s0SendConnectionsToBackground = s0SendConnectionsToBackground;
window.s0SendGroupToBackground = s0SendGroupToBackground;
window.updateMixedAncestryPreview = updateMixedAncestryPreview;
