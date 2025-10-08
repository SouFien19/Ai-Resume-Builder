import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

// Professional Resume Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #0D9488',
    paddingBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0D9488',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0D9488',
    marginTop: 16,
    marginBottom: 8,
    borderBottom: '1pt solid #D1D5DB',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  company: {
    fontSize: 11,
    fontWeight: 600,
    color: '#111827',
  },
  position: {
    fontSize: 10,
    fontWeight: 400,
    color: '#4B5563',
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    color: '#6B7280',
  },
  description: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  skillChip: {
    backgroundColor: '#F0FDFA',
    border: '1pt solid #5EEAD4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillText: {
    fontSize: 8,
    color: '#0D9488',
    fontWeight: 600,
  },
  bullet: {
    fontSize: 8,
    color: '#0D9488',
    marginRight: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
});

interface ResumePDFProps {
  data: ResumeData;
}

export const ResumePDFDocument: React.FC<ResumePDFProps> = ({ data }) => {
  // Safe data extraction with fallbacks
  const content = data?.content || {};
  const personalInfo = content?.personalInfo || {};
  const workExperience = Array.isArray(content?.workExperience) ? content.workExperience : [];
  const education = Array.isArray(content?.education) ? content.education : [];
  const skills = Array.isArray(content?.skills) ? content.skills : [];
  const projects = Array.isArray(content?.projects) ? content.projects : [];
  const certifications = Array.isArray(content?.certifications) ? content.certifications : [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.fullName || personalInfo.name || 'Your Name'}
          </Text>
          {personalInfo.email && (
            <Text style={styles.contactInfo}>
              {personalInfo.email}
              {personalInfo.phone && ` • ${personalInfo.phone}`}
              {personalInfo.location && ` • ${personalInfo.location}`}
            </Text>
          )}
          {(personalInfo.linkedin || personalInfo.github) && (
            <Text style={styles.contactInfo}>
              {personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`}
              {personalInfo.github && ` • GitHub: ${personalInfo.github}`}
            </Text>
          )}
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.description}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
            {workExperience.map((job: any, index: number) => {
              const company = job?.company || job?.employer || 'Company';
              const position = job?.position || job?.role || 'Position';
              const startDate = job?.startDate || '';
              const endDate = job?.endDate || 'Present';
              
              return (
                <View key={index} style={{ marginBottom: 12 }}>
                  <View style={styles.jobHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.company}>{company}</Text>
                      <Text style={styles.position}>{position}</Text>
                    </View>
                    <Text style={styles.date}>
                      {startDate} - {endDate}
                    </Text>
                  </View>
                  {job?.description && (
                    <View style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{job.description}</Text>
                    </View>
                  )}
                  {Array.isArray(job?.achievements) && job.achievements.map((achievement: string, i: number) => 
                    achievement ? (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{achievement}</Text>
                      </View>
                    ) : null
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {education.map((edu: any, index: number) => {
              const institution = edu?.institution || edu?.school || 'Institution';
              const degree = edu?.degree || 'Degree';
              const field = edu?.field || '';
              const date = edu?.graduationDate || edu?.endDate || '';
              
              return (
                <View key={index} style={{ marginBottom: 8 }}>
                  <View style={styles.jobHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.company}>{institution}</Text>
                      <Text style={styles.position}>
                        {degree}{field && ` in ${field}`}
                      </Text>
                    </View>
                    {date && <Text style={styles.date}>{date}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <View style={styles.skillsContainer}>
              {skills.flatMap((skillGroup: any) => {
                if (!skillGroup) return [];
                if (typeof skillGroup === 'string') {
                  return [skillGroup];
                }
                if (skillGroup.items && Array.isArray(skillGroup.items)) {
                  return skillGroup.items.filter((item: any) => item && typeof item === 'string');
                }
                if (skillGroup.name) {
                  return [skillGroup.name];
                }
                return [];
              }).filter(Boolean).map((skill: string, index: number) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {projects.map((project: any, index: number) => {
              const name = project?.name || project?.title || 'Project';
              const description = project?.description || '';
              const tech = project?.technologies;
              const technologies = Array.isArray(tech) ? tech.filter(Boolean).join(', ') : (tech || '');
              
              return (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={styles.company}>{name}</Text>
                  {description && (
                    <Text style={styles.description}>{description}</Text>
                  )}
                  {technologies && (
                    <Text style={styles.description}>
                      Technologies: {technologies}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {certifications.map((cert: any, index: number) => {
              const name = cert?.name || cert?.title || 'Certification';
              const issuer = cert?.issuer || '';
              const date = cert?.date || '';
              
              return (
                <View key={index} style={{ marginBottom: 4 }}>
                  <Text style={styles.company}>{name}</Text>
                  {issuer && (
                    <Text style={styles.position}>
                      {issuer}{date && ` • ${date}`}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
};
