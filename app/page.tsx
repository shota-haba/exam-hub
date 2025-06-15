import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <main className="flex-1">
        <section className="py-20 px-4 border-b">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              効率的な試験対策
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              4つの学習モードで最適化された学習体験を提供
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard">開始</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">学習モード</h2>
              <p className="text-muted-foreground">
                効率的な学習のための4つのアプローチ
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="予習"
                description="未学習問題に集中"
                color="bg-blue-50 dark:bg-blue-950"
              />
              <FeatureCard
                title="復習"
                description="間違えた問題を重点的に"
                color="bg-red-50 dark:bg-red-950"
              />
              <FeatureCard
                title="反復"
                description="正解問題で知識定着"
                color="bg-green-50 dark:bg-green-950"
              />
              <FeatureCard
                title="総合"
                description="全問題で実力測定"
                color="bg-yellow-50 dark:bg-yellow-950"
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">学習効果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">正答率向上</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
                <div className="text-sm text-muted-foreground">時間短縮</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">4</div>
                <div className="text-sm text-muted-foreground">学習モード</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">今すぐ開始</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
              Googleアカウントで簡単登録
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">ダッシュボードへ</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Exam Hub
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  title, 
  description,
  color
}: { 
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="feature-card">
      <CardHeader className="pb-4">
        <div className={`mb-2 w-12 h-12 rounded-lg ${color} mx-auto flex items-center justify-center`}>
          <div className="w-6 h-6 bg-current opacity-60 rounded-sm"></div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}