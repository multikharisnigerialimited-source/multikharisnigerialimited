import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURSES } from "@/lib/courses";
import { courseFeesQuery } from "@/lib/fees";
import { formatNaira } from "@/lib/money";
import { recommendCourses, type RecommendResult } from "@/lib/recommend.functions";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "Find Your Course — AI Course Adviser | Multikharis" },
      {
        name: "description",
        content: "Tell us your interests and goals and get personalised digital skills course recommendations from Multikharis.",
      },
      { property: "og:title", content: "Find Your Perfect Digital Skills Course — Multikharis" },
      { property: "og:description", content: "Personalised course suggestions for NYSC Corps Members and Students in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecommendPage,
});

const LEVELS = ["Beginner", "Some experience", "Experienced"] as const;

function RecommendPage() {
  const recommend = useServerFn(recommendCourses);
  const navigate = useNavigate();
  const { items, add } = useSelection();
  const { data: fees = {} } = useQuery(courseFeesQuery);
  const [interests, setInterests] = useState("");
  const [goals, setGoals] = useState("");
  const [experience, setExperience] = useState<(typeof LEVELS)[number]>("Beginner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      setResult(await recommend({ data: { interests, goals, experience } }));
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "We couldn't get recommendations right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gradient-hero py-10 md:py-16">
      <div className="container-page max-w-3xl">
        <div className="mb-6 text-center">
          <p className="eyebrow">AI Course Adviser</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">Find the right course for you</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Tell us what you enjoy and what you want to achieve. We'll suggest the courses that suit you best and explain why.
          </p>
        </div>

        {!result ? (
          <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] border border-border/60 bg-card p-6 shadow-card sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="interests">What are you interested in?</Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                maxLength={1000}
                rows={4}
                required
                placeholder="e.g. I love drawing and social media, and I enjoy helping small businesses look good online."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">What do you want to achieve?</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                maxLength={1000}
                rows={3}
                required
                placeholder="e.g. Start earning as a freelancer after my service year, or get an office job."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-navy">How comfortable are you with computers?</p>
              <div role="radiogroup" aria-label="Computer experience" className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={experience === l}
                    onClick={() => setExperience(l)}
                    className={cn(
                      "rounded-xl border-2 px-2 py-3 text-xs font-semibold transition sm:text-sm",
                      experience === l ? "border-primary bg-primary/5 text-primary" : "border-border text-navy hover:border-primary/50",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "FINDING YOUR COURSES…" : "GET MY RECOMMENDATIONS"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Suggestions are generated by AI — our team is happy to advise you too.</p>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-up">
            <div className="rounded-3xl bg-gradient-navy p-6 text-navy-foreground shadow-card">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-4 w-4" /> Your personalised path
              </p>
              <p className="mt-2 leading-relaxed">{result.summary}</p>
            </div>
            {result.recommendations.map((r, i) => {
              const course = COURSES.find((c) => c.skill === r.skill);
              const selected = items.includes(r.skill);
              const fee = fees[r.skill];
              return (
                <article key={r.skill} className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
                  <div className="flex flex-col sm:flex-row">
                    {course && (
                      <img src={course.image} alt={course.name} loading="lazy" width={976} height={688} className="h-40 w-full object-cover sm:h-auto sm:w-48" />
                    )}
                    <div className="flex-1 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">#{i + 1} · {r.match} match</span>
                        {fee ? <span className="text-xs font-semibold text-muted-foreground">{formatNaira(fee)}</span> : null}
                      </div>
                      <h2 className="mt-2 text-lg font-extrabold uppercase text-navy">{r.skill}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
                      <p className="mt-3 flex items-start gap-2 rounded-xl bg-sky p-3 text-sm text-navy">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {r.first_step}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant={selected ? "subtle" : "default"} onClick={() => add(r.skill)} disabled={selected}>
                          {selected ? <Check /> : <Plus />} {selected ? "Added" : "Add to my registration"}
                        </Button>
                        {course && (
                          <Button asChild size="sm" variant="ghost">
                            <Link to="/courses/$slug" params={{ slug: course.slug }}>View details</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                className="sm:flex-1"
                onClick={() => {
                  if (!items.length) result.recommendations.forEach((r) => add(r.skill));
                  navigate({ to: "/register" });
                }}
              >
                REGISTER NOW <ArrowRight />
              </Button>
              <Button size="lg" variant="subtle" onClick={() => setResult(null)}>
                <RotateCcw /> Start again
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
