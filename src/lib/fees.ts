import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FeeMap } from "./money";

export const courseFeesQuery = queryOptions({
  queryKey: ["course-fees"],
  queryFn: async (): Promise<FeeMap> => {
    const { data, error } = await supabase.from("course_fees").select("course, amount");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((f) => [f.course, f.amount]));
  },
});
