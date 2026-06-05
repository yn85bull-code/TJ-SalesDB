
    window.google = window.google || {};
    google.script = google.script || {};
    const previewSummary = {
      '対象月': '2026/05', '更新日時': '2026/05/31 15:20',
      'スタッフ数': 12, '日数進捗': '100.0%', 'AA割合': '42.0%', '展示割合': '31.5%',
      'G': 4850000, '売上': 18200000, 'トータルMQ': 9200000, 'トータルF': 4350000,
      'AAMQ': 3200000, 'AA純MQ': 2800000, 'AA@': 285000,
      '販売MQ': 5400000, '販売純MQ': 4980000, '付帯MQ': 860000, '付帯総MQ': 980000,
      'KBMQ': 420000, 'スクラップMQ': 310000, 'クレジットMQ': 240000,
      '固定費': 1800000, '契約金': 920000, '人件費': 1260000, '情報料': 180000, '広告費': 145000, 'その他経費': 45000,
      '査定台数実績': 96, '買取台数実績': 61, '販売台数実績': 18, '受注Q': 21, '納車台数実績': 15,
      '買取情報数': 210, '開示数': 172, '査定CVR': '55.8%', '買取成約CVR': '63.5%',
      'AA処理Q': 43, 'AA未処理Q': 8, 'AA台数': 43, '展示台数': 24, 'スクラップ台数': 8, '代車台数': 4,
      '落札台数': 29, '流札台数': 9, '取消台数': 5, '翌月台数': 7,
      'クレジット件数': 9, '保証件数': 12, 'メンテナンス件数': 7, 'クリーニング件数': 10,
      'エアコン件数': 5, '楽々納車件数': 6, 'タイヤ交換件数': 4
    };
    const previewApi = {
      getSalesDeptOptions: () => ['本部', 'サービス', '千葉営業部'],
      getSalesDeptDashboard: dept => ({
        options: ['本部', 'サービス', '千葉営業部'],
        selectedDept: dept || '本部',
        summary: { ...previewSummary, '営業部名': dept || '本部' },
        staff: [
          { label: 'スタッフ数', value: 12 }, { label: '責任者人数', value: 2 },
          { label: '買取営業人数', value: 5 }, { label: '販売営業人数', value: 4 }, { label: '事務人数', value: 1 }
        ],
        revenue: { 'AAMQ': 3200000, '販売MQ': 5400000, '付帯MQ': 860000, 'KBMQ': 420000, 'スクラップMQ': 310000, 'クレジットMQ': 240000 },
        expense: { '固定費': 1800000, '契約金': 920000, '人件費': 1260000, '情報料': 180000, '広告費': 145000, 'その他経費': 45000 },
        purchase: [
          { label: '買取情報数', value: 210 }, { label: '開示数', value: 172 },
          { label: '査定台数実績', value: 96 }, { label: '買取台数実績', value: 61 },
          { label: '査定CVR', value: '55.8%' }, { label: '買取成約CVR', value: '63.5%' }
        ],
        purchaseTypes: [
          { label: 'AA台数', value: 43 }, { label: '展示台数', value: 24 },
          { label: 'スクラップ台数', value: 8 }, { label: '代車台数', value: 4 }
        ],
        aaBid: [
          { label: 'AA処理Q', value: 43 }, { label: 'AA未処理Q', value: 8 },
          { label: '落札台数', value: 29 }, { label: '流札台数', value: 9 },
          { label: '取消台数', value: 5 }, { label: '翌月台数', value: 7 },
          { label: 'AA@', value: 285000 }
        ],
        sales: [
          { label: '販売台数実績', value: 18 }, { label: '受注Q', value: 21 },
          { label: '納車台数実績', value: 15 }, { label: '販売MQ', value: 5400000 }
        ],
        attachments: [
          { label: 'クレジット件数', value: 9 }, { label: '保証件数', value: 12 },
          { label: 'メンテナンス件数', value: 7 }, { label: 'クリーニング件数', value: 10 },
          { label: 'エアコン件数', value: 5 }, { label: '楽々納車件数', value: 6 },
          { label: 'タイヤ交換件数', value: 4 }
        ],
        progress: [
          { label: 'MQ', target: 10000000, actual: 9200000, rate: 92, diff: -800000 },
          { label: 'G', target: 5200000, actual: 4850000, rate: 93, diff: -350000 },
          { label: '買取Q', target: 70, actual: 61, rate: 87, diff: -9 },
          { label: '販売Q', target: 22, actual: 18, rate: 82, diff: -4 }
        ]
      }),
      getSalesDeptDaily: () => [
        { '日付': '5/1', '曜日': '金', '買取情報数': 8, '査定件数': 4, '買取件数': 2, '販売件数': 1, '買取成約CVR': '50.0%' },
        { '日付': '5/2', '曜日': '土', '買取情報数': 10, '査定件数': 6, '買取件数': 4, '販売件数': 2, '買取成約CVR': '66.7%' },
        { '日付': '5/3', '曜日': '日', '買取情報数': 9, '査定件数': 5, '買取件数': 3, '販売件数': 1, '買取成約CVR': '60.0%' },
        { '日付': '5/29', '曜日': '金', '買取情報数': 18, '査定件数': 18, '買取件数': 11, '販売件数': 4, '買取成約CVR': '61.1%' },
        { '日付': '5/30', '曜日': '土', '買取情報数': 22, '査定件数': 22, '買取件数': 14, '販売件数': 5, '買取成約CVR': '63.6%' },
        { '日付': '5/31', '曜日': '日', '買取情報数': 20, '査定件数': 20, '買取件数': 13, '販売件数': 6, '買取成約CVR': '65.0%' }
      ],
      getSalesDeptMembers: () => [
        { '拠点名': '千葉店', '氏名': '田中', '役職': '主任', 'ランク': 'A', '査定Q': 24, '買取Q': 16, '成約率': '66.7%', 'MQ': 1800000, '予約数': 20, '決裁数': 7, 'MQ進捗': '94%', 'MQ差分': -120000 },
        { '拠点名': '本部', '氏名': '鈴木', '役職': '営業', 'ランク': 'A', '査定Q': 21, '買取Q': 14, '成約率': '66.7%', 'MQ': 1620000, '予約数': 18, '決裁数': 6, 'MQ進捗': '91%', 'MQ差分': -70000 },
        { '拠点名': '埼玉店', '氏名': '佐藤', '役職': '営業', 'ランク': 'B', '査定Q': 19, '買取Q': 12, '成約率': '63.2%', 'MQ': 1420000, '予約数': 16, '決裁数': 5, 'MQ進捗': '88%', 'MQ差分': -90000 },
        { '拠点名': '千葉店', '氏名': '高橋', '役職': '営業', 'ランク': 'B', '査定Q': 16, '買取Q': 10, '成約率': '62.5%', 'MQ': 980000, '予約数': 11, '決裁数': 4, 'MQ進捗': '73%', 'MQ差分': -210000 }
      ],
      getSalesDeptStores: () => [
        { '拠点名': '千葉店', 'スタッフ数': 6, '売上': 9200000, 'G': 2440000, 'MQ': 4650000, 'F': 2210000, '買取Q': 34, '販売Q': 10, '査定Q': 52, '成約率': '65.4%', '固定費': 900000, '人件費': 620000, '広告費': 70000 },
        { '拠点名': '埼玉店', 'スタッフ数': 5, '売上': 7600000, 'G': 1980000, 'MQ': 3820000, 'F': 1840000, '買取Q': 27, '販売Q': 8, '査定Q': 44, '成約率': '61.4%', '固定費': 760000, '人件費': 540000, '広告費': 52000 }
      ],
      buildSalesDeptDashboardAllDbs: () => ({ ok: true }),
      getPurchaseHqDashboard: () => ({ options: ['本部'], selectedDept: '本部', summary: { ...previewSummary }, rows: [] }),
      buildPurchaseHqDashboardDb: () => ({ ok: true }),
      getSalesHqDashboardData: () => ({ updatedAt: '2026/05/31 15:20', totals: {}, rows: [] }),
      refreshSalesHqDashboardData: () => previewApi.getSalesHqDashboardData(),
      resetSalesHqMonthStartStock: () => ({ ok: true })
    };
    function createPreviewRunner(success, failure) {
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'withSuccessHandler') return cb => createPreviewRunner(cb, failure);
          if (prop === 'withFailureHandler') return cb => createPreviewRunner(success, cb);
          return (...args) => {
            Promise.resolve()
              .then(() => previewApi[prop] ? previewApi[prop](...args) : null)
              .then(value => success && success(value))
              .catch(error => failure && failure(error));
            return createPreviewRunner(success, failure);
          };
        }
      });
    }
    google.script.run = createPreviewRunner();
  
