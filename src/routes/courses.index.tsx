import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/site/CourseCard";
import { COURSES } from "@/lib/courses";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Multikharis Nigeria Limited" },
      {
        name: "description",
        content:
          "Web Development, Graphic Design, Data Analysis, UI/UX Design, Digital Marketing and Computer Appreciation (Microsoft Office) training in Warri and online.",
      },
      { property: "og:title", content: "Digital Skills Courses — Multikharis Nigeria Limited" },
      {
        property: "og:description",
        content: "Explore practical digital skills courses for NYSC Corps Members and Students.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return COURSES;
    return COURSES.filter((c) =>
      [c.name, c.description, ...c.tools, ...c.topics].some((s) => s.toLowerCase().includes(t)),
    );
  }, [q]);

  return (
    <>
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container-page text-center">
          <p className="eyebrow">Our Courses</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-5xl">Choose your skill path</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Practical, hands-on training designed to get you job-ready. You can select multiple courses when you register.
          </p>
          <div className="relative mx-auto mt-7 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, e.g. Excel, design, JavaScript…"
              className="h-14 rounded-2xl border-0 bg-background pl-12 text-base shadow-card"
              aria-label="Search courses"
            />
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-page">
          {list.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No courses match “{q}”. Try another search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
