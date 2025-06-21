'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SessionMode } from '@/lib/types'
import Link from 'next/link'

interface AnalyticsData {
  id: string
  title: string
  warmupCount: number
  reviewCount: number
  repetitionCount: number
  todaySessions: number
  totalSessions: number
  totalStudyTime: number
}

interface DashboardClientProps {
  analyticsData: AnalyticsData[]
}

export default function DashboardClient({ analyticsData }: DashboardClientProps) {
  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [sessionMode, setSessionMode] = useState<SessionMode>(SessionMode.Warmup)
  const [questionCount, setQuestionCount] = useState([10])
  const [timeLimit, setTimeLimit] = useState([30])

  const handleStartSession = (examId: string) => {
    const params = new URLSearchParams({
      mode: sessionMode,
      count: questionCount[0].toString(),
      time: timeLimit[0].toString()
    })
    
    window.location.href = `/exam/${examId}?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">アナリティクス</h2>
      
      {analyticsData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">試験データがありません</p>
          <Button asChild className="mt-4">
            <Link href="/exams">試験をインポート</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>試験タイトル</TableHead>
                <TableHead className="text-center">予習設問数</TableHead>
                <TableHead className="text-center">復習設問数</TableHead>
                <TableHead className="text-center">反復設問数</TableHead>
                <TableHead className="text-center">日計セッション数</TableHead>
                <TableHead className="text-center">累計セッション数</TableHead>
                <TableHead className="text-center">累計学習時間</TableHead>
                <TableHead className="text-center">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell className="text-center">{exam.warmupCount}</TableCell>
                  <TableCell className="text-center">{exam.reviewCount}</TableCell>
                  <TableCell className="text-center">{exam.repetitionCount}</TableCell>
                  <TableCell className="text-center">{exam.todaySessions}</TableCell>
                  <TableCell className="text-center">{exam.totalSessions}</TableCell>
                  <TableCell className="text-center">{exam.totalStudyTime}分</TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedExam(exam.id)}
                        >
                          学習開始
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>学習設定</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <Label className="text-base font-medium">学習モード</Label>
                            <RadioGroup 
                              value={sessionMode} 
                              onValueChange={(value) => setSessionMode(value as SessionMode)}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={SessionMode.Warmup} id="warmup" />
                                <Label htmlFor="warmup">予習</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={SessionMode.Review} id="review" />
                                <Label htmlFor="review">復習</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={SessionMode.Repetition} id="repetition" />
                                <Label htmlFor="repetition">反復</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={SessionMode.Comprehensive} id="comprehensive" />
                                <Label htmlFor="comprehensive">総合</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div>
                            <Label className="text-base font-medium">
                              出題設問数: {questionCount[0]}問
                            </Label>
                            <Slider
                              value={questionCount}
                              onValueChange={setQuestionCount}
                              max={50}
                              min={5}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-base font-medium">
                              制限時間: {timeLimit[0] === 0 ? '無制限' : `${timeLimit[0]}秒`}
                            </Label>
                            <Slider
                              value={timeLimit}
                              onValueChange={setTimeLimit}
                              max={120}
                              min={0}
                              step={10}
                              className="mt-2"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => selectedExam && handleStartSession(selectedExam)}
                            className="w-full"
                          >
                            開始
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}