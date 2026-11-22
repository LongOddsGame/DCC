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
