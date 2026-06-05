
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
      const n = Number(String(value || '').replace(/[ﾂ･・･,%・・s]/g, ''));
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
      if (type === 'money') return `ﾂ･${Number(num(value)).toLocaleString('ja-JP')}`;
      if (type === 'q' && !noSuffix) return `${Number(num(value)).toLocaleString('ja-JP')}Q`;
      if (type === 'caseCount') return `${Number(num(value)).toLocaleString('ja-JP')}莉ｶ`;
      if (type === 'vehicleCount') return `${Number(num(value)).toLocaleString('ja-JP')}蜿ｰ`;
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
      document.getElementById(rootId).innerHTML = `
        <div class="stack-list">
          ${entries.map(item => `
            <div class="stack-item">
              <span class="label">${esc(item.label)}</span>
              <b class="${valueClass(item.value)}" data-count-value="${esc(num(item.value || 0))}" data-count-type="${esc(options.type || '')}">${esc(item.value || '0')}</b>
            </div>
          `).join('')}
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
                <b data-count-value="${esc(actual)}">${actual.toLocaleString('ja-JP')}莉ｶ</b>
                <div class="bar-track">
                  <div class="bar" data-width="${Math.max(3, Math.min(100, rate))}%"></div>
                </div>
                <span data-count-value="${esc(rate)}" data-count-type="rate">0%</span>
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

      if (name.includes('譛ｬ驛ｨ')) label = 'Headquarters';
      else if (name.includes('繧ｵ繝ｼ繝薙せ')) label = 'Service';
      else if (name.includes('逾槫･亥ｷ・)) label = 'Kanagawa Area Sales';
      else if (name.includes('蜊・痩')) label = 'Chiba Area Sales';
      else if (name.includes('蝓ｼ邇・)) label = 'Saitama Area Sales';
      else if (name.includes('譚ｱ莠ｬ')) label = 'Tokyo Area Sales';
      else if (name.includes('闌ｨ蝓・)) label = 'Ibaraki Area Sales';
      else if (name.includes('螟ｧ髦ｪ')) label = 'Osaka Area Sales';
      else if (name.includes('蛹鈴未譚ｱ')) label = 'Kita-Kanto Area Sales';

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
      document.getElementById('status').textContent = '隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...';

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
        `${dash.selectedDept} / ${dash.summary['蟇ｾ雎｡譛・] || ''} / 譖ｴ譁ｰ: ${dash.summary['譖ｴ譁ｰ譌･譎・] || '-'}`;
    }

    async function refreshDashDb() {
      document.getElementById('status').textContent = 'DASH DB繧呈峩譁ｰ荳ｭ...';

      await runGas('buildSalesDeptDashboardAllDbs');
      await loadDashboard();
    }

    function renderDashboard(dash, daily, members, stores) {
      const s = dash.summary || {};
      window.latestDashboardSummary = s;

      const deptName = dash.selectedDept || s['蝟ｶ讌ｭ驛ｨ蜷・] || '-';
      const targetMonth = s['蟇ｾ雎｡譛・] || '-';
      const updatedAt = s['譖ｴ譁ｰ譌･譎・] || '-';
      const assessmentQ = s['譟ｻ螳壼床謨ｰ螳溽ｸｾ'] || s['譟ｻ螳啣'];
      const purchaseQ = s['雋ｷ蜿門床謨ｰ螳溽ｸｾ'] || s['雋ｷ蜿鵬'];
      const salesQ = s['雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'] || s['雋ｩ螢ｲQ'];
      const salesAverage = calcAverage(s['雋ｩ螢ｲ邏熱Q'] || s['雋ｩ螢ｲMQ'], s['雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'] || s['雋ｩ螢ｲQ']);

      setBrandLogoBackground(deptName);
      document.getElementById('homeDeptName').textContent = deptName;
      document.getElementById('homeDeptMeta').textContent = `蟇ｾ雎｡譛茨ｼ・{targetMonth}縲譛邨よ峩譁ｰ・・{updatedAt}`;

      document.getElementById('homeHeroStatus').innerHTML = [
        ['繧ｹ繧ｿ繝・ヵ謨ｰ', s['繧ｹ繧ｿ繝・ヵ謨ｰ']],
        ['譌･謨ｰ騾ｲ謐・, s['譌･謨ｰ騾ｲ謐・]],
        ['AA蜑ｲ蜷・, s['AA蜑ｲ蜷・]],
        ['螻慕､ｺ蜑ｲ蜷・, s['螻慕､ｺ蜑ｲ蜷・]]
      ].map(([label, value]) => `
        <div class="status-chip">
          <div class="label">${esc(label)}</div>
          <b class="${valueClass(value)}">${esc(value || '-')}</b>
        </div>
      `).join('');

      const priorityRows = [
        { label: 'TOPLINE', value: s['螢ｲ荳・], type: 'money', primary: true },
        { label: 'G', value: s['G'], type: 'money', primary: true },
        { label: 'F', value: s['繝医・繧ｿ繝ｫF'], type: 'money' },
        { label: 'MQ', value: s['繝医・繧ｿ繝ｫMQ'], type: 'money' },
        { label: '譟ｻ螳啣', value: assessmentQ, type: 'caseCount' },
        { label: '雋ｷ蜿鵬', value: purchaseQ, type: 'vehicleCount' },
        { label: '雋ｩ螢ｲQ', value: salesQ, type: 'vehicleCount' }
      ];

      document.getElementById('priorityGrid').innerHTML = priorityRows.map(row => `
        <div class="home-kpi-card ${row.primary ? 'primary' : ''}">
          <div class="label">${esc(row.label)}</div>
          <div class="value ${valueClass(row.value)}" data-count-value="${esc(row.value || 0)}" data-count-type="${esc(row.type || '')}" data-no-suffix="${row.noSuffix ? '1' : '0'}">0</div>
        </div>
      `).join('');

      animateCountUps(document.getElementById('priorityGrid'));

      const averageRows = [
        { label: '譟ｻ螳咾VR', value: s['譟ｻ螳咾VR'], type: 'rate' },
        { label: '謌千ｴГVR', value: s['雋ｷ蜿匁・邏ГVR'] || s['謌千ｴГVR'], type: 'rate' },
        { label: 'AA@', value: s['AA@'] || s['AA蟷ｳ蝮・ｲ怜茜'], type: 'money', accent: true },
        { label: '雋ｩ螢ｲ@', value: salesAverage, type: 'money' }
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
      renderStackList('staffGrid', dash.staff || []);
      renderBars('staffBars', dash.staff, 'red');
      renderCards('purchaseGrid', Object.fromEntries((dash.purchase || []).map(x => [x.label, x.value])));
      renderBars('purchaseTypeBars', dash.purchaseTypes, 'black');
      renderStackList('aaGrid', dash.aaBid || []);
      renderCards('salesGrid', Object.fromEntries((dash.sales || []).map(x => [x.label, x.value])));
      renderAttachmentRates('attachGrid', dash.attachments || [], s['蜿玲ｳｨQ']);
      renderProgress(dash.progress || []);
      renderCalendar(daily || []);
      renderStores(stores || []);
      renderMembers(members || []);
      renderMarketing(s);
    }

    function renderMarketing(s) {
      const summary = {
        '邱丈ｺ育ｴ・: s['邱丈ｺ育ｴ・],
        '邱丞･醍ｴ・: s['邱丞･醍ｴ・],
        '邱乗・邏・: s['邱乗・邏・],
        '繝翫ン繧ｯ繝ｫ邇・: s['繝翫ン繧ｯ繝ｫ邇・],
        '繝｢繝ｼ繧ｿ邇・: s['繝｢繝ｼ繧ｿ邇・]
      };

      renderCards('marketingSummary', summary);

      const mediaReserve = [
        { label: '繝翫ン繧ｯ繝ｫ莠育ｴ・, value: s['繝翫ン繧ｯ繝ｫ莠育ｴ・] },
        { label: '繝｢繝ｼ繧ｿ莠育ｴ・, value: s['繝｢繝ｼ繧ｿ莠育ｴ・] },
        { label: '蟐剃ｽ鼎莠育ｴ・, value: s['蟐剃ｽ難ｼ｣莠育ｴ・] || s['蟐剃ｽ鼎莠育ｴ・] },
        { label: '蟐剃ｽ泥莠育ｴ・, value: s['蟐剃ｽ泥莠育ｴ・] },
        { label: '蟐剃ｽ摘莠育ｴ・, value: s['蟐剃ｽ摘莠育ｴ・] },
        { label: '蟐剃ｽ擢莠育ｴ・, value: s['蟐剃ｽ擢莠育ｴ・] }
      ];

      const mediaContract = [
        { label: '繝翫ン繧ｯ繝ｫ螂醍ｴ・, value: s['繝翫ン繧ｯ繝ｫ螂醍ｴ・] },
        { label: '繝｢繝ｼ繧ｿ螂醍ｴ・, value: s['繝｢繝ｼ繧ｿ螂醍ｴ・] },
        { label: '蟐剃ｽ鼎螂醍ｴ・, value: s['蟐剃ｽ難ｼ｣螂醍ｴ・] || s['蟐剃ｽ鼎螂醍ｴ・] },
        { label: '蟐剃ｽ泥螂醍ｴ・, value: s['蟐剃ｽ泥螂醍ｴ・] },
        { label: '蟐剃ｽ摘螂醍ｴ・, value: s['蟐剃ｽ摘螂醍ｴ・] },
        { label: '蟐剃ｽ擢螂醍ｴ・, value: s['蟐剃ｽ擢螂醍ｴ・] }
      ];

      const mediaRates = {
        '繝翫ン繧ｯ繝ｫ邇・: s['繝翫ン繧ｯ繝ｫ邇・],
        '繝｢繝ｼ繧ｿ邇・: s['繝｢繝ｼ繧ｿ邇・],
        '蟐剃ｽ鼎邇・: s['蟐剃ｽ鼎邇・],
        '蟐剃ｽ泥邇・: s['蟐剃ｽ泥邇・],
        '蟐剃ｽ摘邇・: s['蟐剃ｽ摘邇・],
        '蟐剃ｽ擢邇・: s['蟐剃ｽ擢邇・]
      };

      const areas = [
        { label: '譚ｱ莠ｬ莠育ｴ・, value: s['譚ｱ莠ｬ莠育ｴ・] },
        { label: '譚ｱ莠ｬ螂醍ｴ・, value: s['譚ｱ莠ｬ螂醍ｴ・] },
        { label: '蜊・痩莠育ｴ・, value: s['蜊・痩莠育ｴ・] },
        { label: '蜊・痩螂醍ｴ・, value: s['蜊・痩螂醍ｴ・] },
        { label: '蝓ｼ邇我ｺ育ｴ・, value: s['蝓ｼ邇我ｺ育ｴ・] },
        { label: '蝓ｼ邇牙･醍ｴ・, value: s['蝓ｼ邇牙･醍ｴ・] },
        { label: '逾槫･亥ｷ昜ｺ育ｴ・, value: s['逾槫･亥ｷ昜ｺ育ｴ・] },
        { label: '逾槫･亥ｷ晏･醍ｴ・, value: s['逾槫･亥ｷ晏･醍ｴ・] },
        { label: '闌ｨ蝓惹ｺ育ｴ・, value: s['闌ｨ蝓惹ｺ育ｴ・] },
        { label: '闌ｨ蝓主･醍ｴ・, value: s['闌ｨ蝓主･醍ｴ・] },
        { label: '螟ｧ髦ｪ莠育ｴ・, value: s['螟ｧ髦ｪ莠育ｴ・] },
        { label: '螟ｧ髦ｪ螂醍ｴ・, value: s['螟ｧ髦ｪ螂醍ｴ・] },
        { label: '繧ｨ繝ｪ繧｢G莠育ｴ・, value: s['繧ｨ繝ｪ繧｢G莠育ｴ・] },
        { label: '繧ｨ繝ｪ繧｢G螂醍ｴ・, value: s['繧ｨ繝ｪ繧｢G螂醍ｴ・] },
        { label: '繧ｨ繝ｪ繧｢H莠育ｴ・, value: s['繧ｨ繝ｪ繧｢H莠育ｴ・] },
        { label: '繧ｨ繝ｪ繧｢H螂醍ｴ・, value: s['繧ｨ繝ｪ繧｢H螂醍ｴ・] },
        { label: '繧ｨ繝ｪ繧｢I莠育ｴ・, value: s['繧ｨ繝ｪ繧｢I莠育ｴ・] },
        { label: '繧ｨ繝ｪ繧｢I螂醍ｴ・, value: s['繧ｨ繝ｪ繧｢I螂醍ｴ・] },
        { label: '繧ｨ繝ｪ繧｢J莠育ｴ・, value: s['繧ｨ繝ｪ繧｢J莠育ｴ・] },
        { label: '繧ｨ繝ｪ繧｢J螂醍ｴ・, value: s['繧ｨ繝ｪ繧｢J螂醍ｴ・] }
      ];

      renderBars('mediaReserveBars', mediaReserve, 'red');
      renderBars('mediaContractBars', mediaContract, 'black');
      renderCards('mediaRateGrid', mediaRates);
      renderBars('areaBars', areas, 'red');
    }
  async function loadPurchaseHqDashboard() {
  document.getElementById('status').textContent = '雋ｷ蜿匁悽驛ｨ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ荳ｭ...';

  const dept = currentDept || document.getElementById('deptSelect').value;
  const data = await runGas('getPurchaseHqDashboard', [dept]);

  renderPurchaseHqDashboard(data);

  document.getElementById('status').textContent =
    `雋ｷ蜿匁悽驛ｨ / ${data.selectedDept || '-'} / 譖ｴ譁ｰ螳御ｺ・;
}

