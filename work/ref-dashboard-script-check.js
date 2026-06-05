
    let CURRENT = null;

    function runGas(name, args = []) {
      return new Promise((resolve, reject) => {
        if (!window.google || !google.script || !google.script.run) {
          reject(new Error('GAS環境ではありません。本番GASに配置して確認してください。'));
          return;
        }
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[name].apply(google.script.run, args);
      });
    }
    function esc(v) { return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }
    function num(v) {
      const n = Number(String(v ?? '').replace(/[¥￥,%Q台件日\s]/g,''));
      return Number.isFinite(n) ? n : 0;
    }
    function pick(obj, keys, fallback = 0) {
      for (const key of keys) if (obj && obj[key] !== undefined && obj[key] !== '') return obj[key];
      return fallback;
    }
    function pct(v) { const n = num(v); return Math.abs(n) <= 1 ? n * 100 : n; }
    function rate(n,d) { return num(d) ? Math.round(num(n) / num(d) * 1000) / 10 : 0; }
    function money(v) { const n = num(v); return `${n < 0 ? '-' : ''}¥${Math.abs(Math.round(n * 1000)).toLocaleString('ja-JP')}`; }
    function yen(v) { const n = num(v); return `${n < 0 ? '-' : ''}¥${Math.abs(Math.round(n)).toLocaleString('ja-JP')}`; }
    function fmt(v,type='number',suffix='') {
      if (type === 'money') return money(v);
      if (type === 'yen') return yen(v);
      if (type === 'percent') return `${pct(v).toFixed(1)}%`;
      if (type === 'days') return `${num(v).toFixed(1).replace(/\.0$/,'')}日`;
      return `${Math.round(num(v)).toLocaleString('ja-JP')}${suffix}`;
    }
    function setStatus(text, error = false) {
      const el = document.getElementById('status');
      el.textContent = text;
      el.className = `status${error ? ' error' : ''}`;
    }
    function valueClass(v) { return num(v) < 0 ? 'negative' : ''; }
    function card(label,value,type='number',suffix='',strong=false) {
      return `<article class="card ${strong ? 'strong' : ''}"><div class="label">${esc(label)}</div><div class="value ${valueClass(value)}">${fmt(value,type,suffix)}</div></article>`;
    }
    function ratioCard(label,q,ratioValue,suffix='Q',color='') {
      const r = pct(ratioValue);
      return `<article class="card ratio">
        <div class="label">${esc(label)}</div>
        <div class="value">${fmt(q,'number',suffix)} / ${r.toFixed(1)}%</div>
        <div class="bar-meta"><span>${esc(label)}比率</span><span>${r.toFixed(1)}%</span></div>
        <div class="bar"><div class="fill ${color}" data-width="${Math.max(0,Math.min(100,r))}"></div></div>
      </article>`;
    }
    function section(title,tag,body) {
      return `<section class="section"><div class="section-head"><div class="section-title">${esc(title)}</div><div class="tag">${esc(tag)}</div></div>${body}</section>`;
    }
    function stack(title,items,total) {
      const colors = ['red','black','blue','yellow'];
      const t = Math.max(1, num(total) || items.reduce((s,it)=>s+num(it.value),0));
      return `<article class="card">
        <div class="label">${esc(title)}</div>
        <div class="stack">${items.map((it,i)=>`<span class="seg ${colors[i%colors.length]}" data-width="${Math.max(0,Math.min(100,num(it.value)/t*100))}"></span>`).join('')}</div>
        <div class="legend">${items.map((it,i)=>`<span><i class="dot ${colors[i%colors.length]}"></i>${esc(it.label)} ${fmt(it.value,'number','Q')} / ${(num(it.value)/t*100).toFixed(1)}%</span>`).join('')}</div>
      </article>`;
    }
    function renderDashboard(data) {
      CURRENT = data;
      const s = data.summary || {};
      document.getElementById('targetMonth').textContent = `対象月 ${data.targetMonth || pick(s,['対象月'],'-')}`;
      document.getElementById('updatedAt').textContent = `更新 ${data.updatedAt || pick(s,['更新日時'],'-') || '-'}`;
      const staffTotal = pick(s,['スタッフ数'], num(pick(s,['責任者','責任者人数'],0)) + num(pick(s,['買取営業','買取営業人数'],0)) + num(pick(s,['販売営業','販売営業人数'],0)) + num(pick(s,['事務','事務人数'],0)));
      const purchaseQ = pick(s,['買取Ｑ','買取Q','買取台数実績'],0);
      const shipQ = pick(s,['当月納車Ｑ','納車台数実績','納車台数'],0);
      document.getElementById('app').innerHTML = `
        <section class="hero">
          <div>
            <div class="dept">${esc(data.selectedDept || pick(s,['営業部名'],'-'))}</div>
            <div class="source">参照: ${esc(data.sourceSpreadsheetName || '')} / ${esc(data.sourceSheetName || '')}</div>
          </div>
          <div class="grid g5">
            ${card('スタッフ数',staffTotal,'number','人')}
            ${card('拠点数',pick(s,['拠点数'],0),'number','拠点')}
            ${card('責任者',pick(s,['責任者','責任者人数'],0),'number','人')}
            ${card('MG人数',pick(s,['MG人数','MGA人数'],0),'number','人')}
            ${card('買取営業',pick(s,['買取営業','買取営業人数'],0),'number','人')}
            ${card('販売営業',pick(s,['販売営業','販売営業人数'],0),'number','人')}
            ${card('事務',pick(s,['事務','事務人数'],0),'number','人')}
          </div>
        </section>

        ${section('最重要項目','G / MQ / F',`
          <div class="grid g3">
            ${card('G 最終利益',pick(s,['G'],0),'money','',true)}
            ${card('MQ 粗利',pick(s,['MQ','トータルMQ'],0),'money','',true)}
            ${card('F 経費',pick(s,['F','トータルF'],0),'money','',true)}
          </div>
        `)}

        ${section('買取実績','査定 / 成約 / 販路',`
          <div class="grid g3">
            ${card('査定Q',pick(s,['査定Ｑ','査定Q','査定台数実績'],0),'number','Q',true)}
            ${card('買取Q',purchaseQ,'number','Q',true)}
            ${card('成約CVR',pick(s,['成約CVR','買取成約CVR'],0),'percent','',true)}
          </div>
          <div class="grid g4" style="margin-top:12px;">
            ${ratioCard('AA',pick(s,['AAQ','AA台数'],0),pick(s,['AA比率'],rate(pick(s,['AAQ'],0),purchaseQ)))}
            ${ratioCard('商品',pick(s,['商品Q','展示台数'],0),pick(s,['商品比率'],rate(pick(s,['商品Q'],0),purchaseQ)))}
            ${ratioCard('スクラップ',pick(s,['スクラップQ','スクラップ台数'],0),pick(s,['スクラップ比率'],rate(pick(s,['スクラップQ'],0),purchaseQ)))}
            ${ratioCard('代車',pick(s,['代車Q','代車台数'],0),pick(s,['代車比率'],rate(pick(s,['代車Q'],0),purchaseQ)))}
          </div>
          <div class="grid g3" style="margin-top:12px;">
            ${card('スクラップMQ',pick(s,['スクラップ粗利','スクラップMQ'],0),'money')}
            ${card('KBMQ',pick(s,['KBMQ','KB納車MQ'],0),'money')}
            ${stack('販路構成',[
              {label:'AA',value:pick(s,['AAQ'],0)},
              {label:'商品',value:pick(s,['商品Q'],0)},
              {label:'スクラップ',value:pick(s,['スクラップQ'],0)},
              {label:'代車',value:pick(s,['代車Q'],0)}
            ],purchaseQ)}
          </div>
        `)}

        ${section('AA詳細・収益','処理 / MQ / 赤字',`
          <div class="grid g4">
            ${card('落札Q',pick(s,['AA落札Q','落札台数'],0),'number','Q',true)}
            ${ratioCard('流札Q',pick(s,['AA流札Q','流札台数'],0),rate(pick(s,['AA流札Q'],0),pick(s,['AA落札Q'],0)),'Q','warn')}
            ${ratioCard('取消Q',pick(s,['AA取消Q','取消台数'],0),rate(pick(s,['AA取消Q'],0),pick(s,['AA落札Q'],0)),'Q','bad')}
            ${ratioCard('赤字Q',pick(s,['AA赤字Q'],0),pick(s,['AA赤字比率'],rate(pick(s,['AA赤字Q'],0),pick(s,['AA落札Q'],0))),'Q','bad')}
            ${card('未処理Q',pick(s,['AA未処理Q','未処理Q'],0),'number','Q')}
            ${card('持越Q',pick(s,['AA翌月Q','持越Q','翌月処理予定Q'],0),'number','Q')}
            ${card('落札MQ',pick(s,['当月AAMQ','AAMQ'],0),'money')}
            ${card('AA@',pick(s,['AA@','AA＠','AA平均粗利'],0),'money')}
            ${card('未処理MQ',pick(s,['AA未処理MQ'],0),'money')}
            ${card('赤字金額',pick(s,['AA赤字金額'],0),'money')}
          </div>
        `)}

        ${section('査定成約','契約 / キャンセル / 入庫',`
          <div class="grid g4">
            ${ratioCard('即決成約',pick(s,['即決契約数'],0),rate(pick(s,['即決契約数'],0),purchaseQ),'件')}
            ${ratioCard('管理契約',pick(s,['管理契約数'],0),rate(pick(s,['管理契約数'],0),purchaseQ),'件')}
            ${ratioCard('キャンセルQ',pick(s,['買取キャンセルQ','買取キャンセル数'],0),pick(s,['キャンセル比率'],rate(pick(s,['買取キャンセルQ'],0),purchaseQ)),'Q','bad')}
            ${card('入庫平均日数',pick(s,['入庫平均日数'],0),'days')}
          </div>
        `)}

        ${section('販売実績・在庫','受注 / 納車 / 在庫',`
          <div class="grid g4">
            ${card('受注Q',pick(s,['当月受注Ｑ','受注Q'],0),'number','Q',true)}
            ${card('納車Q',shipQ,'number','Q',true)}
            ${card('未納車Q',pick(s,['当月未納車Ｑ'],0),'number','Q')}
            ${card('翌月納車Q',pick(s,['翌月納車Ｑ'],0),'number','Q')}
            ${card('在庫Q',pick(s,['在庫台数'],0),'number','Q',true)}
            ${card('配車在庫Q',pick(s,['配車在庫数'],0),'number','Q',true)}
            ${card('掲載Q',pick(s,['掲載数'],0),'number','Q')}
            ${card('未掲載Q',pick(s,['未掲載数'],0),'number','Q')}
            ${card('未入庫Q',pick(s,['未入庫台数'],0),'number','Q')}
            ${card('在庫金額',pick(s,['在庫金額'],0),'money')}
            ${ratioCard('即納Q',pick(s,['当月受注納車Q'],0),pick(s,['当月即納比率'],0),'Q','green')}
            ${ratioCard('前月納車',pick(s,['前月受注納車Q'],0),pick(s,['納車Q前月比率'],0),'Q','blue')}
          </div>
        `)}

        ${section('販売収益・付帯','MQ / 付帯',`
          <div class="grid g4">
            ${card('納車済MQ',pick(s,['当月納車MQ','納車済MQ'],0),'money', '', true)}
            ${card('未納車MQ',pick(s,['当月未納車MQ'],0),'money')}
            ${card('翌月納車MQ',pick(s,['翌月納車MQ'],0),'money')}
            ${card('付帯MQ',pick(s,['当月付帯MQ','付帯MQ'],0),'money')}
            ${accessory(s,'クレジット',shipQ)}
            ${accessory(s,'保証',shipQ)}
            ${accessory(s,'メンテナンス',shipQ)}
            ${accessory(s,'クリーニング',shipQ)}
            ${accessory(s,'コーティング',shipQ)}
            ${accessory(s,'エアコン',shipQ)}
            ${accessory(s,'楽々納車',shipQ)}
            ${accessory(s,'タイヤ交換',shipQ)}
          </div>
        `)}

        ${section('集客情報','MOTA / CPA / 温度別',`
          <div class="grid g4">
            ${card('情報数',pick(s,['MOTA総数','買取情報数'],0),'number','件',true)}
            ${card('開示数',pick(s,['MOTA総開示数','開示数'],0),'number','件',true)}
            ${card('査定数',pick(s,['査定総数','査定Ｑ'],0),'number','件',true)}
            ${card('成約数',pick(s,['成約総数','総契約'],0),'number','件',true)}
            ${ratioCard('開示率',pick(s,['MOTA総開示数'],0),pick(s,['総開示率'],0),'件','blue')}
            ${ratioCard('査定率',pick(s,['査定総数'],0),pick(s,['査定率'],0),'件','blue')}
            ${ratioCard('成約率',pick(s,['成約総数'],0),pick(s,['総成約率'],0),'件','blue')}
            ${card('情報料金',pick(s,['総料金','情報料'],0),'yen')}
            ${card('成約CPA',calcCpa(pick(s,['総料金','情報料'],0),pick(s,['成約総数','総契約'],0)),'yen')}
            ${card('査定CPA',calcCpa(pick(s,['総料金','情報料'],0),pick(s,['査定総数','査定Ｑ'],0)),'yen')}
            ${card('買取営業人数',pick(s,['買取営業','買取営業人数'],0),'number','人')}
            ${card('一人当たり情報数',calcPer(pick(s,['MOTA総数','買取情報数'],0),pick(s,['買取営業','買取営業人数'],0)),'number','件')}
          </div>
          <div style="margin-top:12px;">
            ${stack('温度別構成',[
              {label:'直近層',value:pick(s,['MOTA直近総数','直近層件数'],0)},
              {label:'検討層',value:pick(s,['MOTA検討総数','検討層件数'],0)},
              {label:'潜在層',value:pick(s,['MOTA顕在総数','潜在層件数','顕在層件数'],0)}
            ],pick(s,['MOTA総数'],0))}
          </div>
        `)}

        ${section('取得元データ','確認用',`
          <div class="raw"><table><thead><tr><th>No</th><th>ヘッダー</th><th>値</th></tr></thead><tbody>
            ${Object.entries(s).map(([k,v],i)=>`<tr><td>${i+1}</td><td>${esc(k)}</td><td>${esc(v === '' ? '-' : v)}</td></tr>`).join('')}
          </tbody></table></div>
        `)}
      `;
      runBars();
    }
    function accessory(s,name,shipQ) {
      return ratioCard(name, pick(s,[`${name}Q`,`${name}件数`],0), pick(s,[`${name}比率`],rate(pick(s,[`${name}Q`,`${name}件数`],0),shipQ)), 'Q', 'blue');
    }
    function calcCpa(cost,count) { return num(count) ? Math.round(num(cost) / num(count)) : 0; }
    function calcPer(total,people) { return num(people) ? Math.round(num(total) / num(people)) : 0; }
    function runBars() {
      document.querySelectorAll('.fill,.seg').forEach(el => {
        el.style.width = '0%';
        const w = Number(el.dataset.width || 0);
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = `${Math.max(0,Math.min(100,w))}%`; }));
      });
    }
    async function init() {
      try {
        const options = await runGas('getSalesOsDeptOptions');
        const select = document.getElementById('deptSelect');
        select.innerHTML = (options || []).map(name => `<option>${esc(name)}</option>`).join('');
        if (!options || !options.length) {
          setStatus('参照設定に有効な営業部がありません。', true);
          return;
        }
        select.value = options.includes('千葉営業部') ? '千葉営業部' : options[0];
        await loadDashboard();
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }
    async function loadDashboard() {
      try {
        const dept = document.getElementById('deptSelect').value;
        setStatus(`${dept} のリンクOSを読み込んでいます...`);
        const data = await runGas('getSalesOsDashboardByDept', [dept]);
        renderDashboard(data);
        setStatus(`${dept} を表示しています。`);
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }
    async function buildReferenceSheet() {
      try {
        const result = await runGas('buildSalesOsReferenceSheet');
        setStatus(`参照設定シートを作成しました: ${result.sheetName}`);
        await init();
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }
    init();
  
