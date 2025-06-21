import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExamSet } from '@/lib/types'
import { LikeButton } from './LikeButton'
import { ImportButton } from './ImportButton'

interface ExamCardProps {
  exam: ExamSet
  showLikeButton?: boolean
  showImportButton?: boolean
}

export default function ExamCard({ exam, showLikeButton = false, showImportButton = false }: ExamCardProps) {
  const questionCount = exam.data?.questions?.length || 0

  return (
    <Card className="exam-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg">{exam.title}</CardTitle>
            <CardDescription>
              {new Date(exam.created_at).toLocaleDateString('ja-JP')}
            </CardDescription>
          </div>
          {showLikeButton && (
            <LikeButton 
              examId={exam.id} 
              initialLiked={exam.isLiked || false}
              likesCount={exam.likes_count}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {questionCount}設問
          </Badge>
          {exam.is_shared && (
            <Badge variant="outline">
              公開中
            </Badge>
          )}
        </div>
      </CardContent>

      {showImportButton && (
        <CardFooter>
          <ImportButton examId={exam.id} examTitle={exam.title} />
        </CardFooter>
      )}
    </Card>
  )
}