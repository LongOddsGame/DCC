// Play stats: hero names, progress and play time, sent to the game owner by email (Web3Forms).
// To stay under Web3Forms' monthly limit, each device sends at most ONE report per day.
// Play is added up on the device. A report goes out when the game is put in the background
// or opened again, once there is at least a minute of unsent play and nothing was sent today.
// Players can turn this off in Settings. Nothing is tracked or sent while it is off.
import { SUGGEST_KEY } from './config.js?v=__BUILD_VERSION__';
import { VERSION } from './version.js?v=__BUILD_VERSION__';

const K_ON = 'longodds.stats.on';
const K_PID = 'longodds.pid';
const K_PEND = 'longodds.stats.pending';
const K_LAST = 'longodds.stats.lastSent';
const K_NAME = 'longodds.playerName';
const MIN_SECONDS = 60;

function get(k) { try { return localStorage.getItem(k); } catch { return null; } }
function set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }
function del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

export function statsOn() { return get(K_ON) !== 'off'; }
export function setStatsOn(on) { set(K_ON, on ? 'on' : 'off'); if (!on) del(K_PEND); }
export function playerName() { return get(K_NAME) || ''; }
export function setPlayerName(n) { set(K_NAME, String(n || '').trim().slice(0, 30)); }

// A random ID made on this device, so repeat players can be counted. It is not tied to who they are.
export function playerId() {
  let id = get(K_PID);
  if (!id) {
    const a = new Uint8Array(4);
    (crypto || window.crypto).getRandomValues(a);
    id = 'P-' + Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    set(K_PID, id);
  }
  return id;
}

function pending() {
  try { return JSON.parse(get(K_PEND) || 'null') || fresh(); } catch { return fresh(); }
}
function fresh() { return { from: today(), sessions: 0, secs: 0, heroes: {} }; }
function savePending(p) { set(K_PEND, JSON.stringify(p)); }

let counted = false;

// Called every few seconds of active play (walking or fighting, not paused) with the seconds played.
// snap() describes the hero right now.
export function trackPlay(G, add, snap) {
  if (!statsOn() || !G || !(add > 0)) return;
  const key = G.slot + ':' + G.seed;
  const p = pending();
  if (!counted) { p.sessions++; counted = true; }
  p.secs += add;
  const now = snap();
  // The hero as they were when this report started, to show what changed.
  const h = p.heroes[key] || { secs: 0, start: { lvl: now.lvl, floor: now.floor, kills: now.kills, spared: now.spared, deaths: now.deaths, boxes: now.boxes, tokens: now.tokens, ach: now.ach } };
  p.heroes[key] = { ...h, ...now, secs: h.secs + add, total: G.playTime };
  savePending(p);
}

function fmt(s) {
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}
function device() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone/iPad';
  if (/Android/.test(ua)) return 'Android';
  return /Mobile/.test(ua) ? 'Phone' : 'Computer';
}

// One hero's block in the email: who they are, where they stand now, and what happened this time.
function heroText(h) {
  const st = h.start || {};
  const d = (k) => Math.max(0, (h[k] || 0) - (st[k] || 0));
  const did = [];
  if (h.lvl > (st.lvl || h.lvl)) did.push(`went from level ${st.lvl} to ${h.lvl}`);
  if (h.floor > (st.floor ?? h.floor)) did.push(`went from ${st.floor === 0 ? 'the tutorial' : 'floor ' + st.floor} to floor ${h.floor}`);
  if (d('kills')) did.push(`killed ${d('kills')} mobs`);
  if (d('spared')) did.push(`spared ${d('spared')}`);
  if (d('boxes')) did.push(`opened ${d('boxes')} loot boxes`);
  if (d('deaths')) did.push(`died ${d('deaths')} time${d('deaths') === 1 ? '' : 's'}`);
  const tok = (h.tokens || 0) - (st.tokens || 0);
  if (tok) did.push(`${tok > 0 ? 'gained' : 'spent'} ${Math.abs(tok)} tokens`);
  const newAch = (h.ach || []).filter((a) => !(st.ach || []).includes(a));
  if (newAch.length) did.push(`earned ${newAch.join(', ')}`);
  return [
    `${h.name}: ${h.sex === 'f' ? 'female' : 'male'} ${h.race} ${h.cls}, former ${h.job}`,
    `Level ${h.lvl} · ${h.where} · ${h.status || ''} · HP ${h.hp}/${h.maxHp} · odds ${h.odds}`,
    `${h.bosses || ''} · ${h.deaths} deaths, ${h.kills} kills, ${h.spared} spared overall`,
    `Played ${fmt(h.secs)} this time (${fmt(h.total)} total on this hero)`,
    `This time: ${did.length ? did.join(', ') : 'mostly exploring'}.`,
  ].join('\n');
}

let sending = false;
// Sends the waiting report if one is due. keepalive lets it finish if the game is closing.
export async function flushStats() {
  if (!statsOn() || !SUGGEST_KEY || sending) return;
  const p = pending();
  if (p.secs < MIN_SECONDS || get(K_LAST) === today()) return;
  const id = playerId(), name = playerName();
  const heroes = Object.values(p.heroes).sort((a, b) => b.secs - a.secs);
  const lines = heroes.map(heroText);
  const body = new URLSearchParams({
    access_key: SUGGEST_KEY,
    subject: `[Long Odds stats] ${id}${name ? ' (' + name + ')' : ''}: ${fmt(p.secs)} played`,
    from_name: 'Long Odds play stats',
    player_id: id,
    player_name: name || '(not given)',
    play_time: fmt(p.secs),
    play_seconds: String(Math.round(p.secs)),
    sessions: String(p.sessions),
    covers: p.from === today() ? p.from : `${p.from} to ${today()}`,
    summary: `${heroes.length} hero${heroes.length === 1 ? '' : 's'} played for ${fmt(p.secs)} over ${p.sessions || 1} session${p.sessions === 1 ? '' : 's'}.`,
    heroes: lines.join('\n\n'),
    device: device(),
    build: VERSION,
    botcheck: '',
  });
  sending = true;
  const sentDay = today();
  try {
    const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body, headers: { Accept: 'application/json' }, keepalive: true });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.success !== false) {
      set(K_LAST, sentDay);
      // Keep any play that happened while this was sending.
      const now = pending();
      now.secs = Math.max(0, now.secs - p.secs);
      for (const k of Object.keys(now.heroes)) {
        const sent = p.heroes[k];
        if (sent) now.heroes[k].secs = Math.max(0, now.heroes[k].secs - sent.secs);
        if (now.heroes[k].secs <= 0) delete now.heroes[k];
      }
      now.sessions = 0; now.from = today();
      savePending(now);
    }
  } catch { /* offline: try again later */ }
  sending = false;
}
