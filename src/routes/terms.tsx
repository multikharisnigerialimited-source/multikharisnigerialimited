import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Multikharis Nigeria Limited" },
      { name: "description", content: "Terms and conditions for training registration with Multikharis Nigeria Limited." },
      { property: "og:title", content: "Terms & Conditions — Multikharis Nigeria Limited" },
      { property: "og:description", content: "Registration and training terms for Multikharis Nigeria Limited." },
    ],
  }),
  component: Terms,
});

const TERMS = [
  ["Accurate information", "You confirm that all information provided in your registration is true and complete. Providing false information may lead to cancellation of your registration."],
  ["Registration review", "All registrations are reviewed by Multikharis Nigeria Limited. Submitting a form does not guarantee admission; you will be contacted with the outcome."],
  ["Attendance and conduct", "Participants are expected to attend classes punctually, participate actively and treat instructors and fellow participants with respect."],
  ["Certificates", "Certificates are issued only to participants who complete the required training and assessments."],
  ["Use of your information", "Your personal information and photograph are used only to manage your training, contact you and issue certificates. We do not sell your information."],
  ["Changes", "Multikharis Nigeria Limited may update training schedules, venues or these terms. Registered participants will be informed of important changes."],
];

function Terms() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-page max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-3 text-muted-foreground">
          By registering for any training with {SITE.name}, you agree to the following terms.
        </p>
        <ol className="mt-8 space-y-5">
          {TERMS.map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-surface p-5">
              <h2 className="text-lg font-bold text-navy">
                {i + 1}. {t}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted-foreground">
          Questions? Email <a className="font-semibold text-primary" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </section>
  );
}
