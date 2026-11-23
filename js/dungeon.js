// Builds a big random floor from a seed: a grid of rooms joined by paths, many safe rooms,
// chests, mob groups that get tougher the farther you go, and two boss rooms.
import { makeRng } from './rng.js?v=__BUILD_VERSION__';
import { MOBS, TRAITS, FLOOR_RULES } from './data.js?v=__BUILD_VERSION__';

export const T = { WALL: 0, FLOOR: 1, SAFE: 2, STAIRS: 3 };
export const STAGES = 4;        // each floor is split into stages joined by locked gates
const CELL = 14;                 // each cell of a stage grid holds one room or a crossing
const SCOLS = 6, SROWS = 4;      // cells per stage: 84 x 56 tiles, small enough to read at a glance
const SW = SCOLS * CELL, SH = SROWS * CELL;

// A floor is 4 stages in a row, left to right. Stages 1 to 3 each end in a gate guarded by a
// gatekeeper. Beat it and the gate opens. Stage 4 holds the two bosses and the stairs down.
export function generateFloor(seed, floor, opts = {}) {
  const rng = makeRng(seed + floor * 7919);
  const W = STAGES * (SW + 2) + 1, H = SH + 2;
  const tiles = new Uint8Array(W * H);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.WALL : tiles[y * W + x]);
  const set = (x, y, v) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) tiles[y * W + x] = v; };
  const dig = (a, b) => {
    let x = a.x, y = a.y;
    const stepX = () => { while (x !== b.x) { set(x, y, T.FLOOR); x += Math.sign(b.x - x); } };
    const stepY = () => { while (y !== b.y) { set(x, y, T.FLOOR); y += Math.sign(b.y - y); } };
    if (rng.chance(0.5)) { stepX(); stepY(); } else { stepY(); stepX(); }
    set(x, y, T.FLOOR);
  };

  const rooms = [];
  const stages = [];
  for (let s = 0; s < STAGES; s++) {
    const sx0 = 1 + s * (SW + 2), sy0 = 1;
    const nodes = [], srooms = [];
    for (let cy = 0; cy < SROWS; cy++) for (let cx = 0; cx < SCOLS; cx++) {
      const ox = sx0 + cx * CELL, oy = sy0 + cy * CELL;
      let node;
      if (rng.chance(0.8)) {
        const w = rng.int(5, 9), h = rng.int(4, 7);
        const x = ox + rng.int(2, CELL - w - 2), y = oy + rng.int(2, CELL - h - 2);
        const r = { x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1), stage: s, col: cx, row: cy };
        srooms.push(r); rooms.push(r);
        for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, T.FLOOR);
        node = { x: r.cx, y: r.cy };
      } else {
        node = { x: ox + rng.int(4, CELL - 5), y: oy + rng.int(4, CELL - 5) };
        set(node.x, node.y, T.FLOOR);
      }
      nodes.push(node);
    }
    const nodeAt = (cx, cy) => nodes[cy * SCOLS + cx];
    // A maze over the stage grid so every room connects, plus a few loops.
    const visited = new Uint8Array(SCOLS * SROWS);
    const stack = [[0, rng.int(0, SROWS - 1)]];
    visited[stack[0][1] * SCOLS] = 1;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const next = rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])
        .map(([dx, dy]) => [cx + dx, cy + dy])
        .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < SCOLS && ny < SROWS && !visited[ny * SCOLS + nx]);
      if (!next.length) { stack.pop(); continue; }
      const [nx, ny] = next[0];
      visited[ny * SCOLS + nx] = 1;
      dig(nodeAt(cx, cy), nodeAt(nx, ny));
      stack.push([nx, ny]);
    }
    for (let i = 0; i < 5; i++) {
      const cx = rng.int(0, SCOLS - 2), cy = rng.int(0, SROWS - 2);
      const [dx, dy] = rng.pick([[1, 0], [0, 1]]);
      dig(nodeAt(cx, cy), nodeAt(cx + dx, cy + dy));
    }
    const entry = srooms.filter((r) => r.col === Math.min(...srooms.map((q) => q.col))).sort((a, b) => Math.abs(a.cy - H / 2) - Math.abs(b.cy - H / 2))[0];
    const exit = srooms.filter((r) => r.col === Math.max(...srooms.map((q) => q.col))).sort((a, b) => Math.abs(a.cy - H / 2) - Math.abs(b.cy - H / 2))[0];
    stages.push({ i: s, x: sx0, y: sy0, w: SW, h: SH, rooms: srooms, entry, exit });
  }

  // Gates: a corridor from each stage's exit room through the wall to the next stage's entry room.
  const gates = [];
  for (let s = 0; s < STAGES - 1; s++) {
    const a = stages[s].exit, b = stages[s + 1].entry;
    const wallX = stages[s].x + SW;          // first wall column between the stages
    const gy = a.cy;
    for (let x = a.x + a.w; x <= wallX + 1; x++) set(x, gy, T.FLOOR);
    dig({ x: wallX + 2, y: gy }, { x: b.cx, y: b.cy });
    gates.push({ id: 'gate' + s, stage: s, x: wallX, y: gy, keeper: 'g' + s });
  }

  // Walking distance from the start to every tile.
  const start = stages[0].entry;
  const dist = new Int32Array(W * H).fill(-1);
  const q = new Int32Array(W * H);
  let qh = 0, qt = 0;
  q[qt++] = start.cy * W + start.cx;
  dist[start.cy * W + start.cx] = 0;
  while (qh < qt) {
    const i = q[qh++];
    const x = i % W;
    const nb = [x < W - 1 ? i + 1 : -1, x > 0 ? i - 1 : -1, i + W < W * H ? i + W : -1, i - W];
    for (const j of nb) {
      if (j < 0 || tiles[j] === T.WALL || dist[j] >= 0) continue;
      dist[j] = dist[i] + 1;
      q[qt++] = j;
    }
  }
  const rd = (r) => dist[r.cy * W + r.cx];

  // Bosses: stage 4's farthest room holds the King and the stairs, another far room holds the Hoarder.
  const last = stages[STAGES - 1];
  const lastRooms = last.rooms.filter((r) => r !== last.entry);
  const bossRoom = lastRooms.slice().sort((a, b) => rd(b) - rd(a))[0];
  const score2 = (r) => Math.min(rd(r) - rd(last.entry), Math.abs(r.cx - bossRoom.cx) + Math.abs(r.cy - bossRoom.cy));
  const boss2Room = lastRooms.filter((r) => r !== bossRoom).sort((a, b) => score2(b) - score2(a))[0];
  const stairs = { x: bossRoom.x + bossRoom.w - 2, y: bossRoom.cy };
  set(stairs.x, stairs.y, T.STAIRS);
  const bosses = [
    { id: 'b1', type: 'king', x: stairs.x - 1, y: stairs.y },
    { id: 'b2', type: 'hoarder', x: boss2Room.cx, y: boss2Room.cy },
  ];

  // Safe rooms: one at the start of every stage, so each new stage begins with a rest stop.
  const safeRooms = [];
  for (const st of stages) {
    const near = st.rooms.filter((r) => r !== st.entry && r !== st.exit && r !== bossRoom && r !== boss2Room).sort((a, b) => rd(a) - rd(b));
    if (near[0]) safeRooms.push(near[0]);
  }
  for (const sr of safeRooms) for (let yy = sr.y; yy < sr.y + sr.h; yy++) for (let xx = sr.x; xx < sr.x + sr.w; xx++) set(xx, yy, T.SAFE);
  const safeRoom = safeRooms[0];
  const doc = { x: safeRoom.cx, y: safeRoom.y + 1 };
  const booths = safeRooms.map((r) => ({ x: Math.min(r.cx + 2, r.x + r.w - 1), y: r.y + 1 }));
  const benches = safeRooms.map((r) => ({ x: Math.max(r.cx - 2, r.x), y: r.y + 1 }));
  const shops = safeRooms.filter((r) => r.w >= 3 && r.h >= 3).map((r) => ({ x: r.x + r.w - 1, y: r.y + r.h - 1 }));

  const taken = new Set([key(stairs), ...bosses.map(key), key(doc), ...booths.map(key), ...benches.map(key), ...shops.map(key), key({ x: start.cx, y: start.cy }), ...gates.map(key)]);
  const freeSpot = (room) => {
    for (let i = 0; i < 40; i++) {
      const p = { x: rng.int(room.x, room.x + room.w - 1), y: rng.int(room.y, room.y + room.h - 1) };
      if (at(p.x, p.y) === T.FLOOR && !taken.has(key(p))) { taken.add(key(p)); return p; }
    }
    return null;
  };
  const types = Object.keys(MOBS);
  const traitIds = Object.keys(TRAITS);
  // Depth goes from 0 at the start to 1 at the bosses, stage by stage.
  const depthOf = (r) => Math.min(1, (r.stage + Math.min(1, (r.col + 0.5) / SCOLS)) / STAGES);

  // Gatekeepers stand right in front of each gate.
  const mobs = [];
  for (const g of gates) {
    const d = (g.stage + 1) / STAGES;
    const grp = makeGroup(rng, types, traitIds, d, true);
    mobs.push({ id: g.keeper, x: g.x - 1, y: g.y, depth: d, still: true, gate: g.stage, ...grp });
    taken.add(key({ x: g.x - 1, y: g.y }));
  }

  const fightRooms = rooms.filter((r) => !safeRooms.includes(r) && r !== start);
  const far = Math.max(1, rd(bossRoom));

  // Chests: better boxes in later stages.
  const chests = [];
  let ci = 0;
  for (const r of fightRooms) {
    if (!rng.chance(0.35)) continue;
    const p = freeSpot(r);
    if (!p) continue;
    const depth = depthOf(r);
    let tier = 'box_rusty';
    if (rng.chance(0.03 + depth * 0.15)) tier = 'box_gold';
    else if (rng.chance(0.12 + depth * 0.35)) tier = 'box_silver';
    chests.push({ id: 'c' + ci++, x: p.x, y: p.y, tier });
  }
  if (opts.extraChest) {
    for (const r of stages[0].rooms.filter((x) => !safeRooms.includes(x)).slice(0, 4)) {
      const p = freeSpot(r);
      if (p) chests.push({ id: 'c' + ci++, x: p.x, y: p.y, tier: 'box_rusty' });
    }
  }

  // Mob groups: more traits, bigger groups and more elites in later stages.
  let mi = 0;
  // Every fight room has mobs, and some get a second group (more mobs, fewer boxes after playtesting).
  for (const r of fightRooms) {
    const groups = 1 + (rng.chance(0.35) ? 1 : 0);
    for (let gi = 0; gi < groups; gi++) {
      const p = freeSpot(r);
      if (!p) continue;
      const depth = depthOf(r);
      mobs.push({ id: 'm' + mi++, x: p.x, y: p.y, depth, ...makeGroup(rng, types, traitIds, depth, rng.chance(0.03 + depth * 0.07)) });
    }
  }

  const decor = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (tiles[i] === T.FLOOR && rng.chance(0.03)) decor[i] = rng.int(1, 3);

  const rule = rng.pick(FLOOR_RULES);
  return { w: W, h: H, tiles, decor, rooms, stages, gates, start: { x: start.cx, y: start.cy }, stairs, bosses, doc, booths, benches, shops, safeRoom, safeRooms, chests, mobs, rule, far, dist };
}

