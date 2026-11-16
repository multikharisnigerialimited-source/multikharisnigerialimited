import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Loader2, Lock, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Stepper, STEP_TITLES } from "@/components/register/Stepper";
import { StepPersonal } from "@/components/register/StepPersonal";
import { StepCategory } from "@/components/register/StepCategory";
import { StepTraining } from "@/components/register/StepTraining";
import { StepReview } from "@/components/register/StepReview";
import { StepSuccess } from "@/components/register/StepSuccess";
import { categoryPayload, initialForm, paymentPayload, type Errors, type FormState } from "@/components/register/types";
import {
  categorySchema,
  fieldErrors,
  personalSchema,
  submissionSchema,
  trainingSchema,
} from "@/lib/registration-schema";
import { submitRegistration } from "@/lib/registration.functions";
import { useSelection } from "@/lib/selection";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration — Multikharis Nigeria Limited" },
      {
        name: "description",
        content: "Register for digital skills training with Multikharis Nigeria Limited in five simple steps.",
      },
      { property: "og:title", content: "Register for Digital Skills Training — Multikharis" },
      {
        property: "og:description",
        content: "NYSC Corps Members and Students: register online for practical digital skills training.",
      },
    ],
  }),
  component: RegisterPage,
});

function validateStep(step: number, form: FormState): Errors {
  if (step === 1) {
    const errs: Errors = {};
    if (!form.photo) errs.photo = "Upload your passport photograph";
    const r = personalSchema.safeParse(form.personal);
    return r.success ? errs : { ...errs, ...(fieldErrors(r.error) as Errors) };
  }
  if (step === 2) {
    if (!form.category.category) return { category: "Select whether you are an NYSC Corps Member or a Student" };
    const r = categorySchema.safeParse(categoryPayload(form.category));
    return r.success ? {} : (fieldErrors(r.error) as Errors);
  }
  if (step === 3) {
    const r = trainingSchema.safeParse(form.training);
    return r.success ? {} : (fieldErrors(r.error) as Errors);
  }
  return {};
}

function RegisterPage() {
  const submit = useServerFn(submitRegistration);
  const { items, clear } = useSelection();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [amountDue, setAmountDue] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // Pre-select courses chosen from the course pages.
  useEffect(() => {
    if (seeded.current || items.length === 0) return;
    seeded.current = true;
    setForm((f) =>
      f.training.courses.length ? f : { ...f, training: { ...f.training, courses: [...items] } },
    );
  }, [items]);

  // Clear an error as soon as the applicant fixes that field.
  useEffect(() => {
    setErrors((prev) => {
      const keys = Object.keys(prev) as (keyof Errors)[];
      if (!keys.length || step > 3) return prev;
      const now = validateStep(step, form);
      const next: Errors = {};
      keys.forEach((k) => {
        if (now[k]) next[k] = now[k];
      });
      return Object.keys(next).length === keys.length ? prev : next;
    });
  }, [form, step]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goTo(n: number) {
    setErrors({});
    setStep(n);
  }

  function next() {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    if (reviewMode) {
      // Return straight to review after an edit, once every earlier step is still valid.
      for (const s of [1, 2, 3]) {
        const e = validateStep(s, form);
        if (Object.keys(e).length) {
          setErrors(e);
          setStep(s);
          return;
        }
      }
      goTo(4);
      return;
    }
    goTo(step + 1);
  }

  async function onSubmit() {
    // Re-validate every step before submission.
    for (const s of [1, 2, 3]) {
      const e = validateStep(s, form);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        toast.error("Some information is missing. Please complete this step.");
        return;
      }
    }
    const pay = form.payment;
    if (!pay.method) {
      setErrors({ payment: "Choose how you will pay: card or bank transfer" });
      toast.error("Choose how you will pay.");
      return;
    }
    if (pay.method === "transfer") {
      if (!pay.receipt) {
        setErrors({ receipt: "Upload a screenshot of your payment receipt" });
        toast.error("Upload a screenshot of your payment receipt.");
        return;
      }
      if (pay.receipt.status === "checking") {
        toast.message("Please wait — we're still checking your receipt.");
        return;
      }
      if (pay.receipt.status === "rejected") {
        setErrors({ receipt: pay.receipt.message });
        toast.error("Please upload a valid payment receipt.");
        return;
      }
    }
    if (!form.agreed) {
      setErrors({ agreed_terms: "You must agree to the terms and conditions" });
      return;
    }
    const payload = {
      personal: form.personal,
      category: categoryPayload(form.category),
      training: form.training,
      photo: { data: form.photo!.data, type: form.photo!.type },
      payment: paymentPayload(form.payment),
      agreed_terms: true as const,
    };
    const check = submissionSchema.safeParse(payload);
    if (!check.success) {
      toast.error(check.error.issues[0]?.message ?? "Please review your information.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submit({ data: check.data });
      setReference(res.reference);
      setAmountDue(res.amountDue);
      clear();
      setStep(5);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed.";
      toast.error(msg || "We couldn't submit your registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-gradient-hero py-8 md:py-14">
      <div ref={topRef} className="container-page max-w-3xl scroll-mt-24">
        {step < 5 && (
          <div className="mb-6 text-center">
            <p className="eyebrow">Student Registration</p>
            <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-4xl">Register for training</h1>
          </div>
        )}
        <div className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-card sm:p-8">
          <Stepper step={step} />
          {step < 5 && (
            <div className="mb-6 mt-6 border-b pb-5">
              <p className="text-xs font-bold tracking-[0.2em] text-primary">STEP {step} OF 5</p>
              <h2 className="mt-1 text-xl font-extrabold text-navy sm:text-2xl">{STEP_TITLES[step - 1]}</h2>
            </div>
          )}

          <div key={step} className="animate-fade-up">
            {step === 1 && <StepPersonal form={form} setForm={setForm} errors={errors} />}
            {step === 2 && <StepCategory form={form} setForm={setForm} errors={errors} />}
            {step === 3 && <StepTraining form={form} setForm={setForm} errors={errors} />}
            {step === 4 && (
              <StepReview
                form={form}
                setForm={setForm}
                errors={errors}
                goTo={(n) => {
                  setReviewMode(true);
                  goTo(n);
                }}
              />
            )}
            {step === 5 && reference && <StepSuccess
                reference={reference}
                email={form.personal.email}
                amountDue={amountDue}
                method={form.payment.method === "transfer" ? "transfer" : "card"}
              />}
          </div>

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
              {step > 1 ? (
                <Button type="button" variant="subtle" size="lg" onClick={() => goTo(step - 1)} disabled={submitting}>
                  <ArrowLeft /> BACK
                </Button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <Button type="button" size="lg" onClick={next}>
                  {reviewMode ? "SAVE & REVIEW" : "NEXT"} <ArrowRight />
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={onSubmit} disabled={submitting} className="px-5 sm:px-7">
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                  {submitting ? "SUBMITTING…" : "SUBMIT REGISTRATION"}
                </Button>
              )}
            </div>
          )}
        </div>
        {step < 5 && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Your information is stored securely and only seen by our admissions team.
          </p>
        )}
      </div>
    </section>
  );
}
