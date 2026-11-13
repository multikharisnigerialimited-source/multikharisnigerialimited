import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/courses";
import { useSelection } from "@/lib/selection";

export function CourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
  const { add } = useSelection();
  const navigate = useNavigate();
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link to="/courses/$slug" params={{ slug: course.slug }} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          loading="lazy"
          width={976}
          height={688}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {course.duration && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-bold text-navy shadow-soft">
            <Clock className="h-3.5 w-3.5 text-primary" /> {course.duration}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold uppercase text-navy">{course.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        {!compact && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-navy/70">
            <Clock className="h-3.5 w-3.5 text-primary" /> Duration: {course.duration ?? "Flexible"}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="subtle" asChild>
            <Link to="/courses/$slug" params={{ slug: course.slug }}>
              View Details
            </Link>
          </Button>
          <Button
            onClick={() => {
              add(course.skill);
              navigate({ to: "/register" });
            }}
          >
            Register <ArrowRight />
          </Button>
        </div>
      </div>
    </article>
  );
}
