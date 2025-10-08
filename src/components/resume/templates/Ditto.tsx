"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Ditto Professional Template - Student Friendly Design
 * Simple single-column with boxed sections, entry-level friendly
 * Clean and approachable
 */
export default function DittoTemplate({ data, style }: Props) {
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

  const primaryColor = (style as any)?.colors?.primary || "#10B981"; // Green
  const textColor = (style as any)?.colors?.text || "#1F2937";

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
        backgroundColor: "#F9FAFB",
      }}
    >
      {/* Simple Header with Rounded Box */}
      <header
        className="mx-8 mt-8 p-6 rounded-lg shadow-sm"
        style={{
          backgroundColor: "white",
          border: `2px solid ${primaryColor}`,
        }}
      >
        <div className="flex gap-4 items-center">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: `3px solid ${primaryColor}` }}
            />
          )}
          <div className="flex-1">
            <h1
              className="text-3xl font-bold mb-1"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              {fullName}
            </h1>
            {title && (
              <p className="text-lg font-medium text-gray-700 mb-2">{title}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {email && <span>✉ {email}</span>}
              {phone && <span>📱 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {website && <span>🌐 {website}</span>}
            </div>
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mt-2">
                {profiles.map((profile: any) => (
                  <a
                    key={profile.id}
                    href={profile.url?.href}
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {profile.network}: {profile.username}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Single Column with Boxed Sections */}
      <div className="px-8 py-6 space-y-6">
        {/* Summary Box */}
        {summaryContent && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-3"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              📝 {"About Me"}
            </h2>
            <div
              className="text-sm leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: summaryContent }}
            />
          </section>
        )}

        {/* Education Box */}
        {educationItems.length > 0 && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              🎓 {"Education"}
            </h2>
            <div className="space-y-3">
              {educationItems.map((edu: any, index: number) => (
                <div key={edu.id || index}>
                  <h3 className="text-base font-bold text-gray-900">
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
                    {edu.graduationDate && <span>{edu.graduationDate}</span>}
                    {edu.gpa && <span> • GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p
                      className="text-sm mt-1 leading-relaxed"
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

        {/* Experience Box */}
        {experienceItems.length > 0 && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              💼 {"Experience"}
            </h2>
            <div className="space-y-4">
              {experienceItems.map((exp: any, index: number) => (
                <div key={exp.id || index}>
                  <h3 className="text-base font-bold text-gray-900">
                    {exp.position || exp.title}
                  </h3>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {exp.company}
                  </p>
                  <div className="text-xs text-gray-600 mt-1 mb-2">
                    {(exp.startDate || exp.endDate) && (
                      <span>
                        {exp.startDate} {exp.startDate && exp.endDate && "-"}{" "}
                        {exp.endDate}
                      </span>
                    )}
                    {(exp.startDate || exp.endDate) && exp.location && (
                      <span> • </span>
                    )}
                    {exp.location && <span>{exp.location}</span>}
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

        {/* Projects Box */}
        {projectItems.length > 0 && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              🚀 {"Projects"}
            </h2>
            <div className="space-y-3">
              {projectItems.map((project: any, index: number) => (
                <div key={project.id || index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-gray-900">
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
                  {project.technologies && project.technologies.length > 0 && (
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

        {/* Skills Box */}
        {skillsData.length > 0 && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              ⭐ Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((skill: any, index: number) => {
                const skillName = skill.name || skill;
                return (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    {skillName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Certifications */}
          {certificationItems.length > 0 && (
            <section
              className="p-6 rounded-lg shadow-sm"
              style={{
                backgroundColor: "white",
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <h2
                className="text-lg font-bold mb-3"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                }}
              >
                🏆 {"Certifications"}
              </h2>
              <div className="space-y-2">
                {certificationItems.map((cert: any, index: number) => (
                  <div key={cert.id || index}>
                    <h3 className="text-sm font-bold text-gray-900">
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

          {/* Languages */}
          {languageItems.length > 0 && (
            <section
              className="p-6 rounded-lg shadow-sm"
              style={{
                backgroundColor: "white",
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <h2
                className="text-lg font-bold mb-3"
                style={{
                  fontFamily:
                    style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                }}
              >
                🌍 {"Languages"}
              </h2>
              <div className="space-y-2">
                {languageItems.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    className="flex justify-between text-sm"
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
        </div>

        {/* Interests */}
        {interests.length > 0 && (
          <section
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${primaryColor}`,
            }}
          >
            <h2
              className="text-lg font-bold mb-3"
              style={{
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
              }}
            >
              ❤️ Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest: any, index: number) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
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
