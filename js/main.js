// Long Odds prototype. Game state, map, battles, bag, safe room and screens.
import { R, makeRng, newSeed } from './rng.js?v=__BUILD_VERSION__';
import { BASE_STATS, JOBS, PERKS, RACES, CLASSES, ITEMS, LOOT, BOX_TOKENS, RARITY, RARITY_ORDER, SIDE_EFFECTS, MOBS, BOSSES, ATTACKS, MOVES, TRAITS, ACHIEVEMENTS, BOOKIE, GEAR_SLOTS, GEAR_TYPES, SLOT_NAMES, STAT_NAMES, RARITY_PRICE, SHOP_TIERS, RECIPES, SCHOOL_NAMES } from './data.js?v=__BUILD_VERSION__';
import { generateFloor, tutorialFloor, roomAt, makeGroup, walkable, tileAt, T, key } from './dungeon.js?v=__BUILD_VERSION__';
import { sprite, heroSprite, flipped, docSprite, boxSprite, mobSprite, itemIcon, slotIcon } from './sprites.js?v=__BUILD_VERSION__';
import { SLOT_COUNT, readSlot, writeSlot, deleteSlot, listSlots } from './save.js?v=__BUILD_VERSION__';
import { VERSION, checkForUpdate, installUpdate } from './version.js?v=__BUILD_VERSION__';
import { SUGGEST_KEY } from './config.js?v=__BUILD_VERSION__';

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
// Grid walking: each step slides at an even speed from one tile to the next, and the
// next step starts the moment the last one ends, so holding a direction never stutters.
let walk = null;      // { fx, fy, tx, ty, t0, dur }
let face = 'down';
let keysDown = [];    // held arrow keys, newest last
function stepDur() { return hasPerk('quickfeet') ? 135 : 165; }
function walking(now = performance.now()) { return walk && now < walk.t0 + walk.dur; }
let SEEN = null;     // fog of war: 1 = tile discovered
let objIndex = new Map();
let FX = { proj: null, pops: [], bursts: [], heroFlash: 0 };
const icon = (id) => itemIcon(id, ITEMS[id].type, ITEMS[id].rarity);
const isGear = (id) => !!ITEMS[id] && GEAR_TYPES.includes(ITEMS[id].type);
const slotType = (sl) => (sl === 'ring1' || sl === 'ring2' ? 'ring' : sl);

function race() { return byId(RACES, G.race); }
function cls() { return byId(CLASSES, G.cls); }
function job() { return byId(JOBS, G.job) || JOBS[0]; }
// Charisma: 5 is average. Each point above it makes the crowd, shops and people warmer.
function chaBonus() { return Math.max(-5, Math.min(15, stats().cha - 5)); }
function chaMult() { return 1 + chaBonus() * 0.03; }
// Some classes can't learn whole schools of spells.
function canLearn(scrollId) { const mv = MOVES[ITEMS[scrollId].teaches]; return !mv || !(cls().cannot || []).includes(mv.school); }
function hasPerk(id) { return !!G && (G.perks || []).includes(id); }
const LEGACY_PERK = { nurse: 'medic', mechanic: 'tinkerer', cook: 'chef', driver: 'quickfeet', bartender: 'charmer', unemployed: 'pity' };

