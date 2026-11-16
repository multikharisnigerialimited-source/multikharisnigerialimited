import { describe, expect, it } from "vitest";
import { categorySchema, personalSchema, submissionSchema, trainingSchema } from "@/lib/registration-schema";

const personal = {
  surname: "Okafor",
  first_name: "Ada",
  other_names: "",
  gender: "Female",
  date_of_birth: "2000-05-10",
  phone: "08106168576",
  whatsapp: "",
  email: "ada@example.com",
  address: "12 Airport Road, Warri",
};
const nysc = {
  category: "nysc",
  institution: "University of Benin",
  discipline: "Computer Science",
  state_code: "DT/24A/1234",
  callup_number: "NYSC/UNIBEN/2024/12345",
  ppa: "Warri South LGA",
};
const training = { courses: ["Web Design"], training_mode: "Online", training_schedule: "Flexible", training_location: "" };
const photo = { data: "x".repeat(200), type: "image/jpeg" };

describe("registration rules", () => {
  it("requires surname and first name", () => {
    expect(personalSchema.safeParse({ ...personal, surname: "" }).success).toBe(false);
    expect(personalSchema.safeParse({ ...personal, first_name: " " }).success).toBe(false);
  });

  it("rejects an invalid Nigerian phone number", () => {
    expect(personalSchema.safeParse({ ...personal, phone: "12345" }).success).toBe(false);
    expect(personalSchema.safeParse({ ...personal, phone: "+234 812 882 9678" }).success).toBe(true);
  });

  it("requires NYSC-specific fields for corps members", () => {
    expect(categorySchema.safeParse(nysc).success).toBe(true);
    expect(categorySchema.safeParse({ ...nysc, ppa: "" }).success).toBe(false);
    expect(categorySchema.safeParse({ ...nysc, state_code: "1234" }).success).toBe(false);
  });

  it("requires level of study and matric number for students", () => {
    const student = { category: "student", institution: "COE Warri", discipline: "Education", level_of_study: "200 Level", matric_number: "" };
    expect(categorySchema.safeParse(student).success).toBe(false);
    expect(categorySchema.safeParse({ ...student, matric_number: "COE/2023/001" }).success).toBe(true);
  });

  it("requires at least one course and allows multiple", () => {
    expect(trainingSchema.safeParse({ ...training, courses: [] }).success).toBe(false);
    expect(trainingSchema.safeParse({ ...training, courses: ["Web Design", "Data Analysis", "Computer Appreciation (Microsoft Office)"] }).success).toBe(true);
  });

  it("no longer offers Cybersecurity", () => {
    expect(trainingSchema.safeParse({ ...training, courses: ["Cybersecurity"] }).success).toBe(false);
  });

  it("requires a training location only for physical training", () => {
    expect(trainingSchema.safeParse({ ...training, training_mode: "Physical" }).success).toBe(false);
    expect(trainingSchema.safeParse({ ...training, training_mode: "Physical", training_location: "Warri" }).success).toBe(true);
  });

  it("requires a receipt screenshot when paying by bank transfer", () => {
    const base = { personal, category: nysc, training, photo, agreed_terms: true };
    expect(submissionSchema.safeParse({ ...base, payment: { method: "transfer" } }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...base, payment: { method: "transfer", receipt: photo } }).success).toBe(true);
    expect(submissionSchema.safeParse({ ...base }).success).toBe(false);
  });

  it("blocks submission without agreeing to the terms or without a photo", () => {
    const full = { personal, category: nysc, training, photo, payment: { method: "card" }, agreed_terms: true };
    expect(submissionSchema.safeParse(full).success).toBe(true);
    expect(submissionSchema.safeParse({ ...full, agreed_terms: false }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...full, photo: { data: "", type: "image/jpeg" } }).success).toBe(false);
  });
});