async function refreshPurchaseHqDashboard() {
  document.getElementById('status').textContent = '雋ｷ蜿匁悽驛ｨDASH繧呈峩譁ｰ荳ｭ...';

  await runGas('buildPurchaseHqDashboardDb');

  await loadPurchaseHqDashboard();
}

function renderPurchaseHqDashboard(data) {
  const s = data.summary || {};

  renderCards('purchaseHqSummary', {
    '譟ｻ螳啣': s['譟ｻ螳啣'],
    '雋ｷ蜿鵬': s['雋ｷ蜿鵬'],
    '謌千ｴГVR': s['謌千ｴГVR'],
    '邱丈ｺ育ｴ・: s['邱丈ｺ育ｴ・],
    '邱丞･醍ｴ・: s['邱丞･醍ｴ・],
    '邱乗・邏・: s['邱乗・邏・]
  });

  renderBars('purchaseHqProgressBars', [
    { label: '譟ｻ螳啣', value: s['譟ｻ螳啣'] },
    { label: '雋ｷ蜿鵬', value: s['雋ｷ蜿鵬'] },
    { label: 'AA蜃ｦ逅・', value: s['AA蜃ｦ逅・'] },
    { label: 'AA譛ｪ蜃ｦ逅・', value: s['AA譛ｪ蜃ｦ逅・'] }
  ], 'red');

  renderBars('purchaseHqRouteBars', [
    { label: 'AAQ', value: s['AAQ'] },
    { label: '蝠・刀Q', value: s['蝠・刀Q'] },
    { label: '繧ｹ繧ｯ繝ｩ繝・・Q', value: s['繧ｹ繧ｯ繝ｩ繝・・Q'] },
    { label: '莉｣霆害', value: s['莉｣霆害'] }
  ], 'black');

  renderCards('purchaseHqKpi', {
    'AAMQ': s['AAMQ'],
    'AA邏熱Q': s['AA邏熱Q'],
    'AA@': s['AA@'],
    'AA關ｽ譛ｭQ': s['AA關ｽ譛ｭQ'],
    'AA豬∵惆Q': s['AA豬∵惆Q'],
    'AA蜿匁ｶ・': s['AA蜿匁ｶ・'],
    'AA鄙梧怦Q': s['AA鄙梧怦Q'],
    '繧ｹ繧ｯ繝ｩ繝・・邊怜茜': s['繧ｹ繧ｯ繝ｩ繝・・邊怜茜']
  });

  renderCards('purchaseHqMedia', {
    '繝翫ン繧ｯ繝ｫ莠育ｴ・: s['繝翫ン繧ｯ繝ｫ莠育ｴ・],
    '繝翫ン繧ｯ繝ｫ螂醍ｴ・: s['繝翫ン繧ｯ繝ｫ螂醍ｴ・],
    '繝翫ン繧ｯ繝ｫ邇・: s['繝翫ン繧ｯ繝ｫ邇・],
    '繝｢繝ｼ繧ｿ莠育ｴ・: s['繝｢繝ｼ繧ｿ莠育ｴ・],
    '繝｢繝ｼ繧ｿ螂醍ｴ・: s['繝｢繝ｼ繧ｿ螂醍ｴ・],
    '繝｢繝ｼ繧ｿ邇・: s['繝｢繝ｼ繧ｿ邇・],
    '蟐剃ｽ鼎莠育ｴ・: s['蟐剃ｽ鼎莠育ｴ・],
    '蟐剃ｽ鼎螂醍ｴ・: s['蟐剃ｽ鼎螂醍ｴ・],
    '蟐剃ｽ鼎邇・: s['蟐剃ｽ鼎邇・]
  });
}
    async function loadSalesDashboard() {
  document.getElementById('status').textContent = '雋ｩ螢ｲ譛ｬ驛ｨ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ荳ｭ...';

  const data = await runGas('getSalesHqDashboardData');

  renderSalesDashboard(data);

  document.getElementById('status').textContent =
    `雋ｩ螢ｲ譛ｬ驛ｨ / 譖ｴ譁ｰ: ${data.updatedAt || '-'}`;
}

