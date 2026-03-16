// ── canvas-core.js ── state, save/load, nodes, connections

// DOM globals — defined here so canvas-render.js can use them
// ── DOM GLOBALS (must be first) ──
const canvas      = document.getElementById('canvas');
const wrap        = document.getElementById('canvas-wrap');
const svg         = document.getElementById('connections-svg');
const previewLine = document.getElementById('preview-line');

// ── CORE (state, save/load, nodes, connections) ──
// ── canvas-core.js ──
// State, save/load, node management, connection management

const SAVE_KEY = 'dh2-gm-canvas';

let nodes = [];
let connections = [];
let pan = { x: 300, y: 200 };
let zoom = 1;
let currentColor = 'gold';
let connectMode = false;
let connectSource = null;
let nodeIdCounter = 1;
let ctxTarget = null;
let ctxPos = { x: 0, y: 0 };

// ── SAVE / LOAD ──
function saveData() {
  // Collect latest text from DOM before saving
  nodes.forEach(n => {
    const el = document.getElementById(n.id);
    if (!el) return;
    if (n.type === 'note') {
      const title = el.querySelector('.note-title');
      const text = el.querySelector('.note-text');
      if (title) n.title = title.value;
      if (text) n.text = text.value;
    } else {
      const inp = el.querySelector('.label-inp');
      if (inp) n.title = inp.value;
    }
  });
  localStorage.setItem(SAVE_KEY, JSON.stringify({ nodes, connections, pan, zoom, nodeIdCounter }));
}

function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d) { addWelcomeNotes(); return; }
    pan = d.pan || { x: 300, y: 200 };
    zoom = d.zoom || 1;
    nodeIdCounter = d.nodeIdCounter || 1;
    nodes = d.nodes || [];
    connections = d.connections || [];
    applyTransform();
    nodes.forEach(n => renderNode(n));
    renderConnections();
  } catch (e) {
    addWelcomeNotes();
  }
}

function addWelcomeNotes() {
  nodes = [
    { id:'n1', type:'note', x:300, y:200, w:240, color:'gold',   title:'Campaign Story',  text:'The big picture — what is at stake? Who is the villain? What does the world want?' },
    { id:'n2', type:'note', x:620, y:140, w:220, color:'red',    title:'Villain / Big Bad', text:'Motivation:\nPlan:\nLocation:\nWeakness:' },
    { id:'n3', type:'note', x:620, y:360, w:220, color:'teal',   title:'Key NPC',          text:'Name:\nRole:\nWants:\nKnows:' },
    { id:'n4', type:'note', x:300, y:430, w:240, color:'blue',   title:'Current Scene',    text:'Where are we? What is the tension?' },
    { id:'n5', type:'label', x:270, y:165, color:'dark', title:'STORY' },
  ];
  connections = [
    { id:'c1', from:'n1', to:'n2' },
    { id:'c1', from:'n1', to:'n3' },
    { id:'c1', from:'n1', to:'n4' },
  ];
  nodeIdCounter = 6;
  nodes.forEach(n => renderNode(n));
  renderConnections();
  saveData();
}

// ── NODE CRUD ──
function addNote(cx, cy) {
  const pos = (cx !== undefined) ? { x: cx, y: cy } : canvasCenter();
  const id = 'n' + (nodeIdCounter++);
  const node = { id, type:'note', x: pos.x - 110, y: pos.y - 60, w: 220, color: currentColor, title:'', text:'' };
  nodes.push(node);
  renderNode(node);
  saveData();
  // Focus the title input
  setTimeout(() => document.getElementById(id)?.querySelector('.note-title')?.focus(), 50);
}

function addLabel(cx, cy) {
  const pos = (cx !== undefined) ? { x: cx, y: cy } : canvasCenter();
  const id = 'n' + (nodeIdCounter++);
  const node = { id, type:'label', x: pos.x, y: pos.y, color: currentColor, title:'Section' };
  nodes.push(node);
  renderNode(node);
  saveData();
}

