// Long Odds: Floor 1 prototype. Game state, map, battles, bag, safe room and screens.
import { R, makeRng, newSeed } from './rng.js?v=__BUILD_VERSION__';
import { BASE_STATS, JOBS, RACES, CLASSES, ITEMS, LOOT, BOX_TOKENS, RARITY, RARITY_ORDER, SIDE_EFFECTS, MOBS, BOSS, TRAITS, ACHIEVEMENTS, BOOKIE } from './data.js?v=__BUILD_VERSION__';
import { generateFloor, walkable, tileAt, T, key } from './dungeon.js?v=__BUILD_VERSION__';
import { sprite, heroSprite, docSprite, boxSprite, mobSprite, itemIcon } from './sprites.js?v=__BUILD_VERSION__';
import { SLOT_COUNT, readSlot, writeSlot, deleteSlot, listSlots } from './save.js?v=__BUILD_VERSION__';
import { VERSION, checkForUpdate, installUpdate } from './version.js?v=__BUILD_VERSION__';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const overlay = $('overlay');
const controls = $('controls');
const textbox = $('textbox');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = (list, id) => list.find((x) => x.id === id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- State ----------
let G = null;        // the saved game state
let FL = null;       // the current floor (rebuilt from the seed)
let mobsLive = [];   // mob groups on the map right now
let mode = 'title';  // title | map | battle
let B = null;        // the current battle
let prompt = null;   // choices shown in place of the controls
let logLines = [];
let heroDraw = { x: 0, y: 0 };
let moveHeld = null;
let lastStep = 0;
let bossAnim = 0;

function race() { return byId(RACES, G.race); }
function cls() { return byId(CLASSES, G.cls); }
function job() { return byId(JOBS, G.job); }

function stats() {
  const s = { ...BASE_STATS };
  for (const m of [race().mods, cls().mods]) for (const k in m) s[k] += m[k];
  const l = G.lvl - 1;
  s.maxHp += l * 6; s.maxMp += l * 3; s.atk += l; s.def += Math.floor(l / 2); s.mag += l;
  for (const slot of ['weapon', 'armor']) {
    const it = G.equip[slot] && ITEMS[G.equip[slot]];
    if (it) { s.atk += it.atk || 0; s.def += it.def || 0; }
  }
  s.maxHp = Math.max(10, s.maxHp);
  return s;
}

// ---------- Text box ----------
function say(html, cls2 = '') {
  logLines.push({ html, cls: cls2 });
  if (logLines.length > 30) logLines.shift();
  renderLog();
}
function bookie(line) { say('<span class="who">BOOKIE:</span> ' + esc(line)); }
function docSay(line) { say('<span class="doc">Doc:</span> ' + esc(line)); }
function renderLog() {
  const recent = logLines.slice(-3);
  textbox.innerHTML = recent.map((l, i) => `<p class="${l.cls} ${i < recent.length - 2 ? 'old' : ''}">${l.html}</p>`).join('');
  textbox.scrollTop = textbox.scrollHeight;
}
function clearLog() { logLines = []; renderLog(); }

// ---------- Inventory ----------
function addItem(id, n = 1, quiet = false) {
  if (!ITEMS[id] || n <= 0) return;
  G.inv[id] = (G.inv[id] || 0) + n;
  G.order = G.order.filter((x) => x !== id);
  G.order.push(id);
  if (!quiet) say(`Got <span class="loot">${esc(ITEMS[id].name)}${n > 1 ? ' x' + n : ''}</span>`);
}
function removeItem(id, n = 1) {
  G.inv[id] = (G.inv[id] || 0) - n;
  if (G.inv[id] <= 0) { delete G.inv[id]; G.order = G.order.filter((x) => x !== id); if (G.equip.weapon === id) G.equip.weapon = null; if (G.equip.armor === id) G.equip.armor = null; }
}
function count(id) { return G.inv[id] || 0; }

function rollLoot(boxId) {
  const table = LOOT[boxId];
  const picks = boxId === 'box_rusty' ? 2 : 3;
  const got = [];
  for (let i = 0; i < picks; i++) {
    const total = table.reduce((a, r) => a + r[1], 0);
    let roll = R.next() * total;
    for (const [id, w, mn, mx] of table) {
      roll -= w;
      if (roll <= 0) { got.push([id, R.int(mn, mx)]); break; }
    }
  }
  const [a, b] = BOX_TOKENS[boxId];
  return { items: got, tokens: R.int(a, b) };
}

// ---------- Hype, odds, achievements, people ----------
function addHype(n) {
  if (n <= 0) return;
  let mult = 1;
  if (G.race === 'human') mult *= 1.5;
  if (G.cls === 'showboat') mult *= 1.5;
  if (FL && FL.rule.id === 'hypefest') mult *= 2;
  G.hype += n * mult;
  while (G.hype >= 5) {
    G.hype -= 5;
    G.odds *= 0.97;
    bookie(R.pick(BOOKIE.hype));
    addItem('box_patron');
  }
  updateHud();
}
function oddsText() { return Math.max(1, Math.round(G.odds)) + ' to 1'; }

function achieve(id) {
  if (G.ach[id]) return;
  G.ach[id] = true;
  const a = ACHIEVEMENTS[id];
  say(`<span class="good">Achievement: ${esc(a.name)}!</span> ${esc(a.text)}`);
  addItem(a.reward);
}

// Doc Vance's values decide how each kind of action changes how she feels about you.
const DOC_VALUES = {
  merciful: { trust: 6, respect: 1 },
  cruel: { trust: -5, fear: 4 },
  generous: { trust: 10, owed: 1 },
  greedy: { trust: -6 },
  brave: { respect: 6 },
  creepy: { fear: 2 },
};
const TAG_RUMORS = {
  merciful: 'I heard you let a mob walk away. People are talking about it down here.',
  cruel: 'Word is you finished off something that was begging. People talk, you know.',
  generous: 'Jules is walking again because of you. I won\'t forget that.',
  greedy: 'You let Jules bleed to keep a potion. I remember faces.',
  brave: 'They say you went toe to toe with something nasty and won.',
  creepy: 'Someone said they saw you... eating something. Please tell me that\'s not true.',
};
function tag(t) {
  const d = G.doc;
  const v = DOC_VALUES[t];
  if (!v) return;
  for (const k in v) d[k] += v[k];
  d.memory.push(t);
  d.heardLast = false;
  if (d.memory.length > 6) d.memory.shift();
}
function docMood() {
  const d = G.doc;
  if (d.trust >= 15) return 'friend';
  if (d.trust >= 5) return 'warm';
  if (d.trust > -5) return 'neutral';
  return d.fear >= 10 ? 'scared' : 'hostile';
}

// ---------- New game, loading, saving ----------
function newGame(slot, name, jobId, raceId, clsId) {
  const seed = newSeed();
  G = {
    v: 1, slot, name, job: jobId, race: raceId, cls: clsId, seed, floor: 1,
    lvl: 1, xp: 0, hp: 0, mp: 0, tokens: 5,
    inv: {}, order: [], favs: {}, equip: { weapon: null, armor: null },
    pos: null, timeLeft: 20 * 60 + (jobId === 'driver' ? 120 : 0), timerWarn: {},
    odds: byId(RACES, raceId).odds + byId(CLASSES, clsId).odds, hype: 0,
    opened: [], killed: [], bossDead: false, cleared: false,
    doc: { trust: 0, fear: 0, respect: 0, owed: 0, met: false, eventDone: false, gift: false, memory: [] },
    sideFx: {}, ach: {}, boxesOpened: 0, deaths: 0, kills: 0, spared: 0, steps: 0, playTime: 0, buff: null,
  };
  if (jobId === 'bartender') G.doc.trust += 10;
  if (raceId === 'goblin') G.doc.trust -= 5;
  if (raceId === 'ghoul') G.doc.fear += 10;
  const s = stats();
  G.hp = s.maxHp; G.mp = s.maxMp;
  addItem('potion_heal', 3, true);
  addItem('food_pretzel', 2, true);
  addItem('w_pipe', 1, true);
  G.equip.weapon = 'w_pipe';
  if (clsId === 'scrapper') addItem('bomb', 3, true);
  if (clsId === 'hex') addItem('potion_mana', 2, true);
  buildFloor();
  G.pos = { ...FL.start };
  save();
  enterMap(true);
}

function buildFloor() {
  FL = generateFloor(G.seed, G.floor, { extraChest: G.job === 'unemployed' });
  mobsLive = FL.mobs.filter((m) => !G.killed.includes(m.id)).map((m) => ({ ...m, stun: 0 }));
}

function save() {
  writeSlot(G.slot, JSON.parse(JSON.stringify(G)));
}

function loadSlot(i) {
  const data = readSlot(i);
  if (!data) return false;
  G = data;
  G.slot = i;
  buildFloor();
  return true;
}

// ---------- HUD ----------
function updateHud() {
  if (!G) return;
  const s = stats();
  $('hud-floor').textContent = 'F' + G.floor + ' THE LOBBY';
  const t = Math.max(0, Math.ceil(G.timeLeft));
  const tEl = $('hud-timer');
  tEl.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  tEl.classList.toggle('warn', t <= 60);
  $('hud-odds').textContent = Math.max(1, Math.round(G.odds)) + ' TO 1';
  $('hp-fill').style.width = clamp((G.hp / s.maxHp) * 100, 0, 100) + '%';
  $('mp-fill').style.width = clamp((G.mp / s.maxMp) * 100, 0, 100) + '%';
  $('hp-text').textContent = Math.max(0, Math.round(G.hp));
  $('mp-text').textContent = Math.round(G.mp);
  $('hud-lvl').textContent = G.lvl;
  const h = Math.floor(G.hype);
  $('hud-hype').textContent = '▮'.repeat(h) + '▯'.repeat(5 - h);
  $('hud-tokens').textContent = G.tokens;
}

// ---------- Screens (overlay) ----------
function showOverlay(html) {
  overlay.innerHTML = html;
  overlay.hidden = false;
  overlay.scrollTop = 0;
}
function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; }