function stats() {
  const s = { ...BASE_STATS };
  for (const m of [race().mods, cls().mods, ...(G.perks || []).map((p) => PERKS[p].mods || {})]) for (const k in m) s[k] += m[k];
  const l = G.lvl - 1;
  s.maxHp += l * 6; s.maxMp += l * 3; s.atk += l; s.def += Math.floor(l / 2); s.mag += l;
  for (const slot of GEAR_SLOTS) {
    const it = G.equip[slot] && ITEMS[G.equip[slot]];
    if (it) for (const k in STAT_NAMES) s[k] += it[k] || 0;
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
  if (G.inv[id] <= 0) { delete G.inv[id]; G.order = G.order.filter((x) => x !== id); }
  // You cannot wear more copies than you own.
  for (const sl of GEAR_SLOTS.slice().reverse()) if (G.equip[sl] === id && equippedCount(id) > count(id)) G.equip[sl] = null;
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
  if (cls().hypeUp) mult *= 1.5;
  mult *= chaMult();
  if (hasPerk('ham')) mult *= 1.25;
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
  for (const k in v) d[k] += k === 'trust' && v[k] > 0 ? Math.round(v[k] * chaMult()) : v[k];
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
function newGame(slot, name, jobId, raceId, clsId, tutorial = true, perks = [], sex = 'm') {
  const seed = newSeed();
  G = {
    v: 2, slot, name, sex, job: jobId, perks: perks.slice(), race: raceId, cls: clsId, seed, floor: tutorial ? 0 : 1,
    lvl: 1, xp: 0, hp: 0, mp: 0, tokens: 5,
    inv: {}, order: [], favs: {}, equip: emptyEquip(),
    pos: null, moves: [], radar: 0, respawnT: 0, spawnCount: 0, tutSeen: {}, seen: '', shopBought: {},
    odds: byId(RACES, raceId).odds + byId(CLASSES, clsId).odds, hype: 0,
    opened: [], killed: [], bossesDead: [], cleared: false,
    doc: { trust: 0, fear: 0, respect: 0, owed: 0, met: false, eventDone: false, gift: false, memory: [] },
    sideFx: {}, ach: {}, boxesOpened: 0, deaths: 0, kills: 0, spared: 0, steps: 0, playTime: 0, buff: null,
  };
  if (hasPerk('charmer')) G.doc.trust += 10;
  if (hasPerk('stash')) { addItem('box_rusty', 2, true); G.tokens += 20; }
  if (raceId === 'goblin') G.doc.trust -= 5;
  if (raceId === 'ghoul') G.doc.fear += 10;
  const s = stats();
  G.hp = s.maxHp; G.mp = s.maxMp;
  addItem('potion_heal', 3, true);
  addItem('food_pretzel', 2, true);
  addItem('w_pipe', 1, true);
  G.equip.weapon = 'w_pipe';
  if (clsId === 'scrapper') addItem('bomb', 3, true);
  if (byId(CLASSES, clsId).magic) addItem('potion_mana', 2, true);
  buildFloor();
  G.pos = { ...FL.start };
  save();
  enterMap(true);
}

function emptyEquip() { const e = {}; for (const sl of GEAR_SLOTS) e[sl] = null; return e; }

function buildFloor() {
  FL = G.floor === 0 ? tutorialFloor() : generateFloor(G.seed, G.floor, { extraChest: hasPerk('pity') });
  mobsLive = FL.mobs.filter((m) => !G.killed.includes(m.id)).map((m) => ({ ...m, stun: m.still ? 1e9 : 0 }));
  SEEN = decodeSeen(G.seen, FL.w * FL.h);
  indexObjects();
}

function save() {
  if (SEEN) G.seen = encodeSeen(SEEN);
  writeSlot(G.slot, JSON.parse(JSON.stringify(G)));
}

function loadSlot(i) {
  const data = readSlot(i);
  if (!data) return false;
  G = data;
  G.slot = i;
  // Bring older saves up to date.
  G.equip = { ...emptyEquip(), ...(G.equip || {}) };
  G.moves = G.moves || [];
  G.sex = G.sex || 'm';
  if (!byId(CLASSES, G.cls)) G.cls = 'brawler';
  if (!G.perks) G.perks = LEGACY_PERK[G.job] ? [LEGACY_PERK[G.job]] : [];
  G.radar = G.radar || 0;
  G.guide = G.guide || 0; guidePath = null;
  G.respawnT = G.respawnT || 0;
  G.spawnCount = G.spawnCount || 0;
  G.tutSeen = G.tutSeen || {};
  G.shopBought = G.shopBought || {};
  if (!G.bossesDead) G.bossesDead = G.bossDead ? ['b1'] : [];
  const oldWorld = (G.v || 1) < 2;
  if (oldWorld) { G.opened = []; G.killed = []; G.seen = ''; G.bossesDead = []; G.cleared = false; G.v = 2; }
  delete G.timeLeft; delete G.timerWarn; delete G.bossDead;
  buildFloor();
  if (oldWorld || !G.pos || !walkable(FL, G.pos.x, G.pos.y)) G.pos = { ...FL.start };
  return true;
}

// ---------- HUD ----------
function updateHud() {
  if (!G) return;
  const s = stats();
  $('hud-floor').textContent = G.floor === 0 ? 'TUTORIAL' : 'F' + G.floor + ' THE LOBBY';
  const tEl = $('hud-timer');
  if (G.radar > 0) { tEl.textContent = 'RADAR ' + Math.ceil(G.radar) + 's'; tEl.classList.toggle('warn', G.radar <= 10); }
  else if (G.guide > 0) { tEl.textContent = 'COMPASS ' + Math.ceil(G.guide) + 's'; tEl.classList.toggle('warn', G.guide <= 10); }
  else { tEl.textContent = FL && !FL.tutorial ? 'BOSS ' + G.bossesDead.length + '/2' : ''; tEl.classList.remove('warn'); }
  $('hud-odds').textContent = Math.max(1, Math.round(G.odds)) + ' TO 1';
  $('hp-fill').style.width = clamp((G.hp / s.maxHp) * 100, 0, 100) + '%';
  $('mp-fill').style.width = clamp((G.mp / s.maxMp) * 100, 0, 100) + '%';
  $('hp-text').textContent = Math.max(0, Math.round(G.hp));
  $('mp-text').textContent = Math.round(G.mp);
  $('hud-lvl').textContent = G.lvl;
  const need = G.lvl * 20;
  $('xp-fill').style.width = clamp((G.xp / need) * 100, 0, 100) + '%';
  $('xp-text').textContent = G.xp + '/' + need;
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
    const img = heroSprite(r, c, 'down', 0, s.sex).toDataURL();
    const when = s.savedAt ? new Date(s.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    const del = titleState.confirm === i
      ? `<button class="del-confirm" data-act="del" data-i="${i}">Delete?</button>`
      : `<button class="icon-btn" data-act="askdel" data-i="${i}" aria-label="Delete save ${i + 1}">${TRASH}</button>`;
    return `<div class="slot"><img src="${img}" alt="">
      <button class="info" data-act="load" data-i="${i}"><span class="nm">${i + 1}. ${esc(s.name)} (${esc(r.name)} ${esc(c.name)})</span>
      <span class="dt">${s.floor === 0 ? 'Tutorial' : 'Floor ' + s.floor}${s.cleared ? ' cleared' : ''} · Level ${s.lvl} · ${esc(when)}</span>
      <span class="od">Odds ${Math.max(1, Math.round(s.odds))} to 1</span></button>${del}</div>`;
  }).join('');
  const upd = titleState.update
    ? `<button class="btn gold" data-act="install">Install update ${esc(titleState.update)}</button>`
    : `<button class="btn" data-act="update">CHECK FOR UPDATES</button>`;
  const sugBtn = `<button class="btn purple" data-act="suggest">SUGGESTIONS BOX</button>`;
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
      ${sugBtn}
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
const CREATE_STEPS = ['who', 'job', 'intro', 'race', 'class', 'confirm'];
// Every new save rolls 8 old jobs (each with 4 random enhancements) and 8 classes to pick from.
function rollJobOffers() {
  const all = Object.keys(PERKS);
  return R.shuffle(JOBS).slice(0, 8).map((j) => {
    const own = R.shuffle(j.perks).slice(0, 2);
    const extra = R.shuffle(all.filter((p) => !own.includes(p))).slice(0, 2);
    return { job: j.id, perks: R.shuffle([...own, ...extra]) };
  });
}
function startCreate(slot) {
  const classes = R.shuffle(CLASSES).slice(0, 8).map((c) => c.id);
  cr = { slot, step: 'who', name: '', sex: 'm', offers: rollJobOffers(), job: null, perks: [], race: 'human', classes, cls: classes[0] };
  renderCreate();
}
function createReady() { return cr.name.trim() && cr.job && cr.perks.length === 2; }
function offerFor(jobId) { return cr.offers.find((o) => o.job === jobId); }
function modsText(m) { return Object.entries(m).map(([k, v]) => (v > 0 ? '+' : '') + v + ' ' + STAT_NAMES[k]).join(', '); }
function cannotText(c) { return c.cannot && c.cannot.length ? `Can't learn ${c.cannot.map((x) => SCHOOL_NAMES[x]).join(', ')} spells.` : 'Can learn every spell.'; }
function renderCreate() {
  const r = byId(RACES, cr.race), c = byId(CLASSES, cr.cls);
  const preview = heroSprite(r, c, 'down', 0, cr.sex).toDataURL();
  if (cr.step === 'who') {
    showOverlay(`
      <h2>WHO WERE YOU?</h2>
      <p class="muted">Before the world started ending, you were just a regular person.</p>
      <div class="preview"><img src="${preview}" alt=""><div style="flex:1">
        <label for="nm">Your name</label>
        <input id="nm" type="text" maxlength="14" autocomplete="off" value="${esc(cr.name)}" placeholder="Type a name"></div></div>
      <div class="grid2"><button class="btn ${cr.sex === 'm' ? 'gold' : 'grey'}" data-act="sex" data-id="m">♂ MALE</button><button class="btn ${cr.sex === 'f' ? 'gold' : 'grey'}" data-act="sex" data-id="f">♀ FEMALE</button></div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next" ${cr.name.trim() ? '' : 'disabled'}>NEXT</button></div>`);
    const input = $('nm');
    input.addEventListener('input', () => {
      cr.name = input.value;
      overlay.querySelector('[data-act=next]').disabled = !cr.name.trim();
    });
  } else if (cr.step === 'job') {
    const pick = cr.job && offerFor(cr.job);
    showOverlay(`
      <h2>YOUR OLD JOB</h2>
      <p class="muted">BOOKIE pulled 8 files that could be yours. Pick one, then keep 2 of its enhancements.</p>
      <div class="cards">${cr.offers.map((o) => { const j = byId(JOBS, o.job); return `<button class="card ${cr.job === o.job ? 'sel' : ''}" data-act="job" data-id="${o.job}"><span class="nm">${cr.job === o.job ? '✓ ' : ''}${esc(j.name)}</span><span class="ds">${esc(j.flavor)}</span></button>`; }).join('')}</div>
      ${pick ? `<div class="row-between"><h2>PICK 2 ENHANCEMENTS</h2><span class="muted" style="font-size:14px">${cr.perks.length} of 2</span></div>
      <div class="cards">${pick.perks.map((pid) => `<button class="card ${cr.perks.includes(pid) ? 'sel' : ''}" data-act="perk" data-id="${pid}"><span class="nm">${cr.perks.includes(pid) ? '✓ ' : ''}${esc(PERKS[pid].name)}</span><span class="ds">${esc(PERKS[pid].desc)}</span></button>`).join('')}</div>` : ''}
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next" ${createReady() ? '' : 'disabled'}>NEXT</button></div>`);
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
    const sch = (x) => x.cannot && x.cannot.length ? `No ${x.cannot.map((k) => SCHOOL_NAMES[k]).join(', ')}` : 'Any spell';
    showOverlay(`
      <h2>PICK A CLASS</h2>
      <p class="muted" style="font-size:14px">These 8 classes are open to you this run.</p>
      <div class="preview"><img src="${preview}" alt=""><div><p><b>${esc(r.name)} ${esc(c.name)}</b></p><p class="muted" style="font-size:15px">${esc(c.desc)}</p>
        <p style="font-size:15px"><b style="color:var(--gold)">${esc(c.skill.name)}</b> (${c.skill.mp} MP): ${esc(c.skill.desc)}</p>
        <p style="font-size:14px;color:#ff8a8a">${esc(cannotText(c))}</p>
        <p class="muted" style="font-size:14px">${esc(modsText(c.mods))}</p></div></div>
      <div class="cards">${cr.classes.map((id) => { const x = byId(CLASSES, id); return `<button class="card ${cr.cls === x.id ? 'sel' : ''}" data-act="cls" data-id="${x.id}"><span class="nm">${esc(x.name)}</span><span class="ds">${esc(x.skill.name)} · ${esc(sch(x))}</span></button>`; }).join('')}</div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn green" data-act="next">NEXT</button></div>`);
  } else if (cr.step === 'confirm') {
    const j = byId(JOBS, cr.job);
    showOverlay(`
      <h2>READY?</h2>
      <div class="preview"><img src="${preview}" alt=""><div>
        <p><b>${esc(cr.name.trim())}</b></p>
        <p class="muted" style="font-size:15px">${cr.sex === 'f' ? 'Female' : 'Male'} ${esc(r.name)} ${esc(c.name)}, former ${esc(j.name.toLowerCase())}</p>
        <p class="muted" style="font-size:14px">${cr.perks.map((p) => esc(PERKS[p].name)).join(' + ')}</p>
        <p style="color:var(--gold); font-size:15px">Starting odds ${r.odds + c.odds} to 1</p></div></div>
      <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> ${r.odds + c.odds >= 20 ? 'A long shot! The Patrons love a long shot. Mostly to watch it fail.' : 'A safe pick. Boring, but the Patrons respect a sure thing.'}</p></div>
      <div class="grid2"><button class="btn grey" data-act="back">BACK</button><button class="btn red" data-act="begin">START TUTORIAL</button></div>
      <button class="btn" data-act="beginskip">SKIP TUTORIAL, GO TO FLOOR 1</button>`);
  }
}
Object.assign(overlayHandlers, {
  perk: (_, b) => {
    const id = b.dataset.id;
    if (cr.perks.includes(id)) cr.perks = cr.perks.filter((x) => x !== id);
    else { cr.perks.push(id); if (cr.perks.length > 2) cr.perks.shift(); }
    renderCreate();
  },
  job: (_, b) => { if (cr.job !== b.dataset.id) { cr.job = b.dataset.id; cr.perks = []; } renderCreate(); },
  sex: (_, b) => { cr.sex = b.dataset.id; renderCreate(); },
  race: (_, b) => { cr.race = b.dataset.id; renderCreate(); },
  cls: (_, b) => { cr.cls = b.dataset.id; renderCreate(); },
  next: () => { cr.step = CREATE_STEPS[CREATE_STEPS.indexOf(cr.step) + 1]; renderCreate(); },
  back: () => {
    const at = CREATE_STEPS.indexOf(cr.step);
    if (at === 0) return showTitle();
    // Going back from the race step skips the story screen.
    cr.step = CREATE_STEPS[cr.step === 'race' ? 1 : at - 1]; renderCreate();
  },
  begin: () => newGame(cr.slot, cr.name.trim().slice(0, 14), cr.job, cr.race, cr.cls, true, cr.perks, cr.sex),
  beginskip: () => newGame(cr.slot, cr.name.trim().slice(0, 14), cr.job, cr.race, cr.cls, false, cr.perks, cr.sex),
});

// ---------- Hints and BOOKIE's camera booths ----------
function compass(dx, dy) {
  const ns = dy < -Math.abs(dx) / 2 ? 'north' : dy > Math.abs(dx) / 2 ? 'south' : '';
  const ew = dx > Math.abs(dy) / 2 ? 'east' : dx < -Math.abs(dy) / 2 ? 'west' : '';
  return (ns && ew ? ns + '-' + ew : ns || ew) || 'right here';
}
function whereIs(p) {
  const dx = p.x - G.pos.x, dy = p.y - G.pos.y;
  return `about ${Math.max(1, Math.round(Math.hypot(dx, dy)))} steps ${compass(dx, dy)}`;
}
// Reveals a target on your map and says which way to go.
function pointToBoss(out) {
  const left = FL.bosses.filter((b) => !G.bossesDead.includes(b.id));
  if (FL.tutorial || !left.length) {
    if (!FL.tutorial) { markRect(FL.stairs.x - 3, FL.stairs.y - 3, 7, 7); out(`Both bosses are down. The stairs are ${whereIs(FL.stairs)}. I marked them on your map.`); }
    else out('No bosses in practice. Head right to the exit.');
    return;
  }
  const b = left.slice().sort((a, c) => Math.hypot(a.x - G.pos.x, a.y - G.pos.y) - Math.hypot(c.x - G.pos.x, c.y - G.pos.y))[0];
  const room = roomAt(FL, b.x, b.y);
  if (room) markRect(room.x - 1, room.y - 1, room.w + 2, room.h + 2); else markRect(b.x - 3, b.y - 3, 7, 7);
  out(`${BOSSES[b.type].name} is ${whereIs(b)}. It is marked on your map now.`);
}
function pointToLoot(out) {
  const near = FL.chests.filter((c) => !G.opened.includes(c.id)).map((c) => [c, Math.hypot(c.x - G.pos.x, c.y - G.pos.y)]).sort((a, b) => a[1] - b[1]).slice(0, 3);
  if (!near.length) return out('Picked clean. Not a single chest left on this floor.');
  for (const [c] of near) markRect(c.x - 2, c.y - 2, 5, 5);
  out(`${near.length} chest${near.length > 1 ? 's' : ''} marked on your map. The closest is ${whereIs(near[0][0])}.`);
}
// Useful next steps based on what the player has right now.
function adviceLines() {
  const s = stats();
  const tips = [];
  if (G.hp < s.maxHp * 0.4) tips.push('You look rough. Drink a potion or get healed before your next fight.');
  const boxes = boxCount();
  if (boxes) tips.push(`You are carrying ${boxes} loot box${boxes > 1 ? 'es' : ''}. You can open them right here: Bag, then Open all.`);
  const scrolls = G.order.filter((id) => ITEMS[id].type === 'scroll' && count(id) > 0 && !knownScroll(id));
  if (scrolls.length) tips.push(`You have ${scrolls.length} scroll${scrolls.length > 1 ? 's' : ''} you have not learned. Learn them here in the safe room.`);
  const ups = upgradeCount();
  if (ups) tips.push(`You have better gear sitting in your bag. Tap Gear, then Equip best.`);
  const craftable = RECIPES.filter(canCraft).length;
  if (craftable) tips.push(`The bench here can make ${craftable} thing${craftable > 1 ? 's' : ''} from your materials right now.`);
  const junk = junkList().reduce((a, id) => a + junkCount(id) * sellPrice(id), 0);
  if (junk >= 10) tips.push(`You have gear that is worse than what you wear. Penny will pay ${junk} tokens for it.`);
  if (!FL.tutorial) {
    const left = FL.bosses.filter((b) => !G.bossesDead.includes(b.id)).length;
    tips.push(left ? `${left} boss${left > 1 ? 'es' : ''} still stand between you and the stairs.` : 'Both bosses are down. Find the stairs.');
  }
  return tips;
}
// ---------- Talking panels: Doc and BOOKIE booths ----------
// Both open as a full screen panel: who you are talking to, what they just said,
// and big option cards that say what each choice does.
let talk = null; // { kind, at, lines, opts, extra }
function renderTalk() {
  const isDoc = talk.kind === 'doc';
  const portrait = (isDoc ? docSprite() : sprite('bookie')).toDataURL();
  const sub = isDoc ? docMoodText() : 'Your game was saved here';
  const lines = talk.lines.slice(-3).map((l) => `<p>${l}</p>`).join('');
  const opts = talk.opts.map((o, i) => `<button class="talk-opt ${o.color || ''}" data-act="talk" data-i="${i}" ${o.disabled ? 'disabled' : ''}>
    <span class="nm">${esc(o.label)}</span>${o.sub ? `<span class="ds">${esc(o.sub)}</span>` : ''}</button>`).join('');
  showOverlay(`
    <div class="talk-head"><img src="${portrait}" alt=""><div class="who"><h2>${isDoc ? 'DOC VANCE' : 'BOOKIE BOOTH'}</h2><span class="muted">${esc(sub)}</span></div><span class="tok">${G.tokens} tokens</span></div>
    <div class="speech">${lines}</div>
    ${talk.extra || ''}
    <div class="talk-opts">${opts}</div>
    <button class="btn grey" data-act="talkleave" style="position:sticky; bottom:0">LEAVE</button>`);
}
overlayHandlers.talk = (i) => { const o = talk && talk.opts[i]; if (o && !o.disabled) o.fn(); };
overlayHandlers.talkleave = () => { save(); talk = null; hideOverlay(); renderControls(); };

// ----- Doc -----
function docLine(t) { talk.lines.push(`<b class="who-doc">Doc:</b> ${esc(t)}`); }
function docMoodText() {
  return { friend: 'Trusts you a lot', warm: 'Likes you', neutral: 'Not sure about you yet', scared: 'Scared of you', hostile: 'Does not like you' }[docMood()];
}
function talkDoc() {
  moveHeld = null;
  talk = { kind: 'doc', lines: [], opts: [] };
  const d = G.doc;
  if (!d.met) {
    d.met = true;
    docLine('Name\'s Marisol Vance. Everyone calls me Doc. I was an ER nurse back when hospitals were a thing.');
  }
  if (!d.eventDone) {
    docLine('Quick, this crawler, Jules, is bleeding out and I\'m out of potions. Can you spare a Health Potion?');
    const has = count('potion_heal') > 0;
    talk.opts = [
      { label: 'Give Jules a Health Potion', sub: has ? `You have ${count('potion_heal')}. Doc will remember this.` : 'You do not have one.', color: 'green', disabled: !has, fn: () => {
        d.eventDone = true;
        removeItem('potion_heal'); tag('generous');
        docLine('Thank you. Really. Jules owes you one, and so do I.');
        bookie('Aww. The Patrons hate this. The viewers love it.');
        addHype(1);
        save();
        docPanel();
      } },
      { label: 'Keep it for yourself', sub: 'Doc will remember this too.', color: 'red', fn: () => {
        d.eventDone = true;
        tag('greedy');
        docLine('Right. I see what kind of crawler you are.');
        bookie('Cold! The Patrons approve. Jules does not.');
        save();
        docPanel();
      } },
    ];
    return renderTalk();
  }
  docGreeting();
  docPanel();
}
function docGreeting() {
  const d = G.doc;
  const last = d.memory[d.memory.length - 1];
  if (last && !d.heardLast) { d.heardLast = true; docLine(TAG_RUMORS[last]); }
  if (d.trust >= 20 && !d.gift) {
    d.gift = true;
    docLine('Here. I\'ve been saving this for someone who deserves it.');
    addItem('box_silver');
  }
  docLine({
    friend: 'There\'s my favorite crawler. Sit down, I\'ll patch you up for free.',
    warm: 'You\'re doing alright out there. Need patching up?',
    neutral: 'Another one. Fine. Healing\'s 10 tokens.',
    scared: 'D-don\'t come any closer. Take what you need and go.',
    hostile: 'I don\'t help people like you. Buy something or get out.',
  }[docMood()]);
}
function healPrice() { return { friend: 0, warm: 5, neutral: 10, scared: 0, hostile: null }[docMood()]; }
function potionPrice() {
  const base = { friend: 5, warm: 7, neutral: 8, scared: 8, hostile: 16 }[docMood()];
  return cls().haggle ? Math.max(3, base - 2) : base;
}
function docPanel() {
  const d = G.doc;
  const hp = healPrice(), pp = potionPrice(), s = stats();
  const full = G.hp >= s.maxHp && G.mp >= s.maxMp;
  talk.opts = [
    { label: hp === null ? 'Heal me' : hp === 0 ? 'Heal me (free)' : `Heal me (${hp} tokens)`, color: 'green',
      sub: hp === null ? 'She refuses to treat you.' : full ? 'You are already at full HP and MP.' : `Refills HP and MP. You are at ${Math.round(G.hp)} of ${s.maxHp} HP.`,
      disabled: hp === null || full || G.tokens < (hp || 0), fn: () => {
        G.tokens -= hp; G.hp = s.maxHp; G.mp = s.maxMp;
        docLine(docMood() === 'scared' ? 'There. Done. Please leave.' : 'Good as new. Try not to undo my work.');
        updateHud(); docPanel();
      } },
    { label: `Buy a Health Potion (${pp} tokens)`, sub: `Heals 25. You have ${count('potion_heal')}.`, disabled: G.tokens < pp, fn: () => {
      G.tokens -= pp; addItem('potion_heal', 1, true); docLine('Here. Don\'t drink it all at once.'); updateHud(); docPanel();
    } },
    { label: 'What should I do next?', sub: 'She looks over your bag and gear.', color: 'purple', fn: () => {
      const tips = adviceLines();
      if (!tips.length) docLine('Honestly? You\'re in decent shape. Go find those bosses.');
      for (const t of tips.slice(0, 3)) docLine(t);
      docPanel();
    } },
    { label: 'Where are the bosses?', sub: 'Marks the nearest boss on your map.', color: 'red', fn: () => { pointToBoss(docLine); docPanel(); } },
    ...(d.taught ? [] : [{ label: 'Teach me something', sub: d.trust >= 5 ? (canLearn('scroll_mend') ? 'She has a healing spell to share.' : 'She has something to help you heal.') : 'She needs to trust you more first. Kindness helps.', disabled: d.trust < 5, fn: () => {
      d.taught = true;
      if (canLearn('scroll_mend')) { docLine('Fine. Here\'s how I keep people alive down here. Learn it in a safe room, like this one.'); addItem('scroll_mend', 1, true); }
      else { docLine(`Healing magic won't stick to a ${cls().name}. Take these instead, and don't waste them.`); addItem('potion_big', 2, true); }
      docPanel();
    } }]),
    { label: 'Ask about the show', sub: 'Gossip about the Patrons and BOOKIE.', fn: () => {
      docLine(R.pick([
        'The Patrons bet on everything. How long you last, who you kill, who you save. Don\'t give them a good show for free.',
        'BOOKIE runs the cameras and the odds. Lately it\'s been... editorializing. I don\'t think it\'s supposed to do that.',
        'Nobody has ever come back up to tell us if the ark seats are real.',
        'The sponsor booths? Rich people pay to put their names on them. The gifts are real, though. Take them.',
      ]));
      docPanel();
    } },
  ];
  renderTalk();
}

// ----- BOOKIE camera booths -----
// Fictional billionaire Patrons who pay to put their name on a booth.
const SPONSORS = ['Chester Vandermoolah', 'Bitsy Goldwater-Prym', 'Lord Reginald Upsworth', 'Tamsin Yachtley', 'Duncan Moneybags III', 'Ophelia Trustfund', 'Baron Lars Offshore', 'Mimi Hedgefund'];
function boothSponsor(at) { let h = 0; for (const ch of G.seed + at) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return SPONSORS[h % SPONSORS.length]; }
function sponsorPool() {
  if (G.lvl >= 6) return 'a Gold Box (sometimes), a Silver Box, or supplies';
  if (G.lvl >= 3) return 'a Silver Box (sometimes), a Rusty Box, or supplies';
  return 'a Rusty Box, potions or a bomb. Better gifts start at level 3';
}
function rollSponsorGift() {
  if (G.lvl >= 6 && R.chance(0.25)) return 'box_gold';
  if (G.lvl >= 3 && R.chance(0.35)) return 'box_silver';
  return R.pick(['box_rusty', 'box_rusty', 'potion_heal', 'potion_radar', 'potion_mana', 'bomb']);
}
function boothLine(t) { talk.lines.push(`<b class="who-bk">BOOKIE:</b> ${esc(t)}`); }
function boothMenu(at, fresh) {
  moveHeld = null;
  if (fresh || !talk) {
    save();
    talk = { kind: 'booth', at, lines: [], opts: [] };
    boothLine(R.pick(['You found a camera booth! Game saved. Now, what can BOOKIE do for its favorite asset?', 'Booth time! Saved your progress. Ask me anything. Some answers are even true.', 'Saved! Lean in close, the Patrons like a confessional.']));
  }
  G.boothGifts = G.boothGifts || [];
  const giftKey = G.floor + ':' + at;
  const gifted = G.boothGifts.includes(giftKey);
  const sponsor = boothSponsor(at);
  talk.extra = `<div class="sponsor">
    <div class="row-between"><b>SPONSOR GIFT</b><span class="${gifted ? 'muted' : 'ready'}">${gifted ? 'Claimed' : '1 gift ready'}</span></div>
    <p>This booth is sponsored by <b>${esc(sponsor)}</b>, one of the Patrons: the ultra rich who watch the show and bet on crawlers. Sponsors pay to put their name on booths, and each booth gives every crawler one free gift.</p>
    <p class="muted">At level ${G.lvl} you can get ${esc(sponsorPool())}.</p>
    ${gifted ? '' : '<button class="btn green" data-act="sponsor">CLAIM YOUR GIFT</button>'}
  </div>`;
  talk.opts = [
    { label: 'Find a boss', sub: 'Marks the nearest boss on your map.', color: 'red', fn: () => { pointToBoss(boothLine); boothMenu(at); } },
    { label: 'Find loot', sub: 'Marks the 3 closest chests.', color: 'gold', fn: () => { pointToLoot(boothLine); boothMenu(at); } },
    { label: 'What should I do next?', sub: 'Tips based on your bag and gear.', color: 'purple', fn: () => {
      const tips = adviceLines();
      if (!tips.length) boothLine('Go punch something on camera. That is always the answer.');
      for (const t of tips.slice(0, 3)) boothLine(t);
      boothMenu(at);
    } },
    { label: 'How are my odds?', sub: `Now ${oddsText()}. Learn what moves them.`, fn: () => {
      boothLine(`You are at ${oddsText()}. ${G.odds > 15 ? 'Long shot. Win flashy fights to bring that down.' : G.odds > 6 ? 'Respectable. The Patrons are paying attention.' : 'A favorite! Do not let it go to your head.'}`);
      boothLine('Hype fills when you win big, win fast or nearly die. Fill the hype bar and a Patron sends you a Patron\'s Pick box.');
      boothMenu(at);
    } },
  ];
  renderTalk();
}
overlayHandlers.sponsor = () => {
  if (!talk || talk.kind !== 'booth') return;
  const key2 = G.floor + ':' + talk.at;
  G.boothGifts = G.boothGifts || [];
  if (G.boothGifts.includes(key2)) return;
  G.boothGifts.push(key2);
  const gift = rollSponsorGift();
  addItem(gift, 1, true);
  boothLine(`${boothSponsor(talk.at)} sends you a ${ITEMS[gift].name}! ${R.pick(['Smile for the logo.', 'Say thank you to the nice rich person.', 'They expect a good show in return.'])}`);
  save();
  boothMenu(talk.at);
};

// ---------- Gear: six slots, stat compare, equip best ----------
function equippedCount(id) { return GEAR_SLOTS.filter((sl) => G.equip[sl] === id).length; }
function isEquipped(id) { return equippedCount(id) > 0; }
function spareCopies(id) { return count(id) - equippedCount(id); }
// The slot a new item would go in: for rings, an empty ring slot or the weaker ring.
function compareSlot(id) {
  const t = ITEMS[id].type;
  if (t !== 'ring') return t;
  if (!G.equip.ring1) return 'ring1';
  if (!G.equip.ring2) return 'ring2';
  return gearScore(G.equip.ring1) <= gearScore(G.equip.ring2) ? 'ring1' : 'ring2';
}
function gearStats(id) {
  const it = id && ITEMS[id];
  const o = {};
  if (it) for (const k in STAT_NAMES) if (it[k]) o[k] = it[k] + upgBonus(id, k, upgLevel(id));
  return o;
}
// ----- Upgrade table: raise a piece of gear up to +5 -----
const UPG_MAX = 5;
const UPG_MAT = { weapon: 'j_wire', wrist: 'j_wire', ring: 'j_wire', head: 'j_token', armor: 'j_token', neck: 'j_token', shirt: 'j_feather', shoes: 'j_feather', legs: 'j_feather', back: 'j_feather' };
function upgLevel(id) { return (G && G.upg && G.upg[id]) || 0; }
function upgBonus(id, k, lvl) {
  const base = ITEMS[id][k] || 0;
  if (base <= 0 || !lvl) return 0;
  const step = k === 'maxHp' || k === 'maxMp' ? Math.max(2, Math.round(base * 0.25)) : Math.max(1, Math.round(base * 0.25));
  return step * lvl;
}
function upgCost(id) {
  const n = upgLevel(id) + 1;
  const need = { [UPG_MAT[ITEMS[id].type]]: n };
  if (n >= 3) need.j_jelly = n - 2;
  return { need, tokens: Math.round(((RARITY_PRICE[ITEMS[id].rarity] || 6) / 3) * n) };
}
function canUpgrade(id) {
  if (upgLevel(id) >= UPG_MAX) return false;
  const c = upgCost(id);
  return G.tokens >= c.tokens && Object.entries(c.need).every(([m, n]) => count(m) >= n);
}
function itemName(id) { const l = isGear(id) ? upgLevel(id) : 0; return ITEMS[id].name + (l ? ' +' + l : ''); }
function statText(id) {
  const parts = Object.entries(gearStats(id)).map(([k, v]) => (v > 0 ? '+' : '') + v + ' ' + STAT_NAMES[k]);
  if (ITEMS[id].hype) parts.push('earns hype');
  return parts.join(', ');
}
// The change to each stat if you swapped this in for what you wear now.
function gearDelta(id) {
  const a = gearStats(G.equip[compareSlot(id)]), b = gearStats(id);
  const d = {};
  for (const k in STAT_NAMES) { const v = (b[k] || 0) - (a[k] || 0); if (v) d[k] = v; }
  return d;
}
const STAT_WEIGHT = { cha: 0.5, atk: 2, def: 2, mag: 1.5, spd: 1, luck: 0.6, maxHp: 0.35, maxMp: 0.25, xpPct: 0.2 };
function gearScore(id) {
  if (!id) return 0;
  let t = 0;
  for (const [k, v] of Object.entries(gearStats(id))) t += v * STAT_WEIGHT[k] * (k === 'mag' && cls().magic ? 1.5 : 1);
  return t + (ITEMS[id].hype ? 1 : 0);
}
function ownedFor(slot) { const t = slotType(slot); return G.order.filter((x) => ITEMS[x].type === t && count(x) > 0); }
function isUpgrade(id) { return isGear(id) && spareCopies(id) > 0 && gearScore(id) > gearScore(G.equip[compareSlot(id)]); }
function upgradeCount() { return GEAR_TYPES.filter((t) => ownedFor(t).some(isUpgrade)).length; }
function deltaHtml(id) {
  if (isEquipped(id) && spareCopies(id) <= 0) return '<span class="delta same">Wearing it now</span>';
  const d = gearDelta(id);
  const ks = Object.keys(d);
  if (!ks.length) return '<span class="delta same">Same as now</span>';
  return ks.map((k) => `<span class="delta ${d[k] > 0 ? 'up' : 'down'}">${d[k] > 0 ? '▲+' : '▼'}${d[k]} ${STAT_NAMES[k]}</span>`).join(' ');
}
function gearDescHtml(id) { return `${esc(SLOT_NAMES[ITEMS[id].type])}: ${esc(statText(id))}<br>${deltaHtml(id)}`; }

function equipItem(id, slot) {
  const before = stats();
  G.equip[slot] = id;
  const s = stats();
  G.hp = Math.min(s.maxHp, G.hp + Math.max(0, s.maxHp - before.maxHp));
  G.mp = Math.min(s.maxMp, G.mp + Math.max(0, s.maxMp - before.maxMp));
  if (id) say(`Equipped <span class="loot">${esc(ITEMS[id].name)}</span>.`);
  updateHud();
}
function equipBest() {
  let n = 0;
  for (const sl of GEAR_SLOTS) {
    if (sl === 'ring1' || sl === 'ring2') continue;
    const best = ownedFor(sl).sort((a, b) => gearScore(b) - gearScore(a))[0];
    if (best && gearScore(best) > gearScore(G.equip[sl])) { equipItem(best, sl); n++; }
  }
  // Rings: wear the two best copies you own.
  const copies = ownedFor('ring').flatMap((id) => Array(count(id)).fill(id)).sort((a, b) => gearScore(b) - gearScore(a));
  const want = [copies[0] || null, copies[1] || null];
  const have = [G.equip.ring1, G.equip.ring2];
  if (gearScore(want[0]) + gearScore(want[1]) > gearScore(have[0]) + gearScore(have[1])) {
    G.equip.ring1 = null; G.equip.ring2 = null;
    if (want[0]) equipItem(want[0], 'ring1');
    if (want[1]) equipItem(want[1], 'ring2');
    n++;
  }
  return n;
}

let gearState = { slot: null, from: 'map' };
function openGear(from = 'map') {
  if (from === 'map' && !canAct()) return;
  moveHeld = null;
  gearState = { slot: null, from };
  renderGear();
}
function renderGear(extra = '') {
  if (gearState.slot) return renderGearPicker(extra);
  const s = stats();
  const ups = upgradeCount();
  const rows = GEAR_SLOTS.map((sl) => {
    const id = G.equip[sl];
    const up = ownedFor(sl).some(isUpgrade);
    const owned = ownedFor(sl).length;
    return `<button class="gear-slot" data-act="gslot" data-id="${sl}">
      <img src="${id ? icon(id) : slotIcon(sl)}" alt="">
      <span class="txt"><span class="sl">${SLOT_NAMES[sl].toUpperCase()}${up ? ' <span class="delta up">▲ UPGRADE</span>' : ''}</span>
      <span class="nm" style="color:${id ? RARITY[ITEMS[id].rarity].color : 'var(--muted)'}">${id ? esc(itemName(id)) : 'Empty'}</span>
      <span class="ds">${id ? esc(statText(id)) : owned ? owned + ' to choose from' : 'Find gear in loot boxes, the shop or the bench'}</span></span>
      <span class="chev">▶</span></button>`;
  }).join('');
  showOverlay(`
    <div class="row-between"><h2>GEAR</h2><span class="muted" style="font-size:14px">Tap a slot to change it</span></div>
    ${extra}
    <div class="preview"><img src="${heroSprite(race(), cls(), 'down', 0, G.sex).toDataURL()}" alt=""><div class="stat-list" style="flex:1">
      <span>HP <b>${s.maxHp}</b></span><span>MP <b>${s.maxMp}</b></span><span>ATK <b>${s.atk}</b></span><span>DEF <b>${s.def}</b></span>
      <span>MAG <b>${s.mag}</b></span><span>SPD <b>${s.spd}</b></span><span>LUCK <b>${s.luck}</b></span><span>CHA <b>${s.cha}</b></span>${s.xpPct ? `<span>BONUS XP <b>+${s.xpPct}%</b></span>` : ''}</div></div>
    <button class="btn" data-act="gsheet">FULL CHARACTER SHEET</button>
    ${ups ? `<button class="btn gold" data-act="gbest">EQUIP BEST GEAR (${ups} UPGRADE${ups > 1 ? 'S' : ''})</button>` : ''}
    <div class="stack">${rows}</div>
    <button class="btn grey" data-act="gclose" style="position:sticky; bottom:0">${gearState.from === 'bag' ? 'BACK TO BAG' : 'CLOSE'}</button>`);
}
function renderGearPicker(extra = '') {
  const sl = gearState.slot;
  const cur = G.equip[sl];
  const ids = ownedFor(sl).filter((id) => id === cur || spareCopies(id) > 0).sort((a, b) => gearScore(b) - gearScore(a));
  const rows = ids.map((id) => {
    const it = ITEMS[id];
    const eq = cur === id;
    return `<div class="item ${eq ? 'on' : ''}"><img src="${icon(id)}" alt="">
      <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(itemName(id))}${count(id) > 1 ? ' x' + count(id) : ''}</span>
      <span class="ds">${esc(statText(id))}. ${esc(it.desc)}<br>${deltaHtml(id)}</span></div>
      <button class="act ${eq ? 'grey' : 'green'}" data-act="${eq ? 'gunequip' : 'gequip'}" data-id="${id}">${eq ? 'Take off' : 'Equip'}</button></div>`;
  }).join('') || `<p class="muted">You have no ${SLOT_NAMES[sl].toLowerCase()} gear yet. Loot boxes, Penny's shop and the crafting bench all have some.</p>`;
  showOverlay(`
    <div class="row-between"><h2>${SLOT_NAMES[sl].toUpperCase()}</h2><span class="muted" style="font-size:14px">Best first</span></div>
    ${extra}
    <p class="muted" style="font-size:15px">Wearing: ${cur ? `<b style="color:${RARITY[ITEMS[cur].rarity].color}">${esc(ITEMS[cur].name)}</b> (${esc(statText(cur))})` : 'nothing'}. Green arrows are better than what you wear now, red are worse.</p>
    <div class="items">${rows}</div>
    <button class="btn grey" data-act="gback" style="position:sticky; bottom:0">BACK TO ALL SLOTS</button>`);
}
Object.assign(overlayHandlers, {
  gear: () => openGear('bag'),
  gslot: (_, b) => { gearState.slot = b.dataset.id; renderGear(); },
  gequip: (_, b) => { const id = b.dataset.id; equipItem(id, gearState.slot || compareSlot(id)); gearState.slot = null; renderGear(`<p class="note good">Equipped ${esc(ITEMS[id].name)}.</p>`); },
  gunequip: (_, b) => { equipItem(null, gearState.slot || ITEMS[b.dataset.id].type); renderGear(); },
  gbest: () => { const n = equipBest(); renderGear(`<p class="note good">Equipped ${n} upgrade${n > 1 ? 's' : ''}.</p>`); },
  gback: () => { gearState.slot = null; renderGear(); },
  gclose: () => { if (gearState.from === 'bag') renderBag(); else if (gearState.from === 'shop') renderShop(); else if (gearState.from === 'bench') renderBench(); else { hideOverlay(); renderControls(); } },
  // "Equip it now" shortcut after buying or crafting something better.
  gquick: (_, b) => { const id = b.dataset.id; equipItem(id, compareSlot(id)); const back = b.dataset.back; (back === 'bench' ? renderBench : renderShop)(`<p class="note good">Equipped ${esc(ITEMS[id].name)}.</p>`); },
});
function equipNowHtml(id, back) {
  if (!isUpgrade(id)) return '';
  return `<div class="item"><img src="${icon(id)}" alt=""><div class="txt"><span class="nm" style="color:${RARITY[ITEMS[id].rarity].color}">${esc(ITEMS[id].name)} is an upgrade!</span><span class="ds">${deltaHtml(id)}</span></div>
    <button class="act green" data-act="gquick" data-back="${back}" data-id="${id}">Equip</button></div>`;
}

// ---------- Penny's shop: stock gets better as you level up ----------
// Junk: gear worse than what you wear in that slot that no recipe needs. Never materials.
const RECIPE_INPUTS = new Set(RECIPES.flatMap((r) => Object.keys(r.need)));
// A scroll that's no use to you: already learned, or a school your class can't learn.
function knownScroll(id) { return ITEMS[id].type === 'scroll' && (G.moves.includes(ITEMS[id].teaches) || !canLearn(id)); }
function isJunk(id) {
  if (knownScroll(id)) return true;
  if (!isGear(id) || spareCopies(id) <= 0) return false;
  // Weaker than what you wear in that slot, or a spare copy of something you already wear (rings allow two).
  if (gearScore(id) < gearScore(G.equip[compareSlot(id)])) return true;
  return isEquipped(id) && (ITEMS[id].type !== 'ring' || equippedCount(id) >= 2);
}
function junkCount(id) { return isGear(id) ? spareCopies(id) : count(id); }
function junkList() { return G.order.filter((id) => count(id) > 0 && isJunk(id)); }
// Would buying this make you stronger? Better than any gear you own for that slot, or a move you lack.
function worthBuying(id) {
  const it = ITEMS[id];
  if (it.type === 'scroll') return !knownScroll(id) && !count(id);
  if (!isGear(id)) return false;
  const spare = ownedFor(it.type).filter((x) => spareCopies(x) > 0).map(gearScore);
  return gearScore(id) > Math.max(gearScore(G.equip[compareSlot(id)]), ...spare);
}
// Something in your bag you can use to get stronger right now.
// The best piece you own for a slot, if it beats what you wear. Only that one is flagged.
function bestUpgrade(id) { return isUpgrade(id) && gearScore(id) >= Math.max(...ownedFor(ITEMS[id].type).filter((x) => spareCopies(x) > 0).map(gearScore)); }
function actionable(id) {
  const it = ITEMS[id];
  if (bestUpgrade(id)) return true;
  if (it.type === 'scroll' && !knownScroll(id)) return true;
  if (it.type === 'box' && inSafe()) return true;
  return false;
}
function badgeHtml(id) {
  if (bestUpgrade(id)) return ' <span class="badge up">UPGRADE</span>';
  if (ITEMS[id].type === 'scroll' && !knownScroll(id)) return ' <span class="badge new">NEW MOVE</span>';
  if (isJunk(id)) return ' <span class="junk-tag">JUNK</span>';
  return '';
}
function shopTier() { let t = 0; SHOP_TIERS.forEach((x, i) => { if (G.lvl >= x.lvl) t = i; }); return t; }
function priceOf(id) {
  const it = ITEMS[id];
  let p = it.price || RARITY_PRICE[it.rarity] || 6;
  if (isGear(id) || it.type === 'scroll') p = Math.round(p * 1.25);
  if (cls().haggle) p = Math.max(1, Math.round(p * 0.8));
  if (chaBonus()) p = Math.max(1, Math.round(p * (1 - Math.max(-0.1, Math.min(0.25, chaBonus() * 0.02)))));
  if (hasPerk('haggler')) p = Math.max(1, Math.round(p * 0.85));
  return p;
}
function sellPrice(id) {
  const it = ITEMS[id];
  const v = it.value || Math.max(1, Math.floor((it.price || RARITY_PRICE[it.rarity] || 6) / 2));
  return hasPerk('salesman') ? Math.ceil(v * 1.5) : v;
}
function stockKey() { return G.floor + ':' + G.lvl; }
function shopStock() {
  const t = shopTier();
  const rng = makeRng(((G.seed ^ (G.floor * 7919) ^ (G.lvl * 104729)) >>> 0) || 1);
  const basics = [], scrolls = [];
  for (let i = 0; i <= t; i++) { basics.push(...SHOP_TIERS[i].basics); scrolls.push(...SHOP_TIERS[i].scrolls.filter((sc) => !knownScroll(sc))); }
  // Every level shifts the odds toward rarer gear and adds more specials.
  const L = G.lvl;
  const weights = { rusty: Math.max(1, 10 - 2 * L), silver: L >= 2 ? Math.min(10, 2 * L) : 0, gold: L >= 4 ? (L - 3) * 2 : 0, patron: L >= 7 ? (L - 6) * 2 : 0 };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const pool = Object.keys(ITEMS).filter((id) => isGear(id) && weights[ITEMS[id].rarity]);
  let specials = [];
  for (let tries = 0; specials.length < Math.min(9, 4 + Math.floor(L / 2)) && tries < 80; tries++) {
    let roll = rng.next() * total, rar = 'rusty';
    for (const [r, w] of Object.entries(weights)) { roll -= w; if (roll <= 0) { rar = r; break; } }
    const pick = rng.pick(pool.filter((id) => ITEMS[id].rarity === rar && !specials.includes(id)));
    if (pick) specials.push(pick);
  }
  specials = specials.concat(rng.shuffle(scrolls).slice(0, 2));
  return { basics, specials };
}
function pennyLine() {
  if (!G.pennyMet) { G.pennyMet = true; return 'Name\'s Penny Ante. I sold phone cases at the mall until the mall fell into a hole. I buy junk, I sell less junk.'; }
  const last = G.doc.memory[G.doc.memory.length - 1];
  if (last === 'cruel' && R.chance(0.5)) return 'Word travels down here, killer. Cash up front.';
  if (last === 'generous' && R.chance(0.5)) return 'Heard you saved Jules. Sweet. Prices are still prices, though.';
  if (last === 'creepy' && R.chance(0.5)) return 'Please do not eat anything you have not paid for.';
  if (G.tokens < 10) return 'Window shopping? Bold.';
  return R.pick([
    'Level up and I unlock the good shelf. The Patrons ship me fancier stuff for fancier crawlers.',
    'Everything is final sale. Also everything might be final, period.',
    'Sell me your junk. I will sell it back to someone dumber. Not you. Probably.',
  ]);
}
let shopState = { tab: 'buy', line: '' };
function openShop() { shopState = { tab: 'buy', line: pennyLine() }; renderShop(); }
function shopRow(id, special, bought) {
  const it = ITEMS[id];
  const p = priceOf(id);
  const gone = special && bought.includes(id);
  const worth = !gone && worthBuying(id);
  return `<div class="item ${worth ? 'worth' : ''}"><img src="${icon(id)}" alt="">
    <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(it.name)}${worth ? (isGear(id) ? ' <span class="badge up">UPGRADE</span>' : ' <span class="badge new">NEW MOVE</span>') : ''}${count(id) ? ` <span class="have">have ${count(id)}</span>` : ''}</span>
    <span class="ds">${isGear(id) ? gearDescHtml(id) : esc(it.desc)}</span></div>
    <button class="act gold" data-act="buy" data-id="${id}" data-sp="${special ? 1 : 0}" ${gone || G.tokens < p ? 'disabled' : ''}>${gone ? 'Sold out' : p + ' tokens'}</button></div>`;
}
function renderShop(extra = '') {
  const t = shopTier();
  const next = SHOP_TIERS[t + 1];
  let body;
  if (shopState.tab === 'buy') {
    const st = shopStock();
    const bought = G.shopBought[stockKey()] || [];
    const worth = st.specials.filter((id) => !bought.includes(id) && worthBuying(id)).sort((a, b) => gearScore(b) - gearScore(a));
    const rest = st.specials.filter((id) => !worth.includes(id));
    body = `${worth.length ? `<h3 class="sub">WORTH BUYING: STRONGER THAN WHAT YOU HAVE</h3><div class="items">${worth.map((id) => shopRow(id, true, bought)).join('')}</div>` : '<p class="muted" style="font-size:14px">Nothing here beats the gear and moves you already have.</p>'}
      <h3 class="sub">SUPPLIES</h3><div class="items">${st.basics.map((id) => shopRow(id, false, bought)).join('')}</div>
      ${rest.length ? `<h3 class="sub">OTHER SPECIALS: ONE OF EACH</h3><div class="items">${rest.map((id) => shopRow(id, true, bought)).join('')}</div>` : ''}`;
  } else {
    const ids = G.order.filter((id) => spareCopies(id) > 0).sort((a, b) => isJunk(b) - isJunk(a));
    const junk = junkList();
    const jv = junk.reduce((a, id) => a + junkCount(id) * sellPrice(id), 0);
    body = `${junk.length ? `<button class="btn gold" data-act="selljunk">SELL ALL JUNK: ${junk.reduce((a, id) => a + junkCount(id), 0)} ITEMS FOR ${jv} TOKENS</button>` : ''}
      <p class="muted" style="font-size:14px">Junk is any gear weaker than what you wear in that slot, spare copies of gear you already wear, and scrolls for moves you know. Crafting materials are never sold as junk.</p>
      <p class="muted" style="font-size:14px">Gear you are wearing is not listed. Junk is also used for crafting at the bench.</p>
      <div class="items">${ids.map((id) => {
        const it = ITEMS[id];
        return `<div class="item"><img src="${icon(id)}" alt="">
          <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(it.name)} x${count(id)}${junk.includes(id) ? ' <span class="junk-tag">JUNK</span>' : ''}</span><span class="ds">${isGear(id) ? esc(SLOT_NAMES[it.type] + ': ' + statText(id)) : esc(it.desc)}</span></div>
          <button class="act" data-act="sell" data-id="${id}">Sell ${sellPrice(id)}</button></div>`;
      }).join('') || '<p class="muted">Nothing to sell.</p>'}</div>`;
  }
  showOverlay(`
    <div class="row-between"><h2>PENNY'S PAWN</h2><span class="tok">${G.tokens} tokens</span></div>
    <div class="bookie"><img src="${sprite('shop').toDataURL()}" alt=""><p><b style="color:var(--gold)">PENNY:</b> ${esc(shopState.line)}</p></div>
    ${extra}
    <p class="muted" style="font-size:15px">Penny restocks every time you level up or reach a new floor, and her gear gets rarer with each level you gain. ${next ? `New supplies and scrolls unlock at level ${next.lvl}.` : 'Every shelf is open.'}</p>
    <div class="tabs"><button class="tab ${shopState.tab === 'buy' ? 'on' : ''}" data-act="shoptab" data-id="buy">Buy</button><button class="tab ${shopState.tab === 'sell' ? 'on' : ''}" data-act="shoptab" data-id="sell">Sell</button><button class="tab" data-act="shopgear">My gear</button></div>
    ${body}
    <button class="btn grey" data-act="shopclose" style="position:sticky; bottom:0">LEAVE SHOP</button>`);
}
Object.assign(overlayHandlers, {
  shoptab: (_, b) => { shopState.tab = b.dataset.id; renderShop(); },
  shopgear: () => { gearState = { slot: null, from: 'shop' }; renderGear(); },
  buy: (_, b) => {
    const id = b.dataset.id;
    const p = priceOf(id);
    if (G.tokens < p) return;
    G.tokens -= p;
    addItem(id);
    if (b.dataset.sp === '1') (G.shopBought[stockKey()] = G.shopBought[stockKey()] || []).push(id);
    updateHud();
    renderShop(equipNowHtml(id, 'shop') || `<p class="note good">Bought ${esc(ITEMS[id].name)}.</p>`);
  },
  sell: (_, b) => {
    const id = b.dataset.id;
    if (spareCopies(id) <= 0) return;
    G.tokens += sellPrice(id);
    removeItem(id);
    updateHud();
    renderShop(`<p class="note good">Sold ${esc(ITEMS[id].name)} for ${sellPrice(id)} tokens.</p>`);
  },
  selljunk: () => {
    let v = 0;
    for (const id of junkList()) { const n = junkCount(id); v += n * sellPrice(id); removeItem(id, n); }
    G.tokens += v;
    updateHud();
    renderShop(`<p class="note good">Sold all junk for ${v} tokens.</p>`);
  },
  shopclose: () => { save(); hideOverlay(); renderControls(); },
});

// ---------- Crafting bench: recipes unlock as you level up ----------
function recipeNeed(r) {
  const need = { ...r.need };
  if (hasPerk('tinkerer')) {
    const junkKeys = Object.keys(need).filter((k) => ITEMS[k].type === 'junk').sort((a, b) => need[b] - need[a]);
    const total = Object.values(need).reduce((a, b) => a + b, 0);
    if (junkKeys.length && total > 1) { need[junkKeys[0]]--; if (!need[junkKeys[0]]) delete need[junkKeys[0]]; }
  }
  return need;
}
function canCraft(r) {
  if (G.lvl < r.lvl || G.tokens < (r.tokens || 0)) return false;
  return Object.entries(recipeNeed(r)).every(([id, n]) => count(id) >= n);
}
// How many times you can make this recipe with what you have right now.
function maxCraft(r) {
  if (G.lvl < r.lvl) return 0;
  let n = r.tokens ? Math.floor(G.tokens / r.tokens) : Infinity;
  for (const [id, k] of Object.entries(recipeNeed(r))) n = Math.min(n, Math.floor(count(id) / k));
  return n === Infinity ? 0 : n;
}
function craftTimes(r, times) {
  for (let i = 0; i < times && canCraft(r); i++) {
    for (const [id, n] of Object.entries(recipeNeed(r))) removeItem(id, n);
    G.tokens -= r.tokens || 0;
    addItem(r.out, 1, true);
    if (!G.crafted) { G.crafted = 0; bookie('Arts and crafts on a death show. The Patrons find it adorable.'); }
    G.crafted++;
  }
}
let benchTab = 'craft';
function openBench() { moveHeld = null; renderBench(); }
function benchTabs() {
  return `<div class="tabs"><button class="tab ${benchTab === 'craft' ? 'on' : ''}" data-act="benchtab" data-id="craft">Crafting</button><button class="tab ${benchTab === 'upgrade' ? 'on' : ''}" data-act="benchtab" data-id="upgrade">Upgrade table</button></div>`;
}
function renderUpgrade(extra = '') {
  const ids = G.order.filter((id) => isGear(id) && count(id) > 0).sort((a, b) => (isEquipped(b) - isEquipped(a)) || gearScore(b) - gearScore(a));
  const rows = ids.map((id) => {
    const it = ITEMS[id];
    const lvl = upgLevel(id);
    const maxed = lvl >= UPG_MAX;
    let body;
    if (maxed) body = '<span class="need"><span class="ok">Fully upgraded</span></span>';
    else {
      const c = upgCost(id);
      const gains = Object.keys(STAT_NAMES).filter((k) => (it[k] || 0) > 0).map((k) => `<span class="delta up">▲+${upgBonus(id, k, lvl + 1) - upgBonus(id, k, lvl)} ${STAT_NAMES[k]}</span>`).join(' ');
      const need = Object.entries(c.need).map(([m, n]) => `<span class="${count(m) >= n ? 'ok' : 'no'}">${esc(ITEMS[m].name)} ${Math.min(count(m), n)}/${n}</span>`);
      need.push(`<span class="${G.tokens >= c.tokens ? 'ok' : 'no'}">${c.tokens} tokens</span>`);
      body = `<span class="ds">Next: ${gains}</span><span class="need">Needs: ${need.join(', ')}</span>`;
    }
    return `<div class="item ${isEquipped(id) ? 'on' : ''}"><img src="${icon(id)}" alt="">
      <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(itemName(id))}${isEquipped(id) ? ' <span class="equipped">EQUIPPED</span>' : ''}</span>
      <span class="ds">${esc(SLOT_NAMES[it.type])}: ${esc(statText(id))} · <span class="pips">${'■'.repeat(lvl)}${'□'.repeat(UPG_MAX - lvl)}</span></span>${body}</div>
      <button class="act gold" data-act="upgrade" data-id="${id}" ${canUpgrade(id) ? '' : 'disabled'}>${maxed ? 'MAX' : '+' + (lvl + 1)}</button></div>`;
  }).join('') || '<p class="muted">You have no gear to upgrade yet.</p>';
  showOverlay(`
    <div class="row-between"><h2>WORKBENCH</h2><span class="tok">${G.tokens} tokens</span></div>
    ${benchTabs()}
    ${extra}
    <p class="muted" style="font-size:15px">Make your gear stronger, up to +${UPG_MAX}. Each upgrade raises every stat on the item. Upgrades use crafting materials and tokens, and apply to every copy of that item you own.</p>
    <div class="items">${rows}</div>
    <button class="btn grey" data-act="benchclose" style="position:sticky; bottom:0">LEAVE BENCH</button>`);
}
function renderBench(extra = '') {
  if (benchTab === 'upgrade') return renderUpgrade(extra);
  const order = RECIPES.slice().sort((a, b) => (canCraft(b) - canCraft(a)) || ((G.lvl >= b.lvl) - (G.lvl >= a.lvl)) || a.lvl - b.lvl);
  const rows = order.map((r) => {
    const it = ITEMS[r.out];
    const locked = G.lvl < r.lvl;
    const need = Object.entries(recipeNeed(r)).map(([id, n]) => `<span class="${count(id) >= n ? 'ok' : 'no'}">${esc(ITEMS[id].name)} ${Math.min(count(id), n)}/${n}</span>`);
    if (r.tokens) need.push(`<span class="${G.tokens >= r.tokens ? 'ok' : 'no'}">${r.tokens} tokens</span>`);
    return `<div class="item ${locked ? 'locked' : ''}"><img src="${icon(r.out)}" alt="">
      <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(it.name)}</span>
      <span class="ds">${isGear(r.out) ? gearDescHtml(r.out) : esc(it.desc)}</span>
      <span class="need">${locked ? `Unlocks at level ${r.lvl}` : 'Needs: ' + need.join(', ')}</span></div>
      <div class="craft-btns"><button class="act purple" data-act="craft" data-id="${RECIPES.indexOf(r)}" ${canCraft(r) ? '' : 'disabled'}>${locked ? 'Lv ' + r.lvl : 'Craft'}</button>
      ${maxCraft(r) > 1 ? `<button class="act gold" data-act="craftmax" data-id="${RECIPES.indexOf(r)}">Max x${maxCraft(r)}</button>` : ''}</div></div>`;
  }).join('');
  const ready = RECIPES.filter(canCraft).length;
  showOverlay(`
    <div class="row-between"><h2>WORKBENCH</h2><span class="muted" style="font-size:14px">${ready} ready to make</span></div>
    ${benchTabs()}
    ${extra}
    <p class="muted" style="font-size:15px">Mobs drop crafting materials. Bash them together into gear, potions and bombs. New recipes unlock as you level up.${hasPerk('tinkerer') ? ' Tinkerer: every recipe needs one less material.' : ''}</p>
    <div class="items">${rows}</div>
    <button class="btn grey" data-act="benchclose" style="position:sticky; bottom:0">LEAVE BENCH</button>`);
}
Object.assign(overlayHandlers, {
  craft: (_, b) => {
    const r = RECIPES[Number(b.dataset.id)];
    if (!r || !canCraft(r)) return;
    craftTimes(r, 1);
    say(`Made <span class="loot">${esc(ITEMS[r.out].name)}</span>`);
    updateHud();
    renderBench(`<div class="reveal">${equipNowHtml(r.out, 'bench') || `<p class="note good">You made ${esc(ITEMS[r.out].name)}!</p>`}</div>`);
  },
  benchtab: (_, b) => { benchTab = b.dataset.id; renderBench(); },
  upgrade: (_, b) => {
    const id = b.dataset.id;
    if (!canUpgrade(id)) return;
    const c = upgCost(id);
    for (const [m, n] of Object.entries(c.need)) removeItem(m, n);
    G.tokens -= c.tokens;
    const before = stats();
    G.upg = G.upg || {};
    G.upg[id] = upgLevel(id) + 1;
    const s2 = stats();
    G.hp = Math.min(s2.maxHp, G.hp + Math.max(0, s2.maxHp - before.maxHp));
    G.mp = Math.min(s2.maxMp, G.mp + Math.max(0, s2.maxMp - before.maxMp));
    say(`Upgraded <span class="loot">${esc(itemName(id))}</span>!`);
    if (G.upg[id] === UPG_MAX) bookie('Maxed out! The Patrons respect a crawler who does their homework.');
    updateHud();
    renderBench(`<div class="reveal"><p class="note good">${esc(itemName(id))}: ${esc(statText(id))}</p></div>`);
  },
  craftmax: (_, b) => {
    const r = RECIPES[Number(b.dataset.id)];
    const n = r ? maxCraft(r) : 0;
    if (!n) return;
    craftTimes(r, n);
    say(`Made <span class="loot">${esc(ITEMS[r.out].name)} x${n}</span>`);
    updateHud();
    renderBench(`<div class="reveal">${equipNowHtml(r.out, 'bench') || `<p class="note good">You made ${n} ${esc(ITEMS[r.out].name)}!</p>`}</div>`);
  },
  benchclose: () => { save(); hideOverlay(); renderControls(); },
});

// ---------- Map ----------
const TUT_LINES = {
  start: 'Welcome to practice! Use the arrows to walk. The little map in the corner only shows places you have found. Brown boxes on it are safe rooms.',
  chest: 'See that chest? Walk into it to grab the loot box inside.',
  gotbox: 'Loot boxes can only be opened in a safe room. Keep heading right.',
  mob: 'That Training Rat is a mob. Walk into it to fight. Mobs throw things at you, so watch the screen.',
  battle: 'Your buttons say exactly what you will do. Tap SWING or PUNCH to attack. Hurt mobs may beg: sparing or finishing them changes how people treat you.',
  safe: 'A safe room! Mobs cannot come in and your game saves here. Open your Bag: tap Open all for your boxes, then Learn the scroll. Tap Gear to wear what you find. The striped cart is Penny\'s shop, and the bench is for crafting.',
  stairs: 'Real floors are huge and have two bosses. Beat both to unlock the stairs. This exit is free. Walk onto it when you are ready!',
};
function tut(step) {
  if (!FL || !FL.tutorial || G.tutSeen[step]) return;
  G.tutSeen[step] = true;
  bookie(TUT_LINES[step]);
}

function enterMap(fresh) {
  mode = 'map';
  B = null; prompt = null;
  hideOverlay();
  $('hud').hidden = false;
  heroDraw = { x: G.pos.x * 16, y: G.pos.y * 16 };
  walk = null; keysDown = []; moveHeld = null;
  clearLog();
  reveal();
  if (FL.tutorial) {
    tut('start');
  } else if (fresh) {
    bookie(R.pick(BOOKIE.welcome));
    say(`<b>Floor rule: ${esc(FL.rule.name).toUpperCase()}.</b> ${esc(FL.rule.text)}`);
    say('This floor is huge. Find and beat both bosses to unlock the stairs. Brown squares on your map are safe rooms.');
  } else {
    bookie('Welcome back, ' + G.name + '. The cameras never stopped rolling.');
  }
  updateHud();
  renderControls();
}

function renderControls() {
  if (prompt) {
    controls.innerHTML = `<div class="stack opts">${prompt.choices.map((c, i) => `<button class="btn ${c.color || ''} text" data-p="${i}" ${c.disabled ? 'disabled' : ''}>${esc(c.label)}</button>`).join('')}</div>`;
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
          <div class="small-row"><button class="chip" data-k="bag">Bag</button><button class="chip" data-k="gear">Gear</button><button class="chip" data-k="map">Map</button><button class="chip" data-k="menu">Pause</button></div>
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
    if (k.dataset.k === 'gear') openGear('map');
    if (k.dataset.k === 'menu') openMenu();
    if (k.dataset.k === 'map') openFullMap();
    if (k.dataset.k === 'a') interactAdjacent();
  }
  const bb = e.target.closest('[data-b]');
  if (bb && mode === 'battle' && !bb.disabled) battleInput(bb.dataset.b, bb.dataset.arg);
});

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
controls.addEventListener('pointerdown', (e) => {
  const d = e.target.closest('[data-dir]');
  if (!d) return;
  e.preventDefault();
  controls.querySelectorAll('.held').forEach((x) => x.classList.remove('held'));
  d.classList.add('held');
  moveHeld = d.dataset.dir;
  try { d.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
});
// Sliding your thumb onto another arrow changes direction without lifting it.
controls.addEventListener('pointerover', (e) => {
  if (!moveHeld || !(e.buttons & 1) && e.pointerType === 'mouse') return;
  const d = e.target.closest('[data-dir]');
  if (!d || d.dataset.dir === moveHeld) return;
  controls.querySelectorAll('.held').forEach((x) => x.classList.remove('held'));
  d.classList.add('held');
  moveHeld = d.dataset.dir;
});
const release = () => { moveHeld = null; controls.querySelectorAll('.held').forEach((x) => x.classList.remove('held')); };
window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);

