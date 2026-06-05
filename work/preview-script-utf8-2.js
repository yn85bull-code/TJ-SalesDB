
    let currentDept = '';
    let activeView = 'home';
    const DASH_VIEWS = ['home', 'performance', 'marketing', 'purchase', 'sales'];

    function getInitialView() {
      const params = new URLSearchParams(window.location.search);
      const raw = (window.location.hash.replace('#', '') || params.get('view') || params.get('page') || '').trim();
      return DASH_VIEWS.includes(raw) ? raw : 'home';
    }

    function setViewInUrl(view) {
      if (!DASH_VIEWS.includes(view)) return;
      const nextUrl = `${window.location.pathname}${window.location.search}#${view}`;
      history.replaceState(null, '', nextUrl);
    }

    function switchView(view, options = {}) {
      if (!DASH_VIEWS.includes(view)) view = 'home';
      activeView = view;

      DASH_VIEWS.forEach(v => {
        document.getElementById(`view-${v}`)?.classList.toggle('active', v === view);
        document.getElementById(`menu-${v}`)?.classList.toggle('active', v === view);
      });

      if (!options.skipUrl) setViewInUrl(view);

      return loadCurrentView();
    }

    async function loadCurrentView() {
      if (activeView === 'purchase') return loadPurchaseHqDashboard();
      if (activeView === 'sales') return loadSalesDashboard();
      return loadDashboard();
    }

    async function refreshCurrentView() {
      if (activeView === 'purchase') return refreshPurchaseHqDashboard();
      if (activeView === 'sales') return refreshSalesDashboard();
      return refreshDashDb();
    }

    function runGas(name, args) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)[name]
          .apply(google.script.run, args || []);
      });
    }

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, s => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#039;'
      }[s]));
    }

    function num(value) {
      const n = Number(String(value || '').replace(/[¥￥,%％\s]/g, ''));
      return isNaN(n) ? 0 : n;
    }

    function fmt(value, type) {
      if (String(value || '').includes('%')) return value;
      if (type === 'rate') return value || '-';
      if (type === 'q') return `${Number(num(value)).toLocaleString('ja-JP')}Q`;
      return Number(num(value)).toLocaleString('ja-JP');
    }

    function valueClass(value) {
      return num(value) < 0 ? 'negative' : 'black';
    }

    function formatCountValue(value, type, noSuffix) {
      if (type === 'rate') return `${Math.round(Number(value || 0) * 10) / 10}%`;
      if (type === 'money') return `¥${Number(num(value)).toLocaleString('ja-JP')}`;
      if (type === 'q' && !noSuffix) return `${Number(num(value)).toLocaleString('ja-JP')}Q`;
      if (type === 'caseCount') return `${Number(num(value)).toLocaleString('ja-JP')}件`;
      if (type === 'vehicleCount') return `${Number(num(value)).toLocaleString('ja-JP')}台`;
      return Number(num(value)).toLocaleString('ja-JP');
    }

    function animateNumber(el, value, type, options = {}) {
      if (!el) return;

      el.classList.toggle('negative', num(value) < 0);

      const finalValue = formatCountValue(value, type, options.noSuffix);
      const target = num(value);

      const duration = options.duration || 1050;
      const start = performance.now();
      const sign = target < 0 ? -1 : 1;
      const absTarget = Math.abs(target);

      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(absTarget * eased) * sign;

        el.textContent = formatCountValue(current, type, options.noSuffix);

        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = finalValue;
      }

      requestAnimationFrame(tick);
    }

    function animateCountUps(root = document) {
      root.querySelectorAll('[data-count-value]').forEach(el => {
        animateNumber(el, el.dataset.countValue, el.dataset.countType || '', {
          noSuffix: el.dataset.noSuffix === '1'
        });
      });
    }

    function animateBars() {
      requestAnimationFrame(() => {
        document.querySelectorAll('.bar[data-width]').forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
      });
    }

    function calcAverage(total, count) {
      const c = num(count);
      if (!c) return 0;
      return Math.round(num(total) / c);
    }

    function renderCards(rootId, rows) {
      document.getElementById(rootId).innerHTML = Object.entries(rows || {}).map(([label, value]) => `
        <div class="mini">
          <span class="label">${esc(label)}</span>
          <b class="${valueClass(value)}" data-count-value="${esc(value || 0)}">${esc(value || '0')}</b>
        </div>
      `).join('');

      animateCountUps(document.getElementById(rootId));
    }

    function renderBars(rootId, rows, color = 'red') {
      const entries = Array.isArray(rows)
        ? rows
        : Object.entries(rows || {}).map(([label, value]) => ({ label, value }));

      const max = Math.max(1, ...entries.map(item => Math.abs(num(item.value))));

      document.getElementById(rootId).innerHTML = entries.map((item, i) => `
        <div class="bar-row">
          <div>${esc(item.label)}</div>
          <div class="bar-track">
            <div class="bar ${color === 'black' || i % 2 ? 'black' : ''}" data-width="${Math.max(3, Math.min(100, Math.abs(num(item.value)) / max * 100))}%"></div>
          </div>
          <div class="${valueClass(item.value)}" data-count-value="${esc(item.value || 0)}">${esc(item.value || 0)}</div>
        </div>
      `).join('');

      animateCountUps(document.getElementById(rootId));
      animateBars();
    }

    function normalizeEntries(rows) {
      return Array.isArray(rows)
        ? rows
        : Object.entries(rows || {}).map(([label, value]) => ({ label, value }));
    }

    function renderStackList(rootId, rows, options = {}) {
      const entries = normalizeEntries(rows);
      const labelMap = options.labelMap || {};
      const redLabels = new Set(options.redLabels || []);
      document.getElementById(rootId).innerHTML = `
        <div class="stack-list">
          ${entries.map(item => {
            const label = labelMap[item.label] || item.label;
            const forcedRed = redLabels.has(label) || redLabels.has(item.label);
            return `
            <div class="stack-item">
              <span class="label">${esc(label)}</span>
              <b class="${forcedRed ? 'red' : valueClass(item.value)}" data-count-value="${esc(num(item.value || 0))}" data-count-type="${esc(options.type || '')}">${esc(item.value || '0')}</b>
            </div>
          `;
          }).join('')}
        </div>
      `;
      animateCountUps(document.getElementById(rootId));
    }

    function renderAttachmentRates(rootId, rows, orderQ) {
      const entries = normalizeEntries(rows);
      const base = Math.max(1, num(orderQ));
      document.getElementById(rootId).innerHTML = `
        <div class="stack-list">
          ${entries.map(item => {
            const actual = num(item.value);
            const rate = Math.round(actual / base * 1000) / 10;
            return `
              <div class="attach-row">
                <span>${esc(item.label)}</span>
                <b data-count-value="${esc(actual)}">${actual.toLocaleString('ja-JP')}件</b>
                <div class="bar-track">
                  <div class="bar" data-width="${Math.max(3, Math.min(100, rate))}%"></div>
                </div>
                <span class="rate-text" data-count-value="${esc(rate)}" data-count-type="rate">0%</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
      animateCountUps(document.getElementById(rootId));
      animateBars();
    }

    function setBrandLogoBackground(deptName) {
      const el = document.getElementById('brandLogoBg');
      if (!el) return;

      el.className = 'brand-logo-bg';
      const name = String(deptName || '');
      let label = 'Area Sales';

      if (name.includes('本部')) label = 'Headquarters';
      else if (name.includes('サービス')) label = 'Service';
      else if (name.includes('神奈川')) label = 'Kanagawa Area Sales';
      else if (name.includes('千葉')) label = 'Chiba Area Sales';
      else if (name.includes('埼玉')) label = 'Saitama Area Sales';
      else if (name.includes('東京')) label = 'Tokyo Area Sales';
      else if (name.includes('茨城')) label = 'Ibaraki Area Sales';
      else if (name.includes('大阪')) label = 'Osaka Area Sales';
      else if (name.includes('北関東')) label = 'Kita-Kanto Area Sales';

      el.dataset.areaLabel = label;
      el.setAttribute('aria-label', `${label} background`);
    }

    async function init() {
      const options = await runGas('getSalesDeptOptions');
      const select = document.getElementById('deptSelect');

      select.innerHTML = options.map(name => `<option>${esc(name)}</option>`).join('');

      currentDept = options[0] || '';

      select.onchange = () => {
        currentDept = select.value;
        loadCurrentView();
      };

      switchView(getInitialView(), { skipUrl: true });
    }

    window.addEventListener('hashchange', () => {
      const view = window.location.hash.replace('#', '');
      if (DASH_VIEWS.includes(view) && view !== activeView) {
        switchView(view, { skipUrl: true });
      }
    });

    window.addEventListener('popstate', () => {
      const view = getInitialView();
      if (view !== activeView) switchView(view, { skipUrl: true });
    });

    async function loadDashboard() {
      document.getElementById('status').textContent = '読み込み中...';

      const dept = currentDept || document.getElementById('deptSelect').value;

      const [dash, daily, members, stores] = await Promise.all([
        runGas('getSalesDeptDashboard', [dept]),
        runGas('getSalesDeptDaily', [dept]),
        runGas('getSalesDeptMembers', [dept]),
        runGas('getSalesDeptStores', [dept])
      ]);

      currentDept = dash.selectedDept;

      renderDashboard(dash, daily, members, stores);

      document.getElementById('status').textContent =
        `${dash.selectedDept} / ${dash.summary['対象月'] || ''} / 更新: ${dash.summary['更新日時'] || '-'}`;
    }

    async function refreshDashDb() {
      document.getElementById('status').textContent = 'DASH DBを更新中...';

      await runGas('buildSalesDeptDashboardAllDbs');
      await loadDashboard();
    }

    function renderDashboard(dash, daily, members, stores) {
      const s = dash.summary || {};
      window.latestDashboardSummary = s;

      const deptName = dash.selectedDept || s['営業部名'] || '-';
      const targetMonth = s['対象月'] || '-';
      const updatedAt = s['更新日時'] || '-';
      const assessmentQ = s['査定台数実績'] || s['査定Q'];
      const purchaseQ = s['買取台数実績'] || s['買取Q'];
      const salesQ = s['販売台数実績'] || s['販売Q'];
      const salesAverage = calcAverage(s['販売純MQ'] || s['販売MQ'], s['販売台数実績'] || s['販売Q']);

      setBrandLogoBackground(deptName);
      document.getElementById('homeDeptName').textContent = deptName;
      document.getElementById('homeDeptMeta').textContent = `対象月：${targetMonth}　最終更新：${updatedAt}`;

      document.getElementById('homeHeroStatus').innerHTML = [
        ['スタッフ数', s['スタッフ数']],
        ['日数進捗', s['日数進捗']],
        ['AA割合', s['AA割合']],
        ['展示割合', s['展示割合']]
      ].map(([label, value]) => `
        <div class="status-chip">
          <div class="label">${esc(label)}</div>
          <b class="${valueClass(value)}">${esc(value || '-')}</b>
        </div>
      `).join('');

      const priorityRows = [
        { label: 'TOPLINE', value: s['売上'], type: 'money', primary: true },
        { label: 'G', value: s['G'], type: 'money', primary: true },
        { label: 'F', value: s['トータルF'], type: 'money' },
        { label: 'MQ', value: s['トータルMQ'], type: 'money' },
        { label: '査定Q', value: assessmentQ, type: 'caseCount' },
        { label: '買取Q', value: purchaseQ, type: 'vehicleCount' },
        { label: '販売Q', value: salesQ, type: 'vehicleCount' }
      ];

      document.getElementById('priorityGrid').innerHTML = priorityRows.map(row => `
        <div class="home-kpi-card ${row.primary ? 'primary' : ''}">
          <div class="label">${esc(row.label)}</div>
          <div class="value ${valueClass(row.value)}" data-count-value="${esc(row.value || 0)}" data-count-type="${esc(row.type || '')}" data-no-suffix="${row.noSuffix ? '1' : '0'}">0</div>
        </div>
      `).join('');

      animateCountUps(document.getElementById('priorityGrid'));

      const averageRows = [
        { label: '査定CVR', value: s['査定CVR'], type: 'rate' },
        { label: '成約CVR', value: s['買取成約CVR'] || s['成約CVR'], type: 'rate' },
        { label: 'AA@', value: s['AA@'] || s['AA平均粗利'], type: 'money', accent: true },
        { label: '販売@', value: salesAverage, type: 'money' }
      ];

      document.getElementById('homeAverageGrid').innerHTML = averageRows.map(row => `
        <div class="home-avg-card ${row.accent ? 'accent' : ''}">
          <div class="label">${esc(row.label)}</div>
          <div class="value ${valueClass(row.value)}" data-count-value="${esc(num(row.value || 0))}" data-count-type="${esc(row.type || '')}">${esc(row.value || '0')}</div>
        </div>
      `).join('');

      animateCountUps(document.getElementById('homeAverageGrid'));

      renderBars('revenueBars', dash.revenue, 'red');
      renderBars('expenseBars', dash.expense, 'black');
      renderStackList('staffGrid', dash.staff || [], {
        labelMap: { 'スタッフ数': 'スタッフ人数' },
        redLabels: ['スタッフ人数', 'スタッフ数']
      });
      renderCards('purchaseGrid', Object.fromEntries((dash.purchase || []).map(x => [x.label, x.value])));
      renderBars('purchaseTypeBars', dash.purchaseTypes, 'black');
      renderStackList('aaGrid', dash.aaBid || []);
      renderCards('salesGrid', Object.fromEntries((dash.sales || []).map(x => [x.label, x.value])));
      renderAttachmentRates('attachGrid', dash.attachments || [], s['受注Q']);
      renderProgress(dash.progress || []);
      renderCalendar(daily || []);
      renderStores(stores || []);
      renderMembers(members || []);
      renderMarketing(s);
    }

    function renderMarketing(s) {
      const summary = {
        '総予約': s['総予約'],
        '総契約': s['総契約'],
        '総成約': s['総成約'],
        'ナビクル率': s['ナビクル率'],
        'モータ率': s['モータ率']
      };

      renderCards('marketingSummary', summary);

      const mediaReserve = [
        { label: 'ナビクル予約', value: s['ナビクル予約'] },
        { label: 'モータ予約', value: s['モータ予約'] },
        { label: '媒体C予約', value: s['媒体Ｃ予約'] || s['媒体C予約'] },
        { label: '媒体D予約', value: s['媒体D予約'] },
        { label: '媒体E予約', value: s['媒体E予約'] },
        { label: '媒体F予約', value: s['媒体F予約'] }
      ];

      const mediaContract = [
        { label: 'ナビクル契約', value: s['ナビクル契約'] },
        { label: 'モータ契約', value: s['モータ契約'] },
        { label: '媒体C契約', value: s['媒体Ｃ契約'] || s['媒体C契約'] },
        { label: '媒体D契約', value: s['媒体D契約'] },
        { label: '媒体E契約', value: s['媒体E契約'] },
        { label: '媒体F契約', value: s['媒体F契約'] }
      ];

      const mediaRates = {
        'ナビクル率': s['ナビクル率'],
        'モータ率': s['モータ率'],
        '媒体C率': s['媒体C率'],
        '媒体D率': s['媒体D率'],
        '媒体E率': s['媒体E率'],
        '媒体F率': s['媒体F率']
      };

      const areas = [
        { label: '東京予約', value: s['東京予約'] },
        { label: '東京契約', value: s['東京契約'] },
        { label: '千葉予約', value: s['千葉予約'] },
        { label: '千葉契約', value: s['千葉契約'] },
        { label: '埼玉予約', value: s['埼玉予約'] },
        { label: '埼玉契約', value: s['埼玉契約'] },
        { label: '神奈川予約', value: s['神奈川予約'] },
        { label: '神奈川契約', value: s['神奈川契約'] },
        { label: '茨城予約', value: s['茨城予約'] },
        { label: '茨城契約', value: s['茨城契約'] },
        { label: '大阪予約', value: s['大阪予約'] },
        { label: '大阪契約', value: s['大阪契約'] },
        { label: 'エリアG予約', value: s['エリアG予約'] },
        { label: 'エリアG契約', value: s['エリアG契約'] },
        { label: 'エリアH予約', value: s['エリアH予約'] },
        { label: 'エリアH契約', value: s['エリアH契約'] },
        { label: 'エリアI予約', value: s['エリアI予約'] },
        { label: 'エリアI契約', value: s['エリアI契約'] },
        { label: 'エリアJ予約', value: s['エリアJ予約'] },
        { label: 'エリアJ契約', value: s['エリアJ契約'] }
      ];

      renderBars('mediaReserveBars', mediaReserve, 'red');
      renderBars('mediaContractBars', mediaContract, 'black');
      renderCards('mediaRateGrid', mediaRates);
      renderBars('areaBars', areas, 'red');
    }
  async function loadPurchaseHqDashboard() {
  document.getElementById('status').textContent = '買取本部データを読み込み中...';

  const dept = currentDept || document.getElementById('deptSelect').value;
  const data = await runGas('getPurchaseHqDashboard', [dept]);

  renderPurchaseHqDashboard(data);

  document.getElementById('status').textContent =
    `買取本部 / ${data.selectedDept || '-'} / 更新完了`;
}

