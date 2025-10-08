import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SkillsData = {
  skills: string[];
};

type SkillsFormProps = SkillsData & {
  updateFields: (fields: Partial<SkillsData>) => void;
};

export function SkillsForm({ skills, updateFields }: SkillsFormProps) {
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    updateFields({ skills: newSkills });
  };

  const addSkill = () => {
    updateFields({ skills: [...skills, ""] });
  };

  const removeSkill = (index: number) => {
    updateFields({ skills: skills.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Label>Skills</Label>
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={skill}
            onChange={(e) => handleSkillChange(index, e.target.value)}
          />
          <button type="button" onClick={() => removeSkill(index)} className="text-red-500">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addSkill} className="text-sm text-blue-600">
        + Add Skill
      </button>
    </div>
  );
}