function deleteNode(id) {
  nodes = nodes.filter(n => n.id !== id);
  connections = connections.filter(c => c.from !== id && c.to !== id);
  const el = document.getElementById(id);
  if (el) el.remove();
  renderConnections();
  saveData();
}

function updateNode(id, key, val) {
  const node = nodes.find(n => n.id === id);
  if (node) { node[key] = val; saveData(); }
}

function canvasCenter() {
  return clientToCanvas(wrap.clientWidth / 2, wrap.clientHeight / 2);
}

// ── CONNECTIONS ──
function toggleConnectMode() {
  connectMode = !connectMode;
  connectSource = null;
  const btn = document.getElementById('connect-btn');
  const banner = document.getElementById('connect-banner');
  btn.classList.toggle('active', connectMode);
  banner.style.display = connectMode ? 'block' : 'none';
  clearConnectHighlights();
  if (!connectMode) hidePrevLine();
}

function startConnect(fromId) {
  // If not in connect mode, enter it
  if (!connectMode) toggleConnectMode();
  connectSource = fromId;
  clearConnectHighlights();
  document.getElementById(fromId)?.classList.add('connecting-source');
  document.getElementById('connect-banner').textContent = 'CONNECT MODE — Now click the destination note';
}

function handleNodeClickInConnectMode(toId) {
  if (!connectMode) return;
  if (!connectSource) {
    // First click — set source
    startConnect(toId);
    return;
  }
  if (connectSource === toId) {
    // Clicked same node — cancel
    connectSource = null;
    clearConnectHighlights();
    document.getElementById('connect-banner').textContent = 'CONNECT MODE — Click a note to start a connection';
    return;
  }
  // Second click — create connection
  const already = connections.find(c =>
    (c.from === connectSource && c.to === toId) ||
    (c.from === toId && c.to === connectSource)
  );
  if (!already) {
    connections.push({ from: connectSource, to: toId });
    renderConnections();
    saveData();
  }
  connectSource = null;
  clearConnectHighlights();
  document.getElementById('connect-banner').textContent = 'CONNECT MODE — Click a note to start a connection';
  hidePrevLine();
}

function clearConnectHighlights() {
  document.querySelectorAll('.connecting-source').forEach(el => el.classList.remove('connecting-source'));
}

function clearConnections() {
  connections = [];
  renderConnections();
  saveData();
}

function clearAll() {
  if (!confirm('Clear the entire canvas? This cannot be undone.')) return;
  nodes = []; connections = [];
  document.querySelectorAll('#canvas .note, #canvas .label').forEach(el => el.remove());
  renderConnections();
  nodeIdCounter = 1;
  saveData();
}

// ── COLOR ──
function setColor(c) {
  currentColor = c;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('cb-' + c)?.classList.add('active');
}

function getColorVal(c) {
  const map = { gold:'#c9a84c', red:'#c04040', teal:'#3a8a80', blue:'#4a7ab0', purple:'#7a5ab0', dark:'#7a7570' };
  return map[c] || map.dark;
}

// Context menu helpers
function ctxAddNote()  { addNote(ctxPos.x, ctxPos.y); }
function ctxAddLabel() { addLabel(ctxPos.x, ctxPos.y); }
function ctxSetColor(c) {
  if (!ctxTarget) return;
  const node = nodes.find(n => n.id === ctxTarget);
  if (!node) return;
  node.color = c;
  const el = document.getElementById(ctxTarget);
  if (!el) return;
  if (node.type === 'note') {
    el.className = 'note c-' + c;
  } else {
    const inp = el.querySelector('.label-inp');
    if (inp) inp.style.color = getColorVal(c);
  }
  saveData();
}
function ctxDelete() { if (ctxTarget) deleteNode(ctxTarget); }
function ctxConnect() { if (ctxTarget) startConnect(ctxTarget); }
