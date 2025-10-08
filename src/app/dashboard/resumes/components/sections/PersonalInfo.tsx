"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github 
} from 'lucide-react';

interface PersonalInfoData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

interface PersonalInfoProps {
  data: PersonalInfoData;
  onChange: (field: string, value: string) => void;
}

const FormField = ({ 
  label, 
  field, 
  value, 
  onChange, 
  type = "text", 
  icon: Icon,
  placeholder,
  multiline = false 
}: {
  label: string;
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={field} className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Label>
    {multiline ? (
      <Textarea
        id={field}
        value={value || ''}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="resize-none h-24"
      />
    ) : (
      <Input
        id={field}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default function PersonalInfo({ data, onChange }: PersonalInfoProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              field="fullName"
              value={data.fullName || ''}
              onChange={onChange}
              icon={User}
              placeholder="John Doe"
            />
            <FormField
              label="Email Address"
              field="email"
              value={data.email || ''}
              onChange={onChange}
              type="email"
              icon={Mail}
              placeholder="john.doe@example.com"
            />
            <FormField
              label="Phone Number"
              field="phone"
              value={data.phone || ''}
              onChange={onChange}
              type="tel"
              icon={Phone}
              placeholder="+1 (555) 123-4567"
            />
            <FormField
              label="Location"
              field="location"
              value={data.location || ''}
              onChange={onChange}
              icon={MapPin}
              placeholder="New York, NY"
            />
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Online Presence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Website/Portfolio"
              field="website"
              value={data.website || ''}
              onChange={onChange}
              type="url"
              icon={Globe}
              placeholder="https://johndoe.com"
            />
            <FormField
              label="LinkedIn Profile"
              field="linkedin"
              value={data.linkedin || ''}
              onChange={onChange}
              type="url"
              icon={Linkedin}
              placeholder="https://linkedin.com/in/johndoe"
            />
            <FormField
              label="GitHub Profile"
              field="github"
              value={data.github || ''}
              onChange={onChange}
              type="url"
              icon={Github}
              placeholder="https://github.com/johndoe"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Professional Summary</h3>
          <FormField
            label="Summary"
            field="summary"
            value={data.summary || ''}
            onChange={onChange}
            placeholder="Write a brief professional summary highlighting your key strengths, experience, and career objectives..."
            multiline
          />
          <p className="text-xs text-gray-500 mt-2">
            Keep it concise (2-3 sentences) and focus on your most relevant qualifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
