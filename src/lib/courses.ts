import web from "@/assets/course-web.jpg";
import graphic from "@/assets/course-graphic.jpg";
import data from "@/assets/course-data.jpg";
import uiux from "@/assets/course-uiux.jpg";
import marketing from "@/assets/course-marketing.jpg";
import cyber from "@/assets/course-cyber.jpg";
import type { Skill } from "./registration-schema";

export type Course = {
  slug: string;
  name: string;
  description: string;
  duration?: string;
  image: string;
  skill: Skill;
  overview: string;
  topics: string[];
  tools: string[];
};

export const COURSES: Course[] = [
  {
    slug: "web-development",
    name: "Web Development",
    description: "Build modern websites with HTML, CSS and JavaScript.",
    duration: "8 Weeks",
    image: web,
    skill: "Web Design",
    overview:
      "Go from zero to building responsive, real-world websites. You'll learn how the web works, structure pages with HTML, style them beautifully with CSS and bring them to life with JavaScript.",
    topics: [
      "How the web works",
      "HTML5 page structure",
      "CSS layouts, Flexbox and Grid",
      "Responsive, mobile-first design",
      "JavaScript fundamentals",
      "Publishing your website online",
    ],
    tools: ["HTML", "CSS", "JavaScript", "VS Code"],
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    description: "Create stunning designs using Photoshop and Canva.",
    duration: "6 Weeks",
    image: graphic,
    skill: "Graphic Design",
    overview:
      "Learn the principles of great design and create professional flyers, social media graphics, logos and brand materials that clients will pay for.",
    topics: [
      "Design principles and colour theory",
      "Typography and layout",
      "Photo editing in Photoshop",
      "Social media graphics in Canva",
      "Logo and brand identity basics",
      "Building a design portfolio",
    ],
    tools: ["Photoshop", "Canva"],
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    description: "Turn data into insights using Excel and Power BI.",
    duration: "6 Weeks",
    image: data,
    skill: "Data Analysis",
    overview:
      "Learn to clean, analyse and visualise data so you can help organisations make smarter decisions — one of the most in-demand skills today.",
    topics: [
      "Excel formulas and functions",
      "Data cleaning and preparation",
      "Pivot tables and charts",
      "Power BI dashboards",
      "Telling stories with data",
      "Real-world analysis project",
    ],
    tools: ["Excel", "Power BI"],
  },
  {
    slug: "product-design",
    name: "Product (UI/UX) Design",
    description: "Design amazing digital products.",
    duration: "8 Weeks",
    image: uiux,
    skill: "Product (UI/UX) Design",
    overview:
      "Discover how great apps and websites are designed. Research users, sketch ideas, build wireframes and create polished, clickable prototypes.",
    topics: [
      "User research and personas",
      "User flows and wireframes",
      "Visual design for interfaces",
      "Design systems and components",
      "Interactive prototyping",
      "Usability testing",
    ],
    tools: ["Figma"],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    description: "Learn online marketing, branding and advertising.",
    image: marketing,
    skill: "Digital Marketing",
    overview:
      "Help businesses grow online. Learn branding, content creation, social media strategy and paid advertising that brings real results.",
    topics: [
      "Branding and positioning",
      "Content marketing",
      "Social media strategy",
      "Paid ads on social platforms",
      "Email marketing basics",
      "Measuring campaign results",
    ],
    tools: ["Meta Ads", "Google Analytics", "Canva"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn the fundamentals of digital security.",
    image: cyber,
    skill: "Cybersecurity",
    overview:
      "Understand how cyber attacks happen and how to protect people, devices and organisations. A strong foundation for a career in security.",
    topics: [
      "Security fundamentals",
      "Common threats and attacks",
      "Password and account security",
      "Network security basics",
      "Safe browsing and phishing awareness",
      "Introduction to security careers",
    ],
    tools: ["Security tools overview"],
  },
];

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}
