"use client";

import { submitQuiz } from "@/app/actions/campus";
import { GoldButton } from "@/components/ui";
import type { Quiz } from "@/lib/types";

export function QuizForm({
  quiz,
  courseId,
  moduleId,
  retake,
}: {
  quiz: Quiz;
  courseId: string;
  moduleId: string;
  retake: boolean;
}) {
  return (
    <form action={submitQuiz} className="space-y-8">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="quizId" value={quiz.id} />
      <input type="hidden" name="retake" value={retake ? "1" : "0"} />
      {quiz.questions.map((question, index) => (
        <fieldset key={question.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
          <legend className="px-1 text-white">
            {index + 1}. {question.prompt} <span className="text-xs text-gold">({question.marks} marks)</span>
          </legend>
          <div className="mt-3 space-y-2 text-sm text-muted">
            {question.options.map((option, optionIndex) => (
              <label key={option} className="flex cursor-pointer items-center gap-3">
                <input required type="radio" name={`q-${question.id}`} value={optionIndex} className="accent-[#f7e68a]" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <GoldButton type="submit">{retake ? "Submit retake" : "Submit quiz"}</GoldButton>
    </form>
  );
}