const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (KEYS[e.key] && mode === 'map') {
    e.preventDefault();
    if (e.repeat) return;
    keysDown = keysDown.filter((k) => k !== KEYS[e.key]).concat(KEYS[e.key]);
    moveHeld = KEYS[e.key];
  }
  if ((e.key === ' ' || e.key === 'Enter') && canAct()) { interactAdjacent(); e.preventDefault(); }
  if (e.key === 'b' && canAct()) openBag();
  if (e.key === 'm' && canAct()) openFullMap();
  if (e.key === 'Escape' && mode === 'map') { if (!overlay.hidden) { hideOverlay(); renderControls(); } else if (canAct()) openMenu(); }
});
window.addEventListener('keyup', (e) => {
  if (!KEYS[e.key]) return;
  keysDown = keysDown.filter((k) => k !== KEYS[e.key]);
  moveHeld = keysDown[keysDown.length - 1] || null;
});
window.addEventListener('blur', () => { keysDown = []; moveHeld = null; });
// Leaving the app pauses the game.
document.addEventListener('visibilitychange', () => { if (document.hidden && canAct()) openMenu(); });

function canAct() { return mode === 'map' && overlay.hidden && !prompt; }

// ----- Discovery (fog of war) -----
function markRect(x0, y0, w, h) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < FL.w && y < FL.h) SEEN[y * FL.w + x] = 1;
}
function reveal() {
  const { x, y } = G.pos;
  const r = roomAt(FL, x, y);
  if (r) markRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
  markRect(x - 2, y - 2, 5, 5);
}
function seen(x, y) { return x >= 0 && y >= 0 && x < FL.w && y < FL.h && SEEN[y * FL.w + x] === 1; }
function encodeSeen(a) {
  // Run-length: counts of alternating 0s and 1s, base 36.
  const out = [];
  let cur = 0, n = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === cur) n++;
    else { out.push(n.toString(36)); cur = a[i]; n = 1; }
  }
  out.push(n.toString(36));
  return out.join(',');
}
function decodeSeen(str, size) {
  const a = new Uint8Array(size);
  if (!str) return a;
  let i = 0, cur = 0;
  for (const part of str.split(',')) {
    const n = parseInt(part, 36) || 0;
    if (cur) a.fill(1, i, Math.min(size, i + n));
    i += n; cur ^= 1;
  }
  return a;
}

