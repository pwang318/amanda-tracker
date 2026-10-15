const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function helperContext() {
  const script = html.match(/<script id="rm-v468-contact-repair-core">([\s\S]*?)<\/script>/);
  assert.ok(script, 'RM v468 repair helpers should be present');
  const context = { window: { CTC_TYPE: 'CTC Call', rmV324IsSystemFeedActivity: a => Boolean(a && /\[TXN_TRIGGER\]/i.test(a.notes || '')) } };
  vm.runInNewContext(script[1], context);
  return context.window;
}

test('contact status filter supports active, inactive, and all including history-only names', () => {
  const helpers = helperContext();
  const contacts = [
    { agent_name: 'Active Agent', relationship_status: 'active' },
    { agent_name: 'Inactive Agent', relationship_status: 'inactive' }
  ];
  const historyOnly = [{ agent_name: 'History Only', _activityOnly: true }];
  const names = value => helpers.rmV468FilterContacts(contacts, historyOnly, value, '', () => ({})).map(x => x.agent_name);
  assert.deepEqual(names('active'), ['Active Agent']);
  assert.deepEqual(names('inactive'), ['Inactive Agent']);
  assert.deepEqual(names('all'), ['Active Agent', 'Inactive Agent', 'History Only']);
});

test('CTC activity remains visible even when tagged as an internal transaction trigger', () => {
  const helpers = helperContext();
  assert.equal(helpers.rmV468HistoryActivityVisible({ act_type: 'CTC Call', notes: '[TXN_TRIGGER]' }), true);
  assert.equal(helpers.rmV468HistoryActivityVisible({ act_type: 'Transaction Snapshot', notes: '[TXN_TRIGGER]' }), false);
  assert.equal(helpers.rmV468HistoryActivityVisible({ act_type: 'Agent Talk-to', notes: 'Reached agent' }), true);
});

test('contacts UI exposes bulk selection and warns about sparse imports', () => {
  assert.match(html, /Select all shown/);
  assert.match(html, /Permanently delete selected/);
  assert.ok(/<option value="active">Active agents<\/option>/.test(html), 'active status filter should be labeled');
  assert.ok(/<option value="inactive">Inactive agents<\/option>/.test(html), 'inactive status filter should be labeled');
  assert.ok(/<option value="all">All agents<\/option>/.test(html), 'all status filter should be available');
  assert.ok(/only the fields supplied in this workbook/i.test(html), 'import preview should explain sparse new contact cards');
  assert.match(html, /openPortfolioNotes\(this\).*data-profile-id=/, 'portfolio notes button should preserve the selected profile row ID');
  assert.match(html, /function openPortfolioNotes\(nameOrEl\)[\s\S]*?openContactsEdit\(nameOrEl\)/, 'portfolio notes should forward the row element rather than only its name');
  assert.match(html, /function\(id,name\)\{\s*return window\.sbFetch\('agent_profiles\?id=eq\.'\+encodeURIComponent\(id\)\+'&agent_name=eq\.'\+encodeURIComponent\(name\)/, 'delete request should atomically match the expected profile name');
  assert.ok(!/<option value="missing-profile">/.test(html), 'obsolete missing-profile option should be removed');
  assert.ok(!/<option value="no(?:bday|address|email|phone)">/.test(html), 'obsolete missing-field options should be removed');
});

test('bulk delete targets separate duplicate rows by stable profile ID and reports stale or failed rows', async () => {
  const helpers = helperContext();
  const attempted = [];
  const report = await helpers.rmV468DeleteProfiles(
    [
      { id: 1, agent_name: 'Duplicate' },
      { id: 2, agent_name: 'Duplicate' },
      { id: 3, agent_name: 'Missing' },
      { id: 4, agent_name: 'Broken' },
      { id: 5, agent_name: 'Changed' },
      { id: null, agent_name: 'No ID' }
    ],
    async id => {
      if (id === 3) return [];
      if (id === 5) return [{ id, agent_name: 'Changed' }];
      return [{ id, agent_name: id === 1 || id === 2 ? 'Duplicate' : 'Broken' }];
    },
    async (id, name) => { attempted.push(id); if (id === 4) throw new Error('write denied'); if (id === 5) return []; return [{ id, agent_name: name }]; }
  );
  assert.deepEqual(attempted, [1, 2, 4, 5]);
  assert.deepEqual(Array.from(report.deleted), ['Duplicate', 'Duplicate']);
  assert.equal(report.skipped.length, 3);
  assert.equal(report.failed.length, 1);
});
