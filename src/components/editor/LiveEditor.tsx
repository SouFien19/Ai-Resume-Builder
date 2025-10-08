'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Template, TemplateData } from '@/lib/types';

type ResumeData = {
    personalInfo: {
        fullName: string;
        email: string;
        phoneNumber: string;
        address: string;
    };
    experiences: {
        jobTitle: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        institution: string;
        degree: string;
        startDate: string;
        endDate: string;
    description?: string;
    }[];
    skills: string[];
    languages: string[];
    certifications: {
        name: string;
        issuer: string;
        date: string;
    }[];
    interests: string[];
};

interface LiveEditorProps {
  template: Template;
  data: Partial<ResumeData>; 
}

const LiveEditor: React.FC<LiveEditorProps> = ({ template, data }) => {
  const [styles, setStyles] = useState<TemplateData>(template.data);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStyles(template.data);
  }, [template]);

  const { personalInfo, experiences, education, skills, languages, certifications, interests } = data;

  const pageStyle: React.CSSProperties = {
    ...(styles.page || {}),
    fontFamily: styles.body?.fontFamily || 'sans-serif',
    margin: Array.isArray(styles.page?.margin) ? styles.page.margin.join('px ') + 'px' : '20px',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div
          ref={resumeRef}
          className="bg-white shadow-lg p-8"
          style={pageStyle}
        >
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold" style={styles.headings || {}}>{personalInfo?.fullName || 'John Doe'}</h1>
            <p className="text-lg" style={styles.subheadings || {}}>{personalInfo?.email || 'john.doe@email.com'}</p>
            <p className="text-sm" style={styles.body || {}}>{personalInfo?.phoneNumber || '(555) 123-4567'} | {personalInfo?.address || '123 Main St'}</p>
          </header>

          {experiences && experiences.length > 0 && experiences[0].jobTitle && (
            <section>
              <h2 style={styles.headings || {}}>Professional Experience</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              {experiences.map((job, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-bold" style={styles.subheadings || {}}>{job.jobTitle}</h3>
                  <p className="italic" style={styles.body || {}}>{job.company} | {job.startDate} - {job.endDate}</p>
                  <p style={styles.body || {}}>{job.description}</p>
                </div>
              ))}
            </section>
          )}

          {education && education.length > 0 && education[0].institution && (
            <section className="mt-6">
              <h2 style={styles.headings || {}}>Education</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              {education.map((edu, index) => (
                <div key={index} className="mb-4">
                    <h3 className="font-bold" style={styles.subheadings || {}}>{edu.degree}</h3>
                    <p style={styles.body || {}}>{edu.institution} | {edu.startDate} - {edu.endDate}</p>
                    {edu.description && (
                      <p className="mt-1" style={styles.body || {}}>{edu.description}</p>
                    )}
                </div>
              ))}
            </section>
          )}

          {skills && skills.length > 0 && skills[0] && (
            <section className="mt-6">
              <h2 style={styles.headings || {}}>Skills</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              <ul className="list-disc list-inside" style={styles.body || {}}>
                  {skills.map((skill, i) => <li key={i}>{skill}</li>)}
              </ul>
            </section>
          )}

          {languages && languages.length > 0 && languages[0] && (
            <section className="mt-6">
              <h2 style={styles.headings || {}}>Languages</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              <p style={styles.body || {}}>{languages.join(', ')}</p>
            </section>
          )}

          {certifications && certifications.length > 0 && certifications[0].name && (
            <section className="mt-6">
              <h2 style={styles.headings || {}}>Certifications</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              {certifications.map((cert, index) => (
                <div key={index} className="mb-2">
                    <h3 className="font-bold" style={styles.subheadings || {}}>{cert.name}</h3>
                    <p style={styles.body || {}}>{cert.issuer} | {cert.date}</p>
                </div>
              ))}
            </section>
          )}

          {interests && interests.length > 0 && interests[0] && (
            <section className="mt-6">
              <h2 style={styles.headings || {}}>Interests</h2>
              <hr style={{ borderBottom: styles.headings?.borderBottom, margin: '8px 0' }} />
              <p style={styles.body || {}}>{interests.join(', ')}</p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default LiveEditor;