// ----- Objects on the map -----
function indexObjects() {
  objIndex = new Map();
  if (FL.doc.x >= 0) objIndex.set(key(FL.doc), 'doc');
  for (const b of FL.booths) objIndex.set(key(b), 'booth');
  for (const b of FL.benches) objIndex.set(key(b), 'bench');
  for (const b of FL.shops || []) objIndex.set(key(b), 'shop');
  for (const b of FL.bosses) if (!G.bossesDead.includes(b.id)) objIndex.set(key(b), b);
  for (const c of FL.chests) if (!G.opened.includes(c.id)) objIndex.set(key(c), c);
}
let lastObjAt = '';
function objectAt(x, y) { const o = objIndex.get(x + ',' + y) || null; if (o) lastObjAt = x + ',' + y; return o; }
function mobAt(x, y) { return mobsLive.find((m) => m.x === x && m.y === y); }
function inSafe() { return tileAt(FL, G.pos.x, G.pos.y) === T.SAFE; }

function tryStep(dir) {
  const [dx, dy] = DIRS[dir];
  face = dir;
  const nx = G.pos.x + dx, ny = G.pos.y + dy;
  if (!walkable(FL, nx, ny)) return;
  const obj = objectAt(nx, ny);
  if (obj) return interact(obj);
  const mob = mobAt(nx, ny);
  if (mob) return startBattle(mob);
  const wasSafe = inSafe();
  walk = { fx: G.pos.x * 16, fy: G.pos.y * 16, tx: nx * 16, ty: ny * 16, t0: performance.now(), dur: stepDur() };
  G.pos = { x: nx, y: ny };
  G.steps++;
  reveal();
  if (G.race === 'troll' && G.steps % 4 === 0) G.hp = Math.min(stats().maxHp, G.hp + 1);
  const t = tileAt(FL, nx, ny);
  if (t === T.SAFE && !wasSafe) {
    save();
    if (FL.tutorial) tut('safe');
    else bookie(G.doc.met || !(FL.doc.x >= 0 && roomAt(FL, nx, ny) === FL.safeRoom) ? 'Safe room. Mobs can\'t come in here. Game saved.' : 'A safe room! Mobs can\'t come in. Your game just saved. Go say hi to the medic.');
  }
  if (FL.tutorial) {
    const c = FL.chests[0];
    if (!G.opened.includes(c.id) && Math.abs(c.x - nx) + Math.abs(c.y - ny) <= 4) tut('chest');
    const m = mobsLive[0];
    if (m && Math.abs(m.x - nx) + Math.abs(m.y - ny) <= 4) tut('mob');
    if (nx >= 22) tut('stairs');
  }
  if (t === T.STAIRS) return useStairs();
  moveMobs();
  updateHud();
}

function useStairs() {
  if (FL.tutorial) return finishTutorial();
  const left = FL.bosses.filter((b) => !G.bossesDead.includes(b.id)).length;
  if (left > 0) {
    bookie(left === 2 ? 'The stairs are locked. Two bosses on this floor still hold the keys. Go find them.' : 'Locked! One boss is still out there with the other key.');
    return;
  }
  G.cleared = true;
  save();
  showFloorClear();
}

function finishTutorial() {
  G.floor = 1;
  G.opened = []; G.killed = []; G.seen = ''; G.respawnT = 0;
  buildFloor();
  G.pos = { ...FL.start };
  save();
  bookie('Practice is over. Welcome to the real thing.');
  enterMap(true);
}

