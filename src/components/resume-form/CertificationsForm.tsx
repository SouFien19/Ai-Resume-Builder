'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Certification = {
  name: string;
  issuer: string;
  date: string;
};

type CertificationsFormProps = {
  certifications: Certification[];
  updateFields: (fields: { certifications: Certification[] }) => void;
};

export function CertificationsForm({ certifications, updateFields }: CertificationsFormProps) {
  const handleCertificationChange = (index: number, field: keyof Certification, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    updateFields({ certifications: newCertifications });
  };

  const addCertification = () => {
    updateFields({ certifications: [...certifications, { name: '', issuer: '', date: '' }] });
  };

  const removeCertification = (index: number) => {
    const newCertifications = certifications.filter((_, i) => i !== index);
    updateFields({ certifications: newCertifications });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Certifications</h2>
      {certifications.map((cert, index) => (
        <div key={index} className="p-4 border rounded-md space-y-2 relative">
           <div className="space-y-1">
             <Label htmlFor={`cert-name-${index}`}>Certification Name</Label>
             <Input
              id={`cert-name-${index}`}
              type="text"
              value={cert.name}
              onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
              placeholder="e.g., Certified Professional"
            />
           </div>
           <div className="space-y-1">
             <Label htmlFor={`cert-issuer-${index}`}>Issuer</Label>
             <Input
              id={`cert-issuer-${index}`}
              type="text"
              value={cert.issuer}
              onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
              placeholder="e.g., Google"
            />
           </div>
           <div className="space-y-1">
             <Label htmlFor={`cert-date-${index}`}>Date</Label>
             <Input
              id={`cert-date-${index}`}
              type="text"
              value={cert.date}
              onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
              placeholder="e.g., 2023"
            />
           </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeCertification(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addCertification}>
        Add Certification
      </Button>
    </div>
  );
}
