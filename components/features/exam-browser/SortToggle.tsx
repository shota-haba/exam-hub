'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Heart, Clock } from 'lucide-react'

export function SortToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (sortBy: 'newest' | 'likes') => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.set('sort', sortBy)
      router.push(`/dashboard?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentSort === 'newest' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSortChange('newest')}
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        新着順
      </Button>
      <Button
        variant={currentSort === 'likes' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSortChange('likes')}
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <Heart className="h-4 w-4" />
        人気順
      </Button>
    </div>
  )
}