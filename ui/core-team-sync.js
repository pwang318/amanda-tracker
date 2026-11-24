(() => {
  const root = document.getElementById('coreTeamSync');
  document.getElementById('rmOpenCoreTeamSync')?.addEventListener('click', () => { root.open = true; });
  const find = selector => root.querySelector(selector);
  const status = find('[data-sync-status]');
  const source = find('[data-sync-sources]');
  const account = find('[data-sync-account]');
  const authenticated = find('[data-sync-authenticated]');
  const isDirector = root.dataset.surface === 'director';
  const collections = {
    'director-huddle': ['director-core-2027-huddle', 'Director huddles and actions'],
    'director-execution': ['director-core-execution-v1', 'Director production, Rockford, and audits'],
    'director-forecast': ['director-funding-forecast-v1', 'Director funding forecast'],
    'director-comp-pacing': ['director-comp-pacing-v1', 'Director weekly compensation figures'],
    'rm-weekly': ['rm-core-weekly-review-v1', 'RM weekly review and follow-ups']
  };
  const allowed = isDirector ? Object.keys(collections) : ['rm-weekly'];
  if (!window.supabase?.createClient) {
    status.textContent = 'Could not load team sign-in. Refresh to retry.';
    return;
  }
  const api = window.supabase.createClient(isDirector ? DIRECTOR_RM_URL : SB_URL, isDirector ? DIRECTOR_RM_KEY : SB_KEY,
    {auth:{storageKey:'core-tracker-team-auth-v1', detectSessionInUrl:true}});
  const snapshots = new Map();
  const loadedRevisions = new Map();
  let sessionId = null;
  let busy = false;
  let timer;
  const dateKey = () => new Intl.DateTimeFormat('en-CA', {
    timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'
  }).format(new Date());
  const dateTime = value => value ? new Date(value).toLocaleString('en-US', {timeZone:'America/New_York'}) + ' ET' : 'Unavailable';
  const old = (value, today, days) => !value || Date.parse(today) -
    Date.parse(new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(value))) > days * 86400000;

  function addLine(list, text) {
    const line = document.createElement('li');
    line.textContent = text;
    list.append(line);
  }
  async function refreshSources() {
    if (!source || !sessionId) return;
    const requestSession = sessionId;
    const asOf = dateKey();
    const {data, error} = await api.rpc('core_tracker_source_report', {p_as_of:asOf});
    if (sessionId !== requestSession) return;
    source.replaceChildren();
    if (error || !data) {
      addLine(source, 'Source verification unavailable. Check team access or retry.');
      return;
    }
    const importLabel = (label, run) => label + ': ' + dateTime(run?.imported_at) +
      (run ? ' · ' + run.status + (old(run.imported_at, asOf, 7) ? ' · stale' : '') : '');
    addLine(source, 'Sources checked ' + dateTime(new Date()) + ' · reporting date ' + data.asOf);
    addLine(source, importLabel('Encompass pipeline', data.pipelineImport));
    addLine(source, importLabel('Encompass funded units', data.fundedImport));
    addLine(source, data.yearFunded + ' YTD verified fundings in the loan table' +
      (data.fundedImport?.status !== 'ok' ? ' · the import is incomplete; reconcile before using as the official total.' : '.'));
    if (data.pipelineImport) {
      addLine(source, data.forecast.map(row => row.days + ' days: ' + row.scheduled + ' scheduled').join(' · ') +
        ' · ' + data.slipped + ' active files past their estimated date. Scheduled counts need review before use as expected fundings.');
    }
    const latest = data.crm?.latest;
    addLine(source, 'CRM quarter feed: ' + (latest ? data.crm.unique_keys + ' distinct keyed leads through ' + latest +
      (Date.parse(asOf) - Date.parse(latest) > 7 * 86400000 ? ' · stale' : '') : 'No dated records') +
      '. Categories in the feed: ' + (data.crm?.categories?.filter(Boolean).join(', ') || 'none') +
      '. Full relationship intake and all-source file starts remain unverified.');
    addLine(source, 'Power BI receipt: ' + dateTime(data.powerBiReceipt) +
      (old(data.powerBiReceipt, asOf, 7) ? ' · stale or missing' : '') + '. Verify the five compensation inputs separately.');
  }
  async function loadCollection(collection) {
    const {data, error} = await api.from('core_tracker_shared_state')
      .select('collection,payload,revision,updated_at').eq('collection',collection).maybeSingle();
    if (error) throw error;
    const snapshot = data || {revision:0, payload:null};
    snapshots.set(collection, snapshot);
    return snapshot;
  }
  function updateLocal(collection, payload) {
    localStorage.setItem(collections[collection][0], JSON.stringify(payload));
    window.dispatchEvent(new Event('core-team-sync-updated'));
    if (collection === 'director-huddle') window.dispatchEvent(new Event('director-core-huddle-imported'));
  }
  function renderCollections() {
    const list = find('[data-sync-collections]');
    list.replaceChildren();
    for (const collection of allowed) {
      const [,label] = collections[collection];
      const snapshot = snapshots.get(collection);
      const item = document.createElement('li');
      item.textContent = label + (snapshot?.updated_at ? ' · shared version ' + snapshot.revision + ' · ' + dateTime(snapshot.updated_at) :
        snapshot ? ' · no shared record yet' : ' · refresh required') + ' ';
      for (const [operation, buttonText] of [['pull','Load shared'], ['push','Publish browser records']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = isDirector ? 'btn' : 'btn-sm';
        button.textContent = buttonText;
        button.disabled = !snapshot || (operation === 'pull' && snapshot.revision === 0);
        button.onclick = () => void transfer(collection, operation);
        item.append(button, ' ');
      }
      list.append(item);
    }
  }
  async function transfer(collection, operation) {
    if (busy || !sessionId || !snapshots.has(collection)) return;
    const transferSession = sessionId;
    busy = true;
    try {
      const key = collections[collection][0];
      const local = JSON.parse(localStorage.getItem(key) || 'null');
      if (operation === 'pull') {
        const latest = await loadCollection(collection);
        if (sessionId !== transferSession || !latest.revision) return;
        if (local !== null && JSON.stringify(local) !== JSON.stringify(latest.payload) &&
          !window.confirm('Replace this browser’s records in this section with the shared version?')) return;
        updateLocal(collection, latest.payload);
        loadedRevisions.set(collection, latest.revision);
        status.textContent = 'Shared version loaded into this browser.';
      } else {
        if (local === null) throw Error('There are no browser records to publish.');
        const revision = snapshots.get(collection).revision;
        if (revision && loadedRevisions.get(collection) !== revision) {
          throw Error('Load the latest shared version before editing or publishing this section.');
        }
        if (!window.confirm('Publish this browser’s records in this section as the next shared version?')) return;
        const {error} = await api.rpc('core_tracker_save_state', {
          p_collection:collection, p_payload:local, p_revision:snapshots.get(collection).revision
        });
        if (error?.code === '40001') {
          await loadCollection(collection);
          renderCollections();
          throw Error('A teammate changed this section. Your browser records were preserved. Compare the shared version before publishing again.');
        }
        if (error) throw error;
        if (sessionId !== transferSession) return;
        await loadCollection(collection);
        loadedRevisions.set(collection, revision + 1);
        status.textContent = 'Published a new shared version.';
      }
      renderCollections();
    } catch (error) {
      status.textContent = error.message || 'Could not sync this section.';
    } finally {
      busy = false;
    }
  }
  async function refresh() {
    if (!sessionId || busy) return;
    busy = true;
    try {
      await Promise.all(allowed.map(loadCollection));
      renderCollections();
      await refreshSources();
    } catch {
      status.textContent = 'Could not refresh shared records.';
    } finally {
      busy = false;
    }
  }
  async function showSession(session) {
    clearInterval(timer);
    snapshots.clear();
    loadedRevisions.clear();
    sessionId = null;
    authenticated.hidden = true;
    account.hidden = false;
    source?.replaceChildren();
    if (!session?.user?.email) {
      status.textContent = 'Sign in with your approved Core Team account.';
      return;
    }
    const {data, error} = await api.from('agent_email_team_members').select('added_at').limit(1).maybeSingle();
    if (error || !data) {
      status.textContent = 'This account does not have approved Core Team access.';
      return;
    }
    sessionId = session.user.id;
    authenticated.hidden = false;
    account.hidden = true;
    status.textContent = 'Signed in to Core Team sync.';
    renderCollections();
    await refresh();
    timer = setInterval(() => { void refreshSources(); }, 5 * 60 * 1000);
  }
  account.addEventListener('submit', async event => {
    event.preventDefault();
    const email = account.elements.email.value.trim();
    const password = account.elements.password.value;
    const result = password ? await api.auth.signInWithPassword({email,password}) :
      await api.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin + location.pathname}});
    account.elements.password.value = '';
    status.textContent = result.error ? 'Sign-in unavailable for this account. Check account access or retry.' :
      password ? 'Checking team access…' : 'Check your email for a sign-in link.';
  });
  find('[data-sync-refresh]').onclick = () => void refresh();
  find('[data-sync-logout]').onclick = () => void api.auth.signOut();
  api.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && sessionId === session?.user?.id) return;
    setTimeout(() => { void showSession(session); }, 0);
  });
})();
