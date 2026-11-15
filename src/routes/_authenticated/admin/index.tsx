import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Download, FileSpreadsheet, GraduationCap, Inbox, Loader2, Search, Users, Eye, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { PaymentBadge } from "@/components/admin/PaymentBadge";
import { PaymentTracker } from "@/components/admin/PaymentTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryLabel, fullName, messagesQuery, photoUrlsQuery, registrationsQuery, type Registration } from "@/lib/admin-data";
import { exportCsv, exportExcel } from "@/lib/export";
import { SKILLS } from "@/lib/registration-schema";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Multikharis Nigeria Limited" },
      { name: "description", content: "Manage student registrations." },
      { property: "og:title", content: "Admin Dashboard — Multikharis" },
      { property: "og:description", content: "Manage student registrations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  ),
});

function Dashboard() {
  const { data: regs = [], isLoading, error } = useQuery(registrationsQuery);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return regs.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (course !== "all" && !r.courses.includes(course)) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!t) return true;
      return [r.reference, fullName(r), r.email, r.phone, r.institution, r.state_code ?? "", r.matric_number ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(t);
    });
  }, [regs, q, cat, course, status]);

  const stats = useMemo(() => {
    const byCourse = Object.fromEntries(SKILLS.map((s) => [s, 0])) as Record<string, number>;
    regs.forEach((r) => r.courses.forEach((c) => (byCourse[c] = (byCourse[c] ?? 0) + 1)));
    return {
      total: regs.length,
      nysc: regs.filter((r) => r.category === "nysc").length,
      students: regs.filter((r) => r.category === "student").length,
      pending: regs.filter((r) => r.status === "pending").length,
      byCourse: Object.entries(byCourse).sort((a, b) => b[1] - a[1]),
    };
  }, [regs]);

  const visiblePaths = filtered.slice(0, 60).map((r) => r.photo_path);
  const { data: photos = {} } = useQuery(photoUrlsQuery(visiblePaths));
  const maxCourse = Math.max(1, ...stats.byCourse.map(([, n]) => n));

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <p className="py-24 text-center text-destructive">Could not load registrations.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Registrations</h1>
          <p className="text-sm text-muted-foreground">Overview of all applicants</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Users} label="Total Registrations" value={stats.total} accent />
        <Stat icon={BadgeCheck} label="NYSC Members" value={stats.nysc} />
        <Stat icon={GraduationCap} label="Students" value={stats.students} />
        <Stat icon={Clock} label="Pending Review" value={stats.pending} />
      </div>

      <Tabs defaultValue="applicants">
        <TabsList className="h-auto flex-wrap justify-start rounded-xl">
          <TabsTrigger value="applicants" className="rounded-lg px-4">Applicants</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg px-4">Payments</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg px-4">Course Statistics</TabsTrigger>
          <TabsTrigger value="messages" className="rounded-lg px-4">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="mt-4 space-y-4">
          <div className="grid gap-3 rounded-2xl bg-card p-4 shadow-soft md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, reference…" className="h-11 rounded-xl pl-9" aria-label="Search applicants" />
            </div>
            <Filter value={cat} onChange={setCat} label="Category" options={[["all", "All categories"], ["nysc", "NYSC Members"], ["student", "Students"]]} />
            <Filter value={course} onChange={setCourse} label="Course" options={[["all", "All courses"], ...SKILLS.map((s) => [s, s] as [string, string])]} />
            <Filter value={status} onChange={setStatus} label="Status" options={[["all", "All statuses"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]]} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-navy">{filtered.length}</strong> of {regs.length}
            </p>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm" disabled={!filtered.length} onClick={() => exportCsv(filtered)}>
                <Download /> CSV
              </Button>
              <Button
                variant="navy"
                size="sm"
                disabled={!filtered.length}
                onClick={() => exportExcel(filtered).catch(() => toast.error("Excel export failed"))}
              >
                <FileSpreadsheet /> Excel
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-card py-16 text-center shadow-soft">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{regs.length ? "No applicants match these filters." : "No registrations yet."}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl bg-card shadow-soft lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-sky text-left text-xs uppercase tracking-wider text-navy/70">
                    <tr>
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Courses</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t border-border/60 hover:bg-surface">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar url={photos[r.photo_path]} name={r.first_name} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">{fullName(r)}</p>
                              <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-navy">{r.reference}</td>
                        <td className="px-4 py-3 text-xs">{categoryLabel(r.category)}</td>
                        <td className="max-w-[220px] px-4 py-3 text-xs text-muted-foreground">{r.courses.join(", ")}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-NG")}</td>
                        <td className="px-4 py-3"><PaymentBadge paid={r.payment_status === "paid"} /></td>
                        <td className="px-4 py-3"><StatusSelect reg={r} /></td>
                        <td className="px-4 py-3">
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/admin/$id" params={{ id: r.id }}><Eye /> View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="grid gap-3 lg:hidden">
                {filtered.map((r) => (
                  <ApplicantCard key={r.id} r={r} photo={photos[r.photo_path]} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentTracker regs={regs} />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="rounded-2xl bg-card p-5 shadow-soft sm:p-6">
            <h2 className="text-lg font-bold text-navy">Course enrollment</h2>
            <p className="text-sm text-muted-foreground">Number of applicants who selected each skill</p>
            <ul className="mt-6 space-y-4">
              {stats.byCourse.map(([name, n]) => (
                <li key={name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-navy">{name}</span>
                    <span className="font-bold text-primary">{n}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-primary transition-all duration-700" style={{ width: `${(n / maxCourse) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <Messages />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: number; accent?: boolean }) {
  return (
    <div className={accent ? "rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-glow sm:p-5" : "rounded-2xl bg-card p-4 shadow-soft sm:p-5"}>
      <Icon className={accent ? "h-6 w-6" : "h-6 w-6 text-primary"} />
      <p className={accent ? "mt-3 font-display text-3xl font-extrabold" : "mt-3 font-display text-3xl font-extrabold text-navy"}>{value}</p>
      <p className={accent ? "text-xs font-semibold opacity-90" : "text-xs font-semibold text-muted-foreground"}>{label}</p>
    </div>
  );
}

function Filter({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-xl md:w-44" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>{l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Avatar({ url, name }: { url?: string | undefined; name: string }) {
  return url ? (
    <img src={url} alt="" className="h-10 w-10 shrink-0 rounded-full border object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky font-bold text-navy">{name[0]}</span>
  );
}

function ApplicantCard({ r, photo }: { r: Registration; photo?: string | undefined }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <Avatar url={photo} name={r.first_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy">{fullName(r)}</p>
          <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={r.status} />
          <PaymentBadge paid={r.payment_status === "paid"} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {categoryLabel(r.category)} • {r.courses.join(", ")}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusSelect reg={r} />
        <Button asChild variant="subtle" size="sm">
          <Link to="/admin/$id" params={{ id: r.id }}><Eye /> View</Link>
        </Button>
      </div>
    </div>
  );
}

function Messages() {
  const { data = [], isLoading } = useQuery(messagesQuery);
  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data.length) return <p className="rounded-2xl bg-card py-16 text-center text-muted-foreground shadow-soft">No messages yet.</p>;
  return (
    <div className="grid gap-3">
      {data.map((m) => (
        <div key={m.id} className="rounded-2xl bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-navy">{m.name}</p>
            <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("en-NG")}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            <a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a>
            {m.phone && <> • <a href={`tel:${m.phone}`} className="hover:text-primary">{m.phone}</a></>}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-navy/90">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
