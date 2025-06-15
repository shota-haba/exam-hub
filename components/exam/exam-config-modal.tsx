'use client';

import { useState } from 'react';
import { SessionMode, ExamConfig } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: ExamConfig) => void;
  mode: SessionMode;
  maxAvailableQuestions: number;
}

const modeConfig = {
  [SessionMode.Warmup]: {
    title: '予習モード',
    description: '未学習の問題に集中',
    className: 'warmup'
  },
  [SessionMode.Review]: {
    title: '復習モード', 
    description: '間違えた問題を重点復習',
    className: 'review'
  },
  [SessionMode.Repetition]: {
    title: '反復モード',
    description: '正解した問題を繰り返し',
    className: 'repetition'
  },
  [SessionMode.Comprehensive]: {
    title: '総合モード',
    description: '全問題で実力測定',
    className: 'comprehensive'
  }
};

/**
 * 試験設定モーダル
 */
export function ExamConfigModal({ 
  isOpen, 
  onClose, 
  onStart, 
  mode, 
  maxAvailableQuestions 
}: ExamConfigModalProps) {
  const [maxQuestions, setMaxQuestions] = useState(Math.min(10, maxAvailableQuestions));
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [hasTimeLimit, setHasTimeLimit] = useState(true);

  const config = modeConfig[mode];

  /**
   * 試験開始処理
   */
  const handleStart = () => {
    onStart({
      mode,
      maxQuestions,
      timePerQuestion: hasTimeLimit ? timePerQuestion : 0
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`mode-indicator ${config.className}`}>
              <div className="w-5 h-5 bg-current opacity-60 rounded-sm"></div>
            </div>
            <span>{config.title}</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 出題数 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">出題数</Label>
              <span className="text-sm text-muted-foreground">
                {maxQuestions}問 / {maxAvailableQuestions}問
              </span>
            </div>
            <Slider
              value={[maxQuestions]}
              onValueChange={(values) => setMaxQuestions(values[0])}
              max={maxAvailableQuestions}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* 制限時間 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">制限時間</Label>
              <Switch
                checked={hasTimeLimit}
                onCheckedChange={setHasTimeLimit}
              />
            </div>
            
            {hasTimeLimit && (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>1問あたり</span>
                  <span>{timePerQuestion}秒</span>
                </div>
                <Slider
                  value={[timePerQuestion]}
                  onValueChange={(values) => setTimePerQuestion(values[0])}
                  max={180}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </>
            )}
            
            {!hasTimeLimit && (
              <p className="text-sm text-muted-foreground">
                時間制限なし
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleStart}>
            開始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}