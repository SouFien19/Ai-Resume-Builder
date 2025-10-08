import React from 'react';

export default function TestEditorPage() {
  const mockResumeData = {
    title: "Test Resume",
    content: {
      personalInfo: {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        summary: "Experienced software developer with a passion for creating innovative solutions."
      },
      workExperience: [
        {
          id: "1",
          company: "Tech Corp",
          position: "Senior Developer",
          role: "Senior Developer",
          startDate: "2020-01-01",
          endDate: "2023-12-31",
          description: "Led development of multiple web applications using React and Node.js."
        }
      ],
      education: [
        {
          id: "1",
          institution: "University of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science",
          graduationDate: "2019-05-01",
          gpa: "3.8"
        }
      ],
      skills: [
        {
          category: "Programming Languages",
          items: ["JavaScript", "TypeScript", "Python", "Java"]
        },
        {
          category: "Frameworks",
          items: ["React", "Next.js", "Express.js", "Django"]
        }
      ],
      projects: [
        {
          id: "1",
          name: "E-commerce Platform",
          description: "Built a full-stack e-commerce platform with React and Node.js",
          technologies: ["React", "Node.js", "MongoDB", "Stripe"]
        }
      ],
      certifications: [
        {
          id: "1",
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          date: "2023-06-01"
        }
      ]
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resume Editor Test</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Mock Resume Data:</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(mockResumeData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
