'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ExperienceData = {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ExperienceFormProps = {
  experiences: ExperienceData[];
  updateFields: (fields: { experiences: ExperienceData[] }) => void;
};

export function ExperienceForm({ experiences, updateFields }: ExperienceFormProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleExperienceChange = (index: number, field: keyof ExperienceData, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    updateFields({ experiences: newExperiences });
  };

  const addExperience = () => {
    updateFields({
      experiences: [
        ...experiences,
        { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
      ],
    });
  };

  const removeExperience = (index: number) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    updateFields({ experiences: newExperiences });
  };

  const handleGenerateDescription = async (index: number) => {
    const jobTitle = experiences[index].jobTitle;
    if (!jobTitle) {
      toast.error("Please enter a job title first.");
      return;
    }

    setIsLoading(index);
    try {
      // AI functionality temporarily disabled
      toast.error("AI functionality is currently disabled");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating the description.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4 relative">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Experience #{index + 1}</h3>
            {experiences.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => handleExperienceChange(index, "jobTitle", e.target.value)}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                type="text"
                value={exp.company}
                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
              rows={5}
            />
            <Button 
              type="button" 
              onClick={() => handleGenerateDescription(index)} 
              className="mt-2"
              disabled={isLoading === index}
            >
              {isLoading === index ? 'Generating...' : '✨ Generate with AI'}
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addExperience} variant="outline">
        + Add Another Experience
      </Button>
    </div>
  );
}
