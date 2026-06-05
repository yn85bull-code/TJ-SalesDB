# TJ-SalesOS デモURL作成手順

このデモは `tj-sales-os-demo.html` を Apps Script の HTML ファイルとして公開する想定です。

## 使うファイル

- `tj-sales-os-demo-Code.gs`
- `tj-sales-os-demo.html`

## 手順

1. Chromeで `https://script.new` を開く
2. `コード.gs` に `tj-sales-os-demo-Code.gs` の内容を貼り付ける
3. 左側の `+` から `HTML` を追加
4. ファイル名を `TJ_SalesOS_Demo` にする
   - Apps Script内のHTMLファイル名は重要です
   - `TJ_SalesOS_Demo.html` ではなく、作成時の名前欄には `TJ_SalesOS_Demo` と入力してください
   - もし別名で作った場合は `tj-sales-os-demo` または `Index` でも動くようにしてあります
5. `TJ_SalesOS_Demo.html` に `tj-sales-os-demo.html` の内容を貼り付ける
6. プロジェクト名を `TJ-SalesOS Demo` に変更
7. 右上の `デプロイ` → `新しいデプロイ`
8. 種類は `ウェブアプリ`
9. 実行ユーザーは `自分`
10. アクセスできるユーザーは `全員` または `リンクを知っている全員`
11. `デプロイ` を押す
12. 表示された Web アプリURLを共有する

## 注意

このHTMLはデモ確認用です。現在のプレビューと同じく、表示用のダミーデータで動く構成です。
本番スプレッドシート連動版として公開する場合は、GAS側の `getSalesDeptDashboard()` などの本番関数と接続してから公開してください。
