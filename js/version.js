// The build script replaces __BUILD_VERSION__ with 1.0.0.YYYYMMDD.HHMM on every deploy.
const RAW = '__BUILD_VERSION__';
export const VERSION = RAW.startsWith('__') ? '1.0.0.dev' : RAW;

// Asks the server for the newest published version.
export async function checkForUpdate() {
  const res = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not reach the update server.');
  const data = await res.json();
  const latest = String(data.version || '');
  return { latest, hasUpdate: latest !== '' && latest !== VERSION && VERSION !== '1.0.0.dev' && newer(latest, VERSION) };
}

function newer(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

export function installUpdate(latest) {
  // A new URL skips the cached page, and every file is versioned so they all refresh too.
  location.replace(location.pathname + '?v=' + encodeURIComponent(latest));
}