function moveMobs() {
  const hero = G.pos;
  for (const m of mobsLive) {
    const dx = hero.x - m.x, dy = hero.y - m.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist > 24 || m.still) continue;
    if (m.stun > 0) { m.stun--; continue; }
    const fast = m.members.some((x) => x.traits.includes('fast') || MOBS[x.type].spd >= 7);
    if (!fast && G.steps % 2) continue;
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

// New mob groups wander in every so often. Bosses never come back.
function respawnMobs() {
  const cap = FL.mobs.length;
  if (mobsLive.length >= cap) return;
  const hero = G.pos;
  const rooms = FL.rooms.filter((r) => {
    const d = Math.abs(r.cx - hero.x) + Math.abs(r.cy - hero.y);
    return d > 14 && d < 60 && !FL.safeRooms.includes(r);
  });
  let made = 0;
  for (let tries = 0; tries < 20 && made < 2 && rooms.length; tries++) {
    const r = R.pick(rooms);
    const p = { x: R.int(r.x, r.x + r.w - 1), y: R.int(r.y, r.y + r.h - 1) };
    if (tileAt(FL, p.x, p.y) !== T.FLOOR || objectAt(p.x, p.y) || mobAt(p.x, p.y)) continue;
    const depth = Math.min(1, (FL.dist ? FL.dist[r.cy * FL.w + r.cx] : 0) / FL.far);
    const grp = makeGroup(R, Object.keys(MOBS), Object.keys(TRAITS), Math.max(0, depth), R.chance(0.04));
    mobsLive.push({ id: 'r' + (G.spawnCount++), x: p.x, y: p.y, stun: 0, ...grp });
    made++;
  }
  if (made) bookie(R.pick(['Fresh mobs just wandered onto the floor. The Patrons demanded more content.', 'New mobs incoming! Somebody up top paid for a refill.']));
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
  if (obj === 'booth') return boothMenu(lastObjAt, true);
  if (obj === 'bench') return openBench();
  if (obj === 'shop') return openShop();
  if (obj.type && BOSSES[obj.type]) {
    const d = BOSSES[obj.type];
    return ask(`${d.name} blocks your way. ${d.intro}`, [
      { label: 'Fight ' + d.name, color: 'red', fn: () => startBossBattle(obj) },
      { label: 'Back away', color: 'grey' },
    ]);
  }
  if (obj.tier) return openChest(obj);
}

function openChest(ch) {
  G.opened.push(ch.id);
  objIndex.delete(key(ch));
  bookie(R.pick(BOOKIE.chest));
  const n = FL.rule.id === 'doubleloot' ? 2 : 1;
  addItem(ch.tier, n);
  if (G.race === 'elf') {
    const extra = rollLoot('box_rusty').items[0];
    if (extra) { say('Your sharp elf eyes spot something tucked behind it.'); addItem(extra[0], extra[1]); }
  }
  if (FL.tutorial) { addItem('scroll_iron'); addItem('potion_radar'); tut('gotbox'); }
  else say('Open loot boxes from your Bag in a safe room.');
  updateHud();
}

// ----- Full map -----
function openFullMap() {
  if (!canAct()) return;
  const N = FL.w, H = FL.h;
  const big = document.createElement('canvas');
  big.width = N; big.height = H;
  const g = big.getContext('2d');
  const img = g.createImageData(N, H);
  const px = (i, r, gg, b) => { img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255; };
  for (let i = 0; i < N * H; i++) {
    const t = FL.tiles[i];
    if (SEEN[i] && t !== T.WALL) { if (t === T.SAFE) px(i, 184, 105, 58); else if (t === T.STAIRS) px(i, 245, 197, 66); else px(i, 139, 132, 163); }
    else px(i, 15, 11, 26);
  }
  g.putImageData(img, 0, 0);
  // Safe rooms are always marked, even before you find them.
  g.fillStyle = '#b8693a';
  for (const r of FL.safeRooms) if (!seen(r.cx, r.cy)) g.fillRect(r.x, r.y, r.w, r.h);
  for (const b of FL.bosses) if (!G.bossesDead.includes(b.id) && seen(b.x, b.y)) { g.fillStyle = '#c8334a'; g.fillRect(b.x - 2, b.y - 2, 5, 5); }
  if (G.radar > 0) { g.fillStyle = '#ff5fa2'; for (const m of mobsLive) g.fillRect(m.x - 1, m.y - 1, 3, 3); }
  if (guidePath) {
    g.fillStyle = '#b8e05a';
    for (const i of guidePath) g.fillRect(i % FL.w, (i / FL.w) | 0, 1, 1);
    const gb = guideBoss();
    if (gb) { g.fillStyle = '#c8334a'; g.fillRect(gb.x - 2, gb.y - 2, 5, 5); }
  }
  g.fillStyle = '#4fd8e8'; g.fillRect(G.pos.x - 3, G.pos.y - 3, 7, 7);
  g.fillStyle = '#fff6e0'; g.fillRect(G.pos.x - 1, G.pos.y - 1, 3, 3);
  // A close-up around you.
  const Z = 60, zs = 4;
  const zc = document.createElement('canvas');
  zc.width = Z * 2 * zs; zc.height = Z * 2 * zs;
  const zg = zc.getContext('2d');
  zg.imageSmoothingEnabled = false;
  zg.drawImage(big, G.pos.x - Z, G.pos.y - Z, Z * 2, Z * 2, 0, 0, Z * 2 * zs, Z * 2 * zs);
  const found = FL.safeRooms.filter((r) => seen(r.cx, r.cy)).length;
  showOverlay(`
    <div class="row-between"><h2>MAP</h2><span class="muted" style="font-size:14px">${FL.tutorial ? 'Practice room' : FL.w + ' x ' + FL.h + ' tiles'}</span></div>
    <p class="muted" style="font-size:15px">Close-up around you</p>
    <img src="${zc.toDataURL()}" alt="Map close to you" style="width:100%; image-rendering:pixelated; border:3px solid var(--edge)">
    <p class="muted" style="font-size:15px">Whole floor</p>
    <img src="${big.toDataURL()}" alt="Whole floor map" style="width:100%; image-rendering:pixelated; border:3px solid var(--edge)">
    <p style="font-size:15px"><span style="color:#4fd8e8">■</span> You · <span style="color:#b8693a">■</span> Safe rooms (${found} of ${FL.safeRooms.length} visited) · <span style="color:#c8334a">■</span> Bosses you found · <span style="color:#f5c542">■</span> Stairs${G.radar > 0 ? ' · <span style="color:#ff5fa2">■</span> Mobs (radar)' : ''}${guidePath ? ' · <span style="color:#b8e05a">■</span> Way to the boss' : ''}</p>
    <button class="btn grey" data-act="closebag" style="position:sticky; bottom:0">CLOSE</button>`);
}

// ---------- Boss Compass ----------
// A walking path from you to the nearest living boss, found with a breadth-first search.
let guidePath = null, guideTarget = null, guideFrom = -1, guideT = 0;
function guideBoss() { return guideTarget && !G.bossesDead.includes(guideTarget.id) ? guideTarget : null; }
function findBossPath() {
  const W = FL.w, N = W * FL.h;
  const goal = new Map();
  for (const b of FL.bosses) if (!G.bossesDead.includes(b.id)) for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (walkable(FL, b.x + dx, b.y + dy)) goal.set((b.y + dy) * W + b.x + dx, b);
  if (!goal.size) return null;
  const prev = new Int32Array(N).fill(-1);
  const q = new Int32Array(N);
  const start = G.pos.y * W + G.pos.x;
  let h = 0, t = 0;
  q[t++] = start; prev[start] = start;
  while (h < t) {
    const c = q[h++];
    if (goal.has(c)) {
      const path = [];
      for (let p = c; p !== start; p = prev[p]) path.push(p);
      return { path, boss: goal.get(c) };
    }
    const x = c % W, y = (c / W) | 0;
    for (const n of [c - 1, c + 1, c - W, c + W]) {
      if (n < 0 || n >= N || prev[n] !== -1) continue;
      if ((n === c - 1 && x === 0) || (n === c + 1 && x === W - 1)) continue;
      if (FL.tiles[n] === T.WALL) continue;
      prev[n] = c; q[t++] = n;
    }
  }
  return null;
}
// Recomputes the trail when you move (at most twice a second).
function updateGuide(force = false) {
  if (!(G.guide > 0) || FL.tutorial) { guidePath = null; return; }
  const here = G.pos.y * FL.w + G.pos.x;
  guideT -= 1 / 60;
  if (!force && (here === guideFrom || guideT > 0)) return;
  guideT = 0.5; guideFrom = here;
  const r = findBossPath();
  guidePath = r ? r.path : null; guideTarget = r ? r.boss : null;
  if (!r) { G.guide = 0; say('No bosses left. Your Boss Compass fades.'); updateHud(); }
}

// ---------- Bag ----------
let bagState = { tab: 'all', sort: 'new' };
const TABS = [['all', 'All'], ['potion', 'Potions'], ['food', 'Food'], ['bomb', 'Bombs'], ['scroll', 'Scrolls'], ['gear', 'Gear'], ['box', 'Boxes'], ['junk', 'Materials']];

function openBag() {
  if (!canAct()) return;
  renderBag();
}
function sortedItems() {
  let ids = G.order.filter((id) => count(id) > 0);
  const t = bagState.tab;
  if (t !== 'all') ids = ids.filter((id) => (t === 'gear' ? isGear(id) : ITEMS[id].type === t));
  if (bagState.sort === 'new') ids = ids.slice().reverse();
  if (bagState.sort === 'rarity') ids = ids.slice().sort((a, b) => RARITY_ORDER.indexOf(ITEMS[a].rarity) - RARITY_ORDER.indexOf(ITEMS[b].rarity));
  if (bagState.sort === 'name') ids = ids.slice().sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
  // Things you can use to get stronger now go first, junk goes last, favorites stay on top.
  const rank = (id) => (G.favs[id] ? 0 : actionable(id) ? 1 : isJunk(id) ? 3 : 2);
  return ids.sort((a, b) => rank(a) - rank(b));
}
// Returns [label, enabled, note]
function itemAction(id) {
  const it = ITEMS[id];
  const safe = inSafe();
  if (it.type === 'box') return safe ? ['Open', true] : ['Open', false, 'Safe room only'];
  if (it.type === 'scroll') {
    if (G.moves.includes(it.teaches)) return [null, false, 'Already known. Sell it to Penny as junk.'];
    if (!canLearn(id)) return [null, false, `${cls().name}s can't learn ${SCHOOL_NAMES[MOVES[it.teaches].school]} spells. Sell it.`];
    return safe ? ['Learn', true] : ['Learn', false, 'Safe room only'];
  }
  if (it.type === 'potion' || it.type === 'food') { const w = potionWait(id); return w ? ['Use', false, w] : ['Use', true]; }
  if (isGear(id)) return [spareCopies(id) > 0 ? 'Equip' : 'Unequip', true];
  if (it.type === 'junk' && it.edible) return ['Eat', true];
  if (it.type === 'bomb') return [null, false, 'Throw it in a fight'];
  return [null, false];
}
function boxCount() { return G.order.filter((id) => ITEMS[id].type === 'box').reduce((a, id) => a + count(id), 0); }
function renderBag(extra = '') {
  const ids = sortedItems();
  const total = G.order.reduce((a, id) => a + count(id), 0);
  const rows = ids.map((id) => {
    const it = ITEMS[id];
    const [act, ok, note] = itemAction(id);
    const eq = isEquipped(id);
    const side = it.type === 'potion' && G.sideFx[id] !== undefined ? ' Side effect: ' + SIDE_EFFECTS[G.sideFx[id]].text : '';
    return `<div class="item"><img src="${icon(id)}" alt="">
      <div class="txt"><span class="nm" style="color:${RARITY[it.rarity].color}">${esc(itemName(id))} x${count(id)} ${eq ? '<span class="equipped">EQUIPPED</span>' : ''}${badgeHtml(id)}</span><span class="ds">${isGear(id) ? gearDescHtml(id) : esc(it.desc + side)}${note ? ` <b style="color:var(--pink)">${esc(note)}</b>` : ''}</span></div>
      <button class="star ${G.favs[id] ? 'on' : ''}" data-act="fav" data-id="${id}" aria-label="Favorite">★</button>
      ${act ? `<button class="act" data-act="use" data-id="${id}" ${ok ? '' : 'disabled'}>${act}</button>` : ''}</div>`;
  }).join('') || '<p class="muted">Nothing here yet.</p>';
  const boxes = boxCount();
  const openAll = boxes > 0
    ? (inSafe() ? `<button class="btn gold" data-act="openall">OPEN ALL BOXES (${boxes})</button>` : `<p class="muted" style="font-size:15px">You have ${boxes} loot box${boxes > 1 ? 'es' : ''}. Open them in a safe room.</p>`)
    : '';
  showOverlay(`
    <div class="row-between"><h2>BAG</h2><span class="muted" style="font-size:14px">${total} items · no limit</span></div>
    ${extra}${openAll}
    <button class="btn" data-act="gear">GEAR: EQUIP ITEMS${upgradeCount() ? ` (${upgradeCount()} UPGRADE${upgradeCount() > 1 ? 'S' : ''})` : ''}</button>
    <div class="tabs grid4">${TABS.map(([k, l]) => `<button class="tab ${bagState.tab === k ? 'on' : ''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>
    <div class="tabs"><span class="tabs-lbl">Sort</span>${[['new', 'Newest'], ['rarity', 'Rarity'], ['name', 'A to Z']].map(([k, l]) => `<button class="tab ${bagState.sort === k ? 'on' : ''}" data-act="sort" data-id="${k}">${l}</button>`).join('')}</div>
    <div class="items">${rows}</div>
    <button class="btn grey" data-act="closebag" style="position:sticky; bottom:0">CLOSE</button>`);
}
Object.assign(overlayHandlers, {
  tab: (_, b) => { bagState.tab = b.dataset.id; renderBag(); },
  sort: (_, b) => { bagState.sort = b.dataset.id; renderBag(); },
  fav: (_, b) => { const id = b.dataset.id; G.favs[id] = !G.favs[id]; renderBag(); },
  closebag: () => { hideOverlay(); renderControls(); },
  use: (_, b) => useItemFromBag(b.dataset.id),
  openall: () => openAllBoxes(),
});

function useItemFromBag(id) {
  const it = ITEMS[id];
  if (it.type === 'box') return openBox(id);
  if (it.type === 'scroll') return learnScroll(id);
  if (potionWait(id)) return renderBag();
  if (isGear(id)) {
    if (spareCopies(id) > 0) equipItem(id, compareSlot(id));
    else equipItem(null, GEAR_SLOTS.filter((sl) => G.equip[sl] === id).pop());
    return renderBag();
  }
  consume(id);
  updateHud();
  renderBag();
}

function learnScroll(id) {
  if (!inSafe()) return;
  const mv = ITEMS[id].teaches;
  if (G.moves.includes(mv) || !canLearn(id)) return renderBag();
  G.moves.push(mv);
  removeItem(id);
  say(`<span class="good">You learned ${esc(MOVES[mv].name)}!</span> ${esc(MOVES[mv].desc)}`);
  bookie(R.pick(['A new move! The Patrons love a training montage.', 'Studying in a safe room. Responsible. Boring. But responsible.']));
  save();
  renderBag(`<div class="bookie"><img src="${icon(id)}" alt=""><p><b style="color:var(--gold)">NEW MOVE: ${esc(MOVES[mv].name).toUpperCase()}</b><br>${esc(MOVES[mv].desc)} Costs ${MOVES[mv].mp} MP. Find it under Attack in battle.</p></div>`);
}

// Drinking or eating an item.
function consume(id) {
  const it = ITEMS[id];
  if (cooled(id)) { if (B) B.lastPotion = B.turn; else G.potionCd = POTION_CD; }
  const s = stats();
  removeItem(id);
  let heal = it.heal || 0;
  if (it.type === 'potion' && hasPerk('medic')) heal = Math.round(heal * 1.2);
  if (it.type === 'food' && hasPerk('chef')) heal *= 2;
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
  if (it.guide) {
    if (FL.tutorial || !FL.bosses.some((b) => !G.bossesDead.includes(b.id))) say('The potion fizzes. There are no bosses left to find here.');
    else {
      G.guide = (G.guide > 0 ? G.guide : 0) + it.guide;
      updateGuide(true);
      const b = guideBoss();
      say(`<span class="good">Boss Compass on!</span> A green trail on your map leads to ${b ? esc(BOSSES[b.type].name) + ', ' + whereIs(b) : 'the nearest boss'}. Lasts ${Math.round(G.guide)} seconds of play.`);
    }
  }
  if (it.radar) {
    G.radar = (G.radar > 0 ? G.radar : 0) + it.radar * (hasPerk('nerd') ? 2 : 1);
    say(`<span class="good">Mob Radar on!</span> Every mob shows on your map for ${Math.round(G.radar)} seconds. Pausing stops the clock.`);
  }
  if (heal) { G.hp = Math.min(s.maxHp, G.hp + heal); say(`<span class="good">+${heal} HP</span>`); if (B) popHero('+' + heal, '#6bbf59'); }
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
// Potion cooldown: 15 seconds of play on the map, or once every 2 turns in a fight.
// Mob Radar is not a drink for healing, so it has no cooldown.
const POTION_CD = 15;
function cooled(id) { return ITEMS[id].type === 'potion' && !ITEMS[id].radar && !ITEMS[id].guide; }
function potionWait(id) {
  if (!cooled(id)) return '';
  if (B) { const t = 2 - (B.turn - (B.lastPotion ?? -99)); return t > 0 ? `Ready in ${t} turn${t > 1 ? 's' : ''}` : ''; }
  return G.potionCd > 0 ? `Ready in ${Math.ceil(G.potionCd)}s` : '';
}
function setBuff(stat, n) {
  if (B) { B.buff[stat] = (B.buff[stat] || 0) + n; }
  else { G.buff = G.buff || {}; G.buff[stat] = (G.buff[stat] || 0) + n; }
}

function openOneBox(id) {
  removeItem(id);
  G.boxesOpened++;
  const loot = rollLoot(id);
  for (const [iid, n] of loot.items) addItem(iid, n, true);
  G.tokens += loot.tokens;
  if (G.boxesOpened >= 5) achieve('boxaddict');
  return loot;
}
function lootRows(items) {
  const merged = {};
  for (const [iid, n] of items) merged[iid] = (merged[iid] || 0) + n;
  return Object.entries(merged).map(([iid, n]) => `<div class="item"><img src="${icon(iid)}" alt=""><div class="txt"><span class="nm" style="color:${RARITY[ITEMS[iid].rarity].color}">${esc(ITEMS[iid].name)} x${n}</span><span class="ds">${esc(ITEMS[iid].desc)}</span></div></div>`).join('');
}
function openBox(id) {
  if (!inSafe()) return;
  const loot = openOneBox(id);
  say(`Opened a <span class="loot">${esc(ITEMS[id].name)}</span>.`);
  updateHud();
  save();
  renderBag(`<div class="reveal"><div class="box-big"><img src="${boxSprite(id).toDataURL()}" alt=""></div>
    <p class="banner gold">${esc(ITEMS[id].name).toUpperCase()}!</p>${lootRows(loot.items)}
    <div class="item"><div class="txt"><span class="nm" style="color:var(--gold)">${loot.tokens} tokens</span></div></div></div>`);
}
function openAllBoxes() {
  if (!inSafe()) return;
  const all = [];
  let tokens = 0, opened = 0;
  // Boxes can hold more boxes, so keep going until none are left.
  for (let guard = 0; guard < 200; guard++) {
    const id = G.order.find((x) => ITEMS[x].type === 'box' && count(x) > 0);
    if (!id) break;
    const loot = openOneBox(id);
    all.push(...loot.items.filter(([iid]) => ITEMS[iid].type !== 'box'));
    tokens += loot.tokens; opened++;
  }
  say(`Opened <span class="loot">${opened} loot boxes</span>!`);
  bookie(opened >= 5 ? 'Look at that haul. The Patrons are jealous, and they own islands.' : 'Unboxing on live TV. Classic content.');
  updateHud();
  save();
  renderBag(`<div class="reveal"><div class="box-big"><img src="${boxSprite('box_gold').toDataURL()}" alt=""></div>
    <p class="banner gold">${opened} BOXES OPENED!</p>${lootRows(all)}
    <div class="item"><div class="txt"><span class="nm" style="color:var(--gold)">${tokens} tokens</span></div></div></div>`);
}

// ---------- Pause menu ----------
function openMenu(force = false) {
  if (!force && !canAct()) return;
  moveHeld = null;
  const s = stats();
  const docWords = { friend: 'Doc trusts you a lot.', warm: 'Doc likes you.', neutral: 'Doc is not sure about you yet.', scared: 'Doc is scared of you.', hostile: 'Doc does not like you.' }[docMood()];
  const moves = [cls().skill.name + ' (class)', ...G.moves.map((m) => MOVES[m].name)].join(', ');
  const bossesLeft = FL.bosses.filter((b) => !G.bossesDead.includes(b.id)).length;
  showOverlay(`
    <p class="banner" style="color:var(--cyan)">PAUSED</p>
    <p class="muted" style="text-align:center">The game is stopped${G.radar > 0 ? `, including your Mob Radar (${Math.ceil(G.radar)}s left)` : ''}.</p>
    <h2>${esc(G.name).toUpperCase()}</h2>
    <p class="muted">${G.sex === 'f' ? 'Female' : 'Male'} ${esc(race().name)} ${esc(cls().name)}, former ${esc(job().name.toLowerCase())}. Level ${G.lvl} (${G.xp} / ${G.lvl * 20} XP)</p>
    <div class="stat-list">
      <span>HP <b>${Math.round(G.hp)} / ${s.maxHp}</b></span><span>MP <b>${Math.round(G.mp)} / ${s.maxMp}</b></span>
      <span>Attack <b>${s.atk}</b></span><span>Defense <b>${s.def}</b></span>
      <span>Magic <b>${s.mag}</b></span><span>Speed <b>${s.spd}</b></span>
      <span>Charisma <b>${s.cha}</b></span><span>Luck <b>${s.luck}</b></span>
      <span>Odds <b>${oddsText()}</b></span><span>Deaths <b>${G.deaths}</b></span>
      <span>Kills <b>${G.kills}</b></span><span>Spared <b>${G.spared}</b></span>
    </div>
    <button class="btn gold" data-act="sheet">CHARACTER SHEET (STR, INT, CHA...)</button>
    <p><b>Moves:</b> ${esc(moves)}</p>
    <p><b>Enhancements:</b> ${(G.perks || []).map((p) => `${esc(PERKS[p].name)} (${esc(PERKS[p].desc)})`).join(', ') || 'none'}</p>
    <p><b>${esc(race().name)}:</b> ${esc(race().desc)}</p>
    ${FL.tutorial ? '' : `<p><b>Bosses left:</b> ${bossesLeft} of ${FL.bosses.length}. <b>Floor rule:</b> ${esc(FL.rule.name)}. ${esc(FL.rule.text)}</p>`}
    <p>${G.doc.met ? esc(docWords) : FL.tutorial ? 'You will meet people on the real floors.' : 'You have not met anyone yet. Doc works in the safe room closest to the start.'}</p>
    <p class="muted">The game saves when you walk into a safe room or use a camera booth.</p>
    <button class="btn green" data-act="closebag">RESUME</button>
    ${FL.tutorial ? '<button class="btn" data-act="skiptut">SKIP THE TUTORIAL</button>' : ''}
    <button class="btn purple" data-act="suggest">SUGGESTIONS BOX</button>
    <button class="btn grey" data-act="quit">QUIT TO TITLE (LOSES PROGRESS SINCE LAST SAVE)</button>
    <span class="version" style="text-align:center">Build ${esc(VERSION)}</span>`);
}
// ---------- Character sheet ----------
const SHEET = [
  ['atk', 'Strength', 'ATK', 'Damage from punches, weapons and physical skills.'],
  ['def', 'Toughness', 'DEF', 'Takes damage off every hit you take.'],
  ['maxHp', 'Vitality', 'Max HP', 'How much damage you can take before you go down.'],
  ['mag', 'Intelligence', 'MAG', 'Power of spells, magic skills, poison and healing.'],
  ['maxMp', 'Focus', 'Max MP', 'Mana for class skills and spells.'],
  ['spd', 'Agility', 'SPD', 'Better odds of running away from fights.'],
  ['luck', 'Luck', 'LUCK', 'Critical hits, and talking mobs down.'],
  ['cha', 'Charisma', 'CHA', 'Cheaper shops, more hype from the crowd, mobs beg sooner, and people trust you faster.'],
  ['xpPct', 'Fast Learner', 'XP%', 'Bonus experience from every fight.'],
];
function statSources() {
  const z = () => Object.fromEntries(Object.keys(BASE_STATS).map((k) => [k, 0]));
  const src = { base: { ...BASE_STATS }, race: z(), class: z(), level: z(), perks: z(), gear: z() };
  for (const k in race().mods) src.race[k] += race().mods[k];
  for (const k in cls().mods) src.class[k] += cls().mods[k];
  for (const p of G.perks || []) for (const k in PERKS[p].mods || {}) src.perks[k] += PERKS[p].mods[k];
  const l = G.lvl - 1;
  Object.assign(src.level, { maxHp: l * 6, maxMp: l * 3, atk: l, def: Math.floor(l / 2), mag: l });
  const total = stats();
  for (const k in total) src.gear[k] = total[k] - ['base', 'race', 'class', 'level', 'perks'].reduce((t, n) => t + (src[n][k] || 0), 0);
  return { src, total };
}
let sheetFrom = 'menu';
function openSheet(from = 'menu') {
  sheetFrom = from;
  const { src, total } = statSources();
  const names = { base: 'Base', race: race().name, class: cls().name, level: 'Level', perks: 'Enhancements', gear: 'Gear' };
  const rows = SHEET.map(([k, nm, short, what]) => {
    const parts = Object.keys(names).filter((n) => n !== 'base' && src[n][k]).map((n) => `<span class="${src[n][k] > 0 ? 'up' : 'down'}">${src[n][k] > 0 ? '+' : ''}${src[n][k]} ${esc(names[n])}</span>`);
    const val = k === 'xpPct' ? `+${total[k]}%` : total[k];
    return `<div class="sheet-row"><div class="sheet-top"><span class="sheet-nm">${nm} <small>${short}</small></span><span class="sheet-val">${val}</span></div>
      <div class="sheet-what">${what}</div><div class="sheet-src">${k === 'xpPct' ? '' : `${src.base[k]} base`}${parts.length ? (k === 'xpPct' ? '' : ' ') + parts.join(' ') : ''}</div></div>`;
  }).join('');
  const c = cls();
  showOverlay(`
    <div class="talk-head"><img src="${heroSprite(race(), c, 'down', 0, G.sex).toDataURL()}" alt=""><div class="who">
      <b style="font-size:18px">${esc(G.name)}</b>
      <span class="muted" style="font-size:14px">${G.sex === 'f' ? 'Female' : 'Male'} ${esc(race().name)} ${esc(c.name)}, former ${esc(job().name.toLowerCase())}</span>
      <span style="font-size:14px;color:var(--cyan)">Level ${G.lvl} · ${G.xp} / ${G.lvl * 20} XP</span></div></div>
    <h2>CHARACTER SHEET</h2>
    <div class="sheet">${rows}</div>
    <p style="font-size:15px"><b style="color:var(--gold)">${esc(c.skill.name)}</b> (${c.skill.mp} MP): ${esc(c.skill.desc)}</p>
    <p style="font-size:14px;color:#ff8a8a">${esc(cannotText(c))}</p>
    <p class="muted" style="font-size:14px">Every level gives +6 HP, +3 MP, +1 STR, +1 INT, and +1 DEF every other level. Gear, enhancements, race and class add the rest.</p>
    <button class="btn grey" data-act="sheetback" style="position:sticky; bottom:0">BACK</button>`);
}
overlayHandlers.sheet = () => openSheet('menu');
overlayHandlers.gsheet = () => openSheet('gear');
overlayHandlers.sheetback = () => (sheetFrom === 'gear' ? renderGear() : openMenu(true));
overlayHandlers.quit = () => showTitle();
overlayHandlers.skiptut = () => finishTutorial();

// ---------- Battle ----------
function makeEnemy(member, i, depth = 0) {
  const base = MOBS[member.type];
  const e = { id: i, name: base.name, sprite: base.sprite, atkKey: base.sprite, hp: base.hp, atk: base.atk, def: base.def, spd: base.spd, xp: base.xp, tokens: base.tokens, drops: base.drops, traits: member.traits.slice(), elite: member.elite, alive: true, flash: 0, slash: 0, intent: 'attack', begged: false, poison: 0, frozen: 0 };
  if (e.traits.includes('armored')) e.def += 3;
  if (e.elite) { e.hp = Math.round(e.hp * 1.6); e.atk += 2; e.xp *= 2; }
  const scale = 1 + (G.lvl - 1) * 0.12 + depth * 0.6;
  e.hp = Math.round(e.hp * scale); e.atk = Math.round(e.atk * scale); e.xp = Math.round(e.xp * (1 + depth));
  if (member.tutorial) { e.hp = 9; e.atk = 3; }
  e.maxHp = e.hp;
  const label = e.traits.map((t) => TRAITS[t].name).join(' ');
  e.full = (e.elite ? 'Elite ' : '') + (label ? label + ' ' : '') + e.name;
  return e;
}

function startBattle(mob) {
  moveHeld = null;
  const enemies = mob.members.map((m, i) => makeEnemy(m, i, mob.depth || 0));
  beginBattle(enemies, mob);
  say(`<b>Fight!</b> ${esc(enemies.map((e) => e.full).join(', '))}`);
  if (mob.elite) bookie('An elite! Somebody up there just doubled their bet against you.');
  tut('battle');
}
function startBossBattle(b) {
  const d = BOSSES[b.type];
  const e = { id: 0, name: d.name, full: d.name, sprite: d.sprite, atkKey: b.type, bossId: b.id, bossType: b.type, hp: d.hp + (G.lvl - 1) * 8, atk: d.atk + Math.floor((G.lvl - 1) / 2), def: d.def, spd: d.spd, xp: d.xp, tokens: d.tokens, drops: [], traits: [], boss: true, alive: true, flash: 0, slash: 0, intent: 'attack', begged: true, phase: 1, poison: 0, frozen: 0 };
  e.maxHp = e.hp;
  beginBattle([e], null);
  bookie(d.announce);
  say(esc(d.intro));
}
function beginBattle(enemies, mob) {
  mode = 'battle';
  prompt = null;
  FX = { proj: null, pops: [], bursts: [], heroFlash: 0 };
  B = { enemies, mob, phase: 'menu', turn: 0, buff: { ...(G.buff || {}) }, poison: 0, stolen: [], guard: false };
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
function intentText(e) {
  if (!e.alive) return e.spared ? 'Spared' : 'Down';
  if (e.frozen > 0) return 'Frozen';
  const a = ATTACKS[e.atkKey] || ATTACKS.rat;
  if (e.intent === 'attack') return 'Next: ' + a.name;
  if (e.intent === 'heavy') return 'Winding up: ' + a.heavy;
  if (e.intent === 'defend') return 'Defending';
  return e.bossType === 'hoarder' ? 'Next: Grabby Hands' : 'Next: Fare Check';
}

function alive() { return B.enemies.filter((e) => e.alive); }
function heroAtk() { return stats().atk + (B.buff.atk || 0); }
function heroDef() { return stats().def + (B.buff.def || 0) + (B.guard ? 4 : 0); }
function avgDef() { const a = alive(); return a.length ? a.reduce((s, e) => s + e.def, 0) / a.length : 0; }

// Rough damage for each move kind, so the Attack menu can show and sort by it.
// Returns { dmg } per target, plus all: true when it hits every mob, or util: text for non-damage moves.
function moveEstimate(kind) {
  const s = stats(), a = heroAtk(), d = avgDef(), m = s.mag;
  const hit = (n) => Math.max(1, n);
  const T = {
    double: () => ({ dmg: hit(a + 1 - d) * 2 }),
    bolt: () => ({ dmg: m * 1.6 + 1.5 }),
    flashy: () => ({ dmg: hit(a + 1 - d) * 1.3 }),
    shrapnel: () => ({ dmg: hit(5 + G.lvl + m / 2 - d / 2), all: true }),
    talk: () => ({ util: 'TALK' }),
    heal: () => ({ util: '+' + Math.round(20 + m * 1.5) + ' HP' }),
    stun: () => ({ dmg: hit(a + 1 - d) }),
    steal: () => ({ dmg: hit(a + 1 - d) * 1.1 }),
    burst: () => ({ dmg: hit(4 + m * 0.9 - d / 2), all: true }),
    freeze: () => ({ dmg: 4 + m * 0.9 }),
    drain: () => ({ dmg: 4 + m * 1.1 }),
    poison: () => ({ dmg: 2 + m / 2 + 3 * (3 + Math.floor(m / 3)) }),
    multi: () => ({ dmg: 3 * hit((a + 1) * 0.6 - d) }),
    song: () => ({ util: '+3 ATK' }),
    rampage: () => ({ dmg: hit(a + 1 - d), all: true }),
    crit: () => ({ dmg: (a + 2) * 3 }),
    guard: () => ({ util: '+6 DEF' }),
    blind: () => ({ util: 'STUN' }),
    curse: () => ({ dmg: 3 + m }),
    venom: () => ({ dmg: 3 * (3 + Math.floor(m / 3)) }),
    frost: () => ({ dmg: 4 + m * 0.9 }),
    leech: () => ({ dmg: 5 + m }),
    mend: () => ({ util: '+' + (30 + m) + ' HP' }),
    iron: () => ({ util: '+4 DEF' }),
    fireball: () => ({ dmg: hit(6 + m * 1.1 - d / 2), all: true }),
    lightning: () => ({ dmg: 10 + m * 1.4, all: true }),
  };
  const r = (T[kind] || (() => ({ util: '' })))();
  if (r.dmg != null) r.dmg = Math.max(1, Math.round(r.dmg));
  return r;
}

// Everything you can do when you tap Attack. Free attacks come first, strongest on top,
// then mana moves, strongest on top, with heals and buffs at the bottom.
function fightOptions() {
  const w = G.equip.weapon && ITEMS[G.equip.weapon];
  const est = (n) => Math.max(1, Math.round(n));
  const n = Math.max(1, alive().length);
  const free = [], mana = [];
  free.push({ id: 'weapon', label: w ? 'Swing ' + w.name : 'Punch', type: w ? 'WEAPON' : 'PHYSICAL', info: 'Hits one mob.', dmg: est(heroAtk() + 1 - avgDef()), target: 'one' });
  free.push({ id: 'kick', label: 'Kick', type: 'PHYSICAL', info: 'Weaker, but stops a wind-up.', dmg: est((heroAtk() + 1) * 0.7 - avgDef()), target: 'one' });
  for (const id of G.order) {
    if (count(id) > 0 && ITEMS[id].type === 'bomb') {
      const mult = (G.race === 'gnome' ? 1.5 : 1) * (hasPerk('demo') ? 1.3 : 1);
      free.push({ id: 'bomb:' + id, label: `${ITEMS[id].name} x${count(id)}`, type: 'BOMB', info: 'Hits every mob. Uses one up.', dmg: Math.round(ITEMS[id].dmg * mult), all: true, target: 'all' });
    }
  }
  const sk = cls().skill;
  const add = (id, def, type, kind) => {
    const e = moveEstimate(kind);
    mana.push({ id, label: def.name, type, info: def.desc, target: def.target, mp: def.mp, dmg: e.dmg || 0, all: e.all, util: e.util });
  };
  add('move:class', sk, 'CLASS', sk.kind);
  for (const m of G.moves) add('move:' + m, MOVES[m], 'SPELL', m);
  const total = (o) => (o.dmg || 0) * (o.all ? n : 1);
  free.sort((x, y) => total(y) - total(x));
  mana.sort((x, y) => total(y) - total(x));
  return [...free, ...mana];
}
function fightOptHtml(o) {
  const big = o.util != null && !o.dmg
    ? `<span class="fdmg util">${esc(o.util)}</span>`
    : `<span class="fdmg">${o.dmg}<small>${o.all ? 'EACH' : 'DMG'}</small></span>`;
  const tag = o.mp ? `<span class="fmp">${o.mp} MP</span>` : '';
  return `<button class="btn red text fight-opt ${o.mp ? 'mana' : ''}" data-b="act" data-arg="${o.id}" ${o.mp && G.mp < o.mp ? 'disabled' : ''}>
    <span class="fmain"><span class="ftop"><b>${esc(o.label)}</b>${tag}${o.all ? '<span class="fall">ALL</span>' : ''}</span><span class="finfo">${esc(o.info)}</span></span>${big}</button>`;
}

function renderBattleControls() {
  const foes = `<div class="foes">${B.enemies.map((e) => `<div class="foe ${e.alive ? '' : 'dead'}"><span><span class="nm">${esc(e.full)}</span> <span class="muted">${Math.max(0, e.hp)}/${e.maxHp}</span> <span class="xpv">${xpFor(e)} XP</span>${e.traits.length ? `<br><span class="tr">${e.traits.map((t) => esc(TRAITS[t].desc)).join(' · ')}</span>` : ''}${e.poison ? ' <span class="tr" style="color:#b8e05a">Poisoned</span>' : ''}</span><span class="in">${esc(intentText(e))}</span></div>`).join('')}</div>`;
  let btns = '';
  if (B.phase === 'menu') {
    btns = `<div class="grid2">
      <button class="btn red" data-b="fight">ATTACK ▸</button>
      <button class="btn green" data-b="items">ITEM ▸</button>
      <button class="btn" data-b="guard">GUARD</button>
      <button class="btn grey" data-b="run" ${B.enemies.some((e) => e.boss) ? 'disabled' : ''}>RUN</button></div>`;
  } else if (B.phase === 'fight') {
    const opts = fightOptions();
    const firstMana = opts.findIndex((o) => o.mp);
    btns = `<div class="stack opts">${opts.map((o, i) => (i === firstMana ? `<div class="opt-head">MANA MOVES · you have ${G.mp} MP</div>` : '') + fightOptHtml(o)).join('')}</div><button class="btn grey" data-b="back">BACK</button>`;
  } else if (B.phase === 'target') {
    btns = `<p class="muted" style="margin:0">Who gets the ${esc(B.pendingLabel)}?</p><div class="stack opts">${alive().map((e) => `<button class="btn red text" data-b="target" data-arg="${e.id}">${esc(e.full)} (${e.hp} HP)</button>`).join('')}</div><button class="btn grey" data-b="back">BACK</button>`;
  } else if (B.phase === 'items') {
    const usable = G.order.filter((id) => count(id) > 0 && ['potion', 'food'].includes(ITEMS[id].type)).sort((a, b) => (G.favs[b] ? 1 : 0) - (G.favs[a] ? 1 : 0));
    btns = `<div class="stack opts">${usable.map((id) => { const w = potionWait(id); return `<button class="btn green text" data-b="use" data-arg="${id}" ${w ? 'disabled' : ''}>${G.favs[id] ? '★ ' : ''}${ITEMS[id].type === 'food' ? 'EAT' : 'DRINK'} ${esc(ITEMS[id].name)} x${count(id)}${w ? ` (${w})` : ''}</button>`; }).join('') || '<p class="muted">No potions or food. Bombs are under Attack.</p>'}</div><button class="btn grey" data-b="back">BACK</button>`;
  } else if (B.phase === 'mercy') {
    btns = `<div class="grid2"><button class="btn green" data-b="spare">SPARE IT</button><button class="btn red" data-b="finish">FINISH IT</button></div>`;
  } else if (B.phase === 'busy') {
    btns = '<div class="grid2"><button class="btn grey" disabled>...</button><button class="btn grey" disabled>...</button></div>';
  } else if (B.phase === 'end') {
    btns = '<button class="btn green" data-b="continue">CONTINUE</button>';
  }
  // The mob list only shows on the main menu screens, so action lists always have room.
  const showFoes = ['menu', 'mercy', 'busy', 'end'].includes(B.phase);
  controls.innerHTML = (showFoes ? foes : '') + btns;
  // Picking a move hides the text box so more choices fit on screen.
  textbox.classList.toggle('picking', ['fight', 'target', 'items'].includes(B.phase));
}

function battleInput(cmd, arg) {
  if (!B) return;
  if (cmd === 'back') { B.phase = 'menu'; return renderBattleControls(); }
  if (cmd === 'continue') return endBattleReturn();
  if (B.phase === 'busy') return;
  if (cmd === 'fight') { B.phase = 'fight'; return renderBattleControls(); }
  if (cmd === 'items') { B.phase = 'items'; return renderBattleControls(); }
  if (cmd === 'act') {
    const o = fightOptions().find((x) => x.id === arg);
    if (!o) return;
    if (o.target === 'one') {
      B.pending = o.id; B.pendingLabel = o.label;
      if (alive().length === 1) return doPlayer(o.id, alive()[0].id);
      B.phase = 'target'; return renderBattleControls();
    }
    return doPlayer(o.id, null);
  }
  if (cmd === 'target') return doPlayer(B.pending, Number(arg));
  if (cmd === 'use') { if (potionWait(arg)) return; return doPlayer('use:' + arg, null); }
  if (cmd === 'guard') return doPlayer('guard', null);
  if (cmd === 'run') return doPlayer('run', null);
  if (cmd === 'spare' || cmd === 'finish') return resolveMercy(cmd);
}

// ----- Battle effects -----
const HERO_C = { x: 52, y: 116 };
function enemyBox(e) {
  const idx = B.enemies.indexOf(e);
  const n = B.enemies.length;
  const pos = e.boss ? [[146, 18]] : n === 1 ? [[154, 38]] : n === 2 ? [[128, 40], [180, 36]] : [[112, 42], [154, 34], [196, 42]];
  const [x, y] = pos[idx] || pos[0];
  const size = e.boss ? 48 : 32;
  return { x, y, size, cx: x + size / 2, cy: y + size / 2 };
}
function fly(from, to, kind, color, dur = 380) {
  return new Promise((res) => {
    let done = false;
    const finish = () => { if (!done) { done = true; FX.proj = null; res(); } };
    FX.proj = { x0: from.x, y0: from.y, x1: to.x, y1: to.y, kind, color, t0: performance.now(), dur, finish };
    setTimeout(finish, dur + 150);
  });
}
function burst(x, y, kind, color) { FX.bursts.push({ x, y, kind, color, t0: performance.now() }); }
function pop(x, y, text, color) { FX.pops.push({ x, y, text, color, t0: performance.now() }); }
function popHero(text, color) { pop(HERO_C.x, HERO_C.y - 26, text, color); }

function hitEnemy(e, dmg, why = '') {
  dmg = Math.max(1, Math.round(dmg));
  e.hp -= dmg;
  e.flash = 12;
  const b = enemyBox(e);
  pop(b.cx, b.y - 4, '-' + dmg, '#fff6e0');
  say(`${why}${esc(e.full)} takes <b>${dmg}</b> damage.`);
  if (e.hp <= 0) killEnemy(e);
  else if (e.boss && e.phase === 1 && e.hp <= e.maxHp / 2) {
    e.phase = 2; e.atk += 3;
    bookie(e.bossType === 'hoarder' ? 'The Hoarder is getting desperate. Hold onto your stuff!' : 'FARE INCREASE! The King is angry now.');
  }
}

function killEnemy(e, how = 'kill') {
  e.alive = false; e.hp = 0;
  if (how === 'spare') { e.spared = true; return; }
  G.kills++;
  say(`${esc(e.full)} is defeated!`);
  if (!FL.tutorial) achieve('firstblood');
  if (e.traits.includes('explosive')) {
    const d = 8 + G.lvl;
    G.hp -= d;
    const b = enemyBox(e);
    burst(b.cx, b.cy, 'boom', '#f5c542');
    popHero('-' + d, '#ff5fa2');
    say(`It explodes! You take <b>${d}</b> damage.`);
  }
  if (e.traits.includes('famous')) { addHype(2); achieve('ratings'); }
  for (const sl of GEAR_SLOTS) if (G.equip[sl] && ITEMS[G.equip[sl]].hype) addHype(0.5);
  if (G.race === 'ghoul') { G.hp = Math.min(stats().maxHp, G.hp + 4); say('You feed on it. +4 HP.'); }
}

async function doPlayer(action, targetId) {
  B.phase = 'busy';
  renderBattleControls();
  const s = stats();
  B.turn++;
  B.guard = false;
  const target = targetId === null ? null : B.enemies.find((x) => x.id === targetId && x.alive);
  const tb = target && enemyBox(target);
  if (action === 'weapon' || action === 'kick') {
    if (!target) { B.phase = 'menu'; return renderBattleControls(); }
    const w = G.equip.weapon && ITEMS[G.equip.weapon];
    const def = target.def + (target.intent === 'defend' ? 2 : 0);
    let dmg = heroAtk() + R.int(0, 2) - def;
    if (action === 'kick') {
      dmg = (heroAtk() + R.int(0, 2)) * 0.7 - def;
      say('You <b>kick</b>!');
      await fly(HERO_C, { x: tb.cx, y: tb.cy }, 'fist', '#f2b48a', 260);
      burst(tb.cx, tb.cy, 'star', '#fff6e0');
      if (target.intent === 'heavy') { target.intent = 'attack'; say(`You knock ${esc(target.full)} off balance. No wind-up!`); }
    } else {
      say(w ? `You swing your <b>${esc(w.name)}</b>!` : 'You <b>punch</b>!');
      if (w) { burst(tb.cx, tb.cy, 'slash', '#fff6e0'); await sleep(220); }
      else { await fly(HERO_C, { x: tb.cx, y: tb.cy }, 'fist', '#f2b48a', 260); burst(tb.cx, tb.cy, 'star', '#fff6e0'); }
    }
    if (G.race === 'orc' && G.hp < s.maxHp / 3) { dmg *= 1.5; say('Orc rage!'); }
    const crit = R.chance(0.05 + s.luck * 0.01);
    if (crit) dmg *= 1.5;
    hitEnemy(target, dmg, crit ? 'Critical! ' : '');
    if (action === 'weapon' && G.race === 'werewolf' && target.alive && R.chance(0.2)) { await sleep(200); burst(tb.cx, tb.cy, 'slash', '#c8334a'); hitEnemy(target, heroAtk() + R.int(0, 2) - def, 'You lunge again! '); }
    if (G.race === 'goblin' && R.chance(0.25)) { const t = R.int(1, 3); G.tokens += t; say(`You swipe ${t} tokens.`); }
  } else if (action.startsWith('move:')) {
    await castMove(action.slice(5), target);
  } else if (action.startsWith('bomb:')) {
    const id = action.slice(5);
    const it = ITEMS[id];
    removeItem(id);
    say(`You throw a <b>${esc(it.name)}</b>!`);
    const mid = { x: 160, y: 56 };
    await fly(HERO_C, mid, 'bomb', '#5a5373', 420);
    burst(mid.x, mid.y, 'boom', '#f5c542');
    const mult = (G.race === 'gnome' ? 1.5 : 1) * (hasPerk('demo') ? 1.3 : 1);
    for (const e of alive()) hitEnemy(e, it.dmg * mult);
  } else if (action.startsWith('use:')) {
    consume(action.slice(4));
  } else if (action === 'guard') {
    B.guard = true;
    G.mp = Math.min(s.maxMp, G.mp + 2);
    say('You <b>guard</b>. +4 defense this turn and +2 MP.');
    burst(HERO_C.x, HERO_C.y, 'shield', '#4fd8e8');
  } else if (action === 'run') {
    const a = alive();
    const avg = a.reduce((t, e) => t + e.spd, 0) / a.length;
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
  renderBattleControls();
  B.phase = 'busy';
  await sleep(350);
  if (checkEnd()) return;
  await enemyTurn();
}

async function castMove(id, e) {
  const s = stats();
  const isClass = id === 'class';
  const def = isClass ? cls().skill : MOVES[id];
  G.mp -= def.mp;
  const eb = e && enemyBox(e);
  const bolt = async (color) => { if (e) { await fly(HERO_C, { x: eb.cx, y: eb.cy }, 'bolt', color, 320); burst(eb.cx, eb.cy, 'star', color); } };
  say(`You cast <b>${esc(def.name)}</b>!`);
  if (isClass) {
    const a = () => heroAtk() + R.int(0, 2);
    const fist = async (color = '#c8334a') => { await fly(HERO_C, { x: eb.cx, y: eb.cy }, 'fist', color, 240); burst(eb.cx, eb.cy, 'boom', color); };
    const allBoom = async (color, proj = 'junk') => { const mid = { x: 160, y: 56 }; await fly(HERO_C, mid, proj, color, 360); burst(mid.x, mid.y, 'boom', color); };
    const healMe = (h) => { h = Math.round(h); G.hp = Math.min(s.maxHp, G.hp + h); burst(HERO_C.x, HERO_C.y, 'sparkle', '#6bbf59'); popHero('+' + h, '#6bbf59'); say(`<span class="good">+${h} HP</span>`); };
    switch (def.kind) {
      case 'double': await fist(); hitEnemy(e, (a() + 1 - e.def) * 2); break;
      case 'bolt': await bolt(def.color || '#c49af0'); hitEnemy(e, s.mag * 1.6 + R.int(0, 3)); break;
      case 'flashy': burst(eb.cx, eb.cy, 'slash', '#f5c542'); await sleep(200); hitEnemy(e, (a() + 1 - e.def) * 1.3); addHype(2); break;
      case 'shrapnel': await allBoom('#b8693a'); for (const x of alive()) hitEnemy(x, 5 + G.lvl + s.mag / 2 - x.def / 2); break;
      case 'talk': {
        const p = (e.boss ? 0 : 0.45) + s.luck * 0.02 + chaBonus() * 0.02 + (e.hp < e.maxHp * 0.4 ? 0.3 : 0);
        if (R.chance(p)) { say(`You talk ${esc(e.full)} into walking away.`); killEnemy(e, 'spare'); G.spared++; tag('merciful'); }
        else say(`${esc(e.full)} is not listening.`);
        break;
      }
      case 'heal': healMe(20 + s.mag * 1.5); break;
      case 'stun': await fist('#8b84a3'); hitEnemy(e, a() + 1 - e.def); if (e.alive) { e.frozen = 1; say(`${esc(e.full)} is stunned!`); } break;
      case 'steal': {
        burst(eb.cx, eb.cy, 'slash', '#6bbf59'); await sleep(200); hitEnemy(e, (a() + 1 - e.def) * 1.1);
        const t = R.int(2, 4 + G.lvl); G.tokens += t; say(`You lift <b>${t}</b> tokens from its pockets.`);
        break;
      }
      case 'burst': await allBoom(def.color || '#ff8a3a', 'bolt'); for (const x of alive()) hitEnemy(x, 4 + s.mag * 0.9 - x.def / 2); break;
      case 'freeze': await bolt('#4fd8e8'); hitEnemy(e, 4 + s.mag * 0.9); if (e.alive) { e.frozen = 1; say(`${esc(e.full)} is frozen solid!`); } break;
      case 'drain': { await bolt('#c8334a'); const d = Math.round(4 + s.mag * 1.1); hitEnemy(e, d); healMe(d); break; }
      case 'poison': await bolt('#b8e05a'); hitEnemy(e, 2 + s.mag / 2); if (e.alive) { e.poison = 3; say(`${esc(e.full)} is poisoned!`); } break;
      case 'multi':
        for (let i = 0; i < 3 && e.alive; i++) { burst(eb.cx + R.int(-6, 6), eb.cy + R.int(-6, 6), 'star', '#f5c542'); await sleep(140); hitEnemy(e, (a() + 1) * 0.6 - e.def); }
        break;
      case 'song': burst(HERO_C.x, HERO_C.y, 'sparkle', '#ff5fa2'); B.buff.atk = (B.buff.atk || 0) + 3; addHype(1); say('The crowd sings along. +3 attack for this fight.'); break;
      case 'rampage': for (const x of alive()) { const b = enemyBox(x); burst(b.cx, b.cy, 'slash', '#ff8a8a'); } await sleep(220); for (const x of alive()) hitEnemy(x, a() + 1 - x.def); break;
      case 'crit': await bolt('#4fd8e8'); hitEnemy(e, (a() + 2) * 3, 'HEADSHOT! '); break;
      case 'guard': burst(HERO_C.x, HERO_C.y, 'shield', '#8b84a3'); B.buff.def = (B.buff.def || 0) + 6; say('You plant your feet. +6 defense.'); healMe(10); break;
      case 'blind':
        for (const x of alive()) { const b = enemyBox(x); burst(b.cx, b.cy, 'star', '#e8dcc0'); }
        await sleep(220);
        for (const x of alive()) { if (R.chance(0.6)) { x.frozen = 1; say(`${esc(x.full)} can't see!`); } else say(`${esc(x.full)} blinks it off.`); }
        break;
      case 'curse': await bolt('#8a4fc9'); hitEnemy(e, 3 + s.mag); if (e.alive) { e.atk = Math.max(1, e.atk - 3); say(`${esc(e.full)} feels weaker. Its hits do 3 less.`); } break;
    }
    return;
  }
  if (id === 'venom') { await bolt('#b8e05a'); e.poison = 3; say(`${esc(e.full)} is poisoned!`); }
  if (id === 'frost') { await bolt('#4fd8e8'); hitEnemy(e, 4 + s.mag * 0.9); if (e.alive) { e.frozen = 1; say(`${esc(e.full)} is frozen solid!`); } }
  if (id === 'leech') { await bolt('#c8334a'); const d = 5 + s.mag; hitEnemy(e, d); const h = Math.round(d / 2); G.hp = Math.min(s.maxHp, G.hp + h); popHero('+' + h, '#6bbf59'); }
  if (id === 'mend') { burst(HERO_C.x, HERO_C.y, 'sparkle', '#6bbf59'); const h = 30 + s.mag; G.hp = Math.min(s.maxHp, G.hp + h); popHero('+' + h, '#6bbf59'); say(`<span class="good">+${h} HP</span>`); }
  if (id === 'iron') { burst(HERO_C.x, HERO_C.y, 'shield', '#8b84a3'); B.buff.def = (B.buff.def || 0) + 4; say('Your skin turns to iron. +4 defense.'); }
  if (id === 'fireball') { const mid = { x: 160, y: 56 }; await fly(HERO_C, mid, 'bolt', '#ff8a3a', 380); burst(mid.x, mid.y, 'boom', '#ff8a3a'); for (const x of alive()) hitEnemy(x, 6 + s.mag * 1.1 - x.def / 2); }
  if (id === 'lightning') { for (const x of alive()) { const b = enemyBox(x); burst(b.cx, b.cy, 'zap', '#f5c542'); } await sleep(250); for (const x of alive()) hitEnemy(x, 10 + s.mag * 1.4); }
}