// Which stage (0 to 3) a tile is in.
export function stageAt(fl, x) {
  if (!fl.stages) return 0;
  return Math.max(0, Math.min(fl.stages.length - 1, Math.floor((x - 1) / (SW + 2))));
}

export function makeGroup(rng, types, traitIds, depth, elite) {
  const roll = rng.next();
  const size = roll < 0.5 - depth * 0.2 ? 1 : roll < 0.85 - depth * 0.1 ? 2 : 3;
  const members = [];
  for (let m = 0; m < size; m++) {
    const tr = rng.next() - depth * 0.25;
    const n = elite && m === 0 ? 3 : tr < 0.5 ? 0 : tr < 0.85 ? 1 : 2;
    members.push({ type: rng.pick(types), traits: rng.shuffle(traitIds).slice(0, n), elite: elite && m === 0 });
  }
  return { members, elite };
}

// A small hand-made practice floor for the tutorial.
const TUT = [
  '##########################',
  '#.....#.........#SSSSSS###',
  '#.....#.........#SSSSSS###',
  '#...............SSSSSS..>#',
  '#.....#.........#SSSSSS###',
  '#.....#.........#SSSSSS###',
  '##########################',
];
export function tutorialFloor() {
  const w = TUT[0].length, h = TUT.length;
  const tiles = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = TUT[y][x];
    tiles[y * w + x] = c === '#' ? T.WALL : c === 'S' ? T.SAFE : c === '>' ? T.STAIRS : T.FLOOR;
  }
  const rooms = [
    { x: 1, y: 1, w: 5, h: 5 }, { x: 7, y: 1, w: 9, h: 5 }, { x: 17, y: 1, w: 6, h: 5 }, { x: 23, y: 3, w: 2, h: 1 },
  ];
  const off = { x: -9, y: -9 };
  return {
    w, h, tiles, decor: new Uint8Array(w * h), rooms, start: { x: 2, y: 3 }, stairs: { x: 24, y: 3 }, bosses: [],
    doc: off, booths: [{ x: 19, y: 1 }], benches: [{ x: 17, y: 5 }], shops: [{ x: 22, y: 5 }], safeRoom: rooms[2], safeRooms: [rooms[2]],
    chests: [{ id: 't0', x: 10, y: 2, tier: 'box_silver' }],
    mobs: [{ id: 't1', x: 13, y: 4, members: [{ type: 'rat', traits: ['cowardly'], elite: false, tutorial: true }], elite: false, still: true, depth: 0 }],
    rule: { id: 'tutorial', name: 'Practice', text: 'Nothing here can really hurt you. Probably.' }, tutorial: true, far: 1,
  };
}

