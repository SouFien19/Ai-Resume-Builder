"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  data: string[];
  onChange: (field: string, value: unknown) => void;
}

export default function Interests({ data = [], onChange }: Props) {
  const updateItem = (index: number, value: string) => {
    const next = [...(data || [])];
    next[index] = value;
    onChange("__replace__", next);
  };

  const addItem = () => {
    const next = [...(data || []), ""];
    onChange("__replace__", next);
  };

  const removeItem = (index: number) => {
    const next = [...(data || [])];
    next.splice(index, 1);
    onChange("__replace__", next);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-800/50 border-neutral-700/50">
        <CardContent className="pt-4 space-y-3">
          <label className="text-sm font-medium text-neutral-300">Your Interests</label>
          <p className="text-xs text-neutral-400 mb-4">Add a few interests to show your personality. Keep them professional and concise.</p>
          <div className="flex flex-wrap gap-2">
            {(data || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-700 rounded-md px-3 py-1">
                <Input 
                  placeholder="e.g., Open Source" 
                  value={item} 
                  onChange={(e) => updateItem(i, e.target.value)} 
                  className="bg-transparent border-none focus:ring-0 h-auto p-0 text-white"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-6 w-6 text-neutral-500 hover:text-white">
                  &times;
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={addItem} className="bg-rose-600/20 border border-rose-600/30 text-rose-400 hover:bg-rose-600/30 mt-4">+ Add Interest</Button>
        </CardContent>
      </Card>
    </div>
  );
}
