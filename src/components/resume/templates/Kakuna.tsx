"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

export default function KakunaTemplate({ data, style }: Props) {
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

  const primaryColor = (style as any)?.colors?.primary || "#92400E"; // Brown
  const textColor = (style as any)?.colors?.text || "#1F2937";

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "'Times New Roman', 'Georgia', serif",
        fontSize: "10.5pt",
        lineHeight: "1.6",
        color: textColor,
      }}
    >
      {/* Academic Header */}
      <header className="text-center px-10 pt-8 pb-6 border-b-2 border-gray-400">
        {photoUrl && (
          <div className="flex justify-center mb-3">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-28 h-28 rounded-full object-cover"
              style={{ border: `3px solid ${primaryColor}` }}
            />
          </div>
        )}
        <h1
          className="text-4xl font-bold mb-2"
          style={{
            fontFamily: "'Times New Roman', serif",
            color: textColor,
          }}
        >
          {fullName}
        </h1>
        {title && (
          <p
            className="text-lg mb-3"
            style={{ color: primaryColor, fontStyle: "italic" }}
          >
            {title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-700">
          {email && <span>{email}</span>}
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
          {website && <span>• {website}</span>}
        </div>
        {profiles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-3 text-sm mt-2">
            {profiles.map((profile: any) => (
              <span key={profile.id} style={{ color: primaryColor }}>
                {profile.network}: {profile.username}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Academic Single Column */}
      <div className="px-10 py-6">
        {/* Education (Prominent) */}
        {educationItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-2xl font-bold mb-4 pb-2 border-b-2 text-center"
              style={{
                fontFamily: "'Times New Roman', serif",
                color: primaryColor,
                borderColor: primaryColor,
              }}
            >
              EDUCATION
            </h2>
            <div className="space-y-4">
              {educationItems.map((edu: any, index: number) => (
                <div key={edu.id || index} className="text-center">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: textColor }}
                  >
                    {edu.degree}
                    {edu.field && <span> in {edu.field}</span>}
                  </h3>
                  <p
                    className="text-base font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {edu.institution}
                  </p>
                  <div className="text-sm text-gray-600">
                    {edu.graduationDate && <span>{edu.graduationDate}</span>}
                    {edu.gpa && <span> • GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p
                      className="text-sm mt-2"
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

        {/* Research/Summary */}
        {summaryContent && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-xl font-bold mb-3 pb-2 border-b"
              style={{
                fontFamily: "'Times New Roman', serif",
                color: primaryColor,
                borderColor: `${primaryColor}60`,
              }}
            >
              RESEARCH INTERESTS
            </h2>
            <div
              className="text-sm leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: summaryContent }}
            />
          </section>
        )}

        {/* Publications/Projects */}
        {projectItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-xl font-bold mb-4 pb-2 border-b"
              style={{
                fontFamily: "'Times New Roman', serif",
                color: primaryColor,
                borderColor: `${primaryColor}60`,
              }}
            >
              PUBLICATIONS & RESEARCH
            </h2>
            <div className="space-y-3">
              {projectItems.map((project: any, index: number) => (
                <div key={project.id || index} className="mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold">
                      {project.name || project.title}
                    </span>
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
                    <p className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
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

        {/* Experience */}
        {experienceItems.length > 0 && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <h2
              className="text-xl font-bold mb-4 pb-2 border-b"
              style={{
                fontFamily: "'Times New Roman', serif",
                color: primaryColor,
                borderColor: `${primaryColor}60`,
              }}
            >
              ACADEMIC & PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4">
              {experienceItems.map((exp: any, index: number) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold">
                      {exp.position || exp.title}
                    </h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className="text-sm text-gray-600">
                        {exp.startDate} {exp.startDate && exp.endDate && "-"}{" "}
                        {exp.endDate}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {exp.company}
                    {exp.location && (
                      <span className="font-normal text-gray-600">
                        {" "}
                        • {exp.location}
                      </span>
                    )}
                  </p>
                  {exp.description && (
                    <p
                      className="text-sm leading-relaxed mt-2 mb-2"
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

        {/* Skills & Certifications Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {skillsData.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 pb-2 border-b"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                SKILLS & COMPETENCIES
              </h2>
              <div className="space-y-1">
                {skillsData.map((skill: any, index: number) => {
                  const skillName = skill.name || skill;
                  return (
                    <div key={index} className="text-sm">
                      • {skillName}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {certificationItems.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 pb-2 border-b"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                CERTIFICATIONS
              </h2>
              <div className="space-y-2">
                {certificationItems.map((cert: any, index: number) => (
                  <div key={cert.id || index} className="text-sm">
                    <div className="font-bold">{cert.name || cert.title}</div>
                    <div style={{ color: primaryColor }}>{cert.issuer}</div>
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
        </div>

        {/* Languages & Interests */}
        <div className="grid grid-cols-2 gap-6">
          {languageItems.length > 0 && (
            <section>
              <h2
                className="text-base font-bold mb-2 pb-1 border-b"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                LANGUAGES
              </h2>
              <div className="space-y-1 text-sm">
                {languageItems.map((lang: any, index: number) => (
                  <div key={lang.id || index}>
                    {lang.name || lang.language}: {lang.fluency || lang.level}
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
                  fontFamily: "'Times New Roman', serif",
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                INTERESTS
              </h2>
              <div className="text-sm">
                {interests.map((interest: any, index: number) => (
                  <span key={index}>
                    {interest.name || interest}
                    {index < interests.length - 1 && ", "}
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
