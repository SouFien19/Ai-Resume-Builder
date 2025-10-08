import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PersonalInfoData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

type PersonalInfoFormProps = PersonalInfoData & {
  updateFields: (fields: Partial<PersonalInfoData>) => void;
};

export function PersonalInfoForm({
  fullName,
  email,
  phoneNumber,
  address,
  updateFields,
}: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => updateFields({ fullName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => updateFields({ email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => updateFields({ phoneNumber: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => updateFields({ address: e.target.value })}
        />
      </div>
    </div>
  );
}
