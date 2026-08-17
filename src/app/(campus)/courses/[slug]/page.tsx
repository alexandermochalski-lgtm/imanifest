import Link from "next/link";
import { notFound } from "next/navigation";
import { completeModule, enrollCourse } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { courseBySlug } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; quiz?: string; score?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const course = courseBySlug(slug);
  if (!course) notFound();
  const state = await getState();
  const enrolled = state.enrollments.includes(course.id);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{course.faculty}</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{course.title}</h1>
      <p className="mt-4 max-w-2xl text-muted">{course.summary}</p>
      <Flash
        ok={query.ok ?? query.quiz}
        error={query.error}
        map={{
          enrolled: "Enrollment recorded.",
          pass: `Quiz passed${query.score ? ` at ${query.score}%` : ""}. Module marked complete.`,
          fail: `Quiz failed${query.score ? ` at ${query.score}%` : ""}. Retake is available.`,
          enroll: "Enroll before sitting the quiz.",
        }}
      />
      {!enrolled ? (
        <form action={enrollCourse.bind(null, course.id, true)} className="mt-6">
          <GoldButton type="submit">
            {course.price === 0 ? "Enroll free" : `Enroll · ${course.price} coins`}
          </GoldButton>
        </form>
      ) : (
        <p className="mt-6 text-sm text-gold">Enrolled · spend coins only once</p>
      )}
      <div className="mt-10 space-y-6">
        {course.modules.map((module) => {
          const done = state.completedModules.includes(module.id);
          const result = state.quizResults.find((item) => item.moduleId === module.id);
          return (
            <section key={module.id} className="rounded-2xl border border-[var(--line)] bg-panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">{module.title}</h2>
                <span className="text-xs text-gold">{done ? "Complete" : "Open"}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <p className="text-white">
                      {lesson.title} · {lesson.kind} · {lesson.duration}
                    </p>
                    <p className="mt-1">{lesson.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {enrolled && !done ? (
                  <form action={completeModule.bind(null, course.id, module.id)}>
                    <button className="text-gold" type="submit">
                      Mark lessons complete
                    </button>
                  </form>
                ) : null}
                {enrolled ? (
                  <Link href={`/courses/${course.slug}/quiz/${module.id}`} className="text-gold">
                    {result ? (result.passed ? "Review / retake quiz" : "Retake quiz") : "Sit module quiz"}
                  </Link>
                ) : null}
                {result ? (
                  <span className="text-muted">
                    Last score {result.score}% {result.passed ? "PASS" : "FAIL"}
                  </span>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
