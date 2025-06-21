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
              学習プラットフォーム
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              効率的な学習システム
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard title="予習" />
              <FeatureCard title="復習" />
              <FeatureCard title="反復" />
              <FeatureCard title="総合" />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">統計</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-sm text-muted-foreground">正答率向上</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">60%</div>
                <div className="text-sm text-muted-foreground">時間短縮</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">4</div>
                <div className="text-sm text-muted-foreground">学習モード</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">開始</h2>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">ダッシュボード</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 border-t bg-muted">
        <div className="container max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 学習プラットフォーム
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title }: { title: string }) {
  return (
    <Card className="exam-card">
      <CardHeader className="pb-4">
        <div className="mb-2 w-12 h-12 rounded-lg bg-muted mx-auto flex items-center justify-center">
          <div className="w-6 h-6 bg-muted-foreground rounded-sm"></div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          {title}モード
        </CardDescription>
      </CardContent>
    </Card>
  )
}