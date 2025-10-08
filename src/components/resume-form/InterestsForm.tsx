'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type InterestsFormProps = {
  interests: string[];
  updateFields: (fields: { interests: string[] }) => void;
};

export function InterestsForm({ interests, updateFields }: InterestsFormProps) {
  const handleInterestChange = (index: number, value: string) => {
    const newInterests = [...interests];
    newInterests[index] = value;
    updateFields({ interests: newInterests });
  };

  const addInterest = () => {
    updateFields({ interests: [...interests, ''] });
  };

  const removeInterest = (index: number) => {
    const newInterests = interests.filter((_, i) => i !== index);
    updateFields({ interests: newInterests });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Interests</h2>
      {interests.map((interest, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={interest}
            onChange={(e) => handleInterestChange(index, e.target.value)}
            placeholder="e.g., Hiking"
          />
          <Button type="button" variant="destructive" size="sm" onClick={() => removeInterest(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addInterest}>
        Add Interest
      </Button>
    </div>
  );
}
