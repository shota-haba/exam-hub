import { z } from 'zod';

/**
 * インポート用選択肢スキーマ
 */
export const choiceSchema = z.object({
  識別子: z.string(),
  本文: z.string()
});

/**
 * インポート用問題スキーマ
 */
export const questionSchema = z.object({
  本文: z.string(),
  選択肢: z.array(choiceSchema)
});

/**
 * インポート用解答スキーマ
 */
export const answerSchema = z.object({
  選択肢: z.string(),
  本文: z.string().optional()
});

/**
 * インポート用試験項目スキーマ
 */
export const examItemSchema = z.object({
  設問: questionSchema,
  解答: answerSchema
});

/**
 * インポート用タグスキーマ（日本語キー形式）
 */
export const tagSchema = z.object({
  項目名: z.string(),
  値: z.string()
});

/**
 * インポート用試験セットスキーマ
 */
export const examSetSchema = z.object({
  試験: z.string(),
  項目: z.array(tagSchema),
  問題集: z.array(examItemSchema)
});

/**
 * インポート用試験セット型
 */
export type ImportedExamSet = z.infer<typeof examSetSchema>;

/**
 * アプリ内部用試験セット型
 */
export type AppExamSet = {
  id: string;
  title: string;
  tags: Array<{
    項目名: string;
    値: string;
  }>;
  questions: Array<{
    id: string;
    text: string;
    explanation: string | null;
    choices: Array<{
      id: string;
      text: string;
      identifier: string;
      isCorrect: boolean;
    }>;
  }>;
};

/**
 * インポートデータをアプリ形式に変換
 */
export function transformImportedExam(importedExam: ImportedExamSet): Omit<AppExamSet, 'id'> {
  return {
    title: importedExam.試験,
    tags: importedExam.項目,
    questions: importedExam.問題集.map((q, index) => ({
      id: `temp-${index}`,
      text: q.設問.本文,
      explanation: q.解答.本文 || null,
      choices: q.設問.選択肢.map(choice => ({
        id: `temp-choice-${index}-${choice.識別子}`,
        text: choice.本文,
        identifier: choice.識別子,
        isCorrect: choice.識別子 === q.解答.選択肢
      }))
    }))
  };
}

/**
 * アプリデータをエクスポート形式に変換
 */
export function transformExamForExport(appExam: AppExamSet): ImportedExamSet {
  return {
    試験: appExam.title,
    項目: appExam.tags,
    問題集: appExam.questions.map(q => ({
      設問: {
        本文: q.text,
        選択肢: q.choices.map(c => ({
          識別子: c.identifier,
          本文: c.text
        }))
      },
      解答: {
        選択肢: q.choices.find(c => c.isCorrect)?.identifier || '',
        本文: q.explanation || ''
      }
    }))
  };
}