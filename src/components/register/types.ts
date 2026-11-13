import type { Skill } from "@/lib/registration-schema";

export type PhotoState = { data: string; type: "image/jpeg"; preview: string; name: string } | null;

export type PersonalState = {
  surname: string;
  first_name: string;
  other_names: string;
  gender: "" | "Male" | "Female";
  date_of_birth: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

export type CategoryState = {
  category: "" | "nysc" | "student";
  institution: string;
  discipline: string;
  state_code: string;
  callup_number: string;
  ppa: string;
  level_of_study: string;
  matric_number: string;
};

export type TrainingState = {
  courses: Skill[];
  training_mode: "" | "Online" | "Physical";
  training_schedule: "" | "Flexible" | "Fixed";
  training_location: string;
};

export type FormState = {
  photo: PhotoState;
  personal: PersonalState;
  category: CategoryState;
  training: TrainingState;
  agreed: boolean;
};

export const initialForm: FormState = {
  photo: null,
  personal: {
    surname: "",
    first_name: "",
    other_names: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  },
  category: {
    category: "",
    institution: "",
    discipline: "",
    state_code: "",
    callup_number: "",
    ppa: "",
    level_of_study: "",
    matric_number: "",
  },
  training: { courses: [], training_mode: "", training_schedule: "", training_location: "" },
  agreed: false,
};

export function categoryPayload(c: CategoryState) {
  if (c.category === "nysc") {
    return {
      category: "nysc" as const,
      institution: c.institution,
      discipline: c.discipline,
      state_code: c.state_code,
      callup_number: c.callup_number,
      ppa: c.ppa,
    };
  }
  if (c.category === "student") {
    return {
      category: "student" as const,
      institution: c.institution,
      discipline: c.discipline,
      level_of_study: c.level_of_study,
      matric_number: c.matric_number,
    };
  }
  return { category: c.category };
}

export type ErrorKey =
  | keyof PersonalState
  | keyof CategoryState
  | keyof TrainingState
  | "photo"
  | "agreed_terms"
  | "_form";
export type Errors = Partial<Record<ErrorKey, string>>;
