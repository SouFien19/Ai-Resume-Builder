"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Onyx Professional Template - Executive Classic Design
 * Serif fonts, horizontal sections, traditional business appearance
 * Inspired by classic resume designs
 */
export default function OnyxTemplate({ data, style }: Props) {
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

  const primaryColor = (style as any)?.colors?.primary || "#1F2937"; // Dark Gray
  const textColor = (style as any)?.colors?.text || "#1F2937"; // Gray-800

  return (
    <div
      className="w-full bg-white"
      style={{
        minHeight: "297mm",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "10.5pt",
        lineHeight: "1.6",
        color: textColor,
      }}
    >
      {/* Centered Traditional Header */}
      <header className="text-center px-8 pt-10 pb-6 border-b-2 border-gray-300">
        {/* Photo (centered if provided) */}
        {photoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-24 h-24 rounded object-cover"
              style={{ border: `3px solid ${primaryColor}` }}
            />
          </div>
        )}

        {/* Name */}
        <h1
          className="text-4xl font-bold mb-2"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: textColor,
            letterSpacing: "0.5px",
          }}
        >
          {fullName}
        </h1>

        {/* Title */}
        {title && (
          <p
            className="text-lg mb-4"
            style={{
              color: primaryColor,
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            {title}
          </p>
        )}

        {/* Contact Info - Horizontal */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          {email && <span>{email}</span>}
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
          {website && <span>• {website}</span>}
        </div>

        {/* Social Profiles */}
        {profiles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm mt-2">
            {profiles.map((profile: any) => (
              <a
                key={profile.id}
                href={profile.url?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: primaryColor }}
              >
                {profile.network}: {profile.username}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Single Column Full-Width Content with Horizontal Sections */}
      <div className="px-12 py-6">
        {/* Summary Section */}
        {summaryContent && (
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-3 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {"Professional Summary"}
            </h2>
            <div
              className="text-sm leading-relaxed text-center max-w-4xl mx-auto"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: summaryContent }}
            />
          </section>
        )}

        {/* Experience Section */}
        {experienceItems.length > 0 && (
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {"Professional Experience"}
            </h2>
            <div className="space-y-4">
              {experienceItems.map((exp: any, index: number) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3
                      className="text-base font-bold"
                      style={{ color: textColor }}
                    >
                      {exp.position || exp.title}
                    </h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        {exp.startDate} {exp.startDate && exp.endDate && "-"}{" "}
                        {exp.endDate}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {exp.company}
                    </p>
                    {exp.location && (
                      <span
                        className="text-xs italic"
                        style={{ color: "#6B7280" }}
                      >
                        {exp.location}
                      </span>
                    )}
                  </div>
                  {exp.description && (
                    <p
                      className="text-sm leading-relaxed mb-2"
                      style={{ color: textColor, whiteSpace: "pre-wrap" }}
                    >
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul
                      className="text-sm list-disc list-inside space-y-1"
                      style={{ color: textColor }}
                    >
                      {exp.achievements.map(
                        (achievement: string, i: number) => (
                          <li key={i}>{achievement}</li>
                        )
                      )}
                    </ul>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul
                      className="text-sm list-disc list-inside space-y-1"
                      style={{ color: textColor }}
                    >
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
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {"Education"}
            </h2>
            <div className="space-y-3">
              {educationItems.map((edu: any, index: number) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3
                      className="text-base font-bold"
                      style={{ color: textColor }}
                    >
                      {edu.degree}
                      {edu.field && (
                        <span className="font-normal"> in {edu.field}</span>
                      )}
                    </h3>
                    <div
                      className="text-xs text-right"
                      style={{ color: "#6B7280" }}
                    >
                      {edu.graduationDate && <div>{edu.graduationDate}</div>}
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: primaryColor }}>
                    {edu.institution}
                  </p>
                  {edu.description && (
                    <p
                      className="text-sm leading-relaxed mt-1"
                      style={{ color: textColor, whiteSpace: "pre-wrap" }}
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
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {skillsData.map((skill: any, index: number) => {
                const skillName = skill.name || skill;
                return (
                  <span
                    key={index}
                    className="px-4 py-1.5 text-sm font-medium"
                    style={{
                      borderBottom: `2px solid ${primaryColor}`,
                      color: textColor,
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
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {"Projects"}
            </h2>
            <div className="space-y-3">
              {projectItems.map((project: any, index: number) => (
                <div key={project.id || index}>
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
                        GitHub
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p
                      className="text-sm mb-2"
                      style={{ color: textColor, whiteSpace: "pre-wrap" }}
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

        {/* Certifications Section */}
        {certificationItems.length > 0 && (
          <section className="mb-6 pb-5 border-b border-gray-300">
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: primaryColor,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {"Certifications"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {certificationItems.map((cert: any, index: number) => (
                <div key={cert.id || index}>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: textColor }}
                  >
                    {cert.name || cert.title}
                  </h3>
                  <p className="text-xs" style={{ color: primaryColor }}>
                    {cert.issuer}
                  </p>
                  <div className="text-xs" style={{ color: "#6B7280" }}>
                    {cert.date && <div>{cert.date}</div>}
                    {cert.credential && <div>ID: {cert.credential}</div>}
                  </div>
                  {cert.description && (
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: textColor, whiteSpace: "pre-wrap" }}
                    >
                      {cert.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages & Interests Combined */}
        <div className="grid grid-cols-2 gap-8">
          {/* Languages Section */}
          {languageItems.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 text-center"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  color: primaryColor,
                  letterSpacing: "0.5px",
                }}
              >
                {"Languages"}
              </h2>
              <div className="space-y-2">
                {languageItems.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    className="text-sm flex justify-between"
                    style={{ color: textColor }}
                  >
                    <span className="font-medium">
                      {lang.name || lang.language}
                    </span>
                    <span style={{ color: "#6B7280" }}>
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests Section */}
          {interests.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 text-center"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  color: primaryColor,
                  letterSpacing: "0.5px",
                }}
              >
                Interests
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {interests.map((interest: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1"
                    style={{
                      backgroundColor: "#F3F4F6",
                      color: textColor,
                      fontStyle: "italic",
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
