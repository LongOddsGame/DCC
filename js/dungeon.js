// Builds a big random floor from a seed: a grid of rooms joined by paths, many safe rooms,
// chests, mob groups that get tougher the farther you go, and two boss rooms.
import { makeRng } from './rng.js?v=__BUILD_VERSION__';
import { MOBS, TRAITS, FLOOR_RULES } from './data.js?v=__BUILD_VERSION__';

export const T = { WALL: 0, FLOOR: 1, SAFE: 2, STAIRS: 3 };
export const FLOOR_SIZE = 500;   // tiles per side
const CELL = 18;                 // each cell of the grid holds one room or a crossing

export function generateFloor(seed, floor, opts = {}) {
  const N = opts.size || FLOOR_SIZE;
  const rng = makeRng(seed + floor * 7919);
  const W = N, H = N;
  const tiles = new Uint8Array(W * H);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.WALL : tiles[y * W + x]);
  const set = (x, y, v) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) tiles[y * W + x] = v; };

  // 1. One room (or a small crossing) per grid cell.
  const cols = Math.floor((W - 2) / CELL), rows = Math.floor((H - 2) / CELL);
  const nodes = [];
  const rooms = [];
  for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
    const ox = 1 + cx * CELL, oy = 1 + cy * CELL;
    let node;
    if (rng.chance(0.78)) {
      const w = rng.int(5, 12), h = rng.int(4, 9);
      const x = ox + rng.int(2, CELL - w - 2), y = oy + rng.int(2, CELL - h - 2);
      const r = { x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) };
      rooms.push(r);
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, T.FLOOR);
      node = { x: r.cx, y: r.cy };
    } else {
      node = { x: ox + rng.int(4, CELL - 5), y: oy + rng.int(4, CELL - 5) };
      set(node.x, node.y, T.FLOOR);
    }
    nodes.push(node);
  }
  const nodeAt = (cx, cy) => nodes[cy * cols + cx];

  // 2. Paths: a random maze over the grid so everything connects, plus some loops.
  const dig = (a, b) => {
    let x = a.x, y = a.y;
    const stepX = () => { while (x !== b.x) { set(x, y, T.FLOOR); x += Math.sign(b.x - x); } };
    const stepY = () => { while (y !== b.y) { set(x, y, T.FLOOR); y += Math.sign(b.y - y); } };
    if (rng.chance(0.5)) { stepX(); stepY(); } else { stepY(); stepX(); }
    set(x, y, T.FLOOR);
  };
  const visited = new Uint8Array(cols * rows);
  const stack = [[rng.int(0, cols - 1), rng.int(0, rows - 1)]];
  visited[stack[0][1] * cols + stack[0][0]] = 1;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const next = rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])
      .map(([dx, dy]) => [cx + dx, cy + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited[ny * cols + nx]);
    if (!next.length) { stack.pop(); continue; }
    const [nx, ny] = next[0];
    visited[ny * cols + nx] = 1;
    dig(nodeAt(cx, cy), nodeAt(nx, ny));
    stack.push([nx, ny]);
  }
  for (let i = 0; i < cols * rows * 0.18; i++) {
    const cx = rng.int(0, cols - 1), cy = rng.int(0, rows - 1);
    const [dx, dy] = rng.pick([[1, 0], [0, 1]]);
    if (cx + dx < cols && cy + dy < rows) dig(nodeAt(cx, cy), nodeAt(cx + dx, cy + dy));
  }

  // 3. Start in the room closest to the middle. Measure walking distance to every tile.
  const mid = N / 2;
  const start = rooms.slice().sort((a, b) => Math.hypot(a.cx - mid, a.cy - mid) - Math.hypot(b.cx - mid, b.cy - mid))[0];
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
  const others = rooms.filter((r) => r !== start && rd(r) > 0);

  // 4. Two boss rooms: the farthest room, then a room far from both the start and boss 1.
  const bossRoom = others.slice().sort((a, b) => rd(b) - rd(a))[0];
  const score2 = (r) => Math.min(rd(r), 2 * (Math.abs(r.cx - bossRoom.cx) + Math.abs(r.cy - bossRoom.cy)));
  const boss2Room = others.filter((r) => r !== bossRoom).sort((a, b) => score2(b) - score2(a))[0];
  const stairs = { x: bossRoom.x + bossRoom.w - 2, y: bossRoom.cy };
  set(stairs.x, stairs.y, T.STAIRS);
  const bosses = [
    { id: 'b1', type: 'king', x: stairs.x - 1, y: stairs.y },
    { id: 'b2', type: 'hoarder', x: boss2Room.cx, y: boss2Room.cy },
  ];

  // 5. Lots of safe rooms: one right next to the start, then one roughly every 75 tiles.
  const safeRooms = [];
  const near = others.slice().sort((a, b) => rd(a) - rd(b));
  safeRooms.push(near[0]);
  for (const r of rng.shuffle(others)) {
    if (r === bossRoom || r === boss2Room || safeRooms.includes(r)) continue;
    if (safeRooms.every((s) => Math.abs(s.cx - r.cx) + Math.abs(s.cy - r.cy) > 75)) safeRooms.push(r);
  }
  for (const sr of safeRooms) for (let yy = sr.y; yy < sr.y + sr.h; yy++) for (let xx = sr.x; xx < sr.x + sr.w; xx++) set(xx, yy, T.SAFE);
  const safeRoom = safeRooms[0];
  const doc = { x: safeRoom.cx, y: safeRoom.y + 1 };
  const booths = safeRooms.map((r) => ({ x: Math.min(r.cx + 2, r.x + r.w - 1), y: r.y + 1 }));
  const benches = safeRooms.map((r) => ({ x: Math.max(r.cx - 2, r.x), y: r.y + 1 }));
  // Penny's shop sits in a corner, away from the center lines the paths come in on.
  const shops = safeRooms.filter((r) => r.w >= 3 && r.h >= 3).map((r) => ({ x: r.x + r.w - 1, y: r.y + r.h - 1 }));

  const taken = new Set([key(stairs), ...bosses.map(key), key(doc), ...booths.map(key), ...benches.map(key), ...shops.map(key), key({ x: start.cx, y: start.cy })]);
  const freeSpot = (room) => {
    for (let i = 0; i < 40; i++) {
      const p = { x: rng.int(room.x, room.x + room.w - 1), y: rng.int(room.y, room.y + room.h - 1) };
      if (at(p.x, p.y) === T.FLOOR && !taken.has(key(p))) { taken.add(key(p)); return p; }
    }
    return null;
  };
  const fightRooms = others.filter((r) => !safeRooms.includes(r));
  const far = Math.max(1, rd(bossRoom));

  // 6. Chests: better boxes the farther you go.
  const chests = [];
  let ci = 0;
  for (const r of fightRooms) {
    if (!rng.chance(0.5)) continue;
    const p = freeSpot(r);
    if (!p) continue;
    const depth = rd(r) / far;
    let tier = 'box_rusty';
    if (rng.chance(0.04 + depth * 0.12)) tier = 'box_gold';
    else if (rng.chance(0.15 + depth * 0.3)) tier = 'box_silver';
    chests.push({ id: 'c' + ci++, x: p.x, y: p.y, tier });
  }
  if (opts.extraChest) {
    for (const r of near.slice(1, 6)) {
      const p = freeSpot(r);
      if (p) chests.push({ id: 'c' + ci++, x: p.x, y: p.y, tier: 'box_rusty' });
    }
  }

  // 7. Mob groups: more traits, bigger groups and more elites deeper in.
  const types = Object.keys(MOBS);
  const traitIds = Object.keys(TRAITS);
  const mobs = [];
  let mi = 0;
  for (const r of fightRooms) {
    if (r !== bossRoom && r !== boss2Room && !rng.chance(0.7)) continue;
    const p = freeSpot(r);
    if (!p) continue;
    const depth = rd(r) / far;
    mobs.push({ id: 'm' + mi++, x: p.x, y: p.y, depth, ...makeGroup(rng, types, traitIds, depth, rng.chance(0.03 + depth * 0.07)) });
  }

  // 8. Decorations: puddles, cracks and litter.
  const decor = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (tiles[i] === T.FLOOR && rng.chance(0.03)) decor[i] = rng.int(1, 3);

  const rule = rng.pick(FLOOR_RULES);
  return { w: W, h: H, tiles, decor, rooms, start: { x: start.cx, y: start.cy }, stairs, bosses, doc, booths, benches, shops, safeRoom, safeRooms, chests, mobs, rule, far, dist };
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
