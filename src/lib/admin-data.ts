import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];
export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

export const isAdminQuery = queryOptions({
  queryKey: ["is-admin"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { isAdmin: false, email: null as string | null };
    const { data, error } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (error) throw error;
    return { isAdmin: !!data, email: u.user.email ?? null };
  },
});

export const registrationsQuery = queryOptions({
  queryKey: ["registrations"],
  queryFn: async () => {
    const all: Registration[] = [];
    const page = 1000;
    for (let from = 0; ; from += page) {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + page - 1);
      if (error) throw error;
      all.push(...(data ?? []));
      if (!data || data.length < page) break;
    }
    return all;
  },
});

export const registrationQuery = (id: string) =>
  queryOptions({
    queryKey: ["registration", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const messagesQuery = queryOptions({
  queryKey: ["contact-messages"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  },
});

export const photoUrlsQuery = (paths: string[]) =>
  queryOptions({
    queryKey: ["photo-urls", paths],
    enabled: paths.length > 0,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("passports").createSignedUrls(paths, 60 * 60);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((d) => {
        if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
      });
      return map;
    },
  });

export async function updateStatus(id: string, status: RegistrationStatus) {
  const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
  if (error) throw error;
}

export const fullName = (r: Pick<Registration, "surname" | "first_name" | "other_names">) =>
  [r.surname, r.first_name, r.other_names].filter(Boolean).join(" ");

export const categoryLabel = (c: Registration["category"]) => (c === "nysc" ? "NYSC Corps Member" : "Student");

export type Payment = Database["public"]["Tables"]["payments"]["Row"] & {
  registrations: Pick<Registration, "reference" | "surname" | "first_name"> | null;
};

export const paymentsQuery = queryOptions({
  queryKey: ["payments"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, registrations(reference, surname, first_name)")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data ?? []) as Payment[];
  },
});

export const registrationPaymentsQuery = (registrationId: string) =>
  queryOptions({
    queryKey: ["payments", registrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("registration_id", registrationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

/** Manually mark a registration paid (e.g. cash or transfer at the office) or unpaid. */
export async function setPaymentStatus(r: Pick<Registration, "id">, paid: boolean, amount: number) {
  const { error } = await supabase
    .from("registrations")
    .update(
      paid
        ? { payment_status: "paid", amount_paid: amount, amount_due: amount, paid_at: new Date().toISOString() }
        : { payment_status: "unpaid", amount_paid: 0, paid_at: null },
    )
    .eq("id", r.id);
  if (error) throw error;
}

export async function saveCourseFees(fees: { course: string; amount: number }[]) {
  const { error } = await supabase.from("course_fees").upsert(fees, { onConflict: "course" });
  if (error) throw error;
}
