"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Pikachu Professional Template
 * Clean, ATS-friendly, single-column layout with centered header
 * Inspired by Reactive Resume design
 */
export default function PikachuTemplate({ data, style }: Props) {
  // Handle undefined or missing data gracefully
  if (!data || !data.content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <p className="text-gray-400">Loading resume data...</p>
      </div>
    );
  }

  const {
    personalInfo = {},
    workExperience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    interests = [],
  } = data.content;

  // Parse the JSON template data if it exists
  // Use only data.content

  // Merge personal info with basics
  const fullName = personalInfo.fullName || personalInfo.name || "";
  const title = personalInfo.title || personalInfo.position || "";
  const email = personalInfo.email || "";
  const phone = personalInfo.phone || "";
  const location = personalInfo.location || "";
  const website = personalInfo.website || "";
  const linkedin = personalInfo.linkedin || "";
  const photoUrl = personalInfo.photoUrl || "";

  // Get summary from sections
  const summaryContent = personalInfo.summary || "";

  // Get experience items
  const experienceItems = workExperience;

  // Get education items
  const educationItems = education;

  // Get skills - could be from skills array or sections
  const rawSkills = skills;
  // Flatten skills if they're in {category, items} format
  const skillsData = rawSkills.flatMap((skill: any) => {
    if (skill && typeof skill === "object" && "items" in skill) {
      return skill.items || [];
    }
    return skill;
  });

  // Get projects
  const projectItems = projects;

  // Get certifications
  const certificationItems = certifications;

  // Get languages
  const languageItems = languages;

  // Get profiles (LinkedIn, GitHub, etc.)
  const profiles = personalInfo.profiles || [];

  const primaryColor = (style as any)?.colors?.primary || "#2563EB"; // Blue-600
  const textColor = (style as any)?.colors?.text || "#111827"; // Gray-900

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: style?.body?.fontFamily || "Inter, system-ui, sans-serif",
        fontSize: "10pt",
        lineHeight: "1.6",
        color: textColor,
      }}
    >
      {/* Centered Header Section */}
      <header
        className="text-center p-8 pb-6 border-b-2"
        style={{ borderColor: primaryColor }}
      >
        {/* Photo (if provided) */}
        {photoUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-28 h-28 rounded-full object-cover border-4"
              style={{ borderColor: primaryColor }}
            />
          </div>
        )}

        {/* Name */}
        <h1
          className="text-5xl font-bold mb-2"
          style={{
            fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
            color: primaryColor,
            letterSpacing: "-0.02em",
          }}
        >
          {fullName}
        </h1>

        {/* Title */}
        {title && (
          <p className="text-xl font-medium mb-4" style={{ color: "#374151" }}>
            {title}
          </p>
        )}

        {/* Contact Info - Horizontal Layout */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700 mb-3">
          {email && (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {email}
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {phone}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {location}
            </span>
          )}
          {website && (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              {website}
            </span>
          )}
          {linkedin && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </span>
          )}
        </div>

        {/* Social Profiles */}
        {profiles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            {profiles.map((profile: any) => (
              <a
                key={profile.id}
                href={profile.url?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium"
                style={{ color: primaryColor }}
              >
                {profile.network}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Single Column Content */}
      <div className="px-12 py-6">
        {/* Summary Section */}
        {summaryContent && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              {"Professional Summary"}
            </h2>
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: summaryContent }}
            />
          </section>
        )}

        {/* Experience Section */}
        {experienceItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              {"Professional Experience"}
            </h2>
            <div className="space-y-5">
              {experienceItems.map((exp: any, index: number) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3
                        className="text-base font-bold"
                        style={{ color: textColor }}
                      >
                        {exp.position || exp.role || exp.title || "Position"}
                      </h3>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {exp.company || "Company"}
                      </p>
                      {exp.location && (
                        <div className="text-xs text-gray-600 mt-1">
                          {exp.location}
                        </div>
                      )}
                    </div>
                    {(exp.startDate || exp.endDate || exp.date) && (
                      <div className="text-right text-sm text-gray-600 ml-4 whitespace-nowrap">
                        {exp.startDate || exp.endDate ? (
                          <div className="font-medium">
                            {exp.startDate || ""}
                            {exp.startDate && exp.endDate ? " - " : ""}
                            {exp.endDate || (exp.startDate ? "Present" : "")}
                          </div>
                        ) : exp.date ? (
                          <div className="font-medium">{exp.date}</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {(exp.description || exp.summary) && (
                    <div className="text-sm leading-relaxed text-gray-700 mb-2 whitespace-pre-wrap">
                      {exp.description || exp.summary}
                    </div>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-sm leading-relaxed text-gray-700 space-y-1">
                      {exp.achievements.map(
                        (achievement: string, i: number) => (
                          <li key={i}>{achievement}</li>
                        )
                      )}
                    </ul>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm leading-relaxed text-gray-700 space-y-1">
                      {exp.highlights.map((highlight: string, i: number) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {educationItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              {"Education"}
            </h2>
            <div className="space-y-4">
              {educationItems.map((edu: any, index: number) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className="text-base font-bold"
                        style={{ color: textColor }}
                      >
                        {edu.degree || edu.studyType}
                      </h3>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {edu.institution || edu.school}
                      </p>
                      {edu.field && (
                        <p className="text-xs text-gray-600 mt-1">
                          {edu.field || edu.area}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {edu.graduationDate && (
                        <div className="font-medium">
                          {edu.graduationDate || edu.date}
                        </div>
                      )}
                      {edu.gpa && (
                        <div className="text-xs">
                          GPA: {edu.gpa || edu.score}
                        </div>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <p
                      className="text-xs text-gray-600 mt-2"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skillsData.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((skill: any, index: number) => {
                const skillName = skill.name || skill;
                return (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs font-medium rounded border"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: `${primaryColor}08`,
                    }}
                  >
                    {skillName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projectItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              {"Projects"}
            </h2>
            <div className="space-y-4">
              {projectItems.map((project: any, index: number) => (
                <div key={project.id || index}>
                  <div className="mb-2">
                    <h3
                      className="text-base font-bold"
                      style={{ color: textColor }}
                    >
                      {project.name || project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        {project.description}
                      </p>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies
                            .filter((t: string) => t.trim())
                            .map((tech: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-300"
                              >
                                {tech}
                              </span>
                            ))}
                        </div>
                      )}
                    {(project.github || project.url?.href) && (
                      <div className="flex gap-3 mt-2 text-xs">
                        {project.github && (
                          <a
                            href={
                              project.github.startsWith("http")
                                ? project.github
                                : `https://${project.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                            style={{ color: primaryColor }}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                          </a>
                        )}
                        {project.url?.href && (
                          <a
                            href={project.url.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: primaryColor }}
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {project.summary && (
                    <div
                      className="text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: project.summary }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two-Column Grid for Certifications and Languages */}
        <div className="grid grid-cols-2 gap-6">
          {/* Certifications Section */}
          {certificationItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Certifications"}
              </h2>
              <div className="space-y-3">
                {certificationItems.map((cert: any, index: number) => (
                  <div key={cert.id || index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className="text-sm font-bold"
                          style={{ color: textColor }}
                        >
                          {cert.name || cert.title}
                        </h3>
                        <p
                          className="text-xs font-medium"
                          style={{ color: primaryColor }}
                        >
                          {cert.issuer}
                        </p>
                        {cert.credential && (
                          <p className="text-xs text-gray-600 mt-1">
                            ID: {cert.credential}
                          </p>
                        )}
                      </div>
                      {cert.date && (
                        <p className="text-xs text-gray-600">{cert.date}</p>
                      )}
                    </div>
                    {cert.description && (
                      <p
                        className="text-xs text-gray-600 mt-2"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages Section */}
          {languageItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Languages"}
              </h2>
              <div className="space-y-2">
                {languageItems.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">
                      {lang.name || lang.language}
                    </span>
                    <span className="text-xs text-gray-600">
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Interests Section */}
        {interests.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 uppercase tracking-wide pb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                borderBottom: `2px solid ${primaryColor}`,
              }}
            >
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest: any, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: "#F3F4F6", color: textColor }}
                >
                  {interest.name || interest}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