async function refreshSalesDashboard() {
  document.getElementById('status').textContent = '雋ｩ螢ｲ譛ｬ驛ｨDASH繧呈峩譁ｰ荳ｭ...';

  const data = await runGas('refreshSalesHqDashboardData');

  renderSalesDashboard(data);

  document.getElementById('status').textContent =
    `雋ｩ螢ｲ譛ｬ驛ｨ / 譖ｴ譁ｰ: ${data.updatedAt || '-'}`;
}

async function resetSalesHqMonthStart() {
  document.getElementById('status').textContent = '譛亥・蝨ｨ蠎ｫ繧貞・險ｭ螳壻ｸｭ...';

  await runGas('resetSalesHqMonthStartStock');

  await refreshSalesDashboard();
}

function renderSalesDashboard(data) {
  const totals = data.totals || {};
  const rows = data.rows || [];

  renderCards('salesStockSummary', {
    '蜷郁ｨ亥惠蠎ｫ': totals.total,
    '蜈･蠎ｫ蜑・: totals.beforeArrival,
    '譛ｪ謗ｲ霈・: totals.notListed,
    '螻慕､ｺ荳ｭ': totals.onDisplay,
    '雋ｩ螢ｲ貂・: totals.sold,
    '莉頑怦雋ｩ螢ｲ謨ｰ': totals.soldThisMonth
  });

  renderBars('salesStockBars', [
    { label: '蜈･蠎ｫ蜑・, value: totals.beforeArrival },
    { label: '譛ｪ謗ｲ霈・, value: totals.notListed },
    { label: '螻慕､ｺ荳ｭ', value: totals.onDisplay },
    { label: '雋ｩ螢ｲ貂・, value: totals.sold }
  ], 'red');

  renderBars('salesProgressBars', [
    { label: '譛亥・蝨ｨ蠎ｫ', value: totals.monthStartStock },
    { label: '70%逶ｮ讓・, value: totals.targetSales },
    { label: '莉頑怦雋ｩ螢ｲ謨ｰ', value: totals.soldThisMonth },
    { label: '騾ｲ謐礼紫', value: totals.progressRate }
  ], 'black');

  document.getElementById('salesStockTable').innerHTML = `
    <thead>
      <tr>
        <th>蠎苓・</th>
        <th>蜷郁ｨ・/th>
        <th>蜈･蠎ｫ蜑・/th>
        <th>譛ｪ謗ｲ霈・/th>
        <th>螻慕､ｺ荳ｭ</th>
        <th>雋ｩ螢ｲ貂・/th>
        <th>譏取律</th>
        <th>譏主ｾ梧律</th>
        <th>譛亥・蝨ｨ蠎ｫ</th>
        <th>70%逶ｮ讓・/th>
        <th>莉頑怦雋ｩ螢ｲ謨ｰ</th>
        <th>騾ｲ謐礼紫</th>
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
              <th>鬆・岼</th>
              <th>逶ｮ讓・/th>
              <th>螳溽ｸｾ</th>
              <th>騾ｲ謐・/th>
              <th>蟾ｮ蛻・/th>
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

    function renderCalendar(rows) {
      const calendar = document.getElementById('calendar');
      if (!rows || rows.length === 0) {
        calendar.className = 'calendar';
        calendar.innerHTML = '<div class="status">譌･蛻･繝・・繧ｿ縺後≠繧翫∪縺帙ｓ縲・/div>';
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
        const text = String(row['譌･莉・] || '');
        const match = text.match(/(\d{1,2})\/(\d{1,2})$/) || text.match(/^(\d{1,2})$/);
        const day = match ? Number(match[2] || match[1]) : 0;
        if (day) byDay[day] = row;
      });

      const weekdays = ['譌･', '譛・, '轣ｫ', '豌ｴ', '譛ｨ', '驥・, '蝨・];
      const cells = weekdays.map(day => `<div class="calendar-weekday">${day}</div>`);
      for (let i = 0; i < first.getDay(); i++) cells.push('<div class="day empty"></div>');
      for (let day = 1; day <= daysInMonth; day++) {
        const row = byDay[day] || {};
        cells.push(`
          <div class="day">
            <div class="day-head">${day}譌･ ${weekdays[new Date(year, month, day).getDay()]}</div>
            <small>諠・ｱ ${esc(row['雋ｷ蜿匁ュ蝣ｱ謨ｰ'] || row['諠・ｱ謨ｰ'] || '-')}</small>
            <small>譟ｻ螳啣 ${esc(row['譟ｻ螳壻ｻｶ謨ｰ'] || row['譟ｻ螳啣'] || '-')}</small>
            <small>雋ｷ蜿鵬 ${esc(row['雋ｷ蜿紋ｻｶ謨ｰ'] || row['雋ｷ蜿鵬'] || '-')}</small>
            <small>謌千ｴГVR ${esc(row['雋ｷ蜿匁・邏ГVR'] || row['謌千ｴГVR'] || '-')}</small>
            <small>雋ｩ螢ｲQ ${esc(row['雋ｩ螢ｲ莉ｶ謨ｰ'] || row['雋ｩ螢ｲQ'] || '-')}</small>
          </div>
        `);
      }
      calendar.innerHTML = cells.join('');
    }

    function renderMembers(rows) {
      const sorted = [...rows].sort((a, b) => num(b['MQ']) - num(a['MQ']));
      const topThree = sorted.slice(0, 3);

      const rankingHtml = topThree.length ? `
        <div class="rank-podium">
          ${topThree.map((row, i) => `
            <div class="rank-card rank-${i + 1}">
              <div class="rank-label">MQ RANKING ${i + 1}菴・/div>
              <div class="rank-name">${esc(row['豌丞錐'] || '-')}</div>
              <div class="rank-value" data-count-value="${esc(row['MQ'] || 0)}" data-count-type="money">0</div>
            </div>
          `).join('')}
        </div>
        <div id="memberRankingBars"></div>
      ` : '<div class="status">蛟倶ｺｺ蛻･繝・・繧ｿ縺後≠繧翫∪縺帙ｓ縲・/div>';

      document.getElementById('memberRanking').innerHTML = rankingHtml;

      if (topThree.length) {
        animateCountUps(document.getElementById('memberRanking'));
        document.getElementById('memberRankingBars').innerHTML = '<div class="podium-base"></div>';
      }

      const groups = {};

      rows.forEach(row => {
        const store = row['諡轤ｹ蜷・] || '譛ｪ險ｭ螳・;
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
                  <th>豌丞錐</th>
                  <th>蠖ｹ閨ｷ</th>
                  <th>繝ｩ繝ｳ繧ｯ</th>
                  <th>譟ｻ螳啣</th>
                  <th>雋ｷ蜿鵬</th>
                  <th>謌千ｴ・紫</th>
                  <th>MQ</th>
                  <th>莠育ｴ・/th>
                  <th>豎ｺ陬・/th>
                  <th>MQ騾ｲ謐・/th>
                  <th>MQ蟾ｮ蛻・/th>
                </tr>
              </thead>
              <tbody>
                ${list.map(row => `
                  <tr>
                    <td>${esc(row['豌丞錐'])}</td>
                    <td>${esc(row['蠖ｹ閨ｷ'])}</td>
                    <td>${esc(row['繝ｩ繝ｳ繧ｯ'])}</td>
                    <td>${esc(row['譟ｻ螳啣'])}</td>
                    <td>${esc(row['雋ｷ蜿鵬'])}</td>
                    <td>${esc(row['謌千ｴ・紫'])}</td>
                    <td>${esc(row['MQ'])}</td>
                    <td>${esc(row['莠育ｴ・焚'])}</td>
                    <td>${esc(row['豎ｺ陬∵焚'])}</td>
                    <td>${esc(row['MQ騾ｲ謐・])}</td>
                    <td>${esc(row['MQ蟾ｮ蛻・])}</td>
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
                <th>諡轤ｹ蜷・/th>
                <th>莠ｺ謨ｰ</th>
                <th>螢ｲ荳・/th>
                <th>G</th>
                <th>MQ</th>
                <th>F</th>
                <th>雋ｷ蜿鵬</th>
                <th>雋ｩ螢ｲQ</th>
                <th>譟ｻ螳啣</th>
                <th>謌千ｴ・紫</th>
                <th>蝗ｺ螳夊ｲｻ</th>
                <th>莠ｺ莉ｶ雋ｻ</th>
                <th>蠎・相雋ｻ</th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map(row => `
                <tr>
                  <td>${esc(row['蠎苓・蜷・])}</td>
                  <td>${esc(row['繧ｹ繧ｿ繝・ヵ謨ｰ'] || 0)}</td>
                  <td class="${valueClass(row['螢ｲ荳・])}">${esc(fmt(row['螢ｲ荳・]))}</td>
                  <td class="${valueClass(row['G'])}">${esc(fmt(row['G']))}</td>
                  <td>${esc(fmt(row['MQ']))}</td>
                  <td>${esc(fmt(row['F']))}</td>
                  <td>${esc(fmt(row['雋ｷ蜿鵬'], 'q'))}</td>
                  <td>${esc(fmt(row['雋ｩ螢ｲQ'], 'q'))}</td>
                  <td>${esc(fmt(row['譟ｻ螳啣'], 'q'))}</td>
                  <td>${esc(row['謌千ｴ・紫'] || '-')}</td>
                  <td>${esc(fmt(row['蝗ｺ螳夊ｲｻ']))}</td>
                  <td>${esc(fmt(row['莠ｺ莉ｶ雋ｻ']))}</td>
                  <td>${esc(fmt(row['蠎・相雋ｻ']))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` || '<div class="status">諡轤ｹ繝・・繧ｿ縺後≠繧翫∪縺帙ｓ縲・/div>';
    }

    init().catch(err => {
      document.getElementById('status').textContent = err.message || String(err);
    });
  
