import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/shared/PageHeader'
import { ExamImport } from '@/components/features/exam-manager/ExamImport'
import { ShareToggle } from '@/components/features/exam-manager/ShareToggle'
import { getUserExams } from '@/lib/supabase/db'
import { createClient } from '@/lib/supabase/server'
import { ExamSet } from '@/lib/types'
import { deleteExamAction } from '@/actions/exam'

export default async function ExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const exams = await getUserExams(user.id)

  return (
    <main className="container py-8 px-4 max-w-7xl mx-auto space-y-8">
      <PageHeader title="試験管理" />

      <ExamImport />
      
      <div>
        <h2 className="text-2xl font-semibold mb-6">試験一覧</h2>
        
        <Suspense fallback={<div>読み込み中...</div>}>
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <ExamManagementCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <Card className="exam-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
                </div>
                <h3 className="text-xl font-medium mb-3">試験がありません</h3>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>
    </main>
  )
}

function ExamManagementCard({ exam }: { exam: ExamSet }) {
  const questionCount = exam.data?.questions?.length || 0

  const handleDelete = async () => {
    if (!confirm('この試験を削除しますか？')) return
    await deleteExamAction(exam.id)
  }

  return (
    <Card className="exam-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{exam.title}</CardTitle>
            <CardDescription>
              {new Date(exam.created_at).toLocaleDateString('ja-JP')}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {questionCount}設問
          </Badge>
        </div>

        <ShareToggle examId={exam.id} initialShared={exam.is_shared} />
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href="/dashboard">
            学習開始
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}