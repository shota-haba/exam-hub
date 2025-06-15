'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { importExamAction } from '@/actions/exam'
import { useToast } from '@/hooks/use-toast'

export function ExamImport() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleFileAccepted = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await importExamAction(formData)
      
      if (result.success) {
        toast({
          title: 'インポート完了',
          description: '試験をインポートしました',
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
    <Card className="exam-card">
      <CardHeader>
        <CardTitle>試験インポート</CardTitle>
        <CardDescription>
          JSON形式の問題集をアップロード
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileDropzone
          onFileAccepted={handleFileAccepted}
          disabled={isPending}
        />
        {isPending && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              インポート中...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}