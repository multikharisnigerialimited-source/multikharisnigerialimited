import { Check, Monitor, Building2, CalendarRange, CalendarCheck } from "lucide-react";
import { SKILLS } from "@/lib/registration-schema";
import { TextField } from "./Field";
import type { Errors, FormState, TrainingState } from "./types";
import { cn } from "@/lib/utils";

export function StepTraining({
  form,
  setForm,
  errors,
}: {
  form: FormState;
  setForm: (f: (prev: FormState) => FormState) => void;
  errors: Errors;
}) {
  const t = form.training;
  const set = <K extends keyof TrainingState>(k: K, v: TrainingState[K]) =>
    setForm((f) => ({ ...f, training: { ...f.training, [k]: v } }));

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-base font-bold text-navy">
          Select the skills you want to learn <span className="text-primary">*</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">You can choose more than one.</p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {SKILLS.map((s) => {
            const on = t.courses.includes(s);
            return (
              <button
                key={s}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => set("courses", on ? t.courses.filter((x) => x !== s) : [...t.courses, s])}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 bg-background px-4 py-3.5 text-left transition-all",
                  on ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="text-sm font-semibold text-navy">{s}</span>
              </button>
            );
          })}
        </div>
        {errors.courses && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.courses}</p>}
      </div>

      <OptionGroup
        label="Training Mode"
        error={errors.training_mode}
        value={t.training_mode}
        onChange={(v) => set("training_mode", v as TrainingState["training_mode"])}
        options={[
          { value: "Online", icon: Monitor, hint: "Learn from anywhere" },
          { value: "Physical", icon: Building2, hint: "Attend classes in person" },
        ]}
      />

      {t.training_mode === "Physical" && (
        <div className="animate-fade-up">
          <TextField
            id="training_location"
            label="Preferred Training Location"
            required
            value={t.training_location}
            onChange={(v) => set("training_location", v)}
            error={errors.training_location}
            placeholder="e.g. Warri – Shop D7, College of Education"
            list="locations"
          />
          <datalist id="locations">
            <option value="Warri – Shop D7, College of Education" />
          </datalist>
        </div>
      )}

      <OptionGroup
        label="Training Schedule"
        error={errors.training_schedule}
        value={t.training_schedule}
        onChange={(v) => set("training_schedule", v as TrainingState["training_schedule"])}
        options={[
          { value: "Flexible", icon: CalendarRange, hint: "Learn at times that suit you" },
          { value: "Fixed", icon: CalendarCheck, hint: "Set class days and times" },
        ]}
      />
    </div>
  );
}

function OptionGroup({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; icon: typeof Monitor; hint: string }[];
  error?: string | undefined;
}) {
  return (
    <div>
      <p className="mb-3 font-display text-base font-bold text-navy">
        {label} <span className="text-primary">*</span>
      </p>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3">
        {options.map(({ value: v, icon: Icon, hint }) => {
          const sel = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => onChange(v)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border-2 bg-background p-4 text-left transition-all",
                sel ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50",
              )}
            >
              <Icon className={cn("h-6 w-6", sel ? "text-primary" : "text-navy/60")} />
              <span className="font-bold text-navy">{v}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
