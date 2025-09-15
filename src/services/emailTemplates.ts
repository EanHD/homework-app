import { AuthEmailTemplates, MagicLinkTemplate, EmailConfirmationTemplate, type AuthEmailTemplateDefinition } from '../email/templates/auth';

/**
 * Email Templates Service (client-side reference)
 *
 * In a typical production stack, rendering & dispatching emails happens server-side.
 * For this SPA, we keep a typed map so:
 *  - We can surface preview UIs in the future
 *  - We provide a single source for subjects & variable expectations
 *  - We can export raw HTML to configure in Supabase dashboard
 */

export type AuthTemplateKey = keyof typeof AuthEmailTemplates;

export interface RenderEmailOptions {
  template: AuthTemplateKey | AuthEmailTemplateDefinition;
  variables: Record<string, string | number | boolean>;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
  missingVariables: string[];
}

// Collect all known placeholders in a template string ( {{var}} )
function extractPlaceholders(content: string): string[] {
  const found = new Set<string>();
  const regex = /{{\s*([a-zA-Z0-9_\.\-]+)\s*}}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content))) {
    found.add(match[1]);
  }
  return Array.from(found);
}

function applyVariables(content: string, vars: Record<string, any>): string {
  return content.replace(/{{\s*([a-zA-Z0-9_\.\-]+)\s*}}/g, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? `{{${key}}}` : String(value);
  });
}

export function getAuthTemplate(key: AuthTemplateKey): AuthEmailTemplateDefinition {
  switch (key) {
    case 'magicLink':
      return MagicLinkTemplate;
    case 'emailConfirmation':
      return EmailConfirmationTemplate;
    default:
      return AuthEmailTemplates[key];
  }
}

export function listAuthTemplates(): AuthEmailTemplateDefinition[] {
  return Object.values(AuthEmailTemplates);
}

export function renderAuthTemplate(options: RenderEmailOptions): RenderedEmail {
  const def = typeof options.template === 'string' ? getAuthTemplate(options.template) : options.template;
  const placeholders = new Set([
    ...extractPlaceholders(def.html),
    ...extractPlaceholders(def.text),
  ]);
  const missing: string[] = [];
  placeholders.forEach(p => {
    if (options.variables[p] === undefined) missing.push(p);
  });
  return {
    subject: applyVariables(def.subject, options.variables),
    html: applyVariables(def.html, options.variables),
    text: applyVariables(def.text, options.variables),
    missingVariables: missing,
  };
}

// Convenience helpers
export const EmailTemplateService = {
  get: getAuthTemplate,
  list: listAuthTemplates,
  render: renderAuthTemplate,
};

export default EmailTemplateService;
