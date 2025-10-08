'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TemplateData } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  styles: TemplateData;
  onStyleChange: (
    element: keyof TemplateData,
    property: string,
    value: string | number
  ) => void;
}

const fontFamilies = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
];

const fontWeights = [
  { name: 'Light', value: '300' },
  { name: 'Normal', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Semi Bold', value: '600' },
  { name: 'Bold', value: '700' },
];

const textTransforms = [
  { name: 'None', value: 'none' },
  { name: 'Uppercase', value: 'uppercase' },
  { name: 'Capitalize', value: 'capitalize' },
  { name: 'Lowercase', value: 'lowercase' },
];

const textAligns = [
  { name: 'Left', value: 'left' },
  { name: 'Center', value: 'center' },
  { name: 'Right', value: 'right' },
  { name: 'Justify', value: 'justify' },
];

const colorPresets = [
  { name: 'Professional Blue', value: '#2563eb' },
  { name: 'Corporate Gray', value: '#374151' },
  { name: 'Modern Purple', value: '#7c3aed' },
  { name: 'Classic Black', value: '#111827' },
  { name: 'Elegant Green', value: '#059669' },
];

const StyleEditor: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  element: keyof TemplateData;
  style: Partial<TemplateData[keyof TemplateData]>;
  onStyleChange: ToolbarProps['onStyleChange'];
  accent: string;
}> = ({ title, icon: Icon, element, style, onStyleChange, accent }) => (
  <AccordionItem value={element} className="border-none">
    <AccordionTrigger className="hover:no-underline">
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`p-2 rounded-lg bg-gradient-to-r ${accent} text-white`}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
        <div className="text-left">
          <span className="font-medium text-gray-900">{title}</span>
          <p className="text-xs text-gray-500 mt-0.5">Customize appearance and typography</p>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Typography Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Typography</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Font Family</Label>
              <Select
                value={style.fontFamily || ''}
                onValueChange={(value) => onStyleChange(element, 'fontFamily', value)}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value} className="text-sm">
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Font Size</Label>
              <Input
                type="number"
                min="8"
                max="72"
                value={style.fontSize || 16}
                onChange={(e) =>
                  onStyleChange(element, 'fontSize', parseInt(e.target.value))
                }
                className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Font Weight</Label>
              <Select
                value={String(('fontWeight' in style ? style.fontWeight : '400') || '400')}
                onValueChange={(value) => onStyleChange(element, 'fontWeight', value)}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value} className="text-sm">
                      <span style={{ fontWeight: weight.value }}>{weight.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Line Height</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={style.lineHeight || 1.5}
                onChange={(e) =>
                  onStyleChange(element, 'lineHeight', parseFloat(e.target.value))
                }
                className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </motion.div>
          </div>
        </div>

        {/* Color Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Colors</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.color || '#000000'}
                  onChange={(e) => onStyleChange(element, 'color', e.target.value)}
                  className="w-12 h-9 p-1 border-gray-200"
                />
                <Input
                  type="text"
                  value={style.color || '#000000'}
                  onChange={(e) => onStyleChange(element, 'color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-1 mt-2">
                {colorPresets.map((preset) => (
                  <motion.button
                    key={preset.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStyleChange(element, 'color', preset.value)}
                    className="w-6 h-6 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.background || '#ffffff'}
                  onChange={(e) => onStyleChange(element, 'background', e.target.value)}
                  className="w-12 h-9 p-1 border-gray-200"
                />
                <Input
                  type="text"
                  value={style.background || '#ffffff'}
                  onChange={(e) => onStyleChange(element, 'background', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Layout Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Layout className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Layout</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Text Align</Label>
              <Select
                value={('textAlign' in style ? style.textAlign : 'left') || 'left'}
                onValueChange={(value) => onStyleChange(element, 'textAlign', value)}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {textAligns.map((align) => (
                    <SelectItem key={align.value} value={align.value} className="text-sm">
                      {align.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Label className="text-xs font-medium text-gray-600 mb-2 block">Text Transform</Label>
              <Select
                value={('textTransform' in style ? style.textTransform : 'none') || 'none'}
                onValueChange={(value) => onStyleChange(element, 'textTransform', value)}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {textTransforms.map((transform) => (
                    <SelectItem key={transform.value} value={transform.value} className="text-sm">
                      {transform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AccordionContent>
  </AccordionItem>
);

const Toolbar: React.FC<ToolbarProps> = ({ styles, onStyleChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Style Editor</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Customize your resume appearance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </motion.div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              Live Preview
            </Badge>
            <Badge variant="outline" className="text-xs">
              Auto Save
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Accordion type="multiple" defaultValue={['headings']} className="space-y-2">
            <StyleEditor
              title="Headings"
              icon={Type}
              element="headings"
              style={styles.headings || {}}
              onStyleChange={onStyleChange}
              accent="from-blue-500 to-blue-600"
            />
            <StyleEditor
              title="Subheadings"
              icon={Type}
              element="subheadings"
              style={styles.subheadings || {}}
              onStyleChange={onStyleChange}
              accent="from-purple-500 to-purple-600"
            />
            <StyleEditor
              title="Body Text"
              icon={Type}
              element="body"
              style={styles.body || {}}
              onStyleChange={onStyleChange}
              accent="from-green-500 to-green-600"
            />
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Toolbar;