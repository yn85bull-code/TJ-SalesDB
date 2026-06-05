
    function runGas(name, args = []) {
      return new Promise((resolve, reject) => {
        if (!window.google || !google.script || !google.script.run) {
          reject(new Error('GAS環境ではありません。本番GASに配置して確認してください。'));
          return;
        }
        google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[name].apply(google.script.run, args);
      });
    }

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
    }

    function setStatus(message, isError = false) {
      const el = document.getElementById('status');
      el.textContent = message;
      el.className = `status${isError ? ' error' : ''}`;
    }

    async function init() {
      try {
        setStatus('営業部一覧を取得しています...');
        const options = await runGas('getSalesOsDeptOptions');
        const select = document.getElementById('deptSelect');
        select.innerHTML = (options || []).map(name => `<option>${esc(name)}</option>`).join('');
        if (!options || !options.length) {
          setStatus('有効な営業部がありません。参照設定シートを確認してください。', true);
          return;
        }
        setStatus('営業部を選択して参照確認してください。');
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }

    async function buildReferenceSheet() {
      try {
        setStatus('参照設定シートを作成しています...');
        const result = await runGas('buildSalesOsReferenceSheet');
        setStatus(`参照設定シートを作成しました: ${result.sheetName}`);
        await init();
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }

    async function loadSelectedDept() {
      const dept = document.getElementById('deptSelect').value;
      if (!dept) {
        setStatus('営業部が選択されていません。', true);
        return;
      }
      try {
        setStatus(`${dept} の参照先を読み込んでいます...`);
        const data = await runGas('getSalesOsDashboardByDept', [dept]);
        renderResult(data);
        setStatus(`${dept} の参照確認が完了しました。`);
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    }

    function renderResult(data) {
      const meta = [
        ['営業部', data.selectedDept],
        ['対象月', data.targetMonth],
        ['参照スプレッドシート名', data.sourceSpreadsheetName],
        ['参照スプレッドシートID', data.sourceSpreadsheetId],
        ['参照シート名', data.sourceSheetName],
        ['取得行', data.rowNumber],
        ['ヘッダー数', data.headerCount],
        ['更新日時', data.updatedAt || '-']
      ];
      document.getElementById('meta').innerHTML = meta.map(([label, value]) => `
        <div class="meta-card">
          <div class="label">${esc(label)}</div>
          <div class="value">${esc(value || '-')}</div>
        </div>
      `).join('');

      const entries = Object.entries(data.summary || {});
      document.getElementById('table').innerHTML = `
        <table>
          <thead>
            <tr>
              <th style="width:70px;">No</th>
              <th style="width:260px;">ヘッダー名</th>
              <th>値</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(([key, value], index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${esc(key)}</td>
                <td class="${value === '' ? 'empty' : ''}">${esc(value === '' ? '-' : value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.getElementById('jsonBox').value = JSON.stringify(data, null, 2);
    }

    init();
  