async function enemyTurn() {
  for (const e of alive()) {
    if (e.frozen > 0) { e.frozen--; say(`${esc(e.full)} is frozen and can't move!`); continue; }
    let acts = 1;
    if (e.traits.includes('fast') && R.chance(0.3)) acts = 2;
    for (let a = 0; a < acts && e.alive && G.hp > 0; a++) {
      await sleep(180);
      await enemyAct(e);
      updateHud();
      renderBattleControls();
      if (G.hp <= 0) break;
    }
    if (G.hp <= 0) break;
  }
  if (B.poison > 0 && G.hp > 0) { G.hp -= 2; B.poison--; popHero('-2', '#b8e05a'); say('Poison stings. <b>2</b> damage.'); }
  for (const e of alive()) if (e.poison > 0 && G.hp > 0) { e.poison--; hitEnemy(e, 3 + Math.floor(stats().mag / 3), 'Venom! '); }
  for (const e of alive()) rollIntent(e);
  updateHud();
  if (checkEnd()) return;
  // Hurt cowardly mobs beg for their lives.
  const beggar = alive().find((e) => !e.begged && !e.boss && e.traits.includes('cowardly') && e.hp <= e.maxHp * (0.35 + Math.max(0, chaBonus()) * 0.01));
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

async function enemyAct(e) {
  if (e.intent === 'defend') { say(`${esc(e.full)} braces itself.`); return; }
  const atk = ATTACKS[e.atkKey] || ATTACKS.rat;
  const eb = enemyBox(e);
  if (e.intent === 'fare') {
    if (e.bossType === 'hoarder') {
      say(`${esc(e.full)} uses <b>Grabby Hands</b>!`);
      await fly({ x: eb.cx, y: eb.cy }, HERO_C, 'junk', '#b8693a', 360);
      const options = G.order.filter((id) => count(id) > 0 && ITEMS[id].type !== 'box' && !isEquipped(id));
      if (options.length) { const id = R.pick(options); removeItem(id); B.stolen.push(id); say(`It snatches your ${esc(ITEMS[id].name)}! Beat it to get it back.`); }
    } else {
      const t = Math.min(G.tokens, R.int(3, 8));
      G.tokens -= t;
      say(`<b>FARE CHECK!</b> The King takes ${t} tokens.`);
      await fly({ x: eb.cx, y: eb.cy }, HERO_C, 'tickets', '#f5c542', 340);
    }
  }
  if (G.race === 'pixie' && alive().length > 1 && R.chance(0.15)) {
    const other = R.pick(alive().filter((x) => x !== e));
    const ob = enemyBox(other);
    say(`Your glamour tricks ${esc(e.full)} into hitting ${esc(other.full)}!`);
    await fly({ x: eb.cx, y: eb.cy }, { x: ob.cx, y: ob.cy }, atk.proj, atk.color);
    hitEnemy(other, e.atk);
    return;
  }
  const name = e.intent === 'heavy' ? atk.heavy : atk.name;
  say(`${esc(e.full)} uses <b>${esc(name)}</b>!`);
  await fly({ x: eb.cx, y: eb.cy }, HERO_C, atk.proj, atk.color, e.intent === 'heavy' ? 480 : 380);
  if (G.race === 'fairy' && R.chance(0.15)) { popHero('MISS', '#4fd8e8'); say('You flutter out of the way!'); return; }
  let dmg = e.atk + R.int(0, 2) - heroDef();
  if (e.intent === 'heavy') dmg *= 1.6;
  dmg = Math.max(1, Math.round(dmg));
  G.hp -= dmg;
  FX.heroFlash = 12;
  burst(HERO_C.x, HERO_C.y, e.intent === 'heavy' ? 'boom' : 'star', atk.color);
  popHero('-' + dmg, '#ff5fa2');
  say(`You take <b>${dmg}</b> damage.`);
  if (dmg >= stats().maxHp * 0.25) bookie(R.pick(BOOKIE.hurt));
  if (e.traits.includes('toxic') && R.chance(0.35)) {
    if (G.race === 'dwarf') say('Poison! Your dwarf gut shrugs it off.');
    else { B.poison = 3; say('You are poisoned!'); }
  }
  if (e.traits.includes('greedy') && R.chance(0.3)) {
    const options = G.order.filter((id) => count(id) > 0 && ITEMS[id].type !== 'box' && !isEquipped(id));
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
    if (!FL.tutorial) achieve('mercy');
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
  if (G.hp <= 0) { G.hp = 0; updateHud(); setTimeout(() => die('You were knocked out on live TV.'), 700); B.phase = 'busy'; renderBattleControls(); return true; }
  if (alive().length) return false;
  victory();
  return true;
}

// XP a mob is worth to you, with your XP bonuses.
function xpFor(e) {
  let x = e.xp;
  if (hasPerk('learner')) x *= 1.25;
  const p = stats().xpPct;
  if (p) x *= 1 + p / 100;
  return Math.round(x);
}
function victory() {
  const s = stats();
  let xp = 0, tokens = 0;
  const drops = [];
  for (const e of B.enemies) {
    if (e.spared) { xp += Math.floor(e.xp / 2); continue; }
    xp += e.xp;
    tokens += R.int(e.tokens[0], e.tokens[1]) + 1;
    // Every mob drops something. Extra rolls for a bonus item and a loot box.
    const scav = hasPerk('scavenger') ? 0.15 : 0;
    if (e.drops.length) drops.push(R.pick(e.drops));
    if (R.chance(0.4 + scav)) { const bonus = rollLoot(G.lvl >= 5 ? 'box_silver' : 'box_rusty').items[0]; if (bonus) for (let n = 0; n < bonus[1]; n++) drops.push(bonus[0]); }
    if (R.chance(0.3 + scav)) drops.push(G.lvl >= 6 && R.chance(0.3) ? 'box_silver' : 'box_rusty');
    if (e.elite) { drops.push('box_silver', rollLoot('box_gold').items[0][0]); achieve('elite'); tag('brave'); }
  }
  const boss = B.enemies.find((e) => e.boss);
  say('<span class="good">Victory!</span>');
  if (boss) {
    G.bossesDead.push(boss.bossId);
    objIndex.delete(key(FL.bosses.find((b) => b.id === boss.bossId)));
    drops.push('box_gold', boss.bossType === 'king' ? 'w_bar' : 'scroll_fireball');
    G.odds *= 0.75;
    tag('brave');
    achieve(boss.bossType);
    const left = FL.bosses.filter((b) => !G.bossesDead.includes(b.id)).length;
    bookie(left === 0 ? 'BOTH BOSSES DOWN! The stairs are unlocked. The Patrons are screaming.' : `${boss.name} is finished! One boss left before the stairs open.`);
  } else {
    G.odds *= B.enemies.some((e) => e.elite) ? 0.85 : 0.95;
    bookie(G.hp < s.maxHp * 0.25 ? R.pick(BOOKIE.lowWin) : R.pick(BOOKIE.win));
  }
  if (G.hp < s.maxHp * 0.25) { addHype(1); G.odds *= 0.97; }
  if (B.turn <= 1) addHype(1);
  if (hasPerk('tipjar')) tokens += 3;
  if (hasPerk('learner')) xp = Math.round(xp * 1.25);
  if (s.xpPct) xp = Math.round(xp * (1 + s.xpPct / 100));
  if (hasPerk('firstaid') && G.hp > 0) G.hp = Math.min(s.maxHp, G.hp + 4);
  G.tokens += tokens;
  say(`+${xp} XP · +${tokens} tokens${hasPerk('firstaid') ? ' · +4 HP (First Aid)' : ''}`);
  const merged = {};
  for (const d of drops) merged[d] = (merged[d] || 0) + 1;
  for (const [d, n] of Object.entries(merged)) addItem(d, n);
  for (const id of B.stolen) { addItem(id, 1, true); say(`You got your ${esc(ITEMS[id].name)} back.`); }
  gainXp(xp);
  if (B.mob) {
    if (B.mob.id[0] === 'm' || B.mob.id[0] === 't') G.killed.push(B.mob.id);
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
  calmT = 0; regenAcc = 0; guideFrom = -1;
  textbox.classList.remove('picking');
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
  if (!FL.tutorial) achieve('death');
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
  const mins = Math.floor(G.playTime / 60);
  showOverlay(`
    <p class="banner gold" style="margin-top:24px">FLOOR 1 CLEARED!</p>
    <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> ${esc(G.name)} takes the stairs! Odds now ${oddsText()}. Somebody up there is getting rich.</p></div>
    <div class="stat-list">
      <span>Level <b>${G.lvl}</b></span><span>Time <b>${mins} min</b></span>
      <span>Kills <b>${G.kills}</b></span><span>Spared <b>${G.spared}</b></span>
      <span>Boxes opened <b>${G.boxesOpened}</b></span><span>Deaths <b>${G.deaths}</b></span>
    </div>
    <p>${esc(G.doc.met ? docEnd : 'You never met Doc. Maybe next time.')}</p>
    <p class="muted">Floor 2, The Food Court, is coming in a future build. Try another hero in a different save slot to see a different floor, rule and Doc.</p>
    <button class="btn" data-act="quit">BACK TO TITLE</button>`);
}

// ---------- Drawing ----------
function drawTile(x, y, sx, sy) {
  if (!seen(x, y)) { ctx.fillStyle = '#0a0712'; ctx.fillRect(sx, sy, 16, 16); return; }
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
function shadow(x, y) { ctx.fillStyle = 'rgba(10,7,18,0.35)'; ctx.fillRect(Math.round(x) + 4, Math.round(y) + 14, 8, 2); ctx.fillRect(Math.round(x) + 3, Math.round(y) + 15, 10, 1); }
function drawMap() {
  const now = performance.now();
  let heroFrame = 0;
  if (walk && walking(now)) {
    const p = (now - walk.t0) / walk.dur;
    heroDraw.x = walk.fx + (walk.tx - walk.fx) * p;
    heroDraw.y = walk.fy + (walk.ty - walk.fy) * p;
    if (p < 0.5) heroFrame = G.steps % 2 ? 1 : 2; // alternate feet each step
  } else { heroDraw.x = G.pos.x * 16; heroDraw.y = G.pos.y * 16; }
  const mdt = Math.min(0.1, (now - (drawMap.last || now)) / 1000);
  drawMap.last = now;
  const camX = Math.round(clamp(heroDraw.x + 8 - 120, 0, Math.max(0, FL.w * 16 - 240)));
  const camY = Math.round(clamp(heroDraw.y + 8 - 80, 0, Math.max(0, FL.h * 16 - 160)));
  const x0 = Math.floor(camX / 16), y0 = Math.floor(camY / 16);
  ctx.fillStyle = '#0a0712'; ctx.fillRect(0, 0, 240, 160);
  for (let y = y0; y <= y0 + 11; y++) for (let x = x0; x <= x0 + 16; x++) drawTile(x, y, x * 16 - camX, y * 16 - camY);
  const bob = (frame >> 4) % 2;
  const onScreen = (p) => p.x >= x0 - 1 && p.x <= x0 + 16 && p.y >= y0 - 1 && p.y <= y0 + 11;
  const draw = (img, x, y, dy = 0) => ctx.drawImage(img, Math.round(x - camX), Math.round(y - camY + dy));
  for (const c of FL.chests) if (onScreen(c) && !G.opened.includes(c.id) && seen(c.x, c.y)) draw(boxSprite(c.tier), c.x * 16, c.y * 16);
  for (const b of FL.benches) if (onScreen(b) && seen(b.x, b.y)) {
    ctx.fillStyle = '#5b3a29'; ctx.fillRect(b.x * 16 - camX + 1, b.y * 16 - camY + 6, 14, 6);
    ctx.fillStyle = '#b8693a'; ctx.fillRect(b.x * 16 - camX + 1, b.y * 16 - camY + 5, 14, 2);
    ctx.fillStyle = '#8b84a3'; ctx.fillRect(b.x * 16 - camX + 4, b.y * 16 - camY + 2, 3, 3);
  }
  for (const b of FL.booths) if (onScreen(b) && seen(b.x, b.y)) draw(sprite('bookie'), b.x * 16, b.y * 16, bob);
  for (const b of FL.shops || []) if (onScreen(b) && seen(b.x, b.y)) draw(sprite('shop'), b.x * 16, b.y * 16, 0);
  if (onScreen(FL.doc) && seen(FL.doc.x, FL.doc.y)) draw(docSprite(), FL.doc.x * 16, FL.doc.y * 16);
  for (const b of FL.bosses) if (onScreen(b) && !G.bossesDead.includes(b.id) && seen(b.x, b.y)) draw(sprite(BOSSES[b.type].sprite), b.x * 16, b.y * 16, bob);
  // Characters are drawn back to front so nearer ones overlap farther ones, each on a soft shadow.
  const actors = [];
  const glide = 16 / (stepDur() / 1000) * mdt;
  for (const m of mobsLive) {
    if (m.px === undefined || Math.abs(m.px - m.x * 16) > 32 || Math.abs(m.py - m.y * 16) > 32) { m.px = m.x * 16; m.py = m.y * 16; }
    const ddx = m.x * 16 - m.px, ddy = m.y * 16 - m.py;
    if (ddx) { m.faceLeft = ddx < 0; m.px += Math.sign(ddx) * Math.min(Math.abs(ddx), glide); }
    if (ddy) m.py += Math.sign(ddy) * Math.min(Math.abs(ddy), glide);
    if (!onScreen(m) || (!seen(m.x, m.y) && !(G.radar > 0))) continue;
    actors.push({ y: m.py, fn: () => {
      const lead = m.members[0];
      const moving = ddx || ddy;
      const img = mobSprite(MOBS[lead.type].sprite, lead.traits);
      shadow(m.px - camX, m.py - camY);
      draw(m.faceLeft ? flipped(img) : img, m.px, m.py, moving ? -1 : ((frame >> 5) + m.id.length) % 2);
      if (m.elite) { ctx.fillStyle = '#f5c542'; ctx.fillRect(Math.round(m.px - camX) + 6, Math.round(m.py - camY) - 2, 4, 2); }
      if (m.members.length > 1) { ctx.fillStyle = '#1a1426'; ctx.fillRect(Math.round(m.px - camX) + 10, Math.round(m.py - camY), 7, 7); ctx.fillStyle = '#ff5fa2'; ctx.font = '7px monospace'; ctx.fillText('' + m.members.length, Math.round(m.px - camX) + 11, Math.round(m.py - camY) + 6); }
    } });
  }
  actors.push({ y: heroDraw.y, fn: () => { shadow(heroDraw.x - camX, heroDraw.y - camY); draw(heroSprite(race(), cls(), face, heroFrame, G.sex), heroDraw.x, heroDraw.y, heroFrame ? -1 : 0); } });
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.fn());
  drawMiniMap();
}

// The mini map: the area around you. Safe rooms are always marked. Mobs show only with Mob Radar.
function drawMiniMap() {
  const MW = 52, MH = 34, sx = 240 - MW - 3, sy = 3;
  const ox = clamp(G.pos.x - (MW >> 1), 0, Math.max(0, FL.w - MW)), oy = clamp(G.pos.y - (MH >> 1), 0, Math.max(0, FL.h - MH));
  ctx.fillStyle = 'rgba(10,7,18,0.82)'; ctx.fillRect(sx - 1, sy - 1, MW + 2, MH + 2);
  ctx.fillStyle = '#5a5373'; ctx.fillRect(sx - 2, sy - 2, MW + 4, 1); ctx.fillRect(sx - 2, sy + MH + 1, MW + 4, 1); ctx.fillRect(sx - 2, sy - 2, 1, MH + 4); ctx.fillRect(sx + MW + 1, sy - 2, 1, MH + 4);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const gx = ox + x, gy = oy + y;
    if (gx >= FL.w || gy >= FL.h) continue;
    const t = FL.tiles[gy * FL.w + gx];
    if (t === T.WALL) continue;
    if (t === T.SAFE) ctx.fillStyle = '#b8693a';
    else if (!SEEN[gy * FL.w + gx]) continue;
    else if (t === T.STAIRS) ctx.fillStyle = '#f5c542';
    else ctx.fillStyle = '#8b84a3';
    ctx.fillRect(sx + x, sy + y, 1, 1);
  }
  const inMini = (p) => p.x >= ox && p.x < ox + MW && p.y >= oy && p.y < oy + MH;
  for (const b of FL.bosses) if (!G.bossesDead.includes(b.id) && seen(b.x, b.y) && inMini(b)) { ctx.fillStyle = '#c8334a'; ctx.fillRect(sx + b.x - ox - 1, sy + b.y - oy - 1, 3, 3); }
  if (guidePath) {
    ctx.fillStyle = '#b8e05a';
    for (const i of guidePath) { const gx = i % FL.w, gy = (i / FL.w) | 0; if (inMini({ x: gx, y: gy })) ctx.fillRect(sx + gx - ox, sy + gy - oy, 1, 1); }
    const gb = guideBoss();
    if (gb && inMini(gb)) { ctx.fillStyle = '#c8334a'; ctx.fillRect(sx + gb.x - ox - 1, sy + gb.y - oy - 1, 3, 3); }
  }
  if (G.radar > 0 && (frame >> 3) % 2) { ctx.fillStyle = '#ff5fa2'; for (const m of mobsLive) if (inMini(m)) ctx.fillRect(sx + m.x - ox, sy + m.y - oy, 1, 1); }
  if ((frame >> 4) % 2 === 0) { ctx.fillStyle = '#4fd8e8'; ctx.fillRect(sx + G.pos.x - ox - 1, sy + G.pos.y - oy - 1, 3, 3); }
}

function drawFx() {
  const now = performance.now();
  if (FX.proj) {
    const p = FX.proj;
    const t = (now - p.t0) / p.dur;
    if (t >= 1) p.finish();
    else {
      const x = p.x0 + (p.x1 - p.x0) * t, y = p.y0 + (p.y1 - p.y0) * t - Math.sin(Math.PI * t) * (p.kind === 'bolt' ? 4 : 22);
      ctx.fillStyle = p.color;
      const spin = Math.floor(t * 8) % 2;
      if (p.kind === 'blob') { ctx.fillRect(x - 3, y - 2, 6, 4); ctx.fillRect(x - 2, y - 3, 4, 6); ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 1, y - 2, 1, 1); }
      else if (p.kind === 'bone') { if (spin) { ctx.fillRect(x - 5, y - 1, 10, 2); ctx.fillRect(x - 6, y - 2, 2, 4); ctx.fillRect(x + 4, y - 2, 2, 4); } else { ctx.fillRect(x - 1, y - 5, 2, 10); ctx.fillRect(x - 2, y - 6, 4, 2); ctx.fillRect(x - 2, y + 4, 4, 2); } }
      else if (p.kind === 'tickets') { for (let i = 0; i < 3; i++) ctx.fillRect(x - 6 + i * 5, y - 3 + (i % 2) * 4, 4, 3); }
      else if (p.kind === 'bar') { if (spin) ctx.fillRect(x - 7, y - 1, 14, 3); else ctx.fillRect(x - 1, y - 7, 3, 14); }
      else if (p.kind === 'junk') { ctx.fillRect(x - 4, y - 4, 4, 4); ctx.fillStyle = '#8b84a3'; ctx.fillRect(x + 1, y - 1, 3, 3); ctx.fillStyle = '#c8334a'; ctx.fillRect(x - 3, y + 2, 3, 2); }
      else if (p.kind === 'fist') { ctx.fillRect(x - 3, y - 3, 7, 6); ctx.fillStyle = '#1a1426'; ctx.fillRect(x - 3, y - 1, 7, 1); }
      else if (p.kind === 'bomb') { ctx.fillRect(x - 3, y - 3, 6, 6); ctx.fillStyle = '#ff5fa2'; ctx.fillRect(x + 2, y - 5, 2, 2); }
      else if (p.kind === 'bolt') { ctx.fillRect(x - 3, y - 3, 6, 6); ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 1, y - 1, 2, 2); ctx.globalAlpha = 0.5; ctx.fillStyle = p.color; ctx.fillRect(x - 8 * Math.sign(p.x1 - p.x0), y - 1, 5, 2); ctx.globalAlpha = 1; }
      else ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
  FX.bursts = FX.bursts.filter((b) => now - b.t0 < 320);
  for (const b of FX.bursts) {
    const t = (now - b.t0) / 320;
    ctx.fillStyle = b.color;
    const r = 4 + t * 12;
    if (b.kind === 'slash') { for (let i = 0; i < 12; i++) { ctx.fillRect(b.x - 12 + i * 2, b.y - 12 + i * 2, 2, 2); ctx.fillRect(b.x - 6 + i * 2, b.y - 14 + i * 2, 1, 1); } }
    else if (b.kind === 'boom') { ctx.globalAlpha = 1 - t; for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4; ctx.fillRect(b.x + Math.cos(ang) * r - 2, b.y + Math.sin(ang) * r - 2, 4, 4); } ctx.globalAlpha = 1; }
    else if (b.kind === 'zap') { for (let i = 0; i < 6; i++) ctx.fillRect(b.x - 2 + ((i % 2) ? 3 : -3), b.y - 30 + i * 6, 3, 6); }
    else if (b.kind === 'shield') { ctx.globalAlpha = 1 - t; ctx.fillRect(b.x - r, b.y - 18, 2, 30); ctx.fillRect(b.x + r, b.y - 18, 2, 30); ctx.globalAlpha = 1; }
    else if (b.kind === 'sparkle') { for (let i = 0; i < 6; i++) ctx.fillRect(b.x - 14 + i * 6, b.y - 10 - t * 16 + (i % 2) * 6, 2, 2); }
    else { ctx.fillRect(b.x - r / 2, b.y - 1, r, 2); ctx.fillRect(b.x - 1, b.y - r / 2, 2, r); }
  }
  FX.pops = FX.pops.filter((p) => now - p.t0 < 800);
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  for (const p of FX.pops) {
    const t = (now - p.t0) / 800;
    const y = Math.round(p.y - t * 14);
    ctx.fillStyle = '#1a1426';
    ctx.fillText(p.text, Math.round(p.x) + 1, y + 1);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, Math.round(p.x), y);
  }
}

