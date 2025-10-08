"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Nosepass Consultant Strategy Template
 * Modern business consultant with metrics and KPI boxes
 * Red theme with achievement-focused design
 */
export default function NosepassTemplate({ data, style }: Props) {
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

  const primaryColor = "#DC2626"; // Red-600 - bold consultant
  const accentColor = "#EF4444"; // Red-500
  const textColor = "#1F2937";

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "10pt",
        lineHeight: "1.5",
        color: textColor,
      }}
    >
      {/* Bold Header with Red Accent */}
      <header
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #991B1B 100%)`,
          color: "white",
        }}
      >
        <div className="p-8 pb-6">
          <div className="flex gap-6 items-center">
            {photoUrl && (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex-1">
              <h1
                className="text-5xl font-black mb-2"
                style={{ letterSpacing: "-1px" }}
              >
                {fullName}
              </h1>
              {title && (
                <p className="text-2xl font-bold mb-4 opacity-95">{title}</p>
              )}

              {/* Contact Bar */}
              <div className="flex flex-wrap gap-4 text-sm opacity-90">
                {email && (
                  <div className="flex items-center gap-1">
                    <span>✉</span> {email}
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-1">
                    <span>☎</span> {phone}
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1">
                    <span>📍</span> {location}
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-1">
                    <span>🌐</span> {website}
                  </div>
                )}
              </div>

              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs mt-2 opacity-90">
                  {profiles.map((profile: any) => (
                    <a
                      key={profile.id}
                      href={profile.url?.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium"
                    >
                      {profile.network}: {profile.username}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Executive Summary with Metrics Box */}
        {summaryContent && (
          <section className="mb-6 resume-section page-break-inside-avoid">
            <div
              className="p-6 rounded-lg border-l-4"
              style={{
                backgroundColor: "#FEF2F2",
                borderColor: primaryColor,
              }}
            >
              <h2
                className="text-xl font-black mb-3 uppercase tracking-wider"
                style={{ color: primaryColor }}
              >
                ■ Executive Summary
              </h2>
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summaryContent }}
              />
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content (2/3) */}
          <div className="col-span-2">
            {/* Consulting Experience with Metrics */}
            {experienceItems.length > 0 && (
              <section className="mb-6 resume-section page-break-inside-avoid">
                <h2
                  className="text-xl font-black mb-4 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `3px solid ${primaryColor}`,
                  }}
                >
                  ■ Consulting Experience
                </h2>
                <div className="space-y-5">
                  {experienceItems.map((exp: any, index: number) => (
                    <div key={exp.id || index} className="relative">
                      {/* Metrics Box */}
                      <div
                        className="mb-3 p-4 rounded-lg border-2"
                        style={{
                          backgroundColor: "#FEF2F2",
                          borderColor: accentColor,
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className="text-lg font-black"
                              style={{ color: textColor }}
                            >
                              {exp.position || exp.title}
                            </h3>
                            <p
                              className="text-base font-bold"
                              style={{ color: primaryColor }}
                            >
                              {exp.company}
                            </p>
                            {exp.location && (
                              <p className="text-xs text-gray-600 mt-1">
                                {exp.location}
                              </p>
                            )}
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <div
                              className="px-3 py-1 rounded font-bold text-xs"
                              style={{
                                backgroundColor: primaryColor,
                                color: "white",
                              }}
                            >
                              {exp.startDate}{" "}
                              {exp.startDate && exp.endDate && "-"}{" "}
                              {exp.endDate}
                            </div>
                          )}
                        </div>
                      </div>

                      {exp.description && (
                        <p
                          className="text-sm leading-relaxed pl-4 mb-2"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {exp.description}
                        </p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="text-sm list-disc list-inside space-y-1 pl-4">
                          {exp.achievements.map(
                            (achievement: string, i: number) => (
                              <li key={i}>{achievement}</li>
                            )
                          )}
                        </ul>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="text-sm list-disc list-inside space-y-1 pl-4">
                          {exp.highlights.map(
                            (highlight: string, i: number) => (
                              <li key={i}>{highlight}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Projects & Engagements */}
            {projectItems.length > 0 && (
              <section className="mb-6 resume-section page-break-inside-avoid">
                <h2
                  className="text-xl font-black mb-4 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `3px solid ${primaryColor}`,
                  }}
                >
                  ■ Key Engagements
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {projectItems.map((project: any, index: number) => (
                    <div
                      key={project.id || index}
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: "#FFFBEB",
                        borderColor: "#FCD34D",
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3
                          className="text-base font-black"
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
                            className="text-xs hover:opacity-70"
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
                          className="text-sm mb-2"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {project.description}
                        </p>
                      )}
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

          {/* Sidebar (1/3) */}
          <div className="col-span-1">
            {/* Core Competencies Box */}
            {skillsData.length > 0 && (
              <section className="mb-6 resume-section page-break-inside-avoid">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: primaryColor,
                    color: "white",
                  }}
                >
                  <h2 className="text-base font-black mb-3 uppercase tracking-wider">
                    ■ Core Competencies
                  </h2>
                  <div className="space-y-2">
                    {skillsData.map((skill: any, index: number) => {
                      const skillName = skill.name || skill;
                      return (
                        <div
                          key={index}
                          className="px-3 py-2 rounded text-xs font-bold"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderLeft: "3px solid white",
                          }}
                        >
                          {skillName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Education */}
            {educationItems.length > 0 && (
              <section className="mb-6 resume-section page-break-inside-avoid">
                <h2
                  className="text-base font-black mb-3 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                  }}
                >
                  ■ Education
                </h2>
                <div className="space-y-3">
                  {educationItems.map((edu: any, index: number) => (
                    <div
                      key={edu.id || index}
                      className="p-3 rounded border-l-4"
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderColor: primaryColor,
                      }}
                    >
                      <h3
                        className="text-sm font-bold"
                        style={{ color: textColor }}
                      >
                        {edu.degree}
                        {edu.field && (
                          <span className="font-normal"> in {edu.field}</span>
                        )}
                      </h3>
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: primaryColor }}
                      >
                        {edu.institution}
                      </p>
                      <div className="text-xs text-gray-700 mt-1">
                        {edu.graduationDate && <div>{edu.graduationDate}</div>}
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

            {/* Certifications Badge Style */}
            {certificationItems.length > 0 && (
              <section className="mb-6 resume-section page-break-inside-avoid">
                <h2
                  className="text-base font-black mb-3 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                  }}
                >
                  ■ Certifications
                </h2>
                <div className="space-y-2">
                  {certificationItems.map((cert: any, index: number) => (
                    <div
                      key={cert.id || index}
                      className="p-3 rounded-lg border-2"
                      style={{
                        backgroundColor: "white",
                        borderColor: accentColor,
                      }}
                    >
                      <h3
                        className="text-sm font-bold"
                        style={{ color: textColor }}
                      >
                        {cert.name || cert.title}
                      </h3>
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: primaryColor }}
                      >
                        {cert.issuer}
                      </p>
                      <div className="text-xs text-gray-600 mt-1">
                        {cert.date && <div>{cert.date}</div>}
                        {cert.credential && <div>ID: {cert.credential}</div>}
                      </div>
                      {cert.description && (
                        <p
                          className="text-xs mt-2 leading-relaxed"
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
              <section className="mb-6 resume-section page-break-inside-avoid">
                <h2
                  className="text-base font-black mb-3 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                  }}
                >
                  ■ Languages
                </h2>
                <div className="space-y-2">
                  {languageItems.map((lang: any, index: number) => (
                    <div
                      key={lang.id || index}
                      className="flex justify-between items-center p-2 rounded"
                      style={{ backgroundColor: "#FEF2F2" }}
                    >
                      <span className="text-sm font-bold">
                        {lang.name || lang.language}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: primaryColor,
                          color: "white",
                        }}
                      >
                        {lang.fluency || lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Interests */}
            {interests.length > 0 && (
              <section>
                <h2
                  className="text-base font-black mb-3 uppercase tracking-wider pb-2"
                  style={{
                    color: primaryColor,
                    borderBottom: `2px solid ${primaryColor}`,
                  }}
                >
                  ■ Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest: any, index: number) => (
                    <span
                      key={index}
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: "#FEE2E2",
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
    </div>
  );
}
