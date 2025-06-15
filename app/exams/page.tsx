'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, ExamSet } from '@/lib/supabase'
import Header from '@/components/Header'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { examSetSchema, transformImportedExam, transformExamForExport } from '@/lib/schemas/exam'
import { motion } from 'framer-motion'

/**
 * 試験管理ページ
 */
export default function ExamsPage() {
  const { user } = useAuth()
  const [examSets, setExamSets] = useState<ExamSet[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    averageProgress: 0,
    totalSessionTime: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    fetchExamSets()
  }, [user])

  /**
   * 試験セット一覧取得
   */
  const fetchExamSets = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setExamSets(data || [])
      
      const totalQuestions = data?.reduce((sum, exam) => sum + (exam.data?.questions?.length || 0), 0) || 0
      setStats({
        totalExams: data?.length || 0,
        totalQuestions,
        averageProgress: 65,
        totalSessionTime: 120
      })
    } catch (error) {
      console.error('試験一覧取得エラー:', error)
      toast({
        title: 'エラー',
        description: '試験一覧の取得に失敗しました',
        variant: 'destructive',
      })
    }
  }

  /**
   * ファイルインポート処理
   */
  const handleFileAccepted = async (file: File) => {
    if (!user) return
    
    setIsImporting(true)
    
    try {
      const fileContent = await file.text()
      const jsonData = JSON.parse(fileContent)
      
      const validatedExamSet = examSetSchema.parse(jsonData)
      const appExamSet = transformImportedExam(validatedExamSet)
      
      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: appExamSet.title,
          user_id: user.id,
          data: appExamSet,
        })
        .select()
      
      if (error) throw error
      
      toast({
        title: 'インポート完了',
        description: `「${appExamSet.title}」をインポートしました`,
      })
      
      fetchExamSets()
    } catch (error) {
      console.error('インポートエラー:', error)
      toast({
        title: 'インポートエラー',
        description: 'ファイル形式が正しくありません',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  /**
   * 試験エクスポート処理
   */
  const handleExportExam = async (examSetId: string) => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single()
      
      if (error) throw error
      
      const exportData = transformExamForExport(data.data)
      const jsonString = JSON.stringify(exportData, null, 2)
      
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'エクスポート完了',
        description: `「${data.title}」をエクスポートしました`,
      })
    } catch (error) {
      console.error('エクスポートエラー:', error)
      toast({
        title: 'エクスポートエラー',
        description: 'エクスポートに失敗しました',
        variant: 'destructive',
      })
    }
  }

  /**
   * 試験削除処理
   */
  const handleDeleteExam = async (examSetId: string) => {
    if (!confirm('この試験を削除しますか？')) return
    
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', examSetId)
      
      if (error) throw error
      
      toast({
        title: '削除完了',
        description: '試験を削除しました',
      })
      
      fetchExamSets()
    } catch (error) {
      console.error('削除エラー:', error)
      toast({
        title: '削除エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 px-4 max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">試験管理</h1>
            <p className="text-muted-foreground">
              問題集のインポート・管理
            </p>
          </div>
        </div>

        {/* 統計 */}
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

        {/* インポート */}
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
              disabled={isImporting}
            />
            {isImporting && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  インポート中...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 試験一覧 */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">試験一覧</h2>
          
          {examSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examSets.map((examSet, index) => (
                <motion.div
                  key={examSet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ExamCard 
                    examSet={examSet} 
                    onExport={handleExportExam}
                    onDelete={handleDeleteExam}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="exam-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
                </div>
                <h3 className="text-xl font-medium mb-3">試験がありません</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  上記のフォームから試験問題集をインポートしてください
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

/**
 * 統計カードコンポーネント
 */
function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  title: string;
  value: string | number;
  subtitle: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {subtitle}
          {trend && (
            <span className={`ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * 試験カードコンポーネント
 */
function ExamCard({ 
  examSet, 
  onExport, 
  onDelete 
}: { 
  examSet: ExamSet
  onExport: (id: string) => void
  onDelete: (id: string) => void
}) {
  const questionCount = examSet.data?.questions?.length || 0
  const progress = 70
  
  return (
    <Card className="exam-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{examSet.title}</CardTitle>
            <CardDescription>
              {new Date(examSet.created_at).toLocaleDateString('ja-JP')}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport(examSet.id)}>
                エクスポート
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(examSet.id)}
                className="text-destructive focus:text-destructive"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary">
            {questionCount}問
          </Badge>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">進捗</div>
            <div className="text-sm font-semibold">{progress}%</div>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/dashboard`}>
            学習開始
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}