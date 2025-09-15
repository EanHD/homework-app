/**
 * Supabase Auth Email Templates (Customized for Homework App v1)
 *
 * These templates override / complement Supabase's default magic link and confirmation emails
 * providing a branded, responsive, accessible design aligned with the premium UI theme.
 *
 * NOTE: Supabase dashboard can be configured to use raw HTML. These exports let us:
 *  - Keep source-controlled copies of production email HTML
 *  - Provide a single place to update styles and branding
 *  - Potentially render variants (dark mode) in the future
 */

interface AuthEmailTemplateDefinition {
  id: string;
  description: string;
  subject: string;
  html: string;
  text: string;
  variables: string[]; // handlebars-like placeholders expected: {{var}}
}

/**
 * Shared inline CSS (must be inlined for broad client support)
 * Keep styles minimal & attribute-safe. Avoid external fonts for deliverability & speed.
 */
const BASE_STYLES = `
  :root { color-scheme: light dark; }
  body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; background:#f8f9fa; color:#212529; }
  a { color:#1E88E5; text-decoration:none; }
  .container { max-width:560px; margin:0 auto; padding:32px 24px 40px; background:#ffffff; border-radius:16px; box-shadow:0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05); }
  h1, h2, h3 { margin:0 0 16px; font-weight:600; line-height:1.2; }
  p { line-height:1.55; margin:0 0 16px; }
  .brand { font-size:14px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; color:#1E88E5; margin-bottom:24px; }
  .btn { display:inline-block; background:linear-gradient(135deg,#1E88E5 0%,#1565C0 100%); color:#ffffff !important; padding:14px 28px; border-radius:10px; font-weight:600; font-size:15px; letter-spacing:0.3px; box-shadow:0 6px 12px rgba(30,136,229,0.35); transition:opacity .2s; }
  .btn:hover { opacity:0.92; }
  .subtle { font-size:13px; color:#495057; }
  .code { font-family:monospace; font-size:15px; background:#f1f5f9; padding:8px 14px; border-radius:8px; letter-spacing:1px; display:inline-block; }
  .footer { margin-top:40px; font-size:12px; line-height:1.4; color:#6c757d; }
  .divider { height:1px; background:linear-gradient(90deg,rgba(30,136,229,0) 0%, rgba(30,136,229,.35) 50%, rgba(30,136,229,0) 100%); margin:32px 0; }
  @media (prefers-color-scheme: dark) {
    body { background:#0f141a; color:#e6eef5; }
    .container { background:linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04)); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.12); }
    p, .subtle { color:#cfd9e3 !important; }
    .code { background:#1e2730; color:#e6eef5; }
    .footer { color:#8795a3; }
  }
`;

// Helper to wrap content with full HTML document
function wrap(subject: string, inner: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${subject}</title><style>${BASE_STYLES}</style></head><body><div class="container">${inner}</div></body></html>`;
}

export const MagicLinkTemplate: AuthEmailTemplateDefinition = {
  id: 'auth.magic_link.v1',
  description: 'Magic link sign-in email with branded call-to-action',
  subject: 'Your secure sign-in link · Homework App',
  variables: ['name','loginUrl','expiresIn'],
  text: `Hi {{name}},\n\nUse the link below to sign in to your Homework App account.\n\nLogin link: {{loginUrl}}\nThis link expires in {{expiresIn}}. If you did not request it, you can ignore this email.\n\n— Homework App`,
  html: wrap('Sign in to Homework App', `
    <div class="brand">Homework App</div>
    <h1>One-click sign in</h1>
    <p>Hi {{name}},</p>
    <p>Tap the button below to securely sign in. This link is single‑use and expires in <strong>{{expiresIn}}</strong>.</p>
    <p style="text-align:center;margin:32px 0 40px"><a class="btn" href="{{loginUrl}}">Sign in to Homework App</a></p>
    <p class="subtle">If the button doesn't work, copy and paste this URL:</p>
    <p class="code">{{loginUrl}}</p>
    <div class="divider"></div>
    <p class="subtle">Didn't request this? It's safe to ignore—no one can access your account without this email.</p>
    <div class="footer">You received this because a sign‑in was requested for your account.<br/>Homework App • Focus better. Finish faster.</div>
  `)
};

export const EmailConfirmationTemplate: AuthEmailTemplateDefinition = {
  id: 'auth.email_confirmation.v1',
  description: 'Email confirmation (verify address) template',
  subject: 'Confirm your email · Homework App',
  variables: ['name','confirmationUrl','expiresIn'],
  text: `Hi {{name}},\n\nConfirm your email address to finish setting up your Homework App account.\nVerification link: {{confirmationUrl}}\nThis link expires in {{expiresIn}}.\nIf you did not create an account, you can ignore this email.\n\n— Homework App`,
  html: wrap('Confirm your email', `
    <div class="brand">Homework App</div>
    <h1>Verify your email</h1>
    <p>Hi {{name}},</p>
    <p>Thanks for getting started! Confirm this is really you by verifying your email address. It helps keep your account secure.</p>
    <p style="text-align:center;margin:32px 0 40px"><a class="btn" href="{{confirmationUrl}}">Confirm Email Address</a></p>
    <p class="subtle">Button not working? Use this link:</p>
    <p class="code">{{confirmationUrl}}</p>
    <div class="divider"></div>
    <p class="subtle">If you didn’t sign up, you can safely ignore this message.</p>
    <div class="footer">Need help? Reply to this email anytime.<br/>Homework App • Focus better. Finish faster.</div>
  `)
};

export const AuthEmailTemplates = {
  magicLink: MagicLinkTemplate,
  emailConfirmation: EmailConfirmationTemplate,
};

export type { AuthEmailTemplateDefinition };
