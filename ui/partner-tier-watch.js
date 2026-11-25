(() => {
  const root = document.getElementById('rmTierWatch');
  const form = root.querySelector('form');
  const status = root.querySelector('[role=status]');
  const rows = root.querySelector('ul');
  const day = 86400000;
  const storageKey = 'rm-tier-evidence-v1';
  const nameKey = value => value.trim().toLowerCase().replace(/\s+/g, ' ');
  const todayKey = () => new Intl.DateTimeFormat('en-CA', {
    timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'
  }).format(new Date());
  function epoch(value) {
    const millis = Date.parse(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(millis) &&
      new Date(millis).toISOString().slice(0,10) === value ? millis : NaN;
  }
  function shiftYear(millis, count) {
    const current = new Date(millis);
    const year = current.getUTCFullYear() + count;
    const month = current.getUTCMonth();
    return Date.UTC(year, month, Math.min(current.getUTCDate(), new Date(Date.UTC(year, month+1, 0)).getUTCDate()));
  }
  const tier = count => count >= 10 ? 'Channel' : count >= 4 ? 'A' : count >= 2 ? 'B' : 'Below B';
  function firstDrop(fundings, today) {
    const expirations = fundings.map(value => shiftYear(epoch(value),1)).filter(value => value > today).sort((a,b) => a-b);
    const current = tier(expirations.length);
    for (let i=0;i<expirations.length;i++) {
      const expires = expirations[i];
      if (expires > today + 60 * day) break;
      while (i+1 < expirations.length && expirations[i+1] === expires) i++;
      const remaining = expirations.length - i - 1;
      if (tier(remaining) !== current) return {expires,current,next:tier(remaining),remaining};
    }
    return null;
  }
  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  function render() {
    const today = epoch(todayKey());
    const stored = load();
    rows.replaceChildren();
    for (const row of stored) {
      const age = (today - epoch(row.asOf)) / day;
      const drop = age <= 7 ? firstDrop(row.dates,today) : null;
      const item = document.createElement('li');
      item.textContent = row.partner + ' · ' + (drop ?
        drop.current + ' → ' + drop.next + ' in ' + Math.round((drop.expires-today)/day) + ' days if no new fundings qualify' :
        age > 7 ? 'Refresh funding evidence to check the tier' : 'No tier drop projected in the next 60 days') +
        ' · verified report dated ' + row.asOf;
      rows.append(item);
    }
  }
  form.elements.asOf.value = todayKey();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const {partner,asOf,expected,fundings}=form.elements;
    const report = epoch(asOf.value);
    const today = epoch(todayKey());
    const name = partner.value.trim();
    const ledger = fundings.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => line.split(',').map(value => value.trim()));
    const invalid = ledger.some(line => {
      const date = epoch(line[1] || '');
      return line.length !== 2 || !line[0] || !Number.isFinite(date) || date > report || shiftYear(date,1) <= report;
    });
    if (!name || !Number.isFinite(report) || report > today || invalid || !ledger.length ||
      ledger.length !== expected.valueAsNumber || new Set(ledger.map(line => line[0].toLowerCase())).size !== ledger.length) {
      status.textContent = 'Use unique file references and valid funding dates in the rolling year. The number of rows must match the verified total.';
      return;
    }
    try {
      const saved = load().filter(row => nameKey(row.partner) !== nameKey(name));
      saved.push({partner:name, asOf:asOf.value, dates:ledger.map(line => line[1])});
      localStorage.setItem(storageKey, JSON.stringify(saved));
      fundings.value = '';
      render();
      status.textContent = 'Funding dates checked against the entered total and saved in this browser.';
    } catch {
      status.textContent = 'Could not save the funding evidence.';
    }
  });
  try { render(); }
  catch { status.textContent = 'Could not load saved funding evidence.'; }
})();
