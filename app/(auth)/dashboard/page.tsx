import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import { SearchBar } from '@/components/features/exam-browser/SearchBar'
import { SortToggle } from '@/components/features/exam-browser/SortToggle'
import { getAnalyticsData, getSharedExams } from '@/lib/supabase/db'
import { createClient } from '@/lib/supabase/server'
import { SharedExamsOptions } from '@/lib/types'
import DashboardClient from './DashboardClient'
import ExamList from '@/components/features/exam-browser/ExamList'

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
  const activeTab = params.tab || 'analytics'
  
  const analyticsData = await getAnalyticsData(user.id)

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
      <PageHeader title="ダッシュボード">
        <Button asChild>
          <Link href="/exams">試験管理</Link>
        </Button>
      </PageHeader>

      <Tabs value={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" asChild>
            <Link href="/dashboard?tab=analytics">アナリティクス</Link>
          </TabsTrigger>
          <TabsTrigger value="shared-exams" asChild>
            <Link href="/dashboard?tab=shared-exams">共有試験</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Suspense fallback={<div>読み込み中...</div>}>
            <DashboardClient analyticsData={analyticsData} />
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
              showImportButton={true}
              emptyMessage="共有試験がありません"
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  )
}