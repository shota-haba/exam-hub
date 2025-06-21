'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { SessionMode, Question, QuestionResult, ExamSet } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { saveSessionResultAction } from '@/actions/exam'
import Link from 'next/link'

type SessionResults = {
  correctCount: number
  totalQuestions: number
  timeTaken: number
  questions: QuestionResult[]
}

export default function ExamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const examId = params.id as string
  const mode = searchParams.get('mode') as SessionMode || SessionMode.Warmup
  const count = parseInt(searchParams.get('count') || '10')
  const timeLimit = parseInt(searchParams.get('time') || '30')
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [results, setResults] = useState<SessionResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionStartTime] = useState(new Date())
  
  const [sessionQuestions, setSessionQuestions] = useState<QuestionResult[]>([])

  const currentQuestion = questions[currentQuestionIndex]
  
  useEffect(() => {
    if (!user || !examId) return
    
    const fetchExamSet = async () => {
      try {
        const { data, error } = await supabase
          .from('exam_sets')
          .select('*')
          .eq('id', examId)
          .single()
        
        if (error) throw error
        setExamSet(data)
        
        if (!data.data?.questions || data.data.questions.length === 0) {
          throw new Error('設問が見つかりません')
        }
        
        const allQuestions = [...data.data.questions]
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(count, allQuestions.length))
        
        const preparedQuestions = selectedQuestions.map(q => {
          const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5)
          return {
            ...q,
            choices: shuffledChoices
          }
        })
        
        setQuestions(preparedQuestions)
        setSessionQuestions(preparedQuestions.map(q => ({
          question: q,
          selectedAnswer: null,
          isCorrect: false,
          timeSpent: 0
        })))
        
      } catch (error) {
        console.error('試験取得エラー:', error)
        toast({
          title: 'エラー',
          description: '試験の取得に失敗しました',
          variant: 'destructive',
        })
        router.push('/exams')
      } finally {
        setLoading(false)
      }
    }
    
    fetchExamSet()
  }, [examId, user, count, mode, router, toast])
  
  useEffect(() => {
    if (loading || !currentQuestion || isAnswered || results || timeLimit === 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAnswer(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [loading, currentQuestion, isAnswered, results, timeLimit])
  
  useEffect(() => {
    if (!loading && currentQuestion && !isAnswered) {
      setTimeLeft(timeLimit)
    }
  }, [currentQuestionIndex, isAnswered, loading, currentQuestion, timeLimit])
  
  const handleAnswer = useCallback((answerId: string | null) => {
    if (isAnswered || !currentQuestion) return
    
    const timeSpent = timeLimit > 0 ? timeLimit - timeLeft : 0
    const isCorrect = currentQuestion.choices.find(c => c.identifier === answerId)?.isCorrect || false
    
    setSelectedAnswer(answerId)
    setIsAnswered(true)
    setShowExplanation(true) // 即座に解説を表示
    
    setSessionQuestions(prev => {
      const updated = [...prev]
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        selectedAnswer: answerId,
        isCorrect,
        timeSpent
      }
      return updated
    })
    
    toast({
      title: isCorrect ? '正解' : '不正解',
      variant: isCorrect ? 'default' : 'destructive',
    })
  }, [isAnswered, currentQuestion, timeLimit, timeLeft, currentQuestionIndex, toast])
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setShowExplanation(false)
    } else {
      finishSession()
    }
  }
  
  const finishSession = async () => {
    const correctCount = sessionQuestions.filter(q => q.isCorrect).length
    const totalTimeSpent = sessionQuestions.reduce((sum, q) => sum + q.timeSpent, 0)
    
    const sessionResults = {
      correctCount,
      totalQuestions: questions.length,
      timeTaken: totalTimeSpent,
      questions: sessionQuestions
    }
    
    setResults(sessionResults)
    
    // セッション結果を保存
    if (examSet) {
      await saveSessionResultAction({
        examId: examSet.id,
        mode,
        startTime: sessionStartTime,
        endTime: new Date(),
        score: correctCount,
        totalQuestions: questions.length,
        questionsData: sessionQuestions
      })
    }
  }
  
  const restartExam = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setShowExplanation(false)
    setResults(null)
    
    if (examSet?.data?.questions) {
      const allQuestions = [...examSet.data.questions]
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)
      const selectedQuestions = shuffledQuestions.slice(0, Math.min(count, allQuestions.length))
      
      const preparedQuestions = selectedQuestions.map(q => {
        const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5)
        return {
          ...q,
          choices: shuffledChoices
        }
      })
      
      setQuestions(preparedQuestions)
      setSessionQuestions(preparedQuestions.map(q => ({
        question: q,
        selectedAnswer: null,
        isCorrect: false,
        timeSpent: 0
      })))
    }
  }
  
  if (loading) {
    return (
      <div className="container py-8 px-4 flex justify-center">
        <div>読み込み中...</div>
      </div>
    )
  }
  
  if (results) {
    return (
      <main className="container py-8 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">学習結果</h1>
        
        <Card className="exam-card mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">正解数</p>
                <p className="text-2xl font-bold">{results.correctCount}/{results.totalQuestions}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">正答率</p>
                <p className="text-2xl font-bold">{Math.round((results.correctCount / results.totalQuestions) * 100)}%</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-muted-foreground">所要時間</p>
                <p className="text-2xl font-bold">{Math.round(results.timeTaken)}秒</p>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">設問別結果</h2>
            <div className="space-y-4">
              {results.questions.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${item.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.isCorrect ? '○' : '×'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.question.text}</p>
                      </div>
                    </div>
                    
                    <div className="ml-9 space-y-2">
                      <div>
                        <p className="text-sm font-medium">すべての選択肢:</p>
                        <div className="space-y-1">
                          {item.question.choices.map(choice => (
                            <div key={choice.id} className={`text-sm p-2 rounded ${
                              choice.isCorrect ? 'bg-green-50 border border-green-200' :
                              item.selectedAnswer === choice.identifier ? 'bg-red-50 border border-red-200' :
                              'bg-gray-50'
                            }`}>
                              <span className="font-medium">{choice.identifier}.</span> {choice.text}
                              {choice.isCorrect && <span className="ml-2 text-green-600 font-medium">(正解)</span>}
                              {item.selectedAnswer === choice.identifier && !choice.isCorrect && <span className="ml-2 text-red-600 font-medium">(選択)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {item.question.explanation && (
                        <div>
                          <p className="text-sm font-medium">公式解説:</p>
                          <p className="text-sm text-muted-foreground">{item.question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 pt-2 pb-6">
            <Button onClick={restartExam} variant="outline">
              再学習
            </Button>
            <Button asChild>
              <Link href="/dashboard">ダッシュボード</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }
  
  if (!currentQuestion) {
    return (
      <div className="container py-8 px-4 flex flex-col items-center">
        <p className="mb-4">設問が見つかりませんでした</p>
        <Button asChild>
          <Link href="/exams">試験一覧に戻る</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <main className="container py-8 px-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{examSet?.title}</h2>
          <p className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {questions.length}設問
          </p>
        </div>
        {timeLimit > 0 && (
          <div className="flex items-center">
            <span className="font-bold">{timeLeft}秒</span>
          </div>
        )}
      </div>
      
      <Progress 
        value={(currentQuestionIndex / questions.length) * 100} 
        className="h-2 mb-6" 
      />
      
      <Card className="exam-card mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
          
          <RadioGroup 
            value={selectedAnswer || ''} 
            onValueChange={isAnswered ? undefined : handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.choices.map((choice) => (
              <div 
                key={choice.id}
                className={`question-choice ${
                  isAnswered && choice.isCorrect ? 'correct' : 
                  isAnswered && selectedAnswer === choice.identifier && !choice.isCorrect ? 'incorrect' : ''
                }`}
              >
                <RadioGroupItem
                  value={choice.identifier}
                  id={choice.id}
                  disabled={isAnswered}
                  className="absolute left-4 top-4 peer sr-only"
                />
                <Label 
                  htmlFor={choice.id} 
                  className="flex items-start cursor-pointer"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-primary mr-3">
                    <span className="text-sm">{choice.identifier}</span>
                  </div>
                  <div>{choice.text}</div>
                </Label>
                {isAnswered && choice.isCorrect && (
                  <div className="absolute right-4 top-4 w-5 h-5 bg-green-600 rounded-full"></div>
                )}
                {isAnswered && selectedAnswer === choice.identifier && !choice.isCorrect && (
                  <div className="absolute right-4 top-4 w-5 h-5 bg-red-600 rounded-full"></div>
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isAnswered && showExplanation && currentQuestion.explanation && (
            <div className="explanation-box">
              <div className="flex">
                <div className="w-5 h-5 bg-blue-600 rounded-full mr-2 shrink-0 mt-0.5"></div>
                <div>
                  <h3 className="font-medium mb-1">解説</h3>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-end pt-2 pb-6">
          {isAnswered ? (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? '次の設問' : '結果を見る'}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleAnswer(null)}>
              スキップ
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}