import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Monitor, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse, COURSES } from "@/lib/courses";
import { useSelection } from "@/lib/selection";
import { CourseCard } from "@/components/site/CourseCard";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { slug: course.slug, name: course.name, description: course.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} Course — Multikharis Nigeria Limited` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.name} — Multikharis Nigeria Limited` },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Course unavailable — Multikharis" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold text-navy">Course not found</h1>
      <Button asChild className="mt-6">
        <Link to="/courses">See all courses</Link>
      </Button>
    </div>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useLoaderData();
  const course = getCourse(slug)!;
  const { add } = useSelection();
  const navigate = useNavigate();
  const others = COURSES.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="bg-gradient-hero py-10 md:py-16">
        <div className="container-page grid items-center gap-8 md:grid-cols-2">
          <div>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/70 hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All courses
            </Link>
            <h1 className="mt-4 text-3xl font-extrabold uppercase text-navy sm:text-5xl">{course.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: Clock, t: course.duration ?? "Flexible duration" },
                { icon: Monitor, t: "Online or Physical" },
                { icon: Award, t: "Certificate" },
              ].map(({ icon: Icon, t }) => (
                <span key={t} className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-navy shadow-soft">
                  <Icon className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
            <Button
              size="xl"
              className="mt-8"
              onClick={() => {
                add(course.skill);
                navigate({ to: "/register" });
              }}
            >
              Register for this course <ArrowRight />
            </Button>
          </div>
          <img
            src={course.image}
            alt={course.name}
            width={976}
            height={688}
            className="w-full rounded-[2rem] object-cover shadow-card"
          />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-navy">Course overview</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{course.overview}</p>
            <h3 className="mt-8 text-xl font-bold text-navy">What you'll learn</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.topics.map((t) => (
                <li key={t} className="flex items-start gap-3 rounded-2xl bg-surface p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-navy">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="h-fit rounded-3xl bg-sky p-6">
            <h3 className="text-lg font-bold text-navy">Tools you'll use</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.tools.map((t) => (
                <span key={t} className="rounded-full bg-background px-3 py-1.5 text-sm font-semibold text-navy shadow-soft">
                  {t}
                </span>
              ))}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-semibold text-navy">{course.duration ?? "Flexible"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mode</dt>
                <dd className="font-semibold text-navy">Online / Physical</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">For</dt>
                <dd className="font-semibold text-navy">Corps Members &amp; Students</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
      <section className="bg-surface py-12 md:py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-navy">Other courses</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
