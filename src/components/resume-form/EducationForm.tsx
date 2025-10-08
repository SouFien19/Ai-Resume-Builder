import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EducationData = {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
};

type EducationFormProps = {
  education: EducationData[];
  updateFields: (fields: { education: EducationData[] }) => void;
};

export function EducationForm({ education, updateFields }: EducationFormProps) {
    const handleEducationChange = (index: number, field: keyof EducationData, value: string) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateFields({ education: newEducation });
  };

  const addEducation = () => {
    updateFields({
      education: [
        ...education,
        { institution: "", degree: "", startDate: "", endDate: "" },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4">
          <h3 className="font-semibold">Education #{index + 1}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Institution</Label>
              <Input
                type="text"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
              />
            </div>
            <div>
              <Label>Degree</Label>
              <Input
                type="text"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={edu.startDate}
                onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={edu.endDate}
                onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="text-sm text-blue-600">
        + Add Another Education
      </button>
    </div>
  );
}