function drawBattle() {
  const grd = ctx.createLinearGradient(0, 0, 0, 160);
  grd.addColorStop(0, '#241a36'); grd.addColorStop(0.55, '#3b2a4d'); grd.addColorStop(0.56, '#4a3d63'); grd.addColorStop(1, '#3b2a4d');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 240, 160);
  ctx.fillStyle = '#5a5373';
  ellipse(170, 74, 64, 9);
  ellipse(52, 140, 48, 9);
  for (const e of B.enemies) {
    if (!e.alive && !e.flash) continue;
    const { x, y, size } = enemyBox(e);
    if (e.flash > 0) e.flash--;
    if (e.flash % 4 < 2) {
      ctx.drawImage(e.boss ? sprite(e.sprite) : mobSprite(e.sprite, e.traits), x, y + ((frame >> 4) % 2), size, size);
      if (e.frozen > 0) { ctx.globalAlpha = 0.4; ctx.fillStyle = '#4fd8e8'; ctx.fillRect(x + 2, y + 2, size - 4, size - 4); ctx.globalAlpha = 1; }
    }
    if (e.alive) {
      // HP numbers, then the health bar, then the XP the mob is worth.
      ctx.fillStyle = '#1a1426'; ctx.fillRect(x + 2, y + size + 9, size - 4, 4);
      ctx.fillStyle = e.hp / e.maxHp > 0.35 ? '#6bbf59' : '#c8334a';
      ctx.fillRect(x + 3, y + size + 10, Math.max(0, (size - 6) * (e.hp / e.maxHp)), 2);
      if (B.phase === 'target') { ctx.fillStyle = '#4fd8e8'; ctx.fillRect(x + size / 2 - 3, y - 6 - ((frame >> 3) % 2), 6, 3); ctx.fillRect(x + size / 2 - 1, y - 3 - ((frame >> 3) % 2), 2, 2); }
      if (e.elite) { ctx.fillStyle = '#f5c542'; ctx.fillRect(x + size / 2 - 4, y - 2, 8, 2); }
      ctx.font = '8px Tiny5, monospace'; ctx.textAlign = 'left';
      const lines = [[Math.max(0, e.hp) + '/' + e.maxHp + ' HP', '#fff6e0', 7], [xpFor(e) + ' XP', '#f5c542', 21]];
      for (const [t, col, dy] of lines) {
        const tx = Math.round(x + size / 2 - ctx.measureText(t).width / 2), ty = Math.round(y + size + dy);
        ctx.fillStyle = '#1a1426'; ctx.fillText(t, tx + 1, ty + 1); ctx.fillStyle = col; ctx.fillText(t, tx, ty);
      }
      if (e.intent === 'heavy' && (frame >> 3) % 2) { ctx.fillStyle = '#ff5fa2'; ctx.fillRect(x + size - 4, y, 2, 6); ctx.fillRect(x + size - 4, y + 8, 2, 2); }
    }
  }
  if (FX.heroFlash > 0) FX.heroFlash--;
  if (FX.heroFlash % 4 < 2) ctx.drawImage(heroSprite(race(), cls(), 'right', 0, G.sex), 28, 92, 48, 48);
  drawFx();
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
let calmT = 0, regenAcc = 0; // seconds since the last fight, and partial HP healed
let hudTick = 0;
function loop(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  frame++;
  ctx.imageSmoothingEnabled = false;
  if (mode === 'map' && G && FL) {
    if (canAct()) {
      G.playTime += dt;
      if (G.potionCd > 0) G.potionCd = Math.max(0, G.potionCd - dt);
      // Out-of-combat healing, like most action RPGs: waits 5 seconds after a fight, eases in, then heals
      // about 1 HP a second (1% of max HP a second once your max HP passes 100).
      calmT += dt;
      if (calmT > 5 && G.hp > 0) {
        const max = stats().maxHp;
        if (G.hp < max) {
          const ease = Math.min(1, 0.5 + (calmT - 5) / 10);
          regenAcc += dt * Math.max(1, max / 100) * ease;
          if (regenAcc >= 1) { const h = Math.floor(regenAcc); regenAcc -= h; G.hp = Math.min(max, G.hp + h); }
        } else regenAcc = 0;
      }
      if (G.guide > 0) {
        G.guide -= dt;
        if (G.guide <= 0) { G.guide = 0; guidePath = null; say('Your Boss Compass wore off.'); updateHud(); }
        else updateGuide();
      }
      if (G.radar > 0) {
        G.radar -= dt;
        if (G.radar <= 0) { G.radar = 0; say('Your Mob Radar wore off.'); updateHud(); }
      }
      if (!FL.tutorial) {
        G.respawnT += dt;
        if (G.respawnT >= 90) { G.respawnT = 0; respawnMobs(); }
      }
      hudTick += dt;
      if (hudTick > 0.5) { hudTick = 0; updateHud(); }
      // Start the next step right as the current one finishes. Bumping a wall just turns you.
      if (moveHeld && !walking(now) && now - lastStep > 60) { lastStep = now; tryStep(moveHeld); }
      else if (!moveHeld && !walking(now)) lastStep = 0;
    }
    if (mode === 'map') drawMap();
  } else if (mode === 'battle' && B) {
    drawBattle();
  } else drawIdle();
  requestAnimationFrame(loop);
}

