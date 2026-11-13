import { Camera, ImageUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Field, TextField, ChoiceCard } from "./Field";
import type { Errors, FormState, PersonalState, PhotoState } from "./types";
import { cn } from "@/lib/utils";

async function processPhoto(file: File): Promise<NonNullable<PhotoState>> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPG or PNG).");
  if (file.size > 15 * 1024 * 1024) throw new Error("That image is too large. Please choose one under 15MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That image could not be opened. Try a different photo."));
      i.src = url;
    });
    const max = 700;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process the image.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return { data: dataUrl, type: "image/jpeg", preview: dataUrl, name: file.name };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function StepPersonal({
  form,
  setForm,
  errors,
}: {
  form: FormState;
  setForm: (f: (prev: FormState) => FormState) => void;
  errors: Errors;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string>();
  const p = form.personal;
  const set = <K extends keyof PersonalState>(k: K, v: PersonalState[K]) =>
    setForm((f) => ({ ...f, personal: { ...f.personal, [k]: v } }));

  async function onFile(file?: File) {
    if (!file) return;
    setPhotoError(undefined);
    try {
      const photo = await processPhoto(file);
      setForm((f) => ({ ...f, photo }));
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Could not use that image.");
    }
  }

  const photoErr = photoError ?? errors.photo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-sky p-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-background transition-colors hover:border-primary",
            photoErr ? "border-destructive" : "border-primary/40",
          )}
          aria-label="Upload passport photograph"
        >
          {form.photo ? (
            <img src={form.photo.preview} alt="Passport preview" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-9 w-9 text-primary" />
          )}
        </button>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-navy">
            Upload passport photograph <span className="text-primary">*</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">White background preferred. JPG or PNG.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <ImageUp className="h-4 w-4" /> {form.photo ? "Change photo" : "Choose photo"}
            </button>
            {form.photo && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photo: null }))}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-navy/70 hover:bg-background"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          {photoErr && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{photoErr}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="surname" label="Surname" required value={p.surname} onChange={(v) => set("surname", v)} error={errors.surname} autoComplete="family-name" />
        <TextField id="first_name" label="First Name" required value={p.first_name} onChange={(v) => set("first_name", v)} error={errors.first_name} autoComplete="given-name" />
        <TextField id="other_names" label="Other Names" value={p.other_names} onChange={(v) => set("other_names", v)} error={errors.other_names} className="sm:col-span-2" />

        <Field id="gender" label="Gender" required error={errors.gender} className="sm:col-span-2">
          <div role="radiogroup" id="gender" className="grid grid-cols-2 gap-3">
            {(["Male", "Female"] as const).map((g) => (
              <ChoiceCard key={g} selected={p.gender === g} onClick={() => set("gender", g)}>
                <span className="font-semibold text-navy">{g}</span>
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <TextField id="date_of_birth" type="date" label="Date of Birth" required value={p.date_of_birth} onChange={(v) => set("date_of_birth", v)} error={errors.date_of_birth} max={new Date().toISOString().slice(0, 10)} />
        <TextField id="email" type="email" label="Email Address" required value={p.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" inputMode="email" />
        <TextField id="phone" type="tel" label="Phone Number" required value={p.phone} onChange={(v) => set("phone", v)} error={errors.phone} placeholder="08012345678" autoComplete="tel" inputMode="tel" />
        <TextField id="whatsapp" type="tel" label="WhatsApp Number" value={p.whatsapp} onChange={(v) => set("whatsapp", v)} error={errors.whatsapp} placeholder="08012345678" inputMode="tel" />

        <Field id="address" label="Home Address" required error={errors.address} className="sm:col-span-2">
          <Textarea
            id="address"
            rows={3}
            value={p.address}
            onChange={(e) => set("address", e.target.value)}
            aria-invalid={!!errors.address}
            className={cn("rounded-xl text-base sm:text-sm", errors.address && "border-destructive")}
            autoComplete="street-address"
          />
        </Field>
      </div>
    </div>
  );
}
