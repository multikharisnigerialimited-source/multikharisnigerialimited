import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2, Printer, ImageDown } from "lucide-react";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { Button } from "@/components/ui/button";
import { categoryLabel, fullName, photoUrlsQuery, registrationQuery } from "@/lib/admin-data";
import { exportCsv } from "@/lib/export";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  head: () => ({
    meta: [
      { title: "Applicant Record — Multikharis Admin" },
      { name: "description", content: "Applicant registration record." },
      { property: "og:title", content: "Applicant Record — Multikharis" },
      { property: "og:description", content: "Applicant registration record." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminShell>
      <Detail />
    </AdminShell>
  ),
});

function Detail() {
  const { id } = Route.useParams();
  const { data: r, isLoading } = useQuery(registrationQuery(id));
  const { data: photos = {} } = useQuery(photoUrlsQuery(r ? [r.photo_path] : []));

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!r)
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Applicant not found.</p>
        <Button asChild className="mt-4"><Link to="/admin">Back to dashboard</Link></Button>
      </div>
    );

  const photo = photos[r.photo_path];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft /> All applicants</Link></Button>
        <div className="flex flex-wrap gap-2">
          <StatusSelect reg={r} className="h-9 w-36 rounded-lg text-sm" />
          {photo && (
            <Button asChild variant="subtle" size="sm">
              <a href={photo} target="_blank" rel="noopener noreferrer" download={`${r.reference}-passport`}><ImageDown /> Photo</a>
            </Button>
          )}
          <Button variant="subtle" size="sm" onClick={() => exportCsv([r], `${r.reference}.csv`)}><Download /> Download</Button>
          <Button variant="navy" size="sm" onClick={() => window.print()}><Printer /> Print</Button>
        </div>
      </div>

      <article className="rounded-3xl bg-card p-6 shadow-soft sm:p-8 print:shadow-none">
        <div className="flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <div>
              <p className="font-display text-sm font-extrabold text-navy">MULTIKHARIS NIGERIA LIMITED</p>
              <p className="text-xs text-muted-foreground">Student Registration Record</p>
            </div>
          </div>
          <StatusBadge status={r.status} />
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          <div className="shrink-0">
            {photo ? (
              <img src={photo} alt={`Passport of ${fullName(r)}`} className="h-44 w-36 rounded-xl border object-cover" />
            ) : (
              <div className="flex h-44 w-36 items-center justify-center rounded-xl bg-sky"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-navy">{fullName(r)}</h1>
            <p className="mt-1 font-mono text-sm font-bold text-primary">{r.reference}</p>
            <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(r.created_at).toLocaleString("en-NG")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.courses.map((c) => (
                <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Block title="Personal Information">
            <Row l="Surname" v={r.surname} />
            <Row l="First Name" v={r.first_name} />
            <Row l="Other Names" v={r.other_names} />
            <Row l="Gender" v={r.gender} />
            <Row l="Date of Birth" v={r.date_of_birth} />
            <Row l="Phone" v={r.phone} href={`tel:${r.phone}`} />
            <Row l="WhatsApp" v={r.whatsapp} href={r.whatsapp ? `https://wa.me/${r.whatsapp.replace(/^0/, "234").replace(/^\+/, "")}` : undefined} />
            <Row l="Email" v={r.email} href={`mailto:${r.email}`} />
            <Row l="Home Address" v={r.address} />
          </Block>
          <div className="space-y-6">
            <Block title="Participant Category">
              <Row l="Category" v={categoryLabel(r.category)} />
              <Row l="Institution" v={r.institution} />
              <Row l="Course/Discipline" v={r.discipline} />
              {r.category === "nysc" ? (
                <>
                  <Row l="State Code" v={r.state_code} />
                  <Row l="Call-up Number" v={r.callup_number} />
                  <Row l="PPA" v={r.ppa} />
                </>
              ) : (
                <>
                  <Row l="Level of Study" v={r.level_of_study} />
                  <Row l="Matric Number" v={r.matric_number} />
                </>
              )}
            </Block>
            <Block title="Training Details">
              <Row l="Training Mode" v={r.training_mode} />
              {r.training_location && <Row l="Location" v={r.training_location} />}
              <Row l="Schedule" v={r.training_schedule} />
              <Row l="Agreed to terms" v={r.agreed_terms ? "Yes" : "No"} />
            </Block>
          </div>
        </div>
      </article>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-primary">{title}</h2>
      <dl className="rounded-2xl bg-surface px-4">{children}</dl>
    </section>
  );
}

function Row({ l, v, href }: { l: string; v?: string | null | undefined; href?: string | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{l}</dt>
      <dd className="text-right font-semibold text-navy">
        {v ? (href ? <a href={href} className="hover:text-primary">{v}</a> : v) : "—"}
      </dd>
    </div>
  );
}