showTitle();
requestAnimationFrame(loop);

// For automated tests.
window.__longodds = { get guidePath() { return guidePath; }, get G() { return G; }, get FL() { return FL; }, get mode() { return mode; }, get B() { return B; }, mobsLive: () => mobsLive, seen: (x, y) => seen(x, y) };

// Tapping the mini map opens the full-screen map.
canvas.addEventListener('click', (e) => {
  if (mode !== 'map' || !canAct()) return;
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) * 240) / r.width, y = ((e.clientY - r.top) * 160) / r.height;
  if (x >= 240 - 52 - 10 && y <= 34 + 10) openFullMap();
});

// ---------- Suggestions box ----------
// Players send ideas and bug reports. Web3Forms emails them to the game owner without
// showing the owner's address. If sending fails or no key is set yet, the suggestion
// waits on this device and is sent next time the game opens.
const SUG_QUEUE = 'longodds.suggestions';
let sugState = { from: 'title', msg: '', kind: 'Idea' };
function sugQueue() { try { return JSON.parse(localStorage.getItem(SUG_QUEUE) || '[]'); } catch { return []; } }
function setSugQueue(q) { try { localStorage.setItem(SUG_QUEUE, JSON.stringify(q)); } catch { /* storage blocked */ } }
async function sendSuggestion(sg) {
  if (!SUGGEST_KEY) return false;
  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: SUGGEST_KEY,
        subject: `Long Odds ${sg.kind}: ${sg.text.slice(0, 50)}`,
        from_name: sg.name || 'A Long Odds player',
        kind: sg.kind,
        message: sg.text,
        player: sg.name || '(no name given)',
        build: sg.build,
        where: sg.where,
        sent: sg.at,
        botcheck: '',
      }),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success !== false;
  } catch { return false; }
}
async function flushSuggestions() {
  const q = sugQueue();
  if (!q.length || !SUGGEST_KEY) return;
  const left = [];
  for (const sg of q) if (!(await sendSuggestion(sg))) left.push(sg);
  setSugQueue(left);
}
function openSuggest(from) {
  sugState = { ...sugState, from, msg: '' };
  renderSuggest();
}
function renderSuggest() {
  const kinds = ['Idea', 'Bug', 'Balance', 'Other'];
  showOverlay(`
    <h2>SUGGESTIONS BOX</h2>
    <div class="bookie"><img src="${sprite('bookie').toDataURL()}" alt=""><p><b style="color:var(--pink)">BOOKIE:</b> Got an idea, a bug, or a complaint about the odds? It goes straight to the people who make this show.</p></div>
    <label>What kind?</label>
    <div class="tabs">${kinds.map((k) => `<button class="tab ${sugState.kind === k ? 'on' : ''}" data-act="sugkind" data-id="${k}">${k}</button>`).join('')}</div>
    <label for="sugtext">Your suggestion</label>
    <textarea id="sugtext" maxlength="1500" rows="6" placeholder="Tell us what you'd add, change or fix.">${esc(sugState.draft || '')}</textarea>
    <label for="sugname">Your name (optional)</label>
    <input id="sugname" type="text" maxlength="30" autocomplete="off" value="${esc(sugState.name || '')}" placeholder="Leave blank to stay anonymous">
    ${sugState.msg ? `<p class="note ${sugState.ok ? 'good' : ''}">${esc(sugState.msg)}</p>` : ''}
    <div class="grid2"><button class="btn grey" data-act="sugback">BACK</button><button class="btn green" data-act="sugsend">SEND</button></div>`);
  const ta = $('sugtext'), nm = $('sugname');
  ta.addEventListener('input', () => { sugState.draft = ta.value; });
  nm.addEventListener('input', () => { sugState.name = nm.value; });
}
Object.assign(overlayHandlers, {
  suggest: () => openSuggest(mode === 'map' ? 'menu' : 'title'),
  sugkind: (_, b) => { sugState.kind = b.dataset.id; renderSuggest(); },
  sugback: () => { sugState.msg = ''; if (sugState.from === 'menu') openMenu(); else showTitle(); },
  sugsend: async (_, b) => {
    const text = (sugState.draft || '').trim();
    if (text.length < 3) { sugState.msg = 'Write a little more first.'; sugState.ok = false; return renderSuggest(); }
    b.disabled = true; b.textContent = 'SENDING...';
    const sg = {
      kind: sugState.kind, text, name: (sugState.name || '').trim(), build: VERSION, at: new Date().toISOString(),
      where: G ? `${G.floor === 0 ? 'Tutorial' : 'Floor ' + G.floor}, level ${G.lvl} ${race().name} ${cls().name}` : 'Title screen',
    };
    const sent = await sendSuggestion(sg);
    if (!sent) setSugQueue(sugQueue().concat(sg));
    sugState.draft = '';
    sugState.ok = true;
    sugState.msg = sent ? 'Sent! Thank you. Every suggestion gets read.' : 'Saved! It will be sent automatically the next time you open the game.';
    renderSuggest();
  },
});
flushSuggestions();
