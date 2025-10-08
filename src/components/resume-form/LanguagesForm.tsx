'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LanguagesFormProps = {
  languages: string[];
  updateFields: (fields: { languages: string[] }) => void;
};

export function LanguagesForm({ languages, updateFields }: LanguagesFormProps) {
  const handleLanguageChange = (index: number, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = value;
    updateFields({ languages: newLanguages });
  };

  const addLanguage = () => {
    updateFields({ languages: [...languages, ''] });
  };

  const removeLanguage = (index: number) => {
    const newLanguages = languages.filter((_, i) => i !== index);
    updateFields({ languages: newLanguages });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Languages</h2>
      {languages.map((language, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={language}
            onChange={(e) => handleLanguageChange(index, e.target.value)}
            placeholder="e.g., English"
          />
          <Button type="button" variant="destructive" size="sm" onClick={() => removeLanguage(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addLanguage}>
        Add Language
      </Button>
    </div>
  );
}
