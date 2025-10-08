"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Chikorita Professional Template - Marketing Dynamic Design
 * Right sidebar layout (mirror of Azurill), creative visual styling
 * Inspired by dynamic marketing resumes
 */
export default function ChikoritaTemplate({ data, style }: Props) {
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

  // Use only data.content - no template property exists on ResumeData

  // Merge personal info
  const fullName = personalInfo.fullName || personalInfo.name || "";
  const title = personalInfo.title || personalInfo.position || "";
  const email = personalInfo.email || "";
  const phone = personalInfo.phone || "";
  const location = personalInfo.location || "";
  const website = personalInfo.website || "";
  const photoUrl = personalInfo.photoUrl || "";

  // Get summary
  const summaryContent = personalInfo.summary || "";

  // Get experience items
  const experienceItems = workExperience;

  // Get education items
  const educationItems = education;

  // Get skills - flatten if in {category, items} format
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

  const primaryColor = (style as any)?.colors?.primary || "#F97316"; // Orange
  const textColor = (style as any)?.colors?.text || "#1F2937"; // Gray-800

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
        lineHeight: "1.5",
        color: textColor,
      }}
    >
      {/* Header Section */}
      <header
        className="p-8 pb-6"
        style={{
          borderBottom: `4px solid ${primaryColor}`,
          background: `linear-gradient(to right, transparent 0%, ${primaryColor}08 100%)`,
        }}
      >
        <div className="flex gap-6 items-start">
          {/* Photo (if provided) */}
          {photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt={fullName}
                className="w-28 h-28 rounded-lg object-cover"
                style={{
                  border: `3px solid ${primaryColor}`,
                  boxShadow: `0 4px 6px ${primaryColor}30`,
                }}
              />
            </div>
          )}

          {/* Name and Title */}
          <div className="flex-1">
            <h1
              className="text-5xl font-extrabold mb-2"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                letterSpacing: "-0.5px",
              }}
            >
              {fullName}
            </h1>
            {title && (
              <p
                className="text-xl font-semibold mb-4"
                style={{ color: textColor }}
              >
                {title}
              </p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
              {email && (
                <span className="flex items-center gap-1.5 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: primaryColor }}
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
                <span className="flex items-center gap-1.5 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: primaryColor }}
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
                <span className="flex items-center gap-1.5 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: primaryColor }}
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
                <span className="flex items-center gap-1.5 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: primaryColor }}
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
            </div>

            {/* Social Profiles */}
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-3">
                {profiles.map((profile: any) => (
                  <a
                    key={profile.id}
                    href={profile.url?.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline font-semibold"
                    style={{ color: primaryColor }}
                  >
                    <span>{profile.network}:</span>
                    <span className="font-medium">{profile.username}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Two-Column Layout - REVERSED (Main Left, Sidebar Right) */}
      <div className="flex gap-6 p-8">
        {/* Main Column (Left - 60%) */}
        <div className="flex-1" style={{ width: "60%" }}>
          {/* Summary Section */}
          {summaryContent && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-2xl font-bold mb-3 pb-2 flex items-center gap-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `3px solid ${primaryColor}`,
                }}
              >
                <span
                  className="w-2 h-8 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                {"About Me"}
              </h2>
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summaryContent }}
              />
            </section>
          )}

          {/* Experience Section with Creative Timeline */}
          {experienceItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-2xl font-bold mb-4 pb-2 flex items-center gap-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `3px solid ${primaryColor}`,
                }}
              >
                <span
                  className="w-2 h-8 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                {"Experience"}
              </h2>
              <div className="space-y-5">
                {experienceItems.map((exp: any, index: number) => (
                  <div
                    key={exp.id || index}
                    className="relative pl-6 pb-4"
                    style={{
                      borderLeft: `3px solid ${primaryColor}20`,
                    }}
                  >
                    {/* Timeline Circle */}
                    <div
                      className="absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-[8.5px]"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 0 4px white, 0 0 0 6px ${primaryColor}40`,
                      }}
                    />

                    <div className="mb-2">
                      <h3
                        className="text-lg font-bold"
                        style={{ color: textColor }}
                      >
                        {exp.position || exp.title}
                      </h3>
                      <p
                        className="text-base font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {exp.company}
                      </p>
                      <div className="text-xs text-gray-600 flex gap-3 mt-1">
                        {(exp.startDate || exp.endDate) && (
                          <span className="font-semibold">
                            {exp.startDate}{" "}
                            {exp.startDate && exp.endDate && "-"} {exp.endDate}
                          </span>
                        )}
                        {exp.location && <span>• {exp.location}</span>}
                      </div>
                    </div>
                    {exp.description && (
                      <p
                        className="text-sm leading-relaxed mb-2"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {exp.achievements.map(
                          (achievement: string, i: number) => (
                            <li key={i}>{achievement}</li>
                          )
                        )}
                      </ul>
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="text-sm list-disc list-inside space-y-1">
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

          {/* Projects Section */}
          {projectItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-2xl font-bold mb-4 pb-2 flex items-center gap-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `3px solid ${primaryColor}`,
                }}
              >
                <span
                  className="w-2 h-8 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                {"Projects"}
              </h2>
              <div className="space-y-4">
                {projectItems.map((project: any, index: number) => (
                  <div
                    key={project.id || index}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: `${primaryColor}08`,
                      borderLeft: `4px solid ${primaryColor}`,
                    }}
                  >
                    <div className="mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <h3
                          className="text-base font-bold"
                          style={{ color: textColor }}
                        >
                          {project.name || project.title}
                        </h3>
                        {project.github && (
                          <a
                            href={
                              project.github.startsWith("http")
                                ? project.github
                                : `https://${project.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs hover:opacity-70 flex items-center gap-1"
                            style={{ color: primaryColor }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p
                          className="text-sm mb-1"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map(
                            (tech: string, techIndex: number) => (
                              <span
                                key={techIndex}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${primaryColor}20`,
                                  color: primaryColor,
                                  border: `1px solid ${primaryColor}40`,
                                }}
                              >
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column (Right - 40%) */}
        <div
          className="w-96 pl-6"
          style={{
            borderLeft: `3px solid ${primaryColor}30`,
          }}
        >
          {/* Skills Section */}
          {skillsData.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-xl font-bold mb-4 pb-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Skills
              </h2>
              <div className="space-y-2">
                {skillsData.map((skill: any, index: number) => {
                  const skillName = skill.name || skill;
                  return (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm font-medium rounded"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderLeft: `3px solid ${primaryColor}`,
                      }}
                    >
                      {skillName}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education Section */}
          {educationItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-xl font-bold mb-4 pb-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Education"}
              </h2>
              <div className="space-y-4">
                {educationItems.map((edu: any, index: number) => (
                  <div
                    key={edu.id || index}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: `${primaryColor}08`,
                    }}
                  >
                    <h3
                      className="text-sm font-bold mb-1"
                      style={{ color: textColor }}
                    >
                      {edu.degree}
                      {edu.field && (
                        <span className="font-normal"> in {edu.field}</span>
                      )}
                    </h3>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {edu.institution}
                    </p>
                    <div className="text-xs text-gray-600 mt-1">
                      {edu.graduationDate && (
                        <div className="font-medium">{edu.graduationDate}</div>
                      )}
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                    {edu.description && (
                      <p
                        className="text-xs mt-2 leading-relaxed"
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

          {/* Certifications Section */}
          {certificationItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-xl font-bold mb-4 pb-2"
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
                    <h3
                      className="text-sm font-bold"
                      style={{ color: textColor }}
                    >
                      {cert.name || cert.title}
                    </h3>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {cert.issuer}
                    </p>
                    <div className="text-xs text-gray-600">
                      {cert.date && <div>{cert.date}</div>}
                      {cert.credential && <div>ID: {cert.credential}</div>}
                    </div>
                    {cert.description && (
                      <p
                        className="text-xs mt-1 leading-relaxed"
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
                className="text-xl font-bold mb-4 pb-2"
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
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-semibold">
                      {lang.name || lang.language}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor,
                      }}
                    >
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests Section */}
          {interests.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-xl font-bold mb-4 pb-2"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
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
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    {interest.name || interest}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
