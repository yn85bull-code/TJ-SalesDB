# TJ-SalesOS 本番連動スタートメモ

## 方針

デモデータは残します。

ただし、本番コードには混ぜません。

- 本番用: `SalesDeptDashboard-production.html`
- デモ確認用: `tj-sales-os-demo.html`
- 本番GAS: `tj-sales-os-production-backend.gs`

本番用HTMLには、デモ用の `window.google = ...` モックは入っていません。
Apps Script上では `google.script.run` から本番GAS関数を呼びます。

## 今回作成した本番GAS

`tj-sales-os-production-backend.gs` は、基幹データとTJ-SalesOSをつなぐ初版です。

主な特徴:

- 列番号固定ではなく、ヘッダー名で値を取得
- 本部は全営業部を合算
- 営業部は該当営業部だけを表示
- 社員名簿、拠点別、個人別、日別、目標設定を読み取り
- 速報を `TJ速報` シートへ保存
- 日報を `TJ日報アーカイブ` シートへ保存
- 月締めレポートを `TJ月締めレポート` シートへ保存
- 23:59付近の自動日報保存トリガー作成関数つき

## Apps Scriptへ貼るもの

1. `tj-sales-os-production-backend.gs`
2. `SalesDeptDashboard-production.html`

## Apps Script側の作業

1. 基幹データのApps Scriptを開く
2. GASファイルに `tj-sales-os-production-backend.gs` の内容を貼る
3. 左側の `+` からHTMLファイルを作成
4. HTMLファイル名を `SalesDeptDashboard` にする
5. `SalesDeptDashboard-production.html` の内容を貼る
6. 保存
7. Apps Script上で `getSalesDeptOptions()` を実行して部署一覧が返るか確認
8. 問題なければWebアプリとしてデプロイ

## 必要に応じて調整する場所

基幹シート側のタブ名が違う場合は、GAS冒頭の `TJ_OS.sheets` に候補名を追加してください。

例:

```js
dashboard: ['営業部DASH_DB', '営業部別集計', '営業部別集計表', '営業部集計'],
```

## 注意

ローカルにある `sales-dept-dashboard-gas.txt` は文字化けしているため、本番反映には使わないでください。
今回の `tj-sales-os-production-backend.gs` を本番連動の起点にします。
