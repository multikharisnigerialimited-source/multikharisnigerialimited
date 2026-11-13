import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, CalendarClock, GraduationCap, Users, CheckCircle2, Sparkles } from "lucide-react";
import heroWoman from "@/assets/hero-woman.jpg";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/site/CourseCard";
import { COURSES } from "@/lib/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Multikharis Nigeria Limited — Digital Skills Training | Learn • Build • Grow" },
      {
        name: "description",
        content:
          "Empowering NYSC Corps Members and Students with in-demand digital skills: web development, graphic design, data analysis and more. Register today.",
      },
      { property: "og:title", content: "Digital Skills Training — Multikharis Nigeria Limited" },
      {
        property: "og:description",
        content: "Empowering NYSC Corps Members and Students with in-demand digital skills for a better future.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Users, title: "Expert Instructors", text: "Learn from experienced industry professionals." },
  { icon: CalendarClock, title: "Flexible Learning", text: "Online or physical classes that fit your schedule." },
  { icon: Award, title: "Certificate Provided", text: "Earn a recognised certificate on completion." },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="container-page grid items-center gap-6 pt-8 md:grid-cols-2 md:gap-10 md:pt-14 lg:pt-20">
          <div className="relative z-10 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-xs font-bold text-navy shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> For NYSC Corps Members &amp; Students
            </span>
            <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.02] text-navy sm:text-5xl lg:text-6xl xl:text-7xl">
              DIGITAL SKILLS
              <span className="block text-primary">TRAINING</span>
            </h1>
            <p className="mt-4 font-display text-base font-bold tracking-[0.3em] text-navy sm:text-lg">
              LEARN <span className="text-primary">•</span> BUILD <span className="text-primary">•</span> GROW
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Empowering NYSC Corps Members and Students with in-demand digital skills for a better future.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="xl">
                <Link to="/register">
                  REGISTER NOW <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="subtle" className="hidden sm:inline-flex">
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </div>
            <div className="mt-8 hidden items-center gap-6 sm:flex">
              {["Practical training", "Hands-on projects", "Certificate"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm font-medium text-navy/80">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm pb-10 md:max-w-md md:pb-16 lg:max-w-lg">
            <div className="absolute inset-0 bottom-10 translate-x-3 translate-y-3 rotate-3 rounded-[2.5rem] bg-gradient-primary md:bottom-16" />
            <div className="pointer-events-none absolute -left-6 top-10 h-24 w-24 rounded-full border-[10px] border-primary/20" />
            <img
              src={heroWoman}
              alt="Smiling Nigerian technology professional holding a laptop"
              width={1024}
              height={1152}
              className="relative z-10 w-full rounded-[2.25rem] object-cover shadow-card"
            />
            <div className="absolute bottom-4 -left-4 z-20 hidden animate-float md:bottom-8 rounded-2xl bg-background p-3.5 shadow-card sm:flex sm:items-center sm:gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </span>
              <span>
                <span className="block text-sm font-bold text-navy">9+ Skills</span>
                <span className="block text-xs text-muted-foreground">to choose from</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-20 -mt-6 md:-mt-10">
        <div className="container-page">
          <div className="grid grid-cols-3 gap-2.5 rounded-3xl bg-background p-3 shadow-card sm:gap-4 sm:p-5">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="flex animate-fade-up flex-col items-center gap-2.5 rounded-2xl p-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:p-4 sm:text-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky text-primary sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span>
                  <span className="block text-xs font-bold leading-tight text-navy sm:text-base">{title}</span>
                  <span className="mt-1 hidden text-sm text-muted-foreground sm:block">{text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Our Courses</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-4xl">Popular courses</h2>
            </div>
            <Button asChild variant="outline" size="sm" className="sm:h-10 sm:px-5 sm:text-sm">
              <Link to="/courses">VIEW ALL</Link>
            </Button>
          </div>
          <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {COURSES.slice(0, 3).map((c) => (
              <div key={c.slug} className="w-[78%] shrink-0 snap-start sm:w-[55%] md:w-auto">
                <CourseCard course={c} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-sky py-14 md:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Simple Process</p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-4xl">Start your journey in 3 steps</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", t: "Choose your skills", d: "Browse our courses and pick one or more skills you want to master." },
              { n: "02", t: "Register online", d: "Complete our simple five-step registration form in minutes." },
              { n: "03", t: "Learn & get certified", d: "Train with experts, build real projects and earn your certificate." },
            ].map((s) => (
              <div key={s.n} className="rounded-3xl bg-background p-6 shadow-soft">
                <span className="font-display text-4xl font-extrabold text-primary/25">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold text-navy">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-navy px-6 py-12 text-center text-navy-foreground sm:px-12 md:py-16">
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
            <h2 className="relative text-2xl font-extrabold sm:text-4xl">Ready to build your digital future?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-navy-foreground/75">
              Join NYSC Corps Members and Students already learning in-demand skills with Multikharis.
            </p>
            <Button asChild size="xl" className="relative mt-7">
              <Link to="/register">
                REGISTER NOW <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
