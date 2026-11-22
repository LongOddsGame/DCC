// Builds a random floor from a seed: rooms, corridors, a safe room, chests, mobs and the boss.
import { makeRng } from './rng.js?v=__BUILD_VERSION__';
import { MOBS, TRAITS, FLOOR_RULES } from './data.js?v=__BUILD_VERSION__';

export const T = { WALL: 0, FLOOR: 1, SAFE: 2, STAIRS: 3 };
export const W = 40;
export const H = 30;

export function generateFloor(seed, floor, opts = {}) {
  const rng = makeRng(seed + floor * 7919);
  const tiles = new Uint8Array(W * H);
  const at = (x, y) => tiles[y * W + x];
  const set = (x, y, v) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) tiles[y * W + x] = v; };

  // 1. Rooms that don't overlap.
  const rooms = [];
  for (let tries = 0; tries < 200 && rooms.length < 9; tries++) {
    const w = rng.int(5, 9), h = rng.int(4, 7);
    const x = rng.int(1, W - w - 2), y = rng.int(1, H - h - 2);
    const r = { x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) };
    if (rooms.some((o) => x - 2 < o.x + o.w && x + w + 2 > o.x && y - 2 < o.y + o.h && y + h + 2 > o.y)) continue;
    rooms.push(r);
  }
  if (rooms.length < 6) return generateFloor(seed + 101, floor, opts);
  for (const r of rooms) for (let yy = r.y; yy < r.y + r.h; yy++) for (let xx = r.x; xx < r.x + r.w; xx++) set(xx, yy, T.FLOOR);

  // 2. Corridors: chain the rooms in order of x, then add a couple of loops.
  const ordered = rooms.slice().sort((a, b) => a.cx - b.cx);
  const dig = (a, b) => {
    let x = a.cx, y = a.cy;
    const horizFirst = rng.chance(0.5);
    const stepX = () => { while (x !== b.cx) { set(x, y, T.FLOOR); x += Math.sign(b.cx - x); } };
    const stepY = () => { while (y !== b.cy) { set(x, y, T.FLOOR); y += Math.sign(b.cy - y); } };
    if (horizFirst) { stepX(); stepY(); } else { stepY(); stepX(); }
    set(x, y, T.FLOOR);
  };
  for (let i = 1; i < ordered.length; i++) dig(ordered[i - 1], ordered[i]);
  for (let i = 0; i < 2 && ordered.length > 3; i++) dig(rng.pick(ordered), rng.pick(ordered));

  // 3. Distances from the start room, to place the boss far away and the safe room in the middle.
  const start = ordered[0];
  const dist = new Int32Array(W * H).fill(-1);
  const q = [[start.cx, start.cy]];
  dist[start.cy * W + start.cx] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (at(nx, ny) === T.WALL || dist[ny * W + nx] >= 0) continue;
      dist[ny * W + nx] = dist[y * W + x] + 1;
      q.push([nx, ny]);
    }
  }
  const byDist = ordered.slice(1).sort((a, b) => dist[a.cy * W + a.cx] - dist[b.cy * W + b.cx]);
  const bossRoom = byDist[byDist.length - 1];
  const safeRoom = byDist[Math.floor((byDist.length - 1) / 2)];
  for (let yy = safeRoom.y; yy < safeRoom.y + safeRoom.h; yy++) for (let xx = safeRoom.x; xx < safeRoom.x + safeRoom.w; xx++) set(xx, yy, T.SAFE);

  const stairs = { x: bossRoom.x + bossRoom.w - 2, y: bossRoom.cy };
  set(stairs.x, stairs.y, T.STAIRS);
  const boss = { x: stairs.x - 1, y: stairs.y };
  const doc = { x: safeRoom.cx, y: safeRoom.y + 1 };
  const booth = { x: Math.min(safeRoom.cx + 2, safeRoom.x + safeRoom.w - 1), y: safeRoom.y + 1 };
  const bench = { x: Math.max(safeRoom.cx - 2, safeRoom.x), y: safeRoom.y + 1 };

  const taken = new Set([key(stairs), key(boss), key(doc), key(booth), key(bench), key({ x: start.cx, y: start.cy })]);
  const freeSpot = (room) => {
    for (let i = 0; i < 40; i++) {
      const p = { x: rng.int(room.x, room.x + room.w - 1), y: rng.int(room.y, room.y + room.h - 1) };
      if (at(p.x, p.y) !== T.WALL && !taken.has(key(p))) { taken.add(key(p)); return p; }
    }
    return null;
  };
  const fightRooms = ordered.filter((r) => r !== start && r !== safeRoom);

  // 4. Chests.
  const chests = [];
  const chestCount = 5 + (opts.extraChest ? 1 : 0);
  for (let i = 0; i < chestCount; i++) {
    const p = freeSpot(rng.pick(fightRooms.concat([start])));
    if (!p) continue;
    let tier = 'box_rusty';
    if (i === 0) tier = 'box_silver';
    else if (rng.chance(0.08)) tier = 'box_gold';
    else if (rng.chance(0.2)) tier = 'box_silver';
    chests.push({ id: 'c' + i, x: p.x, y: p.y, tier });
  }

  // 5. Mob groups with random traits. One elite group with three traits.
  const types = Object.keys(MOBS);
  const traitIds = Object.keys(TRAITS);
  const mobs = [];
  const groupCount = 9;
  for (let i = 0; i < groupCount; i++) {
    const room = rng.pick(fightRooms.filter((r) => r !== bossRoom).concat([bossRoom]));
    const p = freeSpot(room);
    if (!p) continue;
    const roll = rng.next();
    const size = roll < 0.5 ? 1 : roll < 0.85 ? 2 : 3;
    const elite = i === 0;
    const members = [];
    for (let m = 0; m < size; m++) {
      const tr = rng.next();
      const n = elite && m === 0 ? 3 : tr < 0.55 ? 0 : tr < 0.9 ? 1 : 2;
      members.push({ type: rng.pick(types), traits: rng.shuffle(traitIds).slice(0, n), elite: elite && m === 0 });
    }
    mobs.push({ id: 'm' + i, x: p.x, y: p.y, members, elite });
  }

  // 6. Decorations: puddles, cracks and litter on floor tiles.
  const decor = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (tiles[i] === T.FLOOR && rng.chance(0.07)) decor[i] = rng.int(1, 3);

  const rule = rng.pick(FLOOR_RULES);
  return { w: W, h: H, tiles, decor, rooms, start: { x: start.cx, y: start.cy }, stairs, boss, doc, booth, bench, safeRoom, chests, mobs, rule };
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
