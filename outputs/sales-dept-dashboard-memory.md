# 営業部ダッシュボード 運用メモ

作成日: 2026-05-31

このメモは、貼り付けられた営業部ダッシュボードの GAS と HTML を今後の改修作業で素早く参照するための記憶用メモ。

## 原本

- GAS 原本: `outputs/sales-dept-dashboard-gas.txt`
- HTML 原本: `outputs/sales-dept-dashboard-html.txt`
- GAS 行数: 1423
- HTML 行数: 1407
- 文字コード: UTF-8 として読むこと。PowerShell の既定読み込みだと日本語が文字化けすることがある。

## 全体像

営業部ダッシュボードは Google Apps Script Web App と Google Sheets を使ったダッシュボード。

GAS 側で元データの集計タブから DASH 用 DB タブを作成・更新し、HTML 側で `google.script.run` を通じてデータ取得、カード・棒グラフ・テーブル・ランキングとして描画する。

主な表示カテゴリ:

- HOME
- 実績管理
- 集客情報管理
- 買取本部
- 販売本部

デザインは黒・白・赤を基調にした Tauros OS 風の業務ダッシュボード。サイドバー、上部バー、カード、棒グラフ、ランキング、テーブルで構成。

## GAS の主要設定

`SALES_DEPT_DASH`

- sourceDept: `営業部別集計`
- sourceStore: `店舗別集計`
- sourcePersonal: `個人別集計`
- sourceEmployee: `社員名簿`
- sourceDaily: `日別集計`
- dashDb: `営業部DASH_DB`
- dashDaily: `営業部DASH_日別`
- dashPersonal: `営業部DASH_個人`
- dashTarget: `営業部DASH_目標`
- cacheSeconds: 120

主要ヘッダー定義:

- `SALES_DEPT_DASH_DB_HEADERS`
- `SALES_DEPT_DAILY_HEADERS`
- `SALES_DEPT_PERSONAL_HEADERS`
- `SALES_DEPT_TARGET_HEADERS`

## GAS の主要関数

入口:

- `doGet(e)`: `SalesDeptDashboard` HTML を返す。`page=salesDeptDashboard` または `page=deptDash` に対応。

営業部 DB 作成:

- `createSalesDeptDashboardSheets()`: DASH 用 4 タブを作成・ヘッダー設定。
- `buildSalesDeptDashboardAllDbs()`: 営業部DASH_DB、日別、個人をまとめて作成しキャッシュ削除。
- `buildSalesDeptDashboardDb()`: `営業部別集計` から `営業部DASH_DB` を生成。
- `buildSalesDeptDailyDb()`: `日別集計` から `営業部DASH_日別` を生成。
- `buildSalesDeptPersonalDb()`: `個人別集計` と社員名簿・目標から `営業部DASH_個人` を生成。

営業部データ取得:

- `getSalesDeptOptions()`: 部署選択肢を返す。
- `getSalesDeptDashboard(deptName)`: HOME/実績/集客の主要データを返す。
- `getSalesDeptDaily(deptName)`: 日別データ。
- `getSalesDeptMembers(deptName)`: 個人別データ。
- `getSalesDeptStores(deptName)`: 拠点別データ。個人DBから補完する処理あり。
- `getTargetSettings(deptName)`: 目標設定取得。

補助:

- `ensureSalesDeptSheet_`
- `writeSalesDeptRows_`
- `resolveSalesDeptDashValue_`
- `getSalesDeptStaffCounts_`
- `classifyRole_`
- `getEmployeeMap_`
- `getTargetMap_`
- `makeTargetKey_`
- `targetNumber_`
- `buildDashboardKpiCards_`
- `buildProgressRows_`
- `getSalesDeptTargetMonth_`
- `getMonthProgress_`
- `getWeekday_`
- `rowToObject_`
- `pickObject_`
- `buildStoresFromMembers_`
- `makeSalesDeptHeaderIndex_`
- `getByHeader_`
- `firstNumber_`
- `firstNumberOrNull_`
- `parseNumber_`
- `formatRate_`
- `getCachedSalesDept_`
- `clearSalesDeptDashboardCache_`

## 販売本部 GAS

設定:

- `SALES_HQ_DASH.sourceSpreadsheetId`: `1uW78_MjTA4r8PEbnUgMN8E1N3PRPDal0TcI2GuWodno`
- sourceSheetName: `商品販売在庫一覧`
- dashSheetName: `販売本部DASH_DB`
- 状態列: E列
- 日付列: G列
- 店舗列: O列
- targetTurnoverRate: 0.7

主要関数:

- `buildSalesHqDashboardDb()`: 商品販売在庫一覧から店舗別在庫・販売状況を集計。
- `getSalesHqDashboardData()`: 販売本部表示用データを返す。不足時はDBを自動生成。
- `refreshSalesHqDashboardData()`
- `resetSalesHqMonthStartStock()`: 月初在庫保存をリセット。

状態分類:

- 販売済み -> `sold`
- 入庫前 -> `beforeArrival`
- 展示中 -> `onDisplay`
- 入庫済み -> `notListed`

月初在庫は `PropertiesService` に `SALES_HQ_MONTH_START_STOCK_yyyyMM` で保存。

## 買取本部 GAS

設定:

- sourceSheetName: `営業部DASH_DB`
- dashSheetName: `買取本部DASH_DB`

主要関数:

