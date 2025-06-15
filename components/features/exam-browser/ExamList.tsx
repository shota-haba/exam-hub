import { ExamSet } from '@/lib/types'
import ExamCard from './ExamCard'
import { Card, CardContent } from '@/components/ui/card'

interface ExamListProps {
  exams: ExamSet[]
  showLikeButton?: boolean
  emptyMessage?: string
}

export default function ExamList({ 
  exams, 
  showLikeButton = false, 
  emptyMessage = "試験がありません" 
}: ExamListProps) {
  if (exams.length === 0) {
    return (
      <Card className="exam-card border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 bg-muted rounded-lg mb-6 flex items-center justify-center">
            <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
          </div>
          <h3 className="text-xl font-medium mb-3">{emptyMessage}</h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <ExamCard 
          key={exam.id} 
          exam={exam} 
          showLikeButton={showLikeButton}
        />
      ))}
    </div>
  )
}