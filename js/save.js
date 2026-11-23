// Five save slots kept in the browser on this device.
export const SLOT_COUNT = 5;
const KEY = (i) => 'longodds.slot.' + i;

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }
function safeDel(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }

export function readSlot(i) {
  const raw = safeGet(KEY(i));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function writeSlot(i, data) {
  data.savedAt = Date.now();
  return safeSet(KEY(i), JSON.stringify(data));
}

export function deleteSlot(i) { safeDel(KEY(i)); }

export function listSlots() {
  const out = [];
  for (let i = 0; i < SLOT_COUNT; i++) out.push(readSlot(i));
  return out;
}

// ----- Transfer codes: move a save to another device without a server or login -----
// Code format: LO1<Z|P>.<base64url payload>.<checksum>. Z = deflate compressed, P = plain.
// The checksum is salted, so editing the code by hand (to change stats) makes it fail to load.
const SALT = 'longodds:turnstile:9f3c';
function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
function sum(body) { return fnv(SALT + body) + fnv(body + SALT); }
function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}
export async function exportCode(i) {
  const data = readSlot(i);
  if (!data) return null;
  let bytes = new TextEncoder().encode(JSON.stringify(data)), flag = 'P';
  if (typeof CompressionStream === 'function') {
    try { bytes = await pipe(bytes, new CompressionStream('deflate-raw')); flag = 'Z'; } catch { flag = 'P'; bytes = new TextEncoder().encode(JSON.stringify(data)); }
  }
  const body = 'LO1' + flag + '.' + toB64(bytes);
  return body + '.' + sum(body);
}
// Returns the save data, or throws an Error with a message the player can read.
export async function importCode(code) {
  code = String(code || '').replace(/\s+/g, '');
  const parts = code.split('.');
  if (parts.length !== 3 || !/^LO1[ZP]$/.test(parts[0])) throw new Error('That does not look like a Long Odds transfer code.');
  const body = parts[0] + '.' + parts[1];
  if (sum(body) !== parts[2]) throw new Error('That code is broken or was changed. Copy the whole code again.');
  let bytes;
  try { bytes = fromB64(parts[1]); } catch { throw new Error('That code is broken. Copy the whole code again.'); }
  if (parts[0][3] === 'Z') {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser is too old to read that code. Update it and try again.');
    bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error('That code is broken. Copy the whole code again.'); }
  if (!data || typeof data !== 'object' || !data.name || !data.race || !data.cls) throw new Error('That code has no hero in it.');
  return data;
}
