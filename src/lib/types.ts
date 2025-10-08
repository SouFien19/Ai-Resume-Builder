import { CSSProperties } from 'react';

type StyleObject = {
  fontFamily: CSSProperties['fontFamily'];
  fontSize: CSSProperties['fontSize'];
  lineHeight: CSSProperties['lineHeight'];
  color: CSSProperties['color'];
  background: CSSProperties['background'];
};

export interface PageStyle extends StyleObject {
    margin: CSSProperties['margin'];
}

export interface ElementStyle extends StyleObject {
  fontWeight: CSSProperties['fontWeight'];
  textAlign: CSSProperties['textAlign'];
  borderBottom: CSSProperties['borderBottom'];
  textTransform: CSSProperties['textTransform'];
}

export interface TemplateData {
  page: PageStyle;
  headings: ElementStyle;
  subheadings: ElementStyle;
  body: ElementStyle;
}

export interface Template {
  _id: string;
  name: string;
  thumbnail: string;
  description?: string;
  category?: string;
  popularity?: number; // 0..5
  createdAt?: string | number | Date;
  data: TemplateData;
  layout: string[][];
  primary: string;
  previewUrl?: string; // URL to PDF or image preview
}


