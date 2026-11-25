(() => {
  const root = document.getElementById('rmPartnerSignals');
  const status = root.querySelector('[data-partner-signal-status]');
  const host = root.querySelector('[data-partner-signal-rows]');
  const sources = root.querySelector('[data-partner-signal-sources]');
  const summary = root.querySelector('[data-partner-signal-summary]');
  const refresh = root.querySelector('[data-partner-signal-refresh]');
  const alertsOnly = root.querySelector('[data-partner-signal-alerts]');
  const more = root.querySelector('[data-partner-signal-more]');
  let visibleLimit = 10;
  const day = 86400000;
  const key = name => String(name || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
  const dateKey = date => new Intl.DateTimeFormat('en-CA', {
    timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'
  }).format(date);
  const dateAt = ms => new Date(ms).toISOString().slice(0,10);
  const date = value => {
    const text = String(value || '').slice(0,10);
    const ms = Date.parse(text);
    return Number.isFinite(ms) && dateAt(ms) === text ? ms : NaN;
  };
  let rows = [];

  async function readLeads(today) {
    const prefix = 'velocify_leads?select=lead_key,referral_partner_name,date_added&lead_source=eq.Realtor%20Referral';
    const records = [];
    const limit = 500;
    try {
      const [earliest, latest] = await Promise.all([
        sbFetch(prefix + '&order=date_added.asc,id.asc&limit=1'),
        sbFetch(prefix + '&date_added=lte.' + today + '&order=date_added.desc,id.asc&limit=1')
      ]);
      const through = date(latest[0]?.date_added);
      if (!Number.isFinite(through)) return {records:[],first:null};
      const reportingEnd = through >= date(today) - 7 * day ? date(today) : through;
      const start = reportingEnd - 119 * day;
      for (let offset=0; ; offset+=limit) {
        const page = await sbFetch(prefix + '&date_added=gte.' + dateAt(start) + '&date_added=lte.' + today +
          '&order=date_added.desc,id.asc&limit=' + limit + '&offset=' + offset);
        if (!Array.isArray(page)) throw Error('CRM response unavailable');
        records.push(...page);
        if (page.length < limit) break;
      }
      return {records, first:earliest[0]?.date_added};
    } catch {
      return {records:[],first:null};
    }
  }

  function calculate(portfolio, source, today) {
    const latest = Math.max(-Infinity, ...source.records.map(row => date(row.date_added)).filter(Number.isFinite));
    const crmReady = latest >= today - 7 * day;
    const through = crmReady ? today : latest;
    const start = through - 119 * day;
    const recentStart = through - 29 * day;
    const hasHistory = date(source.first) <= start;
    const stamp = Date.parse(portfolio.partnerSignalSource?.stamp);
    const profileFresh = portfolio.partnerSignalSource?.verified && Number.isFinite(stamp) &&
      today - date(dateKey(new Date(stamp))) <= 7 * day;
    const names = new Map(portfolio.rows.map(row => [key(row.name), row]));
    const aliases = new Map();
    for (const [name, row] of names) {
      const alias = healthNameKey(row.name);
      if (alias) aliases.set(alias, aliases.has(alias) ? null : name);
    }
    const evidence = new Map();
    const incomplete = new Set();
    const leads = new Map();
    for (const row of source.records) {
      const exact = key(row.referral_partner_name);
      const identity = names.has(exact) ? exact : aliases.get(healthNameKey(row.referral_partner_name));
      const added = date(row.date_added);
      const id = key(row.lead_key);
      if (!id || !Number.isFinite(added)) {
        if (identity) incomplete.add(identity);
        continue;
      }
      const previous = leads.get(id);
      if (previous && (previous.reportedName !== exact || previous.added !== added)) {
        if (identity) incomplete.add(identity);
        if (previous.identity) incomplete.add(previous.identity);
      } else if (!previous) {
        leads.set(id, {identity, added, reportedName:exact});
      }
    }
    for (const {identity, added} of leads.values()) {
      if (!identity || added < start || added > through) continue;
      const found = evidence.get(identity) || {recent:0, earlier:0, last:NaN};
      if (added >= recentStart) found.recent++;
      else found.earlier++;
      if (!Number.isFinite(found.last) || added > found.last) found.last = added;
      evidence.set(identity, found);
    }
    const results = [...names].map(([identity, partner]) => {
      const counts = evidence.get(identity) || {recent:0, earlier:0, last:NaN};
      const comparable = hasHistory && !incomplete.has(identity);
      const verified = crmReady && comparable;
      const slowdown = verified && counts.earlier >= 3 && counts.recent * 6 <= counts.earlier;
      const last = Math.max(-Infinity, ...[date(partner.latestLeadDate), date(partner.latestCloseDate), counts.last]
        .filter(value => Number.isFinite(value) && value <= today));
      const days = profileFresh && verified && Number.isFinite(last) ? Math.round((last + 90 * day - today) / day) : null;
      const risk = days !== null && days <= 30;
      return {partner, counts, slowdown, verified, comparable, through, days, last, risk};
    });
    results.sort((a,b) => Number(b.risk) - Number(a.risk) || Number(b.slowdown) - Number(a.slowdown) ||
      (a.days ?? Infinity) - (b.days ?? Infinity) || a.partner.name.localeCompare(b.partner.name));
    return {results, crmReady:crmReady && hasHistory, profileFresh, latest, stamp};
  }

  function render() {
    host.replaceChildren();
    const alerts = rows.filter(row => row.slowdown || row.risk);
    summary.textContent = rows.length ? 'View agent details (' + rows.length + ')' : 'View agent details';
    const visible = alertsOnly.checked ? alerts : rows;
    for (const row of visible.slice(0, visibleLimit)) {
      const {partner, counts, slowdown, verified, comparable, through, days, last, risk} = row;
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      heading.textContent = partner.name;
      const pace = comparable ? counts.recent + ' referrals in 30 days · ' + counts.earlier +
        ' in the prior 90 days (' + (counts.earlier / 3).toFixed(1) + ' per 30 days)' +
        (verified ? '' : ' · historical through ' + dateAt(through)) : 'Referral pace unavailable';
      const active = days === null ? (Number.isFinite(last) ? 'Last known qualifying event ' + dateAt(last) +
        ' · current active status unverified' : 'No qualifying date available') : 'Last qualifying event ' + dateAt(last) +
        ' · ' + (days > 0 ? days + ' days to inactive on ' : 'Inactive since ') + dateAt(last + 90 * day);
      const next = 'Ask about current buyers and any service issues. Record the response and a dated next step.';
      item.append(heading, ' · ' + [slowdown && 'Referral slowdown', risk && 'Active status at risk', pace, active].filter(Boolean).join(' · '));
      if (slowdown || risk) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-sm';
        button.textContent = 'Plan follow-up';
        button.onclick = () => {
          switchTab('standard');
          const review = document.getElementById('rmCoreWeekly');
          review.open = true;
          const form = review.querySelector('form');
          form.elements.partner.value = partner.name;
          form.elements.kind.value = 'goto';
          form.elements.next.value = next;
          form.elements.response.focus();
        };
        item.append(' · ' + next + ' ', button);
      }
      host.append(item);
    }
    more.hidden = visible.length <= visibleLimit;
    more.textContent = 'Show more partners (' + Math.min(visibleLimit, visible.length) + ' of ' + visible.length + ')';
    if (!host.childElementCount) {
      const item = document.createElement('li');
      item.textContent = rows.length ? 'No verified alerts. Clear “Alerts only” to see partner data.' : 'No verified partner rows available.';
      host.append(item);
    }
  }

  async function load() {
    refresh.disabled = true;
    status.textContent = 'Checking partner activity…';
    try {
      const todayKey = dateKey(new Date());
      const today = date(todayKey);
      const [portfolio, source] = await Promise.all([
        window.rmV440GetPortfolioData(), readLeads(todayKey)
      ]);
      const result = calculate(portfolio, source, today);
      rows = result.results;
      const flagged = rows.filter(row => row.slowdown || row.risk).length;
      status.textContent = result.crmReady && result.profileFresh ?
        flagged + ' flagged for follow-up' : 'Live alerts pending source refresh';
      sources.textContent = [
        'Realtor CRM data through ' + (Number.isFinite(result.latest) ? dateAt(result.latest) : 'unavailable'),
        'Portfolio snapshot ' + (Number.isFinite(result.stamp) ? dateKey(new Date(result.stamp)) : 'unavailable'),
        !result.crmReady && 'Live alerts need a fresh Velocify import from the Core Team tracker',
        !result.profileFresh && 'Portfolio snapshot is stale or incomplete; active-status estimates are unavailable'
      ].filter(Boolean).join(' · ');
      render();
    } catch {
      rows = [];
      sources.textContent = '';
      status.textContent = 'Partner health data unavailable. Refresh to retry.';
      render();
    } finally {
      refresh.disabled = false;
    }
  }
  refresh.addEventListener('click', load);
  alertsOnly.addEventListener('change', () => { visibleLimit = 10; render(); });
  more.addEventListener('click', () => { visibleLimit += 10; render(); });
  void load();
})();