const TRASH = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"></path></svg>';

let titleState = { confirm: -1, updateMsg: '', update: null };
function showTitle() {
  mode = 'title';
  G = null; FL = null; B = null; prompt = null;
  $('hud').hidden = true;
  clearLog();
  controls.innerHTML = '';
  const slots = listSlots();
  const used = slots.filter(Boolean).length;
  const rows = slots.map((s, i) => {
    if (!s) return `<button class="slot-empty" data-act="new" data-i="${i}"><span>${i + 1}. Empty slot</span><span>+ New hero</span></button>`;
    const r = byId(RACES, s.race) || RACES[0], c = byId(CLASSES, s.cls) || CLASSES[0];
    const img = heroSprite(r, c).toDataURL();
    const when = s.savedAt ? new Date(s.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    const del = titleState.confirm === i
      ? `<button class="del-confirm" data-act="del" data-i="${i}">Delete?</button>`
      : `<button class="icon-btn" data-act="askdel" data-i="${i}" aria-label="Delete save ${i + 1}">${TRASH}</button>`;
    return `<div class="slot"><img src="${img}" alt="">
      <button class="info" data-act="load" data-i="${i}"><span class="nm">${i + 1}. ${esc(s.name)} (${esc(r.name)} ${esc(c.name)})</span>
      <span class="dt">Floor ${s.floor}${s.cleared ? ' cleared' : ''} · Level ${s.lvl} · ${esc(when)}</span>
      <span class="od">Odds ${Math.max(1, Math.round(s.odds))} to 1</span></button>${del}</div>`;
  }).join('');
  const upd = titleState.update
    ? `<button class="btn gold" data-act="install">Install update ${esc(titleState.update)}</button>`
    : `<button class="btn" data-act="update">CHECK FOR UPDATES</button>`;
  showOverlay(`
    <div style="padding-top:14px; display:flex; flex-direction:column; gap:10px; align-items:center">
      <img src="${sprite('bookie').toDataURL()}" alt="" style="width:64px;height:64px;image-rendering:pixelated">
      <h1>LONG<br>ODDS</h1>
      <p class="tagline">The world ends soon. Place your bets.</p>
    </div>
    <div class="row-between"><h2>SAVE SLOTS</h2><span class="muted" style="font-size:14px">${used} of ${SLOT_COUNT} used</span></div>
    <div class="stack">${rows}</div>
    <div class="foot">${upd}
      <span class="muted" style="font-size:14px; min-height:18px">${esc(titleState.updateMsg)}</span>
      <span class="version">Build ${esc(VERSION)}</span>
    </div>`);
}

overlay.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  const i = Number(b.dataset.i);
  const h = overlayHandlers[act];
  if (h) h(i, b);
});

const overlayHandlers = {
  new: (i) => { titleState.confirm = -1; startCreate(i); },
  load: (i) => {
    titleState.confirm = -1;
    if (!loadSlot(i)) return showTitle();
    if (G.cleared) return showFloorClear();
    enterMap(false);
  },
  askdel: (i) => { titleState.confirm = i; showTitle(); },
  del: (i) => { deleteSlot(i); titleState.confirm = -1; showTitle(); },
  update: async () => {
    titleState.updateMsg = 'Checking...'; showTitle();
    try {
      const r = await checkForUpdate();
      if (r.hasUpdate) { titleState.update = r.latest; titleState.updateMsg = 'A new version is ready. Your saves are kept.'; }
      else titleState.updateMsg = VERSION === '1.0.0.dev' ? 'This is a test build, so there is nothing to update.' : 'You have the newest version.';
    } catch { titleState.updateMsg = 'Could not check right now. Try again later.'; }
    if (mode === 'title') showTitle();
  },
  install: () => installUpdate(titleState.update),
};

// ---------- Character creation ----------
let cr = null;
function startCreate(slot) {
  cr = { slot, step: 'who', name: '', job: null, race: 'human', cls: 'brawler' };
  renderCreate();
}
function renderCreate() {
  const r = byId(RACES, cr.race), c = byId(CLASSES, cr.cls);
  const preview = heroSprite(r, c).toDataURL();
  if (cr.step === 'who') {
    showOverlay(`
      <h2>WHO WERE YOU?</h2>
      <p class="muted">Before the world started ending, you were just a regular person.</p>
      <label for="nm">Your name</label>
      <input id="nm" type="text" maxlength="14" autocomplete="off" value="${esc(cr.name)}" placeholder="Type a name">
      <h2>YOUR OLD JOB</h2>
      <div class="cards">${JOBS.map((j) => `<button class="card ${cr.job === j.id ? 'sel' : ''}" data-act="job" data-id="${j.id}"><span class="nm">${esc(j.name)}</span><span class="ds">${esc(j.perk)}</span></button>`).join('')}</div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next" ${cr.name.trim() && cr.job ? '' : 'disabled'}>NEXT</button></div>`);
    const input = $('nm');
    input.addEventListener('input', () => {
      cr.name = input.value;
      overlay.querySelector('[data-act=next]').disabled = !(cr.name.trim() && cr.job);
    });
  } else if (cr.step === 'intro') {
    showOverlay(`
      <h2>THE END OF THE WORLD</h2>
      <div class="story">
        <p>The Unraveling started on a Tuesday. By Friday the sky had holes in it.</p>
        <p>The richest people on Earth left on sealed sky arks. From up there, they started a TV show.</p>
        <p>The rest of us got an offer: crawl down the Spire Below on live TV. Reach the bottom and win a seat on an ark.</p>
        <p>You said yes. Everyone says yes.</p>
      </div>
      <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> Welcome to LONG ODDS, ${esc(cr.name.trim())}! Step through the door and become something more... marketable.</p></div>
      <button class="btn red" data-act="next">STEP THROUGH THE DOOR</button>`);
  } else if (cr.step === 'race') {
    showOverlay(`
      <h2>THE DUNGEON DOOR: PICK A RACE</h2>
      <div class="preview"><img src="${preview}" alt=""><div><p><b>${esc(r.name)}</b></p><p class="muted" style="font-size:15px">${esc(r.desc)}</p></div></div>
      <div class="cards">${RACES.map((x) => `<button class="card ${cr.race === x.id ? 'sel' : ''}" data-act="race" data-id="${x.id}"><span class="nm">${esc(x.name)}</span><span class="ds">Starting odds ${x.odds} to 1</span></button>`).join('')}</div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next">NEXT</button></div>`);
  } else if (cr.step === 'class') {
    showOverlay(`
      <h2>PICK A CLASS</h2>
      <div class="preview"><img src="${preview}" alt=""><div><p><b>${esc(r.name)} ${esc(c.name)}</b></p><p class="muted" style="font-size:15px">${esc(c.desc)} Skill: ${esc(c.skill.name)} (${c.skill.mp} MP). ${esc(c.skill.desc)}</p></div></div>
      <div class="cards">${CLASSES.map((x) => `<button class="card ${cr.cls === x.id ? 'sel' : ''}" data-act="cls" data-id="${x.id}"><span class="nm">${esc(x.name)}</span><span class="ds">${esc(x.desc)}</span></button>`).join('')}</div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next">NEXT</button></div>`);
  } else if (cr.step === 'confirm') {
    const j = byId(JOBS, cr.job);
    showOverlay(`
      <h2>READY?</h2>
      <div class="preview"><img src="${preview}" alt=""><div>
        <p><b>${esc(cr.name.trim())}</b></p>
        <p class="muted" style="font-size:15px">${esc(r.name)} ${esc(c.name)}, former ${esc(j.name.toLowerCase())}</p>
        <p style="color:var(--gold); font-size:15px">Starting odds ${r.odds + c.odds} to 1</p></div></div>
      <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> ${r.odds + c.odds >= 20 ? 'A long shot! The Patrons love a long shot. Mostly to watch it fail.' : 'A safe pick. Boring, but the Patrons respect a sure thing.'}</p></div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn red" data-act="begin">ENTER FLOOR 1</button></div>`);
  }
}
Object.assign(overlayHandlers, {
  job: (_, b) => { cr.job = b.dataset.id; renderCreate(); },
  race: (_, b) => { cr.race = b.dataset.id; renderCreate(); },
  cls: (_, b) => { cr.cls = b.dataset.id; renderCreate(); },
  next: () => { const steps = ['who', 'intro', 'race', 'class', 'confirm']; cr.step = steps[steps.indexOf(cr.step) + 1]; renderCreate(); },
  back: () => {
    const steps = ['who', 'intro', 'race', 'class', 'confirm'];
    const at = steps.indexOf(cr.step);
    if (at === 0) return showTitle();
    cr.step = steps[at === 2 ? 0 : at - 1]; renderCreate();
  },
  begin: () => newGame(cr.slot, cr.name.trim().slice(0, 14), cr.job, cr.race, cr.cls),
});

