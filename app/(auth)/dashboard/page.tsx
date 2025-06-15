import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import ExamList from '@/components/features/exam-browser/ExamList'
import { SearchBar } from '@/components/features/exam-browser/SearchBar'
import { SortToggle } from '@/components/features/exam-browser/SortToggle'
import { getDashboardStats, getUserExams, getSharedExams } from '@/lib/supabase/db'
import { createClient } from '@/lib/supabase/server'
import { SharedExamsOptions } from '@/lib/types'

interface DashboardPageProps {
  searchParams: Promise<{
    tab?: string
    q?: string
    sort?: 'newest' | 'likes'
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const params = await searchParams
  const activeTab = params.tab || 'my-exams'
  
  const [stats, userExams] = await Promise.all([
    getDashboardStats(user.id),
    getUserExams(user.id)
  ])

  // 共有試験は「共有試験」タブが選択されている場合のみ取得
  let sharedExams = []
  if (activeTab === 'shared-exams') {
    const options: SharedExamsOptions = {
      sortBy: params.sort || 'newest',
      searchTerm: params.q
    }
    sharedExams = await getSharedExams(user.id, options)
  }

  return (
    <main className="container py-8 px-4 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title={`おかえりなさい、${user.user_metadata.name || 'ユーザー'}さん`}
        description="効率的な学習を続けましょう"
      >
        <Button asChild>
          <Link href="/exams">試験追加</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="試験数"
          value={stats.totalExams}
          subtitle="インポート済み"
        />
        <StatCard
          title="問題数"
          value={stats.totalQuestions}
          subtitle="全試験合計"
        />
        <StatCard
          title="平均進捗"
          value={`${stats.averageProgress}%`}
          subtitle="全試験平均"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="学習時間"
          value={`${Math.floor(stats.totalSessionTime / 60)}h ${stats.totalSessionTime % 60}m`}
          subtitle="今週"
        />
      </div>

      <Tabs value={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-exams" asChild>
            <Link href="/dashboard?tab=my-exams">自分の試験</Link>
          </TabsTrigger>
          <TabsTrigger value="shared-exams" asChild>
            <Link href="/dashboard?tab=shared-exams">共有試験</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-exams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">自分の試験</h2>
            <Button variant="outline" asChild>
              <Link href="/exams">すべて表示</Link>
            </Button>
          </div>
          
          <Suspense fallback={<div>読み込み中...</div>}>
            <ExamList 
              exams={userExams} 
              emptyMessage="試験がありません。試験管理ページから問題集をインポートしてください。"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="shared-exams" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-semibold">共有試験</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="w-full sm:w-80">
                <SearchBar />
              </div>
              <SortToggle />
            </div>
          </div>
          
          <Suspense fallback={<div>読み込み中...</div>}>
            <ExamList 
              exams={sharedExams} 
              showLikeButton={true}
              emptyMessage="共有試験がありません"
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  )
}