export function key(p) { return p.x + ',' + p.y; }

export function walkable(fl, x, y) {
  if (x < 0 || y < 0 || x >= fl.w || y >= fl.h) return false;
  return fl.tiles[y * fl.w + x] !== T.WALL;
}

export function tileAt(fl, x, y) {
  if (x < 0 || y < 0 || x >= fl.w || y >= fl.h) return T.WALL;
  return fl.tiles[y * fl.w + x];
}

// Rooms are stored on a coarse grid lookup so finding the room you're in stays fast on huge floors.
export function roomAt(fl, x, y) {
  if (!fl.roomGrid) {
    fl.roomGrid = new Map();
    for (const r of fl.rooms) {
      for (let gy = Math.floor(r.y / 16); gy <= Math.floor((r.y + r.h - 1) / 16); gy++)
        for (let gx = Math.floor(r.x / 16); gx <= Math.floor((r.x + r.w - 1) / 16); gx++) {
          const k = gx + ',' + gy;
          if (!fl.roomGrid.has(k)) fl.roomGrid.set(k, []);
          fl.roomGrid.get(k).push(r);
        }
    }
  }
  const list = fl.roomGrid.get(Math.floor(x / 16) + ',' + Math.floor(y / 16)) || [];
  return list.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) || null;
}
