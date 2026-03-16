// ── canvas-render.js ── drawing, drag, pan, zoom, minimap

// ── RENDER (drawing, drag, pan, zoom) ──
// ── canvas-render.js ──
// Rendering: nodes, connections (pure canvas coords), pan/zoom, minimap

// ── TRANSFORM ──
function applyTransform() {
  canvas.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  document.getElementById('zoom-indicator').textContent = Math.round(zoom * 100) + '%';
  updateMinimap();
}

function resetView() {
  pan = { x: 300, y: 200 };
  zoom = 1;
  applyTransform();
}

// Convert screen coords → canvas coords
function clientToCanvas(cx, cy) {
  const rect = wrap.getBoundingClientRect();
  return {
    x: (cx - rect.left - pan.x) / zoom,
    y: (cy - rect.top  - pan.y) / zoom,
  };
}

// Convert canvas coords → screen coords
function canvasToClient(x, y) {
  const rect = wrap.getBoundingClientRect();
  return {
    x: x * zoom + pan.x + rect.left,
    y: y * zoom + pan.y + rect.top,
  };
}

// ── PAN ──
function setupPan() {
  let panning = false, sx, sy, spx, spy;
  wrap.addEventListener('mousedown', e => {
    // Only pan on bare canvas/background — not on notes or labels
    const onNode = e.target.closest('.note, .label');
    if (onNode) return;
    if (e.button !== 0) return;
    panning = true; sx = e.clientX; sy = e.clientY; spx = pan.x; spy = pan.y;
    wrap.classList.add('panning');
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!panning) return;
    pan.x = spx + (e.clientX - sx);
    pan.y = spy + (e.clientY - sy);
    applyTransform();
    if (connectMode && connectSource) updatePrevLine(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', () => { panning = false; wrap.classList.remove('panning'); });
}

// ── ZOOM ──
function setupZoom() {
  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const nz = Math.max(0.2, Math.min(3, zoom * factor));
    pan.x = mx - (mx - pan.x) * (nz / zoom);
    pan.y = my - (my - pan.y) * (nz / zoom);
    zoom = nz;
    applyTransform();
    renderConnections();
  }, { passive: false });
}

// ── RENDER NODES ──
function renderNode(node) {
  if (node.type === 'label') { renderLabel(node); return; }
  renderNote(node);
}

function renderNote(node) {
  const el = document.createElement('div');
  el.className = 'note c-' + node.color;
  el.id = node.id;
  el.style.left  = node.x + 'px';
  el.style.top   = node.y + 'px';
  el.style.width = (node.w || 220) + 'px';

  el.innerHTML = `
    <div class="note-header">
      <input class="note-title" placeholder="Title..." value="${esc(node.title)}"
        oninput="updateNode('${node.id}','title',this.value)">
      <button class="note-connect-btn" title="Connect to another note" onclick="startConnect('${node.id}')">⟶</button>
      <button class="note-del" title="Delete" onclick="deleteNode('${node.id}')">×</button>
    </div>
    <div class="note-body">
      <textarea class="note-text" placeholder="Write anything..." rows="4"
        oninput="updateNode('${node.id}','text',this.value);autoResize(this)"
      >${esc(node.text)}</textarea>
    </div>
    <div class="note-resize" title="Resize">◢</div>`;

  setupNoteDrag(el, node);
  setupNoteResize(el, node);
  setupNodeContext(el, node);

  // Connect click — only in connect mode
  el.addEventListener('click', e => {
    if (!connectMode) return;
    e.stopPropagation();
    handleNodeClickInConnectMode(node.id);
  });

  canvas.appendChild(el);

  // Auto-resize textarea on load
  setTimeout(() => {
    const ta = el.querySelector('.note-text');
    if (ta) autoResize(ta);
  }, 0);
}

function renderLabel(node) {
  const el = document.createElement('div');
  el.className = 'label';
  el.id = node.id;
  el.style.left = node.x + 'px';
  el.style.top  = node.y + 'px';

  const inp = document.createElement('input');
  inp.className = 'label-inp';
  inp.value = node.title || 'Section';
  inp.style.color = getColorVal(node.color);
  inp.addEventListener('input', () => {
    updateNode(node.id, 'title', inp.value);
    inp.style.width = Math.max(60, inp.value.length * 10) + 'px';
  });
  inp.style.width = Math.max(60, (node.title || 'Section').length * 10) + 'px';
  inp.addEventListener('mousedown', e => e.stopPropagation()); // typing ≠ drag

  // Connect click
  el.addEventListener('click', e => {
    if (!connectMode) return;
    e.stopPropagation();
    handleNodeClickInConnectMode(node.id);
  });

  el.appendChild(inp);
  setupLabelDrag(el, node);
  setupNodeContext(el, node);
  canvas.appendChild(el);
}

function autoResize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

// ── DRAG ──
function setupNoteDrag(el, node) {
  const header = el.querySelector('.note-header');
  header.addEventListener('mousedown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA') return;
    if (connectMode) return;
    startDrag(e, el, node);
  });
}

function setupLabelDrag(el, node) {
  el.addEventListener('mousedown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT') return; // let typing work
    if (connectMode) return;
    startDrag(e, el, node);
  });
}

