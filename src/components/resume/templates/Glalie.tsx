"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Glalie Professional Template - Tech Minimal Design
 * Technical grid-based layout with skill bars, modern tech aesthetic
 * Clean technical design
 */
export default function GlalieTemplate({ data, style }: Props) {
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

  // Use only data.content

  const fullName = personalInfo.fullName || personalInfo.name || "";
  const title = personalInfo.title || personalInfo.position || "";
  const email = personalInfo.email || "";
  const phone = personalInfo.phone || "";
  const location = personalInfo.location || "";
  const website = personalInfo.website || "";
  const photoUrl = personalInfo.photoUrl || "";

  const summaryContent = personalInfo.summary || "";
  const experienceItems = workExperience;
  const educationItems = education;

  const rawSkills = skills;
  const skillsData = rawSkills.flatMap((skill: any) => {
    if (skill && typeof skill === "object" && "items" in skill) {
      return skill.items || [];
    }
    return skill;
  });

  const projectItems = projects;
  const certificationItems = certifications;
  const languageItems = languages;
  const profiles = personalInfo.profiles || [];

  const primaryColor = (style as any)?.colors?.primary || "#8B5CF6"; // Purple
  const textColor = (style as any)?.colors?.text || "#1F2937";

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        fontSize: "9.5pt",
        lineHeight: "1.5",
        color: textColor,
      }}
    >
      {/* Modern Tech Header with Grid */}
      <header
        className="px-8 py-6"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          color: "white",
        }}
      >
        <div className="grid grid-cols-3 gap-4 items-center">
          {photoUrl && (
            <div className="col-span-1">
              <img
                src={photoUrl}
                alt={fullName}
                className="w-24 h-24 rounded object-cover border-4 border-white"
              />
            </div>
          )}
          <div className={photoUrl ? "col-span-2" : "col-span-3"}>
            <h1
              className="text-4xl font-bold mb-1"
              style={{ letterSpacing: "-0.5px" }}
            >
              {fullName}
            </h1>
            {title && (
              <p className="text-lg font-medium opacity-90 mb-3">{title}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs opacity-90">
              {email && <span>📧 {email}</span>}
              {phone && <span>📱 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {website && <span>🌐 {website}</span>}
            </div>
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs mt-2 opacity-90">
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

      {/* Grid Layout */}
      <div className="px-8 py-6">
        {/* Summary */}
        {summaryContent && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-3 pb-2 border-b-2"
              style={{
                color: primaryColor,
                borderColor: primaryColor,
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              &gt; PROFILE
            </h2>
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: summaryContent }}
            />
          </section>
        )}

        {/* Skills Grid with Progress Bars */}
        {skillsData.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-4 pb-2 border-b-2"
              style={{
                color: primaryColor,
                borderColor: primaryColor,
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              &gt; TECHNICAL SKILLS
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {skillsData.map((skill: any, index: number) => {
                const skillName = skill.name || skill;
                const level = skill.level || Math.floor(Math.random() * 3) + 3; // 3-5 for demo
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{skillName}</span>
                      <span className="text-xs" style={{ color: primaryColor }}>
                        {"█".repeat(level)}
                        {"░".repeat(5 - level)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(level / 5) * 100}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experienceItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-4 pb-2 border-b-2"
              style={{
                color: primaryColor,
                borderColor: primaryColor,
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              &gt; EXPERIENCE
            </h2>
            <div className="space-y-4">
              {experienceItems.map((exp: any, index: number) => (
                <div
                  key={exp.id || index}
                  className="pl-4"
                  style={{ borderLeft: `3px solid ${primaryColor}` }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold">
                      {exp.position || exp.title}
                    </h3>
                    {(exp.startDate || exp.endDate) && (
                      <span
                        className="text-xs font-mono"
                        style={{ color: primaryColor }}
                      >
                        {exp.startDate} {exp.startDate && exp.endDate && "-"}{" "}
                        {exp.endDate}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-gray-600 mb-2">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p
                      className="text-xs leading-relaxed mb-2"
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

        {/* Projects Grid */}
        {projectItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-lg font-bold mb-4 pb-2 border-b-2"
              style={{
                color: primaryColor,
                borderColor: primaryColor,
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              &gt; PROJECTS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {projectItems.map((project: any, index: number) => (
                <div
                  key={project.id || index}
                  className="p-3 rounded border-2"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold">
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
                        className="text-xs hover:opacity-70"
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
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
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

        {/* Education & Certifications Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {educationItems.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 pb-2 border-b-2"
                style={{
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                &gt; EDUCATION
              </h2>
              <div className="space-y-3">
                {educationItems.map((edu: any, index: number) => (
                  <div key={edu.id || index}>
                    <h3 className="text-sm font-bold">
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
                      {edu.graduationDate && (
                        <div className="font-mono">{edu.graduationDate}</div>
                      )}
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

          {certificationItems.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 pb-2 border-b-2"
                style={{
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                &gt; CERTIFICATIONS
              </h2>
              <div className="space-y-2">
                {certificationItems.map((cert: any, index: number) => (
                  <div key={cert.id || index}>
                    <h3 className="text-xs font-bold">
                      {cert.name || cert.title}
                    </h3>
                    <p className="text-xs" style={{ color: primaryColor }}>
                      {cert.issuer}
                    </p>
                    <div className="text-xs text-gray-600 font-mono">
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
        </div>

        {/* Languages & Interests Grid */}
        <div className="grid grid-cols-2 gap-6">
          {languageItems.length > 0 && (
            <section>
              <h2
                className="text-base font-bold mb-2 pb-1 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                &gt; LANGUAGES
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
                    <span style={{ color: primaryColor }}>
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {interests.length > 0 && (
            <section>
              <h2
                className="text-base font-bold mb-2 pb-1 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                &gt; INTERESTS
              </h2>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded font-mono"
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
