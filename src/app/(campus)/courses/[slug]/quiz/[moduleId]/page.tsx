import { notFound, redirect } from "next/navigation";
import { QuizForm } from "@/components/campus/QuizForm";
import { courseBySlug } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; moduleId: string }>;
  searchParams: Promise<{ retake?: string }>;
}) {
  const { slug, moduleId } = await params;
  const { retake } = await searchParams;
  const course = courseBySlug(slug);
  const module = course?.modules.find((item) => item.id === moduleId);
  if (!course || !module) notFound();
  const state = await getState();
  if (!state.enrollments.includes(course.id)) redirect(`/courses/${slug}?error=enroll`);
  const previous = state.quizResults.find((item) => item.moduleId === moduleId);
  const isRetake = Boolean(retake) || Boolean(previous);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{course.title}</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{module.quiz.title}</h1>
      <p className="mt-3 text-sm text-muted">
        Pass mark {module.quiz.passMark}%. Questions shuffle in spirit — pick the operator answer. {isRetake ? "Retake mode overwrites the last score." : ""}
      </p>
      <div className="mt-8">
        <QuizForm quiz={module.quiz} courseId={course.id} moduleId={module.id} retake={isRetake} />
      </div>
    </main>
  );
}