function startDrag(e, el, node) {
  e.preventDefault();
  e.stopPropagation();
  const sx = e.clientX, sy = e.clientY;
  const nx = node.x,    ny = node.y;
  el.style.zIndex = 500;
  el.style.cursor = 'grabbing';
  let moved = false;

  function onMove(e) {
    moved = true;
    node.x = nx + (e.clientX - sx) / zoom;
    node.y = ny + (e.clientY - sy) / zoom;
    el.style.left = node.x + 'px';
    el.style.top  = node.y + 'px';
    renderConnections();
    updateMinimap();
  }
  function onUp() {
    el.style.zIndex = '';
    el.style.cursor = '';
    if (moved) saveData();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ── RESIZE ──
function setupNoteResize(el, node) {
  const handle = el.querySelector('.note-resize');
  if (!handle) return;
  handle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sw = node.w || 220;
    function onMove(e) {
      node.w = Math.max(160, sw + (e.clientX - sx) / zoom);
      el.style.width = node.w + 'px';
      renderConnections();
    }
    function onUp() { saveData(); document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ── CONTEXT MENU ──
function setupNodeContext(el, node) {
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    ctxTarget = node.id;
    showCtxMenu(e.clientX, e.clientY, true);
  });
}

function showCtxMenu(x, y, onNode) {
  const menu = document.getElementById('ctx-menu');
  document.getElementById('ctx-node-actions').style.display = onNode ? '' : 'none';
  ctxPos = clientToCanvas(x, y);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.style.display = 'block';
}

document.addEventListener('contextmenu', e => {
  if (!e.target.closest('.note') && !e.target.closest('.label')) {
    e.preventDefault();
    ctxTarget = null;
    showCtxMenu(e.clientX, e.clientY, false);
  }
});
document.addEventListener('click', () => {
  document.getElementById('ctx-menu').style.display = 'none';
});

// ── CONNECTIONS ──
// All coordinates stored as canvas-space, converted to screen space for rendering.
// This means they're always correct regardless of pan/zoom.

function getNodeCenter(id) {
  const node = nodes.find(n => n.id === id);
  if (!node) return null;
  const el = document.getElementById(id);
  if (!el) return null;
  // Canvas-space center
  const w = node.type === 'note' ? (node.w || 220) : el.offsetWidth;
  const h = el.offsetHeight;
  return {
    x: node.x + w / 2,
    y: node.y + h / 2,
  };
}

function canvasPtToSvg(cx, cy) {
  // SVG is inside #canvas which is transformed. SVG coords = canvas coords directly.
  return { x: cx, y: cy };
}

function renderConnections() {
  svg.querySelectorAll('.conn-line').forEach(el => el.remove());

  connections.forEach((conn, i) => {
    const a = getNodeCenter(conn.from);
    const b = getNodeCenter(conn.to);
    if (!a || !b) return;

    // Bezier control points — curve based on horizontal distance
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const cx1 = a.x + dx * 0.5;
    const cy1 = a.y;
    const cx2 = b.x - dx * 0.5;
    const cy2 = b.y;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('conn-line');
    path.setAttribute('d', `M${a.x},${a.y} C${cx1},${cy1} ${cx2},${cy2} ${b.x},${b.y}`);
    path.setAttribute('marker-end', 'url(#arrow)');

    // Click to remove
    path.addEventListener('click', e => {
      e.stopPropagation();
      connections.splice(i, 1);
      renderConnections();
      saveData();
    });

    svg.appendChild(path);
  });
}

// ── PREVIEW LINE (connect mode) ──
function updatePrevLine(clientX, clientY) {
  if (!connectSource) { hidePrevLine(); return; }
  const a = getNodeCenter(connectSource);
  if (!a) { hidePrevLine(); return; }

  // Convert client coords to canvas coords
  const target = clientToCanvas(clientX, clientY);

  previewLine.setAttribute('x1', a.x);
  previewLine.setAttribute('y1', a.y);
  previewLine.setAttribute('x2', target.x);
  previewLine.setAttribute('y2', target.y);
  previewLine.style.display = '';
}

function hidePrevLine() {
  previewLine.style.display = 'none';
}

// Update preview on mousemove over canvas wrap
wrap.addEventListener('mousemove', e => {
  if (connectMode && connectSource) updatePrevLine(e.clientX, e.clientY);
  else hidePrevLine();
});

// Click on bare canvas in connect mode = cancel source selection
wrap.addEventListener('click', e => {
  if (!connectMode) return;
  const onNode = e.target.closest('.note, .label');
  if (!onNode && connectSource) {
    connectSource = null;
    clearConnectHighlights();
    document.getElementById('connect-banner').textContent = 'CONNECT MODE — Click a note to start a connection';
    hidePrevLine();
  }
});

// ── MINIMAP ──
function updateMinimap() {
  const mini = document.getElementById('minimap');
  const vp   = document.getElementById('minimap-viewport');
  if (!mini || !vp) return;
  const scale = mini.clientWidth / 4000;
  vp.style.left   = Math.max(0, -pan.x / zoom * scale) + 'px';
  vp.style.top    = Math.max(0, -pan.y / zoom * scale) + 'px';
  vp.style.width  = Math.min(mini.clientWidth,  wrap.clientWidth  / zoom * scale) + 'px';
  vp.style.height = Math.min(mini.clientHeight, wrap.clientHeight / zoom * scale) + 'px';
}

// ── UTIL ──
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}
