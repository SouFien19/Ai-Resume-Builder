"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SkillGroup {
  category?: string;
  items: string[];
}

interface Props {
  data: SkillGroup[];
  onChange: (field: string, value: unknown) => void;
}

export default function Skills({ data = [], onChange }: Props) {
  const updateGroup = (index: number, patch: Partial<SkillGroup>) => {
    const next = [...(data || [])];
    next[index] = { ...next[index], ...patch } as SkillGroup;
    onChange("__replace__", next);
  };

  const updateItem = (groupIndex: number, itemIndex: number, value: string) => {
    const next = [...(data || [])];
    const group = { ...(next[groupIndex] || { items: [] }) } as SkillGroup;
    const items = [...(group.items || [])];
    items[itemIndex] = value;
    group.items = items;
    next[groupIndex] = group;
    onChange("__replace__", next);
  };

  const addGroup = () => {
    const next = [...(data || []), { category: "", items: [""] }];
    onChange("__replace__", next);
  };

  const addItem = (groupIndex: number) => {
    const next = [...(data || [])];
    const group = { ...(next[groupIndex] || { items: [] }) } as SkillGroup;
    group.items = [...(group.items || []), ""];
    next[groupIndex] = group;
    onChange("__replace__", next);
  };

  const removeGroup = (index: number) => {
    const next = [...(data || [])];
    next.splice(index, 1);
    onChange("__replace__", next);
  };

  const removeItem = (groupIndex: number, itemIndex: number) => {
    const next = [...(data || [])];
    const group = { ...(next[groupIndex] || { items: [] }) } as SkillGroup;
    const items = [...(group.items || [])];
    items.splice(itemIndex, 1);
    group.items = items;
    next[groupIndex] = group;
    onChange("__replace__", next);
  };

  return (
    <div className="space-y-4">
      {(data || []).map((group, gi) => (
        <Card key={gi}>
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Category (e.g., Frontend)"
              value={group.category || ""}
              onChange={(e) => updateGroup(gi, { category: e.target.value })}
            />

            <div className="space-y-2">
              {(group.items || []).map((item, ii) => (
                <div key={ii} className="flex gap-2">
                  <Input
                    placeholder="Skill"
                    value={item}
                    onChange={(e) => updateItem(gi, ii, e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => removeItem(gi, ii)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addItem(gi)}>
                Add Skill
              </Button>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => removeGroup(gi)}>
                Remove Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addGroup}>Add Skill Group</Button>
    </div>
  );
}
