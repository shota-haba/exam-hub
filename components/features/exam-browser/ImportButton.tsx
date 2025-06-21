'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { importSharedExamAction } from '@/actions/exam'

interface ImportButtonProps {
  examId: string
  examTitle: string
}

export function ImportButton({ examId, examTitle }: ImportButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleImport = () => {
    startTransition(async () => {
      const result = await importSharedExamAction(examId)
      if (result.success) {
        toast({
          title: 'インポート完了',
          description: `${examTitle}をインポートしました`,
        })
      } else {
        toast({
          title: 'インポートエラー',
          description: result.error || 'インポートに失敗しました',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Button
      onClick={handleImport}
      disabled={isPending}
      className="w-full flex items-center gap-2"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      {isPending ? 'インポート中...' : 'インポート'}
    </Button>
  )
}