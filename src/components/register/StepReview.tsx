import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Errors, FormState } from "./types";
import { cn } from "@/lib/utils";

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-background p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="text-primary">
          <Pencil /> EDIT
        </Button>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="break-words text-sm font-semibold text-navy sm:text-right">{value || "—"}</dd>
    </div>
  );
}

export function StepReview({
  form,
  setForm,
  goTo,
  errors,
}: {
  form: FormState;
  setForm: (f: (prev: FormState) => FormState) => void;
  goTo: (step: number) => void;
  errors: Errors;
}) {
  const { personal: p, category: c, training: t } = form;
  return (
    <div className="space-y-4">
      <Section title="Personal Information" onEdit={() => goTo(1)}>
        <div className="flex flex-col gap-5 sm:flex-row">
          {form.photo && (
            <div className="shrink-0">
              <img src={form.photo.preview} alt="Uploaded passport" className="h-32 w-26 rounded-xl border object-cover shadow-soft" />
              <p className="mt-1 text-center text-[11px] text-muted-foreground">Uploaded photograph</p>
            </div>
          )}
          <dl className="flex-1">
            <Row label="Surname" value={p.surname} />
            <Row label="First Name" value={p.first_name} />
            <Row label="Other Names" value={p.other_names} />
            <Row label="Gender" value={p.gender} />
            <Row label="Date of Birth" value={p.date_of_birth} />
            <Row label="Phone Number" value={p.phone} />
            <Row label="WhatsApp Number" value={p.whatsapp} />
            <Row label="Email Address" value={p.email} />
            <Row label="Home Address" value={p.address} />
          </dl>
        </div>
      </Section>

      <Section title="Participant Category" onEdit={() => goTo(2)}>
        <dl>
          <Row label="Category" value={c.category === "nysc" ? "NYSC Corps Member" : "Student"} />
          <Row label="Institution" value={c.institution} />
          <Row label="Course/Discipline" value={c.discipline} />
          {c.category === "nysc" ? (
            <>
              <Row label="State Code" value={c.state_code} />
              <Row label="Call-up Number" value={c.callup_number} />
              <Row label="PPA" value={c.ppa} />
            </>
          ) : (
            <>
              <Row label="Level of Study" value={c.level_of_study} />
              <Row label="Matric Number" value={c.matric_number} />
            </>
          )}
        </dl>
      </Section>

      <Section title="Selected Courses & Training" onEdit={() => goTo(3)}>
        <div className="mb-3 flex flex-wrap gap-2">
          {t.courses.map((s) => (
            <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {s}
            </span>
          ))}
        </div>
        <dl>
          <Row label="Training Mode" value={t.training_mode} />
          {t.training_mode === "Physical" && <Row label="Preferred Location" value={t.training_location} />}
          <Row label="Training Schedule" value={t.training_schedule} />
        </dl>
      </Section>

      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-sky p-4",
          errors.agreed_terms ? "border-destructive" : "border-transparent",
        )}
      >
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
          aria-label="I agree to the terms and conditions"
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
        />
        <span className="text-sm font-medium text-navy">
          I agree to the{" "}
          <Link to="/terms" target="_blank" className="font-bold text-primary underline-offset-2 hover:underline">
            terms and conditions
          </Link>{" "}
          of Multikharis Nigeria Limited.
        </span>
      </label>
      {errors.agreed_terms && <p role="alert" className="text-xs font-medium text-destructive">{errors.agreed_terms}</p>}
    </div>
  );
}