// ---------- Map ----------
function enterMap(fresh) {
  mode = 'map';
  B = null; prompt = null;
  hideOverlay();
  $('hud').hidden = false;
  heroDraw = { x: G.pos.x * 16, y: G.pos.y * 16 };
  clearLog();
  if (fresh) {
    bookie(R.pick(BOOKIE.welcome));
    say(`<b>Floor rule: ${esc(FL.rule.name).toUpperCase()}.</b> ${esc(FL.rule.text)}`);
    say('Find the safe room, beat the Turnstile King and take the stairs before the timer runs out.');
  } else {
    bookie('Welcome back, ' + G.name + '. The cameras never stopped rolling.');
  }
  updateHud();
  renderControls();
}

function renderControls() {
  if (prompt) {
    controls.innerHTML = `<div class="stack">${prompt.choices.map((c, i) => `<button class="btn ${c.color || ''} text" data-p="${i}" ${c.disabled ? 'disabled' : ''}>${esc(c.label)}</button>`).join('')}</div>`;
    return;
  }
  if (mode === 'map') {
    controls.innerHTML = `
      <div class="pad-wrap">
        <div class="dpad">
          <div></div><button data-dir="up" aria-label="Up">▲</button><div></div>
          <button data-dir="left" aria-label="Left">◀</button><div class="hub"></div><button data-dir="right" aria-label="Right">▶</button>
          <div></div><button data-dir="down" aria-label="Down">▼</button><div></div>
        </div>
        <div class="ab">
          <div class="ab-row"><button class="round btn-b" data-k="bag" aria-label="Open bag">B</button><button class="round btn-a" data-k="a" aria-label="Interact">A</button></div>
          <div class="small-row"><button class="chip" data-k="bag">Bag</button><button class="chip" data-k="menu">Menu</button></div>
        </div>
      </div>`;
  } else if (mode === 'battle') renderBattleControls();
}

function ask(text, choices) {
  if (text) say(text);
  prompt = { choices };
  renderControls();
}

controls.addEventListener('click', (e) => {
  const p = e.target.closest('[data-p]');
  if (p && prompt) {
    const c = prompt.choices[Number(p.dataset.p)];
    prompt = null;
    renderControls();
    c.fn && c.fn();
    return;
  }
  const k = e.target.closest('[data-k]');
  if (k && mode === 'map' && overlay.hidden) {
    if (k.dataset.k === 'bag') openBag();
    if (k.dataset.k === 'menu') openMenu();
    if (k.dataset.k === 'a') interactAdjacent();
  }
  const bb = e.target.closest('[data-b]');
  if (bb && mode === 'battle') battleInput(bb.dataset.b, bb.dataset.arg);
});

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
controls.addEventListener('pointerdown', (e) => {
  const d = e.target.closest('[data-dir]');
  if (!d) return;
  e.preventDefault();
  d.classList.add('held');
  moveHeld = d.dataset.dir;
  lastStep = 0;
});
const release = () => { moveHeld = null; controls.querySelectorAll('.held').forEach((x) => x.classList.remove('held')); };
window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);

const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (KEYS[e.key] && mode === 'map') { moveHeld = KEYS[e.key]; e.preventDefault(); }
  if ((e.key === ' ' || e.key === 'Enter') && mode === 'map' && overlay.hidden && !prompt) { interactAdjacent(); e.preventDefault(); }
  if (e.key === 'b' && mode === 'map' && overlay.hidden && !prompt) openBag();
  if (e.key === 'Escape' && !overlay.hidden && mode === 'map') { hideOverlay(); renderControls(); }
});
window.addEventListener('keyup', (e) => { if (KEYS[e.key] === moveHeld) moveHeld = null; });

function canAct() { return mode === 'map' && overlay.hidden && !prompt; }

function objectAt(x, y) {
  if (FL.doc.x === x && FL.doc.y === y) return 'doc';
  if (FL.booth.x === x && FL.booth.y === y) return 'booth';
  if (FL.bench.x === x && FL.bench.y === y) return 'bench';
  if (!G.bossDead && FL.boss.x === x && FL.boss.y === y) return 'boss';
  const ch = FL.chests.find((c) => c.x === x && c.y === y && !G.opened.includes(c.id));
  if (ch) return ch;
  return null;
}
function mobAt(x, y) { return mobsLive.find((m) => m.x === x && m.y === y); }

function tryStep(dir) {
  const [dx, dy] = DIRS[dir];
  const nx = G.pos.x + dx, ny = G.pos.y + dy;
  if (!walkable(FL, nx, ny)) return;
  const obj = objectAt(nx, ny);
  if (obj) return interact(obj);
  const mob = mobAt(nx, ny);
  if (mob) return startBattle(mob);
  const wasSafe = tileAt(FL, G.pos.x, G.pos.y) === T.SAFE;
  G.pos = { x: nx, y: ny };
  G.steps++;
  if (G.race === 'troll' && G.steps % 4 === 0) G.hp = Math.min(stats().maxHp, G.hp + 1);
  const t = tileAt(FL, nx, ny);
  if (t === T.SAFE && !wasSafe) {
    save();
    bookie(G.doc.met ? 'Safe room. Mobs can\'t come in here. Game saved.' : 'A safe room! Mobs can\'t come in. Your game just saved. Go say hi to the medic.');
  }
  if (t === T.STAIRS) return useStairs();
  moveMobs();
  updateHud();
}

function useStairs() {
  if (!G.bossDead) {
    bookie('The stairs are locked. The Turnstile King has the fare card. Go take it from him.');
    return;
  }
  G.cleared = true;
  save();
  showFloorClear();
}

function moveMobs() {
  const hero = G.pos;
  for (const m of mobsLive) {
    if (m.stun > 0) { m.stun--; continue; }
    const fast = m.members.some((x) => x.traits.includes('fast') || MOBS[x.type].spd >= 7);
    if (!fast && G.steps % 2) continue;
    const dx = hero.x - m.x, dy = hero.y - m.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    let opts = [];
    if (dist <= 6) {
      const sx = [Math.sign(dx), 0], sy = [0, Math.sign(dy)];
      opts = Math.abs(dx) >= Math.abs(dy) ? [sx, sy] : [sy, sx];
    } else if (R.chance(0.35)) {
      opts = [R.pick([[1, 0], [-1, 0], [0, 1], [0, -1]])];
    }
    for (const [ox, oy] of opts) {
      if (!ox && !oy) continue;
      const nx = m.x + ox, ny = m.y + oy;
      if (nx === hero.x && ny === hero.y) { startBattle(m); return; }
      const t = tileAt(FL, nx, ny);
      if (t === T.WALL || t === T.SAFE || t === T.STAIRS || objectAt(nx, ny) || mobAt(nx, ny)) continue;
      m.x = nx; m.y = ny;
      break;
    }
  }
}

function interactAdjacent() {
  if (!canAct()) return;
  for (const [dx, dy] of Object.values(DIRS)) {
    const obj = objectAt(G.pos.x + dx, G.pos.y + dy);
    if (obj) return interact(obj);
  }
  bookie(R.pick(['Nothing here but dust and despair.', 'You poke the air. Riveting.', 'Try walking into things. That is how this show works.']));
}

function interact(obj) {
  if (obj === 'doc') return talkDoc();
  if (obj === 'booth') return ask('A BOOKIE camera booth. Save your game here?', [
    { label: 'Save the game', color: 'green', fn: () => { save(); bookie('Saved! If you die, we rewind to right here. For ratings.'); } },
    { label: 'Not now', color: 'grey' },
  ]);
  if (obj === 'bench') return openBench();
  if (obj === 'boss') return ask('The Turnstile King blocks the stairs. "TICKETS, PLEASE."', [
    { label: 'Fight the King', color: 'red', fn: () => startBossBattle() },
    { label: 'Back away', color: 'grey' },
  ]);
  if (obj.tier) return openChest(obj);
}

function openChest(ch) {
  G.opened.push(ch.id);
  bookie(R.pick(BOOKIE.chest));
  const n = FL.rule.id === 'doubleloot' ? 2 : 1;
  addItem(ch.tier, n);
  if (G.race === 'elf') {
    const extra = rollLoot('box_rusty').items[0];
    if (extra) { say('Your sharp elf eyes spot something tucked behind it.'); addItem(extra[0], extra[1]); }
  }
  say('Open loot boxes from your Bag.');
  updateHud();
}

