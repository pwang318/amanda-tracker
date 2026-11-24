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
  let candidates = [];
  const partnerKey = name => String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  function renderPriorities(saved) {
    const host = panel.querySelector('[data-weekly-priorities]');
    host.replaceChildren();
    const now = new Date();
    const today = dateKey(now);
    const easternClock = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(now);
    const nowKey = today + 'T' + easternClock;
    const pending = saved.map((entry, index) => ({entry, index})).filter(({entry}) => !entry.completedAt);
    const tracked = new Set(pending.map(({entry}) => partnerKey(entry.partner)));
    pending.sort((a, b) => {
      const priority = row => row.entry.due < nowKey ? 0 : row.entry.listingReferral ? 1 : 2;
      return priority(a) - priority(b) || a.entry.due.localeCompare(b.entry.due);
    });
    for (const {entry, index} of pending) {
      const item = document.createElement('li');
      const bucket = entry.due < nowKey ? 'Overdue' : entry.listingReferral ? 'Listing-agent referral follow-up' : 'Upcoming';
      item.textContent = [bucket, entry.partner, entry.reference, entry.next, entry.owner, entry.due.replace('T', ' ')].filter(Boolean).join(' · ');
      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'btn-sm';
      done.textContent = 'Mark follow-up done';
      done.onclick = () => {
        try {
          const latest = read();
          if (JSON.stringify(latest[index]) !== JSON.stringify(entry)) {
            render();
            status.textContent = 'This entry changed. Review the latest list.';
            return;
          }
          latest[index].completedAt = new Date().toISOString();
          localStorage.setItem(storageKey, JSON.stringify(latest));
          render();
          status.textContent = 'Follow-up marked done.';
        } catch {
          status.textContent = 'Could not save the follow-up status.';
        }
      };
      item.append(' ', done);
      host.append(item);
    }
    for (const row of candidates) {
      if (tracked.has(partnerKey(row.name))) continue;
      const item = document.createElement('li');
      item.textContent = row.name + ' · ' + row.reason + ' · ' + row.action;
      const plan = document.createElement('button');
      plan.type = 'button';
      plan.className = 'btn-sm';
      plan.textContent = 'Record next action';
      plan.onclick = () => {
        form.elements.partner.value = row.name;
        form.elements.kind.value = 'goto';
        form.elements.next.value = row.action;
        form.elements.response.focus();
      };
      item.append(' ', plan);
      host.append(item);
    }
    if (!host.childElementCount) {
      const empty = document.createElement('li');
      empty.textContent = 'No open follow-ups or verified partner alerts.';
      host.append(empty);
    }
  }
  async function loadPartnerAlerts(eligible) {
    const hint = panel.querySelector('[data-weekly-priority-status]');
    try {
      const profiles = await rm470LoadAllProfiles();
      const eligibleNames = new Map(eligible.map(row => [partnerKey(row.name), row.name]));
      const today = Date.parse(dateKey(new Date()));
      const byName = new Map();
      for (const profile of profiles) {
        const key = partnerKey(profile.agent_name);
        if (!eligibleNames.has(key) || profile.do_not_contact || profile.display_name === '__HIDDEN__') continue;
        const previous = byName.get(key);
        if (!previous || String(profile.updated_at || '') > String(previous.updated_at || '')) byName.set(key, profile);
      }
      candidates = [];
      for (const [key, profile] of byName) {
        const dates = [profile.latest_lead_date, profile.latest_close_date]
          .map(value => Date.parse(String(value || '').slice(0, 10))).filter(value => Number.isFinite(value) && value <= today);
        const age = dates.length ? (today - Math.max(...dates)) / 86400000 : null;
        const count = profile.closes_past_year ?? profile.closed_past_year;
        const tier = {1:'B', 3:'A', 9:'Channel'}[count];
        const signals = [];
        if (age !== null && age >= 60) signals.push(age + ' days since last qualifying lead or closing');
        if (tier) signals.push('One rolling funding from ' + tier);
        if (signals.length) candidates.push({
          name:eligibleNames.get(key), rank:age >= 90 ? 0 : age >= 60 ? 1 : 2,
          reason:signals.join(' · '),
          action:age >= 60 ? 'Reconnect and ask about a named buyer opportunity' : 'Confirm the next supported buyer opportunity'
        });
      }
      candidates.sort((a,b) => a.rank - b.rank || a.name.localeCompare(b.name));
      hint.textContent = 'Partner alerts use shared profiles for eligible Amanda partners. Follow-up completion saves in this browser.';
    } catch {
      candidates = [];
      hint.textContent = 'Could not verify partner alerts. Saved follow-ups are still available.';
    }
    render();
  }
  function render() {
    try {
      const saved = read();
      const selection = form.elements.date.value;
      const rows = selection ? saved.filter(row => weekOf(row.date) === weekOf(selection)) : [];
      renderPriorities(saved);
      const counts = Object.keys(kinds).map(kind => kinds[kind] + ': ' + rows.filter(row => row.kind === kind).length);
      counts.push('Listing-agent referrals received: ' + rows.filter(row => row.listingReferral).length);
      panel.querySelector('[data-weekly-counts]').textContent = counts.join(' · ');
      list.replaceChildren();
      for (const row of rows.sort((a, b) => a.due.localeCompare(b.due))) {
        const item = document.createElement('li');
        item.textContent = [row.date, row.partner, kinds[row.kind], row.listingReferral ? 'Listing-agent referral' : '', row.reference, row.response,
          row.next, row.owner, row.due.replace('T', ' '), row.completedAt ? 'Follow-up done' : ''].filter(Boolean).join(' · ');
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
      void loadPartnerAlerts(eligible);
      hint.textContent = eligible.length + ' eligible Amanda partners for the week of ' + state.week +
        ' · ' + eligible.filter(row => row.connected).length + ' connected in the existing call log.';
    } catch {
      partners.replaceChildren();
      panel.querySelector('[data-weekly-roster]').replaceChildren();
      candidates = [];
      panel.querySelector('[data-weekly-priority-status]').textContent = 'Partner alerts are unavailable. Saved follow-ups are still available.';
      render();
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
  window.addEventListener('core-team-sync-updated', render);
  panel.addEventListener('toggle', () => { if (panel.open) void refreshEligible(); });
  render();
})();
