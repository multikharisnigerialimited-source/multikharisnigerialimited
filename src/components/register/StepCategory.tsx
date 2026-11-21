import { BadgeCheck, Church, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEVELS } from "@/lib/registration-schema";
import { Field, TextField } from "./Field";
import type { CategoryState, Errors, FormState } from "./types";
import { cn } from "@/lib/utils";

export function StepCategory({
  form,
  setForm,
  errors,
}: {
  form: FormState;
  setForm: (f: (prev: FormState) => FormState) => void;
  errors: Errors;
}) {
  const c = form.category;
  const set = <K extends keyof CategoryState>(k: K, v: CategoryState[K]) =>
    setForm((f) => ({ ...f, category: { ...f.category, [k]: v } }));

  const options = [
    { value: "nysc" as const, label: "NYSC Corps Member", icon: BadgeCheck },
    { value: "student" as const, label: "Student", icon: GraduationCap },
    { value: "minister" as const, label: "Church Minister", icon: Church },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 font-display text-base font-bold text-navy">
          I AM A: <span className="text-primary">*</span>
        </p>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
          {options.map(({ value, label, icon: Icon }) => {
            const sel = c.category === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => set("category", value)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border-2 bg-background p-5 text-left transition-all",
                  sel ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    sel ? "bg-primary text-primary-foreground" : "bg-sky text-primary",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-base font-bold text-navy">{label}</span>
              </button>
            );
          })}
        </div>
        {errors.category && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.category}</p>}
      </div>

      {c.category === "nysc" && (
        <div className="grid animate-fade-up gap-4 sm:grid-cols-2">
          <TextField id="institution" label="Institution Attended" required value={c.institution} onChange={(v) => set("institution", v)} error={errors.institution} className="sm:col-span-2" />
          <TextField id="discipline" label="Course/Discipline" required value={c.discipline} onChange={(v) => set("discipline", v)} error={errors.discipline} />
          <TextField id="state_code" label="State Code" required value={c.state_code} onChange={(v) => set("state_code", v.toUpperCase())} error={errors.state_code} placeholder="DT/24A/1234" hint="Format: DT/24A/1234" />
          <TextField id="callup_number" label="Call-up Number" required value={c.callup_number} onChange={(v) => set("callup_number", v.toUpperCase())} error={errors.callup_number} />
          <TextField id="ppa" label="Place of Primary Assignment (PPA)" required value={c.ppa} onChange={(v) => set("ppa", v)} error={errors.ppa} />
        </div>
      )}

      {c.category === "minister" && (
        <div className="grid animate-fade-up gap-4 sm:grid-cols-2">
          <TextField id="institution" label="Church/Ministry Name" required value={c.institution} onChange={(v) => set("institution", v)} error={errors.institution} className="sm:col-span-2" />
          <TextField id="discipline" label="Position/Title" required value={c.discipline} onChange={(v) => set("discipline", v)} error={errors.discipline} placeholder="e.g. Pastor, Evangelist, Deacon" />
          <TextField id="denomination" label="Denomination" required value={c.denomination} onChange={(v) => set("denomination", v)} error={errors.denomination} />
        </div>
      )}

      {c.category === "student" && (
        <div className="grid animate-fade-up gap-4 sm:grid-cols-2">
          <TextField id="institution" label="Institution Name" required value={c.institution} onChange={(v) => set("institution", v)} error={errors.institution} className="sm:col-span-2" />
          <TextField id="discipline" label="Course/Discipline" required value={c.discipline} onChange={(v) => set("discipline", v)} error={errors.discipline} />
          <Field id="level_of_study" label="Level of Study" required error={errors.level_of_study}>
            <Select value={c.level_of_study} onValueChange={(v) => set("level_of_study", v)}>
              <SelectTrigger id="level_of_study" className={cn("h-12 w-full rounded-xl", errors.level_of_study && "border-destructive")}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <TextField id="matric_number" label="Matriculation Number" required value={c.matric_number} onChange={(v) => set("matric_number", v.toUpperCase())} error={errors.matric_number} className="sm:col-span-2" />
        </div>
      )}
    </div>
  );
}