// ---------- Doc Vance (safe room medic) ----------
function talkDoc() {
  const d = G.doc;
  if (!d.met) {
    d.met = true;
    docSay('Name\'s Marisol Vance. Everyone calls me Doc. I was an ER nurse back when hospitals were a thing.');
  }
  if (!d.eventDone) {
    d.eventDone = true;
    docSay('Quick, this crawler, Jules, is bleeding out and I\'m out of potions. Can you spare a Health Potion?');
    const has = count('potion_heal') > 0;
    return ask(null, [
      { label: has ? 'Give Jules a Health Potion' : 'Give Jules a Health Potion (you have none)', color: 'green', disabled: !has, fn: () => {
        removeItem('potion_heal'); tag('generous');
        docSay('Thank you. Really. Jules owes you one, and so do I.');
        bookie('Aww. The Patrons hate this. The viewers love it.');
        addHype(1);
        save();
        docMenu();
      } },
      { label: 'Keep it for yourself', color: 'red', fn: () => {
        tag('greedy');
        docSay('Right. I see what kind of crawler you are.');
        bookie('Cold! The Patrons approve. Jules does not.');
        save();
        docMenu();
      } },
    ]);
  }
  docMenu();
}

function docGreeting() {
  const d = G.doc;
  const mood = docMood();
  const last = d.memory[d.memory.length - 1];
  if (last && !d.heardLast) { d.heardLast = true; docSay(TAG_RUMORS[last]); }
  if (d.trust >= 20 && !d.gift) {
    d.gift = true;
    docSay('Here. I\'ve been saving this for someone who deserves it.');
    addItem('box_silver');
  }
  const lines = {
    friend: 'There\'s my favorite crawler. Sit down, I\'ll patch you up for free.',
    warm: 'You\'re doing alright out there. Need patching up?',
    neutral: 'Another one. Fine. Healing\'s 10 tokens.',
    scared: 'D-don\'t come any closer. Take what you need and go.',
    hostile: 'I don\'t help people like you. Buy something or get out.',
  };
  docSay(lines[mood]);
}
function healPrice() { return { friend: 0, warm: 5, neutral: 10, scared: 0, hostile: null }[docMood()]; }
function potionPrice() {
  const m = docMood();
  const base = { friend: 5, warm: 7, neutral: 8, scared: 8, hostile: 16 }[m];
  return G.cls === 'talker' ? Math.max(3, base - 2) : base;
}

function docMenu() {
  docGreeting();
  const hp = healPrice();
  const pp = potionPrice();
  const s = stats();
  ask(null, [
    { label: hp === null ? 'Ask for healing (she refuses)' : hp === 0 ? 'Heal me (free)' : `Heal me (${hp} tokens)`, color: 'green', disabled: hp === null || (hp > 0 && G.tokens < hp) || (G.hp >= s.maxHp && G.mp >= s.maxMp), fn: () => {
      G.tokens -= hp; G.hp = s.maxHp; G.mp = s.maxMp;
      docSay(docMood() === 'scared' ? 'There. Done. Please leave.' : 'Good as new. Try not to undo my work.');
      updateHud(); docMenuAgain();
    } },
    { label: `Buy a Health Potion (${pp} tokens)`, disabled: G.tokens < pp, fn: () => { G.tokens -= pp; addItem('potion_heal'); updateHud(); docMenuAgain(); } },
    { label: 'Ask about the show', fn: () => {
      docSay(R.pick([
        'The Patrons bet on everything. How long you last, who you kill, who you save. Don\'t give them a good show for free.',
        'BOOKIE runs the cameras and the odds. Lately it\'s been... editorializing. I don\'t think it\'s supposed to do that.',
        'Nobody has ever come back up to tell us if the ark seats are real.',
      ]));
      docMenuAgain();
    } },
    { label: 'Leave', color: 'grey', fn: () => save() },
  ]);
}
function docMenuAgain() { G.doc.heardLast = true; docMenu(); }

// ---------- Crafting bench ----------
function junkList() { return G.order.filter((id) => ITEMS[id].type === 'junk'); }
function openBench() {
  const need = G.job === 'mechanic' ? 1 : 2;
  const junk = junkList().reduce((a, id) => a + count(id), 0);
  const value = junkList().reduce((a, id) => a + count(id) * ITEMS[id].value, 0);
  ask(`A workbench with a BOOKIE pawn slot. You have ${junk} junk. Crafting uses ${need}.`, [
    { label: `Craft something (uses ${need} junk)`, color: 'purple', disabled: junk < need, fn: () => {
      let left = need;
      for (const id of junkList()) while (left > 0 && count(id) > 0) { removeItem(id); left--; }
      const roll = R.next();
      const out = roll < 0.5 ? 'bomb' : roll < 0.75 ? 'potion_mystery' : 'potion_heal';
      say('You bash the junk together...');
      addItem(out);
      openBench();
    } },
    { label: `Sell all junk (${value} tokens)`, disabled: junk === 0, fn: () => {
      for (const id of junkList()) removeItem(id, count(id));
      G.tokens += value; updateHud();
      bookie('Sold! BOOKIE takes a 0% cut. Generous, right?');
    } },
    { label: 'Leave', color: 'grey' },
  ]);
}

// ---------- Bag ----------
let bagState = { tab: 'all', sort: 'new', inBattle: false };
const TABS = [['all', 'All'], ['potion', 'Potions'], ['food', 'Food'], ['bomb', 'Bombs'], ['gear', 'Gear'], ['box', 'Boxes'], ['junk', 'Junk']];

