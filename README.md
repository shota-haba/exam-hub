# Exam Hub - Smart Learning Platform

効率的な試験対策を実現するモダンな学習プラットフォーム

## 🚀 特徴

- **4つの学習モード**: 予習、復習、反復、総合モードで効率的な学習
- **GitHub風デザイン**: ミニマルで直感的なインターフェース
- **ドラッグ&ドロップ**: 簡単な試験問題集のインポート
- **進捗可視化**: 詳細な学習統計とチャート
- **レスポンシブ対応**: PC、タブレット、スマートフォンに対応

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Animation**: Framer Motion
- **Backend**: Supabase (Database, Auth)
- **Authentication**: Google OAuth
- **File Upload**: React Dropzone

## 📋 必要な環境

- Node.js 18.0.0 以上
- npm または yarn
- Supabaseアカウント

## 🔧 セットアップ

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd exam-hub
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
`.env.local` ファイルを作成し、以下を設定:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **開発サーバーの起動**
```bash
npm run dev
```

## 📁 プロジェクト構造

```
exam-hub/
├── app/                    # Next.js App Router
│   ├── dashboard/         # ダッシュボードページ
│   ├── exams/            # 試験管理ページ
│   └── globals.css       # グローバルスタイル
├── components/           # 再利用可能なコンポーネント
│   ├── ui/              # UIコンポーネント
│   └── exam/            # クイズ関連コンポーネント
├── lib/                 # ユーティリティとライブラリ
│   ├── auth.tsx         # 認証ロジック
│   ├── supabase.ts      # Supabaseクライアント
│   └── types.ts         # TypeScript型定義
└── sample-exam.json     # サンプル試験データ
```

## 📊 サンプルデータ

`sample-exam.json` ファイルには、情報処理技術者試験の基本情報技術者レベルのサンプル問題が含まれています。このファイルを使用して、アプリケーションの動作を確認できます。

## 🎯 使用方法

1. **Googleアカウントでログイン**
2. **試験管理ページで問題集をインポート**
   - ドラッグ&ドロップまたはクリックでJSONファイルをアップロード
   - サンプルファイル `sample-exam.json` を使用可能
3. **ダッシュボードで学習モードを選択**
   - 予習モード: 未学習の問題
   - 復習モード: 間違えた問題
   - 反復モード: 正解した問題
   - 総合モード: 全ての問題
4. **学習設定を調整して開始**

## 🔄 学習モード

- **予習モード (Warmup)**: 未学習の問題に集中
- **復習モード (Review)**: 間違えた問題を重点復習
- **反復モード (Repetition)**: 正解した問題の知識定着
- **総合モード (Comprehensive)**: 全問題での実力測定

## 📈 進捗管理

- 学習統計の可視化
- 正答率の追跡
- 学習時間の記録
- 試験別進捗状況

## 🎨 デザインシステム

GitHub風のミニマルデザインを採用:
- クリーンで直感的なインターフェース
- 一貫したカラーパレット
- レスポンシブレイアウト
- スムーズなアニメーション

## 🚀 デプロイ

```bash
npm run build
npm start
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

---

**Exam Hub** - 効率的な学習で目標達成をサポート