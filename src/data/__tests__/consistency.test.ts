import { describe, expect, it } from "vitest";
import resume from "../resume.json";
import { journey, profile, projects, spokenLanguages, stats } from "../content";
import { facts } from "../knowledge";

// The resume (src/data/resume.json), the site (content.ts) and the chatbot (knowledge.ts) must never disagree.
const stat = (label: string) => stats.find((s) => s.label === label)?.value;
const log = (org: string) => journey.find((j) => j.org.includes(org));
const fact = (id: string) => facts.find((f) => f.id === id)?.answer ?? "";

describe("resume, site and chatbot agree", () => {
  it("shows the same contact details", () => {
    expect(resume.email).toBe(profile.email);
    expect(resume.phone).toBe(profile.phone);
    expect(resume.location).toBe(profile.location);
    expect(resume.links.map((l) => l.url)).toContain(profile.siteUrl);
    expect(resume.links.map((l) => l.url)).toContain(profile.githubUrl);
    expect(resume.links.some((l) => l.label.includes(profile.linkedin))).toBe(true);
  });

  it("counts the same certifications", () => {
    expect(String(resume.certifications.count)).toBe(stat("Certifications"));
    expect(resume.summary).toContain(`${resume.certifications.count} completed certifications`);
  });

  it("lists the same spoken languages", () => {
    const line = resume.skills.find((s) => s.label === "Spoken Languages");
    expect(line?.text.split(", ")).toEqual(spokenLanguages);
  });

  it("has the same experience dates", () => {
    const nova = resume.experience.find((e) => e.title.includes("Nova Techset"));
    const ecell = resume.experience.find((e) => e.title.includes("E-Cell"));
    expect(nova?.date).toBe(log("Nova Techset")?.date);
    expect(ecell?.date).toBe(log("E-Cell")?.date);
    expect(fact("internship")).toContain("15 Aug 2026");
  });

  it("uses the same mentoring numbers", () => {
    const mentor = resume.leadership.find((l) => l.title.includes("Student Mentor"));
    const onSite = log("DES New English")?.points.join(" ") ?? "";
    for (const n of ["120+", "40+"]) {
      expect(JSON.stringify(mentor?.bullets)).toContain(n);
      expect(onSite).toContain(n);
      expect(fact("mentoring")).toContain(n);
    }
  });

  it("links the same project repositories", () => {
    for (const project of projects) {
      if (!project.repoUrl) continue;
      const entry = resume.projects.find((p) => p.title.startsWith(project.name));
      const urls = (entry?.bullets ?? []).map((b) => (typeof b === "string" ? "" : b.url));
      expect(urls).toContain(project.repoUrl);
    }
  });

  it("mentions the hackathon count and SIH everywhere", () => {
    expect(JSON.stringify(resume.leadership)).toContain(`${stat("Hackathons Attended")} hackathons`);
    expect(JSON.stringify(resume.leadership)).toContain("Smart India Hackathon");
    expect(fact("hackathon")).toContain("Smart India Hackathon");
  });
});
