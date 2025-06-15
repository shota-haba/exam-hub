'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SessionMode, ExamConfig, ExamSet, ExamStats, UserStats } from '@/lib/types';
import { ExamConfigModal } from '@/components/exam/exam-config-modal';

/**
 * ダッシュボードページ
 */
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [examStats, setExamStats] = useState<ExamStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    mode: SessionMode;
    examId: string;
  }>({
    isOpen: false,
    mode: SessionMode.Warmup,
    examId: ''
  });

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  /**
   * ダッシュボードデータ取得
   */
  const fetchDashboardData = async () => {
    try {
      const { data: exams, error: examsError } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      setExamSets(exams || []);

      const stats: ExamStats[] = [];
      let totalQuestions = 0;
      let totalAttempted = 0;
      let totalCorrect = 0;

      for (const exam of exams || []) {
        const questionCount = exam.data?.questions?.length || 0;
        totalQuestions += questionCount;

        const attempted = Math.floor(questionCount * 0.7);
        const correct = Math.floor(attempted * 0.8);
        
        totalAttempted += attempted;
        totalCorrect += correct;

        stats.push({
          examId: exam.id,
          examTitle: exam.title,
          totalQuestions: questionCount,
          attemptedQuestions: attempted,
          correctAnswers: correct,
          overallProgress: questionCount > 0 ? (attempted / questionCount) * 100 : 0,
          accuracyRate: attempted > 0 ? (correct / attempted) * 100 : 0,
          lastStudied: exam.created_at,
          sessionStreak: 3
        });
      }

      setExamStats(stats);

      setUserStats({
        totalExams: exams?.length || 0,
        totalQuestions,
        totalAttempted,
        overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
        sessionTime: 120,
        sessionStreak: 7,
        weeklyProgress: [65, 70, 75, 80, 85, 90, 95]
      });

    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 学習モード選択処理
   */
  const handleModeSelect = (mode: SessionMode, examId: string) => {
    setConfigModal({
      isOpen: true,
      mode,
      examId
    });
  };

  /**
   * 試験開始処理
   */
  const handleExamStart = (config: ExamConfig) => {
    setConfigModal({ isOpen: false, mode: SessionMode.Warmup, examId: '' });
    router.push(`/exam/${configModal.examId}?mode=${config.mode}&count=${config.maxQuestions}&time=${config.timePerQuestion}`);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 px-4 flex justify-center">
          <div className="animate-pulse">読み込み中...</div>
        </div>
      </div>
    );
  }

  const selectedExam = examSets.find(exam => exam.id === configModal.examId);
  const maxQuestions = selectedExam?.data?.questions?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 px-4 max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              おかえりなさい、{user.user_metadata.name || 'ユーザー'}さん
            </h1>
            <p className="text-muted-foreground">
              効率的な学習を続けましょう
            </p>
          </div>
          <Button asChild>
            <Link href="/exams">試験追加</Link>
          </Button>
        </div>

        {/* 統計 */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="試験数"
              value={userStats.totalExams}
              subtitle="インポート済み"
            />
            <StatCard
              title="進捗"
              value={`${Math.round((userStats.totalAttempted / userStats.totalQuestions) * 100)}%`}
              subtitle={`${userStats.totalAttempted}/${userStats.totalQuestions}問`}
            />
            <StatCard
              title="正答率"
              value={`${Math.round(userStats.overallAccuracy)}%`}
              subtitle="全体平均"
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="学習時間"
              value={`${Math.floor(userStats.sessionTime / 60)}h ${userStats.sessionTime % 60}m`}
              subtitle="今週"
            />
          </div>
        )}

        {/* 試験一覧 */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">試験一覧</h2>
            <Button variant="outline" asChild>
              <Link href="/exams">すべて表示</Link>
            </Button>
          </div>

          {examSets.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {examStats.map((stat) => (
                <ExamCard
                  key={stat.examId}
                  stat={stat}
                  onModeSelect={handleModeSelect}
                />
              ))}
            </div>
          ) : (
            <Card className="exam-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
                </div>
                <h3 className="text-xl font-medium mb-2">試験がありません</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                  試験問題集をインポートして学習を開始しましょう
                </p>
                <Button asChild>
                  <Link href="/exams">試験追加</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <ExamConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal({ isOpen: false, mode: SessionMode.Warmup, examId: '' })}
        onStart={handleExamStart}
        mode={configModal.mode}
        maxAvailableQuestions={maxQuestions}
      />
    </div>
  );
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
  stat, 
  onModeSelect 
}: { 
  stat: ExamStats;
  onModeSelect: (mode: SessionMode, examId: string) => void;
}) {
  return (
    <Card className="exam-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{stat.examTitle}</CardTitle>
            <CardDescription>
              {new Date(stat.lastStudied || '').toLocaleDateString('ja-JP')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(stat.overallProgress)}%</div>
            <div className="text-xs text-muted-foreground">進捗</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Progress value={stat.overallProgress} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">進捗</div>
            <div className="text-lg font-semibold">
              {stat.attemptedQuestions}/{stat.totalQuestions}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">正答率</div>
            <div className="text-lg font-semibold">
              {Math.round(stat.accuracyRate)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeSelect(SessionMode.Warmup, stat.examId)}
          >
            予習
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeSelect(SessionMode.Review, stat.examId)}
          >
            復習
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeSelect(SessionMode.Repetition, stat.examId)}
          >
            反復
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeSelect(SessionMode.Comprehensive, stat.examId)}
          >
            総合
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}