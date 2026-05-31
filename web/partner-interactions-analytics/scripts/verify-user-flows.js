const fs = require('fs');
const path = require('path');
const analytics = require('../assets/partner-interactions-analytics');

const root = path.resolve(__dirname, '..');
const fixtureRaw = fs.readFileSync(path.join(root, 'fixtures', 'partner-interactions.fixture.json'), 'utf8');
const fixture = JSON.parse(fixtureRaw);

const html = {
  admin: fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  partner: fs.readFileSync(path.join(root, 'partner.html'), 'utf8'),
  expert: fs.readFileSync(path.join(root, 'expert.html'), 'utf8')
};
const js = fs.readFileSync(path.join(root, 'assets', 'partner-interactions.js'), 'utf8');

const checks = [
  htmlCheck('admin_has_scale_controls', html.admin, ['id="partnerId"', '<select id="expertId"', 'id="query"', 'id="pageSize"', 'id="prevPage"', 'id="nextPage"']),
  htmlCheck('partner_has_expert_filter_without_partner_selector', html.partner, ['id="expertId"', 'id="query"', 'id="pageSize"', 'data-audience="partner"']),
  htmlCheck('expert_has_client_search_and_hidden_expert_id', html.expert, ['id="query"', 'id="pageSize"', 'type="hidden" id="expertId"', 'data-audience="expert"']),
  htmlCheck('all_roles_have_table_and_chart_tabs', html.admin + html.partner + html.expert, ['data-tab="charts"', 'id="chartGrid"', 'id="chartMetric"', 'id="chartEntities"']),
  absentHtmlCheck('handoff_is_not_in_product_ui', html.admin + html.partner + html.expert, ['data-tab="handoff"', 'id="handoffContent"', 'ТЗ для внедрения']),
  htmlCheck('product_ui_is_russian', html.admin + html.partner + html.expert, ['aria-label="Фильтры"', 'aria-label="Настройки графика"', 'Случайные фильтры', 'Краткая сводка']),
  absentHtmlCheck('no_english_ui_labels_in_product_html', html.admin + html.partner + html.expert, ['Toggle navigation', 'aria-label="Filters"', 'aria-label="Chart controls"', 'Variable simulator', 'Random filters', 'Auto stream', 'N/A', '>EXP<', '>PAIR<', '>MSG<', '>ACT<']),
  absentHtmlCheck('no_dating_private_photo_or_gift_metrics', html.admin + html.partner + html.expert + js + fixtureRaw, ['Подар', 'подар', 'приват', 'Фото?', 'Фото+', 'Фото-', 'likes', 'mutualLikes', 'encounter', 'gifts', 'photoAccess', 'paidPhoto', 'Лайк', 'Совпад']),
  orderCheck('table_columns_follow_consultation_sales_funnel', fixture.columns.map(column => column.key).join('|'), ['profileViews', 'favorites', 'chatStarts', 'clientMessages', 'expertReplies', 'paidConsultations', 'repeatRequests', 'blocks', 'reports']),
  orderCheck('sort_options_follow_consultation_sales_funnel', html.admin, ['profileViews_desc', 'favorites_desc', 'chatStarts_desc', 'clientMessages_desc', 'expertReplies_desc', 'paidConsultations_desc', 'repeatRequests_desc', 'blocks_desc', 'reports_desc']),
  orderCheck('chart_metrics_follow_consultation_sales_funnel', js, ['profileViews', 'favorites', 'clientStartedDialogs', 'clientMessages', 'expertReplies', 'paidConsultations', 'repeatRequests', 'risk']),
  htmlCheck('table_sorting_controls_are_visible', html.admin + html.partner + html.expert + js, ['function initTableSorting', 'data-sort-key', 'Сортировать', 'по возрастанию', 'по убыванию']),
  htmlCheck('chart_entity_checkboxes_are_used', html.admin + html.partner + html.expert + js, ['class="checkbox-list"', 'type="checkbox"', 'Участники сравнения']),
  htmlCheck('client_side_charts_are_wired', js, ['function renderCharts', 'function readChartControls', 'function buildComparisonDataset', 'function renderLineChart']),
  absentHtmlCheck('no_duplicate_assigned_profiles_field', html.admin + html.partner + html.expert, ['Закрепленные анкеты', 'Поиск в строках']),
  analyticsCheck('admin_all_partners_scope', {
    audience: 'admin',
    partnerId: 0,
    period: 'all',
    direction: 'all',
    pageSize: 50
  }, result => result.meta.audience === 'admin' && result.summary.experts === 3 && result.summary.pairs === 8 && result.rows.length === 8),
  analyticsCheck('admin_search_omkar', {
    audience: 'admin',
    partnerId: 15,
    period: '7d',
    direction: 'all',
    query: 'Omkar',
    pageSize: 50
  }, result => result.summary.pairs === 2 && result.rows.every(row => row.actor.name.includes('Omkar') || row.target.name.includes('Omkar'))),
  analyticsCheck('partner_single_expert_scope', {
    audience: 'partner',
    partnerId: 15,
    expertId: 184,
    period: '7d',
    direction: 'all',
    pageSize: 50
  }, result => result.summary.experts === 1 && result.summary.pairs === 4),
  analyticsCheck('expert_client_search_scope', {
    audience: 'expert',
    expertId: 184,
    period: '7d',
    direction: 'all',
    query: 'cutthreat',
    pageSize: 50
  }, result => result.summary.experts === 1 && result.summary.pairs === 2 && result.rows.every(row => row.actor.name === 'cutthreat' || row.target.name === 'cutthreat')),
  analyticsCheck('pagination_limits_rendered_rows', {
    audience: 'admin',
    partnerId: 0,
    period: 'all',
    direction: 'all',
    pageSize: 50
  }, result => result.rows.length === 8 && result.pagination.pageSize === 50 && result.pagination.totalRows === 8),
  analyticsCheck('sort_by_view_metric', {
    audience: 'admin',
    partnerId: 15,
    period: '7d',
    direction: 'all',
    sort: 'profileViews_desc',
    pageSize: 50
  }, result => result.rows[0].profileViews >= result.rows[result.rows.length - 1].profileViews),
  analyticsCheck('sort_by_total_ascending', {
    audience: 'admin',
    partnerId: 15,
    period: '7d',
    direction: 'all',
    sort: 'total_asc',
    pageSize: 50
  }, result => result.rows[0].total <= result.rows[result.rows.length - 1].total)
];

const failures = checks.filter(check => !check.pass);
console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  checks,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);

function htmlCheck(name, source, requiredFragments) {
  const missing = requiredFragments.filter(fragment => !source.includes(fragment));
  return {
    name,
    type: 'html',
    pass: missing.length === 0,
    missing
  };
}

function absentHtmlCheck(name, source, forbiddenFragments) {
  const present = forbiddenFragments.filter(fragment => source.includes(fragment));
  return {
    name,
    type: 'html',
    pass: present.length === 0,
    present
  };
}

function orderCheck(name, source, orderedFragments) {
  let cursor = -1;
  const outOfOrder = [];
  for (const fragment of orderedFragments) {
    const index = source.indexOf(fragment, cursor + 1);
    if (index === -1) {
      outOfOrder.push(fragment);
    } else {
      cursor = index;
    }
  }
  return {
    name,
    type: 'order',
    pass: outOfOrder.length === 0,
    outOfOrder
  };
}

function analyticsCheck(name, filters, predicate) {
  const result = analytics.build(fixture, filters);
  return {
    name,
    type: 'analytics',
    pass: Boolean(predicate(result)),
    filters,
    summary: result.summary,
    pagination: result.pagination
  };
}
