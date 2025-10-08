"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Bronzor Professional Template - Corporate Classic Design
 * Executive compact style with prominent header and tighter sections
 * Professional corporate appearance
 */
export default function BronzorTemplate({ data, style }: Props) {
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
  const skillsData = skills.flatMap((skill: any) => {
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

  const primaryColor = (style as any)?.colors?.primary || "#78716C"; // Stone
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
        fontSize: "9.5pt",
        lineHeight: "1.4",
        color: textColor,
      }}
    >
      {/* Prominent Executive Header with Dark Background */}
      <header
        className="px-10 py-6"
        style={{
          backgroundColor: primaryColor,
          color: "white",
        }}
      >
        <div className="flex gap-6 items-center">
          {/* Photo */}
          {photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt={fullName}
                className="w-24 h-24 rounded object-cover border-4 border-white"
              />
            </div>
          )}

          <div className="flex-1">
            {/* Name - Large and Bold */}
            <h1
              className="text-5xl font-black mb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                letterSpacing: "-1px",
              }}
            >
              {fullName}
            </h1>

            {/* Title */}
            {title && (
              <p className="text-xl font-medium mb-3 opacity-95">{title}</p>
            )}

            {/* Contact Info - Compact Horizontal */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90">
              {email && <span>{email}</span>}
              {phone && <span>| {phone}</span>}
              {location && <span>| {location}</span>}
              {website && <span>| {website}</span>}
            </div>

            {/* Social Profiles */}
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2 opacity-90">
                {profiles.map((profile: any) => (
                  <span key={profile.id}>
                    {profile.network}: {profile.username}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Compact Two-Column Layout */}
      <div className="flex gap-5 px-10 py-5">
        {/* Main Column (65%) */}
        <div className="flex-1">
          {/* Summary - Compact */}
          {summaryContent && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Executive Summary"}
              </h2>
              <div
                className="text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summaryContent }}
              />
            </section>
          )}

          {/* Experience - Compact Format */}
          {experienceItems.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Professional Experience"}
              </h2>
              <div className="space-y-3">
                {experienceItems.map((exp: any, index: number) => (
                  <div key={exp.id || index}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3
                        className="text-sm font-bold"
                        style={{ color: textColor }}
                      >
                        {exp.position || exp.title}
                      </h3>
                      {(exp.startDate || exp.endDate) && (
                        <span className="text-xs font-medium text-gray-600">
                          {exp.startDate} {exp.startDate && exp.endDate && "-"}{" "}
                          {exp.endDate}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {exp.company}
                      </p>
                      {exp.location && (
                        <span className="text-xs text-gray-500">
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p
                        className="text-xs leading-relaxed mb-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="text-xs list-disc list-inside space-y-0.5">
                        {exp.achievements.map(
                          (achievement: string, i: number) => (
                            <li key={i}>{achievement}</li>
                          )
                        )}
                      </ul>
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="text-xs list-disc list-inside space-y-0.5">
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

          {/* Projects - Compact */}
          {projectItems.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Key Projects"}
              </h2>
              <div className="space-y-2">
                {projectItems.map((project: any, index: number) => (
                  <div key={project.id || index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className="text-sm font-bold"
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
                            className="w-3 h-3"
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
                        className="text-xs mb-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {project.description}
                      </p>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.technologies.map(
                            (tech: string, techIndex: number) => (
                              <span
                                key={techIndex}
                                className="text-xs px-1.5 py-0.5 rounded"
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

        {/* Sidebar Column (35%) - Compact */}
        <div className="w-80">
          {/* Skills - Compact List */}
          {skillsData.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Core Skills
              </h2>
              <div className="space-y-1">
                {skillsData.map((skill: any, index: number) => {
                  const skillName = skill.name || skill;
                  return (
                    <div
                      key={index}
                      className="text-xs px-2 py-1 font-medium"
                      style={{
                        backgroundColor: `${primaryColor}10`,
                        borderLeft: `2px solid ${primaryColor}`,
                      }}
                    >
                      {skillName}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education - Compact */}
          {educationItems.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Education"}
              </h2>
              <div className="space-y-2">
                {educationItems.map((edu: any, index: number) => (
                  <div key={edu.id || index}>
                    <h3
                      className="text-xs font-bold"
                      style={{ color: textColor }}
                    >
                      {edu.degree}
                      {edu.field && (
                        <span className="font-normal"> in {edu.field}</span>
                      )}
                    </h3>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {edu.institution}
                    </p>
                    <div className="text-xs text-gray-600">
                      {edu.graduationDate && <div>{edu.graduationDate}</div>}
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                    {edu.description && (
                      <p
                        className="text-xs mt-1 leading-relaxed"
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

          {/* Certifications - Compact */}
          {certificationItems.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Certifications"}
              </h2>
              <div className="space-y-2">
                {certificationItems.map((cert: any, index: number) => (
                  <div key={cert.id || index}>
                    <h3
                      className="text-xs font-bold"
                      style={{ color: textColor }}
                    >
                      {cert.name || cert.title}
                    </h3>
                    <p className="text-xs" style={{ color: primaryColor }}>
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

          {/* Languages - Compact */}
          {languageItems.length > 0 && (
            <section className="mb-5">
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {"Languages"}
              </h2>
              <div className="space-y-1">
                {languageItems.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    className="text-xs flex justify-between"
                  >
                    <span className="font-semibold">
                      {lang.name || lang.language}
                    </span>
                    <span className="text-gray-600">
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests - Compact Tags */}
          {interests.length > 0 && (
            <section>
              <h2
                className="text-base font-bold mb-2 uppercase tracking-wider pb-1"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Interests
              </h2>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: textColor,
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
