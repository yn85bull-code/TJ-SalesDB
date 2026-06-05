# TJ-SalesOS 検証版 参照突き合わせ手順

## 1. 検証版 Apps Script

https://script.google.com/u/0/home/projects/1U01rigm6VPsorpf6Di7xP3gyDRp5rkAxhio-i9M-Li9hQ6Ud1PsKmSTx/edit

## 2. コード.gs に貼るファイル

このファイルを丸ごと `コード.gs` に貼り替えます。

`outputs/tj-sales-os-staging-backend.gs`

## 3. デプロイ

保存後、既存のウェブアプリを「新しいバージョン」でデプロイします。

## 4. 参照マップ作成URL

デプロイ後、下記URLを開くと基幹スプシ内に `TJ検証_参照マップ` が作成されます。

https://script.google.com/macros/s/AKfycbyvCcMOeRtL_N1sjD8sDC1BVqO9Qeiur8BwYCv4rtAOErvd-EuKilmLLLTmA4d_cViCjg/exec?debug=map

## 5. 確認するスプシ

https://docs.google.com/spreadsheets/d/1uzzA7hHHPS1WaEACwKK82XL8cuEy4LQmAP_jiz7ycoE/edit

作成されるシート: `TJ検証_参照マップ`

## 6. 見るポイント

- `シート未確認`: OS側の候補シート名と実シート名が違う
- `列未確認`: シートは見つかっているがヘッダー名が違う
- `OK: xxx`: OS側で拾える列
