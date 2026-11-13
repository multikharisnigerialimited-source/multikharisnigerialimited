import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Wrench, HeartHandshake, CheckCircle2, ArrowRight, Rocket } from "lucide-react";
import aboutImg from "@/assets/about-class.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Multikharis Nigeria Limited" },
      {
        name: "description",
        content:
          "Multikharis Nigeria Limited is committed to empowering students and NYSC corps members with practical digital skills.",
      },
      { property: "og:title", content: "About Multikharis Nigeria Limited" },
      {
        property: "og:description",
        content: "Our mission, vision and approach to practical digital skills training in Nigeria.",
      },
    ],
  }),
  component: About,
});

const WHY = [
  "Practical, hands-on training with real projects",
  "Experienced and supportive instructors",
  "Online and physical classes in Warri",
  "Flexible and fixed schedules to suit you",
  "Certificate provided on completion",
  "Affordable, career-focused programmes",
];

function About() {
  return (
    <>
      <section className="bg-gradient-hero py-12 md:py-20">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-up">
            <p className="eyebrow">About Us</p>
            <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-5xl">
              Empowering Nigeria's next generation of digital talent
            </h1>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Multikharis Nigeria Limited is committed to empowering students and NYSC corps members with practical
              digital skills. From our base in Warri, Delta State, we help young Nigerians gain the confidence and
              competence to earn, build businesses and thrive in the digital economy.
            </p>
          </div>
          <img
            src={aboutImg}
            alt="Corps members and students learning on laptops in a Multikharis training class"
            width={1200}
            height={800}
            className="w-full rounded-[2rem] object-cover shadow-card"
          />
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Target,
              t: "Our Mission",
              d: "To equip NYSC corps members and students with practical, in-demand digital skills that open doors to employment, entrepreneurship and lifelong growth.",
            },
            {
              icon: Eye,
              t: "Our Vision",
              d: "To be a leading digital skills training centre in Nigeria, raising a generation of confident, skilled and globally competitive young professionals.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border bg-card p-7 shadow-soft">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Icon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold text-navy">{t}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sky py-12 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary shadow-soft">
              <Wrench className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">Our Training Approach</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We believe skills are built by doing. Every course combines short, clear lessons with guided practice
              and real projects, so you leave with a portfolio — not just notes. Classes are small enough for
              personal attention, and you can learn online or in person at our Warri centre.
            </p>
            <ul className="mt-6 space-y-3">
              {["Learn the concept", "Practise with guidance", "Build a real project", "Get feedback & certified"].map(
                (s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-navy">{s}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-3xl bg-background p-7 shadow-card">
            <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">Why Choose Us</h2>
            <ul className="mt-6 grid gap-3">
              {WHY.map((w) => (
                <li key={w} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-navy/90">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-navy p-8 text-navy-foreground md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                <HeartHandshake className="h-8 w-8" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold sm:text-3xl">Our Commitment to Digital Empowerment</h2>
                <p className="mt-3 max-w-3xl leading-relaxed text-navy-foreground/80">
                  Digital skills change lives. We are committed to making quality training accessible to every corps
                  member and student who is ready to learn — helping them earn a living, solve problems in their
                  communities and contribute to Nigeria's growing digital economy.
                </p>
              </div>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Start your journey <Rocket />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
                <Link to="/courses">
                  View courses <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