- `createPurchaseHqDashboardSheet()`
- `buildPurchaseHqDashboardDb()`: `営業部DASH_DB` から買取本部専用DBを生成。
- `getPurchaseHqDashboard(deptName)`: 部署選択付きで買取本部データを返す。
- `refreshPurchaseHqDashboardData()`

補助:

- `ensurePurchaseHqSheet_`
- `writePurchaseHqRows_`
- `purchaseRowToObject_`
- `purchaseValue_`
- `purchaseNumber_`
- `purchaseRate_`

## HTML の構成

ファイル名想定: `SalesDeptDashboard.html`

主要UI:

- `.app-shell`: サイドバー + メイン
- `.sidebar`: Tauros OS ロゴ、メニュー
- `.topbar`: 部署選択 `deptSelect`、DASH更新、再読み込み
- `view-home`
- `view-performance`
- `view-marketing`
- `view-purchase`
- `view-sales`

主な JS 関数:

- `switchView(view)`: 画面切り替え。買取本部・販売本部ビューでは専用ロード関数を呼ぶ。
- `runGas(name, args)`: `google.script.run` の Promise ラッパー。
- `esc(value)`: HTML エスケープ。
- `num(value)`: 数値化。
- `fmt(value, type)`: 表示整形。
- `valueClass(value)`: マイナス値などのCSS判定。
- `formatCountValue(value, type, noSuffix)`: カウントアップ用表示整形。
- `animateNumber`
- `animateCountUps`
- `animateBars`
- `calcAverage`
- `renderCards`
- `renderBars`
- `init`
- `loadDashboard`
- `refreshDashDb`
- `renderDashboard`
- `renderMarketing`
- `loadPurchaseHqDashboard`
- `refreshPurchaseHqDashboard`
- `renderPurchaseHqDashboard`
- `loadSalesDashboard`
- `refreshSalesDashboard`
- `resetSalesHqMonthStart`
- `renderSalesDashboard`
- `renderProgress`
- `renderCalendar`
- `renderMembers`
- `renderStores`

## データフロー

1. `doGet` が HTML を返す。
2. HTML `init()` が `getSalesDeptOptions()` を呼ぶ。
3. 部署選択後、`loadDashboard()` が以下を並列取得する。
   - `getSalesDeptDashboard`
   - `getSalesDeptDaily`
   - `getSalesDeptMembers`
   - `getSalesDeptStores`
4. `renderDashboard()` が HOME、実績、集客、日別、個人、拠点を描画。
5. DASH更新ボタンは `buildSalesDeptDashboardAllDbs()` を呼んでDB再生成。
6. 買取本部ビューは `getPurchaseHqDashboard` / `buildPurchaseHqDashboardDb` を使用。
7. 販売本部ビューは `getSalesHqDashboardData` / `refreshSalesHqDashboardData` を使用。

## 改修時の重要注意点

- まず該当タブ名と列名を確認する。列名ベースの取得が多いため、ヘッダー変更は影響が大きい。
- GAS 内の多くの集計は `getDisplayValues()` を使う。数値は `parseNumber_` / `purchaseNumber_` / `toSalesHqNumber_` で再変換する前提。
- `getByHeader_` や `firstNumber_` は候補ヘッダー名を順に探索するので、列名のゆらぎ対応はここへ候補追加するのが安全。
- `営業部DASH_DB` は買取本部DBの元データにもなる。営業部側のヘッダー変更は `買取本部DASH_DB` にも波及する。
- `SalesDeptDashboard.html` の表示ラベルと GAS 側オブジェクトキーは日本語ヘッダー文字列に強く依存している。
- HTML 側は `innerHTML` 生成が多い。ユーザー入力やシート値は必ず `esc()` 経由で表示する。
- `CacheService` は営業部ダッシュボード取得に使われている。DB更新後はキャッシュ削除が必要。
- `clearSalesDeptDashboardCache_()` は現状 `salesDeptOptions` のみ削除。`getSalesDeptDashboard` は `salesDeptDash:${deptName}` キーを使うため、キャッシュ削除漏れの可能性あり。改修候補。
- 販売本部の月初在庫は ScriptProperties に保存される。リセット操作は運用上の影響が大きい。
- 本番 GAS/スプレッドシート変更前は、変更対象関数・対象シート・対象範囲を明示してから進める。

## 今後の作業での呼び出し方

ユーザーが「営業部ダッシュボード」「GAS」「HTML」「買取本部」「販売本部」「DASH_DB」と言ったら、このメモと原本2ファイルを参照してから作業する。

優先して確認するファイル:

1. `outputs/sales-dept-dashboard-memory.md`
2. `outputs/sales-dept-dashboard-gas.txt`
3. `outputs/sales-dept-dashboard-html.txt`

## すぐ使える作業方針

- 関数追加: GAS 側にデータ取得/生成関数を追加し、HTML 側 `runGas` から呼ぶ。
- 表示項目追加: まず DASH_DB のヘッダーに項目があるか確認し、GAS の返却オブジェクトと HTML の render 関数に追加。
- 計算式修正: 可能なら GAS の集計ロジック側で修正。スプレッドシート関数で対応する場合は対象タブ・列・行を確認。
- DB列追加: ヘッダー配列、値生成 switch、HTML の参照キー、関連DBへの転記処理をセットで見る。
- 速度改善: `getDataRange().getDisplayValues()` の範囲縮小、キャッシュキー削除漏れ改善、HTML 側の描画量削減を検討。
