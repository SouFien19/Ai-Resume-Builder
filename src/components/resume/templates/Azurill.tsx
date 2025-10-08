"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import type { TemplateData } from "@/lib/types";

interface Props {
  data: ResumeData;
  style?: TemplateData;
}

/**
 * Azurill Professional Template - A4 PDF Optimized
 * Clean, ATS-friendly, two-column layout
 * Fixed dimensions for proper PDF export
 */
export default function AzurillTemplate({ data, style }: Props) {
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

  const fullName = personalInfo.fullName || personalInfo.name || "";
  const title = personalInfo.title || personalInfo.position || "";
  const email = personalInfo.email || "";
  const phone = personalInfo.phone || "";
  const location = personalInfo.location || personalInfo.address || "";
  const website = personalInfo.website || "";
  const linkedin = personalInfo.linkedin || "";
  const photoUrl = personalInfo.photoUrl || "";
  const summaryContent = personalInfo.summary || "";
  const profiles = personalInfo.profiles || [];

  const skillsData = skills.flatMap((skill: any) => {
    if (skill && typeof skill === "object" && "items" in skill) {
      return skill.items || [];
    }
    return skill;
  });

  const primaryColor = (style as any)?.colors?.primary || "#3B82F6";
  const textColor = (style as any)?.colors?.text || "#1F2937";

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "0",
        backgroundColor: "white",
        fontFamily: style?.body?.fontFamily || "Inter, system-ui, sans-serif",
        fontSize: "9pt",
        lineHeight: "1.4",
        color: textColor,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header Section - Fixed height */}
      <header
        style={{
          padding: "20mm 15mm 8mm 15mm",
          borderBottom: `3px solid ${primaryColor}`,
          pageBreakAfter: "avoid",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {photoUrl && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={photoUrl}
                alt={fullName}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${primaryColor}`,
                }}
              />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "28pt",
                fontWeight: "700",
                marginBottom: "6px",
                fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                color: primaryColor,
                lineHeight: "1.2",
              }}
            >
              {fullName}
            </h1>
            {title && (
              <p
                style={{
                  fontSize: "14pt",
                  fontWeight: "500",
                  marginBottom: "10px",
                  color: "#4B5563",
                }}
              >
                {title}
              </p>
            )}

            {/* Contact Info */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 16px",
                fontSize: "8.5pt",
                color: "#374151",
              }}
            >
              {email && <span>✉ {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {website && <span>🌐 {website}</span>}
              {linkedin && <span>💼 LinkedIn</span>}
            </div>

            {profiles.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  fontSize: "8.5pt",
                  marginTop: "8px",
                }}
              >
                {profiles.map((profile: any) => (
                  <a
                    key={profile.id}
                    href={profile.url?.href}
                    style={{
                      color: primaryColor,
                      textDecoration: "none",
                    }}
                  >
                    {profile.network}: {profile.username}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Two-Column Layout */}
      <div
        style={{
          display: "flex",
          gap: "15mm",
          padding: "8mm 15mm 15mm 15mm",
          minHeight: "230mm",
        }}
      >
        {/* Main Column (Left - 65%) */}
        <div style={{ flex: "0 0 120mm", maxWidth: "120mm" }}>
          {/* Summary Section */}
          {summaryContent && (
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "12pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Professional Summary
              </h2>
              <div
                style={{
                  fontSize: "9pt",
                  lineHeight: "1.5",
                  textAlign: "justify",
                }}
                dangerouslySetInnerHTML={{ __html: summaryContent }}
              />
            </section>
          )}

          {/* Experience Section */}
          {workExperience.length > 0 && (
            <section style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "12pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                  pageBreakAfter: "avoid",
                }}
              >
                Work Experience
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {workExperience.map((exp: any, index: number) => (
                  <div
                    key={exp.id || index}
                    style={{
                      position: "relative",
                      paddingLeft: "12px",
                      borderLeft: "2px solid #E5E7EB",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div style={{ marginBottom: "6px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: "10pt",
                              fontWeight: "700",
                              color: textColor,
                              marginBottom: "2px",
                            }}
                          >
                            {exp.position || exp.role || exp.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "9pt",
                              fontWeight: "600",
                              color: primaryColor,
                              marginBottom: "2px",
                            }}
                          >
                            {exp.company}
                          </p>
                        </div>
                        {(exp.startDate || exp.endDate || exp.date) && (
                          <div
                            style={{
                              fontSize: "8pt",
                              color: "#6B7280",
                              textAlign: "right",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {exp.startDate || exp.endDate ? (
                              <span>
                                {exp.startDate || ""}
                                {exp.startDate && exp.endDate ? " - " : ""}
                                {exp.endDate || (exp.startDate ? "Present" : "")}
                              </span>
                            ) : exp.date ? (
                              <span>{exp.date}</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                      {exp.location && (
                        <div style={{ fontSize: "8pt", color: "#6B7280", marginTop: "2px" }}>
                          {exp.location}
                        </div>
                      )}
                    </div>
                    {(exp.description || exp.summary) && (
                      <div
                        style={{
                          fontSize: "8.5pt",
                          lineHeight: "1.5",
                          color: "#374151",
                          marginBottom: "6px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {exp.description || exp.summary}
                      </div>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul
                        style={{
                          listStyleType: "disc",
                          paddingLeft: "18px",
                          margin: 0,
                          fontSize: "8.5pt",
                          lineHeight: "1.5",
                          color: "#374151",
                        }}
                      >
                        {exp.achievements.map((achievement: string, i: number) => (
                          <li key={i} style={{ marginBottom: "3px" }}>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul
                        style={{
                          listStyleType: "disc",
                          paddingLeft: "18px",
                          margin: 0,
                          fontSize: "8.5pt",
                          lineHeight: "1.5",
                          color: "#374151",
                        }}
                      >
                        {exp.highlights.map((highlight: string, i: number) => (
                          <li key={i} style={{ marginBottom: "3px" }}>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <section style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "12pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                  pageBreakAfter: "avoid",
                }}
              >
                Projects
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {projects.map((project: any, index: number) => (
                  <div
                    key={project.id || index}
                    style={{
                      position: "relative",
                      paddingLeft: "12px",
                      borderLeft: "2px solid #E5E7EB",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "10pt",
                        fontWeight: "700",
                        color: textColor,
                        marginBottom: "4px",
                      }}
                    >
                      {project.name || project.title}
                    </h3>
                    {project.description && (
                      <p
                        style={{
                          fontSize: "8.5pt",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        {project.technologies
                          .filter((t: string) => t.trim())
                          .map((tech: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "7.5pt",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "#F3F4F6",
                                color: "#374151",
                                border: "1px solid #E5E7EB",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    )}
                    {(project.github || project.url?.href) && (
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "8pt",
                        }}
                      >
                        {project.github && (
                          <a
                            href={
                              project.github.startsWith("http")
                                ? project.github
                                : `https://${project.github}`
                            }
                            style={{
                              color: primaryColor,
                              textDecoration: "none",
                            }}
                          >
                            GitHub
                          </a>
                        )}
                        {project.url?.href && (
                          <a
                            href={project.url.href}
                            style={{
                              color: primaryColor,
                              textDecoration: "none",
                            }}
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column (Right - 35%) */}
        <div
          style={{
            flex: "0 0 60mm",
            maxWidth: "60mm",
            paddingLeft: "12px",
            borderLeft: "2px solid #E5E7EB",
          }}
        >
          {/* Education Section */}
          {education.length > 0 && (
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "11pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Education
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {education.map((edu: any, index: number) => (
                  <div key={edu.id || index}>
                    <h3
                      style={{
                        fontSize: "9pt",
                        fontWeight: "700",
                        color: textColor,
                        marginBottom: "2px",
                      }}
                    >
                      {edu.degree || edu.studyType}
                    </h3>
                    <p
                      style={{
                        fontSize: "8.5pt",
                        fontWeight: "600",
                        color: primaryColor,
                        marginBottom: "2px",
                      }}
                    >
                      {edu.institution || edu.school}
                    </p>
                    {(edu.field || edu.area) && (
                      <p style={{ fontSize: "8pt", color: "#6B7280", marginBottom: "2px" }}>
                        {edu.field || edu.area}
                      </p>
                    )}
                    <div style={{ fontSize: "8pt", color: "#6B7280" }}>
                      {edu.graduationDate && <div>{edu.graduationDate || edu.date}</div>}
                      {(edu.gpa || edu.score) && (
                        <div style={{ fontWeight: "500" }}>
                          GPA: {edu.gpa || edu.score}
                        </div>
                      )}
                    </div>
                    {edu.description && (
                      <p
                        style={{
                          fontSize: "8pt",
                          color: "#6B7280",
                          marginTop: "4px",
                          whiteSpace: "pre-wrap",
                        }}
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
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "11pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Skills
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skillsData.map((skill: any, index: number) => {
                  const skillName = skill.name || skill;
                  return (
                    <span
                      key={index}
                      style={{
                        padding: "4px 10px",
                        fontSize: "8pt",
                        fontWeight: "500",
                        borderRadius: "12px",
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                        backgroundColor: `${primaryColor}15`,
                      }}
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "11pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Certifications
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {certifications.map((cert: any, index: number) => (
                  <div key={cert.id || index}>
                    <h3
                      style={{
                        fontSize: "9pt",
                        fontWeight: "700",
                        color: textColor,
                        marginBottom: "2px",
                      }}
                    >
                      {cert.name || cert.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "8.5pt",
                        fontWeight: "600",
                        color: primaryColor,
                        marginBottom: "2px",
                      }}
                    >
                      {cert.issuer}
                    </p>
                    {cert.credential && (
                      <p style={{ fontSize: "8pt", color: "#6B7280" }}>
                        ID: {cert.credential}
                      </p>
                    )}
                    {cert.date && (
                      <p style={{ fontSize: "8pt", color: "#6B7280" }}>{cert.date}</p>
                    )}
                    {cert.description && (
                      <p
                        style={{
                          fontSize: "8pt",
                          color: "#6B7280",
                          marginTop: "4px",
                          whiteSpace: "pre-wrap",
                        }}
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
          {languages.length > 0 && (
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "11pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Languages
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {languages.map((lang: any, index: number) => (
                  <div
                    key={lang.id || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "9pt", fontWeight: "500" }}>
                      {lang.name || lang.language}
                    </span>
                    <span style={{ fontSize: "8pt", color: "#6B7280" }}>
                      {lang.fluency || lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests Section */}
          {interests.length > 0 && (
            <section style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
              <h2
                style={{
                  fontSize: "11pt",
                  fontWeight: "700",
                  marginBottom: "10px",
                  paddingBottom: "4px",
                  fontFamily: style?.headings?.fontFamily || "Inter, sans-serif",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                Interests
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {interests.map((interest: any, index: number) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "8pt",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#F3F4F6",
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