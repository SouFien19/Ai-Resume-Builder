"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Leafish Healthcare Professional Template
 * Clean medical design with certifications prominent
 * Teal theme with professional healthcare aesthetic
 */
export default function LeafishTemplate({ data, style }: Props) {
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

  const primaryColor = "#0D9488"; // Teal-600 - healthcare professional
  const secondaryColor = "#14B8A6"; // Teal-500
  const textColor = "#1F2937";

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "10pt",
        lineHeight: "1.5",
        color: textColor,
      }}
    >
      {/* Header with Teal Accent */}
      <header className="relative" style={{ backgroundColor: "#F0FDFA" }}>
        <div className="p-8 pb-6">
          <div className="flex gap-6 items-start">
            {photoUrl && (
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-28 rounded-full overflow-hidden border-4"
                  style={{ borderColor: primaryColor }}
                >
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
                className="text-4xl font-bold mb-2"
                style={{ color: primaryColor, letterSpacing: "-0.5px" }}
              >
                {fullName}
              </h1>
              {title && (
                <p
                  className="text-xl font-medium mb-3"
                  style={{ color: "#047857" }}
                >
                  {title}
                </p>
              )}

              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 mt-3">
                {email && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>{location}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="truncate">{website}</span>
                  </div>
                )}
              </div>

              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                  {profiles.map((profile: any) => (
                    <a
                      key={profile.id}
                      href={profile.url?.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: primaryColor }}
                    >
                      <strong>{profile.network}:</strong> {profile.username}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-2" style={{ backgroundColor: primaryColor }} />
      </header>

      {/* Two-Column Layout */}
      <div className="flex">
        {/* Main Content (Left - 65%) */}
        <div className="flex-1 p-8 pr-6">
          {/* Professional Summary */}
          {summaryContent && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-lg font-bold mb-3 pb-2 uppercase tracking-wide flex items-center gap-2"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {"Professional Summary"}
              </h2>
              <div
                className="text-sm leading-relaxed"
                style={{ textAlign: "justify" }}
                dangerouslySetInnerHTML={{ __html: summaryContent }}
              />
            </section>
          )}

          {/* Clinical Experience */}
          {experienceItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-lg font-bold mb-3 pb-2 uppercase tracking-wide flex items-center gap-2"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                {"Clinical Experience"}
              </h2>
              <div className="space-y-4">
                {experienceItems.map((exp: any, index: number) => (
                  <div
                    key={exp.id || index}
                    className="border-l-4 pl-4 py-2"
                    style={{ borderColor: "#99F6E4" }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="text-base font-bold"
                          style={{ color: textColor }}
                        >
                          {exp.position || exp.title}
                        </h3>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: primaryColor }}
                        >
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-right">
                        {exp.location && (
                          <p className="text-xs text-gray-600">
                            {exp.location}
                          </p>
                        )}
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-xs font-medium text-gray-700">
                            {exp.startDate}{" "}
                            {exp.startDate && exp.endDate && "-"} {exp.endDate}
                          </p>
                        )}
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

          {/* Projects / Research */}
          {projectItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-lg font-bold mb-3 pb-2 uppercase tracking-wide flex items-center gap-2"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {"Research & Projects"}
              </h2>
              <div className="space-y-3">
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
                        className="text-sm mb-1"
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

        {/* Sidebar (Right - 35%) */}
        <div
          className="w-80 p-8 pl-6"
          style={{
            backgroundColor: "#F0FDFA",
            borderLeft: `2px solid ${primaryColor}`,
          }}
        >
          {/* Licenses & Certifications (Prominent) */}
          {certificationItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-base font-bold mb-3 pb-2 uppercase tracking-wide"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {"Licenses & Certifications"}
                </div>
              </h2>
              <div className="space-y-3">
                {certificationItems.map((cert: any, index: number) => (
                  <div
                    key={cert.id || index}
                    className="p-3 rounded-lg border-l-4"
                    style={{
                      backgroundColor: "white",
                      borderColor: primaryColor,
                    }}
                  >
                    <h3
                      className="text-sm font-bold"
                      style={{ color: textColor }}
                    >
                      {cert.name || cert.title}
                    </h3>
                    <p
                      className="text-xs font-medium mt-1"
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

          {/* Education */}
          {educationItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-base font-bold mb-3 pb-2 uppercase tracking-wide"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {"Education"}
                </div>
              </h2>
              <div className="space-y-3">
                {educationItems.map((edu: any, index: number) => (
                  <div
                    key={edu.id || index}
                    className="bg-white p-3 rounded-lg"
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
                      className="text-xs font-medium mt-1"
                      style={{ color: primaryColor }}
                    >
                      {edu.institution}
                    </p>
                    <div className="text-xs text-gray-600 mt-1">
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

          {/* Clinical Skills */}
          {skillsData.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-base font-bold mb-3 pb-2 uppercase tracking-wide"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clinical Skills
                </div>
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillsData.map((skill: any, index: number) => {
                  const skillName = skill.name || skill;
                  return (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: "white",
                        color: primaryColor,
                        border: `1px solid ${primaryColor}`,
                      }}
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Languages */}
          {languageItems.length > 0 && (
            <section className="mb-6 resume-section page-break-inside-avoid">
              <h2
                className="text-base font-bold mb-3 pb-2 uppercase tracking-wide"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {languageItems.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded"
                  >
                    <span className="text-sm font-medium">
                      {lang.name || lang.language}
                    </span>
                    <span className="text-xs" style={{ color: primaryColor }}>
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <section>
              <h2
                className="text-base font-bold mb-3 pb-2 uppercase tracking-wide"
                style={{
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Professional Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: "white", color: textColor }}
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