async function refreshPurchaseHqDashboard() {
  document.getElementById('status').textContent = '買取本部DASHを更新中...';

  await runGas('buildPurchaseHqDashboardDb');

  await loadPurchaseHqDashboard();
}

function renderPurchaseHqDashboard(data) {
  const s = data.summary || {};

  renderCards('purchaseHqSummary', {
    '査定Q': s['査定Q'],
    '買取Q': s['買取Q'],
    '成約CVR': s['成約CVR'],
    '総予約': s['総予約'],
    '総契約': s['総契約'],
    '総成約': s['総成約']
  });

  renderBars('purchaseHqProgressBars', [
    { label: '査定Q', value: s['査定Q'] },
    { label: '買取Q', value: s['買取Q'] },
    { label: 'AA処理Q', value: s['AA処理Q'] },
    { label: 'AA未処理Q', value: s['AA未処理Q'] }
  ], 'red');

  renderBars('purchaseHqRouteBars', [
    { label: 'AAQ', value: s['AAQ'] },
    { label: '商品Q', value: s['商品Q'] },
    { label: 'スクラップQ', value: s['スクラップQ'] },
    { label: '代車Q', value: s['代車Q'] }
  ], 'black');

  renderCards('purchaseHqKpi', {
    'AAMQ': s['AAMQ'],
    'AA純MQ': s['AA純MQ'],
    'AA@': s['AA@'],
    'AA落札Q': s['AA落札Q'],
    'AA流札Q': s['AA流札Q'],
    'AA取消Q': s['AA取消Q'],
    'AA翌月Q': s['AA翌月Q'],
    'スクラップ粗利': s['スクラップ粗利']
  });

  renderCards('purchaseHqMedia', {
    'ナビクル予約': s['ナビクル予約'],
    'ナビクル契約': s['ナビクル契約'],
    'ナビクル率': s['ナビクル率'],
    'モータ予約': s['モータ予約'],
    'モータ契約': s['モータ契約'],
    'モータ率': s['モータ率'],
    '媒体C予約': s['媒体C予約'],
    '媒体C契約': s['媒体C契約'],
    '媒体C率': s['媒体C率']
  });
}
    async function loadSalesDashboard() {
  document.getElementById('status').textContent = '販売本部データを読み込み中...';

  const data = await runGas('getSalesHqDashboardData');

  renderSalesDashboard(data);

  document.getElementById('status').textContent =
    `販売本部 / 更新: ${data.updatedAt || '-'}`;
}

