# 営業部ダッシュボード HOME改修ガイド

作成日: 2026-05-31

## 一括差し替え版

- 本番GASへ貼り付けるHTML: `outputs/sales-dept-dashboard-html-fixed.txt`
- 確認用プレビュー: `outputs/sales-dept-dashboard-preview.html`

## 1. 修正後のHOME部分のHTML

`SalesDeptDashboard.html` の `view-home` を、以下の構成へ差し替え。

```html
<section id="view-home" class="view-section active">
  <h1 class="page-heading">HOME</h1>

  <section class="home-dashboard">
    <section class="dept-hero">
      <div id="areaMapBg" class="area-map-bg map-default"></div>
      <div class="dept-hero-main">
        <div class="dept-label">CURRENT SALES DEPARTMENT</div>
        <div class="dept-title" id="homeDeptName">-</div>
        <div class="dept-meta" id="homeDeptMeta">対象月：-　最終更新：-</div>
      </div>
      <div class="dept-hero-status" id="homeHeroStatus"></div>
    </section>

    <section class="home-kpi-block">
      <h2 class="section-title">最重要KPI</h2>
      <div class="home-kpi-grid" id="priorityGrid"></div>
    </section>

    <section class="home-avg-block">
      <h2 class="section-title">重要平均・CVR</h2>
      <div class="home-avg-grid" id="homeAverageGrid"></div>
    </section>
  </section>
</section>
```

## 2. 追加・修正CSS

追加した主なCSS:

- `.home-dashboard`
- `.dept-hero`
- `.area-map-bg`
- `.map-kanagawa`
- `.map-chiba`
- `.map-saitama`
- `.map-tokyo`
- `.map-ibaraki`
- `.map-osaka`
- `.map-kitakanto`
- `.dept-title`
- `.dept-meta`
- `.status-chip`
- `.home-kpi-block`
- `.home-kpi-grid`
- `.home-kpi-card`
- `.home-avg-block`
- `.home-avg-grid`
- `.home-avg-card`

地図画像が未用意でも、薄い地図風シェイプと `KANAGAWA AREA` などの背景文字で崩れず表示される。

## 3. renderDashboard() のHOME描画変更

HOME描画は以下へ変更。

- 営業部名: `dash.selectedDept || s['営業部名']`
- 対象月: `s['対象月']`
- 更新日時: `s['更新日時']`
- 最重要KPI:
  - TOPLINE: `s['売上']`
  - G: `s['G']`
  - F: `s['トータルF']`
  - MQ: `s['トータルMQ']`
  - 査定Q: `s['査定台数実績'] || s['査定Q']`、表示単位は `件`
  - 買取Q: `s['買取台数実績'] || s['買取Q']`、表示単位は `台`
  - 販売Q: `s['販売台数実績'] || s['販売Q']`、表示単位は `台`
- 重要平均・CVR:
  - 査定CVR: `s['査定CVR']`
  - 成約CVR: `s['買取成約CVR'] || s['成約CVR']`
  - AA@: `s['AA@'] || s['AA平均粗利']`
  - 販売@: `calcAverage(s['販売純MQ'] || s['販売MQ'], s['販売台数実績'] || s['販売Q'])`

## 4. 追加関数

```js
function setAreaMapBackground(deptName) {
  const el = document.getElementById('areaMapBg');
  if (!el) return;

  el.className = 'area-map-bg';
  const name = String(deptName || '');

  if (name.includes('神奈川')) el.classList.add('map-kanagawa');
  else if (name.includes('千葉')) el.classList.add('map-chiba');
  else if (name.includes('埼玉')) el.classList.add('map-saitama');
  else if (name.includes('東京')) el.classList.add('map-tokyo');
  else if (name.includes('茨城')) el.classList.add('map-ibaraki');
  else if (name.includes('大阪')) el.classList.add('map-osaka');
  else if (name.includes('北関東') || name.includes('栃木') || name.includes('群馬')) el.classList.add('map-kitakanto');
  else el.classList.add('map-default');
}
```

## 5. 削除・差し替え対象

HOME内で削除・統合した既存要素:

- `basicInfo`
- `aaAvg`
- `salesAvg`
- `mainG`
- `mainSales`
- `mainMq`
- `mainF`
- 旧 `priorityGrid` の5項目構成

`priorityGrid` 自体のIDは維持し、7KPI用のグリッドとして再利用。

## 6. 既存機能への影響

GAS側関数は変更なし。

以下は既存のまま:

- `getSalesDeptDashboard()`
- `getSalesDeptDaily()`
- `getSalesDeptMembers()`
- `getSalesDeptStores()`
- 実績管理
- 集客情報管理
- 買取本部
- 販売本部

HTML側のHOME表示構成だけを中心に改修。
