const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const v440Start = html.indexOf('<script id="rm-v440-portfolio-today-flow">');
const v440End = html.indexOf('</script>', v440Start);
const v440 = html.slice(v440Start, v440End);

test('Today dashboard surfaces outstanding calls, campaigns, plans, and portfolio counts', () => {
  assert.match(v440, /tile\('transactions',transactionDue\(\),'Transaction Calls'/);
  assert.match(v440, /tile\('tuesday',tuesdayDue\(\),'Tuesday Updates'/);
  assert.match(v440, /tile\('weekly',weekly===null\?'Loading…':weekly,'Weekly Realtor Calls'/);
  assert.match(v440, /tile\('campaigns',conversionDue\(\),'4-Week Campaigns'/);
  assert.match(v440, /tile\('missing-growth',missingPlans,'Missing Growth Plans'/);
  for (const title of ['Need Attention', 'Meeting Due', 'Growth Next Steps', 'Partner Touches Due']) {
    assert.ok(v440.includes(title), `Portfolio health keeps ${title}`);
  }
});

test('weekly call count excludes waiting agents and preserves unknown as loading', () => {
  const weeklyFn = v440.match(/function weeklyCallsDue\(\)\{[^}]+\}/)?.[0];
  assert.ok(weeklyFn);
  const context = { window: { _rmV267BuyerAgentState: { rows: [
    { due: true, waiting: false }, { due: true, waiting: true }, { due: false, waiting: false },
  ] } } };
  vm.createContext(context);
  vm.runInContext(`${weeklyFn};this.count=weeklyCallsDue;`, context);
  assert.equal(context.count(), 1);
  context.window._rmV267BuyerAgentState = null;
  assert.equal(context.count(), null);
});

test('missing-plan count is based on saved next-growth-opportunity fields', () => {
  const fn = v440.match(/function missingGrowthPlansDue\(data\)\{[^}]+\}/)?.[0];
  assert.ok(fn);
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${fn};this.count=missingGrowthPlansDue;`, context);
  assert.equal(context.count({ rows: [
    { next_growth_opportunity: 'Add an assistant' },
    { next_growth_opportunity: '' },
    { next_growth_opportunity: '   ' },
  ] }), 2);
});

test('Recent Contact Attempts excludes ownership changes but keeps calls and texts', async () => {
  const start = html.indexOf('var v441Cache={ts:0,data:null};');
  const end = html.indexOf('\nfunction v441TimeRange', start);
  assert.ok(start >= 0 && end > start);
  const source = html.slice(start, end);
  const context = {
    today: () => '2026-10-28',
    sbFetch: async () => [
      { agent_name: 'Agent A', act_type: 'Relationship Ownership Confirmation', outcome: 'Amanda confirmed' },
      { agent_name: 'Agent B', act_type: 'Relationship Ownership Update', outcome: 'Owner changed' },
      { agent_name: 'Agent C', act_type: 'Listing Agent Update', outcome: 'Reached / talked' },
      { agent_name: 'Agent D', act_type: 'Under Contract Call', outcome: 'Connected' },
      { agent_name: 'Agent E', act_type: 'Text Message', outcome: 'Text reply' },
    ],
  };
  vm.createContext(context);
  vm.runInContext(`${source};this.loadRecent=v441Load;`, context);
  const result = await context.loadRecent();
  assert.deepEqual(Array.from(result.recent, r => r.act_type), [
    'Listing Agent Update', 'Under Contract Call', 'Text Message',
  ]);
  assert.match(html, /rmv441-panel-title">Recent Contact Attempts/);
});
