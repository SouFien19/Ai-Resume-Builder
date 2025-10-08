// Use object-like types instead of empty interfaces to satisfy ESLint rules.
export type TemplateLayout = Record<string, unknown>;
export type TemplateStyles = Record<string, unknown>;

export interface TemplateDef {
  id: string;
  name: string;
  description?: string;
  category?: string;
  preview?: string;
  structure?: TemplateLayout;
  styles?: TemplateStyles;
  isATSFriendly?: boolean;
}

// Simple runtime registry placeholder. Later, load from DB/API.
const registry = new Map<string, TemplateDef>();

export function registerTemplate(t: TemplateDef) {
  registry.set(t.id, t);
}

export function getTemplate(id: string) {
  return registry.get(id);
}

export function listTemplates() {
  return Array.from(registry.values());
}