async function refreshSalesDashboard() {
  document.getElementById('status').textContent = '販売本部DASHを更新中...';

  const data = await runGas('refreshSalesHqDashboardData');

  renderSalesDashboard(data);

  document.getElementById('status').textContent =
    `販売本部 / 更新: ${data.updatedAt || '-'}`;
}

async function resetSalesHqMonthStart() {
  document.getElementById('status').textContent = '月初在庫を再設定中...';

  await runGas('resetSalesHqMonthStartStock');

  await refreshSalesDashboard();
}

function renderSalesDashboard(data) {
  const totals = data.totals || {};
  const rows = data.rows || [];

  renderCards('salesStockSummary', {
    '合計在庫': totals.total,
    '入庫前': totals.beforeArrival,
    '未掲載': totals.notListed,
    '展示中': totals.onDisplay,
    '販売済': totals.sold,
    '今月販売数': totals.soldThisMonth
  });

  renderBars('salesStockBars', [
    { label: '入庫前', value: totals.beforeArrival },
    { label: '未掲載', value: totals.notListed },
    { label: '展示中', value: totals.onDisplay },
    { label: '販売済', value: totals.sold }
  ], 'red');

  renderBars('salesProgressBars', [
    { label: '月初在庫', value: totals.monthStartStock },
    { label: '70%目標', value: totals.targetSales },
    { label: '今月販売数', value: totals.soldThisMonth },
    { label: '進捗率', value: totals.progressRate }
  ], 'black');

  document.getElementById('salesStockTable').innerHTML = `
    <thead>
      <tr>
        <th>店舗</th>
        <th>合計</th>
        <th>入庫前</th>
        <th>未掲載</th>
        <th>展示中</th>
        <th>販売済</th>
        <th>明日</th>
        <th>明後日</th>
        <th>月初在庫</th>
        <th>70%目標</th>
        <th>今月販売数</th>
        <th>進捗率</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr>
          <td>${esc(row.store)}</td>
          <td>${esc(row.total)}</td>
          <td>${esc(row.beforeArrival)}</td>
          <td>${esc(row.notListed)}</td>
          <td>${esc(row.onDisplay)}</td>
          <td>${esc(row.sold)}</td>
          <td>${esc(row.dateTomorrow)}</td>
          <td>${esc(row.dateIn2Days)}</td>
          <td>${esc(row.monthStartStock)}</td>
          <td>${esc(row.targetSales)}</td>
          <td>${esc(row.soldThisMonth)}</td>
          <td>${esc(row.progressRate)}%</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

    function renderProgress(rows) {
      document.getElementById('progressTable').innerHTML = `
        <table class="progress-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>目標</th>
              <th>実績</th>
              <th>進捗</th>
              <th>差分</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${esc(row.label)}</td>
                <td>${row.target.toLocaleString('ja-JP')}</td>
                <td>${row.actual.toLocaleString('ja-JP')}</td>
                <td>
                  <div class="bar-track">
                    <div class="bar ${row.rate >= 100 ? 'black' : ''}" data-width="${Math.min(100, row.rate)}%"></div>
                  </div>
                  ${row.rate}%
                </td>
                <td class="${row.diff < 0 ? 'red' : 'black'}">${row.diff.toLocaleString('ja-JP')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      animateBars();
    }

    const holidayCache = {};

    function dateKey(year, month, day) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function addHoliday(map, year, month, day, name) {
      map.set(dateKey(year, month, day), name);
    }

    function nthMonday(year, month, nth) {
      let count = 0;
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month - 1, day);
        if (date.getMonth() !== month - 1) break;
        if (date.getDay() === 1) count++;
        if (count === nth) return day;
      }
      return 1;
    }

    function getJapaneseHolidayMap(year) {
      if (holidayCache[year]) return holidayCache[year];
      const map = new Map();

      addHoliday(map, year, 1, 1, '元日');
      addHoliday(map, year, 1, nthMonday(year, 1, 2), '成人の日');
      addHoliday(map, year, 2, 11, '建国記念の日');
      addHoliday(map, year, 2, 23, '天皇誕生日');
      addHoliday(map, year, 3, Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), '春分の日');
      addHoliday(map, year, 4, 29, '昭和の日');
      addHoliday(map, year, 5, 3, '憲法記念日');
      addHoliday(map, year, 5, 4, 'みどりの日');
      addHoliday(map, year, 5, 5, 'こどもの日');
      addHoliday(map, year, 7, nthMonday(year, 7, 3), '海の日');
      addHoliday(map, year, 8, 11, '山の日');
      addHoliday(map, year, 9, nthMonday(year, 9, 3), '敬老の日');
      addHoliday(map, year, 9, Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), '秋分の日');
      addHoliday(map, year, 10, nthMonday(year, 10, 2), 'スポーツの日');
      addHoliday(map, year, 11, 3, '文化の日');
      addHoliday(map, year, 11, 23, '勤労感謝の日');

      Array.from(map.keys()).sort().forEach(key => {
        const [y, m, d] = key.split('-').map(Number);
        if (new Date(y, m - 1, d).getDay() !== 0) return;
        let substitute = new Date(y, m - 1, d + 1);
        while (map.has(dateKey(substitute.getFullYear(), substitute.getMonth() + 1, substitute.getDate()))) {
          substitute = new Date(substitute.getFullYear(), substitute.getMonth(), substitute.getDate() + 1);
        }
        if (substitute.getFullYear() === year) {
          addHoliday(map, year, substitute.getMonth() + 1, substitute.getDate(), '振替休日');
        }
      });

      for (let month = 1; month <= 12; month++) {
        const days = new Date(year, month, 0).getDate();
        for (let day = 2; day < days; day++) {
          const key = dateKey(year, month, day);
          if (map.has(key)) continue;
          if (map.has(dateKey(year, month, day - 1)) && map.has(dateKey(year, month, day + 1))) {
            addHoliday(map, year, month, day, '国民の休日');
          }
        }
      }

      holidayCache[year] = map;
      return map;
    }

    function renderCalendar(rows) {
      const calendar = document.getElementById('calendar');
      if (!rows || rows.length === 0) {
        calendar.className = 'calendar';
        calendar.innerHTML = '<div class="status">日別データがありません。</div>';
        return;
      }

      calendar.className = 'calendar month';
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const first = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const byDay = {};

      rows.forEach(row => {
        const text = String(row['日付'] || '');
        const match = text.match(/(\d{1,2})\/(\d{1,2})$/) || text.match(/^(\d{1,2})$/);
        const day = match ? Number(match[2] || match[1]) : 0;
        if (day) byDay[day] = row;
      });

      const holidays = getJapaneseHolidayMap(year);
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekdayClasses = ['sun', '', '', '', '', '', 'sat'];
      const cells = weekdays.map((day, i) => `<div class="calendar-weekday ${weekdayClasses[i]}">${day}</div>`);
      for (let i = 0; i < first.getDay(); i++) cells.push('<div class="day empty"></div>');
      for (let day = 1; day <= daysInMonth; day++) {
        const row = byDay[day] || {};
        const date = new Date(year, month, day);
        const weekday = date.getDay();
        const holidayName = holidays.get(dateKey(year, month + 1, day)) || '';
        const dayClass = holidayName ? 'day-holiday' : weekday === 0 ? 'day-sun' : weekday === 6 ? 'day-sat' : '';
        cells.push(`
          <div class="day ${dayClass}">
            <div class="day-head">${day}日 ${weekdays[weekday]}${holidayName ? `<span class="holiday-name">${esc(holidayName)}</span>` : ''}</div>
            <small>情報 ${esc(row['買取情報数'] || row['情報数'] || '-')}</small>
            <small>査定Q ${esc(row['査定件数'] || row['査定Q'] || '-')}</small>
            <small>買取Q ${esc(row['買取件数'] || row['買取Q'] || '-')}</small>
            <small>成約CVR ${esc(row['買取成約CVR'] || row['成約CVR'] || '-')}</small>
            <small>販売Q ${esc(row['販売件数'] || row['販売Q'] || '-')}</small>
          </div>
        `);
      }
      calendar.innerHTML = cells.join('');
    }

    function renderMembers(rows) {
      const sorted = [...rows].sort((a, b) => num(b['MQ']) - num(a['MQ']));
      const rankingRows = sorted.slice(0, 5);

      const rankingHtml = rankingRows.length ? `
        <div class="rank-leaderboard">
          <div class="rank-board-title">MQ LEADERBOARD</div>
          <div class="rank-board-head">
            <span>RANK</span>
            <span>NAME</span>
            <span>SCORE</span>
          </div>
          <div class="rank-board-body">
            ${rankingRows.map((row, i) => {
              const rank = i + 1;
              const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-standard';
              return `
                <div class="rank-board-row ${rankClass}">
                  <div class="rank-no">${rank}位</div>
                  <div class="rank-person">
                    <div class="rank-name">${esc(row['氏名'] || '-')}</div>
                    <div class="rank-store">${esc(row['拠点名'] || '所属未設定')}</div>
                    <div class="rank-label">MQ RANKING</div>
                  </div>
                  <div class="rank-score" data-count-value="${esc(row['MQ'] || 0)}" data-count-type="money">0</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div id="memberRankingBars"></div>
      ` : '<div class="status">個人別データがありません。</div>';

      document.getElementById('memberRanking').innerHTML = rankingHtml;

      if (rankingRows.length) {
        animateCountUps(document.getElementById('memberRanking'));
        document.getElementById('memberRankingBars').innerHTML = '';
      }

      const groups = {};

      rows.forEach(row => {
        const store = row['拠点名'] || '未設定';
        if (!groups[store]) groups[store] = [];
        groups[store].push(row);
      });

      document.getElementById('members').innerHTML = Object.entries(groups).map(([store, list]) => `
        <div class="store-group">
          <h3>${esc(store)}</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>氏名</th>
                  <th>役職</th>
                  <th>ランク</th>
                  <th>査定Q</th>
                  <th>買取Q</th>
                  <th>成約率</th>
                  <th>MQ</th>
                  <th>予約</th>
                  <th>決裁</th>
                  <th>MQ進捗</th>
                  <th>MQ差分</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(row => `
                  <tr>
                    <td>${esc(row['氏名'])}</td>
                    <td>${esc(row['役職'])}</td>
                    <td>${esc(row['ランク'])}</td>
                    <td>${esc(row['査定Q'])}</td>
                    <td>${esc(row['買取Q'])}</td>
                    <td>${esc(row['成約率'])}</td>
                    <td>${esc(row['MQ'])}</td>
                    <td>${esc(row['予約数'])}</td>
                    <td>${esc(row['決裁数'])}</td>
                    <td>${esc(row['MQ進捗'])}</td>
                    <td>${esc(row['MQ差分'])}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('');
    }

    function renderStores(rows) {
      const sorted = [...rows].sort((a, b) => num(b['G']) - num(a['G']) || num(b['MQ']) - num(a['MQ']));

      document.getElementById('stores').innerHTML = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>拠点名</th>
                <th>人数</th>
                <th>売上</th>
                <th>G</th>
                <th>MQ</th>
                <th>F</th>
                <th>買取Q</th>
                <th>販売Q</th>
                <th>査定Q</th>
                <th>成約率</th>
                <th>固定費</th>
                <th>人件費</th>
                <th>広告費</th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map(row => `
                <tr>
                  <td>${esc(row['店舗名'])}</td>
                  <td>${esc(row['スタッフ数'] || 0)}</td>
                  <td class="${valueClass(row['売上'])}">${esc(fmt(row['売上']))}</td>
                  <td class="${valueClass(row['G'])}">${esc(fmt(row['G']))}</td>
                  <td>${esc(fmt(row['MQ']))}</td>
                  <td>${esc(fmt(row['F']))}</td>
                  <td>${esc(fmt(row['買取Q'], 'q'))}</td>
                  <td>${esc(fmt(row['販売Q'], 'q'))}</td>
                  <td>${esc(fmt(row['査定Q'], 'q'))}</td>
                  <td>${esc(row['成約率'] || '-')}</td>
                  <td>${esc(fmt(row['固定費']))}</td>
                  <td>${esc(fmt(row['人件費']))}</td>
                  <td>${esc(fmt(row['広告費']))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` || '<div class="status">拠点データがありません。</div>';
    }

    init().catch(err => {
      document.getElementById('status').textContent = err.message || String(err);
    });
  
