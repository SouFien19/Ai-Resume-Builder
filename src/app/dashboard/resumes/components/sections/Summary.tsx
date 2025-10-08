"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  data: { summary?: string };
  onChange: (field: string, value: unknown) => void;
}

export default function Summary({ data, onChange }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <label className="text-sm font-medium">Professional Summary</label>
        <Textarea
          placeholder="2-3 sentence summary highlighting your strengths and impact"
          value={data.summary || ""}
          onChange={(e) => onChange("summary", e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Keep it concise and targeted to the role. Mention years of experience, core stack, and key outcomes.
        </p>
      </CardContent>
    </Card>
  );
}
