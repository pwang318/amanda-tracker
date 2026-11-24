(() => {
  const panel = document.getElementById('rmCoreWeekly');
  const form = panel.querySelector('form');
  const storageKey = 'rm-core-weekly-review-v1';
  const kinds = Object.freeze({
    goto: 'Go-To follow-up', first: 'First introduction', repeat: 'Repeat introduction',
    booked: 'Listing-agent meeting booked', held: 'Listing-agent meeting held'
  });
  const status = panel.querySelector('[role=status]');
  const list = panel.querySelector('[data-weekly-records]');
  
  const dateKey = date => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
  function weekOf(date) {
    const day = new Date(date + 'T00:00:00Z');
    day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
    return day.toISOString().slice(0, 10);
  }
  function read() {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }
  function render() {
    try {
      const rows = read().filter(row => weekOf(row.date) === weekOf(form.elements.date.value));
      const counts = Object.keys(kinds).map(kind => kinds[kind] + ': ' + rows.filter(row => row.kind === kind).length);
      counts.push('Listing-agent referrals received: ' + rows.filter(row => row.listingReferral).length);
      panel.querySelector('[data-weekly-counts]').textContent = counts.join(' · ');
      list.replaceChildren();
      for (const row of rows.sort((a, b) => a.due.localeCompare(b.due))) {
        const item = document.createElement('li');
        item.textContent = [row.date, row.partner, kinds[row.kind], row.listingReferral ? 'Listing-agent referral' : '', row.reference, row.response,
          row.next, row.owner, row.due.replace('T', ' ')].filter(Boolean).join(' · ');
        list.append(item);
      }
    } catch {
      status.textContent = 'The saved weekly review could not be read.';
    }
  }
  async function refreshEligible() {
    const hint = panel.querySelector('[data-weekly-eligibility]');
    const partners = document.getElementById('rmCoreWeeklyPartners');
    if (typeof window.rmV267GetWeeklyCallState !== 'function') return;
    hint.textContent = 'Checking the shared contract snapshot…';
    try {
      const state = await window.rmV267GetWeeklyCallState();
      if (!state.snapshotAvailable) throw Error('Missing contract snapshot');
      const eligible = state.rows.filter(row => row.owner === 'Amanda' && !row.waiting);
      partners.replaceChildren();
      for (const row of eligible) {
        const option = document.createElement('option');
        option.value = row.name;
        option.label = row.connected ? 'Connected' : row.attempts ? 'Attempted' : 'Call due';
        partners.append(option);
      }
      const roster = panel.querySelector('[data-weekly-roster]');
      roster.replaceChildren();
      for (const row of eligible) {
        const item = document.createElement('li');
        item.textContent = row.name + ' · ' + (row.connected ? 'Connected' : row.attempts ? 'Attempted' : 'Call due');
        roster.append(item);
      }
      hint.textContent = eligible.length + ' eligible Amanda partners for the week of ' + state.week +
        ' · ' + eligible.filter(row => row.connected).length + ' connected in the existing call log.';
    } catch {
      partners.replaceChildren();
      panel.querySelector('[data-weekly-roster]').replaceChildren();
      hint.textContent = 'Could not verify eligibility from the shared contract snapshot.';
    }
  }
  form.elements.date.value = dateKey(new Date());
  form.elements.date.addEventListener('change', render);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const row = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
    if (!row.partner || !row.owner || !row.next || !row.response) {
      status.textContent = 'Enter the partner, response, next action and owner.';
      return;
    }
    const referrals = ['first', 'repeat'];
    if (row.listingReferral && !referrals.includes(row.kind)) {
      status.textContent = 'Choose first or repeat introduction for a listing-agent referral.';
      return;
    }
    if (referrals.includes(row.kind) && !row.reference) {
      status.textContent = 'Enter the CRM opportunity reference for the introduction.';
      return;
    }
    try {
      const rows = read();
      if (referrals.includes(row.kind) && rows.some(saved => referrals.includes(saved.kind) &&
          saved.reference.toLowerCase() === row.reference.toLowerCase())) {
        status.textContent = 'That CRM opportunity is already recorded.';
        return;
      }
      rows.push(row);
      localStorage.setItem(storageKey, JSON.stringify(rows));
      status.textContent = 'Weekly outcome saved.';
      form.elements.listingReferral.checked = false;
      for (const key of ['reference', 'response', 'next', 'due']) form.elements[key].value = '';
      render();
    } catch {
      status.textContent = 'Could not save the outcome in this browser.';
    }
  });
  panel.addEventListener('toggle', () => { if (panel.open) void refreshEligible(); });
  render();
})();
