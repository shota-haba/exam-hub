'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateExamSharedAction } from '@/actions/exam'

interface ShareToggleProps {
  examId: string
  initialShared: boolean
}

export function ShareToggle({ examId, initialShared }: ShareToggleProps) {
  const [isShared, setIsShared] = useState(initialShared)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    setIsShared(checked)
    
    startTransition(async () => {
      const result = await updateExamSharedAction(examId, checked)
      if (!result.success) {
        // エラー時は元に戻す
        setIsShared(!checked)
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`share-${examId}`}
        checked={isShared}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <Label htmlFor={`share-${examId}`} className="text-sm">
        {isShared ? '公開中' : '非公開'}
      </Label>
    </div>
  )
}