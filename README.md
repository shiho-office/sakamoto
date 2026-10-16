# さかもと司法書士事務所 ホームページ

GitHub Pages で無料公開する自作サイトです。お問合せフォームは Google Workspace の Apps Script（GAS）で n.sakamoto@shiho-office.biz にメール送信します。

## フォルダ構成

| ファイル | 内容 |
|---|---|
| index.html | トップページ |
| about.html | 事務所について（選ばれる理由・代表ごあいさつ・概要・地図） |
| service.html | 業務内容・報酬の目安・流れ・よくある質問 |
| news.html | お知らせ／法改正・制度情報 |
| contact.html | お問合せフォーム |
| privacy.html | プライバシーポリシー |
| style.css | デザイン（色は先頭の `:root` で一括変更） |
| config.js | **GASのURL・InstagramのURLを設定する場所** |
| news.json | お知らせ |
| law.json | 法改正・制度情報 |
| instagram.json | トップに埋め込むInstagram投稿のURL |
| sakamoto.jpg | 代表写真（この名前でアップロードすると表示されます） |

---

## 1. お問合せフォーム（GAS）の設定

1. **n.sakamoto@shiho-office.biz** で Google にログインし、<https://script.google.com> →「新しいプロジェクト」
2. 最初からあるコードを消し、`gas/Code.gs` の中身を貼り付けて保存（プロジェクト名は「HPお問合せ」など）
3. 上部の関数選択で `testSend` を選んで ▶実行 → 権限の確認画面で「許可」
   → n.sakamoto@ に通知メールと自動返信メールの2通が届けばOK
4. 右上「デプロイ」→「新しいデプロイ」→ 歯車から「ウェブアプリ」
   - 次のユーザーとして実行：**自分**
   - アクセスできるユーザー：**全員**
5. 表示された「ウェブアプリのURL」（`https://script.google.com/macros/s/……/exec`）をコピー
6. `config.js` の `GAS_URL` の値をそのURLに書き換え

> **「全員」が選べない場合**：Workspace の管理コンソールで外部公開が制限されています。
> 管理コンソール →「アプリ」→「Google Workspace」→「ドライブとドキュメント」→ 共有設定で、組織外との共有を許可してください。

> **コードを修正したとき**：「デプロイ」→「デプロイを管理」→ 鉛筆マーク →「バージョン：新しいバージョン」→ デプロイ。（URLは変わりません。「新しいデプロイ」を作るとURLが変わるので注意）

受付記録をスプレッドシートにも残したい場合は、空のスプレッドシートを作り、URLの `/d/` と `/edit` の間の文字列を `Code.gs` の `SHEET_ID` に貼り付けて再デプロイしてください。

---

## 2. GitHub にアップロードして公開

1. <https://github.com> でアカウント作成 →「New repository」
   - 名前：`shiho-office`（何でも可）／ **Public** を選択
2. リポジトリ画面の「uploading an existing file」から、ファイルをすべてドラッグ＆ドロップ（フォルダ分けはしません） →「Commit changes」
   - `.nojekyll` は隠しファイルなので、見えない場合はなくても動きます
3. 「Settings」→「Pages」→ Source：**Deploy from a branch**／Branch：**main**・**/(root)** → Save
4. 1〜2分後、`https://ユーザー名.github.io/shiho-office/` で表示されます

---

## 3. 独自ドメイン（www.shiho-office.biz）に切り替える

今の有料サービスを解約する前に、次の順で進めてください。

1. GitHub の「Settings」→「Pages」→ Custom domain に `www.shiho-office.biz` と入力して Save
2. ドメインを管理している会社（お名前.com、ムームードメインなど／分からなければ今の制作会社に確認）のDNS設定で：
   - `www` の **CNAME** を `ユーザー名.github.io` に変更
   - `shiho-office.biz`（@）の **A レコード** を次の4つに変更
     `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
3. 反映後（数時間〜1日）、Pages 設定の「Enforce HTTPS」にチェック

> ⚠️ **メールを止めないために**：n.sakamoto@shiho-office.biz は Google Workspace を使っています。DNS の **MX レコード・TXT レコード（Google の認証用）は絶対に消さず、そのまま**にしてください。変更するのは上の A と CNAME だけです。
>
> ⚠️ ドメインそのものが制作会社名義の場合は、解約前にドメインの移管（または名義変更）を必ず依頼してください。

Google Search Console を使っている場合、今のサイトの所有権確認タグ（google-site-verification）は新サイトにはありません。必要なら Search Console で「DNS レコード」による確認に切り替えてください。

---

## 4. 日々の更新方法（GitHub の画面だけでできます）

### お知らせを追加する
GitHub で `news.json` を開き、鉛筆マーク（Edit）→ 先頭の `[` の次の行に1件追加 → 「Commit changes」。数分で反映されます。

```json
  {
    "date": "2026-11-01",
    "title": "年末年始の休業のお知らせ",
    "tags": ["お知らせ"],
    "body": ["12月27日〜1月4日は休業いたします。", "フォームは期間中も受け付けています。"]
  },
```

- 日付の新しい順に自動で並びます
- `body` は省略可（タイトルだけの告知になります）
- `"link": "https://…"` を付けると「詳しくはこちら」リンクが出ます
- `"instagram": "https://www.instagram.com/p/…"` を付けると、その投稿へのリンクが出ます
- 項目の間の **カンマ（,）** の付け忘れ・付けすぎに注意（最後の1件の後ろには付けない）

### 法改正・制度情報を追加する
`law.json` に同じ形式で追加します。`"tags": ["相続", "重要"]` のように「重要」を入れると赤いラベルになります。`"source": "山梨県司法書士会"` で出典を表示できます。

> 司法書士会の会報や会員向け資料の文章をそのまま転載するのは避け、要点を自分の言葉でまとめ、公開されている一次情報（法務省など）にリンクする形が安全です。

### Instagram
1. アカウントを作ったら `config.js` の `INSTAGRAM_URL` に `https://www.instagram.com/アカウント名/` を入れる → フッターとトップにボタンが出ます
2. トップに投稿を載せたいときは、投稿の「…」→「リンクをコピー」して `instagram.json` に並べる（新しい順・最大3件表示）

```json
[
  "https://www.instagram.com/p/XXXXXXXX/",
  "https://www.instagram.com/p/YYYYYYYY/"
]
```

### 写真を入れる
代表のお写真を `sakamoto.jpg`（縦長、横800px程度）という名前でアップロードすると、トップと事務所ページに表示されます。
※今の有料サイトの写真のうち、制作会社が用意した素材写真は契約終了後に使えない場合があります。ご自身で撮影した写真を使うのが安心です。

### 報酬を変更する
`service.html` の「報酬の目安」の表の金額を書き換えます。トップページのカードにある「○○円〜」（`index.html`）も合わせて変更してください。