function openBag() {
  if (!canAct()) return;
  bagState.inBattle = false;
  renderBag();
}
function sortedItems() {
  let ids = G.order.filter((id) => count(id) > 0);
  const t = bagState.tab;
  if (t !== 'all') ids = ids.filter((id) => (t === 'gear' ? ['weapon', 'armor'].includes(ITEMS[id].type) : ITEMS[id].type === t));
  if (bagState.sort === 'new') ids = ids.slice().reverse();
  if (bagState.sort === 'rarity') ids = ids.slice().sort((a, b) => RARITY_ORDER.indexOf(ITEMS[a].rarity) - RARITY_ORDER.indexOf(ITEMS[b].rarity));
  if (bagState.sort === 'name') ids = ids.slice().sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
  return ids.sort((a, b) => (G.favs[b] ? 1 : 0) - (G.favs[a] ? 1 : 0));
}
function itemAction(id) {
  const it = ITEMS[id];
  if (it.type === 'box') return 'Open';
  if (it.type === 'potion' || it.type === 'food') return 'Use';
  if (it.type === 'weapon' || it.type === 'armor') return G.equip[it.type] === id ? 'Unequip' : 'Equip';
  if (it.type === 'junk' && it.edible) return 'Eat';
  return null;
}
function renderBag(extra = '') {
  const ids = sortedItems();
  const total = G.order.reduce((a, id) => a + count(id), 0);
  const rows = ids.map((id) => {
    const it = ITEMS[id];
    const act = itemAction(id);
    const eq = G.equip.weapon === id || G.equip.armor === id;
    const side = it.type === 'potion' && G.sideFx[id] !== undefined ? ' Side effect: ' + SIDE_EFFECTS[G.sideFx[id]].text : '';
    return `<div class="item"><img src="${itemIcon(id, it.type)}" alt="">
      <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(it.name)} x${count(id)} ${eq ? '<span class="equipped">EQUIPPED</span>' : ''}</span><span class="ds">${esc(it.desc + side)}</span></div>
      <button class="star ${G.favs[id] ? 'on' : ''}" data-act="fav" data-id="${id}" aria-label="Favorite">★</button>
      ${act ? `<button class="act" data-act="use" data-id="${id}">${act}</button>` : ''}</div>`;
  }).join('') || '<p class="muted">Nothing here yet.</p>';
  showOverlay(`
    <div class="row-between"><h2>BAG</h2><span class="muted" style="font-size:14px">${total} items · no limit</span></div>
    ${extra}
    <div class="tabs">${TABS.map(([k, l]) => `<button class="tab ${bagState.tab === k ? 'on' : ''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>
    <div class="tabs">${[['new', 'Newest'], ['rarity', 'Rarity'], ['name', 'A to Z']].map(([k, l]) => `<button class="tab ${bagState.sort === k ? 'on' : ''}" data-act="sort" data-id="${k}">Sort: ${l}</button>`).join('')}</div>
    <div class="items">${rows}</div>
    <button class="btn grey" data-act="closebag" style="position:sticky; bottom:0">CLOSE</button>`);
}
Object.assign(overlayHandlers, {
  tab: (_, b) => { bagState.tab = b.dataset.id; renderBag(); },
  sort: (_, b) => { bagState.sort = b.dataset.id; renderBag(); },
  fav: (_, b) => { const id = b.dataset.id; G.favs[id] = !G.favs[id]; renderBag(); },
  closebag: () => { hideOverlay(); renderControls(); },
  use: (_, b) => useItemFromBag(b.dataset.id),
});

function useItemFromBag(id) {
  const it = ITEMS[id];
  if (it.type === 'box') return openBox(id);
  if (it.type === 'weapon' || it.type === 'armor') {
    G.equip[it.type] = G.equip[it.type] === id ? null : id;
    const s = stats(); G.hp = Math.min(G.hp, s.maxHp);
    updateHud();
    return renderBag();
  }
  consume(id);
  updateHud();
  renderBag();
}

// Drinking or eating an item. Returns a list of lines for the text box.
function consume(id) {
  const it = ITEMS[id];
  const s = stats();
  removeItem(id);
  let heal = it.heal || 0;
  if (it.type === 'potion' && G.job === 'nurse') heal = Math.round(heal * 1.2);
  if (it.type === 'food' && G.job === 'cook') heal *= 2;
  if (it.type === 'junk') {
    heal = it.edible * (G.race === 'ogre' ? 2 : 1);
    if (G.race !== 'ogre' && G.race !== 'ghoul') tag('creepy');
    say(`You eat the ${esc(it.name)}. ${G.race === 'ogre' ? 'Delicious.' : 'Why would you do that?'}`);
  } else if (it.type === 'food') {
    if (G.race === 'ogre') heal *= 2;
    say(`You eat the ${esc(it.name)}.`);
  } else say(`You drink the ${esc(it.name)}.`);
  if (it.mystery) {
    const r = R.int(0, 3);
    if (r === 0) { heal = 40; say('It tastes like cherries and regret.'); }
    if (r === 1) { G.mp = s.maxMp; say('Your head buzzes. MP fully restored!'); }
    if (r === 2) { setBuff('atk', 3); say('You feel STRONG. +3 attack for your next fight.'); }
    if (r === 3) { G.hp = Math.max(1, G.hp - 6); say('Ugh. It was mostly drain cleaner. -6 HP.'); }
  }
  if (heal) { G.hp = Math.min(s.maxHp, G.hp + heal); say(`<span class="good">+${heal} HP</span>`); }
  if (it.mana) { G.mp = Math.min(s.maxMp, G.mp + it.mana); say(`<span class="good">+${it.mana} MP</span>`); }
  if (it.type === 'potion') {
    if (G.sideFx[id] === undefined) {
      G.sideFx[id] = makeRng(G.seed + id.length * 31 + id.charCodeAt(7)).int(0, SIDE_EFFECTS.length - 1);
      say('<b>New side effect discovered!</b>');
    }
    const fx = SIDE_EFFECTS[G.sideFx[id]];
    say(esc(fx.text));
    if (fx.hype) addHype(fx.hype);
    if (fx.atkBuff) setBuff('atk', fx.atkBuff);
    if (fx.defBuff) setBuff('def', fx.defBuff);
    if (fx.spdBuff) setBuff('spd', fx.spdBuff);
  }
}
function setBuff(stat, n) {
  if (B) { B.buff[stat] = (B.buff[stat] || 0) + n; }
  else { G.buff = G.buff || {}; G.buff[stat] = (G.buff[stat] || 0) + n; }
}

function openBox(id) {
  removeItem(id);
  G.boxesOpened++;
  const loot = rollLoot(id);
  const merged = {};
  for (const [iid, n] of loot.items) merged[iid] = (merged[iid] || 0) + n;
  loot.items = Object.entries(merged);
  for (const [iid, n] of loot.items) addItem(iid, n, true);
  G.tokens += loot.tokens;
  const rows = loot.items.map(([iid, n]) => `<div class="item"><img src="${itemIcon(iid, ITEMS[iid].type)}" alt=""><div class="txt"><span class="nm" style="color:${RARITY[ITEMS[iid].rarity].color}">${esc(ITEMS[iid].name)} x${n}</span><span class="ds">${esc(ITEMS[iid].desc)}</span></div></div>`).join('');
  say(`Opened a <span class="loot">${esc(ITEMS[id].name)}</span>.`);
  const extra = `<div class="reveal"><div class="box-big"><img src="${boxSprite(id).toDataURL()}" alt=""></div>
    <p class="banner gold">${esc(ITEMS[id].name).toUpperCase()}!</p>${rows}
    <div class="item"><div class="txt"><span class="nm" style="color:var(--gold)">${loot.tokens} tokens</span></div></div></div>`;
  if (G.boxesOpened >= 5) achieve('boxaddict');
  updateHud();
  renderBag(extra);
}

// ---------- Menu ----------
function openMenu() {
  if (!canAct()) return;
  const s = stats();
  const docWords = { friend: 'Doc trusts you a lot.', warm: 'Doc likes you.', neutral: 'Doc is not sure about you yet.', scared: 'Doc is scared of you.', hostile: 'Doc does not like you.' }[docMood()];
  showOverlay(`
    <h2>${esc(G.name).toUpperCase()}</h2>
    <p class="muted">${esc(race().name)} ${esc(cls().name)}, former ${esc(job().name.toLowerCase())}. Level ${G.lvl} (${G.xp} / ${G.lvl * 20} XP)</p>
    <div class="stat-list">
      <span>HP <b>${Math.round(G.hp)} / ${s.maxHp}</b></span><span>MP <b>${Math.round(G.mp)} / ${s.maxMp}</b></span>
      <span>Attack <b>${s.atk}</b></span><span>Defense <b>${s.def}</b></span>
      <span>Magic <b>${s.mag}</b></span><span>Speed <b>${s.spd}</b></span>
      <span>Odds <b>${oddsText()}</b></span><span>Deaths <b>${G.deaths}</b></span>
      <span>Kills <b>${G.kills}</b></span><span>Spared <b>${G.spared}</b></span>
    </div>
    <p><b>Perk:</b> ${esc(job().perk)}</p>
    <p><b>${esc(race().name)}:</b> ${esc(race().desc)}</p>
    <p><b>Skill:</b> ${esc(cls().skill.name)} (${cls().skill.mp} MP). ${esc(cls().skill.desc)}</p>
    <p><b>Floor rule:</b> ${esc(FL.rule.name)}. ${esc(FL.rule.text)}</p>
    <p>${G.doc.met ? esc(docWords) : 'You have not met anyone yet. Find the safe room.'}</p>
    <p class="muted">The game saves when you walk into a safe room or use a camera booth.</p>
    <button class="btn green" data-act="closebag">RESUME</button>
    <button class="btn grey" data-act="quit">QUIT TO TITLE (LOSES PROGRESS SINCE LAST SAVE)</button>
    <span class="version" style="text-align:center">Build ${esc(VERSION)}</span>`);
}
overlayHandlers.quit = () => showTitle();

// ---------- Battle ----------
function makeEnemy(member, i) {
  const base = MOBS[member.type];
  const e = { id: i, name: base.name, sprite: base.sprite, hp: base.hp, atk: base.atk, def: base.def, spd: base.spd, xp: base.xp, tokens: base.tokens, drops: base.drops, traits: member.traits.slice(), elite: member.elite, alive: true, flash: 0, intent: 'attack', begged: false };
  if (e.traits.includes('armored')) e.def += 3;
  if (e.elite) { e.hp = Math.round(e.hp * 1.6); e.atk += 2; e.xp *= 2; }
  const scale = 1 + (G.lvl - 1) * 0.12;
  e.hp = Math.round(e.hp * scale); e.atk = Math.round(e.atk * scale);
  e.maxHp = e.hp;
  const label = e.traits.map((t) => TRAITS[t].name).join(' ');
  e.full = (e.elite ? 'Elite ' : '') + (label ? label + ' ' : '') + e.name;
  return e;
}

function startBattle(mob) {
  moveHeld = null;
  const enemies = mob.members.map(makeEnemy);
  beginBattle(enemies, mob);
  const names = enemies.map((e) => e.full).join(', ');
  say(`<b>Fight!</b> ${esc(names)}`);
  if (mob.elite) bookie('An elite! Somebody up there just doubled their bet against you.');
}
function startBossBattle() {
  const e = { id: 0, name: BOSS.name, full: BOSS.name, sprite: BOSS.sprite, hp: BOSS.hp + (G.lvl - 1) * 8, atk: BOSS.atk + Math.floor((G.lvl - 1) / 2), def: BOSS.def, spd: BOSS.spd, xp: BOSS.xp, tokens: BOSS.tokens, drops: [], traits: [], boss: true, alive: true, flash: 0, intent: 'attack', begged: true, phase: 1 };
  e.maxHp = e.hp;
  beginBattle([e], null);
  bookie('Ladies, gentlemen and billionaires: THE TURNSTILE KING!');
  say('"No ticket? No exit. No mercy."');
}
function beginBattle(enemies, mob) {
  mode = 'battle';
  prompt = null;
  B = { enemies, mob, phase: 'menu', turn: 0, buff: { ...(G.buff || {}) }, poison: 0, stolen: [], startHp: G.hp, mercyQueue: [] };
  G.buff = null;
  for (const e of B.enemies) rollIntent(e);
  if (FL.rule.id === 'cowards') for (const e of B.enemies) if (!e.boss && !e.traits.includes('cowardly')) e.traits.push('cowardly');
  renderControls();
  updateHud();
}

function rollIntent(e) {
  const r = R.next();
  if (e.boss) e.intent = r < 0.45 ? 'attack' : r < 0.75 ? 'heavy' : 'fare';
  else e.intent = r < 0.68 ? 'attack' : r < 0.88 ? 'heavy' : 'defend';
}
const INTENT_TEXT = { attack: 'Attacking', heavy: 'Winding up!', defend: 'Defending', fare: 'Fare check' };

function alive() { return B.enemies.filter((e) => e.alive); }

function renderBattleControls() {
  const foes = `<div class="foes">${B.enemies.map((e) => `<div class="foe ${e.alive ? '' : 'dead'}"><span><span class="nm">${esc(e.full)}</span> <span class="muted">${Math.max(0, e.hp)}/${e.maxHp}</span>${e.traits.length ? `<br><span class="tr">${e.traits.map((t) => esc(TRAITS[t].desc)).join(' · ')}</span>` : ''}</span><span class="in">${e.alive ? INTENT_TEXT[e.intent] : e.spared ? 'Spared' : 'Down'}</span></div>`).join('')}</div>`;
  const sk = cls().skill;
  let btns = '';
  if (B.phase === 'menu') {
    btns = `<div class="grid2">
      <button class="btn red" data-b="attack">ATTACK</button>
      <button class="btn" data-b="skill" ${G.mp < sk.mp ? 'disabled' : ''}>${esc(sk.name.toUpperCase())} ${sk.mp}MP</button>
      <button class="btn green" data-b="items">ITEM</button>
      <button class="btn grey" data-b="run" ${B.enemies.some((e) => e.boss) ? 'disabled' : ''}>RUN</button></div>`;
  } else if (B.phase === 'target') {
    btns = `<div class="stack">${alive().map((e) => `<button class="btn red text" data-b="target" data-arg="${e.id}">${esc(e.full)} (${e.hp} HP)</button>`).join('')}<button class="btn grey" data-b="back">BACK</button></div>`;
  } else if (B.phase === 'items') {
    const usable = G.order.filter((id) => count(id) > 0 && ['potion', 'food', 'bomb'].includes(ITEMS[id].type)).sort((a, b) => (G.favs[b] ? 1 : 0) - (G.favs[a] ? 1 : 0));
    btns = `<div class="stack" style="max-height:220px; overflow-y:auto">${usable.map((id) => `<button class="btn green text" data-b="use" data-arg="${id}">${G.favs[id] ? '★ ' : ''}${esc(ITEMS[id].name)} x${count(id)}</button>`).join('') || '<p class="muted">No usable items.</p>'}</div><button class="btn grey" data-b="back">BACK</button>`;
  } else if (B.phase === 'mercy') {
    const e = B.enemies.find((x) => x.id === B.mercyTarget);
    btns = `<div class="grid2"><button class="btn green" data-b="spare">SPARE IT</button><button class="btn red" data-b="finish">FINISH IT</button></div>`;
    if (!e) btns = '';
  } else if (B.phase === 'busy') {
    btns = '<div class="grid2"><button class="btn grey" disabled>...</button><button class="btn grey" disabled>...</button></div>';
  } else if (B.phase === 'end') {
    btns = '<button class="btn green" data-b="continue">CONTINUE</button>';
  }
  controls.innerHTML = foes + btns;
}

async function battleInput(cmd, arg) {
  if (!B) return;
  const sk = cls().skill;
  if (cmd === 'back') { B.phase = 'menu'; return renderBattleControls(); }
  if (cmd === 'continue') return endBattleReturn();
  if (B.phase === 'busy') return;
  if (cmd === 'attack' || (cmd === 'skill' && sk.target === 'one')) {
    B.pending = cmd;
    if (alive().length === 1) return doPlayer(cmd, alive()[0].id);
    B.phase = 'target'; return renderBattleControls();
  }
  if (cmd === 'skill') return doPlayer('skill', null);
  if (cmd === 'target') return doPlayer(B.pending, Number(arg));
  if (cmd === 'items') { B.phase = 'items'; return renderBattleControls(); }
  if (cmd === 'use') return doPlayer('use', arg);
  if (cmd === 'run') return doPlayer('run', null);
  if (cmd === 'spare' || cmd === 'finish') return resolveMercy(cmd);
}

function heroAtk() { return stats().atk + (B.buff.atk || 0); }
function heroDef() { return stats().def + (B.buff.def || 0); }

function hitEnemy(e, dmg, why = '') {
  dmg = Math.max(1, Math.round(dmg));
  e.hp -= dmg;
  e.flash = 12;
  say(`${why}${esc(e.full)} takes <b>${dmg}</b> damage.`);
  if (e.hp <= 0) killEnemy(e);
  else if (e.boss && e.phase === 1 && e.hp <= e.maxHp / 2) {
    e.phase = 2; e.atk += 3;
    bookie('FARE INCREASE! The King is angry now.');
  }
}

function killEnemy(e, how = 'kill') {
  e.alive = false; e.hp = 0;
  if (how === 'spare') { e.spared = true; return; }
  G.kills++;
  say(`${esc(e.full)} is defeated!`);
  achieve('firstblood');
  if (e.traits.includes('explosive')) {
    const d = 8 + G.lvl;
    G.hp -= d;
    say(`It explodes! You take <b>${d}</b> damage.`);
  }
  if (e.traits.includes('famous')) { addHype(2); achieve('ratings'); }
  if (G.equip.weapon && ITEMS[G.equip.weapon].hype) addHype(0.5);
  if (G.equip.armor && ITEMS[G.equip.armor].hype) addHype(0.5);
  if (G.race === 'ghoul') { G.hp = Math.min(stats().maxHp, G.hp + 4); say('You feed on it. +4 HP.'); }
}

async function doPlayer(cmd, arg) {
  B.phase = 'busy';
  renderBattleControls();
  const s = stats();
  const sk = cls().skill;
  B.turn++;
  if (cmd === 'attack' || (cmd === 'skill' && sk.target === 'one')) {
    const e = B.enemies.find((x) => x.id === arg && x.alive);
    if (!e) { B.phase = 'menu'; return renderBattleControls(); }
    const def = e.def + (e.intent === 'defend' ? 2 : 0);
    if (cmd === 'skill') {
      G.mp -= sk.mp;
      if (G.cls === 'brawler') hitEnemy(e, (heroAtk() + R.int(0, 2) - def) * 2, 'HAYMAKER! ');
      if (G.cls === 'hex') hitEnemy(e, s.mag * 1.6 + R.int(0, 3), 'Hex Bolt! ');
      if (G.cls === 'showboat') { hitEnemy(e, (heroAtk() + R.int(0, 2) - def) * 1.3, 'SHOWSTOPPER! '); addHype(2); }
      if (G.cls === 'talker') {
        const p = (e.boss ? 0 : 0.45) + s.luck * 0.02 + (e.hp < e.maxHp * 0.4 ? 0.3 : 0);
        if (R.chance(p)) { say(`You talk ${esc(e.full)} into walking away.`); killEnemy(e, 'spare'); G.spared++; tag('merciful'); }
        else say(`${esc(e.full)} is not listening.`);
      }
    } else {
      let dmg = heroAtk() + R.int(0, 2) - def;
      if (G.race === 'orc' && G.hp < s.maxHp / 3) { dmg *= 1.5; say('Orc rage!'); }
      const crit = R.chance(0.05 + s.luck * 0.01);
      if (crit) dmg *= 1.5;
      hitEnemy(e, dmg, crit ? 'Critical! ' : '');
      if (G.race === 'werewolf' && e.alive && R.chance(0.2)) hitEnemy(e, heroAtk() + R.int(0, 2) - def, 'You lunge again! ');
      if (G.race === 'goblin' && R.chance(0.25)) { const t = R.int(1, 3); G.tokens += t; say(`You swipe ${t} tokens.`); }
    }
  } else if (cmd === 'skill') {
    G.mp -= sk.mp;
    say('SHRAPNEL!');
    for (const e of alive()) hitEnemy(e, 5 + G.lvl + s.mag / 2 - e.def / 2);
  } else if (cmd === 'use') {
    const it = ITEMS[arg];
    if (it.type === 'bomb') {
      removeItem(arg);
      say(`You throw a ${esc(it.name)}!`);
      const mult = G.race === 'gnome' ? 1.5 : 1;
      for (const e of alive()) hitEnemy(e, it.dmg * mult);
    } else consume(arg);
  } else if (cmd === 'run') {
    const avg = alive().reduce((a, e) => a + e.spd, 0) / alive().length;
    const p = clamp(0.5 + (s.spd + (B.buff.spd || 0) - avg) * 0.05, 0.2, 0.9);
    if (R.chance(p)) {
      say('You got away!');
      bookie('Running away? Bold strategy. The Patrons are booing.');
      if (B.mob) B.mob.stun = 4;
      B.fled = true;
      B.phase = 'end';
      return renderBattleControls();
    }
    say('You could not get away!');
  }
  updateHud();
  await sleep(350);
  if (checkEnd()) return;
  await enemyTurn();
}

async function enemyTurn() {
  for (const e of alive()) {
    let acts = 1;
    if (e.traits.includes('fast') && R.chance(0.3)) acts = 2;
    for (let a = 0; a < acts && e.alive && G.hp > 0; a++) {
      await sleep(260);
      enemyAct(e);
      updateHud();
      renderBattleControls();
      if (G.hp <= 0) break;
    }
    if (G.hp <= 0) break;
  }
  // Poison at the end of the round.
  if (B.poison > 0 && G.hp > 0) { G.hp -= 2; B.poison--; say('Poison stings. <b>2</b> damage.'); }
  for (const e of alive()) rollIntent(e);
  updateHud();
  if (checkEnd()) return;
  // Hurt cowardly mobs beg for their lives.
  const beggar = alive().find((e) => !e.begged && !e.boss && e.traits.includes('cowardly') && e.hp <= e.maxHp * 0.35);
  if (beggar) {
    beggar.begged = true;
    B.mercyTarget = beggar.id;
    B.phase = 'mercy';
    say(`${esc(beggar.full)} drops to the ground and begs for its life!`);
    return renderBattleControls();
  }
  B.phase = 'menu';
  renderBattleControls();
}

function enemyAct(e) {
  if (e.intent === 'defend') { say(`${esc(e.full)} braces itself.`); return; }
  if (e.intent === 'fare') {
    const t = Math.min(G.tokens, R.int(3, 8));
    G.tokens -= t;
    say(`"FARE CHECK!" The King takes ${t} tokens and swings his card at you.`);
  }
  if (G.race === 'fairy' && R.chance(0.15)) { say(`You flutter out of the way of ${esc(e.full)}!`); return; }
  if (G.race === 'pixie' && alive().length > 1 && R.chance(0.15)) {
    const other = R.pick(alive().filter((x) => x !== e));
    say(`Your glamour tricks ${esc(e.full)} into hitting ${esc(other.full)}!`);
    hitEnemy(other, e.atk);
    return;
  }
  let dmg = e.atk + R.int(0, 2) - heroDef();
  if (e.intent === 'heavy') dmg *= 1.6;
  dmg = Math.max(1, Math.round(dmg));
  G.hp -= dmg;
  say(`${esc(e.full)} ${e.intent === 'heavy' ? 'slams' : 'hits'} you for <b>${dmg}</b>.`);
  if (dmg >= stats().maxHp * 0.25) bookie(R.pick(BOOKIE.hurt));
  if (e.traits.includes('toxic') && R.chance(0.35)) {
    if (G.race === 'dwarf') say('Poison! Your dwarf gut shrugs it off.');
    else { B.poison = 3; say('You are poisoned!'); }
  }
  if (e.traits.includes('greedy') && R.chance(0.3)) {
    const options = G.order.filter((id) => count(id) > 0 && ITEMS[id].type !== 'box' && G.equip.weapon !== id && G.equip.armor !== id);
    if (options.length) {
      const id = R.pick(options);
      removeItem(id);
      B.stolen.push(id);
      say(`${esc(e.full)} steals your ${esc(ITEMS[id].name)}!`);
    }
  }
}

function resolveMercy(choice) {
  const e = B.enemies.find((x) => x.id === B.mercyTarget);
  if (choice === 'spare') {
    say(`You let ${esc(e.full)} go. It scurries off.`);
    bookie(R.pick(BOOKIE.spare));
    killEnemy(e, 'spare');
    G.spared++;
    tag('merciful');
    achieve('mercy');
  } else {
    say(`You finish off ${esc(e.full)}.`);
    bookie(R.pick(BOOKIE.finish));
    killEnemy(e);
    tag('cruel');
    addHype(1);
  }
  updateHud();
  if (checkEnd()) return;
  B.phase = 'menu';
  renderBattleControls();
}

function checkEnd() {
  if (G.hp <= 0) { G.hp = 0; updateHud(); setTimeout(() => die('You were knocked out on live TV.'), 500); B.phase = 'busy'; renderBattleControls(); return true; }
  if (alive().length) return false;
  victory();
  return true;
}

function victory() {
  const s = stats();
  let xp = 0, tokens = 0;
  const drops = [];
  for (const e of B.enemies) {
    if (e.spared) { xp += Math.floor(e.xp / 2); continue; }
    xp += e.xp;
    tokens += R.int(e.tokens[0], e.tokens[1]);
    if (e.drops.length && R.chance(0.45)) drops.push(R.pick(e.drops));
    if (R.chance(0.2)) drops.push('box_rusty');
    if (e.elite) { drops.push('box_silver'); achieve('elite'); tag('brave'); }
  }
  const boss = B.enemies.find((e) => e.boss);
  say('<span class="good">Victory!</span>');
  if (boss) {
    G.bossDead = true;
    drops.push('box_gold', 'w_bar');
    G.odds *= 0.6;
    tag('brave');
    achieve('king');
    bookie('THE KING IS DEAD! The stairs are open. The Patrons are screaming.');
  } else {
    G.odds *= B.enemies.some((e) => e.elite) ? 0.85 : 0.93;
    bookie(G.hp < s.maxHp * 0.25 ? R.pick(BOOKIE.lowWin) : R.pick(BOOKIE.win));
  }
  if (G.hp < s.maxHp * 0.25) { addHype(1); G.odds *= 0.97; }
  if (B.turn <= 1) addHype(1);
  G.tokens += tokens;
  say(`+${xp} XP · +${tokens} tokens`);
  for (const d of drops) addItem(d);
  for (const id of B.stolen) { addItem(id, 1, true); say(`You got your ${esc(ITEMS[id].name)} back.`); }
  gainXp(xp);
  if (B.mob) {
    G.killed.push(B.mob.id);
    mobsLive = mobsLive.filter((m) => m !== B.mob);
  }
  G.odds = Math.max(1, G.odds);
  updateHud();
  B.phase = 'end';
  renderBattleControls();
}

function gainXp(n) {
  G.xp += n;
  while (G.xp >= G.lvl * 20) {
    G.xp -= G.lvl * 20;
    G.lvl++;
    const s = stats();
    G.hp = Math.min(s.maxHp, G.hp + 10);
    G.mp = Math.min(s.maxMp, G.mp + 5);
    G.odds *= 0.95;
    say(`<span class="good">LEVEL UP! You are now level ${G.lvl}.</span>`);
  }
}

function endBattleReturn() {
  if (B && B.fled) G.buff = null;
  mode = 'map';
  B = null;
  renderControls();
  updateHud();
}

// ---------- Death and floor clear ----------
function die(reason) {
  mode = 'title';
  B = null; prompt = null;
  controls.innerHTML = '';
  showOverlay(`
    <p class="banner red" style="margin-top:40px">YOU DIED</p>
    <p style="text-align:center">${esc(reason)}</p>
    <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> ${esc(R.pick(BOOKIE.death))}</p></div>
    <button class="btn red" data-act="reload">RELOAD LAST SAVE</button>
    <button class="btn grey" data-act="quit">BACK TO TITLE</button>`);
}
overlayHandlers.reload = () => {
  const slot = G.slot;
  if (!loadSlot(slot)) return showTitle();
  G.deaths++;
  G.odds *= 1.3;
  enterMap(false);
  bookie(G.deaths === 1 ? 'And we are back! Your odds took a hit. The audience remembers.' : `Death number ${G.deaths}. The Patrons have started a side bet on number ${G.deaths + 1}.`);
  achieve('death');
  save();
};

function showFloorClear() {
  mode = 'title';
  B = null; prompt = null;
  controls.innerHTML = '';
  const mood = docMood();
  const docEnd = {
    friend: 'Doc packs her bag. "Floor 2? I\'m coming with you. Someone has to keep you alive."',
    warm: 'Doc waves from the safe room door. "Don\'t die down there. I mean it."',
    neutral: 'Doc shrugs. "Good luck, I guess."',
    scared: 'Doc locks the safe room door as you pass. She\'s telling the others to watch out for you.',
    hostile: 'Doc spits on the floor as you leave. She\'s telling everyone what you did.',
  }[mood];
  const mins = Math.floor((20 * 60 + (G.job === 'driver' ? 120 : 0) - G.timeLeft) / 60);
  showOverlay(`
    <p class="banner gold" style="margin-top:24px">FLOOR 1 CLEARED!</p>
    <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> ${esc(G.name)} takes the stairs! Odds now ${oddsText()}. Somebody up there is getting rich.</p></div>
    <div class="stat-list">
      <span>Level <b>${G.lvl}</b></span><span>Time <b>${mins} min</b></span>
      <span>Kills <b>${G.kills}</b></span><span>Spared <b>${G.spared}</b></span>
      <span>Boxes opened <b>${G.boxesOpened}</b></span><span>Deaths <b>${G.deaths}</b></span>
    </div>
    <p>${esc(docEnd)}</p>
    <p class="muted">Floor 2, The Food Court, is coming in a future build. Try another hero in a different save slot to see a different floor, rule and Doc.</p>
    <button class="btn" data-act="quit">BACK TO TITLE</button>`);
}

// ---------- Drawing ----------
function drawTile(x, y, sx, sy) {
  const t = tileAt(FL, x, y);
  if (t === T.WALL) {
    const below = tileAt(FL, x, y + 1);
    if (below !== T.WALL) {
      ctx.fillStyle = '#3b2a4d'; ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#5a5373'; ctx.fillRect(sx, sy, 16, 2);
      ctx.fillStyle = '#2c2040';
      ctx.fillRect(sx, sy + 7, 16, 1); ctx.fillRect(sx + ((x % 2) ? 4 : 11), sy + 2, 1, 5); ctx.fillRect(sx + ((x % 2) ? 11 : 4), sy + 8, 1, 5);
      ctx.fillStyle = '#241a36'; ctx.fillRect(sx, sy + 13, 16, 3);
    } else {
      ctx.fillStyle = '#140e20'; ctx.fillRect(sx, sy, 16, 16);
    }
    return;
  }
  if (t === T.SAFE) {
    ctx.fillStyle = (x + y) % 2 ? '#8a4b2a' : '#9a5636'; ctx.fillRect(sx, sy, 16, 16);
    ctx.fillStyle = '#b8693a'; ctx.fillRect(sx + 1, sy + 1, 14, 1);
  } else {
    ctx.fillStyle = (x + y) % 2 ? '#5a5373' : '#635c7d'; ctx.fillRect(sx, sy, 16, 16);
    ctx.fillStyle = '#4e4866'; ctx.fillRect(sx, sy, 16, 1); ctx.fillRect(sx, sy, 1, 16);
    const d = FL.decor[y * FL.w + x];
    if (d === 1) { ctx.fillStyle = '#3a6ea5'; ctx.fillRect(sx + 4, sy + 9, 8, 3); ctx.fillStyle = '#6aa0d8'; ctx.fillRect(sx + 5, sy + 9, 3, 1); }
    if (d === 2) { ctx.fillStyle = '#3b2a4d'; ctx.fillRect(sx + 3, sy + 4, 1, 5); ctx.fillRect(sx + 4, sy + 8, 4, 1); ctx.fillRect(sx + 8, sy + 9, 1, 3); }
    if (d === 3) { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(sx + 10, sy + 5, 2, 2); ctx.fillStyle = '#c8334a'; ctx.fillRect(sx + 5, sy + 11, 2, 1); }
  }
  if (t === T.STAIRS) ctx.drawImage(sprite('stairs'), sx, sy);
}

let frame = 0;
function drawMap() {
  const tx = G.pos.x * 16, ty = G.pos.y * 16;
  heroDraw.x += (tx - heroDraw.x) * 0.35; heroDraw.y += (ty - heroDraw.y) * 0.35;
  if (Math.abs(tx - heroDraw.x) < 0.5) heroDraw.x = tx;
  if (Math.abs(ty - heroDraw.y) < 0.5) heroDraw.y = ty;
  const camX = Math.round(clamp(heroDraw.x + 8 - 120, 0, FL.w * 16 - 240));
  const camY = Math.round(clamp(heroDraw.y + 8 - 80, 0, FL.h * 16 - 160));
  const x0 = Math.floor(camX / 16), y0 = Math.floor(camY / 16);
  for (let y = y0; y <= y0 + 11; y++) for (let x = x0; x <= x0 + 16; x++) drawTile(x, y, x * 16 - camX, y * 16 - camY);
  const bob = (frame >> 4) % 2;
  const draw = (img, x, y, dy = 0) => ctx.drawImage(img, Math.round(x - camX), Math.round(y - camY + dy));
  for (const c of FL.chests) if (!G.opened.includes(c.id)) draw(boxSprite(c.tier), c.x * 16, c.y * 16);
  ctx.fillStyle = '#5b3a29';
  ctx.fillRect(FL.bench.x * 16 - camX + 1, FL.bench.y * 16 - camY + 6, 14, 6);
  ctx.fillStyle = '#b8693a'; ctx.fillRect(FL.bench.x * 16 - camX + 1, FL.bench.y * 16 - camY + 5, 14, 2);
  ctx.fillStyle = '#8b84a3'; ctx.fillRect(FL.bench.x * 16 - camX + 4, FL.bench.y * 16 - camY + 2, 3, 3);
  draw(sprite('bookie'), FL.booth.x * 16, FL.booth.y * 16, bob);
  draw(docSprite(), FL.doc.x * 16, FL.doc.y * 16);
  if (!G.bossDead) draw(sprite('king'), FL.boss.x * 16, FL.boss.y * 16, bob);
  for (const m of mobsLive) {
    const lead = m.members[0];
    draw(mobSprite(MOBS[lead.type].sprite, lead.traits), m.x * 16, m.y * 16, ((frame >> 3) + m.x) % 2);
    if (m.elite) { ctx.fillStyle = '#f5c542'; ctx.fillRect(m.x * 16 - camX + 6, m.y * 16 - camY - 2, 4, 2); }
    for (let i = 1; i < m.members.length; i++) { ctx.fillStyle = '#ff5fa2'; ctx.fillRect(m.x * 16 - camX + 12 - i * 3, m.y * 16 - camY + 14, 2, 2); }
  }
  draw(heroSprite(race(), cls()), heroDraw.x, heroDraw.y);
}

function drawBattle() {
  const grd = ctx.createLinearGradient(0, 0, 0, 160);
  grd.addColorStop(0, '#241a36'); grd.addColorStop(0.55, '#3b2a4d'); grd.addColorStop(0.56, '#4a3d63'); grd.addColorStop(1, '#3b2a4d');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 240, 160);
  ctx.fillStyle = '#5a5373';
  ellipse(170, 74, 64, 9);
  ellipse(52, 140, 48, 9);
  const live = B.enemies;
  const boss = live.find((e) => e.boss);
  const pos = boss ? [[146, 18]] : live.length === 1 ? [[154, 38]] : live.length === 2 ? [[128, 40], [180, 36]] : [[112, 42], [154, 34], [196, 42]];
  live.forEach((e, i) => {
    if (!e.alive && !e.flash) return;
    const [x, y] = pos[i];
    const size = e.boss ? 48 : 32;
    if (e.flash > 0) e.flash--;
    if (e.flash % 4 < 2) {
      ctx.drawImage(e.boss ? sprite('king') : mobSprite(e.sprite, e.traits), x, y + ((frame >> 4) % 2), size, size);
    }
    if (e.alive) {
      ctx.fillStyle = '#1a1426'; ctx.fillRect(x + 2, y + size + 2, size - 4, 4);
      ctx.fillStyle = e.hp / e.maxHp > 0.35 ? '#6bbf59' : '#c8334a';
      ctx.fillRect(x + 3, y + size + 3, Math.max(0, (size - 6) * (e.hp / e.maxHp)), 2);
      if (B.phase === 'target') { ctx.fillStyle = '#4fd8e8'; ctx.fillRect(x + size / 2 - 3, y - 6 - ((frame >> 3) % 2), 6, 3); ctx.fillRect(x + size / 2 - 1, y - 3 - ((frame >> 3) % 2), 2, 2); }
      if (e.elite) { ctx.fillStyle = '#f5c542'; ctx.fillRect(x + size / 2 - 4, y - 2, 8, 2); }
    }
  });
  ctx.drawImage(heroSprite(race(), cls()), 28, 92, 48, 48);
}
function ellipse(cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

function drawIdle() {
  ctx.fillStyle = '#0f0b1a'; ctx.fillRect(0, 0, 240, 160);
  for (let i = 0; i < 40; i++) {
    const x = (i * 53 + frame * (i % 3 + 1) * 0.2) % 240, y = (i * 37) % 160;
    ctx.fillStyle = i % 5 ? '#3b2a4d' : '#ff5fa2'; ctx.fillRect(Math.floor(x), y, 1, 1);
  }
  ctx.drawImage(sprite('bookie'), 88, 40 + ((frame >> 4) % 2) * 2, 64, 64);
}

let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  frame++;
  ctx.imageSmoothingEnabled = false;
  if (mode === 'map' && G) {
    if (canAct()) {
      G.timeLeft -= dt;
      G.playTime += dt;
      if (G.timeLeft <= 300 && !G.timerWarn.five) { G.timerWarn.five = true; bookie(BOOKIE.timer[0]); }
      if (G.timeLeft <= 60 && !G.timerWarn.one) { G.timerWarn.one = true; bookie(BOOKIE.timer[1]); }
      if (G.timeLeft <= 0) { G.timeLeft = 0; die('The floor collapsed under you. The timer ran out.'); }
      if (Math.floor(G.timeLeft) !== Math.floor(G.timeLeft + dt)) updateHud();
      const delay = G.job === 'driver' ? 120 : 165;
      if (moveHeld && now - lastStep > delay) { lastStep = now; tryStep(moveHeld); }
    }
    if (FL && mode === 'map') drawMap();
  } else if (mode === 'battle' && B) {
    drawBattle();
  } else drawIdle();
  requestAnimationFrame(loop);
}

// Keep the run's time and position if the tab is closed mid-floor? No: only safe rooms save, like the design says.
showTitle();
requestAnimationFrame(loop);

// For automated tests.
window.__longodds = { get G() { return G; }, get FL() { return FL; }, get mode() { return mode; }, get B() { return B; }, mobsLive: () => mobsLive };
