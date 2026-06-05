# TJ-SalesOS Page Split Instruction

This file records the page split instruction received on 2026-06-02.

## Core Policy

TJ-SalesOS must use `超新世界リンクOS` as the core data layer.

Data flow:

```text
各種CSV
-> 各種集計シート
-> 超新世界リンクOS
-> WEBダッシュボード
```

The WEB app should be one unified TJ-SalesOS screen. Do not create separate HTML or GAS files per department.

## Menu Order

1. HOME
2. 基本情報
3. 買取詳細
4. 販売詳細
5. 情報詳細
6. 目標管理
7. 個人実績
8. カレンダー
9. 設定

## View IDs

- `view-home`
- `view-basic`
- `view-purchase`
- `view-sales`
- `view-marketing`
- `view-target`
- `view-personal`
- `view-calendar`
- `view-settings`

## Menu Button IDs

- `menu-home`
- `menu-basic`
- `menu-purchase`
- `menu-sales`
- `menu-marketing`
- `menu-target`
- `menu-personal`
- `menu-calendar`
- `menu-settings`

## Color Area Mapping

- HOME: 全体サマリー
- 基本情報: 黄色エリア
- 買取詳細: 緑エリア
- 販売詳細: 水色エリア
- 情報詳細: 紫エリア
- 目標管理: オレンジエリア
- 個人実績: 赤エリア
- カレンダー: グレーエリア
- 設定: 参照設定、営業部設定

## Reference Method

Use the `参照設定` sheet to switch the source spreadsheet and sheet by selected department.

`参照設定` headers:

- 営業部名
- スプレッドシートID
- シート名
- 対象月
- 有効フラグ
- 備考

Required GAS functions:

- `buildSalesOsReferenceSheet()`
- `getSalesOsDeptOptions()`
- `getSalesOsReferenceConfig(deptName)`
- `getSalesOsDashboardByDept(deptName)`

Frontend behavior:

- Use one shared department dropdown on all pages.
- When department changes, call `getSalesOsDashboardByDept(deptName)`.
- Save the result to `window.salesOsData`.
- Call `renderAllPages(data)`.
- Page switching should only toggle active view/menu classes.

## Page Requirements

### HOME

Show overall summary:

- 営業部名
- 対象月
- 更新日時
- G
- MQ
- F
- 査定Q
- 買取Q
- 販売Q
- 情報数
- 開示数
- 成約数
- 重要アラート

### 基本情報

Use yellow area:

- 営業部名
- スタッフ数
- 責任者数
- 買取営業人数
- 販売営業人数
- 事務人数
- その他人数
- 営業部内拠点
- 人員構成

### 買取詳細

Use green area:

- 査定Q
- 買取Q
- 成約CVR
- AAQ
- 商品Q
- スクラップQ
- 代車Q
- AA比率
- 商品比率
- スクラップ比率
- 代車比率
- スクラップMQ
- KBMQ
- 落札Q
- 流札Q
- 取消Q
- 未処理Q
- 持越Q
- 赤字Q
- 落札MQ
- AA@
- 未処理MQ
- 赤字金額
- 即決成約
- 管理契約
- キャンセルQ
- 入庫平均日数
- 即日
- 過去当日
- 過去後日
- 後日

Ratio rules:

- AA比率、商品比率、スクラップ比率、代車比率: denominator is 買取Q.
- AA詳細の各比率: denominator is 落札Q.
- 即日、過去当日、過去後日、後日: denominator is 買取Q.

### 販売詳細

Use blue area:

- 納車Q
- 未納車Q
- 翌月納車Q
- 即納Q
- 即納比率
- 前月Q
- 前月比率
- 翌月Q
- 翌月比率
- 回転率
- 在庫Q
- 受注Q
- 販売済Q
- 掲載Q
- 未掲載Q
- 未入庫Q
- 未受入Q
- 配車在庫Q
- キャパQ
- キャパ比率
- 在庫金額
- 納車済MQ
- 未納車MQ
- 納車KBMQ
- 未納車KBMQ
- 納車付帯MQ
- 未納車付帯MQ
- 翌月納車MQ
- 販売総MQ
- 付帯詳細各項目のQ、比率、MQ

### 情報詳細

Use purple area:

- 情報数
- 開示数
- 査定数
- 成約数
- 開示率
- 査定率
- 成約率
- 情報数、開示数、査定数、成約数の目標進捗
- 情報料金
- 成約CPA
- 査定CPA
- 買取営業人数
- 1人当たり情報数
- 直近層件数
- 検討層件数
- 潜在層件数
- 直近層比率
- 検討層比率
- 潜在層比率

Forecast:

```text
予想実績 = 現在実績 / 経過日数 * 月間日数
```

### 目標管理

Use orange area:

- 営業部目標
- 買取目標
- 販売目標
- 情報数目標
- 開示数目標
- 査定数目標
- 成約数目標
- MQ目標
- F目標
- G目標
- 着地予測
- 目標差分

### 個人実績

Use red area:

- 個人名
- 拠点名
- 役職
- ランク
- 査定Q
- 買取Q
- 販売Q
- MQ
- 成約率
- 目標進捗
- 目標差分

Ranking:

- MQ
- 査定Q
- 買取Q
- 販売Q
- 成約率

### カレンダー

Use gray area:

- 月間日数
- 経過日数
- 残日数
- 日数進捗
- 日別実績
- 日別目標
- 日別進捗
- 着地予測

### 設定

Show `参照設定` list. Editing can be added later.

## Design

- Fixed left side menu.
- Right side content area.
- White, red, and black as main colors.
- Add each color area's accent color to the relevant page.
- Keep the overall UI unified as TJ-SalesOS.
- Make numbers large and readable.
- Use bars for ratios.
- Format money with comma separators.
- Add Q suffix to Q items.
- Show `0` or `-` for zero/blank values.

## Implementation Priority

1. Reference settings method
2. Department dropdown
3. HOME
4. 基本情報
5. 買取詳細
6. 販売詳細
7. 情報詳細
8. 目標管理
9. 個人実績
10. カレンダー
11. 設定
